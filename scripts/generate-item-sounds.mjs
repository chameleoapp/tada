import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listItemSpeechEntries } from "../src/itemSpeech.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const soundsDir = path.join(root, "public", "sounds");
const indexPath = path.join(soundsDir, "index.json");

function loadDotEnv() {
  try {
    const text = readFileSync(path.join(root, ".env"), "utf8");
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const value = match[2].replace(/^['"]|['"]$/g, "");
      if (process.env[match[1]] == null) process.env[match[1]] = value;
    }
  } catch {
    // .env is optional when variables are already in the environment
  }
}

async function synthesize({ apiKey, voiceId, text }) {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`);
  url.searchParams.set("output_format", "mp3_44100_128");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.72,
        similarity_boost: 0.8,
        style: 0.15,
        use_speaker_boost: true,
        speed: 0.88,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${detail.slice(0, 400)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  loadDotEnv();
  const entries = listItemSpeechEntries();
  const listOnly = process.argv.includes("--list");
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  console.log(`${entries.length} item names:\n`);
  for (const entry of entries) {
    console.log(`  ${entry.key}.mp3  ←  ${entry.speech}`);
  }

  if (listOnly) return;

  if (!apiKey || !voiceId) {
    console.error("\nAdd ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to .env, then run npm run sounds.");
    process.exitCode = 1;
    return;
  }

  await mkdir(soundsDir, { recursive: true });
  const files = [];

  for (const entry of entries) {
    const fileName = `${entry.key}.mp3`;
    process.stdout.write(`Generating ${fileName}... `);
    const audio = await synthesize({
      apiKey,
      voiceId,
      text: `${entry.speech}.`,
    });
    await writeFile(path.join(soundsDir, fileName), audio);
    files.push(entry.key);
    console.log("ok");
  }

  await writeFile(
    indexPath,
    `${JSON.stringify({ provider: "elevenlabs", files }, null, 2)}\n`,
  );
  console.log(`\nWrote ${files.length} files and updated public/sounds/index.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
