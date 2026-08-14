/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * 100% Zero-Flicker Seamless Cross-Fade Live Sync (1 minute interval = 60000ms)
 */

const DESIGN_W = 1180;
const DESIGN_H = 760;
const REFRESH_MS = 60000; // 1 minute interval

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

  const base = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true&widget=false&headers=false&chrome=false";
  const freshUrl = base + "&_t=" + Date.now() + "&_nonce=" + Math.random();

  currentFrame.onload = () => {
    // Wait 250ms for Google Sheet internal DOM layout & fonts to freeze into place
    setTimeout(() => {
      // Put current frame on top
      currentFrame.style.zIndex = '30';
      currentFrame.classList.add('active');

      // After cross-fade transition finishes (400ms), lower previous frame
      setTimeout(() => {
        previousFrame.classList.remove('active');
        previousFrame.style.zIndex = '10';
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
