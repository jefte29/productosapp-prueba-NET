# # Prueba 1 Version 1.0 - Sistema de Gestión de Productos

Aplicación Full Stack desarrollada como prueba en .NET.

## Tecnologías utilizadas

- ASP.NET Core 8 Web API
- Entity Framework Core
- SQL Server 2022
- Next.js 16
- React 19
- Docker
- Docker Compose

---

## Requisitos

- Docker
- Docker Compose

No es necesario instalar SQL Server, .NET SDK ni Node.js para ejecutar la aplicación utilizando Docker.

---

## Ejecutar la aplicación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Prueba-Tecnica-1
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

Construir e iniciar todos los servicios:

```bash
docker compose up --build
```

---

## Servicios

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5033 |
| Swagger | http://localhost:5033/swagger (solo en Development) |
| SQL Server | localhost:1433 |

---

## Usuario administrador inicial

En una base de datos nueva, el seed crea automáticamente el primer administrador usando `InitialAdmin__Email` y `InitialAdmin__Password` del archivo local `.env`. La contraseña se guarda como hash BCrypt. El seed no cambia las credenciales de un administrador que ya exista.

El correo y la contraseña deben ser propios de cada entorno. No compartas el `.env` ni guardes estos valores en el repositorio. La contraseña inicial debe tener al menos 12 caracteres y no superar 72 bytes UTF-8.

`.env.example` contiene únicamente marcadores ficticios. Reemplázalos antes de iniciar la aplicación. Si `.env` ya existe, añade las variables que falten sin compartir sus valores. Para generar una clave JWT local de 32 bytes, puedes usar `openssl rand -hex 32` y guardar el resultado solo en `.env` como `Jwt__Key`.

Compose usa `Production` por defecto. Para habilitar Swagger en un entorno local de desarrollo:

```bash
ASPNETCORE_ENVIRONMENT=Development docker compose up --build
```

Si tu base local ya fue inicializada con el seed anterior, usa `docker compose down -v` solo si aceptas borrar todos los datos locales de SQL Server; luego inicia de nuevo para que se cree el administrador configurado. No ejecutes ese comando en un entorno con datos que necesites conservar.

---

## Variables de entorno

El proyecto utiliza las siguientes variables:

- MSSQL_SA_PASSWORD
- SQLSERVER_PORT
- BACKEND_PORT
- FRONTEND_PORT
- NEXT_PUBLIC_API_BASE_URL
- Jwt__Key
- Jwt__Issuer
- Jwt__Audience
- Gemini__ApiKey
- InitialAdmin__Email
- InitialAdmin__Password
- ConnectionStrings__DefaultConnection (para `dotnet run`)

Estas variables pueden modificarse en el archivo `.env`.

---

## Comandos útiles

Levantar los servicios:

```bash
docker compose up --build
```

Levantar en segundo plano:

```bash
docker compose up -d
```

Detener los servicios:

```bash
docker compose stop
```

Eliminar los contenedores:

```bash
docker compose down
```

Eliminar contenedores y reiniciar completamente la base de datos:

```bash
docker compose down -v
```

---

## Persistencia de datos

SQL Server utiliza un volumen de Docker (`sqlserver_data`) para conservar la información entre reinicios.

Si se desea iniciar nuevamente desde cero, basta con ejecutar:

```bash
docker compose down -v
```
