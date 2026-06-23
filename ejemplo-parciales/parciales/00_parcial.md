# API RESTful con Node.js (2 horas)

## Consigna

Desarrollar una API REST que permita a un usuario autenticarse con JWT, obtener una frase aleatoria desde una API externa gratuita y gestionar sus frases favoritas en memoria (sin base de datos).

---

## Endpoints requeridos

| Metodo | Endpoint | Autenticacion | Body | Respuesta exitosa (codigo) |
|--------|----------|---------------|------|----------------------------|
| POST | /api/v1/auth/login | No | { username, password } | 200 { token, user } |
| GET | /api/v1/quotes/random | Si (JWT) | - | 200 { quote, author } |
| POST | /api/v1/quotes/favorites | Si (JWT) | { quote, author } | 201 { message, favorite } |
| GET | /api/v1/quotes/favorites | Si (JWT) | - | 200 { favorites: [] } |
| DELETE | /api/v1/quotes/favorites/:id | Si (JWT) | - | 200 { message } |

### Detalles adicionales

- Usuario fijo para login: `{ username: "alumno", password: "123456" }`
- JWT debe expirar en 2 horas.
- En GET /random se debe consumir la API externa y transformar la respuesta al formato { quote, author }.
- En POST /favorites se debe asignar un id unico (ej: Date.now()) y fecha de creacion (ISO string).
- Almacenar favoritos en memoria: usar Map con clave userId y valor array de favoritos.
- Manejar errores: 400, 401, 404, 503.

---

## API externa recomendada

**ZenQuotes API**

Endpoint: `GET https://zenquotes.io/api/random`

Respuesta original: `[ { "q": "texto", "a": "autor", "h": "..." } ]`

Tu API debe devolver: `{ "quote": "texto", "author": "autor" }`

---

## Estructura de proyecto sugerida

```
mi-api/
├── .env
├── .env.example
├── package.json
├── server.js
├── app.js
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── quotes.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── services/
│       └── quoteService.js
└── README.md
```

---

## Entrega y condiciones

- Repositorio **GitHub** (publico o con acceso al docente).
- El repositorio debe incluir:
  - Todo el codigo fuente.
  - Archivo `.env.example` con las variables: `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
  - `README.md` con instrucciones de instalacion (`npm install`, `npm run dev`).
- No incluir `node_modules`.
- No usar base de datos (todo en un json).
- El servidor debe iniciar sin errores con `npm start`.
