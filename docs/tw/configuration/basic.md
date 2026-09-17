# 基本設定

## 設定檔

伺服器預設讀取專案根目錄的 YAML 設定檔（`config.yaml`）。可以用 `--config` 指定其他檔案：

```bash
./cli-proxy-api --config /path/to/your/config.yaml
```

> 在 macOS 上透過 Homebrew 安裝並以 `brew services` 執行時，預設設定檔路徑是 `$(brew --prefix)/etc/cliproxyapi.conf`（Apple Silicon 通常是 `/opt/homebrew/etc/cliproxyapi.conf`，Intel Mac 通常是 `/usr/local/etc/cliproxyapi.conf`）。
> 如果想沿用 `~/.cli-proxy-api/config.yaml`，請把 Homebrew 的路徑設成**指向**該檔案的符號連結，並在執行 `brew services start` 前確認目標檔案已存在（完整步驟見 [快速開始 — macOS](../introduction/quick-start.md)）。

### 設定檔範例

```yaml
# 伺服器繫結的主機／介面。預設為空字串（""），會繫結所有介面（IPv4 + IPv6）。
# 使用 "127.0.0.1" 或 "localhost" 可限制只允許本機存取。
host: ""

# 伺服器連接埠
port: 8317

# HTTPS 的 TLS 設定。啟用後，伺服器會使用提供的憑證與私密金鑰監聽。
tls:
  enable: false
  cert: ""
  key: ""

# 管理 API 設定
remote-management:
  # 是否允許從遠端（非 localhost）存取管理功能。
  # 設為 false 時只允許 localhost 存取管理端點（仍需要管理金鑰）。
  allow-remote: false

  # 管理金鑰。若這裡填的是明文，啟動時會自動雜湊處理。
  # 所有管理請求（包括來自 localhost 的請求）都需要這組金鑰。
  # 留空則完全停用管理 API（所有 /v0/management 路由都回傳 404）。
  secret-key: ""

  # 設為 true 時，停用內建管理面板的資源下載與 HTTP 路由。
  disable-control-panel: false

  # 管理面板的 GitHub 儲存庫，可填儲存庫網址或 releases API 網址。
  panel-github-repository: "https://github.com/router-for-me/Cli-Proxy-API-Management-Center"

# 驗證檔案目錄（支援用 ~ 代表家目錄）
auth-dir: "~/.cli-proxy-api"

# 用於驗證請求的 API 金鑰
api-keys:
  - "your-api-key-1"
  - "your-api-key-2"
  - "your-api-key-3"

# 啟用除錯記錄
debug: false

# 設為 true 時，停用高負擔的 HTTP 中介軟體功能，以降低高並行時每個請求的記憶體用量。
commercial-mode: false

# 設為 true 時，將應用程式記錄寫入可輪替的檔案，而不是輸出到 stdout
logging-to-file: false

# logs 目錄下記錄檔的總大小上限（MB）。超過時會從最舊的記錄檔開始刪除，直到低於上限。設為 0 表示停用。
logs-max-total-size-mb: 0

# 設為 false 時，停用記憶體內的用量統計彙總
usage-statistics-enabled: false

# Proxy 網址。支援 socks5/http/https 協定。範例：socks5://user:pass@192.168.1.1:1080/
proxy-url: ""

# 設為 true 時，不帶前綴的模型請求只會使用沒有前綴的憑證（前綴與模型名稱相同時除外）。
force-model-prefix: false

# 請求重試次數。HTTP 回應碼為 403、408、500、502、503 或 504 時會重試。
request-retry: 3

# 等待冷卻中憑證的最長秒數，超過後就觸發重試。
max-retry-interval: 30

# disable-image-generation 可設為：false（預設）、true 或 "chat"。
# - true：全面停用 image_generation（/v1/images/generations 與 /v1/images/edits 也會回傳 404）。
# - "chat"：只在非影像端點停用 image_generation 注入，/v1/images/generations 與 /v1/images/edits 仍可使用。
disable-image-generation: false

# 超出配額時的處理方式
quota-exceeded:
  switch-project: true # 超出配額時，是否自動切換到其他專案
  switch-preview-model: true # 超出配額時，是否自動切換到預覽模型
  antigravity-credits: true # Claude 模型的所有 free-tier 憑證都用盡時，是否使用 credits 作為最後的備援

# 有多個憑證符合時，選擇憑證的路由策略。
routing:
  strategy: "round-robin" # round-robin（預設）或 fill-first
  # 為所有用戶端啟用通用的工作階段親和性路由。
  # 工作階段 ID 的來源：metadata.user_id（Claude Code 工作階段格式）、
  # X-Session-ID、Session_id（Codex）、
  # X-Client-Request-Id（PI）、conversation_id，或前幾則訊息的雜湊值。
  # 繫結的憑證無法使用時，一律會自動容錯移轉。
  session-affinity: false # 預設：false
  # 工作階段與憑證繫結的保留時間。預設：1h
  session-affinity-ttl: "1h"

# 設為 true 時，WebSocket API（/v1/ws）需要驗證。
ws-auth: false

# 大於 0 時，非串流回應每隔 N 秒送出空白行，避免閒置逾時。
nonstream-keepalive-interval: 0

# 設為 true 時，為 Codex API 請求啟用官方 Codex 指示注入。
# 設為 false（預設）時，CodexInstructionsForModel 會直接回傳，不做任何修改。
codex-instructions-enabled: false

# 串流行為（SSE keep-alive 與安全的啟動重試）。
streaming:
  keepalive-seconds: 15   # 預設：0（停用）。<= 0 會停用 keep-alive。
  bootstrap-retries: 1    # 預設：0（停用）。送出第一個位元組前的重試次數。

# Gemini API 金鑰
gemini-api-key:
  - api-key: "AIzaSy...01"
    prefix: "test" # 選填：需以 "test/gemini-3-pro-preview" 這類名稱呼叫，才會使用此憑證
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
    models:
      - name: "gemini-2.5-flash" # 上游模型名稱
        alias: "gemini-flash"    # 對應到上游模型的用戶端別名
    excluded-models:
      - "gemini-2.5-pro"     # 從此供應商排除特定模型（完全比對）
      - "gemini-2.5-*"       # 萬用字元比對前綴（例如 gemini-2.5-flash、gemini-2.5-pro）
      - "*-preview"          # 萬用字元比對後綴（例如 gemini-3-pro-preview）
      - "*flash*"            # 萬用字元比對子字串（例如 gemini-2.5-flash-lite）
  - api-key: "AIzaSy...02"

# Codex API 金鑰
codex-api-key:
  - api-key: "sk-atSM..."
    prefix: "test" # 選填：需以 "test/gpt-5-codex" 這類名稱呼叫，才會使用此憑證
    base-url: "https://www.example.com" # 使用自訂的 Codex API 端點
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080" # 選填：為此金鑰個別指定 Proxy
    models:
      - name: "gpt-5-codex"   # 上游模型名稱
        alias: "codex-latest" # 對應到上游模型的用戶端別名
    excluded-models:
      - "gpt-5.1"         # 排除特定模型（完全比對）
      - "gpt-5-*"         # 萬用字元比對前綴（例如 gpt-5-medium、gpt-5-codex）
      - "*-mini"          # 萬用字元比對後綴（例如 gpt-5-codex-mini）
      - "*codex*"         # 萬用字元比對子字串（例如 gpt-5-codex-low）

# Claude API 金鑰
claude-api-key:
  - api-key: "sk-atSM..." # 使用官方 Claude API 金鑰時，不必設定 base-url
  - api-key: "sk-atSM..."
    prefix: "test" # 選填：需以 "test/claude-sonnet-latest" 這類名稱呼叫，才會使用此憑證
    base-url: "https://www.example.com" # 使用自訂的 Claude API 端點
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080" # 選填：為此金鑰個別指定 Proxy
    models:
      - name: "claude-3-5-sonnet-20241022" # 上游模型名稱
        alias: "claude-sonnet-latest"      # 對應到上游模型的用戶端別名
    excluded-models:
      - "claude-opus-4-5-20251101" # 排除特定模型（完全比對）
      - "claude-3-*"               # 萬用字元比對前綴（例如 claude-3-7-sonnet-20250219）
      - "*-thinking"               # 萬用字元比對後綴（例如 claude-opus-4-5-thinking）
      - "*haiku*"                  # 萬用字元比對子字串（例如 claude-3-5-haiku-20241022）
    cloak:                         # 選填：對非 Claude Code 用戶端進行請求偽裝
      mode: "auto"                 # "auto"（預設）：只在用戶端不是 Claude Code 時偽裝
                                   # "always"：一律偽裝
                                   # "never"：一律不偽裝
      strict-mode: false           # false（預設）：把 Claude Code 提示詞加在使用者系統訊息前面
                                   # true：移除所有使用者系統訊息，只保留 Claude Code 提示詞
      sensitive-words:             # 選填：要用零寬字元混淆的詞彙
        - "API"
        - "proxy"

# OpenAI 相容供應商
openai-compatibility:
  - name: "openrouter" # 供應商名稱，會用在 User-Agent 等地方
    disabled: false # 選填：設為 true 可停用此供應商，不必刪除設定
    prefix: "test" # 選填：需以 "test/kimi-k2" 這類名稱呼叫，才會使用此供應商的憑證
    base-url: "https://openrouter.ai/api/v1" # 供應商的基礎網址
    headers:
      X-Custom-Header: "custom-value"
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080" # 選填：為此金鑰個別指定 Proxy
      - api-key: "sk-or-v1-...b781" # 不設定 proxy-url
    models: # 供應商支援的模型
      - name: "moonshotai/kimi-k2:free" # 實際的模型名稱
        alias: "kimi-k2" # API 中使用的別名

# Vertex API 金鑰（Vertex 相容端點，使用 API 金鑰 + 基礎網址）
vertex-api-key:
  - api-key: "vk-123..."                        # x-goog-api-key 標頭
    prefix: "test"                              # 選填：需以 "test/vertex-pro" 這類名稱呼叫，才會使用此憑證
    base-url: "https://example.com/api"         # 例如 https://zenmux.ai/api
    proxy-url: "socks5://proxy.example.com:1080" # 選填：為此金鑰個別指定 Proxy
    headers:
      X-Custom-Header: "custom-value"
    models:                                     # 選填：將別名對應到上游模型名稱
      - name: "gemini-2.5-flash"                # 上游模型名稱
        alias: "vertex-flash"                   # 用戶端看到的別名
      - name: "gemini-2.5-pro"
        alias: "vertex-pro"

# 全域 OAuth 模型名稱別名（依管道設定）
# 這些別名會同時用於模型清單與請求路由，重新命名模型 ID。
# 支援的管道：vertex、aistudio、antigravity、claude、codex。
# 注意：別名不適用於 gemini-api-key、codex-api-key、claude-api-key、openai-compatibility 或 vertex-api-key。
# 同一個 name 可以搭配不同別名重複設定，以提供多個用戶端模型名稱。
oauth-model-alias:
  antigravity:
    - name: "rev19-uic3-1p"
      alias: "gemini-2.5-computer-use-preview-10-2025"
    - name: "gemini-3-pro-image"
      alias: "gemini-3-pro-image-preview"
    - name: "gemini-3-pro-high"
      alias: "gemini-3-pro-preview"
    - name: "gemini-3-flash"
      alias: "gemini-3-flash-preview"
    - name: "claude-sonnet-4-5"
      alias: "gemini-claude-sonnet-4-5"
    - name: "claude-sonnet-4-5-thinking"
      alias: "gemini-claude-sonnet-4-5-thinking"
    - name: "claude-opus-4-5-thinking"
      alias: "gemini-claude-opus-4-5-thinking"
#   vertex:
#     - name: "gemini-2.5-pro"
#       alias: "g2.5p"
#   aistudio:
#     - name: "gemini-2.5-pro"
#       alias: "g2.5p"
#   claude:
#     - name: "claude-sonnet-4-5-20250929"
#       alias: "cs4.5"
#   codex:
#     - name: "gpt-5"
#       alias: "g5"

# OAuth 供應商的排除模型清單
oauth-excluded-models:
  vertex:
    - "gemini-3-pro-preview"
  aistudio:
    - "gemini-3-pro-preview"
  antigravity:
    - "gemini-3-pro-preview"
  claude:
    - "claude-3-5-haiku-20241022"
  codex:
    - "gpt-5-codex-mini"

# 選填的 payload 設定
payload:
  default: # 預設規則：只在 payload 缺少參數時才設定
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（例如 "gemini-*"）
          protocol: "gemini" # 將規則限定於特定協定，可選：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 值
        "generationConfig.thinkingConfig.thinkingBudget": 32768
  default-raw: # 預設原始規則：缺少參數時，以原始 JSON 設定（必須是有效的 JSON）
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（例如 "gemini-*"）
          protocol: "gemini" # 將規則限定於特定協定，可選：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 原始 JSON 值（字串會原樣使用，必須是有效的 JSON）
        "generationConfig.responseJsonSchema": "{\"type\":\"object\",\"properties\":{\"answer\":{\"type\":\"string\"}}}"
  override: # 覆寫規則：一律設定參數，覆寫任何既有的值
    - models:
        - name: "gpt-*" # 支援萬用字元（例如 "gpt-*"）
          protocol: "codex" # 將規則限定於特定協定，可選：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 值
        "reasoning.effort": "high"
  override-raw: # 覆寫原始規則：一律以原始 JSON 設定參數（必須是有效的 JSON）
    - models:
        - name: "gpt-*" # 支援萬用字元（例如 "gpt-*"）
          protocol: "codex" # 將規則限定於特定協定，可選：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 原始 JSON 值（字串會原樣使用，必須是有效的 JSON）
        "response_format": "{\"type\":\"json_schema\",\"json_schema\":{\"name\":\"answer\",\"schema\":{\"type\":\"object\"}}}"
  filter: # 過濾規則：從 payload 移除指定的參數
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（例如 "gemini-*"）
          protocol: "gemini" # 將規則限定於特定協定，可選：openai、gemini、claude、codex、antigravity
      params: # 要從 payload 移除的 JSON 路徑（gjson/sjson 語法）
        - "generationConfig.thinkingConfig.thinkingBudget"
        - "generationConfig.responseJsonSchema"
```
