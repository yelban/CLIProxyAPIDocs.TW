# Codex

## 設定為 OAuth 登入模式（建議）

啟動 CLIProxyAPI 伺服器，然後使用 ChatGPT 帳戶（任何訂閱方案皆可，包含免費帳戶）登入 Codex CLI 或 Codex App。

編輯 `~/.codex/config.toml` 檔案，加入以下內容：

```toml
model = "gpt-5.6-sol" # 或 gpt-5.6-terra、gpt-5.6-luna，也可以使用我們支援的任何模型
model_provider = "cliproxyapi"

# 執行任何操作都不再詢問確認。有風險，不建議 Codex 新手開啟；移除 # 即可啟用
# approval_policy = "never"

# 給予沙箱不受限制的存取權限。有風險，不建議 Codex 新手開啟；移除 # 即可啟用
# sandbox_mode = "danger-full-access" 

model_reasoning_effort = "xhigh"
plan_mode_reasoning_effort = "xhigh"

experimental_realtime_webrtc_call_base_url = "http://127.0.0.1:8317/v1" # Codex App 的語音聊天需要 WebRTC；不使用語音聊天時可省略此項
experimental_realtime_ws_base_url = "http://127.0.0.1:8317/v1" # Codex App 的語音聊天需要 WebRTC；不使用語音聊天時可省略此項

[model_providers.cliproxyapi]
base_url = "http://127.0.0.1:8317/v1"
experimental_bearer_token = "sk-dummy" # 改成你在 CLIProxyAPI 中為 Codex 建立的 API Key
name = "OpenAI"
wire_api = "responses"
requires_openai_auth = true
supports_websockets = true # 依需求決定是否啟用 WebSocket
```

不需要修改 `auth.json` 檔案。

## 設定為 API 模式

啟動 CLIProxyAPI 伺服器，然後編輯 `~/.codex/config.toml` 與 `~/.codex/auth.json` 檔案。

config.toml:
```toml
# 執行任何操作都不再詢問確認。有風險，不建議 Codex 新手開啟；移除 # 即可啟用
# approval_policy = "never"

# 給予沙箱不受限制的存取權限。有風險，不建議 Codex 新手開啟；移除 # 即可啟用
# sandbox_mode = "danger-full-access"

model_provider = "cliproxyapi"
model = "gpt-5.6-sol" # 或 gpt-5.6-terra、gpt-5.6-luna，也可以使用我們支援的任何模型
model_reasoning_effort = "high"

[model_providers.cliproxyapi]
name = "cliproxyapi"
base_url = "http://127.0.0.1:8317/v1"
wire_api = "responses"
http_headers = { "X-OpenAI-Actor-Authorization" = "local-proxy" }
requires_openai_auth = true
```

auth.json:
```json
{
  "OPENAI_API_KEY": "sk-dummy"
}
```