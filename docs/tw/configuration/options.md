# 設定選項

預設值與可用欄位皆與 `config.example.yaml` 一致。

## 基本設定

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `host` | string | `""` | 繫結位址；`""` 會監聽所有 IPv4/IPv6 介面。若只允許本機存取，請使用 `127.0.0.1` 或 `localhost`。 |
| `port` | integer | `8317` | 伺服器連接埠。 |
| `tls.enable` | boolean | `false` | 啟用 HTTPS。 |
| `tls.cert` / `tls.key` | string | `""` | TLS 憑證與私密金鑰的路徑。 |
| `auth-dir` | string | `"~/.cli-proxy-api"` | 憑證目錄，支援 `~`。 |
| `api-keys` | string[] | `[]` | 此 Proxy 接受的 API 金鑰。 |
| `debug` | boolean | `false` | 啟用除錯記錄。 |
| `request-log` | boolean | `false` | 啟用詳細的請求與回應記錄。 |
| `pprof.enable` | boolean | `false` | 啟用 pprof HTTP 除錯伺服器。 |
| `pprof.addr` | string | `"127.0.0.1:8316"` | pprof 繫結位址；請只繫結在本機。 |
| `commercial-mode` | boolean | `false` | 停用高負擔的請求記錄與中介軟體，以降低記憶體用量。 |
| `logging-to-file` | boolean | `false` | 將應用程式記錄寫入可輪替的記錄檔，而不是輸出到 stdout。 |
| `logs-max-total-size-mb` | integer | `0` | 記錄目錄的總大小上限（MB）；`0` 表示不設上限。 |
| `error-logs-max-files` | integer | `10` | 停用請求記錄時，最多保留的錯誤記錄檔數量；`0` 表示不清理。 |
| `usage-statistics-enabled` | boolean | `false` | 啟用記憶體內的用量統計彙總。 |
| `redis-usage-queue-retention-seconds` | integer | `60` | 用量佇列項目在記憶體中保留的秒數；上限為 `3600`。 |
| `proxy-url` | string | `""` | 全域對外 Proxy（`socks5`、`http` 或 `https`）。個別憑證的 `proxy-url` 可設為 `direct` 或 `none`，略過全域 Proxy 與環境變數中的 Proxy。 |
| `force-model-prefix` | boolean | `false` | 設為 `true` 時，不帶前綴的模型請求只會使用沒有前綴的憑證（前綴與模型名稱相同時除外）。 |
| `passthrough-headers` | boolean | `false` | 將經過篩選的上游回應標頭轉送給用戶端。 |
| `request-retry` | integer | `3` | 遇到 403/408/500/502/503/504 回應時的重試次數。 |
| `max-retry-credentials` | integer | `0` | 單一失敗請求最多嘗試的憑證數；`0` 維持舊有的「全部嘗試」行為。 |
| `max-retry-interval` | integer | `30` | 重試前等待憑證冷卻結束的最長秒數。 |
| `disable-cooling` | boolean | `false` | 全域停用憑證／模型的冷卻排程。 |
| `save-cooldown-status` | boolean | `false` | 將憑證冷卻狀態保存為 auth 檔案旁的 `.cds` 檔案。 |
| `transient-error-cooldown-seconds` | integer | `0` | 408/500/502/503/504 等暫時性錯誤的冷卻時間；`0` 沿用舊有的 60 秒，`-1` 表示停用。 |
| `disable-claude-cloak-mode` | boolean | `false` | 全域停用 Claude 請求偽裝；個別憑證仍可覆寫此設定。 |
| `disable-image-generation` | boolean \| `"chat"` \| `"passthrough"` | `false` | `true` 會全面停用影像生成，並讓 `/v1/images/*` 回傳 404；`"chat"` 只在影像端點以外停用注入；`"passthrough"` 不修改非影像端點的用戶端 payload，影像端點的行為則與 `"chat"` 相同。 |
| `gpt-image-2-base-model` | string | `"gpt-5.4-mini"` | 舊版代管影像生成路徑所用的基礎模型；必須以 `gpt-` 開頭。 |
| `video-result-auth-cache-ttl` | string | `"3h"` | 影片 ID 與建立它的憑證保持繫結的時間。 |
| `auth-auto-refresh-workers` | integer | `16` | OAuth／檔案憑證自動更新的 worker 數量；大於 `0` 時會覆寫預設值。 |
| `ws-auth` | boolean | `true` | 存取 `/v1/ws` 時需要驗證。 |
| `nonstream-keepalive-interval` | integer | `0` | 非串流回應每 N 秒輸出一個空白行；`0` 表示停用。 |
| `streaming.keepalive-seconds` | integer | `0` | SSE keep-alive 間隔；≤ `0` 表示停用。 |
| `streaming.bootstrap-retries` | integer | `0` | 送出第一個位元組前，可安全進行的串流重試次數。 |
| `antigravity-signature-cache-enabled` | boolean | `true` | 優先使用並驗證快取的思考區塊簽章；只有要使用略過模式時才設為 `false`。 |
| `antigravity-signature-bypass-strict` | boolean | `false` | 在略過模式下驗證完整的 Claude protobuf 簽章結構，而不只檢查基本格式。 |

## 管理 API

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `remote-management.allow-remote` | boolean | `false` | 允許從 localhost 以外的位置存取管理功能。 |
| `remote-management.secret-key` | string | `""` | 管理金鑰；明文會在啟動時雜湊處理。留空時，所有 `/v0/management` 路由都會停用（回傳 404）。 |
| `remote-management.disable-control-panel` | boolean | `false` | 停用內建的管理面板資源與路由。 |
| `remote-management.disable-auto-update-panel` | boolean | `false` | 停用管理面板的定期背景更新；若面板檔案不存在，第一次存取時仍會下載。 |
| `remote-management.panel-github-repository` | string | `"https://github.com/router-for-me/Cli-Proxy-API-Management-Center"` | 管理面板套件的儲存庫網址或 releases API 網址。 |

## 外掛

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `plugins.enabled` | boolean | `false` | 啟用受信任、在同一行程內執行的動態外掛。 |
| `plugins.dir` | string | `"plugins"` | 搜尋外掛的目錄。 |
| `plugins.store-sources` | string[] | `[]` | 額外的外掛商店 registry 網址；一律包含官方 registry。 |
| `plugins.store-auth[].match` | string | `""` | 外掛商店驗證規則要比對的 URL 前綴；HTTP 網址必須設定 `allow-insecure: true`。 |
| `plugins.store-auth[].apply-to` | string[] | `[]` | 需要驗證的請求種類，可複選：`registry`、`metadata`、`artifact`。 |
| `plugins.store-auth[].type` | string | `""` | 驗證類型：`none`、`bearer`、`basic`、`header` 或 `github-token`。 |
| `plugins.store-auth[].token-env` | string | `""` | 存放 bearer、GitHub 或其他權杖的環境變數。 |
| `plugins.store-auth[].username-env` / `password-env` | string | `""` | Basic 驗證所用使用者名稱與密碼的環境變數。 |
| `plugins.store-auth[].header-name` / `header-value-env` | string | `""` | `header` 驗證的標頭名稱，以及存放標頭值的環境變數。 |
| `plugins.store-auth[].allow-insecure` | boolean | `false` | 在支援的情況下，允許不安全的驗證設定。 |
| `plugins.configs.<plugin-id>.enabled` | boolean | `false` | 啟用單一外掛實例；不會變更 `plugins.enabled`。 |
| `plugins.configs.<plugin-id>.priority` | integer | `0` | 外掛的啟動與路由優先順序。 |

## 配額、路由與 Codex

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `quota-exceeded.switch-project` | boolean | `true` | 配額用盡時自動切換專案。 |
| `quota-exceeded.switch-preview-model` | boolean | `true` | 配額用盡時自動切換到預覽版模型。 |
| `quota-exceeded.antigravity-credits` | boolean | `true` | Claude 的最後備援：free-tier 憑證全部用盡（429/503）後，改用有 Google One AI credits 的憑證。 |
| `routing.strategy` | string | `"round-robin"` | 憑證選擇策略：`round-robin` 或 `fill-first`。 |
| `routing.session-affinity` | boolean | `false` | 將工作階段繫結到固定憑證。工作階段 ID 取自 `metadata.user_id`、`X-Session-ID`、`Session_id`、`X-Client-Request-Id`、`conversation_id` 或訊息雜湊值；容錯移轉仍會運作。 |
| `routing.session-affinity-ttl` | string | `"1h"` | 工作階段與憑證繫結的 TTL。 |
| `codex.identity-confuse` | boolean | `false` | 使用 `fill-first` 或工作階段親和性時，依選定的憑證重新對應 Codex 的快取與安裝識別碼。 |

## 供應商憑證

所有供應商清單的預設值都是 `[]`。`priority` 預設為 `0`，數值越高越優先。`models.*.display-name` 是選填的模型目錄顯示名稱；`models.*.force-mapping` 會把上游回應中的模型欄位改寫成用戶端使用的別名。

### Gemini 與原生 Interactions

`gemini-api-key[]` 與 `interactions-api-key[]` 使用相同的欄位；後者只用於直接執行 `/v1beta/interactions`。

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `<provider>.*.api-key` | string | `""` | API 金鑰。 |
| `<provider>.*.priority` | integer | `0` | 憑證選擇的優先順序。 |
| `<provider>.*.prefix` | string | `""` | 選填的前綴；以 `prefix/model` 的形式呼叫。 |
| `<provider>.*.disable-cooling` | boolean | `false` | 停用此憑證的冷卻排程。 |
| `<provider>.*.base-url` | string | `"https://generativelanguage.googleapis.com"` | 自訂端點。 |
| `<provider>.*.headers` | object | `{}` | 額外的請求標頭。 |
| `<provider>.*.proxy-url` | string | `""` | 覆寫此金鑰使用的 Proxy。 |
| `<provider>.*.models.*.name` / `alias` | string | `""` | 上游模型名稱與用戶端別名。 |
| `<provider>.*.models.*.display-name` | string | `""` | 模型目錄中易於辨識的顯示名稱。 |
| `<provider>.*.models.*.force-mapping` | boolean | `false` | 在上游回應的模型欄位中改回傳別名。 |
| `<provider>.*.excluded-models` | string[] | `[]` | 要排除的模型，支援萬用字元。 |

### Codex 與 xAI

`codex-api-key[]` 與 `xai-api-key[]` 使用下列欄位；xAI 使用原生的 xAI executor。

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `<provider>.*.api-key`、`priority`、`prefix`、`disable-cooling`、`headers`、`proxy-url`、`excluded-models` | mixed | — | 意義與上方 Gemini 憑證欄位相同。 |
| `<provider>.*.base-url` | string | — | 必填的自訂端點；未填或為空值的項目會被捨棄。 |
| `<provider>.*.websockets` | boolean | `false` | 使用上游 Responses API 的 WebSocket 傳輸。 |
| `<provider>.*.models.*.name` / `alias` / `display-name` / `force-mapping` | mixed | — | 與上方的模型對應欄位相同。 |

### Claude

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `claude-api-key.*.api-key`、`priority`、`prefix`、`disable-cooling`、`base-url`、`headers`、`proxy-url`、`excluded-models` | mixed | — | 意義與上方 Gemini 憑證欄位相同。 |
| `claude-api-key.*.models.*.name` / `alias` / `display-name` / `force-mapping` | mixed | — | 控制上游模型對應，以及回應中模型名稱的改寫。 |
| `claude-api-key.*.rebuild-mid-system-message` | boolean | `false` | 將角色為 `system` 的訊息移到 Claude 最上層的 system 欄位。 |
| `claude-api-key.*.cloak.mode` | string | `"auto"` | 偽裝模式：`auto`（僅對非 Claude Code 用戶端）、`always` 或 `never`。 |
| `claude-api-key.*.cloak.strict-mode` | boolean | `false` | 移除使用者的 system 訊息，只保留 Claude Code 提示詞。 |
| `claude-api-key.*.cloak.sensitive-words` | string[] | `[]` | 要用零寬字元混淆的詞。 |
| `claude-api-key.*.cloak.cache-user-id` | boolean | `false` | 此 API 金鑰重複使用快取的 `user_id`。 |
| `claude-api-key.*.experimental-cch-signing` | boolean | `false` | 以目前 Claude Code 的 CCH 演算法，對偽裝後最終送出的 `/v1/messages` 請求本文簽章。 |

### OpenAI 相容供應商

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `openai-compatibility.*.name`、`priority`、`prefix`、`base-url`、`headers` | mixed | — | 供應商識別名稱、選擇優先順序、選填前綴、端點與請求標頭。 |
| `openai-compatibility.*.disabled` / `disable-cooling` | boolean | `false` | 停用此供應商，或停用它的冷卻排程。 |
| `openai-compatibility.*.api-key-entries.*.api-key` / `proxy-url` | string | `""` | 供應商 API 金鑰，以及選填的個別金鑰 Proxy。 |
| `openai-compatibility.*.models.*.name` / `alias` / `display-name` / `force-mapping` | mixed | — | 控制上游模型對應，以及回應中模型名稱的改寫。 |
| `openai-compatibility.*.models.*.image` | boolean | `false` | 允許此模型用於 `/v1/images/generations` 與 `/v1/images/edits`。 |
| `openai-compatibility.*.models.*.input-modalities` / `output-modalities` | string[] | `[]` | 宣告的輸入／輸出能力，例如 `text`、`image`。 |
| `openai-compatibility.*.models.*.thinking.levels` | string[] | `["low", "medium", "high"]` | 支援的推理強度等級。 |

### Vertex 相容 API 金鑰

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `vertex-api-key.*.api-key`、`priority`、`prefix`、`base-url`、`headers`、`proxy-url`、`excluded-models` | mixed | — | Vertex 相容憑證與路由設定。 |
| `vertex-api-key.*.models.*.name` / `alias` / `display-name` / `force-mapping` | mixed | — | 控制上游模型對應，以及回應中模型名稱的改寫。 |

## OAuth 模型控制與預設請求標頭

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `oauth-model-alias` | object | `{}` | 依 OAuth 管道設定模型別名：`vertex`、`aistudio`、`antigravity`、`claude`、`codex`、`kimi`、`xai`，或 OAuth 外掛供應商的 key。 |
| `oauth-model-alias.*.*.name` / `alias` | string | `""` | 上游模型 ID，以及用戶端看到的模型 ID。 |
| `oauth-model-alias.*.*.fork` | boolean | `false` | 保留上游模型，並把別名額外公開為另一個模型。 |
| `oauth-model-alias.*.*.display-name` | string | `""` | 別名在模型目錄中的顯示名稱。 |
| `oauth-model-alias.*.*.force-mapping` | boolean | `false` | 在上游回應的模型欄位中改回傳用戶端別名。 |
| `oauth-excluded-models` | object | `{}` | 依管道排除 OAuth 模型，支援萬用字元。 |
| `claude-header-defaults.user-agent`、`package-version`、`runtime-version`、`timeout` | string | `""` | 用戶端未提供時，Claude OAuth 請求改用的標頭值。 |
| `claude-header-defaults.os` / `arch` | string | `""` | 預設依執行環境判斷；啟用裝置特徵固定功能時，作為固定的平台基準值。 |
| `claude-header-defaults.stabilize-device-profile` | boolean | `false` | 將每個憑證的 OS／架構固定為設定的基準值。 |
| `codex-header-defaults.user-agent` / `beta-features` | string | `""` | 用戶端未提供時，Codex OAuth 改用的標頭值；`beta-features` 只套用於 WebSocket 請求。 |

## Payload 規則

`payload.default`、`default-raw`、`override`、`override-raw` 與 `filter` 都是規則陣列。`default*` 只寫入缺少的值，`override*` 一律寫入，`filter` 則刪除指定路徑；`*-raw` 的值必須是有效的 JSON。

| 參數 | 類型 | 預設值 | 說明 |
| --- | --- | --- | --- |
| `payload.<rule>[].models[].name` | string | `""` | 要比對的模型名稱，支援萬用字元。 |
| `payload.<rule>[].models[].protocol` | string | `""` | 目標協定：`openai`、`responses`、`gemini`、`claude`、`codex` 或 `antigravity`。 |
| `payload.<rule>[].models[].from-protocol` | string | `""` | 限定來源協定：`openai`、`responses`、`gemini` 或 `claude`。 |
| `payload.<rule>[].models[].headers` | object | `{}` | 必須符合的請求標頭樣式；值支援 `*` 萬用字元。 |
| `payload.<rule>[].models[].match` / `not-match` | object[] | `[]` | JSON 路徑條件：值必須等於，或不得等於設定的值。 |
| `payload.<rule>[].models[].exist` / `not-exist` | string[] | `[]` | 必須存在且不為 null，或必須不存在／為 null 的 JSON 路徑。 |
| `payload.default[].params` / `payload.override[].params` | object | `{}` | JSON 路徑 → 值。 |
| `payload.default-raw[].params` / `payload.override-raw[].params` | object | `{}` | JSON 路徑 → 原始 JSON 值。 |
| `payload.filter[].params` | string[] | `[]` | 要刪除的 JSON 路徑。 |
