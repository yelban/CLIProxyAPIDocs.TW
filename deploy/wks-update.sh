#!/usr/bin/env bash
# 在 wks 上執行：拉最新程式碼、重建文件站映像、重啟 cpadoc。
# 用法：bash /home/orz99/zoo/CLIProxyAPIDocs.TW/deploy/wks-update.sh
# 說明：deploy/WKS.md
set -euo pipefail
REPO=/home/orz99/zoo/CLIProxyAPIDocs.TW
STACK=/home/orz99/zoo
SVC=cpadoc

cd "$REPO"
echo "== git pull（只接受 fast-forward）=="
git pull --ff-only
echo "== 目前版本：$(git log -1 --format='%h %ci %s')"

cd "$STACK"
echo "== 重建映像 =="
docker compose build "$SVC"

echo "== 重啟容器 =="
docker compose up -d "$SVC"
for _ in $(seq 1 12); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$SVC")" = healthy ] && break
  sleep 5
done
docker compose ps "$SVC"
curl -s -o /dev/null -w "loopback /tw/ HTTP %{http_code}\n" http://127.0.0.1:58318/tw/
docker exec nginx_proxy curl -s -o /dev/null -w "nginx_proxy → $SVC /healthz HTTP %{http_code}\n" "http://$SVC/healthz"
