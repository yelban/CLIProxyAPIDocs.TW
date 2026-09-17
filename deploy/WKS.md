# wks 部署紀錄

本 fork 在官方文件站之外新增台灣正體中文版（`docs/tw/`），部署在 wks，服務名 `cpadoc`，2026-09-17 上線。通用流程見本機 `~/.claude/guides/wks-deploy.md`。

| 項目 | 值 |
|------|----|
| 網址 | https://cpadoc.beyondsearchai.com（繁中：`/tw/`） |
| 存取控制 | 公開（2026-09-17 起 Proxy Host 設為 Publicly Accessible）。NPM 仍保留 Access List「cpadoc 內部」（Basic Auth，帳號 `cpadoc`，密碼在 wks `.env` 的 `CPADOC_BASIC_AUTH_PASSWORD`），要再鎖起來時選回它即可 |
| 授權 | 上游 repo 沒有授權檔，但網站頁尾與主程式都標示 MIT；公開時保留頁尾的原作者版權聲明 |
| 流量路徑 | Cloudflare 橘雲 → nginx_proxy（萬用憑證 `*.beyondsearchai.com`）→ `cpadoc:80` |
| loopback | `127.0.0.1:58318` |
| 程式碼 | `/home/orz99/zoo/CLIProxyAPIDocs.TW`（https clone，追蹤 `main`） |
| compose | `/home/orz99/zoo/docker-compose.yml` 的 `cpadoc` 區塊 |
| 映像 | `ab/cpadoc:latest`：Node 建置 VitePress，nginx 提供靜態檔，記憶體上限 64MB |

## 更新

本機推送 `main` 後：

```bash
ssh wks 'bash /home/orz99/zoo/CLIProxyAPIDocs.TW/deploy/wks-update.sh'
```

## 繁中版怎麼來的

1. 用 OpenCC（`s2twp`）把 `docs/cn/` 轉成 `docs/tw/`，連結路徑 `/cn/` 改成 `/tw/`。
2. 由 Opus 5 subagent 逐頁修潤成台灣用語，並對照英文版補上簡體版漏譯或過時的內容；`hands-on/` 系列以中文原文為準。試跑時 Sonnet 5 在設定表格留下較多 OpenCC 誤轉（引數、型別、字首），Opus 5 較徹底且較快，所以整批用 Opus。
3. 導覽列與側邊欄在 `docs/tw/config.ts`，`docs/.vitepress/config.mts` 的 `locales.tw` 引用它。

## 同步上游時

- `docs/en`、`docs/cn`、`docs/ru` 一律採上游版本。
- 上游改了某頁時，比對 `git diff <舊> <新> -- docs/en/<頁面>`，把變動補進 `docs/tw/<頁面>`，不要整頁重新從簡體轉換，以免蓋掉修潤。
- 上游新增頁面：先 OpenCC 轉換，再照同一套譯名修潤，並加進 `docs/tw/config.ts` 的側邊欄。

## 相關

- 管理介面的「使用教學」連結由 Cli-Proxy-API-Management-Center.TW 的 `src/pages/SystemPage.tsx` 依介面語言導到本站的 `/tw/`、`/cn/`、`/ru/` 或首頁。
