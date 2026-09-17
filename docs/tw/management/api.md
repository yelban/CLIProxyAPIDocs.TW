---
outline: 'deep'
---

# 管理 API

基本路徑：`http://localhost:8317/v0/management`

這個 API 用來管理 CLIProxyAPI 的執行階段設定與憑證檔案。所有變更都會寫入 YAML 設定檔，並由服務熱重載。

注意：以下選項無法透過 API 修改，必須在設定檔中設定（必要時重新啟動）：
- `remote-management.allow-remote`
- `remote-management.secret-key`（啟動時若偵測到明文，會自動以 bcrypt 雜湊後寫回設定檔）

## 驗證

- 所有請求（包括來自本機的請求）都必須提供有效的管理金鑰。
- 遠端存取需要在設定檔中啟用遠端管理：`remote-management.allow-remote: true`。
- 以下列任一方式提供管理金鑰（明文）：
    - `Authorization: Bearer <plaintext-key>`
    - `X-Management-Key: <plaintext-key>`

其他說明：
- 設定環境變數 `MANAGEMENT_PASSWORD` 會額外註冊一組明文管理金鑰，並強制保持遠端管理啟用，即使 `remote-management.allow-remote` 為 false 也一樣。這個值不會寫入設定檔，必須透過同樣的 `Authorization`／`X-Management-Key` 標頭傳送。
- 以 `cliproxy run --password <pwd>` 或 SDK 的 `WithLocalManagementPassword` 啟動代理時，來自本機（`127.0.0.1`／`::1`）的用戶端可以透過同樣的標頭提供這組僅限本機使用的密碼；密碼只存在記憶體中，不會寫入磁碟。
- 只有在 `remote-management.secret-key` 為空、未設定 `MANAGEMENT_PASSWORD`，且啟動時也沒有設定本機管理密碼時，管理 API 路由才不會註冊（並回傳 404）。
- 同一個用戶端 IP（包括 localhost）連續驗證失敗 5 次，會被暫時封鎖約 30 分鐘，之後才能再嘗試。

若啟動時偵測到設定檔中的金鑰是明文，會自動以 bcrypt 雜湊後寫回設定檔。

## 請求與回應慣例

- Content-Type：`application/json`（除非另有說明）。
- 布林／整數／字串更新：請求主體為 `{ "value": <type> }`。
- 陣列 PUT：可以傳原始陣列（例如 `["a","b"]`），或 `{ "items": [ ... ] }`。
- 陣列 PATCH：支援 `{ "old": "k1", "new": "k2" }` 或 `{ "index": 0, "value": "k2" }`。
- 物件陣列 PATCH：支援依索引或依鍵欄位比對（各端點另有說明）。

## 端點

### 用量統計佇列
- 舊的彙總用量端點（`/usage`、`/usage/export`、`/usage/import`）已經移除。要取得逐筆請求的佇列記錄，請使用 `GET /usage-queue`。
- 若要以 JSON 取得逐筆請求的用量記錄，請使用與 HTTP 共用同一個連接埠的 [Redis 用量佇列](./redis-usage-queue)（RESP）。
- 使用 `/usage-statistics-enabled` 啟用或停用用量發布。

- GET `/usage-queue?count=10` — 從佇列中取出最多 `count` 筆用量記錄
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        'http://localhost:8317/v0/management/usage-queue?count=10'
      ```
    - 回應：
      ```json
      [
        {
          "timestamp": "2026-05-05T12:00:00Z",
          "latency_ms": 1234,
          "source": "user@example.com",
          "auth_index": "0",
          "tokens": {
            "input_tokens": 10,
            "output_tokens": 20,
            "reasoning_tokens": 0,
            "cached_tokens": 0,
            "total_tokens": 30
          },
          "failed": false,
          "provider": "openai",
          "model": "gpt-5.4",
          "alias": "gpt-5.4",
          "endpoint": "POST /v1/chat/completions",
          "auth_type": "api_key",
          "api_key": "sk-...",
          "request_id": "req_..."
        }
      ]
      ```
    - 說明：
        - `count` 為選填，預設為 `1`，必須是正整數。
        - 回應一律是陣列，`count=1` 時也一樣；佇列為空時回傳 `[]`。
        - 這個端點回傳的記錄會從佇列中移除。
        - 相容 Redis 的用量佇列讀取的是同一個佇列；`LPOP` 和 `RPOP` 同樣會移除回傳的記錄。

### Config
- GET `/config` — 取得完整設定
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/config
      ```
    - 回應：
      ```json
      {"debug":true,"proxy-url":"","api-keys":["1...5","JS...W"],"quota-exceeded":{"switch-project":true,"switch-preview-model":true},"gemini-api-key":[{"api-key":"AI...01","base-url":"https://generativelanguage.googleapis.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-1.5-flash"]},{"api-key":"AI...02","proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-pro-vision"]}],"request-log":true,"request-retry":3,"claude-api-key":[{"api-key":"cr...56","base-url":"https://example.com/api","proxy-url":"socks5://proxy.example.com:1080","models":[{"name":"claude-3-5-sonnet-20241022","alias":"claude-sonnet-latest"}],"excluded-models":["claude-3-opus"]},{"api-key":"cr...e3","base-url":"http://example.com:3000/api","proxy-url":""},{"api-key":"sk-...q2","base-url":"https://example.com","proxy-url":""}],"codex-api-key":[{"api-key":"sk...01","base-url":"https://example/v1","proxy-url":"","excluded-models":["gpt-4o-mini"]}],"openai-compatibility":[{"name":"openrouter","base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk...01","proxy-url":""}],"models":[{"name":"moonshotai/kimi-k2:free","alias":"kimi-k2"}]}]}
      ```
    - 說明：
        - 回應內容為目前載入的執行階段設定。
        - 尚未載入任何設定時，處理程式回傳 `{}`。

### 最新版本
- GET `/latest-version` — 取得最新 Release 的版本字串（不下載資產檔案）
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/latest-version
      ```
    - 回應：
      ```json
      { "latest-version": "v1.2.3" }
      ```
    - 說明：
        - 資料來自 `https://api.github.com/repos/router-for-me/CLIProxyAPI/releases/latest`，請求時帶上 `User-Agent: CLIProxyAPI`。
        - 若設定了 `proxy-url`，請求會經由該代理；這個端點只回傳版本號，不會下載 Release 資產檔案。

### Debug
- GET `/debug` — 取得目前的 debug 狀態
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/debug
      ```
    - 回應：
      ```json
      { "debug": false }
      ```
- PUT/PATCH `/debug` — 設定 debug（布林值）
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/debug
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### Config YAML
- GET `/config.yaml` — 原樣下載已保存的 YAML 檔案
    - 回應標頭：
        - `Content-Type: application/yaml; charset=utf-8`
        - `Cache-Control: no-store`
    - 回應主體：保留註解與格式的原始 YAML 串流。
- PUT `/config.yaml` — 以 YAML 文件取代整份設定
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/yaml' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        --data-binary @config.yaml \
        http://localhost:8317/v0/management/config.yaml
      ```
    - 回應：
      ```json
      { "ok": true, "changed": ["config"] }
      ```
    - 說明：
        - YAML 格式錯誤時回傳 `400` 與 `{ "error": "invalid_yaml", "message": "..." }`；YAML 可以解析但未通過設定驗證時，回傳 `422` 與 `{ "error": "invalid_config", "message": "..." }`。
        - 寫入失敗時回傳 `500` 與 `{ "error": "write_failed", "message": "..." }`。

### 記錄檔開關
- GET `/logging-to-file` — 查看是否啟用寫入記錄檔
    - 回應：
      ```json
      { "logging-to-file": true }
      ```
- PUT/PATCH `/logging-to-file` — 啟用或停用寫入記錄檔
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/logging-to-file
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 記錄檔
- GET `/logs` — 取得最近的記錄行
    - 查詢參數：
        - `after`（選填）：Unix 時間戳記，只回傳比這個時間更新的記錄行。
    - 回應：
      ```json
      {
        "lines": ["2024-05-20 12:00:00 info request accepted"],
        "line-count": 125,
        "latest-timestamp": 1716206400
      }
      ```
    - 說明：
        - 必須先啟用寫入記錄檔，否則回傳 `400` 與 `{ "error": "logging to file disabled" }`。
        - 尚未產生記錄檔時，回應中的 `lines` 為空，`line-count` 為 `0`。
        - `latest-timestamp` 是這批記錄中解析到的最大時間戳記；找不到時間戳記時，會原樣回傳傳入的 `after`（或 `0`），用戶端可以直接帶回去做增量輪詢。
        - `line-count` 是這次掃描的總行數（包括被 `after` 濾掉的行），可用來判斷是否有新記錄。
- DELETE `/logs` — 刪除已輪替的記錄檔，並清空目前使用中的記錄檔
    - 回應：
      ```json
      { "success": true, "message": "Logs cleared successfully", "removed": 3 }
      ```

### 請求錯誤記錄
- GET `/request-error-logs` — 停用請求記錄時，列出錯誤請求的記錄檔
    - 回應：
      ```json
      {
        "files": [
          {
            "name": "error-2024-05-20.log",
            "size": 12345,
            "modified": 1716206400
          }
        ]
      }
      ```
    - 說明：
        - 啟用 `request-log` 時，這個端點一律回傳空清單。
        - 檔案位於同一個記錄目錄，檔名必須以 `error-` 開頭、以 `.log` 結尾。
        - `modified` 是最後修改時間，格式為 Unix 時間戳記。
- GET `/request-error-logs/:name` — 下載指定的錯誤請求記錄檔
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -OJ 'http://localhost:8317/v0/management/request-error-logs/error-2024-05-20.log'
      ```
    - 說明：
        - `name` 必須是安全的檔名（不含 `/` 或 `\`），且必須對應現有的 `error-*.log` 檔案，否則伺服器會回傳驗證錯誤或找不到檔案的錯誤。
        - 處理程式在傳送檔案前會做安全檢查，確認解析後的路徑仍在記錄目錄內。

### 用量統計開關
- GET `/usage-statistics-enabled` — 查看是否正在收集用量遙測資料
    - 回應：
      ```json
      { "usage-statistics-enabled": true }
      ```
- PUT/PATCH `/usage-statistics-enabled` — 啟用或停用收集
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/usage-statistics-enabled
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 代理伺服器 URL
- GET `/proxy-url` — 取得代理 URL 字串
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "proxy-url": "socks5://user:pass@127.0.0.1:1080/" }
      ```
- PUT/PATCH `/proxy-url` — 設定代理 URL 字串
    - 請求（PUT）：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":"socks5://user:pass@127.0.0.1:1080/"}' \
        http://localhost:8317/v0/management/proxy-url
      ```
    - 請求（PATCH）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":"http://127.0.0.1:8080"}' \
        http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/proxy-url` — 清除代理 URL
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 配額用盡時的行為
- GET `/quota-exceeded/switch-project`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/quota-exceeded/switch-project
      ```
    - 回應：
      ```json
      { "switch-project": true }
      ```
- PUT/PATCH `/quota-exceeded/switch-project` — 布林值
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/quota-exceeded/switch-project
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- GET `/quota-exceeded/switch-preview-model`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/quota-exceeded/switch-preview-model
      ```
    - 回應：
      ```json
      { "switch-preview-model": true }
      ```
- PUT/PATCH `/quota-exceeded/switch-preview-model` — 布林值
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/quota-exceeded/switch-preview-model
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- POST `/reset-quota` — 清除單一憑證的配額／冷卻路由狀態
    - 請求：
      ```bash
      curl -X POST -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"auth_index":"<AUTH_INDEX>"}' \
        http://localhost:8317/v0/management/reset-quota
      ```
    - 回應：
      ```json
      {
        "status": "ok",
        "auth_index": "<AUTH_INDEX>",
        "models": ["gpt-5"]
      }
      ```
    - 說明：
        - `auth_index` 是 `GET /auth-files` 回傳的穩定執行階段識別碼。
        - 這個端點不接受憑證檔名或 auth ID。
        - 呼叫後會清除執行階段的配額／冷卻狀態，並讓該憑證立即重新參與路由。

### API Keys（代理服務驗證）
這些端點會更新設定中 `auth.providers` 區段內的內嵌 `config-api-key` 提供者，舊版頂層的 `api-keys` 會自動保持同步。
- GET `/api-keys` — 回傳完整清單
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "api-keys": ["k1","k2","k3"] }
      ```
- PUT `/api-keys` — 取代整份清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '["k1","k2","k3"]' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/api-keys` — 修改其中一筆（`old/new` 或 `index/value`）
    - 請求（依 old/new）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"old":"k2","new":"k2b"}' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 請求（依 index/value）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":"k1b"}' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/api-keys` — 刪除其中一筆（`?value=` 或 `?index=`）
    - 請求（依值刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/api-keys?value=k1'
      ```
    - 請求（依索引刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/api-keys?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

- GET `/api-key-usage` — 依供應商與 API 金鑰分組的近期請求統計
    - 回應：
      ```json
      {
        "openai": {
          "https://openrouter.ai/api/v1|k1": {
            "success": 12,
            "failed": 1,
            "recent_requests": [
              { "time": "12:00-12:10", "success": 3, "failed": 0 },
              { "time": "12:10-12:20", "success": 1, "failed": 1 }
            ]
          }
        }
      }
      ```
    - 說明：
        - 第一層鍵為供應商名稱。
        - 第二層鍵為 `base_url|api_key`（base URL 可能為空，例如 `|k1`）。
        - `recent_requests` 是固定 20 個時段的清單（每個時段 10 分鐘，以本機時間標示為 `HH:MM-HH:MM`）。

### Gemini API Key
- GET `/gemini-api-key`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      {
        "gemini-api-key": [
          {"api-key":"AIzaSy...01","auth-index":"a1b2c3d4e5f67890","base-url":"https://generativelanguage.googleapis.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-1.5-flash"]},
          {"api-key":"AIzaSy...02","auth-index":"b1c2d3e4f5a67890","proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-pro-vision"]}
        ]
      }
      ```
- PUT `/gemini-api-key`
    - 請求（陣列形式）：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"AIzaSy-1","headers":{"X-Custom-Header":"vendor-value"},"excluded-models":["gemini-1.5-flash"]},{"api-key":"AIzaSy-2","base-url":"https://custom.example.com","excluded-models":["gemini-pro-vision"]}]' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/gemini-api-key`
    - 請求（依索引更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":{"api-key":"AIzaSy-1","base-url":"https://custom.example.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-pro-vision"]}}' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 請求（依 api-key 比對更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"match":"AIzaSy-1","value":{"api-key":"AIzaSy-1","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-1.5-pro-latest"]}}' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/gemini-api-key`
    - 請求（依 api-key 刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE \
        'http://localhost:8317/v0/management/gemini-api-key?api-key=AIzaSy-1'
      ```
    - 請求（依索引刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE \
        'http://localhost:8317/v0/management/gemini-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `excluded-models` 為選填；伺服器儲存前會轉成小寫、去除前後空白、去除重複，並捨棄空白項目。

### Codex API KEY（物件陣列）
- GET `/codex-api-key` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "codex-api-key": [ { "api-key": "sk-a", "base-url": "https://codex.example.com/v1", "proxy-url": "socks5://proxy.example.com:1080", "headers": { "X-Team": "cli" }, "excluded-models": ["gpt-4o-mini"] } ] }
      ```
- PUT `/codex-api-key` — 取代整份清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"sk-a","base-url":"https://codex.example.com/v1","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Team":"cli"},"excluded-models":["gpt-4o-mini","gpt-4.1-mini"]},{"api-key":"sk-b","base-url":"https://custom.example.com","proxy-url":"","headers":{"X-Env":"prod"},"excluded-models":["gpt-3.5-turbo"]}]' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/codex-api-key` — 修改其中一筆（依 `index` 或 `match`）
    - 請求（依索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":1,"value":{"api-key":"sk-b2","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"stage"},"excluded-models":["gpt-3.5-turbo-instruct"]}}' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 請求（依比對）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"match":"sk-a","value":{"api-key":"sk-a","base-url":"https://codex.example.com/v1","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Team":"cli"},"excluded-models":["gpt-4o-mini","gpt-4.1"]}}' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/codex-api-key` — 刪除其中一筆（`?api-key=` 或 `?index=`）
    - 請求（依 api-key）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/codex-api-key?api-key=sk-b2'
      ```
    - 請求（依索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/codex-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `base-url` 為必填；在 PUT/PATCH 中送出空的 `base-url` 會移除該筆設定。
        - `headers` 可為每把金鑰附加自訂 HTTP 標頭，空白的鍵或值會自動移除。
        - `excluded-models` 可列出這個供應商要封鎖的模型識別碼；伺服器會轉成小寫、去除前後空白、去除重複，並捨棄空白項目。

### 請求重試次數
- GET `/request-retry` — 取得整數
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/request-retry
      ```
    - 回應：
      ```json
      { "request-retry": 3 }
      ```
- PUT/PATCH `/request-retry` — 設定整數
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":5}' \
        http://localhost:8317/v0/management/request-retry
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 最大重試間隔
- GET `/max-retry-interval` — 取得最大重試間隔（秒）
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/max-retry-interval
      ```
    - 回應：
      ```json
      { "max-retry-interval": 30 }
      ```
- PUT/PATCH `/max-retry-interval` — 設定最大重試間隔（秒）
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":60}' \
        http://localhost:8317/v0/management/max-retry-interval
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 請求記錄
- GET `/request-log` — 取得布林值
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/request-log
      ```
    - 回應：
      ```json
      { "request-log": false }
      ```
- PUT/PATCH `/request-log` — 設定布林值
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/request-log
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### WebSocket 驗證（`ws-auth`）
- GET `/ws-auth` — 查看 WebSocket 閘道是否強制驗證
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/ws-auth
      ```
    - 回應：
      ```json
      { "ws-auth": true }
      ```
- PUT/PATCH `/ws-auth` — 啟用或停用 `/ws/*` 端點的驗證
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/ws-auth
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 從 `false` 切換為 `true` 時，伺服器會中斷所有現有的 WebSocket 工作階段，重新連線時必須提供有效的 API 憑證。
        - 停用驗證不會影響目前的工作階段，但之後的新連線會略過驗證中介軟體，直到重新啟用。

### Claude API KEY（物件陣列）
- GET `/claude-api-key` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/claude-api-key
      ```
    - 回應：
      ```json
      { "claude-api-key": [ { "api-key": "sk-a", "base-url": "https://example.com/api", "proxy-url": "socks5://proxy.example.com:1080", "headers": { "X-Workspace": "team-a" }, "excluded-models": ["claude-3-opus"] } ] }
      ```
- PUT `/claude-api-key` — 取代整份清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"sk-a","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Workspace":"team-a"},"excluded-models":["claude-3-opus"]},{"api-key":"sk-b","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"prod"},"excluded-models":["claude-3-sonnet","claude-3-5-haiku"]}]' \
        http://localhost:8317/v0/management/claude-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/claude-api-key` — 修改其中一筆（依 `index` 或 `match`）
    - 請求（依索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
          -d '{"index":1,"value":{"api-key":"sk-b2","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"stage"},"excluded-models":["claude-3.7-sonnet"]}}' \
          http://localhost:8317/v0/management/claude-api-key
        ```
    - 請求（依比對）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
          -d '{"match":"sk-a","value":{"api-key":"sk-a","base-url":"","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Workspace":"team-a"},"excluded-models":["claude-3-opus","claude-3.5-sonnet"]}}' \
          http://localhost:8317/v0/management/claude-api-key
        ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/claude-api-key` — 刪除其中一筆（`?api-key=` 或 `?index=`）
    - 請求（依 api-key）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/claude-api-key?api-key=sk-b2'
      ```
    - 請求（依索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/claude-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `headers` 為選填；空白的鍵值組會自動移除。要移除某個標頭，在更新內容中省略它即可。
        - `excluded-models` 可為某把金鑰封鎖特定 Claude 模型；伺服器會轉成小寫、去除前後空白、去除重複，並移除空白項目。

### OpenAI 相容供應商（物件陣列）
- GET `/openai-compatibility` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      {
        "openai-compatibility": [
          {
            "name": "openrouter",
            "disabled": false,
            "base-url": "https://openrouter.ai/api/v1",
            "api-key-entries": [
              { "api-key": "sk", "proxy-url": "", "auth-index": "a1b2c3d4e5f67890" }
            ],
            "models": [],
            "headers": { "X-Provider": "openrouter" }
          }
        ]
      }
      ```
- PUT `/openai-compatibility` — 取代整份清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"name":"openrouter","base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[{"name":"m","alias":"a"}],"headers":{"X-Provider":"openrouter"}}]' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/openai-compatibility` — 修改其中一筆（依 `index` 或 `name`）
    - 請求（依名稱）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"name":"openrouter","value":{"name":"openrouter","disabled":false,"base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[],"headers":{"X-Provider":"openrouter"}}}' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 請求（依索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":{"name":"openrouter","disabled":false,"base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[],"headers":{"X-Provider":"openrouter"}}}' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

    - 說明：
        - 仍接受舊版的 `api-keys` 輸入；金鑰會自動遷移到 `api-key-entries`，因此回應中的舊欄位最終會一直是空的。
        - `disabled: true` 會讓路由與驗證選擇略過這個供應商，但不會從設定中移除。
        - `headers` 可設定套用到整個供應商的 HTTP 標頭；空白的鍵或值會被捨棄。
        - 沒有 `base-url` 的供應商會被移除。送出 `base-url` 為空字串的 PATCH，會刪除該供應商。
- DELETE `/openai-compatibility` — 刪除（`?name=` 或 `?index=`）
    - 請求（依名稱）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/openai-compatibility?name=openrouter'
      ```
    - 請求（依索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/openai-compatibility?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### OAuth 排除模型
為使用 OAuth 的供應商分別設定要封鎖的模型。鍵為供應商識別碼，值為要排除的模型名稱字串陣列。

- GET `/oauth-excluded-models` — 取得目前的對應表
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      {
        "oauth-excluded-models": {
          "openai": ["gpt-4.1-mini"],
          "claude": ["claude-3-5-haiku-20241022"]
        }
      }
      ```
- PUT `/oauth-excluded-models` — 取代整張對應表
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"openai":["gpt-4.1-mini"],"claude":["claude-3-5-haiku-20241022"]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 請求主體也可以包成 `{ "items": { ... } }`；兩種寫法都會濾掉空白的模型名稱。
- PATCH `/oauth-excluded-models` — 新增／更新或刪除單一供應商項目
    - 請求（新增或更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"provider":"claude","models":["claude-3-5-haiku-20241022"]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 請求（送出空陣列以刪除供應商）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"provider":"claude","models":[]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `provider` 會正規化為小寫。送出空的 `models` 清單會移除該供應商；若供應商不存在，回傳 `404`。
- DELETE `/oauth-excluded-models` — 刪除某個供應商的所有排除模型
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -X DELETE 'http://localhost:8317/v0/management/oauth-excluded-models?provider=claude'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 憑證檔案管理

管理 `auth-dir` 底下的 JSON 權杖檔案：列出、下載、上傳、刪除。

- GET `/auth-files` — 列出
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/auth-files
      ```
    - 回應（執行階段驗證管理器可用時）：
      ```json
      {
        "files": [
          {
            "id": "claude-user@example.com",
            "auth_index": "a1b2c3d4e5f67890",
            "name": "claude-user@example.com.json",
            "provider": "claude",
            "label": "Claude Prod",
            "status": "ready",
            "status_message": "ok",
            "disabled": false,
            "unavailable": false,
            "runtime_only": false,
            "source": "file",
            "path": "/abs/path/auths/claude-user@example.com.json",
            "size": 2345,
            "modtime": "2025-08-30T12:34:56Z",
            "success": 12,
            "failed": 1,
            "recent_requests": [
              { "time": "12:00-12:10", "success": 3, "failed": 0 },
              { "time": "12:10-12:20", "success": 1, "failed": 1 }
            ],
            "email": "user@example.com",
            "account_type": "anthropic",
            "account": "workspace-1",
            "created_at": "2025-08-30T12:00:00Z",
            "updated_at": "2025-08-31T01:23:45Z",
            "last_refresh": "2025-08-31T01:23:45Z"
          }
        ]
      }
      ```
    - 說明：
        - 項目依 `name` 排序，不分大小寫。`status`、`status_message`、`disabled`、`unavailable` 反映執行階段驗證管理器的狀態，可用來確認憑證是否正常。
        - `runtime_only: true` 表示憑證只存在記憶體中（例如 Git／Postgres／ObjectStore 後端），此時 `source` 會是 `memory`。磁碟上有對應的 `.json` 檔案時，`source=file`，回應也會包含 `path`、`size`、`modtime`。
        - `auth_index` 是憑證的穩定執行階段識別碼（可搭配 `/api-call` 使用，也方便對應請求）。
        - `success`／`failed` 是累計計數（保存在記憶體中）。
        - `recent_requests` 是固定 20 個時段的清單（每個時段 10 分鐘，以本機時間標示為 `HH:MM-HH:MM`）。
        - `email`、`account_type`、`account`、`last_refresh` 取自 JSON 中繼資料（例如 `last_refresh`、`lastRefreshedAt`、`last_refreshed_at` 等鍵）。
        - 執行階段驗證管理器無法使用時，處理程式會改為掃描 `auth-dir`，只回傳 `name`、`size`、`modtime`、`type`、`email`。
        - `runtime_only` 項目無法透過檔案端點下載或刪除，必須向上游供應商或透過其他 API 撤銷。

- GET `/auth-files/download?name=<file.json>` — 下載單一檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -OJ 'http://localhost:8317/v0/management/auth-files/download?name=acc1.json'
      ```
    - 說明：
        - `name` 必須是 `.json` 檔名。只有 `source=file` 的項目有實體檔案可以匯出；`runtime_only` 憑證無法下載。

- POST `/auth-files` — 上傳
    - 請求（multipart）：
      ```bash
      curl -X POST -F 'file=@/path/to/acc1.json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/auth-files
      ```
    - 請求（原始 JSON）：
      ```bash
      curl -X POST -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d @/path/to/acc1.json \
        'http://localhost:8317/v0/management/auth-files?name=acc1.json'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 核心驗證管理器必須在運作中，否則 API 會回傳 `503` 與 `{ "error": "core auth manager unavailable" }`。
        - multipart 與原始 JSON 兩種上傳方式的檔名都必須以 `.json` 結尾；上傳成功後，憑證會立即註冊到執行階段驗證管理器。

- DELETE `/auth-files?name=<file.json>` — 刪除單一檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/auth-files?name=acc1.json'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 只會刪除磁碟上的 `.json` 檔案；刪除成功後，會通知執行階段管理器停用對應的憑證。`runtime_only` 項目不受影響。

- DELETE `/auth-files?all=true` — 刪除 `auth-dir` 底下所有 `.json` 檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/auth-files?all=true'
      ```
    - 回應：
      ```json
      { "status": "ok", "deleted": 3 }
      ```
    - 說明：
        - 只計算並刪除磁碟上的檔案；每刪除一個檔案，也會呼叫執行階段驗證管理器停用對應憑證。純記憶體的項目不受影響。

### Vertex 憑證匯入
功能等同 CLI 的 `vertex-import` 輔助指令，會把 Google 服務帳號 JSON 存成 `auth-dir` 內的 `vertex-<project>.json` 檔案。

- POST `/vertex/import` — 上傳 Vertex 服務帳號金鑰
    - 請求（multipart）：
      ```bash
      curl -X POST \
        -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -F 'file=@/path/to/my-project-sa.json' \
        -F 'location=us-central1' \
        http://localhost:8317/v0/management/vertex/import
      ```
    - 回應：
      ```json
      {
        "status": "ok",
        "auth-file": "/abs/path/auths/vertex-my-project.json",
        "project_id": "my-project",
        "email": "svc@my-project.iam.gserviceaccount.com",
        "location": "us-central1"
      }
      ```
    - 說明：
        - 必須以 `multipart/form-data` 格式、用 `file` 欄位上傳。伺服器會驗證內容並正規化 `private_key`；JSON 格式錯誤或缺少 `project_id` 時回傳 `400`。
        - 選填的 `location` 表單（或查詢）欄位，會覆寫憑證中繼資料中記錄的預設區域 `us-central1`。
        - 處理程式與其他憑證上傳一樣，透過同一個權杖儲存區保存憑證；失敗時回傳 `500` 與 `{ "error": "save_failed", ... }`。

### 登入／OAuth 網址

這些端點會啟動供應商的登入流程，並回傳要在瀏覽器中開啟的網址。流程完成後，權杖會儲存在 `auths/` 底下。

從管理介面啟動 Anthropic、Codex 與 Antigravity 登入時，可以附加 `?is_webui=true`，沿用內建的回呼轉送器。

- GET `/anthropic-auth-url` — 啟動 Anthropic（Claude）登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/anthropic-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "anth-1716206400" }
      ```
    - 說明：
        - 從內建介面觸發時，加上 `?is_webui=true` 可沿用本機回呼服務。

- GET `/codex-auth-url` — 啟動 Codex 登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/codex-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "codex-1716206400" }
      ```

- GET `/antigravity-auth-url` — 啟動 Antigravity 登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/antigravity-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "ant-1716206400" }
      ```
    - 說明：
        - 從內建介面觸發時加上 `?is_webui=true`，伺服器會在連接埠 `51121` 啟動臨時的本機回呼轉送器，並沿用主要 HTTP 連接埠處理最後的重新導向。

- GET `/get-auth-status?state=<state>` — 輪詢 OAuth 流程狀態
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        'http://localhost:8317/v0/management/get-auth-status?state=<STATE_FROM_AUTH_URL>'
      ```
    - 回應範例：
      ```json
      { "status": "wait" }
      ```
      
      ```json
      { "status": "ok" }
      ```
      
      ```json
      { "status": "error", "error": "Authentication failed" }
      ```
    - 說明：
        - `state` 查詢參數必須與登入端點回傳的值相同。流程進入 `status: "ok"` 或 `status: "error"` 後，伺服器會刪除該 state，之後的輪詢會收到 `{ "status": "ok" }`，表示流程已結束。
        - `status: "wait"` 表示流程仍在等待回呼或權杖交換，請視需要繼續輪詢。

### 外掛

- GET `/plugins` — 列出已探索、已設定與已註冊的外掛。回應包含全域的 `plugins_enabled`、解析後的 `plugins_dir`，以及每個外掛的狀態，例如 `id`、`path`、`configured`、`registered`、`enabled`、`effective_enabled`、OAuth 支援、中繼資料、設定欄位與選單。
- GET `/plugins/:id/config` — 回傳已儲存的 `plugins.configs.<id>` 物件。外掛已被探索或已註冊、但沒有儲存設定時，回傳 `{}`。
- PUT `/plugins/:id/config` — 取代整個外掛設定物件。
- PATCH `/plugins/:id/config` — 淺層合併設定物件。將某個欄位設為 `null` 會移除該頂層欄位。
- PATCH `/plugins/:id/enabled` — 只更新外掛的啟用旗標。請求：`{ "enabled": true }`。
- DELETE `/plugins/:id` — 刪除本機外掛檔案與已儲存的設定。已載入且無法卸載的外掛會回傳 `409` 與 `restart_required: true`。
- GET `/plugin-store` — 列出已設定之商店來源中的外掛，包括來源錯誤、安裝狀態、安裝來源，以及是否有可用更新。
- POST `/plugin-store/:id/install` — 從商店來源下載或更新外掛，在設定中啟用它，並回傳安裝路徑與版本。有重複 ID 時，用 `?source=<source-id>` 指定來源；也可以在查詢字串或請求主體（`{ "version": "1.2.3" }`）中指定 `version`。

外掛 ID 必須符合主程式的外掛 ID 規則。從商店安裝可能會下載可執行的外掛檔案，使用前請先設定並確認信任商店來源。

### 其他執行階段設定與記錄

本節所有 PUT/PATCH 端點都使用 `{ "value": ... }`，並回傳 `{ "status": "ok" }`。

- GET/PUT/PATCH `/logs-max-total-size-mb` — 記錄檔總大小上限（MiB）。負值會以 `0` 儲存。
- GET/PUT/PATCH `/error-logs-max-files` — 保留的請求錯誤記錄檔數量。更新為負值時會改用 `10`。
- GET/PUT/PATCH `/force-model-prefix` — 是否強制使用已設定模型前綴的布林開關。
- GET/PUT/PATCH `/routing/strategy` — 憑證選擇策略。有效值為 `round-robin`（也可寫成 `roundrobin`／`rr`）與 `fill-first`（也可寫成 `fillfirst`／`ff`）；GET 回傳 `{ "strategy": "..." }`。
- GET `/logs` 也接受 `limit` 與不透明的 `cursor`。有 `limit` 且沒有 `after` 時，回傳最新的記錄行。將回傳的 `next-cursor` 當作 `cursor` 傳入即可增量讀取；游標重設時，回應會包含 `cursor-reset: true`。
- GET `/request-log-by-id/:id` — 下載檔名以 `-<id>.log` 結尾的請求記錄檔。請求 ID 不得包含路徑分隔字元。

### 其他供應商的 API Key 集合

`/interactions-api-key`、`/xai-api-key` 與 `/vertex-api-key` 都是物件陣列集合，支援 GET、PUT、PATCH 與 DELETE。GET 回傳以端點名稱為鍵的物件，並在適用時加上執行階段的 `auth-index`。PUT 接受原始陣列或 `{ "items": [ ... ] }`；PATCH 使用 `{ "index": 0, "value": { ... } }` 或 `{ "match": "<api-key>", "value": { ... } }`；DELETE 接受 `?index=` 或 `?api-key=`（同一把金鑰出現多次時，再加上 `&base-url=`）。

- `/interactions-api-key` 設定 Google Interactions API 金鑰。項目沿用 Gemini 金鑰的結構：`api-key`、`priority`、`prefix`、`base-url`、`proxy-url`、`models`、`headers`、`excluded-models` 與 `disable-cooling`。
- `/xai-api-key` 設定原生 xAI API 金鑰。項目沿用 Codex 金鑰的結構，另外加上 `priority`、`websockets` 與 `disable-cooling`；要保留的項目必須有 `base-url`，在 PATCH 中送出空的 `base-url` 會移除該項目。
- `/vertex-api-key` 設定相容 Vertex 的 API 金鑰。PUT 的每個項目都必須有 `api-key`；選填欄位有 `priority`、`prefix`、`base-url`、`proxy-url`、`headers`、`models` 與 `excluded-models`。模型項目使用 `name`、`alias`、選填的 `display-name` 與 `force-mapping`。在 PATCH 中將 `api-key` 或 `base-url` 設為空值，會移除該項目。

### OAuth 模型別名

- GET `/oauth-model-alias` — 回傳 `{ "oauth-model-alias": { "<channel>": [ ... ] } }`。
- PUT `/oauth-model-alias` — 取代整份「管道對別名清單」的對應表；請求主體也可以包成 `{ "items": { ... } }`。
- PATCH `/oauth-model-alias` — 取代單一管道的項目。請求：`{ "channel": "codex", "aliases": [{ "name": "upstream", "alias": "client-name", "fork": false, "display-name": "Client Name", "force-mapping": true }] }`。`provider` 可作為 `channel` 的別名；送出空的別名清單會移除既有的管道。
- DELETE `/oauth-model-alias?channel=codex` — 移除一個管道。查詢參數名稱也可以用 `provider`。

### 憑證檔案的擴充端點

- GET `/auth-files/models?name=<name-or-auth-id>` — 以 `{ "models": [...] }` 回傳單一憑證支援的模型定義。
- GET `/model-definitions/:channel` — 以 `{ "channel": "...", "models": [...] }` 回傳靜態目錄的中繼資料；未知的管道回傳 `400`。省略必填的 `:channel` 路徑區段時不會比對到這個路由，會回傳 `404`。
- PATCH `/auth-files/status` — 啟用或停用一筆驗證記錄。請求：`{ "name": "<file-name-or-id>", "disabled": true }`。在設定檔中設定的 API 金鑰記錄，會透過其 `excluded-models` 設定停用；外掛的虛擬子項目無法單獨變更。
- PATCH `/auth-files/fields` — 更新某個檔名或 auth ID 的中繼資料欄位。請求主體包含 `name` 以及一個以上的欄位；用點號路徑可以更新巢狀中繼資料，例如 `{ "name": "acc.json", "project_id": "my-project", "headers.X-Team": "prod" }`。`headers` 物件會與既有的自訂標頭合併，標頭值為空時會移除該標頭。

### 帶憑證的上游呼叫

- POST `/api-call` — 發出對外 HTTP 請求，可以用 `auth_index`（也接受 `authIndex` 或 `AuthIndex`）指定要使用的憑證。請求欄位包括 `method`、絕對 `url`、選填的字串對應 `header`，以及選填的原始字串 `data`。
- 在標頭值中使用 `$TOKEN$`，會代入所選憑證的存取權杖或 API 金鑰。憑證專屬的代理設定優先於全域的 `proxy-url`；否則請求會直接連線。回應格式為 `{ "status_code": 200, "header": { ... }, "body": "..." }`，上游的狀態碼保留在 `status_code` 中。

這個端點能用已設定的憑證發出任意對外請求，請據此限制管理金鑰的存取權限。

### 其他 OAuth 流程與回呼

- GET `/kimi-auth-url` 與 GET `/xai-auth-url` 會啟動裝置碼流程。兩者都會回傳 `status`、`url`、`state` 與 `flow: "device"`，也可能回傳 `user_code` 與 `expires_in`。
- DELETE `/oauth-session?state=<state>` 會取消等待中的 OAuth 工作階段，並回傳 `{ "status": "ok", "cancelled": true|false }`。已取消的裝置碼或回呼流程不會保存憑證。
- GET/POST `/oauth-callback` 在需要驗證的路由群組之外接收 OAuth 回呼資料。GET 使用 `provider`、`state`、`code` 與 `error`／`error_description` 查詢參數。POST 接受 `{ "provider", "redirect_url", "code", "state", "error" }`；`redirect_url` 可以提供回呼的查詢值。只有 state 有效、仍在等待中，且供應商與工作階段相符時，才會接受回呼。
- `GET /get-auth-status?state=...` 在工作階段等待中時回傳 `wait`，完成後回傳 `ok`；失敗、取消、逾期或 state 不明時回傳 `error`。已完成的 state 會短暫保留，讓用戶端能讀到 `ok`。

### 新增端點的範例

除了不需驗證的 `/oauth-callback` 範例，以下所有範例都需要 `Authorization: Bearer <MANAGEMENT_KEY>`。

#### 外掛

- 列出本機外掛：
  ```bash
  curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
    http://localhost:8317/v0/management/plugins
  ```
  ```json
  {
    "plugins_enabled": true,
    "plugins_dir": "/abs/path/plugins",
    "plugins": [{
      "id": "example-plugin", "path": "/abs/path/plugins/example-plugin.so",
      "configured": true, "registered": true, "enabled": true,
      "effective_enabled": true, "supports_oauth": false,
      "oauth_provider": "", "logo": "", "config_fields": [], "menus": [],
      "metadata": { "name": "Example", "version": "1.0.0", "author": "Example", "github_repository": "", "logo": "", "config_fields": [] }
    }]
  }
  ```
- 讀取、取代、修補、啟用與刪除外掛設定：
  ```bash
  curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
    http://localhost:8317/v0/management/plugins/example-plugin/config
  # {"enabled":true,"priority":10,"endpoint":"https://plugin.example.com"}

  curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' \
    -d '{"enabled":true,"priority":10,"endpoint":"https://plugin.example.com"}' \
    http://localhost:8317/v0/management/plugins/example-plugin/config
  # {"status":"ok"}

  curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' \
    -d '{"priority":20,"endpoint":null}' \
    http://localhost:8317/v0/management/plugins/example-plugin/config
  # {"status":"ok"}

  curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' \
    -d '{"enabled":false}' http://localhost:8317/v0/management/plugins/example-plugin/enabled
  # {"status":"ok"}
  ```
  ```bash
  curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
    http://localhost:8317/v0/management/plugins/example-plugin
  ```
  ```json
  { "status": "deleted", "id": "example-plugin", "path": "/abs/path/plugins/example-plugin.so", "file_deleted": true, "configured_removed": true, "restart_required": false }
  ```
- 列出外掛商店並從商店安裝：
  ```bash
  curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/plugin-store
  ```
  ```json
  { "plugins_enabled": true, "plugins_dir": "/abs/path/plugins", "sources": [{"id":"official","name":"Official","url":"https://example.com/registry.json"}], "plugins": [{"store_id":"official/example-plugin","source_id":"official","source_name":"Official","source_url":"https://example.com/registry.json","id":"example-plugin","name":"Example","description":"Example plugin","author":"Example","version":"1.2.3","repository":"example/example-plugin","install_type":"github-release","auth_required":false,"auth_configured":true,"installed":false,"installed_version":"","path":"","configured":false,"registered":false,"enabled":false,"effective_enabled":false,"update_available":false}] }
  ```
  ```bash
  curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' \
    -d '{"version":"1.2.3"}' 'http://localhost:8317/v0/management/plugin-store/example-plugin/install?source=official'
  ```
  ```json
  { "status": "installed", "source_id": "official", "source_name": "Official", "source_url": "https://example.com/registry.json", "id": "example-plugin", "version": "1.2.3", "install_type": "github-release", "path": "/abs/path/plugins/example-plugin.so", "plugins_enabled": true, "restart_required": false }
  ```

#### 執行階段設定與記錄

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/logs-max-total-size-mb
# {"logs-max-total-size-mb":512}
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"value":20}' http://localhost:8317/v0/management/error-logs-max-files
# {"status":"ok"}
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"value":true}' http://localhost:8317/v0/management/force-model-prefix
# {"status":"ok"}
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"value":"fill-first"}' http://localhost:8317/v0/management/routing/strategy
# {"status":"ok"}
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/logs?limit=2'
```
```json
{ "lines": ["2026-05-05 12:00:00 info request accepted"], "line-count": 1, "latest-timestamp": 1777982400, "next-cursor": "<OPAQUE_CURSOR>" }
```
```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/logs?cursor=<OPAQUE_CURSOR>&limit=100'
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -OJ http://localhost:8317/v0/management/request-log-by-id/req_123
```

#### 供應商 API Key 集合

以下範例示範每個集合的所有方法。請依目標供應商替換端點與金鑰結構。

```bash
# Interactions：GET、PUT、PATCH、DELETE
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/interactions-api-key
# {"interactions-api-key":[{"api-key":"AIza...","auth-index":"a1b2","base-url":"https://generativelanguage.googleapis.com","excluded-models":[]}]}
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '[{"api-key":"AIza...","priority":10,"prefix":"team/","base-url":"https://generativelanguage.googleapis.com","proxy-url":"","models":[],"headers":{"X-Team":"prod"},"excluded-models":["gemini-2.0-flash"],"disable-cooling":true}]' http://localhost:8317/v0/management/interactions-api-key
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"index":0,"value":{"proxy-url":"socks5://127.0.0.1:1080"}}' http://localhost:8317/v0/management/interactions-api-key
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/interactions-api-key?api-key=AIza...&base-url=https%3A%2F%2Fgenerativelanguage.googleapis.com'
# 每次變更都回傳：{"status":"ok"}

# xAI：GET、PUT、PATCH、DELETE
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/xai-api-key
# {"xai-api-key":[{"api-key":"xai...","auth-index":"c3d4","base-url":"https://api.x.ai/v1","websockets":true}]}
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '[{"api-key":"xai...","priority":10,"prefix":"xai/","base-url":"https://api.x.ai/v1","websockets":true,"proxy-url":"","models":[{"name":"grok-3","alias":"grok"}],"headers":{},"excluded-models":[],"disable-cooling":false}]' http://localhost:8317/v0/management/xai-api-key
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"match":"xai...","value":{"websockets":false}}' http://localhost:8317/v0/management/xai-api-key
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/xai-api-key?index=0'
# 每次變更都回傳：{"status":"ok"}

# 相容 Vertex：GET、PUT、PATCH、DELETE
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/vertex-api-key
# {"vertex-api-key":[{"api-key":"vertex...","auth-index":"e5f6","base-url":"https://vertex.example.com"}]}
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '[{"api-key":"vertex...","priority":10,"prefix":"vertex/","base-url":"https://vertex.example.com","proxy-url":"","headers":{},"models":[{"name":"gemini-2.5-pro","alias":"vertex-gemini","display-name":"Vertex Gemini","force-mapping":true}],"excluded-models":[]}]' http://localhost:8317/v0/management/vertex-api-key
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"match":"vertex...","value":{"headers":{"X-Team":"prod"}}}' http://localhost:8317/v0/management/vertex-api-key
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/vertex-api-key?index=0'
# 每次變更都回傳：{"status":"ok"}
```

#### OAuth 別名、憑證檔案與上游呼叫

```bash
# OAuth 模型別名：GET、PUT、PATCH、DELETE
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/oauth-model-alias
# {"oauth-model-alias":{"codex":[{"name":"gpt-5","alias":"gpt-5-fast","fork":true,"display-name":"GPT-5 Fast","force-mapping":true}]}}
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"codex":[{"name":"gpt-5","alias":"gpt-5-fast","fork":true,"display-name":"GPT-5 Fast","force-mapping":true}]}' http://localhost:8317/v0/management/oauth-model-alias
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"channel":"codex","aliases":[{"name":"gpt-5","alias":"gpt-5-fast"}]}' http://localhost:8317/v0/management/oauth-model-alias
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/oauth-model-alias?channel=codex'
# 每次變更都回傳：{"status":"ok"}

# 憑證模型、靜態定義、狀態與中繼資料
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/auth-files/models?name=codex-user.json'
# {"models":[{"id":"gpt-5","display_name":"GPT-5","type":"model","owned_by":"openai"}]}
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/model-definitions/codex
# {"channel":"codex","models":[...]}
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"name":"codex-user.json","disabled":true}' http://localhost:8317/v0/management/auth-files/status
# {"status":"ok","disabled":true}
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"name":"codex-user.json","project_id":"my-project","headers.X-Team":"prod"}' http://localhost:8317/v0/management/auth-files/fields
# {"status":"ok"}

# 帶憑證的上游請求
curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' -H 'Content-Type: application/json' -d '{"auth_index":"a1b2","method":"GET","url":"https://api.example.com/v1/ping","header":{"Authorization":"Bearer $TOKEN$"}}' http://localhost:8317/v0/management/api-call
# {"status_code":200,"header":{"Content-Type":["application/json"]},"body":"{\"ok\":true}"}
```

#### 裝置碼 OAuth 與回呼

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/kimi-auth-url
# {"status":"ok","url":"https://...","state":"kmi-...","flow":"device","user_code":"ABCD-EFGH","expires_in":900}
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/xai-auth-url
# {"status":"ok","url":"https://...","state":"xai-...","flow":"device","user_code":"ABCD-EFGH","expires_in":1800}
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/get-auth-status?state=xai-...'
# {"status":"wait"}
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' 'http://localhost:8317/v0/management/oauth-session?state=xai-...'
# {"status":"ok","cancelled":true}

# 回呼路由不經過管理金鑰中介軟體，由 state 驗證提供保護。
curl 'http://localhost:8317/v0/management/oauth-callback?provider=codex&state=codex-...&code=AUTHORIZATION_CODE'
# {"status":"ok"}
curl -X POST -H 'Content-Type: application/json' -d '{"provider":"codex","state":"codex-...","code":"AUTHORIZATION_CODE"}' http://localhost:8317/v0/management/oauth-callback
# {"status":"ok"}
```

## 錯誤回應

通用錯誤格式：
- 400 Bad Request: `{ "error": "invalid body" }`
- 401 Unauthorized: `{ "error": "missing management key" }` 或 `{ "error": "invalid management key" }`
- 403 Forbidden: `{ "error": "remote management disabled" }`
- 404 Not Found: `{ "error": "item not found" }` 或 `{ "error": "file not found" }`
- 422 Unprocessable Entity: `{ "error": "invalid_config", "message": "..." }`
- 500 Internal Server Error: `{ "error": "failed to save config: ..." }`
- 503 Service Unavailable: `{ "error": "core auth manager unavailable" }`

## 附註

- 變更會寫回 YAML 設定檔，並由檔案監看器與用戶端熱重載。
- `remote-management.allow-remote` 與 `remote-management.secret-key` 無法透過 API 變更，請在設定檔中設定。
