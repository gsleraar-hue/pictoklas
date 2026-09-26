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
    const nlText = words[p.id] && words[p.id].nl && words[p.id].nl.text;
    const dots = el('div', { className: 'dots' });
    for (const code of ['nl', ...settings.langs]) {
      const w = words[p.id] && words[p.id][code];
      dots.append(el('i', { className: w && w.audio ? 'a' : (w && w.text && code !== 'nl') ? 'w' : '' }));
    }
    const b = el('button', { className: 'tile' + (p.id === selected ? ' sel' : ''), title: p.label },
      ic, el('div', { className: 'lb', textContent: nlText || p.label }), dots);
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
  const w = (words[p.id] && words[p.id][code]) || {};
  const isNl = code === 'nl';

  const input = el('input', { type: 'text', value: isNl ? (w.text || p.label) : (w.text || ''), placeholder: isNl ? p.label : 'woord in het ' + L.name });
  input.dir = 'auto';
  input.oninput = () => {
    const v = input.value.trim();
    updateWord(p.id, code, e => {
      e.text = isNl && v === p.label ? '' : v;
      delete e.auto; delete e.soundTried;
      // An automatically found pronunciation belonged to the old word: look it up again
      if (e.autoAudio) { delete e.audio; delete e.src; delete e.autoAudio; }
    });
  };
  const st = el('span', { className: 'st' + (w.audio ? ' ok' : '') });
  st.textContent = (w.audio ? (w.src === 'mic' ? '✓ eigen opname' : w.autoAudio ? '✓ uitspraak (computerstem)' : '✓ uitspraak opgeslagen')
    : w.soundTried ? 'geen computerstem voor deze taal – neem het woord zelf op met ●' : 'nog geen uitspraak (wordt opgezocht zodra het pictogram in beeld komt)')
    + (w.auto ? ' · woord automatisch vertaald' : '');

  const act = el('td', { className: 'act' });
  if (!isNl) {
    const gt = el('a', { className: 'link', textContent: 'Vertaal', title: 'Open Google Translate', href: '#' });
    gt.onclick = e => {
      e.preventDefault();
      const nlWord = (words[p.id] && words[p.id].nl && words[p.id].nl.text) || p.label;
      chrome.tabs.create({ url: 'https://translate.google.com/?sl=nl&tl=' + L.gt + '&text=' + encodeURIComponent(nlWord.toLowerCase()) + '&op=translate' });
    };
    act.append(gt);
  }
  const recBtn = el('button', { className: 'icon-btn rec', title: 'Zelf opnemen (klik nog eens om te stoppen)', textContent: '●' });
  recBtn.onclick = () => toggleRecording(p, code, recBtn, st);
  act.append(recBtn);
  if (w.audio) {
    const pl = el('button', { className: 'icon-btn play', title: 'Afspelen', textContent: '▶' });
    pl.onclick = () => playSrc(w.audio);
    const del = el('button', { className: 'icon-btn del', title: 'Uitspraak wissen', textContent: '×' });
    del.onclick = () => updateWord(p.id, code, e => { delete e.audio; delete e.src; delete e.autoAudio; e.soundTried = Date.now(); });
    act.append(pl, del);
  }

  const tr = el('tr', null,
    el('td', { className: 'name' }, L.name, isNl ? el('small', { textContent: 'tekst op het pictogram' }) : null),
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
    st.textContent = 'Geen toegang tot de microfoon. Sta de microfoon toe via het slotje of camera-icoon in de adresbalk en probeer het opnieuw.';
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
    if (blob.size < 800) { st.textContent = 'De opname was leeg. Probeer het nog eens.'; return; }
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
  st.textContent = 'Opnemen… zeg het woord en klik op ■ (stopt vanzelf na ' + MAX_REC_MS / 1000 + ' seconden)';
}

function renderDetail() {
  const p = PK.picto(selected);
  const box = $('detail');
  box.textContent = '';
  const big = el('div', { className: 'big' }, PK.icon(p.id));
  big.style.background = p.color;
  const show = el('button', { className: 'pill primary', textContent: 'Toon op bord' });
  show.onclick = () => chrome.tabs.create({ url: 'bord.html?show=' + p.id });
  box.append(el('div', { className: 'head' }, big,
    el('div', { style: 'flex:1' }, el('h2', { textContent: p.label, style: 'margin:0 0 2px;font-size:20px' }),
      el('div', { className: 'muted', textContent: settings.langs.length ? settings.langs.length + ' klastaal/-talen' : 'Nog geen talen: kies ze in de bubbel via ✎ Aanpassen, of op een kaart.' })),
    show));

  // Look up missing words/pronunciations right away (once per pictogram + languages)
  const key = p.id + ':' + settings.langs.join(',');
  if (resolved !== key) {
    resolved = key;
    chrome.runtime.sendMessage({ type: 'resolve', picto: p.id, langs: settings.langs }).catch(() => {});
  }

  const table = el('table');
  for (const code of ['nl', ...settings.langs]) table.append(langRow(p, code));
  box.append(table);
  box.append(el('div', { className: 'tip' },
    'Woorden en uitspraak worden automatisch opgezocht. Klopt een woord niet? Typ het goede woord; de uitspraak wordt dan opnieuw opgezocht. Geen stem voor een taal, of klinkt het niet goed? Klik op ● en laat een leerling of collega het woord inspreken. Wat je zelf invult of opneemt, wordt nooit automatisch overschreven.'));
}

// ---------- Export / import ----------
$('export').onclick = async () => {
  const d = await chrome.storage.local.get(['words', 'settings']);
  const blob = new Blob([JSON.stringify({ app: 'pictoklas', version: 1, ...d }, null, 1)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(blob), download: 'pictoclass-woorden.json' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};
$('importFile').onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!['pictoklas', 'pictoclass'].includes(d.app) || typeof d.words !== 'object') throw new Error('geen PictoClass-bestand');
    // Merge: imported words win, own words that aren't in the file are kept
    for (const id in d.words) {
      if (!PK.picto(id)) continue;
      words[id] = Object.assign(words[id] || {}, d.words[id]);
    }
    const langs = (d.settings && d.settings.langs) || [];
    settings.langs = [...settings.langs, ...langs.filter(c => PK.lang(c) && !settings.langs.includes(c))];
    await chrome.storage.local.set({ words, settings });
    $('io').textContent = '✓ Geïmporteerd.';
    renderGrid(); renderDetail();
  } catch (err) {
    $('io').textContent = 'Importeren mislukt: ' + err.message;
  }
  e.target.value = '';
};

$('shortcuts').onclick = () => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });


// Show spoken versions that come in right away
chrome.storage.onChanged.addListener((ch, area) => {
  if (area !== 'local' || !(ch.words || ch.settings)) return;
  if (ch.words) words = ch.words.newValue || {};
  if (ch.settings) settings = Object.assign({ langs: [] }, ch.settings.newValue);
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

document.getElementById('ver').textContent = 'versie ' + chrome.runtime.getManifest().version;
