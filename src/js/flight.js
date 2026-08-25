function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function quad(t, a, b, c) {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

export function initFlight() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!document.body.classList.contains("page-home")) return;

  const scene = document.querySelector(".hoverfly-scene");
  const svg = scene?.querySelector("svg");
  const meadow = document.querySelector(".meadow-corner");
  if (!scene || !svg || !meadow) return;

  let current = 0;

  function goal() {
    const range = Math.max(320, window.innerHeight * 0.48);
    return clamp((window.scrollY - 16) / range, 0, 1);
  }

  function frame(now) {
    current += (goal() - current) * 0.048;
    if (Math.abs(goal() - current) < 0.001) current = goal();

    const t = smooth(current);
    const slot = scene.getBoundingClientRect();
    const field = meadow.getBoundingClientRect();
    const restW = Math.min(slot.width || 420, 448);
    const restH = restW * (300 / 460);
    const startX = slot.left + (slot.width - restW) / 2;
    const startY = slot.top + Math.max(0, (slot.height - restH) / 2);
    const endW = Math.max(92, field.width * 0.36);
    const endX = field.left + field.width * 0.22;
    const endY = field.top - endW * 0.08;
    const ctrlX = lerp(startX, endX, 0.42) - Math.min(140, window.innerWidth * 0.1);
    const ctrlY = Math.min(startY, endY) - 70;
    const bob = Math.min(1, current * 1.8);
    const x = quad(t, startX, ctrlX, endX) + Math.sin(now / 720) * 6 * bob;
    const y = quad(t, startY, ctrlY, endY) + Math.cos(now / 940) * 8 * bob;
    const rotate = Math.sin(t * Math.PI) * -16 + Math.sin(now / 1100) * 2 * bob;

    if (current < 0.012) {
      svg.classList.remove("is-travelling");
      svg.removeAttribute("style");
    } else {
      svg.classList.add("is-travelling");
      svg.style.position = "fixed";
      svg.style.left = `${x}px`;
      svg.style.top = `${y}px`;
      svg.style.width = `${lerp(restW, endW, t)}px`;
      svg.style.height = "auto";
      svg.style.margin = "0";
      svg.style.zIndex = t > 0.86 ? "4" : "6";
      svg.style.transform = `rotate(${rotate}deg)`;
      svg.style.pointerEvents = "none";
      svg.style.filter = "drop-shadow(0 10px 12px var(--shadow))";
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
