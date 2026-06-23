# API RESTful con Node.js

## Descripción

API RESTful con autenticación JWT que permite obtener frases aleatorias de una API externa y gestionar favoritos en memoria.

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

## Ejecución

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Endpoints

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | /api/v1/auth/login | No | Iniciar sesión |
| GET | /api/v1/quotes/random | JWT | Obtener frase aleatoria |
| POST | /api/v1/quotes/favorites | JWT | Agregar a favoritos |
| GET | /api/v1/quotes/favorites | JWT | Listar favoritos |
| DELETE | /api/v1/quotes/favorites/:id | JWT | Eliminar favorito |

## Usuario de prueba

- Username: `alumno`
- Password: `123456`

## Pruebas

Usar archivos HTTP en la carpeta `tests/` con extensión VS Code HTTP Client o similar.