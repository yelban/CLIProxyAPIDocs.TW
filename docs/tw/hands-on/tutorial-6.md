# 陸：新手最愛的 GUI

前面的文章已經介紹過怎麼用命令列一步步執行 CLIProxyAPI。其實 CLIProxyAPI 還有兩個搭配的專案：EasyCLI 和 WebUI。

* **EasyCLI 儲存庫網址**：`https://github.com/router-for-me/EasyCLI`
* **WebUI 儲存庫網址**：`https://github.com/router-for-me/Cli-Proxy-API-Management-Center`

這兩個專案的目的是降低一般使用者的上手門檻。EasyCLI 是桌面用戶端，WebUI 則是網頁管理介面，兩者都是連線到 CLIProxyAPI 來運作。

我之前沒有寫 GUI 教學，是因為舊版需要使用者自己部署或安裝，操作比較麻煩。從 `6.0.19` 版開始，作者已經把 WebUI 整合進主程式，所以現在可以直接用內建的網頁介面來設定。

本文簡單介紹如何啟用並開啟 WebUI。EasyCLI 的用法，會在之後談容器雲端部署的文章裡詳細說明。

#### 一、啟用 WebUI

首先，要在原本的基本設定上加入遠端管理的部分。完整的設定範例如下：

```yaml
port: 8317
auth-dir: "~/.cli-proxy-api"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

# 這次新增的遠端管理部分
remote-management:
  allow-remote: true
  # 遠端管理用的 KEY，要和上面的 api-keys 分開
  secret-key: "MGT-123456"
  disable-control-panel: false
```

**請注意**：修改設定後，需要重新啟動程式才會生效（新版已支援自動熱重載）。

#### 二、開啟 WebUI

程式啟動成功後，用瀏覽器開啟 `http://YOUR_SERVER_IP:8317/management.html`，在管理金鑰欄位輸入先前設定的密碼 `MGT-123456`，就能進入 WebUI。

![](https://img.072899.xyz/2025/10/37b12b67193ec67774e2f657e38eefc9.png)

#### 三、重要注意事項

WebUI 的介面很直覺，各項功能可以自己摸索。不過要特別注意：WebUI 裡的 OAuth 驗證功能，只支援在本機執行（例如 `localhost` 或 `127.0.0.1`）的 CLIProxyAPI 執行個體。部署在遠端伺服器上的執行個體，受限於 OAuth 服務商的安全政策，無法直接透過 WebUI 完成驗證。