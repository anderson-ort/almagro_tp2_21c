# Clase 4 — Bases de Datos con Supabase y pgvector

**Unidad 4 | Duración: ~3hs**
**Avance en el proyecto:** persistencia real, upload de PDFs, pipeline RAG completo

---

## Teoria: Bases de Datos

### SQL vs NoSQL

**SQL (relacional):**

* Datos estructurados en tablas con esquema fijo.
* Relaciones entre tablas via foreign keys.
* Transacciones ACID (Atomicity, Consistency, Isolation, Durability).
* Ideal para datos con relaciones claras y consistencia critica.
* Ejemplos: PostgreSQL, MySQL, SQLite.

**NoSQL (no relacional):**

* Esquema flexible, distintos modelos: documentos (MongoDB), clave-valor (Redis), columnas (Cassandra), grafos (Neo4j).
* Escala horizontal mas sencilla.
* Eventual consistency (en muchos casos).
* Ideal para datos no estructurados, alta velocidad de escritura, esquemas cambiantes.

En nuestro proyecto: usamos PostgreSQL via Supabase, que combina lo mejor de ambos mundos: SQL puro + la extension pgvector para almacenar vectores de alta dimension.

### Supabase: PostgreSQL como servicio

Supabase es una alternativa open-source a Firebase construida sobre PostgreSQL. Provee:

* Base de datos PostgreSQL gestionada.
* API REST autogenerada (PostgREST).
* Storage para archivos.
* Auth integrada.
* SDK para JavaScript, Python y otros lenguajes.
* Dashboard web para administrar todo.

### pgvector: busqueda vectorial en PostgreSQL

pgvector es una extension de PostgreSQL que agrega el tipo de dato `vector` y operadores de distancia para busqueda por similitud. Permite almacenar embeddings directamente junto con el resto de los datos de la aplicacion, sin necesidad de una base de datos vectorial separada (como Pinecone o Weaviate).

**Operadores de distancia disponibles:**

| Operador | Metrica | Cuándo usar |
|----------|---------|-------------|
| `<->` | Distancia euclidiana | Caso general |
| `<#>` | Producto interno negativo | Vectores normalizados (OpenAI) |
| `<=>` | Distancia coseno | Cuando la magnitud no importa |

Los embeddings de OpenAI estan normalizados, por lo que `<#>` (negativo del producto interno) da mejor rendimiento.

### Variables de entorno y archivos de configuracion

**Principio:** ningun secreto en el codigo fuente. Usar siempre variables de entorno.

```
# Regla: si va al repo -> .env.example (sin valores)
#         si no va al repo -> .env (con valores reales)

.gitignore debe incluir: .env
```

**Diferencia de entornos:**

```
.env.development  <- base de datos de desarrollo
.env.test         <- base de datos de test (separada)
.env.production   <- variables reales en Render/servidor
```

---

## Practica: Configurar Supabase + pipeline de upload

### Setup de Supabase (una vez por proyecto)

Ejecutar en el SQL Editor de Supabase:

```sql
-- 1. Habilitar extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla de documentos con embeddings
CREATE TABLE documents (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content     TEXT NOT NULL,
  embedding   VECTOR(1536) NOT NULL,
  source_file TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indice HNSW para busqueda rapida (producto interno)
CREATE INDEX ON documents USING hnsw (embedding vector_ip_ops);

-- 4. Funcion de busqueda por similitud
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count     INT DEFAULT 3
)
RETURNS TABLE (
  id          BIGINT,
  content     TEXT,
  source_file TEXT,
  similarity  FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    source_file,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. Row Level Security (buena practica)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: solo el service_role puede leer/escribir
CREATE POLICY "Service role full access"
  ON documents
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Instalar dependencias de upload

```bash
npm install multer pdf-parse
```

### `src/services/upload.service.js` — pipeline completo

```javascript
import pdfParse from 'pdf-parse'
import { generateEmbedding } from './embedding.service'
import documentRepository from '../repositories/document.repository'

const CHUNK_SIZE = 512      // caracteres por chunk
const CHUNK_OVERLAP = 50   // solapamiento entre chunks

// Divide texto en chunks con overlap para no perder contexto en los bordes
const splitIntoChunks = (text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end).trim())
    start += chunkSize - overlap
  }

  return chunks.filter(c => c.length > 50)  // descartar chunks muy cortos
}

// Pipeline completo: PDF -> texto -> chunks -> embeddings -> DB
const processPDF = async (fileBuffer, originalName) => {
  // 1. Extraer texto del PDF
  const parsed = await pdfParse(fileBuffer)
  const rawText = parsed.text

  if (!rawText || rawText.length < 100) {
    throw new Error('El PDF no contiene texto extraible (puede ser una imagen escaneada)')
  }

  // 2. Dividir en chunks
  const chunks = splitIntoChunks(rawText)
  console.log(`${originalName}: ${chunks.length} chunks generados`)

  // 3. Generar embeddings y guardar (de a uno para no agotar rate limits)
  const results = []
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i])
    const saved = await documentRepository.save(chunks[i], embedding, originalName, i)
    results.push(saved)
    console.log(`Chunk ${i + 1}/${chunks.length} guardado`)
  }

  return {
    filename: originalName,
    chunksProcessed: results.length,
    totalCharacters: rawText.length
  }
}

export { processPDF }
```

### `src/routes/upload.routes.js`

```javascript
import express from 'express'
import multer from 'multer'
import { verifyApiKey } from '../middleware/auth.middleware'
import { processPDF } from '../services/upload.service'

const router = express.Router()

// Multer: solo acepta PDFs, limite 10MB, almacena en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se aceptan archivos PDF'), false)
    }
  }
})

// POST /api/v1/upload — protegido con x-api-key (endpoint admin)
router.post('/', verifyApiKey, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibio ningun archivo' })
  }

  try {
    const result = await processPDF(req.file.buffer, req.file.originalname)
    res.status(201).json({
      message: 'PDF procesado exitosamente',
      ...result
    })
  } catch (err) {
    console.error('Error procesando PDF:', err.message)
    res.status(422).json({ error: err.message })
  }
})

export default router
```

### Registrar la ruta en `app.js`

```javascript
import uploadRoutes from './src/routes/upload.routes.js'
app.use('/api/v1/upload', uploadRoutes)
```

---

## El pipeline RAG completo en accion

```
[Alumno sube "semana3.pdf"]
         |
         v
POST /api/v1/upload  (X-API-Key)
         |
         ├── pdf-parse -> texto plano (2000 chars)
         ├── splitIntoChunks -> 4 chunks de 512 chars
         ├── Para cada chunk:
         │     generateEmbedding(chunk) -> vector [0.1, -0.3, ...]
         │     documentRepository.save(chunk, vector, 'semana3.pdf', i)
         └── Respuesta: { chunksProcessed: 4 }


[Alumno hace una pregunta]
         |
         v
POST /api/v1/chat  (JWT)
{ query: "Que algoritmo usa Dijkstra?" }
         |
         ├── generateEmbedding(query) -> vector de la pregunta
         ├── documentRepository.findSimilar(vector, 3)
         │     -> Supabase busca los 3 chunks mas cercanos
         │     -> Retorna chunks de 'semana3.pdf'
         ├── Armar prompt: [sistema] + [contexto] + [pregunta]
         ├── openai.chat.completions.create(prompt)
         └── Respuesta: { answer: "Dijkstra usa...", sources: [...] }
```

---

## Tarea Clase 4

1. Crear el proyecto en Supabase y ejecutar el SQL de setup.
2. Subir un PDF de prueba con `POST /upload` y verificar en el dashboard de Supabase que los chunks se guardaron.
3. Hacer una pregunta relacionada al contenido del PDF y verificar que la respuesta cita la fuente.
4. Agregar `GET /api/v1/documents` que liste los archivos subidos (nombre y cantidad de chunks).
5. Investigar: que es el indice HNSW y como mejora la performance de busqueda frente a busqueda exhaustiva?