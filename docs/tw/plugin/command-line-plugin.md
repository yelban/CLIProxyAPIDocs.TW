---
outline: 'deep'
---

# 命令列擴充能力

命令列擴充能力讓外掛向 CLIProxyAPI 註冊自己的命令列 flag，並在這些 flag 被觸發時執行外掛邏輯。

## 能力欄位

```json
{
  "capabilities": {
    "command_line_plugin": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`CommandLinePlugin`、`CommandLineFlag`、`CommandLineExecutionRequest`、`CommandLineExecutionResponse`
- `sdk/pluginabi/types.go`：`command_line.register`、`command_line.execute`
- `internal/pluginhost/command_line.go`：命令列外掛的註冊與執行

範例參考：

- `examples/plugin/cli/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodCommandLineRegister`、`MethodCommandLineExecute`

## 方法

| 方法 | 用途 |
| --- | --- |
| `command_line.register` | 宣告外掛擁有的命令列 flag。 |
| `command_line.execute` | 外掛的 flag 被觸發時，執行外掛指令。 |

## 註冊 flag

```json
{
  "Flags": [
    {
      "Name": "plugin-example-command",
      "Usage": "Run the example C ABI plugin command",
      "Type": "bool",
      "DefaultValue": "false"
    }
  ]
}
```

支援的 `Type` 值：

- `bool`
- `string`
- `int`
- `int64`
- `float64`
- `duration`

## 執行請求

```json
{
  "Program": "cli-proxy-api",
  "Args": ["--plugin-example-command"],
  "ConfigPath": "config.yaml",
  "Host": {},
  "Flags": {
    "plugin-example-command": {
      "Name": "plugin-example-command",
      "Type": "bool",
      "Value": "true",
      "Set": true
    }
  },
  "TriggeredFlags": {}
}
```

## 執行回應

```json
{
  "Stdout": "base64-stdout",
  "Stderr": "base64-stderr",
  "Auths": [],
  "ExitCode": 0
}
```

`Auths` 可回傳指令建立的憑證紀錄，由宿主負責持久保存。

## 開發注意事項

- flag 名稱應保持穩定，並避免與宿主既有的 flag 衝突。
- 命令列外掛適合用於登入、匯入憑證或診斷，不適合長時間執行的工作。
- 回傳非零的 `ExitCode` 會影響行程的結束代碼。
