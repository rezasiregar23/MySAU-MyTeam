// Selektor bersama untuk tab Tim Saya (MySAU) dan aplikasi My Team
import { today, ymd, addDays, parseYmd, dayDiff, fmtShort, MONTHS, MONTHS_SHORT } from './utils.js';
import { USER, PEOPLE } from './data.js';
import { state, activeTasks } from './store.js';
import { assistantLetters } from './pages/inoffice.js';
import { MEMBERS, SHIFT_TOLERANCE, SCORE_WEIGHTS, SCORE_LABELS, SCORE_HISTORY, APPROVAL_WAIT, TEAM_STAGES, STUCK_DAYS, teamTasks, absences, scoreOf, decisionOf } from './team.js';

export const ATT = {
  hadir: { label: 'Tepat waktu', color: '#3DAFA3' },
  terlambat: { label: 'Terlambat', color: '#E39A2D' },
  dinas: { label: 'Dinas luar', color: '#2F6FD0' },
  cuti: { label: 'Cuti / izin', color: '#9C8BE8' },
  belum: { label: 'Belum absen', color: '#B4C0D0' },
};
export const AWAY = { cuti: 'Cuti', izin: 'Izin', dinas: 'Dinas luar' };

export const fullName = (code) => PEOPLE[code]?.name || code;
export const shortName = (code) => { const n = fullName(code); return /\./.test(n) ? n : n.split(' ')[0]; };
export const dayLabel = (key) => { const diff = dayDiff(parseYmd(key), today()); return diff === 0 ? 'Hari ini' : diff === 1 ? 'Besok' : fmtShort(parseYmd(key)); };
export const rangeLabel = (a, b) => (a === b ? dayLabel(a) : `${dayLabel(a)} – ${dayLabel(b)}`);
// dayLabel di tengah kalimat: "hari ini" / "besok" huruf kecil, tanggal tetap
export const inSentence = (txt) => txt.replace(/\b(Hari ini|Besok)\b/g, (w) => w.toLowerCase());
export const avg = (xs) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);

/* ---------- selectors ---------- */
export function attendanceOf(m) {
  const k = ymd(today());
  const away = absences().find((a) => a.code === m.code && a.fromDate <= k && a.toDate >= k);
  if (away) return away.type === 'dinas' ? 'dinas' : 'cuti';
  if (!m.in) return 'belum';
  return m.in > SHIFT_TOLERANCE ? 'terlambat' : 'hadir';
}

export function approvals() {
  const fromTasks = activeTasks().filter((t) => t.kind === 'Approval' && !decisionOf(t.id)).map((t) => ({
    id: t.id, kind: 'task', title: t.title, app: t.app, who: (t.people || []).find((c) => c !== USER.initials) || null, wait: APPROVAL_WAIT[t.id] ?? 0,
  }));
  const fromLetters = assistantLetters().filter((s) => s.action && !decisionOf(s.id) && /pemeriksaan|tanda tangan/i.test(s.status)).map((s) => ({
    id: s.id, kind: 'letter', title: s.title, app: 'InOffice', who: null, wait: APPROVAL_WAIT[s.id] ?? 0, action: s.action,
  }));
  return [...fromTasks, ...fromLetters].sort((a, b) => b.wait - a.wait);
}

export function taskStats() {
  const k = ymd(today());
  const all = teamTasks();
  const open = all.filter((t) => t.stage !== 'done');
  const lateDays = (t) => (t.due < k ? dayDiff(today(), parseYmd(t.due)) : 0);
  const isStuck = (t) => t.stage === 'doing' && t.stageDays >= STUCK_DAYS;
  const late = open.filter((t) => t.due < k);
  const stuck = open.filter(isStuck);
  const dueToday = open.filter((t) => t.due === k);
  const rank = (t) => lateDays(t) * 10 + (isStuck(t) ? 5 : 0) + (t.due === k ? 2 : 0) + (t.priority === 'tinggi' ? 1 : 0);
  const urgent = open.filter((t) => t.due <= k || isStuck(t)).sort((a, b) => rank(b) - rank(a)).slice(0, 3);
  const byOwner = Object.fromEntries(MEMBERS.map((m) => [m.code, { open: open.filter((t) => t.owner === m.code).length, late: late.filter((t) => t.owner === m.code).length }]));
  const byStage = TEAM_STAGES.map((s) => ({ ...s, n: all.filter((t) => t.stage === s.id).length }));
  return { all, open, late, stuck, dueToday, urgent, byOwner, byStage, lateDays, isStuck };
}

export function scoreStats() {
  const t = today();
  const month = (back) => MONTHS[(t.getMonth() - back + 12) % 12];
  const scores = MEMBERS.map((m) => ({ code: m.code, now: scoreOf(m), prev: m.prev }));
  const now = Math.round(avg(scores.map((s) => s.now)));
  const prev = Math.round(avg(scores.map((s) => s.prev)));
  const parts = Object.keys(SCORE_WEIGHTS).map((k) => ({ k, label: SCORE_LABELS[k], weight: SCORE_WEIGHTS[k], value: Math.round(avg(MEMBERS.map((m) => m.score[k]))) }));
  const series = [...SCORE_HISTORY, prev, now];
  const labels = series.map((_, i) => MONTHS_SHORT[(t.getMonth() - (series.length - i) + 12) % 12]);
  const down = scores.filter((s) => s.now < s.prev);
  return { scores, now, prev, delta: now - prev, parts, series, labels, down, period: month(1), prevPeriod: month(2), year: t.getMonth() === 0 ? t.getFullYear() - 1 : t.getFullYear() };
}

export function awayList() {
  const k0 = ymd(today()), k6 = ymd(addDays(today(), 6));
  const leaveTask = (id) => id && activeTasks().some((t) => t.id === id);
  const away = absences().filter((a) => a.toDate >= k0 && a.fromDate <= k6).map((a) => ({ ...a, pending: leaveTask(a.approvalTask) }));
  const names = new Map(MEMBERS.map((m) => [fullName(m.code), m.code]));
  const birthdays = state.seed.events.filter((e) => e.type === 'ultah' && e.date >= k0 && e.date <= k6 && names.has(e.person)).map((e) => ({ code: names.get(e.person), date: e.date }));
  return { away: away.sort((a, b) => (a.fromDate < b.fromDate ? -1 : 1)), birthdays };
}

export function attention(stats) {
  const out = [];
  const k0 = ymd(today());
  const abs = absences();
  MEMBERS.forEach((m) => {
    const n = stats.byOwner[m.code].late;
    if (n < 2) return;
    const trip = abs.find((a) => a.code === m.code && a.fromDate <= k0 && a.toDate >= k0);
    out.push({ tone: 'red', ic: 'alert', who: m.code, text: `${fullName(m.code)} punya ${n} task terlambat`, sub: trip ? `Sedang ${AWAY[trip.type].toLowerCase()} sampai ${inSentence(dayLabel(trip.toDate))}. Pertimbangkan mengalihkan sebagian task.` : 'Tanyakan apakah butuh bantuan atau tenggat baru.' });
  });
  // hari (besok s.d. 6 hari ke depan) dengan paling banyak anggota tidak di kantor
  let peak = null;
  for (let d = 1; d <= 6; d += 1) {
    const key = ymd(addDays(today(), d));
    const who = abs.filter((a) => a.fromDate <= key && a.toDate >= key).map((a) => a.code);
    if (who.length >= 2 && who.length / MEMBERS.length >= 0.25 && (!peak || who.length > peak.who.length)) peak = { d, key, who };
  }
  if (peak) out.push({ tone: 'violet', ic: 'calendar', text: `${peak.who.length} orang tidak di kantor ${peak.d === 1 ? 'besok' : `pada ${dayLabel(peak.key)}`}`, sub: `${peak.who.map(shortName).join(', ')}. Pastikan pekerjaan mereka ada yang menggantikan.` });
  MEMBERS.filter((m) => m.lateWeek >= 3).forEach((m) => out.push({ tone: 'amber', ic: 'clock', who: m.code, text: `${fullName(m.code)} terlambat masuk ${m.lateWeek} kali dalam 5 hari kerja`, sub: 'Bisa dibahas di 1:1 berikutnya.' }));
  const sc = scoreStats();
  sc.scores.filter((s) => s.prev - s.now >= 5).forEach((s) => out.push({ tone: 'gray', ic: 'trend', who: s.code, text: `Skor ${fullName(s.code)} turun ${s.prev - s.now} poin`, sub: `Dibanding ${sc.prevPeriod}. Lihat rincian komponennya.` }));
  return out.slice(0, 4);
}


// diteruskan agar halaman cukup mengimpor dari satu tempat
export { absences };
