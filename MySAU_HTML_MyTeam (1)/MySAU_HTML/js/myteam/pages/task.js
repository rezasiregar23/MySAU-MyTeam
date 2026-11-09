import { icon } from '../../icons.js';
import { esc, today, ymd, parseYmd, fmtLong, $$ } from '../../utils.js';
import { PRIORITY } from '../../data.js';
import { MEMBERS, TEAM_STAGES, STUCK_DAYS, isReminded, remind, editTask } from '../../team.js';
import { taskStats, fullName, shortName } from '../../teamModel.js';
import { avatar, toast, duePill } from '../../ui.js';
import { openAssign } from '../../pages/team.js';
import { pageHead } from '../kit.js';

const filters = { owner: '', app: '', view: 'semua' };

function visible(s) {
  const k = ymd(today());
  return s.all.filter((t) => (!filters.owner || t.owner === filters.owner)
    && (!filters.app || t.app === filters.app)
    && (filters.view === 'semua'
      || (filters.view === 'terlambat' && t.stage !== 'done' && t.due < k)
      || (filters.view === 'macet' && s.isStuck(t))
      || (filters.view === 'dari-saya' && t.assignedByMe)));
}

export function render(_, query = {}) {
  if (query.owner !== undefined) filters.owner = MEMBERS.some((m) => m.code === query.owner) ? query.owner : '';
  const s = taskStats();
  const k = ymd(today());
  const list = visible(s);
  const apps = [...new Set(s.all.map((t) => t.app))].sort();
  const maxLoad = Math.max(1, ...MEMBERS.map((m) => s.byOwner[m.code].open));
  const views = [['semua', 'Semua', s.all.length], ['terlambat', 'Terlambat', s.late.length], ['macet', `Macet ${STUCK_DAYS}+ hari`, s.stuck.length], ['dari-saya', 'Dari saya', s.all.filter((t) => t.assignedByMe).length]];
  return `<div class="mt-page mt-board">
    ${pageHead('Task tim', `${s.open.length} task aktif · ${s.late.length} terlambat · ${s.stuck.length} macet · klik kartu untuk mengingatkan, mengalihkan, atau mengubah tenggat`,
      `<button type="button" class="btn primary" data-assign>${icon('plus', 14, 2.2)}Tugaskan task</button>`)}
    <div class="mt-toolbar">
      <div class="seg glass" role="tablist" aria-label="Filter status">${views.map(([v, l, n]) => `<button type="button" role="tab" aria-selected="${filters.view === v}" class="${filters.view === v ? 'on' : ''}" data-view="${v}">${l}<span class="mt-count">${n}</span></button>`).join('')}</div>
      <span class="flex"></span>
      <label class="mt-select">Anggota<select data-f="owner"><option value="">Semua anggota</option>${MEMBERS.map((m) => `<option value="${m.code}" ${filters.owner === m.code ? 'selected' : ''}>${esc(fullName(m.code))}</option>`).join('')}</select></label>
      <label class="mt-select">Aplikasi<select data-f="app"><option value="">Semua aplikasi</option>${apps.map((a) => `<option ${filters.app === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select></label>
      ${filters.owner || filters.app || filters.view !== 'semua' ? '<button type="button" class="link" data-reset>Hapus filter</button>' : ''}
    </div>
    <div class="mt-board-grid">
      <div class="mt-kb">${TEAM_STAGES.map((st) => {
        const items = list.filter((t) => t.stage === st.id).sort((a, b) => (a.due < b.due ? -1 : 1));
        return `<section class="mt-col"><header><i class="mt-coldot" style="--c:${st.color}"></i><b>${st.label}</b><span>${items.length}</span></header>
          <div class="mt-list scroll" tabindex="0" aria-label="Task ${st.label}">${items.map((t) => {
            const late = t.stage !== 'done' && t.due < k;
            const stuck = s.isStuck(t);
            return `<button type="button" class="mt-card glass${late ? ' late' : ''}" data-open="${esc(t.id)}">
              <span class="mt-card-title">${esc(t.title)}</span>
              <span class="mt-card-meta">${avatar(t.owner, 20)}<span>${esc(shortName(t.owner))}</span><span class="muted">· ${esc(t.app)}</span></span>
              ${t.stage !== 'done' ? `<span class="mt-card-tags">${late ? `<em class="late">Terlambat ${Math.round((today() - parseYmd(t.due)) / 864e5)} hari</em>` : t.due === k ? '<em class="today">Hari ini</em>' : ''}${stuck ? `<em class="stuck">${t.stageDays} hari di sini</em>` : ''}${t.assignedByMe ? '<em>Dari Anda</em>' : ''}</span>` : ''}
            </button>`;
          }).join('') || '<p class="mt-colempty">Kosong</p>'}</div></section>`;
      }).join('')}</div>
      <aside class="card glass mt-load">
        <div class="card-head"><h2>Beban kerja</h2><span class="flex"></span><small class="muted">Klik untuk filter</small></div>
        <ul>${[...MEMBERS].sort((a, b) => s.byOwner[b.code].open - s.byOwner[a.code].open).map((m) => {
          const w = s.byOwner[m.code];
          return `<li><button type="button" class="${filters.owner === m.code ? 'on' : ''}" data-owner="${m.code}" aria-pressed="${filters.owner === m.code}">${avatar(m.code, 26)}<span class="mt-load-main"><b>${esc(shortName(m.code))}</b><span class="mt-load-bar"><i style="width:${((w.open - w.late) / maxLoad) * 100}%"></i><i class="late" style="width:${(w.late / maxLoad) * 100}%"></i></span></span><span class="mt-load-n">${w.open}${w.late ? `<small>${w.late} telat</small>` : ''}</span></button></li>`;
        }).join('')}</ul>
        <p class="mt-legend"><span><i style="--c:#5B9BE0"></i>Aktif</span><span><i style="--c:#D9577A"></i>Terlambat</span></p>
      </aside>
    </div>
  </div>`;
}

function openTask(id, rerender) {
  const t = taskStats().all.find((x) => x.id === id);
  if (!t) return;
  const root = document.getElementById('modalRoot');
  const lastFocus = document.activeElement;
  const stuck = t.stage === 'doing' && t.stageDays >= STUCK_DAYS;
  const reminded = isReminded(t.id);
  root.innerHTML = `<div class="scrim" data-close></div>
    <form class="modal glass-strong mt-task-modal" role="dialog" aria-modal="true" aria-labelledby="mtTaskTitle" novalidate>
      <div class="md-head"><div class="md-title"><small>${esc(t.app)} · ${esc(TEAM_STAGES.find((x) => x.id === t.stage).label)}</small><h2 id="mtTaskTitle">${esc(t.title)}</h2></div>
        <button type="button" class="icon-btn sm" data-close aria-label="Tutup">${icon('x', 16, 2)}</button></div>
      <div class="mt-task-facts">${avatar(t.owner, 30)}<div><b>${esc(fullName(t.owner))}</b><small>${t.stage === 'done' ? 'Selesai' : ''}${t.stage !== 'done' ? duePill(t.due, '') : ''} <span class="prio" style="--c:${PRIORITY[t.priority].color}"><i></i>${PRIORITY[t.priority].label}</span>${stuck ? ` <span class="tm-warn">${t.stageDays} hari di Dikerjakan</span>` : ''}</small></div></div>
      ${t.note ? `<p class="mt-task-note">${esc(t.note)}</p>` : ''}
      <div class="m-body">
        <div class="row">${icon('user', 18)}<div class="row-main"><small class="cap">Alihkan ke</small><select name="owner" class="mt-field">${MEMBERS.map((m) => `<option value="${m.code}" ${m.code === t.owner ? 'selected' : ''}>${esc(fullName(m.code))}</option>`).join('')}</select></div></div>
        <div class="row">${icon('clock', 18)}<div class="row-main"><small class="cap">Tenggat</small><label class="fld-date"><span>${esc(fmtLong(parseYmd(t.due)))}</span><input type="date" name="due" value="${t.due}" aria-label="Tenggat"></label></div></div>
        <div class="row">${icon('layers', 18)}<div class="row-main"><small class="cap">Tahap</small><select name="stage" class="mt-field">${TEAM_STAGES.map((x) => `<option value="${x.id}" ${x.id === t.stage ? 'selected' : ''}>${x.label}</option>`).join('')}</select></div></div>
        <p class="note">Perubahan disimpan di browser ini dan belum tersinkron ke aplikasi ${esc(t.app)}.</p>
      </div>
      <div class="m-foot">${t.stage !== 'done' ? `<button type="button" class="tm-act${reminded ? ' done' : ''}" data-remind ${reminded ? 'disabled' : ''}>${reminded ? `${icon('check', 12, 2.6)}Diingatkan` : `${icon('bell', 13, 2)}Ingatkan ${esc(shortName(t.owner))}`}</button>` : ''}<span class="flex"></span>
        <button type="button" class="btn ghost" data-close>Batal</button><button type="submit" class="btn primary">${icon('check', 15, 2.4)}Simpan perubahan</button></div>
    </form>`;
  root.classList.add('open');
  const close = () => { root.classList.remove('open'); root.innerHTML = ''; root.onclick = root.onchange = root.onsubmit = null; document.removeEventListener('keydown', onKey); lastFocus?.focus?.(); };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { const els = $$('button:not([disabled]), input, select', root); if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els.at(-1).focus(); } else if (!e.shiftKey && document.activeElement === els.at(-1)) { e.preventDefault(); els[0].focus(); } }
  };
  document.addEventListener('keydown', onKey);
  root.onclick = (e) => {
    if (e.target.matches?.('.fld-date input')) { try { e.target.showPicker(); } catch { /* browser lama */ } return; }
    const b = e.target.closest('button, .scrim');
    if (!b) return;
    if (b.hasAttribute('data-close')) close();
    if (b.hasAttribute('data-remind')) { remind(t.id); b.disabled = true; b.classList.add('done'); b.innerHTML = `${icon('check', 12, 2.6)}Diingatkan`; toast(`Pengingat untuk ${shortName(t.owner)} dicatat`); rerender(); }
  };
  root.onchange = (e) => { if (e.target.name === 'due' && e.target.value) e.target.previousElementSibling.textContent = fmtLong(parseYmd(e.target.value)); };
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const patch = {};
    if (f.owner.value !== t.owner) patch.owner = f.owner.value;
    if (f.due.value && f.due.value !== t.due) patch.due = f.due.value;
    if (f.stage.value !== t.stage) { patch.stage = f.stage.value; patch.stageDays = 0; }
    close();
    if (!Object.keys(patch).length) return;
    editTask(t.id, patch);
    rerender();
    toast(patch.owner ? `Task dialihkan ke ${shortName(patch.owner)}` : 'Perubahan task disimpan');
  };
  root.querySelector('[name=owner]').focus();
}

export function bind(root, rerender) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-view],[data-owner],[data-open],[data-assign],[data-reset]');
    if (!b) return;
    if (b.dataset.view) filters.view = b.dataset.view;
    if (b.dataset.owner) filters.owner = filters.owner === b.dataset.owner ? '' : b.dataset.owner;
    if (b.hasAttribute('data-reset')) { filters.owner = ''; filters.app = ''; filters.view = 'semua'; }
    if (b.dataset.open) { openTask(b.dataset.open, rerender); return; }
    if (b.hasAttribute('data-assign')) { openAssign(rerender, filters.owner || ''); return; }
    if (location.hash.includes('?')) history.replaceState(null, '', '#/task');
    rerender();
  };
  root.onchange = (e) => {
    const f = e.target.dataset.f;
    if (!f) return;
    filters[f] = e.target.value;
    if (location.hash.includes('?')) history.replaceState(null, '', '#/task');
    rerender();
  };
}
