# Dr. Dia Knowledge Review Notes

## High-Priority Findings

- The source batch is useful but not directly runtime-ready: PDF extraction has encoding artifacts and repeated-character headers.
- Laboratory and diagnostic price PDFs are the strongest price sources, but the extracted rows require human review before final publication.
- `Doc1.pdf` lists 10 doctors, while the current production CMS previously exposed fewer active doctors; active/public doctor list needs confirmation.
- Direct doctor phone numbers appear in doctor material. Recommendation: exclude them from public assistant answers and route users through `Qəbul`, `WhatsApp`, or `Telegram`.
- No dedicated preparation-rules source was provided; preparation questions should default to operator handoff unless confirmed rules are added later.

## Normalization Rules Applied In Draft

- Replaced common PDF encoding artifact `ǝ` with Azerbaijani `ə`.
- Collapsed repeated-character artifacts in obvious header lines, such as doubled address/title text.
- Converted price notation like `35-00` into `35.00 AZN` in structured draft data.
- Removed direct doctor phone exposure from public doctor profile notes.

## Still Needs Editorial Review

- Validate every price row against the visual PDF before final runtime use.
- Merge duplicate or near-duplicate service categories into one canonical naming system.
- Decide which doctors are active and should be visible to patients.
- Add confirmed clinic hours from the website/CMS.
- Add preparation guidance documents if Dr. Dia should answer preparation questions directly.
