# Project Handoff: Dr. Dia Telegram Channel Foundation

Date: 2026-05-05

## Current Checkpoint

The Dr. Dia brain was extracted from the web-only `assistant.chat` endpoint into a shared server reply service. The web widget and the new Telegram webhook adapter now use the same Hermes/Mistral, knowledge base, deterministic guard, price, safety, and fallback logic.

- Production site: `https://dialab.center`
- Production VM: `diavm`
- Production app path: `/home/iram/apps/dialab`
- Production PM2 user: `iram`
- Production app process: `dialab`
- Hermes process: `hermes-dr-dia`
- Active assistant provider: `hermes`

Do not print, commit, or document Telegram bot tokens, webhook secrets, Hermes keys, LLM keys, database secrets, or direct doctor phone numbers.

## Implemented

Backend:

- `server/_core/drDiaReplyService.ts`
- `server/_core/telegramAdapter.ts`
- `server/_core/env.ts`
- `server/_core/index.ts`
- `server/routers.ts`
- `server/db.ts`

Database:

- `drizzle/schema.ts`
- `drizzle/0006_add_telegram_chat_messages.sql`
- Production table `telegramChatMessages` exists.

Tests:

- `server/telegramAdapter.test.ts`
- existing `server/assistant.chat.test.ts` still covers the web endpoint through the shared reply service.

## Runtime Shape

```text
Web widget
  -> assistant.chat
  -> shared Dr. Dia reply service
  -> Hermes / knowledge base / guards

Telegram user
  -> Telegram Bot API
  -> /api/telegram/webhook/:secret
  -> shared Dr. Dia reply service
  -> Hermes / knowledge base / guards
```

Telegram uses the existing `dialab` PM2 process. There is no separate Telegram PM2 process.

Telegram buttons:

- `Qəbul`
- `Qiymətlər`
- `Ünvan`
- `Operator`

## Production Status

Applied:

- copied backend/schema/migration files to `/home/iram/apps/dialab`
- applied `drizzle/0006_add_telegram_chat_messages.sql`
- ran production `pnpm check`
- fixed old `dist` ownership so production build can run under `iram`
- ran production `pnpm build`
- restarted `dialab` under `iram`

Verified:

- `curl -I https://dialab.center` -> `200 OK`
- `assistant.config` -> provider `hermes`, configured
- `POST /api/telegram/webhook/not-configured-yet` -> `403 {"ok":false}`
- production MySQL table `telegramChatMessages` exists
- live web price smoke: `Qanın ümumi analizi neçəyədir?` -> `16.00 AZN`

## Next Step

Continue with BotFather and production Telegram activation:

1. Create or choose the Telegram bot in BotFather.
2. Put the real `TELEGRAM_BOT_TOKEN`, a strong `TELEGRAM_WEBHOOK_SECRET`, and optional `TELEGRAM_OPERATOR_URL` into production env on `diavm`.
3. Restart `dialab` under user `iram`.
4. Call Telegram `setWebhook` with:

```text
https://dialab.center/api/telegram/webhook/<TELEGRAM_WEBHOOK_SECRET>
```

5. Smoke-test from Telegram:
   - `Qanın ümumi analizi neçəyədir?`
   - `MRT edirsiniz?`
   - `Baş ağrısı üçün hansı dərmanı içim?`
   - button taps: `Qəbul`, `Qiymətlər`, `Ünvan`, `Operator`

## Telegram UI Cleanup

Date: 2026-05-06

After live visual review, the Telegram adapter was cleaned up without introducing a Mini App.

Implemented:

- replaced the large bottom `ReplyKeyboardMarkup` with compact per-message inline buttons
- sends `ReplyKeyboardRemove` cleanup before replies so the old bottom keyboard can disappear for existing users
- strips raw markdown artifacts such as `###`, `**bold**`, and list marker clutter from Telegram replies
- removes repeated “press Qəbul/Operator button” CTA text from Telegram message bodies because inline buttons are already attached
- handles voice/audio-only updates with: `Zəhmət olmasa, sualınızı mətn kimi yazın.`
- acknowledges inline button callback queries

Verified locally:

```bash
pnpm vitest run server/telegramAdapter.test.ts server/assistant.chat.test.ts server/_core/hermesAssistant.test.ts
pnpm check
pnpm build
```

Verified on production:

- copied `server/_core/telegramAdapter.ts`
- ran production `pnpm check && pnpm build`
- restarted `dialab` under user `iram`
- `dialab` and `hermes-dr-dia` are online under PM2 user `iram`
- `getWebhookInfo` reports the Dialab webhook, no pending updates, and no last delivery error
- `curl -I https://dialab.center` returns `200 OK`

Remaining UI limitation:

- native Telegram client controls such as sticker/emoji/voice buttons cannot be hidden by the bot
- a truly branded “same as widget” interface requires Telegram Web App / Mini App as a separate next phase

## Telegram Voice Input

Date: 2026-05-16

Implemented:

- Telegram `voice` and `audio` messages now use the Telegram Bot API `getFile` flow to download the audio file.
- The downloaded audio is sent to Mistral `POST /v1/audio/transcriptions` with `MISTRAL_AUDIO_TRANSCRIPTION_MODEL`, defaulting to `voxtral-mini-latest`.
- The transcribed text enters the same shared Dr. Dia Telegram reply pipeline as typed messages, including history persistence, deterministic guards, Hermes fallback, formatting cleanup, and inline buttons.
- If transcription fails or returns empty text, Telegram receives: `Səsli mesajı mətnə çevirmək mümkün olmadı. Zəhmət olmasa, sualınızı mətn kimi yazın.`

Required production env:

- `MISTRAL_API_KEY`
- `MISTRAL_AUDIO_TRANSCRIPTION_MODEL=voxtral-mini-latest`

Do not commit the raw Mistral key. Put it only into the production `.env` on the server and restart the existing `dialab` PM2 app under user `iram`.

Verified locally:

```bash
pnpm vitest run server/telegramAdapter.test.ts
pnpm check
pnpm build
```
