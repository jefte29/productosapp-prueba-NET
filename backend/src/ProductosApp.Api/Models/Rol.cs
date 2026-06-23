using System;
using System.Collections.Generic;

namespace ProductosApp.Api.Models
{
    public class Rol
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }

        // Propiedad de navegación (Un Rol tiene muchos Usuarios)
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
