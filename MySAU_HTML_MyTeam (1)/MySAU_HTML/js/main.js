import { initDrawer } from './drawer.js';
import { initAssistant } from './assistant.js';
import { icon, hydrateIcons } from './icons.js';
import { $, esc } from './utils.js';
import { USER } from './data.js';
import { subscribe, counts } from './store.js';
import { toast, togglePop, closePop, renderNotifPop, renderProfilePop, initSearch } from './ui.js';
import * as beranda from './pages/beranda.js';
import * as task from './pages/task.js';
import * as kalender from './pages/kalender.js';

import * as inoffice from './pages/inoffice.js';
import * as team from './pages/team.js';
import { LEADER_ROLES } from './team.js';

// Tab Tim Saya hanya untuk peran pemimpin (Dept. Head, Group Head, Direktur)
const isLeader = LEADER_ROLES.includes(USER.role);
const PAGES = { beranda, task, kalender, inoffice, ...(isLeader ? { team } : {}) };
const TITLES = { beranda: 'Beranda', task: 'Task', kalender: 'Kalender', inoffice: 'InOffice', team: 'Tim Saya' };
const app = $('#app');
let current = null;

const route = () => {
  const r = (location.hash.replace(/^#\/?/, '') || 'beranda').split('?')[0];
  return PAGES[r] ? r : 'beranda';
};

function renderShell(r) {
  const c = counts();
  const navItems = [
    ['beranda', 'home', 'Beranda'], ['task', 'task', 'Task'], ['kalender', 'calendar', 'Kalender'], ['inoffice', 'mail', 'InOffice'],
    ...(isLeader ? [['team', 'users', 'Tim Saya']] : []),
  ];
  const badges = { task: c.active, kalender: c.agendaToday, team: isLeader ? team.badge() : 0 };
  // tab ikon; tombol Aplikasi berada setelah tab kedua
  $('#tabbar').innerHTML = navItems.map(([k, ic, label], i) => `${i === 2 ? `<button type="button" class="tab drawer-trigger" data-drawer aria-label="Aplikasi" aria-haspopup="dialog" aria-expanded="false">${icon('grid',22)}<span>Aplikasi</span></button>` : ''}<a class="tab${r === k ? ' on' : ''}" href="#/${k}" aria-label="${label}" ${r === k ? 'aria-current="page"' : ''}>${icon(ic, 18, 1.9)}<span>${label}</span>${badges[k] ? `<b class="tb-badge">${badges[k]}</b>` : ''}</a>`).join('')
    ;
  $('#profileName').textContent = USER.name;
  $('#profileRole').textContent = `${USER.role} · ${USER.division}`;
}

function render({ focus = false } = {}) {
  const r = route();
  const page = PAGES[r];
  const scrolls = [...app.querySelectorAll('.scroll')].map((el) => el.scrollTop);
  renderShell(r);
  // animasi Beranda = satu timeline 12 detik; offset ini menjaga fasenya tetap jalan saat render ulang
  app.style.setProperty('--tl', `${(-(performance.now() % 12000) / 1000).toFixed(3)}s`);
  app.innerHTML = page.render();
  app.dataset.page = r;
  page.bind(app, () => render());
  if (r === current) app.querySelectorAll('.scroll').forEach((el, i) => { if (scrolls[i] != null && !el.classList.contains('tl-scroll')) el.scrollTop = scrolls[i]; });
  if (r !== current) {
    document.title = `${TITLES[r]} — MySAU`;
    if (focus) app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  current = r;
}

/* global UI */
hydrateIcons();
initSearch((r) => { location.hash = `#/${r}`; });
$('#bellBtn').addEventListener('click', (e) => { e.stopPropagation(); renderNotifPop(); togglePop($('#notifPop'), e.currentTarget); });
$('#profileBtn').addEventListener('click', (e) => { e.stopPropagation(); renderProfilePop(); togglePop($('#profilePop'), e.currentTarget); });
document.addEventListener('click', (e) => {
  const t = e.target.closest('.sidebar [data-action="todo"], .tabbar [data-action="todo"], .popover [data-action="todo"], .side-help');
  if (!t) return;
  closePop();
  toast(t.dataset.msg || 'Pusat bantuan: hubungi IT Service Desk');
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); setSearchOpen(false); } });

/* HP: tombol ikon search membuka kolom cari di tengah, di bawah header */
const searchToggle = $('#searchToggle');
function setSearchOpen(open) {
  const was = document.documentElement.classList.contains('search-open');
  if (was === open) return;
  document.documentElement.classList.toggle('search-open', open);
  searchToggle.setAttribute('aria-expanded', String(open));
  if (open) $('#searchInput').focus();
  else { $('#searchResults').hidden = true; if (document.activeElement === $('#searchInput')) searchToggle.focus(); }
}
searchToggle.addEventListener('click', (e) => { e.stopPropagation(); setSearchOpen(!document.documentElement.classList.contains('search-open')); });
document.addEventListener('click', (e) => { if (!e.target.closest('#search, #searchToggle') && !$('#searchInput').value) setSearchOpen(false); });

window.addEventListener('hashchange', () => { closePop(); setSearchOpen(false); render({ focus: true }); });
subscribe(() => render());
render();
initAssistant();
initDrawer();

// live clock + minute refresh (attendance hint, now-line)
let lastMin = new Date().getMinutes();
setInterval(() => {
  if (current === 'beranda') beranda.tick(app);
  const m = new Date().getMinutes();
  if (m !== lastMin) { lastMin = m; if (!document.querySelector('.modal-root.open') && !app.contains(document.activeElement)) render(); }
}, 1000);

export { esc };
