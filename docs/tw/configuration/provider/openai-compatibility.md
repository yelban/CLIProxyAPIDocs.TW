# OpenAI 相容供應商

透過 `openai-compatibility` 設定與 OpenAI 相容的上游供應商（例如 OpenRouter）。

- name：內部使用的供應商識別名稱
- disabled：選填，設為 true 可停用此供應商，不必刪除設定
- base-url：供應商的基礎網址
- api-key-entries：API 金鑰項目清單，每個金鑰可選擇另設 Proxy（建議使用，也是設定檔保存的格式）
- models：將上游模型 `name` 對應到本機使用的 `alias`

> 相容性說明：舊欄位 `api-keys` 會在載入時自動遷移到 `api-key-entries`，並在儲存設定時移除；今後請直接使用 `api-key-entries`。

每個金鑰各自設定 Proxy 的範例：

```yaml
openai-compatibility:
  - name: "openrouter"
    disabled: false
    base-url: "https://openrouter.ai/api/v1"
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080"
      - api-key: "sk-or-v1-...b781"
    models:
      - name: "moonshotai/kimi-k2:free"
        alias: "kimi-k2"
```

使用方式：呼叫 OpenAI 的 `/v1/chat/completions` 端點，並將 `model` 設為別名（例如 `kimi-k2`），Proxy 會自動轉送到設定好的供應商與模型。
