# xAI / Grok（OAuth 登入）

CLIProxyAPI 透過 xAI OAuth 支援 Grok Build 帳戶。登入後，帳戶會以 `xai` 供應商的形式提供，預設使用 xAI API 基底網址 `https://api.x.ai/v1`。

## 登入

```bash
./cli-proxy-api --xai-login
```

選項：加上 `--no-browser` 會印出登入網址，而不是開啟瀏覽器。本機 OAuth 回呼預設監聽 `127.0.0.1:56121/callback`。

如果預設的回呼連接埠無法使用，可以改用其他連接埠：

```bash
./cli-proxy-api --xai-login --oauth-callback-port <port>
```

在遠端或無圖形介面的環境中，請依指令印出的 SSH 通道說明操作。如果 CLI 要求手動輸入回呼權杖，只要貼上權杖值，不要貼上完整的回呼 URL。

## 支援的 API

- 文字模型會路由到 xAI 的 Responses API，可透過 `/v1/responses`、`/v1/chat/completions` 等 OpenAI 相容端點呼叫。
- 圖片請求使用 `/v1/images/generations` 與 `/v1/images/edits`，模型為 `grok-imagine-image` 或 `grok-imagine-image-quality`。
- 影片請求使用 `/v1/videos`、`/v1/videos/generations`、`/v1/videos/edits`、`/v1/videos/extensions` 與 `/v1/videos/{request_id}`，模型為 `grok-imagine-video`。

xAI 的圖片與影片模型可以直接使用模型名稱，也可以加上 `xai/`、`x-ai/` 或 `grok/` 前綴。

## 模型控制

在 `oauth-model-alias` 下使用 `xai` 管道，可以讓用戶端看到不同的模型名稱：

```yaml
oauth-model-alias:
  xai:
    - name: "grok-4.3"
      alias: "grok-latest"
```

在 `oauth-excluded-models` 下使用同一個管道，可以把模型從模型清單與路由中隱藏：

```yaml
oauth-excluded-models:
  xai:
    - "grok-3-mini"
```

## 請求注意事項

CLIProxyAPI 會先正規化 xAI Responses 請求，再送往上游：移除不支援的續接／快取欄位，調整工具定義以相容 xAI，並且只為支援 reasoning effort 的 Grok 模型保留推理設定。
