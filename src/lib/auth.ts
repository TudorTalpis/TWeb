// Simple session management using localStorage
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "auth_user_id";
const USER_ROLE_KEY = "auth_user_role";
const USER_NAME_KEY = "auth_user_name";
const USER_EMAIL_KEY = "auth_user_email";

export interface SessionData {
  token: string;
  userId: string;
  role: string;
  name: string;
  email: string;
}

export function saveSession(data: SessionData): void {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_ID_KEY, data.userId);
  localStorage.setItem(USER_ROLE_KEY, data.role);
  localStorage.setItem(USER_NAME_KEY, data.name);
  localStorage.setItem(USER_EMAIL_KEY, data.email);
}

export function getSession(): SessionData | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  const role = localStorage.getItem(USER_ROLE_KEY);
  const name = localStorage.getItem(USER_NAME_KEY);
  const email = localStorage.getItem(USER_EMAIL_KEY);

  if (token && userId && role && name && email) {
    return { token, userId, role, name, email };
  }
  return null;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
