---
outline: 'deep'
---

# 串流回應攔截能力

串流回應攔截能力會在 SSE 或其他串流回應的 chunk 送到用戶端之前，改寫或丟棄這些 chunk，也可以調整串流回應的標頭。

## 能力欄位

```json
{
  "capabilities": {
    "response_stream_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`StreamChunkInterceptor`、`StreamChunkInterceptRequest`、`StreamChunkInterceptResponse`
- `sdk/pluginabi/types.go`：`response.intercept_stream_chunk`
- `internal/pluginhost/adapters.go`：`InterceptStreamChunk`

範例參考：

- `internal/pluginhost/adapters_test.go`：串流 chunk 歷史、丟棄 chunk 與標頭初始化的測試

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.intercept_stream_chunk` | 改寫串流回應的標頭初始化，或單一 payload chunk。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "RequestHeaders": {},
  "ResponseHeaders": {},
  "OriginalRequest": "base64-client-body",
  "RequestBody": "base64-upstream-request",
  "Body": "base64-current-chunk",
  "HistoryChunks": ["base64-previous-chunk"],
  "ChunkIndex": 0,
  "Metadata": {}
}
```

`ChunkIndex` 從 `0` 開始。`-1` 表示只處理標頭的初始化呼叫，可以在處理 payload chunk 之前先調整回應標頭。

## 回應

```json
{
  "Headers": {
    "X-Stream-Plugin": ["example"]
  },
  "Body": "base64-new-chunk",
  "ClearHeaders": ["X-Old-Header"],
  "DropChunk": false
}
```

語意：

- `Body` 不為空時，會取代目前的 chunk。
- `DropChunk: true` 會略過目前的 payload chunk，且不會寫入之後的 `HistoryChunks`。
- 即使丟棄 chunk，標頭的修改仍會套用。

## 歷史視窗

`HistoryChunks` 是宿主保留的近期 chunk 快照，目前最多保留 64 個 chunk、1 MiB 的歷史位元組。外掛不能假設它包含完整的串流歷史。

## 開發注意事項

- 不要在每個 chunk 上發出高延遲的外部請求。
- 保持 SSE 的協定邊界，不要破壞 `data:`、空行與結尾的 chunk。
- 透過 `host_callback_id` 發起的宿主模型回呼，會略過發起該回呼的外掛自己的串流攔截器。

