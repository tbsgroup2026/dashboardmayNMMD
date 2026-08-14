/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * Silent Background Live Sync (5s interval, Zero-flicker double-buffering)
 */

const DESIGN_W = 1180;
const DESIGN_H = 750;
const REFRESH_MS = 5000; // Check Google Sheet for live updates every 5 seconds

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
  
  // Cache-buster timestamp forcing Google CDN to deliver the latest cells
  const freshUrl = base + "&_t=" + Date.now() + "&_nonce=" + Math.random();

  currentFrame.onload = () => {
    currentFrame.classList.add('active');
    previousFrame.classList.remove('active');
    activeIdx = nextIdx;
    currentFrame.onload = null;
  };

  currentFrame.src = freshUrl;
}

window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);

document.addEventListener('DOMContentLoaded', () => {
  fit();
  // Start silent live sync interval (5 seconds)
  setInterval(silentLiveSync, REFRESH_MS);
});

// F11/fullscreen when the TV/browser allows it on double click.
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});
