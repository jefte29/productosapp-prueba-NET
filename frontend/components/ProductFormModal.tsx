import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Combobox } from "./ui/Combobox";
import { Button } from "./ui/Button";

export interface ProductData {
  id?: number;
  name: string;
  description: string;
  price: number;
  status: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductData) => void;
  initialData?: ProductData | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData;
  const title = isEditing ? "Editar Producto" : "Nuevo Producto";

  const [formData, setFormData] = useState<ProductData>({
    name: "",
    description: "",
    price: 0,
    status: "Activo",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: "",
          description: "",
          price: 0,
          status: "Activo",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const footerButtons = (
    <>
      <Button variant="secondary" onClick={onClose} type="button" className="w-auto px-5 py-2">
        Cancelar
      </Button>
      <Button onClick={handleSubmit} type="submit" className="w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
        {isEditing ? "Guardar Cambios" : "Crear Producto"}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footerButtons}>
      <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre del Producto"
          name="name"
          placeholder="Ej: Teclado Mecánico RGB"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <div className="space-y-xs w-full flex flex-col text-left">
          <label className="font-label-md text-label-md text-on-surface-variant transition-colors duration-200">
            Descripción
          </label>
          <textarea
            name="description"
            placeholder="Describe los detalles principales del producto..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full py-2 px-3 bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all duration-200 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Precio ($)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.price || ""}
            onChange={handleChange}
            required
          />
          
          <div className="relative">
            <Combobox
              label="Estado"
              value={formData.status}
              options={[
                { label: "Activo", value: "Activo" },
                { label: "Poco Stock", value: "Poco Stock" },
                { label: "Agotado", value: "Agotado" },
              ]}
              onChange={handleStatusChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
