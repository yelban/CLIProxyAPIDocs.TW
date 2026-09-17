# 桌面用戶端

專案網址：[EasyCLIProxyAPI](https://github.com/router-for-me/EasyCLIProxyAPI)

EasyCLIProxyAPI（ecpa）是 CLIProxyAPI 官方推出的桌面用戶端，主要給在本機部署的使用者使用。

## 功能介紹
EasyCLIProxyAPI 可以把多個 Codex、Antigravity、Grok、Claude 等帳號的訂閱額度，透過反向代理轉成 API（支援 OpenAI、Anthropic、Gemini 格式互相轉換），供任何工具使用，實現 token 自由（token free）。它也支援彙整多個 API 來源，方便同時使用多個管道。此外還提供代理工具設定功能，可以一鍵設定 `codex`、`claude code`、`opencode`、`pi`、`openclaw` 等代理工具。


## 使用教學

軟體支援 OAuth 帳號登入與 API 串接兩種方式，依需求選擇即可。串接完成後，可以在首頁複製 API URL 與 API Key，用來串接代理工具，或開發自己的 AI 應用程式。

### OAuth 串接
進入軟體的 OAuth 頁面，選擇要登入的平台帳號。軟體會自動用預設瀏覽器開啟登入頁面；如果要指定瀏覽器，請在右上角選擇。在網頁完成登入後，可以在「認證檔案」管理憑證檔案。

### API 串接
API 串接需要在軟體中設定 `API Key`。如果是 `OpenAI相容格式`，還可以自行選擇支援的思考強度。

## 設定代理工具

各個代理工具的設定方式大致相同：選好合適的模型並套用設定後，重新啟動代理工具即可。

### Codex
Codex 有兩種設定方式：`OAuth配置方式` 與 `API配置方式`。OAuth 方式能正確辨識模型清單，建議優先使用，但必須先用 ChatGPT 帳號（任何訂閱方案，包含 `免費帳戶`）登入 Codex。另外要注意，憑證檔案使用一段時間後可能會失效，屆時需要重新登入。

## 分享給其他人使用
軟體預設只監聽本機回送位址 `127.0.0.1`。如果要對外開放，請在「進階設定」開啟「允許區域網路」，軟體就會改為監聽 `0.0.0.0`，區域網路內的其他使用者也能使用 API 服務，並可依需求分配金鑰。系統防火牆可能會擋下區域網路的連線，請自行調整防火牆設定。
