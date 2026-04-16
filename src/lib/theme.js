// Theme management utility
export function getTheme() {
  return localStorage.getItem("steply_theme") || "light";
}

export function setTheme(theme) {
  localStorage.setItem("steply_theme", theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function initTheme() {
  const theme = getTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
}