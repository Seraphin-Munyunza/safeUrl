import { REFRESH_URL } from "./config";
import { getAccessToken, getRefreshToken, saveTokens, removeTokens } from "./auth";

// Sends the request with the access token in the header
async function sendRequest(url: string, method: string, body?: object): Promise<Response> {
  return await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAccessToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Asks the backend for new tokens. Gives back true if it worked.
async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (refreshToken === "") {
    return false;
  }

  try {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });

    if (!response.ok) {
      // 401 means the refresh token is not valid any more, so the user must log in again
      if (response.status === 401) {
        removeTokens();
      }
      return false;
    }

    const data = await response.json();
    saveTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// Works like fetch (GET, POST, PATCH...), but:
// if the access token has expired (401), it gets new tokens and tries one more time.
export async function authFetch(url: string, method: string, body?: object): Promise<Response> {
  const response = await sendRequest(url, method, body);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshTokens();

  if (!refreshed) {
    return response;
  }

  return await sendRequest(url, method, body);
}

// A shortcut for POST requests (the check page uses this one)
export async function authPost(url: string, body: object): Promise<Response> {
  return await authFetch(url, "POST", body);
}