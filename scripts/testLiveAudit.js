/**
 * Comprehensive Live Audit & System Verification
 * Sahabat Kaca Aluminium Karawang
 */

const BASE_URL = 'http://localhost:3000';

async function fetchRoute(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - start;
    return {
      path,
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get('content-type') || '',
      duration,
      text: await res.text()
    };
  } catch (err) {
    return {
      path,
      status: 0,
      ok: false,
      error: err.message,
      duration: Date.now() - start
    };
  }
}

async function runLiveAudit() {
  console.log('========================================================================');
  console.log('  🚀 COMPREHENSIVE LIVE AUDIT & ENDPOINT VERIFICATION                   ');
  console.log('  Target: ' + BASE_URL);
  console.log('========================================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    checks: []
  };

  function assert(testName, condition, detail = '') {
    if (condition) {
      results.passed++;
      results.checks.push({ name: testName, status: 'PASS', detail });
      console.log(`  ✅ [PASS] ${testName} ${detail ? '(' + detail + ')' : ''}`);
    } else {
      results.failed++;
      results.checks.push({ name: testName, status: 'FAIL', detail });
      console.error(`  ❌ [FAIL] ${testName} - ${detail}`);
    }
  }

  // 1. Core Web Pages Audit
  console.log('▶ [1/5] Auditing Core Web Pages...');
  const corePages = [
    { path: '/', titleCheck: 'Sahabat Kaca Aluminium' },
    { path: '/galeri', titleCheck: 'Galeri' },
    { path: '/hitung-estimasi', titleCheck: 'Estimasi' },
    { path: '/kontak', titleCheck: 'Kontak' },
    { path: '/layanan', titleCheck: 'Layanan' },
    { path: '/status-proyek', titleCheck: 'Status Proyek' },
    { path: '/testimoni', titleCheck: 'Testimoni' },
    { path: '/tentang-kami', titleCheck: 'Tentang' },
    { path: '/faq', titleCheck: 'FAQ' },
    { path: '/blog', titleCheck: 'Blog' }
  ];

  for (const page of corePages) {
    const r = await fetchRoute(page.path);
    assert(`Page ${page.path}`, r.status === 200, `HTTP ${r.status}, ${r.duration}ms`);
    assert(`Page ${page.path} Content`, r.text.includes('<html') && r.text.toLowerCase().includes(page.titleCheck.toLowerCase()), `Title keyword matched`);
  }

  // 2. Specialized Service & Landing Pages
  console.log('\n▶ [2/5] Auditing Service Landing Pages...');
  const servicePages = [
    '/layanan/kusen-aluminium',
    '/layanan/pintu-aluminium',
    '/layanan/pintu-kaca-tempered',
    '/layanan/jendela-aluminium',
    '/layanan/partisi-kaca-aluminium',
    '/layanan/kanopi-kaca-tempered',
    '/layanan/shower-kaca',
    '/layanan/fasad-acp',
    '/layanan/curtain-wall',
    '/layanan/railing-kaca',
    '/layanan/pintu-lipat-bifold',
    '/layanan/etalase-kaca'
  ];

  for (const sp of servicePages) {
    const r = await fetchRoute(sp);
    assert(`Service Page ${sp}`, r.status === 200, `HTTP ${r.status}, ${r.duration}ms`);
  }

  // 3. Service Worker & Essential Assets for Offline Mode
  console.log('\n▶ [3/5] Auditing Service Worker & Offline Cache Assets...');
  const essentialAssets = [
    { path: '/sw.js', checkHeader: 'Service-Worker-Allowed', expectedVal: '/' },
    { path: '/service-worker.js', checkHeader: 'Service-Worker-Allowed', expectedVal: '/' },
    { path: '/style.css', typeCheck: 'text/css' },
    { path: '/script.js', typeCheck: 'javascript' },
    { path: '/assets/logo.png', typeCheck: 'image/' },
    { path: '/pricingConfig.js', typeCheck: 'javascript' },
    { path: '/projectCatalog.js', typeCheck: 'javascript' },
    { path: '/masterData.js', typeCheck: 'javascript' }
  ];

  for (const asset of essentialAssets) {
    const r = await fetchRoute(asset.path);
    assert(`Asset ${asset.path}`, r.status === 200, `HTTP ${r.status}, ${r.contentType}`);
    if (asset.path === '/sw.js') {
      assert('Service Worker script contains cache logic', r.text.includes('CACHE_NAME') && r.text.includes('addEventListener'), 'Verified SW code');
    }
  }

  // 4. Critical Crawler & Search Engine Compliance
  console.log('\n▶ [4/5] Auditing SEO, Robots & Sitemap Routes...');
  const crawlerRoutes = [
    { path: '/sitemap.xml', check: '<urlset' },
    { path: '/robots.txt', check: 'User-agent:' },
    { path: '/ads.txt', check: 'google.com' }
  ];

  for (const cr of crawlerRoutes) {
    const r = await fetchRoute(cr.path);
    assert(`Crawler Route ${cr.path}`, r.status === 200, `HTTP ${r.status}`);
    assert(`Crawler Route ${cr.path} Format`, r.text.includes(cr.check), `Contains '${cr.check}'`);
  }

  // 5. REST API Endpoints Verification
  console.log('\n▶ [5/5] Auditing REST APIs...');
  
  // Articles API
  const articlesRes = await fetchRoute('/api/articles');
  assert('GET /api/articles', articlesRes.status === 200, `HTTP ${articlesRes.status}`);
  try {
    const artJson = JSON.parse(articlesRes.text);
    assert('Articles API schema', artJson.success === true && Array.isArray(artJson.articles), `${artJson.articles?.length || 0} articles found`);
  } catch (e) {
    assert('Articles API JSON parsing', false, e.message);
  }

  // Orders API
  const ordersRes = await fetchRoute('/api/orders');
  assert('GET /api/orders', ordersRes.status === 200, `HTTP ${ordersRes.status}`);
  try {
    const ordJson = JSON.parse(ordersRes.text);
    assert('Orders API schema', ordJson.success === true && Array.isArray(ordJson.orders), `${ordJson.orders?.length || 0} orders found`);
  } catch (e) {
    assert('Orders API JSON parsing', false, e.message);
  }

  // Feedbacks API
  const feedbackRes = await fetchRoute('/api/feedbacks');
  assert('GET /api/feedbacks', feedbackRes.status === 200, `HTTP ${feedbackRes.status}`);
  try {
    const fbJson = JSON.parse(feedbackRes.text);
    assert('Feedbacks API schema', fbJson.success === true && Array.isArray(fbJson.feedbacks), `${fbJson.feedbacks?.length || 0} reviews found`);
  } catch (e) {
    assert('Feedbacks API JSON parsing', false, e.message);
  }

  // Surveys API
  const surveysRes = await fetchRoute('/api/surveys');
  assert('GET /api/surveys', surveysRes.status === 200, `HTTP ${surveysRes.status}`);
  try {
    const srvJson = JSON.parse(surveysRes.text);
    assert('Surveys API schema', srvJson.success === true && Array.isArray(srvJson.surveys), `${srvJson.surveys?.length || 0} survey records found`);
  } catch (e) {
    assert('Surveys API JSON parsing', false, e.message);
  }

  // SEO Audit API
  const seoAuditRes = await fetchRoute('/api/seo/audit');
  assert('GET /api/seo/audit', seoAuditRes.status === 200, `HTTP ${seoAuditRes.status}`);
  try {
    const seoJson = JSON.parse(seoAuditRes.text);
    assert('SEO Audit API schema', seoJson.success === true && Array.isArray(seoJson.inspectedUrls), `${seoJson.inspectedUrls?.length || 0} inspected URLs, ${seoJson.totalSitemapUrls} in sitemap`);
  } catch (e) {
    assert('SEO Audit API JSON parsing', false, e.message);
  }

  console.log('\n========================================================================');
  console.log('  LIVE AUDIT RESULTS SUMMARY');
  console.log('========================================================================');
  console.log(`  Total Checks: ${results.passed + results.failed}`);
  console.log(`  Passed:       ${results.passed}`);
  console.log(`  Failed:       ${results.failed}`);
  console.log('========================================================================\n');

  if (results.failed > 0) {
    console.error('❌ Live audit encountered failures.');
    process.exit(1);
  } else {
    console.log('🎉 ALL LIVE AUDIT TESTS PASSED WITH 100% SUCCESS RATE!\n');
    process.exit(0);
  }
}

runLiveAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
