# Dr. Dia Knowledge Base Workbench

This folder contains the first editorial workbench for the Dr. Dia knowledge base built from the user-provided source documents.

## Files

- `source-inventory.md`: source list, duplicate detection, and role assignment.
- `review-notes.md`: data quality findings, risks, and confirmation needs.
- `canonical-knowledge-draft.md`: human-readable draft knowledge base.
- `structured-knowledge-draft.json`: structured extraction for later runtime integration.

## Current Status

This is the first approved normalization pass. The structured draft has been converted into `shared/drDiaKnowledgeBase.ts` and connected to `assistant.chat` through `server/_core/drDiaKnowledgeContext.ts`.

Current runtime behavior:

- known prices are answered deterministically from the structured knowledge base
- similar service names are disambiguated by exact subject matching first
- contacts and hours still come from CMS settings
- preparation-specific questions route to operator clarification
- doctor direct phone numbers are not exposed in assistant answers
