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

        public async Task<List<ProductoResponse>> GetAllProductsAsync()
        {
            return await _context.Productos
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

        public async Task<List<ProductoResponse>> GetActiveProductsAsync()
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

        public async Task<List<ProductoResponse>> GetInactiveProductsAsync()
        {
            return await _context.Productos
                .Where(p => p.Estado == false)
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

        public async Task<int> CountActiveAsync()
        {
            return await _context.Productos.CountAsync(p => p.Estado == true);
        }

        public async Task<int> CountInactiveAsync()
        {
            return await _context.Productos.CountAsync(p => p.Estado == false);
        }

        public async Task<List<ProductoResponse>> SearchByNameAsync(string search)
        {
            var query = _context.Productos.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchText = search.Trim();
                query = query.Where(p => p.Nombre.Contains(searchText));
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

        public async Task<ProductoResponse?> GetProductByIdAsync(Guid id)
        {
            return await _context.Productos
                .Where(p => p.Id == id)
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
    }
}
