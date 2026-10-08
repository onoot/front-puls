#!/usr/bin/env bash
# Ensure all Puls services are attached to the isolated overlay "puls-network"
# with clean DNS aliases. Idempotent: safe to run periodically (cron).
#
# Installed at: /opt/puls/ensure-puls-network.sh
# Cron (as root): */2 * * * * /opt/puls/ensure-puls-network.sh >> /var/log/puls-network.log 2>&1
#
# Auto-attaches EVERY swarm service named puls-* (including new ones created
# in Dokploy) plus the MinIO compose container, and re-creates the network
# endpoint when a service is attached but missing its DNS alias.

NET="puls-network"
NET_ID=""
ALIAS_MAP=(
  "puls-data-uuk1lw:puls-data"
  "puls-backend-2tzxel:backend"
  "puls-frontend-dttzlw:frontend"
  "puls-frontendv-mmfawd:frontendv"
)

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── 1. ensure network exists ──
if ! docker network ls --format '{{.Name}}' | grep -qx "$NET"; then
  log "network '$NET' missing, creating"
  docker network create --driver overlay --attachable "$NET" || { log "ERROR: cannot create $NET"; exit 1; }
else
  log "network '$NET' ok"
fi
NET_ID=$(docker network inspect "$NET" --format '{{.Id}}')

# ── 2. connect compose containers (MinIO, traefik) ──
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
  local a
  for a in $aliases; do args+=(--alias "$a"); done
  docker network connect "${args[@]}" "$NET" "$cname"
}

# ── 3. attach swarm services to puls-network and enforce DNS alias ──
# If attached but missing the alias, re-create the endpoint in a single
# service update (rolls the task once).
attach_service() {
  local svc="$1" alias="$2"
  if ! docker service ls --format '{{.Name}}' | grep -qx "$svc"; then
    log "[service] $svc not found"
    return
  fi
  local aliases_now nets_now
  aliases_now=$(docker service inspect "$svc" --format '{{range .Spec.TaskTemplate.Networks}}{{if eq .Target "'"$NET_ID"'"}}{{range .Aliases}}{{.}} {{end}}{{end}}{{end}}')
  nets_now=$(docker service inspect "$svc" --format '{{json .Spec.TaskTemplate.Networks}}' | grep -q "$NET_ID" && echo yes || echo no)

  if [ "$nets_now" = "yes" ] && echo "$aliases_now" | grep -qw "$alias"; then
    log "[service] $svc ok on $NET (alias $alias)"
    return
  fi
  if [ "$nets_now" = "yes" ]; then
    log "[service] $svc on $NET but missing alias '$alias', re-creating endpoint"
    docker service update --network-rm "$NET" --network-add "name=$NET,alias=$alias" "$svc" >/dev/null
  else
    log "[service] adding $svc to $NET (alias: $alias)"
    docker service update --network-add "name=$NET,alias=$alias" "$svc" >/dev/null
  fi
}

attach_container "puls-minio-iyq5wb-minio-1" "minio puls-minio"
attach_container "dokploy-traefik" ""

# ── 4. declared services with aliases ──
for entry in "${ALIAS_MAP[@]}"; do
  svc="${entry%%:*}"
  alias="${entry##*:}"
  attach_service "$svc" "$alias"
done

# ── 5. auto-discover any other puls-* swarm service and attach it ──
for s in $(docker service ls --format '{{.Name}}' | grep '^puls-'); do
  for entry in "${ALIAS_MAP[@]}"; do
    [ "${entry%%:*}" = "$s" ] && continue 2
  done
  nets=$(docker service inspect "$s" --format '{{json .Spec.TaskTemplate.Networks}}' | grep -q "$NET_ID" && echo yes || echo no)
  if [ "$nets" = "no" ]; then
    log "[service] adding auto-discovered $s to $NET"
    docker service update --network-add "$NET" "$s" >/dev/null
  fi
done

log "done"
