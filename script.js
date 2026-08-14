/**
 * Auto-Fit & Auto-Center Sheet Controller (No JS Refresh Timers)
 * Dynamically scales table to fit any screen resolution perfectly centered.
 */

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 780;

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
    // Run Auto-fit calculation immediately and on window resize
    autoFitAndCenter();
    window.addEventListener('resize', autoFitAndCenter);
});
