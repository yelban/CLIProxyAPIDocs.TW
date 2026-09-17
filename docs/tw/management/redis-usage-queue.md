---
outline: 'deep'
---

# Redis 用量佇列（RESP）

CLIProxyAPI 會在與 HTTP API 相同的 TCP 連接埠（預設 `8317`）上，提供一個精簡的 Redis RESP 介面，讓你以 JSON 格式取出**最近每筆請求的用量記錄**，外部收集程式不必解析記錄檔就能取得統計資料。

## 可用性

- 只有在**啟用 Management** 時（條件與 `/v0/management` 相同）才能使用 RESP 介面。如果 Management 未啟用，RESP 連線會立即被關閉。
- RESP 與 HTTP/HTTPS 共用同一個監聽器。如果 API 伺服器啟用了 TLS，RESP 也會使用同一個 TLS 監聽器。

## 驗證

- 使用 **Management 金鑰**驗證（與 `/v0/management` 使用的金鑰相同）。
- 支援以下格式：
  - `AUTH <password>`
  - `AUTH <username> <password>`（會忽略 username，只是為了相容而支援）
- 與 Management API 共用 IP 封鎖政策：**連續失敗 5 次**會被暫時封鎖。

## 啟用用量發布

只有啟用用量發布時，佇列才會收到記錄：

- 設定檔：設定 `usage-statistics-enabled: true`，然後重新啟動或熱重載
- 或透過 Management API：`PUT /usage-statistics-enabled`，請求本文為 `{ "value": true }`

## 指令

這**不是**完整的 Redis 伺服器，只實作了以下指令：

- `AUTH`
- `LPOP <key> [count]`
- `RPOP <key> [count]`
- `SUBSCRIBE usage`

說明：

- 目前會忽略 `<key>` 參數。為了方便閱讀，建議使用 `queue`。
- 不帶 `count` 時，`LPOP`/`RPOP` 會回傳單一 Bulk String（JSON）；佇列為空時回傳 `nil`。
- 帶 `count` 時，`LPOP`/`RPOP` 會回傳 Bulk String 陣列；佇列為空時回傳空陣列。
- 項目在記憶體中的保留時間由 `redis-usage-queue-retention-seconds` 控制（單位為秒，預設 `60`，上限 `3600`）。如果不想遺漏任何記錄，請頻繁輪詢。
- `SUBSCRIBE usage` 使用 Redis pub/sub 的訊息格式。只要至少有一個用戶端訂閱，新的用量記錄就會廣播給所有已訂閱的用戶端，不會存入 FIFO 佇列；之後也無法再用 `LPOP`/`RPOP` 或 Management 用量佇列端點取得這些記錄。
- 沒有任何用戶端訂閱時，新的用量記錄仍會照常進入 FIFO 佇列。
- 訂閱模式下支援 `PING`、`UNSUBSCRIBE`、`QUIT`，用於基本的連線控制。

## 範例

使用 `redis-cli`：

```bash
# 取出一筆（輸出 JSON）
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw LPOP queue

# 最多取出 50 筆
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw RPOP queue 50

# 訂閱即時用量記錄
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw SUBSCRIBE usage
```

## Payload 結構

每個佇列項目都是一個 JSON 物件，包含以下欄位：

- `timestamp`（RFC 3339 時間字串）
- `latency_ms`（整數）
- `source`（字串）
- `auth_index`（字串）
- `tokens`：
  - `input_tokens`（整數）
  - `output_tokens`（整數）
  - `reasoning_tokens`（整數）
  - `cached_tokens`（整數）
  - `total_tokens`（整數）
- `failed`（布林值）
- `provider`（字串）
- `model`（字串，實際執行時使用的模型名稱）
- `alias`（字串，用戶端請求的模型名稱）
- `endpoint`（字串，例如 `POST /v1/chat/completions`）
- `auth_type`（字串）
- `api_key`（字串）
- `request_id`（字串）
- `response_headers`（物件，選填；上游回應標頭，格式為 `header-name: string[]`）

範例：

```json
{
  "timestamp": "2026-04-25T00:00:00Z",
  "latency_ms": 1500,
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
  "alias": "client-gpt",
  "endpoint": "POST /v1/chat/completions",
  "auth_type": "apikey",
  "api_key": "test-key",
  "request_id": "ctx-request-id",
  "response_headers": {
    "X-Upstream-Request-Id": ["upstream-req-1"],
    "Retry-After": ["30"]
  }
}
```
