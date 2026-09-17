---
outline: 'deep'
---

# 模型註冊器能力

模型註冊器能力會把外掛提供的靜態模型中繼資料，註冊到 CLIProxyAPI 的模型登錄表。適合模型組合固定、不需要依憑證動態探索模型的外掛。

## 能力欄位

在 `plugin.register` 或 `plugin.reconfigure` 的註冊結果中宣告：

```json
{
  "capabilities": {
    "model_registrar": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelRegistrar`、`ModelRegistrationRequest`、`ModelRegistrationResponse`、`ModelInfo`
- `sdk/pluginabi/types.go`：`model.register`
- `internal/pluginhost/adapters.go`：`RegisterModels`、`callModelRegistrar`

範例參考：

- `examples/plugin/simple/go/main.go`：`MethodModelRegister`

## 呼叫時機

宿主載入外掛或重新設定外掛後，會在模型註冊階段呼叫 `model.register`。回傳的模型會加入模型清單，並進入路由比對流程。

如果同一個外掛也宣告了[執行器能力](./executor)，這些模型會與該外掛的執行器關聯；沒有執行器時，宿主會把它們註冊成一般的外掛提供模型用戶端。

## 請求

`model.register` 的請求對應 `ModelRegistrationRequest`：

```json
{
  "Plugin": {
    "Name": "example",
    "Version": "0.1.0",
    "Author": "router-for-me"
  }
}
```

`Plugin` 是目前外掛的中繼資料，外掛可以依自己的版本或設定決定要回傳哪些模型。

## 回應

回傳 `ModelRegistrationResponse`：

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
  ]
}
```

關鍵點：

- `Provider` 必須是固定不變的供應商識別碼。
- `Models` 必須是完整的模型組合，而不是差異部分。
- `ID` 是用戶端請求時使用的模型名稱。
- `Thinking` 可以宣告模型支援的 thinking 範圍，供 thinking 設定驗證與後續的 [Thinking 處理能力](./thinking-applier)使用。

## 開發注意

- 不要回傳空的 `Provider` 或空的模型 ID；宿主會略過無效的模型。
- 模型註冊器只處理靜態模型；需要依每個 OAuth 或檔案憑證動態探索模型時，請使用[模型提供者能力](./model-provider)。
- 如果模型只應由外掛執行器處理，請同時宣告執行器能力，並設定適當的 `executor_model_scope`。
