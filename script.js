const DESIGN_W = 1920;
const DESIGN_H = 1080;
const REFRESH_MS = 60000;

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
  const iframe = document.getElementById('sheet');
  if (iframe) {
    const base = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true&widget=false&headers=false&chrome=false";
    iframe.src = base + "&_refresh=" + Date.now();
  }
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
