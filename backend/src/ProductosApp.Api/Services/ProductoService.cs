using Microsoft.EntityFrameworkCore;
using ProductosApp.Api.Data;
using ProductosApp.Api.DTOs.Productos;

namespace ProductosApp.Api.Services
{
    public class ProductoService
    {
        private readonly AppDbContext _context;

        public ProductoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductoResponse>> GetAllAsync()
        {
            return await _context.Productos
                .Where(p => p.Estado == true)
                .OrderBy(p => p.Nombre)
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
        }

        public async Task<ProductoResponse?> GetByIdAsync(Guid id)
        {
            return await _context.Productos
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
        }

        public async Task<List<ProductoResponse>> SearchAsync(string? search)
        {
            var query = _context.Productos.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchText = search.Trim();
                query = query.Where(p => p.Estado == true && p.Nombre.Contains(searchText));
            }
            else
            {
                query = query.Where(p => p.Estado == true);
            }

            return await query
                .OrderBy(p => p.Nombre)
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
        }

        public async Task<int> CountAsync()
        {
            return await _context.Productos.CountAsync(p => p.Estado == true);
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Productos.AnyAsync(p => p.Id == id && p.Estado == true);
        }
    }
}
