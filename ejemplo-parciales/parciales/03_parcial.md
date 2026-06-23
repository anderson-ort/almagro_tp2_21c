
## Parcial 3: API RESTful de Álbumes y Fotos

### Consigna

Desarrollar una API REST que permita a un usuario autenticarse con JWT, obtener información de álbumes y fotos desde la API externa de JSONPlaceholder y gestionar una lista de álbumes favoritos en memoria (sin base de datos).

---

### Endpoints requeridos

| Metodo | Endpoint | Autenticacion | Body | Respuesta exitosa (codigo) |
|--------|----------|---------------|------|----------------------------|
| POST | /api/v1/auth/login | No | { username, password } | 200 { token, user } |
| GET | /api/v1/albums/:id | Si (JWT) | - | 200 { album } |
| GET | /api/v1/albums/:id/photos | Si (JWT) | - | 200 { photos: [] } |
| POST | /api/v1/albums/favorites | Si (JWT) | { albumId } | 201 { message, favorite } |
| GET | /api/v1/albums/favorites | Si (JWT) | - | 200 { favorites: [] } |
| DELETE | /api/v1/albums/favorites/:id | Si (JWT) | - | 200 { message } |

### Detalles adicionales

- **Usuario fijo para login:** `{ username: "alumno", password: "123456" }`
- **JWT:** Debe expirar en 2 horas.
- **API externa a consumir:** JSONPlaceholder (https://jsonplaceholder.typicode.com).
    - Endpoint para álbumes: `GET /albums/{id}`
    - Endpoint para fotos de un álbum: `GET /albums/{id}/photos`
    - En `GET /albums/:id` se debe consumir el endpoint de JSONPlaceholder que devuelve un álbum específico. La respuesta tiene la forma:
      ```json
      {
        "userId": 1,
        "id": 1,
        "title": "quidem molestiae enim"
      }
      ```
    - Tu API debe devolver exactamente ese objeto (o bien agregar un campo adicional como `photosCount` si se desea).
    - En `GET /albums/:id/photos` se debe consumir el endpoint que devuelve las fotos de ese álbum. La respuesta es un array de objetos con la forma:
      ```json
      [
        {
          "albumId": 1,
          "id": 1,
          "title": "accusamus beatae ad facilis cum similique qui sunt",
          "url": "https://via.placeholder.com/600/92c952",
          "thumbnailUrl": "https://via.placeholder.com/150/92c952"
        }
      ]
      ```
    - Tu API debe devolver ese array (o un subconjunto).
- **En `POST /albums/favorites`:** Se debe recibir un `albumId` (numérico) en el cuerpo de la petición. A partir de ese ID, se debe obtener el álbum desde la API externa y almacenarlo en la lista de favoritos del usuario. Si el ID no existe en la API externa, se debe responder con un error 404.
- **Almacenar favoritos en memoria:** Usar un `Map` con clave `userId` y valor un array de objetos favoritos. Cada favorito debe contener al menos: `id` (único, generado por ejemplo con `Date.now()`), `album` (el objeto del álbum) y `createdAt` (fecha ISO).
- **Manejar errores:** 400, 401, 404, 503 (en caso de fallo al consumir la API externa).

---

### Estructura de proyecto sugerida

```
jsonplaceholder-api/
├── .env
├── .env.example
├── package.json
├── server.js
├── app.js
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── albums.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   └── services/
│       └── albumService.js
└── README.md
```

---

### Entrega y condiciones

- Repositorio **GitHub** (público o con acceso al docente).
- El repositorio debe incluir:
  - Todo el código fuente.
  - Archivo `.env.example` con las variables: `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, y opcionalmente `JSONPLACEHOLDER_BASE_URL`.
  - `README.md` con instrucciones de instalación (`npm install`, `npm run dev`).
- No incluir `node_modules`.
- No usar base de datos (todo en memoria).
- El servidor debe iniciar sin errores con `npm start`.

---

### Ayudas

- JSONPlaceholder es una API de prueba muy sencilla y sin autenticación. Puedes probar los endpoints directamente en el navegador para familiarizarte con la estructura de los datos.
- La API no tiene rate limiting, pero es recomendable no hacer demasiadas peticiones en un corto período de tiempo.
- Para el `POST /albums/favorites`, primero verifica que el `albumId` exista en la API externa antes de guardarlo; de lo contrario, responde con 404.
- Puedes usar `axios` o `fetch` para consumir la API externa. Asegúrate de instalar la dependencia correspondiente.
- Recuerda que JSONPlaceholder es de solo lectura en cuanto a datos reales, pero para los fines del parcial solo necesitas consumir datos, no persistir en la API externa.
