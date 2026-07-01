using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductosApp.Api.Data;
using ProductosApp.Api.DTOs.Auth;
using ProductosApp.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

namespace ProductosApp.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST /api/auth/register
        [HttpPost("register")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Verificar que el email no exista (normalizado a minúsculas)
            var emailNormalizado = request.Email.ToLowerInvariant();
            var emailExistente = await _context.Usuarios
                .AnyAsync(u => u.Email.ToLower() == emailNormalizado);

            if (emailExistente)
                return Conflict(new { message = "El email ya está registrado." });

            // Buscar el rol 'Usuario' por defecto
            var rolUsuario = await _context.Roles
                .FirstOrDefaultAsync(r => r.Nombre == "Usuario");

            if (rolUsuario is null)
                return StatusCode(500, new { message = "El rol 'Usuario' no está configurado en el sistema." });

            // Hash seguro de contraseña con BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Crear el nuevo usuario
            var nuevoUsuario = new Usuario
            {
                Nombre = request.Nombre,
                Email = emailNormalizado,
                PasswordHash = passwordHash,
                RolId = rolUsuario.Id,
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            // Generar JWT con claims: sub (UserId), email, role.
            var token = GenerarToken(nuevoUsuario, rolUsuario.Nombre);

            var response = new LoginResponse
            {
                Token = token,
                UserId = nuevoUsuario.Id,
                Nombre = nuevoUsuario.Nombre,
                Email = nuevoUsuario.Email,
                Role = rolUsuario.Nombre
            };

            return StatusCode(201, response);
        }

        // POST /api/auth/login
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Buscar el usuario por email (normalizado a minúsculas)
            var emailNormalizado = request.Email.ToLowerInvariant();
            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);

            if (usuario is null)
                return Unauthorized(new { message = "Credenciales inválidas." });

            // Validar que el usuario esté activo
            if (!usuario.Estado)
                return Unauthorized(new { message = "La cuenta está desactivada." });

            // Validar contraseña con BCrypt
            var passwordValida = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);

            if (!passwordValida)
                return Unauthorized(new { message = "Credenciales inválidas." });

            // Generar JWT con claims: sub (UserId), email, role
            var token = GenerarToken(usuario, usuario.Rol.Nombre);

            var response = new LoginResponse
            {
                Token = token,
                UserId = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Role = usuario.Rol.Nombre
            };

            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1),
                Path = "/"
            });

            return Ok(response);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            });

            return Ok(new { message = "Sesión cerrada." });
        }

        // GET /api/auth/me devuelve los claims del usuario autenticado
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var name = User.FindFirst(ClaimTypes.Name)?.Value;

            if (sub == null)
                return Unauthorized();

            var response = new CurrentUserResponse
            {
                UserId = Guid.Parse(sub),
                Nombre = name ?? "",
                Email = email ?? "",
                Role = role ?? ""
            };

            return Ok(response);
        }

        // -----------------------------------------------
        // Método privado: genera el token JWT
        // -----------------------------------------------
        private string GenerarToken(Usuario usuario, string rolNombre)
        {
            var jwtKey = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key no está configurado.");
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Role, rolNombre),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
