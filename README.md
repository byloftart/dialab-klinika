# DIALAB Klinika

Production website and CMS for DIALAB medical center.

- Production site: [https://dialab.center](https://dialab.center)
- Repository: [https://github.com/byloftart/dialab-klinika](https://github.com/byloftart/dialab-klinika)
- Stack: `React 19`, `Vite`, `Express`, `tRPC`, `Drizzle ORM`, `MySQL`, `GCS`

## Current Status

The project is no longer a static landing page. It now includes:

- public website with editable homepage sections
- admin panel for diagnostics, laboratory, gallery, doctors, appointments, feedback
- editable site settings for header, footer, about, FAQ, section order, and more
- editable static pages at `/pages/:slug`
- image uploads stored in `Google Cloud Storage`
- production deployment on `GCP VM + Nginx + PM2`
- database hosted in `Cloud SQL MySQL`

## Production Architecture

- App server: GCP VM running `Ubuntu 24.04 LTS`
- Web server: `Nginx`
- Process manager: `PM2`
- App runtime: `Node.js 22`
- Database: `Cloud SQL MySQL`
- Media storage: `Google Cloud Storage`
- Domain: `dialab.center`

Request flow:

`Browser -> Nginx -> Node/Express -> tRPC/API -> Cloud SQL / GCS`

## Repository Structure

```text
dialab-klinika/
├── client/                 # React frontend
│   ├── src/components/     # Public and admin components
│   ├── src/pages/          # Public and admin routes
│   └── src/lib/            # Frontend helpers
├── server/                 # Express + tRPC backend
│   ├── _core/              # Runtime, auth, upload, env
│   ├── db.ts               # Database access helpers
│   ├── routers.ts          # tRPC routes
│   └── storage.ts          # GCS-backed uploads
├── drizzle/                # Schema and SQL migrations
├── scripts/                # Migration/bootstrap scripts
├── ecosystem.config.cjs    # PM2 config
└── package.json
```

## Main CMS Capabilities

Admin panel currently controls:

- hero slider images and text
- header texts and navigation
- about section text, stats, media, and video URL
- homepage section order and visibility
- laboratory services and sub-tests
- diagnostic services and sub-services
- feedback form and FAQ text
- contact info, working hours, socials, footer
- additional content pages

## Environment Variables

Use `.env.example` as the base template.

Required for the current production-style setup:

- `DATABASE_URL`
- `JWT_SECRET`
- `GCS_BUCKET_NAME`
- `GCS_PUBLIC_BASE_URL`
- `PORT`

Optional or legacy variables still referenced by parts of the codebase:

- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`

## Local Development

### Requirements

- `Node.js 22+`
- `pnpm`
- reachable MySQL database

### Install

```bash
pnpm install
cp .env.example .env
```

### Run

```bash
pnpm dev
```

App runs at:

- frontend + backend: [http://localhost:3000](http://localhost:3000)

### Checks

```bash
pnpm check
pnpm test
pnpm build
```

## Database and Migrations

Schema lives in [drizzle/schema.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/drizzle/schema.ts).

Apply migrations:

```bash
pnpm db:migrate
```

This script:

1. applies SQL migrations from `drizzle/`
2. creates the first admin user only if no admin exists

Latest important migration:

- `0003_add_lab_images_and_static_pages.sql`

## Deployment

### Current production workflow

```bash
git pull
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
pm2 restart dialab --update-env
```

### Process management

```bash
pm2 status
pm2 logs dialab
pm2 restart dialab --update-env
```

### Nginx

Nginx proxies public traffic on `80/443` to the Node app on `localhost:3000`.

### Media uploads

Uploads are handled by [server/storage.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/storage.ts) and stored in GCS, not in local `dist/`.

## Important Routes

Public:

- `/`
- `/login`
- `/pages/:slug`
- `/api/health`

Admin:

- `/admin`
- `/admin/laboratory`
- `/admin/diagnostics`
- `/admin/doctors`
- `/admin/gallery`
- `/admin/pages`
- `/admin/appointments`
- `/admin/feedback`
- `/admin/settings`

## Important Files

- [client/src/pages/Home.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/Home.tsx)
- [client/src/pages/admin/SiteSettings.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/SiteSettings.tsx)
- [client/src/pages/admin/Pages.tsx](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/client/src/pages/admin/Pages.tsx)
- [server/routers.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/routers.ts)
- [server/db.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/db.ts)
- [server/storage.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/server/storage.ts)
- [drizzle/schema.ts](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/drizzle/schema.ts)
- [ecosystem.config.cjs](/Users/iram/Projects/Dialab/dialab-klinika-repo-2/ecosystem.config.cjs)

## Recovery on Another Computer

To continue work elsewhere:

1. clone the repository
2. copy `.env.example` to `.env` and fill real values
3. run `pnpm install`
4. run `pnpm db:migrate`
5. run `pnpm dev`

If deploying directly to the production VM:

1. pull latest GitHub changes
2. verify env file is present on server
3. run `pnpm db:migrate`
4. run `pnpm build`
5. run `pm2 restart dialab --update-env`

## Notes

- The repo still contains some legacy Manus/Forge-related code paths. They are not the primary deployment path anymore.
- Auth hardening can be improved later without reworking the current platform architecture.
- The project currently uses `pnpm` as the intended package manager.
