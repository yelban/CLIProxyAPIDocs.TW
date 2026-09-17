# 參：NanoBanana 實戰

這一期要介紹如何加入 Gemini Web 的 Cookie，讓 `CLIProxyAPI` 支援 `NanoBanana` 模型。

Gemini 的 `NanoBanana` 模型因為影像處理能力出色而廣受好評，但 Google 並沒有提供這個模型的免費 API。現在有了 `CLIProxyAPI`，我們就能透過整合 Gemini Web，以免費 API 的形式使用 `NanoBanana` 啦。

取得驗證資訊的方法有兩種：

### 第一種方法

首先，用你的 Google 帳號登入 Gemini 官網（https://gemini.google.com/app）。據了解，一般帳號每天有 100 次影像生成額度，Pro 帳號則有 1000 次。登入後，在瀏覽器按 F12 開啟開發人員工具，切換到「網路」（Network）分頁。

![](https://img.072899.xyz/2025/09/074fcf1c455e99185ceeada71a27bd8c.png)

在篩選框輸入 `List`，然後把滑鼠游標停在你的使用者頭像上。稍待片刻，下方清單應該會出現 `ListAccounts` 這一筆。如果沒有出現，請重新整理頁面再試一次。

![](https://img.072899.xyz/2025/09/7cb7104fa93a6b6a6903e0745d3b5573.png)

點選 `ListAccounts`，在「標頭」（Headers）->「請求標頭」（Request Headers）中找到 `Cookie`，完整複製它的值。

![](https://img.072899.xyz/2025/09/c2ba085f10fcb145aff7e9d5081b9382.png)

回到 `CLIProxyAPI` 程式所在的目錄，開啟終端機或命令列，輸入指令 `cli-proxy-api --gemini-web-auth`。依照提示貼上剛才複製的 `Cookie` 值並按 Enter，就會看到驗證成功的訊息，`Cookie` 也已自動儲存。

![](https://img.072899.xyz/2025/09/e149d07875cb8dab12de95f82d2b3e45.png)

### 第二種方法

如果你用的是 macOS，或是第一種方法驗證失敗，可能就需要手動輸入 `__Secure-1PSID` 與 `__Secure-1PSIDTS` 的值。請切換到「應用程式」（Application）分頁，依序複製圖中這兩個值。

![](https://img.072899.xyz/2025/09/e5b5debae5ec74a31a1b527e506895e7.png)

![](https://img.072899.xyz/2025/09/7767f178e1186358f1a9a498108e5ac0.png)

在命令列執行驗證時，依照提示手動填入這兩個值，就能完成驗證。

![](https://img.072899.xyz/2025/09/b02fb7704d5c67385d781f9d9893e0b2.png)

### 驗證步驟

接下來實際驗證一下。要注意的是，目前程式只支援透過 OpenAI 相容介面和 Gemini 原生介面來做文字生圖或圖文生圖。因此，之前在 `Cherry Studio` 設定的供應商類型 `OpenAI Response` 要改成 `OpenAI`。

![](https://img.072899.xyz/2025/09/48892cc3ce1e3c4379b694afa45c5d35.png)

新增模型 `NanoBanana`（也就是 `gemini-2.5-flash-image-preview`）。

![](https://img.072899.xyz/2025/09/4674845c6412ec6f5366d109070047fc.png)

現在，在 `Cherry Studio` 中測試一下吧！

![](https://img.072899.xyz/2025/09/fdd35aa92224cd76cbf888ce3ff2cce2.png)

完全符合我們的需求，盡情享受「香蕉」吧！

### 注意事項

- ~~現階段請避免在 `CLIProxyAPI` 中加入多個 Gemini Web 帳戶。有多個帳戶時，程式會輪流呼叫，可能破壞工作階段的連續性，導致請求失敗。~~ 6.0.17 版更新後，程式已支援 Gemini Web 的工作階段親和性，可以加入多個帳戶了。
- 在 `Cherry Studio` 中，**千萬不要**在 `OpenAI Response` 供應商類型下新增 `NanoBanana` 模型。已知 `Cherry Studio` 在這種情況下有 Bug，會導致程式當掉。
