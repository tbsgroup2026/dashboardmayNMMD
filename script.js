const REFRESH_MS = 5000;
const STEP = 0.05; // 5% zoom per click/step
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;

// Read saved zoom level or set default 125%
let currentZoom = parseFloat(localStorage.getItem('tv_zoom_level')) || 1.25;
let activeIdx = 1;

function applyZoom() {
  const stage = document.getElementById('stage');
  const zoomText = document.getElementById('zoom-text');
  if (stage) {
    stage.style.transform = `translate(-50%, -50%) scale(${currentZoom})`;
  }
  if (zoomText) {
    zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
  }
  localStorage.setItem('tv_zoom_level', currentZoom);
}

function zoomIn() {
  currentZoom = Math.min(MAX_SCALE, currentZoom + STEP);
  applyZoom();
}

function zoomOut() {
  currentZoom = Math.max(MIN_SCALE, currentZoom - STEP);
  applyZoom();
}

function resetZoom() {
  currentZoom = 1.0;
  applyZoom();
}

function refreshSheet() {
  const frame1 = document.getElementById('sheet-1');
  const frame2 = document.getElementById('sheet-2');
  if (!frame1 || !frame2) return;

  const nextIdx = activeIdx === 1 ? 2 : 1;
  const currentFrame = nextIdx === 1 ? frame1 : frame2;
  const previousFrame = activeIdx === 1 ? frame1 : frame2;

  const base = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSDfrqrVWu2A_mLRBUDoeKyzIzLDp3eC2ttAM8zR-6_KfVzcI97VIBKWDKNzpIWbysSub5OSBlpnzUy/pubhtml?gid=1374437410&single=true&widget=false&headers=false&chrome=false";
  const freshUrl = base + "&_refresh=" + Date.now() + "&_nocache=" + Math.random();

  currentFrame.onload = () => {
    currentFrame.classList.add('active');
    previousFrame.classList.remove('active');
    activeIdx = nextIdx;
    currentFrame.onload = null;
  };

  currentFrame.src = freshUrl;
}

document.addEventListener('DOMContentLoaded', () => {
  applyZoom();
  setInterval(refreshSheet, REFRESH_MS);

  // Zoom Button Handlers
  document.getElementById('btn-zoom-in')?.addEventListener('click', zoomIn);
  document.getElementById('btn-zoom-out')?.addEventListener('click', zoomOut);
  document.getElementById('btn-reset')?.addEventListener('click', resetZoom);
  document.getElementById('zoom-text')?.addEventListener('click', resetZoom);

  // Fullscreen Button
  document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Mouse Wheel Zoom (Ctrl + Wheel or Mouse Scroll)
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }
  }, { passive: false });

  // Keyboard Shortcuts (+, -, 0)
  window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') zoomIn();
    else if (e.key === '-' || e.key === '_') zoomOut();
    else if (e.key === '0') resetZoom();
  });
});

// F11 / Fullscreen on double click (outside zoom bar)
document.addEventListener('dblclick', (e) => {
  if (!e.target.closest('.zoom-bar')) {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }
});
