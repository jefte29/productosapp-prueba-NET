using System;
using System.Collections.Generic;

namespace ProductosApp.Api.Models
{
    public class Usuario
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public Guid RolId { get; set; }
        public bool Estado { get; set; } = true; // true = Activo, false = Inactivo/Desactivado
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación
        public Rol Rol { get; set; } = null!;
        
        // Colección de productos que este usuario creó
        public ICollection<Producto> ProductosCreados { get; set; } = new List<Producto>();
        
        // Colección de productos que este usuario modificó
        public ICollection<Producto> ProductosModificados { get; set; } = new List<Producto>();
    }
}
