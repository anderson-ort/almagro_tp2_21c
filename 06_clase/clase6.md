# Clase 3 — Arquitectura en Capas y Patrones de Diseno

**Unidad 4 | Duración: ~3hs**
**Avance en el proyecto:** refactorizacion completa en capas + integracion real con OpenAI

---

## Teoria: Arquitectura en Capas

### El problema del "todo en un archivo"

Cuando un proyecto crece, tener logica de rutas, negocio y acceso a datos en el mismo lugar genera:

* Dificultad para testear (no se puede probar la logica sin levantar el servidor).
* Imposibilidad de cambiar la base de datos sin tocar la logica de negocio.
* Duplicacion de codigo.
* Conflictos en equipos al trabajar en el mismo archivo.

### Separacion en tres capas

```
┌─────────────────────────────┐
│      CAPA DE RUTEO          │  Express Router + Middlewares
│  (src/routes/*.routes.js)   │  Solo recibe request, valida input,
│                             │  delega al servicio, devuelve response
└─────────────┬───────────────┘
              │ llama a
┌─────────────▼───────────────┐
│    CAPA DE NEGOCIO          │  Logica pura de la aplicacion
│  (src/services/*.service.js)│  No sabe nada de HTTP ni de la DB
│                             │  Testeable de forma aislada
└─────────────┬───────────────┘
              │ llama a
┌─────────────▼───────────────┐
│   CAPA DE PERSISTENCIA      │  Acceso a datos (DB, archivos, APIs)
│  (src/repositories/*.js)    │  Solo sabe hablar con Supabase/DB
│                             │  Intercambiable sin tocar el servicio
└─────────────────────────────┘
```

**Regla de dependencias:** cada capa solo conoce a la capa inmediatamente inferior. El router no accede directamente a la DB.

---

## Teoria: Patrones de Diseno

### Patron Singleton

Garantiza que una clase tenga una unica instancia en toda la aplicacion. Util para conexiones a bases de datos, configuraciones compartidas y clientes de APIs.

**Problema que resuelve:** sin Singleton, cada modulo que hace `new SupabaseClient()` crea una nueva conexion, agotando el pool y desperdiciando recursos.

```javascript
// config/supabase.js — Singleton de la conexion
import { createClient } from '@supabase/supabase-js'

let instance = null

const getSupabaseClient = () => {
  if (!instance) {
    instance = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
  }
  return instance
}

export { getSupabaseClient }

// Uso en cualquier modulo:
// import { getSupabaseClient } from '../config/supabase'
// const supabase = getSupabaseClient()
```

### Patron Factory

Centraliza la creacion de objetos. En lugar de instanciar directamente, se llama a una funcion que decide que implementacion retornar segun parametros o configuracion.

**Utilidad en el proyecto:** permite cambiar el proveedor de IA (OpenAI vs xAI Grok) sin modificar el servicio de chat.

```javascript
// services/ai.factory.js
import OpenAI from 'openai'

const createAIClient = (provider = 'openai') => {
  if (provider === 'openai') {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  if (provider === 'xai') {
    return new OpenAI({
      baseURL: 'https://api.x.ai/v1',
      apiKey: process.env.XAI_API_KEY
    })
  }
  throw new Error(`Proveedor IA desconocido: ${provider}`)
}

export { createAIClient }
```

### Patron DAO / DTO

**DAO (Data Access Object):** objeto responsable exclusivamente de las operaciones CRUD sobre la fuente de datos. Encapsula las queries y traduce errores de la DB a errores de la aplicacion.

**DTO (Data Transfer Object):** objeto plano que define la forma de los datos que viajan entre capas o hacia el exterior. Separa el modelo interno (con todos los campos) del contrato publico de la API.

```javascript
// Modelo interno (lo que guarda la DB)
const documentDB = {
  id: 'uuid',
  content: 'texto del chunk',
  embedding: [0.1, 0.2, ...],   // 1536 dimensiones
  source_file: 'semana3.pdf',
  chunk_index: 4,
  created_at: '2024-01-01T00:00:00Z',
  user_id: 'uuid'
}

// DTO de respuesta (lo que ve el cliente)
const documentDTO = {
  id: 'uuid',
  content: 'texto del chunk',
  source: 'semana3.pdf'
  // NO incluye: embedding (innecesario), user_id (privado)
}
```

### Patron Repository

Abstrae el acceso a datos detras de una interfaz comun. El servicio llama a `documentRepository.findSimilar(embedding)` sin importar si internamente usa Supabase, PostgreSQL directo, o un mock para tests.

```javascript
// repositories/document.repository.js
class DocumentRepository {
  constructor(supabaseClient) {
    this.db = supabaseClient
  }

  async findSimilar(embedding, limit = 3) {
    // implementacion con Supabase pgvector
  }

  async save(chunk, embedding, metadata) {
    // implementacion con Supabase
  }
}
```

---

## Practica: Refactorizar a arquitectura en capas + integrar OpenAI

### Instalar dependencias

```bash
npm install openai @supabase/supabase-js
```

### `.env` actualizado

```
PORT=3000
JWT_SECRET=supersecreto_minimo_32_caracteres
JWT_EXPIRES_IN=1h
API_KEY=clave-admin-supersecreta
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
AI_PROVIDER=openai
```

### `src/config/supabase.js` — Singleton

```javascript
import { createClient } from '@supabase/supabase-js'

let instance = null

const getSupabaseClient = () => {
  if (!instance) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Variables SUPABASE_URL y SUPABASE_SERVICE_KEY requeridas')
    }
    instance = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
    console.log('Conexion Supabase inicializada')
  }
  return instance
}

export { getSupabaseClient }
```

### `src/services/embedding.service.js`

```javascript
import { createAIClient } from './ai.factory'

const generateEmbedding = async (text) => {
  const client = createAIClient(process.env.AI_PROVIDER)

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' ')  // limpia saltos de linea
  })

  return response.data[0].embedding  // vector de 1536 dimensiones
}

export { generateEmbedding }
```

### `src/repositories/document.repository.js`

```javascript
import { getSupabaseClient } from '../config/supabase'

class DocumentRepository {
  constructor() {
    this.db = getSupabaseClient()
  }

  async findSimilar(embedding, limit = 3) {
    const { data, error } = await this.db.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: limit
    })

    if (error) throw new Error(`Error buscando documentos: ${error.message}`)

    return data.map(doc => ({
      id: doc.id,
      content: doc.content,
      source: doc.source_file,
      similarity: doc.similarity
    }))
  }

  async save(content, embedding, sourceFile, chunkIndex) {
    const { data, error } = await this.db
      .from('documents')
      .insert({ content, embedding, source_file: sourceFile, chunk_index: chunkIndex })
      .select()

    if (error) throw new Error(`Error guardando documento: ${error.message}`)
    return data[0]
  }
}

export default new DocumentRepository()
```

### `src/services/chat.service.js`

```javascript
import { createAIClient } from './ai.factory'
import { generateEmbedding } from './embedding.service'
import documentRepository from '../repositories/document.repository'

const answerQuery = async (query, userId) => {
  // 1. Generar embedding de la query
  const queryEmbedding = await generateEmbedding(query)

  // 2. Buscar documentos similares en Supabase
  const relevantDocs = await documentRepository.findSimilar(queryEmbedding, 3)

  // 3. Construir contexto
  const context = relevantDocs
    .map((doc, i) => `[Fuente ${i + 1} - ${doc.source}]\n${doc.content}`)
    .join('\n\n')

  // 4. Llamar a la IA con el contexto
  const aiClient = createAIClient(process.env.AI_PROVIDER)

  const completion = await aiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Eres un tutor educativo. Responde usando SOLO el contexto provisto.
Si no encuentras la respuesta en el contexto, di "No tengo informacion sobre eso en los materiales disponibles".
Cita las fuentes cuando respondas.`
      },
      {
        role: 'user',
        content: `Contexto:\n${context || 'No se encontraron documentos relevantes.'}\n\nPregunta: ${query}`
      }
    ],
    temperature: 0.3,
    max_tokens: 800
  })

  const answer = completion.choices[0].message.content

  return {
    answer,
    sources: relevantDocs,
    tokensUsed: completion.usage.total_tokens
  }
}

export { answerQuery }
```

### `src/routes/chat.routes.js` — refactorizado

```javascript
import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware'
import { answerQuery } from '../services/chat.service'

const router = express.Router()

router.post('/', verifyJWT, async (req, res) => {
  const { query } = req.body
  const { userId } = req.user

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'El campo query debe ser un string no vacio' })
  }

  if (query.length > 1000) {
    return res.status(400).json({ error: 'La consulta no puede superar los 1000 caracteres' })
  }

  try {
    const result = await answerQuery(query, userId)
    res.json(result)
  } catch (err) {
    console.error('Error en /chat:', err.message)
    res.status(500).json({ error: 'Error interno al procesar la consulta' })
  }
})

export default router
```

---

## Tarea Clase 3

1. Completar la refactorizacion: mover toda la logica fuera de las rutas.
2. Crear un `error.middleware.js` centralizado para manejar errores de forma uniforme.
3. Testear el endpoint `/chat` con un query real (aun sin documentos en la DB, la IA debe responder "no tengo informacion").
4. Investigar: que es el patron Strategy y como se relaciona con Factory?