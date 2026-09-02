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
  <a class="meme-card" href="entry.html?id=${entry.archive_id}">
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
