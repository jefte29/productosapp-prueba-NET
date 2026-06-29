using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductosApp.Api.Data;
using ProductosApp.Api.DTOs.Productos;

namespace ProductosApp.Api.Controllers
{
    [ApiController]
    [Route("api/productos")]
    [Authorize] // Todos los endpoints requieren JWT válido
    public class ProductosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductosController(AppDbContext context)
        {
            _context = context;
        }

        // -----------------------------------------------
        // GET /api/productos/reporte
        // Genera PDF con listado de productos activos. Usuarios autenticados (Admin y Usuario).
        // Si se especifica `ruta`, también guarda el PDF en disco en esa ubicación.
        // -----------------------------------------------
        [HttpGet("reporte")]
        [Authorize(Roles = "Admin,Usuario")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetReporte()
        {
            var productos = await _context.Productos
                .Where(p => p.Estado == true)
                .OrderBy(p => p.Nombre)
                .ToListAsync();

            var doc = new ProductosApp.Api.Reports.ProductosReportDocument(productos);
            var pdfBytes = doc.GeneratePdf();

            return File(pdfBytes, "application/pdf", "productos_activos.pdf");
        }

        // -----------------------------------------------
        // GET /api/productos
        // Parámetros opcionales de query:
        //   search  → texto libre para buscar por nombre o por ID (Guid)
        //   estado  → filtra por estado: true (activo) / false (inactivo). Si se omite, devuelve solo activos.
        //   page    → número de página (base 1, por defecto 1)
        //   pageSize→ registros por página (por defecto 10, máximo 100)
        // -----------------------------------------------
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<ProductoResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProductos(
            [FromQuery] string? search,
            [FromQuery] bool? estado,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = _context.Productos.AsQueryable();

            query = estado.HasValue
                ? query.Where(p => p.Estado == estado.Value)
                : query.Where(p => p.Estado == true);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchText = search.Trim();

                if (Guid.TryParse(searchText, out var productoId))
                {
                    query = query.Where(p => p.Id == productoId);
                }
                else
                {
                    query = query.Where(p => p.Nombre.Contains(searchText));
                }
            }

            var total = await query.CountAsync();

            var productos = await query
                .OrderBy(p => p.Nombre)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductoResponse
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Estado = p.Estado,
                    FechaCreacion = p.FechaCreacion,
                    UsuarioCreacionId = p.UsuarioCreacionId
                })
                .ToListAsync();

            var resultado = new PagedResult<ProductoResponse>
            {
                Pagina = page,
                Tamano = pageSize,
                Total = total,
                Datos = productos
            };

            return Ok(resultado);
        }

        // -----------------------------------------------
        // GET /api/productos/{id}
        // Busca un producto activo por su Guid. Retorna 404 si no existe o si está inactivo.
        // -----------------------------------------------
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(ProductoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProducto(Guid id)
        {
            var producto = await _context.Productos
                .Where(p => p.Id == id && p.Estado == true)
                .Select(p => new ProductoResponse
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Estado = p.Estado,
                    FechaCreacion = p.FechaCreacion,
                    UsuarioCreacionId = p.UsuarioCreacionId
                })
                .FirstOrDefaultAsync();

            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado." });
            }

            return Ok(producto);
        }

        // -----------------------------------------------
        // POST /api/productos
        // Crea un nuevo producto usando el claim sub del JWT como UsuarioCreacionId.
        // -----------------------------------------------
        [HttpPost]
        [ProducesResponseType(typeof(ProductoResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateProducto([FromBody] CreateProductoRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var usuarioCreacionId))
            {
                return Unauthorized(new { message = "Usuario no identificado en el token." });
            }

            var producto = new Models.Producto
            {
                Id = Guid.NewGuid(),
                Nombre = request.Nombre.Trim(),
                Descripcion = request.Descripcion?.Trim(),
                Precio = request.Precio,
                Estado = true,
                FechaCreacion = DateTime.UtcNow,
                UsuarioCreacionId = usuarioCreacionId
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            var response = new ProductoResponse
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Estado = producto.Estado,
                FechaCreacion = producto.FechaCreacion,
                UsuarioCreacionId = producto.UsuarioCreacionId
            };

            return CreatedAtAction(nameof(GetProducto), new { id = producto.Id }, response);
        }

        // -----------------------------------------------
        // PUT /api/productos/{id}
        // Actualiza nombre, descripción y precio. Solo Admin.
        // -----------------------------------------------
        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ProductoResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProducto(Guid id, [FromBody] UpdateProductoRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var producto = await _context.Productos.FirstOrDefaultAsync(p => p.Id == id && p.Estado == true);
            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var usuarioModificacionId))
            {
                return Unauthorized(new { message = "Usuario no identificado en el token." });
            }

            producto.Nombre = request.Nombre.Trim();
            producto.Descripcion = request.Descripcion?.Trim();
            producto.Precio = request.Precio;
            producto.UsuarioModificacionId = usuarioModificacionId;
            producto.FechaModificacion = DateTime.UtcNow;

            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();

            var response = new ProductoResponse
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Estado = producto.Estado,
                FechaCreacion = producto.FechaCreacion,
                UsuarioCreacionId = producto.UsuarioCreacionId
            };

            return Ok(response);
        }

        // -----------------------------------------------
        // DELETE /api/productos/{id}
        // Borrado lógico: marca Estado = false. Solo Admin.
        // -----------------------------------------------
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProducto(Guid id)
        {
            var producto = await _context.Productos.FirstOrDefaultAsync(p => p.Id == id && p.Estado == true);
            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var usuarioModificacionId))
            {
                return Unauthorized(new { message = "Usuario no identificado en el token." });
            }

            producto.Estado = false;
            producto.UsuarioModificacionId = usuarioModificacionId;
            producto.FechaModificacion = DateTime.UtcNow;

            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
