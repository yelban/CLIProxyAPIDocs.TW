---
outline: 'deep'
---

# 外掛開發

CLIProxyAPI 的外掛系統會把模型、憑證、排程、轉換、攔截、用量觀察、命令列擴充與管理頁面等能力接入宿主流程。外掛以原生動態函式庫的形式在 CLIProxyAPI 行程內執行；宿主透過穩定的 C ABI 呼叫外掛，外掛也可以透過宿主回呼，沿用 CLIProxyAPI 既有的 HTTP、模型執行、憑證檔案與記錄功能。

## 適用範圍

外掛適合用來：

- 為新的上游提供模型清單、憑證解析、登入更新與請求執行能力。
- 在請求送往上游前，進行請求轉換、請求正規化、排程選擇或請求攔截。
- 在回應傳回用戶端前，進行回應轉換、回應正規化或串流 chunk 攔截。
- 接收用量紀錄，或為管理端加入該外掛專屬的頁面與診斷端點。
- 呼叫宿主既有的模型執行路徑，而不是把金鑰、Proxy 設定、記錄、用量統計與路由邏輯複製到外掛裡。

外掛不適合用來執行不受信任的程式碼。標準動態函式庫外掛與服務執行檔位於同一個行程內；宿主可以從部分 panic 中復原，但無法阻止外掛結束行程、破壞記憶體、修改整個行程的狀態或洩漏敏感資料。

## 能力文件

每項能力都有獨立的說明頁，內容依據 `sdk/pluginapi/types.go`、`sdk/pluginabi/types.go`、`internal/pluginhost` 的呼叫路徑與 `examples/plugin` 範例整理。

| 分類 | 能力 | 文件 |
| --- | --- | --- |
| 入口能力 | `model_registrar` | [模型註冊器](./model-registrar) |
| 入口能力 | `model_provider` | [模型提供者](./model-provider) |
| 入口能力 | `auth_provider` | [憑證提供者](./auth-provider) |
| 入口能力 | `frontend_auth_provider` | [前端驗證提供者](./frontend-auth-provider) |
| 入口能力 | `frontend_auth_provider_exclusive` | [前端驗證獨占模式](./frontend-auth-exclusive) |
| 入口能力 | `scheduler` | [排程器](./scheduler) |
| 入口能力 | `model_router` | [模型路由](./model-router) |
| 入口能力 | `executor` | [執行器](./executor) |
| 請求處理 | `request_translator` | [請求轉換](./request-translator) |
| 請求處理 | `request_normalizer` | [請求正規化](./request-normalizer) |
| 請求處理 | `request_interceptor` | [請求攔截](./request-interceptor) |
| 回應處理 | `response_translator` | [回應轉換](./response-translator) |
| 回應處理 | `response_before_translator` | [回應轉換前正規化](./response-before-translator) |
| 回應處理 | `response_after_translator` | [回應轉換後正規化](./response-after-translator) |
| 回應處理 | `response_interceptor` | [回應攔截](./response-interceptor) |
| 回應處理 | `response_stream_interceptor` | [串流回應攔截](./response-stream-interceptor) |
| 擴充能力 | `thinking_applier` | [Thinking 處理](./thinking-applier) |
| 擴充能力 | `usage_plugin` | [用量觀察](./usage-plugin) |
| 擴充能力 | `command_line_plugin` | [命令列擴充](./command-line-plugin) |
| 擴充能力 | `management_api` | [Management API](./management-api) |
| 宿主能力 | `host.*` | [宿主回呼](./host-callbacks) |

## 執行條件

外掛功能需要以 CGO 建置。管理 API 的回應會帶有：

```http
X-CPA-SUPPORT-PLUGIN: 1
```

`1` 表示目前的執行檔支援動態函式庫外掛，`0` 表示不支援。這個標頭只代表建置時具備的能力，不代表外掛已經啟用，也不代表某個外掛已經載入。

設定中還需要開啟全域外掛開關：

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs: {}
```

如果 `plugins.enabled` 為 `false`，外掛檔案與個別外掛設定仍可存在，但不會實際生效。

## 外掛檔案探索

外掛 ID 取自動態函式庫的檔名（去掉副檔名）。例如：

```text
plugins/darwin/arm64/example-provider.dylib
```

對應的設定鍵：

```yaml
plugins:
  configs:
    example-provider:
      enabled: true
      priority: 1
```

外掛 ID 必須符合：

```text
[A-Za-z0-9][A-Za-z0-9._-]{0,127}
```

宿主會依序搜尋目前平台的下列路徑：

```text
plugins/<GOOS>/<GOARCH>-<variant>
plugins/<GOOS>/<GOARCH>
plugins
```

macOS 使用 `.dylib`，Linux 與 FreeBSD 使用 `.so`，Windows 使用 `.dll`。同一個外掛 ID 若出現在多個目錄，以優先順序較高的目錄為準。

## ABI 基礎

每個標準動態函式庫外掛都必須匯出：

```c
int cliproxy_plugin_init(const cliproxy_host_api* host, cliproxy_plugin_api* plugin);
```

外掛在初始化時填入自己的函式表：

```c
int call(char* method, uint8_t* request, size_t request_len, cliproxy_buffer* response);
void free_buffer(void* ptr, size_t len);
void shutdown(void);
```

宿主提供的函式表讓外掛可以反向呼叫宿主：

```c
int call(void* host_ctx, char* method, uint8_t* request, size_t request_len, cliproxy_buffer* response);
void free_buffer(void* ptr, size_t len);
```

C ABI 只傳遞方法名稱、位元組陣列與長度，不傳遞 Go interface、Go slice、Go map、Go channel、`context.Context` 或 Go error。請求與回應使用 JSON 封裝，原始位元組欄位在 JSON 中會自動以 base64 表示。

成功回應：

```json
{
  "ok": true,
  "result": {}
}
```

錯誤回應：

```json
{
  "ok": false,
  "error": {
    "code": "invalid_request",
    "message": "request is invalid"
  }
}
```

## 生命週期

宿主會呼叫下列基本方法：

| 方法 | 方向 | 用途 |
| --- | --- | --- |
| `plugin.register` | 宿主呼叫外掛 | 第一次載入外掛，讀取中繼資料、設定欄位與能力宣告。 |
| `plugin.reconfigure` | 宿主呼叫外掛 | 設定變更後，把更新後的設定傳給外掛。 |
| `plugin.shutdown` | 宿主呼叫外掛 | 外掛卸載或宿主關閉時釋放資源。 |

`plugin.register` 與 `plugin.reconfigure` 的請求會包含 `config_yaml`，內容來自 `plugins.configs.<pluginID>`。宿主會保留外掛自己的 YAML 欄位，只解析宿主擁有的 `enabled` 與 `priority`。

註冊回應必須回傳：

```json
{
  "schema_version": 1,
  "metadata": {
    "Name": "example-provider",
    "Version": "0.1.0",
    "Author": "router-for-me",
    "GitHubRepository": "https://github.com/router-for-me/example-provider",
    "Logo": "https://example.com/logo.png",
    "ConfigFields": [
      {
        "Name": "mode",
        "Type": "enum",
        "EnumValues": ["safe", "fast"],
        "Description": "Execution mode."
      }
    ]
  },
  "capabilities": {
    "request_normalizer": true,
    "management_api": true
  }
}
```

`ConfigFields` 供管理端呈現外掛自有的設定，但不能取代外掛本身的設定驗證。外掛仍應在 `plugin.register` 或 `plugin.reconfigure` 中驗證自己需要的欄位。

## 設定語意

建議的最小設定：

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs:
    example-provider:
      enabled: true
      priority: 1
      mode: "safe"
```

欄位意義：

| 欄位 | 說明 |
| --- | --- |
| `plugins.enabled` | 全域外掛載入開關。 |
| `plugins.dir` | 外掛探索目錄，預設為 `plugins`。 |
| `plugins.store-sources` | 額外的外掛商店 registry 網址清單。 |
| `plugins.configs.<pluginID>.enabled` | 個別外掛開關。未設定時視為啟用。 |
| `plugins.configs.<pluginID>.priority` | 外掛啟動、註冊與路由的順序。優先順序高的外掛先處理。 |
| 其他欄位 | 外掛自有設定，宿主會原樣保留並傳給外掛。 |

管理 API 更新設定時，會盡量保留原本的 YAML 樹，只修改請求指定的欄位。外掛商店安裝外掛後，會寫入動態函式庫，並把對應的外掛設定設為 `enabled: true`，但不會強制開啟 `plugins.enabled`。

## 能力模型

外掛透過 `capabilities` 宣告自己實作的能力。常見能力如下：

| 能力 | 方法方向 | 用途 |
| --- | --- | --- |
| 模型註冊器 | `model.register` | 向宿主註冊靜態模型中繼資料。 |
| 模型提供者 | `model.static` / `model.for_auth` | 提供靜態模型，或依憑證紀錄提供模型。 |
| 憑證提供者 | `auth.*` | 為外掛供應商解析、登入、輪詢與更新憑證。 |
| 前端驗證提供者 | `frontend_auth.*` | 在 Proxy 處理前驗證用戶端請求。 |
| 排程器 | `scheduler.pick` | 從候選憑證中選出一個，或交給內建排程器處理。 |
| 模型路由 | `model.route` | 在選擇 provider/auth 之前，把符合條件的請求路由到外掛執行器、該路由外掛自己的執行器或內建 provider。 |
| 執行器 | `executor.*` | 直接執行上游請求或串流請求。 |
| 請求轉換 | `request.translate` | 把標準格式的請求轉換成上游協定。 |
| 請求正規化 | `request.normalize` | 將進入執行路徑的請求正規化。 |
| 請求攔截 | `request.intercept_before` / `request.intercept_after` | 在選擇憑證前後改寫執行請求。 |
| 回應轉換 | `response.translate` | 把標準格式的回應轉換成用戶端協定。 |
| 回應正規化 | `response.normalize_before` / `response.normalize_after` | 在原生轉換前後將回應正規化。 |
| 回應攔截 | `response.intercept_after` | 改寫非串流回應。 |
| 串流回應攔截 | `response.intercept_stream_chunk` | 改寫串流回應的 chunk。 |
| Thinking 處理 | `thinking.apply` | 套用已驗證的 thinking 設定。 |
| 用量觀察 | `usage.handle` | 接收已完成請求的用量紀錄。 |
| 命令列擴充 | `command_line.*` | 註冊並處理外掛自有的命令列 flag。 |
| Management API | `management.*` | 註冊外掛自己的管理路由或瀏覽器資源。 |

宿主的整體原則是：原生邏輯優先，外掛補足缺口；多個外掛都能處理同一階段時，優先順序高的外掛先執行。

## 宿主回呼

宿主回呼是外掛呼叫宿主，而不是宿主呼叫外掛。適合用來沿用宿主已處理好的 Proxy、憑證、模型路由、記錄、用量統計與資源管理。

常用回呼：

| 回呼 | 用途 |
| --- | --- |
| `host.http.do` | 由宿主執行一次一般的 HTTP 請求。 |
| `host.http.do_stream` / `host.http.stream_read` / `host.http.stream_close` | 由宿主執行串流 HTTP 請求，並讀取或關閉串流。 |
| `host.model.execute` | 透過宿主的模型執行路徑發起非串流模型請求。 |
| `host.model.execute_stream` / `host.model.stream_read` / `host.model.stream_close` | 透過宿主的模型執行路徑發起串流模型請求，並讀取或關閉串流。 |
| `host.stream.emit` / `host.stream.close` | 讓執行器外掛把 chunk 送到宿主的串流橋接，或關閉串流。 |
| `host.log` | 透過宿主的記錄器輸出。 |
| `host.auth.list` | 列出宿主的憑證紀錄。 |
| `host.auth.get` | 讀取實體憑證 JSON 檔案。 |
| `host.auth.get_runtime` | 讀取執行階段的憑證資訊。 |
| `host.auth.save` | 寫入憑證 JSON，並更新執行階段的憑證紀錄。 |

如果外掛在 `management.handle` 或其他由宿主呼叫的情境中，再呼叫 `host.model.execute` 或 `host.model.execute_stream`，應轉送請求中的 `host_callback_id`。宿主會據此辨識發起回呼的外掛，並在巢狀模型執行中略過同一個外掛的請求、回應與串流攔截器，避免外掛遞迴呼叫自己。其他已啟用的外掛仍可處理這次巢狀請求。

串流回呼應明確呼叫對應的 `*_close` 方法。宿主可以在 RPC 範圍結束時清理部分資源，但由外掛主動關閉，能更早釋放串流資源，也更容易找出錯誤。

## Management API 與外掛資源

外掛可以宣告兩種管理能力：

1. 需要管理金鑰的外掛自有 API。
2. 可以直接用瀏覽器開啟的外掛資源頁面。

兩者的路由邊界不同：

| 類型 | 註冊欄位 | 對外路徑 | 驗證 |
| --- | --- | --- | --- |
| 外掛自有 Management API | `routes` | `/v0/management/...` | 需要管理金鑰。 |
| 外掛資源頁面 | `resources` | `/v0/resource/plugins/<pluginID>/...` | 資源請求本身不經過管理驗證。管理中心採同源部署時，受信任頁面的 JavaScript 可以讀取已儲存的管理金鑰，並呼叫 `/v0/management/...`。 |

範例：外掛 ID 為 `example-provider`、資源路徑為 `/status` 時，最終網址是：

```text
http://localhost:8317/v0/resource/plugins/example-provider/status
```

外掛透過 `management.register` 回傳路由與資源：

```json
{
  "resources": [
    {
      "Path": "/status",
      "Menu": "Example Provider",
      "Description": "Show plugin status."
    }
  ],
  "routes": [
    {
      "Method": "POST",
      "Path": "/plugins/example-provider/run"
    }
  ]
}
```

宿主會把符合的請求轉給 `management.handle`。請求包含 method、path、headers、query 與 body；回應包含 status code、headers 與 body。

注意事項：

- 外掛自有的 Management API 路由會與宿主既有的 `/v0/management` 路由做衝突檢查，發生衝突時會略過外掛路由。
- 外掛資源路徑一律掛載在 `/v0/resource/plugins/<pluginID>/` 之下。
- 帶有 `Menu` 的舊式 GET 管理路由會當作瀏覽器資源處理，不再以管理 API 的形式對外公開。
- 資源路徑不能包含空白、`:`、`*` 或 `..`。
- 安裝並啟用帶有資源頁的外掛，就等於決定信任該外掛的瀏覽器端程式碼。同源部署時，這些程式碼可以讀取管理中心的 `localStorage`，包括其中儲存的管理金鑰（如果有的話）。
- 敏感操作應放在 `/v0/management/...` 路由之後，由資源頁讀取已儲存的管理金鑰再呼叫這些路由，而不是在未經驗證的資源 GET 請求中直接執行。
- 資源頁的腳本應隨外掛一起打包，不要在能存取同源管理情境的頁面中載入第三方腳本。

## 管理端點

下列端點都位於 `/v0/management` 之下，並且需要管理金鑰。

| 方法與路徑 | 用途 |
| --- | --- |
| `GET /plugins` | 列出已探索、已設定與已註冊的外掛，並回傳 `plugins_enabled`、`effective_enabled`、選單、中繼資料與設定欄位。 |
| `PATCH /plugins/{pluginID}/enabled` | 只更新 `plugins.configs.<pluginID>.enabled`，不修改全域的 `plugins.enabled`。 |
| `GET /plugins/{pluginID}/config` | 取得該外掛保留後的設定物件。 |
| `PUT /plugins/{pluginID}/config` | 整個取代該外掛的設定物件。 |
| `PATCH /plugins/{pluginID}/config` | 淺層合併設定物件；欄位值為 `null` 時會刪除該欄位。 |
| `DELETE /plugins/{pluginID}` | 只卸載目標外掛，刪除本機動態函式庫並移除已儲存的設定。 |
| `GET /plugin-store` | 列出外掛商店中的外掛與本機安裝狀態。 |
| `POST /plugin-store/{pluginID}/install` | 從外掛商店安裝或更新外掛；多個來源有相同 ID 時，使用 `?source=<sourceID>`。 |

`GET /plugins` 中的這幾個狀態欄位不要混淆：

- `plugins_enabled`：全域外掛開關。
- `enabled`：個別外掛的設定開關。
- `registered`：外掛動態函式庫已載入並完成註冊。
- `effective_enabled`：全域開關、個別外掛開關與註冊狀態都滿足後的實際啟用狀態。

安裝或更新外掛時，宿主會先下載 Release 資產檔案並驗證 `checksums.txt`，接著在覆寫動態函式庫前只卸載目標外掛，再寫入新檔案並觸發設定熱重載。如果平台或檔案鎖定導致已載入的動態函式庫無法覆寫，端點會回傳需要重新啟動的衝突回應。

## 外掛商店發布格式

預設的外掛商店 registry：

```text
https://raw.githubusercontent.com/router-for-me/CLIProxyAPI-Plugins-Store/main/registry.json
```

可以在設定中加入第三方來源：

```yaml
plugins:
  store-sources:
    - "https://example.com/cliproxyapi-plugins/registry.json"
```

registry 格式：

```json
{
  "schema_version": 1,
  "plugins": [
    {
      "id": "example-provider",
      "name": "Example Provider",
      "description": "Example plugin provider.",
      "author": "router-for-me",
      "version": "0.1.0",
      "repository": "https://github.com/router-for-me/example-provider",
      "logo": "https://example.com/logo.png",
      "homepage": "https://example.com",
      "license": "MIT",
      "tags": ["provider"]
    }
  ]
}
```

要求：

- `schema_version` 必須是 `1`。
- `id`、`name`、`description`、`author`、`repository` 必填。
- `repository` 必須是 `https://github.com/{owner}/{repo}`。
- `version` 是顯示用的備援值；實際安裝的版本取自 GitHub 最新 Release 的 tag。tag 可以加上 `v`，宿主會先去掉開頭的 `v` 再驗證版本。

外掛的 Release 必須提供目前平台對應的 zip 資產檔案與 `checksums.txt`：

```text
<pluginID>_<version>_<goos>_<goarch>.zip
checksums.txt
```

zip 根目錄必須直接包含目標動態函式庫：

```text
example-provider.dylib
```

不能把動態函式庫放在子目錄中。`checksums.txt` 使用常見的 sha256 格式：

```text
<sha256>  example-provider_0.1.0_darwin_arm64.zip
```

## 開發建議

建議從儲存庫中的範例開始：

```bash
make -C examples/plugin list
make -C examples/plugin build
```

常用範例：

| 範例 | 重點 |
| --- | --- |
| `examples/plugin/simple` | Go、C、Rust 三種語言的完整 ABI 骨架。 |
| `examples/plugin/codex-service-tier` | 請求正規化外掛。 |
| `examples/plugin/scheduler` | 排程外掛。 |
| `examples/plugin/claude-web-search-router` | ModelRouter 外掛，把 Claude Code 的 `web_search` 請求路由到內建 provider 或自己的執行器。 |
| `examples/plugin/management-api` | 外掛自有的管理路由與資源頁面。 |
| `examples/plugin/host-callback-auth-files` | 呼叫宿主的憑證檔案回呼。 |
| `examples/plugin/host-model-callback` | 呼叫宿主的模型執行回呼，並示範遞迴保護。 |

開發時建議遵守下列原則：

- 外掛只宣告自己實際實作的能力。
- 外掛自己的 HTTP 請求優先透過 `host.http.*` 發出，避免繞過宿主的 Proxy、記錄與傳輸策略。
- 需要發出模型請求時，優先使用 `host.model.*`，不要把宿主的憑證複製到外掛中。
- 串流資源使用完畢後要明確關閉。
- 不要讓讀取憑證、寫入憑證或執行特權動作的宿主回呼，直接透過未經驗證的資源查詢參數對外公開。面向使用者的 UI 需要觸發這些功能時，應使用同源的受信任資源頁，搭配帶有管理金鑰的 `/v0/management/...` 呼叫。
- 外掛自有的設定欄位要保持向後相容；刪除欄位時，也要繼續相容舊設定。
- 記錄中不要輸出金鑰、權杖、原始憑證 JSON 或使用者的敏感請求本文。
- 修改動態函式庫後，使用外掛管理 API 或重新啟動服務，確保舊的外掛執行個體已經卸載。

## 最小驗證流程

在本機開發外掛後，可以依照下列流程驗證：

1. 建置目前平台的動態函式庫，放到 `plugins/<GOOS>/<GOARCH>/` 或 `plugins/`。
2. 在 `config.yaml` 中開啟 `plugins.enabled`，並加入 `plugins.configs.<pluginID>`。
3. 啟動 CLIProxyAPI。
4. 請求 `GET /v0/management/plugins`，確認 `registered: true` 與 `effective_enabled: true`。
5. 如果外掛有資源頁面，開啟 `/v0/resource/plugins/<pluginID>/<path>`。
6. 如果外掛有 Management API，使用管理金鑰請求對應的 `/v0/management/...` 路由。
7. 修改外掛後，透過管理 API 安裝或刪除外掛，或重新啟動服務，確認舊的動態函式庫已不再使用。
