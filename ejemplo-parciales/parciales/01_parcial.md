## Parcial 1: API RESTful de Personajes de Dragon Ball

### Consigna

Desarrollar una API REST que permita a un usuario autenticarse con JWT, obtener información de personajes desde la API externa de Dragon Ball y gestionar una lista de personajes favoritos en memoria (sin base de datos).

---

### Endpoints requeridos

| Metodo | Endpoint | Autenticacion | Body | Respuesta exitosa (codigo) |
|--------|----------|---------------|------|----------------------------|
| POST | /api/v1/auth/login | No | { username, password } | 200 { token, user } |
| GET | /api/v1/characters/random | Si (JWT) | - | 200 { character } |
| POST | /api/v1/characters/favorites | Si (JWT) | { characterId } | 201 { message, favorite } |
| GET | /api/v1/characters/favorites | Si (JWT) | - | 200 { favorites: [] } |
| DELETE | /api/v1/characters/favorites/:id | Si (JWT) | - | 200 { message } |

### Detalles adicionales

- **Usuario fijo para login:** `{ username: "alumno", password: "123456" }`
- **JWT:** Debe expirar en 2 horas.
- **API externa a consumir:** Dragon Ball API (https://dragonball-api.com).
    - Endpoint base: `https://dragonball-api.com/api/characters`
    - En `GET /characters/random` se debe consumir el endpoint que devuelve un personaje aleatorio o bien obtener todos los personajes y seleccionar uno al azar. La respuesta de la API externa tiene una estructura similar a:
      ```json
      {
        "id": 1,
        "name": "Goku",
        "ki": "60.000.000",
        "maxKi": "90.000.000",
        "race": "Saiyan",
        "gender": "Male",
        "description": "...",
        "image": "...",
        "originPlanet": { ... },
        "transformations": [ ... ]
      }
      ```
    - Tu API debe devolver en `GET /characters/random` el objeto del personaje en el mismo formato (o bien un subconjunto definido por ti, por ejemplo: `{ id, name, race, description }`). Debe quedar claro en la documentación.
- **En `POST /characters/favorites`:** Se debe recibir un `characterId` (numérico) en el cuerpo de la petición. A partir de ese ID, se debe obtener el personaje completo desde la API externa (usando el endpoint `GET /api/characters/{id}`) y almacenarlo en la lista de favoritos del usuario. Si el ID no existe en la API externa, se debe responder con un error 404.
- **Almacenar favoritos en memoria:** Usar un `Map` con clave `userId` y valor un array de objetos favoritos. Cada favorito debe contener al menos: `id` (único, generado por ejemplo con `Date.now()`), `character` (el objeto del personaje) y `createdAt` (fecha ISO).
- **Manejar errores:** 400, 401, 404, 503 (en caso de fallo al consumir la API externa).

---

### Estructura de proyecto sugerida

```
dragonball-api/
├── .env
├── .env.example
├── package.json
├── server.js
├── app.js
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── characters.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── services/
│       └── characterService.js
└── README.md
```

---

### Entrega y condiciones

- Repositorio **GitHub** (público o con acceso al docente).
- El repositorio debe incluir:
  - Todo el código fuente.
  - Archivo `.env.example` con las variables: `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, y opcionalmente `DB_API_BASE_URL`.
  - `README.md` con instrucciones de instalación (`npm install`, `npm run dev`).
- No incluir `node_modules`.
- No usar base de datos (todo en memoria).
- El servidor debe iniciar sin errores con `npm start`.



### Ayudas

- Investiga previamente la estructura de la respuesta de la Dragon Ball API para saber cómo acceder a los datos del personaje.
- Para obtener un personaje aleatorio, puedes obtener la lista completa de personajes (`GET /api/characters`) y seleccionar un índice aleatorio, o bien usar algún endpoint específico si la API lo ofrece.
- Recuerda que la API externa puede tener rate limiting o estar caída; maneja esos casos con un `try/catch` y responde con 503.
- Para el `POST /characters/favorites`, primero verifica que el `characterId` exista en la API externa antes de guardarlo; de lo contrario, responde con 404.
- Usa `axios` o `fetch` para consumir la API externa. Asegúrate de instalar la dependencia correspondiente.
