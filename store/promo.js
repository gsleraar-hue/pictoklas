const spots = [['luisteren', 234, 30, -4], ['samenwerken', 336, 34, 4], ['vinger', 286, 150, -2]];
for (const [id, x, y, r] of spots) {
  const p = PK.picto(id);
  const c = document.createElement('div');
  c.className = 'c';
  c.style.cssText = `left:${x}px;top:${y}px;transform:rotate(${r}deg)`;
  const i = document.createElement('div');
  i.className = 'i';
  i.style.background = p.color;
  i.appendChild(PK.icon(id));
  const l = document.createElement('div');
  l.className = 'l';
  l.textContent = p.label;
  c.append(i, l);
  document.body.appendChild(c);
}
