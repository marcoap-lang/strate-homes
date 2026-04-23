export function getAuthRedirectUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (explicitUrl) {
    return `${explicitUrl.replace(/\/$/, "")}/admin`;
  }

  return typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined;
}

export function getReadableAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Tu correo todavía no está confirmado. Revisa tu inbox y vuelve a intentar.";
  }

  if (normalized.includes("user already registered")) {
    return "Ese correo ya está registrado. Intenta iniciar sesión.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  return "No se pudo completar la acción. Intenta de nuevo.";
}
