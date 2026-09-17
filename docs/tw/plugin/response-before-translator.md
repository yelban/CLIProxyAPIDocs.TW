---
outline: 'deep'
---

# 回應轉換前正規化能力

回應轉換前正規化能力會在宿主進行原生回應轉換之前，改寫上游回應。適合先修正供應商原生格式的 payload，再交給宿主或外掛的回應轉換器處理。

## 能力欄位

```json
{
  "capabilities": {
    "response_before_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseNormalizer`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.normalize_before`
- `internal/pluginhost/adapters.go`：`NormalizeResponse` 的轉換前階段

範例參考：

- `examples/plugin/response-normalizer/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseNormalizeBefore`

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.normalize_before` | 在回應轉換之前，回傳正規化後的回應本文。 |

## 請求與回應

請求使用 `ResponseTransformRequest`，回應使用 `PayloadResponse`：

```json
{
  "Body": "base64-normalized-provider-response"
}
```

## 與回應轉換後正規化的差異

- `response_before_translator` 處理供應商原生格式的回應。
- [回應轉換後正規化能力](./response-after-translator) 處理已經轉換成用戶端協定的回應。

## 開發注意事項

- 適合用來補上上游缺少的欄位，或相容不符標準的供應商回應。
- 除非目前階段的 `ToFormat` 本來就是用戶端協定格式，否則不要輸出該格式。
- 需要同時支援轉換前與轉換後的正規化時，可以兩個能力都宣告。

