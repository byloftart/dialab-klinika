# Project Handoff: Dr. Dia Hermes/Mistral Production Activation

Date: 2026-05-04

## Current Checkpoint

Dr. Dia is now running through a first-party Hermes-powered chat flow instead of the embedded Botpress chat on production.

- Production site: `https://dialab.center`
- Production VM: `diavm`
- Production app path: `/home/iram/apps/dialab`
- Production PM2 user: `iram`
- Production app process: `dialab`
- Hermes process: `hermes-dr-dia`
- Active assistant provider: `hermes`
- LLM provider behind Hermes: Mistral API through Hermes custom OpenAI-compatible mode
- Public model label used by Dialab backend: `dr-dia-hermes`

Do not print, commit, or document API keys or Hermes API server keys.

## Production Process Notes

PM2 must be managed under the `iram` user:

```bash
sudo -u iram bash -lc "export PM2_HOME=/home/iram/.pm2; cd /home/iram/apps/dialab && pm2 status dialab"
```

Hermes status:

```bash
sudo -u iram env HOME=/home/iram PM2_HOME=/home/iram/.pm2 PATH=/home/iram/.local/bin:/usr/local/bin:/usr/bin:/bin bash -lc "pm2 status hermes-dr-dia"
```

Production build/restart pattern:

```bash
sudo -u iram env HOME=/home/iram bash -lc "cd /home/iram/apps/dialab && pnpm check && pnpm build"
sudo -u iram bash -lc "export PM2_HOME=/home/iram/.pm2; cd /home/iram/apps/dialab && pm2 restart dialab --update-env"
```

## Implemented Hermes Files

Core backend integration:

- `server/_core/hermesAssistant.ts`
- `server/_core/hermesAssistant.test.ts`
- `server/_core/env.ts`
- `server/routers.ts`

Frontend assistant integration:

- `client/src/lib/assistant.ts`
- `client/src/components/assistant/HermesChatPanel.tsx`
- `client/src/components/VirtualAssistant.tsx`

Documentation touched:

- `docs/project-handoff-2026-05-04-dr-dia-botpress-activation.md`
- `docs/project-handoff-2026-05-04-dr-dia-hermes-mistral-production.md`

## Current UX Behavior

Widget shell:

- Header shows only `Dr. Dia` as the assistant name.
- Header subtitle stays concise: assistant helps with appointment, services, and contact direction.
- Launcher hover bubble is a short Azerbaijani sentence only:
  `Sualınız varsa, Dr. Dia sizə kömək etməyə hazırdır.`
- Native launcher `title` tooltip was removed so the small browser tooltip no longer shows `Dr. Dia`.

Chat panel:

- Internal technical labels are hidden:
  - no `Hermes Agent`
  - no `dr-dia-hermes`
  - no duplicate `Dr. Dia ilə söhbət`
- Chat history is kept at the widget level, so opening the appointment form and returning to chat does not reset the conversation.
- The reset icon intentionally starts the chat again.
- Only the last 18 messages are sent to the backend to avoid tRPC input limit failures, while the UI history remains visible.

Action dock:

- The six buttons are pinned below the chat/input area:
  - `Qəbul`
  - `Xidmətlər`
  - `Həkimlər`
  - `Zəng`
  - `WhatsApp`
  - `Telegram`
- CTA rules:
  - booking/appointment -> `Qəbul`
  - operator clarification -> `WhatsApp` or `Telegram`

## Assistant Behavior Rules

Language:

- The backend detects the latest user message language.
- The assistant answers in the same language: Azerbaijani, Russian, or English.

Formatting:

- Avoid raw markdown-like clutter in visible chat.
- UI renders basic bold/list markdown defensively if the model still returns it.
- Answers should be short, readable, and action-oriented.

Safety and clinic scope:

- No diagnosis.
- No treatment prescription.
- No lab interpretation as a medical conclusion.
- No invented prices, slots, doctors, or services.
- If a service is not confirmed in CMS/knowledge context, do not confirm it as available.
- Avoid negative phrasing like “this information is absent in context” as the primary answer.
- For uncertain details, recommend clarifying with the operator through `WhatsApp` or `Telegram`.

Special deterministic guards:

- Home doctor visit / home examination:
  - Do not confirm as available.
  - Reply that home examination is not confirmed in the current clinic knowledge base and recommend clarifying through `WhatsApp` or `Telegram`.
- Reception start time:
  - Use CMS hours where available.
  - For exact doctor-specific timing, direct to `Qəbul`.
- Branches:
  - Answer positively that a branch exists.
  - Recommend confirming current address/schedule through `WhatsApp` or `Telegram`.

## Verified Production Checks

Completed successfully:

```bash
pnpm check
pnpm build
pm2 restart dialab --update-env
curl -I https://dialab.center
```

Runtime checks:

- `dialab` online under user `iram`
- `hermes-dr-dia` online under user `iram`
- `/api/trpc/assistant.config` returns provider `hermes`
- Long-history chat requests no longer fail due to the previous server input length issue
- `Qəbul saat neçədə başlayır?` returns clinic schedule instead of a negative “not in context” answer
- `У вас есть другие филиалы?` returns a positive branch answer and points to operator clarification
- Home examination request is not confirmed as an available service

## Current Git State Warning

The worktree is intentionally not committed yet.

The branch is:

- `codex/gcp-deploy`
- latest commit at start of Hermes work: `8b2215e` (`Activate Dr. Dia Botpress chat`)

There are unrelated or broader dirty files in the repository. Do not blindly reset them. Review and split into focused commits.

Recommended commit grouping:

1. Dr. Dia Hermes/Mistral assistant integration
2. Dr. Dia widget UX polish and chat persistence
3. CMS/service/doctor catalog updates
4. Admin/media/font/site layout changes
5. Documentation handoffs

## Next Recommended Work

1. Review dirty files and split into clean commits.
2. Add a small README/operations section documenting production PM2 and Hermes commands.
3. Stabilize Dr. Dia knowledge base around services, branches, hours, and operator escalation.
4. Add endpoint-level tests for:
   - long chat history trimming
   - home visit fallback
   - branch answer
   - reception time answer
