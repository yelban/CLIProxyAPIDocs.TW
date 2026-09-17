# 使用 Docker 執行

請將外掛目錄掛載到 `/CLIProxyAPI/plugins`，這樣容器重新啟動後，已安裝的外掛才會保留。

執行以下指令登入（OpenAI OAuth，使用連接埠 1455）：

```bash
docker run --rm -p 1455:1455 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest /CLIProxyAPI/CLIProxyAPI --codex-login
```

執行以下指令登入（Claude OAuth，使用連接埠 54545）：

```bash
docker run --rm -p 54545:54545 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest /CLIProxyAPI/CLIProxyAPI --claude-login
```

執行以下指令登入（Antigravity OAuth，使用連接埠 51121）：

```bash
docker run --rm -p 51121:51121 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest /CLIProxyAPI/CLIProxyAPI --antigravity-login
```


執行以下指令啟動伺服器：

```bash
docker run --rm -p 8317:8317 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest
```
