# 快速開始

## macOS

```bash
brew install cliproxyapi
brew services start cliproxyapi
```

> 透過 Homebrew 安裝並以 `brew services` 執行時，預設設定檔路徑是 `$(brew --prefix)/etc/cliproxyapi.conf`（Apple Silicon 通常是 `/opt/homebrew/etc/cliproxyapi.conf`，Intel Mac 通常是 `/usr/local/etc/cliproxyapi.conf`）。
> 如果想繼續以 `~/.cli-proxy-api/config.yaml` 作為主要設定檔，請把 Homebrew 的路徑改成**指向**該檔案的符號連結。啟動服務前，連結目標**必須已經存在**（符號連結若指向不存在的檔案，服務會立刻結束）：
> ```bash
> brew_conf="$(brew --prefix)/etc/cliproxyapi.conf"
> home_conf="$HOME/.cli-proxy-api/config.yaml"
>
> brew services stop cliproxyapi
> mkdir -p "$HOME/.cli-proxy-api"
>
> # 只複製與備份一般檔案，不動符號連結。備份檔名加上時間戳記，避免覆寫既有的 .bak。
> if [ -f "$brew_conf" ] && [ ! -L "$brew_conf" ]; then
>   if [ -f "$home_conf" ] || cp "$brew_conf" "$home_conf"; then
>     mv "$brew_conf" "${brew_conf}.bak.$(date +%Y%m%d-%H%M%S)"
>   fi
> fi
>
> # 確認 Homebrew 路徑已安全指向既有的設定檔後，才啟動服務
> if [ ! -f "$home_conf" ]; then
>   echo "找不到設定檔 $home_conf；服務未啟動。" >&2
> elif [ -e "$brew_conf" ] && [ ! -L "$brew_conf" ]; then
>   echo "無法安全替換 $brew_conf；服務未啟動。" >&2
> elif ln -sfn "$home_conf" "$brew_conf"; then
>   brew services start cliproxyapi
> else
>   echo "無法建立設定檔的符號連結；服務未啟動。" >&2
> fi
> ```

## Linux

### 一鍵安裝腳本

```bash
curl -fsSL https://raw.githubusercontent.com/router-for-me/cliproxyapi-installer/refs/heads/master/cliproxyapi-installer | bash
```

感謝 [brokechubb](https://github.com/brokechubb) 製作這個 Linux 安裝程式！

### Arch Linux (AUR)

Arch Linux 使用者可以直接從 AUR 安裝：

```bash
# 使用 yay
yay -S cli-proxy-api-bin

# 使用 paru
paru -S cli-proxy-api-bin
```

安裝完成後，可以透過 systemd 管理服務：

```bash
# 啟動服務
systemctl --user start cli-proxy-api

# 設定開機自動啟動
systemctl --user enable cli-proxy-api
```

> ⚠️ **注意**：
> 啟動服務前必須先有設定檔。可以複製範例設定檔來建立：
> ```bash
> mkdir -p ~/.cli-proxy-api
> cp /usr/share/doc/cli-proxy-api-bin/config.example.yaml ~/.cli-proxy-api/config.yaml
> ```

## Windows

你可以從[這裡](https://github.com/router-for-me/CLIProxyAPI/releases)下載最新版本，直接執行。

或者

你可以從[這裡](https://github.com/router-for-me/EasyCLI/releases)下載我們的桌面 GUI 應用程式，直接執行。

## Docker

請把外掛目錄掛載到 `/CLIProxyAPI/plugins`，透過外掛商店安裝的外掛才會在容器重新啟動後保留下來。

```bash
docker run --rm -p 8317:8317 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest
```

## 從原始碼建置

1. 複製（clone）儲存庫：
   ```bash
   git clone https://github.com/router-for-me/CLIProxyAPI.git
   cd CLIProxyAPI
   ```

2. 建置應用程式：

   Linux、macOS：
   ```bash
   go build -o cli-proxy-api ./cmd/server
   ```
   Windows：
   ```bash
   go build -o cli-proxy-api.exe ./cmd/server
   ```
