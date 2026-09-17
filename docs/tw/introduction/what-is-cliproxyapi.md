---
outline: deep
---

# CLIProxyAPI 是什麼？

**CLIProxyAPI** 是一個 Proxy 伺服器，為 CLI 提供與 OpenAI/Gemini/Claude/Codex/Grok 相容的 API 介面。

你可以用本機或多帳號的 CLI 存取方式，搭配任何與 OpenAI（含 Responses）/Gemini/Claude 相容的用戶端與 SDK 使用。

## 功能

- 為 CLI 模型提供與 OpenAI/Gemini/Claude/Grok 相容的 API 端點
- 支援 Antigravity（OAuth 登入）
- 支援 OpenAI Codex（GPT 系列模型，OAuth 登入）
- 支援 Claude Code（OAuth 登入）
- 支援 Grok Build（OAuth 登入）
- 支援串流與非串流回應
- 支援函式呼叫與工具
- 支援多模態輸入（文字與圖片）
- 多帳號輪替負載平衡（Gemini、OpenAI、Claude 與 Grok）
- 簡單的 CLI 驗證流程（OpenAI、Claude 與 Grok）
- 支援 Generative Language API 金鑰
- Antigravity 多帳號負載平衡
- Claude Code 多帳號負載平衡
- OpenAI Codex 多帳號負載平衡
- Grok Build 多帳號負載平衡
- 可透過設定串接上游的 OpenAI 相容供應商（例如 OpenRouter）

## 支援的模型

- gemini-3-pro-preview
- gemini-3-pro-image-preview
- gemini-2.5-pro
- gemini-2.5-flash
- gemini-2.5-flash-lite
- gemini-2.5-flash-image
- gemini-2.5-flash-image-preview
- gemini-pro-latest
- gemini-flash-latest
- gemini-flash-lite-latest
- gpt-5
- gpt-5-codex
- claude-opus-4-1-20250805
- claude-opus-4-20250514
- claude-sonnet-4-20250514
- claude-sonnet-4-5-20250929
- claude-haiku-4-5-20251001
- claude-3-7-sonnet-20250219
- claude-3-5-haiku-20241022
- deepseek-v3.2
- deepseek-v3.1
- deepseek-r1
- deepseek-v3
- kimi-k2
- glm-4.6
- tstars2.0
