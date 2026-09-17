---
outline: 'deep'
---

# 宿主回呼

宿主回呼是外掛呼叫 CLIProxyAPI 宿主功能的機制。它不是外掛能力欄位，但對執行器、Management API、憑證與資源頁面這幾類外掛很重要。

## 方法清單

原始碼參考：

- `sdk/pluginabi/types.go`：所有 `host.*` 方法名稱
- `sdk/pluginapi/types.go`：HTTP、模型執行與憑證檔案的請求／回應結構
- `internal/pluginhost/host_callbacks.go`：宿主回呼的實作

範例參考：

- `examples/plugin/host-callback/go/main.go`
- `examples/plugin/host-callback-auth-files/go/main.go`
- `examples/plugin/host-model-callback/go/main.go`

## HTTP 回呼

| 方法 | 用途 |
| --- | --- |
| `host.http.do` | 透過宿主執行一般的 HTTP 請求。 |
| `host.http.do_stream` | 透過宿主執行串流 HTTP 請求。 |
| `host.http.stream_read` | 讀取宿主持有的 HTTP 串流。 |
| `host.http.stream_close` | 關閉宿主持有的 HTTP 串流。 |

外掛存取外部 HTTP 服務時，應優先使用這些方法，讓 Proxy 設定、傳輸策略與請求記錄仍由宿主管理。

## 模型執行回呼

| 方法 | 用途 |
| --- | --- |
| `host.model.execute` | 發出非串流模型請求。 |
| `host.model.execute_stream` | 發出串流模型請求，並回傳 `stream_id`。 |
| `host.model.stream_read` | 讀取模型串流的 chunk。 |
| `host.model.stream_close` | 關閉模型串流。 |

請求的核心欄位：

```json
{
  "entry_protocol": "openai",
  "exit_protocol": "openai",
  "model": "gpt-5.5",
  "stream": false,
  "body": "base64-request-body",
  "headers": {},
  "query": {},
  "alt": ""
}
```

## host_callback_id

外掛在 `management.handle` 這類由宿主呼叫的情境中呼叫 `host.model.*` 時，應轉送請求中的 `host_callback_id`。

宿主會用這個 ID 辨識發起回呼的外掛。執行巢狀模型請求時，宿主會略過該外掛自己的請求、回應與串流攔截器，避免遞迴。其他已啟用的外掛仍可處理這次巢狀請求。

## 憑證檔案回呼

| 方法 | 用途 |
| --- | --- |
| `host.auth.list` | 列出宿主憑證記錄。 |
| `host.auth.get` | 依 auth index 讀取實體憑證 JSON 檔案。 |
| `host.auth.get_runtime` | 依 auth index 讀取執行階段的憑證資訊。 |
| `host.auth.save` | 寫入憑證 JSON，並更新執行階段的憑證記錄。 |

`examples/plugin/host-callback-auth-files` 示範如何從資源頁面呼叫這些方法。

## 串流橋接與記錄

| 方法 | 用途 |
| --- | --- |
| `host.stream.emit` | 讓執行器外掛把串流 chunk 送給宿主。 |
| `host.stream.close` | 讓執行器外掛關閉串流。 |
| `host.log` | 透過宿主的記錄器寫入記錄。 |

## 開發注意

- 使用串流回呼後，應明確呼叫對應的 close 方法。
- 不要用宿主回呼繞過外掛本身的安全邊界；外掛仍是受信任、在行程內執行的程式碼。
- 不要把憑證 JSON、權杖或使用者的請求本文寫入記錄。
- 不要把讀取憑證、寫入憑證或其他需要特權的宿主回呼，直接開放成未經驗證的資源 GET 查詢參數。如果資源頁需要讓使用者操作這些功能，應由同源的 JavaScript 讀取受信任的管理中心儲存資料，再呼叫需要驗證的 `/v0/management/...` 路由。
- 可以沿用宿主的模型執行流程時，請優先使用 `host.model.*`，不要把宿主的憑證複製到外掛裡。
