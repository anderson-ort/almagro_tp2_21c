# **Seguridad, Documentación y Versionado en APIs**

### **Arquitectura de una API profesional**

---

## 🔐 Seguridad

* **Autenticación:** identidad del usuario
* **Autorización:** permisos y roles
* **Mecanismos:**

  * **JWT:** usuarios autenticados (stateless, expira)
  * **x-api-key:** integraciones y administración
* **Protecciones adicionales:**

  * Rate Limiting (anti abuso)
  * HTTPS obligatorio

---

## 📄 Documentación

* **OpenAPI (OAS):** contrato de la API
* **Herramientas:**

  * Swagger → estándar
  * Scalar → moderna
* **Objetivo:**

  * Entender endpoints
  * Facilitar integración
  * Evitar errores

---

## 🔄 Versionado

* **Estrategia:** `/api/v1`, `/api/v2`
* **Cuándo aplicar:** cambios *breaking*
* **Objetivo:** no romper clientes existentes

---

## ⚙️ Implementación (Proyecto)

* Flujo: **Login → Token → Request protegida**
* Uso de **middlewares**:

  * JWT
  * API Key
  * Logging

---


| Bloque        | Tema                 | Concepto clave                      | Para qué sirve                         | Punto crítico                            |
| ------------- | -------------------- | ----------------------------------- | -------------------------------------- | ---------------------------------------- |
| Seguridad     | Autenticación        | Verificar identidad del usuario     | Saber quién hace la request            | Sin esto, la API es pública              |
| Seguridad     | Autorización         | Definir permisos                    | Controlar qué puede hacer cada usuario | Evita accesos indebidos                  |
| Seguridad     | x-api-key            | Clave estática en headers           | Integraciones M2M / admin              | No identifica usuarios, rotación manual  |
| Seguridad     | JWT                  | Token firmado con datos del usuario | Sesiones sin estado                    | No guardar datos sensibles en el payload |
| Seguridad     | Estructura JWT       | Header + Payload + Signature        | Garantizar integridad                  | Payload es legible (no cifrado)          |
| Seguridad     | Expiración           | Tokens con tiempo de vida           | Limitar riesgo ante filtraciones       | Usar access corto + refresh largo        |
| Seguridad     | Estrategia combinada | JWT + API Key                       | Separar usuarios de administración     | Mejora el modelo de seguridad            |
| Seguridad     | Rate Limiting        | Límite de requests por IP           | Prevenir abuso y ataques               | Balance entre seguridad y UX             |
| Documentación | OpenAPI (OAS)        | Especificación estándar             | Definir contrato de la API             | Base para herramientas automáticas       |
| Documentación | Swagger              | Generación automática + UI          | Visualizar y testear endpoints         | Depende de comentarios bien definidos    |
| Documentación | Scalar               | UI moderna para APIs                | Mejor experiencia de uso               | Alternativa más actual que Swagger UI    |
| Documentación | Contrato API         | Definición clara de endpoints       | Alinear backend y frontend             | Evita errores de integración             |
| Versionado    | Versionado por path  | /api/v1, /api/v2                    | Mantener compatibilidad                | Fundamental en cambios breaking          |
| Versionado    | Cambios breaking     | Modificaciones incompatibles        | Justifican nueva versión               | No versionar cambios menores             |
| Proyecto      | Flujo autenticación  | Login → Token → Requests            | Ciclo completo de uso                  | Base para cualquier app real             |
| Proyecto      | Middleware           | Interceptar requests                | Centralizar lógica (auth, logs, etc.)  | Orden de ejecución importa               |
| Proyecto      | Logging              | Registro de requests                | Debug y monitoreo                      | Clave para producción                    |


