document.addEventListener('DOMContentLoaded', async () => {
    const FAKE_LOGS = [
        "Award Modular BIOS v4.51PG, An Energy Star Ally",
        "Copyright (C) 1984-98, Award Software, Inc.",
        "Pentium(R) II - 300MHz",
        "Memory Test : 65536K OK",
        "Detecting HDD Primary Master ... Found",
        "Detecting HDD Primary Slave ... Not Found",
        "Searching for Boot Record from IDE-0..OK",
        "HIMEM is testing extended memory...done.",
        "C:\\>SET BLASTER=A220 I5 D1 T4 P330",
        "C:\\>SET PATH=C:\\WINDOWS;C:\\WINDOWS\\COMMAND",
        "C:\\>WIN",
        "Verifying DMI Pool Data ...........",
        "Starting DashBD...",
        "Loading System Tray...",
        "Establishing Dial-up Connection..."
    ];

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const clockElement = document.getElementById('clock');
    const memoInput = document.getElementById('memo-input');
    const weatherInfo = document.getElementById('weather-info');
    const newsList = document.getElementById('news-list');
    const centralMessage = document.getElementById('central-message');
    const systemInfo = document.getElementById('system-info');
    const refreshNewsBtn = document.getElementById('refresh-news');
    const startBtn = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const uiToggleBtn = document.getElementById('ui-toggle');
    const quickLinksWindow = document.getElementById('quick-links-window');
    const uiToggleInternal = document.getElementById('ui-toggle-internal');

    // UIモードの初期化
    const initUIMode = () => {
        const savedMode = localStorage.getItem('ui-mode') || 'classic';
        if (savedMode === 'modern') {
            document.body.classList.add('modern-mode');
        }
    };
    initUIMode();

    let currentGreetingText = '';
    let isDashboardVisible = false;
    let highestZIndex = 100; // ドラッグ可能なウィンドウのz-index管理用
    const fullLogs = []; // システムログ保存用

    // ローディング中のログ表示用ヘルパー
    const addLoadingLog = (msg) => {
        const logsContainer = document.getElementById('loading-logs');
        const statusEl = document.getElementById('loading-status');
        fullLogs.push(msg);
        const logViewer = document.getElementById('full-log-content');
        if (logViewer) logViewer.innerHTML += `<div>${msg}</div>`;

        if (logsContainer) {
            const logEntry = document.createElement('div');
            logEntry.style.marginBottom = '2px';
            logEntry.textContent = msg;
            logsContainer.appendChild(logEntry); // 末尾に追加
            
            if (logsContainer.childNodes.length > 100) logsContainer.firstChild.remove(); // ログ保持数を増加
            // 下端にスクロール
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
        if (statusEl) statusEl.textContent = msg;
    };

    const updateProgress = (percent) => {
        const bar = document.getElementById('bios-progress-bar');
        if (bar) bar.style.width = `${percent}%`;
    };

    addLoadingLog('Powering on system...');
    updateProgress(5);
    
    addLoadingLog('Checking CONFIG.SYS...');
    updateProgress(15);

    // 1. 検索機能 (Bingを使用)
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `${CONFIG.search.url}${encodeURIComponent(query)}`;
        }
    });

    addLoadingLog('Initializing system clock...');
    updateProgress(25);
    // 2. リアルタイム時計
    function updateClock() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // タスクバーの時計形式 (例: 14:05)
        if (clockElement) clockElement.textContent = `${hours}:${minutes}`;
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

        // Win98風にフェードインアニメーションを廃止し、即時表示
        centralMessage.textContent = fullText;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // スタートメニューの制御
    if (startBtn && startMenu) {
        startBtn.addEventListener('click', () => {
            startMenu.classList.toggle('show');
            startBtn.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (!startBtn.contains(e.target) && !startMenu.contains(e.target)) {
                startMenu.classList.remove('show');
                startBtn.classList.remove('active');
            }
        });
    }

    // UIモード切り替え
    const toggleUI = () => {
        const isModern = document.body.classList.toggle('modern-mode');
        localStorage.setItem('ui-mode', isModern ? 'modern' : 'classic');
        addLoadingLog(`Switching to ${isModern ? 'Modern' : 'Classic'} UI...`);
    };

    if (uiToggleBtn) uiToggleBtn.addEventListener('click', toggleUI);
    if (uiToggleInternal) uiToggleInternal.addEventListener('click', toggleUI);

    // タスクバーの更新
    function updateTaskbar() {
        const taskbarContainer = document.getElementById('taskbar-apps');
        if (!taskbarContainer) return;
        taskbarContainer.innerHTML = '';

        document.querySelectorAll('.fixed-window').forEach(win => {
            if (win.classList.contains('window-hidden')) return;

            const title = win.querySelector('h3').textContent;
            const btn = document.createElement('div');
            btn.className = 'task-item';
            const winZ = parseInt(win.style.zIndex) || 0;
            if (winZ === highestZIndex && winZ > 0) {
                btn.classList.add('active');
            }
            btn.textContent = title;
            
            btn.addEventListener('click', () => {
                if (parseInt(win.style.zIndex) === highestZIndex) {
                    // すでに最前面なら最小化
                    win.classList.add('window-hidden');
                } else {
                    // 背面なら最前面へ
                    openWindow(win.id);
                }
                updateTaskbar();
            });
            taskbarContainer.appendChild(btn);
        });
    }

    // 電卓の機能実装
    const calcDisplay = document.getElementById('calc-display');
    if (calcDisplay) {
        const operators = ['+', '-', '*', '/'];
        document.querySelectorAll('.calc-grid button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.textContent;
                let current = calcDisplay.textContent;

                if (val === 'C') {
                    calcDisplay.textContent = '0';
                } else if (val === '=') {
                    try {
                        // 最後の文字が演算子の場合は削除してから計算
                        if (operators.includes(current.slice(-1))) {
                            current = current.slice(0, -1);
                        }
                        const result = eval(current);
                        calcDisplay.textContent = Number.isFinite(result) ? result : 'Error';
                    } catch {
                        calcDisplay.textContent = 'Error';
                    }
                } else if (operators.includes(val)) {
                    if (current === 'Error') return;
                    // 演算子の連続入力を防ぎ、直前の演算子を置換する
                    if (operators.includes(current.slice(-1))) {
                        calcDisplay.textContent = current.slice(0, -1) + val;
                    } else {
                        calcDisplay.textContent += val;
                    }
                } else {
                    // 数値入力の処理（0またはError状態からの入力を考慮）
                    if (current === '0' || current === 'Error') {
                        calcDisplay.textContent = val;
                    } else {
                        calcDisplay.textContent += val;
                    }
                }
            });
        });
    }

    // ウィンドウの「×」ボタンで閉じる機能
    document.querySelectorAll('.window-controls button').forEach(btn => {
        if (btn.textContent === '×') {
            btn.addEventListener('click', () => {
                const win = btn.closest('.fixed-window');
                if (win) win.classList.add('window-hidden');
                updateTaskbar();
            });
        }
    });

    // ウィンドウをクリックしたときに最前面に持ってくる機能
    document.querySelectorAll('.fixed-window').forEach(win => {
        win.addEventListener('mousedown', () => {
            if (!win.classList.contains('window-hidden')) {
                highestZIndex++;
                win.style.zIndex = highestZIndex;
                updateTaskbar();
            }
        });
    });

    // ウィンドウを開く関数
    const openWindow = (id) => {
        const win = document.getElementById(id);
        if (win) {
            win.classList.remove('window-hidden');
            highestZIndex++;
            win.style.zIndex = highestZIndex;
            updateTaskbar();
            
            // コマンドウィンドウが開かれた場合、自動的に入力にフォーカス
            if (id === 'command-window') {
                setTimeout(() => document.getElementById('command-input')?.focus(), 50);
            }
        }
    };

    // コマンド実行ロジック
    const commandInput = document.getElementById('command-input');
    const commandOutput = document.getElementById('command-output');
    const commandBody = document.getElementById('command-body');

    if (commandInput) {
        commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const fullCmd = commandInput.value.trim();
                const args = fullCmd.split(' ');
                const cmd = args[0].toLowerCase();
                
                // 出力にコマンドを表示
                commandOutput.innerHTML += `<div>C:\\DASHBD>${fullCmd}</div>`;
                
                if (cmd) {
                    DashShell.execute(cmd, args.slice(1), {
                        output: commandOutput,
                        body: commandBody,
                        input: commandInput,
                        updateTaskbar: updateTaskbar,
                        openWindow: openWindow
                    });
                }
                
                commandInput.value = '';
                commandBody.scrollTop = commandBody.scrollHeight;
            }
        });
    }

    // スタートメニューの項目を機能化
    const startMenuItems = document.querySelectorAll('.start-item');
    startMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // サブメニュー項目クリック時に親に伝播させない

            const openId = item.getAttribute('data-open');
            if (openId) {
                openWindow(openId);
                startMenu.classList.remove('show');
                startBtn.classList.remove('active');
                return;
            }

            // サブメニューを持つ項目自体（Programs, Accessories等）は何もしない
            if (item.classList.contains('has-submenu')) return;

            const text = item.firstChild.textContent.trim();

            startMenu.classList.remove('show');
            startBtn.classList.remove('active');

            if (text === 'Run...') {
                const command = prompt('実行するプログラム名を入力してください:');
                if (command) alert(`"${command}" を実行しようとしました。`);
            } else if (text === 'Shut Down...') {
                // シャットダウン処理を削除（メニューを閉じるのみ）
            } else {
                alert(`${text} を開こうとしました。`);
            }
        });
    });

    // プログラムフォルダの中身を生成
    const programsDir = document.getElementById('programs-dir-content');
    const internalPrograms = [
        { name: 'Search.exe', id: 'search-window', icon: 'https://img.icons8.com/color/48/000000/search--v1.png' },
        { name: 'Weather', id: 'weather-window', icon: 'https://img.icons8.com/color/48/000000/sun--v1.png' },
        { name: 'News Reader', id: 'news-window', icon: 'https://img.icons8.com/color/48/000000/news.png' },
        { name: 'SysMon', id: 'system-window', icon: 'https://img.icons8.com/color/48/000000/activity-history.png' },
        { name: 'Notepad', id: 'notepad-window', icon: 'https://img.icons8.com/color/48/000000/notepad.png' },
        { name: 'Calculator', id: 'calculator-window', icon: 'https://img.icons8.com/color/48/000000/calculator.png' },
        { name: 'Links', id: 'quick-links-window', icon: 'https://img.icons8.com/color/48/000000/internet-explorer.png' },
        { name: 'Command', id: 'command-window', icon: 'https://img.icons8.com/color/48/000000/console.png' }
    ];

    internalPrograms.forEach(prog => {
        const div = document.createElement('div');
        div.className = 'quick-link-item folder-item';
        div.innerHTML = `<img src="${prog.icon}" class="quick-link-icon" alt="${prog.name}"><div>${prog.name}</div>`;
        div.addEventListener('click', () => openWindow(prog.id));
        programsDir.appendChild(div);
    });

    // 3. クイックリンクの生成
    addLoadingLog('Loading Desktop icons...');
    updateProgress(40);
    const linksContainer = document.getElementById('quick-links');
    CONFIG.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank'; // 新しいタブで開く
        a.rel = 'noopener noreferrer';
        a.textContent = link.name;
        a.className = 'quick-link-item';

        const img = document.createElement('img');
        // 各リンクに対応するアイコンのURLを設定
        let iconSrc = '';
        if (link.name === 'Dashboard') {
            // DashboardはIcons8を使用
            iconSrc = 'https://img.icons8.com/color/48/000000/dashboard.png';
        } else {
            // それ以外はページのファビコンをGoogle経由で参照
            try {
                const domain = new URL(link.url).hostname;
                iconSrc = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
            } catch (e) {
                iconSrc = 'https://img.icons8.com/color/48/000000/folder-invoices--v1.png';
            }
        }

        img.src = iconSrc;
        img.alt = link.name;
        img.classList.add('quick-link-icon');

        a.prepend(img); // アイコンをテキストの前に挿入
        linksContainer.appendChild(a);

        // クイックリンクウィンドウにも追加
        if (quickLinksWindow) {
            const li = document.createElement('li');
            const windowLink = document.createElement('a');
            windowLink.href = link.url;
            windowLink.target = '_blank';
            windowLink.rel = 'noopener noreferrer';
            windowLink.textContent = link.name;
            windowLink.classList.add('news-link'); // ニュースリンクのスタイルを流用
            li.appendChild(windowLink);
            document.getElementById('quick-links-list').appendChild(li);
        }
    });

    // 4. メモ機能 (LocalStorageに保存)
    addLoadingLog('Opening Notepad.exe...');
    updateProgress(50);
    if (memoInput) {
        memoInput.value = localStorage.getItem('dashboard-memo') || '';
        memoInput.addEventListener('input', (e) => {
            localStorage.setItem('dashboard-memo', e.target.value);
        });
    }

    // 5. 天気情報の表示 (モックデータ)
    addLoadingLog('Requesting weather data via Modem...');
    updateProgress(55);
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
                updateProgress(60 + (s * 10));
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
            addLoadingLog('Scanning disk drive (C:)...');
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
                <div style="font-family: 'Tahoma'; font-size: 0.75rem;">
                    <div>Disk: ${diskInfo}</div>
                    <div>Net: ${netType}</div>
                    <div>Ping: ${ping}</div>
                    <div style="color: #000080; margin-top: 5px;">${CONFIG.system.webModeLabel}</div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to get system info:', error);
            systemInfo.innerHTML = `<p>Error retrieving info</p>`;
        }
    }

    addLoadingLog('Starting Explorer.exe...');

    // 架空のログのストリーミングを開始
    const logTimer = setInterval(() => { // このタイマーはクリアする必要があります
        const randomMsg = FAKE_LOGS[Math.floor(Math.random() * FAKE_LOGS.length)];
        addLoadingLog(randomMsg);
    }, 150);

    // ニュースとシステム情報の取得を並行して実行し、完了を待機
    await Promise.allSettled([fetchNews(), updateSystemInfo()]);
    updateProgress(100);
    clearInterval(logTimer);

    // 7. ローディング画面の解除
    const loadingOverlay = document.getElementById('loading-overlay');
    const splashTitle = document.getElementById('splash-title');

    if (loadingOverlay && splashTitle) {
        addLoadingLog('welcome to DashBD');
        // データ取得完了後、BIOS画面の各要素を隠してタイトルを表示
        setTimeout(() => {
            // 1. BIOSのテキスト情報をフェードアウト
            const biosElements = loadingOverlay.querySelectorAll('.bios-header, .bios-logo-text, .loading-logs, .bios-footer');
            biosElements.forEach(el => el.style.opacity = '0');

            setTimeout(() => {
                // 2. DashBDタイトルをアニメーション付きで表示
                splashTitle.classList.add('active');

                // 3. 全体のフェードアウト（タイトルの消え際に合わせる）
                setTimeout(() => {
                    loadingOverlay.classList.add('fade-out');
                    
                    // メイン画面の表示開始に合わせて挨拶アニメーションをトリガー
                    isDashboardVisible = true;
                    updateGreeting(new Date().getHours());
                    updateTaskbar(); // 起動時に表示されているウィンドウをタスクバーに反映
                }, 2000);
            }, 600);
            
        }, 800);
    }
});