# Dialab AWS recovery snapshot

Complete application snapshot captured on November 5, 2026 (Baku time). The active source tree matches the stopped AWS instance. Existing local documentation remains available. Pre-sync source is preserved in branch `archive/pre-aws-sync-2026-11-05`.

The encrypted archive contains:

- `export/app/`: exact server source, production `dist/`, active environment files and historical configuration/code copies.
- `export/database/dialab.sql.gz`: MySQL database, including content, accounts, requests and messages. A real restore into a disposable schema passed; canonical data and all 13 table counts matched.
- `export/hermes/`: Dr. Dia/Hermes source, settings, authentication files, skills, sessions and three consistent SQLite backups.
- `export/system/`, process definitions and local entrypoints: Nginx, TLS keys/certificates, MySQL, PM2 and systemd settings.
- `cloud/`: AWS resource configuration, S3 settings and all 41 current S3 objects (6,688,286 bytes), with verified checksums.

Dependency installations, caches, service logs and obsolete release/backup directories are excluded. Package manifests/lockfiles and the deployed build are retained. This is an application recovery snapshot, not a bootable operating-system image.

## Recover

All `snapshot.tar.gz.gpg.part-*` files and `manifest.json` must be in this directory. They use GnuPG symmetric AES-256 with integrity protection. The recovery passphrase is deliberately excluded from GitHub. On Ram's Mac it is stored at:

`/Users/iram/.codex/secure-backups/aws-2026-11-05/dialab.passphrase`

With Python 3 and GnuPG installed:

```sh
python3 restore_snapshot.py \
  --passphrase-file /Users/iram/.codex/secure-backups/aws-2026-11-05/dialab.passphrase \
  --output-dir /Users/iram/Projects/Dialab/recovered-aws-2026-11-05
```

The script checks encrypted chunks, decrypts the archive, verifies the archive SHA-256, extracts it and verifies every original file and S3 checksum. A full recovery with this script passed before upload.

The ready-to-use protected snapshot is also retained locally in `.migration-private/aws-2026-11-05/`. Keep the passphrase separately from the encrypted backup, in a password manager or another secure backup location.

## Restore on a replacement host

Restore MySQL 8 from `export/database/dialab.sql.gz`. Install app dependencies from the lockfile and restore `export/app/` to the chosen application directory. Both `pnpm check` and `pnpm build` passed on the captured source; the original production build is retained separately in the snapshot.

Restore the S3 objects to the selected destination and update storage/database/provider settings for the new environment. Restore Hermes source and state, install its Python dependencies, then adapt process definitions and Nginx paths. `export/system/` contains Linux host settings; copy only the settings required by the replacement host.

At capture, PM2 listed the `dialab` application as stopped and did not list `hermes-dr-dia`. The snapshot preserves this state; successful archive recovery is not a claim that the website and assistant have been repaired or started. Verify these services during the migration step.

AWS instance `i-0f2c581b1e92cb913` was confirmed stopped after collection. Its EBS disk, Elastic IP and S3 storage remain billable until explicitly removed.
