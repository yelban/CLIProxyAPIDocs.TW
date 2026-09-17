---
outline: 'deep'
---

# 請求正規化能力

請求正規化能力會在請求 payload 進入執行流程之前，把它改寫成宿主後續階段比較容易處理的形式。常見用途是補上預設值、修正特定供應商的 payload，或做輕量的請求改寫。

## 能力欄位

```json
{
  "capabilities": {
    "request_normalizer": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestNormalizer`、`RequestTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`request.normalize`
- `internal/pluginhost/adapters.go`：`NormalizeRequest`、`callRequestNormalizer`

範例參考：

- `examples/plugin/request-normalizer/go/main.go`
- `examples/plugin/codex-service-tier/go/main.go`
- `examples/plugin/codex-service-tier/README.md`
- `examples/plugin/simple/go/main.go`：`MethodRequestNormalize`

## 方法

| 方法 | 作用 |
| --- | --- |
| `request.normalize` | 依據格式、模型與串流旗標，回傳新的請求本文。 |

## 請求

```json
{
  "FromFormat": "chat-completions",
  "ToFormat": "codex",
  "Model": "gpt-5.5",
  "Stream": false,
  "Body": "base64-request-body"
}
```

## 回應

```json
{
  "Body": "base64-normalized-body"
}
```

## 範例：Codex service tier

`examples/plugin/codex-service-tier` 是比較貼近實際用法的請求正規化範例。它會讀取外掛設定中的 `fast` 欄位，並在以下條件全部符合時修改 Codex 請求：

- `ToFormat` 是 `codex`
- `Model` 是 `gpt-5.5`
- `fast` 為 `true`

設定範例：

```yaml
plugins:
  configs:
    codex-service-tier:
      enabled: true
      priority: 1
      fast: true
```

## 開發注意事項

- 請求正規化應該維持小範圍、可預測，不要承擔執行器的職責。
- 回傳空的 `Body` 會讓宿主無法套用有效的改寫；要保留原內容時，請回傳原始 `Body`。
- 外掛自己的設定會透過 `config_yaml` 傳入 `plugin.register` 與 `plugin.reconfigure`，請在那裡解析並快取。

