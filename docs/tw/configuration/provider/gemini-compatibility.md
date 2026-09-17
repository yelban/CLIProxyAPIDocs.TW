# Gemini 相容供應商

透過 `gemini-api-key` 設定上游的 Gemini 相容供應商。

- api-key：供應商的 API 金鑰
- base-url：供應商的基本網址
- proxy-url：此供應商使用的 Proxy 網址（選填）
- headers：選填的額外 HTTP 標頭，只會送往覆寫後的 Gemini 端點。

範例：
```yaml
gemini-api-key:
  - api-key: "AIzaSy...01"
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
  - api-key: "AIzaSy...02" # 使用官方 Gemini API 金鑰時，不必設定 base-url
```

> [!NOTE]
> 如果只設定 `api-key`，`base-url` 會自動設為 `https://generativelanguage.googleapis.com`。    
> 只有使用第三方 Gemini 相容供應商時，才需要設定 `base-url`。