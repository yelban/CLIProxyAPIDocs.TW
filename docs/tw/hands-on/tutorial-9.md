# 零成本部署：Railway（物件儲存）

繼《沒有 VPS？》系列的前兩篇之後，我又試了一些容器雲端服務。剛好 CLIProxyAPI 新增了 S3 儲存桶的支援，所以本文要介紹一種新組合：用 Railway 的容器服務，搭配 ClawCloud 的 S3 儲存桶來部署。

開始之前，請先確認你已經有 [ClawCloud](https://run.claw.cloud/) 和 [Railway](https://railway.com/) 的帳號。

### 一、建立 ClawCloud 儲存桶

登入 ClawCloud 後，點選進入 **Object Storage**。

![](https://img.072899.xyz/2025/10/8350104852042e43ba4c3dad25fd0004.png)

接著，點選 **Create bucket**。

![](https://img.072899.xyz/2025/10/9f5953f5a406a21d2ff914cfa01638c9.png)

輸入自訂的儲存桶名稱（必須是小寫），再點選右上角的 **Create**。

![](https://img.072899.xyz/2025/10/39db7fd3e8ca4a57c46191be889e0f15.png)

到這裡，儲存桶就建立好了。接下來要記下 4 個關鍵參數：儲存桶全名（圖中紅框處）、Access Key、Secret Key，以及 External 位址。

![](https://img.072899.xyz/2025/10/ef6c22c9cc50eee9152e4c95454786dd.png)

![](https://img.072899.xyz/2025/10/a3931df797a65db7afecf18cb66e66ce.png)

這 4 個參數會分別用來設定環境變數。另外還要再設定一個 `MANAGEMENT_PASSWORD`（登入 WebUI 用的密碼）。請把這些資訊整理成下列格式，並妥善保存：

```
OBJECTSTORE_ENDPOINT=External值
OBJECTSTORE_ACCESS_KEY=Access Key值
OBJECTSTORE_SECRET_KEY=Secret Key值
OBJECTSTORE_BUCKET=儲存桶全名
MANAGEMENT_PASSWORD=登入WebUI的密碼
```

### 二、Railway 手動部署

在 Railway 的專案儀表板中，點選 **Create**，選擇 **Docker image**。

![](https://img.072899.xyz/2025/10/f9dfb05a9991e5a228fa18629168588c.png)

輸入 `eceasy/cli-proxy-api:latest` 後按 Enter。稍等一下，工作區就會出現一個新的容器。

![](https://img.072899.xyz/2025/10/dec39863e684dd39f63acd1ebbe401e9.png)

點選這個新建立的容器，在右側面板選擇 **Variables** -> **Raw Editor**。

![](https://img.072899.xyz/2025/10/d3d5d5b5144d2016ff4d8ddf8953a819.png)

把先前準備好的環境變數貼上去，再點選 **Update Variables**。

![](https://img.072899.xyz/2025/10/accaf8ea92a57371cf1d1994be59cd9f.png)

點選 **Deploy** 按鈕開始部署。

![](https://img.072899.xyz/2025/10/6889a73eb138f8e1dca7ab0fb4b79b21.png)

等部署完成（出現「Deployment successful」提示）後，點選進入 **Settings** 分頁。

![](https://img.072899.xyz/2025/10/a1059beca1671b505b4909c36ae51f68.png)

在 **Public Networking** 區塊，點選 **Generate Domain**。

![](https://img.072899.xyz/2025/10/e3d3efbcc34db844c81ee1eefda48e22.png)

把連接埠設為 `8317`，再點選 **Generate Domain**。

![](https://img.072899.xyz/2025/10/6ddb5ee7884c2c239b02edca10ca2668.png)

這時 Railway 會替你產生一個公開網址，用這個網址就能開啟 CLIProxyAPI 的 WebUI。網頁能打開，就代表部署成功了。

![](https://img.072899.xyz/2025/10/d216af36328e62147889108799278561.png)

### 三、Railway 範本部署

另外，Railway 也支援用範本一鍵部署。可以直接點選下方按鈕開始（註：此連結含 AFF）。

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/0uGPyR?referralCode=JC4tEx&utm_medium=integration&utm_source=template&utm_campaign=generic)

如果使用範本部署，請注意部署完成後要確認服務的連接埠是不是 `8317`。不是的話要自己手動修改，步驟如下圖所示：

![](https://img.072899.xyz/2025/10/e741f1f62e4726a16e75b1264ad4438e.png)

![](https://img.072899.xyz/2025/10/ba2c7d7bac37b3bcdd3aebb220c6fb0b.png)

![](https://img.072899.xyz/2025/10/39b49aea18026f80834bf0ee22d405a3.png)

到這裡，整個部署流程就完成了。後續用法可以參考《零成本部署：ClawCloud（內建儲存）》教學中的 **「使用 EasyCLI 進行遠端 OAuth 驗證」** 一節。

**補充說明**：除了 ClawCloud，理論上任何相容 S3 API 的物件儲存服務（例如 Cloudflare R2）都可以替代。
