# MySAU — Paket HTML

Paket ini mempertahankan tampilan dan perilaku frontend dari https://mysauv3.vercel.app/ yang ditinjau pada 7 November 2026. HTML, CSS, JavaScript dan aset visual disertakan sebagai file terpisah.

## Cara membuka
1. Ekstrak seluruh ZIP terlebih dahulu.
2. Buka `index.html` menggunakan Chrome, Edge, Firefox, atau Safari terbaru.
3. Gunakan navigasi Beranda, Task, dan Kalender. `task.html` dan `kalender.html` juga dapat dibuka langsung.

Tidak membutuhkan npm, instalasi dependency, atau build untuk membuka hasilnya. Font Plus Jakarta Sans menggunakan Google Fonts; tanpa internet browser memakai font cadangan. Gambar maskot dan aset visual lainnya tersedia lokal.

Untuk pengembangan dengan server lokal, jalankan `python3 -m http.server 8000` dari folder ini lalu buka http://localhost:8000. Di Windows bisa menggunakan `python -m http.server 8000`.

## Struktur
- `index.html`: halaman awal / beranda.
- `task.html`: pintu masuk langsung ke halaman Task.
- `kalender.html`: pintu masuk langsung ke halaman Kalender.
- `team.html`: pintu masuk langsung ke halaman Tim Saya.
- `myteam.html`: aplikasi My Team (dashboard detail tim), terpisah dari MySAU.
- `css/myteam.css`, `js/myteam/`, `js/teamModel.js`: tampilan, halaman, dan perhitungan bersama My Team.
- `js/myteam.bundle.js`: hasil build untuk `myteam.html`.
- `css/team.css`, `js/team.js`, `js/pages/team.js`: tampilan, data contoh, dan halaman Tim Saya.
- `css/style.css`: layout, komponen, dan aturan responsif.
- `css/motion.css`: animasi dan efek visual.
- `assets/`: maskot, ikon, latar, serta efek panggung.
- `js/pages/`: sumber komponen Beranda, Task, dan Kalender.
- `js/data.js`: profil, daftar aplikasi, dan data contoh.
- `js/store.js`: penyimpanan state lokal.
- `js/ui.js`: dialog, pencarian, dan notifikasi.
- `js/main.js`: navigasi serta inisialisasi aplikasi.
- `js/app.bundle.js`: hasil build yang dibaca HTML, sehingga dapat dijalankan tanpa ES-module server.
- `build.py`: membangun ulang kedua bundle (`app.bundle.js` dan `myteam.bundle.js`) menggunakan Python standar.

## Mengedit
Ubah CSS atau aset secara langsung. Untuk mengubah logika, edit sumber `js/` lalu jalankan `python3 build.py` (atau `python build.py` di Windows). Jangan hanya mengedit bundle karena akan tertimpa ketika build ulang.

## Fitur dan batasan
- Beranda: maskot asli, jam WIB, absensi contoh, ringkasan task, kalender, dan pintasan aplikasi.
- Task: tambah task, tandai selesai, riwayat, prioritas, serta ringkasan pekerjaan.
- Kalender: tampilan hari/minggu/bulan, filter jenis, detail, dan tambah agenda.
- Pencarian, popup profil, dan popup notifikasi mengikuti versi referensi.
- Data awal adalah data demonstrasi. Task/agenda yang ditambahkan, status selesai dan absensi disimpan di localStorage browser, bukan server.
- Absensi hanya simulasi; teks lokasi/radius bukan hasil verifikasi GPS. Tidak terhubung ke sistem absensi perusahaan.
- Pintasan aplikasi, kolaborasi, delegasi, notifikasi dan pengingat belum terhubung ke layanan nyata. Tidak mengirim pesan atau undangan.
- Penyimpanan pada file:// mengikuti kebijakan browser dan dapat berbeda antarfile. Gunakan server lokal agar seluruh pintu masuk HTML berbagi origin dan data yang sama.
- Membuka pada browser/perangkat lain tidak menyinkronkan data. Tidak ada backend, login produksi, maupun database dalam paket ini.

## Pemeriksaan
- Sintaks bundle JavaScript diperiksa.
- Tampilan beranda dibandingkan secara visual dengan situs referensi.
- Form tambah task diuji sampai task muncul di ringkasan dan daftar Task.
- Halaman Task dan Kalender berhasil dimuat dalam browser.
- Aturan responsif dari referensi disertakan; pengujian pada perangkat fisik belum dilakukan.

## Pembaruan InOffice
Tab keempat InOffice tersedia melalui navigasi, pintasan Beranda, pencarian aplikasi, atau `inoffice.html`.
- Search bar transparan berada di tengah, tanpa ilustrasi surat besar; ukuran font menggunakan gaya MySAU.
- Pencarian lokal mencakup perihal, nomor surat, pengirim, penerima, isi, jenis, dan nama lampiran. Chip menyediakan filter Surat Saya, Menunggu Approval, dan Lampiran.
- Hasil pencarian dapat dibuka sebagai preview. Riwayat akses diperbarui otomatis.
- Periksa, Tinjau, dan Tindak lanjuti membuka preview dengan catatan. Menyelesaikan tindakan hanya memperbarui data contoh di browser, bukan approval atau tanda tangan resmi.
- Surat Baru, Memo Internal, dan Dari Template membuka form; draft dapat disimpan dan dilanjutkan.
- Notifikasi contoh dapat dibaca, pengingat dan jumlah tindak lanjut mengikuti data lokal.
- Data InOffice disimpan terpisah pada localStorage `mysau.inoffice.v1`. Tidak termasuk sinkronisasi API, pengiriman surat, upload lampiran, atau tanda tangan elektronik.
- Tombol Buka aplikasi InOffice memerlukan URL tujuan pada entri InOffice di `js/data.js`.
- Pencarian, pembukaan preview, dan penyimpanan draft telah diuji melalui browser desktop. Pengujian perangkat fisik/mobile belum dilakukan.

## Task Kanban
Halaman Task sekarang menggunakan lima kolom: Backlog, Siap, Dikerjakan, Review, dan Selesai. Panel prioritas dan task mendesak di kiri serta Semua Task dan Aktivitas Kolaborasi di kanan tetap mengikuti layout sebelumnya. Kartu menampilkan judul, aplikasi sumber, dan tenggat bila dekat/terlambat. Filter aplikasi dan filter Untuk saya/Semua task tersedia di atas papan. Task dapat dipindahkan dengan drag-and-drop; status disimpan lokal pada browser. Menandai task sebagai selesai dari panel samping juga memperbarui kolom Selesai. Status papan dan penyelesaian tidak tersinkron ke aplikasi eksternal.

## Tanya MySAU — prototype chat
Tombol Tanya MySAU tersedia di seluruh tab, di pojok kanan bawah. Klik untuk membuka panel chat kecil; gunakan tombol X untuk menutup atau + untuk memulai percakapan baru. Percakapan tersimpan lokal dan tetap terlihat saat pindah tab.

Contoh yang bisa dicoba:
- Carikan surat tentang Assessment
- Buatkan draft balasan untuk surat ini (setelah pencarian surat)
- Apa task prioritas saya?
- Siapa yang ulang tahun bulan ini?
- Apa agenda saya hari ini?

Hasil surat dapat dibuka atau dibuatkan draft balasan. Draft dapat disimpan ke data contoh InOffice setelah menekan Simpan draft ke InOffice. Tidak ada surat yang dikirim otomatis.

Respons chat bersifat simulasi berbasis kata kunci dan template, bukan model AI/LLM atau integrasi sistem produksi. Pencarian membaca data contoh InOffice lokal; task dan ulang tahun dibaca dari state MySAU contoh. Tidak membutuhkan API key dan tidak mengirimkan isi chat ke layanan AI eksternal. Riwayat lokal menggunakan key `mysau.ai.chat`.

Pemeriksaan desktop: tombol chat, pencarian surat, pembuatan draft, penyimpanan draft, dan keberlanjutan panel saat pindah tab Home ke Task telah dicoba melalui browser. Tampilan mobile menggunakan panel responsif; belum diuji di perangkat fisik.

## Asisten digital — revisi tampilan
- Beranda: klik maskot atau ikon AI di sisi kiri lingkaran maskot untuk membuka asisten.
- Task, Kalender, dan InOffice: ikon lingkaran AI tersedia di kanan bawah.
- Panel tengah: contoh pertanyaan, pencarian surat, draft balasan, task, dan agenda.
- Tutup dengan tombol X, area luar panel, atau Escape. Percakapan tetap tersimpan saat pindah tab.
- Respons masih simulasi lokal; belum terhubung ke layanan AI atau data perusahaan.

## Revisi Saut
- Nama asisten menjadi Saut. Home menampilkan “Ada yang bisa Saut bantu?” di orbit kiri maskot.
- Tab lain menampilkan “Tanya Saut” di kanan bawah.
- Navigasi bawah menampilkan ikon; hover/fokus keyboard memperlihatkan nama tab.
- Card Semua task dipadatkan; daftar dan kolom Kanban dapat di-scroll secara independen.
- Mask SVG maskot ditanam dalam CSS agar tetap tampil saat HTML dibuka dari disk.

## Application drawer
Sidebar dihapus. Tombol Aplikasi berada di tengah navigasi bawah, tersedia pada semua tab. Drawer memuat 12 aplikasi contoh dalam empat kelompok, dengan pencarian dan filter kategori. Task, Kalender, dan InOffice membuka halaman prototype; aplikasi lain menampilkan simulasi akses.

## Mobile, scroll, dan animasi Saut
- Tampilan otomatis menyesuaikan layar HP; navigasi bawah dan Saut tetap mudah dijangkau.
- Kanban mobile dapat digeser ke samping, setiap kolom dapat di-scroll ke atas/bawah.
- Semua kartu ditampilkan tanpa batas lima kartu. Seret kartu di desktop untuk mengurutkan atau memindahkan kolom; tombol ↑ ↓ juga tersedia untuk mengurutkan di HP. Urutan disimpan di browser.
- Saut berdenyut membesar–mengecil pada Home, tab lain, dan popup; animasi berbeda ketika memproses. Menghormati pengaturan reduced motion perangkat.
- Popup Saut dan application drawer menyesuaikan ukuran layar mobile. Respons AI masih simulasi.

## Panel aplikasi favorit
Klik handle biru tipis di tepi kiri untuk membuka panel favorit (di HP juga bisa digeser ke kanan). Edit favorit untuk memilih maksimal enam aplikasi dan mengatur urutan dengan panah. Pilihan otomatis tersimpan di browser perangkat ini. Semua aplikasi membuka drawer dengan 17 aplikasi sesuai daftar MySAU, dalam lima kategori. In Office membuka tab InOffice; aplikasi lainnya masih simulasi akses. Navigasi utama tetap di bawah.

## Tim Saya — dashboard ringkasan untuk pemimpin
Tab kelima (ikon orang) di navigasi bawah, juga bisa dibuka langsung lewat `team.html`. Tab ini hanya muncul bila `USER.role` di `js/data.js` termasuk `LEADER_ROLES` di `js/team.js` (Dept. Head, Group Head, Direktur). Badge pada tab menunjukkan jumlah pengajuan yang menunggu persetujuan.

Isi dashboard, mengikuti urutan prioritas:
- Ringkasan di tengah atas: berapa anggota yang sudah masuk, berapa hal menunggu persetujuan, dan bar kehadiran hari ini (tepat waktu, terlambat, dinas luar, cuti/izin, belum absen).
- Perlu persetujuan Anda: gabungan task Approval dari tab Task dan surat InOffice yang menunggu pemeriksaan/tanda tangan, diurutkan dari yang paling lama menunggu. Setujui menandai task selesai (sama dengan tab Task, bisa diurungkan); Tinjau/Periksa membuka preview surat di InOffice.
- Perlu perhatian: maksimal 4 butir yang dibuat otomatis, misalnya anggota dengan task terlambat menumpuk, hari dengan banyak anggota tidak di kantor, terlambat masuk berulang, dan skor yang turun 5 poin atau lebih.
- Task tim: jumlah terlambat, macet (5+ hari di Dikerjakan), tenggat hari ini, task aktif, sebaran per kolom, dan 3 task paling mendesak dengan tombol Ingatkan. Tugaskan task membuka form dengan daftar penerima yang diurutkan dari beban paling ringan dan menandai anggota yang cuti/dinas.
- Skor tim: rata-rata skor bulan lalu, tren 6 bulan, dan rata-rata tiap komponen beserta bobotnya (KPI 50%, ketepatan waktu 30%, kehadiran 20%). Skor per orang sengaja tidak diranking di ringkasan.
- Tidak di kantor (7 hari ke depan) termasuk cuti yang masih menunggu persetujuan, serta ulang tahun anggota.
- Anggota tim: status kehadiran, jumlah task aktif, dan jumlah task terlambat per orang.

Batasan prototype:
- Semua data tim adalah contoh di `js/team.js` (anggota, absensi, cuti, task tim, skor). Saat integrasi, ganti dengan HRIS (struktur organisasi, absensi, cuti), Pervoms (KPI), dan sumber task tim.
- Task yang ditugaskan dan status Ingatkan disimpan di localStorage `mysau.team.v1`; tidak mengirim notifikasi ke anggota.
- Tombol panah di pojok kartu, klik anggota, dan butir Perlu perhatian membuka aplikasi My Team di halaman yang sesuai.
- Tampilan level Group Head dan Direktur (agregat per departemen/grup) belum dibuat; versi ini untuk Dept. Head.
- Diuji di browser desktop 1440×900 dan tampilan HP 390px lewat browser; belum diuji di perangkat fisik.

## Aplikasi My Team (dashboard detail)
`myteam.html` adalah aplikasi tersendiri untuk pemimpin. Gayanya sama dengan MySAU (warna, kaca, font), tetapi navigasinya di samping kiri, bukan tab bawah, supaya terasa sebagai aplikasi yang berbeda. Dibuka dari tab Tim Saya (tombol panah di kartu, klik anggota, atau tautan "Buka aplikasi My Team"). Tombol "MySAU" di kanan atas dan ikon keluar di bawah navigasi kembali ke tab Tim Saya.

Halaman (alamatnya bisa di-bookmark):
- `#/anggota` Anggota tim: tabel semua anggota dengan status hari ini, kehadiran 5 hari kerja, task aktif dan terlambat, skor dan perubahannya, ketidakhadiran berikutnya, dan penanda perlu perhatian. Bisa difilter (Semua, Perlu perhatian, Tidak di kantor) dan diurutkan.
- `#/anggota/KODE` Profil anggota, misalnya `#/anggota/DP`: task aktif dengan tombol Ingatkan, kehadiran 5 hari kerja, cuti dan dinas, catatan 1:1 pribadi (tersimpan otomatis), serta skor dengan rincian komponen dibanding rata-rata tim. Tombol Tugaskan task langsung memilih anggota ini; tombol panah berpindah ke anggota sebelumnya/berikutnya.
- `#/task` Task tim: papan lima kolom untuk seluruh tim, filter status (Terlambat, Macet, Dari saya), anggota, dan aplikasi, plus panel Beban kerja yang bisa diklik untuk memfilter. Klik kartu untuk mengingatkan, mengalihkan ke anggota lain, mengubah tenggat, atau memindahkan tahap. `#/task?owner=DP` membuka papan yang sudah difilter.
- `#/kehadiran` Kehadiran: jam masuk tiap anggota selama 5 hari kerja terakhir, ringkasan tepat waktu/terlambat/cuti/dinas, daftar yang akan tidak di kantor 14 hari ke depan, dan daftar terlambat berulang.
- `#/approval` Persetujuan: daftar per jenis (Cuti, Lembur, Reimburse, Review, Surat) dengan panel rincian. Pengajuan cuti menampilkan dampaknya ke tim (siapa lagi yang tidak di kantor di periode yang sama). Menolak wajib menyertakan catatan. Keputusan masuk ke daftar Sudah diproses dan bisa diurungkan. Surat diarahkan ke InOffice.
- `#/skor` Skor: rata-rata tim dan tren 6 bulan, cara skor dihitung, pergerakan naik/tetap/turun, dan tabel komponen per anggota dengan tren masing-masing.

Data dan batasan:
- My Team memakai data dan penyimpanan yang sama dengan tab Tim Saya. Keputusan approval, task yang dialihkan atau diubah, pengingat, dan catatan 1:1 disimpan di localStorage `mysau.team.v1`; approval juga menandai task terkait selesai di MySAU, jadi angka di kedua tempat selalu sama.
- Cuti yang ditolak tidak lagi dihitung sebagai ketidakhadiran.
- Tidak ada yang dikirim ke HRIS, Pervoms, InOffice, atau ke anggota tim. Jadwalkan 1:1 belum terhubung ke Kalender.
- Kehadiran 5 hari kerja dan riwayat skor adalah data contoh yang dibangkitkan tetap.
- Bila membuka lewat file:// beberapa browser memisahkan penyimpanan antar-file; gunakan server lokal agar MySAU dan My Team berbagi data.
- Untuk mengubah logika, edit sumber di `js/` lalu jalankan `python3 build.py`; kedua bundle dibangun sekaligus.
- Diuji di browser desktop 1440×900 dan tampilan HP 390px; belum diuji di perangkat fisik.

## Tombol "Task tim saya" di halaman Task
Untuk pemimpin, halaman Task menampilkan tombol menonjol "Task tim saya" di samping judul Papan task (di HP: di bawah judul halaman). Tombol menunjukkan jumlah task aktif dan terlambat milik tim, lalu membuka papan task tim di aplikasi My Team (`myteam.html#/task`). Saat halaman Task pertama dibuka, tombol diberi sorotan berupa dua denyut cincin; tidak diputar ulang ketika halaman diperbarui, dan dimatikan bila perangkat memakai pengaturan kurangi gerakan. Anggota tanpa peran pemimpin tidak melihat tombol ini.
