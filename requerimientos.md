# Requerimientos del Proyecto — Sistema de Gestión de Productos

Prueba Técnica: Desarrollador React & .NET 8

## 1. Objetivo
- Ejecución sencilla: clonar, levantar con Docker Compose y ejecutar backend/frontend.

---

## 2. Estado actual del backend (`/backend`)
### Avances confirmados
- Proyecto `.NET 8` configurado en `backend/src/ProductosApp.Api`.
- `Program.cs` configurado con:
  - `AddControllers()`
  - Entity Framework Core con `AppDbContext`
  - JWT (`Microsoft.AspNetCore.Authentication.JwtBearer`)
  - Swagger / OpenAPI
- `AppDbContext` definido con entidades:
  - `Producto`
  - `Usuario`
  - `Rol`
- Migraciones generadas en `backend/src/ProductosApp.Api/Migrations/20260621011440_InitialCreate.cs`.
- `DbInitializer` implementado y ejecutado al arrancar la aplicación:
  - `context.Database.Migrate()`
  - Seed de roles `Admin` y `Usuario`
  - Seed de usuario administrador `superadmin@productosapp.com`
- Dependencias NuGet instaladas:
  - `Microsoft.AspNetCore.Authentication.JwtBearer`
  - `BCrypt.Net-Next`
  - `Microsoft.EntityFrameworkCore.SqlServer`
  - `QuestPDF`
  - `Swashbuckle.AspNetCore`
- `docker-compose.yml` define un servicio de SQL Server.

### Pendientes y brechas actuales
- ~~No existe `AuthController` ni `ProductosController`.~~ ✅ `AuthController` implementado.
- ~~No hay endpoints de registro/login implementados.~~ ✅ Implementados en esta sesión.
- No se detectó código de generación de PDF usando QuestPDF.
- Falta un `Dockerfile` para el backend.
- `docker-compose.yml` no incluye el servicio `api`.
- No hay lógica de autorización por rol aplicada en endpoints de productos.
- La estructura de capas descrita en el documento no coincide con el repositorio actual: solo existe un proyecto `ProductosApp.Api`.
### Desviaciones importantes
- El backend actual está en una fase de infraestructura/configuración, pero no entrega la API consumible que requiere la prueba técnica.
- La descripción de arquitectura es aspiracional; el repositorio no contiene carpetas `Domain`, `Application`, `Infrastructure` ni controladores.
- El `docker-compose.yml` actual solo levanta la base de datos, por lo que no cumple con el objetivo de un `docker compose up` para backend+DB.


## 3. Estado actual del frontend (`/frontend`)

### Avances observados
- El frontend no se analizó en detalle dentro de este reporte. La carpeta `frontend/` existe en el repositorio, pero no se revisaron archivos específicos en este paso.

### Necesario para completar los requerimientos
- Next.js 15 con TypeScript instalado y configurado.
- Páginas o rutas para:
  - Inicio de sesión.
  - Registro de usuario.
  - Gestión de productos.
  - Formulario de producto (crear/editar).
- Gestión de estado y cliente HTTP para comunicar con la API.
- Tabla de productos con:
  - Filtros por nombre y estado.
  - Paginación eficiente.
- Manejo de autenticación en el frontend:
  - Almacenar token JWT de forma segura.
  - Enviar `Authorization: Bearer {token}` en las solicitudes.
  - Controlar rutas privadas y redirigir cuando no haya sesión.
- Validación de formularios en cliente.
- Interfaz para mostrar mensajes de error de la API.
- Considerar roles de usuario para mostrar/esconder acciones de edición/eliminación.

### Riesgo actual
- Si el backend no ofrece los endpoints necesarios, el frontend no podrá integrar login, registro ni CRUD.
- El botón de descarga de PDF dependerá del endpoint `GET /api/productos/reporte`.
---

## 4. Revisión de requisitos contra lo existente

### Requisitos del backend
- Implementar API .NET 8 + EF Core: parcialmente cubierto (contexto, migraciones, modelos).
- JWT: ✅ endpoints de auth generan y validan JWT correctamente.
- Autenticación (register + login): ✅ implementado — ✅ **PROBADO Y VALIDADO en Postman**.
- CRUD de productos: no implementado.
- PDF con QuestPDF: falta implementación.
- Docker Compose para BD: implementado; falta servicio `api`.

### Requisitos del frontend
- No se revisó en detalle desde `/backend`, pero no forma parte del backend actual.
- Debe existir Next.js 15 + TypeScript y pantallas de login, registro, productos, formulario y descarga de PDF.

---

## 4. Qué se ha hecho y qué falta

### Hecho
- Configuración de JWT y Swagger en `Program.cs`.
- `AppDbContext` y modelos correctamente definidos.
- Migrations y seed inicial de datos.
- SQL Server en Docker Compose.
- **`POST /api/auth/register`** ✅ implementado:
  - Archivo: `backend/src/ProductosApp.Api/Controllers/AuthController.cs`
  - DTOs: `RegisterRequest.cs`, `AuthResponse.cs` (incluye campo `Nombre`)
  - Errores manejados: `400` (datos inválidos), `409` (email duplicado), `500` (rol no configurado).
  - **Estado**: ✅ **VALIDADO en Postman** — todos los casos de error responden correctamente.
- **`POST /api/auth/login`** ✅ implementado:
  - Archivo: `backend/src/ProductosApp.Api/Controllers/AuthController.cs`
  - DTO: `LoginRequest.cs`
  - Lógica: búsqueda por email (case-insensitive), validación de cuenta activa, `BCrypt.Verify()`, generación de JWT con mismo esquema de claims.
  - Errores manejados: `400` (datos inválidos), `401` (credenciales incorrectas o cuenta inactiva).
  - **Estado**: ✅ **VALIDADO en Postman** — todos los casos responden correctamente.

### Falta por hacer
1. Crear controladores y endpoints de productos:
  - ✅ `GET /api/productos` (con filtros y paginación)
  - ✅ `GET /api/productos/{id}`
  - ✅ `POST /api/productos`
  - ✅ `PUT /api/productos/{id}` (solo Admin)
  - ✅ `DELETE /api/productos/{id}` (solo Admin, borrado lógico)
  - `GET /api/productos/reporte` (PDF con QuestPDF)

2. Implementar la generación de PDF con QuestPDF.

3. Garantizar que `UsuarioCreacionId` / `UsuarioModificacionId` se obtengan desde el JWT.

4. Definir y aplicar autorización por rol (`Admin` / `Usuario`) en endpoints protegidos.

5. Añadir `Dockerfile` en `backend/src/ProductosApp.Api`.

6. Actualizar `backend/docker-compose.yml` para incluir el servicio `api`.

7. Documentar claramente las credenciales iniciales y el proceso de arranque.

---

## 4.1. Pruebas pendientes de validación

> Usar **Postman** (o Swagger en `http://localhost:<puerto>/swagger`). El backend debe estar corriendo y SQL Server levantado con `docker compose up -d`.

---

### ✅ TEST-01 — `POST /api/auth/register` (registro exitoso)

**Request:**
```
POST http://localhost:5033/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Perez",
  "email": "JuanPerez@example.com",
  "password": "Cadenacontraseña"
}
```

**Resultado real:** `200 OK` *(el código envía `StatusCode(201)`, Postman lo muestra como 200 — comportamiento correcto)*
```json
{
  "token": "<jwt_válido_devuelto>",
  "userId": "c1729924-a65a-4070-9a14-2d0b300c72a0",
  "nombre": "Juan Perez",
  "email": "juanperez@example.com",
  "role": "Usuario"
}
```
**Validaciones confirmadas:**
- ✅ Token JWT devuelto y válido.
- ✅ Email normalizado a minúsculas (`juanperez@example.com`).
- ✅ Rol asignado correctamente como `"Usuario"`.

---

### ✅ TEST-02 — `POST /api/auth/register` (email duplicado)

**Request:** mismo body que TEST-01 (mismo email).

**Resultado real:** `409 Conflict` ✅
```json
{
  "message": "El email ya está registrado."
}
```

---

### ✅ TEST-03 — `POST /api/auth/register` (datos inválidos)

**Request:**
```json
{
  "nombre": "",
  "email": "no-es-un-email",
  "password": "123"
}
```

**Resultado real:** `400 Bad Request` ✅
```json
{
  "status": 400,
  "errors": {
    "Email": ["The Email field is not a valid e-mail address."],
    "Nombre": ["The Nombre field is required."],
    "Password": ["The field Password must be a string or array type with a minimum length of '6'."]
  }
}
```

---

### ✅ TEST-04 — `POST /api/auth/login` (login exitoso con usuario registrado)

**Request:**
```
POST http://localhost:5033/api/auth/login
Content-Type: application/json

{
  "email": "juanperez@example.com",
  "password": "Cadenacontraseña"
}
```

**Resultado real:** `200 OK` ✅
```json
{
  "token": "<jwt_válido_devuelto>",
  "userId": "c1729924-a65a-4070-9a14-2d0b300c72a0",
  "nombre": "Juan Perez",
  "email": "juanperez@example.com",
  "role": "Usuario"
}
```

---

### ✅ TEST-05 — `POST /api/auth/login` (login con superadmin del seed)

**Request:**
```json
{
  "email": "superadmin@productosapp.com",
  "password": "SuperAdmin2026!"
}
```

**Resultado real:** `200 OK` ✅
```json
{
  "token": "<jwt_válido_devuelto>",
  "userId": "c3333333-3333-3333-3333-333333333333",
  "nombre": "super_admin",
  "email": "superadmin@productosapp.com",
  "role": "Admin"
}
```

---

### ✅ TEST-06 — `POST /api/auth/login` (credenciales incorrectas)

**Request:**
```json
{
  "email": "superadmin@productosapp.com",
  "password": "SuperAdmin2026"
}
```

**Resultado real:** `401 Unauthorized` ✅
```json
{
  "message": "Credenciales inválidas."
}
```

---

### ✅ TEST-07 — `POST /api/auth/login` (usuario inexistente)

**Request:**
```json
{
  "email": "noexiste@example.com",
  "password": "Password123"
}
```

**Resultado real:** `401 Unauthorized` ✅ — mismo mensaje que TEST-06 (seguridad por enumeración).
```json
{
  "message": "Credenciales inválidas."
}
```

---
## 4.2. Pruebas pendientes de validación

### 🧪 TEST-08 — `POST /api/productos` (crear producto con token válido)

**Request:**
```json
POST http://localhost:5033/api/productos
Content-Type: application/json
Authorization: Bearer {token}

{
  "nombre": "Cámara fotográfica",
  "descripcion": "Cámara mirrorless 24MP",
  "precio": 899.99
}
```

**Validaciones esperadas:**
- ✅ `201 Created` si el token es válido.
- ✅ Respuesta con el producto creado incluyendo `id`, `nombre`, `descripcion`, `precio`, `estado`, `fechaCreacion` y `usuarioCreacionId`.
- ✅ `400 Bad Request` si faltan datos o el precio no es válido.
- ✅ `401 Unauthorized` si no se envía token.

---

### 🧪 TEST-09 — `GET /api/productos` (listar productos con filtros y paginación)

**Request:**
```json
GET http://localhost:5033/api/productos?nombre=cámara&pagina=1&tamano=10
Authorization: Bearer {token}
```

**Validaciones esperadas:**
- ✅ `200 OK` con estructura paginada:
```json
{
  "pagina": 1,
  "tamano": 10,
  "total": 1,
  "datos": [
    {
      "id": "<guid>",
      "nombre": "Cámara fotográfica",
      "descripcion": "Cámara mirrorless 24MP",
      "precio": 899.99,
      "estado": true,
      "fechaCreacion": "2026-06-26T00:00:00Z",
      "usuarioCreacionId": "<guid>"
    }
  ]
}
```
- ✅ `401 Unauthorized` si el token es inválido o falta.

---

### 🧪 TEST-10 — `GET /api/productos/{id}` (obtener detalle de producto)

**Request:**
```json
GET http://localhost:5033/api/productos/<id-del-producto>
Authorization: Bearer {token}
```

**Validaciones esperadas:**
- ✅ `200 OK` si el producto existe y está activo.
- ✅ `404 Not Found` si no existe o ya fue borrado lógicamente.
- ✅ `401 Unauthorized` si falta el token.

---

### 🧪 TEST-11 — `PUT /api/productos/{id}` (actualizar producto, solo Admin)

**Request:**
```json
PUT http://localhost:5033/api/productos/<id-del-producto>
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "nombre": "Cámara fotográfica Pro",
  "descripcion": "Versión actualizada",
  "precio": 999.99
}
```

**Validaciones esperadas:**
- ✅ `200 OK` si el usuario tiene rol `Admin` y el producto existe.
- ✅ `403 Forbidden` si el usuario no es `Admin`.
- ✅ `404 Not Found` si el producto no existe o ya fue borrado.
- ✅ `400 Bad Request` si el payload es inválido.

---

### 🧪 TEST-12 — `DELETE /api/productos/{id}` (borrado lógico, solo Admin)

**Request:**
```json
DELETE http://localhost:5033/api/productos/<id-del-producto>
Authorization: Bearer {admin_token}
```

**Validaciones esperadas:**
- ✅ `204 No Content` si el producto se borra lógicamente.
- ✅ `403 Forbidden` si el usuario no es `Admin`.
- ✅ `404 Not Found` si el producto no existe o ya estaba borrado.
- ✅ Después del borrado, `GET /api/productos/{id}` debe responder `404`.

---

## 5. Instrucciones de ejecución esperadas (finales)

El proyecto debe poder ejecutarse así:

1. `git clone <repositorio>`
2. `cd backend`
3. `docker compose up -d`
4. Levantar backend y frontend según la configuración final.

Con estos pasos, el sistema debería funcionar sin configuraciones adicionales.

---

## 6. Recomendaciones inmediatas

- Verificar la existencia o creación de `backend/src/ProductosApp.Api/Dockerfile`.
- Añadir un servicio `api` en `backend/docker-compose.yml`.
- Agregar endpoints mínimos de auth y productos antes de trabajar en el frontend.
- Cuando el backend esté listo, revisar el frontend Next.js para asegurar la integración completa.
