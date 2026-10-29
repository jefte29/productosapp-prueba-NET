import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ?? "http://localhost:5033";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const allowedMethods = new Set(["GET", "POST", "PUT", "DELETE"]);

function isAllowedPath(path: string[]): boolean {
  if (path[0] === "auth") {
    return path.length === 2 && ["login", "register", "me", "logout"].includes(path[1]);
  }

  if (path[0] === "productos") {
    return (
      path.length === 1 ||
      (path.length === 2 && path[1] === "reporte") ||
      (path.length === 2 &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          path[1]
        ))
    );
  }

  return path.length === 2 && path[0] === "chat" && path[1] === "ask";
}

function safeResponseHeaders(upstream: Response): Headers {
  const headers = new Headers({ "cache-control": "no-store" });
  for (const name of ["content-type", "content-disposition", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function stripToken(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => key.toLowerCase() !== "token")
  );
}

function isSecureRequest(request: NextRequest): boolean {
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();

  return (
    process.env.NODE_ENV === "production" ||
    request.nextUrl.protocol === "https:" ||
    forwardedProtocol === "https"
  );
}

function hasSameOrigin(request: NextRequest, origin: string): boolean {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  const host = forwardedHost ?? request.headers.get("host");
  const protocol =
    request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      .trim() ?? request.nextUrl.protocol.replace(":", "");

  if (!host) {
    return origin === request.nextUrl.origin;
  }

  try {
    return new URL(origin).origin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const method = request.method.toUpperCase();

  if (!allowedMethods.has(method)) {
    return NextResponse.json({ message: "Método no permitido." }, { status: 405 });
  }

  if (!isAllowedPath(path)) {
    return NextResponse.json({ message: "Ruta no encontrada." }, { status: 404 });
  }

  const origin = request.headers.get("origin");
  if (method !== "GET") {
    const fetchSite = request.headers.get("sec-fetch-site");
    const isSameOriginRequest =
      fetchSite === "same-origin" ||
      (!fetchSite && origin !== null && hasSameOrigin(request, origin));

    if (!isSameOriginRequest) {
      return NextResponse.json({ message: "Origen no permitido." }, { status: 403 });
    }
  }

  const backendUrl = new URL(
    path.map((segment) => encodeURIComponent(segment)).join("/"),
    `${API_BASE_URL.replace(/\/+$/, "")}/api/`
  );
  backendUrl.search = request.nextUrl.search;

  const requestHeaders = new Headers();
  const contentType = request.headers.get("content-type");
  const token = request.cookies.get("token")?.value;
  if (contentType) requestHeaders.set("content-type", contentType);
  if (token) requestHeaders.set("cookie", `token=${token}`);

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl, {
      method,
      headers: requestHeaders,
      body: method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de la API." },
      { status: 502 }
    );
  }

  if (
    upstream.ok &&
    path[0] === "auth" &&
    (path[1] === "login" || path[1] === "register")
  ) {
    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      return NextResponse.json(
        { message: "La API devolvió una respuesta de autenticación inválida." },
        { status: 502 }
      );
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { message: "La API devolvió una respuesta de autenticación inválida." },
        { status: 502 }
      );
    }

    const authData = data as Record<string, unknown>;
    const response = NextResponse.json(stripToken(authData), {
      status: upstream.status,
    });

    if (path[1] === "login") {
      const token = authData.token ?? authData.Token;
      if (typeof token !== "string" || token.length === 0) {
        return NextResponse.json(
          { message: "La API no devolvió un token de sesión válido." },
          { status: 502 }
        );
      }

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: isSecureRequest(request),
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
    }

    return response;
  }

  const headers = safeResponseHeaders(upstream);
  const body = upstream.status === 204 ? null : await upstream.arrayBuffer();
  const response = new NextResponse(body, {
    status: upstream.status,
    headers,
  });

  if (path[0] === "auth" && path[1] === "logout") {
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: isSecureRequest(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
