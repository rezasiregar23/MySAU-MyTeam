import { icon } from '../../icons.js';
import { esc, today, addDays, fmtLong, ymd } from '../../utils.js';
import { update } from '../../store.js';
import { APPROVAL_INFO, decide, decisions, undoDecision } from '../../team.js';
import { approvals, absences, fullName, shortName, rangeLabel } from '../../teamModel.js';
import { avatar, toast } from '../../ui.js';
import { pageHead, empty } from '../kit.js';

const TYPES = ['Semua', 'Cuti', 'Lembur', 'Reimburse', 'Review', 'Surat'];
const TYPE_ICON = { Cuti: 'calendar', Lembur: 'clock', Reimburse: 'file', Review: 'task', Surat: 'mail' };
let type = 'Semua';
let selected = null;

const enrich = (a) => ({ ...a, info: APPROVAL_INFO[a.id] || { type: a.kind === 'letter' ? 'Surat' : 'Review', by: a.who, detail: '', amount: '', files: 0 } });
const waitText = (w) => (w === 0 ? 'Masuk hari ini' : `Menunggu ${w} hari`);

function overlapNote(a) {
  if (a.info.type !== 'Cuti') return '';
  const leave = absences().find((x) => x.approvalTask === a.id);
  if (!leave) return '';
  const others = absences().filter((x) => x.code !== leave.code && x.fromDate <= leave.toDate && x.toDate >= leave.fromDate);
  return `<div class="mt-ap-impact"><b>${icon('calendar', 15, 2)}Dampak ke tim</b><p>${esc(shortName(leave.code))} cuti ${esc(rangeLabel(leave.fromDate, leave.toDate))}.${others.length ? ` Pada periode yang sama ${others.map((o) => `${esc(shortName(o.code))} (${o.type === 'dinas' ? 'dinas' : o.type}, ${esc(rangeLabel(o.fromDate, o.toDate))})`).join(', ')} juga tidak di kantor.` : ' Tidak ada anggota lain yang cuti di periode ini.'}</p></div>`;
}

export function render() {
  const all = approvals().map(enrich);
  const list = all.filter((a) => type === 'Semua' || a.info.type === type);
  if (!list.some((a) => a.id === selected)) selected = list[0]?.id || null;
  const cur = list.find((a) => a.id === selected);
  const done = decisions();
  return `<div class="mt-page mt-approval">
    ${pageHead('Persetujuan', `${all.length} menunggu keputusan Anda · diurutkan dari yang paling lama menunggu`)}
    <div class="mt-toolbar"><div class="seg glass" role="tablist" aria-label="Jenis pengajuan">${TYPES.map((t) => {
      const n = t === 'Semua' ? all.length : all.filter((a) => a.info.type === t).length;
      return `<button type="button" role="tab" aria-selected="${type === t}" class="${type === t ? 'on' : ''}" data-type="${t}">${t}<span class="mt-count">${n}</span></button>`;
    }).join('')}</div></div>
    <div class="mt-ap-grid">
      <article class="card glass mt-ap-list">
        <ul class="scroll" role="listbox" aria-label="Daftar pengajuan">${list.map((a) => `<li><button type="button" role="option" aria-selected="${a.id === selected}" class="${a.id === selected ? 'on' : ''}" data-pick="${esc(a.id)}">
          ${a.info.by ? avatar(a.info.by, 32) : `<span class="ic-chip">${icon(TYPE_ICON[a.info.type] || 'file', 15)}</span>`}
          <span class="tm-main"><p>${esc(a.title)}</p><small><span class="${a.wait >= 3 ? 'tm-warn' : ''}">${waitText(a.wait)}</span> · ${esc(a.info.type)}</small></span>${icon('chevR', 15, 2)}</button></li>`).join('') || `<li>${empty(type === 'Semua' ? 'Semua pengajuan sudah Anda proses.' : `Tidak ada pengajuan ${type.toLowerCase()} yang menunggu.`)}</li>`}</ul>
      </article>
      <article class="card glass mt-ap-detail">${cur ? `
        <div class="mt-ap-top"><span class="mt-flag soft">${icon(TYPE_ICON[cur.info.type] || 'file', 13, 2)}${esc(cur.info.type)}</span><span class="${cur.wait >= 3 ? 'tm-warn' : 'muted'}">${waitText(cur.wait)}</span></div>
        <h2>${esc(cur.title)}</h2>
        <dl class="mt-ap-facts">
          <div><dt>Diajukan oleh</dt><dd>${cur.info.by ? `${avatar(cur.info.by, 22)}${esc(fullName(cur.info.by))}` : esc(cur.kind === 'letter' ? 'Melalui InOffice' : 'Sistem Pervoms')}</dd></div>
          <div><dt>Tanggal masuk</dt><dd>${esc(fmtLong(addDays(today(), -cur.wait)))}</dd></div>
          <div><dt>Nilai</dt><dd>${esc(cur.info.amount || '—')}</dd></div>
          <div><dt>Lampiran</dt><dd>${cur.info.files ? `${icon('clip', 14, 2)}${cur.info.files} file` : 'Tidak ada'}</dd></div>
        </dl>
        <p class="mt-ap-desc">${esc(cur.info.detail || 'Tidak ada keterangan tambahan.')}</p>
        ${overlapNote(cur)}
        ${cur.kind === 'letter' ? `<div class="mt-ap-actions"><p class="mt-note">Pemeriksaan dan tanda tangan surat dilakukan di InOffice.</p><span class="flex"></span><a class="btn primary" href="index.html#/inoffice">${icon('mail', 15, 2)}Buka di InOffice</a></div>`
        : `<label class="mt-ap-note"><span>Catatan untuk pemohon <small class="muted">(wajib bila menolak)</small></span><textarea name="note" rows="3" placeholder="Pesan singkat untuk pemohon, mis. alasan atau syarat persetujuan"></textarea></label>
        <p class="m-error" hidden>Tulis alasan penolakan agar pemohon tahu apa yang perlu diperbaiki.</p>
        <div class="mt-ap-actions"><span class="flex"></span><button type="button" class="btn ghost mt-reject" data-decide="tolak">${icon('x', 15, 2.2)}Tolak</button><button type="button" class="btn primary" data-decide="setuju">${icon('check', 15, 2.4)}Setujui</button></div>`}
      ` : empty('Pilih pengajuan di kiri untuk melihat rinciannya.')}</article>
      <article class="card glass mt-ap-done">
        <div class="card-head"><h2>Sudah diproses</h2><span class="flex"></span><small class="muted">${done.length}</small></div>
        <ul class="scroll">${done.map((d) => `<li><span class="mt-dec ${d.decision}">${d.decision === 'setuju' ? icon('check', 13, 2.6) : icon('x', 13, 2.6)}</span><span class="tm-main"><p>${esc(d.title)}</p><small>${d.decision === 'setuju' ? 'Disetujui' : 'Ditolak'}${d.at === ymd(today()) ? ' hari ini' : ''}${d.note ? ` · “${esc(d.note)}”` : ''}</small></span><button type="button" class="link" data-undo="${esc(d.id)}">Urungkan</button></li>`).join('') || '<li class="muted">Belum ada keputusan.</li>'}</ul>
        <p class="mt-note">Keputusan tersimpan di browser ini; belum dikirim ke HRIS atau aplikasi asal.</p>
      </article>
    </div>
  </div>`;
}

export function bind(root, rerender) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-type],[data-pick],[data-decide],[data-undo]');
    if (!b) return;
    if (b.dataset.type) { type = b.dataset.type; selected = null; rerender(); }
    if (b.dataset.pick) { selected = b.dataset.pick; rerender(); root.querySelector(`[data-pick="${selected}"]`)?.focus(); }
    if (b.dataset.decide) {
      const cur = approvals().find((a) => a.id === selected);
      if (!cur) return;
      const note = root.querySelector('[name=note]').value.trim();
      if (b.dataset.decide === 'tolak' && !note) { root.querySelector('.m-error').hidden = false; root.querySelector('[name=note]').focus(); return; }
      decide({ id: cur.id, title: cur.title, decision: b.dataset.decide, note });
      update((s) => { if (!s.doneIds.includes(cur.id)) s.doneIds.push(cur.id); });
      toast(`${b.dataset.decide === 'setuju' ? 'Disetujui' : 'Ditolak'}: ${cur.title}`);
    }
    if (b.dataset.undo) {
      const id = b.dataset.undo;
      undoDecision(id);
      update((s) => { s.doneIds = s.doneIds.filter((x) => x !== id); });
      selected = id;
      toast('Keputusan diurungkan');
    }
  };
  root.onchange = null;
}
