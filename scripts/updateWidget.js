import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const scriptPath = path.join(root, 'script.js');
let js = fs.readFileSync(scriptPath, 'utf8');

const startMarker = '(function initCostCalculatorWidget() {';
const endMarker = 'window.initCostCalculator = setupEventListeners;';

const startIdx = js.indexOf(startMarker);
const endIdx = js.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found in script.js!');
  process.exit(1);
}

const replacement = `(function initCostCalculatorWidget() {
  const ALIAS_MAP = {
    'railing': 'railing',
    'railing-kaca': 'railing',
    'railing-tangga': 'railing',
    'railing-balkon': 'railing',
    'glass-railing': 'railing',
    'railing-kaca-tempered': 'railing',
    'railing-stainless': 'railing',
    'railing_kaca': 'railing',
    'railing_tangga': 'railing',

    'kanopi': 'kanopi',
    'kanopi-kaca': 'kanopi',
    'kanopi-kaca-tempered': 'kanopi',
    'glass-canopy': 'kanopi',
    'canopy': 'kanopi',
    'kanopi_kaca': 'kanopi',

    'kusen': 'kusen',
    'kusen-aluminium': 'kusen',
    'aluminium-profile': 'kusen',
    'kusen_aluminium': 'kusen',

    'pintu': 'pintu',
    'pintu-aluminium': 'pintu',
    'aluminium-door': 'pintu',
    'pintu_aluminium': 'pintu',

    'jendela': 'jendela',
    'jendela-aluminium': 'jendela',
    'aluminium-window': 'jendela',
    'jendela_aluminium': 'jendela',
    'jendela-casement': 'jendela',
    'jendela-sliding': 'jendela',

    'pintu-tempered': 'pintu_tempered',
    'pintu_tempered': 'pintu_tempered',
    'tempered-door': 'pintu_tempered',
    'pintu-kaca': 'pintu_tempered',
    'pintu-kaca-tempered': 'pintu_tempered',
    'pintu_kaca_tempered': 'pintu_tempered',
    'pintu-frameless': 'pintu_tempered',

    'partisi': 'partisi',
    'partisi-kaca': 'partisi',
    'partisi-kaca-aluminium': 'partisi',
    'aluminium-partition': 'partisi',
    'partisi_kaca': 'partisi',

    'shower': 'shower',
    'shower-kaca': 'shower',
    'shower-glass': 'shower',
    'shower-screen': 'shower',
    'shower_kaca': 'shower',

    'bifold': 'bifold',
    'pintu-lipat': 'bifold',
    'pintu-bifold': 'bifold',
    'aluminium-bifold': 'bifold',
    'pintu_lipat': 'bifold',

    'etalase': 'etalase',
    'etalase-kaca': 'etalase',
    'aluminium-showcase': 'etalase',
    'etalase_kaca': 'etalase',

    'acp': 'acp',
    'fasad-acp': 'acp',
    'acp-facade': 'acp',
    'acp-aluminium': 'acp',
    'fasad_acp': 'acp',

    'curtain-wall': 'curtain_wall',
    'curtain_wall': 'curtain_wall',
    'curtainwall': 'curtain_wall',
    'fasad-kaca': 'curtain_wall'
  };

  function resolveServiceKey(val) {
    if (!val) return 'kusen';
    const str = String(val).toLowerCase().trim();
    if (SERVICE_CATALOG[str]) return str;
    if (ALIAS_MAP[str]) return ALIAS_MAP[str];
    const cleaned = str.replace(/[\\s_]+/g, '-');
    if (ALIAS_MAP[cleaned]) return ALIAS_MAP[cleaned];
    const rawUnderscore = cleaned.replace(/-/g, '_');
    if (SERVICE_CATALOG[rawUnderscore]) return rawUnderscore;
    for (const [k, v] of Object.entries(SERVICE_CATALOG)) {
      if (v.serviceId === str || v.serviceId === cleaned) return k;
      if (v.serviceName && v.serviceName.toLowerCase().includes(cleaned)) return k;
      if (v.label && v.label.toLowerCase().includes(cleaned)) return k;
    }
    return 'kusen';
  }

  // State management per product
  let currentServiceKey = 'kusen';
  let currentOptionId = 'standard';

  function formatIDRCurrency(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  }

  // Render option cards dynamically based on currentServiceKey
  function renderOptionCards(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const container = document.getElementById('calcOptionsContainer') || document.getElementById('calcOptionsGrid');
    const labelStep2 = document.getElementById('calcStep2Label') || document.getElementById('step2LabelTitle');
    const guideText = document.getElementById('qualityGuideText');

    if (labelStep2 && config.step2Label) {
      labelStep2.textContent = config.step2Label;
    }
    if (guideText && config.guideText) {
      guideText.textContent = config.guideText;
    }

    if (!container) return;

    let html = '';
    config.options.forEach(opt => {
      const isSelected = opt.id === currentOptionId;
      html += \`
        <div 
          class="quality-option-card \${isSelected ? 'active' : ''}" 
          id="cardOption_\${opt.id}" 
          role="radio" 
          aria-checked="\${isSelected ? 'true' : 'false'}" 
          tabindex="0" 
          onclick="window.selectCalcOption('\${opt.id}')"
          onkeydown="if(event.key==='Enter'||event.key===' '){ window.selectCalcOption('\${opt.id}'); event.preventDefault(); }"
        >
          <div class="quality-card-head">
            <div style="display:flex;align-items:center;">
              <span class="quality-radio-circle" aria-hidden="true"></span>
              <span class="quality-title">\${opt.name}</span>
            </div>
            <span class="quality-badge">\${opt.badge}</span>
          </div>
          <div class="quality-desc">
            \${opt.desc}
          </div>
          <div>
            <span class="quality-rate-pill">\${opt.rate}</span>
          </div>
        </div>
      \`;
    });

    container.innerHTML = html;
  }

  // Update presets for current service
  function updatePresetsForService(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const row = document.getElementById('qtyPresetRow');
    if (!row) return;

    let html = \`<span style="font-size:11.5px;color:#64748b;margin-right:2px;display:inline-flex;align-items:center;">Pilihan Cepat:</span>\`;
    config.presets.forEach(p => {
      html += \`<button type="button" class="qty-preset-chip" onclick="window.setCalcPreset(\${p})">\${p} \${config.unit}</button>\`;
    });
    row.innerHTML = html;
  }

  // Calculate and update rough estimate & full RAB breakdown
  function updateRoughEstimate() {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    const regionSelect = document.getElementById('calcRegion');
    if (!serviceSelect || !qtyInput) return;

    const serviceKey = resolveServiceKey(serviceSelect ? serviceSelect.value : currentServiceKey);
    currentServiceKey = serviceKey;
    if (serviceSelect && serviceSelect.value !== serviceKey && serviceSelect.querySelector('option[value="' + serviceKey + '"]')) {
      serviceSelect.value = serviceKey;
    }
    const config = SERVICE_CATALOG[serviceKey] || SERVICE_CATALOG.kusen;

    let activeOption = config.options.find(o => o.id === currentOptionId);
    if (!activeOption) {
      activeOption = config.options[0];
      currentOptionId = activeOption.id;
    }

    let qty = parseFloat(qtyInput.value) || 1;
    if (qty < 0.1) qty = 0.1;

    // Transport calculation based on selected region:
    const regionKey = (regionSelect && regionSelect.value) || 'karawang';
    const transportConfig = PRICING_CONFIG.benchmarks.transport[regionKey] || PRICING_CONFIG.benchmarks.transport.karawang;
    const regionBadge = document.getElementById('regionTransportBadge');
    if (regionBadge) {
      regionBadge.textContent = transportConfig.name;
    }

    // Material selling price raw calculation:
    const rawMin = Math.round(qty * activeOption.minRate);
    const rawMax = Math.round(qty * activeOption.maxRate);
    const rawTarget = Math.round(qty * (activeOption.targetRate || (activeOption.minRate + activeOption.maxRate) / 2));

    // Minimum order baseline protection for small jobs:
    const minOrderAlert = document.getElementById('calcMinOrderAlert');
    let effectiveMin = rawMin;
    let effectiveMax = rawMax;
    let effectiveTarget = rawTarget;

    if (config.minOrderValue && rawMin < config.minOrderValue) {
      effectiveMin = config.minOrderValue;
      effectiveMax = Math.max(rawMax, Math.round(config.minOrderValue * 1.18));
      effectiveTarget = Math.max(rawTarget, Math.round(config.minOrderValue * 1.08));

      if (minOrderAlert) {
        minOrderAlert.style.display = 'block';
        minOrderAlert.innerHTML = \`⚠️ <strong>Ketentuan Minimum Order Lapangan:</strong> \${formatIDRCurrency(config.minOrderValue)} (Pekerjaan volume kecil dikenakan batas minimum handling & mobilisasi teknisi presisi).\`;
      }
    } else {
      if (minOrderAlert) {
        minOrderAlert.style.display = 'none';
      }
    }

    // Update displays
    const estimateMain = document.getElementById('calcEstimateMain');
    const estimateSub = document.getElementById('calcEstimateSub');
    const summaryService = document.getElementById('calcSummaryService');
    const summaryQuality = document.getElementById('calcSummaryQuality');
    const summaryQualityLabel = document.getElementById('calcSummaryQualityLabel');
    const summaryQty = document.getElementById('calcSummaryQty');
    const summaryRate = document.getElementById('calcSummaryRate');
    const summaryLeadTime = document.getElementById('calcSummaryLeadTime');
    const summaryRegion = document.getElementById('calcSummaryRegion');
    const qtyUnitSuffix = document.getElementById('qtyUnitSuffix');
    const qtyUnitBadge = document.getElementById('qtyUnitBadge');

    if (estimateMain) estimateMain.textContent = \`\${formatIDRCurrency(effectiveMin)} – \${formatIDRCurrency(effectiveMax)}\`;
    if (estimateSub) estimateSub.textContent = \`Acuan tarif: \${activeOption.rate} × \${qty} \${config.unit}\`;
    if (summaryService) summaryService.textContent = config.serviceName || config.label;
    if (summaryQualityLabel && config.summaryLabel) summaryQualityLabel.textContent = config.summaryLabel;
    if (summaryQuality) summaryQuality.textContent = \`\${activeOption.name} (\${activeOption.badge})\`;
    if (summaryQty) summaryQty.textContent = \`\${qty} \${config.unitName || config.unit}\`;
    if (summaryRate) summaryRate.textContent = activeOption.rate;
    if (summaryLeadTime) summaryLeadTime.textContent = activeOption.leadTime;
    if (summaryRegion) summaryRegion.textContent = transportConfig.name;
    if (qtyUnitSuffix) qtyUnitSuffix.textContent = config.unit;
    if (qtyUnitBadge) qtyUnitBadge.textContent = \`Satuan: \${config.unitName || config.unit}\`;

    // Detailed RAB Itemized Breakdown calculation:
    const ratios = activeOption.rabRatios || {
      kaca: 0.32,
      struktur: 0.28,
      hardware: 0.08,
      sealant: 0.04,
      fabrikasi: 0.10,
      pasang: 0.10,
      transport: 0.03,
      margin: 0.05
    };

    // Calculate individual components for the transparent RAB table:
    const calcComp = (ratio, minTotal, maxTotal) => {
      const minVal = Math.round(minTotal * ratio);
      const maxVal = Math.round(maxTotal * ratio);
      return \`\${formatIDRCurrency(minVal)} – \${formatIDRCurrency(maxVal)}\`;
    };

    const aluminiumEl = document.getElementById('calcRabAluminium');
    const kacaEl = document.getElementById('calcRabKaca');
    const aksesorisEl = document.getElementById('calcRabAksesoris');
    const hardwareEl = document.getElementById('calcRabHardware');
    const prodLaborEl = document.getElementById('calcRabProdLabor');
    const installLaborEl = document.getElementById('calcRabInstallLabor');
    const transportEl = document.getElementById('calcRabTransport');
    const wasteEl = document.getElementById('calcRabWaste');
    const subtotalEl = document.getElementById('calcRabSubtotal');
    const marginEl = document.getElementById('calcRabMargin');
    const totalEl = document.getElementById('calcRabTotal');

    const rabDetailProduct = document.getElementById('rabDetailProduct');
    const rabDetailSpec = document.getElementById('rabDetailSpec');
    const rabDetailVolume = document.getElementById('rabDetailVolume');
    const rabDetailRegion = document.getElementById('rabDetailRegion');

    if (rabDetailProduct) rabDetailProduct.textContent = config.serviceName || config.label;
    if (rabDetailSpec) rabDetailSpec.textContent = \`\${activeOption.name} [\${activeOption.badge}]\`;
    if (rabDetailVolume) rabDetailVolume.textContent = \`\${qty} \${config.unitName || config.unit}\`;
    if (rabDetailRegion) rabDetailRegion.textContent = transportConfig.name;

    if (aluminiumEl) aluminiumEl.textContent = calcComp(ratios.struktur, effectiveMin, effectiveMax);
    if (kacaEl) kacaEl.textContent = calcComp(ratios.kaca, effectiveMin, effectiveMax);
    if (aksesorisEl) aksesorisEl.textContent = calcComp(ratios.sealant, effectiveMin, effectiveMax);
    if (hardwareEl) hardwareEl.textContent = calcComp(ratios.hardware, effectiveMin, effectiveMax);
    if (prodLaborEl) prodLaborEl.textContent = calcComp(ratios.fabrikasi, effectiveMin, effectiveMax);
    if (installLaborEl) installLaborEl.textContent = calcComp(ratios.pasang, effectiveMin, effectiveMax);
    if (transportEl) transportEl.textContent = calcComp(ratios.transport, effectiveMin, effectiveMax);
    
    // Cutting waste factor:
    const wasteRatio = config.wasteFactor || 0.06;
    if (wasteEl) wasteEl.textContent = calcComp(wasteRatio, effectiveMin, effectiveMax);

    // Subtotal (HPP + Operational without profit):
    const subtotalMin = Math.round(effectiveMin * (1 - ratios.margin));
    const subtotalMax = Math.round(effectiveMax * (1 - ratios.margin));
    if (subtotalEl) subtotalEl.textContent = \`\${formatIDRCurrency(subtotalMin)} – \${formatIDRCurrency(subtotalMax)}\`;

    // Margin & Risk reserve:
    if (marginEl) marginEl.textContent = calcComp(ratios.margin, effectiveMin, effectiveMax);

    // Final total:
    if (totalEl) totalEl.textContent = \`\${formatIDRCurrency(effectiveMin)} – \${formatIDRCurrency(effectiveMax)}\`;

    // Store state for consultation & actions
    window._lastRoughEstimate = {
      serviceKey: serviceKey,
      service: config.serviceName || config.label,
      category: config.category,
      priceModel: config.priceModel,
      optionId: activeOption.id,
      optionName: activeOption.name,
      badge: activeOption.badge,
      desc: activeOption.desc,
      qty: \`\${qty} \${config.unitName || config.unit}\`,
      rate: activeOption.rate,
      estimateRange: \`\${formatIDRCurrency(effectiveMin)} – \${formatIDRCurrency(effectiveMax)}\`,
      leadTime: activeOption.leadTime,
      formula: activeOption.formula,
      regionName: transportConfig.name,
      disclaimer: 'Harga indikatif / rough budget. Harga final menyesuaikan ukuran, desain, material, hardware, kondisi lokasi, tingkat kesulitan pemasangan, dan hasil survey.'
    };

    // Update Specification Comparison Table dynamically per service
    updateSpecComparisonTable(serviceKey);
  }

  // Update comparison table dynamically according to selected service
  function updateSpecComparisonTable(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const badge = document.getElementById('specContextServiceBadge');
    if (badge) {
      badge.textContent = config.serviceName || config.label;
    }

    const table = document.getElementById('specComparisonTable');
    if (!table || !config.options || config.options.length === 0) return;

    const optA = config.options[0];
    const optB = config.options.length > 1 ? config.options[1] : config.options[0];

    const colStd = document.getElementById('thColStandard');
    const colPrem = document.getElementById('thColPremium');
    const tableStdRate = document.getElementById('tableStdRate');
    const tablePremRate = document.getElementById('tablePremRate');
    const btnPickStd = document.getElementById('btnPickStd');
    const btnPickPrem = document.getElementById('btnPickPrem');

    if (colStd && optA) {
      const nameEl = colStd.querySelector('.th-tier-name');
      const pitchEl = colStd.querySelector('.th-tier-pitch');
      const badgeEl = colStd.querySelector('.th-tier-badge');
      if (nameEl) nameEl.textContent = optA.badge || optA.name;
      if (pitchEl) pitchEl.textContent = optA.name;
      if (badgeEl) badgeEl.textContent = 'Pilihan Populer';
      if (tableStdRate) tableStdRate.textContent = optA.rate;
      if (btnPickStd) {
        btnPickStd.onclick = () => window.selectCalcOption(optA.id);
        const isSel = currentOptionId === optA.id;
        btnPickStd.innerHTML = isSel ? '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>' : '<span class="pick-icon">👉</span> <span class="pick-text">Pilih Opsi Ini</span>';
      }
    }

    if (colPrem && optB) {
      const nameEl = colPrem.querySelector('.th-tier-name');
      const pitchEl = colPrem.querySelector('.th-tier-pitch');
      const badgeEl = colPrem.querySelector('.th-tier-badge');
      if (nameEl) nameEl.textContent = optB.badge || optB.name;
      if (pitchEl) pitchEl.textContent = optB.name;
      if (badgeEl) badgeEl.textContent = config.options.length > 1 ? 'Grade Spesifikasi Tinggi' : 'Pilihan Alternatif';
      if (tablePremRate) tablePremRate.textContent = optB.rate;
      if (btnPickPrem) {
        btnPickPrem.onclick = () => window.selectCalcOption(optB.id);
        const isSel = currentOptionId === optB.id;
        btnPickPrem.innerHTML = isSel ? '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>' : '<span class="pick-icon">⭐</span> <span class="pick-text">Pilih Opsi Ini</span>';
      }
    }

    const dynamicFeatureName = document.getElementById('specDynamicFeatureName');
    const dynamicStdVal = document.getElementById('specDynamicStdVal');
    const dynamicPremVal = document.getElementById('specDynamicPremVal');

    if (dynamicFeatureName) {
      dynamicFeatureName.textContent = \`Sistem & Material: \${config.serviceName || config.label}\`;
    }
    if (dynamicStdVal && optA) {
      dynamicStdVal.innerHTML = \`<strong>\${optA.name}</strong><div class="spec-note">\${optA.desc}</div>\`;
    }
    if (dynamicPremVal && optB) {
      dynamicPremVal.innerHTML = \`<strong>\${optB.name}</strong><div class="spec-note">\${optB.desc}</div>\`;
    }

    // Avoid displaying Kusen-specific technical rows for non-kusen services
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      const isKusen = validKey === 'kusen';
      for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = isKusen ? '' : 'none';
      }
    }
  }

  // Public methods
  window.selectCalcOption = function(optionId) {
    currentOptionId = optionId;
    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;

    // Update visual classes in options container
    config.options.forEach(opt => {
      const card = document.getElementById(\`cardOption_\${opt.id}\`);
      if (card) {
        if (opt.id === currentOptionId) {
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
        } else {
          card.classList.remove('active');
          card.setAttribute('aria-checked', 'false');
        }
      }
    });

    updateRoughEstimate();
  };

  // Legacy fallback for backward compatibility
  window.setCalcQuality = function(qualityKey) {
    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
    if (qualityKey === 'premium' && config.options.length > 1) {
      window.selectCalcOption(config.options[1].id);
    } else {
      window.selectCalcOption(config.options[0].id);
    }
  };

  window.adjustCalcQty = function(delta) {
    const input = document.getElementById('calcQuantityInput');
    if (!input) return;
    let val = (parseFloat(input.value) || 0) + delta;
    if (val < 1) val = 1;
    input.value = val;
    updateRoughEstimate();
  };

  window.setCalcPreset = function(val) {
    const input = document.getElementById('calcQuantityInput');
    if (!input) return;
    input.value = val;
    updateRoughEstimate();
  };

  window.updateCalcRegion = function() {
    updateRoughEstimate();
  };

  window.toggleRabBreakdown = function() {
    const box = document.getElementById('calcRabBreakdownBox');
    const btn = document.getElementById('btnToggleRabBreakdown');
    if (!box) return;
    const isHidden = box.style.display === 'none' || !box.style.display;
    box.style.display = isHidden ? 'block' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      const arrow = btn.querySelector('span:last-child');
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  };

  window.toggleDimHelper = function() {
    const box = document.getElementById('calcDimHelperBox');
    const btn = document.getElementById('btnToggleDimHelper');
    if (!box) return;
    const isHidden = box.style.display === 'none' || !box.style.display;
    box.style.display = isHidden ? 'block' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      const arrow = btn.querySelector('span:last-child');
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  };

  window.calculateFromDimensions = function() {
    const wInput = document.getElementById('dimHelperWidth');
    const hInput = document.getElementById('dimHelperHeight');
    const qInput = document.getElementById('dimHelperQty');
    const openingSelect = document.getElementById('dimHelperOpeningType');
    const noteEl = document.getElementById('dimHelperResultNote');
    const mainQtyInput = document.getElementById('calcQuantityInput');

    if (!wInput || !hInput || !qInput || !mainQtyInput) return;

    const wCm = parseFloat(wInput.value) || 0;
    const hCm = parseFloat(hInput.value) || 0;
    const units = parseInt(qInput.value, 10) || 1;

    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;

    let computedQty = 1;
    let noteText = '';

    if (config.unit === 'm²') {
      const areaPerUnit = (wCm / 100) * (hCm / 100);
      computedQty = Math.round(areaPerUnit * units * 10) / 10;
      noteText = \`Total Luas: \${computedQty} m² (\${units} unit × \${areaPerUnit.toFixed(2)} m²)\`;
    } else if (config.unit === 'm1') {
      const isDoor = openingSelect ? openingSelect.value === 'door' : true;
      let kelilingPerUnit = 0;
      if (isDoor) {
        kelilingPerUnit = (2 * hCm + wCm) / 100;
      } else {
        kelilingPerUnit = (2 * hCm + 2 * wCm) / 100;
      }
      computedQty = Math.round(kelilingPerUnit * units * 10) / 10;
      noteText = \`Total Panjang: \${computedQty} m1 (\${units} opening)\`;
    } else {
      computedQty = units;
      noteText = \`Total Unit: \${computedQty} \${config.unitName || config.unit}\`;
    }

    if (computedQty < 1 && (config.unit === 'unit' || config.unit === 'daun')) computedQty = 1;

    mainQtyInput.value = computedQty;
    if (noteEl) noteEl.textContent = noteText;

    updateRoughEstimate();
  };

  window.toggleSpecComparisonTable = function(show) {
    const modal = document.getElementById('specComparisonModal');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
    }
  };

  window.consultEstimateViaWa = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const message = \`*KONSULTASI HASIL ESTIMASI BIAYA WEB*\\n\` +
      \`*Sahabat Kaca Aluminium Karawang*\\n\` +
      \`────────────────────────────\\n\\n\` +
      \`Halo Admin, saya baru saja menghitung estimasi anggaran di kalkulator web:\\n\\n\` +
      \`🛠️ *Pekerjaan:* \${data.service}\\n\` +
      \`⭐ *Sistem / Spesifikasi:* \${data.optionName} (\${data.badge})\\n\` +
      \`📋 *Rincian Teknis:* \${data.desc}\\n\` +
      \`📏 *Kuantitas / Volume:* \${data.qty}\\n\` +
      \`🏷️ *Acuan Tarif:* \${data.rate}\\n\` +
      \`💰 *Rough Budget Estimate:* \${data.estimateRange}\\n\` +
      \`📍 *Wilayah Proyek:* \${data.regionName || 'Karawang'}\\n\` +
      \`⏱️ *Estimasi Waktu:* \${data.leadTime}\\n\\n\` +
      \`💡 *Catatan:* \${data.disclaimer}\\n\\n\` +
      \`Mohon info ketersediaan jadwal survey gratis ke lokasi saya untuk pengecekan dan pengukuran laser presisi. Terima kasih!\`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = \`https://wa.me/6289637371166?text=\${encodedMsg}\`;
    const localAppUrl = \`whatsapp://send?phone=6289637371166&text=\${encodedMsg}\`;

    if (typeof showWhatsAppPromptModal === 'function') {
      showWhatsAppPromptModal({
        title: 'Konsultasi Estimasi Biaya via WhatsApp',
        subtitle: 'Hasil perhitungan estimasi anggaran Anda telah dirangkum dalam format pesan siap kirim:',
        formattedMessage: message,
        waUrl,
        localAppUrl
      });
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  window.copyEstimateText = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const text = \`ESTIMASI ANGGARAN PROYEK (ROUGH BUDGET ESTIMATE)\\n\` +
      \`Sahabat Kaca Aluminium Karawang\\n\` +
      \`Web: https://sahabat-aluminium.my.id\\n\` +
      \`──────────────────────────────────────────────\\n\` +
      \`• Pekerjaan: \${data.service}\\n\` +
      \`• Price Model: \${data.priceModel}\\n\` +
      \`• Spesifikasi / Sistem: \${data.optionName} [\${data.badge}]\\n\` +
      \`• Rincian Teknis: \${data.desc}\\n\` +
      \`• Kuantitas / Volume: \${data.qty}\\n\` +
      \`• Acuan Tarif Satuan: \${data.rate}\\n\` +
      \`• Perkiraan Anggaran: \${data.estimateRange}\\n\` +
      \`• Wilayah Proyek: \${data.regionName || 'Karawang'}\\n\` +
      \`• Estimasi Waktu Kerja: \${data.leadTime}\\n\` +
      \`• Formula RAB: \${data.formula}\\n\` +
      \`• Biaya Survey Lokasi: Rp 0 (100% GRATIS se-Karawang & Bekasi)\\n\` +
      \`──────────────────────────────────────────────\\n\` +
      \`*Catatan: \${data.disclaimer}\`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('calcCopyBtn');
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ Tersalin!';
          btn.style.background = '#0d9488';
          btn.style.borderColor = '#0d9488';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 2500);
        }
      }).catch(() => {
        prompt('Salin rincian estimasi di bawah ini:', text);
      });
    } else {
      prompt('Salin rincian estimasi di bawah ini:', text);
    }
  };

  window.printEstimateSheet = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(\`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Rough Budget Estimate - Sahabat Kaca Aluminium</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 36px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 22px; font-weight: 800; color: #072e3b; margin: 0; }
          .badge { background: #f0fdfa; color: #0d9488; border: 1.5px solid #99f6e4; padding: 5px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table td, .table th { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 13.5px; }
          .table th { background: #f8fafc; text-align: left; width: 32%; color: #334155; font-weight: 700; }
          .total-box { background: #f0fdfa; border: 2px solid #0d9488; border-radius: 12px; padding: 18px 22px; margin: 25px 0; }
          .total-label { font-size: 12.5px; color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .total-val { font-size: 26px; font-weight: 800; color: #0f766e; margin-top: 4px; }
          .footer { margin-top: 36px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print { .no-print { display: none !important; } body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Sahabat Kaca Aluminium</h1>
            <div style="font-size:13px;color:#64748b;margin-top:2px;">Spesialis Kaca Tempered, Kusen & Fasad Aluminium Karawang - Bekasi</div>
          </div>
          <div class="badge">Rough Budget Estimate</div>
        </div>
        <table class="table">
          <tr><th>Pekerjaan</th><td><strong>\${data.service}</strong></td></tr>
          <tr><th>Price Model & Kategori</th><td><strong>\${data.priceModel}</strong> (\${data.category.toUpperCase()})</td></tr>
          <tr><th>Sistem / Spesifikasi</th><td><strong>\${data.optionName}</strong> (\${data.badge})</td></tr>
          <tr><th>Rincian Material & Teknis</th><td>\${data.desc}</td></tr>
          <tr><th>Volume Dihitung</th><td><strong>\${data.qty}</strong></td></tr>
          <tr><th>Acuan Tarif Satuan</th><td>\${data.rate}</td></tr>
          <tr><th>Wilayah Proyek</th><td>\${data.regionName || 'Karawang'}</td></tr>
          <tr><th>Estimasi Waktu Kerja</th><td>\${data.leadTime}</td></tr>
          <tr><th>Formula RAB</th><td>\${data.formula}</td></tr>
          <tr><th>Biaya Survey & Pengukuran Laser</th><td><strong style="color:#0d9488;">Rp 0 (100% GRATIS)</strong></td></tr>
        </table>
        <div class="total-box">
          <div class="total-label">Perkiraan Estimasi Anggaran Proyek:</div>
          <div class="total-val">\${data.estimateRange}</div>
          <div style="font-size:12px;color:#0f766e;margin-top:6px;">*\${data.disclaimer}</div>
        </div>
        <div class="footer">
          <div>Dokumen rincian estimasi resmi web: https://sahabat-aluminium.my.id</div>
          <div>Konsultasi & Kunci Jadwal Survey: WhatsApp <strong>0896-3737-1166</strong> • Karawang, Jawa Barat</div>
        </div>
        <div class="no-print" style="margin-top:24px;text-align:center;">
          <button onclick="window.print()" style="padding:10px 22px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;">🖨️ Cetak / Simpan PDF Sekarang</button>
        </div>
      </body>
      </html>
    \`);
    printWindow.document.close();
  };

  function setupEventListeners() {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    const regionSelect = document.getElementById('calcRegion');

    if (serviceSelect && !serviceSelect._hasListener) {
      serviceSelect._hasListener = true;
      serviceSelect.addEventListener('change', () => {
        const newKey = resolveServiceKey(serviceSelect.value);
        currentServiceKey = newKey;
        serviceSelect.value = newKey;
        const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
        currentOptionId = config.options[0].id;
        if (qtyInput) {
          qtyInput.value = config.defaultQty || 1;
        }
        updatePresetsForService(currentServiceKey);
        renderOptionCards(currentServiceKey);
        updateRoughEstimate();
      });
    }

    if (qtyInput && !qtyInput._hasListener) {
      qtyInput._hasListener = true;
      qtyInput.addEventListener('input', updateRoughEstimate);
      qtyInput.addEventListener('change', updateRoughEstimate);
    }

    if (regionSelect && !regionSelect._hasListener) {
      regionSelect._hasListener = true;
      regionSelect.addEventListener('change', updateRoughEstimate);
    }

    // Initial render & pre-selection detection
    let sParam = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      sParam = urlParams.get('service') || urlParams.get('calc') || urlParams.get('id') || urlParams.get('layanan');

      if (!sParam && window.location.hash.includes('service=')) {
        const hashPart = window.location.hash.split('?')[1] || window.location.hash.split('&')[1];
        if (hashPart) {
          const hashParams = new URLSearchParams(hashPart);
          sParam = hashParams.get('service');
        }
      }

      if (!sParam && typeof sessionStorage !== 'undefined') {
        sParam = sessionStorage.getItem('ska_rab_preselect');
        sessionStorage.removeItem('ska_rab_preselect');
      }
    } catch (e) {}

    if (sParam) {
      currentServiceKey = resolveServiceKey(sParam);
      if (serviceSelect) {
        serviceSelect.value = currentServiceKey;
      }
      setTimeout(() => {
        const calcSection = document.getElementById('kalkulator-biaya');
        if (calcSection) {
          calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else if (serviceSelect && serviceSelect.value) {
      currentServiceKey = resolveServiceKey(serviceSelect.value);
    } else {
      currentServiceKey = 'kusen';
    }

    const initConfig = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
    currentOptionId = initConfig.options[0].id;
    if (qtyInput) {
      qtyInput.value = initConfig.defaultQty || 1;
    }

    updatePresetsForService(currentServiceKey);
    renderOptionCards(currentServiceKey);
    updateRoughEstimate();
  }
\n  `;

js = js.slice(0, startIdx) + replacement + js.slice(endIdx);
fs.writeFileSync(scriptPath, js, 'utf8');
console.log('Successfully updated calculator widget in script.js');
