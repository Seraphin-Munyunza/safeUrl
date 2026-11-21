// Settings used by the login code

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is missing in the .env file");
}

if (!jwtRefreshSecret) {
  throw new Error("JWT_REFRESH_SECRET is missing in the .env file");
}

export const JWT_SECRET: string = jwtSecret;
export const JWT_REFRESH_SECRET: string = jwtRefreshSecret;

// The access token lasts 5 minutes (60 x 5 seconds)
export const ACCESS_TOKEN_LIFETIME_SECONDS = 60 * 5;

// The refresh token lasts 7 days (60 x 60 x 24 x 7 seconds)
export const REFRESH_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7;