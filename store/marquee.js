// Builds the marquee scene from the real pictograms (same shapes and colours as in the extension).
const NS = 'http://www.w3.org/2000/svg';
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
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };

const mini = (id, x, y, r) => {
  const p = PK.picto(id);
  const c = el('div', 'mini');
  c.style.cssText = `left:${x}px;top:${y}px;transform:rotate(${r}deg)`;
  const ic = el('div', 'ic');
  ic.style.background = p.color;
  ic.appendChild(PK.icon(id));
  c.append(ic, el('div', 'l', p.label));
  document.body.appendChild(c);
};
mini('vinger', 660, 250, -7);
mini('samenwerken', 1195, 90, 6);
mini('stil', 1200, 270, -4);

const p = PK.picto('luisteren');
const card = el('div', 'card');
const ic = el('div', 'ic');
ic.style.background = p.color;
ic.appendChild(PK.icon('luisteren'));
const nl = el('div', 'nl', 'Luisteren');
const big = el('span', 'play');
big.style.background = '#111827';
big.appendChild(playIcon(1));
nl.appendChild(big);
const rows = el('div', 'rows');
for (const [code, word, rtl] of [['AR', 'استمع', true], ['UK', 'слухати', false]]) {
  const row = el('div', 'row');
  const own = el('div', 'half');
  const t = el('div', 'txt');
  const w = el('span', 'w', word);
  if (rtl) w.dir = 'rtl';
  t.append(el('span', 'code', code), w);
  const pl = el('span', 'play');
  pl.style.background = p.color;
  pl.appendChild(playIcon(1));
  own.append(t, pl);
  const nlh = el('div', 'half nlh');
  const t2 = el('div', 'txt');
  t2.append(el('span', 'code', 'NL'), el('span', 'w', 'luisteren'));
  nlh.appendChild(t2);
  const pair = el('span', 'pair');
  pair.appendChild(playIcon(2));
  row.append(own, nlh, pair);
  rows.appendChild(row);
}
card.append(ic, nl, rows);
document.body.appendChild(card);

const b = el('div', 'bubble');
b.appendChild(PK.icon('bord'));
document.body.appendChild(b);
