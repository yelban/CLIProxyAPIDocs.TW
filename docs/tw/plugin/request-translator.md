---
outline: 'deep'
---

# 請求轉換能力

請求轉換能力會把標準格式的請求轉換成目標供應商的協定。它位於執行請求前的協定轉換階段，適合把 CLIProxyAPI 正規化後的請求本文轉換成上游需要的 payload。

## 能力欄位

```json
{
  "capabilities": {
    "request_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestTranslator`、`RequestTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`request.translate`
- `internal/pluginhost/adapters.go`：`TranslateRequest`、`callRequestTranslator`

範例參考：

- `examples/plugin/request-translator/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodRequestTranslate`

## 方法

| 方法 | 用途 |
| --- | --- |
| `request.translate` | 將 `Body` 從 `FromFormat` 轉換成 `ToFormat`。 |

## 請求

```json
{
  "FromFormat": "chat-completions",
  "ToFormat": "anthropic",
  "Model": "claude-sonnet",
  "Stream": false,
  "Body": "base64-request-body"
}
```

## 回應

```json
{
  "Body": "base64-translated-body"
}
```

## 與請求正規化的差異

- [請求正規化能力](./request-normalizer)負責把供應商或特殊入口的請求正規化成宿主能理解的標準格式。
- 請求轉換能力負責把標準格式轉換成目標上游的協定。

## 開發注意事項

- 只處理明確支援的格式組合；遇到無法處理的組合時，請回傳錯誤，或不要宣告這項能力。
- `Body` 必須是完整且有效的目標協定 payload。
- 不要在轉換器裡選擇憑證或發出上游 HTTP 請求；這些屬於排程器與執行器的階段。
