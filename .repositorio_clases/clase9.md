# Clase 6 — Arquitecturas, CI/CD y Deploy

**Unidades 3 y 4 | Duración: ~3hs**
**Avance en el proyecto:** pipeline CI/CD + aplicacion en produccion + presentacion final

---

## Teoria: Arquitecturas N-tier vs Clean

### Arquitectura N-tier (3 capas)

La que implementamos en clase 3: presentacion (rutas) -> negocio (servicios) -> datos (repositorios). Simple, directa, ideal para proyectos de tamano medio.

**Limitacion:** los servicios conocen directamente al repositorio. Si queremos cambiar Supabase por otro motor, hay que modificar el servicio.

### Clean Architecture

Propuesta por Robert Martin. Organiza el codigo en anillos concentricos donde las dependencias siempre apuntan hacia adentro:

```
┌──────────────────────────────────────┐
│  Frameworks & Drivers                │  Express, Supabase, multer
│  ┌──────────────────────────────┐    │
│  │  Interface Adapters          │    │  Controllers, Presenters, Gateways
│  │  ┌────────────────────────┐  │    │
│  │  │  Application Use Cases │  │    │  answerQuery, processPDF
│  │  │  ┌──────────────────┐  │  │    │
│  │  │  │  Entities        │  │  │    │  Document, ChatMessage (logica pura)
│  │  │  └──────────────────┘  │  │    │
│  │  └────────────────────────┘  │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

**Beneficio principal:** el nucleo de la aplicacion (casos de uso y entidades) no depende de frameworks ni de la DB. Se puede testear sin Express, sin Supabase, sin OpenAI.

**Cuando aplicarla:** proyectos grandes con equipos, donde la longevidad y la testeabilidad son criticas. Para un proyecto de terciario, N-tier es suficiente; Clean Architecture es el siguiente paso.

---

## Teoria: CI/CD con GitHub Actions

### Que es CI/CD

**Continuous Integration (CI):** practica de integrar cambios de codigo frecuentemente al repositorio principal. Cada push ejecuta automaticamente: instalacion de dependencias, linting, y suite de tests.

**Continuous Deployment (CD):** extension de CI donde, si los tests pasan, el codigo se despliega automaticamente a produccion o a un ambiente de staging.

**Beneficio clave:** eliminar el "funciona en mi maquina". El pipeline garantiza que el codigo que llega a produccion paso por las mismas verificaciones en todos los casos.

### GitHub Actions

Sistema de CI/CD integrado en GitHub. Se configura con archivos YAML en `.github/workflows/`. Se ejecuta en runners de GitHub (maquinas virtuales Ubuntu, Windows o Mac).

**Conceptos clave:**

* **Workflow:** el pipeline completo, definido en un `.yml`.
* **Job:** grupo de steps que corren en el mismo runner.
* **Step:** comando o action individual.
* **Secrets:** variables de entorno cifradas, configuradas en el repo de GitHub.
* **Trigger:** evento que dispara el workflow (push, pull_request, schedule).

### Deploy en Render

Render es una plataforma de hosting gratuita para aplicaciones web. Ofrece deploy automatico desde GitHub y soporte nativo para Node.js. El tier gratuito es suficiente para proyectos de clase.

**Flujo de deploy automatico:**

1. Push a `main` -> GitHub Actions corre los tests.
2. Si los tests pasan -> Actions llama al Render Deploy Hook.
3. Render descarga el nuevo codigo y reinicia el servidor.

---

## Practica: Pipeline CI/CD completo

### `.github/workflows/deploy.yml`

```yaml
name: CI/CD — EduBot RAG

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Correr tests
  test:
    name: Lint y Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del codigo
        uses: actions/checkout@v4

      - name: Configurar Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Correr tests
        run: npm test
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NODE_ENV: test

  # Job 2: Deploy (solo si tests pasan y es push a main)
  deploy:
    name: Deploy a Render
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Trigger deploy en Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}" \
            -H "Content-Type: application/json"
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Configurar secrets en GitHub

En el repositorio: Settings -> Secrets and variables -> Actions:

```
JWT_SECRET          = (mismo valor que en produccion)
RENDER_DEPLOY_HOOK  = (URL del deploy hook de Render)
```

### Configurar en Render

1. Crear cuenta en render.com.
2. New -> Web Service -> conectar repo de GitHub.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables: agregar todas las del `.env`.
6. Settings -> Deploy Hook: copiar la URL.

### `.env.example` — para el README

```
PORT=3000
NODE_ENV=development
JWT_SECRET=
JWT_EXPIRES_IN=1h
API_KEY=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
AI_PROVIDER=openai
```

---

## Presentacion final del proyecto

Cada alumno o grupo hace una demo en vivo de 10 minutos:

1. Mostrar la URL de produccion en Render (`/health` respondiendo).
2. Subir un PDF con `POST /upload` (usando Postman o Thunder Client).
3. Hacer login para obtener un JWT.
4. Consultar `POST /chat` con una pregunta relacionada al PDF subido.
5. Mostrar que la respuesta cita la fuente correcta.
6. Mostrar el pipeline de GitHub Actions ejecutado exitosamente.
7. Mostrar el README con instrucciones de setup.

---

## Checklist final del proyecto

```
Funcionalidad
  [ ] POST /api/v1/auth/login devuelve JWT
  [ ] POST /api/v1/upload procesa PDFs y guarda chunks
  [ ] POST /api/v1/chat responde con contexto de los documentos
  [ ] Las respuestas citan las fuentes (source_file)
  [ ] Rate limiting activo

Seguridad
  [ ] Endpoints protegidos con JWT o x-api-key segun corresponda
  [ ] .env no esta en el repositorio
  [ ] .env.example si esta en el repositorio
  [ ] helmet() activo

Tests
  [ ] Tests de auth (login valido, invalido, campos faltantes)
  [ ] Tests de chat (con mocks de OpenAI y Supabase)
  [ ] npm test corre sin errores

Deploy y CI/CD
  [ ] Pipeline de GitHub Actions corre los tests en cada push
  [ ] Deploy automatico a Render al hacer push a main
  [ ] Variables de entorno configuradas en Render (no en el codigo)
  [ ] URL de produccion funcionando

Documentacion
  [ ] README con instrucciones de setup paso a paso
  [ ] .env.example con todas las variables necesarias
  [ ] Swagger o Scalar accesible en /api-docs
  [ ] Diagrama de la arquitectura en el README
```

---

## Referencias y recursos

**Documentacion oficial:**

* Express.js: https://expressjs.com/
* Supabase + pgvector: https://supabase.com/docs/guides/ai
* OpenAI API: https://platform.openai.com/docs
* JSON Web Tokens: https://jwt.io/introduction
* GitHub Actions: https://docs.github.com/en/actions

**Conceptos de profundizacion:**

* RAG Pipeline: https://www.pinecone.io/learn/retrieval-augmented-generation/
* Chunking strategies: https://www.firecrawl.dev/blog/best-chunking-strategies-rag
* Clean Architecture: Robert C. Martin — "Clean Architecture" (libro)
* OpenAPI Specification: https://swagger.io/specification/

**Herramientas del proyecto:**

* Postman / Thunder Client (VS Code) para pruebas de endpoints
* Supabase Dashboard para ver datos y ejecutar SQL
* Render Dashboard para ver logs de produccion