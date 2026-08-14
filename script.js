/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * Native Google Sheet Realtime Sync (No JS Page/Iframe Refresh)
 */

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 780;

/**
 * Dynamically scale sheet container to fit 100% on any screen resolution (4K TV, 1080p, etc.)
 */
function autoFitAndCenter() {
    const container = document.getElementById('sheet-container');
    if (!container) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const scaleX = windowWidth / BASE_WIDTH;
    const scaleY = windowHeight / BASE_HEIGHT;

    const scale = Math.min(scaleX, scaleY);

    container.style.transform = `scale(${scale})`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Run Auto-fit calculation immediately and on window resize
    autoFitAndCenter();
    window.addEventListener('resize', autoFitAndCenter);
});
