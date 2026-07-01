//base para todo lo demás (búsqueda, filtros, paginación, editar, eliminar, PDF, etc.).

export type ProductStatus = "Activo" | "Inactivo";
export interface ProductResponse {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacionId: string;
}

export interface ProductData {
  id?: string | number;
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
}

export interface PagedResult<T> {
  pagina: number;
  tamano: number;
  total: number;
  datos: T[];
}

export interface ProductFilters {
  search?: string;
  estado?: boolean;
  page?: number;
  pageSize?: number;
}


