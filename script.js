/**
 * Auto-Fit & Auto-Center Realtime Sheet Controller
 * Dynamically scales table to fit any screen resolution perfectly centered.
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true';
const REFRESH_INTERVAL_MS = 2000; // Realtime sync every 2 seconds

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 780;

let activeFrameIdx = 1;

/**
 * Dynamically calculate optimal scale factor to fit table 100% in viewport
 */
function autoFitAndCenter() {
    const container = document.getElementById('sheet-container');
    if (!container) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate scale factor for width and height
    const scaleX = windowWidth / BASE_WIDTH;
    const scaleY = windowHeight / BASE_HEIGHT;

    // Use minimum scale to fit 100% without scrollbars or overflow
    const scale = Math.min(scaleX, scaleY);

    container.style.transform = `scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const frame1 = document.getElementById('sheet-frame-1');
    const frame2 = document.getElementById('sheet-frame-2');

    // Run Auto-fit calculation immediately and on window resize
    autoFitAndCenter();
    window.addEventListener('resize', autoFitAndCenter);

    // Realtime zero-flicker refresh loop (2s)
    setInterval(() => {
        const nextFrameIdx = activeFrameIdx === 1 ? 2 : 1;
        const currentFrame = nextFrameIdx === 1 ? frame1 : frame2;
        const previousFrame = activeFrameIdx === 1 ? frame1 : frame2;

        // Bypass browser cache for immediate realtime updates
        const freshUrl = SHEET_URL + '&_t=' + new Date().getTime();

        currentFrame.onload = () => {
            currentFrame.classList.add('active');
            previousFrame.classList.remove('active');
            activeFrameIdx = nextFrameIdx;
            currentFrame.onload = null;
        };

        currentFrame.src = freshUrl;
    }, REFRESH_INTERVAL_MS);

    // Periodic cleanup to keep TV browser memory clean
    setInterval(() => {
        window.location.reload();
    }, 15 * 60 * 1000);
});
