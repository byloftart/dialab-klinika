# AGENTS.md

This repository is the Dialab clinic website and CMS project.

Use this file as the operating guide for AI coding agents working in this checkout.

## Project

- Local repo: `/Users/iram/Projects/Dialab/dialab-klinika-repo-2`
- Production VM: AWS EC2 `diavm-aws-manual`
- Production IP: `13.48.91.166`
- Production app path: `/home/iram/apps/dialab`
- Production PM2 app: `dialab`
- Production PM2 user: `iram`
- Active assistant: Dr. Dia
- Current assistant runtime: Hermes gateway with Mistral API behind it
- Website voice input: browser `MediaRecorder` plus Mistral `audio/transcriptions`
- Telegram voice input: code helper exists, but production deployment is deferred unless explicitly resumed
- Hermes PM2 process: `hermes-dr-dia`
- Active database: local MySQL on AWS EC2, `127.0.0.1:3306`
- Active media storage: AWS S3 bucket `dialab-center-media-aws-293033346129`
- GCP `diavm` is fallback only after the 2026-05-09 migration; do not delete it unless explicitly asked.

## Core Rules

- Inspect the real repo structure before planning or editing.
- Preserve unrelated dirty worktree changes. Do not reset or revert files you did not intentionally change.
- Do not commit, deploy, or roll back unrelated changes unless explicitly asked.
- Never print, save in docs, or commit API keys, passwords, Botpress credentials, Hermes API keys, or LLM keys.
- Prefer focused edits that match existing code style.
- Use `rg` for search.
- Use `apply_patch` for manual edits.

## Dr. Dia Scope

Dr. Dia is a clinic navigation and appointment assistant.

Allowed topics:

- clinic navigation
- services
- doctors
- prices when confirmed in CMS/knowledge context
- preparation rules when confirmed
- contacts
- appointment request direction
- operator escalation

Do not allow the assistant to:

- diagnose
- prescribe treatment
- interpret lab results as medical conclusions
- invent prices
- invent appointment slots
- invent doctors
- confirm services not present in CMS/knowledge context

If data is missing or uncertain, avoid negative phrasing such as “this information is absent.” Prefer a helpful operator handoff through the buttons below the chat:

- `Qəbul` for booking/request form
- `WhatsApp` or `Telegram` for operator clarification

## Production Commands

PM2 must run as `iram`, not root.

Check Dialab:

```bash
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status dialab'
```

Check Hermes:

```bash
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status hermes-dr-dia'
```

Build on production:

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && pnpm check && pnpm build'
```

Restart production:

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && PM2_HOME=/home/iram/.pm2 pm2 restart dialab --update-env && PM2_HOME=/home/iram/.pm2 pm2 save'
```

Verify public site:

```bash
curl -I https://dialab.center
```

Verify assistant provider:

```bash
curl -s 'https://dialab.center/api/trpc/assistant.config?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D'
```

## Local Verification

Before reporting completion for code changes:

```bash
pnpm check
pnpm build
```

For Hermes-specific backend helper changes:

```bash
pnpm vitest run server/_core/hermesAssistant.test.ts
```

For Telegram channel changes:

```bash
pnpm vitest run server/telegramAdapter.test.ts
```

## Documentation

Important handoff docs:

- `docs/project-handoff-2026-05-09-diavm-aws-migration.md`
- `docs/ops/aws-production-runbook.md`
- `docs/project-handoff-2026-05-04-dr-dia-hermes-mistral-production.md`
- `docs/project-handoff-2026-05-04-dr-dia-botpress-activation.md`
- `docs/project-handoff-2026-05-02-dr-dia-widget.md`
- `docs/project-handoff-2026-04-06.md`
- `docs/dr-dia-botpress-content-map.md`

When finishing substantial work, save a concise handoff in `docs/`.
