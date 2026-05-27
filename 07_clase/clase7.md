# Clase 5 — Pipeline RAG con MongoDB Atlas, Supabase Storage y Gemini

**Unidad 5 | Duración: ~3hs**

**Avance en el proyecto:** Desacoplamiento de almacenamiento (archivos planos + base de datos documental), indexación vectorial en MongoDB Atlas e integración con el ecosistema de Gemini (Embeddings y LLM).

---

## Teoría: Arquitecturas Distribuidas de Datos para RAG

### Almacenamiento Documental (MongoDB) vs. Relacional

**SQL (PostgreSQL):**

* Estructuras rígidas y normalizadas en tablas.
* Excelente para consistencia transaccional extrema y datos altamente interconectados.

**NoSQL Orientado a Documentos (MongoDB):**

* Datos almacenados en documentos BSON (JSON binario) con esquemas flexibles.
* Cada documento auto-contiene su información, ideal para representar **chunks** de texto que pueden variar en metadatos (por ejemplo, algunos chunks pueden tener referencias a páginas, otros a secciones, autores, etc.).
* Escalabilidad horizontal nativa mediante sharding.

En esta arquitectura, delegamos los vectores y metadatos de los fragmentos de texto a **MongoDB Atlas**, aprovechando su motor de búsqueda vectorial integrado.

### Supabase Storage: El rol del Object Storage

A medida que el sistema escala, almacenar archivos binarios pesados (como PDFs de 20MB o imágenes) directamente dentro de la base de datos penaliza el rendimiento. La mejor práctica de la industria dicta separar las preocupaciones:

* **Base de Datos:** Almacena solo texto estructurado, vectores y referencias (URLs/Paths).
* **Object Storage (Supabase Storage):** Almacena de forma optimizada y segura los archivos binarios originales (`.pdf`, `.md`).

Configurar el bucket como `private` garantiza que nadie pueda descargar los documentos directamente sin pasar por las reglas de negocio o las claves de rol del servicio (`service_role`).

### MongoDB Atlas Vector Search

A diferencia de las bases de datos relacionales con extensiones (como `pgvector`), MongoDB Atlas procesa la búsqueda vectorial mediante un servicio nativo que indexa arrays de tipo `float`.

**Métricas de similitud comúnmente soportadas:**

| Métrica | Descripción | Cuándo usar |
| --- | --- | --- |
| `cosine` | Mide el ángulo entre dos vectores. | **Recomendado para Gemini**. Ideal cuando la frecuencia/longitud del texto varía pero el significado es el mismo. |
| `euclidean` | Mide la distancia en línea recta entre puntos. | Cuando la magnitud absoluta de los valores del vector es crítica. |
| `dotProduct` | Multiplicación interna de los vectores. | Altamente eficiente, pero requiere que los vectores estén previamente normalizados. |

El modelo `text-embedding-004` de Gemini genera vectores de **768 dimensiones**. Es fundamental que este valor coincida de manera exacta en la configuración de nuestro índice de búsqueda en Atlas.

---

## Práctica: Configuración del Entorno y Pipeline RAG

### 1. Setup del Índice Vectorial en MongoDB Atlas

Dentro del panel de control de MongoDB Atlas, navega a tu clúster, ingresa a la sección **Search**, haz clic en **Create Search Index** y selecciona el **JSON Editor**. Selecciona tu colección (`ragdb.chunks`) y pega la siguiente estructura:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}

```

> **Nota:** Nombra el índice de manera exacta como `embedding_index`. El aprovisionamiento inicial en los servidores de Atlas puede demorar cerca de un minuto en activarse.

### 2. Dependencias del Proyecto

Instala los módulos necesarios para la extracción de texto, cliente de Supabase, cliente de MongoDB y SDK oficial de Google Gen AI.

```bash
npm install express multer pdf-parse @supabase/supabase-js mongodb @google/genai

```

### 3. `src/services/rag.service.js` — Procesamiento e Ingesta

```javascript
import pdfParse from 'pdf-parse';
import { supabase } from '../config/supabase.js';
import { db } from '../config/mongodb.js';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const CHUNK_SIZE = 600;      // caracteres por chunk
const CHUNK_OVERLAP = 80;    // solapamiento para mantener el contexto

// Segmentación de texto con solapamiento
const splitIntoChunks = (text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end).trim());
    start += size - overlap;
  }
  return chunks.filter(c => c.length > 30);
};

// Pipeline de procesamiento completo
export const processAndIngestFile = async (file) => {
  const filename = `${Date.now()}-${file.originalname}`;

  // 1. Persistir archivo binario original en Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('raw-documents')
    .upload(filename, file.buffer, { contentType: file.mimetype });

  if (storageError) throw new Error(`Supabase Storage Error: ${storageError.message}`);

  // 2. Extracción de texto plano básico
  let rawText = '';
  if (file.mimetype === 'application/pdf') {
    const parsed = await pdfParse(file.buffer);
    rawText = parsed.text;
  } else {
    rawText = file.buffer.toString('utf-8');
  }

  // 3. Crear fragmentos (Chunks)
  const chunks = splitIntoChunks(rawText);

  // 4. Generar embeddings y persistir en MongoDB Atlas
  const chunksCollection = db.collection('chunks');
  
  for (let i = 0; i < chunks.length; i++) {
    // Generación del embedding con text-embedding-004 (768 dimensiones)
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: chunks[i],
    });

    const embedding = embeddingResponse.embedding.values;

    await chunksCollection.insertOne({
      content: chunks[i],
      embedding: embedding,
      sourceFile: filename,
      chunkIndex: i,
      uploadedAt: new Date()
    });
  }

  return {
    filename,
    storagePath: storageData.path,
    chunksProcessed: chunks.length,
    totalCharacters: rawText.length
  };
};

```

### 4. `src/routes/rag.routes.js` — Controladores del API

```javascript
import express from 'express';
import multer from 'multer';
import { processAndIngestFile } from '../services/rag.service.js';
import { db } from '../config/mongodb.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // Límite 15MB
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST /api/v1/upload - Carga e Ingesta del documento
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo no proporcionado.' });
    
    const result = await processAndIngestFile(req.file);
    res.status(201).json({ message: 'File processed successfully', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/query - Búsqueda Vectorial y Generación Aumentada (RAG)
router.post('/query', async (req, res) => {
  const { prompt, topK = 3 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt es requerido.' });

  try {
    // 1. Vectorizar la consulta del usuario
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: prompt,
    });
    const queryVector = embeddingResponse.embedding.values;

    // 2. Ejecutar la búsqueda vectorial en MongoDB Atlas
    const chunksCollection = db.collection('chunks');
    const pipeline = [
      {
        $vectorSearch: {
          index: 'embedding_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: topK * 10,
          limit: topK
        }
      }
    ];

    const contextChunks = await chunksCollection.aggregate(pipeline).toArray();
    
    // 3. Construir el prompt fundamentado
    const contextText = contextChunks.map(c => `[Fuente: ${c.sourceFile}]: ${c.content}`).join('\n\n');
    const finalPrompt = `Utiliza estrictamente el siguiente contexto para responder la pregunta del usuario. Si la respuesta no se encuentra en el contexto, indica amablemente que no posees información suficiente.\n\nContexto:\n${contextText}\n\nPregunta: ${prompt}`;

    // 4. Generación final con Gemini 2.0 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: finalPrompt,
    });

    const uniqueSources = [...new Set(contextChunks.map(c => c.sourceFile))];

    res.json({
      answer: response.text,
      sources: uniqueSources
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

```

---

## Diagramas de Flujo del Pipeline

### Flujo de Ingesta (`POST /api/v1/upload`)

```
[Cliente envía Archivo PDF/MD]
           |
           v
POST /api/v1/upload (Headers: X-API-Key)
           |
           ├──> Guardar binario original en Supabase Storage (Bucket: 'raw-documents')
           |
           ├──> Extraer texto plano (pdf-parse / buffer toString)
           ├──> Fragmentar texto mediante splitIntoChunks (600 chars, 80 overlap)
           |
           └──> Iteración por Fragmento:
                 ├──> Enviar a Gemini (text-embedding-004) -> Retorna float[768]
                 └──> Insertar en MongoDB ({ content, embedding, sourceFile, chunkIndex })

```

### Flujo de Consulta (`POST /api/v1/query`)

```
[Cliente envía Consulta: "¿Qué es gradient descent?"]
           |
           v
POST /api/v1/query (Body: { prompt, topK })
           |
           ├──> Convertir consulta a vector con Gemini (text-embedding-004)
           ├──> Ejecutar agregación $vectorSearch en MongoDB usando 'embedding_index'
           ├──> Recuperar los top-K documentos basados en la Similitud Coseno
           ├──> Inyectar fragmentos recuperados en un Prompt Contextual (Grounded Prompt)
           ├──> Enviar Prompt estructurado a Gemini gemini-2.0-flash
           └──> Retornar al Cliente { answer, sources }

```

---

## Tarea Clase 5

1. Configura un clúster gratuito en MongoDB Atlas y despliega el índice vectorial tal como se especifica en la sección de configuración JSON.
2. Crea el bucket `raw-documents` en tu panel de Supabase y configúralo con acceso privado.
3. Envía un documento técnico de prueba mediante un cliente HTTP (Postman, Bruno o cURL) al endpoint `/upload` y corrobora desde el Atlas Compass o la interfaz web que los vectores e índices se hayan indexado con éxito.
4. **Investigación:** Analiza los parámetros de `$vectorSearch` en MongoDB Atlas: ¿Qué representa la propiedad `numCandidates` y qué impacto directo tiene alterar este valor en términos de precisión y tiempos de respuesta de la base de datos?