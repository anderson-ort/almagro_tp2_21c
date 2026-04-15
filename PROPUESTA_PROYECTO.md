# EduBot RAG — Proyecto Integrador (Versión Gemini)

**Curso:** Backend Node.js  
**Stack:** Node.js 22 + Express + Supabase (pgvector) + **Google Gemini API** **Deploy:** Render (gratuito) + Supabase (gratuito)  
**Duración total:** 6 clases

---

## Descripción del proyecto

A lo largo de las 6 clases construimos una API backend completa llamada **EduBot RAG**: un tutor virtual que permite subir documentos educativos (PDFs o texto), indexarlos en una base de datos vectorial y responder preguntas de estudiantes usando IA con contexto preciso, sin alucinaciones, utilizando los modelos generativos de Google.

---

## Arquitectura final del proyecto

```
[Cliente / Postman]
       |
       | POST /api/v1/chat  { query: "..." }
       v
[Express API — Node.js]
       |
       |-- Middleware: JWT / x-api-key
       |-- Router --> ChatService
       |
       |-- 1. Genera embedding de la query (Gemini text-embedding-004)
       |-- 2. Busca chunks similares (Supabase pgvector)
       |-- 3. Arma prompt con contexto
       |-- 4. Llama a Google Gemini (1.5 Flash)
       |
       v
  Respuesta JSON + fuentes citadas


[POST /api/v1/upload]
       |
       |-- Recibe PDF (multipart)
       |-- pdf-parse -> texto plano
       |-- Divide en chunks de ~512 tokens
       |-- Genera embeddings por chunk (Gemini)
       |-- Guarda en Supabase Storage + pgvector
```

---

## Estructura de carpetas objetivo

```
edubot-rag/
├── src/
│   ├── routes/
│   │   ├── chat.routes.js
│   │   └── upload.routes.js
│   ├── services/
│   │   ├── chat.service.js
│   │   ├── embedding.service.js
│   │   └── upload.service.js
│   ├── repositories/
│   │   └── document.repository.js
│   ├── middleware/
│   │   ├── auth.middleware.js   (JWT + x-api-key)
│   │   └── error.middleware.js
│   └── config/
│       └── supabase.js
├── .env
├── .env.example
├── app.js
├── server.js
└── package.json
```

---

## Criterios de evaluación

| Criterio | Peso | Indicador |
|----------|------|-----------|
| Endpoint `/chat` con RAG funcional | 35% | Respuestas precisas con Gemini y sources |
| Upload y procesamiento de PDFs | 25% | Chunks almacenados correctamente |
| Supabase + pgvector (KNN search) | 20% | Queries en menos de 1 segundo |
| Seguridad y autenticación | 10% | JWT y x-api-key funcionando |
| Documentación + README + deploy | 10% | URL live + swagger/scalar |

**Aprobación:** 70% funcional.  
**Bonus:** streaming de respuestas con Gemini (+5%).

---

## Seguimiento clase a clase

### Clase 1 — APIs RESTful con Node.js y Express
**Unidad 3 | Avance del proyecto: servidor base + primer endpoint `/chat` sin base de datos**

* Repositorio inicializado con `npm init` y dependencias base.
* `server.js` como punto de entrada y `app.js` con middlewares globales.
* Endpoint `GET /health` activo.
* Endpoint `POST /api/v1/chat` con mock de respuesta "echo".

### Clase 2 — Seguridad, Documentación y Versionado
**Unidad 3 | Avance del proyecto: seguridad con JWT + x-api-key + documentación Swagger/Scalar**

* Implementación de `auth.middleware.js` (JWT + API Key).
* Rate limiting aplicado a la API.
* Endpoint `/chat` protegido por token.
* Documentación Swagger autogenerada.
* `.env` incluye `JWT_SECRET` y `API_KEY`.

### Clase 3 — Arquitectura en Capas y Patrones de Diseño
**Unidad 4 | Avance del proyecto: refactorización completa en capas + integración real con Gemini**

Al terminar esta clase el proyecto tiene:
* Dependencias instaladas: `@google/generative-ai` (o `openai` con el adapter de Gemini).
* `src/config/supabase.js` (Singleton).
* `src/services/ai.factory.js` (Factory para Gemini 1.5 Flash).
* `src/services/embedding.service.js` usando el modelo `text-embedding-004`.
* `src/services/chat.service.js` con lógica RAG: embedding -> búsqueda -> prompt -> Gemini.
* `.env` ampliado con `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

### Clase 4 — Bases de Datos con Supabase y pgvector
**Unidad 4 | Avance del proyecto: persistencia real, upload de PDFs, pipeline RAG completo**

* Tabla `documents` en Supabase con columna `embedding VECTOR(768)` (dimensión nativa de Gemini).
* Función SQL `match_documents` para búsqueda por similitud.
* Pipeline en `upload.service.js`: PDF -> Chunks -> Gemini Embeddings -> pgvector.
* RAG end-to-end funcional con fuentes citadas.

### Clase 5 — Testing de APIs
**Unidades 3 y 4 | Avance del proyecto: tests automatizados con Jest y Supertest**

* Mocks de `embedding.service` y `ai.factory` para evitar consumo de cuota de Gemini en tests.
* Suite completa para `/auth` y `/chat`.
* Reporte de cobertura generado con `npm test`.

### Clase 6 — Arquitecturas, CI/CD y Deploy
**Unidades 3 y 4 | Avance del proyecto: pipeline CI/CD + aplicación en producción + presentación final**

* `.github/workflows/deploy.yml` configurado (Test + Deploy).
* Secrets de GitHub con `GEMINI_API_KEY` y hooks de Render.
* Despliegue final en Render con variables de entorno.
* README con diagrama de arquitectura y links de acceso.

---

## Checklist final del proyecto (Adaptado Gemini)

```
Funcionalidad
  [ ] POST /api/v1/auth/login devuelve JWT
  [ ] POST /api/v1/upload procesa PDFs y guarda chunks (Embeddings Gemini)
  [ ] POST /api/v1/chat responde con contexto usando Gemini 1.5 Flash
  [ ] Las respuestas citan las fuentes (source_file)
  [ ] Rate limiting activo

Seguridad
  [ ] Endpoints protegidos con JWT o x-api-key
  [ ] .env no está en el repositorio
  [ ] helmet() activo

Tests
  [ ] Tests de auth (login válido/inválido)
  [ ] Tests de chat (con mocks de Gemini y Supabase)
  [ ] npm test corre sin errores

Deploy y CI/CD
  [ ] Pipeline de GitHub Actions activo
  [ ] Deploy automático a Render
  [ ] URL de producción funcionando

Documentación
  [ ] README con instrucciones y diagrama
  [ ] .env.example con GEMINI_API_KEY
  [ ] Swagger/Scalar accesible en /api-docs
```