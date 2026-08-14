/**
 * 55-INCH TV PRODUCTION DASHBOARD CONTROLLER (NMMD SEWING LINE 1)
 * Auto-fetches published Google Sheet CSV and updates live UI.
 */

// Published Google Sheet URL endpoints
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pub?gid=1374437410&single=true&output=csv';
const SHEET_PUBHTML_URL = 'https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true';

// Application State
let appState = {
    viewMode: 'native', // 'native' or 'iframe'
    theme: 'dark',
    refreshIntervalSeconds: 30,
    countdownSeconds: 30,
    timerId: null,
    clockId: null,
    zoomLevel: 1.25,
    lastData: null
};

// DOM Elements
const elements = {
    clockDate: document.getElementById('clock-date'),
    clockTime: document.getElementById('clock-time'),
    syncBadge: document.getElementById('sync-badge'),
    syncTimer: document.getElementById('sync-timer'),
    btnModeToggle: document.getElementById('btn-mode-toggle'),
    modeText: document.getElementById('mode-text'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnTheme: document.getElementById('btn-theme'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    nativeView: document.getElementById('native-dashboard-view'),
    iframeView: document.getElementById('iframe-embed-view'),
    sheetIframe: document.getElementById('sheet-iframe'),
    teamsGrid: document.getElementById('teams-grid'),
    lastUpdateTime: document.getElementById('last-update-time'),
    
    // Summary metrics
    sumTeams: document.getElementById('summary-total-teams'),
    sumTargetDay: document.getElementById('summary-target-day'),
    sumActualQty: document.getElementById('summary-actual-qty'),
    sumWorkers: document.getElementById('summary-workers'),
    sumCompletionRate: document.getElementById('summary-completion-rate')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initControls();
    fetchDataFromGoogleSheet();
    startAutoRefreshLoop();
});

/**
 * Live Clock (HH:MM:SS, DD/MM/YYYY)
 */
function initClock() {
    function updateClock() {
        const now = new Date();
        
        // Date
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        elements.clockDate.textContent = `${day}/${month}/${year}`;

        // Time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        elements.clockTime.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateClock();
    appState.clockId = setInterval(updateClock, 1000);
}

/**
 * UI Event Listeners & Control Handlers
 */
function initControls() {
    // Mode Switcher (Custom TV Dashboard vs Sheet Iframe)
    elements.btnModeToggle.addEventListener('click', () => {
        if (appState.viewMode === 'native') {
            appState.viewMode = 'iframe';
            elements.nativeView.classList.remove('active');
            elements.iframeView.classList.add('active');
            elements.modeText.textContent = 'TV Dashboard';
            elements.btnModeToggle.querySelector('i').className = 'fa-solid fa-gauge-high';
        } else {
            appState.viewMode = 'native';
            elements.iframeView.classList.remove('active');
            elements.nativeView.classList.add('active');
            elements.modeText.textContent = 'Sheet Gốc';
            elements.btnModeToggle.querySelector('i').className = 'fa-solid fa-chart-dashboard';
        }
    });

    // Refresh Button
    elements.btnRefresh.addEventListener('click', () => {
        elements.btnRefresh.querySelector('i').classList.add('fa-spin');
        fetchDataFromGoogleSheet().then(() => {
            setTimeout(() => {
                elements.btnRefresh.querySelector('i').classList.remove('fa-spin');
            }, 600);
        });
        resetCountdown();
    });

    // Theme Switcher (Dark Industrial / Light Factory)
    elements.btnTheme.addEventListener('click', () => {
        if (appState.theme === 'dark') {
            appState.theme = 'light';
            document.body.className = 'theme-light';
            elements.btnTheme.querySelector('i').className = 'fa-solid fa-sun';
        } else {
            appState.theme = 'dark';
            document.body.className = 'theme-dark';
            elements.btnTheme.querySelector('i').className = 'fa-solid fa-moon';
        }
    });

    // Fullscreen Toggle
    elements.btnFullscreen.addEventListener('click', toggleFullscreen);

    // Zoom buttons for Iframe mode
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const zoomVal = parseFloat(btn.dataset.zoom);
            appState.zoomLevel = zoomVal;
            elements.sheetIframe.style.transform = `scale(${zoomVal})`;
            elements.sheetIframe.style.width = `${100 / zoomVal}%`;
            elements.sheetIframe.style.height = `${100 / zoomVal}%`;
        });
    });

    // Initial iframe scale setting
    elements.sheetIframe.style.transform = `scale(${appState.zoomLevel})`;
    elements.sheetIframe.style.width = `${100 / appState.zoomLevel}%`;
    elements.sheetIframe.style.height = `${100 / appState.zoomLevel}%`;
}

/**
 * Auto-refresh Timer Loop
 */
function startAutoRefreshLoop() {
    appState.countdownSeconds = appState.refreshIntervalSeconds;

    if (appState.timerId) clearInterval(appState.timerId);

    appState.timerId = setInterval(() => {
        appState.countdownSeconds--;
        elements.syncTimer.textContent = `(Làm mới sau: ${appState.countdownSeconds}s)`;

        if (appState.countdownSeconds <= 0) {
            fetchDataFromGoogleSheet();
            resetCountdown();
        }
    }, 1000);
}

function resetCountdown() {
    appState.countdownSeconds = appState.refreshIntervalSeconds;
    elements.syncTimer.textContent = `(Làm mới sau: ${appState.countdownSeconds}s)`;
}

/**
 * Fetch and Parse Published Google Sheet CSV
 */
async function fetchDataFromGoogleSheet() {
    try {
        // Append cache-busting timestamp parameter
        const cacheBuster = `&_t=${new Date().getTime()}`;
        const response = await fetch(SHEET_CSV_URL + cacheBuster);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        const parsedData = parseGoogleSheetCSV(csvText);
        
        appState.lastData = parsedData;
        renderDashboard(parsedData);
        updateLastRefreshedTime();

        // If iframe is visible, refresh it too
        if (appState.viewMode === 'iframe' && elements.sheetIframe) {
            elements.sheetIframe.src = SHEET_PUBHTML_URL + `&_t=${new Date().getTime()}`;
        }

    } catch (error) {
        console.error('Lỗi tải dữ liệu Google Sheet:', error);
        elements.syncBadge.innerHTML = `
            <span class="status-dot red"></span>
            <span class="sync-text" style="color: var(--accent-red)">MẤT KẾT NỐI</span>
        `;
    }
}

/**
 * CSV Parser for Production Sheet Format
 */
function parseGoogleSheetCSV(csvText) {
    const lines = csvText.split('\n').map(line => line.split(','));

    // Extract Teams Data (Columns in CSV map to 4 Teams)
    // Tổ 1: Cols 2..7, Tổ 2: Cols 12..17, Tổ 3: Cols 22..27, Tổ 4: Cols 32..37
    const teams = [
        extractTeamData(lines, 'TỔ MAY 1', 2),
        extractTeamData(lines, 'TỔ MAY 2', 12),
        extractTeamData(lines, 'TỔ MAY 3', 22),
        extractTeamData(lines, 'TỔ MAY 4', 32)
    ];

    return teams;
}

/**
 * Extract metrics for a specific team given the starting column index
 */
function extractTeamData(lines, teamNameDefault, startCol) {
    // Helper to safely get value
    const getVal = (row, colOffset = 0) => {
        if (!lines[row] || lines[row][startCol + colOffset] === undefined) return '';
        return lines[row][startCol + colOffset].replace(/"/g, '').trim();
    };

    // Find row index offset if needed or use known layout structure:
    // Row 10: Team Name
    // Row 11: SLKH/NGÀY, PPH, LĐ, TGLV
    // Row 12: Values: 184, 0.48, 26, 6
    // Row 13: SLKH/GIỜ, Style Code
    // Row 14: Value: 17, SN 144238_BBK
    // Row 16: SLKH L.KẾ (Cumulative target) -> Row 16 value: e.g., 75
    // Row 20: SLTH (Actual output Qty), Completion % -> Row 20 col 0: 15, col 4: 88%
    // Row 24: PPH TH (Actual PPH), PPH % -> Row 24 col 0: 0.48, col 4: 79%
    // Row 28: SỐ LỖI (Defects), % QUALITY -> Row 28 col 0: 6, col 4: 92%

    const teamName = getVal(9) || teamNameDefault;
    const targetDay = parseInt(getVal(11, 0)) || 0; // SLKH/NGÀY
    const pphTarget = parseFloat(getVal(11, 2)) || 0; // PPH Target
    const workers = parseInt(getVal(11, 4)) || 0; // LĐ
    const workHours = parseInt(getVal(11, 6)) || 0; // TGLV

    const targetHour = parseInt(getVal(13, 0)) || 0; // SLKH/GIỜ
    const styleCode = getVal(12, 2) || 'SN 144238_BBK'; // Mã hàng

    const targetCumulative = parseInt(getVal(15, 0)) || 0; // SLKH L.KẾ
    const actualQty = parseInt(getVal(19, 0)) || 0; // SLTH
    const actualQtyPct = getVal(19, 4) || '0%';

    const pphActual = parseFloat(getVal(23, 0)) || 0; // PPH TH
    const pphPct = getVal(23, 4) || '0%';

    const defectCount = parseInt(getVal(27, 0)) || 0; // SỐ LỖI
    const qualityRate = getVal(27, 4) || '100%';

    return {
        teamName,
        targetDay,
        pphTarget,
        workers,
        workHours,
        targetHour,
        styleCode,
        targetCumulative,
        actualQty,
        actualQtyPct,
        pphActual,
        pphPct,
        defectCount,
        qualityRate
    };
}

/**
 * Render Dashboard Cards & Summary Overview
 */
function renderDashboard(teams) {
    if (!teams || teams.length === 0) return;

    // 1. Calculate Line Summary Totals
    let totalTargetDay = 0;
    let totalActualQty = 0;
    let totalWorkers = 0;
    let totalCumulativeTarget = 0;

    teams.forEach(t => {
        totalTargetDay += t.targetDay;
        totalActualQty += t.actualQty;
        totalWorkers += t.workers;
        totalCumulativeTarget += t.targetCumulative;
    });

    const overallCompletionRate = totalCumulativeTarget > 0 
        ? ((totalActualQty / totalCumulativeTarget) * 100).toFixed(1) + '%' 
        : '0%';

    elements.sumTeams.textContent = `${teams.length} Tổ`;
    elements.sumTargetDay.textContent = `${totalTargetDay.toLocaleString('vi-VN')} SP`;
    elements.sumActualQty.textContent = `${totalActualQty.toLocaleString('vi-VN')} SP`;
    elements.sumWorkers.textContent = `${totalWorkers} LĐ`;
    elements.sumCompletionRate.textContent = overallCompletionRate;

    // 2. Render Team Cards
    let html = '';

    teams.forEach((t, idx) => {
        // Completion percentage calculation
        const pctNum = parseFloat(t.actualQtyPct.replace('%', '')) || 0;
        let statusClass = 'status-green';
        if (pctNum < 70) statusClass = 'status-red';
        else if (pctNum < 90) statusClass = 'status-yellow';

        // Defect status
        const defectNum = t.defectCount;
        const defectClass = defectNum > 8 ? 'defect-high' : '';

        html += `
            <div class="team-card">
                <!-- Header -->
                <div class="team-header">
                    <div class="team-name-badge">
                        <i class="fa-solid fa-users"></i>
                        <span>${t.teamName}</span>
                    </div>
                    <div class="style-code-pill" title="${t.styleCode}">
                        <i class="fa-solid fa-tag"></i> ${t.styleCode}
                    </div>
                </div>

                <!-- Targets Mini Grid -->
                <div class="targets-mini-grid">
                    <div class="target-pill">
                        <span class="lbl">KH / Ngày</span>
                        <span class="val">${t.targetDay}</span>
                    </div>
                    <div class="target-pill">
                        <span class="lbl">PPH KH</span>
                        <span class="val">${t.pphTarget}</span>
                    </div>
                    <div class="target-pill">
                        <span class="lbl">Lao Động</span>
                        <span class="val">${t.workers}</span>
                    </div>
                    <div class="target-pill">
                        <span class="lbl">Giờ Làm</span>
                        <span class="val">${t.workHours}h</span>
                    </div>
                </div>

                <!-- Hourly Plan Banner -->
                <div class="hourly-plan-banner">
                    <span><i class="fa-regular fa-clock"></i> KH Định Mức / Giờ:</span>
                    <strong>${t.targetHour} SP/h</strong>
                </div>

                <!-- Main Output KPI -->
                <div class="kpi-section">
                    <div class="kpi-title-row">
                        <span class="kpi-title">SẢN LƯỢNG THỰC HIỆN / LŨY KẾ</span>
                        <span class="pct-badge ${statusClass}">${t.actualQtyPct}</span>
                    </div>
                    <div class="kpi-numbers">
                        <span class="actual">${t.actualQty} SP</span>
                        <span class="target">/ ${t.targetCumulative} SP KH</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill ${statusClass}" style="width: ${Math.min(pctNum, 100)}%;"></div>
                    </div>
                </div>

                <!-- PPH Performance KPI -->
                <div class="kpi-section">
                    <div class="kpi-title-row">
                        <span class="kpi-title">PPH THỰC HIỆN (${t.pphActual})</span>
                        <span class="pct-badge ${statusClass}">${t.pphPct}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill ${statusClass}" style="width: ${Math.min(parseFloat(t.pphPct) || 0, 100)}%;"></div>
                    </div>
                </div>

                <!-- Quality & Defects Row -->
                <div class="defect-row">
                    <div class="defect-box">
                        <span class="lbl"><i class="fa-solid fa-triangle-exclamation"></i> SỐ LỖI</span>
                        <span class="val defect-count ${defectClass}">${t.defectCount} lỗi</span>
                    </div>
                    <div class="defect-box">
                        <span class="lbl"><i class="fa-solid fa-shield-check"></i> % QUALITY</span>
                        <span class="val quality-rate">${t.qualityRate}</span>
                    </div>
                </div>
            </div>
        `;
    });

    elements.teamsGrid.innerHTML = html;
}

/**
 * Update Last Refreshed Badge
 */
function updateLastRefreshedTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    elements.lastUpdateTime.textContent = `Cập nhật lần cuối: ${timeStr}`;
    elements.syncBadge.innerHTML = `
        <span class="status-dot green"></span>
        <span class="sync-text">LIVE SYNC</span>
        <span class="sync-timer" id="sync-timer">(Làm mới sau: ${appState.countdownSeconds}s)</span>
    `;
    elements.syncTimer = document.getElementById('sync-timer');
}

/**
 * Fullscreen Mode Toggle
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        elements.btnFullscreen.querySelector('i').className = 'fa-solid fa-compress';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        elements.btnFullscreen.querySelector('i').className = 'fa-solid fa-expand';
    }
}
