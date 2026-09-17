# 以 PostgreSQL 儲存設定與權杖

在偏好使用代管資料庫、而非本機檔案的託管環境中執行 CLIProxyAPI 時，也可以把設定與驗證資料保存在 PostgreSQL。

**環境變數**

| 變數                      | 必要 | 預設值          | 說明                                                                 |
|-------------------------|----|---------------|----------------------------------------------------------------------|
| `MANAGEMENT_PASSWORD`   | 是  |               | 管理網頁介面的密碼（啟用遠端管理時必須設定）。                                          |
| `PGSTORE_DSN`           | 是  |               | PostgreSQL 連線字串，例如 `postgresql://user:pass@host:5432/db`。       |
| `PGSTORE_SCHEMA`        | 否  | public        | 建立資料表所用的 schema；留空則使用預設 schema。                               |
| `PGSTORE_LOCAL_PATH`    | 否  | 目前工作目錄       | 本機鏡像的根目錄，伺服器會寫入 `<值>/pgstore`；若未設定且無法取得目前工作目錄，則改用 `/tmp/pgstore`。 |

**運作方式**

1.  **初始化：** 啟動時透過 `PGSTORE_DSN` 連線，確認 schema 存在，並在缺少時建立 `config_store` 與 `auth_store` 資料表。
2.  **本機鏡像：** 在 `<PGSTORE_LOCAL_PATH 或當前工作目錄>/pgstore` 建立可寫入的快取，鏡像 `config/config.yaml` 與 `auths/`，讓應用程式其他部分沿用既有的檔案處理邏輯。
3.  **初始資料：** 若資料庫中沒有設定記錄，會以 `config.example.yaml` 寫入初始資料，並使用固定識別碼 `config`。
4.  **權杖同步：** 雙向同步。檔案的變更會寫入 PostgreSQL，資料庫記錄也會鏡像回磁碟，讓檔案監看與管理 API 能繼續運作。
