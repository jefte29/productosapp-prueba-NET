using System;

namespace ProductosApp.Api.Models
{
    public class Producto
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public bool Estado { get; set; } = true; // true = Activo, false = Inactivo (Borrado lógico)

        // Relación con el usuario creador (Obligatorio)
        public Guid UsuarioCreacionId { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Relación con el usuario modificador (Opcional, nullable)
        public Guid? UsuarioModificacionId { get; set; }
        public DateTime? FechaModificacion { get; set; }

        // Propiedades de navegación
        public Usuario UsuarioCreacion { get; set; } = null!;
        public Usuario? UsuarioModificacion { get; set; }
    }
}
