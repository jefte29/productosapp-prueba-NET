using System;

namespace ProductosApp.Api.DTOs.Productos
{
    public class ProductoResponse
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public bool Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public Guid UsuarioCreacionId { get; set; }
    }
}
