# AI Studio 使用說明

你可以把本服務當作[這個 AI Studio 應用程式](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL)的後端。請依照下列步驟設定：

1.  **啟動 CLIProxyAPI 服務**：確認你的 CLIProxyAPI 執行個體正在本機或遠端執行。
2.  **開啟 AI Studio 應用程式**：在瀏覽器中登入 Google 帳戶，然後開啟下列連結：
    - [https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL)

**注意**：如果你使用 Brave 瀏覽器，可能需要關閉它的 Shields 功能，因為它可能會封鎖 WebSocket 連線。其他廣告封鎖工具也可能造成同樣的問題。

## 連線設定

AI Studio 應用程式預設會連線到本機的 CLIProxyAPI（`ws://127.0.0.1:8317`）。

-   **連線到遠端服務**：
    如果要連線到部署在遠端的 CLIProxyAPI，請修改 AI Studio 應用程式中的 `config.ts` 檔案，更新 `WEBSOCKET_PROXY_URL` 的值。
    -   遠端服務若已啟用 SSL，請使用 `wss://` 協定。
    -   若未啟用 SSL，請使用 `ws://` 協定。

## 驗證設定

CLIProxyAPI 的 WebSocket 連線預設不需要驗證。

-   **在 CLIProxyAPI 伺服器端啟用驗證**：
    在 `config.yaml` 檔案中，將 `ws_auth` 設為 `true`。
-   **在 AI Studio 用戶端設定驗證**：
    在 AI Studio 應用程式的 `config.ts` 檔案中，將 `JWT_TOKEN` 的值設為你的驗證權杖。
