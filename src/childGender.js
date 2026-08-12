export const CHILD_GENDERS = ["boy", "girl"];
export const DEFAULT_CHILD_GENDER = "boy";
export const CHILD_GENDER_STORAGE_KEY = "tada-child-gender";

export const CHILD_GENDER_OPTIONS = [
  { id: "boy", label: "Boy", emoji: "👦" },
  { id: "girl", label: "Girl", emoji: "👧" },
];

export function isChildGender(value) {
  return CHILD_GENDERS.includes(value);
}

export function loadStoredChildGender() {
  if (typeof window === "undefined") return DEFAULT_CHILD_GENDER;
  try {
    const stored = window.localStorage.getItem(CHILD_GENDER_STORAGE_KEY);
    if (isChildGender(stored)) return stored;
  } catch {
    // ignore storage errors
  }
  return DEFAULT_CHILD_GENDER;
}

export function saveChildGender(gender) {
  if (typeof window === "undefined" || !isChildGender(gender)) return;
  try {
    window.localStorage.setItem(CHILD_GENDER_STORAGE_KEY, gender);
  } catch {
    // ignore storage errors
  }
}
