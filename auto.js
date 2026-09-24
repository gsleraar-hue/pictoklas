// Auto-fill (service worker): look up the translation and a spoken version as soon as a pictogram is shown.
// Anything the teacher entered or picked by hand is never overwritten.

const DAY = 864e5;

// Run all writes to 'words' one after another so they never overwrite each other
let wordsQueue = Promise.resolve();
function mutateWords(fn) {
  const run = wordsQueue.then(async () => {
    const { words = {} } = await chrome.storage.local.get('words');
    const r = fn(words);
    await chrome.storage.local.set({ words });
    return r;
  });
  wordsQueue = run.catch(() => {});
  return run;
}

// ---------- Translation ----------

async function gtx(lines, sl, tl) {
  const u = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=' + sl + '&tl=' + tl
    + '&q=' + encodeURIComponent(lines.join('\n'));
  const r = await fetch(u, { credentials: 'omit' });
  if (!r.ok) throw new Error('vertaling ' + r.status);
  const j = await r.json();
  const out = j[0].map(x => x[0]).join('').split('\n').map(s => s.trim());
  if (out.length !== lines.length) throw new Error('vertaling: regels kloppen niet');
  return out;
}

async function mymemory(line, sl, tl) {
  const r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(line) + '&langpair=' + sl + '|' + tl, { credentials: 'omit' });
  if (!r.ok) return '';
  const j = await r.json();
  const t = String((j.responseData && j.responseData.translatedText) || '').split(/[;؛]/)[0].trim();
  return /MYMEMORY|INVALID|QUERY LENGTH/i.test(t) ? '' : t;
}

async function translateLines(lines, sl, tl) {
  try { return await gtx(lines, sl, tl); } catch (e) { /* fall through to the next service */ }
  const out = [];
  for (const l of lines) {
    let t = '';
    try { t = (await gtx([l], sl, tl))[0]; } catch (e) { t = await mymemory(l, sl, tl).catch(() => ''); }
    out.push(t);
  }
  return out;
}

// Fills in all missing words for one language in a single request
const textJobs = new Map();
function ensureTexts(code) {
  if (code === 'nl') return Promise.resolve();
  if (textJobs.has(code)) return textJobs.get(code);
  const job = (async () => {
    const L = PK.lang(code);
    if (!L) return;
    const { words = {} } = await chrome.storage.local.get('words');
    const fromEn = [], fromNl = [];
    for (const p of PK.PICTOS) {
      const w = words[p.id] || {};
      if (w[code] && w[code].text) continue;
      const own = w.nl && w.nl.text;
      (own ? fromNl : fromEn).push({ id: p.id, src: own || p.en });
    }
    const found = {};
    for (const [list, sl] of [[fromEn, 'en'], [fromNl, 'nl']]) {
      if (!list.length) continue;
      const res = await translateLines(list.map(x => x.src), sl, L.gt);
      // Drop a trailing full stop (such as '.' or Ethiopic '።'); '!' may stay
      list.forEach((x, i) => { const t = (res[i] || '').replace(/[.。።۔]+$/u, '').trim(); if (t) found[x.id] = t; });
    }
    if (!Object.keys(found).length) return;
    await mutateWords(words => {
      for (const id in found) {
        words[id] = words[id] || {};
        const e = words[id][code] = words[id][code] || {};
        if (!e.text) { e.text = found[id]; e.auto = true; }
      }
    });
  })().finally(() => setTimeout(() => textJobs.delete(code), 5000));
  textJobs.set(code, job);
  return job;
}

// ---------- Putting it together ----------

const resolveJobs = new Map();

// Makes sure this pictogram has a word and, where possible, a spoken version for these languages
async function resolvePicto(picto, codes) {
  const p = PK.picto(picto);
  if (!p) return false;
  codes = [...new Set(['nl', ...(codes || [])])].filter(c => PK.lang(c));
  await Promise.all(codes.map(c => ensureTexts(c).catch(() => {})));
  for (const code of codes) {
    const key = picto + ':' + code;
    if (!resolveJobs.has(key)) {
      resolveJobs.set(key, findRecording(p, code).catch(() => {}).finally(() => resolveJobs.delete(key)));
    }
  }
  await Promise.all(codes.map(c => resolveJobs.get(picto + ':' + c)));
  return true;
}

// Pronunciation from Google Translate (mp3). Not available for every language (e.g. Tigrinya, Somali, Persian, Pashto): then null.
async function googleSpeech(text, code) {
  const L = PK.lang(code);
  if (!L) return null;
  const u = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + encodeURIComponent(L.gt) + '&q=' + encodeURIComponent(text);
  const r = await fetch(u, { credentials: 'omit' });
  if (!r.ok || !(r.headers.get('content-type') || '').startsWith('audio/')) return null;
  const buf = await r.arrayBuffer();
  if (buf.byteLength < 500) return null;
  return 'data:audio/mpeg;base64,' + toBase64(buf);
}

// Order: the teacher's own recording (kept) -> Google speech (stored) -> (at playback) the computer voice
async function findRecording(p, code) {
  const { words = {} } = await chrome.storage.local.get('words');
  const w = (words[p.id] && words[p.id][code]) || {};
  if (w.audio) return;
  if (w.soundTried && Date.now() - w.soundTried < 3 * DAY) return;
  const text = code === 'nl' ? ((w.text) || p.label).toLowerCase() : w.text;
  if (!text) return;
  const audio = await googleSpeech(text, code).catch(() => null);
  if (!audio) {
    // No spoken version for this language: don't ask again every time
    await mutateWords(ws => { ws[p.id] = ws[p.id] || {}; (ws[p.id][code] = ws[p.id][code] || {}).soundTried = Date.now(); });
    return;
  }
  await mutateWords(ws => {
    ws[p.id] = ws[p.id] || {};
    const e = ws[p.id][code] = ws[p.id][code] || {};
    if (e.audio) return;
    Object.assign(e, { audio, src: 'google', autoAudio: true, saved: Date.now() });
    delete e.soundTried;
  });
}
