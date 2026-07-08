# Dialab New AWS Account Migration Handoff

Date: 2026-07-07

## Goal

Move the full Dialab production platform to a different AWS account while keeping the site, backend, CMS, MySQL-backed content, S3 media, and Dr. Dia assistant functionality available.

## New AWS Account Target

- AWS account: `350480401714`
- AWS CLI profile on this workstation: `dialab-new`
- Region: `eu-north-1` / Europe Stockholm
- EC2 instance: `i-0f2c581b1e92cb913`
- EC2 name: `dialab-prod-new`
- EC2 type: `t3.small`
- Public IP: `16.192.22.57`
- SSH key: `/Users/iram/.ssh/dialab-new-20260707.pem`
- SSH command: `ssh -i ~/.ssh/dialab-new-20260707.pem ubuntu@16.192.22.57`
- App path: `/home/iram/apps/dialab`
- App user: `iram`
- PM2 home: `/home/iram/.pm2`
- PM2 app: `dialab`
- Local MySQL database: `dialab`
- New S3 media bucket: `dialab-center-media-aws-350480401714`
- S3 public base URL: `https://dialab-center-media-aws-350480401714.s3.eu-north-1.amazonaws.com`
- Security group: `sg-0dbe0df52a9a219a2`
- Instance profile: `dialab-prod-s3-profile`
- IAM role: `dialab-prod-s3-role`

## New Server State

Completed:

- Created key pair, security group, S3 bucket, IAM role, instance profile, and EC2 instance in the new account.
- Installed Ubuntu 24.04 runtime dependencies through EC2 user data: nginx, MySQL, Node.js 22, pnpm/corepack, PM2, certbot, rsync, git, build tools.
- Added 4 GB swap on the `t3.small` instance.
- Copied the local repo checkout to `/home/iram/apps/dialab`.
- Ran `pnpm install --frozen-lockfile`.
- Ran `pnpm check`.
- Ran `pnpm build`.
- Created a temporary clean local MySQL database and generated server-side secrets for bootstrap testing.
- Started PM2 app `dialab`.
- Configured nginx on port 80 as a reverse proxy to `127.0.0.1:3000`.
- Verified `http://16.192.22.57` returns `200`.
- Verified `http://16.192.22.57/api/health` returns JSON health output.
- Verified S3 upload from the EC2 instance through the instance IAM role.
- Removed the S3 migration health-check object after testing.
- DNS cutover completed on 2026-07-08: `dialab.center` and `www.dialab.center` point to `16.192.22.57`.
- Let's Encrypt certificate installed on the new server for `dialab.center` and `www.dialab.center`.
- Certificate path: `/etc/letsencrypt/live/dialab.center/fullchain.pem`.
- Certificate expiry observed from certbot: 2026-10-06.
- Certbot automatic renewal task is installed.
- HTTP now redirects to HTTPS.
- `pm2-iram.service` was repaired and is `active`, so PM2 should resurrect after reboot.

Updated later on 2026-07-07: the new server was upgraded from the bootstrap state to a full production copy. The old app directory, production `.env` files, MySQL data, Hermes runtime, `.local` runtime files, PM2 state, and S3 media were migrated from the old AWS account.

Verified on the new server:

- PM2 apps `dialab` and `hermes-dr-dia` are `online`.
- `http://16.192.22.57` returns `200`.
- `http://16.192.22.57/api/health` returns JSON health output.
- `Host: dialab.center` against `http://16.192.22.57` returns `200`.
- Assistant config reports Hermes provider configured with model `dr-dia-hermes`.
- Local MySQL has 13 tables and 1 user row.
- S3 media rows were updated from `dialab-center-media-aws-293033346129` to `dialab-center-media-aws-350480401714`.
- New S3 bucket has 41 copied media objects and direct object read returns `200`.
- Temporary local and server-side migration copies were removed after import.
- Final HTTPS checks on 2026-07-08:
  - `https://dialab.center` returns `200`, remote IP `16.192.22.57`, SSL verify `0`.
  - `https://www.dialab.center` returns `200`, remote IP `16.192.22.57`, SSL verify `0`.
  - Assistant config reports Hermes provider configured with model `dr-dia-hermes`.

## Source Access Notes

The current/old AWS production details from repo docs are:

- AWS account: `293033346129`
- Region: `eu-north-1`
- EC2 instance: `i-0ec73398e028273e5`
- EC2 name: `diavm-aws-manual`
- Public IP: `13.48.91.166`
- App path: `/home/iram/apps/dialab`
- Local MySQL on `127.0.0.1:3306`
- Old S3 media bucket: `dialab-center-media-aws-293033346129`

Source blockers observed earlier on 2026-07-07:

- Old AWS default CLI credentials are invalid: `InvalidClientTokenId` / `AuthFailure`.
- SSH to old AWS EC2 using `/Users/iram/Documents/Codex/2026-05-07/markdown-diavm-google-cloud-platform-aws/diavm-aws-manual-20260507.pem` times out on port 22:

```text
ssh: connect to host 13.48.91.166 port 22: Operation timed out
```

- Local workstation search did not find production `.env`, `.env.production`, MySQL dump, or production backup dump files.
- GCP fallback lookup in the active local `gcloud` context did not list a usable `diavm` instance.

Resolved later on 2026-07-07:

- Old AWS API access was restored for account `293033346129`.
- Old EC2 was found stopped as `t3.micro`.
- Old EC2 was temporarily changed to `t3.small` and started so SSH and production export could complete.
- SSH source access worked from current IP `37.114.150.192`.
- Source PM2 apps `dialab` and `hermes-dr-dia` were restarted and verified `online` after the export.
- The temporary AMI `ami-0ea450c31c5c50c54` and snapshot `snap-037878c635329b557`, created before direct SSH migration succeeded, were deregistered/deleted to avoid extra snapshot costs.
- After the successful DNS/SSL cutover, old EC2 `i-0ec73398e028273e5` was stopped on 2026-07-08. It remains available as a stopped fallback in the old AWS account.

## Commands To Check New Server

```bash
ssh -i ~/.ssh/dialab-new-20260707.pem ubuntu@16.192.22.57
```

```bash
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status --no-color'
```

```bash
curl -sS -o /dev/null -w 'http:%{http_code}\n' http://16.192.22.57
curl -sS http://16.192.22.57/api/health
```

```bash
sudo systemctl is-active nginx mysql pm2-iram.service
free -h
df -h /
```

## Remaining Work

Production traffic is now cut over to the new AWS account.

Recommended follow-up:

1. Verify CMS login manually in the browser.
2. Verify one Dr. Dia chat response from the public widget.
3. Verify upload through admin media/image forms.
4. Keep the old AWS EC2 stopped for a short observation period before deleting old resources.
5. Later, decide whether to release old Elastic IP `13.48.91.166` and delete old EBS resources after the observation window.

Useful verification commands:

```bash
curl -sS -o /dev/null -w 'root:%{http_code} ip:%{remote_ip} ssl:%{ssl_verify_result}\n' https://dialab.center
curl -sS -o /dev/null -w 'www:%{http_code} ip:%{remote_ip} ssl:%{ssl_verify_result}\n' https://www.dialab.center
```

Check new server services:

```bash
ssh -i ~/.ssh/dialab-new-20260707.pem ubuntu@16.192.22.57
sudo systemctl is-active nginx mysql pm2-iram.service
sudo -iu iram bash -lc 'PM2_HOME=/home/iram/.pm2 pm2 status --no-color'
```

Do not delete or terminate the old AWS or GCP resources until the new production path has been verified end to end on the real domain.
