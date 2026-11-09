/* Generated from editable js/ modules by build.py */
(()=>{
const modules={'js/assistant.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, ymd, fmtLong } = require("js/utils.js");
const { activeTasks, itemsForRange } = require("js/store.js");
const { assistantLetters, assistantOpenLetter, assistantSaveDraft } = require("js/pages/inoffice.js");

function initAssistant() {
 const host=document.createElement('div');host.className='ai-widget';document.getElementById('frame').appendChild(host);
 let open=false, busy=false, messages=[], selectedLetter=null;
 try { messages=JSON.parse(localStorage.getItem('mysau.ai.chat'))||[];if(!Array.isArray(messages))messages=[];messages=messages.slice(-30); } catch {}
 const persist=()=>{try{localStorage.setItem('mysau.ai.chat',JSON.stringify(messages.slice(-30)));}catch{}};
 const suggestions=['Carikan surat tentang Assessment','Apa task prioritas saya?','Siapa yang ulang tahun bulan ini?'];
 const ring='<span class="ai-ring" aria-hidden="true"></span>';
 function close(){open=false;render();(document.querySelector('[data-ai-home]')||host.querySelector('.ai-launch')).focus();}
 function show(){open=true;render();host.querySelector('textarea').focus();}
 function render(){
 const home=document.getElementById('app').dataset.page==='beranda';
 host.classList.toggle('is-open',open);host.classList.toggle('is-busy',busy);
 [...document.getElementById('frame').children].filter(el=>el!==host).forEach(el=>{el.inert=open;});
 host.innerHTML=`<button class="ai-launch glass" ${home?'hidden':''} aria-label="Buka Saut, asisten digital" title="Saut" aria-expanded="${open}" aria-controls="aiPanel">${ring}<span>Tanya Saut</span></button>
 <div class="ai-backdrop" ${open?'':'hidden'}></div>
 <section class="ai-panel glass-strong ${messages.length?'has-messages':''}" id="aiPanel" role="dialog" aria-modal="true" aria-labelledby="aiTitle" ${open?'':'hidden'}><header><span class="ai-brand">${ring}</span><div><h2 id="aiTitle">Saut</h2><p>Asisten digital Anda</p></div><button data-ai-new title="Percakapan baru" aria-label="Percakapan baru">${icon('plus',17)}</button><button data-ai-close aria-label="Tutup asisten">${icon('x',18)}</button></header>
 <div class="ai-messages" aria-live="polite">${messages.length?messages.map((m,i)=>message(m,i)).join(''):`<div class="ai-welcome"><img src="assets/stage/mascot.webp" alt=""/><small>RUANG BANTU ANDA</small><h3>Ada yang bisa Saut bantu, Siyono?</h3><p>Cari informasi, siapkan draft, atau rapikan pekerjaan Anda.</p></div>`}${busy?'<div class="ai-bubble ai-answer ai-thinking">Menyiapkan jawaban…</div>':''}</div>
 <form class="ai-composer">${ring}<textarea rows="1" aria-label="Pertanyaan untuk Saut" placeholder="Cari informasi atau minta saya membantu…" maxlength="2000" ${busy?'disabled':''}></textarea><button type="submit" aria-label="Kirim pertanyaan" ${busy?'disabled':''}>${icon('arrowR',18)}</button></form>
 ${!messages.length?`<div class="ai-prompts">${suggestions.map((s,i)=>`<button data-ai-prompt="${esc(s)}">${['Cari surat','Task prioritas','Ulang tahun'][i]}</button>`).join('')}<button data-ai-prompt="Apa agenda hari ini?">Agenda hari ini</button></div>`:''}
 <div class="ai-foot">Prototype · data contoh · Periksa jawaban sebelum digunakan.</div></section>`;
 host.querySelector('.ai-launch').onclick=show;
 host.querySelector('.ai-backdrop').onclick=close;
 host.querySelector('[data-ai-close]').onclick=close;
 host.querySelector('[data-ai-new]').onclick=()=>{if(busy)return;messages=[];selectedLetter=null;persist();render();host.querySelector('textarea').focus();};
 host.querySelector('.ai-composer').onsubmit=e=>{e.preventDefault();send(host.querySelector('textarea').value);};
 host.querySelector('textarea').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(e.target.value);}};
 host.querySelectorAll('[data-ai-prompt]').forEach(b=>b.onclick=()=>send(b.dataset.aiPrompt));
 host.querySelectorAll('[data-ai-letter]').forEach(b=>b.onclick=()=>{selectedLetter=b.dataset.aiLetter;close();assistantOpenLetter(selectedLetter);});
 host.querySelectorAll('[data-ai-reply]').forEach(b=>b.onclick=()=>{selectedLetter=b.dataset.aiReply;send('Buatkan draft balasan untuk surat ini');});
 host.querySelectorAll('[data-ai-route]').forEach(b=>b.onclick=()=>{location.hash=b.dataset.aiRoute;open=false;render();});
 host.querySelectorAll('[data-ai-save]').forEach(b=>b.onclick=()=>{const m=messages[Number(b.dataset.aiSave)];if(m.saved)return;const id=assistantSaveDraft(m.title,m.body,m.recipient);m.saved=id;persist();render();});
 const area=host.querySelector('.ai-messages');area.scrollTop=area.scrollHeight;
 }
 function message(m,i){if(m.role==='user')return `<div class="ai-bubble ai-user">${esc(m.text)}</div>`;return `<div class="ai-bubble ai-answer"><div class="ai-answer-text">${esc(m.text)}</div>${m.kind==='letters'?`<div class="ai-result-cards">${m.items.map(s=>`<article><b>${esc(s.title)}</b><small>${esc(s.number)} · ${esc(s.sender)}</small><p>${esc(s.body.slice(0,140))}…</p><div><button data-ai-letter="${esc(s.id)}">Lihat surat</button><button data-ai-reply="${esc(s.id)}">Draft balasan</button></div></article>`).join('')}</div>`:''}${m.kind==='draft'?`<article class="ai-draft"><b>${esc(m.title)}</b><p>${esc(m.body)}</p><button data-ai-save="${i}" ${m.saved?'disabled':''}>${m.saved?'Draft tersimpan ✓':'Simpan draft ke InOffice'}</button></article>`:''}${m.route?`<button class="ai-source" data-ai-route="${m.route}">${esc(m.source)} ${icon('arrowUR',12)}</button>`:''}</div>`;}
 function reply(q){const query=q.toLowerCase();
 if(/balas|balasan/.test(query)){const s=assistantLetters().find(x=>x.id===selectedLetter)||assistantLetters().find(x=>/penawaran/i.test(x.title));selectedLetter=s.id;return {role:'assistant',kind:'draft',text:`Berikut contoh draft balasan berdasarkan “${s.title}”. Silakan sesuaikan sebelum disimpan.`,title:'Balasan: '+s.title,recipient:s.sender,body:`Dengan hormat,\n\nTerima kasih atas surat ${s.number} perihal ${s.title}. Kami telah menerima informasi yang disampaikan dan akan meninjau rincian kebutuhan bersama tim terkait.\n\nMohon berkenan menyampaikan usulan jadwal pembahasan lanjutan agar ruang lingkup, waktu pelaksanaan, dan langkah berikutnya dapat disepakati.\n\nDemikian kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.\n\nHormat kami,\nSiyono\nDivisi Teknologi Informasi`};}
 if(/ulang tahun|ultah/.test(query)){const t=today();const list=itemsForRange(new Date(t.getFullYear(),t.getMonth(),1),new Date(t.getFullYear(),t.getMonth()+1,0),{all:true}).filter(e=>e.type==='ultah');return {role:'assistant',text:list.length?'Ulang tahun bulan ini (data contoh):\n\n'+list.map(e=>`${e.date.slice(-2)} — ${e.person||e.title}${e.unit?' · '+e.unit:''}`).join('\n'):'Tidak ada ulang tahun pada data contoh bulan ini.',route:'/kalender',source:'Sumber: Kalender MySAU'};}
 if(/task|tugas|pekerjaan/.test(query)){const items=activeTasks().filter(t=>!/terlambat/.test(query)||t.due<ymd(today())).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);return {role:'assistant',text:'Berikut task yang perlu Anda perhatikan:\n\n'+items.map(t=>`• ${t.title}\n  ${t.app} · ${t.due<ymd(today())?'Terlambat':t.due===ymd(today())?'Hari ini':t.due}`).join('\n\n'),route:'/task',source:'Sumber: Task Saya'};}
 if(/agenda|jadwal/.test(query)){const t=today();const list=itemsForRange(t,t,{all:true}).filter(e=>e.type==='rapat'||e.type==='event');return {role:'assistant',text:`Agenda ${fmtLong(t)}:\n\n`+list.map(e=>`${e.start||'Seharian'} — ${e.title}`).join('\n'),route:'/kalender',source:'Sumber: Kalender MySAU'};}
 if(/surat|memo|assessment|penawaran|hris|pengadaan/.test(query)){const terms=query.replace(/[?.,]/g,'').split(/\s+/).filter(w=>w.length>2&&!['carikan','cari','surat','yang','tentang','berisi','tolong','saya','untuk','buka','lihat','ada','dan','atau','dengan'].includes(w));const all=assistantLetters().filter(s=>s.status!=='Draft');const list=terms.length?all.map(s=>({s,score:terms.filter(w=>[s.title,s.body,s.sender,s.number,s.attachment].join(' ').toLowerCase().includes(w)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.s):all;const items=list.slice(0,3);if(items.length)selectedLetter=items[0].id;return {role:'assistant',kind:'letters',text:items.length?`Saya menemukan ${list.length} surat terkait pada data contoh. Pilih surat untuk dibuka atau dibuatkan balasannya.`:'Belum ditemukan surat yang cocok. Coba kata “Assessment”, “pengadaan”, atau “HRIS”.',items};}
 return {role:'assistant',text:'Saya bisa membantu mencoba pencarian surat, menyiapkan draft balasan, melihat task prioritas, agenda hari ini, atau ulang tahun bulan ini. Pilih contoh berikut.',suggestions:true};
 }
 function send(value){const q=value.trim();if(!q||busy)return;messages.push({role:'user',text:q});busy=true;render();setTimeout(()=>{try{messages.push(reply(q));}catch{messages.push({role:'assistant',text:'Data contoh belum dapat dibaca. Silakan coba lagi.'});}busy=false;persist();render();if(open)host.querySelector('textarea').focus();},450);}
 document.addEventListener('click',e=>{if(e.target.closest('[data-ai-home]'))show();});
 document.addEventListener('keydown',e=>{
 if(!open)return;
 if(e.key==='Escape'){e.preventDefault();close();}
 if(e.key==='Tab'){
 const els=[...host.querySelectorAll('.ai-panel button:not(:disabled),.ai-panel textarea:not(:disabled)')];
 const first=els[0],last=els[els.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
 });
 window.addEventListener('hashchange',()=>{render();if(open)host.querySelector('textarea').focus();});
 render();
}

return {initAssistant};
},
'js/data.js': function(require) {
// Contoh data. Ganti dengan respons API HRIS / Pervorms / InOffice saat integrasi.
const { addDays, ymd, DAYS } = require("js/utils.js");

const USER = {
  name: 'Siyono',
  initials: 'SY',
  role: 'Dept. Head',
  division: 'Divisi Teknologi Informasi',
  office: 'Kantor Pusat SAU',
  shift: { start: '08.00', end: '17.00' },
};

// Ganti url dengan alamat aplikasi masing-masing.
const APPS = [
  { id: 'hris', name: 'HRIS', desc: 'Kepegawaian', icon: 'users', url: '#' },
  { id: 'assessment', name: 'Assessment', desc: 'Kompetensi', icon: 'award', url: '#' },
  { id: 'pervorms', name: 'Pervorms', desc: 'Kinerja & KPI', icon: 'trend', url: '#' },
  { id: 'recruitment', name: 'Recruitment', desc: 'Rekrutmen', icon: 'brief', url: '#' },
  { id: 'talent', name: 'Talent', desc: 'Talenta', icon: 'star', url: '#' },
  { id: 'inoffice', name: 'InOffice', desc: 'Persuratan', icon: 'mail', url: '#' },
];

const PEOPLE = {
  SY: { name: 'Siyono', color: '#2F6FD0' },
  AN: { name: 'Andi N.', color: '#5B8FDD' },
  RK: { name: 'Rina Kartika', color: '#8C7BE0' },
  DP: { name: 'Dimas Pratama', color: '#3DAFA3' },
  SR: { name: 'Siti R.', color: '#E8A23C' },
  BS: { name: 'Budi Santoso', color: '#D9577A' },
  AR: { name: 'A. Rahman', color: '#E08A3C' },
  FH: { name: 'Fajar Hidayat', color: '#4A9BB8' },
  YW: { name: 'Yoga Wicaksono', color: '#6C7FD8' },
  LM: { name: 'Lia Maharani', color: '#C2689A' },
};

const CAL_TYPES = {
  task: { label: 'Task & tenggat', color: '#2F6FD0' },
  rapat: { label: 'Rapat', color: '#2BAE9E' },
  event: { label: 'Event kantor', color: '#E39A2D' },
  cuti: { label: 'Cuti & hari besar', color: '#D9577A' },
  ultah: { label: 'Ulang tahun rekan', color: '#9C8BE8' },
};

const PRIORITY = {
  tinggi: { label: 'Tinggi', color: '#D9577A' },
  sedang: { label: 'Sedang', color: '#E39A2D' },
  rendah: { label: 'Rendah', color: '#3DAFA3' },
};

// Hari peringatan/libur nasional berulang (bulan-tanggal)
const NATIONAL = {
  '01-01': ['Tahun Baru', true], '05-01': ['Hari Buruh', true], '06-01': ['Hari Lahir Pancasila', true],
  '08-17': ['HUT Kemerdekaan RI', true], '10-01': ['Hari Kesaktian Pancasila', false], '10-28': ['Sumpah Pemuda', false],
  '11-10': ['Hari Pahlawan', false], '11-25': ['Hari Guru Nasional', false], '12-24': ['Cuti bersama Natal', true],
  '12-25': ['Hari Raya Natal', true],
};

function buildSeed(t) {
  const D = (n) => ymd(addDays(t, n));
  const tasks = [
    { id: 't1', focus: 3, title: 'Selesaikan SO pelanggan PT ABC', app: 'Sales Order', code: 'SO/2026/00125', due: D(0), time: '17.00', priority: 'tinggi', kind: 'Untuk saya', loc: 'Jakarta', sub: [3, 5], comments: 3, files: 4, people: ['AN', 'RK', 'DP'] },
    { id: 't2', focus: 2, title: 'Review proposal penawaran', app: 'SAUMail', code: 'SM/2026/0042', due: D(0), time: '15.00', priority: 'sedang', kind: 'Approval', loc: 'Jakarta', sub: [2, 4], comments: 2, files: 1, people: ['RK', 'BS'] },
    { id: 't3', focus: 1, title: 'Tindak lanjut temuan APAR', app: 'Digital Patrol', code: 'DP/2026/0087', due: D(-1), time: '', priority: 'tinggi', kind: 'Untuk saya', loc: 'Medan', sub: [1, 3], comments: 1, files: 2, people: ['DP', 'SR'] },
    { id: 't4', focus: 4, title: 'Susun Performance Planning', app: 'Pervorms', code: 'PV/2026/0036', due: D(1), time: '12.00', priority: 'sedang', kind: 'Untuk saya', loc: 'Jakarta', sub: [1, 6], comments: 2, files: 0, people: ['SR', 'AN', 'RK'] },
    { id: 't5', title: 'Review Performance Planning tim IT', app: 'Pervorms', code: 'PV/2026/0031', due: D(0), time: '17.00', priority: 'tinggi', kind: 'Approval', loc: 'Jakarta', sub: [0, 2], comments: 1, files: 1, people: ['SY'] },
    { id: 't6', title: 'Persetujuan cuti — A. Rahman', app: 'HRIS', code: 'CT/2026/0412', due: D(0), time: '', priority: 'tinggi', kind: 'Approval', loc: 'Medan', sub: [0, 1], comments: 0, files: 1, people: ['AR'] },
    { id: 't7', title: 'Approve lembur — Tim Infrastruktur', app: 'HRIS', code: 'LB/2026/0198', due: D(1), time: '', priority: 'sedang', kind: 'Approval', loc: 'Surabaya', sub: [0, 1], comments: 0, files: 0, people: ['DP'] },
    { id: 't8', title: 'Lengkapi Self Assessment', app: 'Assessment', code: 'AS/2026/0077', due: D(2), time: '', priority: 'sedang', kind: 'Untuk saya', loc: 'Jakarta', sub: [2, 5], comments: 0, files: 0, people: ['SY'] },
    { id: 't9', title: 'Isi timesheet Oktober', app: 'HRIS', code: 'TS/2026/1031', due: D(3), time: '', priority: 'rendah', kind: 'Untuk saya', loc: 'Jakarta', sub: [0, 1], comments: 0, files: 0, people: ['SY'] },
    { id: 't10', title: 'Kirim penawaran revisi ke PT Delta', app: 'SAUMail', code: 'SM/2026/0049', due: D(2), time: '10.00', priority: 'sedang', kind: 'Untuk saya', loc: 'Surabaya', sub: [1, 3], comments: 4, files: 2, people: ['BS', 'RK'] },
    { id: 't11', title: 'Audit APAR gedung B', app: 'Digital Patrol', code: 'DP/2026/0091', due: D(5), time: '', priority: 'rendah', kind: 'Untuk saya', loc: 'Balikpapan', sub: [0, 4], comments: 0, files: 0, people: ['DP'] },
    { id: 't12', title: 'Follow-up SO PT Nusantara', app: 'Sales Order', code: 'SO/2026/00131', due: D(6), time: '', priority: 'sedang', kind: 'Untuk saya', loc: 'Makassar', sub: [0, 2], comments: 1, files: 0, people: ['AN'] },
    { id: 't13', title: 'Verifikasi klaim reimbursement', app: 'HRIS', code: 'RB/2026/0233', due: D(2), time: '', priority: 'tinggi', kind: 'Approval', loc: 'Jayapura', sub: [0, 1], comments: 0, files: 3, people: ['SR'] },
    { id: 't14', title: 'Rekap KPI bulanan', app: 'Pervorms', code: 'PV/2026/0040', due: D(8), time: '', priority: 'rendah', kind: 'Untuk saya', loc: 'Jakarta', sub: [0, 3], comments: 0, files: 0, people: ['SY'] },
  ];

  const history = [
    { id: 'h1', title: 'Konfirmasi peserta pelatihan Q4', app: 'Talent', doneAt: D(0), time: '08.40' },
    { id: 'h2', title: 'Validasi data aset TI', app: 'Assessment', doneAt: D(0), time: '09.05' },
    { id: 'h3', title: 'Rekap absensi Oktober', app: 'HRIS', doneAt: D(-1), time: '16.20' },
    { id: 'h4', title: 'Approve PO perangkat jaringan', app: 'Procurement', doneAt: D(-1), time: '11.10' },
    { id: 'h5', title: 'Update SOP backup server', app: 'InOffice', doneAt: D(-2), time: '14.00' },
  ];

  const dayName = DAYS[t.getDay()];
  // Jadwal hari ini (dipakai di Beranda, Kalender Hari & Minggu)
  const events = [
    { id: 'e1', type: 'rapat', date: D(0), start: '08.00', end: '08.30', title: 'Stand-up Tim Infra', loc: 'Ruang Tim Infra' },
    {
      id: 'e2', type: 'rapat', date: D(0), start: '09.00', end: '10.30', title: 'Review sistem cuti baru', loc: 'Ruang Rapat Lt. 5', code: 'RPT-2031',
      repeat: `Setiap ${dayName}`, link: 'meet.mysau.id/hr-cuti', people: ['SY', 'SR', 'AR', 'DP'], extra: 2, attend: '4 hadir, 2 belum konfirmasi',
      desc: 'Bahas alur pengajuan cuti di HRIS v2 dan integrasi approval atasan ke MySAU.',
    },
    { id: 'e3', type: 'rapat', date: D(0), start: '11.00', end: '12.00', title: '1:1 dengan Siti R. — HRIS', loc: 'Google Meet', people: ['SY', 'SR'] },
    { id: 'e4', type: 'event', date: D(0), start: '14.30', end: '15.30', title: 'Demo dashboard Pervorms', loc: 'Ruang Inovasi' },
    { id: 'e5', type: 'rapat', date: D(0), start: '16.00', end: '16.30', title: 'Rekap harian tim Infra', loc: 'Ruang Tim Infra' },
    // Minggu ini & bulan ini
    { id: 'e6', type: 'rapat', date: D(1), start: '10.00', end: '11.00', title: 'Rapat anggaran TI', loc: 'Ruang Rapat Lt. 3' },
    { id: 'e7', type: 'event', date: D(2), start: '14.00', end: '15.30', title: 'Townhall Q4', loc: 'Auditorium' },
    { id: 'e8', type: 'rapat', date: D(3), start: '15.00', end: '16.00', title: 'Retro sprint', loc: 'Google Meet' },
    { id: 'e9', type: 'event', date: D(6), allDay: true, title: 'Pelatihan Q4 · Hari 1', loc: 'Learning Center' },
    { id: 'e10', type: 'event', date: D(7), allDay: true, title: 'Pelatihan Q4 · Hari 2', loc: 'Learning Center' },
    { id: 'e11', type: 'rapat', date: D(8), start: '09.30', end: '10.00', title: '1:1 dengan Siti R.', loc: 'Google Meet' },
    { id: 'e12', type: 'rapat', date: D(9), start: '13.00', end: '14.30', title: 'Steering committee', loc: 'Ruang Direksi' },
    { id: 'e13', type: 'event', date: D(10), start: '16.00', end: '17.00', title: 'Sharing session keamanan siber', loc: 'Ruang Inovasi' },
    { id: 'e14', type: 'rapat', date: D(13), start: '09.00', end: '10.00', title: 'Kickoff audit internal', loc: 'Ruang Rapat Lt. 5' },
    { id: 'e15', type: 'cuti', date: D(15), allDay: true, title: 'Cuti — A. Rahman' },
    { id: 'e16', type: 'rapat', date: D(16), start: '10.00', end: '11.00', title: 'Review vendor HRIS', loc: 'Ruang Rapat Lt. 3' },
    { id: 'e17', type: 'event', date: D(17), allDay: true, title: 'Townhall Medan', loc: 'Kantor Medan' },
    { id: 'e18', type: 'rapat', date: D(20), start: '09.00', end: '10.30', title: 'Sprint planning', loc: 'Ruang Tim Infra' },
    { id: 'e19', type: 'rapat', date: D(22), start: '14.00', end: '15.00', title: 'Demo HRIS v2', loc: 'Auditorium' },
    { id: 'e20', type: 'event', date: D(23), allDay: true, title: 'Outing divisi TI', loc: 'Bogor' },
    { id: 'e21', type: 'rapat', date: D(-1), start: '09.00', end: '10.00', title: 'Weekly sync', loc: 'Ruang Rapat Lt. 5' },
    { id: 'e22', type: 'rapat', date: D(-7), start: '10.00', end: '11.00', title: 'Retro Q3', loc: 'Google Meet' },
    // Ulang tahun & catatan (stiker di kalender Beranda)
    { id: 'b1', type: 'ultah', date: D(0), allDay: true, title: 'Ulang tahun Rina Kartika', person: 'Rina Kartika', unit: 'Finance' },
    { id: 'b2', type: 'ultah', date: D(2), allDay: true, title: 'Ulang tahun Dimas Pratama', person: 'Dimas Pratama', unit: 'IT Infrastruktur' },
    { id: 'b3', type: 'ultah', date: D(4), allDay: true, title: 'Ulang tahun Ayu Lestari', person: 'Ayu Lestari', unit: 'Human Capital' },
    { id: 'b4', type: 'ultah', date: D(15), allDay: true, title: 'Ulang tahun Siti R.', person: 'Siti R.', unit: 'HRIS' },
    { id: 'b5', type: 'ultah', date: D(24), allDay: true, title: 'Ulang tahun Maya Putri', person: 'Maya Putri', unit: 'Legal' },
    { id: 'n1', type: 'catatan', date: D(1), allDay: true, title: 'Siapkan bahan Self Assessment' },
    { id: 'n2', type: 'catatan', date: D(10), allDay: true, title: 'Perpanjang lisensi antivirus' },
  ];

  return { tasks, history, events };
}

function nationalDays(year, month) {
  const out = [];
  Object.entries(NATIONAL).forEach(([md, [title, libur]]) => {
    const [m, d] = md.split('-').map(Number);
    if (m - 1 === month) out.push({ id: `nat-${year}-${md}`, type: 'cuti', national: true, libur, date: `${year}-${md}`, allDay: true, title });
  });
  return out;
}

const NOTIFICATIONS = [
  { who: 'AR', text: 'A. Rahman mengajukan cuti 3 hari', meta: 'HRIS · butuh approval Anda', ago: '5 mnt' },
  { who: 'RK', text: 'Rina berkomentar di "Review proposal penawaran"', meta: 'SAUMail', ago: '30 mnt' },
  { who: 'DP', text: 'Dimas menyelesaikan "Validasi data aset TI"', meta: 'Assessment', ago: '1 jam' },
];

const ACTIVITY = [
  { who: 'AN', text: 'Andi mengundang Anda', ref: 'Review proposal penawaran', icon: 'file', ago: '10 mnt lalu' },
  { who: 'RK', text: 'Rina berkomentar', quote: '“Data pesanan sudah dilengkapi.”', ago: '30 mnt lalu' },
  { who: 'DP', text: 'Dimas menyelesaikan task', ref: 'Validasi data aset TI', icon: 'checkCircle', ago: '1 jam lalu' },
  { who: 'BS', text: 'Budi menugaskan Anda', ref: 'Susun Performance Planning', icon: 'file', ago: '2 jam lalu' },
];

return {USER,APPS,PEOPLE,CAL_TYPES,PRIORITY,buildSeed,nationalDays,NOTIFICATIONS,ACTIVITY};
},
'js/drawer.js': function(require) {
const { icon } = require("js/icons.js");
const { esc } = require("js/utils.js");
const groups=["Kepegawaian", "Produktivitas & Dokumen", "Kinerja & Talenta", "Operasional", "Pelaporan"];
const catalog=[{"id": "workers", "name": "Data Pekerja", "icon": "user", "group": "Kepegawaian", "desc": "Kepegawaian"}, {"id": "leave", "name": "Cuti dan Izin Pekerja", "icon": "calendar", "group": "Kepegawaian", "desc": "Kepegawaian"}, {"id": "overtime", "name": "Lembur Pekerja", "icon": "clock", "group": "Kepegawaian", "desc": "Kepegawaian"}, {"id": "activity", "name": "Rekam Aktivitas", "icon": "task", "group": "Kepegawaian", "desc": "Kepegawaian"}, {"id": "payroll", "name": "Payroll Management", "icon": "brief", "group": "Kepegawaian", "desc": "Kepegawaian"}, {"id": "inoffice", "name": "In Office", "icon": "mail", "group": "Produktivitas & Dokumen", "desc": "Produktivitas & Dokumen", "route": "/inoffice"}, {"id": "saumail", "name": "SAUMail", "icon": "message", "group": "Produktivitas & Dokumen", "desc": "Produktivitas & Dokumen"}, {"id": "drive", "name": "SAUDrive", "icon": "layers", "group": "Produktivitas & Dokumen", "desc": "Produktivitas & Dokumen"}, {"id": "knowledge", "name": "Knowledge Hub", "icon": "help", "group": "Produktivitas & Dokumen", "desc": "Produktivitas & Dokumen"}, {"id": "minutes", "name": "Berita Acara", "icon": "task", "group": "Produktivitas & Dokumen", "desc": "Produktivitas & Dokumen"}, {"id": "pervoms", "name": "Pervoms", "icon": "trend", "group": "Kinerja & Talenta", "desc": "Kinerja & Talenta"}, {"id": "intern", "name": "Sertifikat Magang", "icon": "award", "group": "Kinerja & Talenta", "desc": "Kinerja & Talenta"}, {"id": "cv", "name": "CV Screening", "icon": "users", "group": "Kinerja & Talenta", "desc": "Kinerja & Talenta"}, {"id": "background", "name": "Sosmed Background Checking", "icon": "search", "group": "Kinerja & Talenta", "desc": "Kinerja & Talenta"}, {"id": "patrol", "name": "Digital Patrol", "icon": "check", "group": "Operasional", "desc": "Operasional"}, {"id": "moover", "name": "Moover", "icon": "pin", "group": "Operasional", "desc": "Operasional"}, {"id": "wbs", "name": "Whistleblowing System", "icon": "bell", "group": "Pelaporan", "desc": "Pelaporan"}];
let showDrawer=null;
function openDrawer(){if(showDrawer)showDrawer();}
function initDrawer(){
 const host=document.createElement('div');host.className='drawer-host';document.getElementById('frame').appendChild(host);host.hidden=true;
 let selected='Semua',query='',previous=null,detail=null;
 const inert=on=>[...document.getElementById('frame').children].filter(e=>e!==host).forEach(e=>{e.inert=on;});
 function close(){host.hidden=true;inert(false);document.querySelector('[data-drawer]')?.setAttribute('aria-expanded','false');(previous?.isConnected?previous:document.querySelector('[data-drawer]'))?.focus();}
 function results(){
 const filtered=catalog.filter(a=>(selected==='Semua'||a.group===selected)&&`${a.name} ${a.desc} ${a.group}`.toLowerCase().includes(query.toLowerCase().trim()));
 host.querySelector('.drawer-count').textContent=`${filtered.length} aplikasi`;
 host.querySelector('.drawer-body').innerHTML=detail?`<div class="drawer-detail"><span class="drawer-app-icon">${icon(detail.icon,28)}</span><h3>${esc(detail.name)}</h3><p>${esc(detail.desc)}</p><p class="drawer-note">Simulasi akses aplikasi. Pada versi terintegrasi, aplikasi ini dibuka melalui akun MySAU Anda.</p><button class="btn primary" data-drawer-back>Kembali ke daftar aplikasi</button></div>`:filtered.length?groups.map(g=>{const apps=filtered.filter(a=>a.group===g);return apps.length?`<section><h3>${g}<small>${apps.length}</small></h3><div class="drawer-grid">${apps.map(a=>`<button class="drawer-app" data-drawer-app="${a.id}"><span class="drawer-app-icon">${icon(a.icon,21)}</span><span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span>${icon('arrowUR',13)}</button>`).join('')}</div></section>`:'';}).join(''):'<div class="drawer-empty">Aplikasi tidak ditemukan.<small>Coba nama aplikasi atau kategori lain.</small></div>';
 host.querySelectorAll('[data-drawer-app]').forEach(b=>b.onclick=()=>{const a=catalog.find(x=>x.id===b.dataset.drawerApp);if(a.route){close();location.hash=a.route;}else{detail=a;results();host.querySelector('[data-drawer-back]').focus();}});
 host.querySelector('[data-drawer-back]')?.addEventListener('click',()=>{detail=null;results();host.querySelector('input').focus();});
 }
 showDrawer=(app=null)=>{previous=document.activeElement;selected='Semua';query='';detail=app;host.hidden=false;inert(true);document.querySelector('[data-drawer]')?.setAttribute('aria-expanded','true');
 host.innerHTML=`<div class="drawer-backdrop"></div><section class="app-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><header><div><h2 id="drawer-title">Semua aplikasi</h2><p>Satu tempat untuk kebutuhan kerja Anda.</p></div><button class="icon-btn" data-drawer-close aria-label="Tutup daftar aplikasi">${icon('x',20)}</button></header><label class="drawer-search">${icon('search',18)}<input type="search" placeholder="Cari aplikasi…" aria-label="Cari aplikasi dalam drawer" autocomplete="off"><span class="drawer-count"></span></label><div class="drawer-filters">${['Semua',...groups].map((g,i)=>`<button data-group="${esc(g)}" aria-pressed="${i===0}" class="${i===0?'on':''}">${g}</button>`).join('')}</div><div class="drawer-body"></div><footer>MySAU · Ruang kerja Anda</footer></section>`;
 host.querySelector('[data-drawer-close]').onclick=close;host.querySelector('.drawer-backdrop').onclick=close;
 host.querySelector('input').oninput=e=>{query=e.target.value;detail=null;results();};
 host.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>{selected=b.dataset.group;detail=null;host.querySelectorAll('[data-group]').forEach(t=>{t.classList.toggle('on',t===b);t.setAttribute('aria-pressed',String(t===b));});results();});results();host.querySelector('input').focus();
 };
 document.addEventListener('click',e=>{if(e.target.closest('[data-drawer]'))showDrawer();});
 host.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const els=[...host.querySelectorAll('button,input')];const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 initEdge(a=>{if(a.route)location.hash=a.route;else showDrawer(a);});
 window.addEventListener('hashchange',()=>{if(!host.hidden)close();});
}

function initEdge(openApp){
 const edge=document.createElement('div');edge.className='edge-host';document.getElementById('frame').appendChild(edge);
 let favorites=['inoffice','saumail','leave','drive','patrol'],opened=false,editing=false,anchor=null,startX=0;
 try{const saved=JSON.parse(localStorage.getItem('mysau.favorites'));if(Array.isArray(saved))favorites=[...new Set(saved)].filter(id=>catalog.some(a=>a.id===id)).slice(0,6);}catch{}
 const save=()=>{try{localStorage.setItem('mysau.favorites',JSON.stringify(favorites));}catch{}};
 function close(){opened=false;editing=false;render();edge.querySelector('.edge-handle').focus();}
 function render(){
 edge.innerHTML=`<button class="edge-handle" aria-label="Buka aplikasi favorit" aria-expanded="${opened}" aria-controls="edge-panel"><span></span></button>${opened?`<div class="edge-shade"></div><section id="edge-panel" class="edge-panel ${editing?'editing':''}" role="dialog" aria-label="Aplikasi favorit"><header><strong>${editing?'Edit favorit':'Favorit Anda'}</strong><button data-edge-close aria-label="Tutup favorit">${icon('x',18)}</button></header>${editing?`<p>Pilih maksimal 6 aplikasi. Atur urutannya dengan panah.</p><div class="edge-selected">${favorites.map((id,i)=>{const a=catalog.find(a=>a.id===id);return `<div><span>${esc(a.name)}</span><button data-up="${id}" ${i===0?'disabled':''} aria-label="Naikkan ${esc(a.name)}">↑</button><button data-down="${id}" ${i===favorites.length-1?'disabled':''} aria-label="Turunkan ${esc(a.name)}">↓</button></div>`;}).join('')}</div><div class="edge-choices">${groups.map(g=>`<h4>${esc(g)}</h4>${catalog.filter(a=>a.group===g).map(a=>`<label><input type="checkbox" value="${a.id}" ${favorites.includes(a.id)?'checked':''} ${!favorites.includes(a.id)&&favorites.length>=6?'disabled':''}>${esc(a.name)}</label>`).join('')}`).join('')}</div><button class="edge-edit" data-edge-edit>Selesai · ${favorites.length}/6 aplikasi</button>`:`<div class="edge-apps">${favorites.map(id=>{const a=catalog.find(a=>a.id===id);return `<button data-edge-app="${id}"><span>${icon(a.icon,23)}</span><small>${esc(a.name)}</small></button>`;}).join('')||'<p>Belum ada favorit. Pilih aplikasi lewat Edit favorit.</p>'}</div><button class="edge-all" data-edge-all>${icon('grid',20)} Semua aplikasi</button><button class="edge-edit" data-edge-edit>Edit favorit</button>`}</section>`:''}`;
 edge.querySelector('.edge-handle').onclick=()=>{opened=!opened;editing=false;render();if(opened)edge.querySelector('[data-edge-close]').focus();};
 edge.querySelector('.edge-handle').ontouchstart=e=>{startX=e.touches[0].clientX;};
 edge.querySelector('.edge-handle').ontouchend=e=>{if(e.changedTouches[0].clientX-startX>25){opened=true;render();}};
 edge.querySelector('[data-edge-close]')?.addEventListener('click',close);edge.querySelector('.edge-shade')?.addEventListener('click',close);
 edge.querySelector('[data-edge-edit]')?.addEventListener('click',()=>{editing=!editing;render();edge.querySelector(editing?'.edge-choices input':'[data-edge-edit]')?.focus();});
 edge.querySelector('[data-edge-all]')?.addEventListener('click',()=>{close();openDrawer();});
 edge.querySelectorAll('[data-edge-app]').forEach(b=>b.onclick=()=>{const a=catalog.find(a=>a.id===b.dataset.edgeApp);close();openApp(a);});
 edge.querySelectorAll('input').forEach(b=>b.onchange=()=>{if(b.checked&&favorites.length<6)favorites.push(b.value);else favorites=favorites.filter(id=>id!==b.value);save();const pos=edge.querySelector('.edge-choices').scrollTop;render();edge.querySelector('.edge-choices').scrollTop=pos;edge.querySelector(`input[value="${b.value}"]`)?.focus();});
 edge.querySelectorAll('[data-up],[data-down]').forEach(b=>b.onclick=()=>{const id=b.dataset.up||b.dataset.down,i=favorites.indexOf(id),j=i+(b.dataset.up?-1:1);if(j<0||j>=favorites.length)return;[favorites[i],favorites[j]]=[favorites[j],favorites[i]];save();render();edge.querySelector(`[${b.dataset.up?'data-up':'data-down'}="${id}"]`)?.focus();});
 }
 edge.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'&&opened){const buttons=[...edge.querySelectorAll('.edge-panel button:not(:disabled),.edge-panel input:not(:disabled)')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 window.addEventListener('hashchange',()=>{opened=false;editing=false;render();});render();
}

return {openDrawer,initDrawer};
},
'js/icons.js': function(require) {
// Line icons (24×24, stroke = currentColor)
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  task: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUR: '<path d="M7 17 17 7M7 7h10v10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  star: '<path d="M12 2 15 8.5l7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  clip: '<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L15 7.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 13 9 5 9-5"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8z"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  align: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
};

function icon(name, size = 18, sw = 1.8) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
}

// Replace <span data-icon="name"> placeholders in static HTML
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (el.dataset.done) return;
    el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 18, Number(el.dataset.sw) || 1.8);
    el.dataset.done = '1';
  });
}

return {icon,hydrateIcons};
},
'js/main.js': function(require) {
const { initDrawer } = require("js/drawer.js");
const { initAssistant } = require("js/assistant.js");
const { icon, hydrateIcons } = require("js/icons.js");
const { $, esc } = require("js/utils.js");
const { USER } = require("js/data.js");
const { subscribe, counts } = require("js/store.js");
const { toast, togglePop, closePop, renderNotifPop, renderProfilePop, initSearch } = require("js/ui.js");
const beranda = require("js/pages/beranda.js");
const task = require("js/pages/task.js");
const kalender = require("js/pages/kalender.js");

const inoffice = require("js/pages/inoffice.js");
const team = require("js/pages/team.js");
const { LEADER_ROLES } = require("js/team.js");

// Tab Tim Saya hanya untuk peran pemimpin (Dept. Head, Group Head, Direktur)
const isLeader = LEADER_ROLES.includes(USER.role);
const PAGES = { beranda, task, kalender, inoffice, ...(isLeader ? { team } : {}) };
const TITLES = { beranda: 'Beranda', task: 'Task', kalender: 'Kalender', inoffice: 'InOffice', team: 'Tim Saya' };
const app = $('#app');
let current = null;

const route = () => {
  const r = (location.hash.replace(/^#\/?/, '') || 'beranda').split('?')[0];
  return PAGES[r] ? r : 'beranda';
};

function renderShell(r) {
  const c = counts();
  const navItems = [
    ['beranda', 'home', 'Beranda'], ['task', 'task', 'Task'], ['kalender', 'calendar', 'Kalender'], ['inoffice', 'mail', 'InOffice'],
    ...(isLeader ? [['team', 'users', 'Tim Saya']] : []),
  ];
  const badges = { task: c.active, kalender: c.agendaToday, team: isLeader ? team.badge() : 0 };
  // tab ikon; tombol Aplikasi berada setelah tab kedua
  $('#tabbar').innerHTML = navItems.map(([k, ic, label], i) => `${i === 2 ? `<button type="button" class="tab drawer-trigger" data-drawer aria-label="Aplikasi" aria-haspopup="dialog" aria-expanded="false">${icon('grid',22)}<span>Aplikasi</span></button>` : ''}<a class="tab${r === k ? ' on' : ''}" href="#/${k}" aria-label="${label}" ${r === k ? 'aria-current="page"' : ''}>${icon(ic, 18, 1.9)}<span>${label}</span>${badges[k] ? `<b class="tb-badge">${badges[k]}</b>` : ''}</a>`).join('')
    ;
  $('#profileName').textContent = USER.name;
  $('#profileRole').textContent = `${USER.role} · ${USER.division}`;
}

function render({ focus = false } = {}) {
  const r = route();
  const page = PAGES[r];
  const scrolls = [...app.querySelectorAll('.scroll')].map((el) => el.scrollTop);
  renderShell(r);
  // animasi Beranda = satu timeline 12 detik; offset ini menjaga fasenya tetap jalan saat render ulang
  app.style.setProperty('--tl', `${(-(performance.now() % 12000) / 1000).toFixed(3)}s`);
  app.innerHTML = page.render();
  app.dataset.page = r;
  page.bind(app, () => render());
  if (r === current) app.querySelectorAll('.scroll').forEach((el, i) => { if (scrolls[i] != null && !el.classList.contains('tl-scroll')) el.scrollTop = scrolls[i]; });
  if (r !== current) {
    document.title = `${TITLES[r]} — MySAU`;
    if (focus) app.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  current = r;
}

/* global UI */
hydrateIcons();
initSearch((r) => { location.hash = `#/${r}`; });
$('#bellBtn').addEventListener('click', (e) => { e.stopPropagation(); renderNotifPop(); togglePop($('#notifPop'), e.currentTarget); });
$('#profileBtn').addEventListener('click', (e) => { e.stopPropagation(); renderProfilePop(); togglePop($('#profilePop'), e.currentTarget); });
document.addEventListener('click', (e) => {
  const t = e.target.closest('.sidebar [data-action="todo"], .tabbar [data-action="todo"], .popover [data-action="todo"], .side-help');
  if (!t) return;
  closePop();
  toast(t.dataset.msg || 'Pusat bantuan: hubungi IT Service Desk');
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); setSearchOpen(false); } });

/* HP: tombol ikon search membuka kolom cari di tengah, di bawah header */
const searchToggle = $('#searchToggle');
function setSearchOpen(open) {
  const was = document.documentElement.classList.contains('search-open');
  if (was === open) return;
  document.documentElement.classList.toggle('search-open', open);
  searchToggle.setAttribute('aria-expanded', String(open));
  if (open) $('#searchInput').focus();
  else { $('#searchResults').hidden = true; if (document.activeElement === $('#searchInput')) searchToggle.focus(); }
}
searchToggle.addEventListener('click', (e) => { e.stopPropagation(); setSearchOpen(!document.documentElement.classList.contains('search-open')); });
document.addEventListener('click', (e) => { if (!e.target.closest('#search, #searchToggle') && !$('#searchInput').value) setSearchOpen(false); });

window.addEventListener('hashchange', () => { closePop(); setSearchOpen(false); render({ focus: true }); });
subscribe(() => render());
render();
initAssistant();
initDrawer();

// live clock + minute refresh (attendance hint, now-line)
let lastMin = new Date().getMinutes();
setInterval(() => {
  if (current === 'beranda') beranda.tick(app);
  const m = new Date().getMinutes();
  if (m !== lastMin) { lastMin = m; if (!document.querySelector('.modal-root.open') && !app.contains(document.activeElement)) render(); }
}, 1000);



return {esc};
},
'js/myteam/kit.js': function(require) {
// Komponen kecil yang dipakai bersama oleh halaman aplikasi My Team
const { icon } = require("js/icons.js");
const { esc } = require("js/utils.js");
const { PEOPLE } = require("js/data.js");
const { avatar } = require("js/ui.js");
const { ATT } = require("js/teamModel.js");

const STATUS = {
  ...ATT,
  nanti: { label: 'Belum berjalan', color: '#DCE4EE' },
};

function pageHead(title, sub, actions = '') {
  return `<div class="mt-head"><div><h1>${esc(title)}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="mt-actions">${actions}</div></div>`;
}

function kpi(label, value, note = '', tone = '') {
  return `<div class="mt-kpi glass ${tone}"><small>${esc(label)}</small><b>${value}</b>${note ? `<span>${note}</span>` : ''}</div>`;
}

function statusPill(status, time) {
  const s = STATUS[status] || STATUS.belum;
  return `<span class="mt-status" style="--c:${s.color}"><i></i>${esc(s.label)}${time ? ` · ${esc(time)}` : ''}</span>`;
}

function person(code, sub = '', size = 32) {
  return `<span class="mt-person">${avatar(code, size)}<span><b>${esc(PEOPLE[code]?.name || code)}</b>${sub ? `<small>${sub}</small>` : ''}</span></span>`;
}

function delta(n) {
  if (!n) return '<span class="mt-delta">0</span>';
  return `<span class="mt-delta ${n > 0 ? 'up' : 'down'}">${n > 0 ? '▲' : '▼'} ${Math.abs(n)}</span>`;
}

function bar(value, color = '#5B9BE0') {
  return `<span class="mt-bar" style="--w:${Math.max(0, Math.min(100, value))}%;--c:${color}"><i></i></span>`;
}

/** Garis tren kecil. labels opsional ditaruh di bawah. */
function spark(series, { w = 120, h = 32, labels = null, dot = true } = {}) {
  const min = Math.min(...series) - 2, max = Math.max(...series) + 2;
  const pts = series.map((v, i) => [(i / Math.max(1, series.length - 1)) * w, h - ((v - min) / (max - min || 1)) * h]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts.at(-1);
  const extra = labels ? 16 : 4;
  return `<svg class="mt-spark" viewBox="-10 -6 ${w + 20} ${h + 6 + extra}" width="${w + 20}" role="img" aria-label="Tren: ${series.join(', ')}">
    <path d="${d}" fill="none" stroke="#5B9BE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${dot ? `<circle cx="${lx}" cy="${ly}" r="3.2" fill="#1D49A3" stroke="#fff" stroke-width="1.5"/>` : ''}
    ${labels ? pts.map(([x], i) => `<text x="${x}" y="${h + 14}" text-anchor="middle">${esc(labels[i])}</text>`).join('') : ''}
  </svg>`;
}

const empty = (text) => `<p class="mt-empty">${icon('checkCircle', 18, 2)}${esc(text)}</p>`;

return {STATUS,pageHead,kpi,statusPill,person,delta,bar,spark,empty};
},
'js/myteam/main.js': function(require) {
// Aplikasi My Team: dashboard detail untuk pemimpin, terpisah dari MySAU (myteam.html)
const { icon, hydrateIcons } = require("js/icons.js");
const { $, esc } = require("js/utils.js");
const { USER } = require("js/data.js");
const { subscribe } = require("js/store.js");
const { MEMBERS, LEADER_ROLES } = require("js/team.js");
const { approvals, taskStats, fullName } = require("js/teamModel.js");
const { avatar } = require("js/ui.js");
const anggota = require("js/myteam/pages/anggota.js");
const profil = require("js/myteam/pages/profil.js");
const task = require("js/myteam/pages/task.js");
const kehadiran = require("js/myteam/pages/kehadiran.js");
const approval = require("js/myteam/pages/approval.js");
const skor = require("js/myteam/pages/skor.js");

const PAGES = { anggota, task, kehadiran, approval, skor };
const NAV = [['anggota', 'users', 'Anggota tim'], ['task', 'task', 'Task tim'], ['kehadiran', 'clock', 'Kehadiran'], ['approval', 'checkCircle', 'Persetujuan'], ['skor', 'trend', 'Skor']];
const TITLES = Object.fromEntries(NAV.map(([k, , l]) => [k, l]));
const app = $('#app');
let current = '';

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const [page, param] = path.split('/');
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { page: PAGES[page] ? page : 'anggota', param: page === 'anggota' ? param : undefined, query };
}

function renderShell(r) {
  const badges = { approval: approvals().length, task: taskStats().late.length };
  $('#mtNav').innerHTML = NAV.map(([k, ic, label]) => `<a class="mt-nav${r.page === k ? ' on' : ''}" href="#/${k}" ${r.page === k ? 'aria-current="page"' : ''} aria-label="${label}">${icon(ic, 20, 1.9)}<span>${label}</span>${badges[k] ? `<b class="mt-nav-badge${k === 'task' ? ' red' : ''}" aria-label="${badges[k]} ${k === 'task' ? 'terlambat' : 'menunggu'}">${badges[k]}</b>` : ''}</a>`).join('');
  const crumbs = [`<a href="#/${r.page}">${esc(TITLES[r.page])}</a>`];
  if (r.param) crumbs.push(`<span>${esc(fullName(r.param))}</span>`);
  $('#mtCrumb').innerHTML = `<a class="mt-brand" href="#/anggota">My <span>Team</span></a><span class="mt-sep">/</span>${crumbs.join('<span class="mt-sep">/</span>')}`;
}

function render() {
  const r = route();
  const key = r.page + (r.param || '');
  const page = r.param ? profil : PAGES[r.page];
  const scrolls = [...app.querySelectorAll('.scroll')].map((el) => el.scrollTop);
  renderShell(r);
  app.innerHTML = page.render(r.param, r.query);
  app.dataset.page = r.param ? 'profil' : r.page;
  app.onclick = app.onchange = app.onkeydown = app.oninput = null;
  page.bind(app, render, r.param);
  if (key === current) app.querySelectorAll('.scroll').forEach((el, i) => { if (scrolls[i] != null) el.scrollTop = scrolls[i]; });
  else { document.title = `${r.param ? fullName(r.param) : TITLES[r.page]} — My Team`; app.focus({ preventScroll: true }); }
  current = key;
}

/* cari anggota */
function initSearch() {
  const input = $('#mtSearch');
  const box = $('#mtResults');
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    const hits = MEMBERS.filter((m) => `${fullName(m.code)} ${m.role}`.toLowerCase().includes(q));
    box.innerHTML = hits.length ? `<div class="sr-sec"><small>Anggota tim</small>${hits.map((m) => `<a class="sr-row" href="#/anggota/${m.code}">${avatar(m.code, 22)}<span>${esc(fullName(m.code))}</span><em>${esc(m.role)}</em></a>`).join('')}</div>`
      : `<p class="sr-empty">Tidak ada anggota bernama “${esc(input.value)}”.</p>`;
    box.hidden = false;
  };
  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const a = box.querySelector('a'); if (a) { location.hash = a.getAttribute('href'); input.value = ''; box.hidden = true; input.blur(); } }
    if (e.key === 'Escape') { input.value = ''; box.hidden = true; input.blur(); }
  });
  box.addEventListener('click', () => { input.value = ''; box.hidden = true; });
  document.addEventListener('click', (e) => { if (!e.target.closest('.mt-search')) box.hidden = true; });
  document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); } });
}

$('#mtProfile').innerHTML = `${avatar(USER.initials, 38)}<span class="profile-txt"><b>${esc(USER.name)}</b><small>${esc(USER.role)} · ${esc(USER.division)}</small></span>`;
hydrateIcons();
if (!LEADER_ROLES.includes(USER.role)) {
  app.innerHTML = `<div class="mt-page mt-denied"><h1>My Team hanya untuk pemimpin</h1><p class="muted">Aplikasi ini terbuka untuk Dept. Head, Group Head, dan Direktur.</p><a class="btn primary" href="index.html">Kembali ke MySAU</a></div>`;
} else {
  initSearch();
  window.addEventListener('hashchange', render);
  subscribe(() => render());
  render();
}

return {};
},
'js/myteam/pages/anggota.js': function(require) {
const { icon } = require("js/icons.js");
const { esc } = require("js/utils.js");
const { TEAM_UNIT, MEMBERS, scoreOf, weekAttendance } = require("js/team.js");
const { attendanceOf, approvals, taskStats, scoreStats, absences, shortName, rangeLabel } = require("js/teamModel.js");
const { ymd, today } = require("js/utils.js");
const { pageHead, kpi, statusPill, person, delta, STATUS } = require("js/myteam/kit.js");

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

function render() {
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

function bind(root, rerender) {
  root.onclick = (e) => {
    const v = e.target.closest('[data-view]');
    if (v) { view = v.dataset.view; rerender(); return; }
    const tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a')) location.hash = tr.dataset.href;
  };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = (e) => { if (e.target.matches('[data-sort]')) { sort = e.target.value; rerender(); } };
}

return {render,bind};
},
'js/myteam/pages/approval.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, addDays, fmtLong, ymd } = require("js/utils.js");
const { update } = require("js/store.js");
const { APPROVAL_INFO, decide, decisions, undoDecision } = require("js/team.js");
const { approvals, absences, fullName, shortName, rangeLabel } = require("js/teamModel.js");
const { avatar, toast } = require("js/ui.js");
const { pageHead, empty } = require("js/myteam/kit.js");

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

function render() {
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

function bind(root, rerender) {
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

return {render,bind};
},
'js/myteam/pages/kehadiran.js': function(require) {
const { esc, today, ymd, addDays, DAYS_SHORT, MONTHS_SHORT } = require("js/utils.js");
const { USER } = require("js/data.js");
const { MEMBERS, SHIFT_TOLERANCE, weekAttendance } = require("js/team.js");
const { activeTasks } = require("js/store.js");
const { absences, rangeLabel, AWAY } = require("js/teamModel.js");
const { pageHead, kpi, person, STATUS } = require("js/myteam/kit.js");

function render() {
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

function bind(root) {
  root.onclick = (e) => { const tr = e.target.closest('tr[data-href]'); if (tr && !e.target.closest('a')) location.hash = tr.dataset.href; };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = null;
}

return {render,bind};
},
'js/myteam/pages/profil.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, ymd, DAYS_SHORT } = require("js/utils.js");
const { PRIORITY } = require("js/data.js");
const { MEMBERS, TEAM_UNIT, TEAM_STAGES, STUCK_DAYS, SCORE_WEIGHTS, SCORE_LABELS, scoreOf, weekAttendance, isReminded, remind, noteOf, setNote } = require("js/team.js");
const { attendanceOf, taskStats, scoreStats, absences, fullName, shortName, rangeLabel, AWAY } = require("js/teamModel.js");
const { avatar, toast, duePill } = require("js/ui.js");
const { openAssign } = require("js/pages/team.js");
const { statusPill, delta, bar, spark, STATUS, empty } = require("js/myteam/kit.js");

const stageLabel = (id) => TEAM_STAGES.find((s) => s.id === id)?.label || id;

function render(code) {
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

function bind(root, rerender, code) {
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

return {render,bind};
},
'js/myteam/pages/skor.js': function(require) {
const { esc } = require("js/utils.js");
const { MEMBERS, SCORE_WEIGHTS, SCORE_LABELS, scoreOf } = require("js/team.js");
const { scoreStats, shortName } = require("js/teamModel.js");
const { pageHead, person, delta, bar, spark } = require("js/myteam/kit.js");

let sort = 'nama';

function render() {
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

function bind(root, rerender) {
  root.onclick = (e) => { const tr = e.target.closest('tr[data-href]'); if (tr) location.hash = tr.dataset.href; };
  root.onkeydown = (e) => { const tr = e.target.closest?.('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; };
  root.onchange = (e) => { if (e.target.matches('[data-sort]')) { sort = e.target.value; rerender(); } };
}

return {render,bind};
},
'js/myteam/pages/task.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, ymd, parseYmd, fmtLong, $$ } = require("js/utils.js");
const { PRIORITY } = require("js/data.js");
const { MEMBERS, TEAM_STAGES, STUCK_DAYS, isReminded, remind, editTask } = require("js/team.js");
const { taskStats, fullName, shortName } = require("js/teamModel.js");
const { avatar, toast, duePill } = require("js/ui.js");
const { openAssign } = require("js/pages/team.js");
const { pageHead } = require("js/myteam/kit.js");

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

function render(_, query = {}) {
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

function bind(root, rerender) {
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

return {render,bind};
},
'js/pages/beranda.js': function(require) {
const { openDrawer } = require("js/drawer.js");
const { icon } = require("js/icons.js");
const { esc, now, today, fmtLong, fmtMonth, monthMatrix, ymd, sameDay, toMin, fmtTime, greeting, DAYS_MINI, addMonths, pad } = require("js/utils.js");
const { USER, APPS } = require("js/data.js");
const { state, update, activeTasks, sortByDue, itemsForRange, counts, allTasks } = require("js/store.js");
const { duePill, toast, openAgendaModal, openApp, togglePop, renderNotifPop } = require("js/ui.js");

let calMonth = null;

function attendance() {
  const n = now();
  const nm = n.getHours() * 60 + n.getMinutes();
  const s = toMin(USER.shift.start), e = toMin(USER.shift.end);
  const a = state.attendance;
  let hint, hintTone = 'amber';
  if (a.out) { hint = `Pulang pukul ${a.out}`; hintTone = 'blue'; }
  else if (a.in) { hint = `Masuk pukul ${a.in}`; hintTone = 'green'; }
  else if (nm < s) hint = `Jam masuk: ${s - nm} menit lagi`;
  else if (nm < e) { const late = nm - s; hint = `Terlambat ${late >= 60 ? `${Math.floor(late / 60)} jam ${late % 60} mnt` : `${late} menit`}`; hintTone = 'red'; }
  else hint = 'Shift hari ini sudah selesai';
  const pct = Math.max(0, Math.min(1, (nm - s) / (e - s))) * 100;
  const status = a.out ? ['Selesai', 'blue'] : a.in ? ['Sudah masuk', 'green'] : ['Belum absen', 'amber'];
  const btn = a.out ? `<button class="btn primary clock" type="button" disabled>Selesai hari ini ${icon('check', 15, 2.4)}</button>`
    : `<button class="btn primary clock" type="button" data-action="clock">${a.in ? 'Clock Out' : 'Clock In'}<span class="btn-circ">${icon('arrowR', 16, 2.2)}</span></button>`;
  return `<article class="card glass att" aria-labelledby="attT">
    <div class="att-top">
      <div><small id="attT" class="muted">Absensi hari ini</small>
        <p class="clock-big"><span data-live="clock">${fmtTime(n).replace('.', ':')}</span><small>WIB</small></p></div>
      ${btn}
    </div>
    <div class="track" style="--p:${pct}%"><i class="track-fill"></i><i class="track-halo fx-now-halo"></i><i class="track-now fx-now-dot"></i><i class="track-end"></i></div>
    <div class="att-times">
      <div><small>Masuk</small><b>${a.in || '--.--'}</b></div>
      <span class="hint hint-${hintTone}">${esc(hint)}</span>
      <div class="r"><small>Pulang</small><b>${a.out || '--.--'}</b></div>
    </div>
    <div class="att-foot">${icon('pin', 14, 2)}<span>${esc(USER.office)} · dalam radius</span><i class="ok-dot"></i><span class="flex"></span><span class="pill pill-${status[1]}"><i class="d${a.in ? '' : ' fx-status-dot'}"></i>${status[0]}</span></div>
  </article>`;
}

function taskCard() {
  const tab = state.ui.berandaTab;
  let list = sortByDue(activeTasks());
  if (tab === 'saya') list = list.filter((t) => t.kind === 'Untuk saya');
  const shown = list.slice(0, 5);
  const c = counts();
  return `<article class="card glass tasks" aria-labelledby="tsT">
    <div class="card-head"><h2 id="tsT">Task Saya</h2><span class="badge">${c.active}</span><span class="flex"></span><a class="link" href="#/task">Semua ${icon('arrowUR', 13, 2)}</a></div>
    <div class="tabs-line" role="tablist">
      <button type="button" role="tab" class="${tab === 'semua' ? 'on' : ''}" aria-selected="${tab === 'semua'}" data-btab="semua">Semua</button>
      <button type="button" class="" data-action="addTask">Tambah Task</button>
      <button type="button" role="tab" class="${tab === 'saya' ? 'on' : ''}" aria-selected="${tab === 'saya'}" data-btab="saya">Untuk saya</button>
    </div>
    <ul class="task-list scroll">
      ${shown.map((t) => `<li class="task-row">
        <button type="button" class="check" data-done="${t.id}" aria-label="Tandai selesai: ${esc(t.title)}"></button>
        <div class="tr-main"><p class="tr-title">${esc(t.title)}</p>
          <div class="tr-sub">${duePill(t.due, t.time)}<span class="muted">${esc(t.app)} · ${esc(t.kind)}</span></div></div>
      </li>`).join('') || '<li class="empty">Semua task beres. Tambah task baru bila perlu.</li>'}
    </ul>
    <a class="link foot-link" href="#/task">Lihat semua task ${icon('arrowR', 13, 2)}</a>
  </article>`;
}

function stage() {
  const n = now();
  const c = counts();
  const waiting = activeTasks().filter((t) => t.due <= ymd(today())).length;
  const newest = allTasks()[0];
  const S = 'assets/stage/';
  const st = (cls, file) => `<span class="st ${cls}"><img src="${S}${file}" alt=""></span>`;
  // Susunan & urutan lapisan mengikuti frame Figma "Panggung Maskot" (75:766); animasi di css/motion.css
  return `<section class="col col-center stage-col" aria-label="Sapaan">
    <div class="greet">
      <span class="date-pill"><span class="sun-ic" aria-hidden="true"><span class="fx-sun-glow"><img src="${S}sun-glow.svg" alt=""></span><span class="fx-sun-core"><img src="${S}sun-core.svg" alt=""></span><span class="fx-sun-rays"><img src="${S}sun-rays.svg" alt=""></span></span><span>${fmtLong(today())}</span></span>
      <h1>${greeting(n.getHours())}, <span class="accent">${esc(USER.name)}</span></h1>
    </div>
    <div class="stage">
      <div class="stage-box">
        <div aria-hidden="true">
          ${st('st-glow', 'glow.svg')}${st('st-riak-b', 'riak-b.svg')}${st('st-riak-a', 'riak-a.svg')}
          ${st('st-orbit-o', 'orbit-outer.svg')}${st('st-orbit-i', 'orbit-inner.svg')}${st('st-orbit-dash', 'orbit-dashed.png')}
          <span class="st st-spin-2">${st('st-dot-2', 'orbit-dot-2.svg')}</span>
          ${st('st-kilau-3', 'kilau-3.svg')}${st('st-kilau-2', 'kilau-2.svg')}${st('st-kilau-1', 'kilau-1.svg')}
          <span class="st st-spin-1">${st('st-dot-1', 'orbit-dot.svg')}</span>
          ${st('st-platform', 'platform.svg')}${st('st-ring', 'platform-ring.svg')}
        </div>
        <button type="button" class="mk" data-ai-home aria-label="Buka Saut melalui maskot">
          <i class="mk-layer mk-body"></i><i class="mk-layer mk-skin-l"></i><i class="mk-layer mk-skin-r"></i>
          <span class="mk-arm"><i class="mk-layer"></i></span>
          <span class="mk-eye l"><span><i class="mk-eye-l"><img src="${S}mata-kiri.svg" alt=""></i></span></span>
          <span class="mk-eye r"><span><i class="mk-eye-r"><img src="${S}mata-kanan.svg" alt=""></i></span></span>
        </button>
        <button type="button" class="ai-home-bubble glass" data-ai-home aria-label="Ada yang bisa Saut bantu?" title="Tanya Saut"><span class="ai-ring" aria-hidden="true"></span><span>Ada yang bisa Saut bantu?</span></button>
        <button type="button" class="float-chip fc-left glass fx-chip-a" data-action="notif">
          <span class="fc-ic"><span class="fx-chip-a-ic">${icon('bell', 19)}</span></span><span class="fc-txt"><small>Notifikasi</small><b>03<em>Notifikasi baru</em></b></span>
        </button>
        <a class="float-chip fc-right glass fx-chip-b" href="#/task">
          <span class="fc-ic"><span class="fx-chip-b-ic">${icon('arrowUR', 19)}</span></span><span class="fc-txt"><small>Task terbaru · ${esc(newest.app)}</small><b>${pad(waiting)}<em>Task menunggu Anda</em></b></span>
        </a>
      </div>
    </div>
  </section>`;
}

function miniCal() {
  const t = today();
  const m = calMonth || new Date(t.getFullYear(), t.getMonth(), 1);
  const days = monthMatrix(m.getFullYear(), m.getMonth());
  const items = itemsForRange(days[0], days[41], { all: true });
  const by = {};
  items.forEach((e) => { (by[e.date] ||= []).push(e); });
  const cells = days.map((d) => {
    const k = ymd(d), list = by[k] || [];
    const out = d.getMonth() !== m.getMonth();
    const bday = list.find((e) => e.type === 'ultah');
    const note = list.find((e) => e.type === 'catatan');
    const agenda = list.some((e) => e.type === 'rapat' || e.type === 'event');
    const obs = list.some((e) => e.national);
    const sun = d.getDay() === 0;
    const tip = [bday && `🎂 ${bday.person} · ${bday.unit}`, note && `📝 ${note.title}`].filter(Boolean).join('  ');
    return `<div class="mc-cell${out ? ' out' : ''}${sameDay(d, t) ? ' today' : ''}${sun ? ' sun' : ''}${obs ? ' obs' : ''}" ${tip ? `data-tip="${esc(tip)}" tabindex="0"` : ''}>
      <span class="n">${d.getDate()}</span>${agenda && !out ? '<i class="dot"></i>' : obs && !out ? '<i class="dot obs"></i>' : '<i class="dot none"></i>'}
      ${bday && !out ? '<span class="sticker s-bday" aria-label="Ulang tahun">🎂</span>' : ''}${note && !out ? `<span class="sticker s-note${bday ? ' stack' : ''}" aria-label="Catatan">📝</span>` : ''}
    </div>`;
  }).join('');
  const nowMin = now().getHours() * 60 + now().getMinutes();
  const todays = (by[ymd(t)] || []).filter((e) => (e.type === 'rapat' || e.type === 'event') && !e.allDay);
  const upcoming = todays.filter((e) => toMin(e.end) > nowMin);
  const past = todays.filter((e) => toMin(e.end) <= nowMin).reverse();
  const show = [...upcoming, ...past].slice(0, 2);
  return `<article class="card glass minical" aria-labelledby="mcT">
    <div class="card-head"><div><small class="muted">Kalender</small><h2 id="mcT">${fmtMonth(m)}</h2></div><span class="flex"></span>
      <button type="button" class="icon-btn sm" data-mc="-1" aria-label="Bulan sebelumnya">${icon('chevL', 15, 2)}</button>
      <button type="button" class="icon-btn sm" data-mc="1" aria-label="Bulan berikutnya">${icon('chevR', 15, 2)}</button></div>
    <div class="mc-grid">${DAYS_MINI.map((x, i) => `<span class="mc-h${i === 6 ? ' sun' : ''}">${x}</span>`).join('')}${cells}</div>
    <div class="legend"><span><i class="dot"></i>Agenda</span><span><b class="mini-st">🎂</b>Ulang tahun</span><span><b class="mini-st note">📝</b>Catatan</span><span><i class="dot obs"></i>Peringatan</span></div>
    <div class="mc-today"><div class="card-head"><h3>Hari ini</h3><span class="flex"></span><small class="muted">${todays.length} agenda</small></div>
      ${show.map((e) => `<a class="agenda-row${toMin(e.end) <= nowMin ? ' past' : ''}" href="#/kalender" data-open-event="${e.id}" style="--c:${e.type === 'event' ? '#E39A2D' : '#4FA3E0'}"><span class="t">${e.start}</span><span><b>${esc(e.title)}</b><small>${esc(e.loc || '')} · ${toMin(e.end) - toMin(e.start)} mnt</small></span></a>`).join('') || '<p class="empty">Tidak ada agenda hari ini.</p>'}
    </div>
  </article>`;
}

function appsCard() {
  return `<article class="card glass apps" aria-labelledby="apT">
    <div class="card-head"><h2 id="apT">Pintasan Aplikasi</h2><span class="flex"></span><button type="button" class="link" data-action="allApps">Semua ${icon('arrowR', 13, 2)}</button></div>
    <div class="app-grid">${APPS.map((a) => `<button type="button" class="app-tile" data-app="${a.id}"><span class="app-ic">${icon(a.icon, 18)}</span><span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></span></button>`).join('')}</div>
  </article>`;
}

function render() {
  return `<div class="page page-beranda">
    <section class="col col-left">${attendance()}${taskCard()}</section>
    ${stage()}
    <section class="col col-right">${miniCal()}${appsCard()}</section>
  </div>`;
}

function bind(root, rerender) {
  root.onclick = (e) => {
    const b = e.target.closest('[data-action],[data-done],[data-btab],[data-mc],[data-app],[data-open-event]');
    if (!b) return;
    if (b.dataset.action === 'clock') {
      const t = fmtTime(now());
      const wasIn = !!state.attendance.in;
      update((s) => { if (!s.attendance.in) s.attendance.in = t; else s.attendance.out = t; });
      toast(wasIn ? `Clock out tercatat pukul ${t}` : `Clock in tercatat pukul ${t} · ${USER.office}`);
    }
    if (b.dataset.action === 'addTask') openAgendaModal({ mode: 'task' });
    if (b.dataset.action === 'notif') { renderNotifPop(); togglePop(document.getElementById('notifPop'), document.getElementById('bellBtn')); e.stopPropagation(); }
    if (b.dataset.action === 'allApps') openDrawer();
    if (b.dataset.done) {
      const id = b.dataset.done;
      update((s) => { s.doneIds.push(id); });
      toast('Task ditandai selesai', { label: 'Urungkan', run: () => update((s) => { s.doneIds = s.doneIds.filter((x) => x !== id); }) });
    }
    if (b.dataset.btab) update((s) => { s.ui.berandaTab = b.dataset.btab; }, { persist: false });
    if (b.dataset.mc) { const base = calMonth || new Date(today().getFullYear(), today().getMonth(), 1); calMonth = addMonths(base, Number(b.dataset.mc)); rerender(); }
    if (b.dataset.app) openApp(APPS.find((a) => a.id === b.dataset.app));
    if (b.dataset.openEvent) update((s) => { s.ui.calView = 'hari'; s.ui.calDate = today(); s.ui.selectedEvent = b.dataset.openEvent; }, { persist: false });
  };
}

function tick(root) {
  const el = root.querySelector('[data-live="clock"]');
  if (el) el.textContent = fmtTime(now()).replace('.', ':');
}

return {render,bind,tick};
},
'js/pages/inoffice.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, ymd } = require("js/utils.js");
const { toast } = require("js/ui.js");
const { APPS } = require("js/data.js");

const KEY = 'mysau.inoffice.v1';
const seed = [
 {id:'s1',title:'Penawaran kerja sama',number:'B.95.e-BSE/BCM/10/2026',sender:'Ferdiansyah · BCM',recipient:'Divisi Teknologi Informasi',status:'Menunggu pemeriksaan',action:'Periksa',due:'Hari ini',type:'Surat Eksternal',attachment:'Proposal Assessment 360.pdf',body:'Bersama ini kami sampaikan penawaran kerja sama pengembangan Assessment 360. Mohon pemeriksaan ruang lingkup pekerjaan dan rencana pelaksanaan sebelum proses persetujuan berikutnya.',mine:false},
 {id:'s2',title:'Pengadaan perangkat IT',number:'B.94.e-ICT/10/2026',sender:'Rina Kurniawati · ICT',recipient:'Siyono',status:'Menunggu tanda tangan',action:'Tinjau',due:'Hari ini',type:'Surat Internal',attachment:'Rincian kebutuhan perangkat.pdf',body:'Kami mengajukan pengadaan perangkat pendukung operasional tim IT. Mohon meninjau kebutuhan, spesifikasi, dan rencana pengadaan yang diajukan.',mine:false},
 {id:'s3',title:'Memo implementasi HRIS',number:'M.102/HRD/2026',sender:'Budi Santoso · HC',recipient:'Siyono',status:'Disposisi untuk Anda',action:'Tindak lanjuti',due:'Besok',type:'Memo Internal',attachment:'',body:'Mohon tim IT menyiapkan koordinasi implementasi HRIS, termasuk pemetaan kebutuhan integrasi dan penjadwalan pengujian bersama.',mine:false},
 {id:'s4',title:'Memo koordinasi tim IT',number:'M.98/ICT/2026',sender:'Siyono · IT',recipient:'Tim IT',status:'Terkirim',type:'Memo Internal',attachment:'',body:'Mohon seluruh anggota tim mempersiapkan pembaruan progres pekerjaan untuk pertemuan koordinasi mingguan.',mine:true},
 {id:'s5',title:'Penawaran Assessment 360',number:'B.90/BCM/2026',sender:'Siyono · IT',recipient:'Divisi BCM',status:'Disetujui',type:'Surat Eksternal',attachment:'Ruang lingkup Assessment.pdf',body:'Penawaran Assessment 360 telah selesai ditinjau. Silakan melanjutkan koordinasi sesuai ruang lingkup yang disepakati.',mine:true},
 {id:'d1',title:'Permohonan pelatihan tim IT',number:'Belum diterbitkan',sender:'Siyono · IT',recipient:'Divisi HC',status:'Draft',type:'Surat Internal',attachment:'',body:'Dengan hormat, kami mengajukan pelatihan untuk meningkatkan kompetensi tim IT.',mine:true}
];
let saved={}; try { saved=JSON.parse(localStorage.getItem(KEY))||{}; } catch {}
let letters=Array.isArray(saved.letters)&&saved.letters.length?saved.letters:seed;
let recent=Array.isArray(saved.recent)?saved.recent:['s4','s5'];
let searches=Array.isArray(saved.searches)?saved.searches:[];
let read=Array.isArray(saved.read)?saved.read:[];
let q='',filter='',showResults=false,refresh=()=>{};
const notices=[['s3','Surat baru dari Divisi HC','10 menit lalu','mail'],['s5','Surat Anda telah disetujui','30 menit lalu','checkCircle'],['s3','Disposisi baru untuk Anda','1 jam lalu','layers']];
function save(){try{localStorage.setItem(KEY,JSON.stringify({letters,recent,searches,read}));}catch{toast('Penyimpanan browser tidak tersedia; data hanya bertahan selama halaman ini terbuka.');}}
const pending=()=>letters.filter(s=>s.action);
const drafts=()=>letters.filter(s=>s.status==='Draft');
const row=(s)=>`<div class="io-row"><span class="io-icon">${icon('file',18)}</span><div class="io-row-text"><b>${esc(s.title)}</b><small>${esc(s.status)}</small></div><button class="io-pill" data-letter="${esc(s.id)}">${esc(s.action||'Lihat')}</button></div>`;
function matches(){return letters.filter(s=>(!filter||(filter==='mine'?s.mine:filter==='approval'?/pemeriksaan|tanda tangan/.test(s.status):Boolean(s.attachment)))&&[s.title,s.number,s.sender,s.recipient,s.type,s.attachment,s.body].join(' ').toLowerCase().includes(q.toLowerCase().trim()));}
function results(){const list=matches();return `<div class="io-results glass" aria-live="polite"><div class="card-head"><h2>Hasil pencarian <span class="muted">(${list.length})</span></h2><button class="io-close" data-close-results aria-label="Tutup hasil pencarian">${icon('x')}</button></div><div class="io-result-list">${list.map(s=>`<button class="io-result" data-letter="${esc(s.id)}"><span class="io-icon">${icon('file')}</span><span><b>${esc(s.title)}</b><small>${esc(s.sender)} · ${esc(s.number)}</small><small>${esc(s.status)}${s.attachment?' · '+esc(s.attachment):''}</small></span>${icon('chevR',15)}</button>`).join('')||'<p class="io-empty">Surat tidak ditemukan. Coba perihal, nomor, pengirim, atau nama lampiran.</p>'}</div></div>`;}
function render(){const p=pending(),d=drafts(),due=p.filter(s=>s.due==='Hari ini');return `<section class="page-inoffice"><h1>InOffice</h1><div class="io-grid"><div class="io-col">
<article class="card glass io-card"><h2>Pengingat</h2><div class="io-row"><span class="io-icon amber">${icon('bell',18)}</span><div class="io-row-text"><b>${due.length} surat mendekati tenggat</b><small>Hari ini</small></div><button class="io-pill" data-reminder>Lihat</button></div><div class="io-row"><span class="io-icon">${icon('edit',18)}</span><div class="io-row-text"><b>${d.length} draft belum dilanjutkan</b></div>${d[0]?`<button class="link" data-compose="${esc(d[0].id)}">Lanjutkan ${icon('arrowR',13)}</button>`:''}</div></article>
<article class="card glass io-card"><div class="card-head"><h2>Perlu tindak lanjut</h2><span class="badge">${p.length}</span></div><div class="io-pending">${p.map(row).join('')||'<p class="io-empty">Semua surat telah ditindaklanjuti.</p>'}</div></article></div>
<div class="io-center"><div class="io-find"><h2>Temukan surat, lanjutkan pekerjaan.</h2><p>Cari kebutuhan InOffice langsung dari MySAU.</p><form class="io-search glass" id="ioSearchForm">${icon('search',20)}<input id="ioQuery" aria-label="Cari di InOffice" placeholder="Cari surat, memo, lampiran, atau pengirim…" value="${esc(q)}" autocomplete="off"><button class="io-search-button" aria-label="Cari surat">${icon('arrowR',19)}</button></form><div class="io-chips">${[['mine','mail','Surat saya'],['approval','checkCircle','Menunggu approval'],['attachment','clip','Lampiran']].map(([f,i,l])=>`<button class="glass ${filter===f?'selected':''}" data-filter="${f}" aria-pressed="${filter===f}">${icon(i,15)}${l}</button>`).join('')}</div><div class="io-recent-search">Terakhir dicari: ${searches.length?searches.slice(0,2).map(s=>`<button data-query="${esc(s)}">${esc(s)}</button>`).join(' · '):'<button data-query="Penawaran">Penawaran kerja sama</button> · <button data-query="HRIS">Memo HRIS</button>'}</div><div id="ioResults">${showResults?results():''}</div></div>
<div class="io-quick"><h2>Buat cepat</h2><div class="io-quick-grid">${[['new','edit','Surat Baru'],['memo','file','Memo Internal'],['template','layers','Dari Template']].map(([v,i,l])=>`<button class="glass" data-compose="${v}"><span class="io-icon">${icon(i,20)}</span><span>${l}</span></button>`).join('')}</div></div>
${d[0]?`<button class="io-draft glass" data-compose="${esc(d[0].id)}">${icon('file',18)}<b>Draft terakhir</b><span>${esc(d[0].title)}</span><em>Lanjutkan →</em></button>`:'<div class="io-draft glass">Tidak ada draft tersimpan.</div>'}<button class="link io-open" data-open-app>Buka aplikasi InOffice ${icon('arrowUR',14)}</button></div>
<div class="io-col"><article class="card glass io-card"><div class="card-head"><h2>Notifikasi</h2><span class="badge">${notices.filter((_,i)=>!read.includes(i)).length}</span></div>${notices.map(([id,title,time,ic],i)=>`<button class="io-row io-notice" data-notice="${i}" data-letter="${id}"><span class="io-icon">${icon(ic,18)}</span><span class="io-row-text"><b>${title}</b><small>${time}</small></span>${!read.includes(i)?'<i class="io-dot"></i>':''}</button>`).join('')}</article><article class="card glass io-card"><h2>Akses terakhir</h2>${recent.slice(0,2).map(id=>letters.find(s=>s.id===id)).filter(Boolean).map(s=>`<button class="io-row io-access" data-letter="${esc(s.id)}">${icon('file',18)}<b>${esc(s.title)}</b></button>`).join('')}</article></div></div></section>`;}
function modal(title,body){const root=document.getElementById('modalRoot'),last=document.activeElement;root.classList.add('open');root.innerHTML=`<div class="io-modal-backdrop"><section class="io-modal glass-strong" role="dialog" aria-modal="true" aria-labelledby="ioModalTitle"><header><h2 id="ioModalTitle">${esc(title)}</h2><button data-io-close aria-label="Tutup">${icon('x',20)}</button></header>${body}</section></div>`;const close=()=>{root.classList.remove('open');root.innerHTML='';document.removeEventListener('keydown',keys);if(last?.isConnected)last.focus();else document.querySelector('.io-search input')?.focus();};function keys(e){if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...root.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus();}}}document.addEventListener('keydown',keys);root.querySelector('[data-io-close]').onclick=close;root.querySelector('.io-modal-backdrop').onclick=e=>{if(e.target.classList.contains('io-modal-backdrop'))close();};root.querySelector('input,button')?.focus();return {root,close};}
function view(id){const s=letters.find(x=>x.id===id);if(!s)return;if(s.status==='Draft'){compose(id);return;}recent=[id,...recent.filter(x=>x!==id)].slice(0,5);save();refresh();const {root,close}=modal('Preview surat',`<div class="io-detail"><article class="io-paper"><div class="io-paper-brand">SAU <small>PT SIAGA ABDI UTAMA</small></div><dl><dt>Nomor</dt><dd>${esc(s.number)}</dd><dt>Perihal</dt><dd>${esc(s.title)}</dd><dt>Kepada</dt><dd>${esc(s.recipient)}</dd></dl><p>Dengan hormat,</p><p>${esc(s.body)}</p><p>Demikian kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.</p><p>Hormat kami,<br>${esc(s.sender)}</p></article><aside><h3>Informasi surat</h3><dl><dt>Jenis</dt><dd>${esc(s.type)}</dd><dt>Status</dt><dd>${esc(s.status)}</dd><dt>Pengirim</dt><dd>${esc(s.sender)}</dd></dl><h3>Lampiran</h3><p>${s.attachment?esc(s.attachment)+' (contoh; berkas belum tersedia)':'Tidak ada lampiran.'}</p><h3>Catatan tindak lanjut</h3>${s.action?`<textarea id="ioNote" aria-label="Catatan tindak lanjut" placeholder="Tuliskan hasil pemeriksaan atau tindak lanjut…"></textarea><button class="btn primary" id="ioComplete">${s.action==='Tinjau'?'Tandai ditinjau':s.action==='Periksa'?'Selesaikan pemeriksaan':'Selesaikan tindak lanjut'}</button>`:`<p>${esc(s.note||'Tidak ada catatan.')}</p>`}<small class="io-demo">Preview data contoh. Tindakan disimpan di browser dan belum mengubah surat pada aplikasi InOffice.</small></aside></div>`);root.querySelector('#ioComplete')?.addEventListener('click',()=>{s.note=root.querySelector('#ioNote').value;s.status=s.action==='Tinjau'?'Ditinjau — menunggu tanda tangan resmi':'Selesai ditindaklanjuti';delete s.action;save();close();refresh();toast('Tindak lanjut disimpan di browser.');});}
function compose(mode){const existing=letters.find(s=>s.id===mode);if(mode==='template'){const {root,close}=modal('Pilih template',`<div class="io-template-list">${['Permohonan Pengadaan','Undangan Rapat','Memo Koordinasi'].map((t,i)=>`<button data-template="${i}" class="glass">${icon('file',20)}${t}${icon('chevR',16)}</button>`).join('')}</div>`);root.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{close();compose('tpl'+b.dataset.template);});return;}const titles={'tpl0':'Permohonan Pengadaan','tpl1':'Undangan Rapat','tpl2':'Memo Koordinasi'};const letter=existing||{title:titles[mode]||'',recipient:'',body:titles[mode]?'Dengan hormat,\n\nMohon melengkapi tujuan, rincian, dan jadwal kegiatan berikut.\n\nTerima kasih.':'',type:mode==='memo'||mode==='tpl2'?'Memo Internal':'Surat Internal'};const {root,close}=modal(existing?'Lanjutkan draft':'Buat surat cepat',`<form id="ioCompose" class="io-form"><label>Jenis dokumen<select name="type">${['Surat Internal','Surat Eksternal','Memo Internal'].map(t=>`<option ${letter.type===t?'selected':''}>${t}</option>`).join('')}</select></label><label>Perihal<input name="title" required maxlength="160" value="${esc(letter.title)}" placeholder="Perihal surat"></label><label>Penerima<input name="recipient" required maxlength="160" value="${esc(letter.recipient)}" placeholder="Nama atau divisi tujuan"></label><label>Isi surat<textarea name="body" required rows="6">${esc(letter.body)}</textarea></label><small>Draft disimpan di browser. Pengiriman dan tanda tangan resmi memerlukan integrasi InOffice.</small><div class="io-form-actions"><button class="btn" type="button" id="ioCancel">Batal</button><button class="btn primary" type="submit">Simpan draft</button></div></form>`);root.querySelector('#ioCancel').onclick=close;root.querySelector('#ioCompose').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target);if(!String(data.get('title')).trim()||!String(data.get('recipient')).trim()||!String(data.get('body')).trim()){toast('Lengkapi perihal, penerima, dan isi surat.');return;}const item={...letter,id:existing?.id||'d'+Date.now(),number:'Belum diterbitkan',sender:'Siyono · IT',status:'Draft',mine:true,attachment:'',date:ymd(today()),...Object.fromEntries(data)};if(existing)letters=letters.map(s=>s.id===existing.id?item:s);else letters.unshift(item);save();close();refresh();toast('Draft surat berhasil disimpan.');};}
function bind(root,rerender){refresh=rerender;const input=root.querySelector('#ioQuery');const run=()=>{q=input.value;showResults=true;root.querySelector('#ioResults').innerHTML=results();};input.oninput=run;root.querySelector('#ioSearchForm').onsubmit=e=>{e.preventDefault();run();if(q.trim()){searches=[q.trim(),...searches.filter(s=>s!==q.trim())].slice(0,5);save();}};root.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.notice!=null){read=[...new Set([...read,Number(b.dataset.notice)])];save();}if(b.dataset.letter)view(b.dataset.letter);if(b.dataset.compose)compose(b.dataset.compose);if(b.dataset.filter){filter=filter===b.dataset.filter?'':b.dataset.filter;showResults=true;refresh();}if(b.dataset.query){q=b.dataset.query;filter='';showResults=true;refresh();}if(b.hasAttribute('data-reminder')){filter='approval';q='';showResults=true;refresh();}if(b.hasAttribute('data-close-results')){showResults=false;refresh();}if(b.hasAttribute('data-open-app')){const app=APPS.find(a=>a.id==='inoffice');if(app?.url&&app.url!=='#'&&!app.url.startsWith('#/'))window.open(app.url,'_blank','noopener');else toast('Alamat aplikasi InOffice belum diatur. Isi URL di js/data.js saat integrasi.');}};}

// Prototype assistant bridge: local sample data only.
const assistantLetters = () => letters.map(s => ({ ...s }));
function assistantOpenLetter(id) { location.hash = '/inoffice'; setTimeout(() => view(id), 0); }
function assistantSaveDraft(title, body, recipient) {
 const id = 'd' + Date.now();
 letters.unshift({id,title,body,recipient,type:'Surat Internal',sender:'Siyono · IT',status:'Draft',number:'Belum diterbitkan',attachment:'',mine:true,date:ymd(today())});
 save(); refresh(); return id;
}

return {render,bind,assistantLetters,assistantOpenLetter,assistantSaveDraft};
},
'js/pages/kalender.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, now, today, fmtLong, fmtMonth, monthMatrix, ymd, parseYmd, sameDay, toMin, fromMin, fmtTime, addDays, addMonths, weekStart, DAYS, DAYS_SHORT, DAYS_MINI, MONTHS, MONTHS_SHORT } = require("js/utils.js");
const { CAL_TYPES, PRIORITY } = require("js/data.js");
const { state, update, itemsForRange, itemsOn, findEvent, activeTasks, sortByDue } = require("js/store.js");
const { avatars, duePill, prioTag, toast, openAgendaModal } = require("js/ui.js");

const H0 = 6, H1 = 21, PX = 46; // timeline hours & px per hour
let miniMonth = null;
let menuOpen = false;

const typeColor = (t) => (CAL_TYPES[t] || { color: '#7D8CA3' }).color;
const dur = (a, b) => { const m = toMin(b) - toMin(a); const h = Math.floor(m / 60), r = m % 60; return [h && `${h} jam`, r && `${r} menit`].filter(Boolean).join(' '); };

function rangeOf(view, d) {
  if (view === 'bulan') { const m = monthMatrix(d.getFullYear(), d.getMonth()); return [m[0], m[41]]; }
  if (view === 'minggu') { const s = weekStart(d); return [s, addDays(s, 6)]; }
  return [d, d];
}

/* ---------------- left column ---------------- */
function left() {
  const { calView: v, calDate: d } = state.ui;
  const t = today();
  const isToday = sameDay(d, t);
  const title = v === 'bulan' ? ['Agenda', 'bulan ini.'] : v === 'minggu' ? ['Agenda', 'minggu ini.'] : isToday ? ['Jadwal', 'hari ini.'] : ['Jadwal', 'harian.'];
  const dayItems = itemsOn(d);
  const sub = v === 'hari'
    ? `${fmtLong(d)} · ${dayItems.filter((e) => e.type === 'rapat' || e.type === 'event').length} agenda, ${dayItems.filter((e) => e.type === 'task').length} task`
    : `${fmtLong(t)} · WIB (GMT+7)`;
  const mm = miniMonth || new Date(d.getFullYear(), d.getMonth(), 1);
  const days = monthMatrix(mm.getFullYear(), mm.getMonth());
  const items = itemsForRange(days[0], days[41]);
  const has = new Set(items.filter((e) => e.type !== 'catatan').map((e) => e.date));
  const monthItems = itemsForRange(new Date(mm.getFullYear(), mm.getMonth(), 1), new Date(mm.getFullYear(), mm.getMonth() + 1, 0), { all: true });
  const cnt = (k) => monthItems.filter((e) => e.type === k).length;
  return `<section class="col col-left">
    <div class="page-title"><small class="eyebrow">Kalender · ${v === 'hari' ? 'detail hari' : v === 'minggu' ? 'minggu' : fmtMonth(d).toLowerCase()}</small><h1>${title[0]} <span class="accent">${title[1]}</span></h1><p class="muted">${esc(sub)}</p></div>
    <div class="split">
      <button type="button" class="btn primary grow" data-action="new" data-mode="event">${icon('plus', 17, 2.4)}Buat agenda</button>
      <button type="button" class="btn primary caret" data-action="menu" aria-haspopup="true" aria-expanded="${menuOpen}" aria-label="Pilih jenis">${icon('chevDown', 16, 2.2)}</button>
      ${menuOpen ? `<div class="menu glass-strong"><button type="button" data-action="new" data-mode="event">${icon('calendar', 15)}Event / rapat</button><button type="button" data-action="new" data-mode="task">${icon('task', 15)}Task dengan tenggat</button></div>` : ''}
    </div>
    <article class="card glass mini">
      <div class="card-head"><h3>${fmtMonth(mm)}</h3><span class="flex"></span>
        <button type="button" class="icon-btn sm" data-mini="-1" aria-label="Bulan sebelumnya">${icon('chevL', 14, 2)}</button>
        <button type="button" class="icon-btn sm" data-mini="1" aria-label="Bulan berikutnya">${icon('chevR', 14, 2)}</button></div>
      <div class="mini-grid">${DAYS_MINI.map((x, i) => `<span class="h${i === 6 ? ' sun' : ''}">${x}</span>`).join('')}
        ${days.map((x) => `<button type="button" class="${x.getMonth() !== mm.getMonth() ? 'out ' : ''}${sameDay(x, d) ? 'sel ' : ''}${sameDay(x, t) ? 'is-now ' : ''}${x.getDay() === 0 ? 'sun' : ''}" data-day="${ymd(x)}" aria-label="${fmtLong(x)}">${x.getDate()}${has.has(ymd(x)) && x.getMonth() === mm.getMonth() ? '<i></i>' : ''}</button>`).join('')}
      </div>
    </article>
    <article class="card glass mycal">
      <div class="card-head"><h3>Kalender saya</h3><span class="flex"></span><button type="button" class="link" data-action="todo" data-msg="Pengaturan kalender akan tersedia setelah sinkron Google/Outlook">Kelola</button></div>
      ${Object.entries(CAL_TYPES).map(([k, c]) => `<label class="cb" style="--c:${c.color}"><input type="checkbox" data-filter="${k}" ${state.calFilters[k] !== false ? 'checked' : ''}><i>${icon('check', 12, 3)}</i><span>${c.label}</span><small>${cnt(k)}</small></label>`).join('')}
    </article>
  </section>`;
}

/* ---------------- toolbar ---------------- */
function toolbar() {
  const { calView: v, calDate: d } = state.ui;
  const [a, b] = rangeOf(v, d);
  const [ra, rb] = v === 'bulan' ? [new Date(d.getFullYear(), d.getMonth(), 1), new Date(d.getFullYear(), d.getMonth() + 1, 0)] : [a, b];
  const items = itemsForRange(ra, rb);
  const nAg = items.filter((e) => e.type === 'rapat' || e.type === 'event').length;
  const nTk = items.filter((e) => e.type === 'task').length;
  let title;
  if (v === 'bulan') title = `${MONTHS[d.getMonth()]} <span class="accent">${d.getFullYear()}</span>`;
  else if (v === 'minggu') title = `${a.getDate()}${a.getMonth() !== b.getMonth() ? ' ' + MONTHS_SHORT[a.getMonth()] : ''} – ${b.getDate()} ${MONTHS[b.getMonth()]} <span class="accent">${b.getFullYear()}</span>`;
  else title = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} <span class="accent">${d.getFullYear()}</span>`;
  return `<div class="cal-toolbar cal-bar">
    <button type="button" class="btn glass sm" data-action="today">Hari ini</button>
    <button type="button" class="icon-btn glass" data-nav="-1" aria-label="Sebelumnya">${icon('chevL', 16, 2)}</button>
    <button type="button" class="icon-btn glass" data-nav="1" aria-label="Berikutnya">${icon('chevR', 16, 2)}</button>
    <h2 class="cal-title">${title}</h2><span class="flex"></span>
    <span class="sum-pill glass"><b>${nAg} agenda</b> · ${nTk} task</span>
    <div class="seg glass" role="tablist">${['hari', 'minggu', 'bulan'].map((x) => `<button type="button" role="tab" class="${v === x ? 'on' : ''}" aria-selected="${v === x}" data-view="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
  </div>`;
}

/* ---------------- month ---------------- */
function chip(e) {
  const c = typeColor(e.type);
  if (e.type === 'task') return `<button type="button" class="mchip tint" style="--c:${c}" data-item="${e.id}" data-date="${e.date}">${esc(e.title)}</button>`;
  if (e.allDay || e.type === 'cuti' || e.type === 'ultah') return `<button type="button" class="mchip tint" style="--c:${c}" data-item="${e.id}" data-date="${e.date}">${esc(e.title.replace('Ulang tahun ', 'Ultah '))}</button>`;
  return `<button type="button" class="mchip timed" style="--c:${c}" data-item="${e.id}" data-date="${e.date}"><i></i>${e.start} ${esc(e.title)}</button>`;
}
function month() {
  const d = state.ui.calDate;
  const days = monthMatrix(d.getFullYear(), d.getMonth());
  const items = itemsForRange(days[0], days[41]).filter((e) => e.type !== 'catatan');
  const by = {};
  items.forEach((e) => (by[e.date] ||= []).push(e));
  const t = today();
  return `<div class="month glass">
    <div class="m-head">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((x, i) => `<span class="${i === 6 ? 'sun' : ''}">${x}</span>`).join('')}</div>
    <div class="m-grid">${days.map((x) => {
      const k = ymd(x);
      const list = (by[k] || []).sort((a, b) => (a.type === 'task' ? -1 : 0) - (b.type === 'task' ? -1 : 0) || (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || toMin(a.start || '0') - toMin(b.start || '0'));
      const out = x.getMonth() !== d.getMonth();
      const label = x.getDate() === 1 ? `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]}` : x.getDate();
      return `<div class="m-cell${out ? ' out' : ''}${sameDay(x, t) ? ' today' : ''}${x.getDay() === 0 ? ' sun' : ''}" data-day="${k}" role="button" tabindex="0" aria-label="${fmtLong(x)}, ${list.length} item">
        <div class="m-date"><span>${label}</span>${list.length > 2 ? `<small>+${list.length - 2} lainnya</small>` : ''}</div>
        ${list.slice(0, 2).map(chip).join('')}
      </div>`;
    }).join('')}</div>
  </div>`;
}

/* ---------------- timeline (day & week) ---------------- */
function lanes(evs) {
  const sorted = [...evs].sort((a, b) => toMin(a.start) - toMin(b.start));
  const ends = [];
  sorted.forEach((e) => {
    let lane = ends.findIndex((end) => end <= toMin(e.start));
    if (lane === -1) { lane = ends.length; ends.push(0); }
    ends[lane] = toMin(e.end || fromMin(toMin(e.start) + 30));
    e._lane = lane;
  });
  sorted.forEach((e) => { e._lanes = ends.length; });
  return sorted;
}

function timeline(dates, { compact = false } = {}) {
  const n = now();
  const nm = n.getHours() * 60 + n.getMinutes();
  const sel = state.ui.selectedEvent;
  const hours = Array.from({ length: H1 - H0 + 1 }, (_, i) => H0 + i);
  const cols = dates.map((d) => {
    const all = itemsOn(d).filter((e) => e.type !== 'catatan');
    const timed = lanes(all.filter((e) => !e.allDay && e.start).map((e) => ({ ...e, end: e.end || fromMin(toMin(e.start) + 30) })));
    const blocks = timed.map((e) => {
      const top = ((toMin(e.start) - H0 * 60) / 60) * PX;
      const h = Math.max(22, ((toMin(e.end) - toMin(e.start)) / 60) * PX - 4);
      const w = 100 / e._lanes;
      const c = typeColor(e.type);
      const isTask = e.type === 'task';
      const short = h < 34;
      return `<button type="button" class="blk ${isTask ? 'blk-task' : ''}${e.id === sel ? ' sel' : ''}${short ? ' short' : ''}" style="--c:${c};top:${top}px;height:${h}px;left:calc(${e._lane * w}% + 6px);width:calc(${w}% - 10px)" data-item="${e.id}" data-date="${e.date}">
        ${isTask ? `${icon('task', 13, 2)}<b>${esc(e.title)}${compact ? '' : ` · tenggat ${e.start}`}</b>${!compact && e.priority ? `<span class="pill pill-${e.priority === 'tinggi' ? 'red' : e.priority === 'sedang' ? 'amber' : 'gray'} xs">${PRIORITY[e.priority].label}</span>` : ''}`
          : short ? `<b>${esc(e.title)}${compact ? '' : ` · ${e.start} – ${e.end}`}</b>` : `<b>${esc(e.title)}</b><small>${e.start} – ${e.end}${e.loc && !compact ? ` · ${esc(e.loc)}` : ''}</small>`}
      </button>`;
    }).join('');
    const isT = sameDay(d, today());
    const nowLine = isT && nm >= H0 * 60 && nm <= H1 * 60 ? `<div class="now" style="top:${((nm - H0 * 60) / 60) * PX}px">${dates.length === 1 ? `<span>${fmtTime(n)}</span>` : ''}</div>` : '';
    // free-slot suggestion (day view only)
    let ghost = '';
    if (dates.length === 1) {
      const busy = timed.map((e) => [toMin(e.start), toMin(e.end)]);
      const startFrom = isT ? Math.max(12 * 60, Math.ceil(nm / 60) * 60) : 13 * 60;
      for (let s = startFrom; s <= 19 * 60; s += 60) {
        if (!busy.some(([a, b]) => s < b && s + 60 > a)) { ghost = `<button type="button" class="ghost-slot" style="top:${((s - H0 * 60) / 60) * PX + 4}px;height:${PX - 8}px" data-slot="${fromMin(s)}">${icon('plus', 14, 2.2)}Klik untuk menambah agenda · ${fromMin(s)} – ${fromMin(s + 60)}</button>`; break; }
      }
    }
    return `<div class="tl-col${isT ? ' is-today' : ''}" data-col="${ymd(d)}">${hours.map(() => '<i class="hl"></i>').join('')}${ghost}${blocks}${nowLine}</div>`;
  }).join('');
  return `<div class="tl" style="--px:${PX}px">
    <div class="tl-hours">${hours.map((h) => `<span>${String(h).padStart(2, '0')}.00</span>`).join('')}</div>
    <div class="tl-cols" style="--n:${dates.length}">${cols}</div>
  </div>`;
}

function dayView() {
  const d = state.ui.calDate;
  const items = itemsOn(d);
  const allDay = items.filter((e) => e.allDay && e.type !== 'catatan');
  const ag = items.filter((e) => e.type === 'rapat' || e.type === 'event').length;
  const tk = items.filter((e) => e.type === 'task').length;
  return `<div class="day glass">
    <div class="day-head"><small class="tz">GMT+7</small><div class="dbadge"><small>${DAYS_SHORT[d.getDay()]}</small><b>${d.getDate()}</b></div>
      <div><h3>${fmtLong(d)}</h3><small class="muted">${sameDay(d, today()) ? 'Hari ini · ' : ''}${ag} agenda · ${tk} task tenggat</small></div></div>
    ${allDay.length ? `<div class="allday"><small>${allDay.every((e) => e.type === 'task') ? 'Tenggat' : 'Sepanjang hari'}</small><div>${allDay.map((e) => `<button type="button" class="mchip tint" style="--c:${typeColor(e.type)}" data-item="${e.id}" data-date="${e.date}">${esc(e.title)}${e.type === 'task' && e.start ? ` · ${e.start}` : ''}</button>`).join('')}</div></div>` : ''}
    <div class="tl-scroll scroll">${timeline([d])}</div>
  </div>`;
}

function weekView() {
  const s = weekStart(state.ui.calDate);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(s, i));
  const t = today();
  return `<div class="week glass">
    <div class="wk-head"><span></span>${dates.map((x) => {
      const allDay = itemsOn(x).filter((e) => e.allDay && e.type !== 'catatan');
      return `<button type="button" class="wk-day${sameDay(x, t) ? ' today' : ''}${x.getDay() === 0 ? ' sun' : ''}" data-day="${ymd(x)}"><small>${DAYS_SHORT[x.getDay()]}</small><b>${x.getDate()}</b>${allDay.slice(0, 1).map((e) => `<em style="--c:${typeColor(e.type)}">${esc(e.title)}</em>`).join('')}${allDay.length > 1 ? `<small class="more">+${allDay.length - 1}</small>` : ''}</button>`;
    }).join('')}</div>
    <div class="tl-scroll scroll">${timeline(dates, { compact: true })}</div>
  </div>`;
}

/* ---------------- right panel (day view) ---------------- */
function detail() {
  const d = state.ui.calDate;
  const items = itemsOn(d);
  let ev = findEvent(state.ui.selectedEvent);
  if (!ev || ev.date !== ymd(d) || ev.type === 'ultah' || ev.type === 'catatan') ev = items.find((e) => (e.type === 'rapat' || e.type === 'event') && !e.allDay) || null;
  const tasks = sortByDue(activeTasks().filter((t) => t.due === ymd(d)));
  let card;
  if (!ev) {
    card = `<article class="card glass ev-card empty-card"><p class="muted">Belum ada agenda di tanggal ini.</p><button type="button" class="btn primary" data-action="new" data-mode="event">${icon('plus', 16, 2.4)}Buat agenda</button></article>`;
  } else {
    const n = now();
    const nm = n.getHours() * 60 + n.getMinutes();
    const isT = ev.date === ymd(today());
    const status = ev.allDay ? ['Sepanjang hari', 'gray'] : isT && nm >= toMin(ev.start) && nm < toMin(ev.end) ? ['Berlangsung', 'green'] : (ev.date < ymd(today()) || (isT && nm >= toMin(ev.end))) ? ['Selesai', 'gray'] : ['Akan datang', 'blue'];
    const isRapat = ev.type === 'rapat';
    card = `<article class="card glass ev-card">
      <div class="ev-top"><span class="ev-ic" style="--c:${typeColor(ev.type)}">${icon(isRapat ? 'users' : 'calendar', 18)}</span><div><b>${isRapat ? 'Rapat' : CAL_TYPES[ev.type].label}</b><small class="muted">${esc(ev.loc || 'Tanpa lokasi')}</small></div><span class="flex"></span>
        <button type="button" class="icon-btn sm" data-action="todo" data-msg="Edit agenda akan tersedia setelah sinkron kalender" aria-label="Edit">${icon('edit', 14, 2)}</button>
        <button type="button" class="icon-btn sm" data-action="todo" data-msg="Opsi lain: duplikat, hapus, salin tautan" aria-label="Opsi lain">${icon('more', 16, 2.4)}</button></div>
      <div class="ev-meta"><small class="eyebrow">${isRapat ? 'Meeting' : 'Agenda'}${ev.code ? ` · ${ev.code}` : ''}</small><span class="pill pill-${status[1]}"><i class="d"></i>${status[0]}</span></div>
      <h3 class="ev-title">${esc(ev.title)}</h3>
      <ul class="ev-rows">
        <li>${icon('clock', 15)}${ev.allDay ? fmtLong(parseYmd(ev.date)) : `${ev.start} – ${ev.end} WIB · ${dur(ev.start, ev.end)}`}</li>
        ${ev.repeat ? `<li>${icon('repeat', 15)}${esc(ev.repeat)}</li>` : ''}
        ${ev.link ? `<li>${icon('video', 15)}<a href="https://${esc(ev.link.replace(/^https?:\/\//, ''))}" target="_blank" rel="noopener">${esc(ev.link)}</a></li>` : ''}
        ${ev.people ? `<li>${icon('users', 15)}${ev.people.length + (ev.extra || 0)} peserta${ev.attend ? ` · ${esc(ev.attend)}` : ''}</li>` : ''}
      </ul>
      ${ev.people ? `<div class="ev-people">${avatars(ev.people, 28)}${ev.extra ? `<span class="av more">+${ev.extra}</span>` : ''}</div>` : ''}
      ${ev.desc ? `<p class="ev-desc">${esc(ev.desc)}</p>` : ''}
      <div class="ev-actions"><button type="button" class="btn ghost" data-action="todo" data-msg="Edit agenda akan tersedia setelah sinkron kalender">${icon('edit', 14, 2)}Edit</button>
        ${ev.link ? `<a class="btn primary" href="https://${esc(ev.link.replace(/^https?:\/\//, ''))}" target="_blank" rel="noopener">${icon('video', 15, 2)}Gabung rapat</a>` : `<button type="button" class="btn primary" data-action="todo" data-msg="Petunjuk arah ke ${esc(ev.loc || 'lokasi')}">${icon('pin', 15, 2)}Lihat lokasi</button>`}</div>
    </article>`;
  }
  return `<section class="col col-right">${card}
    <article class="card glass day-tasks"><div class="card-head"><h3>Task ${sameDay(d, today()) ? 'hari ini' : 'di tanggal ini'}</h3><span class="flex"></span><a class="link" href="#/task">Semua ${icon('arrowR', 13, 2)}</a></div>
      <ul>${tasks.map((t) => `<li class="task-row${t.mine ? ' fresh' : ''}"><button type="button" class="check" data-done="${t.id}" aria-label="Tandai selesai: ${esc(t.title)}"></button><div class="tr-main"><p class="tr-title">${esc(t.title)}</p><div class="tr-sub">${duePill(t.due, t.time)}<span class="muted">${esc(t.app)} · ${t.mine ? `Prioritas ${PRIORITY[t.priority].label.toLowerCase()}` : esc(t.kind)}</span></div></div></li>`).join('') || '<li class="empty">Tidak ada task dengan tenggat di tanggal ini.</li>'}</ul>
    </article>
  </section>`;
}

function render() {
  const v = state.ui.calView;
  return `<div class="page page-kalender view-${v}">
    ${left()}
    ${toolbar()}
    <section class="col col-center cal-col">${v === 'bulan' ? month() : v === 'minggu' ? weekView() : dayView()}</section>
    ${v === 'hari' ? detail() : ''}
  </div>`;
}

function bind(root, rerender) {
  const go = (fn) => update(fn, { persist: false });
  root.onclick = (e) => {
    const b = e.target.closest('[data-action],[data-view],[data-nav],[data-day],[data-mini],[data-item],[data-slot],[data-done]');
    if (!b) { if (menuOpen) { menuOpen = false; rerender(); } return; }
    if (b.dataset.item) {
      e.stopPropagation();
      const id = b.dataset.item;
      if (id.startsWith('task-')) { location.hash = '#/task'; return; }
      return go((s) => { s.ui.calView = 'hari'; s.ui.calDate = parseYmd(b.dataset.date); s.ui.selectedEvent = id; });
    }
    const a = b.dataset.action;
    if (a === 'menu') { menuOpen = !menuOpen; return rerender(); }
    if (a === 'new') { menuOpen = false; rerender(); return openAgendaModal({ mode: b.dataset.mode, date: state.ui.calDate, onSaved: (it) => go((s) => { s.ui.calView = 'hari'; s.ui.calDate = parseYmd(it.due || it.date); }) }); }
    if (a === 'today') { miniMonth = null; return go((s) => { s.ui.calDate = today(); }); }
    if (a === 'todo') return toast(b.dataset.msg);
    if (b.dataset.view) return go((s) => { s.ui.calView = b.dataset.view; });
    if (b.dataset.nav) {
      const n = Number(b.dataset.nav);
      miniMonth = null;
      return go((s) => { const v = s.ui.calView; s.ui.calDate = v === 'bulan' ? addMonths(s.ui.calDate, n) : addDays(s.ui.calDate, v === 'minggu' ? 7 * n : n); });
    }
    if (b.dataset.mini) { const base = miniMonth || new Date(state.ui.calDate.getFullYear(), state.ui.calDate.getMonth(), 1); miniMonth = addMonths(base, Number(b.dataset.mini)); return rerender(); }
    if (b.dataset.slot) return openAgendaModal({ mode: 'event', date: state.ui.calDate, start: b.dataset.slot, onSaved: (it) => go((s) => { s.ui.calDate = parseYmd(it.date); }) });
    if (b.dataset.done) {
      const id = b.dataset.done;
      update((s) => { s.doneIds.push(id); });
      return toast('Task ditandai selesai', { label: 'Urungkan', run: () => update((s) => { s.doneIds = s.doneIds.filter((x) => x !== id); }) });
    }
    if (b.dataset.day) { miniMonth = null; return go((s) => { s.ui.calDate = parseYmd(b.dataset.day); s.ui.calView = 'hari'; }); }
  };
  root.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.m-cell')) { e.preventDefault(); e.target.click(); } };
  root.onchange = (e) => {
    if (e.target.dataset.filter) update((s) => { s.calFilters[e.target.dataset.filter] = e.target.checked; });
  };
  // click on empty timeline space -> new agenda at that time
  root.querySelectorAll('.tl-col').forEach((col) => {
    col.addEventListener('dblclick', (e) => {
      if (e.target.closest('.blk,.ghost-slot')) return;
      const y = e.offsetY;
      const m = Math.round(((y / PX) * 60 + H0 * 60) / 30) * 30;
      openAgendaModal({ mode: 'event', date: parseYmd(col.dataset.col), start: fromMin(Math.min(Math.max(m, 7 * 60), 20 * 60)) });
    });
  });
  // scroll timeline near "now" / first event
  const sc = root.querySelector('.tl-scroll');
  if (sc) {
    const n = now();
    const target = sameDay(state.ui.calDate, today()) || state.ui.calView === 'minggu' ? Math.max(H0, Math.min(n.getHours() - 2, H1 - 8)) : 7;
    sc.scrollTop = (target - H0) * PX;
  }
}

return {render,bind};
},
'js/pages/task.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, fmtLong, ymd, weekStart, addDays, DAYS_MINI, sameDay } = require("js/utils.js");
const { PRIORITY, ACTIVITY, USER } = require("js/data.js");
const { state, update, activeTasks, sortByDue, history, counts } = require("js/store.js");
const { duePill, prioTag, avatars, avatar, toast, openAgendaModal } = require("js/ui.js");
const { LEADER_ROLES } = require("js/team.js");
const teamModel = require("js/teamModel.js");

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

function render() {
  return `<div class="page page-task">${left()}${center()}${right()}</div>`;
}

function bind(root, rerender) {
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

return {render,bind};
},
'js/pages/team.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, today, ymd, addDays, parseYmd, fmtLong, $$ } = require("js/utils.js");
const { USER, PRIORITY } = require("js/data.js");
const { update, activeTasks } = require("js/store.js");
const { avatar, toast } = require("js/ui.js");
const { assistantOpenLetter } = require("js/pages/inoffice.js");
const { TEAM_UNIT, MEMBERS, STUCK_DAYS, teamTasks, assignTask, isReminded, remind, absences, decide, undoDecision } = require("js/team.js");
const { ATT, AWAY, fullName, shortName, dayLabel, rangeLabel, inSentence, attendanceOf, approvals, taskStats, scoreStats, awayList, attention } = require("js/teamModel.js");

// Dashboard detail ada di aplikasi My Team (myteam.html), terpisah dari MySAU
const MYTEAM_URL = 'myteam.html';
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

const badge = () => approvals().length;

function render() {
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
function openAssign(rerender, preset) {
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

function bind(root, rerender) {
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

return {MYTEAM_URL,badge,render,openAssign,bind};
},
'js/store.js': function(require) {
const { buildSeed, nationalDays, CAL_TYPES } = require("js/data.js");
const { today, ymd, parseYmd, toMin } = require("js/utils.js");

const KEY = 'mysau.v3';
const listeners = new Set();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save() {
  try {
    const { attendance, doneIds, userEvents, userTasks, calFilters } = state;
    localStorage.setItem(KEY, JSON.stringify({ attendance, doneIds, userEvents, userTasks, calFilters }));
  } catch { /* storage unavailable: keep in memory */ }
}

const persisted = load();
const seed = buildSeed(today());

const state = {
  seed,
  attendance: persisted.attendance && persisted.attendance.date === ymd(today()) ? persisted.attendance : { date: ymd(today()), in: null, out: null },
  doneIds: persisted.doneIds || [],
  userEvents: persisted.userEvents || [],
  userTasks: persisted.userTasks || [],
  calFilters: persisted.calFilters || Object.fromEntries(Object.keys(CAL_TYPES).map((k) => [k, k !== 'ultah'])),
  ui: { calView: 'bulan', calDate: today(), selectedEvent: 'e2', taskTab: 'tugas', taskFilter: 'semua', berandaTab: 'semua' },
};

function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function update(mutator, { persist = true } = {}) {
  mutator(state);
  if (persist) save();
  listeners.forEach((fn) => fn(state));
}

/* ---------- selectors ---------- */
const allTasks = () => [...state.userTasks, ...state.seed.tasks];
const activeTasks = () => allTasks().filter((t) => !state.doneIds.includes(t.id));
const isDone = (id) => state.doneIds.includes(id);

function sortByDue(list) {
  return [...list].sort((a, b) => (a.due === b.due ? toMin(a.time || '23.59') - toMin(b.time || '23.59') : a.due < b.due ? -1 : 1));
}

function history() {
  const doneNow = allTasks().filter((t) => state.doneIds.includes(t.id)).map((t) => ({ id: t.id, title: t.title, app: t.app, doneAt: ymd(today()), time: '' }));
  return [...doneNow, ...state.seed.history];
}

/** All calendar items for a given month (events + national days + task deadlines) */
function itemsForRange(from, to, { all = false } = {}) {
  const f = ymd(from), t = ymd(to);
  const months = new Set();
  for (let d = new Date(from); d <= to; d.setMonth(d.getMonth() + 1, 1)) months.add(`${d.getFullYear()}-${d.getMonth()}`);
  months.add(`${to.getFullYear()}-${to.getMonth()}`);
  const nat = [...months].flatMap((k) => { const [y, m] = k.split('-').map(Number); return nationalDays(y, m); });
  const taskItems = activeTasks().map((x) => ({ id: `task-${x.id}`, taskId: x.id, type: 'task', date: x.due, start: x.time || '', title: x.title, app: x.app, priority: x.priority, allDay: !x.time }));
  return [...state.userEvents, ...state.seed.events, ...nat, ...taskItems]
    .filter((e) => e.date >= f && e.date <= t)
    .filter((e) => all || e.type === 'catatan' || state.calFilters[e.type] !== false);
}

function itemsOn(date, opts) {
  const k = ymd(date);
  return itemsForRange(date, date, opts).filter((e) => e.date === k).sort((a, b) => {
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return toMin(a.start || '00.00') - toMin(b.start || '00.00');
  });
}

function findEvent(id) {
  return [...state.userEvents, ...state.seed.events].find((e) => e.id === id);
}

function counts() {
  const t = today();
  const k = ymd(t);
  const act = activeTasks();
  const dueToday = act.filter((x) => x.due === k).length;
  const late = act.filter((x) => x.due < k).length;
  const doneToday = history().filter((h) => h.doneAt === k).length;
  const agendaToday = itemsOn(t, { all: true }).filter((e) => e.type === 'rapat' || e.type === 'event').length;
  return { active: act.length, dueToday, late, doneToday, agendaToday, apps: new Set(act.map((x) => x.app)).size };
}

const dateKey = ymd;
const fromKey = parseYmd;

return {state,subscribe,update,allTasks,activeTasks,isDone,sortByDue,history,itemsForRange,itemsOn,findEvent,counts,dateKey,fromKey};
},
'js/team.js': function(require) {
// Data contoh tab Tim Saya. Ganti dengan respons API HRIS (struktur organisasi, absensi, cuti),
// Pervoms (KPI) dan task tim saat integrasi.
const { addDays, ymd, today, uid } = require("js/utils.js");

const TEAM_UNIT = 'Divisi Teknologi Informasi';
// Peran yang boleh melihat tab Tim Saya
const LEADER_ROLES = ['Dept. Head', 'Group Head', 'Direktur'];
const SHIFT_TOLERANCE = '08.05';

// Bobot skor; ditampilkan di dashboard supaya rumusnya terbuka
const SCORE_WEIGHTS = { kpi: 0.5, ontime: 0.3, hadir: 0.2 };
const SCORE_LABELS = { kpi: 'KPI Pervoms', ontime: 'Ketepatan waktu task', hadir: 'Kehadiran' };

// in: jam masuk hari ini (null = belum absen). lateWeek: jumlah terlambat dalam 5 hari kerja terakhir.
// score: komponen bulan lalu (0–100). prev: skor total bulan sebelumnya.
const MEMBERS = [
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
const SCORE_HISTORY = [76, 77, 79, 78];

// Ketidakhadiran dalam hari relatif dari hari ini. approvalTask: task approval yang harus disetujui dulu.
const ABSENCES = [
  { code: 'LM', type: 'cuti', from: 0, to: 1, note: 'Cuti tahunan' },
  { code: 'DP', type: 'dinas', from: 0, to: 2, note: 'Dinas luar ke Balikpapan' },
  { code: 'AR', type: 'cuti', from: 3, to: 5, note: 'Cuti tahunan', approvalTask: 't6' },
  { code: 'YW', type: 'izin', from: 4, to: 4, note: 'Izin keperluan keluarga' },
  { code: 'FH', type: 'cuti', from: 4, to: 4, note: 'Cuti tahunan' },
];

// Lama menunggu (hari) untuk item approval yang sudah ada di Task dan InOffice
const APPROVAL_WAIT = { t2: 1, t5: 2, t6: 0, t7: 3, t13: 4, s1: 1, s2: 2 };

const TEAM_STAGES = [
  { id: 'backlog', label: 'Backlog', color: '#9AA8BC' },
  { id: 'ready', label: 'Siap', color: '#2F6FD0' },
  { id: 'doing', label: 'Dikerjakan', color: '#E39A2D' },
  { id: 'review', label: 'Review', color: '#8C7BE0' },
  { id: 'done', label: 'Selesai', color: '#3DAFA3' },
];
const STUCK_DAYS = 5;

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
const APPROVAL_INFO = {
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

function teamTasks() {
  const t = today();
  const seed = SEED_TASKS.map(([owner, title, app, due, stage, stageDays, priority], i) => ({
    id: `tt${i + 1}`, owner, title, app, due: ymd(addDays(t, due)), stage, stageDays, priority,
  }));
  return [...local.assigned, ...seed].map((t) => (local.edits[t.id] ? { ...t, ...local.edits[t.id] } : t));
}

/** Ubah task tim (alihkan penerima, tenggat, atau tahap). Disimpan lokal. */
function editTask(id, patch) {
  local.edits[id] = { ...(local.edits[id] || {}), ...patch };
  save();
}

/* keputusan approval: { id, title, decision: 'setuju' | 'tolak', note, at } */
const decisions = () => local.decisions;
const decisionOf = (id) => local.decisions.find((d) => d.id === id);
function decide(entry) {
  local.decisions = [{ ...entry, at: ymd(today()) }, ...local.decisions.filter((d) => d.id !== entry.id)];
  save();
}
function undoDecision(id) {
  local.decisions = local.decisions.filter((d) => d.id !== id);
  save();
}

const noteOf = (code) => local.notes[code] || '';
function setNote(code, text) {
  local.notes[code] = text;
  save();
}

function assignTask({ owner, title, app, due, priority, note }) {
  const task = { id: uid('tt'), owner, title, app, due, stage: 'ready', stageDays: 0, priority, note, assignedByMe: true };
  local.assigned.unshift(task);
  save();
  return task;
}

const isReminded = (id) => local.reminded.ids.includes(id);
function remind(id) {
  if (!isReminded(id)) local.reminded.ids.push(id);
  save();
}

function absences() {
  const t = today();
  // cuti yang ditolak atasan tidak dihitung lagi sebagai ketidakhadiran
  return ABSENCES.filter((a) => !(a.approvalTask && local.decisions.some((d) => d.id === a.approvalTask && d.decision === 'tolak')))
    .map((a) => ({ ...a, fromDate: ymd(addDays(t, a.from)), toDate: ymd(addDays(t, a.to)) }));
}

/** Kehadiran 5 hari kerja terakhir (sampai hari ini) per anggota. Data contoh dibangkitkan tetap. */
function weekAttendance(m) {
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

function scoreOf(m) {
  return Math.round(Object.entries(SCORE_WEIGHTS).reduce((sum, [k, w]) => sum + m.score[k] * w, 0));
}

return {TEAM_UNIT,LEADER_ROLES,SHIFT_TOLERANCE,SCORE_WEIGHTS,SCORE_LABELS,MEMBERS,SCORE_HISTORY,APPROVAL_WAIT,TEAM_STAGES,STUCK_DAYS,APPROVAL_INFO,teamTasks,editTask,decisions,decisionOf,decide,undoDecision,noteOf,setNote,assignTask,isReminded,remind,absences,weekAttendance,scoreOf};
},
'js/teamModel.js': function(require) {
// Selektor bersama untuk tab Tim Saya (MySAU) dan aplikasi My Team
const { today, ymd, addDays, parseYmd, dayDiff, fmtShort, MONTHS, MONTHS_SHORT } = require("js/utils.js");
const { USER, PEOPLE } = require("js/data.js");
const { state, activeTasks } = require("js/store.js");
const { assistantLetters } = require("js/pages/inoffice.js");
const { MEMBERS, SHIFT_TOLERANCE, SCORE_WEIGHTS, SCORE_LABELS, SCORE_HISTORY, APPROVAL_WAIT, TEAM_STAGES, STUCK_DAYS, teamTasks, absences, scoreOf, decisionOf } = require("js/team.js");

const ATT = {
  hadir: { label: 'Tepat waktu', color: '#3DAFA3' },
  terlambat: { label: 'Terlambat', color: '#E39A2D' },
  dinas: { label: 'Dinas luar', color: '#2F6FD0' },
  cuti: { label: 'Cuti / izin', color: '#9C8BE8' },
  belum: { label: 'Belum absen', color: '#B4C0D0' },
};
const AWAY = { cuti: 'Cuti', izin: 'Izin', dinas: 'Dinas luar' };

const fullName = (code) => PEOPLE[code]?.name || code;
const shortName = (code) => { const n = fullName(code); return /\./.test(n) ? n : n.split(' ')[0]; };
const dayLabel = (key) => { const diff = dayDiff(parseYmd(key), today()); return diff === 0 ? 'Hari ini' : diff === 1 ? 'Besok' : fmtShort(parseYmd(key)); };
const rangeLabel = (a, b) => (a === b ? dayLabel(a) : `${dayLabel(a)} – ${dayLabel(b)}`);
// dayLabel di tengah kalimat: "hari ini" / "besok" huruf kecil, tanggal tetap
const inSentence = (txt) => txt.replace(/\b(Hari ini|Besok)\b/g, (w) => w.toLowerCase());
const avg = (xs) => xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);

/* ---------- selectors ---------- */
function attendanceOf(m) {
  const k = ymd(today());
  const away = absences().find((a) => a.code === m.code && a.fromDate <= k && a.toDate >= k);
  if (away) return away.type === 'dinas' ? 'dinas' : 'cuti';
  if (!m.in) return 'belum';
  return m.in > SHIFT_TOLERANCE ? 'terlambat' : 'hadir';
}

function approvals() {
  const fromTasks = activeTasks().filter((t) => t.kind === 'Approval' && !decisionOf(t.id)).map((t) => ({
    id: t.id, kind: 'task', title: t.title, app: t.app, who: (t.people || []).find((c) => c !== USER.initials) || null, wait: APPROVAL_WAIT[t.id] ?? 0,
  }));
  const fromLetters = assistantLetters().filter((s) => s.action && !decisionOf(s.id) && /pemeriksaan|tanda tangan/i.test(s.status)).map((s) => ({
    id: s.id, kind: 'letter', title: s.title, app: 'InOffice', who: null, wait: APPROVAL_WAIT[s.id] ?? 0, action: s.action,
  }));
  return [...fromTasks, ...fromLetters].sort((a, b) => b.wait - a.wait);
}

function taskStats() {
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

function scoreStats() {
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

function awayList() {
  const k0 = ymd(today()), k6 = ymd(addDays(today(), 6));
  const leaveTask = (id) => id && activeTasks().some((t) => t.id === id);
  const away = absences().filter((a) => a.toDate >= k0 && a.fromDate <= k6).map((a) => ({ ...a, pending: leaveTask(a.approvalTask) }));
  const names = new Map(MEMBERS.map((m) => [fullName(m.code), m.code]));
  const birthdays = state.seed.events.filter((e) => e.type === 'ultah' && e.date >= k0 && e.date <= k6 && names.has(e.person)).map((e) => ({ code: names.get(e.person), date: e.date }));
  return { away: away.sort((a, b) => (a.fromDate < b.fromDate ? -1 : 1)), birthdays };
}

function attention(stats) {
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


return {ATT,AWAY,fullName,shortName,dayLabel,rangeLabel,inSentence,avg,attendanceOf,approvals,taskStats,scoreStats,awayList,attention,absences};
},
'js/ui.js': function(require) {
const { icon } = require("js/icons.js");
const { esc, $, $$, uid, fmtLong, ymd, parseYmd, today, now, pad, toMin, fromMin, dueLabel } = require("js/utils.js");
const { PEOPLE, APPS, NOTIFICATIONS, CAL_TYPES, PRIORITY, USER } = require("js/data.js");
const { state, update, allTasks, itemsForRange } = require("js/store.js");

/* ---------- small builders ---------- */
const avatar = (code, size = 26) => {
  const p = PEOPLE[code] || { name: code, color: '#7D8CA3' };
  return `<span class="av" style="--av:${p.color};--s:${size}px" title="${esc(p.name)}">${esc(code)}</span>`;
};
const avatars = (codes = [], size = 26) => `<span class="avs">${codes.map((c) => avatar(c, size)).join('')}</span>`;

function duePill(dateStr, time) {
  const d = dueLabel(dateStr, time);
  return `<span class="pill pill-${d.tone}">${icon(d.late ? 'calendar' : 'clock', 12, 2.2)}${esc(d.text)}</span>`;
}
const prioTag = (p) => p ? `<span class="prio" style="--c:${PRIORITY[p].color}"><i></i>${PRIORITY[p].label}</span>` : '';

/* ---------- toast ---------- */
function toast(message, action) {
  const wrap = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `${icon('checkCircle', 17, 2)}<span>${esc(message)}</span>${action ? `<button type="button" class="toast-act">${esc(action.label)}</button>` : ''}<button type="button" class="toast-x" aria-label="Tutup">${icon('x', 14, 2.2)}</button>`;
  wrap.appendChild(el);
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 220); };
  el.querySelector('.toast-x').onclick = close;
  if (action) el.querySelector('.toast-act').onclick = () => { action.run(); close(); };
  setTimeout(close, 5200);
}

/* ---------- popovers ---------- */
let openPop = null;
function togglePop(pop, anchor) {
  if (openPop && openPop !== pop) closePop();
  const willOpen = pop.hidden;
  pop.hidden = !willOpen;
  anchor?.setAttribute('aria-expanded', String(willOpen));
  openPop = willOpen ? pop : null;
}
function closePop() {
  if (!openPop) return;
  openPop.hidden = true;
  openPop = null;
  $$('[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}
document.addEventListener('click', (e) => {
  if (openPop && !openPop.contains(e.target) && !e.target.closest('[aria-haspopup]') && !e.target.closest('#search')) closePop();
});

function renderNotifPop() {
  $('#notifPop').innerHTML = `<div class="pop-head"><b>Notifikasi</b><span>${NOTIFICATIONS.length} baru</span></div>
    ${NOTIFICATIONS.map((n) => `<div class="pop-item">${avatar(n.who, 30)}<div><p>${esc(n.text)}</p><small>${esc(n.meta)} · ${esc(n.ago)}</small></div></div>`).join('')}
    <a class="pop-foot" href="#/task">Buka semua di Task ${icon('arrowR', 13, 2)}</a>`;
}
function renderProfilePop() {
  $('#profilePop').innerHTML = `<div class="pop-profile">${avatar(USER.initials, 40)}<div><b>${esc(USER.name)}</b><small>${esc(USER.role)} · ${esc(USER.division)}</small><small>${esc(USER.office)}</small></div></div>
    <button type="button" class="pop-link" data-action="todo" data-msg="Halaman profil belum dihubungkan">${icon('user', 16)}Profil saya</button>
    <button type="button" class="pop-link" data-action="todo" data-msg="Pengaturan belum dihubungkan">${icon('settings', 16)}Pengaturan</button>
    <button type="button" class="pop-link" data-action="todo" data-msg="Keluar belum dihubungkan ke SSO">${icon('logout', 16)}Keluar</button>`;
}

/* ---------- global search ---------- */
function initSearch(go) {
  const input = $('#searchInput');
  const box = $('#searchResults');
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    const apps = APPS.filter((a) => (a.name + a.desc).toLowerCase().includes(q)).slice(0, 4);
    const tasks = allTasks().filter((t) => (t.title + t.app).toLowerCase().includes(q)).slice(0, 4);
    const t0 = today();
    const evs = itemsForRange(new Date(t0.getFullYear(), t0.getMonth() - 1, 1), new Date(t0.getFullYear(), t0.getMonth() + 2, 0), { all: true })
      .filter((e) => e.type !== 'task' && e.title.toLowerCase().includes(q)).slice(0, 4);
    const people = Object.entries(PEOPLE).filter(([, p]) => p.name.toLowerCase().includes(q)).slice(0, 3);
    const sec = (title, rows) => rows.length ? `<div class="sr-sec"><small>${title}</small>${rows.join('')}</div>` : '';
    box.innerHTML = sec('Aplikasi', apps.map((a) => `<button type="button" class="sr-row" data-go="app" data-id="${a.id}">${icon(a.icon, 16)}<span>${esc(a.name)}</span><em>${esc(a.desc)}</em></button>`))
      + sec('Task', tasks.map((t) => `<button type="button" class="sr-row" data-go="task" data-id="${t.id}">${icon('task', 16)}<span>${esc(t.title)}</span><em>${esc(t.app)}</em></button>`))
      + sec('Agenda', evs.map((e) => `<button type="button" class="sr-row" data-go="event" data-date="${e.date}" data-id="${e.id}">${icon('calendar', 16)}<span>${esc(e.title)}</span><em>${esc(fmtShortSafe(e.date))}</em></button>`))
      + sec('Rekan kerja', people.map(([code, p]) => `<div class="sr-row">${avatar(code, 22)}<span>${esc(p.name)}</span></div>`))
      || `<p class="sr-empty">Tidak ada hasil untuk “${esc(input.value)}”. Coba nama aplikasi, task, atau agenda.</p>`;
    box.hidden = false;
  };
  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.blur(); box.hidden = true; } });
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b) return;
    box.hidden = true; input.value = '';
    if (b.dataset.go === 'app') { const a = APPS.find((x) => x.id === b.dataset.id); openApp(a); }
    if (b.dataset.go === 'task') go('task');
    if (b.dataset.go === 'event') { update((s) => { s.ui.calView = 'hari'; s.ui.calDate = parseYmd(b.dataset.date); s.ui.selectedEvent = b.dataset.id; }, { persist: false }); go('kalender'); }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#search')) box.hidden = true; });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); }
  });
}
const fmtShortSafe = (s) => { const d = parseYmd(s); return `${d.getDate()}/${d.getMonth() + 1}`; };

function openApp(a) {
  if (!a) return;
  if (a.id === 'inoffice') { location.hash = '/inoffice'; return; }
  if (a.url && a.url !== '#') window.open(a.url, '_blank', 'noopener');
  else toast(`Tautan ${a.name} belum diatur — isi url di js/data.js`);
}

/* ---------- Buat agenda modal ---------- */
const TIME_OPTS = Array.from({ length: 30 }, (_, i) => fromMin(7 * 60 + i * 30));

function openAgendaModal({ mode = 'event', date = today(), start, onSaved } = {}) {
  const root = $('#modalRoot');
  const t = now();
  const nextSlot = start || fromMin(Math.min(17 * 60, Math.max(8 * 60, Math.ceil((t.getHours() * 60 + t.getMinutes()) / 30) * 30)));
  const st = { mode, date: ymd(date), start: nextSlot, end: fromMin(toMin(nextSlot) + 60), guests: [], type: 'rapat', app: 'Pervorms', priority: 'sedang', allDay: false };
  const lastFocus = document.activeElement;

  const timeSelect = (name, val) => `<select name="${name}" class="fld-time" aria-label="${name === 'end' ? 'Jam selesai' : 'Jam'}">${TIME_OPTS.map((x) => `<option ${x === val ? 'selected' : ''}>${x}</option>`).join('')}</select>`;
  const dateField = (label) => `<label class="fld-date"><span>${fmtLong(parseYmd(st.date))}</span><input type="date" name="date" value="${st.date}" aria-label="${label}"></label>`;

  const body = () => st.mode === 'event' ? `
      <div class="row">${icon('clock', 18)}<div class="row-main">
        <div class="inline">${dateField('Tanggal')}${st.allDay ? '' : `${timeSelect('start', st.start)}<span class="dash">–</span>${timeSelect('end', st.end)}`}</div>
        <div class="inline sub"><span>Tidak berulang · WIB (GMT+7)</span><label class="switch"><input type="checkbox" name="allDay" ${st.allDay ? 'checked' : ''}><i></i>Sepanjang hari</label></div>
      </div></div>
      <div class="row">${icon('users', 18)}<div class="row-main chips-in">${st.guests.map((g, i) => `<span class="chip">${avatar(g.code, 20)}${esc(g.name)}<button type="button" data-rm-guest="${i}" aria-label="Hapus ${esc(g.name)}">${icon('x', 12, 2.4)}</button></span>`).join('')}<input name="guest" placeholder="Tambah tamu (nama lalu Enter)" list="peopleList"></div></div>
      <datalist id="peopleList">${Object.values(PEOPLE).map((p) => `<option value="${esc(p.name)}">`).join('')}</datalist>
      <div class="row">${icon('video', 18)}<div class="row-main"><input name="link" placeholder="Tambahkan link Google Meet / Zoom" class="fld-plain link"></div></div>
      <div class="row">${icon('pin', 18)}<div class="row-main"><input name="loc" placeholder="Tambah lokasi" value="Ruang Rapat Lt. 5 · ${esc(USER.office)}" class="fld-plain"></div></div>
      <div class="row">${icon('bell', 18)}<div class="row-main"><select name="remind" class="fld-plain"><option>Ingatkan 15 menit sebelumnya</option><option>Ingatkan 30 menit sebelumnya</option><option>Ingatkan 1 jam sebelumnya</option><option>Tanpa pengingat</option></select></div></div>
      <div class="row">${icon('align', 18)}<div class="row-main"><textarea name="desc" rows="1" placeholder="Tambah deskripsi atau lampiran" class="fld-plain"></textarea></div></div>
      <div class="row">${icon('calendar', 18)}<div class="row-main chips">${['rapat', 'event', 'cuti'].map((k) => `<button type="button" class="opt ${st.type === k ? 'on' : ''}" data-type="${k}" style="--c:${CAL_TYPES[k].color}"><i></i>${k === 'rapat' ? 'Rapat' : k === 'event' ? 'Event kantor' : 'Cuti & hari besar'}${st.type === k ? icon('check', 13, 2.4) : ''}</button>`).join('')}</div></div>
      <p class="note">${esc(USER.name)} · Sibuk · Visibilitas default · Undangan dikirim lewat email & notifikasi MySAU</p>`
    : `
      <div class="row">${icon('clock', 18)}<div class="row-main">
        <div class="inline"><span class="lbl">Tenggat</span>${dateField('Tanggal tenggat')}${timeSelect('start', st.start)}</div>
        <div class="inline sub"><span>Tidak berulang · WIB (GMT+7)</span></div>
      </div></div>
      <div class="row">${icon('grid', 18)}<div class="row-main"><small class="cap">Aplikasi terkait</small><div class="chips">${['Pervorms', 'HRIS', 'Talent', 'Assessment', 'InOffice'].map((a) => `<button type="button" class="opt ${st.app === a ? 'on' : ''}" data-app="${a}" style="--c:#2F6FD0"><i></i>${a}${st.app === a ? icon('check', 13, 2.4) : ''}</button>`).join('')}</div></div></div>
      <div class="row">${icon('user', 18)}<div class="row-main chips-in"><span class="chip">${avatar('SY', 20)}Saya (${esc(USER.name)})</span><button type="button" class="link-btn" data-action="todo" data-msg="Delegasi akan tersedia setelah terhubung ke HRIS">+ Delegasikan</button></div></div>
      <div class="row">${icon('flag', 18)}<div class="row-main"><small class="cap">Prioritas</small><div class="chips">${Object.entries(PRIORITY).filter(([k]) => k).reverse().map(([k, p]) => `<button type="button" class="opt ${st.priority === k ? 'on' : ''}" data-prio="${k}" style="--c:${p.color}"><i></i>${p.label}${st.priority === k ? icon('check', 13, 2.4) : ''}</button>`).join('')}</div></div></div>
      <div class="row">${icon('bell', 18)}<div class="row-main"><select name="remind" class="fld-plain"><option>Ingatkan 1 jam sebelum tenggat</option><option>Ingatkan 1 hari sebelum tenggat</option><option>Tanpa pengingat</option></select></div></div>
      <div class="row">${icon('align', 18)}<div class="row-main"><textarea name="desc" rows="1" placeholder="Tambah deskripsi atau checklist" class="fld-plain"></textarea></div></div>
      <p class="note">Task otomatis tersinkron ke tab Task dan muncul di ringkasan “Task yang menunggu Anda”.</p>`;

  const render = () => {
    const title = root.querySelector('[name=title]')?.value || '';
    root.innerHTML = `<div class="scrim" data-close></div>
      <form class="modal glass-strong" role="dialog" aria-modal="true" aria-labelledby="mTitle" novalidate>
        <div class="md-head"><div class="md-title"><small id="mTitle">${st.mode === 'event' ? 'Agenda baru' : 'Task baru'}</small>
          <input name="title" class="m-title" placeholder="${st.mode === 'event' ? 'Judul agenda, mis. Rapat sinkronisasi vendor' : 'Judul task, mis. Kirim laporan KPI Q4'}" value="${esc(title)}" required autocomplete="off" aria-labelledby="mTitle"></div>
          <button type="button" class="icon-btn sm" data-close aria-label="Tutup">${icon('x', 16, 2)}</button></div>
        <div class="seg sm" role="tablist"><button type="button" role="tab" aria-selected="${st.mode === 'event'}" data-mode="event" class="${st.mode === 'event' ? 'on' : ''}">${icon('calendar', 14)}Event</button><button type="button" role="tab" aria-selected="${st.mode === 'task'}" data-mode="task" class="${st.mode === 'task' ? 'on' : ''}">${icon('task', 14)}Task</button></div>
        <div class="m-body">${body()}</div>
        <p class="m-error" hidden>Isi judul dulu sebelum menyimpan.</p>
        <div class="m-foot"><button type="button" class="link-btn" data-action="todo" data-msg="Opsi lanjutan akan tersedia di versi berikutnya">Opsi lainnya</button><span class="flex"></span>
          <button type="button" class="btn ghost" data-close>Batal</button>
          <button type="submit" class="btn primary">${icon('check', 15, 2.4)}${st.mode === 'event' ? 'Simpan' : 'Simpan task'}</button></div>
      </form>`;
    root.classList.add('open');
    root.querySelector('[name=title]').focus();
  };

  const field = (name) => root.querySelector(`[name="${name}"]`);
  const val = (name) => field(name)?.value ?? '';
  const readFields = () => {
    if (!root.querySelector('form')) return;
    st.date = val('date') || st.date;
    if (field('start')) st.start = val('start');
    if (field('end')) st.end = val('end');
  };

  const close = () => { root.classList.remove('open'); root.innerHTML = ''; document.removeEventListener('keydown', onKey); lastFocus?.focus?.(); };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { // focus trap
      const els = $$('button, input, select, textarea', root).filter((x) => !x.disabled);
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === els.at(-1)) { e.preventDefault(); els[0].focus(); }
    }
  };
  document.addEventListener('keydown', onKey);

  root.onclick = (e) => {
    if (e.target.matches?.('.fld-date input')) { try { e.target.showPicker(); } catch { /* browser lama: input tetap bisa diketik */ } return; }
    const el = e.target.closest('button, .scrim');
    if (!el) return;
    if (el.hasAttribute('data-close')) return close();
    readFields();
    if (el.dataset.mode) { st.mode = el.dataset.mode; render(); }
    if (el.dataset.type) { st.type = el.dataset.type; render(); }
    if (el.dataset.app) { st.app = el.dataset.app; render(); }
    if (el.dataset.prio) { st.priority = el.dataset.prio; render(); }
    if (el.dataset.rmGuest) { st.guests.splice(Number(el.dataset.rmGuest), 1); render(); }
    if (el.dataset.action === 'todo') toast(el.dataset.msg);
  };
  root.onchange = (e) => {
    if (e.target.name === 'date' && e.target.value) { st.date = e.target.value; e.target.previousElementSibling.textContent = fmtLong(parseYmd(st.date)); }
    if (e.target.name === 'allDay') { readFields(); st.allDay = e.target.checked; render(); }
    if (e.target.name === 'start' && st.mode === 'event') { st.start = e.target.value; if (toMin(st.end) <= toMin(st.start)) { st.end = fromMin(Math.min(toMin(st.start) + 60, 22 * 60)); render(); } }
  };
  root.onkeydown = (e) => {
    if (e.target.name === 'guest' && e.key === 'Enter') {
      e.preventDefault();
      const v = e.target.value.trim();
      if (!v) return;
      readFields();
      const code = Object.entries(PEOPLE).find(([, p]) => p.name.toLowerCase() === v.toLowerCase())?.[0] || v.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      st.guests.push({ code, name: v });
      render();
      root.querySelector('[name=guest]').focus();
    }
  };
  root.onsubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const titleEl = f.querySelector('[name=title]');
    const title = titleEl.value.trim();
    if (!title) { root.querySelector('.m-error').hidden = false; titleEl.focus(); return; }
    readFields();
    if (st.mode === 'event') {
      const ev = { id: uid('ev'), type: st.type, date: st.date, title, allDay: st.allDay, start: st.allDay ? '' : st.start, end: st.allDay ? '' : st.end, loc: val('loc'), link: val('link'), desc: val('desc'), people: ['SY', ...st.guests.map((g) => g.code)], remind: val('remind'), mine: true };
      update((s) => { s.userEvents.push(ev); s.ui.selectedEvent = ev.id; });
      close();
      toast(st.guests.length ? `Agenda disimpan · undangan terkirim ke ${st.guests.length} tamu` : 'Agenda disimpan', { label: 'Lihat di Kalender', run: () => { update((s) => { s.ui.calView = 'hari'; s.ui.calDate = parseYmd(ev.date); s.ui.selectedEvent = ev.id; }, { persist: false }); location.hash = '#/kalender'; } });
      onSaved?.(ev, true);
    } else {
      const tk = { id: uid('tk'), title, app: st.app, code: `${st.app.slice(0, 2).toUpperCase()}/${parseYmd(st.date).getFullYear()}/${pad(Math.floor(Math.random() * 900) + 100)}`, due: st.date, time: st.start, priority: st.priority, kind: 'Untuk saya', loc: 'Jakarta', sub: [0, 1], comments: 0, files: 0, people: ['SY'], desc: val('desc'), mine: true };
      update((s) => { s.userTasks.unshift(tk); });
      close();
      toast('Task disimpan · tersinkron ke tab Task', { label: 'Lihat di Task', run: () => { location.hash = '#/task'; } });
      onSaved?.(tk, true);
    }
  };
  render();
}



return {avatar,avatars,duePill,prioTag,toast,togglePop,closePop,renderNotifPop,renderProfilePop,initSearch,openApp,openAgendaModal,fmtLong,dueLabel};
},
'js/utils.js': function(require) {
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAYS_MINI = ['S', 'S', 'R', 'K', 'J', 'S', 'M']; // Monday-first
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const pad = (n) => String(n).padStart(2, '0');

/** Wall-clock time in Asia/Jakarta, returned as a local Date with the same fields. */
function now() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  } catch {
    return new Date();
  }
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const today = () => startOfDay(now());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const sameDay = (a, b) => ymd(a) === ymd(b);
const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000);

const fmtLong = (d) => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtDayMonth = (d) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
const fmtShort = (d) => `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
const fmtMonth = (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmtTime = (d) => `${pad(d.getHours())}.${pad(d.getMinutes())}`;

/** "09.30" | "09:30" -> minutes since midnight */
const toMin = (t) => { const [h, m] = String(t).split(/[.:]/).map(Number); return h * 60 + (m || 0); };
const fromMin = (m) => `${pad(Math.floor(m / 60))}.${pad(m % 60)}`;

/** Monday-first 6×7 matrix for a month */
function monthMatrix(y, m) {
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
const weekStart = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

/** Relative deadline label used across the app */
function dueLabel(dateStr, time) {
  const t = today();
  const d = parseYmd(dateStr);
  const diff = dayDiff(d, t);
  if (diff < 0) return { text: `Terlambat ${-diff} hari`, tone: 'red', late: true };
  if (diff === 0) return { text: time ? `Hari ini, ${time}` : 'Hari ini', tone: 'red' };
  if (diff === 1) return { text: time ? `Besok, ${time}` : 'Besok', tone: 'amber' };
  return { text: fmtShort(d) + (time ? `, ${time}` : ''), tone: 'gray' };
}

function greeting(h) {
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

return {DAYS,DAYS_SHORT,DAYS_MINI,MONTHS,MONTHS_SHORT,pad,now,startOfDay,today,addDays,addMonths,ymd,parseYmd,sameDay,dayDiff,fmtLong,fmtDayMonth,fmtShort,fmtMonth,fmtTime,toMin,fromMin,monthMatrix,weekStart,dueLabel,greeting,esc,uid,$,$$,initials};
}};
const cache={};function require(id){return cache[id]||(cache[id]=modules[id](require));}
require("js/main.js");
})();
