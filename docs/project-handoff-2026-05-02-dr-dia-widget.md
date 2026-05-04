# DIALAB Project Handoff — 2026-05-02 — Dr. Dia Widget

Focused handoff for continuing `Dr. Dia` assistant work in a new Codex thread without losing context, decisions, or recent production changes.

## Current Project Context

- Project: `DIALAB Klinika`
- Production site: `https://dialab.center`
- Repository: `dialab-klinika-repo-2`
- Active branch during this work: `codex/gcp-deploy`
- Latest assistant/widget checkpoint commit: `b60c3ff` — `Refine Dr. Dia widget interactions`
- Production runtime: `GCP VM + Nginx + PM2`
- Production VM app path: `/home/iram/apps/dialab`
- PM2 process name: `dialab`

This handoff is specifically about the assistant widget UX and deployment workflow, not the full CMS backlog.

## High-Level Product Decisions

These decisions are currently treated as locked unless the user explicitly changes them:

- Canonical assistant name: `Dr. Dia`
- Patient-facing language: Azerbaijani
- Assistant role in MVP: clinic navigator + appointment request assistant
- Website remains the primary UX owner
- Booking remains a website-owned request flow, not live slot booking
- Botpress is a secondary conversation layer, not the primary UI shell
- Botpress rollout is still paused strategically until site content is stable enough

## CMS / Content State Relevant To The Widget

By the time of this handoff, the following was clarified:

- `laboratory` and `diagnostics` catalog structure has already been updated and is considered the canonical service structure
- the rest of the clinic content is still in progress
- because of that, the immediate priority shifted from raw content entry to finalizing the widget shell, screens, and interaction logic

Important implication:

- finish the assistant’s internal UX skeleton first
- then continue filling site/CMS content into the finalized structure

## What Was Analyzed About CMS Structure

The project CMS is not an external headless CMS. It is implemented through project tables and admin pages.

Main content sources relevant to `Dr. Dia`:

- structured entities:
  - diagnostics
  - laboratory
  - doctors
- key-value site settings:
  - contact
  - social
  - hours
  - assistant
  - content
- static pages:
  - prices page
  - preparation page

Key code references:

- [drizzle/schema.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/drizzle/schema.ts)
- [server/db.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/db.ts)
- [client/src/pages/admin/SiteSettings.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/SiteSettings.tsx)
- [client/src/pages/admin/Assistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/Assistant.tsx)

## Widget UX Direction Agreed In This Thread

The user explicitly wanted the widget shell and screens finalized before continuing content work.

Two critical UX directions were established:

1. Hover behavior should not expose a “menu of topics”.
2. Local widget screens and Botpress chat should be separated more clearly.

### Hover behavior decision

Rejected behavior:

- on hover, showing a rectangular quick-menu like:
  - appointment
  - prices
  - doctors

Accepted behavior:

- on hover, show a small speech-bubble style greeting above the launcher
- this bubble should feel like a message from the assistant, not a navigation menu

### Internal screen behavior decision

Accepted direction:

- quick actions should open local internal screens
- Botpress should appear only in a dedicated chat mode
- the click-open widget should not repeat the greeting block that already exists in hover

## What Was Actually Implemented In `VirtualAssistant.tsx`

Primary file:

- [client/src/components/VirtualAssistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/VirtualAssistant.tsx)

### 1. Hover preview changed from topic list to greeting bubble

Implemented:

- removed the old hover preview topic list
- hover now shows a speech-bubble style preview
- bubble is positioned above the launcher
- bubble uses `welcomeTitle` and `welcomeText`

### 2. Greeting removed from the internal opened widget

Implemented:

- removed the large internal welcome card from the top of the open panel
- avoids duplicating the same greeting on hover and on click-open

### 3. Internal widget structure refactored

Assistant view model now supports distinct local screens:

- `home`
- `prices`
- `doctors`
- `preparation`
- `contacts`
- `chat`
- `booking`

Behavior now:

- `appointment` opens booking view
- `prices` opens a local prices screen
- `doctors` opens a local doctors screen
- `preparation` opens a local preparation screen
- `contacts` opens a local contacts screen
- `whatsapp` still opens external WhatsApp directly
- Botpress webchat appears only in the dedicated `chat` screen

### 4. Local content screens now have dedicated CTA transitions into chat

Examples:

- price screen includes a CTA to ask Dr. Dia about prices
- doctor screen includes a CTA to ask about doctors
- preparation screen includes a CTA to ask about preparation
- contacts screen includes a CTA to ask about contact-related questions

This keeps local structured navigation and free-form chat separate.

### 5. Launcher visual polish increased

Implemented:

- launcher icon size increased
- glow made stronger and easier to notice against the green-toned site background
- pulse animation made more visible
- shadow under the launcher made stronger

## Production Deployment Workflow Used In This Thread

The user explicitly clarified that local-only verification is not the preferred flow here.

Preferred workflow for this project right now:

- make the change
- deploy it to the live VM
- inspect the real production site

### Production environment details used successfully

- GCP project: `loftvm`
- VM instance: `diavm`
- VM zone: `europe-north1-c`
- server process: `pm2`
- app process: `dialab`

### Production commands that were used

To inspect the VM:

```bash
gcloud compute ssh diavm --zone=europe-north1-c
```

To update the production app file directly:

```bash
gcloud compute ssh diavm --zone=europe-north1-c --command='cat > /home/iram/apps/dialab/client/src/components/VirtualAssistant.tsx' < client/src/components/VirtualAssistant.tsx
```

To rebuild and restart production:

```bash
gcloud compute ssh diavm --zone=europe-north1-c --command='cd /home/iram/apps/dialab && pnpm build && pm2 restart dialab --update-env && pm2 status dialab'
```

To verify public availability:

```bash
curl -I https://dialab.center
```

This workflow worked successfully multiple times during this thread.

## Important Git State Notes

Committed in this thread:

- `b60c3ff` — `Refine Dr. Dia widget interactions`

Important caution:

- this commit contains only the assistant widget work in `VirtualAssistant.tsx`
- there are other unrelated modified/untracked files still present in the repository and they were intentionally not committed

At the end of this thread, remaining dirty files included:

- `client/src/components/DiagnosticsSection.tsx`
- `client/src/components/LaboratorySection.tsx`
- `client/src/lib/services.ts`
- `client/src/pages/admin/SiteSettings.tsx`
- `scripts/seed-service-catalog.ts`
- `docs/updated-service-catalog-2026-04-06.md`
- `scripts/sync-service-catalog.ts`
- `shared/serviceCatalog.ts`

So when continuing in a new thread:

- do not assume the worktree is clean
- do not blindly commit or deploy unrelated changes

## Current Functional Status Of Dr. Dia

As of this handoff:

- hover bubble behavior is implemented
- internal duplicate greeting is removed
- internal view routing is separated into local screens vs chat
- booking flow remains intact
- production has already been rebuilt and restarted with these widget changes

The widget is now much closer to a stable UX shell.

## Recommended Next Steps

Best continuation order:

1. visually review each internal screen on production
2. polish CTA ordering and copy inside:
   - prices
   - doctors
   - preparation
   - contacts
3. confirm whether the `home` screen content should stay minimal or be redesigned further
4. continue filling structured content and static page content into the finalized widget structure
5. only after site content is stable, revisit Botpress knowledge and flows

## Recommended Start Prompt For A New Thread

Use this as the starting context in the next Codex conversation:

> We are continuing work on `dialab-klinika-repo-2` for the live `dialab.center` project.  
> Please read `docs/project-handoff-2026-05-02-dr-dia-widget.md` first.  
> `Dr. Dia` widget hover bubble, internal screen split, and launcher visual polish were already implemented and deployed to the GCP VM.  
> Continue from the current `VirtualAssistant.tsx` state and preserve the production deployment workflow through `diavm` + `pm2`.  
> Be careful not to commit or deploy unrelated dirty worktree changes.
