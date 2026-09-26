// Empty board: for when no web page is open (or on pages where Chrome doesn't allow extensions).
// Picking works through the bubble, just like on any other page.
// With ?welkom=1 (first install) it doubles as the welcome page: it points at the bubble and the toolbar pin.
const hint = document.getElementById('hint');
const params = new URLSearchParams(location.search);
const welcome = params.has('welkom');
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

const first = params.get('show');
if (first) show(first);
else if (!welcome) setTimeout(() => PKOverlay.dock(true), 300); // panel open right away on an empty board
document.addEventListener('click', () => setTimeout(() => { if (PKOverlay.open().length) hint.style.display = 'none'; }), true);

// ---------- Welcome ----------
if (welcome) {
  document.body.classList.add('welkom');
  const coach = document.getElementById('coachBubble');
  const pin = document.getElementById('coachPin');
  const step = n => document.getElementById('s' + n);
  let pinned = false;

  // Keep the pointer next to the bubble (it can be dragged), and follow the teacher's progress
  const tick = () => {
    const r = PKOverlay.bubbleRect && PKOverlay.bubbleRect();
    const open = PKOverlay.panelOpen && PKOverlay.panelOpen();
    const cards = PKOverlay.open().length;
    if (open) step(1).classList.add('done');
    if (cards) { step(1).classList.add('done'); step(2).classList.add('done'); }
    if (r && !open) {
      coach.classList.add('on');
      const w = coach.offsetWidth, h = coach.offsetHeight;
      const leftSide = r.left + r.width / 2 > innerWidth / 2;
      coach.classList.toggle('right', leftSide);
      coach.classList.toggle('left', !leftSide);
      coach.style.left = (leftSide ? r.left - w - 24 : r.right + 24) + 'px';
      coach.style.top = Math.max(12, r.top + r.height / 2 - h / 2) + 'px';
      coach.innerHTML = step(1).classList.contains('done')
        ? 'Klik op de <b>bubbel</b> als je weer een pictogram of zin nodig hebt. Met <b>✎ Aanpassen</b> kies je je pictogrammen, talen en stem.'
        : 'Dit is je <b>PictoClass-bubbel</b>. Klik erop om te beginnen. Je kunt hem ook verslepen.';
      coach.classList.toggle('pulse', !step(1).classList.contains('done'));
    } else {
      coach.classList.remove('on');
    }
    pin.classList.toggle('on', !pinned);
    pin.style.right = '18px';
    pin.style.top = '14px';
  };
  setInterval(tick, 250);

  // Hide the pin tip once PictoClass is on the toolbar (Chrome can't pin an extension by itself)
  const checkPin = () => chrome.runtime.sendMessage({ type: 'pinned' }).then(r => { pinned = r && r.result === true; }).catch(() => {});
  checkPin();
  setInterval(checkPin, 2000);
}
