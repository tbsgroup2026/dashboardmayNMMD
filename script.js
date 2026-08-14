/**
 * 55-INCH TV PRODUCTION DASHBOARD CONTROLLER (NMMD SEWING LINE 1)
 * Google Sheet Live Database Synchronizer (3s interval)
 */

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pub?gid=1374437410&single=true&output=csv';
const REFRESH_INTERVAL_MS = 3000; // Continuous live update every 3 seconds

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 840;

// DOM Elements
const elements = {
    tvContainer: document.getElementById('tv-container'),
    clockDate: document.getElementById('clock-date'),
    clockTime: document.getElementById('clock-time'),
    syncBadge: document.getElementById('sync-badge'),
    teamsGrid: document.getElementById('teams-grid'),
    lastUpdateTime: document.getElementById('last-update-time'),
    
    // Line summary cards
    sumTeams: document.getElementById('summary-total-teams'),
    sumTargetDay: document.getElementById('summary-target-day'),
    sumActualQty: document.getElementById('summary-actual-qty'),
    sumWorkers: document.getElementById('summary-workers'),
    sumCompletionRate: document.getElementById('summary-completion-rate')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    autoFitAndCenter();
    window.addEventListener('resize', autoFitAndCenter);
    
    fetchDataFromGoogleSheet();
    setInterval(fetchDataFromGoogleSheet, REFRESH_INTERVAL_MS);
});

/**
 * Dynamically scale TV container to fit 100% on any screen resolution (4K TV, 1080p, etc.)
 */
function autoFitAndCenter() {
    if (!elements.tvContainer) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scaleX = windowWidth / BASE_WIDTH;
    const scaleY = windowHeight / BASE_HEIGHT;

    const scale = Math.min(scaleX, scaleY) * 0.98;

    elements.tvContainer.style.transform = `scale(${scale})`;
}

/**
 * Live Clock (HH:MM:SS, DD/MM/YYYY)
 */
function initClock() {
    function updateClock() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        elements.clockDate.textContent = `${day}/${month}/${year}`;

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        elements.clockTime.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Fetch & Parse Published Google Sheet CSV
 */
async function fetchDataFromGoogleSheet() {
    try {
        const cacheBuster = `&_t=${new Date().getTime()}`;
        const response = await fetch(SHEET_CSV_URL + cacheBuster);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        const teams = parseGoogleSheetCSV(csvText);
        
        renderDashboard(teams);
        updateLastRefreshedTime();

    } catch (error) {
        console.error('Lỗi kết nối Google Sheet Database:', error);
        if (elements.syncBadge) {
            elements.syncBadge.innerHTML = `
                <span class="status-dot red"></span>
                <span class="sync-text" style="color: var(--accent-red)">MẤT KẾT NỐI</span>
            `;
        }
    }
}

/**
 * CSV Data Parser for 4 Teams (Tổ May 1..4)
 */
function parseGoogleSheetCSV(csvText) {
    const lines = csvText.split('\n').map(line => line.split(','));

    return [
        extractTeamData(lines, 'TỔ MAY 1', 2),
        extractTeamData(lines, 'TỔ MAY 2', 12),
        extractTeamData(lines, 'TỔ MAY 3', 22),
        extractTeamData(lines, 'TỔ MAY 4', 32)
    ];
}

function extractTeamData(lines, defaultName, startCol) {
    const getVal = (row, colOffset = 0) => {
        if (!lines[row] || lines[row][startCol + colOffset] === undefined) return '';
        return lines[row][startCol + colOffset].replace(/"/g, '').trim();
    };

    const teamName = getVal(9) || defaultName;
    const targetDay = parseInt(getVal(11, 0)) || 0;
    const pphTarget = parseFloat(getVal(11, 2)) || 0;
    const workers = parseInt(getVal(11, 4)) || 0;
    const workHours = parseInt(getVal(11, 6)) || 0;

    const targetHour = parseInt(getVal(13, 0)) || 0;
    const styleCode = getVal(12, 2) || 'SN 144238_BBK';

    const targetCumulative = parseInt(getVal(15, 0)) || 0;
    const actualQty = parseInt(getVal(19, 0)) || 0;
    const actualQtyPct = getVal(19, 4) || '0%';

    const pphActual = parseFloat(getVal(23, 0)) || 0;
    const pphPct = getVal(23, 4) || '0%';

    const defectCount = parseInt(getVal(27, 0)) || 0;
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
 * Render TV Dashboard UI
 */
function renderDashboard(teams) {
    if (!teams || teams.length === 0) return;

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

    const overallRate = totalCumulativeTarget > 0 
        ? ((totalActualQty / totalCumulativeTarget) * 100).toFixed(1) + '%' 
        : '0%';

    if (elements.sumTeams) elements.sumTeams.textContent = `${teams.length} Tổ`;
    if (elements.sumTargetDay) elements.sumTargetDay.textContent = `${totalTargetDay.toLocaleString('vi-VN')} SP`;
    if (elements.sumActualQty) elements.sumActualQty.textContent = `${totalActualQty.toLocaleString('vi-VN')} SP`;
    if (elements.sumWorkers) elements.sumWorkers.textContent = `${totalWorkers} LĐ`;
    if (elements.sumCompletionRate) elements.sumCompletionRate.textContent = overallRate;

    let html = '';

    teams.forEach((t) => {
        const pctNum = parseFloat(t.actualQtyPct.replace('%', '')) || 0;
        let statusClass = 'status-green';
        if (pctNum < 70) statusClass = 'status-red';
        else if (pctNum < 90) statusClass = 'status-yellow';

        html += `
            <div class="team-card">
                <div class="team-header">
                    <div class="team-name-badge">
                        <i class="fa-solid fa-users"></i>
                        <span>${t.teamName}</span>
                    </div>
                    <div class="style-code-pill" title="${t.styleCode}">
                        <i class="fa-solid fa-tag"></i> ${t.styleCode}
                    </div>
                </div>

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

                <div class="hourly-plan-banner">
                    <span><i class="fa-regular fa-clock"></i> KH Định Mức / Giờ:</span>
                    <strong>${t.targetHour} SP/h</strong>
                </div>

                <div class="kpi-section">
                    <div class="kpi-title-row">
                        <span class="kpi-title">THỰC HIỆN / LŨY KẾ</span>
                        <span class="pct-badge ${statusClass}">${t.actualQtyPct}</span>
                    </div>
                    <div class="kpi-numbers">
                        <span class="actual">${t.actualQty} SP</span>
                        <span class="target">/ ${t.targetCumulative} KH</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill ${statusClass}" style="width: ${Math.min(pctNum, 100)}%;"></div>
                    </div>
                </div>

                <div class="kpi-section">
                    <div class="kpi-title-row">
                        <span class="kpi-title">PPH THỰC HIỆN (${t.pphActual})</span>
                        <span class="pct-badge ${statusClass}">${t.pphPct}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill ${statusClass}" style="width: ${Math.min(parseFloat(t.pphPct) || 0, 100)}%;"></div>
                    </div>
                </div>

                <div class="defect-row">
                    <div class="defect-box">
                        <span class="lbl"><i class="fa-solid fa-triangle-exclamation"></i> SỐ LỖI</span>
                        <span class="val defect-count">${t.defectCount} lỗi</span>
                    </div>
                    <div class="defect-box">
                        <span class="lbl"><i class="fa-solid fa-shield-check"></i> % QUALITY</span>
                        <span class="val quality-rate">${t.qualityRate}</span>
                    </div>
                </div>
            </div>
        `;
    });

    if (elements.teamsGrid) elements.teamsGrid.innerHTML = html;
}

function updateLastRefreshedTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN');
    if (elements.lastUpdateTime) elements.lastUpdateTime.textContent = `Cập nhật lần cuối: ${timeStr}`;
    if (elements.syncBadge) {
        elements.syncBadge.innerHTML = `
            <span class="status-dot green"></span>
            <span class="sync-text">LIVE SYNC (3s)</span>
        `;
    }
}
