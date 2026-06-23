using Microsoft.EntityFrameworkCore;
using ProductosApp.Api.Models;

namespace ProductosApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Rol> Roles { get; set; } = null!;
        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<Producto> Productos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Configuración de Roles
            modelBuilder.Entity<Rol>(entity =>
            {
                entity.ToTable("Roles");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Nombre).IsRequired().HasMaxLength(50);
                entity.HasIndex(r => r.Nombre).IsUnique();
            });

            // 2. Configuración de Usuarios
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Estado).IsRequired().HasDefaultValue(true);
                entity.Property(u => u.FechaCreacion).IsRequired().HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(u => u.Email).IsUnique();

                // Relación Usuario -> Rol (1 a muchos)
                entity.HasOne(u => u.Rol)
                      .WithMany(r => r.Usuarios)
                      .HasForeignKey(u => u.RolId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // 3. Configuración de Productos
            modelBuilder.Entity<Producto>(entity =>
            {
                entity.ToTable("Productos");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Nombre).IsRequired().HasMaxLength(150);
                entity.Property(p => p.Descripcion).HasColumnType("NVARCHAR(MAX)");
                entity.Property(p => p.Precio).IsRequired().HasPrecision(18, 2);
                entity.Property(p => p.Estado).IsRequired().HasDefaultValue(true);
                entity.Property(p => p.FechaCreacion).IsRequired().HasDefaultValueSql("GETUTCDATE()");

                // Relación Producto -> UsuarioCreacion (1 a muchos)
                entity.HasOne(p => p.UsuarioCreacion)
                      .WithMany(u => u.ProductosCreados)
                      .HasForeignKey(p => p.UsuarioCreacionId)
                      .OnDelete(DeleteBehavior.NoAction);

                // Relación Producto -> UsuarioModificacion (1 a muchos, opcional)
                entity.HasOne(p => p.UsuarioModificacion)
                      .WithMany(u => u.ProductosModificados)
                      .HasForeignKey(p => p.UsuarioModificacionId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
