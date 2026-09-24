// Empty board: for when no web page is open (or on pages where Chrome doesn't allow extensions).
// Picking works through the bubble, just like on any other page.
const hint = document.getElementById('hint');
let myTab = null;
chrome.tabs.getCurrent(t => { myTab = t && t.id; });

function show(id) {
  PKOverlay.show(id);
  hint.style.display = 'none';
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || sender.id !== chrome.runtime.id || msg.tabId !== myTab) return;
  if (msg.type === 'bord-show') { show(msg.picto); reply({ ok: true }); }
  if (msg.type === 'bord-clear') { PKOverlay.clear(); reply({ ok: true }); }
  if (msg.type === 'bord-ping') { PKOverlay.dock(true); reply({ ok: true }); }
});

const first = new URLSearchParams(location.search).get('show');
if (first) show(first);
else setTimeout(() => PKOverlay.dock(true, new URLSearchParams(location.search).has('setup')), 300); // panel open right away; first run starts in edit mode
document.addEventListener('click', () => setTimeout(() => { if (PKOverlay.open().length) hint.style.display = 'none'; }), true);
