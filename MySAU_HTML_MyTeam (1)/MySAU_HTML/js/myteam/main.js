// Aplikasi My Team: dashboard detail untuk pemimpin, terpisah dari MySAU (myteam.html)
import { icon, hydrateIcons } from '../icons.js';
import { $, esc } from '../utils.js';
import { USER } from '../data.js';
import { subscribe } from '../store.js';
import { MEMBERS, LEADER_ROLES } from '../team.js';
import { approvals, taskStats, fullName } from '../teamModel.js';
import { avatar } from '../ui.js';
import * as anggota from './pages/anggota.js';
import * as profil from './pages/profil.js';
import * as task from './pages/task.js';
import * as kehadiran from './pages/kehadiran.js';
import * as approval from './pages/approval.js';
import * as skor from './pages/skor.js';

const PAGES = { anggota, task, kehadiran, approval, skor };
const NAV = [['anggota', 'users', 'Anggota tim'], ['task', 'task', 'Task tim'], ['kehadiran', 'clock', 'Kehadiran'], ['approval', 'checkCircle', 'Persetujuan'], ['skor', 'trend', 'Skor']];
const TITLES = Object.fromEntries(NAV.map(([k, , l]) => [k, l]));
const app = $('#app');
let current = '';

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const [page, param] = path.split('/');
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { page: PAGES[page] ? page : 'anggota', param: page === 'anggota' ? param : undefined, query };
}

function renderShell(r) {
  const badges = { approval: approvals().length, task: taskStats().late.length };
  $('#mtNav').innerHTML = NAV.map(([k, ic, label]) => `<a class="mt-nav${r.page === k ? ' on' : ''}" href="#/${k}" ${r.page === k ? 'aria-current="page"' : ''} aria-label="${label}">${icon(ic, 20, 1.9)}<span>${label}</span>${badges[k] ? `<b class="mt-nav-badge${k === 'task' ? ' red' : ''}" aria-label="${badges[k]} ${k === 'task' ? 'terlambat' : 'menunggu'}">${badges[k]}</b>` : ''}</a>`).join('');
  const crumbs = [`<a href="#/${r.page}">${esc(TITLES[r.page])}</a>`];
  if (r.param) crumbs.push(`<span>${esc(fullName(r.param))}</span>`);
  $('#mtCrumb').innerHTML = `<a class="mt-brand" href="#/anggota">My <span>Team</span></a><span class="mt-sep">/</span>${crumbs.join('<span class="mt-sep">/</span>')}`;
}

function render() {
  const r = route();
  const key = r.page + (r.param || '');
  const page = r.param ? profil : PAGES[r.page];
  const scrolls = [...app.querySelectorAll('.scroll')].map((el) => el.scrollTop);
  renderShell(r);
  app.innerHTML = page.render(r.param, r.query);
  app.dataset.page = r.param ? 'profil' : r.page;
  app.onclick = app.onchange = app.onkeydown = app.oninput = null;
  page.bind(app, render, r.param);
  if (key === current) app.querySelectorAll('.scroll').forEach((el, i) => { if (scrolls[i] != null) el.scrollTop = scrolls[i]; });
  else { document.title = `${r.param ? fullName(r.param) : TITLES[r.page]} — My Team`; app.focus({ preventScroll: true }); }
  current = key;
}

/* cari anggota */
function initSearch() {
  const input = $('#mtSearch');
  const box = $('#mtResults');
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    const hits = MEMBERS.filter((m) => `${fullName(m.code)} ${m.role}`.toLowerCase().includes(q));
    box.innerHTML = hits.length ? `<div class="sr-sec"><small>Anggota tim</small>${hits.map((m) => `<a class="sr-row" href="#/anggota/${m.code}">${avatar(m.code, 22)}<span>${esc(fullName(m.code))}</span><em>${esc(m.role)}</em></a>`).join('')}</div>`
      : `<p class="sr-empty">Tidak ada anggota bernama “${esc(input.value)}”.</p>`;
    box.hidden = false;
  };
  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const a = box.querySelector('a'); if (a) { location.hash = a.getAttribute('href'); input.value = ''; box.hidden = true; input.blur(); } }
    if (e.key === 'Escape') { input.value = ''; box.hidden = true; input.blur(); }
  });
  box.addEventListener('click', () => { input.value = ''; box.hidden = true; });
  document.addEventListener('click', (e) => { if (!e.target.closest('.mt-search')) box.hidden = true; });
  document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); } });
}

$('#mtProfile').innerHTML = `${avatar(USER.initials, 38)}<span class="profile-txt"><b>${esc(USER.name)}</b><small>${esc(USER.role)} · ${esc(USER.division)}</small></span>`;
hydrateIcons();
if (!LEADER_ROLES.includes(USER.role)) {
  app.innerHTML = `<div class="mt-page mt-denied"><h1>My Team hanya untuk pemimpin</h1><p class="muted">Aplikasi ini terbuka untuk Dept. Head, Group Head, dan Direktur.</p><a class="btn primary" href="index.html">Kembali ke MySAU</a></div>`;
} else {
  initSearch();
  window.addEventListener('hashchange', render);
  subscribe(() => render());
  render();
}
