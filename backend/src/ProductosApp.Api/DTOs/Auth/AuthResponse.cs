namespace ProductosApp.Api.DTOs.Auth
{
    public class AuthResponse
    {
        public string Token { get; set; } = null!;
        public Guid UserId { get; set; }
        public string Nombre { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
