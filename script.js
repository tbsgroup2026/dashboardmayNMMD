/**
 * 55-INCH TV DISPLAY CONTROLLER (LINE MAY 1)
 * Shifted 30px right for perfect TV edge alignment
 */

const DESIGN_W = 1440;
const DESIGN_H = 780;

function fit() {
  const sx = window.innerWidth / DESIGN_W;
  const sy = window.innerHeight / DESIGN_H;
  const scale = Math.min(sx, sy);
  const stage = document.getElementById('stage');
  if (stage) {
    stage.style.transform = `translate(calc(-50% + 30px), -50%) scale(${scale})`;
  }
}

window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);

document.addEventListener('DOMContentLoaded', () => {
  fit();
});

// F11/fullscreen when the TV/browser allows it on double click.
document.addEventListener('dblclick', () => {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});
