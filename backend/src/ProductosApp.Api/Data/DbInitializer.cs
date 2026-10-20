using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ProductosApp.Api.Models;

namespace ProductosApp.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context, IConfiguration configuration)
        {
            context.Database.Migrate();

            var adminRoleId = Guid.Parse("A1111111-1111-1111-1111-111111111111");
            var usuarioRoleId = Guid.Parse("B2222222-2222-2222-2222-222222222222");

            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Rol
                    {
                        Id = adminRoleId,
                        Nombre = "Admin",
                        Descripcion = "Administrador del sistema"
                    },
                    new Rol
                    {
                        Id = usuarioRoleId,
                        Nombre = "Usuario",
                        Descripcion = "Usuario estándar"
                    }
                );
                context.SaveChanges();
            }

            var adminRole = context.Roles.SingleOrDefault(role => role.Nombre == "Admin")
                ?? throw new InvalidOperationException("El rol Admin no está configurado.");

            if (context.Usuarios.Any(user => user.RolId == adminRole.Id))
            {
                return;
            }

            var email = configuration["InitialAdmin:Email"]?.Trim().ToLowerInvariant();
            var password = configuration["InitialAdmin:Password"];

            if (string.IsNullOrWhiteSpace(email) ||
                email.Length > 256 ||
                !new EmailAddressAttribute().IsValid(email))
            {
                throw new InvalidOperationException("Configura un correo válido para InitialAdmin:Email.");
            }

            if (string.IsNullOrWhiteSpace(password) ||
                password.Length < 12 ||
                Encoding.UTF8.GetByteCount(password) > 72)
            {
                throw new InvalidOperationException(
                    "InitialAdmin:Password debe tener al menos 12 caracteres y no superar 72 bytes UTF-8.");
            }

            if (context.Usuarios.Any(user => user.Email.ToLower() == email))
            {
                throw new InvalidOperationException(
                    "El correo configurado para el administrador inicial ya pertenece a otro usuario.");
            }

            context.Usuarios.Add(new Usuario
            {
                Id = Guid.NewGuid(),
                Nombre = "Administrador inicial",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                RolId = adminRole.Id,
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            });

            context.SaveChanges();
        }
    }
}
