// Great Meme Archive — shared utilities used across pages.

function computeStats(data) {
  const hosted = data.filter(e => e.publicly_hosted).length;
  return {
    total: data.length,
    hosted,
    indexOnly: data.length - hosted,
  };
}

function formatNum(n) {
  return n.toLocaleString("en-US");
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function isIncomplete(entry) {
  return !entry.title || !entry.author || !entry.date || !entry.original_post;
}

function missingFields(entry) {
  const missing = [];
  if (!entry.title) missing.push("Title");
  if (!entry.author) missing.push("Author");
  if (!entry.date) missing.push("Original Date");
  if (!entry.original_post) missing.push("Original Post");
  return missing;
}

// Renders one archive card. `entry` is a row from ARCHIVE_DATA.
function memeCardHTML(entry) {
  const title = entry.title
    ? `<div class="meme-title">${escapeHTML(entry.title)}</div>`
    : `<div class="meme-title untitled">Untitled entry</div>`;

  const thumb = entry.publicly_hosted
    ? `<div class="meme-thumb">
         <span class="status-chip hosted">HOSTED</span>
         ${placeholderThumbSVG(entry)}
       </div>`
    : `<div class="meme-thumb unhosted">
         <span class="status-chip index-only">INDEX ONLY</span>
         <div class="lock-icon">◈</div>
         <div class="unhosted-label">MEDIA NOT<br/>PUBLICLY HOSTED</div>
       </div>`;

  const score = entry.score != null ? `<span class="score">▲ ${formatNum(entry.score)}</span>` : `<span>—</span>`;

  return `
  <a class="meme-card" href="entry.html?id=${entry.archive_id}" onclick="return handleSensitiveEntryClick(event, ARCHIVE_DATA.find(e => e.archive_id === '${escapeHTML(entry.archive_id)}'))">
    ${thumb}
    <div class="meme-info">
      ${title}
      <div class="meme-meta">
        <span>#${entry.archive_id}</span>
        ${score}
      </div>
    </div>
  </a>`;
}

function isSensitiveEntry(entry) {
  const tags = (entry.tags || []).map(tag => String(tag).toLowerCase());
  return !!entry.nsfw || !!entry.sensitive_offensive || tags.some(tag => /\b(nsfw|dark|offensive|18\+)\b/.test(tag));
}

function contentWarningsDisabled() {
  return localStorage.getItem("archive-content-warnings-disabled") === "true";
}

function showContentWarning(entry, onContinue) {
  if (!isSensitiveEntry(entry) || contentWarningsDisabled()) {
    onContinue();
    return;
  }
  const modal = document.createElement("div");
  modal.className = "content-warning-backdrop";
  modal.innerHTML = `
    <div class="content-warning" role="dialog" aria-modal="true" aria-labelledby="content-warning-title">
      <h2 id="content-warning-title">Content warning</h2>
      <p>This meme may contain NSFW, dark, sensitive, or offensive material. Are you 18 or older? It may be offensive to some people.</p>
      <label><input type="checkbox" id="disable-content-warnings"> Don't show these warnings again</label>
      <div class="content-warning-actions">
        <button class="btn btn-secondary" data-action="cancel">Go back</button>
        <button class="btn btn-primary" data-action="continue">I am 18+ / Continue</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('[data-action="cancel"]').addEventListener("click", () => modal.remove());
  modal.querySelector('[data-action="continue"]').addEventListener("click", () => {
    if (modal.querySelector("#disable-content-warnings").checked) localStorage.setItem("archive-content-warnings-disabled", "true");
    modal.remove();
    onContinue();
  });
}

function handleSensitiveEntryClick(event, entry) {
  if (!isSensitiveEntry(entry) || contentWarningsDisabled()) return true;
  event.preventDefault();
  showContentWarning(entry, () => { location.href = `entry.html?id=${encodeURIComponent(entry.archive_id)}`; });
  return false;
}

function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

// Highlight the current page in nav (call after nav HTML is in the DOM).
function markActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-page]").forEach(a => {
    if (a.dataset.page === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", markActiveNav);
