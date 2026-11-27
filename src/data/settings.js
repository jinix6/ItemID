import { SOURCE_OPTIONS, DISPLAY_OPTIONS } from "../config.js";

const STORAGE_KEY = "itemid.settings";

const defaults = Object.fromEntries(
  [...SOURCE_OPTIONS, ...DISPLAY_OPTIONS].map((option) => [option.key, true]),
);

export const settings = { ...defaults };

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (const key of Object.keys(defaults)) {
      if (typeof raw[key] === "boolean") settings[key] = raw[key];
    }
  } catch {}
}

export function setSetting(key, value) {
  settings[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function isEnabled(key) {
  return settings[key] !== false;
}
