---
outline: 'deep'
---

# 前端驗證獨占模式

前端驗證獨占模式不是獨立的介面，而是前端驗證提供者的附加能力。外掛被選中後，宿主只會用這個外掛來驗證前端請求。

## 能力欄位

```json
{
  "capabilities": {
    "frontend_auth_provider": true,
    "frontend_auth_provider_exclusive": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`FrontendAuthProviderExclusive`
- `internal/pluginhost/rpc_schema.go`：`frontend_auth_provider_exclusive`
- `internal/pluginhost/adapters.go`：獨占前端驗證提供者的選擇邏輯

範例參考：

- `examples/plugin/frontend-auth-exclusive/go/main.go`

## 選擇規則

宿主註冊前端驗證提供者時，會優先選擇宣告了 `frontend_auth_provider_exclusive` 的外掛：

- 只對同時宣告 `frontend_auth_provider` 的外掛有效。
- 有多個獨占外掛時，由優先順序較高的外掛勝出。
- 優先順序相同時，宿主依固定的規則選擇。
- 獨占外掛被移除或停用後，宿主會清除獨占狀態。

## 請求與回應

獨占模式仍然使用 `frontend_auth.authenticate`：

```json
{
  "Authenticated": true,
  "Principal": "example-frontend-auth-exclusive-go",
  "Metadata": {
    "mode": "exclusive",
    "provider": "example-frontend-auth-exclusive-go"
  }
}
```

範例外掛會檢查以下請求標頭：

```text
X-Example-Frontend-Auth: exclusive
```

## 開發注意事項

- 獨占模式會改變整個前端驗證的邊界，啟用時必須謹慎。
- 驗證失敗時，外掛應回傳 `Authenticated: false`，不要 panic 或結束行程。
- 不要只宣告 `frontend_auth_provider_exclusive`；沒有 `frontend_auth_provider` 時，這個欄位無法構成有效的前端驗證提供者。
