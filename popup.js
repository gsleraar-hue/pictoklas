const grid = document.getElementById('grid');
const note = document.getElementById('note');

function say(text) {
  note.textContent = text;
  note.style.display = text ? 'block' : 'none';
}

function tiles(settings) {
  for (const p of PK.chosen(settings)) {
    const b = document.createElement('button');
    b.className = 'tile';
    b.title = PK.label(p.id);
    const ic = document.createElement('div');
    ic.className = 'ic';
    ic.style.background = p.color;
    ic.appendChild(PK.icon(p.id));
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.textContent = PK.label(p.id);
    b.append(ic, lb);
    b.dataset.id = p.id;
    b.addEventListener('click', async () => {
      const r = await chrome.runtime.sendMessage({ type: 'show', picto: p.id });
      if (!r || !r.ok) say(PK.t('failed', { err: r && r.error || PK.t('unknownError') }));
      else if (r.result === 'nieuw-bord') window.close();
      else say('');
    });
    grid.appendChild(b);
  }
  if (!grid.children.length) say(PK.t('popupNone'));
}

chrome.storage.local.get(['words', 'settings']).then(({ words = {}, settings = {} }) => {
  const B = PK.setBase(PK.baseOf(settings));
  PK.applyI18n();
  tiles(settings);
  const el = document.getElementById('langs');
  {
    // Pick one language during the lesson (or all class languages); cards update right away.
    // A language can be added here directly; words and pronunciation are looked up automatically.
    const render = () => {
      const langs = (settings.langs || []).filter(c => c !== B).map(c => PK.lang(c)).filter(Boolean);
      el.textContent = '';
      const lab = document.createElement('span');
      lab.className = 'muted';
      lab.textContent = PK.t(langs.length ? 'showLang' : 'yourStudentsLang');
      el.appendChild(lab);
      const add = document.createElement('select');
      add.className = 'chip add';
      add.appendChild(new Option(PK.t(langs.length ? 'plusLang' : 'chooseLangLower'), ''));
      for (const L of PK.LANGS) if (L.code !== B && !langs.some(x => x.code === L.code)) add.appendChild(new Option(PK.langName(L.code), L.code));
      add.onchange = () => {
        if (!add.value) return;
        settings.langs = [...(settings.langs || []), add.value];
        chrome.storage.local.set({ settings });
        render();
      };
      const chips = langs.length ? [['', PK.t('all')], ...langs.map(l => [l.code, PK.langName(l.code)])] : [];
      for (const [code, name] of chips) {
        const b = document.createElement('button');
        b.className = 'chip' + ((settings.focus || '') === code ? ' on' : '');
        b.textContent = name;
        b.onclick = () => {
          settings.focus = code || undefined;
          if (!code) delete settings.focus;
          chrome.storage.local.set({ settings });
          render();
        };
        el.appendChild(b);
      }
      el.appendChild(add);
    };
    render();
  }
  // Show the teacher's own label in the instruction language
  for (const b of grid.children) {
    const t = words[b.dataset.id] && words[b.dataset.id][B] && words[b.dataset.id][B].text;
    if (t) b.querySelector('.lb').textContent = t;
  }
});

document.getElementById('clear').onclick = () => chrome.runtime.sendMessage({ type: 'clear' });
document.getElementById('dock').onclick = async () => {
  await chrome.runtime.sendMessage({ type: 'dock' });
  window.close();
};
document.getElementById('bord').onclick = () => { chrome.tabs.create({ url: 'bord.html' }); window.close(); };
document.getElementById('beheer').onclick = () => { chrome.runtime.openOptionsPage(); window.close(); };

document.getElementById('ver').textContent = chrome.runtime.getManifest().version;
