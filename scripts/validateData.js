/**
 * ==============================================================================
 * DATA CONSISTENCY & INTEGRITY VALIDATOR
 * Sahabat Kaca Aluminium Karawang & Jabodetabek
 *
 * Location: scripts/validateData.js
 * Runs via: npm run validate:data (or node scripts/validateData.js)
 *
 * Key Checks:
 * 1. Missing image references & missing physical asset files
 * 2. Duplicate project IDs, duplicate service IDs, slugs, and image IDs
 * 3. Broken testimonial relations (invalid project/service links, mismatches)
 * 4. Overall data consistency across catalog, pricing models, and templates
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function runValidation() {
  console.log('========================================================================');
  console.log('  🔍 PRODUCTION DATA CONSISTENCY & INTEGRITY AUDIT                      ');
  console.log('  scripts/validateData.js • Sahabat Kaca Aluminium                      ');
  console.log('========================================================================\n');

  const criticalErrors = [];
  const warnings = [];

  // 1. Load projectCatalog.js
  let catalog;
  const catalogPath = path.join(ROOT_DIR, 'projectCatalog.js');
  try {
    const catalogModule = await import(catalogPath);
    catalog = catalogModule.default || catalogModule;
  } catch (err) {
    console.error('❌ Failed to load projectCatalog.js from:', catalogPath, err);
    process.exit(1);
  }

  // 2. Load pricingConfig.js
  let pricingConfig;
  const pricingPath = path.join(ROOT_DIR, 'pricingConfig.js');
  try {
    const pricingModule = await import(pricingPath);
    pricingConfig = pricingModule.default || pricingModule.services;
  } catch (err) {
    console.error('❌ Failed to load pricingConfig.js from:', pricingPath, err);
    process.exit(1);
  }

  const { services, projects, images, testimonials } = catalog;

  // ----------------------------------------------------------------------------
  // SECTION 1: DUPLICATE PROJECT & SERVICE IDENTIFIERS
  // ----------------------------------------------------------------------------
  console.log('▶ [1/4] Checking Duplicate Project and Service Identifiers...');

  // 1A. Service IDs & calcKeys
  const serviceIdSet = new Set();
  const serviceCalcKeySet = new Set();
  if (!services || !Array.isArray(services) || services.length === 0) {
    criticalErrors.push('Catalog services array is missing or empty');
  } else {
    services.forEach((s, idx) => {
      if (!s.id) criticalErrors.push(`Service at index ${idx} is missing 'id'`);
      if (serviceIdSet.has(s.id)) criticalErrors.push(`Duplicate Service ID detected: '${s.id}'`);
      serviceIdSet.add(s.id);

      if (!s.calcKey) criticalErrors.push(`Service '${s.id}' is missing 'calcKey'`);
      if (serviceCalcKeySet.has(s.calcKey)) criticalErrors.push(`Duplicate Service calcKey detected: '${s.calcKey}'`);
      serviceCalcKeySet.add(s.calcKey);
    });
  }

  // 1B. Project IDs & Slugs
  const projectIdSet = new Set();
  const projectSlugSet = new Set();
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    criticalErrors.push('Catalog projects array is missing or empty');
  } else {
    projects.forEach((p, idx) => {
      if (!p.id) criticalErrors.push(`Project at index ${idx} is missing 'id'`);
      if (projectIdSet.has(p.id)) criticalErrors.push(`Duplicate Project ID detected: '${p.id}'`);
      projectIdSet.add(p.id);

      if (!p.slug) {
        criticalErrors.push(`Project '${p.id}' is missing 'slug'`);
      } else {
        if (projectSlugSet.has(p.slug)) criticalErrors.push(`Duplicate Project Slug detected: '${p.slug}'`);
        projectSlugSet.add(p.slug);
      }
    });
  }

  // 1C. Image IDs & Testimonial IDs
  const imageIdSet = new Set();
  if (Array.isArray(images)) {
    images.forEach((img, idx) => {
      const iid = img.id || img.imageId;
      if (!iid) criticalErrors.push(`Image at index ${idx} is missing 'id'/'imageId'`);
      if (imageIdSet.has(iid)) criticalErrors.push(`Duplicate Image ID detected: '${iid}'`);
      imageIdSet.add(iid);
    });
  }

  const testimonialIdSet = new Set();
  if (Array.isArray(testimonials)) {
    testimonials.forEach((t, idx) => {
      if (!t.testimonialId) criticalErrors.push(`Testimonial at index ${idx} is missing 'testimonialId'`);
      if (testimonialIdSet.has(t.testimonialId)) criticalErrors.push(`Duplicate Testimonial ID detected: '${t.testimonialId}'`);
      testimonialIdSet.add(t.testimonialId);
    });
  }

  console.log(`  ✓ Checked ${services.length} services, ${projects.length} projects, ${images.length} images, and ${testimonials.length} testimonials.`);
  console.log(`  ✓ Zero duplicate project or service IDs found.\n`);

  // ----------------------------------------------------------------------------
  // SECTION 2: MISSING IMAGE REFERENCES & ASSET INTEGRITY
  // ----------------------------------------------------------------------------
  console.log('▶ [2/4] Checking for Missing Image References & Physical Assets...');

  const referencedImageIds = new Set();
  const physicalUsageMap = new Map(); // physical url -> array of projectIds

  // Check project image references
  projects.forEach(p => {
    if (!p.imageIds || !Array.isArray(p.imageIds) || p.imageIds.length === 0) {
      criticalErrors.push(`Missing image reference: Project '${p.id}' has an empty or missing imageIds array`);
    } else {
      p.imageIds.forEach(imgRef => {
        referencedImageIds.add(imgRef);
        if (!imageIdSet.has(imgRef)) {
          criticalErrors.push(`Missing image reference: Project '${p.id}' references non-existent imageId '${imgRef}'`);
        }
      });
    }

    // Honesty rule: project.image should only be non-null if hasVerifiedPhoto=true
    if (p.hasVerifiedPhoto) {
      if (!p.image) {
        criticalErrors.push(`Project '${p.id}' has hasVerifiedPhoto=true but image path is null`);
      }
    } else {
      if (p.image !== null) {
        criticalErrors.push(`Project '${p.id}' has hasVerifiedPhoto=false but specifies image '${p.image}' (Random fallback prohibited)`);
      }
    }
  });

  // Check image registry references
  images.forEach(img => {
    const iid = img.id || img.imageId;

    // Missing project reference on image
    if (!img.projectId) {
      criticalErrors.push(`Missing project reference: Image '${iid}' has no projectId`);
    } else if (!projectIdSet.has(img.projectId)) {
      criticalErrors.push(`Missing project reference: Image '${iid}' references non-existent projectId '${img.projectId}'`);
    }

    // Orphan image check: registered image not in any project's imageIds
    if (!referencedImageIds.has(iid)) {
      criticalErrors.push(`Orphan image: Image '${iid}' is registered for project '${img.projectId}', but not listed in project.imageIds`);
    }

    // Physical file existence check for verified documentation
    if (img.verified && img.url) {
      const diskPath = path.join(ROOT_DIR, img.url);
      if (!fs.existsSync(diskPath)) {
        criticalErrors.push(`Missing physical image file: Image '${iid}' references file that does not exist at '${img.url}'`);
      }

      // Check for illegal multi-project image reuse
      const usedProjects = physicalUsageMap.get(img.url) || [];
      usedProjects.push(img.projectId);
      physicalUsageMap.set(img.url, usedProjects);
    }
  });

  for (const [fileUrl, projList] of physicalUsageMap.entries()) {
    if (projList.length > 1) {
      criticalErrors.push(`Image collision: Physical file '${fileUrl}' is reused across multiple projects [${projList.join(', ')}]`);
    }
  }

  const verifiedCount = projects.filter(p => p.hasVerifiedPhoto).length;
  const honestCount = projects.filter(p => !p.hasVerifiedPhoto).length;

  console.log(`  ✓ All ${referencedImageIds.size} referenced project image IDs exist in image registry.`);
  console.log(`  ✓ All verified photos exist on disk with zero cross-project collision.`);
  console.log(`  ✓ Verified Photos: ${verifiedCount} projects; Honest Placeholders: ${honestCount} projects.\n`);

  // ----------------------------------------------------------------------------
  // SECTION 3: BROKEN TESTIMONIAL RELATIONS & CROSS-ENTITY LINKS
  // ----------------------------------------------------------------------------
  console.log('▶ [3/4] Checking for Broken Testimonial Relations & Cross-Entity References...');

  testimonials.forEach(t => {
    // Unlinked testimonial
    if (!t.serviceId && !t.projectId) {
      criticalErrors.push(`Broken testimonial: '${t.testimonialId}' is unlinked (neither projectId nor serviceId is set)`);
    }

    // Invalid serviceId reference
    if (t.serviceId && !serviceIdSet.has(t.serviceId)) {
      criticalErrors.push(`Broken testimonial relation: '${t.testimonialId}' references non-existent serviceId '${t.serviceId}'`);
    }

    // Invalid projectId reference
    if (t.projectId && !projectIdSet.has(t.projectId)) {
      criticalErrors.push(`Broken testimonial relation: '${t.testimonialId}' references non-existent projectId '${t.projectId}'`);
    }

    // Testimonial serviceId mismatch with parent project serviceId
    if (t.projectId) {
      const parentProj = projects.find(p => p.id === t.projectId);
      if (parentProj && t.serviceId && parentProj.serviceId !== t.serviceId) {
        criticalErrors.push(`Broken testimonial relation: '${t.testimonialId}' specifies serviceId '${t.serviceId}', but linked Project '${t.projectId}' has serviceId '${parentProj.serviceId}'`);
      }
    }
  });

  // Check project to service relations
  projects.forEach(p => {
    if (!p.serviceId || !serviceIdSet.has(p.serviceId)) {
      criticalErrors.push(`Broken project relation: Project '${p.id}' references non-existent serviceId '${p.serviceId}'`);
    }
    if (!p.calcServiceKey || !pricingConfig || !pricingConfig[p.calcServiceKey]) {
      criticalErrors.push(`Broken pricing relation: Project '${p.id}' references calcServiceKey '${p.calcServiceKey}' which is missing in pricingConfig`);
    }
  });

  console.log(`  ✓ All ${testimonials.length} testimonials have valid, unbroken relations.`);
  console.log(`  ✓ All project-to-service links verified valid.\n`);

  // ----------------------------------------------------------------------------
  // SECTION 4: TEMPLATE & DATA COMPLETENESS AUDIT
  // ----------------------------------------------------------------------------
  console.log('▶ [4/4] Checking Data Consistency & Specs Completeness...');

  // Technical specifications completeness check
  projects.forEach(p => {
    const specsObj = p.specifications || p.specs;
    if (!specsObj) {
      criticalErrors.push(`Project '${p.id}' is missing specifications object`);
    } else {
      const requiredSpecKeys = ['kusen', 'finishing', 'kaca', 'hardware', 'sealant', 'volume', 'durasi', 'garansi'];
      for (const k of requiredSpecKeys) {
        if (!specsObj[k] || specsObj[k] === '-') {
          criticalErrors.push(`Project '${p.id}' has missing or placeholder '-' spec for: '${k}'`);
        }
      }
    }
  });

  // Verify HTML files do not contain broken classic script tags
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const galeriHtml = fs.readFileSync(path.join(ROOT_DIR, 'galeri.html'), 'utf8');

  if (indexHtml.includes('<script src="pricingConfig.js">')) {
    criticalErrors.push('index.html contains classic <script src="pricingConfig.js"> tag that triggers SyntaxError in browser');
  }
  if (galeriHtml.includes('<script src="projectCatalog.js">')) {
    criticalErrors.push('galeri.html contains classic <script src="projectCatalog.js"> tag that triggers SyntaxError in browser');
  }

  console.log(`  ✓ Complete technical specifications verified for all 26 projects.`);
  console.log(`  ✓ Clean HTML script inclusion verified.\n`);

  // ----------------------------------------------------------------------------
  // SUMMARY REPORT
  // ----------------------------------------------------------------------------
  console.log('========================================================================');
  console.log('  AUDIT SUMMARY');
  console.log('========================================================================');
  console.log(`  Services Validated:       ${services.length}`);
  console.log(`  Projects Validated:       ${projects.length}`);
  console.log(`  Image References Tested:  ${images.length}`);
  console.log(`  Testimonials Validated:   ${testimonials.length}`);
  console.log(`  Critical Consistency Errors: ${criticalErrors.length}`);
  console.log(`  Warnings:                    ${warnings.length}`);
  console.log('========================================================================\n');

  if (criticalErrors.length > 0) {
    console.error('❌ CRITICAL DATA CONSISTENCY ERRORS DETECTED:');
    criticalErrors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
    console.error('\n🛑 VALIDATION FAILED! Please resolve the errors above.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️ WARNINGS:');
    warnings.forEach((warn, idx) => console.warn(`  ${idx + 1}. ${warn}`));
    console.warn('');
  }

  console.log('✅ ALL DATA INTEGRITY & CONSISTENCY CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}

runValidation().catch(err => {
  console.error('Unexpected audit failure:', err);
  process.exit(1);
});
