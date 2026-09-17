---
outline: 'deep'
---

# 模型提供者能力

模型提供者能力負責提供靜態模型，並針對特定憑證記錄動態探索模型。對 OAuth、檔案憑證，或需要存取上游模型清單的外掛來說，它比模型註冊器更合適。

## 能力欄位

```json
{
  "capabilities": {
    "model_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelProvider`、`StaticModelRequest`、`AuthModelRequest`、`ModelResponse`
- `sdk/pluginabi/types.go`：`model.static`、`model.for_auth`
- `internal/pluginhost/adapters.go`：`RegisterModels`、`ModelsForAuth`

範例參考：

- `examples/plugin/model/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodModelStatic`、`MethodModelForAuth`

## 方法

| 方法 | 用途 |
| --- | --- |
| `model.static` | 回傳不依賴特定憑證的靜態模型清單。 |
| `model.for_auth` | 回傳某筆憑證記錄可用的模型清單，也可以一併回傳憑證更新。 |

## 靜態模型請求

`model.static` 接收 `StaticModelRequest`：

```json
{
  "Plugin": {},
  "Host": {
    "AuthDir": "~/.cli-proxy-api",
    "ProxyURL": "",
    "ForceModelPrefix": false
  }
}
```

## 依憑證探索模型

`model.for_auth` 接收 `AuthModelRequest`：

```json
{
  "AuthID": "auth-1",
  "AuthProvider": "plugin-example",
  "StorageJSON": "base64-json",
  "Metadata": {},
  "Attributes": {},
  "Host": {}
}
```

如果外掛需要呼叫上游的模型 API，請使用與請求中宿主 HTTP 用戶端關聯的 `host.http.*` 橋接，讓 Proxy 設定、傳輸策略與請求記錄仍由宿主管理。

## 回應

`model.static` 與 `model.for_auth` 都回傳 `ModelResponse`：

```json
{
  "Provider": "plugin-example",
  "Models": [
    {
      "ID": "plugin-example-model",
      "Object": "model",
      "OwnedBy": "plugin-example",
      "DisplayName": "Plugin Example Model",
      "SupportedGenerationMethods": ["chat"],
      "ContextLength": 8192,
      "MaxCompletionTokens": 1024,
      "UserDefined": true
    }
  ],
  "AuthUpdate": {}
}
```

`AuthUpdate` 可以在探索模型時更新憑證資料，例如上游回傳的帳號資訊、專案 ID，或下一次更新時間。

## 與執行器的關係

如果外掛同時宣告[執行器能力](./executor)，`executor_model_scope` 會決定模型提供者的註冊路徑：

- `static`：只註冊靜態模型。
- `oauth`：只處理依憑證探索到的模型。
- `both` 或空值：兩種模型都支援。

## 開發注意事項

- `model.for_auth` 只應處理自己認得的憑證供應商。
- `Provider` 為空時，宿主會嘗試使用目前憑證的 provider。
- 動態探索回傳錯誤時，宿主會把該憑證的探索視為「已處理但失敗」。
