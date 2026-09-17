# 伍：Docker 伺服器部署

在之前的系列文章中，我們介紹了如何在本機電腦上使用 CLIProxyAPI。這篇文章再往前一步，說明如何在伺服器上透過 Docker 完成部署。

### **一、 環境準備**

開始之前，請先準備一台可用的 VPS（虛擬專用伺服器）。本文以 **Debian 13** 系統為例示範。

同時，請確保你的伺服器上已經安裝了 **Git** 和 **Docker**。

如果還沒安裝，可以用以下指令安裝：

**1. 安裝 Git**
```bash
apt update && apt install git -y
```

**2. 安裝 Docker** 

可以使用官方提供的一鍵安裝腳本：

```bash
bash <(curl -fsSL [https://get.docker.com](https://get.docker.com))
```

### **二、 部署 CLIProxyAPI**

準備好之後，請依序執行以下指令，複製（clone）專案並初始化設定。

```bash
git clone https://github.com/router-for-me/CLIProxyAPI.git
cd CLIProxyAPI
cp config.example.yaml config.yaml
```

![](https://img.072899.xyz/2025/09/60714b62a0f5b3ea896ab5461ecec150.png)

這時可以開啟 `config.yaml` 檔案進行編輯。本教學以下面這份最精簡的設定作為範例：

```yaml
port: 8317

# 資料夾位置請依你的實際情況填寫
auth-dir: "~/.cli-proxy-api"

request-retry: 3

quota-exceeded:
  switch-project: true
  switch-preview-model: true

api-keys:
# Key 請自行設定，供用戶端存取 Proxy 時使用
- "ABC-123456"
```

> **請注意：** 使用 Docker 部署時，建議維持 `auth-dir` 的預設設定，不需要修改。

編輯完 `config.yaml` 檔案後，執行以下指令，執行 Docker 容器建置腳本。

```bash
bash docker-build.sh
```

腳本會提供兩個選項：

![](https://img.072899.xyz/2025/09/f0f543ef4004f3f81c029f442b54c8bc.png)

- **選項 1：** 直接使用 Docker Hub 上預先建置好的映像檔執行（`docker compose up -d`），速度快。
- **選項 2：** 在伺服器上自行編譯映像檔再執行，適合需要自訂修改的情況。

本教學選擇**選項 1**，以便快速啟動服務。稍等一下，服務就成功啟動了。

![](https://img.072899.xyz/2025/09/44609a9a0746c138f570202bd2825366.png)

### **三、 查看記錄**

雖然腳本提示使用 `docker compose logs -f` 查看記錄，但程式預設會把記錄重新導向到檔案，所以要**即時查看記錄**，需要使用以下指令：

```bash
tail -f ./logs/main.log
```

### **四、 新增 OAuth 驗證**

現在程式已經正常執行了。如果要新增中轉服務的 Key，只要依照先前文章介紹的方法編輯設定檔即可。這一次，我們重點說明如何透過 OAuth 新增授權驗證檔案。

#### **步驟一：在伺服器端產生驗證連結**

以新增 **Codex** 為例，請在專案根目錄下執行以下指令：

```bash
docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --codex-login
```

程式會產生一段用來建立 SSH 通道的指令，請複製箭頭處以 `ssh` 開頭的整段指令。

![](https://img.072899.xyz/2025/09/42f152ef068cea1df603b29934b6e814.png)

#### **步驟二：在本機建立 SSH 通道**

在**你自己電腦**的終端機或命令列工具中，貼上剛才複製的指令。

![](https://img.072899.xyz/2025/09/1c27a2d2e3bc1ad823a040a50cb8e143.png)

> **特別注意：** 要把指令中 `-p` 參數後面的連接埠號碼（範例中的 `22`）換成你 VPS **實際使用的 SSH 連接埠**。

按下 Enter 後，輸入伺服器的 SSH 登入密碼。連線成功後，請保持這個終端機視窗開啟，然後回到剛才操作伺服器的終端機。

![](https://img.072899.xyz/2025/09/e25d23bc9b129cc9bbc6f4e1a674fed5.png)

#### **步驟三：透過瀏覽器完成授權**

複製伺服器終端機上箭頭指向的連結。

![](https://img.072899.xyz/2025/09/5ddcbc39551201f61b906703034af3d8.png)

在你本機電腦的瀏覽器中開啟這個連結，用你的 ChatGPT 帳號登入並授權。

![](https://img.072899.xyz/2025/09/a4ed389a080bce529c47bda6f3129189.png)

授權成功後，會看到以下畫面：

![](https://img.072899.xyz/2025/09/507c93b6fc900eae5c6c5b486b399561.png)

同時，伺服器的終端機上也會顯示驗證檔案已成功儲存。

![](https://img.072899.xyz/2025/09/a34bb04a63f7f75f687a2a626035dccd.png)

到這裡，Codex 的驗證就完成了。Claude 和 Antigravity 等其他需要 OAuth 授權的服務，操作流程也類似。

### **五、 原理總結**

最後，我們來整理這個遠端 OAuth 驗證流程的原理：

Claude、Codex 和 Antigravity 的 OAuth 驗證，都需要經過「回呼」（Callback）來接收授權權杖。基於安全限制，服務商的回呼網址通常強制設為 `localhost`。

我們在 Docker 容器中執行授權指令時，容器內沒有瀏覽器，必須在本機電腦上開啟授權網頁。但授權成功後，瀏覽器會嘗試連到 `localhost`，這只會連到我們自己的電腦，無法把權杖傳給遠端伺服器上的程式。

**SSH 通道（SSH Tunnel）** 的作用就是搭起一座橋：它會把本機電腦某個連接埠（例如 `1455`）上的所有網路請求，透過加密的 SSH 連線，轉送到伺服器的同一個連接埠。如此一來，瀏覽器連到本機的 `http://localhost:1455` 時，請求其實會轉送給伺服器上正在監聽 `1455` 連接埠的 CLIProxyAPI 程式，巧妙地完成遠端驗證。

除了 SSH 通道，你也可以在瀏覽器跳轉到 `localhost` 回呼連結時，手動把其中的 `localhost` 換成伺服器的 IP 或網域名稱。不過要注意，這個方法需要正確設定伺服器的防火牆或反向代理，確保能順利收到回呼請求，否則可能會驗證失敗。

### **六、 用戶端使用**

完成以上設定後，在用戶端使用時，只要把請求的端點（Endpoint）網址指向你伺服器的 `IP:連接埠`（例如 `http://YOUR_SERVER_IP:8317`）即可，其他操作與在本機使用完全相同。

到這裡，你已經掌握在伺服器上透過 Docker 部署 CLIProxyAPI 的完整流程，快去享受 AI 帶來的便利吧！
