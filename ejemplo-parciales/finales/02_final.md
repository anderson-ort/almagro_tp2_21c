# Examen Final Taller de Programación 2

**Docente a cargo**

* *Anderson Ocana*
* Correo electrónico: [aocana@ort.edu.ar](mailto:aocana@ort.edu.ar)

---

# Objetivo

Desarrollar una **API RESTful** utilizando **Node.js con Express** para gestionar las habitaciones de un hotel.

La API deberá permitir administrar las habitaciones disponibles y generar un archivo CSV utilizando información obtenida desde una API pública.

Debe entregarse el backend completo según las especificaciones siguientes.

---

# Requerimientos

## 1. Persistencia (opción elegida al iniciar el proyecto)

* Opción A: MongoDB Atlas (recomendado).
* Opción B: Archivo local `database.json`.
* Opcionalmente, el repositorio debe permitir cambiar entre ambas mediante una variable de entorno.

```env
DB_PROVIDER=mongo
```

o

```env
DB_PROVIDER=json
```

---

## 2. Seguridad (middleware)

Implementar una capa de middleware reutilizable que soporte autenticación mediante JWT.

El token deberá recibirse mediante:

```http
Authorization: Bearer <token>
```

El middleware deberá poder aplicarse únicamente a determinadas rutas.

Los endpoints protegidos serán:

* Editar habitación.
* Eliminar habitación.

---

## 3. Entidad obligatoria: Habitación (CRUD completo)

### Campos

| Campo             | Tipo            | Requerido                |
| ----------------- | --------------- | ------------------------ |
| id                | UUID u ObjectId | generado automáticamente |
| nombre            | string          | Sí                       |
| plazasDisponibles | integer         | Sí                       |
| fechaAlta         | date ISO8601    | No                       |

Si no se recibe `fechaAlta`, deberá asignarse automáticamente la fecha actual con formato:

```text
YYYY-MM-DD
```

---

### Reglas de negocio

Al crear una habitación:

* `nombre` no puede ser vacío.
* `plazasDisponibles` debe ser un entero mayor o igual a cero.

Durante el **PUT**:

El campo `plazasDisponibles` solamente podrá:

* permanecer igual, o
* incrementarse exactamente en **1 unidad** respecto del valor almacenado.

Ejemplo:

Valor actual:

```text
2
```

Valores válidos:

```text
2
3
```

Valores inválidos:

```text
1
4
10
```

Las respuestas de error deberán ser estandarizadas.

---

# 4. Endpoints

## POST /api/v1/habitaciones

Crea una habitación.

No requiere autenticación.

Respuesta:

```http
201 Created
```

---

## GET /api/v1/habitaciones

Lista todas las habitaciones.

No requiere autenticación.

---

## GET /api/v1/habitaciones/:id

Obtiene una habitación por ID.

Debe responder:

* 200
* 404

---

## PUT /api/v1/habitaciones/:id

Actualiza una habitación.

Requiere autenticación.

Debe validar todas las reglas de negocio.

---

## DELETE /api/v1/habitaciones/:id

Elimina una habitación.

Requiere autenticación.

---

## GET /api/v1/pokemon/csv

Ruta dedicada que consume la API:

```text
https://pokeapi.co/api/v2/pokemon/{id}
```

La ruta deberá consultar secuencialmente los Pokémon con IDs del **1 al 15**.

Por cada Pokémon deberá recuperar su información y generar un archivo CSV.

---

## Tabla de Endpoints

| Método | Ruta                     | Descripción         | Auth |
| ------ | ------------------------ | ------------------- | ---- |
| POST   | /api/v1/habitaciones     | Crear habitación    | No   |
| GET    | /api/v1/habitaciones     | Listar habitaciones | No   |
| GET    | /api/v1/habitaciones/:id | Obtener habitación  | No   |
| PUT    | /api/v1/habitaciones/:id | Editar habitación   | Sí   |
| DELETE | /api/v1/habitaciones/:id | Eliminar habitación | Sí   |
| GET    | /api/v1/pokemon/csv      | Generar CSV         | No   |

---

# 5. Validaciones y formato de errores

Todas las respuestas de error deberán respetar el siguiente formato:

```json
{
    "statusCode":400,
    "error":"Mensaje descriptivo"
}
```

---

# 6. Tests (manuales / REST Client)

Crear el archivo:

```text
tests/test.endpoints.http
```

Debe contener pruebas para:

* Crear habitación.
* Listar habitaciones.
* Obtener habitación.
* Update sin JWT (401 o 403).
* Update con JWT válido.
* Delete protegido.
* Endpoint `/pokemon/csv`.

Incluir comentarios indicando cómo generar un JWT de prueba.

---

# 7. Organización sugerida

```text
proyecto-hotel-api
│
├── app.js
├── index.js
├── config/
│   └── index.js
├── controllers/
│   └── habitacionController.js
├── models/
│   └── habitacion.js
├── repository/
│   ├── habitacionRepositoryMongo.js
│   └── habitacionRepositoryJson.js
├── services/
│   ├── habitacionService.js
│   └── pokemonService.js
├── routes/
│   └── habitacionRoutes.js
├── middlewares/
│   └── authMiddleware.js
├── database/
│   ├── database.json
│   └── pokemon_15.csv
├── tests/
│   └── test.endpoints.http
└── package.json
```

---

# 8. Consume y guarda CSV

La ruta:

```text
GET /api/v1/pokemon/csv
```

debe:

* consumir la API

```text
https://pokeapi.co/api/v2/pokemon/{id}
```

* obtener la información de los Pokémon con IDs del **1 al 15**;
* generar un CSV con las siguientes columnas:

```text
id
name
height
weight
base_experience
```

* guardar el archivo

```text
pokemon_15.csv
```

* responder con:

```http
Content-Type: text/csv
```

o permitir su descarga.

---

# 9. Entrega

Repositorio GitHub, GitLab o Bitbucket.

Debe incluir:

## README

Con instrucciones para ejecutar el proyecto utilizando:

* MongoDB
* JSON

según corresponda.

---

## Archivo de entrega

```text
### Entrega Final Taller de Programación

* nombre_alumno:
* link:
* Variables de entorno:
```

Ejemplo:

```text
PORT=3000
JWT_SECRET=supersecret
DB_PROVIDER=json
```

---

## Consideraciones finales

Se evaluará:

* Arquitectura del proyecto.
* Organización del código.
* Uso correcto de Express.
* Middleware reutilizable.
* Persistencia.
* Validaciones.
* Correcto uso de HTTP Status Codes.
* Manejo de errores.
* Correcta utilización de operaciones asíncronas (`async/await`) para consumir múltiples recursos de una API externa.
* Transformación de datos JSON a CSV.
* Generación y almacenamiento de archivos.
* Calidad del código.
* Buenas prácticas.
* Funcionamiento completo de las pruebas.
