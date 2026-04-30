document.addEventListener('DOMContentLoaded', async () => {
    const FAKE_LOGS = [
        "Initializing kernel modules...",
        "Checking filesystem integrity...",
        "Optimizing memory allocation...",
        "Establishing secure websocket connection...",
        "Loading UI assets...",
        "Synchronizing local databases...",
        "Configuring network stack...",
        "Validating user session tokens...",
        "Decrypting environment variables...",
        "Scanning for hardware acceleration...",
        "Verifying SSL certificates...",
        "Mounting virtual partitions...",
        "Pre-compiling JIT modules...",
        "Starting background worker threads...",
        "Waking up peripheral sensors..."
    ];

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const clockElement = document.getElementById('clock');
    const memoInput = document.getElementById('memo-input');
    const weatherInfo = document.getElementById('weather-info');
    const newsList = document.getElementById('news-list');
    const centralMessage = document.getElementById('central-message');
    let currentGreetingText = '';
    let isDashboardVisible = false;
    const systemInfo = document.getElementById('system-info');
    const refreshNewsBtn = document.getElementById('refresh-news');
    const header = document.getElementById('main-header');

    // ローディング中のログ表示用ヘルパー
    const addLoadingLog = (msg) => {
        const logsContainer = document.getElementById('loading-logs');
        const statusEl = document.getElementById('loading-status');
        if (logsContainer) {
            const logEntry = document.createElement('div');
            logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logsContainer.prepend(logEntry); // 下から上に流れる
            if (logsContainer.childNodes.length > 50) logsContainer.lastChild.remove();
        }
        if (statusEl) statusEl.textContent = msg;
    };

    addLoadingLog('Booting Dashboard OS...');

    // ヘッダーのスクロールエフェクト
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        });
    }

    addLoadingLog('Loading search configurations...');

    // 1. 検索機能 (Bingを使用)
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `${CONFIG.search.url}${encodeURIComponent(query)}`;
        }
    });

    addLoadingLog('Synchronizing system clock...');
    // 2. リアルタイム時計
    function updateClock() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const day = CONFIG.system.dayLabels[now.getDay()];

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        clockElement.innerHTML = `
            <div class="clock-date">${year}年${month}月${date}日 (${day})</div>
            <div class="clock-time">${hours}:${minutes}:${seconds}</div>
        `;
        updateGreeting(now.getHours());
    }

    // 時間帯に応じた挨拶の更新
    function updateGreeting(hours) {
        if (!centralMessage || !isDashboardVisible) return;
        let greeting = '';
        if (hours >= 5 && hours < 12) greeting = CONFIG.greetings.morning;
        else if (hours >= 12 && hours < 18) greeting = CONFIG.greetings.afternoon;
        else greeting = CONFIG.greetings.evening;
        
        // LocalStorageに名前が保存されている場合は名前も表示
        const name = localStorage.getItem('user-name') || '';
        const fullText = name ? `${greeting}、${name}${CONFIG.greetings.suffix}` : greeting;

        // テキストに変更がない場合は、アニメーションの再トリガーを防ぐため何もしない
        if (fullText === currentGreetingText) return;
        currentGreetingText = fullText;

        centralMessage.innerHTML = '';
        [...fullText].forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            if (char === ' ') span.style.whiteSpace = 'pre';
            // 1文字ずつ遅延をかけてフェードインさせる
            span.style.animationDelay = `${index * 0.05}s`;
            centralMessage.appendChild(span);
        });
    }

    setInterval(updateClock, 1000);
    updateClock();

    // 3. クイックリンクの生成
    addLoadingLog('Injecting quick links...');
    const linksContainer = document.getElementById('quick-links');
    CONFIG.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.name;
        a.className = 'quick-link-item';
        linksContainer.appendChild(a);
    });

    // 4. メモ機能 (LocalStorageに保存)
    addLoadingLog('Connecting to local storage...');
    if (memoInput) {
        memoInput.value = localStorage.getItem('dashboard-memo') || '';
        memoInput.addEventListener('input', (e) => {
            localStorage.setItem('dashboard-memo', e.target.value);
        });
    }

    // 5. 天気情報の表示 (モックデータ)
    addLoadingLog('Querying meteorological station...');
    if (weatherInfo) {
        weatherInfo.textContent = '東京: 22°C 晴れ';
    }

    // ニュース取得機能 (ハイブリッド・パースとソース・フォールバック)
    async function fetchNews(retries = 3) {
        if (!newsList) return;
        newsList.innerHTML = `<li>${CONFIG.news.loadingText}</li>`;

        // ソースとプロキシを組み合わせて試行
        for (let s = 0; s < CONFIG.news.sources.length; s++) {
            const rssUrl = CONFIG.news.sources[s];
            
            for (let i = 0; i < CONFIG.news.proxies.length; i++) {
                const config = CONFIG.news.proxies[i];
                addLoadingLog(`Fetching News: Source[${s}] via ${config.name}...`);
            try {
                const proxyUrl = config.url(rssUrl);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒で次へ

                const response = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

                let xmlText;
                if (config.isJson) {
                    const data = await response.json();
                    xmlText = data.contents;
                } else {
                    xmlText = await response.text();
                }

                if (!xmlText) throw new Error("取得したデータが空です");

                const parser = new DOMParser();
                let doc, rawItems = [];

                // --- ハイブリッド・パース戦略 ---
                doc = parser.parseFromString(xmlText, "text/xml");
                if (!doc.querySelector("parsererror")) {
                    rawItems = Array.from(doc.getElementsByTagName("item"));
                }

                if (rawItems.length === 0) {
                    doc = parser.parseFromString(xmlText, "text/html");
                    rawItems = Array.from(doc.querySelectorAll("item"));
                }

                // データの抽出と整形
                const items = rawItems.map(item => {
                    const title = item.querySelector("title")?.textContent || 'No Title';
                    const link = item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute("href") || '#';
                    const pubDateText = item.querySelector("pubDate")?.textContent || item.querySelector("date")?.textContent || '';
                    return { title, link, date: new Date(pubDateText) };
                });

                // 日付で降順ソート
                items.sort((a, b) => b.date - a.date);

                if (items.length > 0) {
                    addLoadingLog(`Success: Parsed ${items.length} news items.`);
                    newsList.innerHTML = items.map(item => `
                        <li class="news-item">
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
                                <span class="news-title">${item.title}</span>
                                <span class="news-date">${formatDate(item.date)}</span>
                            </a>
                        </li>
                    `).slice(0, 8).join('');
                    return; // 成功
                } else {
                    throw new Error("有効なニュース項目が見つかりませんでした");
                }
            } catch (error) {
                const errorMsg = error.name === 'AbortError' ? 'タイムアウト' : error.message;
                addLoadingLog(`Warning: Proxy ${config.name} rejected. Reason: ${errorMsg}`);
                console.warn(`Attempt with ${config.name} on source ${s} failed: ${errorMsg}`);
            }
            }
            }
        newsList.innerHTML = `<li>${CONFIG.news.errorText}</li>`;
    }

    // 日付フォーマット用ヘルパー
    function formatDate(date) {
        if (isNaN(date.getTime())) return '';
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${m}/${d} ${h}:${min}`;
    }

    // ニュース更新ボタンのイベント
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', () => fetchNews());
    }

    // 6. システム情報の表示
    // 注意: ブラウザ制限により、C:容量やWiFi情報はNode.js等のバックエンドまたはElectronが必要です。
    async function updateSystemInfo() {
        if (!systemInfo) return;

        try {
            // Google Pingの計測 (HTTPリクエストによる擬似Ping)
            const getPing = async () => {
                const start = performance.now();
                addLoadingLog(`Pinging network gateway (${CONFIG.system.pingUrl})...`);
                try {
                    // no-corsモードでCORS制限を回避しつつ、キャッシュを無視してリクエスト
                    await fetch(CONFIG.system.pingUrl, { mode: 'no-cors', cache: 'no-cache' });
                    return Math.round(performance.now() - start) + 'ms';
                } catch (e) {
                    return 'Error';
                }
            };

            // ブラウザ実行時 (Web mode) のフォールバック
            addLoadingLog('Retrieving storage allocation info...');
            let diskInfo = 'Disk: Access Denied';
            // navigator.storage.estimate() はブラウザのストレージ使用量を推定するAPI
            // Cドライブの空き容量とは異なります
            if (navigator.storage && navigator.storage.estimate) {
                try {
                    const estimate = await navigator.storage.estimate();
                    const usage = Math.round(estimate.usage / (1024 * 1024));
                    diskInfo = `Browser Cache: ${usage}MB used`;
                } catch (e) {
                    console.warn("navigator.storage.estimate() failed:", e);
                }
            }

            // navigator.connection はネットワーク接続情報を取得するAPI
            // WiFiのSSIDとは異なります
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const netType = connection ? `Net: ${connection.effectiveType}` : 'Net: Unknown';

            const ping = await getPing();

            systemInfo.innerHTML = `
                <p>${diskInfo}</p>
                <p>${netType}</p>
                <p>Google Ping: ${ping}</p>
                <p style="font-size: 0.7rem; color: #ffca28; margin-top: 5px;">${CONFIG.system.webModeLabel}</p>
            `;
        } catch (error) {
            console.error('Failed to get system info:', error);
            systemInfo.innerHTML = `<p>Error retrieving info</p>`;
        }
    }

    addLoadingLog('Executing parallel data acquisition...');

    // 架空のログのストリーミングを開始
    const logTimer = setInterval(() => {
        const randomMsg = FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)];
        addLoadingLog(`[SYS] ${randomMsg}`);
    }, 150);

    // ニュースとシステム情報の取得を並行して実行し、完了を待機
    await Promise.all([fetchNews(), updateSystemInfo()]);
    clearInterval(logTimer);

    // 7. ローディング画面の解除
    const loadingOverlay = document.getElementById('loading-overlay');
    const loader = loadingOverlay?.querySelector('.loader');
    const splashTitle = document.getElementById('splash-title');
    const loaderContainer = loadingOverlay?.querySelector('.loader-container');

    if (loadingOverlay && loader && splashTitle) {
        addLoadingLog('Handshake complete. Establishing connection...');
        // データ取得完了後、「Now Loading」を「Dashboard」に切り替え
        setTimeout(() => {
            // 1. Now Loadingとログをフェードアウト
            if (loaderContainer) loaderContainer.classList.add('exit');
            const logs = document.getElementById('loading-logs');
            if (logs) logs.style.opacity = '0';

            setTimeout(() => {
                // 2. Dashboardタイトルをアニメーション付きで表示
                if (loaderContainer) loaderContainer.style.display = 'none';
                splashTitle.classList.add('active');

                // 3. 全体のフェードアウト（タイトルの消え際に合わせる）
                setTimeout(() => {
                    loadingOverlay.classList.add('fade-out');
                    
                    // メイン画面の表示開始に合わせて挨拶アニメーションをトリガー
                    isDashboardVisible = true;
                    updateGreeting(new Date().getHours());
                }, 2000);
            }, 600);
            
        }, 800);
    }
});