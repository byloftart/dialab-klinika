# DIALAB Klinika

Production website, CMS, and Dr. Dia assistant for DIALAB clinic.

- Production site: [https://dialab.center](https://dialab.center)
- Local repo: `/Users/iram/Projects/Dialab/dialab-klinika-repo-2`
- Production VM: AWS EC2 `diavm-aws-manual`
- Production IP: `13.48.91.166`
- Production app path: `/home/iram/apps/dialab`
- Runtime: `AWS EC2 + Nginx + PM2 + Node/Express`
- Frontend: `React`, `Vite`, `Tailwind`
- Backend: `Express`, `tRPC`, `Drizzle ORM`, `MySQL`
- Assistant: `Dr. Dia` through `Hermes` with Mistral API

## Current Production Architecture

```text
Browser
  -> Nginx
  -> Node / Express
  -> tRPC API
  -> Local MySQL / S3 / Hermes
```

Assistant flow:

```text
Dr. Dia widget
  -> Dialab tRPC assistant.chat
  -> Hermes gateway on diavm
  -> Mistral API
  -> Dialab response formatter and guards
  -> Dr. Dia chat UI
```

Production PM2 processes:

- `dialab`: website and backend
- `hermes-dr-dia`: local Hermes gateway

Important: PM2 production commands must run under the `iram` user, not root.

## Repository Structure

```text
dialab-klinika-repo-2/
├── AGENTS.md
├── README.md
├── client/
│   ├── src/components/
│   ├── src/components/assistant/
│   ├── src/pages/
│   └── src/lib/
├── server/
│   ├── _core/
│   ├── db.ts
│   ├── routers.ts
│   └── storage.ts
├── shared/
├── drizzle/
├── scripts/
├── docs/
└── ecosystem.config.cjs
```

## Main Capabilities

Public website:

- homepage sections
- services
- laboratory
- diagnostics
- doctors
- media/gallery
- feedback/contact
- static content pages

Admin CMS:

- site settings
- homepage content
- laboratory services and sub-tests
- diagnostic services and sub-services
- doctors
- appointments
- feedback
- media uploads
- static pages

Dr. Dia:

- clinic navigation
- service guidance
- doctor guidance
- appointment request direction
- contact/operator direction
- website voice input through Mistral transcription
- same-language replies in Azerbaijani, Russian, or English
- CMS/knowledge-aware guardrails

## Dr. Dia Rules

Allowed:

- services
- doctors
- prices when confirmed
- preparation when confirmed
- clinic contacts
- working hours
- appointment request help
- operator escalation

Not allowed:

- diagnosis
- treatment prescription
- interpretation of lab results as medical conclusion
- invented services
- invented prices
- invented slots
- invented doctors

If a service or detail is not confirmed in CMS/knowledge context, Dr. Dia should not present it as available. The assistant should recommend clarifying through the operator using `WhatsApp` or `Telegram` below the chat.

CTA rules:

- appointment or booking: use `Qəbul`
- operator clarification: use `WhatsApp` or `Telegram`

## Important Assistant Files

- `client/src/components/VirtualAssistant.tsx`
- `client/src/components/assistant/HermesChatPanel.tsx`
- `client/src/lib/assistant.ts`
- `server/_core/hermesAssistant.ts`
- `server/_core/hermesAssistant.test.ts`
- `server/_core/env.ts`
- `server/routers.ts`

## Environment Variables

Use `.env.example` as the public template. Never commit real secrets.

Core:

- `DATABASE_URL`
- `JWT_SECRET`
- `STORAGE_PROVIDER=s3`
- `AWS_REGION`
- `S3_BUCKET_NAME`
- `S3_PUBLIC_BASE_URL`
- `PORT`

Assistant:

- `ASSISTANT_PROVIDER=hermes`
- `HERMES_API_BASE_URL`
- `HERMES_API_KEY`
- `HERMES_MODEL`
- `MISTRAL_API_KEY`
- `MISTRAL_AUDIO_TRANSCRIPTION_MODEL=voxtral-mini-latest`

Telegram:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_OPERATOR_URL`
- `TELEGRAM_MINI_APP_URL`

Do not document or commit Mistral, DeepSeek, Hermes, Botpress, database, or JWT secrets.

## Local Development

Install:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Check:

```bash
pnpm check
pnpm build
```

Hermes helper test:

```bash
pnpm vitest run server/_core/hermesAssistant.test.ts
```

## Production Operations

Current production is on AWS. The older GCP VM may still exist temporarily as fallback, but it is no longer the active production target.

SSH to AWS:

```bash
ssh -i /path/to/diavm-aws-manual-20260507.pem ubuntu@13.48.91.166
```

Check website process:

```bash
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status dialab'
```

Check Hermes process:

```bash
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status hermes-dr-dia'
```

Build production app:

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && pnpm check && pnpm build'
```

Restart website:

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && PM2_HOME=/home/iram/.pm2 pm2 restart dialab --update-env && PM2_HOME=/home/iram/.pm2 pm2 save'
```

Verify public site:

```bash
curl -I https://dialab.center
```

Verify active assistant provider:

```bash
curl -s 'https://dialab.center/api/trpc/assistant.config?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D'
```

Expected assistant provider:

```json
{
  "provider": {
    "type": "hermes",
    "isConfigured": true,
    "model": "dr-dia-hermes"
  }
}
```

## Deployment Style

The current production app path is not treated as a clean git checkout during active Codex sessions. For focused updates, copy only reviewed files to the VM, then run production check/build/restart.

Do not deploy unrelated dirty worktree files accidentally.

Typical file copy:

```bash
scp -i /path/to/diavm-aws-manual-20260507.pem path/to/file ubuntu@13.48.91.166:/home/ubuntu/path/to/file
ssh -i /path/to/diavm-aws-manual-20260507.pem ubuntu@13.48.91.166 'sudo cp /home/ubuntu/path/to/file /home/iram/apps/dialab/path/to/file && sudo chown iram:iram /home/iram/apps/dialab/path/to/file'
```

Then:

```bash
ssh -i /path/to/diavm-aws-manual-20260507.pem ubuntu@13.48.91.166 'sudo -iu iram bash -lc "cd /home/iram/apps/dialab && pnpm check && pnpm build && PM2_HOME=/home/iram/.pm2 pm2 restart dialab --update-env"'
```

## Documentation

Agent instructions:

- `AGENTS.md`

Current assistant handoffs:

- `docs/project-handoff-2026-05-09-diavm-aws-migration.md`
- `docs/project-handoff-2026-05-04-dr-dia-hermes-mistral-production.md`
- `docs/project-handoff-2026-05-04-dr-dia-botpress-activation.md`
- `docs/project-handoff-2026-05-02-dr-dia-widget.md`

Production operations:

- `docs/ops/aws-production-runbook.md`

Knowledge/content map:

- `docs/dr-dia-botpress-content-map.md`

Older historical snapshots:

- `docs/project-handoff-2026-04-06.md`
- `docs/project-handoff-2026-04-10.md`

## Git Hygiene

Current working rule:

- keep feature changes grouped
- do not mix assistant runtime, CMS catalog, admin UI, and media/font changes in one commit
- do not reset unrelated local changes without review

Recommended commit groups:

1. Dr. Dia Hermes/Mistral backend integration
2. Dr. Dia widget UX and chat persistence
3. CMS/service/doctor catalog updates
4. Admin/media/font/site UI updates
5. Documentation and project operations files

## Recovery Checklist

If a future agent resumes this project:

1. Read `AGENTS.md`.
2. Read `docs/project-handoff-2026-05-09-diavm-aws-migration.md`.
3. Run `git status --short`.
4. Identify whether the requested change belongs to assistant, CMS/catalog, admin UI, or docs.
5. Edit only the relevant files.
6. Run local checks.
7. If deploying, use the `iram` PM2 workflow above.
