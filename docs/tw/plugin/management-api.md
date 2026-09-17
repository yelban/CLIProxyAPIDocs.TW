---
outline: 'deep'
---

# Management API 能力

Management API 能力讓外掛註冊自己的管理端點與瀏覽器資源頁面，適合用來提供狀態頁、診斷頁、設定輔助工具或外掛專屬的操作入口。

## 能力欄位

```json
{
  "capabilities": {
    "management_api": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ManagementAPI`、`ManagementRegistrationRequest`、`ManagementRoute`、`ResourceRoute`、`ManagementRequest`、`ManagementResponse`
- `sdk/pluginabi/types.go`：`management.register`、`management.handle`
- `internal/pluginhost/management.go`：管理路由與資源路由的註冊、驗證邊界

範例參考：

- `examples/plugin/management-api/go/main.go`
- `examples/plugin/host-callback/go/main.go`
- `examples/plugin/host-model-callback/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodManagementRegister`、`MethodManagementHandle`

## 方法

| 方法 | 用途 |
| --- | --- |
| `management.register` | 註冊外掛自己的管理路由與瀏覽器資源。 |
| `management.handle` | 處理比對到外掛路由的 HTTP 請求。 |

## 路由類型

| 類型 | 註冊欄位 | 對外路徑 | 驗證 |
| --- | --- | --- | --- |
| 外掛自有的管理 API | `Routes` | `/v0/management/...` | 需要管理金鑰。 |
| 瀏覽器資源頁面 | `Resources` | `/v0/resource/plugins/<pluginID>/...` | 資源請求本身不經過管理驗證。管理中心採同源部署時，受信任頁面的 JavaScript 可以讀取已儲存的管理金鑰，並呼叫 `/v0/management/...`。 |

## 註冊回應

```json
{
  "Routes": [
    {
      "Method": "POST",
      "Path": "/plugins/example/run"
    }
  ],
  "Resources": [
    {
      "Path": "/status",
      "Menu": "Example Plugin",
      "Description": "Shows example plugin status."
    }
  ]
}
```

資源的最終路徑範例：

```text
/v0/resource/plugins/example/status
```

## 處理請求

`management.handle` 接收：

```json
{
  "Method": "GET",
  "Path": "/v0/resource/plugins/example/status",
  "Headers": {},
  "Query": {},
  "Body": "base64-body"
}
```

回應：

```json
{
  "StatusCode": 200,
  "Headers": {
    "Content-Type": ["text/html; charset=utf-8"]
  },
  "Body": "base64-html"
}
```

## 驗證邊界

- `/v0/management/...` 下的外掛管理介面需要管理金鑰。
- `/v0/resource/plugins/<pluginID>/...` 是瀏覽器資源路徑。提供頁面的 GET 請求本身不經過 Management API 驗證。
- 同源部署時，外掛資源頁可以讀取管理中心的 `localStorage`，並沿用其中儲存的管理金鑰。因此，安裝並啟用這類外掛，就等於決定信任該外掛的瀏覽器端程式碼。
- 跨來源部署無法依賴這種儲存空間存取方式。外掛頁面必須處理管理狀態不存在或無法讀取的情況。
- 帶有 `Menu` 的舊式 GET 管理路由會由宿主遷移為資源路由，避免選單頁面被當成管理 API 對外公開。

## 受信任資源頁模式

需要執行特權操作時，建議採用下列結構：

1. 以資源頁提供外掛 UI。
2. 在同源可用時，由頁面的 JavaScript 讀取管理中心的儲存空間。
3. 使用讀到的管理金鑰，透過 `Authorization: Bearer <management-key>` 呼叫外掛自己的 `/v0/management/...` 路由。

不要把敏感動作直接綁定在未經驗證的資源 GET 請求上。如果資源路由讀取查詢參數後就立即修改設定、讀取憑證檔案，或呼叫特權宿主回呼，只要能連到該資源網址，這些動作就等於對外公開。

## 開發注意事項

- 外掛管理路由不能覆寫宿主既有的 `/v0/management` 路由。
- 資源路徑不能包含空白、`:`、`*` 或 `..`。
- 回傳 HTML 時，仍要避免把機密資料、權杖或憑證 JSON 輸出到頁面上。
- 外掛資源頁的腳本請自行打包。載入第三方腳本，會讓這些腳本能夠存取同源的管理儲存空間。
- 需要使用宿主的模型、HTTP 或憑證檔案能力時，請使用[宿主回呼](./host-callbacks)。
