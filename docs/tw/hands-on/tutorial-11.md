# 零成本部署 AI Studio 反向代理

> **請注意：** 本教學的部署方案需要搭配 `CLIProxyAPI` 使用。開始之前，請確認你已經有一個正在執行的 `CLIProxyAPI` 執行個體。

CLIProxyAPI 從 v6.3.x 起，支援透過 WebSocket 串接 AI 供應商，第一個支援的就是 AI Studio。

不過，這種方式需要一直開著瀏覽器，執行 AIStudioBuild 上的 WebSocket 通訊程式，終究有點不方便。如果改部署在 VPS 上，又會遇到 VPS 記憶體需求偏高的問題。

為了解決這個問題，我花了點時間試了幾種無頭瀏覽器方案。最後選擇用 Docker 部署在 HuggingFace 上，善用 HuggingFace 免費執行個體記憶體大的優勢，做到零成本部署。

### 第一步：設定 AIStudioBuild 應用程式

先依照你的 `CLIProxyAPI` 設定，設定好 AIStudioBuild 上的 WebSocket 通訊程式：開啟官方提供的[範例程式](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL)，複製一份後，**必須**修改圖中紅框的兩個地方。如果 `CLIProxyAPI` 把 `wsauth` 設為 `true`，就要把 `JWT_TOKEN` 設成 `CLIProxyAPI` 中打算用來驗證的 `api-keys` 值；`WEBSOCKET_PROXY_URL` 則設成 `CLIProxyAPI` 的位址，例如 `wss://mycap.example.com/v1/ws`。設定完成後儲存，並記下這個應用程式的連結備用。

![](https://img.072899.xyz/2025/11/359a2572d0206c20dba7fe12a136d6e8.png)

使用多個帳號時，還要多做一個步驟：把這個應用程式的存取權限設為 `Public`。

![](https://img.072899.xyz/2025/11/69c6395d1a98c38c68bc6c8dd46b3014.png)

**安全警告：** 設為 `Public` 後，請務必妥善保管你的連結。**絕對不要**公開分享這個連結，以免授權資訊外洩。

### 第二步：準備 AIStudio Cookie

這一步建議使用瀏覽器的無痕模式，登入 https://aistudio.google.com/ ，再從瀏覽器的開發者工具複製 Cookie 即可，位置如下圖所示：

![](https://img.072899.xyz/2025/11/51f860bf363cab01aa4c3fd5181b7f72.png)

### 第三步（1）：部署 HuggingFace Space

開啟 https://huggingface.co/spaces/hkfires/AIStudioBuildWS ，複製這個 Space。在 `CAMOUFOX_INSTANCE_URL` 填入第一步準備好的程式連結，在 `USER_COOKIE_1` 填入第二步準備好的 Cookie，然後點選 Duplicate Space。

![](https://img.072899.xyz/2025/11/04e84ce3b0f2abe7ae9e717ac8b5aa0b.png)

等 HuggingFace 建置完成，出現如下記錄，就代表部署成功：

![](https://img.072899.xyz/2025/11/e818f38cfb272c1fc10ca97c2ef23c6b.png)

如果有多個帳號，比照 `USER_COOKIE_1`，在 HuggingFace Space 的設定中依序加入 `USER_COOKIE_2`、`USER_COOKIE_3` 等環境變數即可。

**重要提醒：** Cookie 是敏感資訊，請**務必用「Secrets」**（而不是「Variables」）來儲存，避免 Cookie 外洩。

### 第三步（2）：伺服器 Docker 部署

如果你有自己的伺服器（VPS），也可以用 Docker Compose 部署。

1.  **下載程式碼**
    ```bash
    git clone https://github.com/hkfires/AIStudioBuildWS.git
    cd AIStudioBuildWS
    ```

2.  **設定環境變數**
    把 `.env.example` 複製成 `.env`，並填入必要資訊（`CAMOUFOX_INSTANCE_URL`、`USER_COOKIE_1` 等）。
    
    也可以在 `cookies` 目錄放入 JSON 格式的 Cookie 檔案（檔名不限），程式會自動讀取。
    ```bash
    cp .env.example .env
    nano .env
    ```

3.  **啟動服務**
    ```bash
    docker compose up -d --build
    ```

部署成功後，應該會在 `CLIProxyAPI` 中看到類似下面的記錄。到這裡，整個部署就完成了。

![](https://img.072899.xyz/2025/11/e0db39f81a3bbb956cbe9364e656a76f.png)

### 參考專案

https://github.com/cliouo/aistudio-build-proxy-all