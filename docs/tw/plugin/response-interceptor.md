---
outline: 'deep'
---

# 回應攔截能力

回應攔截能力會在成功的非串流 HTTP 執行回應傳回用戶端之前，改寫回應標頭或回應本文。

## 能力欄位

```json
{
  "capabilities": {
    "response_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseInterceptor`、`ResponseInterceptRequest`、`ResponseInterceptResponse`
- `sdk/pluginabi/types.go`：`response.intercept_after`
- `internal/pluginhost/adapters.go`：`InterceptResponse`

範例參考：

- `internal/pluginhost/adapters_test.go`：回應攔截器鏈、標頭清除與錯誤處理的測試
- `examples/plugin/antigravity-web-search/go/main.go`：以回應攔截實作的實際遷移範例

## 方法

| 方法 | 用途 |
| --- | --- |
| `response.intercept_after` | 改寫成功的非串流回應。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "Stream": false,
  "RequestHeaders": {},
  "ResponseHeaders": {},
  "OriginalRequest": "base64-client-body",
  "RequestBody": "base64-upstream-request",
  "Body": "base64-response-body",
  "StatusCode": 200,
  "Metadata": {}
}
```

## 回應

```json
{
  "Headers": {
    "X-Plugin": ["example"]
  },
  "Body": "base64-new-response-body",
  "ClearHeaders": ["X-Old-Header"]
}
```

## 開發注意

- 只處理成功的非串流回應；串流回應請使用[串流回應攔截能力](./response-stream-interceptor)。
- `Headers` 會覆寫同名的回應標頭，未列出的標頭則保留不變。
- `Body` 不是空值時，會取代回應本文。
- 帶著 `host_callback_id` 發起的宿主模型回呼，會略過發起外掛自己的回應攔截器。

