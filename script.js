/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * Guaranteed Monotonic Realtime Sync via Cloudflare Worker Proxy (/api/sheet)
 */

const DESIGN_W = 1260;
const DESIGN_H = 780;
const REFRESH_MS = 30000; // 30 seconds interval

let activeIdx = 1;

function fit() {
  const sx = window.innerWidth / DESIGN_W;
  const sy = window.innerHeight / DESIGN_H;
  const scale = Math.min(sx, sy);
  const stage = document.getElementById('stage');
  if (stage) {
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
}

function silentLiveSync() {
  const frame1 = document.getElementById('sheet-1');
  const frame2 = document.getElementById('sheet-2');
  if (!frame1 || !frame2) return;

  const nextIdx = activeIdx === 1 ? 2 : 1;
  const currentFrame = nextIdx === 1 ? frame1 : frame2;
  const previousFrame = activeIdx === 1 ? frame1 : frame2;

  // Cloudflare Worker proxy url with no-cache headers
  const freshUrl = "/api/sheet?t=" + Date.now();

  currentFrame.onload = () => {
    // Wait 250ms for Google Sheet internal DOM layout to settle
    setTimeout(() => {
      currentFrame.style.zIndex = '30';
      currentFrame.classList.add('active');

      setTimeout(() => {
        previousFrame.classList.remove('active');
        previousFrame.style.zIndex = '10';
        previousFrame.src = 'about:blank';
        activeIdx = nextIdx;
      }, 400);
    }, 250);

    currentFrame.onload = null;
  };

  currentFrame.src = freshUrl;
}

window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);

document.addEventListener('DOMContentLoaded', () => {
  fit();
  setInterval(silentLiveSync, REFRESH_MS);
});

// F11/fullscreen khi trình duyệt TV cho phép
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});
