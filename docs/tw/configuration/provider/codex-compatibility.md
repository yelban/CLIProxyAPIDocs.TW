# Codex 相容供應商

透過 `codex-api-key` 設定上游的 Codex 相容供應商。

- api-key：供應商的 API 金鑰
- base-url：供應商的基礎網址
- proxy-url：供應商使用的 Proxy 網址（選填）

範例：
```yaml
codex-api-key:
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com" # 使用自訂的 Codex API 端點
    proxy-url: "socks5://proxy.example.com:1080" # 選填：覆寫此金鑰使用的 Proxy
```
