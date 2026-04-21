import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const DASHBOARD_SESSION_COOKIE = "dashboard_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function signDashboardToken(adminId: string): Promise<string> {
  return new SignJWT({ adminId, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export type DashboardJwtPayload = {
  adminId: string;
  role: string;
};

export async function verifyDashboardToken(token: string): Promise<DashboardJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const adminId = payload.adminId as string | undefined;
    const role = payload.role as string | undefined;
    if (!adminId || role !== "admin") return null;
    return { adminId, role };
  } catch {
    return null;
  }
}

function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const prefix = `${name}=`;
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

/**
 * Read `dashboard_session` JWT from a Request (API routes) or from Next cookies (Server Components).
 */
export async function getSession(request?: Request): Promise<{ adminId: string } | null> {
  let token: string | null | undefined;
  if (request) {
    token = parseCookieHeader(request.headers.get("cookie"), DASHBOARD_SESSION_COOKIE);
  } else {
    token = cookies().get(DASHBOARD_SESSION_COOKIE)?.value;
  }
  if (!token) return null;
  const payload = await verifyDashboardToken(token);
  if (!payload) return null;
  return { adminId: payload.adminId };
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
