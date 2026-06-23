using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ProductosApp.Api.Models;

namespace ProductosApp.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // 1. Ejecutar migraciones automáticas al iniciar la aplicación
            context.Database.Migrate();

            // Definición de los IDs fijos (coincidentes con el script database.sql)
            var adminRolId = Guid.Parse("A1111111-1111-1111-1111-111111111111");
            var usuarioRolId = Guid.Parse("B2222222-2222-2222-2222-222222222222");
            var superAdminId = Guid.Parse("C3333333-3333-3333-3333-333333333333");

            // 2. Sembrar Roles si no existen
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Rol
                    {
                        Id = adminRolId,
                        Nombre = "Admin",
                        Descripcion = "Rol de Administrador con privilegios completos de lectura, escritura, edición y eliminación."
                    },
                    new Rol
                    {
                        Id = usuarioRolId,
                        Nombre = "Usuario",
                        Descripcion = "Rol de Usuario estándar con permisos de lectura y creación de productos."
                    }
                );
                context.SaveChanges();
            }

            // 3. Sembrar Usuario Administrador Inicial si no existe
            if (!context.Usuarios.Any(u => u.Email == "superadmin@productosapp.com"))
            {
                context.Usuarios.Add(new Usuario
                {
                    Id = superAdminId,
                    Nombre = "super_admin",
                    Email = "superadmin@productosapp.com",
                    // Hash BCrypt de "SuperAdmin2026!" generado previamente
                    PasswordHash = "$2a$11$NJ5yFWjCgVi.lGwJCFvKZOTTF5ArM23Im/1tUYtrtwg8LL2iMuZRW",
                    RolId = adminRolId,
                    Estado = true,
                    FechaCreacion = DateTime.UtcNow
                });
                context.SaveChanges();
            }
        }
    }
}
