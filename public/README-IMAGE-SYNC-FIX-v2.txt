SAHABAT KACA ALUMINIUM — IMAGE SYNC FIX v2

PAKET PATCH TERBARU — 2026-10-07

Tujuan:
- Menghilangkan sumber gambar proyek yang tidak terverifikasi.
- Menjadikan Project Catalog + Image Registry sebagai sumber tunggal gambar.
- Menampilkan hanya foto proyek yang verified pada gallery/lightbox/SEO.
- Menyediakan placeholder untuk proyek tanpa foto terverifikasi.
- Mengalihkan halaman legacy /portofolio ke /galeri.

FILE DALAM ZIP:
1. galeri.html
   - Versi galeri yang sudah dipatch.
   - Tidak memakai GALLERY_IMAGE_MAP.
   - Tidak memakai fallback p.image ke gambar manual.
   - JSON-LD hanya 6 foto proyek terverifikasi.

2. projectCatalog.js
   - Master Project Catalog + Image Registry terbaru.
   - 6 foto verified.
   - 20 proyek NO_VALID_IMAGE tidak memiliki src/url gambar.

3. portofolio.html
   - Legacy fallback/redirect ke /galeri.
   - Tidak lagi menyimpan daftar 26 gambar lama.

PENTING:
- Jangan mengganti foto JPG yang sudah terverifikasi.
- Jangan menambahkan gambar ke 20 proyek NO_VALID_IMAGE hanya agar kartu terlihat penuh.
- Jangan menghidupkan kembali GALLERY_IMAGE_MAP.
- ZIP ini adalah PATCH, bukan salinan seluruh repository.
- Upload/replace file sesuai struktur repository yang sudah ada.
