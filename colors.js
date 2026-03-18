// colors.js — shared utility, loaded before content.js

const PALETTE = [
  "#fff3cd", // yellow
  "#d1ecf1", // cyan
  "#d4edda", // green
  "#f8d7da", // red/pink
  "#e2d9f3", // purple
  "#fde2c8", // orange
  "#cfe2ff", // blue
  "#d6f0e0", // mint
  "#fcd8e8", // rose
  "#ddeeff", // sky
];

/**
 * Deterministically pick a palette color from a domain string.
 * Same domain always gets the same color.
 */
function autoColorForDomain(domain) {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash * 31 + domain.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * Extract domain from a raw sender string like:
 *   "John Doe <john@example.com>" or "notifications@github.com"
 */
function extractDomain(senderText) {
  const emailMatch = senderText.match(/@([\w.-]+)/);
  if (emailMatch) return emailMatch[1].toLowerCase();
  return senderText.trim().toLowerCase();
}
