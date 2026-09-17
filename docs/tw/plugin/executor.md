---
outline: 'deep'
---

# 執行器能力

執行器能力負責把模型請求送往上游供應商或本機後端，是最接近「上游轉接層」的能力。

## 能力欄位

```json
{
  "capabilities": {
    "executor": true,
    "executor_model_scope": "both",
    "executor_input_formats": ["chat-completions"],
    "executor_output_formats": ["chat-completions"]
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ProviderExecutor`、`ExecutorRequest`、`ExecutorResponse`、`ExecutorStreamResponse`、`ExecutorHTTPRequest`
- `sdk/pluginabi/types.go`：`executor.identifier`、`executor.execute`、`executor.execute_stream`、`executor.count_tokens`、`executor.http_request`
- `internal/pluginhost/adapters.go`：執行器註冊、協定格式選擇與執行橋接

範例參考：

- `examples/plugin/executor/go/main.go`
- `examples/plugin/protocol-format/go/main.go`
- `examples/plugin/simple/go/main.go`：執行器相關方法

## 方法

| 方法 | 用途 |
| --- | --- |
| `executor.identifier` | 回傳此執行器負責的 provider 識別碼。 |
| `executor.execute` | 執行非串流模型請求。 |
| `executor.execute_stream` | 執行串流模型請求。 |
| `executor.count_tokens` | 處理 token 計數請求。 |
| `executor.http_request` | 執行器自行處理的 HTTP 請求入口。 |

## 協定格式

`executor_input_formats` 宣告執行器可以直接接收的請求協定，`executor_output_formats` 宣告執行器直接輸出的回應協定。

常見值：

- `chat-completions`
- `responses`
- `anthropic`

`examples/plugin/protocol-format` 示範了輸入 `chat-completions`、輸出 `responses` 的宣告方式。

## 模型範圍

`executor_model_scope` 決定執行器與模型註冊的關係：

| 值 | 說明 |
| --- | --- |
| `static` | 執行器只服務靜態模型。 |
| `oauth` | 執行器只服務 OAuth 或與憑證綁定的模型。 |
| `both` | 執行器同時服務靜態模型與憑證綁定的模型。 |

空值視為 `both`。

## ExecutorRequest

執行請求包含：

```json
{
  "AuthID": "auth-1",
  "AuthProvider": "plugin-example",
  "Model": "plugin-example-model",
  "Format": "chat-completions",
  "Stream": false,
  "Headers": {},
  "Query": {},
  "OriginalRequest": "base64-client-body",
  "SourceFormat": "chat-completions",
  "Payload": "base64-provider-payload",
  "StorageJSON": "base64-auth-json",
  "AuthMetadata": {},
  "AuthAttributes": {}
}
```

外掛向上游發送 HTTP 請求時，應透過 `host.http.*` 使用宿主提供的 HTTP 用戶端，讓請求記錄、Proxy 設定、傳輸策略與憑證上下文仍由宿主控管。

## 回應

非串流回應：

```json
{
  "Payload": "base64-response-body",
  "Headers": {
    "content-type": ["application/json"]
  },
  "Metadata": {}
}
```

串流回應會回傳 `Headers` 與 chunk 串流。C ABI 範例會把有限個 chunk 放進回應陣列，再由宿主轉換成內部串流。

## 開發注意事項

- 執行器至少要宣告一個輸入格式與一個輸出格式。
- `Payload` 已經轉換成目標協定的請求 body，不要再回頭推測用戶端原本的協定。
- 如果要沿用宿主的模型路由，不要寫執行器，改用[宿主回呼](./host-callbacks)中的 `host.model.*`。
- 不要在外掛中儲存或印出上游金鑰。來自 `StorageJSON` 的憑證資料用完即丟棄。
