# 使用 Docker Compose 執行

1.  複製（clone）儲存庫並進入目錄：
    ```bash
    git clone https://github.com/router-for-me/CLIProxyAPI.git
    cd CLIProxyAPI
    ```

2.  準備設定檔：
    複製範例檔案來建立 `config.yaml`，再依需求調整內容。
    ```bash
    cp config.example.yaml config.yaml
    ```
    *（Windows 使用者請注意：可以在 CMD 或 PowerShell 中執行 `copy config.example.yaml config.yaml`。）*

    若要讓外掛商店安裝的外掛在容器重新啟動後保留下來，請在 `docker-compose.yml` 加入外掛目錄的掛載：
    ```yaml
    - ./plugins:/CLIProxyAPI/plugins
    ```

3.  啟動服務：
    -   **適用於大多數使用者（建議）：**
        執行以下指令，以 Docker Hub 上預先建置的映像檔啟動服務。服務會在背景執行。
        ```bash
        docker compose up -d
        ```
    -   **適用於進階使用者：**
        如果你修改了原始碼，需要建置新的映像檔，請使用互動式輔助腳本：
        -   Windows（PowerShell）：
            ```powershell
            .\docker-build.ps1
            ```
        -   Linux／macOS：
            ```bash
            bash docker-build.sh
            ```
        腳本會請你選擇執行方式：
        - **選項 1：使用預先建置的映像檔執行（建議）**：從映像檔儲存庫拉取最新的官方映像檔並啟動容器，這是最簡單的入門方式。
        - **選項 2：從原始碼建置並執行（適用於開發者）**：用本機原始碼建置映像檔，標記為 `cli-proxy-api:local`，再啟動容器。適合正在修改原始碼的情況。

4. 若要向供應商完成驗證，請在容器內執行登入指令：
    - **OpenAI (Codex)**:
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --codex-login
    ```
    - **Claude**:
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --claude-login
    ```
    - **Antigravity**:
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --antigravity-login
    ```

5.  檢視伺服器記錄：
    ```bash
    docker compose logs -f
    ```

6.  停止應用程式：
    ```bash
    docker compose down
    ```
