# Clase 5 — Testing de APIs

**Unidades 3 y 4 | Duración: ~3hs**
**Avance en el proyecto:** tests automatizados con Jest y Supertest

---

## Teoria: Testing de APIs

### Por que testear

Los tests automatizados son la unica forma de garantizar que el codigo sigue funcionando despues de cada cambio. En un proyecto con integraciones externas (OpenAI, Supabase), los errores pueden aparecer de formas inesperadas.

### Tipos de test en backend

| Tipo | Que prueba | Velocidad | Dependencias externas |
|------|------------|-----------|----------------------|
| Unitario | Una funcion en aislamiento | Muy rapido | No (mocks) |
| Integracion | Varios modulos juntos | Rapido | A veces |
| End-to-end (e2e) | Toda la API via HTTP | Mas lento | Si |

**Regla practica:** para el proyecto, priorizamos tests de integracion con Supertest porque prueban el comportamiento real de los endpoints sin depender de la DB.

### Jest y Supertest

**Jest:** framework de testing para JavaScript/Node.js. Maneja assertions, mocks y coverage.

**Supertest:** permite hacer requests HTTP a la app Express directamente en memoria, sin levantar el servidor en un puerto real.

```javascript
import request from 'supertest'
import app from '../app.js'

describe('POST /api/v1/auth/login', () => {
  it('devuelve 200 y un token con credenciales validas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'alumno1', password: 'pass123' })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })
})
```

### Mocks: aislar dependencias externas

Para testear la logica de negocio sin llamar a OpenAI ni Supabase reales, se usan mocks: reemplazos controlados que simulan el comportamiento de los modulos.

```javascript
// Mock de generateEmbedding para que no llame a OpenAI
jest.mock('../src/services/embedding.service', () => ({
  generateEmbedding: jest.fn().mockResolvedValue(new Array(1536).fill(0.1))
}))

// Mock del repositorio para que no llame a Supabase
jest.mock('../src/repositories/document.repository', () => ({
  findSimilar: jest.fn().mockResolvedValue([
    { id: 1, content: 'texto de prueba', source: 'test.pdf', similarity: 0.9 }
  ])
}))
```

### Generacion de tests con IA

Herramientas como Claude o GitHub Copilot pueden generar una suite de tests inicial dado el codigo fuente. El proceso correcto es:

1. Pasar el servicio o ruta a la IA con un prompt claro.
2. La IA genera los casos de prueba (happy path + casos borde + errores).
3. El desarrollador revisa, critica y ajusta cada test.
4. No ejecutar tests generados sin revision: pueden tener asunciones incorrectas o cubrir casos irrelevantes.

---

## Practica: Escribir tests para EduBot

### Setup de testing

```bash
npm install --save-dev jest supertest
```

`package.json`:

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage"
  }
}
```

### `tests/auth.test.js`

```javascript
import request from 'supertest'
import app from '../app.js'

describe('Auth endpoints', () => {
  describe('POST /api/v1/auth/login', () => {
    it('devuelve 200 y token con credenciales validas', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'alumno1', password: 'pass123' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(typeof res.body.token).toBe('string')
    })

    it('devuelve 401 con password incorrecta', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'alumno1', password: 'mal' })

      expect(res.status).toBe(401)
    })

    it('devuelve 400 si falta el campo username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'pass123' })

      expect(res.status).toBe(400)
    })
  })
})
```

### `tests/chat.test.js` — con mocks de servicios externos

```javascript
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app.js'

// Mockear servicios externos
jest.mock('../src/services/embedding.service', () => ({
  generateEmbedding: jest.fn().mockResolvedValue(new Array(1536).fill(0.1))
}))

jest.mock('../src/repositories/document.repository', () => ({
  findSimilar: jest.fn().mockResolvedValue([
    { id: 1, content: 'Los algoritmos son...', source: 'semana1.pdf', similarity: 0.95 }
  ]),
  save: jest.fn().mockResolvedValue({ id: 1 })
}))

jest.mock('../src/services/ai.factory', () => ({
  createAIClient: jest.fn().mockReturnValue({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Un algoritmo es un conjunto de pasos...' } }],
          usage: { total_tokens: 120 }
        })
      }
    }
  })
}))

// Generar token valido para los tests
const validToken = jwt.sign(
  { userId: 1, username: 'alumno1', role: 'student' },
  process.env.JWT_SECRET || 'test-secret',
  { expiresIn: '1h' }
)

describe('POST /api/v1/chat', () => {
  it('devuelve 200 con respuesta y sources', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ query: 'Que es un algoritmo?' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('answer')
    expect(res.body).toHaveProperty('sources')
    expect(Array.isArray(res.body.sources)).toBe(true)
  })

  it('devuelve 401 sin token', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .send({ query: 'Que es un algoritmo?' })

    expect(res.status).toBe(401)
  })

  it('devuelve 400 sin query', async () => {
    const res = await request(app)
      .post('/api/v1/chat')
      .set('Authorization', `Bearer ${validToken}`)
      .send({})

    expect(res.status).toBe(400)
  })
})
```

---

## Tarea Clase 5

1. Ejecutar `npm test` y lograr que los tres tests de auth y los tres de chat pasen en verde.
2. Agregar al menos dos casos de prueba adicionales: uno para el endpoint `/upload` y uno para un caso borde del `/chat` (query demasiado larga).
3. Revisar el reporte de coverage y apuntar a cubrir al menos el 70% de las lineas del directorio `src/services`.
4. Investigar: que diferencia hay entre `jest.fn()`, `jest.spyOn()` y `jest.mock()`? Cuando conviene usar cada uno?