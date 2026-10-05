import fs from 'fs';
import { projects, services as catalogServices, images, testimonials, getProjectById, getServiceById, getTestimonialsByProjectId, getTestimonialsByServiceId } from './projectCatalog.js';
import { services as pricingServices } from './pricingConfig.js';

console.log('========================================================================');
console.log('  🧪 LIVE AUDIT SIMULATION: 10+ PROJECTS, SERVICES & RAB WORKFLOW       ');
console.log('========================================================================\n');

const testProjectIds = [
  'proj-11', // Railing Tangga
  'proj-26', // Railing Balkon
  'proj-07', // Kanopi Carport
  'proj-22', // Kanopi Teras Kolam
  'proj-02', // Pintu Tempered Ruko
  'proj-18', // Pintu Kaca Sliding Otomatis
  'proj-01', // Partisi Kaca Kantor KIIC
  'proj-05', // Sekat Partisi Dapur
  'proj-03', // Pintu Sliding Aluminium
  'proj-14', // Pintu Aluminium Swing
  'proj-08', // Jendela Casement
  'proj-09', // Shower Screen Frameless
  'proj-10', // Pintu Kaca Kamar Mandi
  'proj-23', // Etalase Kaca Toko Emas
  'proj-06', // Fasad ACP Seven
  'proj-17', // Curtain Wall Gedung
  'proj-04'  // Pintu Lipat Bifold
];

const auditResults = [];

testProjectIds.forEach(id => {
  const p = getProjectById(id);
  if (!p) {
    throw new Error(`Project ${id} not found!`);
  }

  const s = getServiceById(p.serviceId);
  if (!s) {
    throw new Error(`Service ${p.serviceId} not found for project ${id}!`);
  }

  // Check image
  const imgFile = p.image;
  const imgExists = fs.existsSync(imgFile);
  const isImageValid = imgExists && !imgFile.includes('placeholder');

  // Check specs
  const specs = p.specs;
  const hasValidSpecs = specs &&
    specs.kusen && specs.kusen !== '-' &&
    specs.finishing && specs.finishing !== '-' &&
    specs.kaca && specs.kaca !== '-' &&
    specs.hardware && specs.hardware !== '-' &&
    specs.sealant && specs.sealant !== '-' &&
    specs.volume && specs.volume !== '-' &&
    specs.durasi && specs.durasi !== '-' &&
    specs.garansi && specs.garansi !== '-';

  // Check testimonial
  const projectTesti = getTestimonialsByProjectId(p.id);
  const serviceTesti = getTestimonialsByServiceId(p.serviceId);
  const activeTesti = projectTesti.length > 0 ? projectTesti[0] : (serviceTesti.length > 0 ? serviceTesti[0] : null);
  const isTestiValid = activeTesti !== null;

  // Check RAB calculation link
  const rabLink = `/index.html#kalkulator-biaya?service=${p.calcServiceKey}`;
  const rabService = PRICING_CONFIG.services[p.calcServiceKey];
  const isRabValid = typeof rabService.formula === 'function';

  // Execute RAB formula to ensure calculations work flawlessly
  const rabSample = rabService.formula(s.unit === 'm²' ? 18 : (s.unit === 'm1' ? 12 : 2));

  const status = isImageValid && hasValidSpecs && isTestiValid && isRabValid ? 'PASSED' : 'FAILED';

  auditResults.push({
    projectId: p.id,
    title: p.title,
    image: p.image,
    service: s.name,
    testimonial: activeTesti ? activeTesti.author : 'None',
    detailStatus: hasValidSpecs ? 'Complete Non-Placeholder' : 'Placeholder Error',
    rabTarget: p.calcServiceKey,
    rabRate: rabSample.rate,
    status
  });
});

console.log('| PROJECT | IMAGE | SERVICE | TESTIMONIAL | DETAIL | RAB | STATUS |');
console.log('|---|---|---|---|---|---|---|');
auditResults.forEach(r => {
  console.log(`| ${r.projectId} | ${r.image} | ${r.service} | ${r.testimonial} | ${r.detailStatus} | ${r.rabTarget} (${r.rabRate}) | ${r.status} |`);
});

const failed = auditResults.filter(r => r.status !== 'PASSED');
if (failed.length > 0) {
  console.error('\n❌ SOME AUDIT TESTS FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ ALL 17 TESTED PROJECTS & SERVICES PASSED 100% AUDIT!\n');
}
