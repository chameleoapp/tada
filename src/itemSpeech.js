import { getWeatherSets } from "./outfitCatalog.js";

/** Pronunciation hints for ElevenLabs / browser speech. */
const SPEECH_BY_NAME = {
  Panama: "Panama hat",
};

export function getItemSpeech(item) {
  const name = item?.speech || item?.name || "";
  return SPEECH_BY_NAME[name] || name;
}

export function speechKey(speech) {
  return String(speech)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getItemSoundKey(item) {
  return speechKey(getItemSpeech(item));
}

export function getItemSoundPath(item) {
  const key = getItemSoundKey(item);
  return key ? `/sounds/${key}.mp3` : "";
}

export function listItemSpeechEntries() {
  const seen = new Map();

  for (const gender of ["boy", "girl"]) {
    for (const set of Object.values(getWeatherSets(gender))) {
      for (const item of set.items) {
        const speech = getItemSpeech(item);
        const key = speechKey(speech);
        if (!key || seen.has(key)) continue;
        seen.set(key, {
          key,
          speech,
          itemId: item.id,
          name: item.name,
        });
      }
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}
