// Website: the live demo in the hero (works like the extension) and the pictogram showcase.
// Dutch or English: ?lang=nl|en wins, otherwise the browser language decides (like the extension itself).

// ---------- Language ----------
const EN = {
  title: 'PictoClass – every instruction, also in the home language',
  description: 'Free Chrome extension for classes with newcomer students: large pictograms on any web page, with the student’s home language next to English.',
  navWhy: 'Why', navPictos: 'Pictograms', navInstall: 'Install', addLong: 'Add to Chrome', addShort: 'Install',
  eyebrow: 'Free Chrome extension for classes with newcomer students',
  h1: 'Every instruction, also in the <em>home language</em>',
  heroSub: 'With one click, PictoClass puts a large pictogram over your lesson: listen, be quiet, work together. With the word in your student’s language next to English. First their own language, then the English instruction.',
  addFree: 'Add to Chrome, free', seePictos: 'See the pictograms',
  mPictos: 'pictograms', mLangs: 'languages', mAccounts: 'accounts needed', mClick: 'click on the bubble',
  url: 'My lesson · The weather', slideH: 'The weather', slideP: 'Look at the photo. What is the weather like today?',
  slideUl: '<li>the sun is shining</li><li>it is raining</li><li>it is windy</li>',
  try: 'Try it: click the bubble',
  whyEyebrow: 'Why PictoClass', whyH: 'Made for the class where not everyone speaks the language yet',
  whySub: 'No separate app, no preparation. Just on top of the lesson you already teach.',
  w1h: 'Home language next to English', w1p: 'Every card shows the word in your student’s language and in English. One click and you hear them one after the other.',
  w2h: 'Always at hand', w2p: 'The bubble floats over every website: your lesson material, a presentation, a video. Drag it wherever you like.',
  w3h: 'Type your own sentence', w3p: '"Take off your coat." Type it in the bubble and PictoClass says it right away, in the home language and in English.',
  w4h: 'Your voice, your class', w4p: 'Choose a male or female voice. Or let a student record a word in their own language.',
  allEyebrow: 'All 25 pictograms', allH: 'The instructions you give every lesson', allSub: 'Choose which ones you want in your bubble.',
  insEyebrow: 'Install', insH: 'Ready for your lesson in a minute',
  s1: 'Click <strong>Add to Chrome</strong>', s2: 'Confirm in the Chrome window', s3: 'Click the <strong>blue bubble</strong> and start',
  browsers: 'Works in Chrome and Edge.', shotAlt: 'PictoClass cards on a lesson page',
  choose: 'choose a pictogram', play: 'Play', pair: 'First the home language, then English', bubble: 'PictoClass bubble', other: 'Nederlands'
};
const NL = {
  title: document.title, description: document.querySelector('meta[name=description]').content,
  choose: 'kies een pictogram', play: 'Afspelen', pair: 'Eerst moedertaal, dan Nederlands', bubble: 'PictoClass-bubbel', other: 'English'
};
for (const e of document.querySelectorAll('[data-s]')) NL[e.dataset.s] = e.innerHTML;
for (const e of document.querySelectorAll('[data-s-alt]')) NL[e.dataset.sAlt] = e.alt;
const B = PK.setBase(new URLSearchParams(location.search).get('lang'));
const S = B === 'en' ? EN : NL;
document.documentElement.lang = B;
document.title = S.title;
document.querySelector('meta[name=description]').content = S.description;
for (const e of document.querySelectorAll('[data-s]')) e.innerHTML = S[e.dataset.s];
for (const e of document.querySelectorAll('[data-s-alt]')) e.alt = S[e.dataset.sAlt];
const sw = document.getElementById('switchLang');
sw.textContent = S.other;
sw.href = '?lang=' + (B === 'en' ? 'nl' : 'en');
sw.hreflang = B === 'en' ? 'nl' : 'en';
const BCP = B === 'en' ? 'en-GB' : 'nl-NL';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const playIcon = n => {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  for (let i = 0; i < n; i++) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', n === 1 ? 'M7 4.5v15l13-7.5z' : (i ? 'M13 5v14l10-7z' : 'M2 5v14l10-7z'));
    p.setAttribute('fill', '#fff');
    s.appendChild(p);
  }
  return s;
};

// ---------- Showcase: all pictograms ----------
const tiles = document.getElementById('tiles');
for (const p of PK.PICTOS) {
  const t = el('div', 'tile');
  const ic = el('span', 'ic');
  ic.style.background = p.color;
  ic.appendChild(PK.icon(p.id));
  t.append(ic, el('b', null, PK.label(p.id)));
  tiles.appendChild(t);
}

// ---------- Live demo ----------
// Words for the demo (the extension looks these up by itself)
const DEMO = {
  luisteren: { ar: 'استمع', uk: 'слухати', ti: 'ስምዑ', tr: 'dinlemek' },
  kijken: { ar: 'انظر', uk: 'дивитися', ti: 'ርኣዩ', tr: 'bakmak' },
  stil: { ar: 'كن هادئا', uk: 'тихо', ti: 'ስቕ በል', tr: 'sessiz ol' },
  vinger: { ar: 'ارفع يدك', uk: 'підніми руку', ti: 'ኢድካ ኣልዕል', tr: 'elini kaldır' },
  samenwerken: { ar: 'العمل معا', uk: 'працюйте разом', ti: 'ብሓባር ይሰርሑ', tr: 'birlikte çalışın' },
  lezen: { ar: 'اقرأ', uk: 'читати', ti: 'ኣንብብ', tr: 'okumak' },
  schrijven: { ar: 'اكتب', uk: 'писати', ti: 'ጽሓፍ', tr: 'yazmak' },
  klaar: { ar: 'انتهى', uk: 'готово', ti: 'ተወዲኡ', tr: 'bitti' }
};
const LANGS = [['ar', 'ar-SA'], ['uk', 'uk-UA'], ['ti', 'ti-ER'], ['tr', 'tr-TR']].map(([c, bcp]) => [c, PK.langName(c), bcp]);
const demo = document.getElementById('demo');
const hint = document.getElementById('tryHint');
let lang = 'ar';
let card = null;
let current = null;

// Speak with the browser's own voices, if it has one for the language
function say(text, bcp) {
  return new Promise(done => {
    if (!('speechSynthesis' in window)) return done(false);
    const code = bcp.split('-')[0];
    const v = speechSynthesis.getVoices().find(x => x.lang && (x.lang === bcp || x.lang.startsWith(code)));
    if (!v) return done(false);
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = .85;
    u.onend = u.onerror = () => done(true);
    speechSynthesis.speak(u);
    setTimeout(() => done(true), 6000);
  });
}
async function playSeq(btn, items) {
  btn.classList.add('on');
  speechSynthesis && speechSynthesis.cancel();
  for (const [text, bcp] of items) { await say(text, bcp); await new Promise(r => setTimeout(r, 250)); }
  btn.classList.remove('on');
}

function playBtn(color, items) {
  const b = el('button', 'play');
  b.style.background = color;
  b.setAttribute('aria-label', S.play);
  b.appendChild(playIcon(1));
  b.addEventListener('click', e => { e.stopPropagation(); playSeq(b, items); });
  return b;
}

function renderCard() {
  if (!current) return;
  const p = PK.picto(current);
  const [code, , bcp] = LANGS.find(l => l[0] === lang);
  const word = DEMO[current][code];
  const nlWord = PK.label(current).toLowerCase();
  if (!card) {
    card = el('div', 'd-card');
    demo.appendChild(card);
    dragCard(card);
  }
  card.textContent = '';
  const ic = el('div', 'ic');
  ic.style.background = p.color;
  ic.appendChild(PK.icon(current));
  const title = el('div', 'title', PK.label(current));
  title.appendChild(playBtn('#111827', [[nlWord, BCP]]));
  const row = el('div', 'd-row');
  const own = el('div', 'd-half');
  const t1 = el('div', 'd-txt');
  const w = el('span', null, word);
  w.dir = 'auto';
  t1.append(el('small', null, code.toUpperCase()), w);
  own.append(t1, playBtn(p.color, [[word, bcp]]));
  const nl = el('div', 'd-half nlh');
  const t2 = el('div', 'd-txt');
  t2.append(el('small', null, B.toUpperCase()), el('span', null, nlWord));
  nl.appendChild(t2);
  const pair = el('button', 'pair');
  pair.setAttribute('aria-label', S.pair);
  pair.appendChild(playIcon(2));
  pair.addEventListener('click', e => { e.stopPropagation(); playSeq(pair, [[word, bcp], [nlWord, BCP]]); });
  row.append(own, nl, pair);
  card.append(ic, title, row);
}

function dragCard(c) {
  c.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    const sx = e.clientX, sy = e.clientY, ox = c.offsetLeft, oy = c.offsetTop;
    c.setPointerCapture(e.pointerId);
    c.classList.add('drag');
    const move = ev => {
      c.style.left = Math.max(0, Math.min(ox + ev.clientX - sx, demo.clientWidth - c.offsetWidth)) + 'px';
      c.style.top = Math.max(0, Math.min(oy + ev.clientY - sy, demo.clientHeight - 80)) + 'px';
    };
    const up = () => { c.classList.remove('drag'); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', up); };
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
  });
}

// Bubble + panel
const bubble = el('button', 'd-bubble');
bubble.setAttribute('aria-label', S.bubble);
bubble.appendChild(PK.icon('bord'));
const panel = el('div', 'd-panel');
const head = el('div', 'ph', 'PictoClass');
head.appendChild(el('span', null, S.choose));
const grid = el('div', 'd-grid');
for (const id of Object.keys(DEMO)) {
  const p = PK.picto(id);
  const b = el('button', 'd-tile');
  const ic = el('span', 'ic');
  ic.style.background = p.color;
  ic.appendChild(PK.icon(id));
  b.append(ic, el('span', null, PK.label(id)));
  b.addEventListener('click', () => { current = id; renderCard(); panel.classList.remove('open'); });
  grid.appendChild(b);
}
const chips = el('div', 'd-langs');
const renderChips = () => {
  chips.textContent = '';
  for (const [code, name] of LANGS) {
    const c = el('button', 'chip' + (code === lang ? ' on' : ''), name);
    c.addEventListener('click', () => { lang = code; renderChips(); renderCard(); });
    chips.appendChild(c);
  }
};
renderChips();
panel.append(head, grid, chips);
bubble.addEventListener('click', () => { panel.classList.toggle('open'); hint.style.display = 'none'; });
demo.append(panel, bubble);

// Start with one card on the slide so the demo is never empty
current = 'luisteren';
renderCard();
if ('speechSynthesis' in window) speechSynthesis.getVoices();

// ---------- Why cards: real pictograms as icons ----------
for (const s of document.querySelectorAll('.ico[data-icon]')) {
  const p = PK.picto(s.dataset.icon);
  if (!p) continue;
  s.style.background = p.color;
  s.appendChild(PK.icon(p.id));
}
