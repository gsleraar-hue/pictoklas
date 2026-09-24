// Layer with pictogram cards on top of the page. Injected when the teacher picks a pictogram (or on every page when the bubble is on).
(() => {
  if (globalThis.PKOverlay) return;
  const PK = globalThis.PK;

  let words = {};
  let settings = { langs: [] };
  const cards = new Map();
  let z = 1;
  let placed = 0;

  const CSS = `
    :host { all: initial; }
    .layer { position: fixed; inset: 0; pointer-events: none; font-family: "Segoe UI", system-ui, -apple-system, Arial, sans-serif; }
    .card { position: absolute; pointer-events: auto; background: #fff; border-radius: .6em; overflow: hidden;
      box-shadow: 0 .25em 1.2em rgba(0,0,0,.28), 0 0 0 .06em rgba(0,0,0,.08); color: #111827;
      touch-action: none; user-select: none; -webkit-user-select: none; cursor: grab; animation: pop .18s ease-out; }
    .card.drag { cursor: grabbing; box-shadow: 0 .5em 2em rgba(0,0,0,.35); }
    .card.flash { animation: flash .5s ease-out; }
    @keyframes pop { from { transform: scale(.85); opacity: 0 } to { transform: none; opacity: 1 } }
    @keyframes flash { 0%,100% { transform: none } 40% { transform: scale(1.06) } }
    .icon { display: flex; align-items: center; justify-content: center; padding: .7em 0; cursor: pointer; position: relative; }
    .icon svg { width: 5.6em; height: 5.6em; display: block; }
    .nl { font-weight: 800; font-size: 1.5em; line-height: 1.15; text-align: center; padding: .35em .4em .3em; display: flex; align-items: center; justify-content: center; gap: .3em; }
    .nl .play.big { width: .95em; height: .95em; }
    .nl .play.big svg { width: .5em; height: .5em; }
    .play.off, .pair.off { opacity: .28; }
    .langs.single .word { font-size: 1.15em; }
    .langs.single .code { font-size: .5em; }
    .card.menu-open .bar { opacity: 1; }
    .btn.langbtn { width: auto; padding: 0 .4em; gap: .15em; }
    .chev { width: .8em; height: .8em; flex: none; }
    .pick { all: unset; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .3em; background: #F3F4F6; border-radius: .4em;
      padding: .45em .5em; font-size: .7em; font-weight: 600; color: #374151; }
    .pick:hover { background: #E5E7EB; }
    .mh { font-size: .8em; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .05em; padding: .5em .7em .2em; }
    .menu { position: absolute; top: 2em; right: .3em; background: #fff; border-radius: .4em; padding: .25em; display: flex; flex-direction: column;
      box-shadow: 0 .2em 1em rgba(0,0,0,.3); font-size: .6em; z-index: 5; min-width: 9em; max-height: 70%; overflow-y: auto; overscroll-behavior: contain; }
    .menu button { all: unset; cursor: pointer; padding: .4em .7em; border-radius: .3em; color: #111827; font-weight: 600; }
    .menu button:hover { background: #F3F4F6; }
    .menu button.sel { background: #EEF2FF; color: #2563EB; }
    .hint { position: absolute; left: .5em; right: .5em; bottom: .5em; background: #111827; color: #fff; border-radius: .4em; padding: .5em .6em;
      font-size: .55em; font-weight: 600; text-align: center; }
    .hintbtn { all: unset; cursor: pointer; display: inline-block; margin-left: .4em; padding: .15em .7em; border-radius: 999px; background: #DC2626; color: #fff; font-weight: 700; }
    .langs { padding: 0 .55em .55em; display: flex; flex-direction: column; gap: .3em; }
    .row { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: .3em; background: #F3F4F6; border-radius: .4em; padding: .3em .45em; }
    .half { display: flex; align-items: center; gap: .3em; min-width: 0; }
    .half.nlh { border-left: .08em solid #D1D5DB; padding-left: .45em; }
    .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .code { font-size: .45em; font-weight: 700; letter-spacing: .06em; color: #6B7280; text-transform: uppercase; line-height: 1.3; }
    .word { font-size: .85em; font-weight: 600; line-height: 1.2; unicode-bidi: plaintext; overflow-wrap: normal; word-break: keep-all; }
    .half.nlh .word { color: #374151; font-weight: 500; }
    .word.none { color: #9CA3AF; font-weight: 400; }
    .pair { all: unset; cursor: pointer; height: 1.05em; padding: 0 .22em; border-radius: .55em; display: flex; align-items: center; background: #111827; flex: none; }
    .pair svg { width: .48em; height: .48em; margin: 0 -.05em; }
    .pair.on { animation: pulse .8s ease-in-out infinite; }
    .play { all: unset; cursor: pointer; width: 1.05em; height: 1.05em; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; }
    .play:hover { filter: brightness(1.1); }
    .play svg { width: .55em; height: .55em; }
    .play.on { animation: pulse .8s ease-in-out infinite; }
    @keyframes pulse { 50% { transform: scale(1.15) } }
    .bar { position: absolute; top: .3em; right: .3em; display: flex; gap: .2em; opacity: 0; transition: opacity .15s; }
    .card:hover .bar { opacity: 1; }
    .btn { all: unset; box-sizing: border-box; cursor: pointer; width: 1.25em; height: 1.25em; border-radius: .3em; background: rgba(0,0,0,.28); color: #fff;
      display: inline-flex; align-items: center; justify-content: center;
      font: 700 .75em/1.25em "Segoe UI", system-ui, sans-serif; text-align: center; }
    .btn:hover { background: rgba(0,0,0,.5); }
    .grip { position: absolute; right: 0; bottom: 0; width: 1.3em; height: 1.3em; cursor: nwse-resize; opacity: 0; transition: opacity .15s;
      background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,.25) 50%, rgba(0,0,0,.25) 60%, transparent 60%, transparent 70%, rgba(0,0,0,.25) 70%, rgba(0,0,0,.25) 80%, transparent 80%); }
    .card:hover .grip { opacity: 1; }
    .bubble { all: unset; position: absolute; width: 56px; height: 56px; border-radius: 50%; background: #2563EB; pointer-events: auto; z-index: 2147483000;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(0,0,0,.35), 0 0 0 3px rgba(255,255,255,.9);
      cursor: pointer; touch-action: none; user-select: none; opacity: .92; transition: transform .1s, opacity .15s; }
    .bubble:hover, .bubble.open { opacity: 1; }
    .bubble.drag { transition: none; cursor: grabbing; transform: scale(1.08); }
    .bubble svg { width: 32px; height: 32px; pointer-events: none; }
    .bpanel { position: absolute; display: none; pointer-events: auto; z-index: 2147483001; width: min(420px, calc(100vw - 32px)); max-height: calc(100vh - 32px);
      overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; background: #fff; border-radius: 14px; box-shadow: 0 8px 30px rgba(0,0,0,.3);
      padding: 12px; box-sizing: border-box; font: 13px/1.3 "Segoe UI", system-ui, -apple-system, Arial, sans-serif; color: #111827; }
    .bpanel.open { display: block; }
    .docktop { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; }
    .dockacts { display: flex; gap: 12px; }
    .dockx { all: unset; cursor: pointer; color: #6B7280; font-size: 12px; }
    .dockx:hover { color: #2563EB; }
    .ver { font-weight: 400; font-size: 11px; color: #9CA3AF; }
    .hintline { color: #6B7280; font-size: 12px; margin: -2px 0 8px; }
    .dtile.off { opacity: .35; filter: grayscale(1); }
    .dtile .mark { position: absolute; top: 0; right: 6px; width: 16px; height: 16px; border-radius: 50%; background: #16A34A; color: #fff;
      font: 700 11px/16px "Segoe UI", system-ui, sans-serif; text-align: center; box-shadow: 0 0 0 2px #fff; }
    .dtile.off .mark { background: #fff; box-shadow: 0 0 0 1.5px #9CA3AF; }
    .bpanel.editing .dtile:hover { background: #EEF2FF; }
    .flabel { width: 100%; font-size: 12px; font-weight: 700; color: #374151; }
    .flabel.inline { width: auto; margin-right: 4px; }
    .voicerow { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E5E7EB; }
    .hintline.small { margin: 6px 0 0; font-size: 11.5px; }
    .editbottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E5E7EB; }
    .switchrow { display: flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; }
    .switchrow input { width: 16px; height: 16px; margin: 0; accent-color: #2563EB; }
    .dockbtn2 { all: unset; cursor: pointer; background: #2563EB; color: #fff; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; }
    .saywrap { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #E5E7EB; }
    .saybox { display: flex; gap: 6px; }
    .saybox input { flex: 1; min-width: 0; box-sizing: border-box; border: 1px solid #D1D5DB; border-radius: 8px; padding: 7px 9px; font: inherit; color: #111827; background: #fff; }
    .saybox input:focus { outline: 2px solid #EA580C; border-color: transparent; }
    .saybtn { all: unset; cursor: pointer; background: #EA580C; color: #fff; border-radius: 8px; padding: 0 11px; display: flex; align-items: center; gap: 5px; font-weight: 700; font-size: 13px; }
    .saybtn:hover { filter: brightness(1.08); }
    .saybtn svg { width: 18px; height: 18px; }
    .recent { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 7px; }
    .rchip { all: unset; cursor: pointer; max-width: 185px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; padding: 3px 9px;
      border-radius: 999px; background: #FFF7ED; color: #9A3412; box-shadow: 0 0 0 1px #FED7AA; }
    .rchip:hover { box-shadow: 0 0 0 1px #EA580C; }
    .card.phrase .nl { font-size: 1.1em; line-height: 1.2; }
    /* Sentences: home language and Dutch stacked instead of side by side, with ▶▶ next to both */
    .card.phrase .row { grid-template-columns: 1fr auto; }
    .card.phrase .row > .half:first-child { grid-column: 1; grid-row: 1; }
    .card.phrase .row > .nlh { grid-column: 1; grid-row: 2; border-left: 0; padding-left: 0; border-top: .06em solid #D1D5DB; padding-top: .3em; }
    .card.phrase .row > .pair { grid-column: 2; grid-row: 1 / span 2; }
    .card.phrase .word { font-size: .72em; overflow-wrap: break-word; }
    .none { color: #6B7280; font-size: 12px; padding: 6px 0 10px; }
    .dockgrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
    .dtile { all: unset; position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; border-radius: 8px; padding: 3px 1px 4px; text-align: center;
      font-size: 10px; font-weight: 600; line-height: 1.1; }
    .dtile:hover { background: #F3F4F6; }
    .dic { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .dic svg { width: 28px; height: 28px; }
    .dockfoot { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E5E7EB; }
    .chip { all: unset; cursor: pointer; padding: 4px 10px; border-radius: 999px; box-shadow: 0 0 0 1px #E5E7EB; font-weight: 600; font-size: 12px; }
    .chip:hover { box-shadow: 0 0 0 1px #2563EB; }
    .chip.on { background: #2563EB; color: #fff; box-shadow: none; }
    .chip.clear { margin-left: auto; }
    select.chip { appearance: none; -webkit-appearance: none; background: #fff; color: #2563EB; font-family: inherit; }
  `;

  const host = document.createElement('pictoklas-laag');
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;display:block;';
  const root = host.attachShadow({ mode: 'closed' });
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet];
  } catch (e) {
    const st = document.createElement('style');
    st.textContent = CSS;
    root.appendChild(st);
  }
  const layer = document.createElement('div');
  layer.className = 'layer';
  root.appendChild(layer);

  // In presentation mode (fullscreen) the layer must live inside the fullscreen element, otherwise it is invisible.
  function mount() {
    const fs = document.fullscreenElement;
    const target = fs && fs.tagName !== 'VIDEO' && fs.tagName !== 'IFRAME' ? fs : document.documentElement;
    if (host.parentNode !== target) target.appendChild(host);
  }
  document.addEventListener('fullscreenchange', () => { if (cards.size || bubble) { mount(); placeBubble(); } });

  const svgEl = (d, fill) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', fill || '#fff');
    s.appendChild(p);
    return s;
  };
  const PLAY = 'M7 4.5v15l13-7.5z';

  const labelOf = id => (words[id] && words[id].nl && words[id].nl.text) || (PK.picto(id) || {}).label || '';
  // Typed sentences ("zin-…") behave like pictograms, with the speech-bubble icon
  const isPhrase = id => /^zin-/.test(id);
  const PHRASE_COLOR = '#EA580C';
  const pic = id => PK.picto(id) || (isPhrase(id) ? { id, label: labelOf(id), color: PHRASE_COLOR, iconId: 'praten', phrase: true } : null);
  let phrases = []; // recent sentences [{ id, text }]
  const textOf = (id, code) => code === 'nl' ? labelOf(id) : ((words[id] && words[id][code] && words[id][code].text) || '');
  const hasAudio = (id, code) => !!(words[id] && words[id][code] && words[id][code].audio);
  // Computer voices (chrome.tts) for when there is no recording
  let voices = [];
  chrome.runtime.sendMessage({ type: 'voices' }).then(r => { voices = (r && r.result) || []; cards.forEach(fillCard); }).catch(() => {});
  const hasVoice = code => voices.some(v => v === code || v.startsWith(code + '-'));
  const canSound = (id, code) => hasAudio(id, code) || (!!textOf(id, code) && hasVoice(code));

  // Which languages this card shows: the card's own choice > the choice in the popup/bubble > all class languages
  function langsOf(card) {
    const pick = card.dataset.lang || settings.focus;
    if (pick && PK.lang(pick)) return [pick];
    return settings.langs || [];
  }

  function fillCard(card) {
    const id = card.dataset.id;
    const p = pic(id);
    const head = card.querySelector('.nl');
    head.textContent = '';
    const label = document.createElement('span');
    label.textContent = labelOf(id);
    head.appendChild(label);

    const playBtn = (seq, title, color, cls) => {
      const b = document.createElement('button');
      const ok = cls === 'pair' ? seq.every(c => canSound(id, c)) : seq.some(c => canSound(id, c));
      b.className = (cls || 'play') + (ok ? '' : ' off');
      b.style.background = color;
      b.title = ok ? title : title + ' – nog geen uitspraak';
      for (let i = 0; i < (cls === 'pair' ? 2 : 1); i++) b.appendChild(svgEl(PLAY));
      b.addEventListener('click', e => { e.stopPropagation(); ok ? play(id, seq, b) : hint(card, seq); });
      return b;
    };
    head.appendChild(playBtn(['nl'], 'Nederlands', '#111827', 'play big'));

    const langs = langsOf(card);
    const box = card.querySelector('.langs');
    box.textContent = '';
    box.classList.toggle('single', langs.length === 1);
    const half = (cls, codeText, wordEl) => {
      const h = document.createElement('span');
      h.className = cls;
      const tx = document.createElement('span');
      tx.className = 'txt';
      const c = document.createElement('span');
      c.className = 'code';
      c.textContent = codeText;
      tx.append(c, wordEl);
      h.appendChild(tx);
      return h;
    };
    // No language chosen yet: let the teacher pick one right on the card
    if (!langs.length) {
      const pick = document.createElement('button');
      pick.className = 'pick';
      pick.textContent = 'Kies de taal van je leerling';
      pick.appendChild(chevron());
      pick.addEventListener('pointerdown', e => e.stopPropagation());
      pick.addEventListener('click', e => { e.stopPropagation(); langMenu(card); });
      box.appendChild(pick);
    }
    // Every row is a pair: home language | Dutch, with a button that plays them one after the other
    for (const code of langs) {
      const L = PK.lang(code);
      if (!L) continue;
      const row = document.createElement('div');
      row.className = 'row';
      const t = document.createElement('span');
      const txt = textOf(id, code);
      t.className = 'word' + (txt ? '' : ' none');
      t.textContent = txt || (card._busy ? '…' : '—');
      if (!txt) t.title = card._busy ? 'Vertaling wordt opgezocht' : 'Geen vertaling gevonden';
      if (L.rtl) t.dir = 'rtl';
      const own = half('half', code, t);
      own.appendChild(playBtn([code], L.name, p.color));

      const n = document.createElement('span');
      n.className = 'word';
      n.textContent = isPhrase(id) ? labelOf(id) : labelOf(id).toLowerCase();
      const nl = half('half nlh', 'nl', n);

      row.append(own, nl, playBtn([code, 'nl'], 'Eerst ' + L.name + ', dan Nederlands', '#111827', 'pair'));
      box.appendChild(row);
    }
    const lb = card.querySelector('.langbtn');
    if (lb) {
      const cur = card.dataset.lang || settings.focus;
      lb.textContent = cur ? cur.toUpperCase() : 'Taal';
      lb.appendChild(chevron());
    }
    fitWords(card);
    autoResolve(card);
  }

  function chevron() {
    const s = svgEl('M6 9l6 6 6-6', 'none');
    s.classList.add('chev');
    const path = s.firstChild;
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    return s;
  }

  // Have the translation and pronunciation looked up automatically (once per language combination)
  function autoResolve(card) {
    const langs = langsOf(card);
    const key = langs.join(',');
    if (card._resolved === key) return;
    card._resolved = key;
    card._busy = true;
    chrome.runtime.sendMessage({ type: 'resolve', picto: card.dataset.id, langs })
      .catch(() => {})
      .finally(() => {
        card._busy = false;
        if (card.isConnected) fillCard(card);
        if (card._speak) { card._speak = false; setTimeout(() => play(card.dataset.id, sequence(card)), 250); }
      });
  }

  // Grey play button clicked: explain, and offer to record the word yourself
  function hint(card, seq) {
    let h = card.querySelector('.hint');
    if (!h) {
      h = document.createElement('div');
      h.className = 'hint';
      card.appendChild(h);
    }
    h.textContent = '';
    const code = (seq || []).find(c => !canSound(card.dataset.id, c)) || 'nl';
    if (card._busy) {
      h.textContent = 'Uitspraak wordt opgezocht…';
    } else {
      h.append((PK.lang(code) || {}).name + ': er is geen computerstem voor deze taal. ');
      const go = document.createElement('button');
      go.className = 'hintbtn';
      go.textContent = '● Zelf opnemen';
      go.addEventListener('click', e => { e.stopPropagation(); chrome.runtime.sendMessage({ type: 'options', picto: card.dataset.id, lang: code }).catch(() => {}); h.remove(); });
      h.appendChild(go);
    }
    clearTimeout(h._t);
    h._t = setTimeout(() => h.remove(), card._busy ? 2600 : 7000);
  }

  // Click on the picture: for each shown language, first the home language, then Dutch
  function sequence(card) {
    const id = card.dataset.id;
    const seq = [];
    for (const code of langsOf(card)) if (canSound(id, code)) seq.push(code, 'nl');
    return seq.length ? seq : ['nl'];
  }

  // Language choice per card, during the lesson. No class languages yet? Then the choice becomes a class language.
  function langMenu(card) {
    const old = card.querySelector('.menu');
    if (old) { old.remove(); card.classList.remove('menu-open'); return; }
    const menu = document.createElement('div');
    menu.className = 'menu';
    const klas = (settings.langs || []).filter(c => PK.lang(c));
    const close = () => { menu.remove(); card.classList.remove('menu-open'); };
    const opt = (value, text) => {
      const b = document.createElement('button');
      b.textContent = text;
      if ((card.dataset.lang || '') === value) b.classList.add('sel');
      b.addEventListener('pointerdown', e => e.stopPropagation());
      b.addEventListener('click', e => {
        e.stopPropagation();
        close();
        if (value && !klas.length) {
          chrome.storage.local.set({ settings: Object.assign({}, settings, { langs: [value] }) });
          return;
        }
        if (value) card.dataset.lang = value; else delete card.dataset.lang;
        fillCard(card);
      });
      menu.appendChild(b);
    };
    const head = txt => { const h = document.createElement('div'); h.className = 'mh'; h.textContent = txt; menu.appendChild(h); };
    if (klas.length) {
      const f = settings.focus && PK.lang(settings.focus);
      opt('', f ? 'Zoals de popup (' + f.name + ')' : 'Alle klastalen');
      for (const c of klas) opt(c, PK.lang(c).name);
      head('Andere taal');
    }
    for (const L of PK.LANGS) if (L.code !== 'nl' && !klas.includes(L.code)) opt(L.code, L.name);
    card.appendChild(menu);
    card.classList.add('menu-open');
  }

  // A word that doesn't fit its box is made smaller. Only when even half size doesn't fit is it
  // broken inside the word: it must never run over the play button next to it.
  function fitWords(card) {
    if (!card.isConnected) return;
    // Title + play button must fit on one line together
    const head = card.querySelector('.nl');
    const label = head && head.querySelector('span');
    if (label) {
      label.style.fontSize = '';
      let f = 1;
      const cs = getComputedStyle(head);
      const avail = head.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const need = () => [...head.children].reduce((a, c) => a + c.offsetWidth, 0) + parseFloat(cs.columnGap || 0) * (head.children.length - 1);
      while (need() > avail + 1 && f > 0.55) {
        f -= 0.05;
        label.style.fontSize = f + 'em';
      }
    }
    for (const el of card.querySelectorAll('.word')) {
      el.style.fontSize = '';
      el.style.overflowWrap = '';
      el.style.wordBreak = '';
      const base = parseFloat(getComputedStyle(el).fontSize);
      let f = 1;
      while (el.scrollWidth > el.clientWidth + 1 && f > 0.5) {
        f -= 0.05;
        el.style.fontSize = (base * f) + 'px';
      }
      if (el.scrollWidth > el.clientWidth + 1) {
        el.style.overflowWrap = 'anywhere';
        el.style.wordBreak = 'normal';
      }
    }
  }

  // Fonts for other scripts (Arabic, Ge'ez, ...) may load after the first measurement: fit again
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => cards.forEach(fitWords));

  function setSize(card, w) {
    const max = Math.max(200, window.innerWidth * 0.95);
    w = Math.min(Math.max(w, 150), max);
    card.style.width = w + 'px';
    card.style.fontSize = (w / 12) + 'px';
    fitWords(card);
  }

  // offset* sizes instead of getBoundingClientRect: the latter is scaled during the pop-in animation
  function keepInView(card) {
    let x = card.offsetLeft, y = card.offsetTop;
    const vw = window.innerWidth, vh = window.innerHeight;
    x = Math.min(Math.max(x, 60 - card.offsetWidth), vw - 60);
    y = Math.min(Math.max(y, 0), vh - 50);
    card.style.left = x + 'px';
    card.style.top = y + 'px';
  }

  function play(id, seq, btn) {
    if (btn) {
      btn.classList.add('on');
      setTimeout(() => btn.classList.remove('on'), 1400 * seq.length);
    }
    chrome.runtime.sendMessage({ type: 'play', picto: id, seq }).catch(() => {});
  }

  function makeCard(id) {
    const p = pic(id);
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = id;

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.style.background = p.color;
    icon.title = 'Klik: per taal eerst de moedertaal, dan het Nederlands';
    icon.appendChild(PK.icon(p.iconId || id));
    if (p.phrase) card.classList.add('phrase');

    const nl = document.createElement('div');
    nl.className = 'nl';
    const langs = document.createElement('div');
    langs.className = 'langs';

    const bar = document.createElement('div');
    bar.className = 'bar';
    const mk = (txt, title, fn, cls) => {
      const b = document.createElement('button');
      b.className = 'btn' + (cls ? ' ' + cls : '');
      b.textContent = txt;
      b.title = title;
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      b.addEventListener('pointerdown', e => e.stopPropagation());
      bar.appendChild(b);
    };
    mk('Taal', 'Kies welke taal deze kaart toont', () => langMenu(card), 'langbtn');
    mk('−', 'Kleiner', () => setSize(card, card.offsetWidth / 1.2));
    mk('+', 'Groter', () => { setSize(card, card.offsetWidth * 1.2); keepInView(card); });
    mk('×', 'Weghalen', () => remove(id));

    const grip = document.createElement('div');
    grip.className = 'grip';
    grip.title = 'Sleep om groter of kleiner te maken';

    card.append(icon, nl, langs, bar, grip);
    card.addEventListener('pointerdown', e => {
      const m = card.querySelector('.menu');
      if (m && !e.target.closest('.menu, .langbtn')) { m.remove(); card.classList.remove('menu-open'); }
    }, true);
    fillCard(card);

    // Dragging (and clicking the picture = play)
    card.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, .menu') || e.target === grip) return;
      card.style.zIndex = ++z;
      const sx = e.clientX, sy = e.clientY;
      const ox = card.offsetLeft, oy = card.offsetTop;
      let moved = false;
      card.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) > 5) { moved = true; card.classList.add('drag'); }
        if (moved) {
          card.style.left = (ox + dx) + 'px';
          card.style.top = (oy + dy) + 'px';
        }
      };
      const up = ev => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerup', up);
        card.removeEventListener('pointercancel', up);
        card.classList.remove('drag');
        if (moved) keepInView(card);
        else if (ev.type === 'pointerup' && icon.contains(e.target)) play(id, sequence(card));
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerup', up);
      card.addEventListener('pointercancel', up);
      e.preventDefault();
    });

    // Drag to resize
    grip.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      card.style.zIndex = ++z;
      const sx = e.clientX, sy = e.clientY, sw = card.offsetWidth;
      grip.setPointerCapture(e.pointerId);
      const move = ev => setSize(card, sw + Math.max(ev.clientX - sx, (ev.clientY - sy) * 0.8));
      const up = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        grip.removeEventListener('pointercancel', up);
        keepInView(card);
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
      grip.addEventListener('pointercancel', up);
    });

    // Ctrl + scroll over a card = bigger/smaller
    card.addEventListener('wheel', e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setSize(card, card.offsetWidth * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
    }, { passive: false });

    return card;
  }

  function show(id, opts) {
    if (!pic(id)) return;
    mount();
    dock();
    let card = cards.get(id);
    if (card) {
      card.style.zIndex = ++z;
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
      if (opts && opts.speak) play(id, sequence(card));
      return;
    }
    card = makeCard(id);
    if (opts && opts.speak) card._speak = true;
    cards.set(id, card);
    const w = Math.min(isPhrase(id) ? 400 : 340, window.innerWidth * 0.42);
    setSize(card, w);
    card.style.zIndex = ++z;
    card.style.visibility = 'hidden';
    layer.appendChild(card);
    fitWords(card);
    const pos = freeSpot(w, card.offsetHeight);
    card.style.left = pos.x + 'px';
    card.style.top = pos.y + 'px';
    card.style.visibility = '';
    keepInView(card);
  }

  // First spot (left to right, row by row) that doesn't touch another card; otherwise slightly staggered.
  function freeSpot(w, h) {
    const gap = 16, vw = window.innerWidth, vh = window.innerHeight - (globalThis.PK_RESERVE_BOTTOM || 0);
    const others = [...cards.values()].filter(c => c.isConnected && c.style.visibility !== 'hidden')
      .map(c => ({ left: c.offsetLeft, top: c.offsetTop, right: c.offsetLeft + c.offsetWidth, bottom: c.offsetTop + c.offsetHeight }));
    const hits = (x, y) => others.some(r => x < r.right + gap && x + w + gap > r.left && y < r.bottom + gap && y + h + gap > r.top);
    for (let y = gap; y + h <= vh - gap; y += 24) {
      for (let x = gap; x + w <= vw - gap; x += 24) {
        if (!hits(x, y)) return { x, y };
      }
    }
    // Screen full: stagger from the centre so it doesn't land exactly on another card
    const step = (placed++ % 8) * 36;
    return { x: Math.max(gap, vw / 2 - w / 2 - 120 + step), y: Math.max(gap, vh / 2 - h / 2 - 100 + step) };
  }

  function remove(id) {
    const c = cards.get(id);
    if (c) c.remove();
    cards.delete(id);
    if (!cards.size) { placed = 0; if (!bubble) host.remove(); }
  }

  function clear() {
    for (const id of [...cards.keys()]) remove(id);
  }

  // ---------- Bubble ----------
  // Floating round button on top of everything. Freely draggable; it stays where you drop it
  // (stored as a fraction of the window width/height). Click = panel with the chosen pictograms.
  const BS = 56, BM = 14;
  let bubble = null, bpanel = null;

  const bubblePos = () => {
    const b = settings.bubblePos || {};
    const x = typeof b.x === 'number' ? b.x : b.side === 'left' ? 0 : 1;
    return { x, y: typeof b.y === 'number' ? b.y : 0.75 };
  };

  function dock(open, edit) {
    if (edit !== undefined) editing = !!edit;
    mount();
    if (!bubble) {
      bubble = document.createElement('button');
      bubble.className = 'bubble';
      bubble.title = 'PictoClass: klik voor pictogrammen, sleep om te verplaatsen';
      bubble.appendChild(PK.icon('bord'));
      bpanel = document.createElement('div');
      bpanel.className = 'bpanel';
      layer.append(bpanel, bubble);
      dragBubble();
      placeBubble();
    }
    if (edit) setEditing(true); else fillDock();
    if (open !== undefined) setPanel(open);
  }

  function setPanel(open) {
    if (!bubble) return;
    if (!open && editing) { editing = false; fillDock(); }
    bubble.classList.toggle('open', !!open);
    bpanel.classList.toggle('open', !!open);
    if (open) placePanel();
  }

  function placeBubble() {
    if (!bubble) return;
    const { x, y } = bubblePos();
    bubble.style.left = Math.min(Math.max(BM, x * innerWidth - BS / 2), innerWidth - BS - BM) + 'px';
    bubble.style.top = Math.min(Math.max(BM, y * innerHeight - BS / 2), innerHeight - BS - BM) + 'px';
    placePanel();
  }

  function placePanel() {
    if (!bpanel || !bpanel.classList.contains('open')) return;
    const pw = bpanel.offsetWidth, ph = bpanel.offsetHeight;
    const bx = bubble.offsetLeft, by = bubble.offsetTop;
    // Panel on the side with the most room
    let x = bx + BS / 2 < innerWidth / 2 ? bx + BS + 10 : bx - pw - 10;
    x = Math.min(Math.max(16, x), innerWidth - pw - 16);
    const y = Math.min(Math.max(16, by + BS / 2 - ph / 2), innerHeight - ph - 16);
    bpanel.style.left = x + 'px';
    bpanel.style.top = y + 'px';
  }

  function dragBubble() {
    bubble.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, ox = bubble.offsetLeft, oy = bubble.offsetTop;
      let moved = false;
      bubble.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) > 5) { moved = true; bubble.classList.add('drag'); setPanel(false); }
        if (moved) {
          bubble.style.left = Math.min(Math.max(0, ox + dx), innerWidth - BS) + 'px';
          bubble.style.top = Math.min(Math.max(0, oy + dy), innerHeight - BS) + 'px';
        }
      };
      const up = () => {
        bubble.removeEventListener('pointermove', move);
        bubble.removeEventListener('pointerup', up);
        bubble.removeEventListener('pointercancel', up);
        bubble.classList.remove('drag');
        if (!moved) { setPanel(!bpanel.classList.contains('open')); return; }
        const pos = { x: (bubble.offsetLeft + BS / 2) / innerWidth, y: (bubble.offsetTop + BS / 2) / innerHeight };
        settings.bubblePos = pos;
        placeBubble();
        chrome.storage.local.get('settings').then(d => chrome.storage.local.set({ settings: Object.assign({}, d.settings, { bubblePos: pos }) }));
      };
      bubble.addEventListener('pointermove', move);
      bubble.addEventListener('pointerup', up);
      bubble.addEventListener('pointercancel', up);
    });
  }

  // Click outside the panel or press Escape: close the panel
  document.addEventListener('pointerdown', e => {
    if (bpanel && bpanel.classList.contains('open') && !e.composedPath().includes(host)) setPanel(false);
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setPanel(false); });
  window.addEventListener('resize', () => { placeBubble(); });

  // Panel content. Normal mode: the chosen pictograms plus language chips.
  // Edit mode (✎ Aanpassen): every pictogram with an on/off mark, manage languages, bubble on every site.
  let editing = false;
  let allSites = null; // is the bubble registered on every site? (asked from the service worker)

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function saveSettings(patch) {
    return chrome.storage.local.get('settings').then(d => chrome.storage.local.set({ settings: Object.assign({}, d.settings, patch) }));
  }

  let coverage = null; // per language: is there a male / female voice on this computer?

  function askCoverage() {
    const codes = ['nl', ...(settings.langs || [])];
    chrome.runtime.sendMessage({ type: 'gender-coverage', langs: codes }).then(r => { coverage = (r && r.result) || null; if (editing) fillDock(); }).catch(() => {});
  }

  function setEditing(on) {
    editing = on;
    if (on) {
      chrome.runtime.sendMessage({ type: 'bubble-state' }).then(r => { allSites = !!(r && r.result); if (editing) fillDock(); }).catch(() => {});
      askCoverage();
    }
    fillDock();
  }

  // "Typ een zin": the teacher types a short sentence; it becomes a card in Dutch + the home language(s)
  function sayBox() {
    const box = el('div', 'saywrap');
    const form = el('form', 'saybox');
    const input = el('input');
    input.type = 'text';
    input.maxLength = 150;
    input.placeholder = 'Typ een zin, bijvoorbeeld: Pak je schrift';
    // Keys typed here must not reach the page (e.g. space or arrows would move a presentation on)
    for (const t of ['keydown', 'keyup', 'keypress']) input.addEventListener(t, e => { e.stopPropagation(); if (t === 'keydown' && e.key === 'Escape') setPanel(false); });
    const go = el('button', 'saybtn');
    go.type = 'submit';
    go.append(PK.icon('praten'), el('span', null, 'Zeg het'));
    form.append(input, go);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      input.value = '';
      const r = await chrome.runtime.sendMessage({ type: 'phrase-add', text }).catch(() => null);
      const id = r && r.result;
      if (!id) return;
      words[id] = words[id] || {};
      words[id].nl = Object.assign({}, words[id].nl, { text });
      show(id, { speak: true });
    });
    box.appendChild(form);
    if (phrases.length) {
      const recent = el('div', 'recent');
      for (const ph of phrases.slice(0, 5)) {
        const c = el('button', 'rchip', ph.text);
        c.title = 'Opnieuw tonen en uitspreken';
        c.addEventListener('click', () => show(ph.id, { speak: true }));
        recent.appendChild(c);
      }
      box.appendChild(recent);
    }
    return box;
  }

  function fillDock() {
    if (!bpanel) return;
    bpanel.textContent = '';
    bpanel.classList.toggle('editing', editing);

    const top = el('div', 'docktop');
    const t = el('b', null, editing ? 'Aanpassen' : 'PictoClass');
    t.appendChild(el('span', 'ver', ' ' + chrome.runtime.getManifest().version));
    const acts = el('span', 'dockacts');
    if (editing) {
      const done = el('button', 'dockbtn2', 'Klaar');
      done.addEventListener('click', () => setEditing(false));
      acts.append(done);
    } else {
      const edit = el('button', 'dockx', '✎ Aanpassen');
      edit.title = 'Kies je pictogrammen, talen en of de bubbel op elke website staat';
      edit.addEventListener('click', () => setEditing(true));
      // No "hide" option on purpose: without the bubble a teacher could get stuck on the page
      acts.append(edit);
    }
    top.append(t, acts);
    bpanel.appendChild(top);

    if (!editing) bpanel.appendChild(sayBox());

    const chosen = new Set(PK.chosen(settings).map(p => p.id));
    if (editing) bpanel.appendChild(el('div', 'hintline', 'Tik op een pictogram om het aan of uit te zetten.'));
    else if (!chosen.size) bpanel.appendChild(el('div', 'none', 'Nog geen pictogrammen gekozen. Klik op ✎ Aanpassen.'));

    const grid = el('div', 'dockgrid');
    for (const p of editing ? PK.PICTOS : PK.PICTOS.filter(x => chosen.has(x.id))) {
      const on = chosen.has(p.id);
      const b = el('button', 'dtile' + (editing && !on ? ' off' : ''));
      b.title = labelOf(p.id);
      const ic = el('span', 'dic');
      ic.style.background = p.color;
      ic.appendChild(PK.icon(p.id));
      b.append(ic, el('span', null, labelOf(p.id)));
      if (editing) {
        b.appendChild(el('span', 'mark', on ? '✓' : ''));
        b.addEventListener('click', () => {
          on ? chosen.delete(p.id) : chosen.add(p.id);
          saveSettings({ pictos: PK.PICTOS.map(x => x.id).filter(id => chosen.has(id)) });
        });
      } else {
        b.addEventListener('click', () => show(p.id));
      }
      grid.appendChild(b);
    }
    bpanel.appendChild(grid);

    const langs = (settings.langs || []).filter(c => PK.lang(c));
    const foot = el('div', 'dockfoot');
    const add = el('select', 'chip');
    add.title = 'Taal toevoegen';
    add.appendChild(new Option(langs.length ? '+ taal' : 'Kies een taal', ''));
    for (const L of PK.LANGS) if (L.code !== 'nl' && !langs.includes(L.code)) add.appendChild(new Option(L.name, L.code));
    add.addEventListener('change', () => { if (add.value) saveSettings({ langs: [...langs, add.value] }); });

    if (editing) {
      foot.appendChild(el('div', 'flabel', 'Talen van je leerlingen'));
      for (const c of langs) {
        const chip = el('button', 'chip', PK.lang(c).name + '  ×');
        chip.title = 'Taal weghalen';
        chip.addEventListener('click', () => {
          const patch = { langs: langs.filter(x => x !== c) };
          if (settings.focus === c) patch.focus = undefined;
          saveSettings(patch);
        });
        foot.appendChild(chip);
      }
      foot.appendChild(add);

      const row = el('label', 'switchrow');
      const cb = el('input');
      cb.type = 'checkbox';
      cb.checked = !!allSites;
      cb.disabled = allSites === null;
      row.append(cb, el('span', null, 'Bubbel op elke website'));
      cb.addEventListener('change', () => {
        // Asking for the all-sites permission needs an extension page; the service worker opens a small window for it
        chrome.runtime.sendMessage({ type: cb.checked ? 'bubble-grant' : 'bubble-revoke' }).catch(() => {});
        if (!cb.checked) allSites = false;
      });
      // Voice: default / female / male. Tell honestly which languages have no voice of that kind here.
      const vrow = el('div', 'voicerow');
      vrow.appendChild(el('span', 'flabel inline', 'Stem'));
      const cur = settings.voiceGender || '';
      for (const [val, name] of [['', 'Standaard'], ['female', 'Vrouw'], ['male', 'Man']]) {
        const b = el('button', 'chip' + (cur === val ? ' on' : ''), name);
        b.addEventListener('click', () => saveSettings({ voiceGender: val || undefined }));
        vrow.appendChild(b);
      }
      bpanel.append(foot, vrow);
      if (cur && coverage) {
        const missing = Object.keys(coverage).filter(c => !coverage[c][cur]).map(c => (PK.lang(c) || {}).name).filter(Boolean);
        bpanel.appendChild(el('div', 'hintline small', missing.length
          ? 'Geen ' + (cur === 'male' ? 'mannenstem' : 'vrouwenstem') + ' op deze computer voor: ' + missing.join(', ') + '. Daar klinkt de standaardstem (of je eigen opname).'
          : '✓ Voor al je talen is een ' + (cur === 'male' ? 'mannenstem' : 'vrouwenstem') + ' beschikbaar.'));
      }
      const more = el('button', 'dockx', 'Woorden verbeteren →');
      more.addEventListener('click', () => chrome.runtime.sendMessage({ type: 'options' }).catch(() => {}));
      const bottom = el('div', 'editbottom');
      bottom.append(row, more);
      bpanel.append(bottom);
    } else {
      if (langs.length) {
        for (const [code, name] of [['', 'Alle talen'], ...langs.map(c => [c, PK.lang(c).name])]) {
          const b = el('button', 'chip' + ((settings.focus || '') === code ? ' on' : ''), name);
          b.addEventListener('click', () => saveSettings({ focus: code || undefined }));
          foot.appendChild(b);
        }
      }
      foot.appendChild(add);
      const cl = el('button', 'chip clear', 'Alles weg');
      cl.addEventListener('click', clear);
      foot.appendChild(cl);
      bpanel.appendChild(foot);
    }
    placePanel();
  }

  chrome.storage.local.get(['words', 'settings', 'phrases']).then(d => {
    words = d.words || {};
    phrases = d.phrases || [];
    settings = Object.assign({ langs: [] }, d.settings);
    cards.forEach(fillCard);
    dock(); // the bubble appears as soon as PictoClass is active on the page
  });
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area !== 'local') return;
    if (ch.words) words = ch.words.newValue || {};
    if (ch.settings) settings = Object.assign({ langs: [] }, ch.settings.newValue);
    if (ch.phrases) { phrases = ch.phrases.newValue || []; if (!editing) fillDock(); }
    if (ch.words || ch.settings) {
      cards.forEach(fillCard);
      // Don't rebuild the panel while the teacher is typing a sentence in it
      const typing = bpanel && bpanel.contains(root.activeElement);
      if (!typing) fillDock();
    }
    if (ch.settings) placeBubble();
    if (ch.settings && editing) {
      const a = JSON.stringify((ch.settings.oldValue || {}).langs), b = JSON.stringify((ch.settings.newValue || {}).langs);
      if (a !== b) askCoverage();
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (!msg || sender.id !== chrome.runtime.id) return;
    if (msg.type === 'pk-ping') reply({ ok: true, open: [...cards.keys()] });
    else if (msg.type === 'pk-show') { show(msg.picto); reply({ ok: true }); }
    else if (msg.type === 'pk-clear') { clear(); reply({ ok: true }); }
    else if (msg.type === 'pk-dock') { dock(true, !!msg.edit); reply({ ok: true }); }
    else if (msg.type === 'pk-bubble-state') { allSites = !!msg.on; if (editing) fillDock(); }
  });

  globalThis.PKOverlay = { show, remove, clear, dock, open: () => [...cards.keys()] };
})();
