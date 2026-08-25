import { getItemSoundKey, getItemSoundPath, getItemSpeech } from "./itemSpeech.js";

const SOUND_INDEX_URL = "/sounds/index.json";

let sharedAudioContext;
let currentAudio;
let currentUtterance;
let soundIndexPromise;
let soundIndexSet = null;
let playGeneration = 0;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!sharedAudioContext) sharedAudioContext = new AudioContext();
  return sharedAudioContext;
}

function loadSoundIndex() {
  if (!soundIndexPromise) {
    soundIndexPromise = fetch(SOUND_INDEX_URL)
      .then((response) => (response.ok ? response.json() : { files: [] }))
      .then((data) => {
        soundIndexSet = new Set(
          (data.files ?? []).map((file) => String(file).replace(/\.mp3$/i, "")),
        );
        return soundIndexSet;
      })
      .catch(() => {
        soundIndexSet = new Set();
        return soundIndexSet;
      });
  }
  return soundIndexPromise;
}

if (typeof window !== "undefined") {
  loadSoundIndex();
}

function stopBrowserSpeech() {
  currentUtterance = null;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}

function stopFileAudio() {
  if (!currentAudio) return;
  currentAudio.onended = null;
  currentAudio.onerror = null;
  currentAudio.pause();
  currentAudio.src = "";
  currentAudio = null;
}

export function stopItemSpeech() {
  playGeneration += 1;
  stopFileAudio();
  stopBrowserSpeech();
}

export function unlockItemAudio() {
  if (typeof window === "undefined") return;
  loadSoundIndex();

  const ctx = getAudioContext();
  ctx?.resume?.().catch(() => {});

  try {
    window.speechSynthesis?.resume?.();
  } catch {
    // ignore
  }
}

function pickEnglishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    voices.find((voice) => /^en\b/i.test(voice.lang) && /female|child|girl|samantha|karen|moira|google us/i.test(voice.name)) ||
    voices.find((voice) => /^en-US\b/i.test(voice.lang)) ||
    voices.find((voice) => /^en\b/i.test(voice.lang)) ||
    null
  );
}

function speakWithBrowser(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

  stopBrowserSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.pitch = 1.05;
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function playSoundFile(url, fallbackText) {
  stopFileAudio();
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
  audio.onerror = () => {
    if (currentAudio === audio) currentAudio = null;
    speakWithBrowser(fallbackText);
  };
  audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
    speakWithBrowser(fallbackText);
  });
}

export async function playItemSpeech(item, { enabled = true } = {}) {
  if (!enabled || !item || typeof window === "undefined") return;

  const speech = getItemSpeech(item);
  if (!speech) return;

  const generation = ++playGeneration;
  stopFileAudio();
  stopBrowserSpeech();
  unlockItemAudio();

  const key = getItemSoundKey(item);

  if (!soundIndexSet) {
    speakWithBrowser(speech);
    const available = await loadSoundIndex();
    if (generation !== playGeneration) return;
    if (key && available.has(key)) {
      stopBrowserSpeech();
      playSoundFile(getItemSoundPath(item), speech);
    }
    return;
  }

  if (key && soundIndexSet.has(key)) {
    playSoundFile(getItemSoundPath(item), speech);
    return;
  }

  speakWithBrowser(speech);
}
