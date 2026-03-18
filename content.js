// content.js — injected into Gmail

// Cache of domain -> color (merges auto + user overrides)
let domainColorMap = {};

// Load user overrides from storage, then colorize
function init() {
  chrome.storage.sync.get("overrides", ({ overrides = {} }) => {
    domainColorMap = overrides;
    colorizeAll();
    observeMutations();
  });
}

// Listen for storage changes (e.g. user updates popup)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.overrides) {
    domainColorMap = changes.overrides.newValue || {};
    colorizeAll();
  }
});

/**
 * Gmail renders inbox rows as <tr> elements.
 * The sender is in a <span> with email address data or display name.
 * We target rows that haven't been colored yet.
 */
function getEmailRows() {
  // Gmail inbox rows: <tr> tags with role="row" inside the inbox table
  return document.querySelectorAll('tr.zA');
}

function colorizeAll() {
  getEmailRows().forEach(colorizeRow);
}

function colorizeRow(row) {
  // Find the sender element — Gmail uses a <span> with the sender name
  const senderEl = row.querySelector('span[email], span.zF');
  if (!senderEl) return;

  // Prefer the `email` attribute (full address), fall back to text
  const rawSender = senderEl.getAttribute('email') || senderEl.textContent;
  if (!rawSender) return;

  const domain = extractDomain(rawSender);
  if (!domain) return;

  // User override takes priority, otherwise auto-assign
  const color = domainColorMap[domain] || autoColorForDomain(domain);

  // Apply to the row — use a data attribute to avoid re-processing
  if (row.dataset.domainColor === color) return; // already set
  row.dataset.domainColor = color;
  row.style.backgroundColor = color;

  // Also apply to all cells in the row (Gmail sometimes overrides tr bg)
  row.querySelectorAll('td').forEach(td => {
    td.style.backgroundColor = color;
  });
}

function observeMutations() {
  const target = document.body;
  const observer = new MutationObserver((mutations) => {
    let shouldRecolor = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldRecolor = true;
        break;
      }
    }
    if (shouldRecolor) colorizeAll();
  });

  observer.observe(target, { childList: true, subtree: true });
}

// Gmail is a SPA — wait for the inbox to load before starting
function waitForInbox() {
  const check = setInterval(() => {
    if (document.querySelector('tr.zA')) {
      clearInterval(check);
      init();
    }
  }, 500);
}

waitForInbox();
