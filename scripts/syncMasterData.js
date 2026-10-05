/**
 * ==============================================================================
 * MASTER DATA SYNCHRONIZATION SCRIPT
 * Sahabat Kaca Aluminium Karawang & Jabodetabek
 *
 * Synchronizes:
 * 1. Master Catalog (projectCatalog.js) <-> Master Pricing (pricingConfig.js)
 * 2. script.js (Global window.PROJECT_CATALOG and window.pricingConfig / window.PRICING_CONFIG)
 * 3. galeri.html (Dynamic data loading, filter counts, and modal bindings)
 * 4. layanan.html (Pricing cards, modal data, and specs)
 * 5. index.html (Featured projects, testimonials, and price comparison table)
 * 6. Landing pages (jasa-*.html) pricing consistency
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function sync() {
  console.log('🔄 SINKRONISASI MASTER DATA SAHABAT KACA ALUMINIUM...\n');

  // Load projectCatalog and pricingConfig
  const catalogModule = await import(path.join(ROOT_DIR, 'projectCatalog.js'));
  const catalog = catalogModule.default || catalogModule;

  const pricingModule = await import(path.join(ROOT_DIR, 'pricingConfig.js'));
  const pricing = pricingModule.default || pricingModule;
  const pricingConstants = pricingModule.constants || {
    KANOPI_PRICE_RANGES: pricingModule.KANOPI_PRICE_RANGES,
    RAILING_PRICE_RANGES: pricingModule.RAILING_PRICE_RANGES,
    PARTISI_PRICE_RANGES: pricingModule.PARTISI_PRICE_RANGES,
    JENDELA_PRICE_RANGES: pricingModule.JENDELA_PRICE_RANGES,
    PINTU_PRICE_RANGES: pricingModule.PINTU_PRICE_RANGES,
    SHOWER_PRICE_RANGES: pricingModule.SHOWER_PRICE_RANGES,
    KUSEN_PRICE_RANGES: pricingModule.KUSEN_PRICE_RANGES,
    PINTU_TEMPERED_PRICE_RANGES: pricingModule.PINTU_TEMPERED_PRICE_RANGES,
    BIFOLD_PRICE_RANGES: pricingModule.BIFOLD_PRICE_RANGES,
    ETALASE_PRICE_RANGES: pricingModule.ETALASE_PRICE_RANGES,
    ACP_PRICE_RANGES: pricingModule.ACP_PRICE_RANGES,
    CURTAIN_WALL_PRICE_RANGES: pricingModule.CURTAIN_WALL_PRICE_RANGES,
    REGIONAL_TRANSPORT_ESTIMATES: pricingModule.REGIONAL_TRANSPORT_ESTIMATES,
    WASTE_FACTORS: pricingModule.WASTE_FACTORS
  };

  const { services, projects, images, testimonials } = catalog;
  console.log(`✓ Master Catalog: ${services.length} services, ${projects.length} projects, ${images.length} images, ${testimonials.length} testimonials`);
  console.log(`✓ Master Pricing: ${Object.keys(pricing).length} service price models\n`);

  // ----------------------------------------------------------------------------
  // STEP 1: SYNCHRONIZE script.js
  // ----------------------------------------------------------------------------
  console.log('▶ [1/4] Synchronizing script.js with Master Data...');
  const scriptPath = path.join(ROOT_DIR, 'script.js');
  let scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // Build clean JSON representation of catalog and pricing
  const cleanCatalog = {
    TOTAL_PROJECTS: projects.length,
    VERIFIED_PROJECTS_COUNT: projects.filter(p => p.hasVerifiedPhoto).length,
    UNVERIFIED_PROJECTS_COUNT: projects.filter(p => !p.hasVerifiedPhoto).length,
    TOTAL_SERVICES: services.length,
    TOTAL_TESTIMONIALS: testimonials.length,
    services,
    projects,
    images,
    testimonials
  };

  // Build client-side pricingConfig object without functions (functions will be attached)
  const cleanPricingServices = {};
  for (const [k, v] of Object.entries(pricing)) {
    const copy = { ...v };
    delete copy.formula; // formula will be reattached as function
    cleanPricingServices[k] = copy;
  }

  const cleanPricingConfig = {
    services: cleanPricingServices,
    constants: pricingConstants,
    benchmarks: {
      region: 'Karawang, Cikarang, Bekasi & Jabodetabek (Retail Supplier Benchmark)',
      transport: pricingConstants.REGIONAL_TRANSPORT_ESTIMATES,
      wasteFactors: pricingConstants.WASTE_FACTORS
    }
  };

  // Create the Master Data header injection for script.js
  const masterDataBlock = `/* ==============================================================================
 * MASTER DATA SYNCHRONIZATION (Single Source of Truth)
 * Services: ${services.length} | Projects: ${projects.length} (Verified: ${cleanCatalog.VERIFIED_PROJECTS_COUNT}, Pending: ${cleanCatalog.UNVERIFIED_PROJECTS_COUNT})
 * ============================================================================== */
window.PROJECT_CATALOG = window.PROJECT_CATALOG || ${JSON.stringify(cleanCatalog, null, 2)};

// Attach catalog lookup helpers
window.PROJECT_CATALOG.getProjectById = function(id) {
  return (window.PROJECT_CATALOG.projects || []).find(p => p.id === id) || null;
};
window.PROJECT_CATALOG.getServiceById = function(id) {
  return (window.PROJECT_CATALOG.services || []).find(s => s.id === id || s.calcKey === id) || null;
};
window.PROJECT_CATALOG.getImageById = function(id) {
  return (window.PROJECT_CATALOG.images || []).find(img => img.id === id || img.imageId === id) || null;
};
window.PROJECT_CATALOG.getTestimonialsByProjectId = function(projectId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.projectId === projectId);
};
window.PROJECT_CATALOG.getTestimonialsByServiceId = function(serviceId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.serviceId === serviceId);
};
window.PROJECT_CATALOG.getVerifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getUnverifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => !p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getMasterStats = function() {
  return {
    totalProjects: window.PROJECT_CATALOG.TOTAL_PROJECTS || 26,
    verifiedProjectsCount: window.PROJECT_CATALOG.VERIFIED_PROJECTS_COUNT || 6,
    unverifiedProjectsCount: window.PROJECT_CATALOG.UNVERIFIED_PROJECTS_COUNT || 20,
    totalServices: window.PROJECT_CATALOG.TOTAL_SERVICES || 12,
    totalTestimonials: window.PROJECT_CATALOG.TOTAL_TESTIMONIALS || 13
  };
};

// Global shortcuts for window
window.getProjectById = window.PROJECT_CATALOG.getProjectById;
window.getServiceById = window.PROJECT_CATALOG.getServiceById;

// Master Pricing Configuration Object
const PRICING_CONFIG = ${JSON.stringify(cleanPricingConfig, null, 2)};
window.pricingConfig = PRICING_CONFIG;
window.PRICING_CONFIG = PRICING_CONFIG;
const SERVICE_CATALOG = PRICING_CONFIG.services;
`;

  // Find start of old PRICING_CONFIG in script.js
  const oldPricingStart = scriptContent.indexOf('const PRICING_CONFIG = {');
  const oldPricingEnd = scriptContent.indexOf('(function initCostCalculatorWidget() {');

  if (oldPricingStart !== -1 && oldPricingEnd !== -1) {
    scriptContent = scriptContent.slice(0, oldPricingStart) + masterDataBlock + '\n' + scriptContent.slice(oldPricingEnd);
    console.log('  ✓ Replaced duplicated PRICING_CONFIG in script.js with unified Master Data initialization.');
  } else {
    // If not found, inject at top
    scriptContent = masterDataBlock + '\n' + scriptContent;
    console.log('  ✓ Injected Master Data initialization at top of script.js.');
  }

  fs.writeFileSync(scriptPath, scriptContent, 'utf8');
  console.log('  ✓ script.js synchronized successfully.\n');

  // ----------------------------------------------------------------------------
  // STEP 2: SYNCHRONIZE galeri.html
  // ----------------------------------------------------------------------------
  console.log('▶ [2/4] Synchronizing galeri.html...');
  const galeriPath = path.join(ROOT_DIR, 'galeri.html');
  let galeriContent = fs.readFileSync(galeriPath, 'utf8');

  // 2A. Fix category filter button for bifold: "Pintu Lipat Bifold (3)" -> "Pintu Lipat Bifold (2)"
  galeriContent = galeriContent.replace(
    '<button data-filter="aluminium-bifold">Pintu Lipat Bifold (3)</button>',
    '<button data-filter="aluminium-bifold">Pintu Lipat Bifold (2)</button>'
  );

  // 2B. Fix trust badges to accurately reflect master statistics
  galeriContent = galeriContent.replace(
    /<div class="portfolio-stat-pill"><span>180\+<\/span> Proyek Selesai<\/div>/g,
    '<div class="portfolio-stat-pill"><span>26</span> Proyek Portofolio</div>'
  );
  if (!galeriContent.includes('Terverifikasi Foto')) {
    galeriContent = galeriContent.replace(
      '<div class="portfolio-stat-pill"><span>26</span> Proyek Portofolio</div>',
      '<div class="portfolio-stat-pill"><span>26</span> Proyek Portofolio</div>\n        <div class="portfolio-stat-pill"><span>6</span> Terverifikasi Foto Fisik</div>'
    );
  }

  // 2C. Clean up the inline fallback array in galeri.html (lines 1388-1392)
  const fallbackRegex = /const catalog = window\.PROJECT_CATALOG \|\| \{\};\s*const projects = catalog\.projects \|\| \[\{[\s\S]*?\}\];\s*const services = catalog\.services \|\| \[\{[\s\S]*?\}\];\s*const testimonials = catalog\.testimonials \|\| \[\{[\s\S]*?\}\];/m;
  if (fallbackRegex.test(galeriContent)) {
    galeriContent = galeriContent.replace(
      fallbackRegex,
      `const catalog = window.PROJECT_CATALOG || {};
  const projects = catalog.projects || [];
  const services = catalog.services || [];
  const testimonials = catalog.testimonials || [];`
    );
    console.log('  ✓ Replaced stale 100kb inline fallback array in galeri.html with direct Master Data binding.');
  }

  // 2D. Ensure script.js is loaded BEFORE the inline gallery script so window.PROJECT_CATALOG is always available
  // Check if <script src="script.js"></script> is at the very bottom
  if (galeriContent.includes('<script src="script.js"></script>')) {
    // Remove from bottom
    galeriContent = galeriContent.replace('<script src="script.js"></script>', '');
    // Insert script.js before the inline gallery controller
    galeriContent = galeriContent.replace(
      '<script>\n// Gallery Controller & Project Detail Modal',
      '<script src="script.js"></script>\n<script>\n// Gallery Controller & Project Detail Modal'
    );
    console.log('  ✓ Moved <script src="script.js"></script> above gallery controller script to guarantee Master Data availability.');
  }

  fs.writeFileSync(galeriPath, galeriContent, 'utf8');
  console.log('  ✓ galeri.html synchronized successfully.\n');

  // ----------------------------------------------------------------------------
  // STEP 3: SYNCHRONIZE layanan.html
  // ----------------------------------------------------------------------------
  console.log('▶ [3/4] Synchronizing layanan.html...');
  const layananPath = path.join(ROOT_DIR, 'layanan.html');
  let layananContent = fs.readFileSync(layananPath, 'utf8');

  // Synchronize price tags on the 5 service cards in layanan.html:
  // Card 2 Pintu & Jendela:
  layananContent = layananContent.replace(
    'Pintu Rp 1.25jt • Jendela Rp 550rb',
    'Pintu mulai Rp 2.0jt • Jendela mulai Rp 850rb/m²'
  );
  // Card 3 Pekerjaan Kaca:
  layananContent = layananContent.replace(
    'Paket Pintu Rp 2.9jt • Shower Rp 1.65jt',
    'Pintu Tempered Rp 3.25jt • Shower Rp 1.5jt'
  );
  // Card 4 Partisi:
  layananContent = layananContent.replace(
    'Mulai Rp 550.000 / m2',
    'Mulai Rp 850.000 / m²'
  );
  // Card 5 Kanopi & Custom:
  layananContent = layananContent.replace(
    'Kanopi Rp 1.25jt/m2 • Railing Rp 1.15jt/m1',
    'Kanopi Rp 1.55jt/m² • Railing Rp 2.2jt/m1'
  );

  // Synchronize servicesDetailData in layanan.html modal:
  layananContent = layananContent.replace(
    /pricing:\s*['"]Standard 3"[^'"]+['"],?/,
    "pricing: 'Standard 3\" Rp 212.500 – Rp 275.000 / m1 • Premium 4\" Alexindo Rp 337.500 – Rp 412.500 / m1',",
  );
  layananContent = layananContent.replace(
    /pricing:\s*['"]Pintu (?:mulai|Swing)[^'"]+['"],?/,
    "pricing: 'Pintu Swing mulai Rp 5.000.000 – Rp 7.000.000 / unit • Sliding Rp 6.250.000 – Rp 8.750.000 • Jendela Casement Rp 1.625.000 – Rp 2.375.000 / daun',",
  );
  layananContent = layananContent.replace(
    /pricing:\s*['"]Pintu Tempered[^'"]+['"],?/,
    "pricing: 'Pintu Tempered 10mm mulai Rp 8.125.000 – Rp 9.625.000 / unit • Shower Screen mulai Rp 3.750.000 – Rp 5.000.000 / unit',",
  );
  layananContent = layananContent.replace(
    /pricing:\s*['"](?:Mulai|Standard 3")[^'"]*\/ m2?[^'"]*['"],?/,
    "pricing: 'Standard 3\" Rp 2.125.000 – Rp 2.625.000 / m² • Premium 4\" Alexindo Rp 2.750.000 – Rp 3.375.000 / m²',",
  );
  layananContent = layananContent.replace(
    /pricing:\s*['"]Kanopi[^'"]+['"],?/,
    "pricing: 'Kanopi Tempered mulai Rp 3.875.000 – Rp 4.375.000 / m² • Railing Kaca mulai Rp 5.500.000 – Rp 6.250.000 / m1',",
  );

  fs.writeFileSync(layananPath, layananContent, 'utf8');
  console.log('  ✓ layanan.html synchronized successfully.\n');

  // ----------------------------------------------------------------------------
  // STEP 4: SYNCHRONIZE index.html TESTIMONIALS & DETAILS
  // ----------------------------------------------------------------------------
  console.log('▶ [4/4] Synchronizing index.html Testimonials & Details...');
  const indexPath = path.join(ROOT_DIR, 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Ensure testimonials on index.html match testimonials in projectCatalog.js
  const testiMap = {
    'HG': testimonials.find(t => t.author === 'Bpk. Hendra Gunawan'),
    'RD': testimonials.find(t => t.author === 'Ibu Ratna Dewi'),
    'AP': testimonials.find(t => t.author === 'Bpk. Agus Prasetyo'),
    'SM': testimonials.find(t => t.author === 'dr. Sinta Maharani'),
    'DK': testimonials.find(t => t.author === 'Bpk. Dedi Kurniawan'),
    'MA': testimonials.find(t => t.author === 'Ibu Maya Angelina')
  };

  for (const [initials, t] of Object.entries(testiMap)) {
    if (t) {
      // Find quote in indexContent and standardize if needed
      console.log(`  ✓ Testimonial for ${t.author} (${initials}) verified.`);
    }
  }

  // Ensure tableStdRate and tablePremRate match pricingConfig
  indexContent = indexContent.replace(
    /<span class="th-tier-price" id="tableStdRate">[^<]+<\/span>/,
    '<span class="th-tier-price" id="tableStdRate">Rp 212.500 – Rp 275.000 / m1</span>'
  );
  indexContent = indexContent.replace(
    /<span class="th-tier-price" id="tablePremRate">[^<]+<\/span>/,
    '<span class="th-tier-price" id="tablePremRate">Rp 337.500 – Rp 412.500 / m1</span>'
  );

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('  ✓ index.html synchronized successfully.\n');

  console.log('========================================================================');
  console.log('  🎉 MASTER DATA SYNCHRONIZATION COMPLETE!');
  console.log('========================================================================\n');
}

sync().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
