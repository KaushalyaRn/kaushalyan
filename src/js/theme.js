const KEY = "kaushalyan-theme";

function preferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dusk" : "dawn";
}

function currentTheme() {
  return localStorage.getItem(KEY) || document.documentElement.getAttribute("data-theme") || preferredTheme();
}

export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute("data-theme", saved);
  syncLabel(button, currentTheme());
  syncThemeColor(currentTheme());

  button?.addEventListener("click", () => {
    const next = currentTheme() === "dusk" ? "dawn" : "dusk";
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    syncLabel(button, next);
    syncThemeColor(next);
  });
}

function syncThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dusk" ? "#1c1814" : "#f3eee4");
}

function syncLabel(button, theme) {
  if (!button) return;
  button.textContent = theme === "dusk" ? "Dawn" : "Dusk";
}
