# Gemini API 設定

使用 `gemini-api-key` 參數設定 Gemini API 金鑰。每個項目都可以選擇性地設定 `base-url`、`headers` 與 `proxy-url`；`headers` 只會附加到送往覆寫後 Gemini 端點的請求，不會轉送給 Proxy 伺服器。為了向後相容，舊的 `generative-language-api-key` 端點仍提供同步的純金鑰檢視：透過該端點寫入會更新 Gemini 清單，但會捨棄各金鑰的覆寫設定，而且這個舊欄位不再寫入 `config.yaml`。
