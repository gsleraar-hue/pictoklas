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

  const STR = {
    nl: {
      // cards
      noSoundYet: ' – nog geen uitspraak', pickStudentLang: 'Kies de taal van je leerling', translating: 'Vertaling wordt opgezocht',
      noTranslation: 'Geen vertaling gevonden', firstThen: 'Eerst {a}, dan {b}', language: 'Taal', lookingSound: 'Uitspraak wordt opgezocht…',
      noVoiceFor: '{lang}: er is geen computerstem voor deze taal. ', recordSelf: '● Zelf opnemen', likePopup: 'Zoals de popup ({lang})',
      allClassLangs: 'Alle klastalen', otherLang: 'Andere taal', cardIconTitle: 'Klik: per taal eerst de moedertaal, dan het {base}',
      cardLangTitle: 'Kies welke taal deze kaart toont', smaller: 'Kleiner', bigger: 'Groter', remove: 'Weghalen', resizeTitle: 'Sleep om groter of kleiner te maken',
      playTitle: 'Laat horen ({lang})',
      // bubble
      bubbleTitle: 'PictoClass: klik voor pictogrammen, sleep om te verplaatsen', sayPlaceholder: 'Typ een zin, bijvoorbeeld: Pak je schrift',
      sayIt: 'Zeg het', showAgain: 'Opnieuw tonen en uitspreken', deleteSentence: 'Zin verwijderen', customise: 'Aanpassen',
      customiseTitle: 'Kies je pictogrammen, talen en stem', done: 'Klaar', tapToToggle: 'Tik op een pictogram om het aan of uit te zetten.',
      noneChosen: 'Nog geen pictogrammen gekozen. Klik op ✎ Aanpassen.', addLang: 'Taal toevoegen', plusLang: '+ taal', chooseLang: 'Kies een taal',
      studentLangs: 'Talen van je leerlingen', removeLang: 'Taal weghalen', voice: 'Stem', voiceDefault: 'Standaard', voiceFemale: 'Vrouw', voiceMale: 'Man',
      maleVoice: 'mannenstem', femaleVoice: 'vrouwenstem', noGenderVoice: 'Geen {kind} op deze computer voor: {list}. Daar klinkt de standaardstem (of je eigen opname).',
      allGenderVoice: '✓ Voor al je talen is een {kind} beschikbaar.', improveWords: 'Woorden verbeteren →', allLangs: 'Alle talen', clearAll: 'Alles weg',
      appLang: 'Taal van PictoClass', menuShowBubble: 'Bubbel tonen', menuClearAll: 'Alles weghalen',
      optTitle: "PictoClass – woorden & talen",
      optIntro: "Je hoeft niets voor te bereiden: kies op een kaart de taal van je leerling, dan zoekt PictoClass het woord en de uitspraak er zelf bij. Op deze pagina kun je de woorden en uitspraken controleren en verbeteren.",
      waysTitle: "Zo roep je PictoClass op in de les",
      way1t: "1. Vastpinnen",
      way1: "Klik in Chrome rechtsboven op het <b>puzzelstukje</b> en dan op de <b>punaise</b> naast PictoClass. Het icoon staat daarna altijd in de werkbalk.",
      way2t: "2. Rechtermuisknop",
      way2: "Klik met rechts op een willekeurige pagina &rarr; <b>PictoClass</b> &rarr; kies meteen een pictogram.",
      way3t: "3. De bubbel",
      way3: "De <b>blauwe bubbel</b> staat op elke website. Klik erop voor je pictogrammen of om een zin te typen; met <b>✎ Aanpassen</b> kies je pictogrammen, talen en stem. Je kunt hem verslepen.",
      way4t: "4. Sneltoetsen",
      way4: "<b>Alt+Shift+P</b> menu · <b>Alt+Shift+O</b> bubbel · <b>Alt+Shift+X</b> alles weg",
      pictograms: "Pictogrammen",
      dotsLegend: "Stipjes: <b style=\"color:#16A34A\">groen</b> = woord + uitspraak, <b style=\"color:#60A5FA\">blauw</b> = alleen woord.",
      saveShare: "Bewaren en delen",
      exportAll: "Alles exporteren (.json)",
      importDots: "Importeren…",
      saveShareTip: "Handig om je woordenset met collega's te delen of naar een andere computer mee te nemen. De opnames zitten in het bestand.",
      shortcutsTitle: "Sneltoetsen",
      shortcutsText: "<b>Alt+Shift+P</b> opent PictoClass · <b>Alt+Shift+O</b> bubbel tonen · <b>Alt+Shift+X</b> haalt alle pictogrammen weg · op een pictogram: slepen = verplaatsen, hoekje rechtsonder of <b>Ctrl+scrollen</b> = groter/kleiner, klik op het plaatje = alle uitspraken afspelen. Aanpassen kan via",
      wordIn: "woord in het {lang}",
      translate: "Vertaal",
      recordTitle: "Zelf opnemen (klik nog eens om te stoppen)",
      play: "Afspelen",
      clearSound: "Uitspraak wissen",
      textOnPicto: "tekst op het pictogram",
      showOnBoard: "Toon op bord",
      stMic: "✓ eigen opname",
      stVoice: "✓ uitspraak (computerstem)",
      stSaved: "✓ uitspraak opgeslagen",
      stNoVoice: "geen computerstem voor deze taal – neem het woord zelf op met ●",
      stNotYet: "nog geen uitspraak (wordt opgezocht zodra het pictogram in beeld komt)",
      stAuto: " · woord automatisch vertaald",
      micDenied: "Geen toegang tot de microfoon. Sta de microfoon toe via het slotje of camera-icoon in de adresbalk en probeer het opnieuw.",
      recEmpty: "De opname was leeg. Probeer het nog eens.",
      recording: "Opnemen… zeg het woord en klik op ■ (stopt vanzelf na {s} seconden)",
      nLangs: "{n} klastaal/-talen",
      noLangsYet: "Nog geen talen: kies ze in de bubbel via ✎ Aanpassen, of op een kaart.",
      optTip: "Woorden en uitspraak worden automatisch opgezocht. Klopt een woord niet? Typ het goede woord; de uitspraak wordt dan opnieuw opgezocht. Geen stem voor een taal, of klinkt het niet goed? Klik op ● en laat een leerling of collega het woord inspreken. Wat je zelf invult of opneemt, wordt nooit automatisch overschreven.",
      exportFile: "pictoclass-woorden.json",
      notAFile: "geen PictoClass-bestand",
      imported: "✓ Geïmporteerd.",
      importFailed: "Importeren mislukt: {err}",
      version: "versie {v}",
      clickToShow: "Klik = op het scherm",
      showLang: "Toon taal:",
      yourStudentsLang: "Taal van je leerlingen:",
      chooseLangLower: "kies een taal",
      all: "Alle",
      popupTip: "Sneller: de blauwe <b>bubbel</b> op de pagina, of <b>rechtermuisknop</b> &rarr; <b>PictoClass</b>.",
      bubble: "Bubbel",
      bubbleBtnTitle: "PictoClass-bubbel op deze pagina (Alt+Shift+O)",
      emptyBoard: "Leeg bord",
      wordsLangs: "Woorden & talen",
      failed: "Dat lukte niet: {err}",
      unknownError: "onbekende fout",
      popupNone: "Nog geen pictogrammen gekozen. Klik op de bubbel en dan op ✎ Aanpassen.",
      boardHint: "Klik op de blauwe bubbel om een pictogram te kiezen · F11 = volledig scherm",
      welcomeTitle: "Welkom bij PictoClass",
      welcomeLead: "De blauwe bubbel staat vanaf nu op elke website die je opent. Daar begin je.",
      step1: "Klik op de <b>blauwe bubbel</b>.",
      step2: "Kies een pictogram, of typ een korte zin.",
      step3: "Kies op de kaart de <b>taal van je leerling</b>. Het woord en de uitspraak komen er vanzelf bij.",
      coachStart: "Dit is je <b>PictoClass-bubbel</b>. Klik erop om te beginnen. Je kunt hem ook verslepen.",
      coachAgain: "Klik op de <b>bubbel</b> als je weer een pictogram of zin nodig hebt. Met <b>✎ Aanpassen</b> kies je je pictogrammen, talen en stem.",
      coachPin: "Zet PictoClass vast: klik rechtsboven op het <b>puzzelstukje</b> (naast je profielfoto) en dan op de <b>punaise</b> naast PictoClass."
    },
    en: {
      noSoundYet: ' – no pronunciation yet', pickStudentLang: "Choose your student's language", translating: 'Looking up the translation',
      noTranslation: 'No translation found', firstThen: 'First {a}, then {b}', language: 'Language', lookingSound: 'Looking up the pronunciation…',
      noVoiceFor: '{lang}: there is no computer voice for this language. ', recordSelf: '● Record it yourself', likePopup: 'As in the popup ({lang})',
      allClassLangs: 'All class languages', otherLang: 'Other language', cardIconTitle: 'Click: for each language, first the home language, then {base}',
      cardLangTitle: 'Choose which language this card shows', smaller: 'Smaller', bigger: 'Bigger', remove: 'Remove', resizeTitle: 'Drag to resize',
      playTitle: 'Play ({lang})',
      bubbleTitle: 'PictoClass: click for pictograms, drag to move', sayPlaceholder: 'Type a sentence, for example: Open your notebook',
      sayIt: 'Say it', showAgain: 'Show and say again', deleteSentence: 'Delete sentence', customise: 'Customise',
      customiseTitle: 'Choose your pictograms, languages and voice', done: 'Done', tapToToggle: 'Tap a pictogram to switch it on or off.',
      noneChosen: 'No pictograms chosen yet. Click ✎ Customise.', addLang: 'Add a language', plusLang: '+ language', chooseLang: 'Choose a language',
      studentLangs: "Your students' languages", removeLang: 'Remove language', voice: 'Voice', voiceDefault: 'Default', voiceFemale: 'Female', voiceMale: 'Male',
      maleVoice: 'male voice', femaleVoice: 'female voice', noGenderVoice: 'No {kind} on this computer for: {list}. The default voice (or your own recording) is used there.',
      allGenderVoice: '✓ A {kind} is available for all your languages.', improveWords: 'Improve words →', allLangs: 'All languages', clearAll: 'Clear all',
      appLang: 'Language of PictoClass', menuShowBubble: 'Show the bubble', menuClearAll: 'Clear all',
      optTitle: "PictoClass – words & languages",
      optIntro: "No preparation needed: choose your student's language on a card and PictoClass looks up the word and the pronunciation by itself. On this page you can check and improve the words and pronunciations.",
      waysTitle: "How to call up PictoClass in class",
      way1t: "1. Pin it",
      way1: "In Chrome, click the <b>puzzle piece</b> at the top right and then the <b>pin</b> next to PictoClass. The icon then stays on the toolbar.",
      way2t: "2. Right-click",
      way2: "Right-click any page &rarr; <b>PictoClass</b> &rarr; pick a pictogram straight away.",
      way3t: "3. The bubble",
      way3: "The <b>blue bubble</b> is on every website. Click it for your pictograms or to type a sentence; with <b>✎ Customise</b> you choose pictograms, languages and voice. You can drag it around.",
      way4t: "4. Shortcuts",
      way4: "<b>Alt+Shift+P</b> menu · <b>Alt+Shift+O</b> bubble · <b>Alt+Shift+X</b> clear all",
      pictograms: "Pictograms",
      dotsLegend: "Dots: <b style=\"color:#16A34A\">green</b> = word + pronunciation, <b style=\"color:#60A5FA\">blue</b> = word only.",
      saveShare: "Save and share",
      exportAll: "Export everything (.json)",
      importDots: "Import…",
      saveShareTip: "Handy for sharing your word set with colleagues or taking it to another computer. The recordings are in the file.",
      shortcutsTitle: "Shortcuts",
      shortcutsText: "<b>Alt+Shift+P</b> opens PictoClass · <b>Alt+Shift+O</b> shows the bubble · <b>Alt+Shift+X</b> removes all pictograms · on a pictogram: drag = move, bottom-right corner or <b>Ctrl+scroll</b> = bigger/smaller, click the picture = play all pronunciations. Change them at",
      wordIn: "word in {lang}",
      translate: "Translate",
      recordTitle: "Record it yourself (click again to stop)",
      play: "Play",
      clearSound: "Delete pronunciation",
      textOnPicto: "text on the pictogram",
      showOnBoard: "Show on board",
      stMic: "✓ own recording",
      stVoice: "✓ pronunciation (computer voice)",
      stSaved: "✓ pronunciation saved",
      stNoVoice: "no computer voice for this language – record the word yourself with ●",
      stNotYet: "no pronunciation yet (looked up as soon as the pictogram is shown)",
      stAuto: " · word translated automatically",
      micDenied: "No access to the microphone. Allow the microphone via the padlock or camera icon in the address bar and try again.",
      recEmpty: "The recording was empty. Please try again.",
      recording: "Recording… say the word and click ■ (stops by itself after {s} seconds)",
      nLangs: "{n} class language(s)",
      noLangsYet: "No languages yet: choose them in the bubble via ✎ Customise, or on a card.",
      optTip: "Words and pronunciations are looked up automatically. Is a word wrong? Type the right word; the pronunciation is then looked up again. No voice for a language, or does it sound wrong? Click ● and let a student or colleague record the word. Whatever you type or record yourself is never overwritten automatically.",
      exportFile: "pictoclass-words.json",
      notAFile: "not a PictoClass file",
      imported: "✓ Imported.",
      importFailed: "Import failed: {err}",
      version: "version {v}",
      clickToShow: "Click = on screen",
      showLang: "Show language:",
      yourStudentsLang: "Your students' language:",
      chooseLangLower: "choose a language",
      all: "All",
      popupTip: "Faster: the blue <b>bubble</b> on the page, or <b>right-click</b> &rarr; <b>PictoClass</b>.",
      bubble: "Bubble",
      bubbleBtnTitle: "PictoClass bubble on this page (Alt+Shift+O)",
      emptyBoard: "Empty board",
      wordsLangs: "Words & languages",
      failed: "That didn't work: {err}",
      unknownError: "unknown error",
      popupNone: "No pictograms chosen yet. Click the bubble and then ✎ Customise.",
      boardHint: "Click the blue bubble to choose a pictogram · F11 = full screen",
      welcomeTitle: "Welcome to PictoClass",
      welcomeLead: "From now on the blue bubble is on every website you open. That is where you start.",
      step1: "Click the <b>blue bubble</b>.",
      step2: "Choose a pictogram, or type a short sentence.",
      step3: "Choose your <b>student's language</b> on the card. The word and the pronunciation are added by themselves.",
      coachStart: "This is your <b>PictoClass bubble</b>. Click it to get started. You can also drag it around.",
      coachAgain: "Click the <b>bubble</b> whenever you need a pictogram or sentence again. With <b>✎ Customise</b> you choose your pictograms, languages and voice.",
      coachPin: "Pin PictoClass: click the <b>puzzle piece</b> at the top right (next to your profile picture) and then the <b>pin</b> next to PictoClass."
    }
  };

  // ---------- Language of PictoClass: Dutch or English ----------
  // One choice sets both the interface and the instruction language on the cards
  // (home language | Dutch, or home language | English). Default follows the browser.
  const LABEL_EN = {
    luisteren: 'Listen', kijken: 'Look', stil: 'Be quiet', bord: 'Look at the board', praten: 'Talk', vraag: 'Ask a question',
    vinger: 'Raise your hand', lezen: 'Read', schrijven: 'Write', doen: 'Do it', denken: 'Think', herhalen: 'Once more',
    alleen: 'Work alone', tweetallen: 'Work in pairs', samenwerken: 'Work together', boek: 'Get your book', laptop: 'Laptop',
    telefoon: 'Phone away', opruimen: 'Tidy up', wachten: 'Wait', stop: 'Stop', zitten: 'Sit down', pauze: 'Break', klaar: 'Done', goedzo: 'Well done!'
  };
  const NAME_EN = {
    nl: 'Dutch', ar: 'Arabic', ti: 'Tigrinya', uk: 'Ukrainian', tr: 'Turkish', pl: 'Polish', fa: 'Persian (Farsi/Dari)', ps: 'Pashto', so: 'Somali',
    ku: 'Kurdish', am: 'Amharic', ru: 'Russian', bg: 'Bulgarian', ro: 'Romanian', hu: 'Hungarian', lt: 'Lithuanian', el: 'Greek', sq: 'Albanian',
    es: 'Spanish', pt: 'Portuguese', fr: 'French', en: 'English', de: 'German', it: 'Italian', zh: 'Chinese', hi: 'Hindi', ur: 'Urdu', vi: 'Vietnamese'
  };
  const BASES = ['nl', 'en'];
  let current = null;
  const browserBase = () => (String((globalThis.navigator && navigator.language) || '').toLowerCase().startsWith('nl') ? 'nl' : 'en');
  // 'nl' | 'en' for the given settings (setting wins, otherwise the browser language)
  const baseOf = settings => (settings && BASES.includes(settings.base) ? settings.base : browserBase());
  const setBase = b => { current = BASES.includes(b) ? b : browserBase(); return current; };
  const base = () => current || setBase(null);
  // Card label in the current (or given) language
  const label = (id, b) => { const p = PICTOS.find(x => x.id === id); if (!p) return ''; return (b || base()) === 'en' ? LABEL_EN[id] || p.label : p.label; };
  // Language name in the current (or given) interface language
  const langName = (code, b) => { const L = LANGS.find(x => x.code === code); if (!L) return code; return (b || base()) === 'en' ? NAME_EN[code] || L.name : L.name; };
  // Interface text; {name} placeholders are filled from vars
  const t = (key, vars) => {
    const s = (STR[base()] && STR[base()][key]) || STR.en[key] || key;
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
  };

  // Extension pages: fill elements marked data-t (trusted markup from STR), data-t-title and data-t-placeholder
  const applyI18n = root => {
    const r = root || document;
    for (const e of r.querySelectorAll('[data-t]')) e.innerHTML = t(e.dataset.t);
    for (const e of r.querySelectorAll('[data-t-title]')) e.title = t(e.dataset.tTitle);
    for (const e of r.querySelectorAll('[data-t-placeholder]')) e.placeholder = t(e.dataset.tPlaceholder);
    if (r === document) document.documentElement.lang = base();
  };

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

  return { PICTOS, LANGS, icon, picto, lang, chosen, STR, baseOf, setBase, base, label, langName, t, applyI18n };
})();
globalThis.PK = PK;
