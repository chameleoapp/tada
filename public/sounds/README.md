# Item name sounds (English + ElevenLabs)

The app speaks clothing names in **English**. Until MP3 files exist, it uses the browser voice. After you generate files, it plays ElevenLabs audio from this folder.

Do **not** put the ElevenLabs API key in the browser (`VITE_…`). The key is only for the local script.

## 1. ElevenLabs account

1. Open [elevenlabs.io](https://elevenlabs.io) and sign in (or create an account).
2. A paid plan is better: Voice Library voices are **not** available via the API on the free tier.
3. You need enough credits for ~40 very short phrases (one word / short name each). That is a small amount of usage.

## 2. Create an API key

1. Open [API keys](https://elevenlabs.io/app/settings/api-keys) (also under Developers → API keys).
2. Click **Create API key**.
3. Name it `tada-sounds`.
4. Restrict scopes if the UI offers it. Enable at least:
   - Text to Speech
   - Voices (read)
   - Models (read)
5. Copy the key once. It looks like a long secret string. You will not see it again.

Never commit this key. `.env` is already in `.gitignore`.

## 3. Choose a voice and copy its ID

Pick a clear English voice that sounds good for a child (warm, not too fast).

**From My Voices**

1. Open [My Voices](https://elevenlabs.io/app/voice-lab).
2. Find the voice → **⋯** (More actions) → **Copy voice ID**.

**From the Voice Library**

1. Open [Voice Library](https://elevenlabs.io/app/voice-library).
2. Filter: language **English**, category **Educational** or **Characters**, age **Young**.
3. Preview a few voices.
4. Add the voice to My Voices (**+**), then copy the Voice ID from My Voices.
5. Library voices must be saved to your account, or the API returns `voice_not_found`.

The Voice ID looks like `21m00Tcm4TlvDq8ikWAM` (letters and numbers, no spaces).

## 4. Put secrets in `.env`

In the project root, create `.env` if it does not exist (copy from `.env.example`). Add:

```bash
ELEVENLABS_API_KEY=paste-the-api-key-here
ELEVENLABS_VOICE_ID=paste-the-voice-id-here
```

No quotes, no `VITE_` prefix, no spaces around `=`.

## 5. Preview the English phrases (no API call)

```bash
npm run sounds -- --list
```

You should see 40 lines like:

```
socks.mp3  ←  Socks
t-shirt.mp3  ←  T-shirt
panama-hat.mp3  ←  Panama hat
```

## 6. Generate the MP3 files

```bash
npm run sounds
```

The script calls ElevenLabs for each name and writes:

- `public/sounds/{key}.mp3`
- `public/sounds/index.json` (the app reads this list)

If a request fails, the terminal shows `ElevenLabs 401/403/404` plus a short message:

- `401` — API key missing or wrong
- `403` — key scopes too tight, or plan cannot use that voice
- `voice_not_found` — Voice ID wrong, or library voice not added to My Voices

## 7. Hear it in the app

1. Restart or refresh `npm run dev`.
2. Parent screen: **Say item names?** → Yes.
3. **Show outfit** → tap a picture, or tap **Hear name** on the dressing screen.

The app uses the MP3 if that name is in `index.json`. Otherwise it falls back to the browser voice.

## 8. After it sounds right

Commit the generated `public/sounds/*.mp3` and `index.json` so production does not need the API key.

Do **not** commit `.env`.

To change the voice later: pick a new Voice ID, update `.env`, run `npm run sounds` again (it overwrites the files).
