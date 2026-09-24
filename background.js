// PictoClass service worker: puts pictograms on the tab, stores and plays pronunciations.
importScripts('picto.js', 'auto.js');

const BORD = chrome.runtime.getURL('bord.html');

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function ensureOverlay(tabId) {
  try {
    const r = await chrome.tabs.sendMessage(tabId, { type: 'pk-ping' });
    if (r && r.ok) return;
  } catch (e) { /* not injected yet */ }
  await chrome.scripting.executeScript({ target: { tabId }, files: ['picto.js', 'overlay.js'] });
}

// Returns where the pictogram ended up: 'tab', 'bord' (the board page) or 'nieuw-bord' (a new board)
async function showPicto(picto, givenTab) {
  const tab = givenTab || await activeTab();
  if (tab) {
    // Our own board (an extension page) gets the message directly
    try {
      const r = await chrome.runtime.sendMessage({ type: 'bord-show', picto, tabId: tab.id });
      if (r && r.ok) return 'bord';
    } catch (e) { /* no board open */ }
    try {
      await ensureOverlay(tab.id);
      await chrome.tabs.sendMessage(tab.id, { type: 'pk-show', picto });
      return 'tab';
    } catch (e) { /* chrome:// page, Web Store, PDF viewer, etc. */ }
  }
  await chrome.tabs.create({ url: BORD + '?show=' + encodeURIComponent(picto) });
  return 'nieuw-bord';
}

// Show and open the bubble on the page; if that isn't possible, open the empty board
async function openDock(givenTab) {
  const tab = givenTab || await activeTab();
  if (tab) {
    try {
      const r = await chrome.runtime.sendMessage({ type: 'bord-ping', tabId: tab.id });
      if (r && r.ok) return 'bord';
    } catch (e) { /* no board */ }
    try {
      await ensureOverlay(tab.id);
      await chrome.tabs.sendMessage(tab.id, { type: 'pk-dock' });
      return 'tab';
    } catch (e) { /* page does not allow extensions */ }
  }
  await chrome.tabs.create({ url: BORD });
  return 'nieuw-bord';
}

// ---------- Bubble on every page (optional permission, switched on from the bubble) ----------
const ALL_SITES = ['https://*/*', 'http://*/*'];

async function syncBubble() {
  const has = await chrome.permissions.contains({ origins: ALL_SITES });
  const regs = await chrome.scripting.getRegisteredContentScripts({ ids: ['pk-bubble'] });
  if (has && !regs.length) {
    await chrome.scripting.registerContentScripts([{
      id: 'pk-bubble', matches: ALL_SITES, js: ['picto.js', 'overlay.js'], runAt: 'document_idle', persistAcrossSessions: true
    }]);
    // Show it right away in tabs that are already open
    for (const tab of await chrome.tabs.query({ url: ALL_SITES })) ensureOverlay(tab.id).catch(() => {});
  } else if (!has && regs.length) {
    await chrome.scripting.unregisterContentScripts({ ids: ['pk-bubble'] });
  }
  // Let open bubbles update their switch
  for (const tab of await chrome.tabs.query({})) chrome.tabs.sendMessage(tab.id, { type: 'pk-bubble-state', on: has }).catch(() => {});
  return has;
}
chrome.permissions.onAdded.addListener(() => syncBubble());
chrome.permissions.onRemoved.addListener(() => syncBubble());
chrome.runtime.onStartup.addListener(() => syncBubble());

// ---------- Context menu ----------
async function buildMenu() {
  const { settings = {} } = await chrome.storage.local.get('settings');
  chrome.contextMenus.removeAll(() => {
    const contexts = ['page', 'selection', 'link', 'image', 'editable', 'frame', 'video'];
    chrome.contextMenus.create({ id: 'pk', title: 'PictoClass', contexts });
    chrome.contextMenus.create({ id: 'pk-dock', parentId: 'pk', title: 'Bubbel tonen', contexts });
    chrome.contextMenus.create({ id: 'pk-sep1', parentId: 'pk', type: 'separator', contexts });
    for (const p of PK.chosen(settings)) chrome.contextMenus.create({ id: 'pk-show:' + p.id, parentId: 'pk', title: p.label, contexts });
    chrome.contextMenus.create({ id: 'pk-sep2', parentId: 'pk', type: 'separator', contexts });
    chrome.contextMenus.create({ id: 'pk-clear', parentId: 'pk', title: 'Alles weghalen', contexts });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const id = String(info.menuItemId);
  if (id === 'pk-dock') openDock(tab);
  else if (id === 'pk-clear') clearAll(tab);
  else if (id.startsWith('pk-show:')) showPicto(id.slice(8), tab);
});

async function clearAll(givenTab) {
  const tab = givenTab || await activeTab();
  if (!tab) return;
  chrome.runtime.sendMessage({ type: 'bord-clear', tabId: tab.id }).catch(() => {});
  chrome.tabs.sendMessage(tab.id, { type: 'pk-clear' }).catch(() => {});
}

// ---------- Sound ----------

async function ensureOffscreen() {
  const ctx = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (ctx.length) return;
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Uitspraak van pictogramwoorden afspelen'
    });
  } catch (e) {
    if (!String(e).includes('single offscreen')) throw e;
  }
}

// Languages the computer has a voice for (e.g. 'nl-NL', 'ar-SA')
async function voiceLangs() {
  const v = await chrome.tts.getVoices();
  return [...new Set(v.map(x => x.lang).filter(Boolean))];
}

function speak(text, lang) {
  return new Promise(done => {
    const t = setTimeout(done, 10000);
    chrome.tts.speak(text, {
      lang, rate: 0.85,
      onEvent: e => { if (['end', 'interrupted', 'cancelled', 'error'].includes(e.type)) { clearTimeout(t); done(); } }
    });
  });
}

let playRun = 0;

// seq: language codes in playback order (repeats allowed, e.g. ['ar','nl','uk','nl']).
// Uses the stored recording when there is one, otherwise the computer voice for that language.
async function play(picto, seq) {
  const { words = {} } = await chrome.storage.local.get('words');
  const w = words[picto] || {};
  const order = Array.isArray(seq) && seq.length ? seq : ['nl'];
  const langs = await voiceLangs();
  const label = (w.nl && w.nl.text) || (PK.picto(picto) || {}).label || '';
  const items = [];
  for (const c of order) {
    if (w[c] && w[c].audio) { items.push({ audio: w[c].audio }); continue; }
    const text = c === 'nl' ? label.toLowerCase() : (w[c] && w[c].text) || '';
    const voice = langs.find(l => l === c || l.startsWith(c + '-'));
    if (text && voice) items.push({ text, lang: voice });
  }
  if (!items.length) return false;

  const mine = ++playRun;
  chrome.tts.stop();
  if (items.some(i => i.audio)) await ensureOffscreen();
  (async () => {
    for (const it of items) {
      if (mine !== playRun) return;
      if (it.audio) await chrome.runtime.sendMessage({ target: 'offscreen', type: 'play', list: [it.audio] }).catch(() => {});
      else await speak(it.text, it.lang);
      await new Promise(r => setTimeout(r, 300));
    }
  })();
  return true;
}

// ---------- Helpers ----------

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Word editor, optionally opened on one pictogram and language (e.g. to record it)
async function openOptions(picto, lang) {
  if (!picto) return chrome.runtime.openOptionsPage();
  const url = chrome.runtime.getURL('options.html') + '#' + new URLSearchParams({ picto, lang: lang || '' });
  const [open] = await chrome.tabs.query({ url: chrome.runtime.getURL('options.html') + '*' });
  if (open) { await chrome.tabs.update(open.id, { url, active: true }); await chrome.tabs.reload(open.id); }
  else await chrome.tabs.create({ url });
}

// ---------- Messages ----------

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || msg.target === 'offscreen' || sender.id !== chrome.runtime.id) return;
  const run = {
    show: () => showPicto(msg.picto),
    dock: () => openDock(),
    clear: () => clearAll(),
    play: () => play(msg.picto, msg.seq),
    voices: () => voiceLangs(),
    resolve: () => resolvePicto(msg.picto, msg.langs),
    options: () => openOptions(msg.picto, msg.lang),
    'bubble-sync': () => syncBubble(),
    'bubble-state': () => chrome.permissions.contains({ origins: ALL_SITES }),
    // A permission prompt needs a user click on an extension page: open a small window for it
    'bubble-grant': () => chrome.windows.create({ url: 'grant.html', type: 'popup', width: 460, height: 330, focused: true }),
    'bubble-revoke': async () => { await chrome.permissions.remove({ origins: ALL_SITES }); return syncBubble(); }
  }[msg.type];
  if (!run) return;
  run().then(r => reply({ ok: true, result: r }), e => reply({ ok: false, error: String(e && e.message || e) }));
  return true;
});

chrome.commands.onCommand.addListener((cmd, tab) => {
  if (cmd === 'clear-all') clearAll(tab);
  if (cmd === 'open-dock') openDock(tab);
});

// The menu follows the chosen pictograms
chrome.storage.onChanged.addListener((ch, area) => {
  if (area !== 'local' || !ch.settings) return;
  const a = (ch.settings.oldValue || {}).pictos, b = (ch.settings.newValue || {}).pictos;
  if (JSON.stringify(a) !== JSON.stringify(b)) buildMenu();
});

// Clean up data stored by versions before 1.8.0: drop speaker names and source links
// of old third-party recordings (the recordings themselves are kept), and the old search state.
async function cleanOldData() {
  await mutateWords(words => {
    for (const id in words) for (const code in words[id]) {
      const e = words[id][code];
      if (!e) continue;
      delete e.by;
      if (e.src && e.src !== 'mic' && e.src !== 'google') delete e.src;
    }
  });
  await chrome.storage.local.remove('pending');
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  buildMenu();
  syncBubble();
  if (reason === 'update') cleanOldData().catch(() => {});
  if (reason === 'install') {
    const { settings } = await chrome.storage.local.get('settings');
    if (!settings) await chrome.storage.local.set({ settings: { langs: [] } });
    // First run: the empty board with the bubble open in edit mode
    chrome.tabs.create({ url: BORD + '?setup=1' });
  }
});
