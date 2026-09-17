# 在模型名稱加括號設定思考量

在模型名稱結尾加上 `(值)`，即可控制思考預算或推理強度。Proxy 會在路由前移除括號，並把解析出的設定套用到請求。

## 可用的值

- `(數字)`：明確指定思考預算（供應商原生的 token 數），會限縮在模型支援的範圍內。
- `(等級)`：預設的推理強度等級（不分大小寫）：

| 等級        | 約略預算                | 用途      |
|-----------|----------------------|---------|
| `minimal` | 512                  | 最低成本的推理   |
| `low`     | 1024                 | 快速推理    |
| `medium`  | 8192                 | 預設推理深度  |
| `high`    | 24576                | 深度推理    |
| `xhigh`   | 32768                | 更深入的推理    |
| `auto`    | 動態（允許時為 -1，否則取中間值或最小值） | 交由供應商決定 |
| `none`    | 0（不允許 0 時限縮到最小值）    | 關閉思考    |

- 空括號 `()` 會被忽略。`provider://model` 形式請把括號加在模型名稱後面，例如 `openrouter://gemini-3-pro-preview(high)`。

## 套用規則

- 只有宣告支援思考的模型會保留這些設定；不支援的模型只會移除後綴，不會注入思考欄位。
- Gemini：將限縮後的值寫入 `generationConfig.thinkingConfig.thinkingBudget`，不會變更 `include_thoughts`。本身預設啟用思考的模型（例如 `gemini-3-pro-preview`）在未指定時仍會自動啟用思考；括號中的預算會覆寫預設值。
- Claude API：提供預算或等級時，會設定 `thinking.type=enabled` 並填入正規化後的 `thinking.budget_tokens`，必要時調高 `max_tokens`。
- OpenAI／Codex／OpenRouter：等級、`auto`、`none` 會覆寫 `reasoning_effort`（chat）或 `reasoning.effort`（Responses）；純數字預算不會改寫這些協定的 reasoning_effort。
- 使用分級推理的模型會檢查等級是否受支援，不支援的值會回傳 HTTP 400。

## 使用範例

- Gemini 動態思考預算：

```bash
curl -X POST http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gemini-3-pro-preview(auto)",
        "messages": [{ "role": "user", "content": "幫我總結要點" }]
      }'
# 正規化為 gemini-3-pro-preview，寫入 thinkingBudget=-1（不允許動態時會限縮到模型範圍），include_thoughts 維持不變。
```

- Responses 高推理強度：

```bash
curl -X POST http://localhost:8317/v1/responses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gpt-5.1(high)",
        "input": "列出三個改進點"
      }'
# 以 gpt-5.1 路由，並將 reasoning.effort 覆寫為 "high"。
```

- 關閉思考（不允許 0 時會限縮到最小值）：

```bash
model=claude-sonnet-4.5(none)
# 模型允許時將 thinking.budget_tokens 設為 0，否則限縮到模型的最小值。
```
