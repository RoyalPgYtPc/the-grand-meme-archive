// Great Meme Archive — browse/search page logic.
// All client-side against ARCHIVE_DATA. For a real archive with hundreds
// of thousands of entries, swap this for a real search index (e.g. a
// prebuilt Lunr/Flexsearch index, or a backend search API) — see the
// README for notes on scaling this.

const PAGE_SIZE = 12;

const state = {
  q: "",
  category: null,
  mediaType: null,
  flair: null,
  availability: null, // 'hosted' | 'index-only' | null
  minScore: null,
  yearFrom: null,
  sort: "recent",
  page: 1,
};

function readStateFromURL() {
  const p = new URLSearchParams(location.search);
  if (p.get("q")) state.q = p.get("q");
  if (p.get("sort")) state.sort = p.get("sort");
  if (p.get("category")) state.category = p.get("category");
  if (p.get("availability")) state.availability = p.get("availability");
}

function writeStateToURL() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.sort !== "recent") p.set("sort", state.sort);
  if (state.category) p.set("category", state.category);
  if (state.availability) p.set("availability", state.availability);
  history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p.toString() : ""));
}

function matchesQuery(entry, q) {
  if (!q) return true;
  const hay = [
    entry.archive_id, entry.title, entry.author, entry.original_post_id,
    entry.category, entry.flair, ...(entry.tags || [])
  ].filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function applyFilters() {
  let rows = ARCHIVE_DATA.filter(e => matchesQuery(e, state.q));
  if (state.category) rows = rows.filter(e => e.category === state.category);
  if (state.mediaType) rows = rows.filter(e => e.media_type === state.mediaType);
  if (state.flair) rows = rows.filter(e => e.flair === state.flair);
  if (state.availability === "hosted") rows = rows.filter(e => e.publicly_hosted);
  if (state.availability === "index-only") rows = rows.filter(e => !e.publicly_hosted);
  if (state.minScore) rows = rows.filter(e => (e.score || 0) >= state.minScore);
  if (state.yearFrom) rows = rows.filter(e => (e.date || "").startsWith(String(state.yearFrom)));

  switch (state.sort) {
    case "score": rows.sort((a,b) => (b.score||0) - (a.score||0)); break;
    case "oldest": rows.sort((a,b) => (a.date||"9999").localeCompare(b.date||"9999")); break;
    case "newest": rows.sort((a,b) => (b.date||"").localeCompare(a.date||"")); break;
    case "id": rows.sort((a,b) => a.archive_id.localeCompare(b.archive_id)); break;
    case "recent":
    default: rows.sort((a,b) => (b.archived_date||"").localeCompare(a.archived_date||""));
  }
  return rows;
}

function renderFilterChips() {
  document.querySelectorAll(".filter-chip[data-filter]").forEach(chip => {
    const [group, value] = [chip.dataset.filter, chip.dataset.value];
    const active = state[group] === value;
    chip.classList.toggle("active", active);
  });
}

function render() {
  const rows = applyFilters();
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  document.getElementById("result-count").textContent =
    `${formatNum(rows.length)} result${rows.length === 1 ? "" : "s"}`;

  const grid = document.getElementById("results-grid");
  if (pageRows.length === 0) {
    grid.innerHTML = "";
    document.getElementById("empty-state").style.display = "block";
  } else {
    document.getElementById("empty-state").style.display = "none";
    grid.innerHTML = pageRows.map(memeCardHTML).join("");
  }

  renderPagination(totalPages);
  renderFilterChips();
  writeStateToURL();
}

function renderPagination(totalPages) {
  const el = document.getElementById("pagination");
  if (totalPages <= 1) { el.innerHTML = ""; return; }
  let html = `<button class="page-btn" ${state.page===1?"disabled":""} onclick="goPage(${state.page-1})">‹</button>`;
  const windowSize = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - state.page) <= windowSize) {
      html += `<button class="page-btn ${i===state.page?"active":""}" onclick="goPage(${i})">${i}</button>`;
    } else if (Math.abs(i - state.page) === windowSize + 1) {
      html += `<span class="page-btn" style="border:none;">…</span>`;
    }
  }
  html += `<button class="page-btn" ${state.page===totalPages?"disabled":""} onclick="goPage(${state.page+1})">›</button>`;
  el.innerHTML = html;
}

function goPage(p) { state.page = p; render(); window.scrollTo({top: 0, behavior: "smooth"}); }

function toggleChip(group, value) {
  state[group] = state[group] === value ? null : value;
  state.page = 1;
  render();
}

function initBrowse() {
  readStateFromURL();
  document.getElementById("search-input").value = state.q;
  document.getElementById("sort-select").value = state.sort;

  document.getElementById("search-input").addEventListener("input", debounce(e => {
    state.q = e.target.value;
    state.page = 1;
    render();
  }, 250));

  document.getElementById("sort-select").addEventListener("change", e => {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("min-score").addEventListener("input", debounce(e => {
    state.minScore = e.target.value ? Number(e.target.value) : null;
    state.page = 1;
    render();
  }, 300));

  document.querySelectorAll(".filter-chip[data-filter]").forEach(chip => {
    chip.addEventListener("click", () => toggleChip(chip.dataset.filter, chip.dataset.value));
  });

  render();
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

document.addEventListener("DOMContentLoaded", initBrowse);
