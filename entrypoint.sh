#!/bin/sh
export BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf
exec supervisord -c /etc/supervisord.conf
