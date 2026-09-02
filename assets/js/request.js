// Great Meme Archive — request page logic.
// No backend needed: this builds a mailto: link so the visitor's own
// mail client sends the request. That keeps the archive team's email
// address the only thing exposed — no server, no credentials.

function prefillFromQuery() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;
  document.getElementById("req-id").value = id;
  const entry = ARCHIVE_DATA.find(e => e.archive_id === id);
  if (entry) {
    document.getElementById("found-entry").style.display = "block";
    document.getElementById("found-entry-text").textContent =
      `Found in the index: "${entry.title || "Untitled entry"}" (#${entry.archive_id})`;
  }
}

function buildMailto(e) {
  e.preventDefault();
  const id = document.getElementById("req-id").value.trim();
  const note = document.getElementById("req-note").value.trim();
  if (!id) { showToast("Enter an Archive ID first."); return; }

  const entry = ARCHIVE_DATA.find(x => x.archive_id === id);
  const title = entry ? (entry.title || "Untitled entry") : "Unknown — not found in local index";

  const subject = `Great Meme Archive Media Request — ${id}`;
  const body =
`Archive ID:
${id}

Title:
${title}

Request:
Please provide/access the archived media associated with this entry.
${note ? "\nAdditional note:\n" + note : ""}`;

  const mailto = `mailto:${SITE_CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

document.addEventListener("DOMContentLoaded", () => {
  prefillFromQuery();
  document.getElementById("request-form").addEventListener("submit", buildMailto);
  document.getElementById("contact-email-display").textContent = SITE_CONFIG.contactEmail;
});
