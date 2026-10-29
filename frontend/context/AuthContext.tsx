"use client";

import { createContext, useState, useEffect, useCallback, useRef } from "react";
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
  const refreshRequest = useRef<Promise<void> | null>(null);
  const historyLogoutRequest = useRef<Promise<void> | null>(null);

  const refreshUser = useCallback(async () => {
    if (refreshRequest.current) return refreshRequest.current;

    setLoading(true);
    refreshRequest.current = authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        refreshRequest.current = null;
      });

    return refreshRequest.current;
  }, []);

  const logoutAfterHistoryNavigation = useCallback(async () => {
    if (historyLogoutRequest.current) return historyLogoutRequest.current;

    setLoading(true);
    setUser(null);
    historyLogoutRequest.current = authService
      .logout()
      .catch(() => {
        console.error("No se pudo cerrar la sesión al volver a login desde el historial.");
      })
      .finally(() => {
        setLoading(false);
        historyLogoutRequest.current = null;
      });

    return historyLogoutRequest.current;
  }, []);

  useEffect(() => {
    const isBackForwardNavigation = () => {
      const navigationEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;
      return navigationEntry?.type === "back_forward";
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      const restoredFromHistory = event.persisted || isBackForwardNavigation();
      if (restoredFromHistory && window.location.pathname === "/login") {
        void logoutAfterHistoryNavigation();
      }
    };

    const handlePopState = () => {
      if (window.location.pathname === "/login") {
        void logoutAfterHistoryNavigation();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    if (window.location.pathname === "/login" && isBackForwardNavigation()) {
      queueMicrotask(() => void logoutAfterHistoryNavigation());
    } else {
      queueMicrotask(() => void refreshUser());
    }

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [logoutAfterHistoryNavigation, refreshUser]);


  async function logout() {
     try {

    await authService.logout();

    setUser(null);

  } catch {

    console.error("No se pudo completar el cierre de sesión.");

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