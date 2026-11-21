import { env } from "../config/env";

const GOOGLE_API_URL =
  "https://safebrowsing.googleapis.com/v4/threatMatches:find";

const THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
] as const;

interface GoogleThreat {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threat: {
    url: string;
  };
  cacheDuration: string;
}

interface GoogleSafeBrowsingResponse {
  matches?: GoogleThreat[];
}

export const checkUrl = async (url: string) => {
  const response = await fetch(
    `${GOOGLE_API_URL}?key=${env.googleSafeBrowsingApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: {
          clientId: "safe-url-checker",
          clientVersion: "1.0.0",
        },

        threatInfo: {
          threatTypes: THREAT_TYPES,
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),

      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data =
    (await response.json()) as GoogleSafeBrowsingResponse;

  const matches = data.matches ?? [];

  return {
    url,
    isSafe: matches.length === 0,
    status: matches.length === 0 ? "SAFE" : "UNSAFE",
    threats: matches.map((match) => ({
      threatType: match.threatType,
      platformType: match.platformType,
      threatEntryType: match.threatEntryType,
      threatUrl: match.threat.url,
    })),
  };
};