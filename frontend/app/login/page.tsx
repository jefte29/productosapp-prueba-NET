"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { Footer } from "../../components/ui/Footer";
import { authService } from "../../services/authService";
import { useAuth } from "@/hooks/useAuth";
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5033";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Introduce un formato de correo electrónico válido.";
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/inventario");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-center">
        <p className="font-body-md text-body-md text-on-surface">Cargando sesión...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSuccessMessage("");
    setErrors({});

 try {

  const data = await authService.login({
    email,
    password,
  });

  setSuccessMessage(`¡Bienvenido ${data.nombre}! Redirigiendo...`);

  window.location.href = "/inventario";

}
catch (error) {

  if (error instanceof Response) {

    const errorData = await error.json().catch(() => null);

    if (error.status === 401) {
      setErrors({
        email: errorData?.message ?? "Credenciales inválidas.",
      });
    }
    else if (error.status === 400) {
      setErrors({
        email: errorData?.message ?? "Solicitud inválida.",
      });
    }
    else {
      setErrors({
        email:
          errorData?.message ??
          "Error al iniciar sesión. Inténtalo de nuevo.",
      });
    }

    return;
  }

  setErrors({
    email: "Error de conexión. Inténtalo de nuevo más tarde.",
  });

}
finally {

  setIsLoading(false);

}
}
  const mailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

   const lockIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
  // Toggle button for password visibility para visualizar la contraseña
  const passwordVisibilityToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-outline hover:text-primary transition-colors focus:outline-none"
      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
  
  return (
    <div className="flex min-h-screen flex-col bg-surface font-inter">
      <main className="flex flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="w-full max-w-[480px]">
          <Card className="flex flex-col items-center w-full p-md sm:p-lg md:p-xl">
          <Logo />
          
          {successMessage ? (
            <div className="w-full p-md bg-tertiary-container/10 border border-tertiary/20 text-tertiary rounded-lg text-center font-body-md mb-md animate-fade-in">
              {successMessage}
            </div>
          ) : null}

          {/* Login Form */}
          <form className="w-full space-y-lg" onSubmit={handleSubmit}>
            {/* Email Field */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="nombre@empresa.com"
              leftIcon={mailIcon}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              disabled={isLoading}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="••••••••"
                leftIcon={lockIcon}
                rightIcon={passwordVisibilityToggle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
                disabled={isLoading}
              />
            </div>

            {/* Action Button */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-sm">
                  {/* Subtle spinner element */}
                  <svg
                    className="animate-spin h-5 w-5 text-on-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-lg pt-lg border-t border-outline-variant w-full text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register?from=login"
                className="font-label-md text-label-md text-primary hover:underline ml-xs font-semibold"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
