const CONFIG = {
    // クイックリンクの設定
    links: [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'YouTube', url: 'https://youtube.com' },
        { name: 'Gmail', url: 'https://gmail.com' },
        { name: 'ChatGPT', url: 'https://chat.openai.com' },
        { name: 'testserver', url: 'https://127.0.0.1:5500' }
    ],

    // 挨拶メッセージの設定
    greetings: {
        morning: 'おはようございます。今日も1日頑張りましょう。',
        afternoon: 'こんにちは。調子はどうですか？',
        evening: 'こんばんは。お疲れ様でした。ごゆっくりチルしましょう。',
        suffix: 'さん'
    },

    // 検索設定
    search: {
        url: 'https://www.google.com/search?q=',
        placeholder: 'googleで検索'
    },

    // ニュース設定
    news: {
        sources: [
            'https://newsdig.tbs.co.jp/list/rss',
            'https://www.nhk.or.jp/rss/news/cat0.xml'
        ],
        proxies: [
            { name: 'AllOrigins', url: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&_=${Date.now()}`, isJson: true },
            { name: 'CodeTabs', url: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`, isJson: false },
            { name: 'Corsproxy.io', url: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`, isJson: false }
        ],
        loadingText: '読み込み中...',
        errorText: 'すべてのソースから取得に失敗しました。再試行してください。'
    },

    // システム情報設定
    system: {
        pingUrl: 'https://www.google.com/generate_204',
        webModeLabel: 'Web情報を表示中です。',
        dayLabels: ['日', '月', '火', '水', '木', '金', '土']
    }
};