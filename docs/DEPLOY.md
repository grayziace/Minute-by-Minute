# Minute by Minute — Deployment (HK VPS)

## Prerequisites

- Docker and Docker Compose on HK VPS
- Domain pointing to VPS (optional)
- Cloudflare R2 credentials for production storage

## Quick start (development)

```bash
docker compose up -d postgres minio
cp apps/web/.env.example apps/web/.env.local
npm run db:push --prefix apps/web
npm run dev --prefix apps/web
```

## Production deploy

1. Copy `.env.example` to `.env` on the VPS and fill in:
   - `DATABASE_URL` (Postgres on same VPS or managed)
   - R2/S3 credentials
   - `SESSION_SECRET`, `RP_ID`, `RP_ORIGIN`
   - `NEXT_PUBLIC_AMAP_KEY`

2. Build and run:

```bash
docker compose up -d --build
docker compose exec web npm run db:push
```

3. HTTPS: use Caddy or nginx reverse proxy in front of port 3000.

## Backups

- Postgres: daily `pg_dump` to encrypted storage
- R2: versioning enabled on bucket; originals never deleted by app

## Monitoring

- Check worker logs: `docker compose logs -f worker`
- Upload failures visible in Inbox UI upload status
