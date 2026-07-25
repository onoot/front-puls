#!/bin/sh

BACKEND_HOST="${BACKEND_HOST:-puls-backend}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_BUCKET="${MINIO_BUCKET:-pulsar-uploads}"

echo "Backend service: ${BACKEND_HOST}:${BACKEND_PORT}"
echo "MinIO service: ${MINIO_HOST}:${MINIO_PORT}"

cat > /etc/nginx/conf.d/default.conf <<NGINX
resolver 127.0.0.11 valid=10s ipv6=off;

proxy_cache_path /var/cache/nginx/uploads levels=1:2 keys_zone=uploads_cache:10m max_size=1g inactive=30d;

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ^~ /render/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location ^~ /api/ {
        set \$backend_upstream http://${BACKEND_HOST}:${BACKEND_PORT};
        proxy_pass \$backend_upstream;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }

    location ~* ^/uploads/[\w\\-]+\\.(jpe?g|png|gif|webp|ico|pdf)\$ {
        rewrite ^/uploads/(.+)\$ /api/uploads/\$1 break;
        proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT};
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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

echo "=== Generated nginx.conf ==="
grep -E "proxy_pass|rewrite|resolver" /etc/nginx/conf.d/default.conf
echo "============================"

exec supervisord -c /etc/supervisord.conf
