import { esc } from '../../utils.js';
import { MEMBERS, SCORE_WEIGHTS, SCORE_LABELS, scoreOf } from '../../team.js';
import { scoreStats, shortName } from '../../teamModel.js';
import { pageHead, person, delta, bar, spark } from '../kit.js';

let sort = 'nama';

export function render() {
  const sc = scoreStats();
  const rows = MEMBERS.map((m) => ({ m, now: scoreOf(m), d: scoreOf(m) - m.prev, series: [...m.hist, m.prev, scoreOf(m)] }));
  if (sort === 'nama') rows.sort((a, b) => shortName(a.m.code).localeCompare(shortName(b.m.code), 'id'));
  if (sort === 'skor') rows.sort((a, b) => b.now - a.now);
  if (sort === 'turun') rows.sort((a, b) => a.d - b.d);
  const up = rows.filter((r) => r.d > 0).length, down = rows.filter((r) => r.d < 0).length;
  const teamPart = Object.fromEntries(sc.parts.map((p) => [p.k, p.value]));
  return `<div class="mt-page mt-skor">
    ${pageHead('Skor tim', `Periode ${esc(sc.period)} ${sc.year}, dibanding ${esc(sc.prevPeriod)} · skor per orang hanya untuk atasan langsung dan yang bersangkutan`,
      `<label class="mt-select">Urutkan<select data-sort><option value="nama" ${sort === 'nama' ? 'selected' : ''}>Nama</option><option value="skor" ${sort === 'skor' ? 'selected' : ''}>Skor tertinggi</option><option value="turun" ${sort === 'turun' ? 'selected' : ''}>Paling turun</option></select></label>`)}
    <div class="mt-skor-top">
      <article class="card glass mt-skor-avg">
        <div class="card-head"><h2>Rata-rata tim</h2></div>
        <div class="mt-score-big"><b>${sc.now}</b>${delta(sc.delta)}<small>dari ${sc.prev} di ${esc(sc.prevPeriod)}</small></div>
        ${spark(sc.series, { w: 300, h: 44, labels: sc.labels })}
      </article>
      <article class="card glass mt-skor-how">
        <div class="card-head"><h2>Cara skor dihitung</h2></div>
        <ul class="mt-comp">${sc.parts.map((p) => `<li><span>${esc(p.label)} <em>${Math.round(p.weight * 100)}%</em></span>${bar(p.value)}<b>${p.value}</b><small>rata-rata</small></li>`).join('')}</ul>
        <p class="mt-note">Skor = KPI × 50% + ketepatan waktu task × 30% + kehadiran × 20%. Bobot ini contoh untuk prototype dan perlu disepakati bersama HR.</p>
      </article>
      <article class="card glass mt-skor-move">
        <div class="card-head"><h2>Pergerakan</h2></div>
        <div class="mt-move"><div><b class="green">${up}</b><small>naik</small></div><div><b>${rows.length - up - down}</b><small>tetap</small></div><div><b class="red">${down}</b><small>turun</small></div></div>
        <p class="mt-note">${down ? `Yang turun: ${rows.filter((r) => r.d < 0).sort((a, b) => a.d - b.d).map((r) => `${esc(shortName(r.m.code))} (${r.d})`).join(', ')}.` : 'Tidak ada yang turun.'}</p>
      </article>
    </div>
    <article class="card glass mt-table-card">
      <div class="mt-table-wrap scroll">
        <table class="mt-table mt-score-table">
          <thead><tr><th>Anggota</th><th class="num">Skor</th><th class="num">Perubahan</th>${Object.keys(SCORE_WEIGHTS).map((k) => `<th>${esc(SCORE_LABELS[k])} <em>${Math.round(SCORE_WEIGHTS[k] * 100)}%</em></th>`).join('')}<th>Tren 6 bulan</th></tr></thead>
          <tbody>${rows.map((r) => `<tr data-href="#/anggota/${r.m.code}" tabindex="0">
            <td>${person(r.m.code, esc(r.m.role), 28)}</td>
            <td class="num"><b class="mt-score-n">${r.now}</b></td>
            <td class="num">${delta(r.d)}</td>
            ${Object.keys(SCORE_WEIGHTS).map((k) => `<td><span class="mt-compcell">${bar(r.m.score[k], r.m.score[k] < teamPart[k] - 5 ? '#E39A2D' : '#5B9BE0')}<b>${r.m.score[k]}</b></span></td>`).join('')}
            <td>${spark(r.series, { w: 96, h: 24 })}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="mt-legend"><span><i style="--c:#5B9BE0"></i>Komponen</span><span><i style="--c:#E39A2D"></i>Lebih dari 5 poin di bawah rata-rata tim</span></p>
    </article>
  </div>`;
}

export function bind(root, rerender) {
  root.onclick = (e) => { const tr = e.target.closest('tr[data-href]'); if (tr) location.hash = tr.dataset.href; };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = (e) => { if (e.target.matches('[data-sort]')) { sort = e.target.value; rerender(); } };
}
