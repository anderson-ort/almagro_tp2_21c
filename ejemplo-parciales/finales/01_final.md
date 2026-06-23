# Examen Final Taller de Programación 

**Docente a cargo**

* *Anderson Ocana*
* Correo electrónico: [aocana@ort.edu.ar](mailto:aocana@ort.edu.ar)

---

# Objetivo

Desarrollar una **API RESTful** utilizando **Node.js con Express** para gestionar el catálogo de una biblioteca.

La API deberá permitir administrar libros y exportar información obtenida desde una API pública a un archivo CSV.

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

* Editar libro
* Eliminar libro

---

## 3. Entidad obligatoria: Libro (CRUD completo)

### Campos

| Campo              | Tipo            | Requerido                |
| ------------------ | --------------- | ------------------------ |
| id                 | UUID u ObjectId | generado automáticamente |
| titulo             | string          | Sí                       |
| cantidadEjemplares | integer         | Sí                       |
| fechaIngreso       | date ISO8601    | No                       |

Si no se recibe `fechaIngreso`, deberá asignarse automáticamente la fecha actual con formato:

```text
YYYY-MM-DD
```

---

### Reglas de negocio

Al crear un libro:

* `titulo` no puede ser vacío.
* `cantidadEjemplares` debe ser un entero mayor o igual a cero.

Durante el **PUT**:

El campo `cantidadEjemplares` solamente podrá:

* permanecer igual, o
* incrementarse exactamente en **1 unidad** respecto del valor almacenado.

Ejemplo:

Valor actual:

```text
5
```

Valores válidos:

```text
5
6
```

Valores inválidos:

```text
4
7
10
```

Las respuestas de error deberán ser estandarizadas.

---

# 4. Endpoints

## POST /api/v1/libros

Crea un libro.

No requiere autenticación.

Respuesta:

```http
201 Created
```

---

## GET /api/v1/libros

Lista todos los libros.

No requiere autenticación.

---

## GET /api/v1/libros/:id

Obtiene un libro por ID.

Debe responder:

* 200
* 404

---

## PUT /api/v1/libros/:id

Actualiza un libro.

Requiere autenticación.

Debe validar todas las reglas de negocio.

---

## DELETE /api/v1/libros/:id

Elimina un libro.

Requiere autenticación.

---

## GET /api/v1/quotes/csv

Ruta dedicada que consume la API:

```text
https://zenquotes.io/api/random
```

Debe:

* realizar múltiples solicitudes hasta obtener 15 citas;
* convertirlas a CSV;
* guardar el archivo localmente;
* devolver el CSV generado.

---

## Tabla de Endpoints

| Método | Ruta               | Descripción    | Auth |
| ------ | ------------------ | -------------- | ---- |
| POST   | /api/v1/libros     | Crear libro    | No   |
| GET    | /api/v1/libros     | Listar libros  | No   |
| GET    | /api/v1/libros/:id | Obtener libro  | No   |
| PUT    | /api/v1/libros/:id | Editar libro   | Sí   |
| DELETE | /api/v1/libros/:id | Eliminar libro | Sí   |
| GET    | /api/v1/quotes/csv | Generar CSV    | No   |

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

* Crear libro.
* Listar libros.
* Obtener libro.
* Update sin JWT (401 o 403).
* Update con JWT válido.
* Delete protegido.
* Endpoint `/quotes/csv`.

Incluir comentarios indicando cómo generar un JWT de prueba.

---

# 7. Organización sugerida

```text
proyecto-biblioteca-api
│
├── app.js
├── index.js
├── config/
│   └── index.js
├── controllers/
│   └── libroController.js
├── models/
│   └── libro.js
├── repository/
│   ├── libroRepositoryMongo.js
│   └── libroRepositoryJson.js
├── services/
│   ├── libroService.js
│   └── quotesService.js
├── routes/
│   └── libroRoutes.js
├── middlewares/
│   └── authMiddleware.js
├── database/
│   ├── database.json
│   └── quotes_15.csv
├── tests/
│   └── test.endpoints.http
└── package.json
```

---

# 8. Consume y guarda CSV

La ruta:

```text
GET /api/v1/quotes/csv
```

debe:

* consumir la API

```text
https://zenquotes.io/api/random
```

* obtener 15 citas;
* generar un CSV con las columnas:

```text
author
quote
```

* guardar el archivo

```text
quotes_15.csv
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

Ejemplo

```text
PORT=3000
JWT_SECRET=supersecret
DB_PROVIDER=mongo
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
* Consumo de APIs externas.
* Generación de CSV.
* Calidad del código.
* Buenas prácticas.
* Funcionamiento completo de las pruebas.
