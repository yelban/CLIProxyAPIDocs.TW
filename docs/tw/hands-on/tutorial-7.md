# 零成本部署：ClawCloud（內建儲存）

前陣子我發了一篇《伍：Docker 伺服器部署》，不少網友回饋說自己沒有 VPS，希望我能出一篇在雲端容器平台上部署的教學。

其實 `CLIProxyAPI` 既然支援 Docker 部署，自然也能直接在雲端容器平台上執行。但如果就這樣直接跑在雲端容器平台上，會有以下兩個主要問題：

- **設定檔無法持久保存**：程式啟動需要的設定檔，雲端容器平台通常是把設定檔內容對應到特定檔案來處理。這樣雖然能執行，但只要你改過設定檔，容器一重新啟動，所有變更就會消失。設定遺失這種情況，我們是不能接受的。
- **OAuth 驗證麻煩**：需要 OAuth 驗證的供應商，在 VPS 的 Docker 環境中，可以透過 SSH 通道把驗證的回呼結果轉送到伺服器上。但單純的雲端容器平台通常不支援 SSH 通道，只能開好幾個連接埠，並在回呼時手動修改網域名稱，整個過程非常繁瑣。

因此，在 `CLIProxyAPI` 針對雲端容器平台的部署做了調整更新之後，這篇教學會一步步帶你在雲端容器平台上完成部署。

這次示範使用的雲端容器平台是 [ClawCloud Run](https://run.claw.cloud/)。用註冊超過 180 天的 GitHub 帳號登入這個平台，每月就能獲得 5 美元的循環額度。我們部署的 `CLIProxyAPI` 每天只花大約 0.05 美元，這個額度綽綽有餘。其他雲端容器平台大同小異，請參考這個流程自行部署。

登入 ClawCloud Run 之後，點選 **App Launchpad**

![](https://img.072899.xyz/2025/10/080dfe9fd2c214ff9e507bd4d2bd5caa.png)

點選 **Create APP**

![](https://img.072899.xyz/2025/10/d44ca8835fac8cfc6b7a82a3ea4d95c9.png)

先填寫基本資訊

- **應用程式名稱（Application Name）**：可自訂，這裡填 `cliproxyapi`
- **映像檔名稱（Image Name）**：`eceasy/cli-proxy-api:latest`
- **網路（Network）**：容器連接埠改成 `8317`，同時開啟 **Public Access**

![](https://img.072899.xyz/2025/10/1a4941e799911d181d658de450f6e5d7.png)

把頁面往下捲動，在進階設定中填寫：

- **啟動指令（Command）**：`/CLIProxyAPI/CLIProxyAPI --config /data/config.yaml`
- **環境變數（Environment Variables）**：`DEPLOY=cloud`
- **持久儲存空間（Local Storage）**：`/data`

![](https://img.072899.xyz/2025/10/3370f4146f19e92087f188dac5184575.png)

環境變數與儲存空間的填法請看下圖

| ![](https://img.072899.xyz/2025/10/e854143ef56bd6a71a922cad921c08b2.png) | ![](https://img.072899.xyz/2025/10/d966536ab7dd785ffc36355fdb2536cc.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |

確認所有資訊都填寫正確後，點選右上角的 **Deploy Application**，應用程式就會開始部署

![](https://img.072899.xyz/2025/10/dc49813c993e84e68af74747332b247b.png)

稍等一下，應用程式就會部署完成。當 **Public Address** 的狀態變成 **Available** 時，這個位址就是我們存取 `CLIProxyAPI` 的網址，請記下來備用

![](https://img.072899.xyz/2025/10/6502f6ce1d9a4f63c132966ae9c37064.png)

等待部署的同時，可以先準備 `config.yaml` 設定檔。這次使用的範例如下。請注意：`remote-management.secret-key` 是遠端管理用的金鑰，而 `api-keys` 是 AI 用戶端連線 `CLIProxyAPI` 用的金鑰，兩者不要搞混

```yaml
port: 8317
remote-management:
  allow-remote: true
  secret-key: "ABCD-1234"
  disable-control-panel: false
auth-dir: "/data/auths"
debug: false
logging-to-file: false
usage-statistics-enabled: false
request-retry: 3
quota-exceeded:
   switch-project: true
   switch-preview-model: true
api-keys:
  - "EFGH-5678"
```

等容器狀態變成 **Active** 之後

![](https://img.072899.xyz/2025/10/99cce03e91ceb4eca44b8a055d0b874a.png)

點選圖中的按鈕，開啟之前新增的 **Local Storage**

![](https://img.072899.xyz/2025/10/6ce689a58a74037594e31f5d8e587af7.png)

點選右上角的 **Upload**，選擇剛才準備好的 `config.yaml` 檔案並上傳

![](https://img.072899.xyz/2025/10/d550a6d94c9a5f02852e2f12091ff2a0.png)

上傳完成後，點選 **Restart** 重新啟動容器

![](https://img.072899.xyz/2025/10/e4e4e077371cff0f77d097ccf9b07da6.png)

稍等一下，等容器狀態再次變成 **Active** 後，就能看到 **Local Storage** 中產生了新的檔案

![](https://img.072899.xyz/2025/10/877144ceae6bdc3acc180f18e309c9ef.png)

同時點選 **Logs** 分頁，可以看到如下圖的日誌內容

![](https://img.072899.xyz/2025/10/5da47dbaaace9befc61d18ffcca5298a.png)

![](https://img.072899.xyz/2025/10/af2ed8594a0626ca24dcf3427ff2e103.png)

到這裡，`CLIProxyAPI` 的部署流程就全部完成了。

------

**使用 EasyCLI 進行遠端 OAuth 驗證**

接下來，我們用官方的另一個專案 [EasyCLI](https://github.com/router-for-me/EasyCLI) 從遠端新增 OAuth 帳戶。

`EasyCLI` 是 `CLIProxyAPI` 的搭配專案，提供圖形使用者介面（GUI）來管理 `CLIProxyAPI`。它最大的特色是支援完整的 OAuth 驗證授權流程（不只是上傳授權檔案，而是能處理整個授權回呼過程），這是 `CLIProxyAPI` 內建的 WebUI 做不到的。

請到 [EasyCLI 的 Release 頁面](https://github.com/router-for-me/EasyCLI/releases) 下載適合你作業系統的版本（作者提供 Mac、Linux、Windows 版本）。本教學以 Windows x64 版本為例。

開啟程式後，選擇 **Remote**，輸入之前記下的網址

![](https://img.072899.xyz/2025/10/f1d6dce519e20cae93abaac261f4d269.png)

密碼輸入 `config.yaml` 裡設定的 `remote-management.secret-key`（本例中是 `ABCD-1234`）

依序點選 **Authentication Files** -> **New**

![](https://img.072899.xyz/2025/10/00cbb95dfeab2b8047b8270292fbe2cc.png)

選擇要驗證的供應商，填寫必填欄位，然後點選 **Confirm**

![](https://img.072899.xyz/2025/10/994a104817d51e39f811ad190d6190d5.png)

頁面上會出現 OAuth 連結，點選 **Open Link**

![](https://img.072899.xyz/2025/10/361f9b6568609e589c959ca572de8955.png)

程式會自動開啟瀏覽器並前往 OAuth 連結，同時 `EasyCLI` 本身會進入等待回呼的狀態

![](https://img.072899.xyz/2025/10/a10dab06835d7bc5d15af8cc1ca607ed.png)

在開啟的瀏覽器頁面中登入帳號，完成授權驗證流程

![](https://img.072899.xyz/2025/10/d1dc0fe737eb8b0ce9f348f2f45871f1.png)

完成後，在 **Authentication Files** 清單中就能看到新產生的設定檔了

![](https://img.072899.xyz/2025/10/d713a77479b41f4035f1bf66b2e538f6.png)

**驗證**

再用 Cherry Studio 測試一下。如圖所示，依照設定檔內容填寫 API 金鑰與 API 位址

![](https://img.072899.xyz/2025/10/8021ac702f232ded423b186dbcb50a90.png)

成功！

![](https://img.072899.xyz/2025/10/5d0684f8cfecb1bc503f5189822911a3.png)

`EasyCLI` 的其他功能就留給各位自己探索了。其實除了 OAuth 驗證這部分，`EasyCLI` 的其他功能和系統內建的 WebUI 大致相同。你也可以開啟 `https://你的CLIProxyAPI網址/management.html` 來管理其他設定（WebUI 的介紹可以參考《陸：新手最愛的 GUI》這篇，雖然內容也挺簡短的 =。=）
