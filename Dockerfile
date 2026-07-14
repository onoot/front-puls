FROM node:22-alpine AS react-build
WORKDIR /app
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ .
RUN npm run build

FROM node:22-alpine AS ssr-build
WORKDIR /app
COPY ssr-express/package*.json ./
RUN npm ci
COPY ssr-express/ .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache nodejs npm supervisor gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=react-build /app/dist /usr/share/nginx/html

COPY --from=ssr-build /app/dist /app/ssr/dist
COPY --from=ssr-build /app/node_modules /app/ssr/node_modules
COPY --from=ssr-build /app/package.json /app/ssr/

COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
