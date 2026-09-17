---
outline: 'deep'
---

# Thinking 處理能力

Thinking 處理能力會把宿主已經解析、正規化並驗證過的 thinking 設定，寫入供應商的 payload。這樣可以維持「標準 thinking 設定轉成供應商專屬欄位」的架構邊界。

## 能力欄位

```json
{
  "capabilities": {
    "thinking_applier": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ThinkingApplier`、`ThinkingApplyRequest`、`ThinkingConfig`
- `sdk/pluginabi/types.go`：`thinking.identifier`、`thinking.apply`
- `internal/pluginhost/adapters.go`：Thinking 處理能力的註冊與呼叫
- `internal/thinking/`：宿主的 thinking 解析、正規化與驗證流程

範例參考：

- `examples/plugin/thinking/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodThinkingIdentifier`、`MethodThinkingApply`

## 方法

| 方法 | 用途 |
| --- | --- |
| `thinking.identifier` | 回傳此外掛負責處理的供應商識別碼。 |
| `thinking.apply` | 將標準 thinking 設定套用到供應商的 payload。 |

## 請求

```json
{
  "Provider": "plugin-example",
  "Model": {
    "ID": "plugin-example-model",
    "Thinking": {
      "Min": 0,
      "Max": 32768,
      "ZeroAllowed": true,
      "DynamicAllowed": true,
      "Levels": ["low", "medium", "high"]
    }
  },
  "Config": {
    "Mode": "budget",
    "Budget": 1024,
    "Level": ""
  },
  "Body": "base64-provider-payload"
}
```

`Config` 已經是宿主正規化後的設定，外掛不需要再從請求本文解析後綴或原始的 thinking 輸入。

## 回應

```json
{
  "Body": "base64-provider-payload-with-thinking"
}
```

## 開發注意

- 外掛只應處理自己的 `thinking.identifier` 所回傳的供應商。
- 不要繞過宿主的 thinking 驗證；請假設 `Config` 已經是標準值。
- 不要在 Thinking 處理能力中進行請求轉換、憑證選擇或上游執行。
