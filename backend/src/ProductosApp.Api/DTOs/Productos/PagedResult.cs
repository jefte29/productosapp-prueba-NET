namespace ProductosApp.Api.DTOs.Productos
{
    /// <summary>
    /// Resultado paginado genérico para cualquier colección de datos.
    /// </summary>
    public class PagedResult<T>
    {
        /// <summary>Número de página actual (base 1).</summary>
        public int Pagina { get; set; }

        /// <summary>Cantidad de registros por página.</summary>
        public int Tamano { get; set; }

        /// <summary>Total de registros que cumplen el filtro (sin paginar).</summary>
        public int Total { get; set; }

        /// <summary>Registros de la página actual.</summary>
        public IEnumerable<T> Datos { get; set; } = [];
    }
}
