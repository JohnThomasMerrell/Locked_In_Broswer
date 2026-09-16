const BLOCKED_DOMAINS = ["facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com", "youtube.com", "netflix.com", "reddit.com", "twitch.tv", "news.ycombinator.com"];
const STORAGE_KEY = "locked-in-settings";
const DEFAULT_SETTINGS = { strict: true, allowlist: ["docs.google.com", "github.com", "linear.app"] };
const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
let history = [], historyIndex = -1, timerSeconds = 25 * 60, timerRunning = false, timerInterval, lockedDomain = "";

const $ = (id) => document.getElementById(id);
const address = $("address"), frame = $("browser-frame"), welcome = $("welcome"), blocked = $("blocked");

function saveSettings() { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }
function hostnameFor(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}
function domainMatches(hostname, domain) { return hostname === domain || hostname.endsWith(`.${domain}`); }
function normalizeUrl(value) {
  const candidate = value.trim();
  if (!candidate) return "";
  const url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only web addresses are supported.");
  const host = url.hostname.toLowerCase();
  const isLocal = host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (!host.includes(".") && !isLocal) throw new Error("Use a full domain like example.com.");
  return url.href;
}
function isBlocked(url) {
  if (!settings.strict) return false;
  const host = hostnameFor(url);
  return BLOCKED_DOMAINS.some((domain) => domainMatches(host, domain)) && !settings.allowlist.some((domain) => domainMatches(host, domain));
}
function evaluateNavigation(url) {
  const host = hostnameFor(url);
  if (isBlocked(url)) return { allowed: false, reason: "blocked-domain", host };
  if (settings.strict && lockedDomain && !domainMatches(host, lockedDomain)) return { allowed: false, reason: "locked-domain", host };
  return { allowed: true, reason: "", host };
}
function showBlocked(url, reason) {
  welcome.hidden = true; frame.hidden = true; blocked.hidden = false;
  const host = hostnameFor(url);
  $("blocked-copy").textContent = reason === "locked-domain"
    ? `${host} is outside your current focus target (${lockedDomain}). Clear the lock only if you are intentionally changing tasks.`
    : `${host} is on your distraction list. Strict mode keeps your attention on the work that matters.`;
  $("page-status").textContent = "Navigation stopped by your focus rules.";
}
function renderLockStatus() {
  $("lock-status").textContent = lockedDomain
    ? `Focus site: ${lockedDomain}`
    : "Focus site: not locked yet";
}
function navigate(rawUrl, addHistory = true) {
  let url;
  try { url = normalizeUrl(rawUrl); } catch (error) { $("page-status").textContent = error.message; return; }
  const evaluation = evaluateNavigation(url);
  address.value = url;
  if (addHistory) { history = history.slice(0, historyIndex + 1); history.push(url); historyIndex++; }
  if (!evaluation.allowed) { showBlocked(url, evaluation.reason); return; }
  if (settings.strict && !lockedDomain) lockedDomain = evaluation.host;
  renderLockStatus();
  welcome.hidden = true; blocked.hidden = true; frame.hidden = false; frame.src = url;
  $("page-status").textContent = `Focused on ${evaluation.host}`;
}
function renderRules() {
  $("blocked-list").innerHTML = BLOCKED_DOMAINS.map((domain) => `<span class="chip">${domain}</span>`).join("");
  $("allowlist").innerHTML = settings.allowlist.map((domain) => `<span class="chip allow-chip">${domain}<button class="remove-domain" data-domain="${domain}" aria-label="Remove ${domain}">×</button></span>`).join("");
}
function renderTimer() {
  const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const seconds = String(timerSeconds % 60).padStart(2, "0");
  $("timer").textContent = `${minutes}:${seconds}`;
  $("timer-toggle").textContent = timerRunning ? "Pause focus" : (timerSeconds === 25 * 60 ? "Start focus" : "Resume focus");
  $("timer-status").textContent = timerRunning ? "Stay with the task." : (timerSeconds === 0 ? "Session complete. Nice work." : "Ready when you are.");
}
function setTimerRunning(running) {
  timerRunning = running;
  clearInterval(timerInterval);
  if (running) timerInterval = setInterval(() => { timerSeconds = Math.max(0, timerSeconds - 1); if (!timerSeconds) setTimerRunning(false); renderTimer(); }, 1000);
  renderTimer();
}

$("address-form").addEventListener("submit", (event) => { event.preventDefault(); navigate(address.value); });
$("back").addEventListener("click", () => { if (historyIndex > 0) { historyIndex--; navigate(history[historyIndex], false); } });
$("forward").addEventListener("click", () => { if (historyIndex < history.length - 1) { historyIndex++; navigate(history[historyIndex], false); } });
$("reload").addEventListener("click", () => { if (!frame.hidden) frame.contentWindow.location.reload(); });
$("return-home").addEventListener("click", () => { blocked.hidden = true; welcome.hidden = false; $("page-status").textContent = "Ready for your next deep-work session."; address.value = ""; });
$("timer-toggle").addEventListener("click", () => setTimerRunning(!timerRunning));
$("timer-reset").addEventListener("click", () => { timerSeconds = 25 * 60; setTimerRunning(false); });
$("strict-toggle").addEventListener("click", () => {
  settings.strict = !settings.strict;
  $("strict-toggle").setAttribute("aria-pressed", settings.strict);
  saveSettings();
  if (settings.strict && historyIndex >= 0 && !lockedDomain) lockedDomain = hostnameFor(history[historyIndex]);
  renderLockStatus();
});
$("allowlist-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("domain-input"), domain = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
  if (domain && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) && !settings.allowlist.includes(domain)) { settings.allowlist.push(domain); saveSettings(); renderRules(); input.value = ""; }
});
$("allowlist").addEventListener("click", (event) => { const domain = event.target.dataset.domain; if (domain) { settings.allowlist = settings.allowlist.filter((item) => item !== domain); saveSettings(); renderRules(); } });
$("clear-lock").addEventListener("click", () => {
  lockedDomain = "";
  renderLockStatus();
  blocked.hidden = true;
  frame.hidden = true;
  welcome.hidden = false;
  $("page-status").textContent = "Focus site lock cleared. Choose your next single task.";
});
frame.addEventListener("load", () => {
  if (!settings.strict || !lockedDomain || frame.hidden) return;
  const currentHost = hostnameFor(frame.src);
  if (currentHost && !domainMatches(currentHost, lockedDomain)) showBlocked(frame.src, "locked-domain");
});
document.querySelectorAll(".quick-link").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.url)));
document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll(".panel").forEach((panel) => { panel.hidden = panel.id !== button.dataset.panel; panel.classList.toggle("active-panel", panel.id === button.dataset.panel); });
}));
document.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") { event.preventDefault(); address.focus(); address.select(); } });

$("strict-toggle").setAttribute("aria-pressed", settings.strict);
renderRules(); renderTimer(); renderLockStatus();
