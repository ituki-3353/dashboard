const CONFIG = {
    // クイックリンクの設定
    links: [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'YouTube', url: 'https://youtube.com' },
        { name: 'Gmail', url: 'https://gmail.com' },
        { name: 'ChatGPT', url: 'https://chat.openai.com' },
        { name: 'Dashboard', url: '#' },
        { name: 'ClassRoom', url: 'https://classroom.google.com' },
    ],

    // 挨拶メッセージの設定
    greetings: {
        morning: 'User、おはようございます。',
        afternoon: 'User、こんにちは。',
        evening: 'User、こんばんは。本日の業務終了時刻が近づいています。',
        suffix: ' 様'
    },

    // 検索設定
    search: {
        url: 'https://www.google.com/search?q=',
        placeholder: '実行するキーワードを入力してください'
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
        loadingText: 'データの受信中...',
        errorText: 'すべてのソースから取得に失敗しました。再試行してください。'
    },

    // システム情報設定
    system: {
        pingUrl: 'https://www.google.com/generate_204',
        webModeLabel: 'DashBD 1.0',
        dayLabels: ['日', '月', '火', '水', '木', '金', '土']
    }
};