# Dialab migration snapshot — 2026-11-05

Ram requested a complete AWS-to-Mac/GitHub synchronization before moving hosting. The deployed source is now the active local version. Eight files that existed only in the local deployment branch were removed from the active runtime source; all pre-sync code/history remains in `archive/pre-aws-sync-2026-11-05`.

- Local project: `/Users/iram/Projects/Dialab/dialab-klinika-repo-2`.
- GitHub: `byloftart/dialab-klinika`; synchronized deployment branch `codex/gcp-deploy`, with `main` advanced to the same snapshot.
- Private original snapshot: `.migration-private/aws-2026-11-05/` (ignored by Git).
- Full encrypted GitHub copy and recovery tool: `backups/aws-2026-11-05/`.
- Passphrase: `/Users/iram/.codex/secure-backups/aws-2026-11-05/dialab.passphrase`; never commit it.
- Source/export checksum verification: 3,959 files. MySQL: 13 tables; disposable-schema restore and canonical-data comparison passed. Hermes: three SQLite integrity checks passed. S3: all 41 current objects verified.
- Captured source passed `pnpm check` and `pnpm build` in an isolated directory. Original deployed `dist/` in the active local project and snapshot was preserved.
- EC2 `i-0f2c581b1e92cb913`, region `eu-north-1`, account `350480401714`, was confirmed stopped. Storage and Elastic IP remain allocated.

The assistant/site process state needs review during actual migration: the audit observed `dialab` stopped in PM2 and no `hermes-dr-dia` process. No production repair, new hosting, DNS change or migration deployment was performed. Do not use older account/IP/bucket references in historical handoffs.

Detailed local verification records are in `/Users/iram/Documents/Codex/2026-11-05/aws-migration-sync/`.
