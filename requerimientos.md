# Requerimientos del Proyecto — Sistema de Gestión de Productos

Prueba Técnica: Desarrollador React & .NET 8

## 1. Objetivo

Desarrollar una aplicación web para la gestión de productos con:
- Autenticación y autorización basada en JWT.
- CRUD completo de productos.
- Generación de reportes PDF.
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
- No se encontraron controladores en `backend/src/ProductosApp.Api`.
- No existe `AuthController` ni `ProductosController`.
- No hay endpoints de registro/login implementados.
- No hay CRUD de productos implementado.
- No se detectó código de generación de PDF usando QuestPDF.
- Falta un `Dockerfile` para el backend.
- `docker-compose.yml` no incluye el servicio `api`.
- No hay lógica de autorización por rol aplicada en endpoints.
- La estructura de capas descrita en el documento no coincide con el repositorio actual: solo existe un proyecto `ProductosApp.Api`.

### Desviaciones importantes
- El backend actual está en una fase de infraestructura/configuración, pero no entrega la API consumible que requiere la prueba técnica.
- La descripción de arquitectura es aspiracional; el repositorio no contiene carpetas `Domain`, `Application`, `Infrastructure` ni controladores.
- El `docker-compose.yml` actual solo levanta la base de datos, por lo que no cumple con el objetivo de un `docker compose up` para backend+DB.

---

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
  - Botón para descargar reporte en PDF.
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
- JWT: cubierto en configuración, pero no hay endpoints que lo usen.
- CRUD de productos: no implementado.
- PDF con QuestPDF: falta implementación.
- Migraciones automáticas y carga inicial: implementado.
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

### Falta por hacer
1. Añadir `Dockerfile` en `backend/src/ProductosApp.Api`.
2. Actualizar `backend/docker-compose.yml` para incluir el servicio `api`.
3. Crear controladores y endpoints:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/productos`
   - `GET /api/productos/{id}`
   - `POST /api/productos`
   - `PUT /api/productos/{id}`
   - `DELETE /api/productos/{id}`
   - `GET /api/productos/reporte`
4. Implementar la generación de PDF con QuestPDF.
5. Garantizar que el token JWT contenga los claims necesarios y que `UsuarioCreacionId` / `UsuarioModificacionId` se obtengan desde el token.
6. Definir y aplicar autorización por rol (`Admin` / `Usuario`).
7. Documentar claramente las credenciales iniciales y el proceso de arranque.

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
