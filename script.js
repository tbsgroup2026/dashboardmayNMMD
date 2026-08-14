const DESIGN_W = 1920;
const DESIGN_H = 1080;
const REFRESH_MS = 5000; // High-frequency 5s refresh to catch Google Sheet edits immediately

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

function refreshSheet() {
  const frame1 = document.getElementById('sheet-1');
  const frame2 = document.getElementById('sheet-2');
  if (!frame1 || !frame2) return;

  const nextIdx = activeIdx === 1 ? 2 : 1;
  const currentFrame = nextIdx === 1 ? frame1 : frame2;
  const previousFrame = activeIdx === 1 ? frame1 : frame2;

  const base = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true&widget=false&headers=false&chrome=false";
  
  // Double cache-buster bypassing browser HTTP cache and Google CDN cache
  const freshUrl = base + "&_refresh=" + Date.now() + "&_nocache=" + Math.random();

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
  setInterval(refreshSheet, REFRESH_MS);
});

// F11/fullscreen when the TV/browser allows it on double click.
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});
