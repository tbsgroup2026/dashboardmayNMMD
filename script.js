/**
 * Realtime Sheet Sync Controller (2s interval)
 * Zero-flicker double-buffering iframe auto-refresh.
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1IdE7D52hZoGVSEkJp6nW0P6CDA0OdJVxrZMadO19B6A/preview?rm=minimal';
const REFRESH_INTERVAL_MS = 2000; // Realtime sync every 2 seconds

let activeFrameIdx = 1;

document.addEventListener('DOMContentLoaded', () => {
    const frame1 = document.getElementById('sheet-frame-1');
    const frame2 = document.getElementById('sheet-frame-2');

    // Realtime zero-flicker refresh loop (2s)
    setInterval(() => {
        const nextFrameIdx = activeFrameIdx === 1 ? 2 : 1;
        const currentFrame = nextFrameIdx === 1 ? frame1 : frame2;
        const previousFrame = activeFrameIdx === 1 ? frame1 : frame2;

        // Bypasses cache completely for immediate realtime updates
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
