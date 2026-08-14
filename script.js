/**
 * Seamless Live Auto-Refresh Controller (1 minute interval)
 * Zero-flicker double-buffering iframe crossfade for 55" TV display.
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true';
const REFRESH_INTERVAL_MS = 60000; // Refresh once every 1 minute (60 seconds)

let activeFrameIdx = 1;

document.addEventListener('DOMContentLoaded', () => {
    const frame1 = document.getElementById('sheet-frame-1');
    const frame2 = document.getElementById('sheet-frame-2');

    // Seamless auto-refresh loop (every 1 minute)
    setInterval(() => {
        const nextFrameIdx = activeFrameIdx === 1 ? 2 : 1;
        const currentFrame = nextFrameIdx === 1 ? frame1 : frame2;
        const previousFrame = activeFrameIdx === 1 ? frame1 : frame2;

        // Add timestamp parameter to bypass browser cache
        const freshUrl = SHEET_URL + '&_t=' + new Date().getTime();

        // Listen for iframe load completion before swapping
        currentFrame.onload = () => {
            currentFrame.classList.add('active');
            previousFrame.classList.remove('active');
            activeFrameIdx = nextFrameIdx;
            // Remove listener after trigger
            currentFrame.onload = null;
        };

        // Load updated sheet in background iframe
        currentFrame.src = freshUrl;
    }, REFRESH_INTERVAL_MS);

    // Safety full page reload every 15 minutes to keep Smart TV memory clean
    setInterval(() => {
        window.location.reload();
    }, 15 * 60 * 1000);
});
