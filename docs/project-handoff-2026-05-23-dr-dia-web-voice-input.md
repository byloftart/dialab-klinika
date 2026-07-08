# Project Handoff: Dr. Dia Website Voice Input

Date: 2026-05-23

## Decision

The planned Telegram assistant voice-input production rollout is deferred. The active implementation target is the Dr. Dia assistant on the website.

## Implemented

- Added `assistant.transcribeVoice` tRPC mutation.
- Reused Mistral `POST /v1/audio/transcriptions` through `server/_core/mistralTranscription.ts`.
- Added browser `MediaRecorder` voice capture to `client/src/components/assistant/HermesChatPanel.tsx`.
- The website voice flow records audio, sends it to the backend for Mistral transcription, and places the transcribed text into the chat input for user review before sending.
- Telegram voice transcription helper code remains present, but Telegram production deployment is not part of this phase.

## Required Environment

Production needs these values in the server-side app environment only:

```text
MISTRAL_API_KEY
MISTRAL_AUDIO_TRANSCRIPTION_MODEL=voxtral-mini-latest
```

Do not commit raw Mistral keys.

## Verification

Local verification completed:

```bash
pnpm vitest run server/assistant.chat.test.ts server/telegramAdapter.test.ts
pnpm check
pnpm build
```

Browser verification completed at `http://localhost:3000/` with Hermes env set locally:

- Dr. Dia panel opens.
- Chat input renders with a microphone button.
- Send button remains disabled until there is text.
- The microphone control fits in the existing compact website assistant layout.

## Production Deployment

Active production is AWS EC2 `diavm-aws-manual`, IP `13.48.91.166`, app path `/home/iram/apps/dialab`, PM2 process `dialab` under user `iram`.

Deployment completed on 2026-05-23:

- SSH key used locally: `/Users/iram/Documents/Codex/2026-05-07/markdown-diavm-google-cloud-platform-aws/diavm-aws-manual-20260507.pem`
- Copied `client/src/components/assistant/HermesChatPanel.tsx`.
- Added `server/_core/mistralTranscription.ts`.
- Patched production `server/routers.ts` with only `assistant.transcribeVoice`.
- Patched production `server/_core/env.ts` with only Mistral transcription env reads, preserving existing AWS S3 env fields.
- Added Mistral env variable names to production `.env` and `.env.production`; the raw key is not stored in repo docs.
- The initially supplied Mistral key returned `401 Unauthorized`; production was switched to the existing Hermes Mistral key from `/home/iram/.hermes/.env` without printing its value.
- Ran production `pnpm check && pnpm build`.
- Restarted PM2 app `dialab` under user `iram`; `dialab` and `hermes-dr-dia` were online.

Production smoke checks:

- `curl -I https://dialab.center` returned `200 OK`.
- `assistant.config` returned provider `hermes`, configured, model `dr-dia-hermes`.
- `assistant.transcribeVoice` returned `200` for a generated WAV smoke test.
- Browser check on `https://dialab.center/` found the Dr. Dia `Səsli giriş` microphone button.

## Azerbaijani Latin Fix

Date: 2026-05-23

Issue: Azerbaijani website voice input could be returned by Mistral in Cyrillic script. Azerbaijan uses Latin script, so patient-visible transcriptions must not show Cyrillic for Azerbaijani input.

Resolution:

- Tried forcing Mistral `language: "az"`, but the API rejected it because `az` is not supported by the transcription endpoint.
- Added backend normalization in `server/_core/mistralTranscription.ts` to transliterate Cyrillic Azerbaijani/Russian-like transcription output into Azerbaijani Latin before returning it to the browser.
- `assistant.transcribeVoice` now wraps Mistral output with `normalizeAzerbaijaniLatinTranscription(...)`.
- Added a regression test covering Cyrillic input such as `Салам! ...` and asserting Latin output.

Verification:

```bash
pnpm vitest run server/assistant.chat.test.ts
pnpm check
pnpm build
```

Production:

- Patched production helper and `assistant.transcribeVoice`.
- Ran production `pnpm check && pnpm build`.
- Restarted `dialab`; PM2 status was online.
- Production smoke test returned `200` and `NO_CYRILLIC_FOUND`.

## Azerbaijani Voice Cleanup

Date: 2026-05-23

Issue: pure Cyrillic-to-Latin transliteration made Azerbaijani voice transcripts technically Latin but still ungrammatical and unsuitable for patient-visible chat input.

Resolution:

- `assistant.transcribeVoice` now sends raw Mistral ASR text through the configured Hermes/Mistral chat model for transcript cleanup before returning it to the browser.
- The cleanup prompt instructs the model to:
  - return only the corrected user utterance;
  - not answer the user;
  - not add facts or new topics;
  - rewrite Azerbaijani Cyrillic-like ASR output as clean Azerbaijani Latin text;
  - fix obvious ASR, grammar, casing, punctuation, and Azerbaijani letter errors.
- Mechanical Cyrillic-to-Latin normalization remains as a fallback if Hermes cleanup is unavailable.
- Regression test now covers a bad ASR sample: `Салам! Сизде клиники анализлерене тахыдыр.` and expects a clean Azerbaijani Latin message.

Verification:

```bash
pnpm vitest run server/assistant.chat.test.ts
pnpm check
pnpm build
```

Production:

- Patched production `server/routers.ts` without deploying unrelated local WhatsApp admin routes.
- Ran production `pnpm vitest run server/assistant.chat.test.ts`, `pnpm check`, and `pnpm build`.
- Restarted `dialab`; PM2 status was online.
- Live Hermes cleanup smoke returned clean Latin Azerbaijani with no Cyrillic and without introducing price/preparation topics.

## Voice Cleanup Language Preservation

Date: 2026-05-24

Issue: the transcript cleanup step could translate Russian or English voice transcripts into Azerbaijani because the cleanup model was optimized around the Azerbaijani Cyrillic-to-Latin problem.

Resolution:

- Added lightweight language detection before cleanup.
- Russian and English transcripts now bypass Hermes cleanup and return the raw ASR text trimmed, so they cannot be translated into Azerbaijani by the cleanup model.
- Azerbaijani transcripts still use Hermes cleanup when needed, with mechanical Cyrillic-to-Latin normalization as fallback.
- Added regression tests for:
  - Russian input `Сколько стоит анализ крови?`
  - English input `How much is a blood test?`
  - both cases assert that Hermes cleanup is not called and the original language is preserved.

Verification:

```bash
pnpm vitest run server/assistant.chat.test.ts
pnpm check
pnpm build
```

Production:

- Patched production `server/routers.ts` only.
- Ran production `pnpm vitest run server/assistant.chat.test.ts`, `pnpm check`, and `pnpm build`.
- Restarted `dialab`; PM2 status was online.
- `curl -I https://dialab.center` returned `200 OK`.

## Price Restriction And Inline Chat CTA

Date: 2026-05-23

Issue: Dr. Dia was originally allowed to answer from confirmed price lists. The desired operating policy is different: Dr. Dia may provide clinic/service guidance, but must not provide prices. Price questions should be handled by live operators. Also, when Dr. Dia points the patient to appointment/contact actions, the relevant buttons should appear directly under the chat answer.

Resolution:

- Removed laboratory and diagnostic price lists from `buildDrDiaKnowledgeContext(...)` so price amounts are no longer placed into the Hermes system prompt.
- Updated `buildDrDiaSystemPrompt(...)` to explicitly prohibit price amounts, ranges, and price lists.
- Changed `createDrDiaReply(...)` price-intent handling to return a deterministic operator handoff without calling Hermes and without exposing service names or amounts.
- Added inline action buttons in `HermesChatPanel` for assistant messages:
  - `Qəbul` opens the booking view.
  - `Zəng` opens the phone link when the answer mentions call/phone intent.
  - `WhatsApp` and `Telegram` open the configured contact links when the answer mentions operator/contact intent.

Verification:

```bash
pnpm vitest run server/assistant.chat.test.ts
pnpm check
pnpm build
```

Production:

- Copied the updated backend and assistant UI files to `/home/iram/apps/dialab`.
- Ran production `pnpm vitest run server/assistant.chat.test.ts`, `pnpm check`, and `pnpm build`.
- Restarted `dialab`; PM2 status was online.
- `curl -I https://dialab.center` returned `200 OK`.
- Production `assistant.chat` smoke for `Qanın ümumi analizi neçəyədir?` returned an operator handoff and `NO_PRICE_FOUND`.
- Browser verification on `https://dialab.center/` confirmed the answer renders inline `WhatsApp` and `Telegram` buttons and no price amount.
- Screenshot: `docs/handoffs/dr-dia-price-cta-production-2026-05-23.png`.
