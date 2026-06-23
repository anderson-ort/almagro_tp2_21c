# Examen Final Taller de Programación 2

**Docente a cargo**

* *Anderson Ocana*
* Correo electrónico: [aocana@ort.edu.ar](mailto:aocana@ort.edu.ar)

---

# Objetivo

Desarrollar una **API RESTful** utilizando **Node.js con Express** para gestionar el inventario de insumos médicos de un hospital.

La API deberá permitir administrar los insumos disponibles y generar un archivo CSV utilizando información obtenida desde una API pública.

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

* Editar insumo.
* Eliminar insumo.

---

## 3. Entidad obligatoria: Insumo (CRUD completo)

### Campos

| Campo              | Tipo            | Requerido                |
| ------------------ | --------------- | ------------------------ |
| id                 | UUID u ObjectId | generado automáticamente |
| nombre             | string          | Sí                       |
| cantidadDisponible | integer         | Sí                       |
| fechaIngreso       | date ISO8601    | No                       |

Si no se recibe `fechaIngreso`, deberá asignarse automáticamente la fecha actual con formato:

```text
YYYY-MM-DD
```

---

### Reglas de negocio

Al crear un insumo:

* `nombre` no puede ser vacío.
* `cantidadDisponible` debe ser un entero mayor o igual a cero.

Durante el **PUT**:

El campo `cantidadDisponible` solamente podrá:

* permanecer igual, o
* incrementarse exactamente en **1 unidad** respecto del valor almacenado.

Ejemplo:

Valor actual:

```text
25
```

Valores válidos:

```text
25
26
```

Valores inválidos:

```text
24
30
100
```

Las respuestas de error deberán ser estandarizadas.

---

# 4. Endpoints

## POST /api/v1/insumos

Crea un insumo.

No requiere autenticación.

Respuesta:

```http
201 Created
```

---

## GET /api/v1/insumos

Lista todos los insumos.

No requiere autenticación.

---

## GET /api/v1/insumos/:id

Obtiene un insumo por ID.

Debe responder:

* 200
* 404

---

## PUT /api/v1/insumos/:id

Actualiza un insumo.

Requiere autenticación.

Debe validar todas las reglas de negocio.

---

## DELETE /api/v1/insumos/:id

Elimina un insumo.

Requiere autenticación.

---

## GET /api/v1/personajes/csv

Ruta dedicada que consume la API:

```text
https://dragonball-api.com/api/characters
```

La ruta deberá obtener los primeros **15 personajes**, convertirlos a formato CSV, almacenarlos localmente y devolver el archivo generado.

---

## Tabla de Endpoints

| Método | Ruta                   | Descripción             | Auth |
| ------ | ---------------------- | ----------------------- | ---- |
| POST   | /api/v1/insumos        | Crear insumo            | No   |
| GET    | /api/v1/insumos        | Listar insumos          | No   |
| GET    | /api/v1/insumos/:id    | Obtener insumo          | No   |
| PUT    | /api/v1/insumos/:id    | Editar insumo           | Sí   |
| DELETE | /api/v1/insumos/:id    | Eliminar insumo         | Sí   |
| GET    | /api/v1/personajes/csv | Descarga/generación CSV | No   |

---

# 5. Validaciones y formato de errores

Formato obligatorio:

```json
{
  "statusCode": 400,
  "error": "Mensaje descriptivo"
}
```

---

# 6. Tests (manuales/semiautomáticos)

Crear el archivo:

```text
tests/test.endpoints.http
```

Debe contener ejemplos de:

* Crear insumo.
* Listar insumos.
* Obtener insumo por ID.
* Intento de actualización sin autenticación (401/403).
* Actualización con JWT válido.
* Eliminación protegida.
* Endpoint `/personajes/csv`.

Agregar comentarios indicando cómo generar un JWT de prueba.

---

# 7. Organización del proyecto (sugerida)

```bash
proyecto-hospital-api/
├── app.js
├── index.js
├── config/
│   └── index.js
├── controllers/
│   └── insumoController.js
├── models/
│   └── insumo.js
├── repository/
│   ├── insumoRepositoryMongo.js
│   └── insumoRepositoryJson.js
├── routes/
│   └── insumoRoutes.js
├── services/
│   ├── personajeService.js
│   └── insumoService.js
├── middlewares/
│   └── authMiddleware.js
├── tests/
│   └── test.endpoints.http
├── database/
│   ├── database.json
│   └── personajes_15.csv
└── package.json
```

---

# 8. Consume y guarda CSV

La ruta:

```http
GET /api/v1/personajes/csv
```

debe:

* Consumir:

```text
https://dragonball-api.com/api/characters
```

* Recuperar los primeros **15 personajes**.
* Convertirlos a CSV.
* Guardar el archivo:

```text
personajes_15.csv
```

Columnas mínimas:

```text
id
name
race
gender
ki
maxKi
affiliation
```

Finalmente deberá:

* responder con `Content-Type: text/csv`, o
* permitir la descarga del archivo generado.

---

# 9. Entrega

Repositorio (GitHub/GitLab/Bitbucket).

Debe incluir:

## Archivo README.md

Con instrucciones para ejecutar el proyecto utilizando:

* MongoDB.
* JSON.

Además deberá indicar:

* instalación;
* variables de entorno;
* comandos de ejecución;
* comandos de prueba.

---

## Archivo de entrega

```txt
### Entrega Final Taller de Programación

* nombre_alumno: <NOMBRE_APELLIDO>
* link: Repositorio
* Variables de entorno:
```

Ejemplo:

```env
PORT=3000
JWT_SECRET=supersecret
DB_PROVIDER=mongo
```

---

## Consideraciones de evaluación

Se evaluará:

* Correcta arquitectura por capas.
* Separación de responsabilidades.
* Implementación del patrón Repository.
* Uso correcto de Express.
* Implementación del middleware JWT.
* Validaciones.
* Manejo de errores.
* Correcto uso de códigos HTTP.
* Persistencia.
* Consumo de APIs externas.
* Transformación de datos JSON a CSV.
* Escritura de archivos.
* Organización del proyecto.
* Calidad del código.
* Buenas prácticas.
* Funcionamiento de las pruebas.
