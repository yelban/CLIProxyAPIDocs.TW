# 零成本部署：Render（Git 儲存）

昨天的文章《零成本部署（ClawCloud）》發布後，我接著測試了 Render 平台，發現它的免費方案不含永久儲存空間。我把這個情況回報給 CLIProxyAPI 的作者後，他連夜更新版本，加入了透過 Git 永久保存資料的功能。這樣一來，我們就能把設定檔和驗證檔案存在 GitHub 的私有儲存庫，不必依賴容器雲端平台的永久儲存空間了。

接下來，本文會一步一步帶你在沒有永久儲存空間的容器服務（例如 Render 的免費方案）上部署 CLIProxyAPI。至於透過 EasyCLI 進行 OAuth 驗證的部分，和在 ClawCloud 上部署時完全相同，請參考前一篇文章。

### 一、GitHub 準備工作

首先，我們要在 GitHub 上建立一個空的儲存庫。儲存庫名稱可以自訂，但**務必**設為**私有**，否則你加入的 API Key 等敏感資訊就會完全公開。

![](https://img.072899.xyz/2025/10/311e26cb4da97cafd7bb3b924440e858.png)

建立儲存庫後，記下它的網址。接著點選頁面右上角的個人頭像，進入 **Settings**，再點選左側選單最下方的 **Developer Settings**。

![](https://img.072899.xyz/2025/10/a79377c7af3c80ec58ad853d12762b6c.png)

接著依序點選 **Personal access tokens** -> **Fine-grained tokens**，再點選右上角的 **Generate new token**。

![](https://img.072899.xyz/2025/10/90fa44065df641c7599b8d16e84edf60.png)

如圖填寫 **Token name**（可自訂），依需求選擇有效期限（**Expiration**），並在 **Repository access** 選擇 **Only select repositories**，然後選取剛剛建立的空白儲存庫。

![](https://img.072899.xyz/2025/10/74b5484e44a28293335160a9d42bb190.png)

把頁面往下捲，在 **Permissions** -> **Add permissions** 找到 **Contents**，加入後將權限從 `Read-only` 改成 `Read and write`。

![](https://img.072899.xyz/2025/10/825aafe9f3a52fc431a3ec54829777de.png)

確認權限設定無誤後，點選頁面底部的 **Generate token**。

![](https://img.072899.xyz/2025/10/0b5f56df634cea1e3552b8560c7f175a.png)

這時頁面會顯示產生的 Token。請注意，**這個 Token 只會顯示一次**，關閉頁面後就看不到了，請務必複製並妥善保存。

![](https://img.072899.xyz/2025/10/a04fc4a6a75cab2222ba28d46e4463e9.png)

至此，GitHub 的準備工作就完成了。

### 二、Render 部署

首先，請確認你已註冊 Render 帳號。登入後建立新專案，選擇 **New Web Service**。

![](https://img.072899.xyz/2025/10/0398d8d1483fe65d556727ec23075eaf.png)

部署方式選擇 **Existing Image**，在 **Image URL** 輸入 `eceasy/cli-proxy-api:latest`，然後點選 **Connect**。

![](https://img.072899.xyz/2025/10/4ee784242be93bee942f0eea64d51af5.png)

輸入服務名稱（**Name**，可自訂），選擇區域（**Region**，依個人偏好即可），並確認執行個體類型是 **Free**。

![](https://img.072899.xyz/2025/10/90d6fb2b4a5d401d02a917f82396c304.png)

接下來要加入 4 個環境變數：

- `GITSTORE_GIT_URL`：你的 GitHub 儲存庫網址
- `GITSTORE_GIT_USERNAME`：你的 GitHub 使用者名稱
- `GITSTORE_GIT_TOKEN`：剛剛建立的 Personal Access Token
- `MANAGEMENT_PASSWORD`：登入管理介面用的密碼

輸入完成後，點選頁面底部的 **Deploy Web Service**。

![](https://img.072899.xyz/2025/10/d4b39d6e4f10a19ada98e4af0e505df9.png)

等部署記錄跑完，狀態變成 **Live**，且記錄中出現 `Available at your primary URL：XXXX` 之後，程式就成功啟動了。

![](https://img.072899.xyz/2025/10/f77a35fa4f805e78fbcff663c6cf5aae.png)

在 Render 提供的網址後面加上 `/management.html`，就能進入 WebUI，輸入你設定的 `MANAGEMENT_PASSWORD` 即可登入。

![](https://img.072899.xyz/2025/10/af84a3b0d2cc0197f2b4ecb3497c802e.png)

這時再去看你的 GitHub 儲存庫，會發現裡面已經自動產生了兩個資料夾。

![](https://img.072899.xyz/2025/10/03bbde6090e53ae3362a624badd35319.png)

到這裡，在 Render 上部署 CLIProxyAPI 的完整流程就結束了。其他類似的容器雲端平台也可以用這個方法部署，大家可以自行嘗試。

### 三、注意事項

1.  CLIProxyAPI 從 v6.2.2 起才加入這項功能，如果你想指定映像檔版本，至少要選 `eceasy/cli-proxy-api:v6.2.2`。
2.  用這種方式部署後，設定檔中的 `remote-management` 區段會失效，管理密碼以環境變數為準。也就是說，要變更管理密碼，必須直接修改環境變數 `MANAGEMENT_PASSWORD`。
3.  用 GitHub 儲存設定檔和驗證檔案，不代表可以讓多個容器執行個體同時共用、存取，請務必避免這種用法，以免發生衝突。
4.  請注意，容器執行期間，直接在 GitHub 儲存庫手動做的任何修改都不會生效。如果真的需要手動修改，請務必先停止容器服務。
5.  建議用 WebUI 或 EasyCLI 管理設定。EasyCLI 還能遠端完成 OAuth 驗證，做法可參考本文開頭提到的《零成本部署（ClawCloud）》。