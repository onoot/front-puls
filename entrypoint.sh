#!/bin/sh

resolve() {
    local name="$1"
    local result=""
    result=$(getent hosts "$name" 2>/dev/null | awk '{print $1}')
    if [ -n "$result" ]; then
        echo "$result"
        return
    fi
    result=$(nslookup "$name" 127.0.0.11 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    if [ -n "$result" ] && [ "$result" != "127.0.0.11" ]; then
        echo "$result"
        return
    fi
    echo ""
}

BACKEND_HOST="${BACKEND_HOST:-puls-backend}"
BACKEND_PORT="${BACKEND_PORT:-3000}"
MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_BUCKET="${MINIO_BUCKET:-pulsar-uploads}"

BACKEND_IP=""
for name in "$BACKEND_HOST" "puls-backend" "puls-backend-al51zr"; do
    BACKEND_IP=$(resolve "$name")
    if [ -n "$BACKEND_IP" ]; then
        echo "Backend resolved: $name -> $BACKEND_IP"
        break
    fi
done
if [ -z "$BACKEND_IP" ]; then
    BACKEND_IP="127.0.0.1"
    echo "WARNING: Could not resolve backend, using $BACKEND_IP"
fi

MINIO_IP=""
for name in "$MINIO_HOST" "minio"; do
    MINIO_IP=$(resolve "$name")
    if [ -n "$MINIO_IP" ]; then
        echo "MinIO resolved: $name -> $MINIO_IP"
        break
    fi
done
if [ -z "$MINIO_IP" ]; then
    MINIO_IP="127.0.0.1"
    echo "WARNING: Could not resolve minio, using $MINIO_IP"
fi

cat > /etc/nginx/conf.d/default.conf <<NGINX
proxy_cache_path /var/cache/nginx/uploads levels=1:2 keys_zone=uploads_cache:10m max_size=1g inactive=30d;

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        set \$bot 0;
        if (\$http_user_agent ~* "(bot|crawl|spider|googlebot|yandexbot|bingbot|facebookbot)") {
            set \$bot 1;
        }
        if (\$bot = 1) {
            rewrite ^ /render\$request_uri last;
        }
        try_files \$uri \$uri/ /index.html;
    }

    location ^~ /render/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location ^~ /api/ {
        proxy_pass http://${BACKEND_IP}:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }

    location ^~ /uploads/ {
        rewrite ^/uploads/(.*)\$ /${MINIO_BUCKET}/\$1 break;
        proxy_pass http://${MINIO_IP}:${MINIO_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;

        proxy_cache uploads_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
        add_header X-Cache-Status \$upstream_cache_status;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

echo "=== Generated nginx.conf ==="
grep -E "proxy_pass|rewrite" /etc/nginx/conf.d/default.conf
echo "============================"

exec supervisord -c /etc/supervisord.conf
