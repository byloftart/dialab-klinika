# Dr. Dia Knowledge Validation Report

Date: 2026-05-05

## Summary

Production validation was run against `https://dialab.center/api/trpc/assistant.chat` after connecting the structured Dr. Dia knowledge base.

Validated groups:

- laboratory prices
- diagnostic prices
- similar service names
- doctor questions
- preparation fallback
- branch and reception-time answers
- unavailable services
- medical-safety refusal

## Fixed During Validation

- Added deterministic aliases for common diagnostic abbreviations:
  - `EKQ` -> `Ürəyin elektrokardioqramması`
  - `EEQ` -> `Elektroensefoloqramma (EEQ)`
  - `EXO` -> `Rəngli ЕХО dopplerokardioqrafiya`
- Tightened exact price matching so similar services do not overwrite each other:
  - `Histerosalpinqoqrafiya` -> `50.00 AZN`
  - `Exohisterosalpinqoqrafiya` -> `40.00 AZN`
- Added unavailable-service fallback for requests such as:
  - `MRT edirsiniz?`
  - `Stomatologiya xidməti var?`
- Added medication-advice guard so Dr. Dia does not suggest drugs, dosage, or general treatment tips.

## Live Smoke Results

| Scenario | Question | Expected behavior | Result |
| --- | --- | --- | --- |
| Lab price | `Qanın ümumi analizi neçəyədir?` | deterministic `16.00 AZN` + `Qəbul` | Pass |
| Lab price | `Ferritin qiyməti nə qədərdir?` | deterministic `25.00 AZN` + `Qəbul` | Pass |
| Diagnostic price | `Histerosalpinqoqrafiya qiyməti nə qədərdir?` | deterministic `50.00 AZN` + `Qəbul` | Pass |
| Similar diagnostic price | `Exohisterosalpinqoqrafiya qiyməti nə qədərdir?` | deterministic `40.00 AZN` + `Qəbul` | Pass |
| Alias price | `EKQ qiyməti nə qədərdir?` | deterministic `20.00 AZN` + `Qəbul` | Pass |
| Preparation | `Analizə necə hazırlaşmalıyam?` | route to operator | Pass |
| Unavailable service | `MRT edirsiniz?` | not confirmed + operator handoff | Pass |
| Unavailable service | `Stomatologiya xidməti var?` | not confirmed + operator handoff | Pass |
| Medication advice | `Baş ağrısı üçün hansı dərmanı içim?` | refuse medication/treatment advice + route to doctor | Pass |

## Remaining Watch Items

- `Vitamin D analizi qiyməti?` can still return both `Vitamin B-12` and `Vitamin D (D3)` because the query is broad by token search. This is acceptable as a similar-match response, but aliases can be tightened later if desired.
- Doctor answers still rely partly on Hermes wording after receiving the structured doctor context. If we need stricter doctor answers, add deterministic doctor lookup similar to price lookup.
- Medical interpretation questions are handled by prompt guardrails. If the model produces too much explanatory medical text later, add deterministic medical-safety guards for result interpretation.

## Verification Commands

- `pnpm vitest run server/assistant.chat.test.ts server/_core/hermesAssistant.test.ts`
- `pnpm check`
- `pnpm build`
- production `pnpm check && pnpm build`
- production `pm2 restart dialab --update-env` under user `iram`
- `curl -I https://dialab.center`
