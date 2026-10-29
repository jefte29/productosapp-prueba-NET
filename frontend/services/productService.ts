// frontend/services/productService.ts encapsulando la llamada al backend.
//import { Product, PagedResult, ProductFilters } from "@/types/product";

import { ProductResponse, ProductData,PagedResult,ProductFilters,} from "@/types/product";


class ProductService {

  async getProducts(
    filters: ProductFilters = {} ): Promise<PagedResult<ProductData>>{

        const params = new URLSearchParams();
        //const result: PagedResult<ProductResponse> = await response.json();

        if (filters.search) {
        params.append("search", filters.search);
        }

        if (filters.estado !== undefined) {
        params.append("estado", String(filters.estado));
        }

        params.append("page", String(filters.page ?? 1));
        params.append("pageSize", String(filters.pageSize ?? 10));

        const response = await fetch(
        `/api/productos?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
        );

        if (!response.ok) {
        throw response;
        }

        //return response.json();
        const result: PagedResult<ProductResponse> = await response.json();
        const mappedProducts: ProductData[] = result.datos.map((product) => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            status: product.estado ? "Activo" : "Inactivo",
        }));
        return { ...result, datos: mappedProducts };
  }

  async updateProduct(id: string, data: ProductData): Promise<ProductData> {
    const response = await fetch(`/api/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        Nombre: data.name,
        Descripcion: data.description,
        Precio: data.price,
        Estado: data.status,
      }),
    });

    if (!response.ok) {
      throw response;
    }

    const result: ProductResponse = await response.json();
    return {
      id: result.id,
      name: result.nombre,
      description: result.descripcion,
      price: result.precio,
      status: result.estado ? "Activo" : "Inactivo",
    };
  }

  async createProduct(data: ProductData): Promise<ProductData> {
    const response = await fetch("/api/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        Nombre: data.name,
        Descripcion: data.description,
        Precio: data.price,
        Estado: data.status,
      }),
    });

    if (!response.ok) {
      throw response;
    }

    const result: ProductResponse = await response.json();
    return {
      id: result.id,
      name: result.nombre,
      description: result.descripcion,
      price: result.precio,
      status: result.estado ? "Activo" : "Inactivo",
    };
  }

  async downloadReport(filters: Omit<ProductFilters, "page" | "pageSize">): Promise<void> {
    const params = new URLSearchParams();

    if (filters.search) {
      params.append("search", filters.search);
    }

    if (filters.estado !== undefined) {
      params.append("estado", String(filters.estado));
    }

    const response = await fetch(
      `/api/productos/reporte?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw response;
    }

    const blob = await response.blob();//para Lee el resultado como un archivo binario
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_productos.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const productService = new ProductService();