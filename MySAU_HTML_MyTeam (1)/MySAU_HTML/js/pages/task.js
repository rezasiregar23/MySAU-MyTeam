import { icon } from '../icons.js';
import { esc, today, fmtLong, ymd, weekStart, addDays, DAYS_MINI, sameDay } from '../utils.js';
import { PRIORITY, ACTIVITY, USER } from '../data.js';
import { state, update, activeTasks, sortByDue, history, counts } from '../store.js';
import { duePill, prioTag, avatars, avatar, toast, openAgendaModal } from '../ui.js';
import { LEADER_ROLES } from '../team.js';
import * as teamModel from '../teamModel.js';

let expanded = false;
let spotPlayed = false; // sorotan tombol Task tim hanya diputar sekali per kunjungan

/* Tombol menonjol ke papan task tim di aplikasi My Team (hanya untuk pemimpin) */
function teamSpot(where) {
  if (!LEADER_ROLES.includes(USER.role)) return '';
  const s = teamModel.taskStats();
  const spot = !spotPlayed;
  if (where === 'board') spotPlayed = true; // dirender terakhir
  return `<a class="team-spot ts-${where}${spot ? ' play' : ''}" href="myteam.html#/task" aria-label="Buka papan task tim di My Team: ${s.open.length} task aktif, ${s.late.length} terlambat">
    <span class="ts-ic">${icon('users', 16, 2)}</span>
    <span class="ts-txt"><b>Task tim saya</b><small>${s.open.length} aktif${s.late.length ? ` · <em>${s.late.length} terlambat</em>` : ''}</small></span>
    <span class="ts-go">${icon('arrowR', 14, 2.2)}</span>
  </a>`;
}
let sortMode = 'due';
let boardFilterApp = 'Semua aplikasi';
let boardFilterMine = 'Untuk saya';
let boardStages = {};
let boardOrder = {};
try { boardOrder = JSON.parse(localStorage.getItem('mysau.task.order')) || {}; } catch {}
try { boardStages = JSON.parse(localStorage.getItem('mysau.task.stages')) || {}; } catch {}
const STAGES = [
  { id: 'backlog', label: 'Backlog', color: 'slate' },
  { id: 'ready', label: 'Siap', color: 'blue' },
  { id: 'doing', label: 'Dikerjakan', color: 'amber' },
  { id: 'review', label: 'Review', color: 'violet' },
  { id: 'done', label: 'Selesai', color: 'green' },
];

const prioRank = { tinggi: 0, sedang: 1, rendah: 2 };

function focusTasks() {
  const act = activeTasks();
  const picked = act.filter((t) => t.focus).sort((a, b) => a.focus - b.focus);
  const rest = sortByDue(act.filter((t) => !t.focus)).sort((a, b) => prioRank[a.priority] - prioRank[b.priority]);
  return [...picked, ...rest].slice(0, 4);
}

function left() {
  const c = counts();
  const act = activeTasks();
  const by = { tinggi: 0, sedang: 0, rendah: 0 };
  act.forEach((t) => { by[t.priority] = (by[t.priority] || 0) + 1; });
  const max = Math.max(1, ...Object.values(by));
  const k = ymd(today());
  const urgent = sortByDue(act.filter((t) => t.due <= k && t.priority === 'tinggi')).sort((a, b) => (a.due < k ? -1 : 0) - (b.due < k ? -1 : 0)).slice(0, 2);
  const urgentAll = act.filter((t) => t.due <= k && t.priority === 'tinggi').length;
  // weekly progress
  const ws = weekStart(today());
  const hist = history();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ws, i), dk = ymd(d);
    return { d, done: hist.filter((h) => h.doneAt === dk).length, planned: act.filter((t) => t.due === dk).length };
  });
  const doneWeek = week.reduce((a, w) => a + w.done, 0);
  const plannedWeek = week.reduce((a, w) => a + w.planned, 0) + doneWeek;
  const wmax = Math.max(3, ...week.map((w) => w.done + w.planned));
  return `<section class="col col-left">
    <div class="page-title"><small class="eyebrow">Task saya · semua lokasi</small><h1>Task <span class="accent">Saya.</span></h1><p class="muted">Kelola pekerjaan dan kolaborasi Anda</p>${teamSpot('top')}</div>
    <div class="stat-row">
      <div class="stat glass sel"><small>Task aktif</small><b>${c.active}</b><small>dari ${c.apps} aplikasi</small></div>
      <div class="stat glass"><small>Jatuh tempo hari ini</small><b>${c.dueToday}</b><small class="${c.late ? 'red' : ''}">${c.late ? `<i class="d red"></i>${c.late} terlambat` : 'tidak ada yang terlambat'}</small></div>
    </div>
    <article class="card glass prio-card"><div class="card-head"><h3>Task berdasarkan prioritas</h3><span class="flex"></span><small class="muted">${c.active} total</small></div>
      ${Object.entries(PRIORITY).map(([key, p]) => `<div class="pbar"><span>${p.label}</span><i style="--w:${(by[key] / max) * 100}%;--c:${p.color}"></i><b>${by[key]}</b></div>`).join('')}
    </article>
    <article class="card glass urgent"><div class="card-head"><h3>Segera diselesaikan</h3><span class="flex"></span><small class="red">${urgentAll} mendesak</small></div>
      <ul>${urgent.map((t) => `<li class="task-row"><button type="button" class="check" data-done="${t.id}" aria-label="Tandai selesai: ${esc(t.title)}"></button><div class="tr-main"><p class="tr-title">${esc(t.title)}</p><div class="tr-sub">${duePill(t.due, t.time)}<span class="muted">${esc(t.app)}</span></div></div></li>`).join('') || '<li class="empty">Tidak ada task mendesak.</li>'}</ul>
    </article>
    <article class="card glass weekly"><div class="card-head"><h3>Progres minggu ini</h3><span class="flex"></span><small><b class="blue">${doneWeek}/${plannedWeek}</b> selesai</small></div>
      <div class="bars">${week.map((w, i) => {
        const isT = sameDay(w.d, today());
        const h = (v) => Math.max(v ? 10 : 0, (v / wmax) * 100);
        return `<div class="bcol${isT ? ' today' : ''}${i === 6 ? ' sun' : ''}" title="${w.done} selesai, ${w.planned} terjadwal">
          <div class="bstack">${w.planned ? `<i class="b plan" style="--h:${h(w.planned)}%"></i>` : ''}${w.done ? `<i class="b done" style="--h:${h(w.done)}%"></i>` : ''}${!w.done && !w.planned ? '<i class="b zero"></i>' : ''}</div><small>${DAYS_MINI[i]}</small></div>`;
      }).join('')}</div>
      <div class="legend"><span><i class="dot teal"></i>Selesai</span><span><i class="dot navy"></i>Hari ini</span><span><i class="dot ring"></i>Terjadwal</span></div>
    </article>
  </section>`;
}

function initialStage(t, index) {
  if (state.doneIds.includes(t.id)) return 'done';
  if (boardStages[t.id]) return boardStages[t.id];
  if (t.kind === 'Approval') return 'review';
  if (t.due < ymd(today()) || (t.sub && t.sub[0] > 0)) return 'doing';
  return index % 4 === 0 ? 'backlog' : 'ready';
}

function center() {
  const all = sortByDue(activeTasks());
  const source = [...all, ...history().map((h) => ({ ...h, priority: '', kind: 'Selesai', due: h.doneAt, people: [] }))];
  const staged = source.map((t, i) => ({ ...t, stage: t.doneAt || state.doneIds.includes(t.id) ? 'done' : initialStage(t, i) }));
  let visible = staged;
  if (boardFilterMine === 'Untuk saya') visible = visible.filter((t) => t.kind !== 'Approval' || t.people?.includes('SY') || t.people?.includes('BS'));
  if (boardFilterApp !== 'Semua aplikasi') visible = visible.filter((t) => t.app === boardFilterApp);
  const byStage = Object.fromEntries(STAGES.map((s) => [s.id, visible.filter((t) => t.stage === s.id).sort((a,b)=>(boardOrder[a.id] ?? 9999)-(boardOrder[b.id] ?? 9999))]));
  const appNames = [...new Set(all.map((t) => t.app))].sort();
  const cards = (items) => items.map((t) => {
    const late = t.due && t.due < ymd(today());
    const todayDue = t.due === ymd(today());
    return `<article class="kb-card glass" draggable="true" data-drag-task="${esc(t.id)}" tabindex="0" aria-label="${esc(t.title)}. Seret untuk mengubah status">
      <button type="button" class="kb-title" data-kb-open="${esc(t.id)}">${esc(t.title)}</button>
      <small class="kb-app">${esc(t.app)}</small>
      ${late || todayDue ? `<span class="kb-due${late ? ' late' : ''}">${late ? 'Terlambat' : 'Hari ini'}${todayDue && t.time ? ` · ${esc(t.time)}` : ''}</span>` : ''}
      <div class="kb-move"><button type="button" data-move="up" data-id="${esc(t.id)}" aria-label="Naikkan ${esc(t.title)}">↑</button><button type="button" data-move="down" data-id="${esc(t.id)}" aria-label="Turunkan ${esc(t.title)}">↓</button></div>
    </article>`;
  }).join('');
  return `<section class="col col-center kanban-center">
    <div class="kb-head"><div class="kb-title-row"><h2>Papan task</h2>${teamSpot('board')}</div><div class="kb-controls">
      <select aria-label="Filter task" data-kb-mine><option ${boardFilterMine === 'Untuk saya' ? 'selected' : ''}>Untuk saya</option><option ${boardFilterMine === 'Semua task' ? 'selected' : ''}>Semua task</option></select>
      <select aria-label="Filter aplikasi" data-kb-app><option>Semua aplikasi</option>${appNames.map(n => `<option ${boardFilterApp === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <button type="button" class="btn primary kb-add" data-action="addTask">${icon('plus',14,2.2)}Task</button>
    </div></div>
    <div class="kb-board">${STAGES.map((stage) => `<section class="kb-column" data-drop-stage="${stage.id}">
      <header><i class="kb-dot ${stage.color}"></i><b>${stage.label}</b><span>${byStage[stage.id].length}</span></header>
      <div class="kb-list" tabindex="0" aria-label="Daftar task ${stage.label}">${cards(byStage[stage.id]) || '<p class="kb-empty">Kosong</p>'}</div>
    </section>`).join('')}</div>
    <p class="kb-hint">Seret kartu untuk mengurutkan atau pindah kolom. Gunakan ↑ ↓ untuk urutan.</p>
  </section>`;
}

function right() {
  const tab = state.ui.taskTab;
  let list = activeTasks();
  list = sortMode === 'due' ? sortByDue(list) : [...sortByDue(list)].sort((a, b) => prioRank[a.priority] - prioRank[b.priority]);
  const shown = expanded ? list : list.slice(0, 4);
  const hist = history();
  return `<section class="col col-right">
    <article class="card glass all-tasks">
      <div class="card-head"><h2>Semua task</h2><span class="badge">${list.length}</span><span class="flex"></span>
        <button type="button" class="icon-btn sm" data-action="sort" aria-label="Urutkan" title="Urutkan: ${sortMode === 'due' ? 'tenggat' : 'prioritas'}">${icon('filter', 16, 2)}</button></div>
      <div class="seg full" role="tablist"><button type="button" role="tab" class="${tab === 'tugas' ? 'on' : ''}" aria-selected="${tab === 'tugas'}" data-ttab="tugas">Tugas</button><button type="button" role="tab" class="${tab === 'riwayat' ? 'on' : ''}" aria-selected="${tab === 'riwayat'}" data-ttab="riwayat">Riwayat</button></div>
      <ul class="at-list scroll" tabindex="0" aria-label="Daftar semua task">
      ${tab === 'tugas' ? shown.map((t) => `<li class="at-row">
          <button type="button" class="check" data-done="${t.id}" aria-label="Tandai selesai: ${esc(t.title)}"></button>
          <div class="tr-main"><p class="tr-title">${esc(t.title)}</p><small class="muted app">${icon('layers', 13)}${esc(t.app)} · ${esc(t.code)}</small>
            <div class="tr-sub plain">${duePill(t.due, t.time)}${prioTag(t.priority)}<span class="flex"></span>${avatars(t.people, 22)}</div></div></li>`).join('')
        : hist.map((h) => `<li class="at-row done"><span class="check on">${icon('check', 12, 3)}</span><div class="tr-main"><p class="tr-title">${esc(h.title)}</p><small class="muted">${esc(h.app)} · selesai ${h.doneAt === ymd(today()) ? 'hari ini' : h.doneAt}${h.time ? `, ${h.time}` : ''}</small></div>${state.doneIds.includes(h.id) ? `<button type="button" class="link" data-undo="${h.id}">Urungkan</button>` : ''}</li>`).join('')}
      </ul>
      ${tab === 'tugas' && list.length > 4 ? `<button type="button" class="link center" data-action="expand">${expanded ? 'Tampilkan lebih sedikit' : `Lihat semua ${list.length} task`} ${icon('arrowR', 13, 2)}</button>` : ''}
    </article>
    <article class="card glass activity"><div class="card-head"><span class="ic-chip">${icon('message', 16)}</span><h2>Aktivitas kolaborasi</h2><span class="flex"></span><span class="live"><i></i>Live</span></div>
      <ul>${ACTIVITY.map((a) => `<li>${avatar(a.who, 30)}<div><p>${esc(a.text)}<small>${esc(a.ago)}</small></p>${a.quote ? `<q>${esc(a.quote.replace(/[“”]/g, ''))}</q>` : `<small class="muted ref">${icon(a.icon, 13)}${esc(a.ref)}</small>`}</div></li>`).join('')}</ul>
    </article>
  </section>`;
}

export function render() {
  return `<div class="page page-task">${left()}${center()}${right()}</div>`;
}

export function bind(root, rerender) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-action],[data-done],[data-ttab],[data-undo],[data-kb-open],[data-move]');
    if (!b) return;
    if (b.dataset.move) {
      const list=b.closest('.kb-list');const ids=[...list.querySelectorAll('[data-drag-task]')].map(c=>c.dataset.dragTask);
      const i=ids.indexOf(b.dataset.id),j=i+(b.dataset.move==='up'?-1:1);
      if(j<0||j>=ids.length)return;
      [ids[i],ids[j]]=[ids[j],ids[i]];ids.forEach((id,n)=>boardOrder[id]=n);
      try{localStorage.setItem('mysau.task.order',JSON.stringify(boardOrder));}catch{}
      rerender();root.querySelector(`[data-id="${b.dataset.id}"][data-move="${b.dataset.move}"]`)?.focus();return;
    }
    if (b.dataset.kbOpen) { const t = [...activeTasks(), ...history()].find(x => x.id === b.dataset.kbOpen); if (t) toast(`${t.title} · ${t.app} · ${t.code || 'Task'}`); return; }
    if (b.dataset.action === 'addTask') openAgendaModal({ mode: 'task' });
    if (b.dataset.action === 'expand') { expanded = !expanded; rerender(); }
    if (b.dataset.action === 'sort') { sortMode = sortMode === 'due' ? 'prio' : 'due'; rerender(); toast(`Diurutkan berdasarkan ${sortMode === 'due' ? 'tenggat' : 'prioritas'}`); }
    if (b.dataset.ttab) update((s) => { s.ui.taskTab = b.dataset.ttab; }, { persist: false });
    if (b.dataset.done) {
      const id = b.dataset.done;
      update((s) => { s.doneIds.push(id); });
      toast('Task ditandai selesai', { label: 'Urungkan', run: () => update((s) => { s.doneIds = s.doneIds.filter((x) => x !== id); }) });
    }
    if (b.dataset.undo) update((s) => { s.doneIds = s.doneIds.filter((x) => x !== b.dataset.undo); });
  };
  root.querySelector('[data-kb-app]').onchange = (e) => { boardFilterApp = e.target.value; rerender(); };
  root.querySelector('[data-kb-mine]').onchange = (e) => { boardFilterMine = e.target.value; rerender(); };
  let dragged = null;
  root.querySelectorAll('[data-drag-task]').forEach(card => {
    card.ondragstart = (e) => { dragged = card.dataset.dragTask; e.dataTransfer.setData('text/plain', dragged); card.classList.add('dragging'); };
    card.ondragend = () => { dragged = null; card.classList.remove('dragging'); };
  });
  root.querySelectorAll('[data-drop-stage]').forEach(col => {
    col.ondragover = (e) => { e.preventDefault(); col.classList.add('drop-target');const list=col.querySelector('.kb-list'),rect=list.getBoundingClientRect();if(e.clientY<rect.top+45)list.scrollTop-=12;if(e.clientY>rect.bottom-45)list.scrollTop+=12; };
    col.ondragleave = (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove('drop-target'); };
    col.ondrop = (e) => {
      e.preventDefault(); col.classList.remove('drop-target'); const id = e.dataTransfer.getData('text/plain') || dragged; if (!id) return;
      const ids=[...col.querySelectorAll('[data-drag-task]')].map(c=>c.dataset.dragTask).filter(x=>x!==id);
      const target=e.target.closest('[data-drag-task]');let index=target?ids.indexOf(target.dataset.dragTask):-1;
      if(index>=0&&e.clientY>target.getBoundingClientRect().top+target.getBoundingClientRect().height/2)index++;
      ids.splice(index<0?ids.length:index,0,id);ids.forEach((x,n)=>boardOrder[x]=n);
      try{localStorage.setItem('mysau.task.order',JSON.stringify(boardOrder));}catch{}
      boardStages[id] = col.dataset.dropStage;
      if (col.dataset.dropStage === 'done') update(st => { if (!st.doneIds.includes(id)) st.doneIds.push(id); });
      else { update(st => { st.doneIds = st.doneIds.filter(x => x !== id); }); }
      try { localStorage.setItem('mysau.task.stages', JSON.stringify(boardStages)); } catch {}
      rerender();
    };
  });
}
