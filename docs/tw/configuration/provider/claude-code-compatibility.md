# Claude Code 相容供應商

透過 `claude-api-key` 設定上游的 Claude Code 相容供應商。

- api-key：供應商的 API 金鑰
- base-url：供應商的基礎網址
- proxy-url：供應商使用的 Proxy 網址（選填）
- models：上游模型 `name` 與本機 `alias` 的對應清單

範例：
```yaml
claude-api-key:
  - api-key: "sk-atSM..." # 使用官方 Claude API 金鑰時，不必設定 base-url
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com" # 使用自訂的 Claude API 端點
    proxy-url: "socks5://proxy.example.com:1080" # 選填：覆寫此金鑰使用的 Proxy
    models:
      - name: "claude-3-5-sonnet-20241022" # 上游模型名稱
        alias: "claude-sonnet-latest" # 用戶端使用的別名，對應到上游模型
```

> [!NOTE]  
> 如果只設定 `api-key`，`base-url` 會自動設為 `https://api.anthropic.com`。  
> 只有使用第三方 Claude Code 相容供應商時，才需要設定 `base-url`。
