/* MyJellyFix — Netflix Skin
   JellyFrame client mod (JS layer).
   Injected before </body>, wrapped by JellyFrame's dedup guard.

   Responsibilities:
     1. If {{NF_HERO}} is on, tag the first visible `.card` on the home page
        as `.nf-hero` so the CSS can treat it specially.
     2. Add a `data-nf-mod="1"` attribute to every `.itemsContainer` we touch
        so we never double-process a row (idempotency).
     3. Use a MutationObserver so it works with Jellyfin's SPA model
        (elements are added after initial load).

   No DOM rewrites, no structural `display` changes — safe against future
   Jellyfin upgrades as long as the safe selectors hold.
*/

(function () {
  var HERO_ENABLED = '{{NF_HERO}}' === '1';
  var MARK = 'data-nf-mod';

  function isHome() {
    // Jellyfin's home is the page that shows the "Recommended for {user}"
    // section. Heuristic: any `.itemsContainer` whose heading contains
    // "Recommended" or "Continue Watching".
    var headings = document.querySelectorAll('.sectionTitle, .pageTitle');
    for (var i = 0; i < headings.length; i++) {
      var t = (headings[i].textContent || '').toLowerCase();
      if (t.indexOf('recommended') !== -1 || t.indexOf('continue') !== -1) {
        return true;
      }
    }
    return false;
  }

  function markRow(row) {
    if (!row || row.hasAttribute(MARK)) return;
    row.setAttribute(MARK, '1');
  }

  function applyHero() {
    if (!HERO_ENABLED) return;
    if (!isHome()) return;
    if (document.querySelector('.nf-hero')) return; // already set

    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      // Skip cards that are already inside a hero (no-op) or are tiny
      // (e.g. cast avatars) — require a visible image container.
      if (!c.querySelector('.cardImageContainer')) continue;
      var rect = c.getBoundingClientRect();
      if (rect.width < 180 || rect.height < 120) continue;

      c.classList.add('nf-hero');
      markRow(c.closest('.itemsContainer'));
      break;
    }
  }

  function applyRows() {
    var rows = document.querySelectorAll('.itemsContainer');
    for (var i = 0; i < rows.length; i++) {
      markRow(rows[i]);
    }
  }

  var observer = new MutationObserver(function () {
    applyRows();
    applyHero();
  });

  function start() {
    applyRows();
    applyHero();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
