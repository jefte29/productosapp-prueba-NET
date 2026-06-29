using System.ComponentModel.DataAnnotations;

namespace ProductosApp.Api.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        [MaxLength(128)]
        public string Password { get; set; } = null!;
    }
}
