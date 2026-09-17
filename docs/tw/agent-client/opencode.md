# OpenCode

先啟動 CLIProxyAPI 伺服器，再編輯 `~/.config/opencode/opencode.json`（檔案不存在時請自行建立）。

```json
{
    "$schema": "https://opencode.ai/config.json",
    "provider": {
        "openai": {
            "options": {
                "baseURL": "http://127.0.0.1:8317/v1",
                "apiKey": "sk-dummy"
            }
        }
    },
    "model": "gpt-5.3-codex"
}
```


