# AWS Production Runbook

Date: 2026-05-09

This runbook is for the AWS-hosted Dialab production stack after the manual `diavm` migration.

## Production Facts

- Site: `https://dialab.center`
- Production IP: `13.48.91.166`
- AWS region: `eu-north-1`
- EC2 instance: `i-0ec73398e028273e5`
- App path: `/home/iram/apps/dialab`
- App user: `iram`
- PM2 home: `/home/iram/.pm2`
- PM2 apps: `dialab`, `hermes-dr-dia`
- Database: local MySQL on `127.0.0.1:3306`
- Media bucket: `dialab-center-media-aws-293033346129`
- Media public base: `https://dialab-center-media-aws-293033346129.s3.eu-north-1.amazonaws.com`

The private SSH key used during migration is intentionally not committed to the repository.

## SSH

From the migration workstation, use the local private key file and connect as `ubuntu`:

```bash
ssh -i /path/to/diavm-aws-manual-20260507.pem ubuntu@13.48.91.166
```

After connecting, use `sudo -iu iram` for application-level commands.

## Check Production

Public checks:

```bash
dig +short dialab.center A
dig +short www.dialab.center A
curl -sS -o /dev/null -w 'root:%{http_code} ip:%{remote_ip} ssl:%{ssl_verify_result}\n' https://dialab.center
curl -sS -o /dev/null -w 'www:%{http_code} ip:%{remote_ip} ssl:%{ssl_verify_result}\n' https://www.dialab.center
```

Expected:

```text
13.48.91.166
root:200 ip:13.48.91.166 ssl:0
www:200 ip:13.48.91.166 ssl:0
```

Server checks:

```bash
sudo systemctl is-active nginx mysql pm2-iram.service
sudo -iu iram PM2_HOME=/home/iram/.pm2 pm2 status
df -h /
free -h
```

## Build And Restart

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && pnpm check && pnpm build'
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && PM2_HOME=/home/iram/.pm2 pm2 restart dialab --update-env && PM2_HOME=/home/iram/.pm2 pm2 save'
```

Check local app response:

```bash
curl -sS -o /dev/null -w 'local:%{http_code}\n' http://127.0.0.1:3000
```

## Check Active Database And Storage

Run on EC2:

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && node --input-type=module <<'"'"'NODE'"'"'
import "dotenv/config";
import mysql from "mysql2/promise";

const db = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [[tables]] = await conn.query(
  "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
);
await conn.end();

console.log(JSON.stringify({
  databaseHost: db.hostname,
  tables: Number(tables.count),
  storageProvider: process.env.STORAGE_PROVIDER,
  s3Bucket: process.env.S3_BUCKET_NAME,
  gcsBucketConfigured: Boolean(process.env.GCS_BUCKET_NAME)
}, null, 2));
NODE'
```

Expected shape:

```json
{
  "databaseHost": "127.0.0.1",
  "tables": 13,
  "storageProvider": "s3",
  "s3Bucket": "dialab-center-media-aws-293033346129",
  "gcsBucketConfigured": false
}
```

## S3 Upload Smoke Test

Run on EC2. This uses the EC2 IAM role, not static AWS keys.

```bash
sudo -iu iram bash -lc 'cd /home/iram/apps/dialab && node --input-type=module <<'"'"'NODE'"'"'
import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const key = `migration-healthcheck/${Date.now()}.txt`;
const s3 = new S3Client({ region: process.env.AWS_REGION || "eu-north-1" });

await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: key,
  Body: `health ${new Date().toISOString()}\n`,
  ContentType: "text/plain",
  CacheControl: "no-store"
}));

console.log(`https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`);
NODE'
```

Remove the health-check object after testing:

```bash
aws s3 rm s3://dialab-center-media-aws-293033346129/migration-healthcheck/ --recursive
```

If AWS CLI is not installed on EC2, remove it from the workstation using the AWS CLI there.

## MySQL Backups

Backups are the next important operations task. Until automated backups are added, create a manual backup before risky work:

```bash
sudo install -d -o iram -g iram -m 0700 /home/iram/backups/mysql-manual
sudo -iu iram bash -lc 'cd /home/iram/backups/mysql-manual && mysqldump --defaults-extra-file=/home/iram/.my.cnf dialab | gzip > dialab-$(date -u +%Y%m%dT%H%M%SZ).sql.gz'
```

Use a protected MySQL option file such as `/home/iram/.my.cnf` for credentials. Do not print the password into terminal logs or commit it.

Recommended automated backup shape:

```text
mysqldump dialab -> gzip -> upload to private S3 backup prefix -> retain daily/weekly copies with lifecycle policy
```

Suggested backup bucket/prefix:

```text
s3://dialab-center-media-aws-293033346129/backups/mysql/
```

Use a private backup bucket later if the production account allows one cleanly. The current media bucket has public object read for media URLs, so database backups must never be uploaded under a public-readable prefix unless the bucket policy is narrowed first.

## Rollback Notes

GCP was intentionally left as fallback after migration.

Rollback would require a deliberate DNS change back to the old GCP IP and validation of the old GCP VM/Cloud SQL state. Do not perform rollback automatically.

## Do Not Commit

Never commit:

- `.env`
- `.env.production`
- SSH private keys
- database dump files
- database passwords
- Telegram tokens
- webhook secrets
- Hermes or LLM API keys
- AWS access keys
