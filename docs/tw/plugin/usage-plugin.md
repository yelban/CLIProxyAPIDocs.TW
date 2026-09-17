---
outline: 'deep'
---

# 用量觀察能力

用量觀察能力會在請求完成後接收用量、延遲、失敗與計費相關資訊，適合用來串接外部的統計、稽核、計費或監控系統。

## 能力欄位

```json
{
  "capabilities": {
    "usage_plugin": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`UsagePlugin`、`UsageRecord`、`UsageDetail`、`UsageFailure`
- `sdk/pluginabi/types.go`：`usage.handle`
- `internal/pluginhost/adapters.go`：`RegisterUsagePlugins`、`HandleUsage`

範例參考：

- `examples/plugin/usage/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodUsageHandle`

## 方法

| 方法 | 用途 |
| --- | --- |
| `usage.handle` | 接收一筆已完成請求的用量紀錄。 |

## 紀錄內容

`UsageRecord` 包含：

```json
{
  "Provider": "codex",
  "ExecutorType": "codex",
  "Model": "gpt-5.5",
  "Alias": "gpt-5.5",
  "APIKey": "client-key-id",
  "AuthID": "auth-1",
  "AuthIndex": "0",
  "AuthType": "oauth",
  "Source": "openai",
  "ReasoningEffort": "high",
  "ServiceTier": "priority",
  "RequestedAt": "2026-06-15T12:00:00Z",
  "Latency": 1234567890,
  "TTFT": 120000000,
  "Failed": false,
  "Detail": {
    "InputTokens": 10,
    "OutputTokens": 20,
    "ReasoningTokens": 0,
    "CachedTokens": 0,
    "TotalTokens": 30
  },
  "ResponseHeaders": {}
}
```

失敗的請求會帶有 `Failed: true` 與 `Failure`：

```json
{
  "Failure": {
    "StatusCode": 429,
    "Body": "rate limited"
  }
}
```

## 開發注意事項

- 用量外掛應盡快回傳，避免阻塞請求的完成路徑。
- 如果需要寫入外部系統，請在外掛內部做緩衝或以非同步方式傳送。
- 不要洩漏用戶端 API 金鑰、上游權杖或完整的敏感回應本文。
- 用量觀察屬於旁路能力，不應改變請求或回應。

