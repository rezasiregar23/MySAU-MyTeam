import { icon } from '../icons.js';
import { esc, today, ymd, addDays, parseYmd, fmtLong, $$ } from '../utils.js';
import { USER, PRIORITY } from '../data.js';
import { update, activeTasks } from '../store.js';
import { avatar, toast } from '../ui.js';
import { assistantOpenLetter } from './inoffice.js';
import { TEAM_UNIT, MEMBERS, STUCK_DAYS, teamTasks, assignTask, isReminded, remind, absences, decide, undoDecision } from '../team.js';
import { ATT, AWAY, fullName, shortName, dayLabel, rangeLabel, inSentence, attendanceOf, approvals, taskStats, scoreStats, awayList, attention } from '../teamModel.js';

// Dashboard detail ada di aplikasi My Team (myteam.html), terpisah dari MySAU
export const MYTEAM_URL = 'myteam.html';
const DETAIL_ROUTES = { Approval: 'approval', Kehadiran: 'kehadiran', 'Task tim': 'task', 'Skor tim': 'skor' };
const detail = (label) => `<a class="icon-btn sm tm-detail" href="${MYTEAM_URL}#/${DETAIL_ROUTES[label]}" aria-label="Buka ${esc(label)} di My Team" title="Buka ${esc(label)} di My Team">${icon('arrowUR', 15, 2)}</a>`;

/* ---------- sections ---------- */
function hero(att, appr) {
  const present = att.filter((a) => a === 'hadir' || a === 'terlambat').length;
  const groups = Object.keys(ATT).map((k) => ({ k, ...ATT[k], who: MEMBERS.filter((_, i) => att[i] === k).map((m) => m.code) })).filter((g) => g.who.length);
  return `<div class="tm-hero">
    <span class="date-pill">${icon('users', 13, 2)}<span>${esc(fmtLong(today()))} · masuk ${esc(USER.shift.start)}</span></span>
    <h1><b>${present} dari ${MEMBERS.length}</b> anggota tim sudah masuk.<br>${appr.length ? `<b>${appr.length} hal</b> menunggu persetujuan Anda.` : 'Tidak ada yang menunggu persetujuan Anda.'}</h1>
    <div class="tm-attbar" role="img" aria-label="Kehadiran hari ini: ${groups.map((g) => `${g.label} ${g.who.length}`).join(', ')}">${groups.map((g) => `<i style="--c:${g.color};flex:${g.who.length}"></i>`).join('')}</div>
    <ul class="tm-attlist">${groups.map((g) => `<li><i class="tm-dot" style="--c:${g.color}"></i><span>${g.label} <b>${g.who.length}</b></span><span class="avs">${g.who.map((c) => avatar(c, 22)).join('')}</span></li>`).join('')}</ul>
    <a class="link tm-open" href="${MYTEAM_URL}#/anggota">${icon('grid', 13, 2)}Buka aplikasi My Team</a>
  </div>`;
}

function approvalCard(list) {
  const oldest = list[0];
  const waitText = (w) => (w === 0 ? 'Masuk hari ini' : `Menunggu ${w} hari`);
  return `<article class="card glass tm-approvals">
    <div class="card-head"><h2>Perlu persetujuan Anda</h2>${list.length ? `<span class="badge">${list.length}</span>` : ''}<span class="flex"></span>${detail('Approval')}</div>
    ${list.length ? `<p class="tm-sub">${oldest.wait ? `Terlama menunggu ${oldest.wait} hari` : 'Semua baru masuk hari ini'}</p>
    <ul class="tm-list scroll" tabindex="0" aria-label="Daftar yang perlu persetujuan">${list.map((a) => `<li class="tm-appr">
      ${a.who ? avatar(a.who, 30) : `<span class="ic-chip">${icon(a.kind === 'letter' ? 'mail' : 'file', 15)}</span>`}
      <div class="tm-main"><p>${esc(a.title)}</p><small><span class="${a.wait >= 3 ? 'tm-warn' : ''}">${waitText(a.wait)}</span> · ${esc(a.app)}</small></div>
      ${a.kind === 'letter' ? `<button type="button" class="tm-act" data-letter="${esc(a.id)}">${esc(a.action)}</button>` : `<button type="button" class="tm-act" data-approve="${esc(a.id)}" aria-label="Setujui ${esc(a.title)}">Setujui</button>`}
    </li>`).join('')}</ul>`
    : `<p class="empty">Semua pengajuan tim sudah Anda proses.</p>`}
  </article>`;
}

function taskCard(s) {
  const total = Math.max(1, s.byStage.reduce((n, x) => n + x.n, 0));
  const k = ymd(today());
  return `<article class="card glass tm-tasks">
    <div class="card-head"><h2>Task tim</h2><span class="flex"></span><button type="button" class="btn primary tm-assign" data-assign>${icon('plus', 14, 2.2)}Tugaskan task</button>${detail('Task tim')}</div>
    <div class="tm-stats">
      <div class="tm-stat${s.late.length ? ' red' : ''}"><b>${s.late.length}</b><small>Terlambat</small></div>
      <div class="tm-stat${s.stuck.length ? ' amber' : ''}"><b>${s.stuck.length}</b><small>Macet ${STUCK_DAYS}+ hari</small></div>
      <div class="tm-stat"><b>${s.dueToday.length}</b><small>Tenggat hari ini</small></div>
      <div class="tm-stat"><b>${s.open.length}</b><small>Task aktif</small></div>
    </div>
    <div class="tm-stagebar" role="img" aria-label="${s.byStage.map((x) => `${x.label} ${x.n}`).join(', ')}">${s.byStage.filter((x) => x.n).map((x) => `<i style="--c:${x.color};width:${(x.n / total) * 100}%"></i>`).join('')}</div>
    <div class="legend tm-stagelegend">${s.byStage.map((x) => `<span><i class="dot" style="background:${x.color}"></i>${x.label} ${x.n}</span>`).join('')}</div>
    <h3 class="tm-h3">Paling mendesak</h3>
    <ul class="tm-urgent">${s.urgent.map((t) => {
      const ld = s.lateDays(t);
      const bits = [ld ? `<span class="tm-late">Terlambat ${ld} hari</span>` : t.due === k ? '<span class="tm-warn">Tenggat hari ini</span>' : '', s.isStuck(t) ? `${t.stageDays} hari di Dikerjakan` : ''].filter(Boolean).join(' · ');
      const done = isReminded(t.id);
      return `<li>${avatar(t.owner, 30)}<div class="tm-main"><p>${esc(t.title)}</p><small>${esc(shortName(t.owner))} · ${bits}</small></div>
        <button type="button" class="tm-act${done ? ' done' : ''}" data-remind="${esc(t.id)}" ${done ? 'disabled' : ''}>${done ? `${icon('check', 12, 2.6)}Diingatkan` : 'Ingatkan'}</button></li>`;
    }).join('') || '<li class="empty">Tidak ada task yang terlambat atau macet.</li>'}</ul>
  </article>`;
}

function attentionCard(items) {
  return `<article class="card glass tm-attn">
    <div class="card-head"><h2>Perlu perhatian</h2><span class="flex"></span><small class="muted">Dibuat otomatis dari data tim</small></div>
    ${items.length ? `<ul>${items.map((x) => `<li class="tone-${x.tone}">${x.who ? `<a class="tm-attn-link" href="${MYTEAM_URL}#/anggota/${x.who}">` : '<div class="tm-attn-link">'}<span class="tm-ic">${icon(x.ic, 16, 2)}</span><div><p>${esc(x.text)}</p><small>${esc(x.sub)}</small></div>${x.who ? '</a>' : '</div>'}</li>`).join('')}</ul>`
    : `<p class="tm-ok">${icon('checkCircle', 18, 2)}Semua aman. Tidak ada yang perlu ditindaklanjuti hari ini.</p>`}
  </article>`;
}

function scoreCard(sc) {
  const W = 132, H = 44, min = Math.min(...sc.series) - 2, max = Math.max(...sc.series) + 2;
  const pts = sc.series.map((v, i) => [(i / (sc.series.length - 1)) * W, H - ((v - min) / (max - min)) * H]);
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts.at(-1);
  const trend = sc.delta > 0 ? `naik ${sc.delta} poin` : sc.delta < 0 ? `turun ${-sc.delta} poin` : 'sama';
  return `<article class="card glass tm-score">
    <div class="card-head"><h2>Skor tim</h2><span class="flex"></span><small class="muted">${esc(sc.period)} ${sc.year}</small>${detail('Skor tim')}</div>
    <div class="tm-score-top">
      <div><b class="tm-big">${sc.now}</b><small class="tm-trend ${sc.delta >= 0 ? 'up' : 'down'}">${trend} dari ${esc(sc.prevPeriod)}</small></div>
      <svg class="tm-spark" viewBox="-12 -6 ${W + 24} ${H + 22}" role="img" aria-label="Rata-rata skor tim 6 bulan: ${sc.series.join(', ')}">
        <path d="${path}" fill="none" stroke="#5B9BE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${lx}" cy="${ly}" r="3.5" fill="#1D49A3" stroke="#fff" stroke-width="1.5"/>
        ${pts.map(([x], i) => `<text x="${x}" y="${H + 14}" text-anchor="middle">${sc.labels[i]}</text>`).join('')}
      </svg>
    </div>
    <ul class="tm-parts">${sc.parts.map((p) => `<li><span>${esc(p.label)} <em>${Math.round(p.weight * 100)}%</em></span><i style="--w:${p.value}%"></i><b>${p.value}</b></li>`).join('')}</ul>
    <p class="tm-foot">${sc.down.length ? `${sc.down.length} orang skornya turun dibanding ${esc(sc.prevPeriod)}.` : `Tidak ada skor yang turun dibanding ${esc(sc.prevPeriod)}.`}</p>
  </article>`;
}

function awayCard({ away, birthdays }) {
  const rows = [
    ...away.map((a) => `<li>${avatar(a.code, 28)}<div class="tm-main"><p>${esc(shortName(a.code))} <span class="tm-tag ${a.type}">${AWAY[a.type]}</span></p><small>${esc(rangeLabel(a.fromDate, a.toDate))}${a.pending ? ' · <span class="tm-warn">menunggu persetujuan Anda</span>' : ''}</small></div></li>`),
    ...birthdays.map((b) => `<li><span class="tm-gift">${icon('gift', 15, 2)}</span><div class="tm-main"><p>${esc(shortName(b.code))} ulang tahun</p><small>${esc(dayLabel(b.date))}</small></div></li>`),
  ];
  return `<article class="card glass tm-away">
    <div class="card-head"><h2>Tidak di kantor</h2><span class="flex"></span><small class="muted">7 hari ke depan</small></div>
    <ul class="tm-list scroll" tabindex="0" aria-label="Anggota yang tidak di kantor">${rows.join('') || '<li class="empty">Semua anggota di kantor minggu ini.</li>'}</ul>
  </article>`;
}

function membersCard(att, s) {
  const PRESENCE = { hadir: '#3DAFA3', terlambat: '#3DAFA3', dinas: '#9C8BE8', cuti: '#9C8BE8', belum: '#B4C0D0' };
  return `<article class="card glass tm-members">
    <div class="card-head"><h2>Anggota tim</h2><span class="badge">${MEMBERS.length}</span><span class="flex"></span></div>
    <ul class="tm-grid">${MEMBERS.map((m, i) => {
      const w = s.byOwner[m.code];
      return `<li><a href="${MYTEAM_URL}#/anggota/${m.code}" title="${esc(fullName(m.code))} · ${esc(m.role)} · ${ATT[att[i]].label} · ${w.open} task aktif${w.late ? `, ${w.late} terlambat` : ''}">
        <span class="tm-av">${avatar(m.code, 34)}<i style="--c:${PRESENCE[att[i]]}"></i>${w.late ? `<em>${w.late}</em>` : ''}</span>
        <b>${esc(shortName(m.code))}</b><small class="${w.open >= 5 ? 'tm-warn' : ''}">${w.open} task</small></a></li>`;
    }).join('')}</ul>
    <div class="legend tm-mlegend"><span><i class="tm-dot sm" style="--c:${PRESENCE.hadir}"></i>Di kantor</span><span><i class="tm-dot sm" style="--c:${PRESENCE.cuti}"></i>Tidak di kantor</span><span><i class="tm-dot sm" style="--c:${PRESENCE.belum}"></i>Belum absen</span><span><em class="tm-latebadge">2</em>Terlambat</span></div>
  </article>`;
}

export const badge = () => approvals().length;

export function render() {
  const att = MEMBERS.map(attendanceOf);
  const appr = approvals();
  const s = taskStats();
  return `<div class="page page-team">
    <section class="col col-left">${approvalCard(appr)}${attentionCard(attention(s))}</section>
    <section class="col col-center">${hero(att, appr)}${taskCard(s)}</section>
    <section class="col col-right">${scoreCard(scoreStats())}${awayCard(awayList())}${membersCard(att, s)}</section>
  </div>`;
}

/* ---------- tugaskan task ---------- */
export function openAssign(rerender, preset) {
  const root = document.getElementById('modalRoot');
  const s = taskStats();
  const k0 = ymd(today());
  const abs = absences();
  const st = { owner: preset || '', priority: 'sedang', app: 'HRIS', due: ymd(addDays(today(), 3)), title: '', note: '' };
  const lastFocus = document.activeElement;
  const members = [...MEMBERS].sort((a, b) => s.byOwner[a.code].open - s.byOwner[b.code].open);
  const awayNote = (code) => {
    const a = abs.find((x) => x.code === code && x.toDate >= k0 && x.fromDate <= st.due);
    return a ? `${AWAY[a.type]} ${inSentence(rangeLabel(a.fromDate, a.toDate))}` : '';
  };
  const draw = () => {
    root.innerHTML = `<div class="scrim" data-close></div>
      <form class="modal glass-strong tm-modal" role="dialog" aria-modal="true" aria-labelledby="tmTitle" novalidate>
        <div class="md-head"><div class="md-title"><small id="tmTitle">Tugaskan task ke tim</small>
          <input name="title" class="m-title" placeholder="Judul task, mis. Siapkan data migrasi HRIS" value="${esc(st.title)}" autocomplete="off" aria-labelledby="tmTitle"></div>
          <button type="button" class="icon-btn sm" data-close aria-label="Tutup">${icon('x', 16, 2)}</button></div>
        <div class="m-body">
          <div class="row">${icon('user', 18)}<div class="row-main"><small class="cap">Penerima · diurutkan dari task aktif paling sedikit</small>
            <div class="tm-pick" role="radiogroup" aria-label="Penerima">${members.map((m) => {
              const note = awayNote(m.code); const w = s.byOwner[m.code];
              return `<button type="button" role="radio" aria-checked="${st.owner === m.code}" class="tm-pick-row${st.owner === m.code ? ' on' : ''}" data-owner="${m.code}">${avatar(m.code, 26)}<span><b>${esc(fullName(m.code))}</b><small>${w.open} task aktif${w.late ? ` · ${w.late} terlambat` : ''}${note ? ` · <span class="tm-warn">${esc(note)}</span>` : ''}</small></span>${st.owner === m.code ? icon('check', 15, 2.4) : ''}</button>`;
            }).join('')}</div></div></div>
          <div class="row">${icon('clock', 18)}<div class="row-main"><div class="inline"><span class="lbl">Tenggat</span><label class="fld-date"><span>${esc(fmtLong(parseYmd(st.due)))}</span><input type="date" name="due" value="${st.due}" min="${k0}" aria-label="Tanggal tenggat"></label></div></div></div>
          <div class="row">${icon('flag', 18)}<div class="row-main"><small class="cap">Prioritas</small><div class="chips">${Object.entries(PRIORITY).reverse().map(([key, p]) => `<button type="button" class="opt ${st.priority === key ? 'on' : ''}" data-prio="${key}" style="--c:${p.color}"><i></i>${p.label}</button>`).join('')}</div></div></div>
          <div class="row">${icon('grid', 18)}<div class="row-main"><small class="cap">Aplikasi terkait</small><div class="chips">${['HRIS', 'Pervoms', 'InOffice', 'Digital Patrol', 'MySAU'].map((a) => `<button type="button" class="opt ${st.app === a ? 'on' : ''}" data-app="${a}" style="--c:#2F6FD0"><i></i>${a}</button>`).join('')}</div></div></div>
          <div class="row">${icon('align', 18)}<div class="row-main"><textarea name="note" rows="2" placeholder="Catatan atau hasil yang diharapkan" class="fld-plain">${esc(st.note)}</textarea></div></div>
          <p class="note">Task masuk ke kolom Siap di papan tim. Di prototype ini tersimpan di browser dan tidak mengirim notifikasi ke penerima.</p>
        </div>
        <p class="m-error" hidden></p>
        <div class="m-foot"><span class="flex"></span><button type="button" class="btn ghost" data-close>Batal</button><button type="submit" class="btn primary">${icon('check', 15, 2.4)}Tugaskan</button></div>
      </form>`;
    root.classList.add('open');
  };
  const read = () => { const f = root.querySelector('form'); if (!f) return; st.title = f.title.value; st.note = f.note.value; st.due = f.due.value || st.due; };
  const close = () => { root.classList.remove('open'); root.innerHTML = ''; root.onclick = root.onchange = root.onsubmit = null; document.removeEventListener('keydown', onKey); lastFocus?.focus?.(); };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const els = $$('button:not([disabled]), input, textarea', root);
      if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === els.at(-1)) { e.preventDefault(); els[0].focus(); }
    }
  };
  document.addEventListener('keydown', onKey);
  root.onclick = (e) => {
    if (e.target.matches?.('.fld-date input')) { try { e.target.showPicker(); } catch { /* browser lama */ } return; }
    const b = e.target.closest('button, .scrim');
    if (!b) return;
    if (b.hasAttribute('data-close')) { close(); return; }
    read();
    const focusSel = b.dataset.owner ? `[data-owner="${b.dataset.owner}"]` : b.dataset.prio ? `[data-prio="${b.dataset.prio}"]` : b.dataset.app ? `[data-app="${b.dataset.app}"]` : null;
    if (b.dataset.owner) st.owner = b.dataset.owner;
    if (b.dataset.prio) st.priority = b.dataset.prio;
    if (b.dataset.app) st.app = b.dataset.app;
    if (focusSel) { draw(); root.querySelector(focusSel)?.focus(); }
  };
  root.onchange = (e) => { if (e.target.name === 'due' && e.target.value) { read(); draw(); root.querySelector('[name=due]').focus(); } };
  root.onsubmit = (e) => {
    e.preventDefault();
    read();
    const err = root.querySelector('.m-error');
    if (!st.title.trim()) { err.textContent = 'Isi judul task dulu.'; err.hidden = false; root.querySelector('[name=title]').focus(); return; }
    if (!st.owner) { err.textContent = 'Pilih siapa yang menerima task ini.'; err.hidden = false; root.querySelector('[data-owner]').focus(); return; }
    assignTask({ owner: st.owner, title: st.title.trim(), app: st.app, due: st.due, priority: st.priority, note: st.note.trim() });
    close();
    rerender();
    toast(`Task ditugaskan ke ${shortName(st.owner)}`);
  };
  draw();
  root.querySelector('[name=title]').focus();
}

export function bind(root, rerender) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-approve],[data-letter],[data-remind],[data-assign]');
    if (!b) return;
    if (b.dataset.approve) {
      const id = b.dataset.approve;
      const t = activeTasks().find((x) => x.id === id);
      decide({ id, title: t?.title || 'Pengajuan', decision: 'setuju', note: '' });
      update((s) => { if (!s.doneIds.includes(id)) s.doneIds.push(id); });
      toast(`Disetujui: ${t?.title || 'pengajuan'}`, { label: 'Urungkan', run: () => { undoDecision(id); update((s) => { s.doneIds = s.doneIds.filter((x) => x !== id); }); } });
    }
    if (b.dataset.letter) assistantOpenLetter(b.dataset.letter);
    if (b.dataset.remind) {
      const t = teamTasks().find((x) => x.id === b.dataset.remind);
      remind(b.dataset.remind);
      rerender();
      toast(`Pengingat untuk ${shortName(t.owner)} dicatat`);
    }
    if (b.hasAttribute('data-assign')) openAssign(rerender);
  };
}
