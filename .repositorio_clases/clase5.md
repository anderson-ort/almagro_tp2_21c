# Clase 2 — Seguridad, Documentacion y Versionado

**Unidad 3 | Duración: ~3hs**
**Avance en el proyecto:** seguridad con JWT + x-api-key + documentacion Swagger/Scalar

---

## Teoria: Seguridad en APIs

### Por que proteger los endpoints

Una API sin autenticacion expone todos los datos y operaciones a cualquier actor en internet. Existen dos conceptos clave:

* **Autenticacion:** verificar quien eres (identidad).
* **Autorizacion:** verificar que podes hacer (permisos).

### Mecanismo 1: x-api-key

Una clave estatica enviada en el header `X-API-Key`. Simple, sin estado, ideal para comunicacion entre servicios o acceso de herramientas de terceros.

**Cuándo usarlo:** integraciones machine-to-machine, acceso de scripts, APIs internas.
**Limitacion:** si la clave se filtra, hay que regenerarla manualmente. No identifica usuarios individuales.

```
Request:
  X-API-Key: mi-clave-secreta-123
```

### Mecanismo 2: JSON Web Token (JWT)

JWT es un estandar abierto (RFC 7519) para transmitir informacion de forma segura entre partes como un objeto JSON firmado digitalmente.

**Estructura del token:** tres partes separadas por `.`

```
header.payload.signature

eyJhbGciOiJIUzI1NiJ9  .  eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIn0  .  xK8...
     ^                          ^                                       ^
  algoritmo              datos del usuario                        firma HMAC
```

El payload puede contener cualquier campo JSON (llamados "claims"):

```json
{
  "userId": 1,
  "role": "student",
  "iat": 1714000000,   // issued at
  "exp": 1714003600    // expira en 1 hora
}
```

**Puntos clave de seguridad:**

* El payload es legible (solo base64), nunca incluir datos sensibles como passwords.
* La firma verifica integridad: si alguien modifica el payload, la verificacion falla.
* El servidor no guarda estado: toda la info necesaria esta en el token.
* Usar HTTPS siempre para que el token no viaje en texto plano.
* Tokens de acceso de corta vida (1h), refresh tokens de larga vida guardados en cookies HttpOnly.

### Comparacion: x-api-key vs JWT

| Aspecto | x-api-key | JWT |
|---------|-----------|-----|
| Estado en servidor | No | No |
| Identifica usuario | No | Si |
| Expiracion | Manual | Automatica |
| Revocacion | Regenerar clave | Blacklist o expiracion |
| Uso tipico | M2M, scripts | Usuarios autenticados |

**Estrategia del proyecto:** usamos ambos. Los endpoints del chatbot requieren JWT (usuario logueado). Los endpoints de admin usan x-api-key.

### Rate limiting

Limitar la cantidad de requests por IP/usuario en una ventana de tiempo. Previene abuso, scraping y ataques de fuerza bruta.

```
express-rate-limit: 100 requests por 15 minutos por IP
```

---

## Practica: Implementar autenticacion

### Instalar dependencias

```bash
npm install jsonwebtoken bcryptjs express-rate-limit
```

### `.env` actualizado

```
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecreto_minimo_32_caracteres_aqui
JWT_EXPIRES_IN=1h
API_KEY=clave-admin-supersecreta-2024
```

### `src/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken')

// Middleware JWT: verifica Bearer token en Authorization header
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // disponible en el handler: req.user.userId
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' })
    }
    return res.status(401).json({ error: 'Token invalido' })
  }
}

// Middleware x-api-key: para endpoints de administracion
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'API Key invalida' })
  }

  next()
}

module.exports = { verifyJWT, verifyApiKey }
```

### `src/routes/auth.routes.js` — login y registro mock

```javascript
const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

// Usuarios en memoria (en clase 4 migramos a DB)
const users = [
  { id: 1, username: 'alumno1', password: 'pass123', role: 'student' },
  { id: 2, username: 'admin',   password: 'admin123', role: 'admin' }
]

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'username y password requeridos' })
  }

  const user = users.find(u => u.username === username && u.password === password)

  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' })
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  )

  res.json({
    message: 'Login exitoso',
    token,
    user: { id: user.id, username: user.username, role: user.role }
  })
})

module.exports = router
```

### Aplicar middleware en las rutas

```javascript
// src/routes/chat.routes.js
const express = require('express')
const router = express.Router()
const { verifyJWT } = require('../middleware/auth.middleware')

// verifyJWT se ejecuta ANTES del handler
router.post('/', verifyJWT, async (req, res) => {
  const { query } = req.body
  const { userId, username } = req.user  // datos del JWT

  if (!query) {
    return res.status(400).json({ error: 'El campo query es requerido' })
  }

  res.json({
    answer: `[MOCK] Hola ${username}, recibiste: "${query}"`,
    sources: [],
    userId
  })
})

module.exports = router
```

### Rate limiting en `app.js`

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // max requests por IP
  message: { error: 'Demasiadas solicitudes, intente en 15 minutos' }
})

app.use('/api/', limiter)
```

---

## Teoria: Documentacion de APIs

### Por que documentar

Una API sin documentacion es inutilizable para otros desarrolladores (y para uno mismo tres meses despues). La documentacion debe ser el contrato entre quien expone la API y quien la consume.

**OpenAPI Specification (OAS):** estandar para describir APIs REST en formato YAML o JSON. Herramientas como Swagger y Scalar leen este spec y generan interfaces interactivas.

### Opcion A: Swagger con autogen

`swagger-autogen` analiza el codigo fuente y genera el archivo `swagger.json` automaticamente. `swagger-ui-express` lo sirve como interfaz web.

```bash
npm install swagger-autogen swagger-ui-express
```

**Flujo:**

1. Anotar los handlers con comentarios JSDoc.
2. Ejecutar `node swagger.js` para regenerar el spec.
3. Acceder a `/api-docs` para ver la interfaz.

### Opcion B: Scalar (moderno, recomendado)

Scalar ofrece una interfaz mas moderna que Swagger UI, con soporte nativo para OpenAPI 3.x, mejor UX y temas.

```bash
npm install @scalar/express-api-reference
```

### Versionado de APIs

**Por que versionar:**

* Los clientes existentes no deben romperse cuando la API evoluciona.
* Permite deprecar endpoints gradualmente.

**Estrategia de path (la mas usada):**

```
/api/v1/chat    <- version actual
/api/v2/chat    <- nueva version con cambios breaking
```

**Regla practica:** versionar solo cuando hay cambios que rompen compatibilidad (campos renombrados, tipo de datos cambiado, endpoints eliminados).

---

## Practica: Documentar con Swagger

### `swagger.js` — generador del spec

```javascript
const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    title: 'EduBot RAG API',
    description: 'API de chatbot educativo con RAG y Supabase',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/api/v1',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Formato: Bearer <token>'
    },
    ApiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key'
    }
  }
}

const outputFile = './swagger.json'
const routes = ['./app.js']

swaggerAutogen(outputFile, routes, doc)
```

### Agregar comentarios en los handlers

```javascript
// POST /api/v1/chat
router.post('/', verifyJWT, async (req, res) => {
  /*
    #swagger.tags = ['Chat']
    #swagger.description = 'Envia una consulta y recibe una respuesta de la IA con fuentes'
    #swagger.security = [{ BearerAuth: [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        query: 'Que es una variable en programacion?',
        userId: 'user-123'
      }
    }
    #swagger.responses[200] = {
      description: 'Respuesta generada exitosamente',
      schema: {
        answer: 'Una variable es...',
        sources: [{ content: '...', source: 'semana1.pdf' }]
      }
    }
  */
  // ... handler
})
```

### Integrar en `app.js`

```javascript
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
```

---

## Tarea Clase 2

1. Implementar el login y probar el flujo completo: `POST /auth/login` -> obtener token -> usar token en `POST /chat`.
2. Documentar al menos 3 endpoints con swagger-autogen.
3. Investigar: que es un refresh token y por que es util?
4. Bonus: implementar un middleware que loggee cada request (metodo, path, status, tiempo).