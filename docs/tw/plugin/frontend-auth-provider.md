---
outline: 'deep'
---

# 前端驗證提供者能力

前端驗證提供者能力會在用戶端請求進入 Proxy 流程之前進行驗證。它處理的是「誰可以呼叫 CLIProxyAPI」，不負責選擇上游憑證。

## 能力欄位

```json
{
  "capabilities": {
    "frontend_auth_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`FrontendAuthProvider`、`FrontendAuthRequest`、`FrontendAuthResponse`
- `sdk/pluginabi/types.go`：`frontend_auth.identifier`、`frontend_auth.authenticate`
- `internal/pluginhost/adapters.go`：`RegisterFrontendAuthProviders`

範例參考：

- `examples/plugin/frontend-auth/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodFrontendAuthIdentifier`、`MethodFrontendAuthAuthenticate`

## 方法

| 方法 | 用途 |
| --- | --- |
| `frontend_auth.identifier` | 回傳此前端驗證提供者的固定識別碼。 |
| `frontend_auth.authenticate` | 依據 HTTP 請求內容判斷是否通過驗證。 |

## 請求

`frontend_auth.authenticate` 接收：

```json
{
  "Method": "POST",
  "Path": "/v1/chat/completions",
  "Headers": {
    "Authorization": ["Bearer ..."]
  },
  "Query": {},
  "Body": "base64-body"
}
```

## 回應

```json
{
  "Authenticated": true,
  "Principal": "user-or-client-id",
  "Metadata": {
    "provider": "example-frontend-auth-go"
  }
}
```

`Principal` 是通過驗證的主體。`Metadata` 可以攜帶身分屬性，供後續流程使用。

## 與內建 API 金鑰的關係

一般的前端驗證提供者會與宿主既有的驗證方式並行運作。只有宣告[前端驗證獨占模式](./frontend-auth-exclusive)時，外掛被選用後才會成為唯一的前端驗證來源。

## 開發注意事項

- 前端驗證只負責驗證用戶端請求，不應讀取或回傳上游憑證。
- 依據請求 body 進行驗證時，要注意 body 大小與敏感資訊，不要把原始 body 寫進記錄。
- 外掛回傳 `Authenticated: false` 時，宿主會依是否啟用獨占模式，繼續走目前的驗證鏈，或直接拒絕請求。
