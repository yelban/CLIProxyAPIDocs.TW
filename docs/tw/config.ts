import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "CLIProxyAPI",
    description: "Wrap ChatGPT Codex, Claude Code, and other model providers as an OpenAI/Gemini/Claude/Codex compatible API service.",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: '首頁', link: '/tw/'},
            {text: '快速開始', link: '/tw/introduction/quick-start'}
        ],

        sidebar: [
            {
                text: '簡介',
                items: [
                    {text: 'CLIProxyAPI 是什麼？', link: '/tw/introduction/what-is-cliproxyapi'},
                    {text: '快速開始', link: '/tw/introduction/quick-start'},
                    {text: 'GitHub', link: 'https://github.com/router-for-me/CLIProxyAPI'}
                ]
            },
            {
                text: '設定',
                items: [
                    {text: '基本設定', link: '/tw/configuration/basic'},
                    {text: '設定選項', link: '/tw/configuration/options'},
                    {text: '憑證目錄', link: '/tw/configuration/auth-dir'},
                    {text: '熱重載', link: '/tw/configuration/hot-reloading'},
                    {
                        text: '儲存',
                        items:[
                            {text: 'Git 儲存', link: '/tw/configuration/storage/git'},
                            {text: 'PostgreSQL 儲存', link: '/tw/configuration/storage/pgsql'},
                            {text: '物件儲存', link: '/tw/configuration/storage/s3'},
                        ]
                    },
                    {
                        text: '供應商',
                        items:[
                            {text: 'Antigravity', link: '/tw/configuration/provider/antigravity'},
                            {text: 'Claude Code', link: '/tw/configuration/provider/claude-code'},
                            {text: 'Codex', link: '/tw/configuration/provider/codex'},
                            {text: 'xAI / Grok', link: '/tw/configuration/provider/xai'},
                            {text: 'AI Studio', link: '/tw/configuration/provider/ai-studio'},
                            {text: 'OpenAI 相容', link: '/tw/configuration/provider/openai-compatibility'},
                            {text: 'Claude Code 相容', link: '/tw/configuration/provider/claude-code-compatibility'},
                            {text: 'Gemini 相容', link: '/tw/configuration/provider/gemini-compatibility'},
                            {text: 'Codex 相容', link: '/tw/configuration/provider/codex-compatibility'},
                        ]
                    },
                    {text: '思考量設定', link: '/tw/configuration/thinking'},
                ]
            },
            {
                text: '管理',
                items: [
                    {text: 'Web UI', link: '/tw/management/webui'},
                    {text: '桌面用戶端', link: '/tw/management/gui'},
                    {text: '管理 API', link: '/tw/management/api'},
                    {text: 'Redis 用量佇列', link: '/tw/management/redis-usage-queue'},
                ]
            },
            {
                text: '代理工具設定',
                items: [
                    {text: 'Claude Code', link: '/tw/agent-client/claude-code'},
                    {text: 'Codex', link: '/tw/agent-client/codex'},
                    {text: 'Factory Droid', link: '/tw/agent-client/droid'},
                    {text: 'OpenCode', link: '/tw/agent-client/opencode'},
                    {text: 'Grok Build', link: '/tw/agent-client/grok-build'},
                    {text: 'PI', link: '/tw/agent-client/pi'}
                ]
            },
            {
                text: '外掛',
                items: [
                    {text: '外掛開發', link: '/tw/plugin/development'},
                    {
                        text: '進入點能力',
                        items: [
                            {text: '模型註冊器', link: '/tw/plugin/model-registrar'},
                            {text: '模型提供者', link: '/tw/plugin/model-provider'},
                            {text: '憑證提供者', link: '/tw/plugin/auth-provider'},
                            {text: '前端驗證提供者', link: '/tw/plugin/frontend-auth-provider'},
                            {text: '前端驗證獨占模式', link: '/tw/plugin/frontend-auth-exclusive'},
                            {text: '排程器', link: '/tw/plugin/scheduler'},
                            {text: '模型路由', link: '/tw/plugin/model-router'},
                            {text: '執行器', link: '/tw/plugin/executor'},
                        ]
                    },
                    {
                        text: '請求處理',
                        items: [
                            {text: '請求轉換', link: '/tw/plugin/request-translator'},
                            {text: '請求正規化', link: '/tw/plugin/request-normalizer'},
                            {text: '請求攔截', link: '/tw/plugin/request-interceptor'},
                        ]
                    },
                    {
                        text: '回應處理',
                        items: [
                            {text: '回應轉換', link: '/tw/plugin/response-translator'},
                            {text: '回應轉換前正規化', link: '/tw/plugin/response-before-translator'},
                            {text: '回應轉換後正規化', link: '/tw/plugin/response-after-translator'},
                            {text: '回應攔截', link: '/tw/plugin/response-interceptor'},
                            {text: '串流回應攔截', link: '/tw/plugin/response-stream-interceptor'},
                        ]
                    },
                    {
                        text: '擴充與回呼',
                        items: [
                            {text: 'Thinking 處理', link: '/tw/plugin/thinking-applier'},
                            {text: '用量觀察', link: '/tw/plugin/usage-plugin'},
                            {text: '命令列擴充', link: '/tw/plugin/command-line-plugin'},
                            {text: 'Management API', link: '/tw/plugin/management-api'},
                            {text: '宿主回呼', link: '/tw/plugin/host-callbacks'},
                        ]
                    },
                ]
            },
            {
                text: 'Docker',
                items: [
                    {text: '使用 Docker', link: '/tw/docker/docker'},
                    {text: '使用 Docker Compose', link: '/tw/docker/docker-compose'},
                ]
            },
            {
                text: '設定實戰',
                items: [
                    {text: '零：設定詳解', link: '/tw/hands-on/tutorial-0'},
                    {text: '參：NanoBanana 實戰', link: '/tw/hands-on/tutorial-3'},
                    {text: '肆：串接中轉服務篇', link: '/tw/hands-on/tutorial-4'},
                    {text: '伍：Docker 伺服器部署', link: '/tw/hands-on/tutorial-5'},
                    {text: '陸：新手最愛的 GUI', link: '/tw/hands-on/tutorial-6'},
                    {text: '雲端部署（內建儲存）', link: '/tw/hands-on/tutorial-7'},
                    {text: '雲端部署（資料庫儲存）', link: '/tw/hands-on/tutorial-8'},
                    {text: '雲端部署（物件儲存）', link: '/tw/hands-on/tutorial-9'},
                    {text: '雲端部署（Git 儲存）', link: '/tw/hands-on/tutorial-10'},
                    {text: '零成本部署 AI Studio 反向代理', link: '/tw/hands-on/tutorial-11'},
                ]
            },

        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/router-for-me/CLIProxyAPI'}
        ],

        docFooter: {
            prev: '上一頁',
            next: '下一頁'
        },

        outline: {
            label: '本頁目錄'
        },

        lastUpdated: {
            text: '最後更新'
        },

        notFound: {
            title: '找不到頁面',
            quote:
                '但如果你不改變方向，繼續尋找，也許終究會抵達你要去的地方。',
            linkLabel: '前往首頁',
            linkText: '回到首頁'
        },

        langMenuLabel: '語言',
        returnToTopLabel: '回到頁首',
        sidebarMenuLabel: '選單',
        darkModeSwitchLabel: '主題',
        lightModeSwitchTitle: '切換到淺色模式',
        darkModeSwitchTitle: '切換到深色模式',
        skipToContentLabel: '跳到內容',

        footer: {
            message: '以 MIT 授權條款釋出',
            copyright: '版權所有 © 2025-至今 Router-For.ME'
        },
    },
})
