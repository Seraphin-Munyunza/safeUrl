// Small helpers to save, read and remove the login tokens and the user's name in cookies

// All cookies stay for 7 days (60 x 60 x 24 x 7 seconds), the same as the refresh token.
// The server decides when a token is no longer valid, not the cookie.
const COOKIE_SECONDS = 60 * 60 * 24 * 7;

function saveCookie(name: string, value: string) {
  document.cookie = name + "=" + value + "; path=/; max-age=" + COOKIE_SECONDS + "; SameSite=Lax";
}

function readCookie(name: string): string {
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(name + "=")) {
      return part.substring(name.length + 1);
    }
  }
  return "";
}

function deleteCookie(name: string) {
  document.cookie = name + "=; path=/; max-age=0";
}

export function saveTokens(accessToken: string, refreshToken: string) {
  saveCookie("accessToken", accessToken);
  saveCookie("refreshToken", refreshToken);
}

export function getAccessToken(): string {
  return readCookie("accessToken");
}

export function getRefreshToken(): string {
  return readCookie("refreshToken");
}

// The first name is used for the welcome message
export function saveUserName(name: string) {
  saveCookie("userName", encodeURIComponent(name));
}

export function getUserName(): string {
  const value = readCookie("userName");

  if (value === "") {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function removeTokens() {
  deleteCookie("accessToken");
  deleteCookie("refreshToken");
  deleteCookie("userName");
}