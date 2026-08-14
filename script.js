// Auto refresh Google Sheet every 30 seconds for live TV display
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true';
const REFRESH_INTERVAL_MS = 30000;

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('sheet-frame');
    
    // Auto-refresh loop to keep data live
    setInterval(() => {
        if (iframe) {
            iframe.src = SHEET_URL + '&_t=' + new Date().getTime();
        }
    }, REFRESH_INTERVAL_MS);
});
