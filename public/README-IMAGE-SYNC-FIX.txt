SAHABAT KACA ALUMINIUM — IMAGE SYNC FIX

Patch berdasarkan master Image Registry terbaru.

Perubahan:
- 6 foto proyek terverifikasi dipertahankan.
- Tidak ada fallback antar-proyek / GALLERY_IMAGE_MAP.
- 20 proyek tanpa foto valid menampilkan placeholder "Foto proyek belum tersedia".
- Modal/lightbox hanya dapat membuka foto yang verified dan milik projectId yang sama.
- JSON-LD hanya mencantumkan 6 ImageObject dengan foto terverifikasi.
- OG/Twitter image menggunakan foto proyek terverifikasi.
- Desain/layout utama tidak dirombak.

File:
- galeri.html = halaman galeri yang sudah diperbaiki
- projectCatalog.js = master catalog dengan Image Registry NO_VALID_IMAGE = null

Catatan: projectCatalog.js adalah master data; pastikan loader/script.js pada deployment memang memuat master catalog ini sesuai struktur proyek Anda.
