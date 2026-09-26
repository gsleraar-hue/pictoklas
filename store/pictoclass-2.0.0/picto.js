// Shared data: pictograms, languages and an SVG builder.
// Icons are stored as shapes (no innerHTML) so they also work on pages with a strict CSP / Trusted Types.
var PK = globalThis.PK || (function () {
  const C = {
    aandacht: '#2563EB',
    spreken: '#EA580C',
    werken: '#16A34A',
    samen: '#0D9488',
    spullen: '#7C3AED',
    tijd: '#DC2626',
    goed: '#D97706'
  };

  // en: English gloss, the source for automatic translation (less ambiguous than the Dutch label)
  // f: filled white · cut: thick outline in the background colour underneath (for a strike-through line)
  const PICTOS = [
    { id: 'luisteren', en: 'listen', label: 'Luisteren', color: C.aandacht, shapes: [
      ['path', { d: 'M18 26a13 13 0 0 1 26 0c0 7-5 9-7 13s-2 9-7 11a6 6 0 0 1-8-4' }],
      ['path', { d: 'M25 26a6 6 0 0 1 12 0c0 3-3 4-4 6' }],
      ['path', { d: 'M50 19c3 4 3 11 0 15' }],
      ['path', { d: 'M56 13c6 7 6 20 0 27' }]
    ] },
    { id: 'kijken', en: 'look', label: 'Kijken', color: C.aandacht, shapes: [
      ['path', { d: 'M5 32C11 21 20 15 32 15s21 6 27 17c-6 11-15 17-27 17S11 43 5 32z' }],
      ['circle', { cx: 32, cy: 32, r: 8, f: 1 }]
    ] },
    { id: 'stil', en: 'be quiet', label: 'Stil zijn', color: C.aandacht, shapes: [
      ['circle', { cx: 32, cy: 30, r: 22 }],
      ['circle', { cx: 24, cy: 24, r: 2.5, f: 1 }],
      ['circle', { cx: 40, cy: 24, r: 2.5, f: 1 }],
      ['path', { d: 'M21 40h22' }],
      ['rect', { x: 28, y: 30, width: 8, height: 30, rx: 4, f: 1, cut: 1 }]
    ] },
    { id: 'bord', en: 'look at the board', label: 'Kijk naar het bord', color: C.aandacht, shapes: [
      ['rect', { x: 7, y: 9, width: 50, height: 33, rx: 2 }],
      ['path', { d: 'M15 19h22M15 27h30M15 34h14' }],
      ['path', { d: 'M32 42v9M22 58l10-7 10 7' }]
    ] },
    { id: 'praten', en: 'talk together', label: 'Praten', color: C.spreken, shapes: [
      ['path', { d: 'M14 11h36a6 6 0 0 1 6 6v21a6 6 0 0 1-6 6H30L18 54V44h-4a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6z' }],
      ['path', { d: 'M19 23h26M19 32h16' }]
    ] },
    { id: 'vraag', en: 'ask a question', label: 'Vraag stellen', color: C.spreken, shapes: [
      ['path', { d: 'M14 11h36a6 6 0 0 1 6 6v21a6 6 0 0 1-6 6H30L18 54V44h-4a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6z' }],
      ['path', { d: 'M26 22a6 6 0 1 1 8.5 5.5c-2 1-2.5 2.2-2.5 4.5' }],
      ['circle', { cx: 32, cy: 38, r: 2.4, f: 1 }]
    ] },
    { id: 'vinger', en: 'raise your hand', label: 'Vinger opsteken', color: C.spreken, shapes: [
      ['path', { d: 'M22 37V16a3.5 3.5 0 0 1 7 0v15' }],
      ['path', { d: 'M29 30V11a3.5 3.5 0 0 1 7 0v19' }],
      ['path', { d: 'M36 30V14a3.5 3.5 0 0 1 7 0v17' }],
      ['path', { d: 'M43 32V20a3.5 3.5 0 0 1 7 0v16c0 12-7 20-18 20-6 0-10-3-13-8l-7-11a3.5 3.5 0 0 1 6-4l4 4' }]
    ] },
    { id: 'lezen', en: 'read the text', label: 'Lezen', color: C.werken, shapes: [
      ['path', { d: 'M32 19c-6-5-15-6-24-5v33c9-1 18 0 24 5 6-5 15-6 24-5V14c-9-1-18 0-24 5z' }],
      ['path', { d: 'M32 19v33' }]
    ] },
    { id: 'schrijven', en: 'write', label: 'Schrijven', color: C.werken, shapes: [
      ['path', { d: 'M43 8l12 12-27 27-15 4 4-15z' }],
      ['path', { d: 'M37 14l12 12' }],
      ['path', { d: 'M10 58h44' }]
    ] },
    { id: 'doen', en: 'do it', label: 'Doen', color: C.werken, shapes: [
      ['path', { d: 'M36 28L11 53', 'stroke-width': 7 }],
      ['path', { d: 'M27 21L41 7l14 13-14 14z', f: 1 }]
    ] },
    { id: 'denken', en: 'think about it', label: 'Denken', color: C.werken, shapes: [
      ['path', { d: 'M24 42c-5-4-9-9-9-16a17 17 0 0 1 34 0c0 7-4 12-9 16v4H24z' }],
      ['path', { d: 'M26 52h12M28 58h8' }]
    ] },
    { id: 'herhalen', en: 'once more', label: 'Nog een keer', color: C.werken, shapes: [
      ['path', { d: 'M14 29a18 18 0 0 1 33-9' }],
      ['path', { d: 'M48 9v11H37' }],
      ['path', { d: 'M50 35a18 18 0 0 1-33 9' }],
      ['path', { d: 'M16 55V44h11' }]
    ] },
    { id: 'alleen', en: 'work alone', label: 'Alleen werken', color: C.samen, shapes: [
      ['circle', { cx: 32, cy: 19, r: 9 }],
      ['path', { d: 'M13 56c0-11 8-19 19-19s19 8 19 19' }]
    ] },
    { id: 'tweetallen', en: 'work in pairs', label: 'Met z’n tweeën', color: C.samen, shapes: [
      ['circle', { cx: 20, cy: 22, r: 7 }],
      ['circle', { cx: 44, cy: 22, r: 7 }],
      ['path', { d: 'M5 54c0-9 7-16 15-16s15 7 15 16' }],
      ['path', { d: 'M29 54c0-9 7-16 15-16s15 7 15 16' }]
    ] },
    { id: 'samenwerken', en: 'work together', label: 'Samenwerken', color: C.samen, shapes: [
      ['circle', { cx: 14, cy: 25, r: 6 }],
      ['circle', { cx: 50, cy: 25, r: 6 }],
      ['circle', { cx: 32, cy: 18, r: 7.5 }],
      ['path', { d: 'M3 53c0-8 5-14 11-14' }],
      ['path', { d: 'M61 53c0-8-5-14-11-14' }],
      ['path', { d: 'M17 56c0-10 7-17 15-17s15 7 15 17' }]
    ] },
    { id: 'boek', en: 'take your book', label: 'Pak je boek', color: C.spullen, shapes: [
      ['path', { d: 'M16 8h32v48H21a5 5 0 0 1-5-5z' }],
      ['path', { d: 'M16 51a5 5 0 0 1 5-5h27' }],
      ['path', { d: 'M25 18h15' }]
    ] },
    { id: 'laptop', en: 'laptop', label: 'Laptop', color: C.spullen, shapes: [
      ['rect', { x: 13, y: 13, width: 38, height: 27, rx: 2 }],
      ['path', { d: 'M5 46h54l-4 7H9z' }]
    ] },
    { id: 'telefoon', en: 'put your phone away', label: 'Telefoon weg', color: C.spullen, shapes: [
      ['rect', { x: 19, y: 7, width: 26, height: 50, rx: 4 }],
      ['path', { d: 'M29 49h6' }],
      ['path', { d: 'M9 9l46 46', cut: 1, 'stroke-width': 5 }]
    ] },
    { id: 'opruimen', en: 'tidy up your things', label: 'Opruimen', color: C.spullen, shapes: [
      ['path', { d: 'M9 33h46v21H9z' }],
      ['path', { d: 'M9 33l5-7h36l5 7' }],
      ['path', { d: 'M32 4v20M24 16l8 8 8-8' }]
    ] },
    { id: 'wachten', en: 'wait', label: 'Wachten', color: C.tijd, shapes: [
      ['path', { d: 'M17 7h30M17 57h30' }],
      ['path', { d: 'M21 7c0 13 11 16 11 25s-11 12-11 25' }],
      ['path', { d: 'M43 7c0 13-11 16-11 25s11 12 11 25' }],
      ['path', { d: 'M25 53c2-5 12-5 14 0z', f: 1 }]
    ] },
    { id: 'stop', en: 'stop!', label: 'Stop', color: C.tijd, shapes: [
      ['path', { d: 'M22 5h20l17 17v20L42 59H22L5 42V22z' }],
      ['path', { d: 'M18 32h28', 'stroke-width': 7 }]
    ] },
    { id: 'zitten', en: 'sit down', label: 'Ga zitten', color: C.tijd, shapes: [
      ['path', { d: 'M20 6v30h26' }],
      ['path', { d: 'M22 36v21M44 36v21' }]
    ] },
    { id: 'pauze', en: 'break time', label: 'Pauze', color: C.tijd, shapes: [
      ['path', { d: 'M12 24h32v16a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12z' }],
      ['path', { d: 'M44 28h4a6 6 0 0 1 0 12h-4' }],
      ['path', { d: 'M22 6c-3 4 3 7 0 11M32 6c-3 4 3 7 0 11' }]
    ] },
    { id: 'klaar', en: 'finished', label: 'Klaar', color: C.werken, shapes: [
      ['circle', { cx: 32, cy: 32, r: 24 }],
      ['path', { d: 'M20 33l8 8 16-17', 'stroke-width': 5 }]
    ] },
    { id: 'goedzo', en: 'well done!', label: 'Goed zo!', color: C.goed, shapes: [
      ['path', { d: 'M12 29h8v26h-8z' }],
      ['path', { d: 'M20 31l9-19c4 0 7 3 6 8l-2 8h13a4 4 0 0 1 4 5l-4 17a4 4 0 0 1-4 4H20' }]
    ] }
  ];

  // code = our language code · gt = Google Translate code · rtl = right-to-left script
  const LANGS = [
    { code: 'nl', name: 'Nederlands', gt: 'nl' },
    { code: 'ar', name: 'Arabisch', gt: 'ar', rtl: true },
    { code: 'ti', name: 'Tigrinya', gt: 'ti' },
    { code: 'uk', name: 'Oekraïens', gt: 'uk' },
    { code: 'tr', name: 'Turks', gt: 'tr' },
    { code: 'pl', name: 'Pools', gt: 'pl' },
    { code: 'fa', name: 'Perzisch (Farsi/Dari)', gt: 'fa', rtl: true },
    { code: 'ps', name: 'Pasjtoe', gt: 'ps', rtl: true },
    { code: 'so', name: 'Somalisch', gt: 'so' },
    { code: 'ku', name: 'Koerdisch', gt: 'ku' },
    { code: 'am', name: 'Amhaars', gt: 'am' },
    { code: 'ru', name: 'Russisch', gt: 'ru' },
    { code: 'bg', name: 'Bulgaars', gt: 'bg' },
    { code: 'ro', name: 'Roemeens', gt: 'ro' },
    { code: 'hu', name: 'Hongaars', gt: 'hu' },
    { code: 'lt', name: 'Litouws', gt: 'lt' },
    { code: 'el', name: 'Grieks', gt: 'el' },
    { code: 'sq', name: 'Albanees', gt: 'sq' },
    { code: 'es', name: 'Spaans', gt: 'es' },
    { code: 'pt', name: 'Portugees', gt: 'pt' },
    { code: 'fr', name: 'Frans', gt: 'fr' },
    { code: 'en', name: 'Engels', gt: 'en' },
    { code: 'de', name: 'Duits', gt: 'de' },
    { code: 'it', name: 'Italiaans', gt: 'it' },
    { code: 'zh', name: 'Chinees', gt: 'zh-CN' },
    { code: 'hi', name: 'Hindi', gt: 'hi' },
    { code: 'ur', name: 'Urdu', gt: 'ur', rtl: true },
    { code: 'vi', name: 'Vietnamees', gt: 'vi' }
  ];

  const NS = 'http://www.w3.org/2000/svg';

  function icon(id, doc) {
    doc = doc || document;
    const p = PICTOS.find(x => x.id === id);
    const svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    if (!p) return svg;
    for (const [tag, a] of p.shapes) {
      const make = (under) => {
        const el = doc.createElementNS(NS, tag);
        for (const k in a) if (k !== 'f' && k !== 'cut') el.setAttribute(k, a[k]);
        const w = Number(a['stroke-width'] || 4);
        if (under) {
          el.setAttribute('fill', a.f ? p.color : 'none');
          el.setAttribute('stroke', p.color);
          el.setAttribute('stroke-width', w + 7);
        } else if (a.f) {
          el.setAttribute('fill', '#fff');
          el.setAttribute('stroke', 'none');
        } else {
          el.setAttribute('fill', 'none');
          el.setAttribute('stroke', '#fff');
          el.setAttribute('stroke-width', w);
        }
        el.setAttribute('stroke-linecap', 'round');
        el.setAttribute('stroke-linejoin', 'round');
        return el;
      };
      if (a.cut) svg.appendChild(make(true));
      svg.appendChild(make(false));
    }
    return svg;
  }

  const picto = id => PICTOS.find(x => x.id === id);
  const lang = code => LANGS.find(x => x.code === code);

  // The pictograms the teacher switched on (no choice made yet = all of them)
  const chosen = settings => {
    const ids = settings && settings.pictos;
    return Array.isArray(ids) ? PICTOS.filter(p => ids.includes(p.id)) : PICTOS;
  };

  return { PICTOS, LANGS, icon, picto, lang, chosen };
})();
globalThis.PK = PK;
