# 肆：串接中轉服務篇

前幾篇文章中，我們已經用 OAuth 或 Cookie 成功串接了內建的供應商。這篇教學要再往前一步，學習怎麼把各種 AI 中轉服務輕鬆串接到 CLIProxyAPI。

首先回顧一下之前用的設定檔：

```yaml
port: 8317

# 資料夾位置請依你的實際情況填寫
auth-dir: "Z:\\CLIProxyAPI\\auths"

request-retry: 3

quota-exceeded:
  switch-project: true
  switch-preview-model: true

api-keys:
# Key 請自行設定，供用戶端存取 Proxy 使用
- "ABC-123456"
```

第一次設定後，我們一直沒動過它。現在該幫這個檔案加點東西了。

先來加入一個 Claude 的中轉服務。為此要先取得該服務的 `base-url`，這個網址通常可以在服務商的官方文件或教學中找到。

以 88code 為例，在它的官方教學中可以找到以下資訊：

![](https://img.072899.xyz/2025/09/11c41d79d62c02df1ac5d5998c75d3e5.png)

從圖中可以看出，88code 的 Claude 中轉服務 `base-url` 是 `https://www.88code.org/api`。

我們在設定檔中加入 `claude-api-key` 欄位：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"
```

88code 也有提供 Codex 服務。用同樣的方法找到它的 `base-url`：

![](https://img.072899.xyz/2025/09/28e5ce297bca540e052863860dd9eb2c.png)

然後在設定檔中加入 `codex-api-key` 欄位：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"
    
codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
```

其他服務商也可以用類似的方式加入。例如我這裡還有幾個 PackyCode 的 Codex API Key，就一起加進設定：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"
  - api-key: "sk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://api.packycode.com"
  - api-key: "sk-HpYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
    base-url: "https://api.packycode.com"

codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
  - api-key: "fk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://oai-api.fkclaude.com/v1"
  - api-key: "sk-amXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
  - api-key: "sk-sTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
```

請注意，即使是同一個服務商、共用相同 `base-url` 的多個 `api-key`，也要為每一筆 `api-key` 各自寫上 `base-url`，不能省略。

此外，CLIProxyAPI 也支援串接任何相容 OpenAI 介面的供應商，這要透過 `openai-compatibility` 欄位來設定。這裡就不再細說步驟，大家可以直接參考下面的設定檔範例：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"

codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
  - api-key: "fk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://oai-api.fkclaude.com/v1"
  - api-key: "sk-amXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
  - api-key: "sk-sTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"

openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    api-keys:
      - "sk-or-v1-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      - "sk-or-v1-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    models:
      - name: "deepseek/deepseek-chat-v3.1:free"
        alias: "deepseek-v3.1"
      - name: "deepseek/deepseek-r1-0528:free"
        alias: "deepseek-r1-0528"
      - name: "x-ai/grok-4-fast:free"
        alias: "grok-4-fast"
  - name: "groq"
    base-url: "https://api.groq.com/openai/v1"
    api-keys:
      - "gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    models:
      - name: "deepseek-r1-distill-llama-70b"
        alias: "deepseek-r1-70b"
```

可以看到，`openai-compatibility` 的設定邏輯和前面稍有不同：同一個供應商（Provider）底下的所有 `api-key` 共用同一個 `base-url`。

到這裡設定就完成了。剩下的模型連線測試，就留給各位讀者自己動手了。
