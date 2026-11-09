import { icon } from '../../icons.js';
import { esc } from '../../utils.js';
import { TEAM_UNIT, MEMBERS, scoreOf, weekAttendance } from '../../team.js';
import { attendanceOf, approvals, taskStats, scoreStats, absences, shortName, rangeLabel } from '../../teamModel.js';
import { ymd, today } from '../../utils.js';
import { pageHead, kpi, statusPill, person, delta, STATUS } from '../kit.js';

let view = 'semua';
let sort = 'nama';

function rows() {
  const s = taskStats();
  const k0 = ymd(today());
  const abs = absences();
  return MEMBERS.map((m) => {
    const att = attendanceOf(m);
    const w = s.byOwner[m.code];
    const now = scoreOf(m);
    const next = abs.filter((a) => a.code === m.code && a.toDate >= k0).sort((a, b) => (a.fromDate < b.fromDate ? -1 : 1))[0];
    const flags = [];
    if (w.late >= 2) flags.push(`${w.late} task terlambat`);
    if (m.lateWeek >= 3) flags.push(`terlambat masuk ${m.lateWeek}×`);
    if (m.prev - now >= 5) flags.push(`skor turun ${m.prev - now}`);
    return { m, att, w, now, d: now - m.prev, next, flags, week: weekAttendance(m) };
  });
}

export function render() {
  const all = rows();
  const present = all.filter((r) => r.att === 'hadir' || r.att === 'terlambat').length;
  const s = taskStats();
  const sc = scoreStats();
  let list = all;
  if (view === 'perhatian') list = list.filter((r) => r.flags.length);
  if (view === 'luar') list = list.filter((r) => r.att === 'cuti' || r.att === 'dinas');
  list = [...list].sort((a, b) => (sort === 'task' ? b.w.open - a.w.open : sort === 'telat' ? b.w.late - a.w.late : a.m.code === b.m.code ? 0 : (a.m.code < b.m.code ? -1 : 1)));
  if (sort === 'nama') list.sort((a, b) => shortName(a.m.code).localeCompare(shortName(b.m.code), 'id'));
  const count = (v) => (v === 'semua' ? all.length : v === 'perhatian' ? all.filter((r) => r.flags.length).length : all.filter((r) => r.att === 'cuti' || r.att === 'dinas').length);
  return `<div class="mt-page mt-anggota">
    ${pageHead('Anggota tim', `${esc(TEAM_UNIT)} · ${MEMBERS.length} anggota langsung · klik baris untuk melihat profil`)}
    <div class="mt-kpis">
      ${kpi('Sudah masuk hari ini', `${present}<em>/${MEMBERS.length}</em>`, `${MEMBERS.length - present} belum atau tidak di kantor`)}
      ${kpi('Task aktif tim', s.open.length, `${s.late.length} terlambat · ${s.stuck.length} macet`, s.late.length ? 'red' : '')}
      ${kpi('Menunggu persetujuan', approvals().length, '<a class="link" href="#/approval">Buka Persetujuan</a>')}
      ${kpi(`Rata-rata skor ${sc.period}`, sc.now, `${sc.delta >= 0 ? 'naik' : 'turun'} ${Math.abs(sc.delta)} dari ${sc.prevPeriod}`)}
    </div>
    <article class="card glass mt-table-card">
      <div class="mt-toolbar">
        <div class="seg" role="tablist" aria-label="Tampilkan">${[['semua', 'Semua'], ['perhatian', 'Perlu perhatian'], ['luar', 'Tidak di kantor']].map(([k, l]) => `<button type="button" role="tab" aria-selected="${view === k}" class="${view === k ? 'on' : ''}" data-view="${k}">${l}<span class="mt-count">${count(k)}</span></button>`).join('')}</div>
        <span class="flex"></span>
        <label class="mt-select">Urutkan<select data-sort><option value="nama" ${sort === 'nama' ? 'selected' : ''}>Nama</option><option value="task" ${sort === 'task' ? 'selected' : ''}>Task aktif terbanyak</option><option value="telat" ${sort === 'telat' ? 'selected' : ''}>Task terlambat terbanyak</option></select></label>
      </div>
      <div class="mt-table-wrap scroll">
        <table class="mt-table">
          <thead><tr><th>Anggota</th><th>Hari ini</th><th>5 hari kerja</th><th class="num">Task aktif</th><th class="num">Terlambat</th><th class="num">Skor</th><th>Ketidakhadiran berikutnya</th><th>Perlu perhatian</th><th class="sr">Buka</th></tr></thead>
          <tbody>${list.map((r) => `<tr data-href="#/anggota/${r.m.code}" tabindex="0" aria-label="Buka profil ${esc(shortName(r.m.code))}">
            <td>${person(r.m.code, esc(r.m.role))}</td>
            <td>${statusPill(r.att, r.att === 'hadir' || r.att === 'terlambat' ? r.m.in : '')}</td>
            <td><span class="mt-week">${r.week.map((d) => `<i style="--c:${STATUS[d.status].color}" title="${esc(d.key)}: ${STATUS[d.status].label}${d.time ? ` ${d.time}` : ''}"></i>`).join('')}</span></td>
            <td class="num">${r.w.open}</td>
            <td class="num ${r.w.late ? 'red' : 'muted'}">${r.w.late}</td>
            <td class="num"><b>${r.now}</b> ${delta(r.d)}</td>
            <td>${r.next ? `<span class="mt-next">${esc(r.next.type === 'dinas' ? 'Dinas luar' : r.next.type === 'izin' ? 'Izin' : 'Cuti')} · ${esc(rangeLabel(r.next.fromDate, r.next.toDate))}</span>` : '<span class="muted">—</span>'}</td>
            <td>${r.flags.length ? r.flags.map((f) => `<span class="mt-flag">${esc(f)}</span>`).join('') : '<span class="muted">—</span>'}</td>
            <td class="go">${icon('chevR', 16, 2)}</td>
          </tr>`).join('') || `<tr><td colspan="9" class="mt-empty-row">Tidak ada anggota di tampilan ini.</td></tr>`}</tbody>
        </table>
      </div>
      <p class="mt-legend">${['hadir', 'terlambat', 'dinas', 'cuti', 'belum', 'nanti'].map((k) => `<span><i style="--c:${STATUS[k].color}"></i>${STATUS[k].label}</span>`).join('')}<span class="muted">· titik “5 hari kerja” = lima hari kerja terakhir sampai hari ini</span></p>
    </article>
  </div>`;
}

export function bind(root, rerender) {
  root.onclick = (e) => {
    const v = e.target.closest('[data-view]');
    if (v) { view = v.dataset.view; rerender(); return; }
    const tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a')) location.hash = tr.dataset.href;
  };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = (e) => { if (e.target.matches('[data-sort]')) { sort = e.target.value; rerender(); } };
}
