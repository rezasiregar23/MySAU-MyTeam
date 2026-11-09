// Data contoh tab Tim Saya. Ganti dengan respons API HRIS (struktur organisasi, absensi, cuti),
// Pervoms (KPI) dan task tim saat integrasi.
import { addDays, ymd, today, uid } from './utils.js';

export const TEAM_UNIT = 'Divisi Teknologi Informasi';
// Peran yang boleh melihat tab Tim Saya
export const LEADER_ROLES = ['Dept. Head', 'Group Head', 'Direktur'];
export const SHIFT_TOLERANCE = '08.05';

// Bobot skor; ditampilkan di dashboard supaya rumusnya terbuka
export const SCORE_WEIGHTS = { kpi: 0.5, ontime: 0.3, hadir: 0.2 };
export const SCORE_LABELS = { kpi: 'KPI Pervoms', ontime: 'Ketepatan waktu task', hadir: 'Kehadiran' };

// in: jam masuk hari ini (null = belum absen). lateWeek: jumlah terlambat dalam 5 hari kerja terakhir.
// score: komponen bulan lalu (0–100). prev: skor total bulan sebelumnya.
export const MEMBERS = [
  { code: 'AN', role: 'Senior Analyst Aplikasi', in: '07.52', lateWeek: 0, score: { kpi: 86, ontime: 82, hadir: 96 }, prev: 82, hist: [79, 80, 83, 81], leaveLeft: 9, since: '2019' },
  { code: 'RK', role: 'Business Analyst', in: '08.11', lateWeek: 1, score: { kpi: 80, ontime: 78, hadir: 90 }, prev: 78, hist: [74, 76, 75, 77], leaveLeft: 6, since: '2021' },
  { code: 'DP', role: 'Engineer Infrastruktur', in: null, lateWeek: 0, score: { kpi: 74, ontime: 58, hadir: 95 }, prev: 77, hist: [80, 79, 78, 78], leaveLeft: 4, since: '2017' },
  { code: 'SR', role: 'Specialist HRIS', in: '07.58', lateWeek: 0, score: { kpi: 88, ontime: 86, hadir: 97 }, prev: 85, hist: [82, 83, 84, 84], leaveLeft: 11, since: '2016' },
  { code: 'AR', role: 'Engineer Jaringan', in: '08.24', lateWeek: 3, score: { kpi: 76, ontime: 72, hadir: 70 }, prev: 77, hist: [79, 78, 78, 76], leaveLeft: 3, since: '2018' },
  { code: 'FH', role: 'Data Engineer', in: '07.45', lateWeek: 0, score: { kpi: 82, ontime: 84, hadir: 94 }, prev: 80, hist: [74, 76, 77, 79], leaveLeft: 10, since: '2022' },
  { code: 'YW', role: 'Software Developer', in: null, lateWeek: 1, score: { kpi: 70, ontime: 62, hadir: 88 }, prev: 78, hist: [75, 77, 79, 80], leaveLeft: 8, since: '2023' },
  { code: 'LM', role: 'QA Engineer', in: null, lateWeek: 0, score: { kpi: 84, ontime: 88, hadir: 92 }, prev: 83, hist: [78, 80, 81, 82], leaveLeft: 5, since: '2020' },
];

// Rata-rata skor tim 4 bulan sebelum bulan pembanding (paling lama dulu)
export const SCORE_HISTORY = [76, 77, 79, 78];

// Ketidakhadiran dalam hari relatif dari hari ini. approvalTask: task approval yang harus disetujui dulu.
const ABSENCES = [
  { code: 'LM', type: 'cuti', from: 0, to: 1, note: 'Cuti tahunan' },
  { code: 'DP', type: 'dinas', from: 0, to: 2, note: 'Dinas luar ke Balikpapan' },
  { code: 'AR', type: 'cuti', from: 3, to: 5, note: 'Cuti tahunan', approvalTask: 't6' },
  { code: 'YW', type: 'izin', from: 4, to: 4, note: 'Izin keperluan keluarga' },
  { code: 'FH', type: 'cuti', from: 4, to: 4, note: 'Cuti tahunan' },
];

// Lama menunggu (hari) untuk item approval yang sudah ada di Task dan InOffice
export const APPROVAL_WAIT = { t2: 1, t5: 2, t6: 0, t7: 3, t13: 4, s1: 1, s2: 2 };

export const TEAM_STAGES = [
  { id: 'backlog', label: 'Backlog', color: '#9AA8BC' },
  { id: 'ready', label: 'Siap', color: '#2F6FD0' },
  { id: 'doing', label: 'Dikerjakan', color: '#E39A2D' },
  { id: 'review', label: 'Review', color: '#8C7BE0' },
  { id: 'done', label: 'Selesai', color: '#3DAFA3' },
];
export const STUCK_DAYS = 5;

// [pemilik, judul, aplikasi, tenggat (hari dari sekarang), tahap, hari di tahap ini, prioritas]
const SEED_TASKS = [
  ['AN', 'Integrasi SSO ke HRIS v2', 'HRIS', 3, 'doing', 2, 'tinggi'],
  ['AN', 'Dokumentasi API Pervoms', 'Pervoms', 6, 'ready', 1, 'rendah'],
  ['AN', 'Uji beban server Sales Order', 'Sales Order', 1, 'review', 1, 'sedang'],
  ['AN', 'Deploy hotfix Sales Order', 'Sales Order', -1, 'done', 0, 'tinggi'],
  ['RK', 'Analisis kebutuhan modul cuti', 'HRIS', 0, 'doing', 3, 'tinggi'],
  ['RK', 'Rapikan backlog InOffice', 'InOffice', 5, 'backlog', 4, 'rendah'],
  ['RK', 'Notulen review sistem cuti', 'InOffice', 1, 'ready', 0, 'sedang'],
  ['DP', 'Migrasi server backup ke DC2', 'Digital Patrol', -3, 'doing', 7, 'tinggi'],
  ['DP', 'Patch keamanan VPN', 'Digital Patrol', -2, 'doing', 4, 'sedang'],
  ['DP', 'Perpanjang lisensi firewall', 'Procurement', -1, 'ready', 2, 'tinggi'],
  ['DP', 'Inventaris perangkat Balikpapan', 'Digital Patrol', 2, 'doing', 1, 'sedang'],
  ['DP', 'Audit APAR gedung B', 'Digital Patrol', 5, 'ready', 1, 'rendah'],
  ['SR', 'Validasi data cuti HRIS', 'HRIS', 0, 'review', 2, 'sedang'],
  ['SR', 'Template laporan absensi', 'HRIS', 4, 'doing', 1, 'rendah'],
  ['SR', 'Pelatihan pengguna HRIS v2', 'HRIS', 7, 'ready', 0, 'sedang'],
  ['SR', 'Rekap absensi Oktober', 'HRIS', -1, 'done', 0, 'sedang'],
  ['AR', 'Konfigurasi VLAN kantor Medan', 'Digital Patrol', -1, 'doing', 5, 'tinggi'],
  ['AR', 'Ganti switch lantai 3', 'Procurement', 2, 'ready', 0, 'sedang'],
  ['FH', 'Pipeline data KPI bulanan', 'Pervoms', 2, 'doing', 2, 'sedang'],
  ['FH', 'Dashboard absensi harian', 'HRIS', 6, 'backlog', 1, 'rendah'],
  ['FH', 'ETL data talent', 'Talent', -2, 'done', 0, 'sedang'],
  ['YW', 'Perbaikan bug form lembur', 'HRIS', 0, 'doing', 1, 'tinggi'],
  ['YW', 'Refactor modul notifikasi', 'MySAU', 8, 'backlog', 3, 'rendah'],
  ['YW', 'Rilis MySAU v3.1', 'MySAU', 4, 'ready', 0, 'sedang'],
  ['LM', 'Uji regresi InOffice', 'InOffice', 1, 'review', 3, 'sedang'],
  ['LM', 'Skenario uji HRIS v2', 'HRIS', 5, 'doing', 2, 'sedang'],
  ['LM', 'Uji SSO di staging', 'HRIS', -1, 'done', 0, 'sedang'],
];

// Rincian pengajuan untuk dashboard Approval (id sama dengan task Approval / surat InOffice)
export const APPROVAL_INFO = {
  t13: { type: 'Reimburse', by: 'SR', detail: 'Klaim biaya perjalanan dinas Jayapura', amount: 'Rp1.250.000', files: 3 },
  t7: { type: 'Lembur', by: 'DP', detail: 'Lembur 6 jam hari Sabtu untuk migrasi server backup', amount: '6 jam', files: 0 },
  t5: { type: 'Review', by: null, detail: 'Performance Planning 2027 untuk 8 anggota tim IT', amount: '8 dokumen', files: 1 },
  s2: { type: 'Surat', by: null, detail: 'Pengajuan pengadaan perangkat pendukung operasional tim IT', amount: 'Surat internal', files: 1 },
  t2: { type: 'Review', by: 'RK', detail: 'Proposal penawaran untuk PT ABC sebelum dikirim ke pelanggan', amount: '1 proposal', files: 1 },
  s1: { type: 'Surat', by: null, detail: 'Penawaran kerja sama pengembangan Assessment 360 dari BCM', amount: 'Surat eksternal', files: 1 },
  t6: { type: 'Cuti', by: 'AR', detail: 'Cuti tahunan 3 hari untuk acara keluarga', amount: '3 hari', files: 1 },
};

const KEY = 'mysau.team.v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { saved = {}; }
const local = {
  assigned: Array.isArray(saved.assigned) ? saved.assigned : [],
  edits: saved.edits && typeof saved.edits === 'object' ? saved.edits : {},
  decisions: Array.isArray(saved.decisions) ? saved.decisions : [],
  notes: saved.notes && typeof saved.notes === 'object' ? saved.notes : {},
  reminded: saved.reminded && saved.reminded.date === ymd(today()) ? saved.reminded : { date: ymd(today()), ids: [] },
};
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(local)); } catch { /* storage tidak tersedia: data hanya bertahan selama halaman terbuka */ }
}

export function teamTasks() {
  const t = today();
  const seed = SEED_TASKS.map(([owner, title, app, due, stage, stageDays, priority], i) => ({
    id: `tt${i + 1}`, owner, title, app, due: ymd(addDays(t, due)), stage, stageDays, priority,
  }));
  return [...local.assigned, ...seed].map((t) => (local.edits[t.id] ? { ...t, ...local.edits[t.id] } : t));
}

/** Ubah task tim (alihkan penerima, tenggat, atau tahap). Disimpan lokal. */
export function editTask(id, patch) {
  local.edits[id] = { ...(local.edits[id] || {}), ...patch };
  save();
}

/* keputusan approval: { id, title, decision: 'setuju' | 'tolak', note, at } */
export const decisions = () => local.decisions;
export const decisionOf = (id) => local.decisions.find((d) => d.id === id);
export function decide(entry) {
  local.decisions = [{ ...entry, at: ymd(today()) }, ...local.decisions.filter((d) => d.id !== entry.id)];
  save();
}
export function undoDecision(id) {
  local.decisions = local.decisions.filter((d) => d.id !== id);
  save();
}

export const noteOf = (code) => local.notes[code] || '';
export function setNote(code, text) {
  local.notes[code] = text;
  save();
}

export function assignTask({ owner, title, app, due, priority, note }) {
  const task = { id: uid('tt'), owner, title, app, due, stage: 'ready', stageDays: 0, priority, note, assignedByMe: true };
  local.assigned.unshift(task);
  save();
  return task;
}

export const isReminded = (id) => local.reminded.ids.includes(id);
export function remind(id) {
  if (!isReminded(id)) local.reminded.ids.push(id);
  save();
}

export function absences() {
  const t = today();
  // cuti yang ditolak atasan tidak dihitung lagi sebagai ketidakhadiran
  return ABSENCES.filter((a) => !(a.approvalTask && local.decisions.some((d) => d.id === a.approvalTask && d.decision === 'tolak')))
    .map((a) => ({ ...a, fromDate: ymd(addDays(t, a.from)), toDate: ymd(addDays(t, a.to)) }));
}

/** Kehadiran 5 hari kerja terakhir (sampai hari ini) per anggota. Data contoh dibangkitkan tetap. */
export function weekAttendance(m) {
  const t = today();
  const days = [];
  for (let d = new Date(t); days.length < 5; d = addDays(d, -1)) if (d.getDay() !== 0 && d.getDay() !== 6) days.unshift(new Date(d));
  const abs = absences();
  const k0 = ymd(t);
  const todayLate = days.some((d) => ymd(d) === k0) && m.in && m.in > SHIFT_TOLERANCE ? 1 : 0;
  let lateLeft = m.lateWeek - todayLate;
  return days.map((d, i) => {
    const key = ymd(d);
    const away = abs.find((a) => a.code === m.code && a.fromDate <= key && a.toDate >= key);
    if (away) return { key, d, status: away.type === 'dinas' ? 'dinas' : 'cuti' };
    if (key === k0) return { key, d, status: !m.in ? 'belum' : m.in > SHIFT_TOLERANCE ? 'terlambat' : 'hadir', time: m.in };
    const seed = (m.code.charCodeAt(0) + m.code.charCodeAt(1) + i * 7) % 9;
    if (lateLeft > 0) { lateLeft -= 1; return { key, d, status: 'terlambat', time: `08.${String(10 + seed * 2).padStart(2, '0')}` }; }
    return { key, d, status: 'hadir', time: `07.${String(40 + seed * 2).padStart(2, '0')}` };
  });
}

export function scoreOf(m) {
  return Math.round(Object.entries(SCORE_WEIGHTS).reduce((sum, [k, w]) => sum + m.score[k] * w, 0));
}
