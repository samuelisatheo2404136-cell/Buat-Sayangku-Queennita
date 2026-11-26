# untuk Queeninta 🌷

Web ucapan penyemangat. File statis aja (index.html, style.css, script.js), jadi bisa langsung di-host di GitHub Pages.

## Deploy ke GitHub Pages
1. Bikin repo baru di GitHub dengan nama **untuk-queeninta** (Public).
2. Upload `index.html`, `style.css`, `script.js` ke repo itu (Add file → Upload files → Commit).
3. Buka **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. Tunggu 1–2 menit, web-nya bisa dibuka di:
   https://allanglory-dev.github.io/untuk-queeninta/

QR love yang udah jadi ngarah ke link di atas, jadi nama repo harus persis `untuk-queeninta`.

## Ngubah isi
- Isi surat: edit di `index.html` (bagian `<!-- 4. SURAT -->`).
- Isi notif, kalimat terakhir, caption foto: edit `CONFIG` di paling atas `script.js`.
- Foto kucing: defaultnya diambil acak dari cataas.com. Kalau mau pakai foto sendiri, bikin folder `foto/`, taruh fotonya, terus isi `fotoKucing: ['foto/1.jpg','foto/2.jpg']` di `script.js`. Kalau foto gagal ke-load, otomatis diganti gambar kucing kartun.

## Ngetes bagian tertentu
Tambah `?s=` di link, misal `.../untuk-queeninta/?s=letter`
(pilihan: gift, meow, letter, heart, notif, final)
