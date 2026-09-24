const q = new URLSearchParams(location.search);
document.getElementById('t').textContent = q.get('t') || '';
document.getElementById('s').textContent = q.get('s') || '';
const img = document.getElementById('img');
img.style.backgroundImage = 'url("' + q.get('img') + '")';
if (q.get('fit') === 'contain') img.classList.add('contain');
