# Stage 1: Frontend build
FROM node:22-alpine AS frontend
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY vite.config.js postcss.config.js tailwind.config.js ./
COPY resources/ resources/
COPY public/ public/
RUN pnpm run build

# Stage 2: PHP application
FROM php:8.3-fpm

ARG APP_ENV=production

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN if [ "$APP_ENV" = "production" ]; then \
        composer install --no-dev --no-interaction --optimize-autoloader --no-scripts; \
    else \
        composer install --no-interaction --optimize-autoloader; \
    fi

COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN php artisan config:clear \
    && php artisan view:clear \
    && php artisan route:clear

COPY docker/nginx-site.conf /etc/nginx/sites-available/default
COPY docker/supervisor.conf /etc/supervisor/conf.d/supervisor.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN mkdir -p /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/log/nginx /var/lib/nginx

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
