// Great Meme Archive — entry detail page logic.

function getEntry() {
  const id = new URLSearchParams(location.search).get("id");
  return ARCHIVE_DATA.find(e => e.archive_id === id);
}

function renderEntry() {
  const entry = getEntry();
  const root = document.getElementById("entry-root");

  if (!entry) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>Archive entry not found</h3>
        <p>We couldn't find that Archive ID in the catalogue. Double-check the ID, or search again.</p>
        <div style="margin-top:18px;"><a class="btn btn-secondary" href="browse.html">← Back to browse</a></div>
      </div>`;
    return;
  }

  document.title = `${entry.title || "Untitled entry"} — Archive #${entry.archive_id} — The Great Meme Archive`;

  const mediaBlock = entry.publicly_hosted
    ? `<div class="entry-media">
         <div class="entry-media-frame">${placeholderThumbSVG(entry)}</div>
       </div>
       <div class="entry-actions">
         <button class="btn btn-secondary" onclick="showToast('This is a demo placeholder — swap in the real archived file at ' + '${entry.file_path}')">View full size</button>
         <button class="btn btn-secondary" onclick="showToast('Demo mode — real deployments serve the file at ' + '${entry.file_path}')">Download original</button>
       </div>`
    : `<div class="unhosted-block">
         <div class="lock-icon">◈</div>
         <h3>Media not publicly hosted</h3>
         <p>This entry is part of the Great Meme Archive, but its media is not currently publicly hosted. It still exists fully in the index below.</p>
         <a class="btn btn-primary" href="request.html?id=${entry.archive_id}">Request this meme</a>
       </div>`;

  const missing = missingFields(entry);
  const incompleteFlag = missing.length
    ? `<div class="incomplete-flag">⚠ Metadata incomplete — missing ${missing.join(", ")}</div>`
    : "";

  const tagsHTML = (entry.tags && entry.tags.length)
    ? entry.tags.map(t => `<span class="tag-pill">${escapeHTML(t)}</span>`).join("")
    : `<span class="v missing">None recorded</span>`;

  const rows = [
    ["ARCHIVE ID", entry.archive_id],
    ["AUTHOR", entry.author || null],
    ["ORIGINAL POST", entry.original_post ? `<a href="${entry.original_post}" target="_blank" rel="noopener" style="color:var(--gold);">View original Reddit post →</a>` : null],
    ["ORIGINAL POST ID", entry.original_post_id || null],
    ["ORIGINAL DATE", formatDate(entry.date)],
    ["ARCHIVED", formatDate(entry.archived_date)],
    ["SCORE", entry.score != null ? "▲ " + formatNum(entry.score) : null],
    ["FLAIR", entry.flair || null],
    ["CATEGORY", entry.category],
    ["MEDIA TYPE", entry.media_type],
    ["TAGS", tagsHTML],
    ["STATUS", entry.publicly_hosted
      ? `<span style="color:var(--hosted);">PUBLICLY HOSTED</span>`
      : `<span style="color:var(--index-only);">INDEX ONLY</span>`],
    ["FILE", entry.file_path || null],
    ["NOTES", entry.notes ? escapeHTML(entry.notes) : null],
  ];

  const rowsHTML = rows.map(([k, v]) => `
    <div class="record-row">
      <div class="k">${k}</div>
      <div class="v ${v ? "" : "missing"}">${v || "Not recorded"}</div>
    </div>`).join("");

  root.innerHTML = `
    <a href="browse.html" style="font-size:13.5px; color:var(--text-faint); display:inline-block; margin-bottom:20px;">← Back to browse</a>
    <div class="entry-layout">
      <div>
        ${mediaBlock}
      </div>
      <div>
        <div class="id-stamp">
          <span class="stamp-label">ARCHIVE ID</span>
          <span class="stamp-id">${entry.archive_id}</span>
        </div>
        <h1 class="entry-title ${entry.title ? "" : "untitled"}">${entry.title ? escapeHTML(entry.title) : "Untitled entry"}</h1>
        ${incompleteFlag}
        <div class="record-table">${rowsHTML}</div>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", renderEntry);
