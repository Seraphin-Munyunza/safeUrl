import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { prisma } from "./db";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_LIFETIME_SECONDS,
  REFRESH_TOKEN_LIFETIME_SECONDS,
} from "./config";

// We save a scrambled copy (hash) of the refresh token in the database,
// so nobody can use the tokens if the database is ever leaked
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Creates the short token (5 minutes) used on every request
export function createAccessToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME_SECONDS,
  });
}

// Creates the long token (7 days) and saves its hash in the database
export async function createRefreshToken(userId: number): Promise<string> {
  // jwtid gives every refresh token a different random id
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME_SECONDS,
    jwtid: randomUUID(),
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(token),
      userId: userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME_SECONDS * 1000),
    },
  });

  return token;
}

// Deletes a refresh token from the database.
// Gives back true if it was found (and not expired), false if it was not.
export async function deleteRefreshToken(token: string): Promise<boolean> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
    },
  });

  return result.count > 0;
}