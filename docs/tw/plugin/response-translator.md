---
outline: 'deep'
---

# 回應轉換能力

回應轉換能力會把標準格式的回應轉換回用戶端所要求的目標協定。它與[請求轉換能力](./request-translator)相互對應，在上游回應回傳之後、送交用戶端之前執行。

## 能力欄位

```json
{
  "capabilities": {
    "response_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseTranslator`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.translate`
- `internal/pluginhost/adapters.go`：`TranslateResponse`、`callResponseTranslator`

範例參考：

- `examples/plugin/response-translator/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseTranslate`

## 方法

| 方法 | 用途 |
| --- | --- |
| `response.translate` | 將回應的 `Body` 從 `FromFormat` 轉換為 `ToFormat`。 |

## 請求

```json
{
  "FromFormat": "codex",
  "ToFormat": "chat-completions",
  "Model": "gpt-5.5",
  "Stream": false,
  "OriginalRequest": "base64-client-body",
  "TranslatedRequest": "base64-provider-request",
  "Body": "base64-upstream-response"
}
```

## 回應

```json
{
  "Body": "base64-client-response"
}
```

## 開發注意事項

- `OriginalRequest` 是用戶端的原始請求，`TranslatedRequest` 是送往上游的請求，兩者可用來補齊回應格式。
- 回應轉換應輸出用戶端協定所需的完整回應。
- 串流回應能否轉換，取決於宿主的執行器與格式能力。外掛應實際測試串流情境。

