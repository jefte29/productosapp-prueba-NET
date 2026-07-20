# Prueba 1 - Sistema de Gestión de Productos

Aplicación Full Stack desarrollada como prueba en .NET

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
| Swagger | http://localhost:5033/swagger |
| SQL Server | localhost:1433 |

---

## Usuario administrador inicial

La aplicación crea automáticamente un usuario administrador durante el primer inicio.

Correo:

```text
superadmin@productosapp.com
```

Contraseña:

```text
SuperAdmin2026!
```

---

## Variables de entorno

El proyecto utiliza las siguientes variables:

- MSSQL_SA_PASSWORD
- SQLSERVER_PORT
- BACKEND_PORT
- FRONTEND_PORT
- NEXT_PUBLIC_API_BASE_URL
- JWT_KEY
- JWT_ISSUER
- JWT_AUDIENCE

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
