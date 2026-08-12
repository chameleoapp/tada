import { deleteFromStore, getAllFromStore, putInStore } from "./idb.js";
import { cloneItems, createPresetOutfit } from "./outfitCatalog.js";

const STORE = "customOutfits";

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function listCustomOutfits() {
  const outfits = await getAllFromStore(STORE);
  return outfits.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCustomOutfit(outfit) {
  const payload = {
    ...outfit,
    source: "custom",
    items: cloneItems(outfit.items ?? []),
    updatedAt: Date.now(),
  };
  await putInStore(STORE, payload);
  return payload;
}

export async function deleteCustomOutfit(id) {
  await deleteFromStore(STORE, id);
}

export async function createCustomOutfit({ name, items }) {
  const outfit = {
    id: createId(),
    name: name.trim() || "My outfit",
    source: "custom",
    items: cloneItems(items),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return saveCustomOutfit(outfit);
}

export async function duplicateFromPreset(weatherKey, name, gender = "boy") {
  const preset = createPresetOutfit(weatherKey, gender);
  return createCustomOutfit({
    name: name ?? `${preset.name} copy`,
    items: preset.items,
  });
}
