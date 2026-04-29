## Anexo: Guardado de historial de chats en archivo JSON

Como paso previo a la migración a una base de datos real (Supabase, PostgreSQL, etc.), implementaremos un sistema de persistencia del historial de conversaciones utilizando el sistema de archivos. Cada interacción del usuario con el chatbot se guardará en un archivo JSON, permitiendo operaciones de lectura, borrado individual y borrado completo del historial por usuario.

Este enfoque nos permite:
- **Desarrollar la lógica de negocio** sin depender de una BD externa.
- **Simular operaciones CRUD** que luego serán fácilmente reemplazables por consultas SQL o llamadas a Supabase.
- **Mantener la simplicidad** durante el desarrollo temprano del proyecto.

### Estructura del archivo de historial

Crearemos un único archivo `historial.json` en la raíz del proyecto (o dentro de `data/`). Su estructura será:

```json
{
  "1": [
    {
      "id": "1700000000001",
      "timestamp": "2024-04-01T10:30:00.000Z",
      "query": "¿Qué es una variable?",
      "answer": "Una variable es un espacio en memoria...",
      "sources": ["semana1.pdf"]
    }
  ],
  "2": [ ... ]
}
```

- Cada clave es el `userId` (número o string).
- Cada valor es un array de mensajes ordenados cronológicamente.
- Cada mensaje contiene un `id` único (timestamp con milisegundos + random), `timestamp` ISO, la pregunta del usuario, la respuesta generada y las fuentes utilizadas.

### Servicio de historial (`src/services/history.service.js`)

Encapsularemos todas las operaciones de lectura/escritura del archivo en un servicio reutilizable.

```javascript
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const HISTORY_FILE = path.join(__dirname, '../../historial.json')

// Asegurar que el archivo exista
async function ensureFile() {
  try {
    await fs.access(HISTORY_FILE)
  } catch {
    await fs.writeFile(HISTORY_FILE, '{}')
  }
}

// Leer todo el historial
async function readHistory() {
  await ensureFile()
  const data = await fs.readFile(HISTORY_FILE, 'utf-8')
  return JSON.parse(data)
}

// Escribir el historial completo
async function writeHistory(data) {
  await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2))
}

// Obtener historial de un usuario
export async function getUserHistory(userId) {
  const history = await readHistory()
  return history[userId] || []
}

// Agregar un nuevo mensaje al historial de un usuario
export async function addMessage(userId, query, answer, sources = []) {
  const history = await readHistory()
  if (!history[userId]) history[userId] = []

  const newMessage = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    query,
    answer,
    sources
  }

  history[userId].push(newMessage)
  await writeHistory(history)
  return newMessage
}

// Eliminar un mensaje específico por ID
export async function deleteMessage(userId, messageId) {
  const history = await readHistory()
  if (!history[userId]) return false

  const initialLength = history[userId].length
  history[userId] = history[userId].filter(msg => msg.id !== messageId)

  if (history[userId].length === initialLength) return false

  await writeHistory(history)
  return true
}

// Eliminar todo el historial de un usuario
export async function deleteAllMessages(userId) {
  const history = await readHistory()
  if (!history[userId]) return false

  delete history[userId]
  await writeHistory(history)
  return true
}
```

### Modificación del endpoint `/chat` para guardar automáticamente

Actualizamos `src/routes/chat.routes.js` para que, después de generar la respuesta, guarde la interacción en el historial.

```javascript
import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { addMessage } from '../services/history.service.js'

const router = express.Router()

router.post('/', verifyJWT, async (req, res) => {
  const { query } = req.body
  const { userId, username } = req.user

  if (!query) {
    return res.status(400).json({ error: 'El campo query es requerido' })
  }

  // Aquí iría la lógica real de llamada a OpenAI y búsqueda en Supabase.
  // Por ahora mantenemos el mock.
  const mockAnswer = `[MOCK] Hola ${username}, recibiste: "${query}"`
  const mockSources = [{ content: 'Fuente de ejemplo', source: 'semana1.pdf' }]

  // Guardar en historial (no bloquear la respuesta si falla)
  try {
    await addMessage(userId, query, mockAnswer, mockSources)
  } catch (err) {
    console.error('Error guardando historial:', err)
    // No fallamos la respuesta al usuario, sólo logueamos
  }

  res.json({
    answer: mockAnswer,
    sources: mockSources,
    userId
  })
})

export default router
```

### Endpoints para gestionar el historial

Creamos `src/routes/history.routes.js` con operaciones de consulta y borrado. Todos requieren autenticación JWT (solo el dueño del historial puede modificarlo).

```javascript
import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import { getUserHistory, deleteMessage, deleteAllMessages } from '../services/history.service.js'

const router = express.Router()

// GET /api/v1/history - Obtener todo el historial del usuario autenticado
router.get('/', verifyJWT, async (req, res) => {
  const { userId } = req.user
  const history = await getUserHistory(userId)
  res.json({ history })
})

// DELETE /api/v1/history/:messageId - Borrar un mensaje específico
router.delete('/:messageId', verifyJWT, async (req, res) => {
  const { userId } = req.user
  const { messageId } = req.params

  const deleted = await deleteMessage(userId, messageId)
  if (!deleted) {
    return res.status(404).json({ error: 'Mensaje no encontrado' })
  }
  res.json({ message: 'Mensaje eliminado correctamente' })
})

// DELETE /api/v1/history - Borrar TODO el historial del usuario
router.delete('/', verifyJWT, async (req, res) => {
  const { userId } = req.user
  await deleteAllMessages(userId)
  res.json({ message: 'Historial eliminado por completo' })
})

export default router
```

### Integración en `app.js`

Registramos las nuevas rutas y aseguramos que el archivo `historial.json` se cree si no existe (el servicio ya lo maneja con `ensureFile`).

```javascript
import chatRoutes from './routes/chat.routes.js'
import authRoutes from './routes/auth.routes.js'
import historyRoutes from './routes/history.routes.js'

// ... después de middlewares globales
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1/history', historyRoutes)
```

### Probar el flujo completo

1. **Login** → obtener token.
   ```bash
   POST /api/v1/auth/login
   { "username": "alumno1", "password": "pass123" }
   ```

2. **Enviar mensaje al chat** (guarda automáticamente).
   ```bash
   POST /api/v1/chat
   Authorization: Bearer <token>
   { "query": "¿Qué es un bucle?" }
   ```

3. **Consultar historial**.
   ```bash
   GET /api/v1/history
   Authorization: Bearer <token>
   ```

4. **Borrar un mensaje** (usando el `id` obtenido).
   ```bash
   DELETE /api/v1/history/1700000000001abc
   Authorization: Bearer <token>
   ```

5. **Borrar todo el historial**.
   ```bash
   DELETE /api/v1/history
   Authorization: Bearer <token>
   ```

### Consideraciones para la futura migración a base de datos

- El servicio `history.service.js` actúa como una capa de abstracción. Cuando migres a Supabase, solo deberás reemplazar las funciones internas (`addMessage`, `getUserHistory`, etc.) por consultas a la tabla `messages`.
- La estructura actual (usuario → array de mensajes) puede traducirse fácilmente a una tabla relacional:
  ```sql
  CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
  );
  ```
- Mantén el mismo contrato de las funciones para que el cambio sea transparente para las rutas.

### Bonus: Limitar el tamaño del historial

Para evitar que el archivo JSON crezca indefinidamente, puedes implementar un límite de mensajes por usuario (ej. últimos 100). Agrega esta lógica dentro de `addMessage`:

```javascript
const MAX_HISTORY_PER_USER = 100
if (history[userId].length > MAX_HISTORY_PER_USER) {
  history[userId] = history[userId].slice(-MAX_HISTORY_PER_USER)
}
```

### Nice to have
> investigacion de parte del estudiante(*)
- **Endpoints de búsqueda**: filtrar mensajes por fecha o contenido.