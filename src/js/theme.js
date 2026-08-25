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

  button?.addEventListener("click", () => {
    const next = currentTheme() === "dusk" ? "dawn" : "dusk";
    root.setAttribute("data-theme", next);
    localStorage.setItem(KEY, next);
    syncLabel(button, next);
  });
}

function syncLabel(button, theme) {
  if (!button) return;
  button.textContent = theme === "dusk" ? "Dawn" : "Dusk";
}
