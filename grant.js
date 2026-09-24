// Small window opened from the bubble: asks Chrome for the all-sites permission (needs a click on an extension page).
const ALL_SITES = ['https://*/*', 'http://*/*'];

document.getElementById('ok').onclick = async () => {
  const granted = await chrome.permissions.request({ origins: ALL_SITES }).catch(() => false);
  await chrome.runtime.sendMessage({ type: 'bubble-sync' }).catch(() => {});
  document.getElementById('msg').textContent = granted ? '✓ De bubbel staat nu op elke website.' : 'Niet toegestaan.';
  setTimeout(() => window.close(), granted ? 900 : 1500);
};
document.getElementById('no').onclick = async () => {
  await chrome.runtime.sendMessage({ type: 'bubble-sync' }).catch(() => {});
  window.close();
};
