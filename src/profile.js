// The profile is local to this browser. It is not an online account.
export function cleanName(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 60);
}
export function readProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("forest-profile"));
    return typeof profile?.name === "string" && cleanName(profile.name)
      ? { name: cleanName(profile.name) }
      : null;
  } catch {
    return null;
  }
}
export function saveProfile(profile) {
  localStorage.setItem("forest-profile", JSON.stringify(profile));
}
