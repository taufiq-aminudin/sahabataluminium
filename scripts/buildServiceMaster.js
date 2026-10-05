import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function main() {
  const md = await import(path.join(root, 'masterData.js'));
  const pc = await import(path.join(root, 'pricingConfig.js'));

  const masterServices = md.SERVICES;
  const pricingServices = pc.services;

  const servicesData = masterServices.map((s, idx) => {
    const p = pricingServices[s.calcKey] || pricingServices[s.id] || {};
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      calcKey: s.calcKey,
      title: s.title,
      order: idx + 1,
      category: s.category || 'aluminium',
      priceMin: p.priceMin || 0,
      priceMax: p.priceMax || 0,
      priceStarting: s.priceStarting,
      priceRange: s.priceRange,
      unit: p.unit || s.priceUnit || 'unit',
      unitName: p.unitName || (p.unit === 'm1' ? 'Meter Lari (m1)' : p.unit === 'm²' ? 'Meter Persegi (m²)' : 'Unit'),
      warranty: s.warranty,
      badge: s.badge,
      description: s.description,
      summary: s.summary,
      image: s.image,
      imageAlt: s.imageAlt,
      galleryImages: s.galleryImages || [s.image],
      specifications: s.specifications || {},
      models: s.models || [],
      materials: s.materials || [],
      faq: s.faq || []
    };
  });

  const serviceMasterCode = `/* ==============================================================================
 * SERVICE_MASTER (Single Source of Truth for Services, Cards & Detail Pages)
 * Centralized registry of all 12 services with id, name, slug, priceMin, specifications, models
 * ============================================================================== */
const SERVICE_MASTER = {
  services: ${JSON.stringify(servicesData, null, 2)},

  // Getter lookup by id, slug, or calcKey
  get: function(key) {
    if (!key) return null;
    const k = String(key).toLowerCase().trim();
    return this.services.find(function(s) {
      return s.id === k || s.slug === k || s.calcKey === k;
    }) || null;
  },

  // Get all services
  getAll: function() {
    return this.services;
  },

  // Helper to format IDR currency
  formatCurrency: function(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  },

  // Dynamically render service cards into any container
  renderCards: function(containerOrSelector, options) {
    options = options || {};
    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : containerOrSelector;
    if (!container) return;

    const list = options.filter
      ? this.services.filter(options.filter)
      : (options.limit ? this.services.slice(0, options.limit) : this.services);

    let html = '';
    const self = this;
    list.forEach(function(service, index) {
      const numStr = (index + 1 < 10 ? '0' : '') + (index + 1);
      const shortBadge = service.badge || 'Spesialis Resmi';

      // 3 bullet highlights from materials or specifications
      let highlightsHtml = '';
      if (service.materials && service.materials.length > 0) {
        service.materials.slice(0, 3).forEach(function(m) {
          highlightsHtml += '<li>' + m + '</li>';
        });
      } else if (service.specifications) {
        Object.entries(service.specifications).slice(0, 3).forEach(function(entry) {
          highlightsHtml += '<li>' + entry[0] + ': ' + entry[1] + '</li>';
        });
      }

      html += '<article class="service-master-card" data-service-id="' + service.id + '" style="background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(7,55,70,0.06);display:flex;flex-direction:column;transition:transform 0.2s ease, box-shadow 0.2s ease;">' +
        '<div style="position:relative;height:210px;overflow:hidden;background:#0d2c38;">' +
          '<img src="/' + service.image + '" alt="' + service.imageAlt + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
          '<span style="position:absolute;top:12px;left:12px;background:rgba(7,46,59,0.92);color:#5eead4;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;">' + numStr + '. ' + service.name.toUpperCase() + '</span>' +
          '<span style="position:absolute;top:12px;right:12px;background:#ffd88a;color:#073746;font-size:11px;font-weight:700;padding:4px 9px;border-radius:6px;">' + shortBadge + '</span>' +
        '</div>' +
        '<div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;">' +
          '<h3 style="margin:0 0 10px;font-size:20px;color:var(--deep);font-weight:800;">' + service.name + '</h3>' +
          '<p style="font-size:14px;color:#556972;margin:0 0 16px;line-height:1.6;">' +
            service.summary +
          '</p>' +
          '<ul style="margin:0 0 18px;padding-left:18px;font-size:12.5px;color:#475569;display:flex;flex-direction:column;gap:5px;">' +
            highlightsHtml +
          '</ul>' +
          '<div style="margin-top:auto;display:flex;flex-direction:column;gap:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf2f4;padding-top:12px;">' +
              '<span style="font-size:13.5px;color:var(--blue);font-weight:800;">' + service.priceStarting + '</span>' +
              '<span style="font-size:11.5px;background:#e6f8f5;color:#0d9488;padding:3px 8px;border-radius:6px;font-weight:700;">Garansi ' + service.warranty + '</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
              '<a href="/layanan/' + service.slug + '" class="btn primary" style="padding:10px 12px;font-size:12.5px;text-align:center;justify-content:center;">Lihat Detail &rarr;</a>' +
              '<a href="https://wa.me/6289637371166?text=Halo%20Admin%2C%20saya%20tertarik%20konsultasi%20' + encodeURIComponent(service.name) + '." target="_blank" rel="noopener" class="btn ghost" style="padding:10px 12px;font-size:12.5px;text-align:center;justify-content:center;color:#0f5132;border-color:#25d366;">Chat WA</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    });

    container.innerHTML = html;
  },

  // Dynamically render a complete service detail page view
  renderDetail: function(slugOrId, containerOrSelector) {
    const service = this.get(slugOrId);
    if (!service) return false;

    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : (containerOrSelector || document.getElementById('serviceDetailContainer') || document.getElementById('spa-content'));

    // If targeted sub-elements exist in an already static/hydrated detail page, update them smoothly
    const heroTitle = document.getElementById('serviceHeroTitle');
    const heroDesc = document.getElementById('serviceHeroDesc');
    const heroStartingPrice = document.getElementById('serviceHeroStartingPrice');
    const heroBadge = document.getElementById('serviceHeroBadge');
    const heroImg = document.getElementById('serviceHeroImg');

    if (heroTitle) heroTitle.textContent = service.title;
    if (heroDesc) heroDesc.textContent = service.description;
    if (heroStartingPrice) heroStartingPrice.textContent = service.priceStarting;
    if (heroBadge) heroBadge.textContent = '★ SPESIALIS RESMI KARAWANG • GARANSI ' + service.warranty.toUpperCase();
    if (heroImg) {
      heroImg.src = '/' + service.image;
      heroImg.alt = service.imageAlt;
    }

    // Dynamic models list
    const modelsBox = document.getElementById('serviceDetailModels');
    if (modelsBox && service.models) {
      let modelsHtml = '';
      service.models.forEach(function(m) {
        modelsHtml += '<div style="background:#fff;border:1px solid #dce5e9;border-radius:12px;padding:24px;box-shadow:0 6px 18px rgba(7,55,70,0.06);display:flex;flex-direction:column;">' +
          '<h3 style="margin:0 0 10px;font-size:18px;color:var(--deep);">' + m.name + '</h3>' +
          '<p style="font-size:13.5px;color:var(--muted);margin:0 0 16px;line-height:1.6;flex-grow:1;">' + m.desc + '</p>' +
          '<div style="border-top:1px solid #eef3f5;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="font-size:13px;font-weight:700;color:var(--blue);">' + m.rate + '</span>' +
            '<a href="/hitung-estimasi?service=' + service.calcKey + '" style="font-size:12px;color:var(--deep);font-weight:700;">Hitung RAB &rarr;</a>' +
          '</div>' +
        '</div>';
      });
      modelsBox.innerHTML = modelsHtml;
    }

    // Dynamic specs table
    const specsTable = document.getElementById('serviceDetailSpecs');
    if (specsTable && service.specifications) {
      let specsHtml = '';
      Object.entries(service.specifications).forEach(function(entry) {
        const keyFormatted = entry[0].replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); });
        specsHtml += '<tr>' +
          '<td style="padding:12px 16px;border-bottom:1px solid #eef3f5;font-weight:700;color:var(--deep);width:32%;">' + keyFormatted + '</td>' +
          '<td style="padding:12px 16px;border-bottom:1px solid #eef3f5;color:#334155;">' + entry[1] + '</td>' +
        '</tr>';
      });
      specsTable.innerHTML = specsHtml;
    }

    // Dynamic materials
    const materialsList = document.getElementById('serviceDetailMaterials');
    if (materialsList && service.materials) {
      let matHtml = '';
      service.materials.forEach(function(mat) {
        matHtml += '<li style="margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;font-size:14.5px;color:#244450;">' +
          '<span style="color:var(--gold);font-weight:bold;">✔</span>' +
          '<span>' + mat + '</span>' +
        '</li>';
      });
      materialsList.innerHTML = matHtml;
    }

    // Dynamic FAQs
    const faqContainer = document.getElementById('serviceDetailFaq');
    if (faqContainer && service.faq) {
      let faqHtml = '';
      service.faq.forEach(function(f) {
        faqHtml += '<div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;margin-bottom:14px;">' +
          '<h3 style="margin:0 0 8px;font-size:16.5px;color:var(--deep);">❓ ' + f.q + '</h3>' +
          '<p style="margin:0;font-size:14px;color:var(--muted);line-height:1.7;">' + f.a + '</p>' +
        '</div>';
      });
      faqContainer.innerHTML = faqHtml;
    }

    // Dynamic Gallery
    const galleryBox = document.getElementById('serviceDetailGallery');
    if (galleryBox && service.galleryImages) {
      let galHtml = '';
      service.galleryImages.forEach(function(img) {
        galHtml += '<div style="height:200px;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">' +
          '<img src="/' + img + '" alt="' + service.name + ' Proyek Karawang" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
        '</div>';
      });
      galleryBox.innerHTML = galHtml;
    }

    return true;
  },

  // Auto-initialize components on page load
  init: function() {
    const servicesGrid = document.getElementById('servicesGridContainer');
    if (servicesGrid) {
      this.renderCards(servicesGrid);
    }

    // Detect if on detail page via pathname
    if (typeof window !== 'undefined' && window.location) {
      const pathStr = window.location.pathname || '';
      const match = pathStr.match(/\\/layanan\\/([a-z0-9-]+)(?:\\.html)?$/);
      if (match && match[1]) {
        this.renderDetail(match[1]);
      }
    }
  }
};

window.SERVICE_MASTER = SERVICE_MASTER;
`;

  // Inject into script.js
  const scriptPath = path.join(root, 'script.js');
  let js = fs.readFileSync(scriptPath, 'utf8');

  // Check if SERVICE_MASTER already in script.js
  const marker = '/* ==============================================================================\n * SERVICE_MASTER';
  if (js.includes('const SERVICE_MASTER = {')) {
    console.log('Replacing existing SERVICE_MASTER in script.js...');
    const startIdx = js.indexOf(marker);
    const endMarker = 'window.SERVICE_MASTER = SERVICE_MASTER;\n';
    const endIdx = js.indexOf(endMarker) + endMarker.length;
    js = js.slice(0, startIdx) + serviceMasterCode + '\n' + js.slice(endIdx);
  } else {
    console.log('Injecting SERVICE_MASTER into script.js...');
    // Inject right before PRICING_CONFIG
    const pricingStart = js.indexOf('const PRICING_CONFIG = {');
    if (pricingStart !== -1) {
      js = js.slice(0, pricingStart) + serviceMasterCode + '\n\n' + js.slice(pricingStart);
    } else {
      js = serviceMasterCode + '\n\n' + js;
    }
  }

  // Also hook into SPA router re-hydration so when SPA routes to /layanan or /layanan/:slug it calls SERVICE_MASTER
  if (!js.includes('window.SERVICE_MASTER.init()')) {
    js = js.replace(
      'function reinitializeComponents() {',
      'function reinitializeComponents() {\n    if (window.SERVICE_MASTER && window.SERVICE_MASTER.init) {\n      window.SERVICE_MASTER.init();\n    }'
    );
  }

  // Also add DOMContentLoaded listener for SERVICE_MASTER
  if (!js.includes('SERVICE_MASTER.init();')) {
    js += `\n// Auto-run SERVICE_MASTER on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SERVICE_MASTER && window.SERVICE_MASTER.init) window.SERVICE_MASTER.init();
    });
  } else {
    if (window.SERVICE_MASTER && window.SERVICE_MASTER.init) window.SERVICE_MASTER.init();
  }
}\n`;
  }

  fs.writeFileSync(scriptPath, js, 'utf8');
  console.log('Successfully added SERVICE_MASTER to script.js');
}

main().catch(console.error);
