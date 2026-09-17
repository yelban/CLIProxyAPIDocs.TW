# Web UI

專案網址：[Cli-Proxy-API-Management-Center](https://github.com/router-for-me/Cli-Proxy-API-Management-Center)

CLIProxyAPI 官方的網頁版管理中心。

基本路徑：`http://localhost:8317/management.html`

如果想把管理介面架設在其他地方，可以將 `remote-management.disable-control-panel` 設為 `true`。伺服器會略過下載 `management.html`，`/management.html` 也會回傳 404。

設定環境變數 `MANAGEMENT_STATIC_PATH`，可以指定 `management.html` 的存放目錄。

## 連線資訊的儲存與外掛資源頁

官方管理中心會把連線狀態存在瀏覽器中、屬於管理中心 origin 的 `localStorage`。API 基本網址會保存下來，方便重新連線。管理金鑰只有在使用者啟用「記住密碼」，或舊版已儲存的工作階段被遷移時，才會保存。儲存的值只經過可還原的混淆處理，不能當成加密層級的安全防線。

管理中心與 CLIProxyAPI 由同一個 origin 提供時，從 `/v0/resource/plugins/<pluginID>/...` 載入的外掛資源頁也會在同一個 origin 中執行。因此，受信任的外掛資源頁可以讀取同一份 `localStorage`，並拿其中儲存的管理金鑰呼叫 `/v0/management/...`。

安裝並啟用含有資源頁的外掛，就等於信任該外掛的瀏覽器端程式碼可以使用目前的管理工作階段。外掛資源頁應自行打包所需的 JavaScript，不要載入第三方腳本，因為在同一個 origin 執行的任何腳本，都能讀取同一份已儲存的管理資訊。

如果管理中心與 CLIProxyAPI 部署在不同的 origin，瀏覽器的同源政策會阻止外掛資源 iframe 讀取管理中心 origin 的 `localStorage`。在這種部署方式下，外掛頁面應處理缺少管理金鑰的情況，並提示使用者開啟同源的管理頁面，或重新登入。

## 使用自訂 Web UI

你可以讓伺服器從自己的 GitHub 儲存庫取得管理面板：

```yaml
remote-management:
  panel-github-repository: "https://github.com/your-org/your-management-ui"
```

- 儲存庫網址寫法：`https://github.com/<org>/<repo>`，伺服器會自動轉換成 `https://api.github.com/repos/<org>/<repo>/releases/latest`。
- API 網址寫法：直接設為 `https://api.github.com/repos/<org>/<repo>/releases/latest`。
- 更新程式會定期檢查最新的 Release，尋找名為 `management.html` 的資產檔案，並下載到靜態目錄（預設是設定檔所在目錄下的 `static/`，或 `MANAGEMENT_STATIC_PATH` 指定的路徑）。如果資產含有 `digest` 欄位（建議使用 `sha256:<hex>`），會用來驗證檔案完整性。

## 如何在 GitHub 發布自訂 Web UI

1. 建置自訂管理面板，產生單一的 `management.html`（盡可能把靜態資源打包進同一個檔案）。
2. 建立 GitHub 儲存庫並推送程式碼。
3. 建立 Release（更新程式會抓取 `latest`），並上傳資產檔案：
   - 必須包含 **`management.html`**。
   - 強烈建議在資產的中繼資料加入 `digest` 欄位，格式為 `sha256:<檔案雜湊>`，用於校驗檔案完整性。
4. 在 CLIProxyAPI 中，將 `remote-management.panel-github-repository` 設為該儲存庫網址或 API 網址。
5. 重新啟動或熱重新載入設定後，伺服器會自動抓取並替換管理面板。
