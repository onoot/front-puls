#!/usr/bin/env bash
# Ensure all Puls services are attached to the isolated overlay "puls-network"
# with clean DNS aliases. Idempotent: safe to run periodically (cron).
#
# Installed at: /opt/puls/ensure-puls-network.sh
# Cron (as root): */2 * * * * /opt/puls/ensure-puls-network.sh >> /var/log/puls-network.log 2>&1
#
# Creates the network if missing and re-attaches anything Dokploy redeploys drop.
#   minio    -> puls-minio-iyq5wb-minio-1   (compose container, alias "minio")
#   puls-data  -> puls-data-uuk1lw          (swarm service, alias "puls-data")
#   backend    -> puls-backend-2tzxel       (swarm service, alias "backend")
#   frontend   -> puls-frontend-dttzlw      (swarm service, alias "frontend")
#   dokploy-traefik                         (proxies incoming traffic)

NET="puls-network"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── 1. ensure network exists ──
if ! docker network ls --format '{{.Name}}' | grep -qx "$NET"; then
  log "network '$NET' missing, creating"
  docker network create --driver overlay --attachable "$NET" || { log "ERROR: cannot create $NET"; exit 1; }
else
  log "network '$NET' ok"
fi

NET_ID=$(docker network inspect "$NET" --format '{{.Id}}')

# ── 2. connect compose container (MinIO, traefik) ──
attach_container() {
  local cname="$1" aliases="$2"
  if ! docker ps -a --filter "name=$cname" --format '{{.Names}}' | grep -qx "$cname"; then
    log "[container] $cname not found"
    return
  fi
  local nets
  nets=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$cname")
  if echo "$nets" | grep -qw "$NET"; then
    log "[container] $cname already on $NET"
    return
  fi
  log "[container] connecting $cname (aliases: $aliases)"
  local args=()
  for a in $aliases; do args+=(--alias "$a"); done
  docker network connect "${args[@]}" "$NET" "$cname"
}

# ── 3. connect swarm services (must use service update, not network connect) ──
attach_service() {
  local name="$1" svc="$2" alias="$3"
  if ! docker service ls --format '{{.Name}}' | grep -qx "$svc"; then
    log "[service] $svc not found"
    return
  fi
  local cur
  cur=$(docker service inspect "$svc" --format '{{json .Spec.TaskTemplate.Networks}}')
  if echo "$cur" | grep -q "$NET_ID"; then
    log "[service] $svc already on $NET"
    return
  fi
  log "[service] adding $svc to $NET (alias: $alias)"
  docker service update --network-add "name=$NET,alias=$alias" "$svc" >/dev/null
}

attach_container "puls-minio-iyq5wb-minio-1" "minio puls-minio"
attach_container "dokploy-traefik" ""
attach_service "puls-data" "puls-data-uuk1lw" "puls-data"
attach_service "backend" "puls-backend-2tzxel" "backend"
attach_service "frontend" "puls-frontend-dttzlw" "frontend"

log "done"
