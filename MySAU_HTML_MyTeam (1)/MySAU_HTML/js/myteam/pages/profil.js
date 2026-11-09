import { icon } from '../../icons.js';
import { esc, today, ymd, DAYS_SHORT } from '../../utils.js';
import { PRIORITY } from '../../data.js';
import { MEMBERS, TEAM_UNIT, TEAM_STAGES, STUCK_DAYS, SCORE_WEIGHTS, SCORE_LABELS, scoreOf, weekAttendance, isReminded, remind, noteOf, setNote } from '../../team.js';
import { attendanceOf, taskStats, scoreStats, absences, fullName, shortName, rangeLabel, AWAY } from '../../teamModel.js';
import { avatar, toast, duePill } from '../../ui.js';
import { openAssign } from '../../pages/team.js';
import { statusPill, delta, bar, spark, STATUS, empty } from '../kit.js';

const stageLabel = (id) => TEAM_STAGES.find((s) => s.id === id)?.label || id;

export function render(code) {
  const i = MEMBERS.findIndex((m) => m.code === code);
  if (i < 0) return `<div class="mt-page">${empty('Anggota tidak ditemukan di tim Anda.')}<a class="link" href="#/anggota">Kembali ke daftar anggota</a></div>`;
  const m = MEMBERS[i];
  const prev = MEMBERS[(i - 1 + MEMBERS.length) % MEMBERS.length];
  const next = MEMBERS[(i + 1) % MEMBERS.length];
  const s = taskStats();
  const sc = scoreStats();
  const k0 = ymd(today());
  const att = attendanceOf(m);
  const mine = s.all.filter((t) => t.owner === m.code);
  const open = mine.filter((t) => t.stage !== 'done').sort((a, b) => (a.due < b.due ? -1 : 1));
  const done = mine.filter((t) => t.stage === 'done');
  const now = scoreOf(m);
  const series = [...m.hist, m.prev, now];
  const away = absences().filter((a) => a.code === m.code && a.toDate >= k0);
  const week = weekAttendance(m);
  const w = s.byOwner[m.code];

  return `<div class="mt-page mt-profil">
    <article class="card glass mt-profile-head">
      ${avatar(m.code, 64)}
      <div class="mt-ph-main">
        <h1>${esc(fullName(m.code))}</h1>
        <p class="muted">${esc(m.role)} · ${esc(TEAM_UNIT)} · bergabung ${esc(m.since)}</p>
        <div class="mt-ph-status">${statusPill(att, att === 'hadir' || att === 'terlambat' ? m.in : '')}</div>
      </div>
      <dl class="mt-facts">
        <div><dt>Task aktif</dt><dd>${w.open}</dd></div>
        <div><dt>Terlambat</dt><dd class="${w.late ? 'red' : ''}">${w.late}</dd></div>
        <div><dt>Skor ${esc(sc.period)}</dt><dd>${now} ${delta(now - m.prev)}</dd></div>
        <div><dt>Sisa cuti</dt><dd>${m.leaveLeft} <small>hari</small></dd></div>
      </dl>
      <div class="mt-ph-actions">
        <button type="button" class="btn primary" data-assign>${icon('plus', 14, 2.2)}Tugaskan task</button>
        <button type="button" class="btn ghost" data-oneonone>${icon('calendar', 14, 2)}Jadwalkan 1:1</button>
        <span class="mt-pager"><a class="icon-btn sm" href="#/anggota/${prev.code}" aria-label="Sebelumnya: ${esc(fullName(prev.code))}" title="${esc(fullName(prev.code))}">${icon('chevL', 15, 2)}</a><a class="icon-btn sm" href="#/anggota/${next.code}" aria-label="Berikutnya: ${esc(fullName(next.code))}" title="${esc(fullName(next.code))}">${icon('chevR', 15, 2)}</a></span>
      </div>
    </article>

    <div class="mt-profile-grid">
      <article class="card glass mt-p-tasks">
        <div class="card-head"><h2>Task ${esc(shortName(m.code))}</h2><span class="badge">${open.length}</span><span class="flex"></span><a class="link" href="#/task?owner=${m.code}">Lihat di papan</a></div>
        <ul class="mt-tlist scroll">${open.map((t) => {
          const stuck = t.stage === 'doing' && t.stageDays >= STUCK_DAYS;
          const reminded = isReminded(t.id);
          return `<li><div class="tm-main"><p>${esc(t.title)}</p><small>${esc(t.app)} · ${esc(stageLabel(t.stage))}${stuck ? ` · <span class="tm-warn">${t.stageDays} hari di sini</span>` : ''}</small><div class="mt-tmeta">${duePill(t.due, '')}<span class="prio" style="--c:${PRIORITY[t.priority].color}"><i></i>${PRIORITY[t.priority].label}</span>${t.assignedByMe ? '<span class="mt-flag soft">Dari Anda</span>' : ''}</div></div>
            <button type="button" class="tm-act${reminded ? ' done' : ''}" data-remind="${esc(t.id)}" ${reminded ? 'disabled' : ''}>${reminded ? `${icon('check', 12, 2.6)}Diingatkan` : 'Ingatkan'}</button></li>`;
        }).join('') || `<li>${empty('Tidak ada task aktif.')}</li>`}</ul>
        ${done.length ? `<p class="mt-done">${icon('checkCircle', 14, 2)}${done.length} task selesai baru-baru ini: ${done.map((t) => esc(t.title)).join(', ')}</p>` : ''}
      </article>

      <div class="mt-p-mid">
        <article class="card glass">
          <div class="card-head"><h2>Kehadiran 5 hari kerja</h2><span class="flex"></span><small class="muted">Masuk 08.00</small></div>
          <ul class="mt-days">${week.map((d) => `<li class="${d.key === k0 ? 'today' : ''}"><small>${DAYS_SHORT[d.d.getDay()]} ${d.d.getDate()}</small><i style="--c:${STATUS[d.status].color}"></i><b>${d.time ? esc(d.time) : d.status === 'nanti' ? '—' : esc(STATUS[d.status].label)}</b></li>`).join('')}</ul>
          <p class="mt-note">${m.lateWeek ? `Terlambat masuk ${m.lateWeek} kali dalam 5 hari kerja terakhir.` : 'Tidak pernah terlambat dalam 5 hari kerja terakhir.'}</p>
        </article>
        <article class="card glass">
          <div class="card-head"><h2>Cuti & dinas</h2><span class="flex"></span><small class="muted">Sisa cuti ${m.leaveLeft} hari</small></div>
          <ul class="mt-away">${away.map((a) => `<li><span class="tm-tag ${a.type}">${AWAY[a.type]}</span><span>${esc(rangeLabel(a.fromDate, a.toDate))}</span><small class="muted">${esc(a.note)}</small></li>`).join('') || '<li class="muted">Tidak ada jadwal cuti atau dinas.</li>'}</ul>
        </article>
        <article class="card glass mt-notes">
          <div class="card-head"><h2>Catatan 1:1</h2><span class="flex"></span><small class="muted" data-saved>Tersimpan di browser ini</small></div>
          <textarea data-note="${m.code}" rows="4" placeholder="Poin yang ingin dibahas, kesepakatan, atau dukungan yang dibutuhkan…">${esc(noteOf(m.code))}</textarea>
          <p class="mt-note">Hanya terlihat oleh Anda.</p>
        </article>
      </div>

      <article class="card glass mt-p-score">
        <div class="card-head"><h2>Skor</h2><span class="flex"></span><small class="muted">${esc(sc.period)} ${sc.year}</small></div>
        <div class="mt-score-big"><b>${now}</b>${delta(now - m.prev)}<small>dibanding ${esc(sc.prevPeriod)} (${m.prev})</small></div>
        ${spark(series, { w: 230, h: 60, labels: sc.labels })}
        <ul class="mt-comp">${Object.keys(SCORE_WEIGHTS).map((k) => {
          const teamAvg = sc.parts.find((p) => p.k === k).value;
          return `<li><span>${esc(SCORE_LABELS[k])} <em>${Math.round(SCORE_WEIGHTS[k] * 100)}%</em></span>${bar(m.score[k], m.score[k] < teamAvg - 5 ? '#E39A2D' : '#5B9BE0')}<b>${m.score[k]}</b><small>tim ${teamAvg}</small></li>`;
        }).join('')}</ul>
        <p class="mt-note">Skor = KPI × 50% + ketepatan waktu × 30% + kehadiran × 20%. Komponen di bawah rata-rata tim lebih dari 5 poin ditandai oranye.</p>
      </article>
    </div>
  </div>`;
}

export function bind(root, rerender, code) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-assign],[data-oneonone],[data-remind]');
    if (!b) return;
    if (b.hasAttribute('data-assign')) openAssign(rerender, code);
    if (b.hasAttribute('data-oneonone')) toast(`Undangan 1:1 dengan ${shortName(code)} belum terhubung ke Kalender; catat dulu poinnya di Catatan 1:1`);
    if (b.dataset.remind) { remind(b.dataset.remind); rerender(); toast(`Pengingat untuk ${shortName(code)} dicatat`); }
  };
  let timer;
  root.oninput = (e) => {
    if (!e.target.matches('[data-note]')) return;
    clearTimeout(timer);
    const label = root.querySelector('[data-saved]');
    label.textContent = 'Menyimpan…';
    timer = setTimeout(() => { setNote(e.target.dataset.note, e.target.value); label.textContent = 'Tersimpan di browser ini'; }, 400);
  };
}
