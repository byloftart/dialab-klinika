# Project Handoff: diavm AWS Migration Completion

Date: 2026-05-09

## Current Checkpoint

The Dialab production stack has been manually migrated from Google Cloud Platform to AWS without AWS MGN.

- Production site: `https://dialab.center`
- Production IP: `13.48.91.166`
- AWS account: `293033346129`
- AWS region: `eu-north-1`
- AWS EC2 instance: `i-0ec73398e028273e5`
- AWS EC2 name: `diavm-aws-manual`
- Production app path: `/home/iram/apps/dialab`
- Production PM2 user: `iram`
- Production PM2 app: `dialab`
- Hermes PM2 process: `hermes-dr-dia`
- DNS: `dialab.center` and `www.dialab.center` point to `13.48.91.166`
- SSL: Let's Encrypt certificate installed on AWS for `dialab.center` and `www.dialab.center`

GCP remains a temporary fallback only. Do not delete GCP resources until the owner explicitly confirms the post-migration observation window is complete.

## Preserved Dialog Context

This handoff preserves the operational decisions and final state from the two migration dialogs:

1. Manual `diavm` migration from GCP to AWS after AWS MGN was abandoned.
2. Final backend migration from GCP Cloud SQL and GCS to AWS-local MySQL and S3.

The full pinned chat UI is not directly readable from the repository, so this document records the available migration context, exact infrastructure state, verification results, and next operational steps.

## Original Source State

GCP source:

- GCP project: `loftvm`
- GCP VM: `diavm`
- Zone: `europe-north1-c`
- Old production IP: `35.228.12.235`
- OS: Ubuntu 24.04 LTS
- Original VM shape: `n2d-standard-2`, temporarily switched to `e2-standard-2`
- Boot disk: 25 GB
- Pre-MGN snapshot: `diavm-pre-mgn-kernel-20260506190001`

GCP production services before migration:

- Nginx served `dialab.center` and `www.dialab.center`
- Node/Express app proxied on `127.0.0.1:3000`
- PM2 app `dialab`
- Hermes PM2 process `hermes-dr-dia`
- Cloud SQL MySQL: `dialab-mysql-prod`
- GCS bucket: `dialab-center-media-loftvm`

## AWS Target State

Compute:

- Instance type: `m7i-flex.large`
- vCPU/RAM: 2 vCPU / 8 GB RAM
- Root disk: about 50 GB gp3
- Filesystem verification after migration: about 48 GB available root volume, about 6.1 GB used
- Memory verification after migration: about 7.6 GiB total, about 6.4 GiB available

Networking:

- VPC: `vpc-045bfb75104f829d5`
- Public subnet: `subnet-0cd58bd32566c5bc9`
- Additional subnet created during RDS attempt: `subnet-03cb7436188903005`
- EC2 security group: `sg-0e8883f3be829f565`
- HTTP/HTTPS open publicly
- SSH restricted by the migration security group rules

Storage:

- Local MySQL on EC2 is the active app database
- S3 bucket for media: `dialab-center-media-aws-293033346129`
- S3 region: `eu-north-1`
- S3 public base URL: `https://dialab-center-media-aws-293033346129.s3.eu-north-1.amazonaws.com`
- EC2 IAM instance profile: `diavm-s3-media-profile`
- EC2 IAM role: `diavm-s3-media-role`

## Runtime State

PM2 processes:

- `dialab`: website, backend, API, Telegram webhook adapter
- `hermes-dr-dia`: Hermes gateway for Dr. Dia

System services:

- `nginx`: active
- `mysql`: active
- `pm2-iram.service`: active

Production app environment now uses:

- `DATABASE_URL` with host `127.0.0.1`
- `STORAGE_PROVIDER=s3`
- `AWS_REGION=eu-north-1`
- `S3_BUCKET_NAME=dialab-center-media-aws-293033346129`
- `S3_PUBLIC_BASE_URL=https://dialab-center-media-aws-293033346129.s3.eu-north-1.amazonaws.com`
- `GCS_BUCKET_NAME` unset/blank
- `GCS_PUBLIC_BASE_URL` unset/blank

Never document or commit real database passwords, JWT secrets, Hermes keys, Telegram tokens, webhook secrets, LLM keys, or cloud credentials.

## Completed Migration Work

AWS MGN cleanup:

- MGN source server `s-2f90d65bcf6880fab` deleted after service disconnect.
- MGN snapshot and staging network resources were removed.
- MGN is no longer part of the migration path.

AWS app migration:

- Fresh AWS EC2 created in `eu-north-1`.
- Ubuntu 24.04 runtime prepared.
- Nginx, Node.js 22, pnpm, PM2, certbot, rsync, MySQL, and baseline packages installed.
- `/home/iram/apps/dialab` copied to AWS.
- `/home/iram/.hermes` copied to AWS.
- Hermes runtime dependencies under `/home/iram/.local` copied/restored.
- PM2 startup restored under `iram`.
- Nginx restored and validated.
- Let's Encrypt certificate issued after DNS cutover.

Database migration:

- Cloud SQL source database: `dialab-mysql-prod`.
- Database: `dialab`.
- Application user: `dialab_app`.
- A final dump was taken while `dialab` was stopped.
- Dump file on AWS: `/home/iram/backups/mysql-migration/dialab-cloudsql-final-20260509T174454Z.sql.gz`.
- Local MySQL database `dialab` created on AWS EC2.
- Data imported successfully.
- App `.env` and `.env.production` were switched to local MySQL.
- Backups created on AWS before DB env changes:
  - `/home/iram/apps/dialab/.env.pre-aws-mysql`
  - `/home/iram/apps/dialab/.env.production.pre-aws-mysql`

Media migration:

- GCS source bucket: `dialab-center-media-loftvm`
- GCS size: about 6.4 MiB
- Object count: 41
- S3 target bucket: `dialab-center-media-aws-293033346129`
- All 41 objects copied to S3.
- The application storage layer was extended to support S3 through the AWS SDK and EC2 IAM role credentials.
- Database values containing the old GCS public base were replaced with the S3 public base.
- Old GCS URL matches after replacement: `0`.
- S3 URL matches after replacement: `6`.
- Backups created on AWS before storage code changes:
  - `/home/iram/apps/dialab/server/storage.ts.pre-s3-migration`
  - `/home/iram/apps/dialab/server/_core/env.ts.pre-s3-migration`
  - `/home/iram/apps/dialab/.env.pre-s3-migration`
  - `/home/iram/apps/dialab/.env.production.pre-s3-migration`

Old AWS database cleanup:

- Old Aurora PostgreSQL instances deleted:
  - `database-1-instance-1`
  - `database-2-instance-1`
- Old Aurora clusters deleted:
  - `database-1`
  - `database-2`
- Manual RDS snapshots were checked and none remained.

## Verification Results

Production HTTP/SSL:

```text
https://dialab.center      -> 200, remote IP 13.48.91.166, SSL verify 0
https://www.dialab.center  -> 200, remote IP 13.48.91.166, SSL verify 0
```

DNS:

```text
dialab.center      -> 13.48.91.166
www.dialab.center  -> 13.48.91.166
```

Build and type checks:

```text
pnpm check -> passed
pnpm build -> passed
```

Database verification:

```json
{
  "databaseHost": "127.0.0.1",
  "tables": 13,
  "remainingGcsUrls": 0,
  "s3UrlMatches": 6,
  "storageProvider": "s3",
  "s3Bucket": "dialab-center-media-aws-293033346129"
}
```

S3 verification:

- Direct S3 object URL returned `200`.
- Upload through the same AWS SDK path used by the app succeeded from EC2.
- Temporary migration health-check files were removed afterward.
- Final S3 object count remained 41.

PM2 verification:

```text
dialab        online, user iram
hermes-dr-dia online, user iram
```

AWS RDS cleanup verification:

- `describe-db-instances` returned no DB instances.
- `describe-db-clusters` returned no DB clusters.
- Manual DB snapshots and cluster snapshots returned no results.

## Current Production Architecture

```text
Browser
  -> Spaceship DNS
  -> AWS Elastic IP 13.48.91.166
  -> AWS EC2 nginx
  -> Node / Express / tRPC on 127.0.0.1:3000
  -> Local MySQL on 127.0.0.1:3306
  -> S3 media bucket in eu-north-1
  -> Hermes gateway on the same EC2 host
  -> LLM provider through Hermes
```

## Operational Guardrails

- GCP is fallback only; do not delete it without explicit confirmation.
- Do not switch DNS back unless a rollback is explicitly requested.
- Do not expose secrets in logs, docs, screenshots, or commits.
- PM2 commands must run as user `iram` with `PM2_HOME=/home/iram/.pm2`.
- Treat the AWS production app path as the live runtime source until a cleaner deploy pipeline is created.

## Recommended Next Operations

Highest priority:

1. Add automated MySQL backups on AWS.
2. Store backups in S3 with lifecycle retention.
3. Enable S3 bucket versioning or at least a retention policy for media.
4. Keep GCP VM and Cloud SQL for a short observation period.
5. After the observation period, make a separate decommission plan for GCP resources.

Good follow-up:

1. Consider moving MySQL to RDS later if account quota/plan allows it.
2. Add a small production health-check script.
3. Add monitoring for disk, memory, nginx, PM2, MySQL, certificate expiry, and S3 upload failures.
4. Replace manual file-copy deployment with a clean GitHub-based production deploy path.

## Resume Prompt

Use this prompt if work resumes in a new Codex thread:

```text
We are continuing the Dialab project after the completed GCP-to-AWS migration.

Read first:
- AGENTS.md
- README.md
- docs/project-handoff-2026-05-09-diavm-aws-migration.md
- docs/ops/aws-production-runbook.md

Production is now AWS:
- Site: https://dialab.center
- IP: 13.48.91.166
- EC2: i-0ec73398e028273e5, region eu-north-1
- App path: /home/iram/apps/dialab
- PM2 user: iram
- PM2 apps: dialab, hermes-dr-dia
- Active DB: local MySQL on 127.0.0.1
- Active media storage: S3 bucket dialab-center-media-aws-293033346129
- GCP remains fallback only.

Do not delete GCP, do not expose secrets, and do not reset unrelated repo changes.
Next recommended task: configure automated MySQL backups to S3 and a small production health-check runbook.
```
