/**
 * Calculates renewal expiration date using max(current_expires_at, now) + plan days.
 * Prevents users from losing prepaid days when renewing early.
 */
export function calculateRenewalDate(
  currentExpiresAt: string | null | undefined,
  plan: string
): { startsAt: string; expiresAt: string } {
  const now = new Date();
  const daysToAdd = plan === "anual" ? 365 : 30;

  // Base date: if subscription hasn't expired yet, extend from current expiry
  let baseDate = now;
  if (currentExpiresAt) {
    const currentExpiry = new Date(currentExpiresAt);
    if (currentExpiry > now) {
      baseDate = currentExpiry;
    }
  }

  const expiresAt = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  return {
    startsAt: now.toISOString().split("T")[0],
    expiresAt: expiresAt.toISOString().split("T")[0],
  };
}
