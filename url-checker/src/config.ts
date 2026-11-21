// All backend addresses live here.
// If your backend paths are different, change them in this one file only.
const BASE_URL = "http://localhost:5000/api";

export const SIGNUP_URL = BASE_URL + "/auth/signup";
export const LOGIN_URL = BASE_URL + "/auth/login";
export const REFRESH_URL = BASE_URL + "/auth/refresh";
export const LOGOUT_URL = BASE_URL + "/auth/logout";
export const CHECK_URL = BASE_URL + "/urls/check";