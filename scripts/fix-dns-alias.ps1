#!/usr/bin/env pwsh
# Setup isolated "puls-network" for all Puls services + DNS aliases.
# Run this after every Dokploy redeploy of any puls-* service.
#
# Creates/ensures:
#   puls-network        (attachable overlay, isolated from other projects)
#   minio  -> puls-minio-iyq5wb-minio-1   (compose container, alias "minio")
#   puls-data -> puls-data-uuk1lw         (mysql swarm service, alias "puls-data")
#   backend  -> puls-backend-2tzxel       (swarm service, alias "backend")
#   frontend -> puls-frontend-dttzlw      (swarm service, alias "frontend")
#   dokploy-traefik                       (proxies incoming traffic)
#
# After this, env vars on services should be set (in Dokploy UI / service env):
#   backend:  DB_HOST=puls-data,  MINIO_ENDPOINT=minio
#   frontend: BACKEND_HOST=backend, MINIO_HOST=minio

$ErrorActionPreference = "Stop"

$NET = "puls-network"

# ── helper: run docker through WSL (Ubuntu distro used on this host) ──
function Invoke-Docker {
    param([string]$Args)
    wsl -d Ubuntu -- docker $Args
    if ($LASTEXITCODE -ne 0) { throw "docker $Args failed" }
}

# ── 1. ensure network exists ──
$netExists = (Invoke-Docker "network ls --format {{.Name}}") -split "`n" | Where-Object { $_.Trim() -eq $NET }
if (-not $netExists) {
    Write-Host "[network] creating $NET"
    Invoke-Docker "network create --driver overlay --attachable $NET"
} else {
    Write-Host "[network] $NET already exists"
}

# ── 2. connect MinIO container (alias "minio", "puls-minio") ──
$minio = (Invoke-Docker 'ps --filter name=puls-minio --format {{.Names}}' | Select-Object -First 1).Trim()
if ($minio) {
    Write-Host "[minio] container: $minio"
    Invoke-Docker "network disconnect $NET $minio" 2>$null
    Invoke-Docker "network connect --alias minio --alias puls-minio $NET $minio"
    Write-Host "[minio] connected to $NET"
} else {
    Write-Warning "[minio] container not found"
}

# ── 3. connect traefik (proxy) ──
if (Invoke-Docker "ps -a --filter name=dokploy-traefik --format {{.Names}}" -split "`n" | Where-Object { $_.Trim() -eq "dokploy-traefik" }) {
    Write-Host "[traefik] connecting"
    Invoke-Docker "network disconnect $NET dokploy-traefik" 2>$null
    Invoke-Docker "network connect $NET dokploy-traefik"
}

# ── 4. swarm services: ensure on network with clean aliases ──
function Add-ServiceAlias {
    param([string]$ServicePattern, [string]$Alias)
    $svc = (Invoke-Docker 'service ls --format {{.Name}}' | Select-String $ServicePattern | Select-Object -First 1).ToString().Trim()
    if (-not $svc) { Write-Warning "[$Alias] service matching '$ServicePattern' not found"; return }
    Write-Host "[$Alias] service: $svc"
    Invoke-Docker "service update --network-add `"name=$NET,alias=$Alias`" $svc"
    Write-Host "[$Alias] done"
}

Add-ServiceAlias "puls-data"    "puls-data"
Add-ServiceAlias "puls-backend" "backend"
Add-ServiceAlias "puls-frontend" "frontend"

Write-Host "`nDone. Services resolve as: puls-data, backend, frontend, minio (on $NET)."
