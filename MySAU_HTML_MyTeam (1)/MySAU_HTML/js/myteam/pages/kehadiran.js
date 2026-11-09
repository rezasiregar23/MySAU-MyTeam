import { esc, today, ymd, addDays, DAYS_SHORT, MONTHS_SHORT } from '../../utils.js';
import { USER } from '../../data.js';
import { MEMBERS, SHIFT_TOLERANCE, weekAttendance } from '../../team.js';
import { activeTasks } from '../../store.js';
import { absences, rangeLabel, AWAY } from '../../teamModel.js';
import { pageHead, kpi, person, STATUS } from '../kit.js';

export function render() {
  const k0 = ymd(today());
  const weeks = MEMBERS.map((m) => ({ m, days: weekAttendance(m) }));
  const days = weeks[0].days;
  const cells = weeks.flatMap((w) => w.days).filter((d) => d.status !== 'nanti');
  const n = (st) => cells.filter((d) => d.status === st).length;
  const worked = n('hadir') + n('terlambat');
  const onTime = worked ? Math.round((n('hadir') / worked) * 100) : 0;
  const first = days[0].d, last = days[4].d;
  const upcoming = absences().filter((a) => a.toDate >= k0 && a.fromDate <= ymd(addDays(today(), 14))).sort((a, b) => (a.fromDate < b.fromDate ? -1 : 1));
  const pending = new Set(activeTasks().map((t) => t.id));
  const repeat = MEMBERS.filter((m) => m.lateWeek >= 2).sort((a, b) => b.lateWeek - a.lateWeek);
  return `<div class="mt-page mt-hadir">
    ${pageHead('Kehadiran tim', `5 hari kerja terakhir, ${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]} ${last.getFullYear()} · jam masuk ${esc(USER.shift.start)}, dihitung terlambat setelah ${SHIFT_TOLERANCE}`)}
    <div class="mt-kpis">
      ${kpi('Tepat waktu', `${onTime}<em>%</em>`, `${n('hadir')} dari ${worked} kehadiran`)}
      ${kpi('Terlambat masuk', n('terlambat'), 'kali dalam 5 hari kerja', n('terlambat') >= 4 ? 'amber' : '')}
      ${kpi('Cuti / izin', n('cuti'), 'hari-orang dalam 5 hari kerja')}
      ${kpi('Dinas luar', n('dinas'), 'hari-orang dalam 5 hari kerja')}
    </div>
    <div class="mt-hadir-grid">
      <article class="card glass mt-table-card">
        <div class="mt-table-wrap scroll">
          <table class="mt-table mt-att-table">
            <thead><tr><th>Anggota</th>${days.map((d) => `<th class="${d.key === k0 ? 'today' : ''}">${DAYS_SHORT[d.d.getDay()]} ${d.d.getDate()}</th>`).join('')}<th class="num">Terlambat</th></tr></thead>
            <tbody>${weeks.map(({ m, days: ds }) => `<tr data-href="#/anggota/${m.code}" tabindex="0">
              <td>${person(m.code, esc(m.role), 28)}</td>
              ${ds.map((d) => `<td class="${d.key === k0 ? 'today' : ''}"><span class="mt-cell" style="--c:${STATUS[d.status].color}">${d.time ? esc(d.time) : d.status === 'nanti' ? '—' : esc(STATUS[d.status].label)}</span></td>`).join('')}
              <td class="num ${m.lateWeek >= 3 ? 'red' : ''}">${m.lateWeek}×</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="mt-legend">${['hadir', 'terlambat', 'dinas', 'cuti', 'belum', 'nanti'].map((k) => `<span><i style="--c:${STATUS[k].color}"></i>${STATUS[k].label}</span>`).join('')}</p>
      </article>
      <div class="mt-side-col">
        <article class="card glass">
          <div class="card-head"><h2>Akan tidak di kantor</h2><span class="flex"></span><small class="muted">14 hari</small></div>
          <ul class="mt-away">${upcoming.map((a) => `<li><a href="#/anggota/${a.code}">${person(a.code, `${esc(rangeLabel(a.fromDate, a.toDate))}${a.approvalTask && pending.has(a.approvalTask) ? ' · <span class="tm-warn">menunggu persetujuan</span>' : ''}`, 28)}</a><span class="tm-tag ${a.type}">${AWAY[a.type]}</span></li>`).join('') || '<li class="muted">Tidak ada jadwal cuti atau dinas.</li>'}</ul>
        </article>
        <article class="card glass">
          <div class="card-head"><h2>Terlambat berulang</h2></div>
          <ul class="mt-away">${repeat.map((m) => `<li><a href="#/anggota/${m.code}">${person(m.code, `${m.lateWeek} kali dalam 5 hari kerja`, 28)}</a></li>`).join('') || '<li class="muted">Tidak ada yang terlambat lebih dari sekali.</li>'}</ul>
          <p class="mt-note">Sebaiknya dibahas langsung di 1:1, bukan lewat pengumuman.</p>
        </article>
      </div>
    </div>
  </div>`;
}

export function bind(root) {
  root.onclick = (e) => { const tr = e.target.closest('tr[data-href]'); if (tr && !e.target.closest('a')) location.hash = tr.dataset.href; };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = null;
}
