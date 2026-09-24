// Plays recordings (a service worker can't play audio itself).
// Replies only when the clip has finished, so the service worker can keep the order.
let current = null;

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || msg.target !== 'offscreen' || msg.type !== 'play') return;
  playList(msg.list || []).then(() => reply({ ok: true }));
  return true;
});

async function playList(list) {
  if (current) { current.pause(); current = null; }
  for (const src of list) {
    await new Promise(done => {
      const a = new Audio(src);
      current = a;
      const t = setTimeout(done, 15000);
      a.onended = a.onerror = a.onpause = () => { clearTimeout(t); done(); };
      a.play().catch(done);
    });
  }
}
