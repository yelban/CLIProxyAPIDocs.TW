---
outline: 'deep'
---

# 請求攔截能力

請求攔截能力會在執行上游請求前改寫請求標頭或請求本文，分成兩個階段：選擇憑證前與選擇憑證後。

## 能力欄位

```json
{
  "capabilities": {
    "request_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestInterceptor`、`RequestInterceptRequest`、`RequestInterceptResponse`
- `sdk/pluginabi/types.go`：`request.intercept_before`、`request.intercept_after`
- `internal/pluginhost/adapters.go`：`InterceptRequestBeforeAuth`、`InterceptRequestAfterAuth`

範例參考：

- `internal/pluginhost/adapters_test.go`：請求攔截鏈、略過來源外掛與錯誤處理的測試
- `examples/plugin/antigravity-web-search/go/main.go`：以目前攔截器 seam 為基礎的實際遷移範例

## 方法

| 方法 | 用途 |
| --- | --- |
| `request.intercept_before` | 在選擇憑證前改寫請求。此時 `ToFormat` 可能為空。 |
| `request.intercept_after` | 在選擇憑證後改寫請求。此時模型與上游格式已經更明確。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "ToFormat": "codex",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "Stream": false,
  "Headers": {},
  "Body": "base64-body",
  "Metadata": {}
}
```

## 回應

```json
{
  "Headers": {
    "X-Plugin": ["example"]
  },
  "Body": "base64-new-body",
  "ClearHeaders": ["X-Old-Header"]
}
```

語意：

- `Headers` 會覆寫同名標頭，未提到的標頭則保留。
- `Body` 不為空時，會取代目前的 body。
- `ClearHeaders` 會先刪除指定的標頭，再套用 `Headers`。

## 遞迴保護

外掛透過 `host.model.*` 發起巢狀模型請求並傳入 `host_callback_id` 時，宿主會略過發起外掛自己的請求攔截器，避免遞迴呼叫自己。其他外掛的請求攔截器仍可處理這個巢狀請求。

## 開發注意事項

- `Metadata` 是宿主情境的快照，應視為唯讀。
- 選擇憑證前不要依賴憑證欄位；需要憑證情境的改寫，請在選擇憑證後處理。
- 不要在請求攔截器裡直接呼叫上游模型；需要發出模型請求時，請使用[宿主回呼](./host-callbacks)。
