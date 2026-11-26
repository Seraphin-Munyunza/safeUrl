import { prisma } from "./db";

// The part of the check result that we save
type CheckResult = {
  url: string;
  isSafe: boolean;
  status: string;
  threats?: { threatType: string }[];
};

// Saves a check in the user's history.
// If this user already checked the same link, the old entry is updated with the new result.
// If saving fails, we only write the error in the terminal, so the check itself still works.
export async function saveCheck(userId: number, result: CheckResult) {
  try {
    // Very long links are not saved
    if (result.url.length > 2000) {
      return;
    }

    const threatTypes = (result.threats || []).map((threat) => threat.threatType);

    await prisma.urlCheck.upsert({
      where: { userId_url: { userId: userId, url: result.url } },
      update: {
        isSafe: result.isSafe,
        status: result.status,
        threatTypes: { set: threatTypes },
        checkedAt: new Date(),
      },
      create: {
        userId: userId,
        url: result.url,
        isSafe: result.isSafe,
        status: result.status,
        threatTypes: threatTypes,
      },
    });
  } catch (error) {
    console.log("Could not save the check to the history:", error);
  }
}