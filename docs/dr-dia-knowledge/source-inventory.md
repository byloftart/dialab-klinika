# Dr. Dia Knowledge Source Inventory

This inventory records the first source batch provided for building the Dr. Dia knowledge base. It is an editorial/runtime preparation artifact, not the final bot prompt.

| ID | File | Role | Pages | Price values | Duplicate of |
| --- | --- | --- | --- | --- | --- |
| overview | DIALAB Medical Center - Services Overview.pdf | services_overview | 9 | 1 | - |
| diagnostic_price | Dialab-price-diaqnostik-xidmətlər.pdf | diagnostic_prices | 6 | 143 | - |
| lab_price | Dialab-price-labarator-müayinələr.pdf | laboratory_prices | 10 | 297 | - |
| doctors | Doc1.pdf | doctors | 3 | 0 | - |
| website_services | Website services list.pdf | website_service_navigation | 2 | 0 | - |
| doctor_afaq | doc_Nəsibova Afaq.docx | doctor_profile_fragment | 1 | 0 | - |
| diagnostic_price_duplicate | services_diagnostic.pdf | duplicate | 6 | 143 | diagnostic_price |
| lab_price_duplicate | services_lab.pdf | duplicate | 10 | 297 | lab_price |

## Confirmed Duplicates

- `diagnostic_price_duplicate` duplicates `diagnostic_price` exactly by SHA-256.
- `lab_price_duplicate` duplicates `lab_price` exactly by SHA-256.

## Source Roles

- Services overview: use for descriptions and category explanations, not prices.
- Website services list: use as navigation/category skeleton.
- Diagnostic and laboratory price PDFs: use as primary price source after cleanup.
- Doctors PDF/DOCX: use for doctor profiles after clinic confirmation; do not expose direct doctor phone numbers through Dr. Dia.
