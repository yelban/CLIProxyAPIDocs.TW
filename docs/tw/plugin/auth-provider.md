---
outline: 'deep'
---

# 憑證提供者能力

憑證提供者能力讓外掛參與憑證檔案的解析、登入、輪詢與更新。適合用來新增需要 OAuth、裝置碼、API Key 檔案或自訂 JSON 憑證的上游供應商。

## 能力欄位

```json
{
  "capabilities": {
    "auth_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`AuthProvider`、`AuthData`、`AuthParseRequest`、`AuthLoginStartRequest`、`AuthLoginPollRequest`、`AuthRefreshRequest`
- `sdk/pluginabi/types.go`：`auth.identifier`、`auth.parse`、`auth.login.start`、`auth.login.poll`、`auth.refresh`
- `internal/pluginhost/adapters.go`：憑證解析、更新，以及宿主 HTTP 用戶端橋接

範例參考：

- `examples/plugin/auth/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodAuthIdentifier`、`MethodAuthParse`、`MethodAuthLoginStart`、`MethodAuthLoginPoll`、`MethodAuthRefresh`

## 方法

| 方法 | 用途 |
| --- | --- |
| `auth.identifier` | 回傳外掛負責處理的供應商識別碼。 |
| `auth.parse` | 嘗試解析宿主找到的憑證 JSON 檔案。 |
| `auth.login.start` | 啟動登入流程，回傳要給使用者開啟的 URL 與輪詢狀態。 |
| `auth.login.poll` | 輪詢登入流程，成功時回傳 `AuthData`。 |
| `auth.refresh` | 更新既有憑證，回傳更新後的憑證資料與下次更新時間。 |

## AuthData

`AuthData` 是外掛與宿主之間交換憑證資料的核心結構：

```json
{
  "Provider": "plugin-example",
  "ID": "plugin-example-auth",
  "FileName": "plugin-example.json",
  "Label": "Plugin Example",
  "Prefix": "",
  "ProxyURL": "",
  "Disabled": false,
  "StorageJSON": "base64-json",
  "Metadata": {},
  "Attributes": {},
  "NextRefreshAfter": "2026-06-15T12:00:00Z"
}
```

欄位分工：

- `StorageJSON` 是由外掛負責、會持久保存的憑證內容。
- `Metadata` 是由宿主管理、但可以修改的後設資料。
- `Attributes` 是與路由及供應商相關、不可修改的屬性。
- `NextRefreshAfter` 決定宿主下一次主動更新的時間。

## 登入流程

`auth.login.start` 回傳：

```json
{
  "Provider": "plugin-example",
  "URL": "https://example.com/login",
  "State": "opaque-state",
  "ExpiresAt": "2026-06-15T12:05:00Z",
  "Metadata": {}
}
```

`auth.login.poll` 回傳狀態：

```json
{
  "Status": "pending",
  "Message": "waiting for user confirmation"
}
```

登入成功時，`Status` 為 `success`，並會填入 `Auth`。

## 開發注意事項

- `auth.parse` 必須透過 `Handled` 明確表示是否認得該憑證檔案。
- 外掛需要呼叫上游的登入或更新端點時，請使用宿主的 HTTP 橋接，以免繞過 Proxy 與記錄政策。
- 不要在記錄中輸出 `StorageJSON`、存取權杖、更新權杖或使用者的原始憑證。
- 如果外掛也提供模型探索，通常會搭配 [模型提供者能力](./model-provider) 一起使用。
