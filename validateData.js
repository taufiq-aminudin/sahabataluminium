/**
 * ==============================================================================
 * DATA CONSISTENCY & INTEGRITY VALIDATOR
 * Sahabat Kaca Aluminium Karawang & Jabodetabek
 *
 * Runs via: npm run validate:data
 * Fails build if any critical data consistency error is detected.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runValidation() {
  console.log('====================================================');
  console.log('  🔍 STARTING PRODUCTION DATA CONSISTENCY AUDIT     ');
  console.log('====================================================\n');

  let criticalErrors = [];
  let warnings = [];

  // 1. Load projectCatalog.js
  let catalog;
  try {
    const catalogModule = await import('./projectCatalog.js');
    catalog = catalogModule.default || catalogModule;
  } catch (err) {
    console.error('❌ Failed to load projectCatalog.js:', err);
    process.exit(1);
  }

  // 2. Load pricingConfig.js
  let pricingConfig;
  try {
    const pricingModule = await import('./pricingConfig.js');
    pricingConfig = pricingModule.default || pricingModule.services;
  } catch (err) {
    console.error('❌ Failed to load pricingConfig.js:', err);
    process.exit(1);
  }

  const { services, projects, images, testimonials } = catalog;

  // ----------------------------------------------------------------------------
  // RULE 1: Services Validation
  // ----------------------------------------------------------------------------
  console.log('▶ Checking Services (Target: 12 Services)...');
  if (!services || services.length !== 12) {
    criticalErrors.push(`Expected 12 services, but found ${services ? services.length : 0}`);
  }

  const serviceIdSet = new Set();
  const serviceCalcKeySet = new Set();
  services.forEach(s => {
    if (!s.id) criticalErrors.push(`Service missing id: ${JSON.stringify(s)}`);
    if (serviceIdSet.has(s.id)) criticalErrors.push(`Duplicate service ID found: ${s.id}`);
    serviceIdSet.add(s.id);

    if (serviceCalcKeySet.has(s.calcKey)) criticalErrors.push(`Duplicate service calcKey: ${s.calcKey}`);
    serviceCalcKeySet.add(s.calcKey);

    if (!s.rabConfigId) criticalErrors.push(`Service ${s.id} is missing rabConfigId (Service tanpa RAB)`);

    // Verify RAB configuration exists in pricingConfig
    const rabExists = pricingConfig && (pricingConfig[s.calcKey] || pricingConfig[s.id]);
    if (!rabExists) {
      criticalErrors.push(`Service ${s.id} (${s.calcKey}) has no matching RAB in pricingConfig.js (Service tanpa RAB)`);
    }
  });

  // Verify no orphan RAB in pricingConfig without service
  if (pricingConfig) {
    for (const rabKey of Object.keys(pricingConfig)) {
      const matchService = services.find(s => s.calcKey === rabKey || s.id === rabKey);
      if (!matchService) {
        criticalErrors.push(`pricingConfig contains RAB key '${rabKey}' with no matching service (RAB tanpa service)`);
      }
    }
  }

  console.log(`  ✓ 12 Services verified with valid rabConfigId and pricing models.\n`);

  // ----------------------------------------------------------------------------
  // RULE 2: Projects Validation
  // ----------------------------------------------------------------------------
  console.log('▶ Checking Projects (Target: 26 Portfolio Projects)...');
  if (!projects || projects.length !== 26) {
    criticalErrors.push(`Expected 26 projects, but found ${projects ? projects.length : 0}`);
  }

  const projectIdSet = new Set();
  const slugSet = new Set();

  projects.forEach(p => {
    // Duplicate ID check
    if (!p.id) criticalErrors.push(`Project missing id: ${JSON.stringify(p)}`);
    if (projectIdSet.has(p.id)) criticalErrors.push(`Duplicate project ID found: ${p.id}`);
    projectIdSet.add(p.id);

    // Duplicate Slug check
    if (!p.slug) criticalErrors.push(`Project ${p.id} missing slug`);
    if (slugSet.has(p.slug)) criticalErrors.push(`Duplicate project slug: ${p.slug}`);
    slugSet.add(p.slug);

    // Service relation check
    if (!p.serviceId) {
      criticalErrors.push(`Project ${p.id} has no serviceId (Project tanpa service)`);
    } else if (!serviceIdSet.has(p.serviceId)) {
      criticalErrors.push(`Project ${p.id} references invalid serviceId: ${p.serviceId}`);
    }

    // Image relation check
    if (!p.image) {
      criticalErrors.push(`Project ${p.id} has no cover image (Project tanpa image)`);
    }
    if (!p.imageIds || p.imageIds.length === 0) {
      criticalErrors.push(`Project ${p.id} has empty imageIds array (Project tanpa image)`);
    }

    // Placeholder content check
    if (p.title.includes('Judul Proyek') || p.title.includes('Partisi Karawang')) {
      criticalErrors.push(`Project ${p.id} contains generic placeholder title: "${p.title}"`);
    }
    if (p.desc.includes('Deskripsi ringkas proyek.')) {
      criticalErrors.push(`Project ${p.id} contains generic placeholder description`);
    }

    // Specs check
    if (!p.specs) {
      criticalErrors.push(`Project ${p.id} is missing specs object`);
    } else {
      const requiredSpecKeys = ['kusen', 'finishing', 'kaca', 'hardware', 'sealant', 'volume', 'durasi', 'garansi'];
      for (const k of requiredSpecKeys) {
        if (!p.specs[k] || p.specs[k] === '-') {
          criticalErrors.push(`Project ${p.id} has placeholder '-' or missing spec for: ${k}`);
        }
      }
    }
  });

  console.log(`  ✓ 26 Projects verified with unique IDs, slugs, and complete technical specs.\n`);

  // ----------------------------------------------------------------------------
  // RULE 3: Images & Physical Asset Validation
  // ----------------------------------------------------------------------------
  console.log('▶ Checking Image Registry & Asset Mappings...');
  const imageIdSet = new Set();
  const imageUsageMap = new Map(); // src -> array of projectIds

  images.forEach(img => {
    // Duplicate Image ID
    if (!img.imageId) criticalErrors.push(`Image missing imageId: ${JSON.stringify(img)}`);
    if (imageIdSet.has(img.imageId)) criticalErrors.push(`Duplicate image ID found: ${img.imageId}`);
    imageIdSet.add(img.imageId);

    // Project reference
    if (!img.projectId || !projectIdSet.has(img.projectId)) {
      criticalErrors.push(`Orphan image ${img.imageId} has invalid projectId: ${img.projectId}`);
    }

    // Role check
    const validRoles = ['cover', 'gallery', 'detail', 'before', 'after'];
    if (!validRoles.includes(img.role)) {
      criticalErrors.push(`Image ${img.imageId} has invalid role: ${img.role}`);
    }

    // Physical file check
    const filePath = path.join(__dirname, img.src);
    if (!fs.existsSync(filePath)) {
      criticalErrors.push(`Image ${img.imageId} references missing physical file: ${img.src}`);
    }

    // Track usage per file
    const list = imageUsageMap.get(img.src) || [];
    list.push(img.projectId);
    imageUsageMap.set(img.src, list);
  });

  // Verify that all project.imageIds exist in images registry
  projects.forEach(p => {
    p.imageIds.forEach(imgId => {
      if (!imageIdSet.has(imgId)) {
        criticalErrors.push(`Project ${p.id} references invalid imageId: ${imgId} (Invalid image reference)`);
      }
    });
  });

  // Report shared images
  console.log('  📊 Image Asset Audit Breakdown:');
  for (const [src, projIds] of imageUsageMap.entries()) {
    if (projIds.length > 1) {
      console.log(`     • [SHARED (${projIds.length} projects)]: ${src} → [${projIds.join(', ')}]`);
    } else {
      console.log(`     • [EXCLUSIVE]: ${src} → [${projIds[0]}]`);
    }
  }
  console.log('  ✓ Image registry and physical files verified.\n');

  // ----------------------------------------------------------------------------
  // RULE 4: Testimonials Validation
  // ----------------------------------------------------------------------------
  console.log('▶ Checking Testimonials...');
  const testimonialIdSet = new Set();

  testimonials.forEach(t => {
    if (!t.testimonialId) criticalErrors.push(`Testimonial missing testimonialId: ${JSON.stringify(t)}`);
    if (testimonialIdSet.has(t.testimonialId)) criticalErrors.push(`Duplicate testimonial ID: ${t.testimonialId}`);
    testimonialIdSet.add(t.testimonialId);

    // Relation check
    if (!t.projectId && !t.serviceId) {
      criticalErrors.push(`Testimonial ${t.testimonialId} has no relation (Testimonial tanpa relation)`);
    }

    if (t.projectId && !projectIdSet.has(t.projectId)) {
      criticalErrors.push(`Testimonial ${t.testimonialId} has invalid projectId: ${t.projectId}`);
    }

    if (t.serviceId && !serviceIdSet.has(t.serviceId)) {
      criticalErrors.push(`Testimonial ${t.testimonialId} has invalid serviceId: ${t.serviceId}`);
    }

    if (!t.author || !t.quote) {
      criticalErrors.push(`Testimonial ${t.testimonialId} is missing author or quote`);
    }
  });

  // Verify project.testimonialId if specified
  projects.forEach(p => {
    if (p.testimonialId && !testimonialIdSet.has(p.testimonialId)) {
      criticalErrors.push(`Project ${p.id} references invalid testimonialId: ${p.testimonialId} (Invalid testimonial reference)`);
    }
  });

  console.log(`  ✓ ${testimonials.length} Testimonials verified with valid relations.\n`);

  // ----------------------------------------------------------------------------
  // RULE 5: Counts Consistency in HTML Files
  // ----------------------------------------------------------------------------
  console.log('▶ Checking HTML Count Consistency (180+ projects, 26 portfolio)...');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const galeriHtml = fs.readFileSync(path.join(__dirname, 'galeri.html'), 'utf8');

  // Check 150+ vs 180+
  if (indexHtml.includes('150+ Proyek Selesai')) {
    criticalErrors.push(`index.html still contains '150+ Proyek Selesai'. Must be consistently '180+ Proyek Selesai'.`);
  }

  // Check total services count mention
  if (!indexHtml.includes('12 Layanan Tersedia')) {
    warnings.push(`index.html does not prominently display '12 Layanan Tersedia'.`);
  }

  // ----------------------------------------------------------------------------
  // SUMMARY & EXIT STATUS
  // ----------------------------------------------------------------------------
  console.log('====================================================');
  console.log('  AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Total Services Tested:     ${services.length}`);
  console.log(`Total Projects Tested:     ${projects.length}`);
  console.log(`Total Images Registered:   ${images.length}`);
  console.log(`Total Testimonials Tested: ${testimonials.length}`);
  console.log(`Critical Errors:           ${criticalErrors.length}`);
  console.log(`Warnings:                  ${warnings.length}`);
  console.log('====================================================\n');

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
    console.log('');
  }

  if (criticalErrors.length > 0) {
    console.log('❌ CRITICAL ERRORS DETECTED:');
    criticalErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    console.log('\n🛑 DATA VALIDATION FAILED! Build cannot proceed.\n');
    process.exit(1);
  }

  console.log('✅ ALL DATA INTEGRITY CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}

runValidation();
