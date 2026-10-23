import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5033";

export default async function InventarioLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p role="alert">No se pudo verificar tu sesión. Inténtalo de nuevo más tarde.</p>
      </main>
    );
  }

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p role="alert">No se pudo verificar tu sesión. Inténtalo de nuevo más tarde.</p>
      </main>
    );
  }

  return children;
}
