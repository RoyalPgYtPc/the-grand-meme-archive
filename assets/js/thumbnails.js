// Generates a placeholder SVG "thumbnail" for demo entries, since this
// scaffold ships with no real meme files. Swap this out once you have
// actual archived media at each entry's file_path — e.g. render an
// <img src="[file_path]"> instead of calling placeholderThumb().

const THUMB_PALETTES = [
  ["#c8202a", "#7a1a20"],
  ["#c9a227", "#8a712a"],
  ["#4a5f8a", "#293957"],
  ["#5f8a4a", "#2f4626"],
  ["#8a4a6f", "#4a2740"],
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function initials(title, category) {
  if (!title) return category ? category[0].toUpperCase() : "?";
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function placeholderThumbSVG(entry) {
  const h = hashStr(entry.archive_id);
  const [c1, c2] = THUMB_PALETTES[h % THUMB_PALETTES.length];
  const label = initials(entry.title, entry.category);
  const badge = entry.media_type === "Video" ? "▶" : (entry.media_type === "GIF" ? "GIF" : "");
  return `
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(entry.title || 'Archived meme placeholder').replace(/"/g,'&quot;')}">
    <defs>
      <linearGradient id="g-${entry.archive_id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#g-${entry.archive_id})"/>
    <text x="200" y="172" font-family="Oswald, sans-serif" font-size="86" font-weight="600"
      fill="rgba(255,255,255,0.9)" text-anchor="middle">${label}</text>
    ${badge ? `<text x="200" y="255" font-family="IBM Plex Mono, monospace" font-size="16" fill="rgba(255,255,255,0.75)" text-anchor="middle">${badge} PLACEHOLDER</text>` : `<text x="200" y="255" font-family="IBM Plex Mono, monospace" font-size="14" fill="rgba(255,255,255,0.65)" text-anchor="middle">PLACEHOLDER MEDIA</text>`}
  </svg>`;
}
