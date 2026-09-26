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
    b.title = p.label;
    const ic = document.createElement('div');
    ic.className = 'ic';
    ic.style.background = p.color;
    ic.appendChild(PK.icon(p.id));
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.textContent = p.label;
    b.append(ic, lb);
    b.dataset.id = p.id;
    b.addEventListener('click', async () => {
      const r = await chrome.runtime.sendMessage({ type: 'show', picto: p.id });
      if (!r || !r.ok) say('Dat lukte niet: ' + (r && r.error || 'onbekende fout'));
      else if (r.result === 'nieuw-bord') window.close();
      else say('');
    });
    grid.appendChild(b);
  }
  if (!grid.children.length) say('Nog geen pictogrammen gekozen. Kies ze bij Woorden & talen → Mijn pictogrammen.');
}

chrome.storage.local.get(['words', 'settings']).then(({ words = {}, settings = {} }) => {
  tiles(settings);
  const el = document.getElementById('langs');
  {
    // Pick one language during the lesson (or all class languages); cards update right away.
    // A language can be added here directly; words and pronunciation are looked up automatically.
    const render = () => {
      const langs = (settings.langs || []).map(c => PK.lang(c)).filter(Boolean);
      el.textContent = '';
      const lab = document.createElement('span');
      lab.className = 'muted';
      lab.textContent = langs.length ? 'Toon taal:' : 'Taal van je leerlingen:';
      el.appendChild(lab);
      const add = document.createElement('select');
      add.className = 'chip add';
      add.appendChild(new Option(langs.length ? '+ taal' : 'kies een taal', ''));
      for (const L of PK.LANGS) if (L.code !== 'nl' && !langs.some(x => x.code === L.code)) add.appendChild(new Option(L.name, L.code));
      add.onchange = () => {
        if (!add.value) return;
        settings.langs = [...(settings.langs || []), add.value];
        chrome.storage.local.set({ settings });
        render();
      };
      const chips = langs.length ? [['', 'Alle'], ...langs.map(l => [l.code, l.name])] : [];
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
  // Show the teacher's own Dutch label
  for (const b of grid.children) {
    const t = words[b.dataset.id] && words[b.dataset.id].nl && words[b.dataset.id].nl.text;
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
