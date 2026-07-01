"use client";

import { createContext, useState, useEffect } from "react";
import { CurrentUser } from "@/types/auth";
import { authService } from "@/services/authService";
//zimport { createContext, useState, useEffect } from "react";

export interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean; //Esto evita que la aplicación "parpadee" mostrando contenido antes de saber si el usuario está autenticado
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;//POST /api/auth/logout eliminar cookie de sesión y actualizar el estado del contexto
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


//contenedor" del estado.
//Comparte el usuario con toda la aplicación
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(true);


  async function refreshUser() {
  try {
    const currentUser = await authService.getCurrentUser();

    setUser(currentUser);
  } catch (error) {
    setUser(null);
  } finally {
    setLoading(false);
  }
}


useEffect(() => {
  refreshUser();
}, []);


  async function logout() {
     try {

    await authService.logout();

    setUser(null);

  } catch(error) {

    console.error("Error cerrando sesión", error);

  }

  }

  return (
    <AuthContext.Provider //envolvue toda la aplicación y comparte el estado del usuario
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}