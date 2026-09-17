---
outline: 'deep'
---

# 回應轉換後正規化能力

回應轉換後正規化能力會在回應已轉換成用戶端協定之後，做最後一次改寫。適合用來相容要求嚴格的用戶端、補上欄位，或做輕量的回應後處理。

## 能力欄位

```json
{
  "capabilities": {
    "response_after_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseNormalizer`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.normalize_after`
- `internal/pluginhost/adapters.go`：`NormalizeResponse` 轉換後階段

範例參考：

- `examples/plugin/response-normalizer/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseNormalizeAfter`

## 方法

| 方法 | 用途 |
| --- | --- |
| `response.normalize_after` | 在回應轉換後，回傳正規化後的用戶端回應本文。 |

## 請求

請求內容包含原始的用戶端請求、轉換後的上游請求，以及目前的回應本文：

```json
{
  "FromFormat": "codex",
  "ToFormat": "chat-completions",
  "Model": "gpt-5.5",
  "Stream": false,
  "OriginalRequest": "base64-client-body",
  "TranslatedRequest": "base64-provider-request",
  "Body": "base64-translated-response"
}
```

## 回應

```json
{
  "Body": "base64-final-client-response"
}
```

## 開發注意事項

- 適合用來補齊用戶端協定要求的相容欄位。
- 不要在這裡再次呼叫上游，也不要改變計費語意。
- 如果要修改 HTTP 標頭，請使用 [回應攔截能力](./response-interceptor)，而不是回應正規化。

