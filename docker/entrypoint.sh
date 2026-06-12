#!/bin/bash
set -e

echo "Waiting for MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306};dbname=${DB_DATABASE:-deenmate}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-root}');" 2>/dev/null; do
    sleep 1
done
echo "MySQL is ready."

php artisan migrate --force --no-interaction

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting services..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisor.conf
