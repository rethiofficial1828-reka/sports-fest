import { NextRequest } from "next/server";

export function generateCsrfToken(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

export function validateCsrf(request: Request | NextRequest, csrfTokenCookie: string | undefined): boolean {
  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfHeader || !csrfTokenCookie) {
    return false;
  }
  return csrfHeader === csrfTokenCookie;
}
