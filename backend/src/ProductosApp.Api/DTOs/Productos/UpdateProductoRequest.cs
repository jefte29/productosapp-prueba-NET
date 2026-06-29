using System.ComponentModel.DataAnnotations;

namespace ProductosApp.Api.DTOs.Productos
{
    public class UpdateProductoRequest
    {
        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = null!;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Range(0.01, 1000000)]
        public decimal Precio { get; set; }
    }
}
