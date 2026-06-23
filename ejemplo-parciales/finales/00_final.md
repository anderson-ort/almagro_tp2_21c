# Examen Final Taller de Programacion 2

**Docente a cargo** 
  - _Anderson Ocana_
  - [Correo electronico](mailto:aocana@ort.edu.ar)
## Objetivo

Desarrollar una **API RESTful** en **Node.js con Express** para gestionar productos (stock). Debe entregarse el backend completo según las especificaciones siguientes.

## Requerimientos

1. **Persistencia (opción elegida al iniciar el proyecto):**

   * Opción A: [MongoDB Atlas](https://www.mongodb.com) (recomendado).
   * Opción B: Archivo local `database.json`.
   * [_Opcional_] El repositorio debe permitir cambiar entre ambas mediante una variable de configuración (`DB_PROVIDER=mongo|json`).

2. **Seguridad (middleware):**

   * Implementar una capa de middleware que soporte **JWT** (header `Authorization: Bearer <token>`).
   * El middleware debe ser reutilizable y aplicable a rutas específicas.
   * Los endpoints de **update** (aumentar stock / editar) y **delete** deben requerir autorización mediante ese middleware.
  
3. **Entidad obligatoria:** `Producto` (CRUD completo).

   * Campos:

     * `id`: UUID (o ObjectId si MongoDB). Generado por el sistema.
     * `producto`: string — requerido, no vacío.
     * `stockAmount`: integer ≥ 0 — requerido.
     * `fechaIngreso`: date (ISO 8601) — opcional; por defecto se asigna la fecha actual en formato `YYYY-MM-DD`.
   * Reglas de negocio:

     * Al crear: `stockAmount` debe ser entero ≥ 0.
     * Al incrementar stock (updateStock): el incremento debe ser incrementado en 1.
   * Respuestas de error estandarizadas.

4. **Endpoints (rutas y comportamiento):**

   * `POST   /api/v1/productos`

     * Crea un producto. No requiere autenticación.
     * Respuesta 201 con el recurso creado.
   * `GET    /api/v1/productos`

     * Lista todos los productos. No requiere autenticación.
     * Respuesta 200 con array de productos.
   * `GET    /api/v1/productos/:id`

     * Devuelve producto por id. No requiere autenticación.
     * Respuesta 200 o 404.
   * `PUT    /api/v1/productos/:id`

     * Edita campos del producto (full update o parcial según diseño). **REQUIERE** autenticación  — este es uno de los endpoints protegidos.
     * Validar las reglas de negocio.

   * `DELETE /api/v1/productos/:id`

     * Elimina el producto. **REQUIERE** autenticación.
   * `GET    /api/v1/albums/csv`

     * Ruta dedicada que consume la API externa `https://jsonplaceholder.typicode.com/albums`, recupera **los 15 primeros registros**, los guarda en un archivo CSV local (`albums_15.csv`) y devuelve el CSV (contenido o descarga). No requiere autenticación por defecto (configurable).

   *Explicacion visual*


    | Método | Ruta                              | Descripción             | Auth |
    | ------ | --------------------------------- | ----------------------- | ---- |
    | POST   | /api/v1/productos                 | Crear producto          | No   |
    | GET    | /api/v1/productos                 | Listar productos        | No   |
    | GET    | /api/v1/productos/:id             | Obtener producto        | No   |
    | PUT    | /api/v1/productos/:id             | Editar producto         | Sí   |
    | DELETE | /api/v1/productos/:id             | Eliminar                | Sí   |
    | GET    | /api/v1/albums/csv                | Descarga/generación CSV | No   |



5. **Validaciones y formato de errores**

   * Formato de error (respuesta JSON):

     ```json
     {
       "statusCode": 400,
       "error": "Mensaje descriptivo"
     }
     ```

6. **Tests (manuales/semiautomáticos)**

   * Incluir un archivo `tests/test.endpoints.http` (formato REST Client para VSCode u otro cliente HTTP).
   * Debe contener ejemplos de:

     * Crear producto.
     * Listar productos.
     * Obtener producto por id.
     * Intento de update sin autenticación (esperar 401/403).
     * Update con `x-api-key` y/o Token válido.
     * Delete protegido.
     * Endpoint `/api/v1/albums/csv` que devuelve el CSV (y/o descarga).
   * Incluir comentarios en el archivo con instrucciones sobre cómo generar/colocar una  JWT de prueba.

7. **Organización del proyecto (sugerida)**

   ```bash
   proyecto-stock-api/
   ├── app.js                      # Punto de entrada, configuración de Express y middlewares globales
   ├── config/
   │   └── index.js                # Carga variables de entorno 
   ├── controllers/
   │   └── productoController.js
   ├── models/
   │   └── producto.js             # Esquema/DTO (no validaciones de negocio)
   ├── repository/
   │   ├── productoRepositoryMongo.js
   │   └── productoRepositoryJson.js
   ├── routes/
   │   └── productoRoutes.js
   ├── services/
   │   └── albumsService.js        # Lógica para consumir jsonplaceholder y escribir CSV
   │   └── productoService.js      # Lógica para el producto (si es que es necesario)
   ├── middlewares/
   │   └── authMiddleware.js       # Valida x-api-key o JWT según config
   ├── tests/
   │   └── test.endpoints.http
   ├── database/
   │   └──database.json               # si se elige DB_PROVIDER=json
   │   └──albums_15.csv               # generado por la ruta /albums/csv
   index.js                       # Intancia del server
   package.json
   ```

8. **Consume y guarda CSV**

   * La ruta `/api/v1/albums/csv` debe:

     * `GET` a `https://jsonplaceholder.typicode.com/albums`.
     * Tomar los primeros 15 items.
     * Convertirlos a CSV (columnas mínimas: `userId,id,title`).
     * Guardar en `albums_15.csv`.
     * Devolver el CSV en la respuesta (con `Content-Type: text/csv` y/o JSON con enlace a descarga local si se prefiere).

9. **Entrega**

   * Repositorio (GitHub/GitLab/Bitbucket) con instrucciones claras en `README.md`.
   * Archivo de entrega final `.txt` con:

     ```txt
     ### Entrega Final Taller de Programación
     * nombre_alumno: <NOMBRE_APELLIDO>
     * link: Repositorio en <GitHub | GitLab | BitBucket>
     * Variables de entorno: 
      - Variables que se use en el proyecto
     ```

   * El `README.md` debe incluir: cómo levantar el proyecto en modo `mongo` y/o `json`.
   * Las pruebas deben ejecutarse sin problemas
