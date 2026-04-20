/** Escape user input for safe use inside MongoDB $regex (avoid injection / ReDoS patterns). */
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
