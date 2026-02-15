/**
 * Migrate guest localStorage data after signup/login.
 * Clears guest tracking keys. WT Beta taste data (logflix_profile_v1, etc.)
 * is kept as-is since it's used by the standalone WT feature.
 *
 * Call once after confirming a valid session exists.
 */
const MIGRATION_KEY = "logflix_guest_migrated";

export function migrateGuestData(): boolean {
  try {
    // Already migrated
    if (localStorage.getItem(MIGRATION_KEY)) return false;

    const hadGuestData =
      localStorage.getItem("logflix_guest_actions") !== null ||
      localStorage.getItem("logflix_guest_wt_used") !== null;

    if (!hadGuestData) return false;

    // Clear guest tracking keys
    localStorage.removeItem("logflix_guest_actions");
    localStorage.removeItem("logflix_guest_wt_used");

    // Mark as migrated so this doesn't run again
    localStorage.setItem(MIGRATION_KEY, "1");

    return true;
  } catch {
    return false;
  }
}
