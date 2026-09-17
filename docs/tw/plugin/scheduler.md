---
outline: 'deep'
---

# 排程器能力

排程器能力會在宿主的內建排程器執行前，從候選憑證記錄中選出一個憑證，或明確交由內建排程器處理。

## 能力欄位

```json
{
  "capabilities": {
    "scheduler": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`Scheduler`、`SchedulerPickRequest`、`SchedulerPickResponse`
- `sdk/pluginabi/types.go`：`scheduler.pick`
- `internal/pluginhost/adapters.go`：排程器能力的註冊與呼叫

範例參考：

- `examples/plugin/scheduler/go/main.go`
- `examples/plugin/scheduler/README.md`

## 方法

| 方法 | 用途 |
| --- | --- |
| `scheduler.pick` | 根據請求情境與候選憑證，回傳排程決定。 |

## 請求

```json
{
  "Provider": "codex",
  "Providers": ["codex"],
  "Model": "gpt-5.5",
  "Stream": true,
  "Options": {
    "Headers": {},
    "Metadata": {}
  },
  "Candidates": [
    {
      "ID": "auth-1",
      "Provider": "codex",
      "Priority": 1,
      "Status": "available",
      "Attributes": {},
      "Metadata": {}
    }
  ]
}
```

## 回應

選擇特定憑證：

```json
{
  "AuthID": "auth-1",
  "Handled": true
}
```

交由內建排程器處理：

```json
{
  "DelegateBuiltin": "round-robin",
  "Handled": true
}
```

不處理這次排程請求：

```json
{
  "Handled": false
}
```

可交由內建排程器處理的值：

- `round-robin`
- `fill-first`

## 設定範例

```yaml
plugins:
  configs:
    scheduler:
      enabled: true
      priority: 1
      auth_id: ""
      delegate: ""
      deny: false
```

範例外掛的行為：

- `deny: true` 時回傳錯誤。
- `delegate` 為 `fill-first` 或 `round-robin` 時，交由內建排程器處理。
- `auth_id` 不是空值，且存在於候選清單中時，選擇該憑證。

## 開發注意

- 只從 `Candidates` 選擇憑證 ID，不要回傳請求情境以外的 ID。
- 回傳錯誤會讓這次排程失敗，適合用來明確拒絕請求。
- 外掛不想處理請求時，回傳 `Handled: false`，讓後續外掛或宿主的內建邏輯繼續處理。
