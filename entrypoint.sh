#!/bin/sh

BACKEND_HOST="${BACKEND_HOST:-backend}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_BUCKET="${MINIO_BUCKET:-pulsar-uploads}"

echo "Backend service: ${BACKEND_HOST}:${BACKEND_PORT}"
echo "MinIO service: ${MINIO_HOST}:${MINIO_PORT}"

cat > /etc/nginx/conf.d/default.conf <<NGINX
resolver 127.0.0.11 valid=10s ipv6=off;

proxy_cache_path /var/cache/nginx/uploads levels=1:2 keys_zone=uploads_cache:10m max_size=1g inactive=30d;

map \$http_user_agent \$pulsar_bot {
    default 0;
    ~*(bot|crawl|spider|slurp|bingbot|yandexbot|googlebot|facebookbot|ahrefs|semrush|duckduckbot) 1;
}

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size 50m;

    # Declared at server level on purpose: a set directive inside a location
    # that starts with "rewrite ... break" never runs, and a literal upstream
    # is resolved at startup - one bad BACKEND_HOST then kills nginx entirely.
    set \$pulsar_backend http://${BACKEND_HOST}:${BACKEND_PORT};

    # Crawlers get the server-rendered copy at /render/. Everything that is
    # not a page route is left alone: API, uploads, built assets and files.
    if (\$pulsar_bot) {
        rewrite ^/(?!render/|api/|uploads/|assets/|fonts/|favicon|robots\.txt|sitemap)(.*)\$ /render/\$1 last;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location = /render {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location ^~ /render/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location ^~ /api/ {
        proxy_pass \$pulsar_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }

    if (\$request_uri ~* "\.\.") {
        return 403;
    }

    location ~* ^/uploads/[\w./-]+\.(jpe?g|jfif|png|gif|webp|ico|pdf|svg|avif)$ {
        rewrite ^/uploads/(.+)\$ /api/uploads/\$1 break;
        proxy_pass \$pulsar_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;

        proxy_cache uploads_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
        add_header X-Cache-Status \$upstream_cache_status;
    }

    location ~ ^/uploads/ {
        return 403;
    }

    # Favicon has a stable name and no content hash, so it must not inherit the
    # 30-day immutable cache below - otherwise a replaced icon stays stale in
    # every browser for a month.
    location = /favicon.svg {
        add_header Cache-Control "no-cache, must-revalidate" always;
        expires -1;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

echo "=== Generated nginx.conf ==="
grep -E "proxy_pass|rewrite|map |resolver" /etc/nginx/conf.d/default.conf
echo "============================"

echo "Validating nginx config..."
nginx -t
echo "============================"

exec supervisord -c /etc/supervisord.conf
