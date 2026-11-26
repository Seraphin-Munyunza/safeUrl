import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_SAFE_BROWSING_API_KEY is missing");
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  googleSafeBrowsingApiKey: apiKey,
};