# Self-Hosting DeenMate

DeenMate is AGPL-3.0 licensed. You can run your own instance on any VPS with Docker.

## Prerequisites

- **Docker** 26+ and **Docker Compose** v2
- A domain name pointed to your server (for HTTPS)
- 1 GB RAM minimum (2 GB recommended)
- Git

## Quick Start

```bash
git clone https://github.com/tellicode/deenmate.git
cd deenmate

# Copy and configure environment
cp .env.example .env
php artisan key:generate
```

### Configure `.env`

Edit `.env` and set:

```ini
APP_NAME=DeenMate
APP_ENV=production
APP_DEBUG=false
APP_URL=https://deenmate.yourdomain.com
APP_DOMAIN=deenmate.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=deenmate
DB_USERNAME=deenmate
DB_PASSWORD=your_secure_password_here

REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=database

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=noreply@deenmate.yourdomain.com
MAIL_FROM_NAME=DeenMate
```

### VAPID Keys (Push Notifications)

Generate VAPID keys for WebPush:

```bash
php artisan webpush:vapid
```

This prints a VAPID public and private key. Add them to `.env`:

```ini
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

### Start

```bash
docker compose up -d
```

Caddy will automatically obtain an SSL certificate from Let's Encrypt. Visit `https://deenmate.yourdomain.com`.

## Customization

### Prayer Time Defaults

Settings apply to new users (each user can override):

```ini
PRAYER_CALC_METHOD=MWL            # MWL, ISNA, Egyptian, Makkah, Karachi, Tehran, Jafari
PRAYER_ASR_METHOD=Standard        # Standard or Hanafi
PRAYER_HIGH_LAT_RULE=AngleBased   # AngleBased, MidNight, OneSeventh, None
```

### Disable Registration

```ini
REGISTRATION_OPEN=true            # Set to false to disable public signup
```

## Backup Strategy

### Database

```bash
# Daily cron: mysqldump
docker compose exec mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" deenmate \
  | gzip > backups/deenmate-$(date +%Y%m%d).sql.gz

# Retain last 30 days
find backups/ -name '*.sql.gz' -mtime +30 -delete
```

### Application Data

The `app_storage` volume contains user-uploaded files (if any) and cache. Back it up alongside the DB for a complete restore.

### Restore

```bash
# Restore database
gunzip -c backups/deenmate-YYYYMMDD.sql.gz | \
  docker compose exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" deenmate

# Restore app storage
docker compose cp backups/storage-backup/ app:/var/www/html/storage/
```

## Updating

```bash
git pull
docker compose build --no-cache
docker compose up -d
docker compose exec app php artisan migrate --force
```

## Troubleshooting

**Caddy fails to get certificate:** Ensure port 80 and 443 are open and your domain resolves to the server.

**Migrations hang:** The app container waits for MySQL health check. If MySQL fails, check `docker compose logs mysql`.

**Queue not processing:** Check `docker compose logs app` for queue worker errors. Verify Redis is running.

## Architecture

```
Caddy (:80/:443, auto-TLS)
  → app (:80, Nginx)
    → PHP-FPM (:9000)
    → Queue worker (Redis-backed)

MySQL 8.0 (:3306)
Redis 7 (:6379)
```

- **Caddy** terminates SSL, adds security headers, compresses responses, caches static assets.
- **Nginx** serves the PHP application and static files.
- **Supervisor** manages PHP-FPM, Nginx, and the queue worker inside the app container.
- All inter-service traffic uses the internal Docker network.
