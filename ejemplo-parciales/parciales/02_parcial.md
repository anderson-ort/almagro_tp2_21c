
## Parcial 2: API RESTful de Pokémon

### Consigna

Desarrollar una API REST que permita a un usuario autenticarse con JWT, obtener información de un Pokémon desde la API externa de PokéAPI y gestionar una lista de Pokémon favoritos en memoria (sin base de datos).

---

### Endpoints requeridos

| Metodo | Endpoint | Autenticacion | Body | Respuesta exitosa (codigo) |
|--------|----------|---------------|------|----------------------------|
| POST | /api/v1/auth/login | No | { username, password } | 200 { token, user } |
| GET | /api/v1/pokemon/:name | Si (JWT) | - | 200 { pokemon } |
| POST | /api/v1/pokemon/favorites | Si (JWT) | { name } | 201 { message, favorite } |
| GET | /api/v1/pokemon/favorites | Si (JWT) | - | 200 { favorites: [] } |
| DELETE | /api/v1/pokemon/favorites/:id | Si (JWT) | - | 200 { message } |

### Detalles adicionales

- **Usuario fijo para login:** `{ username: "alumno", password: "123456" }`
- **JWT:** Debe expirar en 2 horas.
- **API externa a consumir:** PokéAPI (https://pokeapi.co).
    - Endpoint base: `https://pokeapi.co/api/v2/pokemon/{name or id}`
    - En `GET /pokemon/:name` se debe consumir el endpoint de la PokéAPI que devuelve la información de un Pokémon por su nombre o ID.
    - La respuesta de la API externa es muy extensa. Tu API debe transformar la respuesta y devolver un subconjunto definido por ti, por ejemplo:
      ```json
      {
        "id": 25,
        "name": "pikachu",
        "types": ["electric"],
        "abilities": ["static", "lightning-rod"],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
      }
      ```
    - La consigna debe especificar claramente qué campos debe contener la respuesta de tu API.
- **En `POST /pokemon/favorites`:** Se debe recibir un `name` (string) en el cuerpo de la petición. A partir de ese nombre, se debe obtener el Pokémon desde la API externa y almacenarlo en la lista de favoritos del usuario. Si el nombre no existe en la API externa, se debe responder con un error 404.
- **Almacenar favoritos en memoria:** Usar un `Map` con clave `userId` y valor un array de objetos favoritos. Cada favorito debe contener al menos: `id` (único, generado por ejemplo con `Date.now()`), `pokemon` (el objeto del Pokémon, con el subconjunto definido) y `createdAt` (fecha ISO).
- **Manejar errores:** 400, 401, 404, 503 (en caso de fallo al consumir la API externa).

---

### Estructura de proyecto sugerida

```
pokeapi/
├── .env
├── .env.example
├── package.json
├── server.js
├── app.js
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── pokemon.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── services/
│       └── pokemonService.js
└── README.md
```

---

### Entrega y condiciones

- Repositorio **GitHub** (público o con acceso al docente).
- El repositorio debe incluir:
  - Todo el código fuente.
  - Archivo `.env.example` con las variables: `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, y opcionalmente `POKEAPI_BASE_URL`.
  - `README.md` con instrucciones de instalación (`npm install`, `npm run dev`).
- No incluir `node_modules`.
- No usar base de datos (todo en memoria).
- El servidor debe iniciar sin errores con `npm start`.

---


### Ayudas

- La PokéAPI devuelve una cantidad muy grande de datos. Define claramente qué información relevante quieres extraer (por ejemplo, `id`, `name`, `types`, `abilities`, `sprite`) y crea una función de transformación.
- El endpoint es `GET /api/v2/pokemon/{name}`. Puedes probarlo en el navegador para ver la estructura de la respuesta.
- Recuerda que la API externa puede tener rate limiting o estar caída; maneja esos casos con un `try/catch` y responde con 503.
- Para el `POST /pokemon/favorites`, primero verifica que el `name` exista en la API externa antes de guardarlo; de lo contrario, responde con 404.
- Usa `axios` o `fetch` para consumir la API externa. Asegúrate de instalar la dependencia correspondiente.
