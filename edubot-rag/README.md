
[Parcial demo](https://raw.githubusercontent.com/anderson-ort/tp_almagro_21_d/refs/heads/main/parciales/parcial_10_2025.md)


--- 

Challenge 

**Card: API básica con Healthcheck y persistencia en JSON**

**Objetivo**
Desarrollar un server API que exponga endpoints para verificación de estado y persistencia de datos en un archivo JSON externo.

**Requerimientos**

1. **Healthcheck**

   * Endpoint: `GET /health`
   * Respuesta esperada: `200 OK` con un payload simple (ej: `{ status: "ok" }`)

2. **Persistencia en JSON**

   * Endpoint: `POST /data`
   * Funcionalidad: recibir datos en el body y guardarlos en el archivo:

     ```
     https://raw.githubusercontent.com/Andru-1987/challenge-aero-terra/refs/heads/main/backend-aero-terra/data/barrios.json
     ```
   * Considerar validación básica del payload

3. **Lectura de datos**

   * Endpoint: `GET /data`
   * Funcionalidad: retornar todo el contenido actualizado del archivo JSON

**Criterios de aceptación**

* El endpoint `/health` responde correctamente
* El endpoint `POST /data` persiste información sin romper la estructura del JSON
* El endpoint `GET /data` devuelve los datos actualizados
* Manejo básico de errores (ej: archivo no disponible, JSON inválido)




TASK -> 
   - Tener la posibilidad de tener algun historial de peticiones a GEMINI 
   - Tener el store de cada chat con la respuesta a la API
   

