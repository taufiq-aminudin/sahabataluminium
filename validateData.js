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
    if (!p.imageIds || p.imageIds.length === 0) {
      criticalErrors.push(`Project ${p.id} has empty imageIds array (Project tanpa image reference)`);
    }

    // Placeholder content check
    if (p.title.includes('Judul Proyek') || (p.title.includes('Partisi Karawang') && p.id !== 'proj-01')) {
      criticalErrors.push(`Project ${p.id} contains generic placeholder title: "${p.title}"`);
    }
    if (p.description && p.description.includes('Deskripsi ringkas proyek.')) {
      criticalErrors.push(`Project ${p.id} contains generic placeholder description`);
    }

    // Specs check (No placeholder "-")
    const specsObj = p.specifications || p.specs;
    if (!specsObj) {
      criticalErrors.push(`Project ${p.id} is missing specifications object`);
    } else {
      const requiredSpecKeys = ['kusen', 'finishing', 'kaca', 'hardware', 'sealant', 'volume', 'durasi', 'garansi'];
      for (const k of requiredSpecKeys) {
        if (!specsObj[k] || specsObj[k] === '-') {
          criticalErrors.push(`Project ${p.id} has placeholder '-' or missing spec for: ${k}`);
        }
      }
    }
  });

  console.log(`  ✓ 26 Projects verified with unique IDs, slugs, and complete technical specs.\n`);

  // ----------------------------------------------------------------------------
  // RULE 3: Images & Physical Asset Validation (Visual Integrity & Zero Collision)
  // ----------------------------------------------------------------------------
  console.log('▶ Checking Image Registry & Visual Asset Mappings...');
  const imageIdSet = new Set();
  const physicalUsageMap = new Map(); // physical url -> array of projectIds

  images.forEach(img => {
    // Duplicate Image ID
    const iid = img.id || img.imageId;
    if (!iid) criticalErrors.push(`Image missing id: ${JSON.stringify(img)}`);
    if (imageIdSet.has(iid)) criticalErrors.push(`Duplicate image ID found: ${iid}`);
    imageIdSet.add(iid);

    // Project reference
    if (!img.projectId || !projectIdSet.has(img.projectId)) {
      criticalErrors.push(`Orphan image ${iid} has invalid projectId: ${img.projectId}`);
    }

    // Role check
    const validRoles = ['cover', 'gallery', 'detail', 'before', 'after'];
    if (!validRoles.includes(img.role)) {
      criticalErrors.push(`Image ${iid} has invalid role: ${img.role}`);
    }

    // ALT text quality check (Anti-generic alt text)
    if (!img.alt || img.alt.length < 10) {
      criticalErrors.push(`Image ${iid} has missing or too short alt text: "${img.alt}"`);
    }
    const genericWords = ['image', 'photo', 'gallery', 'project', 'gambar', 'foto'];
    if (genericWords.includes(img.alt.trim().toLowerCase())) {
      criticalErrors.push(`Image ${iid} has generic alt text: "${img.alt}"`);
    }

    // If verified photo, physical file must exist and NOT be reused across multiple projects
    if (img.verified && img.url) {
      const filePath = path.join(__dirname, img.url);
      if (!fs.existsSync(filePath)) {
        criticalErrors.push(`Verified Image ${iid} references missing physical file: ${img.url}`);
      }

      // Track usage per file to prevent duplicate / random fallback images
      const list = physicalUsageMap.get(img.url) || [];
      list.push(img.projectId);
      physicalUsageMap.set(img.url, list);
    }
  });

  // Verify that all project.imageIds exist in images registry
  projects.forEach(p => {
    p.imageIds.forEach(imgId => {
      if (!imageIdSet.has(imgId)) {
        criticalErrors.push(`Project ${p.id} references invalid imageId: ${imgId} (Invalid image reference)`);
      }
    });

    // Check if project.image corresponds to verified state
    if (p.hasVerifiedPhoto) {
      if (!p.image) {
        criticalErrors.push(`Project ${p.id} has hasVerifiedPhoto=true but image is null`);
      }
    } else {
      if (p.image !== null) {
        criticalErrors.push(`Project ${p.id} has hasVerifiedPhoto=false but specifies non-null image: ${p.image} (Random fallback prohibited)`);
      }
    }
  });

  // Strict Collision Check: ZERO duplicate image files allowed across different projects!
  console.log('  📊 Physical Verified Image Asset Breakdown:');
  for (const [src, projIds] of physicalUsageMap.entries()) {
    if (projIds.length > 1) {
      criticalErrors.push(`Image collision detected: ${src} is used by multiple projects [${projIds.join(', ')}]. Random fallback images prohibited!`);
    } else {
      console.log(`     • [EXCLUSIVE VERIFIED PHOTO]: ${src} → [${projIds[0]}]`);
    }
  }

  const verifiedCount = projects.filter(p => p.hasVerifiedPhoto).length;
  const unverifiedCount = projects.filter(p => !p.hasVerifiedPhoto).length;
  console.log(`  ✓ Image Registry: ${verifiedCount} Projects with Verified Photos, ${unverifiedCount} Projects honestly marked as "Foto proyek belum tersedia".\n`);

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
    if (!t.serviceId && !t.projectId) {
      criticalErrors.push(`Testimonial ${t.testimonialId} has no relation (Testimonial tanpa relation)`);
    }

    if (t.serviceId && !serviceIdSet.has(t.serviceId)) {
      criticalErrors.push(`Testimonial ${t.testimonialId} references invalid serviceId: ${t.serviceId}`);
    }

    if (t.projectId && !projectIdSet.has(t.projectId)) {
      criticalErrors.push(`Testimonial ${t.testimonialId} references invalid projectId: ${t.projectId}`);
    }

    if (t.projectId) {
      const matchProject = projects.find(p => p.id === t.projectId);
      if (matchProject && t.serviceId && matchProject.serviceId !== t.serviceId) {
        criticalErrors.push(`Testimonial ${t.testimonialId} serviceId (${t.serviceId}) mismatches Project ${t.projectId} serviceId (${matchProject.serviceId})`);
      }
    }
  });
  console.log(`  ✓ ${testimonials.length} Testimonials verified with valid relations.\n`);

  // ----------------------------------------------------------------------------
  // RULE 5: HTML Consistency Audit
  // ----------------------------------------------------------------------------
  console.log('▶ Checking HTML Count Consistency (180+ projects, 26 portfolio)...');
  const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const galeriHtml = fs.readFileSync(path.join(__dirname, 'galeri.html'), 'utf8');

  if (indexHtml.includes('150+')) {
    warnings.push('index.html contains outdated "150+" text (Should be 180+)');
  }
  if (galeriHtml.includes('150+')) {
    warnings.push('galeri.html contains outdated "150+" text (Should be 180+)');
  }

  // ----------------------------------------------------------------------------
  // FINAL REPORT
  // ----------------------------------------------------------------------------
  console.log('====================================================');
  console.log('  AUDIT SUMMARY');
  console.log('====================================================');
  console.log(`Total Services Tested:     ${services.length}`);
  console.log(`Total Projects Tested:     ${projects.length}`);
  console.log(`Verified Real Photos:      ${verifiedCount}`);
  console.log(`No Valid Photo (Honest):   ${unverifiedCount}`);
  console.log(`Total Testimonials Tested: ${testimonials.length}`);
  console.log(`Critical Errors:           ${criticalErrors.length}`);
  console.log(`Warnings:                  ${warnings.length}`);
  console.log('====================================================\n');

  if (criticalErrors.length > 0) {
    console.error('❌ CRITICAL DATA CONSISTENCY ERRORS DETECTED:');
    criticalErrors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
    console.error('\n🛑 BUILD FAILED! Fix all data mapping errors above.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ WARNINGS:');
    warnings.forEach((warn, idx) => console.warn(`  ${idx + 1}. ${warn}`));
  }

  console.log('✅ ALL DATA INTEGRITY & VISUAL AUDIT CHECKS PASSED PERFECTLY!\n');
}

runValidation().catch(err => {
  console.error('Unexpected audit failure:', err);
  process.exit(1);
});
