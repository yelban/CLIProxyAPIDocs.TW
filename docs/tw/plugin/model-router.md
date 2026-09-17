---
outline: 'deep'
---

# 模型路由能力

模型路由能力讓外掛在宿主把請求的模型解析成 provider、以及選擇憑證之前，先決定符合條件的模型請求要交給哪裡執行。

當需要依據請求內容、請求標頭、查詢參數或用戶端原本指定的模型，在下列目標之間做選擇時，就可以使用它：

- 路由外掛自己的執行器；
- 另一個外掛的執行器；
- 內建 provider 路徑，例如 `codex`、`antigravity`、`xai` 或 `claude`。

## 能力欄位

```json
{
  "capabilities": {
    "model_router": true
  }
}
```

如果路由器可能把請求導向自己的執行器，也要一併宣告執行器能力：

```json
{
  "capabilities": {
    "model_router": true,
    "executor": true,
    "executor_model_scope": "static",
    "executor_input_formats": ["claude"],
    "executor_output_formats": ["claude"]
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelRouter`、`ModelRouteRequest`、`ModelRouteResponse`、`ModelRouteTargetKind`
- `sdk/pluginabi/types.go`：`model.route`
- `internal/pluginhost/model_router.go`：路由器優先順序、目標驗證與內建 provider 可用性檢查
- `sdk/api/handlers/handlers.go`：一般 provider/auth 解析之前的請求入口

範例參考：

- `examples/plugin/claude-web-search-router/go/main.go`
- `examples/plugin/claude-web-search-router/go/fallback.go`

## 方法

| 方法 | 用途 |
| --- | --- |
| `model.route` | 回傳目前用戶端請求的路由決定。 |

## 執行時機

宿主在一般流程查找模型對應的 provider 並選擇憑證之前，會先詢問已啟用的模型路由器，優先順序高的外掛先執行。路由器回傳 `Handled: false`、無效目標或無法使用的目標時，宿主會略過它並改問下一個路由器。沒有任何路由器處理請求時，就繼續走宿主的一般流程。

請求仍維持用戶端原本的協定。例如 Claude 相容請求進來時會帶 `SourceFormat: "claude"`，原始的 Claude 請求 body 放在 `Body`。

## 請求

```json
{
  "Plugin": {},
  "PluginID": "claude-web-search-router",
  "SourceFormat": "claude",
  "RequestedModel": "claude-sonnet-4-6",
  "Stream": true,
  "Headers": {},
  "Query": {},
  "Body": "base64-client-body",
  "Metadata": {},
  "AvailableProviders": ["antigravity", "codex", "xai"]
}
```

重要欄位：

| 欄位 | 說明 |
| --- | --- |
| `PluginID` | 目前被呼叫的路由外掛在宿主內的 ID。 |
| `SourceFormat` | 用戶端原本的協定格式，例如 `openai`、`claude` 或 `gemini`。 |
| `RequestedModel` | 進行 provider/auth 解析之前，用戶端所請求的模型。 |
| `Stream` | 用戶端是否預期串流輸出。 |
| `Headers` / `Query` | 傳入請求的標頭與查詢參數。 |
| `Body` | 用戶端的原始請求 body，在 RPC JSON 中以 base64 編碼。 |
| `Metadata` | 盡可能擷取的請求上下文快照，請當成唯讀的類 JSON 資料處理。 |
| `AvailableProviders` | 目前已註冊憑證的內建 provider key。回傳 `TargetKind: "provider"` 之前應先檢查它。 |

## 回應

不處理：

```json
{
  "Handled": false
}
```

導向同一個外掛自己的執行器：

```json
{
  "Handled": true,
  "TargetKind": "self",
  "Reason": "matched_web_search"
}
```

導向另一個外掛的執行器：

```json
{
  "Handled": true,
  "TargetKind": "executor",
  "Target": "search-executor",
  "Reason": "matched_search_executor"
}
```

導向內建 provider：

```json
{
  "Handled": true,
  "TargetKind": "provider",
  "Target": "codex",
  "TargetModel": "gpt-5.4-mini",
  "Reason": "matched_codex_web_search"
}
```

## 目標類型

| TargetKind | Target | TargetModel | 行為 |
| --- | --- | --- | --- |
| `self` | 忽略此值；宿主會使用目前路由外掛的 ID。 | 忽略。 | 執行路由外掛自己的執行器。 |
| `executor` | 目標外掛 ID。 | 忽略。 | 直接執行另一個外掛的執行器。 |
| `provider` | 內建 provider key。 | 選填，用來覆寫模型。 | 繼續走內建的 AuthManager 與 provider 執行器流程。 |

直接導向外掛執行器時，不會先選擇憑證記錄。目標執行器必須宣告執行器能力、透過 `executor_model_scope: "static"` 或 `"both"` 允許靜態執行，並支援目前請求的請求／回應協定格式。

導向 provider 時，目標必須是 `AvailableProviders` 裡有的 provider。`TargetModel` 為空時，宿主沿用用戶端原本請求的模型。如果目標 provider 需要自己的原生模型名稱，請明確設定 `TargetModel`，不要直接轉送用戶端的模型名稱。

## 設定範例

`claude-web-search-router` 範例用 ModelRouter 偵測 Claude Code 內建的 `web_search` 請求，再把請求導向支援網路搜尋的內建 provider，或導向外掛自己以 Tavily 為後端的執行器。

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs:
    claude-web-search-router:
      enabled: true
      priority: 20
      route: fallback
      antigravity_model: "gemini-3.1-flash-lite"
      codex_model: "gpt-5.4-mini"
      xai_model: "grok-4.3"
      tavily_api_keys:
        - "tvly-xxxxxxxx"
      require_web_search_only: true
```

範例的路由行為：

| Route | 目標 |
| --- | --- |
| `antigravity_google` | `TargetKind: "provider"`、`Target: "antigravity"`、`TargetModel: antigravity_model` |
| `codex_web_search` | `TargetKind: "provider"`、`Target: "codex"`、`TargetModel: codex_model` |
| `xai_web_search` | `TargetKind: "provider"`、`Target: "xai"`、`TargetModel: xai_model` |
| `tavily` | `TargetKind: "self"`，由外掛執行器自行處理 Tavily。 |
| `fallback` | `TargetKind: "self"`，由外掛執行器在已設定的多個後端之間安排備援。 |

## 開發注意事項

- 外掛不認得的請求應回傳 `Handled: false`，讓優先順序較低的路由器與宿主的一般流程接手。
- `model.route` 要保持快速，只負責分類與選擇目標，不要在這裡發出完整的上游請求。
- 回傳內建 provider 目標之前，先檢查 `AvailableProviders`。
- 外掛執行器需要安排備援、呼叫 `host.model.*`，或使用外掛自有的外部服務時，使用 `self`。
- 請求應繼續走宿主管理的憑證選擇、請求記錄、用量統計與內建執行器時，使用 `provider`。
- `model_router` 由能力旗標與 `model.route` 方法啟用，不需要提高外掛的 schema 版本。
