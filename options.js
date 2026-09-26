let words = {};
let settings = { langs: [] };
let selected = PK.PICTOS[0].id;
let audio = null;
let resolved = '';

const $ = id => document.getElementById(id);
const el = (tag, props, ...kids) => {
  const e = document.createElement(tag);
  Object.assign(e, props || {});
  for (const k of kids) if (k != null) e.append(k);
  return e;
};

async function load() {
  const d = await chrome.storage.local.get(['words', 'settings']);
  words = d.words || {};
  settings = Object.assign({ langs: [] }, d.settings);
  applyBase();
}

// Language of PictoClass: interface texts and the instruction language (first row, text on the pictogram)
let B = PK.base();
function applyBase() {
  B = PK.setBase(PK.baseOf(settings));
  settings.langs = settings.langs.filter(c => c !== B);
  PK.applyI18n();
  document.title = PK.t('optTitle');
  $('ver').textContent = PK.t('version', { v: chrome.runtime.getManifest().version });
}

// Always read-modify-write, so a spoken version that just came in is not overwritten
let queue = Promise.resolve();
function updateWord(id, code, fn) {
  queue = queue.then(async () => {
    const d = await chrome.storage.local.get('words');
    const all = d.words || {};
    all[id] = all[id] || {};
    all[id][code] = all[id][code] || { text: '' };
    fn(all[id][code]);
    words = all;
    await chrome.storage.local.set({ words: all });
  });
  return queue;
}

// ---------- Grid ----------
function renderGrid() {
  const box = $('grid');
  box.textContent = '';
  for (const p of PK.PICTOS) {
    const ic = el('div', { className: 'ic' }, PK.icon(p.id));
    ic.style.background = p.color;
    const own = words[p.id] && words[p.id][B] && words[p.id][B].text;
    const dots = el('div', { className: 'dots' });
    for (const code of [B, ...settings.langs]) {
      const w = words[p.id] && words[p.id][code];
      dots.append(el('i', { className: w && w.audio ? 'a' : (w && w.text && code !== B) ? 'w' : '' }));
    }
    const b = el('button', { className: 'tile' + (p.id === selected ? ' sel' : ''), title: PK.label(p.id) },
      ic, el('div', { className: 'lb', textContent: own || PK.label(p.id) }), dots);
    b.onclick = () => { selected = p.id; renderGrid(); renderDetail(); };
    box.append(b);
  }
}

// ---------- Detail ----------
function playSrc(src) {
  if (audio) audio.pause();
  audio = new Audio(src);
  audio.play();
}

function langRow(p, code) {
  const L = PK.lang(code);
  const name = PK.langName(code);
  const w = (words[p.id] && words[p.id][code]) || {};
  const isBase = code === B;
  const def = PK.label(p.id);

  const input = el('input', { type: 'text', value: isBase ? (w.text || def) : (w.text || ''), placeholder: isBase ? def : PK.t('wordIn', { lang: name }) });
  input.dir = 'auto';
  input.oninput = () => {
    const v = input.value.trim();
    updateWord(p.id, code, e => {
      e.text = isBase && v === def ? '' : v;
      delete e.auto; delete e.soundTried;
      // An automatically found pronunciation belonged to the old word: look it up again
      if (e.autoAudio) { delete e.audio; delete e.src; delete e.autoAudio; }
    });
  };
  const st = el('span', { className: 'st' + (w.audio ? ' ok' : '') });
  st.textContent = PK.t(w.audio ? (w.src === 'mic' ? 'stMic' : w.autoAudio ? 'stVoice' : 'stSaved') : w.soundTried ? 'stNoVoice' : 'stNotYet')
    + (w.auto ? PK.t('stAuto') : '');

  const act = el('td', { className: 'act' });
  if (!isBase) {
    const gt = el('a', { className: 'link', textContent: PK.t('translate'), title: 'Open Google Translate', href: '#' });
    gt.onclick = e => {
      e.preventDefault();
      const baseWord = (words[p.id] && words[p.id][B] && words[p.id][B].text) || def;
      chrome.tabs.create({ url: 'https://translate.google.com/?sl=' + B + '&tl=' + L.gt + '&text=' + encodeURIComponent(baseWord.toLowerCase()) + '&op=translate' });
    };
    act.append(gt);
  }
  const recBtn = el('button', { className: 'icon-btn rec', title: PK.t('recordTitle'), textContent: '●' });
  recBtn.onclick = () => toggleRecording(p, code, recBtn, st);
  act.append(recBtn);
  if (w.audio) {
    const pl = el('button', { className: 'icon-btn play', title: PK.t('play'), textContent: '▶' });
    pl.onclick = () => playSrc(w.audio);
    const del = el('button', { className: 'icon-btn del', title: PK.t('clearSound'), textContent: '×' });
    del.onclick = () => updateWord(p.id, code, e => { delete e.audio; delete e.src; delete e.autoAudio; e.soundTried = Date.now(); });
    act.append(pl, del);
  }

  const tr = el('tr', null,
    el('td', { className: 'name' }, name, isBase ? el('small', { textContent: PK.t('textOnPicto') }) : null),
    el('td', { className: 'word' }, input, st),
    act);
  tr.dataset.code = code;
  return tr;
}

// ---------- Own recording ----------
// A student or colleague says the word once into the microphone; it is stored like any other pronunciation.
const MAX_REC_MS = 6000;
let rec = null; // { mr, stream, btn }

async function toggleRecording(p, code, btn, st) {
  if (rec) { const same = rec.btn === btn; rec.mr.stop(); if (same) return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    st.className = 'st';
    st.style.color = '#DC2626';
    st.textContent = PK.t('micDenied');
    return;
  }
  const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || '';
  const mr = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const chunks = [];
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  let timer = null;
  mr.onstop = () => {
    clearTimeout(timer);
    stream.getTracks().forEach(t => t.stop());
    btn.classList.remove('on');
    btn.textContent = '●';
    if (rec && rec.mr === mr) rec = null;
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
    if (blob.size < 800) { st.textContent = PK.t('recEmpty'); return; }
    const fr = new FileReader();
    fr.onload = () => updateWord(p.id, code, e => {
      Object.assign(e, { audio: fr.result, src: 'mic', saved: Date.now() });
      delete e.autoAudio; delete e.soundTried;
    });
    fr.readAsDataURL(blob);
  };
  timer = setTimeout(() => mr.state === 'recording' && mr.stop(), MAX_REC_MS);
  rec = { mr, stream, btn };
  mr.start();
  btn.classList.add('on');
  btn.textContent = '■';
  st.className = 'st';
  st.style.color = '#DC2626';
  st.textContent = PK.t('recording', { s: MAX_REC_MS / 1000 });
}

function renderDetail() {
  const p = PK.picto(selected);
  const box = $('detail');
  box.textContent = '';
  const big = el('div', { className: 'big' }, PK.icon(p.id));
  big.style.background = p.color;
  const show = el('button', { className: 'pill primary', textContent: PK.t('showOnBoard') });
  show.onclick = () => chrome.tabs.create({ url: 'bord.html?show=' + p.id });
  box.append(el('div', { className: 'head' }, big,
    el('div', { style: 'flex:1' }, el('h2', { textContent: PK.label(p.id), style: 'margin:0 0 2px;font-size:20px' }),
      el('div', { className: 'muted', textContent: settings.langs.length ? PK.t('nLangs', { n: settings.langs.length }) : PK.t('noLangsYet') })),
    show));

  // Look up missing words/pronunciations right away (once per pictogram + languages)
  const key = p.id + ':' + settings.langs.join(',');
  if (resolved !== key) {
    resolved = key;
    chrome.runtime.sendMessage({ type: 'resolve', picto: p.id, langs: settings.langs }).catch(() => {});
  }

  const table = el('table');
  for (const code of [B, ...settings.langs]) table.append(langRow(p, code));
  box.append(table);
  box.append(el('div', { className: 'tip' }, PK.t('optTip')));
}

// ---------- Export / import ----------
$('export').onclick = async () => {
  const d = await chrome.storage.local.get(['words', 'settings']);
  const blob = new Blob([JSON.stringify({ app: 'pictoklas', version: 1, ...d }, null, 1)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: PK.t('exportFile') });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};
$('importFile').onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!['pictoklas', 'pictoclass'].includes(d.app) || typeof d.words !== 'object') throw new Error(PK.t('notAFile'));
    // Merge: imported words win, own words that aren't in the file are kept
    for (const id in d.words) {
      if (!PK.picto(id)) continue;
      words[id] = Object.assign(words[id] || {}, d.words[id]);
    }
    const langs = (d.settings && d.settings.langs) || [];
    settings.langs = [...settings.langs, ...langs.filter(c => PK.lang(c) && !settings.langs.includes(c))];
    await chrome.storage.local.set({ words, settings });
    $('io').textContent = PK.t('imported');
    renderGrid(); renderDetail();
  } catch (err) {
    $('io').textContent = PK.t('importFailed', { err: err.message });
  }
  e.target.value = '';
};

$('shortcuts').onclick = () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });


// Show spoken versions that come in right away
chrome.storage.onChanged.addListener((ch, area) => {
  if (area !== 'local' || !(ch.words || ch.settings)) return;
  if (ch.words) words = ch.words.newValue || {};
  if (ch.settings) { settings = Object.assign({ langs: [] }, ch.settings.newValue); applyBase(); }
  renderGrid();
  // Don't rebuild the rows while typing or recording
  if (!rec && (!document.activeElement || !$('detail').contains(document.activeElement) || document.activeElement.tagName !== 'INPUT')) renderDetail();
});

// Deep link from a card: options.html#picto=vinger&lang=ti opens that pictogram and highlights the language row
const deep = new URLSearchParams(location.hash.slice(1));
if (PK.picto(deep.get('picto'))) selected = deep.get('picto');

load().then(() => {
  renderGrid();
  renderDetail();
  const row = PK.lang(deep.get('lang')) && document.querySelector('#detail tr[data-code="' + deep.get('lang') + '"]');
  if (row) { row.classList.add('focus'); row.scrollIntoView({ block: 'center' }); }
});

