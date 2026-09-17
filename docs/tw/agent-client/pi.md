# PI Agent

啟動 CLIProxyAPI 伺服器，然後執行下列指令，安裝官方的 PI 供應商外掛。

```bash
pi install npm:@router-for-me/pi-cliproxyapi-provider
```

接著進入 PI，執行 `/login CLIProxyAPI`，填入 Base URL 與 API 金鑰登入。

最後在 PI 中執行 `/settings`，開啟設定，將 `Transport` 設為 `websocket-cached`。