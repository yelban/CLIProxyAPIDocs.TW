# 以 Git 儲存設定與權杖

應用程式可以設定成以 Git 儲存庫作為後端，同時存放 `config.yaml` 與 `auth-dir` 裡的驗證權杖，方便集中管理設定並保留版本紀錄。

要啟用此功能，請把 `GITSTORE_GIT_URL` 環境變數設為 Git 儲存庫的網址。

**環境變數**

| 變數                      | 必填 | 預設值    | 說明                                                 |
|-------------------------|----|--------|----------------------------------------------------|
| `MANAGEMENT_PASSWORD`   | 是  |        | 管理介面（WebUI）的密碼。                                    |
| `GITSTORE_GIT_URL`      | 是  |        | 要使用的 Git 儲存庫 HTTPS 網址。                             |
| `GITSTORE_LOCAL_PATH`   | 否  | 目前的工作目錄 | Git 儲存庫複製（clone）到本機的路徑。在 Docker 內預設為 `/CLIProxyAPI`。 |
| `GITSTORE_GIT_USERNAME` | 否  |        | Git 驗證使用的使用者名稱。                                    |
| `GITSTORE_GIT_TOKEN`    | 否  |        | Git 驗證使用的個人存取權杖（或密碼）。                            |

**運作方式**

1.  **複製（clone）：** 啟動時，應用程式會把遠端 Git 儲存庫複製到 `GITSTORE_LOCAL_PATH`。
2.  **設定：** 接著在複製下來的儲存庫中，尋找 `config` 目錄裡的 `config.yaml`。
3.  **初始化：** 如果儲存庫裡沒有 `config/config.yaml`，應用程式會把本機的 `config.example.yaml` 複製到該位置，commit 後推送到遠端儲存庫，作為初始設定。因此本機必須有 `config.example.yaml`。
4.  **權杖同步：** `auth-dir` 也由這個儲存庫管理。驗證權杖的任何變更（例如重新登入）都會自動 commit 並推送到遠端 Git 儲存庫。
