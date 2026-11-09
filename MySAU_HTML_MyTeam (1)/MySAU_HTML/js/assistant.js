import { icon } from './icons.js';
import { esc, today, ymd, fmtLong } from './utils.js';
import { activeTasks, itemsForRange } from './store.js';
import { assistantLetters, assistantOpenLetter, assistantSaveDraft } from './pages/inoffice.js';

export function initAssistant() {
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
