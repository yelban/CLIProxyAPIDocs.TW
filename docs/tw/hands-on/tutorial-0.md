# 零：設定詳解

這篇文章詳細說明 [CLIProxyAPI 專案](https://github.com/router-for-me/CLIProxyAPI)設定檔中的各個設定項目，方便使用者有疑問時查閱。

貼心提醒：設定檔支援熱重載，修改後立即生效，不需要重新啟動程式。

```
# 連接埠號碼。CLIProxyAPI 會執行一個 HTTP 伺服器，需要透過連接埠號碼存取
port: 8317

# 遠端管理設定，搭配 EasyCLI 或 WebUI 使用
remote-management:
  # 遠端管理的開關。如果你部署在伺服器上，
  # 就要設為 true，才能用 EasyCLI 或 WebUI 連到 CLIProxyAPI 進行管理
  # 如果只是在本機透過 API 管理，維持 false 即可
  allow-remote: false

  # 如果想用 EasyCLI 或 WebUI 透過 API 管理 CLIProxyAPI，就必須設定 Key
  # 不設定的話，等於關閉 API 管理功能，也就無法用 EasyCLI 或 WebUI 連線
  # 如果你不需要用 EasyCLI 或 WebUI 管理，可以留空
  secret-key: ""

  # 是否內建 WebUI 的開關
  # 設為 false 時，可以透過 http://YOUR_SERVER_IP:8317/management.html 開啟 WebUI
  disable-control-panel: false

# 驗證檔案的存放目錄，用來存放 Gemini Web、Claude Code、Codex 的驗證檔案
# 預設是目前帳戶目錄下的 .cli-proxy-api 資料夾，Windows 與 Linux 環境都適用
# 程式第一次啟動時會自動建立這個資料夾
# Windows 下預設為 C:\Users\你的使用者名稱\.cli-proxy-api
# Linux 下預設為 /home/你的使用者名稱/.cli-proxy-api
# 如果在 Windows 環境使用非預設位置，請依照這個格式填寫："Z:\\CLIProxyAPI\\auths"
auth-dir: "~/.cli-proxy-api"

# 是否在記錄中輸出 Debug 資訊，預設不啟用，需要配合作者除錯時再開啟即可
debug: false

# 隱藏設定，可以記錄每一筆請求與回應，並保存到 logs 目錄下
# 每筆記錄可能高達 10MB 以上，硬碟空間不夠大請不要開啟
request-log: false

# 是否將記錄輸出到記錄檔
# 預設啟用，記錄會保存在程式目錄下的 logs 資料夾中
# 關閉的話，記錄會顯示在主控台
logging-to-file: true

# 用量統計開關，預設啟用
# 需要透過 API 查看用量，可以用 EasyCLI 或 WebUI 查看
usage-statistics-enabled: true

# 如果要使用 Proxy，需要進行下列設定，支援 socks5/http/https 協定
# 依照這個格式填寫："socks5://user:pass@192.168.1.1:1080/"
proxy-url: ""

# 請求遇到 403、408、500、502、503、504 這些錯誤碼時，程式自動重試請求的次數
request-retry: 3

# 模型受到限制之後的處理方式
quota-exceeded:
  # 多帳號輪詢的核心設定
  # 設為 true 時，例如某個帳號觸發了 429，程式會自動切換到下一個帳號重新發送請求
  # 設為 false 時，程式會把 429 的錯誤訊息傳給用戶端，並結束目前的請求
  # 也就是說，設為 true 時，只要輪詢的帳號中至少有一個正常，用戶端就不會出現錯誤
  # 設為 false 時，則需要由用戶端自行重試或中止
  switch-project: true 

# 隱藏設定，可以關閉重試時的冷卻間隔，視需要設定
# 例如某個模型觸發 429 後，程式會暫時停用它，而且每次再觸發都會延長停用時間，最長 30 分鐘
# 預設情況下，停用期間會略過該模型
# 設為 true 後，不論該模型是否在停用期間，每次都仍會向它發送請求，不再略過
disable-cooling: false

# 各種 AI 用戶端連線 CLIProxyAPI 時要填的 Key 就在這裡設定，別和後面的各種 Key 搞混了
# 簡單來說，這裡的 Key 是 CLIProxyAPI 作為伺服器時需要設定的
# 後面的各種 Key 則是 CLIProxyAPI 作為用戶端去存取其他伺服器時需要的
api-keys:
  - "your-api-key-1"
  - "your-api-key-2"

# AIStudio 的驗證開關，設為 true 時，會用上面的 api-keys 驗證 AIStudio Build APP 的連線
ws-auth: false

# Gemini 的官方 API Key 設定項目。舊的 generative-language-api-key 會在載入時自動遷移到這個欄位，並從設定檔中移除。
# 不設定 base-url 時，使用官方端點連線；設定 base-url 後，可以接入第三方中繼服務。
# 透過 Cloudflare AI Gateway 連線時，可以設定 headers 進行驗證。
# 每個 Key 還可以設定 proxy-url，透過 Proxy 連線。
gemini-api-key:
  - api-key: "AIzaSy...01"
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
  - api-key: "AIzaSy...02"

# Codex 的 API Key。各家中繼服務提供的 Codex key 與 base-url 參數，填在這裡就能接入
# 每個 Key 還可以設定 proxy-url，透過 Proxy 連線
codex-api-key:
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com"
    proxy-url: "socks5://proxy.example.com:1080"

# Claude 的 API Key。使用官方 Key 時不要填 base-url，使用第三方中繼服務時才填 base-url
# 每個 Key 還可以設定 proxy-url，透過 Proxy 連線
claude-api-key:
  - api-key: "sk-atSM..."
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com"
    proxy-url: "socks5://proxy.example.com:1080"
    models:
      # 中繼服務商提供的模型名稱
      - name: "claude-3-5-sonnet-20241022"
        # 模型別名，也就是在用戶端中實際設定的模型名稱
        alias: "claude-sonnet-latest"

# 各種 OpenAI 相容服務都可以在這裡接入，不多做說明
openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    # 舊欄位 api-keys 會在載入時自動遷移到 api-key-entries。
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080"
      - api-key: "sk-or-v1-...b781"
    models:
    	# OpenAI 相容供應商提供的模型名稱
      - name: "moonshotai/kimi-k2:free"
      	# 模型別名，也就是在用戶端中實際設定的模型名稱
        alias: "kimi-k2"
```
