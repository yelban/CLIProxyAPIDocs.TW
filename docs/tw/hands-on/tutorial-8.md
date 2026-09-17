# 零成本部署：HuggingFace（資料庫儲存）

在《沒有 VPS？》系列的前幾篇文章中，我們分別介紹了如何利用本機磁碟區（ClawCloud）、GitHub（Render）與物件儲存 Bucket（Railway），讓 CLIProxyAPI 的設定與驗證資訊能持久保存。本文要介紹如何透過 PostgreSQL 資料庫達成同樣的目標。另外，HuggingFace 的容器部署機制和一般平台不太一樣，也有朋友想了解它的部署流程，本文會一併詳細說明。

本教學以 Railway 提供的 PostgreSQL 服務為例，改用其他資料庫供應商的流程也大同小異，大家可以自行摸索。

### 一、準備 PostgreSQL 資料庫

首先，登入你的 Railway 帳號，在工作區中建立一個新的執行個體，選擇 **Database** -> **Add PostgreSQL**

![](https://img.072899.xyz/2025/10/dab21cb1671989f6781eed1eba03c985.png)

![](https://img.072899.xyz/2025/10/9580732f1e15d365db8a3dd07442b3fd.png)

等執行個體建立完成後，點進資料庫管理頁面，再點選 **Database** 分頁下的 **Connect**

![](https://img.072899.xyz/2025/10/f177a3cc1cb30146d9b16475179fd5f0.png)

請複製並保存 **Public Network** 分頁下的 **Connection URL**，後面的步驟會用到

![](https://img.072899.xyz/2025/10/107a359a8a490b18a325779432a71582.png)

### 二、在 HuggingFace 上部署

首先，請開啟我事先建立好的 [CLIProxyAPI 專案範本](https://huggingface.co/spaces/hkfires/CLIProxyAPI)，然後如下圖所示，點選下拉選單中的 **Duplicate this Space** 來複製專案

![](https://img.072899.xyz/2025/10/0febf3a57ae4f8384dfff6d6e38614ce.png)

在設定頁面中，請依照下列說明操作：
* 修改 **Space name**（如果這是你的第一個專案，可以不用改）
* 將 **Visibility** 設為 **Public**，確保服務部署後可以從遠端存取
* 在 `MANAGEMENT_PASSWORD` 中填入你打算用來登入 WebUI 的管理密碼
* 在 `PGSTORE_DSN` 中貼上剛才複製的資料庫連線 URL

所有資訊都填好後，點選 **Duplicate Space**

> **補充說明**：`MANAGEMENT_STATIC_PATH` 與 `PGSTORE_LOCAL_PATH` 這兩個環境變數之所以要設為 `/tmp`，是因為 HuggingFace 的安全機制把容器的根目錄設成唯讀。透過這兩個變數，就能把資料庫快取檔案與管理頁面靜態資源的路徑指向可寫入的 `/tmp` 目錄，確保程式正常執行。

![](https://img.072899.xyz/2025/10/a4b88ee81e6eefd0721b301c9bc4f5e8.png)

稍等一下，當你在記錄中看到類似下圖的資訊，就表示部署已經順利完成

![](https://img.072899.xyz/2025/10/98550ed355e70b9776498558bd6c599a.png)

這時就可以透過 `https://<你的HuggingFace使用者名稱>-<專案名稱>.hf.space/management.html` 開啟 WebUI。例如，我的網址是 `https://hkfires-cliproxyapi.hf.space/management.html`。輸入你先前在環境變數中設定的管理密碼，就能成功登入

![](https://img.072899.xyz/2025/10/e8fa8144c51bfc6125a8cb218cf528dd.png)

到這裡，整個部署流程就完成了。後續的使用方式，可以參考《零成本部署（ClawCloud）》教學中的「**使用 EasyCLI 進行遠端 OAuth 驗證**」一節。
