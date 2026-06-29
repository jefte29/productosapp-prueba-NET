"use client";

import React, { useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import { ProductFormModal, ProductData } from "@/components/ProductFormModal";

// Datos de prueba (Mock) actualizados
const INVENTORY_DATA = [
  { id: 1, name: "Laptop Pro 14\"", description: "Computadora portátil de alto rendimiento con 16GB RAM y 512GB SSD", price: 1299.0, status: "Activo" },
  { id: 2, name: "Silla Ergonómica", description: "Silla de oficina ergonómica con soporte lumbar ajustable", price: 249.5, status: "Inactivo" },
  { id: 3, name: "Monitor 4K 27\"", description: "Monitor ultra HD ideal para diseño gráfico y edición", price: 399.99, status: "Inactivo" },
  { id: 4, name: "Teclado Mecánico", description: "Teclado mecánico retroiluminado RGB con switches azules", price: 89.9, status: "Activo" },
  { id: 5, name: "Escritorio Elevable", description: "Escritorio con ajuste de altura motorizado de color blanco", price: 450.0, status: "Inactivo" },
  { id: 6, name: "Mouse Inalámbrico", description: "Mouse inalámbrico con batería de larga duración y sensor óptico", price: 45.0, status: "Activo" },
];

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inventoryData, setInventoryData] = useState<ProductData[]>(INVENTORY_DATA);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductData) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (data: ProductData) => {
    if (editingProduct) {
      // Edit existing
      setInventoryData((prev) => prev.map((p) => p.id === data.id ? { ...p, ...data } : p));
    } else {
      // Create new
      const newProduct = { ...data, id: Date.now() };
      setInventoryData((prev) => [newProduct, ...prev]);
    }
    handleCloseModal();
  };

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || statusFilter === "Todos" ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactivo":
        return "bg-red-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header de la página */}
        <header className="flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventario</h1>
              <p className="text-slate-500 mt-1">Gestión de Productos e inventario actual</p>
            </div>
            <AvatarMenu initials="JD" email="johndoe@empresa.com" role="Administrador" onLogout={() => console.log("Logout")} />
          </div>
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full">
            <Button variant="secondary" className="w-full sm:w-auto px-6 py-2.5 flex items-center gap-2 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Generar PDF
            </Button>
            <Button onClick={openCreateModal} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2 justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo producto
            </Button>
          </div>
        </header>

        {/* Panel de Filtros y Búsqueda */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput 
              placeholder="Buscar por nombre o descripción..." 
              value={searchTerm}
              onSearch={(v) => setSearchTerm(v)}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Combobox 
              label=""
              placeholder="Todos los estados"
              value={statusFilter}
              options={[
                { label: "Todos", value: "Todos" },
                { label: "Activo", value: "Activo" },
                //{ label: "Poco Stock", value: "Poco Stock" },
                { label: "Inactivo", value: "Inactivo" }
              ]}
              onChange={(v) => setStatusFilter(v)}
            />
          </div>
        </div>

        {/* Tabla de Inventario */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">NOMBRE</th>
                  <th className="py-4 px-6 min-w-[300px]">DESCRIPCIÓN</th>
                  <th className="py-4 px-6 text-right">PRECIO</th>
                  <th className="py-4 px-6 text-center">ESTADO</th>
                  <th className="py-4 px-6 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredData.length > 0 ? (
                  filteredData.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{product.name}</td>
                      <td className="py-4 px-6 text-slate-500 whitespace-normal break-words">{product.description}</td>
                      <td className="py-4 px-6 text-right font-medium">${product.price.toFixed(2)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => openEditModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l10.68-10.68z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
                            </svg>
                          </button>
                          <button onClick={() => setInventoryData(prev => prev.filter(p => p.id !== product.id))} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No se encontraron productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación (Visual) */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{filteredData.length > 0 ? 1 : 0}</span> a <span className="font-semibold text-slate-900">{filteredData.length}</span> de <span className="font-semibold text-slate-900">{INVENTORY_DATA.length}</span> productos
            </p>
            <div className="flex gap-1">
              <button disabled className="p-2 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed">
                Anterior
              </button>
              <button disabled className="p-2 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed">
                Siguiente
              </button>
            </div>
          </div>
        </div>

      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
}
