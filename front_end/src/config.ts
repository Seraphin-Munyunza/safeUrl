// All backend addresses live here.
// On your computer the backend is at localhost:5000.
// After deployment, the address comes from the VITE_API_URL setting on Netlify.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SIGNUP_URL = BASE_URL + "/auth/signup";
export const LOGIN_URL = BASE_URL + "/auth/login";
export const REFRESH_URL = BASE_URL + "/auth/refresh";
export const LOGOUT_URL = BASE_URL + "/auth/logout";
export const CHECK_URL = BASE_URL + "/urls/check";
export const ME_URL = BASE_URL + "/users/me";
export const PASSWORD_URL = BASE_URL + "/users/me/password";
export const HISTORY_URL = BASE_URL + "/history";