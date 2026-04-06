# DIALAB Project Handoff — 2026-04-06

Compact project handoff for continuing work in a new Codex thread.

## Current Project Context

- Project: `DIALAB Klinika`
- Production site: `https://dialab.center`
- Repository: `dialab-klinika-repo-2`
- Current working branch during assistant work: `codex/gcp-deploy`
- Last major assistant checkpoint commit: `c969669` — `Add Dr. Dia assistant MVP shell and integrations`

Main product state:

- public website and admin CMS are live
- assistant widget `Dr. Dia` already exists in the site codebase
- Botpress integration scaffolding exists, but Botpress rollout is intentionally paused
- new authoritative clinic data has recently become available and should be pushed into the website/CMS first

## What Is Already Implemented

### Website assistant shell

Implemented in [client/src/components/VirtualAssistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/VirtualAssistant.tsx):

- branded floating launcher
- assistant panel shell
- local quick actions
- booking form state
- success/error request states
- mobile-aware panel behavior
- current launcher hover/preview experiments

### Assistant backend and config

Implemented in:

- [client/src/lib/assistant.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/lib/assistant.ts)
- [server/routers.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/routers.ts)
- [server/_core/env.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/_core/env.ts)

Includes:

- `AssistantChatContext`
- `BookingSubmissionPayload`
- `assistant.config`
- `assistant.submitBooking`
- Botpress provider env support

### Admin panel for assistant

Implemented in:

- [client/src/pages/admin/Assistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/Assistant.tsx)
- [client/src/components/admin/AdminLayout.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/admin/AdminLayout.tsx)

Current settings support:

- widget enable/disable
- launcher visibility
- welcome title/text
- WhatsApp / Instagram / Telegram URLs
- booking webhook URL
- booking success/error copy

### Botpress planning artifact

Documented in:

- [docs/dr-dia-botpress-content-map.md](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/docs/dr-dia-botpress-content-map.md)

This is a planning/reference artifact, not the next implementation priority.

## What Is Intentionally Paused

Botpress is paused on purpose for now.

Reason:

- the clinic now has new authoritative data
- website/CMS should become the primary source of truth first
- after site data is updated, it will also simplify the future assistant knowledge base

So the current rule is:

- do **not** prioritize Botpress flows right now
- do **not** build out knowledge behavior before the website content is updated
- keep the existing assistant scaffolding, but shift active work to CMS/content updates

## Working Queue From This Point

### Priority 1 — Update website/CMS with the new real clinic data

This is now the main task queue.

Focus areas:

- services
- prices
- doctors
- preparation-related content
- contact data
- any related static pages or CMS-managed sections

Goal:

- make the website the authoritative source for current clinic information

### Priority 2 — Validate site content structure after updates

After the data is entered:

- verify what is already structured cleanly in CMS
- identify what still exists only as raw text
- determine what is reusable directly for the assistant later

Goal:

- know which content is already assistant-ready and which still needs normalization

### Priority 3 — Return to Dr. Dia after CMS updates

Once website data is current:

- refine widget internals if needed
- simplify hover/launcher polish
- align local widget states with the updated website content

Goal:

- make the widget reflect the real current clinic content before Botpress rollout

### Priority 4 — Resume Botpress implementation on top of the updated content base

Only after the site content is updated:

- revisit the Botpress content map
- create actual flows
- configure bot instructions and knowledge behavior
- connect Botpress to the already-updated site reality

Goal:

- avoid duplicated content work and prevent knowledge drift

## Key Product Decisions Already Locked

- Canonical assistant name: `Dr. Dia`
- Patient-facing language for the assistant: Azerbaijani
- Assistant role in MVP: clinic navigator + appointment request assistant
- Website remains primary UX owner
- Booking remains website-owned request flow, not live slot booking
- Botpress is a secondary conversation/knowledge layer, not the primary UI layer

## Important Notes For The Next Thread

- If the next thread is about CMS/data updates, start from the website as the source of truth, not from Botpress.
- If the next thread is about the assistant, first check whether the new clinic data has already been entered into the site.
- If data is not yet updated in CMS, Botpress work should stay paused.
- Launcher hover micro-interactions are acceptable to polish later; they are not the current priority.

## Useful Reference Files

- [README.md](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/README.md)
- [client/src/components/VirtualAssistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/components/VirtualAssistant.tsx)
- [client/src/pages/admin/Assistant.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/Assistant.tsx)
- [docs/dr-dia-botpress-content-map.md](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/docs/dr-dia-botpress-content-map.md)

## Recommended Start Prompt For A New Thread

Use this as the starting context in the next Codex conversation if needed:

> We are working on the live `dialab.center` project in `dialab-klinika-repo-2`.  
> `Dr. Dia` assistant shell is already implemented, but Botpress work is intentionally paused.  
> The current priority is updating the website/CMS with newly available clinic data so the site becomes the primary source of truth.  
> After CMS updates, we will return to the assistant and later resume Botpress alignment.
