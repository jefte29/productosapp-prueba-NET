type ApiErrorContext = "login" | "register" | "request";

const defaultMessages: Record<number, string> = {
  400: "Revisa los datos ingresados e inténtalo de nuevo.",
  401: "Tu sesión no es válida. Inicia sesión nuevamente.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se encontró el recurso solicitado.",
  409: "No se pudo completar la operación.",
};

export function getSafeApiErrorMessage(
  error: unknown,
  context: ApiErrorContext = "request",
  fallback = "No se pudo completar la solicitud. Inténtalo más tarde."
): string {
  if (!(error instanceof Response)) {
    return fallback;
  }

  if (context === "login" && error.status === 401) {
    return "Credenciales inválidas.";
  }

  if (context === "register" && error.status === 409) {
    return "La cuenta ya existe, por favor registre otra.";
  }

  if (error.status >= 500) {
    return "No se pudo completar la solicitud. Inténtalo más tarde.";
  }

  return defaultMessages[error.status] ?? fallback;
}
