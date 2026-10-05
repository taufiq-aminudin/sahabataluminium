import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import masterData from '../masterData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = masterData.SERVICES;

function getHeader(activeSlug, depth = 1) {
  const prefix = depth === 2 ? '../' : depth === 1 ? '' : '';
  const root = '/';

  return `
<!-- =====================================================
     MASTER HEADER & DROPDOWN NAVIGATION
===================================================== -->
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="/" aria-label="Sahabat Kaca Aluminium">
      <span class="brand-logo">
        <img src="${prefix}assets/logo.png" alt="Logo Sahabat Kaca Aluminium">
      </span>
      <span class="brand-name">
        Sahabat <b>Kaca Aluminium</b>
      </span>
    </a>

    <button class="menu-toggle" aria-label="Buka navigasi menu" onclick="toggleNav()">
      ☰
    </button>

    <nav id="mainNav" class="site-nav">
      <a href="/" class="nav-link ${activeSlug === 'beranda' ? 'active' : ''}">Beranda</a>
      <a href="/tentang-kami" class="nav-link ${activeSlug === 'tentang-kami' ? 'active' : ''}">Tentang Kami</a>
      
      <div class="nav-dropdown ${activeSlug && activeSlug.startsWith('layanan') ? 'active' : ''}">
        <a href="/layanan" class="nav-link nav-dropdown-toggle">Layanan <span class="arrow">▾</span></a>
        <div class="nav-dropdown-menu">
          <a href="/layanan/kusen-aluminium" class="nav-dropdown-item">Kusen Aluminium</a>
          <a href="/layanan/pintu-aluminium" class="nav-dropdown-item">Pintu Aluminium</a>
          <a href="/layanan/jendela-aluminium" class="nav-dropdown-item">Jendela Aluminium</a>
          <a href="/layanan/pintu-kaca-tempered" class="nav-dropdown-item">Pintu Kaca Tempered</a>
          <a href="/layanan/partisi-kaca-aluminium" class="nav-dropdown-item">Partisi Kaca Aluminium</a>
          <a href="/layanan/kanopi-kaca-tempered" class="nav-dropdown-item">Kanopi Kaca Tempered</a>
          <a href="/layanan/shower-kaca" class="nav-dropdown-item">Shower Kaca</a>
          <a href="/layanan/etalase-kaca" class="nav-dropdown-item">Etalase Kaca</a>
          <div class="nav-dropdown-divider"></div>
          <a href="/layanan" class="nav-dropdown-footer">→ Katalog Semua 8 Layanan</a>
        </div>
      </div>

      <a href="/hitung-estimasi" class="nav-link ${activeSlug === 'hitung-estimasi' ? 'active' : ''}">Hitung Estimasi</a>
      <a href="/status-proyek" class="nav-link ${activeSlug === 'status-proyek' ? 'active' : ''}">Status Proyek</a>
      <a href="/portofolio" class="nav-link ${activeSlug === 'portofolio' ? 'active' : ''}">Portofolio</a>
      <a href="/kontraktor" class="nav-link ${activeSlug === 'kontraktor' ? 'active' : ''}">Kontraktor</a>
      <a href="/blog" class="nav-link ${activeSlug === 'blog' ? 'active' : ''}">Blog & Artikel</a>
      <a href="/faq" class="nav-link ${activeSlug === 'faq' ? 'active' : ''}">FAQ</a>
      <a href="/testimoni" class="nav-link ${activeSlug === 'testimoni' ? 'active' : ''}">Testimoni</a>
    </nav>

    <a class="header-cta-btn" href="https://wa.me/6289637371166?text=Halo%20Admin%20Sahabat%20Kaca%20Aluminium%2C%20saya%20ingin%20konsultasi%20layanan." target="_blank" rel="noopener">
      <span>💬 Survey Gratis WA</span>
    </a>
  </div>
</header>
<script>
function toggleNav() {
  const n = document.getElementById('mainNav');
  if (n) n.classList.toggle('open');
}
</script>
`;
}

function getFooter(depth = 1) {
  const prefix = depth === 2 ? '../' : depth === 1 ? '' : '';
  return `
<!-- =====================================================
     MASTER FOOTER & FLOATING WHATSAPP
===================================================== -->
<footer>
  <div class="container footer-grid">
    <div>
      <div class="footer-brand" style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <img src="${prefix}assets/logo.png" alt="Logo Sahabat Kaca Aluminium" style="width:36px;height:36px;border-radius:50%;background:#fff;">
        <span style="font-size:16px;font-weight:800;color:#fff;">Sahabat Kaca Aluminium</span>
      </div>
      <p style="color:#a9bec5;font-size:13px;line-height:1.7;">
        Bengkel dan kontraktor spesialis kusen aluminium, pintu kaca tempered, jendela, partisi, kanopi carport, shower screen, dan etalase komersial di Karawang dan sekitarnya. Bergaransi resmi, material SNI, dan layanan survey lokasi gratis.
      </p>
      <div style="font-size:12.5px;color:#c7d9df;margin-top:8px;">
        📍 <strong>Workshop:</strong> Jl. Raden Rubaya, Nagasari, Kec. Karawang Barat, Jawa Barat 41315<br>
        ⏰ <strong>Jam Buka:</strong> 08.00 - 18.00 WIB (Setiap Hari)<br>
        📱 <strong>WhatsApp:</strong> <a href="https://wa.me/6289637371166" style="color:#ffd88a;font-weight:700;">0896-3737-1166</a>
      </div>
    </div>

    <div>
      <b style="color:#fff;font-size:14px;display:block;margin-bottom:12px;">Navigasi Layanan</b>
      <a href="/layanan/kusen-aluminium" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Kusen Aluminium</a>
      <a href="/layanan/pintu-aluminium" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Pintu Aluminium</a>
      <a href="/layanan/jendela-aluminium" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Jendela Aluminium</a>
      <a href="/layanan/pintu-kaca-tempered" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Pintu Kaca Tempered</a>
      <a href="/layanan/partisi-kaca-aluminium" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Partisi Kaca Kantor</a>
      <a href="/layanan/kanopi-kaca-tempered" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Kanopi Kaca Carport</a>
      <a href="/layanan/shower-kaca" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Shower Screen Kaca</a>
      <a href="/layanan/etalase-kaca" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Etalase Kaca Toko</a>
    </div>

    <div>
      <b style="color:#fff;font-size:14px;display:block;margin-bottom:12px;">Informasi & Area</b>
      <a href="/tentang-kami" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Tentang Perusahaan</a>
      <a href="/portofolio" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Portofolio Proyek</a>
      <a href="/hitung-estimasi" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Kalkulator Estimasi Biaya</a>
      <a href="/status-proyek" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Lacak Status Proyek</a>
      <a href="/kontraktor" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Kerjasama Kontraktor / B2B</a>
      <a href="/blog" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Artikel & Edukasi</a>
      <a href="/faq" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Tanya Jawab (FAQ)</a>
      <a href="/testimoni" style="color:#a9bec5;text-decoration:none;margin-bottom:6px;display:block;">Testimoni Pelanggan</a>
    </div>
  </div>

  <div class="container copyright" style="border-top:1px solid #173742;padding-top:18px;margin-top:25px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
    <span>&copy; 2026 Sahabat Kaca Aluminium Karawang. Hak Cipta Dilindungi Undang-Undang.</span>
    <span>Workshop Resmi Karawang & Bekasi</span>
  </div>
</footer>

<a class="whatsapp-float" href="https://wa.me/6289637371166?text=Halo%20Admin%20Sahabat%20Kaca%20Aluminium%2C%20saya%20ingin%20konsultasi%20dan%20survey%20lokasi." target="_blank" rel="noopener" aria-label="Hubungi WhatsApp">
  <span>💬 WhatsApp Kami</span>
</a>
`;
}

function generateServicePage(service) {
  const canonicalUrl = `https://sahabat-aluminium.my.id/layanan/${service.slug}`;
  const ogImageUrl = `https://sahabat-aluminium.my.id/${service.image}`;

  const modelsHtml = service.models.map(m => `
    <div style="background:#fff;border:1px solid #dce5e9;border-radius:12px;padding:24px;box-shadow:0 6px 18px rgba(7,55,70,0.06);display:flex;flex-direction:column;">
      <h3 style="margin:0 0 10px;font-size:18px;color:var(--deep);">${m.name}</h3>
      <p style="font-size:13.5px;color:var(--muted);margin:0 0 16px;line-height:1.6;flex-grow:1;">${m.desc}</p>
      <div style="border-top:1px solid #eef3f5;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:700;color:var(--blue);">${m.rate}</span>
        <a href="/hitung-estimasi?service=${service.calcKey}" style="font-size:12px;color:var(--deep);font-weight:700;">Hitung RAB &rarr;</a>
      </div>
    </div>
  `).join('');

  const materialsHtml = service.materials.map(m => `
    <li style="margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;font-size:14.5px;color:#244450;">
      <span style="color:var(--gold);font-weight:bold;">✔</span>
      <span>${m}</span>
    </li>
  `).join('');

  const specsRowsHtml = Object.entries(service.specifications).map(([key, val]) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #eef3f5;font-weight:700;color:var(--deep);width:32%;">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #eef3f5;color:#334155;">${val}</td>
    </tr>
  `).join('');

  const galleryHtml = service.galleryImages.map(img => `
    <div style="height:200px;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <img src="../${img}" alt="${service.name} Proyek Karawang" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
    </div>
  `).join('');

  const faqSchema = service.faq.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": f.a
    }
  }));

  const faqHtml = service.faq.map(f => `
    <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;margin-bottom:14px;">
      <h3 style="margin:0 0 8px;font-size:16.5px;color:var(--deep);">❓ ${f.q}</h3>
      <p style="margin:0;font-size:14px;color:var(--muted);line-height:1.7;">${f.a}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XPVPG8FK82"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XPVPG8FK82');
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

  <!-- SEO PRIMARY TAGS -->
  <title>${service.title} | Sahabat Kaca Aluminium</title>
  <meta name="description" content="${service.description.slice(0, 155)}...">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OPEN GRAPH & TWITTER -->
  <meta property="og:site_name" content="Sahabat Kaca Aluminium">
  <meta property="og:locale" content="id_ID">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${service.title} | Sahabat Kaca Aluminium">
  <meta property="og:description" content="${service.summary}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${service.title}">
  <meta name="twitter:description" content="${service.summary}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <link rel="icon" type="image/png" href="../assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">

  <!-- SCHEMA.ORG STRUCTURED DATA -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "${service.name} Karawang",
    "serviceType": "${service.name}",
    "description": "${service.description}",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Sahabat Kaca Aluminium",
      "telephone": "+6289637371166",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. Raden Rubaya, Nagasari, Kec. Karawang Bar.",
        "addressLocality": "Karawang",
        "addressRegion": "Jawa Barat",
        "postalCode": "41315",
        "addressCountry": "ID"
      }
    },
    "areaServed": [
      { "@type": "City", "name": "Karawang" },
      { "@type": "City", "name": "Cikarang" },
      { "@type": "City", "name": "Cikampek" },
      { "@type": "City", "name": "Bekasi" }
    ],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "IDR",
      "price": "${service.priceStarting.replace(/[^0-9]/g, '') || '85000'}",
      "description": "${service.priceRange}"
    }
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beranda",
        "item": "https://sahabat-aluminium.my.id/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Layanan",
        "item": "https://sahabat-aluminium.my.id/layanan"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${service.name}",
        "item": "${canonicalUrl}"
      }
    ]
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(faqSchema, null, 2)}
  }
  </script>
</head>
<body>

${getHeader('layanan', 2)}

<!-- BREADCRUMB -->
<div class="breadcrumb-wrap">
  <div class="container">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item"><a href="/">Beranda</a></li>
      <li class="breadcrumb-separator">/</li>
      <li class="breadcrumb-item"><a href="/layanan">Layanan</a></li>
      <li class="breadcrumb-separator">/</li>
      <li class="breadcrumb-item active" aria-current="page">${service.name}</li>
    </ol>
  </div>
</div>

<!-- HERO DETAIL -->
<section style="background:linear-gradient(135deg, #073746 0%, #0d5c73 60%, #082833 100%);color:#fff;padding:60px 0 70px;">
  <div class="container">
    <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:40px;align-items:center;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(200,148,61,0.25);border:1px solid var(--gold);color:#ffd88a;padding:5px 12px;border-radius:6px;font-size:12.5px;font-weight:700;margin-bottom:12px;">
          ★ SPESIALIS RESMI KARAWANG • GARANSI ${service.warranty.toUpperCase()}
        </div>
        <h1 style="color:#fff;font-size:clamp(2.1rem, 3.8vw, 3.2rem);line-height:1.15;margin:10px 0 16px;">
          ${service.title}
        </h1>
        <p style="color:#cde1e8;font-size:16px;line-height:1.7;margin-bottom:24px;">
          ${service.description}
        </p>

        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;">
          <div style="background:rgba(255,255,255,0.1);padding:8px 14px;border-radius:6px;font-size:13px;">✔ Profil SNI Resmi</div>
          <div style="background:rgba(255,255,255,0.1);padding:8px 14px;border-radius:6px;font-size:13px;">✔ Free Survey Lokasi & Laser Leveling</div>
          <div style="background:rgba(255,255,255,0.1);padding:8px 14px;border-radius:6px;font-size:13px;">✔ Estimasi RAB Cepat 15 Menit</div>
          <div style="background:rgba(255,255,255,0.1);padding:8px 14px;border-radius:6px;font-size:13px;">✔ Garansi Tertulis Resmi</div>
        </div>

        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a href="https://wa.me/6289637371166?text=Halo%20Admin%20Sahabat%20Kaca%20Aluminium%2C%20saya%20ingin%20konsultasi%20layanan%20${encodeURIComponent(service.name)}." target="_blank" rel="noopener" style="background:#25d366;color:#fff;font-weight:800;padding:14px 24px;border-radius:8px;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(37,211,102,0.3);">
            <span>💬 Konsultasi & Survey via WA</span>
          </a>
          <a href="/hitung-estimasi?service=${service.calcKey}" style="background:rgba(255,255,255,0.15);color:#fff;font-weight:700;padding:14px 24px;border-radius:8px;font-size:14px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">
            <span>🧮 Hitung Estimasi Biaya</span>
          </a>
        </div>
      </div>

      <!-- MAIN VERIFIED PHOTO CARD -->
      <div style="background:#fff;color:var(--ink);border-radius:14px;padding:20px;box-shadow:0 18px 45px rgba(0,0,0,0.28);">
        <div style="position:relative;height:240px;overflow:hidden;border-radius:10px;margin-bottom:16px;">
          <img src="../${service.image}" alt="${service.imageAlt}" style="width:100%;height:100%;object-fit:cover;">
          <span style="position:absolute;top:10px;left:10px;background:rgba(7,55,70,0.9);color:#5eead4;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;">
            ${service.badge}
          </span>
          <span style="position:absolute;bottom:10px;right:10px;background:#ffd88a;color:#073746;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:6px;">
            ${service.priceStarting}
          </span>
        </div>
        <h3 style="margin:0 0 8px;font-size:18px;color:var(--deep);">Spesifikasi Resmi & RAB Cepat</h3>
        <p style="font-size:13px;color:var(--muted);line-height:1.6;margin:0 0 14px;">
          Dikerjakan langsung oleh tim teknisi spesialis dengan toleransi potong mesin ganda otomatis & bahan baku original bergaransi.
        </p>
        <div style="background:#f1f7f9;border-left:4px solid var(--gold);padding:10px 14px;border-radius:0 6px 6px 0;font-size:12.5px;color:#244450;">
          📞 <strong>Layanan Fast Response:</strong> Hubungi admin via WhatsApp untuk request jadwal survey gratis langsung ke lokasi Anda di Karawang.
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PILIHAN MODEL & SISTEM BUKAAN -->
<section style="padding:70px 0;background:#fff;">
  <div class="container">
    <div style="text-align:center;max-width:760px;margin:0 auto 40px;">
      <div class="eyebrow" style="color:var(--gold);">PILIHAN MODEL & VARIASI</div>
      <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:var(--deep);margin:8px 0 12px;">
        Model ${service.name} Populer
      </h2>
      <p style="color:var(--muted);font-size:15px;line-height:1.7;">
        Kami menyediakan beragam opsi konfigurasi sesuai kebutuhan arsitektur dan fungsional ruangan Anda.
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;">
      ${modelsHtml}
    </div>
  </div>
</section>

<!-- SPESIFIKASI TEKNIS & MATERIAL -->
<section style="padding:70px 0;background:#f8fafb;border-top:1px solid #dce5e9;border-bottom:1px solid #dce5e9;">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:45px;align-items:start;">
      
      <!-- Tabel Spesifikasi -->
      <div style="background:#fff;border:1px solid #dce5e9;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(7,55,70,0.05);">
        <div style="background:var(--deep);color:#fff;padding:18px 20px;">
          <h3 style="margin:0;font-size:18px;color:#fff;">📋 Tabel Spesifikasi Teknis Standar SNI</h3>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13.5px;">
          <tbody>
            ${specsRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- Pilihan Material -->
      <div>
        <div class="eyebrow" style="color:var(--gold);">STANDAR MUTU BAHAN</div>
        <h2 style="font-size:clamp(1.7rem, 2.8vw, 2.3rem);color:var(--deep);margin:8px 0 16px;">
          Material Berkualitas Tinggi & Tahan Cuaca
        </h2>
        <p style="color:var(--muted);font-size:14.5px;line-height:1.7;margin-bottom:20px;">
          Semua proyek ${service.name} dari Sahabat Kaca Aluminium menggunakan profil ekstrusi dan kaca original yang lolos uji kelayakan:
        </p>

        <ul style="list-style:none;padding:0;margin:0 0 24px;">
          ${materialsHtml}
        </ul>

        <div style="background:#eef6f8;border-radius:10px;padding:16px;font-size:13px;color:#1e3a47;">
          🛡️ <strong>Jaminan Keaslian:</strong> Kami tidak pernah mengoplos profil berkualitas dengan profil banci tipis. Setiap batang kusen dan kaca memiliki label spesifikasi pabrik yang jelas.
        </div>
      </div>

    </div>
  </div>
</section>

<!-- GALERI FOTO PROYEK -->
<section style="padding:70px 0;background:#fff;">
  <div class="container">
    <div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:30px;flex-wrap:wrap;gap:16px;">
      <div>
        <div class="eyebrow" style="color:var(--gold);">DOKUMENTASI ASLI LAPANGAN</div>
        <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:var(--deep);margin:8px 0 0;">
          Foto Proyek Terpasang
        </h2>
      </div>
      <a href="/portofolio" style="font-weight:700;color:var(--blue);font-size:14px;">
        Lihat Semua 26 Proyek di Portofolio &rarr;
      </a>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:20px;">
      ${galleryHtml}
    </div>
  </div>
</section>

<!-- PROSES PENGERJAAN & AREA -->
<section style="padding:70px 0;background:#f8fafb;border-top:1px solid #dce5e9;">
  <div class="container">
    <div style="text-align:center;max-width:760px;margin:0 auto 40px;">
      <div class="eyebrow" style="color:var(--gold);">WORKFLOW SISTEMATIS</div>
      <h2 style="font-size:clamp(1.8rem, 3vw, 2.5rem);color:var(--deep);margin:8px 0 12px;">
        5 Tahap Pengerjaan Bergaransi
      </h2>
      <p style="color:var(--muted);font-size:15px;line-height:1.7;">
        Setiap pesanan ${service.name} melalui prosedur standar operasional ketat untuk memastikan hasil akhir rapi, kokoh, dan presisi.
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;">
      <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;text-align:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 12px;">1</div>
        <h3 style="font-size:15px;color:var(--deep);margin:0 0 6px;">Survey & Laser</h3>
        <p style="font-size:12.5px;color:var(--muted);margin:0;">Pengukuran digital presisi langsung di lokasi Anda.</p>
      </div>

      <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;text-align:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 12px;">2</div>
        <h3 style="font-size:15px;color:var(--deep);margin:0 0 6px;">Penerbitan RAB</h3>
        <p style="font-size:12.5px;color:var(--muted);margin:0;">RAB resmi transparan tanpa ada biaya tersembunyi.</p>
      </div>

      <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;text-align:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 12px;">3</div>
        <h3 style="font-size:15px;color:var(--deep);margin:0 0 6px;">Fabrikasi Mesin</h3>
        <p style="font-size:12.5px;color:var(--muted);margin:0;">Pemotongan miter 45° presisi di workshop kami.</p>
      </div>

      <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;text-align:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 12px;">4</div>
        <h3 style="font-size:15px;color:var(--deep);margin:0 0 6px;">Pemasangan</h3>
        <p style="font-size:12.5px;color:var(--muted);margin:0;">Instalasi rapi, seal weatherproof & uji fungsi.</p>
      </div>

      <div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;text-align:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;margin:0 auto 12px;">5</div>
        <h3 style="font-size:15px;color:var(--deep);margin:0 0 6px;">Garansi Resmi</h3>
        <p style="font-size:12.5px;color:var(--muted);margin:0;">Sertifikat garansi resmi perawatan & aksesoris.</p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ KHUSUS LAYANAN -->
<section style="padding:70px 0;background:#fff;">
  <div class="container" style="max-width:850px;">
    <div style="text-align:center;margin-bottom:36px;">
      <div class="eyebrow" style="color:var(--gold);">TANYA JAWAB</div>
      <h2 style="font-size:clamp(1.8rem, 3vw, 2.4rem);color:var(--deep);margin:8px 0 0;">
        Pertanyaan Umum Seputar ${service.name}
      </h2>
    </div>

    ${faqHtml}
  </div>
</section>

<!-- BOTTOM CTA -->
<section style="background:linear-gradient(135deg, #073746 0%, #0d5c73 100%);color:#fff;padding:60px 0;text-align:center;">
  <div class="container" style="max-width:800px;">
    <h2 style="color:#fff;font-size:clamp(1.9rem, 3.2vw, 2.6rem);margin:0 0 16px;">
      Butuh Pemasangan ${service.name} di Karawang?
    </h2>
    <p style="color:#cde1e8;font-size:15.5px;line-height:1.7;margin:0 0 30px;">
      Konsultasikan ukuran atau kirimkan denah bangunan Anda. Tim teknisi Sahabat Kaca Aluminium siap melakukan survey gratis dan menerbitkan estimasi biaya RAB resmi.
    </p>

    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
      <a href="https://wa.me/6289637371166?text=Halo%20Admin%20Sahabat%20Kaca%20Aluminium%2C%20saya%20tertarik%20konsultasi%20dan%20survey%20layanan%20${encodeURIComponent(service.name)}." target="_blank" rel="noopener" style="background:#25d366;color:#fff;font-weight:800;padding:15px 30px;border-radius:8px;font-size:15px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(37,211,102,0.3);">
        <span>💬 Chat WhatsApp Sekarang</span>
      </a>
      <a href="/hitung-estimasi?service=${service.calcKey}" style="background:#fff;color:var(--deep);font-weight:800;padding:15px 30px;border-radius:8px;font-size:15px;text-decoration:none;">
        <span>🧮 Hitung Estimasi Biaya</span>
      </a>
    </div>
  </div>
</section>

${getFooter(2)}

</body>
</html>`;
}

// Generate the 8 files in /layanan/
const outDir = path.join(__dirname, '../layanan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

services.forEach(s => {
  const filePath = path.join(outDir, `${s.slug}.html`);
  fs.writeFileSync(filePath, generateServicePage(s), 'utf8');
  console.log(`Generated: layanan/${s.slug}.html`);
});

console.log('Successfully generated all 8 service detail pages!');
