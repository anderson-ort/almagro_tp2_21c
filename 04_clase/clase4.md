# Clase 1 — APIs RESTful con Node.js y Express

**Unidad 3 | Duración: ~3hs**
**Avance en el proyecto:** servidor base + primer endpoint `/chat` sin base de datos

---

## Teoria: Servicios Web y REST

### Que es un servicio web REST

REST (Representational State Transfer) es un estilo arquitectonico para APIs sobre HTTP. No es un protocolo ni un estandar, sino un conjunto de restricciones que, cuando se cumplen, producen sistemas escalables, simples e interoperables.

### Los 6 principios REST que importan

1. **Stateless:** cada request contiene toda la informacion necesaria. El servidor no guarda estado de sesion entre llamadas.
2. **Interfaz uniforme:** recursos identificados por URLs, manipulados via metodos HTTP estandar.
3. **Cliente-servidor:** separacion de responsabilidades. El cliente no sabe como el servidor almacena datos y viceversa.
4. **Cacheable:** las respuestas deben indicar si pueden cachearse.
5. **Sistema en capas:** el cliente no necesita saber si habla con el servidor final o un intermediario.
6. **Codigo bajo demanda (opcional):** el servidor puede enviar codigo ejecutable al cliente.

---

## HTTP: el protocolo de la web

### Metodos HTTP y su uso correcto

| Metodo | Uso | Idempotente | Body |
|--------|-----|-------------|------|
| GET | Leer recurso | Si | No |
| POST | Crear recurso | No | Si |
| PUT | Reemplazar recurso completo | Si | Si |
| PATCH | Modificar campos parciales | Si | Si |
| DELETE | Eliminar recurso | Si | No |

### Status codes clave

```
2xx - Exito
  200 OK          - respuesta generica exitosa
  201 Created     - recurso creado (POST exitoso)
  204 No Content  - operacion exitosa sin body (DELETE)

4xx - Error del cliente
  400 Bad Request      - payload invalido
  401 Unauthorized     - sin credenciales
  403 Forbidden        - credenciales validas pero sin permiso
  404 Not Found        - recurso inexistente
  422 Unprocessable    - payload valido pero logica rechazada
  429 Too Many Requests- rate limit superado

5xx - Error del servidor
  500 Internal Server Error - error no controlado
  503 Service Unavailable   - servidor caido o sobrecargado
```

### Headers relevantes

```
Content-Type: application/json    -> tipo del body enviado
Accept: application/json          -> tipo esperado en respuesta
Authorization: Bearer <token>     -> autenticacion
X-API-Key: <clave>                -> autenticacion por clave estatica
```

---

## Diseno de URLs RESTful

### Reglas principales

* Usar sustantivos (recursos), no verbos: `/documents` no `/getDocuments`
* Plural para colecciones: `/documents`, `/users`
* Jerarquia con `/`: `/users/:id/documents`
* Versionado en el path: `/api/v1/`
* Minusculas con guiones para separar palabras: `/chat-history`

```
GET    /api/v1/documents          -> lista documentos
GET    /api/v1/documents/:id      -> un documento
POST   /api/v1/documents          -> crea documento
PUT    /api/v1/documents/:id      -> reemplaza documento
DELETE /api/v1/documents/:id      -> elimina documento
POST   /api/v1/chat               -> accion (excepcion valida)
```

---

## Practica: Servidor Express + primer endpoint

### Setup inicial del proyecto

```bash
mkdir edubot-rag && cd edubot-rag
npm init -y
npm install express dotenv cors helmet
npm install --save-dev nodemon
```

`package.json` (agregar):

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### `server.js` — punto de entrada

```javascript
require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`EduBot API corriendo en http://localhost:${PORT}`)
})
```

### `app.js` — configuracion Express

```javascript
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const chatRoutes = require('./src/routes/chat.routes')

const app = express()

// Middlewares globales
app.use(helmet())           // headers de seguridad
app.use(cors())             // permite requests de otros origenes
app.use(express.json())     // parsea body JSON

// Rutas
app.use('/api/v1/chat', chatRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

module.exports = app
```

### `src/routes/chat.routes.js`

```javascript
const express = require('express')
const router = express.Router()

// POST /api/v1/chat
router.post('/', async (req, res) => {
  const { query, userId } = req.body

  if (!query) {
    return res.status(400).json({ error: 'El campo query es requerido' })
  }

  // Por ahora: echo sin IA ni DB
  res.status(200).json({
    answer: `[MOCK] Recibiste: "${query}"`,
    sources: [],
    userId: userId || 'anonimo'
  })
})

module.exports = router
```

### Variables de entorno — `.env`

```
PORT=3000
NODE_ENV=development
```

### Cliente HTTP en Node.js para pruebas

```javascript
// test-client.js  (ejecutar: node test-client.js)
const BASE_URL = 'http://localhost:3000/api/v1'

async function testChat() {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Que es una variable?' })
  })

  const data = await response.json()
  console.log('Status:', response.status)
  console.log('Respuesta:', data)
}

testChat()
```

---

## Tarea Clase 1

1. Levantar el servidor y verificar `/health` con el navegador.
2. Probar `POST /api/v1/chat` con el cliente HTTP o Postman/Thunder Client.
3. Agregar un endpoint `GET /api/v1/chat/status` que devuelva informacion del servidor (version, uptime).
4. Investigar: que diferencia hay entre `app.use()` y `app.get()` en Express?