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

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "Ese correo ya está registrado. Intenta iniciar sesión.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (normalized.includes("signup is disabled")) {
    return "El registro está deshabilitado temporalmente.";
  }

  return "No se pudo completar la acción. Intenta de nuevo.";
}

export function getReadableSignupResult({
  hasSession,
  hasUser,
  identitiesCount,
}: {
  hasSession: boolean;
  hasUser: boolean;
  identitiesCount: number;
}) {
  if (hasSession) {
    return {
      kind: "signed-in",
      message: "Tu cuenta fue creada y tu sesión ya está lista.",
    } as const;
  }

  if (hasUser && identitiesCount === 0) {
    return {
      kind: "existing-user",
      message: "Ese correo ya existe. Inicia sesión con tu contraseña.",
    } as const;
  }

  if (hasUser) {
    return {
      kind: "created-no-session",
      message: "Tu cuenta fue creada. Ahora inicia sesión con tu correo y contraseña.",
    } as const;
  }

  return {
    kind: "unknown",
    message: "No pudimos confirmar el alta de la cuenta. Intenta iniciar sesión o vuelve a registrarte.",
  } as const;
}
