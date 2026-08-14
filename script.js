/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * Fullscreen Flexbox Sheet Container with Silent Live Sync (5s)
 */

const REFRESH_MS = 5000;
let activeIdx = 1;

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
    currentFrame.classList.add('active');
    previousFrame.classList.remove('active');
    activeIdx = nextIdx;
    currentFrame.onload = null;
  };

  currentFrame.src = freshUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  setInterval(silentLiveSync, REFRESH_MS);
});

// F11/fullscreen khi trình duyệt TV cho phép
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});
