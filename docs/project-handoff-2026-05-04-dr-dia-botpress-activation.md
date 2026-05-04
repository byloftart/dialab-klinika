# DIALAB Project Handoff — 2026-05-04 — Dr. Dia Botpress Activation

Focused handoff for continuing `Dr. Dia` assistant development without losing the current widget, Botpress, and production deployment context.

## Current Project Context

- Project: `DIALAB Klinika`
- Production site: `https://dialab.center`
- Repository: `dialab-klinika-repo-2`
- Assistant name: `Dr. Dia`
- Production VM: GCP `diavm`
- Production app path: `/home/iram/apps/dialab`
- Production PM2 app: `dialab`
- Important PM2 detail: the production process that Nginx serves runs under user `iram` with `PM2_HOME=/home/iram/.pm2`
- Nginx proxies production traffic to `127.0.0.1:3000`

## What Changed In This Checkpoint

### Widget UI

Primary files:

- `client/src/components/VirtualAssistant.tsx`
- `client/src/components/assistant/BotpressWebchatPanel.tsx`

Implemented:

- The opened widget is now chat-first instead of a six-option menu.
- The panel has a Dr. Dia assistant header with the assistant image and Dialab green/teal palette.
- Botpress webchat is the main interaction block on the first screen.
- Quick actions were reduced to exactly three:
  - `Qəbul`
  - `Xidmətlər`
  - `Həkimlər`
- `WhatsApp` is no longer a main quick action; it remains as a footer fallback.
- `Əlaqə`, `preparation`, and the old `prices` quick action were removed from the top quick-action grid.
- `Xidmətlər` now owns service/price routing.
- The fallback state for missing Botpress config now looks intentional instead of broken.

### Backend Env Loading

File:

- `server/_core/env.ts`

Implemented:

- Added `import "dotenv/config";` directly in the env module.
- This is needed because `ENV` is evaluated from `server/_core/env.ts`; relying only on the entrypoint import was not enough under the current server bundle/import order.

## Botpress State

Botpress workspace:

- Workspace: `Dialab Center`

Bot:

- Bot name: `Dr. Dia`
- Bot ID: `9532e730-c6a0-413a-b9ea-3269499c2fb8`
- Webchat Client ID: `f90b58b6-2cc1-4555-aace-0aa0ef6ac5ef`
- Published share config URL observed in Botpress:
  - `https://files.bpcontent.cloud/2026/05/02/22/20260502222635-SV2NM4YC.json`

Configured behavior:

- Guided Setup was run against:
  - `https://dialab.center`
  - `https://www.dialab.center`
- The generated English, broad brand-assistant instructions were replaced with Azerbaijani MVP guardrails.
- Dr. Dia should answer in Azerbaijani and act as a clinic navigation assistant.
- It should help with clinic information, services, doctors, prices, preparation, contact, and appointment direction.
- It must not diagnose, prescribe treatment, interpret test results, invent prices, invent availability slots, or request sensitive private data.

Live verification:

- Botpress webchat loads in the production widget.
- Production webchat requests returned `200`:
  - `initialize`
  - `conversations`
  - `events`
  - `messages`
- Test message sent on production:
  - `Salam, xidmətlər haqqında məlumat verə bilərsiniz?`
- Dr. Dia replied in Azerbaijani with service guidance.

## Production Deployment Notes

Important discovery:

- There were two PM2 contexts:
  - root PM2 accidentally started a duplicate `dialab` process on port `3001`
  - the real production PM2 is under user `iram` and serves port `3000`
- The duplicate root PM2 process was deleted.
- Use the `iram` PM2 context for production restarts:

```bash
gcloud compute ssh diavm --zone=europe-north1-c --command='sudo -u iram bash -lc "export PM2_HOME=/home/iram/.pm2; cd /home/iram/apps/dialab && pm2 status dialab"'
```

Botpress env was added to production `.env` and injected into the correct PM2 restart:

```bash
BOTPRESS_WEBCHAT_CLIENT_ID=f90b58b6-2cc1-4555-aace-0aa0ef6ac5ef
BOTPRESS_WEBCHAT_API_URL=
BOTPRESS_WEBCHAT_STYLESHEET_URL=
```

Use this pattern for production restart:

```bash
gcloud compute ssh diavm --zone=europe-north1-c --command='sudo -u iram bash -lc "export PM2_HOME=/home/iram/.pm2; cd /home/iram/apps/dialab && BOTPRESS_WEBCHAT_CLIENT_ID=f90b58b6-2cc1-4555-aace-0aa0ef6ac5ef BOTPRESS_WEBCHAT_API_URL= BOTPRESS_WEBCHAT_STYLESHEET_URL= pm2 restart dialab --update-env"'
```

Verify assistant config:

```bash
curl -s 'https://dialab.center/api/trpc/assistant.config?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D'
```

Expected provider:

```json
{
  "type": "botpress",
  "isConfigured": true,
  "clientId": "f90b58b6-2cc1-4555-aace-0aa0ef6ac5ef"
}
```

## Verification Already Run

- `pnpm check`
- `pnpm build`
- production build on VM
- correct `iram` PM2 restart
- `curl -I https://dialab.center`
- production tRPC `assistant.config`
- production browser test of the Dr. Dia widget and Botpress message flow

## Important Safety Notes

- The worktree may still contain many unrelated dirty files. Do not stage or commit unrelated work.
- The relevant files for this checkpoint are:
  - `client/src/components/VirtualAssistant.tsx`
  - `client/src/components/assistant/BotpressWebchatPanel.tsx`
  - `server/_core/env.ts`
  - this handoff document
- The Botpress account password was shared temporarily during setup. The user plans to change it after this work.
- Do not print or preserve the password in docs, commits, or future summaries.

## Recommended Next Steps

1. Visually polish the embedded Botpress frame inside the widget on mobile and desktop.
2. Align Botpress published webchat configuration name/avatar with `Dr. Dia` if the config UI still shows older generated names.
3. Review and refine Botpress Knowledge Base coverage after the website content stabilizes.
4. Improve quick-action handoff from the website widget into Botpress context if needed.
5. Keep `Qəbul`, `Xidmətlər`, `Həkimlər` as the top three quick actions unless the user changes the product decision.

## Starter Prompt For Next Thread

Use this prompt in a new Codex thread:

> We are continuing `Dr. Dia` assistant work in `/Users/iram/Projects/Dialab/dialab-klinika-repo-2` for the live `https://dialab.center` project.
>
> Before doing anything, read these docs:
> - `docs/project-handoff-2026-05-04-dr-dia-botpress-activation.md`
> - `docs/project-handoff-2026-05-02-dr-dia-widget.md`
> - `docs/project-handoff-2026-04-06.md`
> - `docs/dr-dia-botpress-content-map.md`
>
> Current state:
> - Dr. Dia widget is chat-first.
> - The top quick actions are only `Qəbul`, `Xidmətlər`, `Həkimlər`.
> - Botpress is now connected and active on production.
> - Botpress workspace is `Dialab Center`.
> - Bot ID is `9532e730-c6a0-413a-b9ea-3269499c2fb8`.
> - Webchat Client ID is `f90b58b6-2cc1-4555-aace-0aa0ef6ac5ef`.
> - Production VM is `diavm`, app path `/home/iram/apps/dialab`.
> - Important: use the `iram` PM2 context, not root PM2:
>   `sudo -u iram bash -lc "export PM2_HOME=/home/iram/.pm2; cd /home/iram/apps/dialab && pm2 status dialab"`
>
> Important constraints:
> - The worktree may be dirty; do not stage, commit, deploy, or revert unrelated files.
> - Botpress password must not be printed or saved; the user plans to change it.
> - Keep Botpress within safe clinic-navigation boundaries: no diagnosis, no treatment advice, no test result interpretation, no invented prices or slots.
>
> Next likely task:
> Continue visual/UX polishing of the Dr. Dia widget and embedded Botpress chat, then refine Botpress knowledge/content only after the website content structure is stable.
