/**
 * ==============================================================================
 * PRICING CONFIGURATION & MASTER PRICE ENGINE (SINGLE SOURCE OF TRUTH)
 * Sahabat Kaca Aluminium Karawang & Jabodetabek
 *
 * Updated with Karawang 2026 Market-Calibrated Pricing (Standard & Premium)
 * All service items have:
 * serviceId, serviceName, unit, priceMin, priceMax,
 * standardPriceMin, standardPriceMax, premiumPriceMin, premiumPriceMax,
 * specification, calculationType
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. MASTER PRICE RANGE CONSTANTS PER SERVICE (KARAWANG 2026 MARKET-CALIBRATED)
// ------------------------------------------------------------------------------

const KANOPI_PRICE_RANGES = {
  hollow_tempered_8: {
    name: 'Rangka Hollow Galvanis 100×50 + Tempered 8 mm',
    min: 1450000,
    max: 1750000,
    target: 1600000,
    unit: 'm²'
  },
  hollow_tempered_10: {
    name: 'Rangka Hollow 100×50×2 mm + Tempered Clear 10 mm (Target Carport Standar)',
    min: 1550000,
    max: 1950000,
    target: 1750000,
    unit: 'm²'
  },
  wf_tempered_12: {
    name: 'Rangka Baja WF 150 / Double Hollow + Tempered 12 mm',
    min: 1750000,
    max: 2200000,
    target: 1950000,
    unit: 'm²'
  },
  stainless_tempered: {
    name: 'Rangka Stainless Steel SUS304 + Tempered 10/12 mm',
    min: 2800000,
    max: 3800000,
    target: 3250000,
    unit: 'm²'
  },
  laminated_canopy: {
    name: 'Struktur Rangka + Tempered Laminated 5+5 mm PVB',
    min: 1850000,
    max: 2400000,
    target: 2100000,
    unit: 'm²'
  }
};

const RAILING_PRICE_RANGES = {
  uchannel_ss304: {
    name: 'Sistem U-Channel Base Tanam + Tempered 12 mm',
    min: 2200000,
    max: 2700000,
    target: 2450000,
    unit: 'm1'
  },
  spigot_ss304: {
    name: 'Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm',
    min: 2400000,
    max: 3000000,
    target: 2700000,
    unit: 'm1'
  },
  handrail_ss304: {
    name: 'Tiang Baluster + Handrail SUS304 + Tempered 10 mm',
    min: 2400000,
    max: 3000000,
    target: 2700000,
    unit: 'm1'
  },
  railing_tangga: {
    name: 'Railing Tangga Custom Void + Tempered 10/12 mm',
    min: 2500000,
    max: 3200000,
    target: 2850000,
    unit: 'm1'
  }
};

const PARTISI_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI 3 Inch (Dacon/Inkalum + Kaca 5 mm)',
    min: 650000,
    max: 850000,
    target: 750000,
    unit: 'm²'
  },
  premium: {
    name: 'Premium Grade 4 Inch (Alexindo/Forta + Kaca 6/8 mm)',
    min: 850000,
    max: 1200000,
    target: 1025000,
    unit: 'm²'
  }
};

const JENDELA_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI (Casement 3" + Kaca 5 mm)',
    min: 850000,
    max: 1150000,
    target: 1000000,
    unit: 'unit'
  },
  premium: {
    name: 'Premium Grade (Casement 4" Alexindo + Kaca Panasap/Dekkson)',
    min: 1200000,
    max: 1800000,
    target: 1500000,
    unit: 'unit'
  }
};

const PINTU_PRICE_RANGES = {
  swing: {
    name: 'Pintu Aluminium Swing 1 Daun Modern Komplit',
    min: 1450000,
    max: 1850000,
    target: 1650000,
    unit: 'unit'
  },
  sliding: {
    name: 'Pintu Aluminium Sliding Geser (Silent Roller Rail)',
    min: 3200000,
    max: 4500000,
    target: 3850000,
    unit: 'unit'
  },
  folding: {
    name: 'Pintu Aluminium Folding / Lipat (per unit opening)',
    min: 7500000,
    max: 10500000,
    target: 9000000,
    unit: 'unit'
  }
};

const SHOWER_PRICE_RANGES = {
  framed: {
    name: 'Framed Shower Screen (Bingkai Aluminium Keliling)',
    min: 2000000,
    max: 3000000,
    target: 2500000,
    unit: 'unit'
  },
  semi_frameless: {
    name: 'Semi Frameless Shower Screen (U-Channel + Header Track)',
    min: 3300000,
    max: 4500000,
    target: 3900000,
    unit: 'unit'
  },
  frameless: {
    name: 'Full Frameless Shower Screen (Tempered 10 mm SUS304)',
    min: 4200000,
    max: 5500000,
    target: 4800000,
    unit: 'unit'
  }
};

const KUSEN_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI 3 Inch (Dacon / Inkalum)',
    min: 85000,
    max: 130000,
    target: 105000,
    unit: 'm1'
  },
  premium: {
    name: 'Premium Grade 4 Inch (Alexindo / Alcomexindo)',
    min: 135000,
    max: 175000,
    target: 155000,
    unit: 'm1'
  }
};

const PINTU_TEMPERED_PRICE_RANGES = {
  single_10: {
    name: 'Single Leaf Tempered 10 mm + Mesin BTS 84',
    min: 2900000,
    max: 3600000,
    target: 3250000,
    unit: 'unit'
  },
  single_12: {
    name: 'Single Leaf Tempered 12 mm + Floor Hinge Dorma BTS 75V',
    min: 3900000,
    max: 5200000,
    target: 4550000,
    unit: 'unit'
  },
  double_12: {
    name: 'Double Leaf (Kupu Tarung) Tempered 12 mm + Dorma',
    min: 6500000,
    max: 8500000,
    target: 7500000,
    unit: 'unit'
  }
};

const BIFOLD_PRICE_RANGES = {
  standard: {
    name: 'Bifold Standard Track (Inkalum 1.1 mm)',
    min: 7500000,
    max: 8750000,
    target: 8125000,
    unit: 'daun'
  },
  premium: {
    name: 'Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm / 250 kg)',
    min: 8750000,
    max: 10500000,
    target: 9500000,
    unit: 'daun'
  }
};

const ETALASE_PRICE_RANGES = {
  standard: {
    name: 'Etalase Counter Toko Standar 1.5 Meter',
    min: 1250000,
    max: 1650000,
    target: 1450000,
    unit: 'unit'
  },
  premium: {
    name: 'Display Showcase Premium Full Kaca Tempered + LED',
    min: 2400000,
    max: 3500000,
    target: 2950000,
    unit: 'unit'
  }
};

const ACP_PRICE_RANGES = {
  interior_pe: {
    name: 'ACP Interior PE 0.21 mm (Seven / Marks)',
    min: 550000,
    max: 750000,
    target: 650000,
    unit: 'm²'
  },
  exterior_pvdf: {
    name: 'ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca',
    min: 750000,
    max: 1050000,
    target: 900000,
    unit: 'm²'
  },
  heavy_duty_pvdf: {
    name: 'ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)',
    min: 1100000,
    max: 1600000,
    target: 1350000,
    unit: 'm²'
  }
};

const CURTAIN_WALL_PRICE_RANGES = {
  stick_panasap: {
    name: 'Stick System Back Mullion + Panasap 6 mm Tinted',
    min: 1800000,
    max: 2400000,
    target: 2100000,
    unit: 'm²'
  },
  stick_tempered8: {
    name: 'Stick System + Tempered Reflective / Stopsol 8 mm',
    min: 2200000,
    max: 3000000,
    target: 2600000,
    unit: 'm²'
  },
  semi_unitized: {
    name: 'Semi-Unitized High-Rise + Low-E 10 mm Tempered',
    min: 3000000,
    max: 4200000,
    target: 3600000,
    unit: 'm²'
  }
};

// ------------------------------------------------------------------------------
// 2. REGIONAL BENCHMARK CONSTANTS (TRANSPORT & SURVEY) - Karawang 2026 Mobilization
// ------------------------------------------------------------------------------

const REGIONAL_TRANSPORT_ESTIMATES = {
  karawang: { name: 'Karawang (Basis Workshop: Karawang Barat/Klari/Telukjambe/KIIC)', min: 350000, max: 750000, default: 500000 },
  cikampek: { name: 'Cikampek & Jatisari (Karawang Timur)', min: 500000, max: 900000, default: 700000 },
  cikarang: { name: 'Cikarang (Lippo, Jababeka, Delta Mas, MM2100)', min: 750000, max: 1250000, default: 1000000 },
  bekasi: { name: 'Bekasi (Kota & Kabupaten, Tambun, Cibitung)', min: 1000000, max: 1750000, default: 1350000 },
  jakarta: { name: 'DKI Jakarta (Pusat, Selatan, Timur, Barat, Utara)', min: 1500000, max: 2500000, default: 2000000 },
  depok_tangerang: { name: 'Depok, Tangerang & Tangerang Selatan', min: 1750000, max: 3000000, default: 2250000 },
  bogor: { name: 'Bogor (Kota & Kabupaten)', min: 1750000, max: 3000000, default: 2250000 }
};

const WASTE_FACTORS = {
  glass: 0.05,
  aluminium: 0.08,
  steel: 0.06
};

// ------------------------------------------------------------------------------
// Helper: Formula Calculation Engine Generator
// ------------------------------------------------------------------------------
function createPriceCalculator(serviceId, config) {
  return function formula(quantity, optionId, options = {}) {
    const qty = typeof quantity === 'number' ? quantity : parseFloat(quantity) || 1;
    const effectiveQty = qty < 0.1 ? 0.1 : qty;

    const selectedOption = config.options.find(o => o.id === optionId) || config.options[0];
    const regionKey = options.region || 'karawang';
    const transportInfo = REGIONAL_TRANSPORT_ESTIMATES[regionKey] || REGIONAL_TRANSPORT_ESTIMATES.karawang;

    const rawMin = Math.round(effectiveQty * selectedOption.minRate);
    const rawMax = Math.round(effectiveQty * selectedOption.maxRate);
    const rawTarget = Math.round(effectiveQty * (selectedOption.targetRate || (selectedOption.minRate + selectedOption.maxRate) / 2));

    const minOrder = config.minOrderValue || 0;
    const isMinOrderApplied = rawMin < minOrder;

    const finalMin = isMinOrderApplied ? minOrder : rawMin;
    const finalMax = isMinOrderApplied ? Math.max(rawMax, Math.round(minOrder * 1.18)) : rawMax;
    const finalTarget = isMinOrderApplied ? Math.max(rawTarget, Math.round(minOrder * 1.08)) : rawTarget;

    const ratios = selectedOption.rabRatios || {
      kaca: 0.32,
      struktur: 0.28,
      hardware: 0.08,
      sealant: 0.04,
      fabrikasi: 0.10,
      pasang: 0.10,
      transport: 0.03,
      margin: 0.05
    };

    const breakdown = {
      kaca: Math.round(finalTarget * ratios.kaca),
      struktur: Math.round(finalTarget * ratios.struktur),
      hardware: Math.round(finalTarget * ratios.hardware),
      sealant: Math.round(finalTarget * ratios.sealant),
      fabrikasi: Math.round(finalTarget * ratios.fabrikasi),
      pemasangan: Math.round(finalTarget * ratios.pasang),
      transport: Math.round(finalTarget * ratios.transport),
      waste: Math.round(finalTarget * (config.wasteFactor || 0.06)),
      margin: Math.round(finalTarget * ratios.margin),
      subtotal: Math.round(finalTarget * (1 - ratios.margin)),
      total: finalTarget
    };

    return {
      id: serviceId,
      serviceId,
      serviceLabel: config.label,
      serviceName: config.serviceName,
      category: config.category,
      priceModel: config.priceModel,
      unit: config.unit,
      unitName: config.unitName,
      calculationType: config.calculationType,
      quantity: effectiveQty,
      optionId: selectedOption.id,
      optionName: selectedOption.name,
      badge: selectedOption.badge,
      rate: selectedOption.rate,
      minRate: selectedOption.minRate,
      maxRate: selectedOption.maxRate,
      targetRate: selectedOption.targetRate,
      minTotal: finalMin,
      maxTotal: finalMax,
      targetTotal: finalTarget,
      isMinOrderApplied,
      minOrderValue: minOrder,
      region: transportInfo.name,
      wasteFactor: config.wasteFactor,
      rabBreakdown: breakdown,
      formulaExplanation: selectedOption.formula
    };
  };
}

// ------------------------------------------------------------------------------
// 3. EXPORTED 'services' OBJECT (12 SERVICES WITH COMPLETE MASTER MAPPING)
// ------------------------------------------------------------------------------

const services = {
  kanopi: {
    id: 'kanopi',
    serviceId: 'kanopi',
    serviceName: 'Kanopi Kaca Tempered',
    label: 'Kanopi Kaca Tempered Carport / Teras',
    category: 'glass_canopy',
    priceModel: 'glass_canopy',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    calculationType: 'm2',
    priceMin: 1450000,
    priceMax: 3800000,
    standardPriceMin: 1450000,
    standardPriceMax: 1950000,
    premiumPriceMin: 2800000,
    premiumPriceMax: 3800000,
    specification: 'Rangka Hollow Galvanis 100×50 tebal 2mm + Kaca Tempered Clear 8mm/10mm SNI Asahimas & Sealant Dowsil 795',
    minOrderValue: 5000000,
    wasteFactor: WASTE_FACTORS.glass,
    priceRanges: KANOPI_PRICE_RANGES,
    summaryLabel: 'Rangka & Kaca:',
    step2Label: '2. Pilih Sistem Struktur & Jenis Kaca',
    guideText: 'PILIH SISTEM STRUKTUR • PILIH JENIS KACA',
    defaultQty: 18,
    presets: [12, 18, 24, 30, 45],
    options: [
      {
        id: 'hollow_tempered_8',
        name: KANOPI_PRICE_RANGES.hollow_tempered_8.name,
        badge: 'Hollow 100×50 + Temp 8mm',
        desc: 'Kaca Tempered Clear 8mm SNI Asahimas, rangka pipa hollow galvanis anti-karat 100×50×2 mm, cat dasar epoxy primer & finish polyurethane, bantalan karet EPDM & sealant Dowsil 795.',
        minRate: KANOPI_PRICE_RANGES.hollow_tempered_8.min,
        maxRate: KANOPI_PRICE_RANGES.hollow_tempered_8.max,
        targetRate: KANOPI_PRICE_RANGES.hollow_tempered_8.target,
        rate: 'Rp 1.450.000 – Rp 1.750.000 / m²',
        leadTime: '5–7 Hari Kerja',
        formula: '(Luas m² × Tarif) + Rangka Hollow 100×50 + Tempered 8mm + Bracket Dynabolt + Sealant Dowsil + Fabrikasi + Pasang',
        rabRatios: { kaca: 0.34, struktur: 0.22, hardware: 0.06, sealant: 0.03, fabrikasi: 0.11, pasang: 0.13, transport: 0.04, margin: 0.07 }
      },
      {
        id: 'hollow_tempered_10',
        name: KANOPI_PRICE_RANGES.hollow_tempered_10.name,
        badge: 'Target Standar Carport',
        desc: 'Kaca Tempered Clear 10mm SNI Asahimas, struktur hollow galvanis 100×50×2 mm bentang rigid, plat anchor baja, sealant weatherseal netral struktural Dowsil 795.',
        minRate: KANOPI_PRICE_RANGES.hollow_tempered_10.min,
        maxRate: KANOPI_PRICE_RANGES.hollow_tempered_10.max,
        targetRate: KANOPI_PRICE_RANGES.hollow_tempered_10.target,
        rate: 'Rp 1.550.000 – Rp 1.950.000 / m²',
        leadTime: '6–8 Hari Kerja',
        formula: 'Luas m² × Tarif + Kaca Tempered 10mm + Rangka Hollow 100×50×2mm + Sealant Struktural + Pasang',
        rabRatios: { kaca: 0.36, struktur: 0.20, hardware: 0.06, sealant: 0.03, fabrikasi: 0.11, pasang: 0.14, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'wf_tempered_12',
        name: KANOPI_PRICE_RANGES.wf_tempered_12.name,
        badge: 'Heavy Duty WF 150',
        desc: 'Kaca Tempered Clear 12mm tebal anti lendut, struktur balok baja profil WF 150 / double hollow 100×50 heavy tanpa tiang tengah, plat sambung anchor baja tebal 10mm.',
        minRate: KANOPI_PRICE_RANGES.wf_tempered_12.min,
        maxRate: KANOPI_PRICE_RANGES.wf_tempered_12.max,
        targetRate: KANOPI_PRICE_RANGES.wf_tempered_12.target,
        rate: 'Rp 1.750.000 – Rp 2.200.000 / m²',
        leadTime: '7–10 Hari Kerja',
        formula: '(Luas m² × Tarif) + Baja WF 150 + Tempered 12mm + Plat Anchor Baja + Sealant Weatherseal + Alat Berat/Crane + Pasang',
        rabRatios: { kaca: 0.38, struktur: 0.23, hardware: 0.06, sealant: 0.03, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'stainless_tempered',
        name: KANOPI_PRICE_RANGES.stainless_tempered.name,
        badge: 'Stainless SUS304 Anti Karat',
        desc: 'Struktur pipa kotak/bulat Stainless Steel SUS304 kilap/hairline anti karat seumur hidup, kaca Tempered 10mm/12mm, bracket spider clamp SUS304 presisi.',
        minRate: KANOPI_PRICE_RANGES.stainless_tempered.min,
        maxRate: KANOPI_PRICE_RANGES.stainless_tempered.max,
        targetRate: KANOPI_PRICE_RANGES.stainless_tempered.target,
        rate: 'Rp 2.800.000 – Rp 3.800.000 / m²',
        leadTime: '10–14 Hari Kerja',
        formula: '(Luas m² × Tarif) + Rangka Stainless SUS304 + Tempered 10/12mm + Spider Clamp SUS304 + Polishing + Sealant + Pasang',
        rabRatios: { kaca: 0.30, struktur: 0.32, hardware: 0.08, sealant: 0.03, fabrikasi: 0.10, pasang: 0.09, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'laminated_canopy',
        name: KANOPI_PRICE_RANGES.laminated_canopy.name,
        badge: 'Maximum Safety PVB',
        desc: 'Kaca Tempered Laminated 5+5mm (kaca tetap utuh terikat interlayer PVB 0.76mm jika retak benturan ekstrem), struktur rangka baja hollow galvanis tebal.',
        minRate: KANOPI_PRICE_RANGES.laminated_canopy.min,
        maxRate: KANOPI_PRICE_RANGES.laminated_canopy.max,
        targetRate: KANOPI_PRICE_RANGES.laminated_canopy.target,
        rate: 'Rp 1.850.000 – Rp 2.400.000 / m²',
        leadTime: '8–12 Hari Kerja',
        formula: '(Luas m² × Tarif) + Rangka Baja + Tempered Laminated 5+5 PVB + Sealant Struktural + Scaffolding + Pasang',
        rabRatios: { kaca: 0.44, struktur: 0.20, hardware: 0.05, sealant: 0.03, fabrikasi: 0.10, pasang: 0.10, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  railing: {
    id: 'railing',
    serviceId: 'railing',
    serviceName: 'Railing Kaca Tempered',
    label: 'Railing Tangga & Balkon Kaca Tempered',
    category: 'glass_railing',
    priceModel: 'glass_railing',
    unit: 'm1',
    unitName: 'Meter Lari (m1)',
    calculationType: 'm1',
    priceMin: 2200000,
    priceMax: 3200000,
    standardPriceMin: 2200000,
    standardPriceMax: 2700000,
    premiumPriceMin: 2400000,
    premiumPriceMax: 3200000,
    specification: 'Sistem U-Channel Base Tanam / Spigot Clamp Solid SUS304 + Tempered 10mm/12mm SNI Asahimas',
    minOrderValue: 5000000,
    wasteFactor: WASTE_FACTORS.glass,
    priceRanges: RAILING_PRICE_RANGES,
    summaryLabel: 'Sistem Railing:',
    step2Label: '2. Pilih Sistem Railing Kaca',
    guideText: 'PILIH SISTEM RAILING (U-Channel, Spigot, Handrail SS304)',
    defaultQty: 18,
    presets: [4, 8, 12, 18, 24],
    options: [
      {
        id: 'uchannel_ss304',
        name: RAILING_PRICE_RANGES.uchannel_ss304.name,
        badge: 'U-Channel SS304 Tanam (Standard)',
        desc: 'Kaca Tempered 12mm SNI Asahimas, base shoe profil aluminium/stainless SUS304 tanam rata lantai marmer/keramik dengan chemical anchor Fischer/Hilti, cover cladding samping estetik.',
        minRate: RAILING_PRICE_RANGES.uchannel_ss304.min,
        maxRate: RAILING_PRICE_RANGES.uchannel_ss304.max,
        targetRate: RAILING_PRICE_RANGES.uchannel_ss304.target,
        rate: 'Rp 2.200.000 – Rp 2.700.000 / m1',
        leadTime: '6–9 Hari Kerja',
        formula: 'Panjang m1 × Tarif + Base U-Channel + Kaca Tempered 12mm + Chemical Anchor + Sealant EPDM + Pasang Presisi',
        rabRatios: { kaca: 0.35, struktur: 0.24, hardware: 0.08, sealant: 0.03, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'spigot_ss304',
        name: RAILING_PRICE_RANGES.spigot_ss304.name,
        badge: 'Spigot SS304 Solid 2 Titik/m (Premium)',
        desc: 'Kaca Tempered 12mm SNI, dudukan spigot bulat/kotak cor Stainless SUS304 padat (2 unit per meter), dynabolt M12 beton, tampilan minimalis murni tanpa tiang atas.',
        minRate: RAILING_PRICE_RANGES.spigot_ss304.min,
        maxRate: RAILING_PRICE_RANGES.spigot_ss304.max,
        targetRate: RAILING_PRICE_RANGES.spigot_ss304.target,
        rate: 'Rp 2.400.000 – Rp 3.000.000 / m1',
        leadTime: '5–8 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Kaca Tempered 12mm + 2 Spigot SUS304 Solid/m + Dynabolt Stainless + Setting Laser + Pasang',
        rabRatios: { kaca: 0.32, struktur: 0.26, hardware: 0.12, sealant: 0.02, fabrikasi: 0.09, pasang: 0.10, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'handrail_ss304',
        name: RAILING_PRICE_RANGES.handrail_ss304.name,
        badge: 'Handrail SS304 Safety',
        desc: 'Kaca Tempered 10mm SNI, tiang baluster pipa bulat/kotak SUS304, handrail pegangan stainless 2" atau kayu kamper/jati atas kaca, sangat ramah anak & lansia.',
        minRate: RAILING_PRICE_RANGES.handrail_ss304.min,
        maxRate: RAILING_PRICE_RANGES.handrail_ss304.max,
        targetRate: RAILING_PRICE_RANGES.handrail_ss304.target,
        rate: 'Rp 2.400.000 – Rp 3.000.000 / m1',
        leadTime: '5–8 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Kaca Tempered 10mm + Tiang Baluster SUS304 + Handrail Pipa 2" + Bracket Klem Kaca + Pasang',
        rabRatios: { kaca: 0.30, struktur: 0.28, hardware: 0.10, sealant: 0.02, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'railing_tangga',
        name: RAILING_PRICE_RANGES.railing_tangga.name,
        badge: 'Railing Tangga Presisi Bevel',
        desc: 'Kaca Tempered 10mm/12mm custom bevel mengikuti sudut derajat kemiringan trap anak tangga (akurasi laser), pin standoff void / tiang miring SUS304.',
        minRate: RAILING_PRICE_RANGES.railing_tangga.min,
        maxRate: RAILING_PRICE_RANGES.railing_tangga.max,
        targetRate: RAILING_PRICE_RANGES.railing_tangga.target,
        rate: 'Rp 2.500.000 – Rp 3.200.000 / m1',
        leadTime: '7–12 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Mal Triplek Sudut Trap + Kaca Tempered Custom Bevel + Hardware Tangga SUS304 + Pasang Khusus',
        rabRatios: { kaca: 0.33, struktur: 0.25, hardware: 0.09, sealant: 0.03, fabrikasi: 0.11, pasang: 0.10, transport: 0.03, margin: 0.06 }
      }
    ]
  },

  partisi: {
    id: 'partisi',
    serviceId: 'partisi',
    serviceName: 'Partisi Kaca Aluminium',
    label: 'Partisi Kaca Kantor & Sekat Ruangan Aluminium',
    category: 'aluminium',
    priceModel: 'aluminium_partition',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    calculationType: 'm2',
    priceMin: 650000,
    priceMax: 1200000,
    standardPriceMin: 650000,
    standardPriceMax: 850000,
    premiumPriceMin: 850000,
    premiumPriceMax: 1200000,
    specification: 'Standard SNI 3" (Dacon/Inkalum + Kaca 5 mm) vs Premium Grade 4" (Alexindo/Forta + Kaca 6/8 mm)',
    minOrderValue: 3500000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: PARTISI_PRICE_RANGES,
    summaryLabel: 'Grade Partisi:',
    step2Label: '2. Pilih Grade Profil & Kaca Partisi',
    guideText: 'Standard SNI 3" vs Premium Heavy Duty 4"',
    defaultQty: 16.8,
    presets: [8, 12, 16.8, 25, 40],
    options: [
      {
        id: 'standard',
        name: PARTISI_PRICE_RANGES.standard.name,
        badge: 'Standard SNI 3"',
        desc: 'Kusen aluminium 3" tebal 0.9–1.0mm (Dacon/Inkalum), kaca clear polos 5mm SNI, karet EPDM lis keliling, sealant netral kedap suara kantor.',
        minRate: PARTISI_PRICE_RANGES.standard.min,
        maxRate: PARTISI_PRICE_RANGES.standard.max,
        targetRate: PARTISI_PRICE_RANGES.standard.target,
        rate: 'Rp 1.250.000 – Rp 1.650.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Luas m² × Tarif + Kusen 3" + Kaca 5mm + Karet EPDM + Sealant + Sekrup Fisher + Jasa Pasang Presisi',
        rabRatios: { kaca: 0.28, struktur: 0.30, hardware: 0.06, sealant: 0.05, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'premium',
        name: PARTISI_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" Heavy',
        desc: 'Kusen aluminium 4" tebal 1.1–1.3mm profil tebal rigid (Alexindo/Forta), kaca clear/riben 6mm / tempered 8mm, peredam suara kantor akustik lebih hening.',
        minRate: PARTISI_PRICE_RANGES.premium.min,
        maxRate: PARTISI_PRICE_RANGES.premium.max,
        targetRate: PARTISI_PRICE_RANGES.premium.target,
        rate: 'Rp 2.400.000 – Rp 3.500.000 / unit',
        leadTime: '4–7 Hari Kerja',
        formula: 'Luas m² × Tarif + Kusen 4" Alexindo + Kaca 6mm/8mm + Sealant Akustik + Bracket Baja + Pasang Presisi',
        rabRatios: { kaca: 0.32, struktur: 0.28, hardware: 0.06, sealant: 0.05, fabrikasi: 0.10, pasang: 0.10, transport: 0.03, margin: 0.06 }
      }
    ]
  },

  jendela: {
    id: 'jendela',
    serviceId: 'jendela',
    serviceName: 'Jendela Aluminium',
    label: 'Jendela Aluminium (Casement / Sliding)',
    category: 'aluminium',
    priceModel: 'aluminium_window',
    unit: 'unit',
    unitName: 'Unit Jendela',
    calculationType: 'unit',
    priceMin: 850000,
    priceMax: 1800000,
    standardPriceMin: 850000,
    standardPriceMax: 1150000,
    premiumPriceMin: 1200000,
    premiumPriceMax: 1800000,
    specification: 'Standard SNI Casement 3" + Kaca 5mm vs Premium Alexindo 4" + Kaca Panasap/Dekkson',
    minOrderValue: 1500000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: JENDELA_PRICE_RANGES,
    summaryLabel: 'Grade Jendela:',
    step2Label: '2. Pilih Grade Profil & Aksesoris Jendela',
    guideText: 'Standard SNI vs Premium Alexindo Heavy Duty',
    defaultQty: 10,
    presets: [3, 6, 10, 15, 20],
    options: [
      {
        id: 'standard',
        name: JENDELA_PRICE_RANGES.standard.name,
        badge: 'Inkalum / Dacon 3"',
        desc: 'Profil kusen & daun 3" tebal 1.0mm, kaca clear 5mm SNI, friction stay stainless 12", kunci rambuncis zinc alloy, weatherstrip bulu & karet kedap air hujan.',
        minRate: JENDELA_PRICE_RANGES.standard.min,
        maxRate: JENDELA_PRICE_RANGES.standard.max,
        targetRate: JENDELA_PRICE_RANGES.standard.target,
        rate: 'Rp 2.125.000 – Rp 2.625.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Jumlah unit × Tarif + Kusen + Daun Casement + Kaca 5mm + Friction Stay + Rambuncis + Pasang',
        rabRatios: { kaca: 0.25, struktur: 0.34, hardware: 0.10, sealant: 0.04, fabrikasi: 0.10, pasang: 0.08, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'premium',
        name: JENDELA_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" SUS304',
        desc: 'Profil heavy duty 4" tebal 1.2mm Alexindo, kaca Panasap tolak panas / Euro Grey 5mm, friction stay heavy duty Dekkson SUS304, multi-point lock lever hening.',
        minRate: JENDELA_PRICE_RANGES.premium.min,
        maxRate: JENDELA_PRICE_RANGES.premium.max,
        targetRate: JENDELA_PRICE_RANGES.premium.target,
        rate: 'Rp 2.750.000 – Rp 3.500.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Jumlah unit × Tarif + Kusen 4" Alexindo + Kaca Panasap + Multi-point Lock Dekkson + Weatherseal + Pasang',
        rabRatios: { kaca: 0.28, struktur: 0.33, hardware: 0.12, sealant: 0.04, fabrikasi: 0.08, pasang: 0.07, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  pintu: {
    id: 'pintu',
    serviceId: 'pintu',
    serviceName: 'Pintu Aluminium',
    label: 'Pintu Aluminium (Swing / Sliding / Folding Modern)',
    category: 'aluminium',
    priceModel: 'aluminium_door',
    unit: 'unit',
    unitName: 'Unit Pintu',
    calculationType: 'unit',
    priceMin: 1450000,
    priceMax: 10500000,
    standardPriceMin: 1450000,
    standardPriceMax: 4500000,
    premiumPriceMin: 7500000,
    premiumPriceMax: 10500000,
    specification: 'Pintu Aluminium Swing 1 Daun Modern Komplit vs Sliding Silent Roller vs Folding Multi-Leaf',
    minOrderValue: 2500000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: PINTU_PRICE_RANGES,
    summaryLabel: 'Tipe Bukaan:',
    step2Label: '2. Pilih Tipe Bukaan Pintu Aluminium',
    guideText: 'PILIH SISTEM PINTU: Swing, Sliding, atau Folding',
    defaultQty: 1,
    presets: [1, 2, 4, 6, 8],
    options: [
      {
        id: 'swing',
        name: PINTU_PRICE_RANGES.swing.name,
        badge: 'Swing 1 Daun Modern (Standard)',
        desc: '1 Unit pintu swing buka dorong/tarik lengkap kusen 3"/4", panel kaca clear 5mm / spandrel dobel aluminium, engsel tebal stainless 4", lockset mortise lock lever handle awet.',
        minRate: PINTU_PRICE_RANGES.swing.min,
        maxRate: PINTU_PRICE_RANGES.swing.max,
        targetRate: PINTU_PRICE_RANGES.swing.target,
        rate: 'Rp 1.450.000 – Rp 1.850.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kusen 3" + Daun Pintu + Kaca 5mm / Spandrel + Mortise Lockset + Engsel Stainless + Jasa Pasang',
        rabRatios: { kaca: 0.18, struktur: 0.40, hardware: 0.15, sealant: 0.03, fabrikasi: 0.10, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'sliding',
        name: PINTU_PRICE_RANGES.sliding.name,
        badge: 'Sliding Silent Roller (Premium)',
        desc: '1 Unit pintu geser hemat ruang, rel gantung / rel bawah aluminium presisi, roda bearing roller hening anti-anjlok, kunci hook lock tanam, stopper peredam benturan.',
        minRate: PINTU_PRICE_RANGES.sliding.min,
        maxRate: PINTU_PRICE_RANGES.sliding.max,
        targetRate: PINTU_PRICE_RANGES.sliding.target,
        rate: 'Rp 3.200.000 – Rp 4.500.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Kusen Pintu + Daun Sliding + Rel Atas Bawah + Roller Bearing + Kunci Hook Lock Tanam + Sealant + Pasang',
        rabRatios: { kaca: 0.16, struktur: 0.38, hardware: 0.18, sealant: 0.03, fabrikasi: 0.10, pasang: 0.07, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'folding',
        name: PINTU_PRICE_RANGES.folding.name,
        badge: 'Folding Multi-Leaf (Heavy)',
        desc: 'Sistem pintu lipat bukaan penuh teras/taman, rel gantung heavy duty, engsel kupu-kupu lipat, flush bolt tanam pengunci atas bawah antar daun.',
        minRate: PINTU_PRICE_RANGES.folding.min,
        maxRate: PINTU_PRICE_RANGES.folding.max,
        targetRate: PINTU_PRICE_RANGES.folding.target,
        rate: 'Rp 7.500.000 – Rp 10.500.000 / unit',
        leadTime: '5–8 Hari Kerja',
        formula: 'Daun Pintu Lipat + Rel Gantung Heavy + Engsel Lipat SUS304 + Flush Bolt + Kaca 5mm + Pasang Presisi',
        rabRatios: { kaca: 0.20, struktur: 0.36, hardware: 0.18, sealant: 0.03, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      }
    ]
  },

  shower: {
    id: 'shower',
    serviceId: 'shower',
    serviceName: 'Shower Kaca',
    label: 'Shower Screen Kaca Kamar Mandi',
    category: 'glass_shower',
    priceModel: 'glass_shower',
    unit: 'unit',
    unitName: 'Set Shower Screen',
    calculationType: 'unit',
    priceMin: 2000000,
    priceMax: 5500000,
    standardPriceMin: 2000000,
    standardPriceMax: 3000000,
    premiumPriceMin: 4200000,
    premiumPriceMax: 5500000,
    specification: 'Framed Shower Screen vs Semi Frameless 8mm vs Full Frameless 10mm SUS304',
    minOrderValue: 2000000,
    wasteFactor: WASTE_FACTORS.glass,
    priceRanges: SHOWER_PRICE_RANGES,
    summaryLabel: 'Sistem Shower:',
    step2Label: '2. Pilih Sistem Shower Screen',
    guideText: 'PILIH SISTEM SHOWER: Framed, Semi Frameless, Full Frameless',
    defaultQty: 1,
    presets: [1, 2, 3, 4, 5],
    options: [
      {
        id: 'framed',
        name: SHOWER_PRICE_RANGES.framed.name,
        badge: 'Framed Ekonomis (Standard)',
        desc: 'Frame aluminium anodize tahan lembab keliling, kaca tempered 6mm / kaca es buram moru, door seal magnet kedap percikan air, handle knop minimalis.',
        minRate: SHOWER_PRICE_RANGES.framed.min,
        maxRate: SHOWER_PRICE_RANGES.framed.max,
        targetRate: SHOWER_PRICE_RANGES.framed.target,
        rate: 'Rp 2.000.000 – Rp 3.000.000 / unit',
        leadTime: '3–4 Hari Kerja',
        formula: 'Frame Aluminium Shower + Kaca Tempered 6mm + Karet Seal Magnet + Engsel Pivot + Pasang',
        rabRatios: { kaca: 0.35, struktur: 0.26, hardware: 0.11, sealant: 0.04, fabrikasi: 0.10, pasang: 0.06, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'semi_frameless',
        name: SHOWER_PRICE_RANGES.semi_frameless.name,
        badge: 'Semi Frameless 8mm',
        desc: 'Kaca Tempered 8mm SNI Asahimas, sekat mati dengan U-channel aluminium tipis dinding & lantai, pintu swing engsel kaca-ke-tembok kuningan lapis chrome.',
        minRate: SHOWER_PRICE_RANGES.semi_frameless.min,
        maxRate: SHOWER_PRICE_RANGES.semi_frameless.max,
        targetRate: SHOWER_PRICE_RANGES.semi_frameless.target,
        rate: 'Rp 3.300.000 – Rp 4.500.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kaca Tempered 8mm + U-Channel Dinding + Engsel Glass-to-Wall + Handle Handuk L + Sealant Anti Jamur',
        rabRatios: { kaca: 0.40, struktur: 0.16, hardware: 0.16, sealant: 0.04, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'frameless',
        name: SHOWER_PRICE_RANGES.frameless.name,
        badge: 'Luxury Frameless 10mm (Premium)',
        desc: 'Kaca Tempered 10mm murni frameless bebas bingkai, 2 engsel kuningan SUS304 chrome duty 50kg, pipa stabilizer stainless atas kaca, magnetic seal air 100% kedap.',
        minRate: SHOWER_PRICE_RANGES.frameless.min,
        maxRate: SHOWER_PRICE_RANGES.frameless.max,
        targetRate: SHOWER_PRICE_RANGES.frameless.target,
        rate: 'Rp 4.200.000 – Rp 5.500.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Kaca Tempered 10mm Bevel + Engsel SUS304 + Pipa Stabilizer SUS304 + Handle Handuk L + Sealant Dowsil Sanitasi',
        rabRatios: { kaca: 0.42, struktur: 0.08, hardware: 0.22, sealant: 0.04, fabrikasi: 0.08, pasang: 0.08, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  kusen: {
    id: 'kusen',
    serviceId: 'kusen',
    serviceName: 'Kusen Aluminium',
    label: 'Kusen Aluminium (Profil 3" / 4" SNI)',
    category: 'aluminium',
    priceModel: 'aluminium_profile',
    unit: 'm1',
    unitName: 'Meter Lari (m1)',
    calculationType: 'm1',
    priceMin: 85000,
    priceMax: 175000,
    standardPriceMin: 85000,
    standardPriceMax: 130000,
    premiumPriceMin: 135000,
    premiumPriceMax: 175000,
    specification: 'Profil 3" Standard (Dacon/Inkalum 0.9-1.0mm) vs Profil 4" Heavy Duty (Alexindo/Alcomexindo 1.1-1.3mm)',
    minOrderValue: 1000000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: KUSEN_PRICE_RANGES,
    summaryLabel: 'Grade Kusen:',
    step2Label: '2. Pilih Grade Profil Kusen Aluminium',
    guideText: 'Standar SNI 3" vs Alexindo Heavy 4"',
    defaultQty: 12,
    presets: [6, 12, 20, 35, 50],
    options: [
      {
        id: 'standard',
        name: KUSEN_PRICE_RANGES.standard.name,
        badge: 'Dacon / Inkalum 3" (Standard)',
        desc: 'Profil batangan 3" tebal 0.9–1.0mm, anodize/powder coating standar, perakitan siku miter 45° presisi, sekrup fisher baja + sealant netral.',
        minRate: KUSEN_PRICE_RANGES.standard.min,
        maxRate: KUSEN_PRICE_RANGES.standard.max,
        targetRate: KUSEN_PRICE_RANGES.standard.target,
        rate: 'Rp 212.500 – Rp 275.000 / m1',
        leadTime: '2–4 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Sekrup Fisher + Sealant Neutral + Upah Tukang Presisi + Cutting Waste 8%',
        rabRatios: { kaca: 0.00, struktur: 0.54, hardware: 0.08, sealant: 0.08, fabrikasi: 0.12, pasang: 0.08, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'premium',
        name: KUSEN_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" Heavy (Premium)',
        desc: 'Profil batangan 4" tebal 1.1–1.3mm kekakuan tinggi, bentangan lebar kokoh, powder coating tahan luntur cuaca eksterior, sealant struktural.',
        minRate: KUSEN_PRICE_RANGES.premium.min,
        maxRate: KUSEN_PRICE_RANGES.premium.max,
        targetRate: KUSEN_PRICE_RANGES.premium.target,
        rate: 'Rp 337.500 – Rp 412.500 / m1',
        leadTime: '3–5 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Sekrup Fisher Heavy + Sealant Weatherseal + Upah Pasang + Cutting Waste 8%',
        rabRatios: { kaca: 0.00, struktur: 0.56, hardware: 0.08, sealant: 0.07, fabrikasi: 0.12, pasang: 0.07, transport: 0.03, margin: 0.07 }
      }
    ]
  },

  pintu_tempered: {
    id: 'pintu_tempered',
    serviceId: 'pintu_tempered',
    serviceName: 'Pintu Kaca Tempered',
    label: 'Pintu Kaca Frameless Floor Hinge',
    category: 'glass_door',
    priceModel: 'glass_door',
    unit: 'unit',
    unitName: 'Set Daun Pintu',
    calculationType: 'unit',
    priceMin: 2900000,
    priceMax: 8500000,
    standardPriceMin: 2900000,
    standardPriceMax: 5200000,
    premiumPriceMin: 3900000,
    premiumPriceMax: 8500000,
    specification: 'Single Leaf Tempered 10mm/12mm BTS 84 vs Dorma BTS 75V vs Double Leaf',
    minOrderValue: 3000000,
    wasteFactor: WASTE_FACTORS.glass,
    priceRanges: PINTU_TEMPERED_PRICE_RANGES,
    summaryLabel: 'Sistem Bukaan:',
    step2Label: '2. Pilih Sistem Floor Hinge & Kaca',
    guideText: 'PILIH SISTEM: Single Leaf 10/12mm vs Double Leaf Kupu Tarung',
    defaultQty: 1,
    presets: [1, 2, 3, 4, 6],
    options: [
      {
        id: 'single_10',
        name: PINTU_TEMPERED_PRICE_RANGES.single_10.name,
        badge: 'Single 10mm Standard',
        desc: 'Kaca Tempered 10mm SNI Asahimas, mesin floor hinge Dekkson BTS 84 tanam lantai beton, top patch fitting SUS304, pull handle stainless 60cm, kunci silinder bawah.',
        minRate: PINTU_TEMPERED_PRICE_RANGES.single_10.min,
        maxRate: PINTU_TEMPERED_PRICE_RANGES.single_10.max,
        targetRate: PINTU_TEMPERED_PRICE_RANGES.single_10.target,
        rate: 'Rp 2.900.000 – Rp 3.600.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kaca Tempered 10mm + Mesin Floor Hinge BTS 84 + Patch Fitting + Pull Handle 60cm + Pasang',
        rabRatios: { kaca: 0.38, struktur: 0.06, hardware: 0.30, sealant: 0.03, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'single_12',
        name: PINTU_TEMPERED_PRICE_RANGES.single_12.name,
        badge: 'Dorma BTS 75V Heavy (Premium)',
        desc: 'Kaca Tempered 12mm kokoh anti getar, mesin floor hinge Dorma BTS 75V standar gedung komersial, patch fitting SUS304 heavy, pull handle 80cm elegan.',
        minRate: PINTU_TEMPERED_PRICE_RANGES.single_12.min,
        maxRate: PINTU_TEMPERED_PRICE_RANGES.single_12.max,
        targetRate: PINTU_TEMPERED_PRICE_RANGES.single_12.target,
        rate: 'Rp 3.900.000 – Rp 5.200.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Kaca Tempered 12mm + Mesin Floor Hinge Dorma BTS 75V + Patch Fitting Heavy + Pull Handle 80cm + Pasang',
        rabRatios: { kaca: 0.36, struktur: 0.06, hardware: 0.34, sealant: 0.03, fabrikasi: 0.08, pasang: 0.06, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'double_12',
        name: PINTU_TEMPERED_PRICE_RANGES.double_12.name,
        badge: 'Lobby 2 Daun Kupu Tarung',
        desc: '2 daun pintu kaca tempered 12mm (opening 180×220cm), 2 unit mesin floor hinge independen, 4 set patch fitting SUS304, 2 pasang pull handle 80cm, kunci sentral lantai.',
        minRate: PINTU_TEMPERED_PRICE_RANGES.double_12.min,
        maxRate: PINTU_TEMPERED_PRICE_RANGES.double_12.max,
        targetRate: PINTU_TEMPERED_PRICE_RANGES.double_12.target,
        rate: 'Rp 6.500.000 – Rp 8.500.000 / unit',
        leadTime: '5–8 Hari Kerja',
        formula: '2 Daun Kaca Tempered 12mm + 2 Mesin Floor Hinge + 4 Patch Fitting + 2 Handle 80cm + Central Lock + Pasang',
        rabRatios: { kaca: 0.36, struktur: 0.06, hardware: 0.34, sealant: 0.03, fabrikasi: 0.08, pasang: 0.06, transport: 0.02, margin: 0.05 }
      }
    ]
  },

  bifold: {
    id: 'bifold',
    serviceId: 'bifold',
    serviceName: 'Pintu Lipat Bifold System',
    label: 'Pintu Lipat Bifold System Aluminium',
    category: 'aluminium',
    priceModel: 'aluminium_bifold',
    unit: 'daun',
    unitName: 'Daun Pintu',
    calculationType: 'unit',
    priceMin: 7500000,
    priceMax: 10500000,
    standardPriceMin: 7500000,
    standardPriceMax: 8750000,
    premiumPriceMin: 8750000,
    premiumPriceMax: 10500000,
    specification: 'Bifold Standard Track (Inkalum 1.1mm) vs Heavy Duty Panoramic 250kg (Alexindo 1.3mm)',
    minOrderValue: 7500000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: BIFOLD_PRICE_RANGES,
    summaryLabel: 'Grade Bifold:',
    step2Label: '2. Pilih Grade Rel & Profil Bifold',
    guideText: 'Standard Inkalum vs Premium Alexindo Heavy 250kg',
    defaultQty: 4,
    presets: [3, 4, 5, 6, 8],
    options: [
      {
        id: 'standard',
        name: BIFOLD_PRICE_RANGES.standard.name,
        badge: 'Inkalum SNI (Standard)',
        desc: 'Profil aluminium tebal 1.1mm, kaca clear 5mm, rel gantung atas & guide rel bawah bantalan roller bearing tahan beban 120kg, engsel lipat antar daun.',
        minRate: BIFOLD_PRICE_RANGES.standard.min,
        maxRate: BIFOLD_PRICE_RANGES.standard.max,
        targetRate: BIFOLD_PRICE_RANGES.standard.target,
        rate: 'Rp 7.000.000 – Rp 8.750.000 / daun',
        leadTime: '5–7 Hari Kerja',
        formula: '(Jumlah Daun × Tarif) + Rel Gantung + Roller Bearing + Flush Bolt + Kaca 5mm + Pasang',
        rabRatios: { kaca: 0.18, struktur: 0.40, hardware: 0.18, sealant: 0.03, fabrikasi: 0.09, pasang: 0.06, transport: 0.01, margin: 0.05 }
      },
      {
        id: 'premium',
        name: BIFOLD_PRICE_RANGES.premium.name,
        badge: 'Alexindo Heavy 250kg (Premium)',
        desc: 'Profil Alexindo 1.3mm ekstra kaku, kaca tempered 6–8mm, rel gantung heavy duty suspended tahan 250kg buka tutup sangat halus (whisper quiet), flush floor threshold.',
        minRate: BIFOLD_PRICE_RANGES.premium.min,
        maxRate: BIFOLD_PRICE_RANGES.premium.max,
        targetRate: BIFOLD_PRICE_RANGES.premium.target,
        rate: 'Rp 8.750.000 – Rp 12.000.000 / daun',
        leadTime: '7–10 Hari Kerja',
        formula: '(Jumlah Daun × Tarif) + Rel Heavy Duty 250kg + Engsel SUS304 + Kaca Tempered + Flush Threshold + Pasang',
        rabRatios: { kaca: 0.22, struktur: 0.38, hardware: 0.18, sealant: 0.03, fabrikasi: 0.08, pasang: 0.05, transport: 0.01, margin: 0.05 }
      }
    ]
  },

  etalase: {
    id: 'etalase',
    serviceId: 'etalase',
    serviceName: 'Etalase Kaca',
    label: 'Etalase Kaca Toko & Display Counter',
    category: 'aluminium',
    priceModel: 'aluminium_showcase',
    unit: 'unit',
    unitName: 'Unit Etalase',
    calculationType: 'unit',
    priceMin: 1250000,
    priceMax: 3500000,
    standardPriceMin: 1250000,
    standardPriceMax: 1650000,
    premiumPriceMin: 2400000,
    premiumPriceMax: 3500000,
    specification: 'Etalase Counter Toko Standar 1.5m vs Showcase Premium Full Tempered LED',
    minOrderValue: 1250000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: ETALASE_PRICE_RANGES,
    summaryLabel: 'Spesifikasi Etalase:',
    step2Label: '2. Pilih Spesifikasi Konstruksi Etalase',
    guideText: 'Standard Toko 1.5m vs Premium Display Full Kaca',
    defaultQty: 1,
    presets: [1, 2, 3, 5, 8],
    options: [
      {
        id: 'standard',
        name: ETALASE_PRICE_RANGES.standard.name,
        badge: 'Standard Counter 1.5m',
        desc: 'Ukuran P150 × L50 × T100 cm, frame aluminium silver hollow etalase, kaca polos 5mm SNI, 2 susun rak kaca, pintu geser sliding dengan kunci gergaji, roda rem 2".',
        minRate: ETALASE_PRICE_RANGES.standard.min,
        maxRate: ETALASE_PRICE_RANGES.standard.max,
        targetRate: ETALASE_PRICE_RANGES.standard.target,
        rate: 'Rp 3.000.000 – Rp 4.125.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Rangka Hollow Etalase + Kaca 5mm + Roda Rem + Kunci Huben + Perakitan Workshop',
        rabRatios: { kaca: 0.30, struktur: 0.34, hardware: 0.10, sealant: 0.04, fabrikasi: 0.12, pasang: 0.02, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'premium',
        name: ETALASE_PRICE_RANGES.premium.name,
        badge: 'Boutique Display + LED (Premium)',
        desc: 'Frame aluminium anodize hitam doff / champagne profil tebal, kaca tempered 6mm tahan gores, lampu LED strip tersembunyi warm/white, kunci sentral keamanan.',
        minRate: ETALASE_PRICE_RANGES.premium.min,
        maxRate: ETALASE_PRICE_RANGES.premium.max,
        targetRate: ETALASE_PRICE_RANGES.premium.target,
        rate: 'Rp 5.000.000 – Rp 8.750.000 / unit',
        leadTime: '5–7 Hari Kerja',
        formula: 'Rangka Anodize Hitam + Kaca Tempered 6mm + LED Strip Hidden + Kunci Sentral + Fabrikasi',
        rabRatios: { kaca: 0.32, struktur: 0.32, hardware: 0.12, sealant: 0.04, fabrikasi: 0.10, pasang: 0.02, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  acp: {
    id: 'acp',
    serviceId: 'acp',
    serviceName: 'Fasad ACP Aluminium Composite Panel',
    label: 'Fasad ACP Aluminium Composite Panel',
    category: 'facade_acp',
    priceModel: 'acp_facade',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    calculationType: 'm2',
    priceMin: 550000,
    priceMax: 1600000,
    standardPriceMin: 550000,
    standardPriceMax: 750000,
    premiumPriceMin: 1100000,
    premiumPriceMax: 1600000,
    specification: 'ACP Interior PE 0.21mm vs Eksterior PVDF 0.30mm vs Heavy Duty 0.50mm (Seven / Marks)',
    minOrderValue: 3000000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: ACP_PRICE_RANGES,
    summaryLabel: 'Grade Panel ACP:',
    step2Label: '2. Pilih Spesifikasi Panel ACP',
    guideText: 'Tipe cat PE Interior vs PVDF Outdoor 0.3mm vs Heavy Duty 0.5mm',
    defaultQty: 25,
    presets: [10, 25, 50, 100, 200],
    options: [
      {
        id: 'interior_pe',
        name: ACP_PRICE_RANGES.interior_pe.name,
        badge: 'Seven Interior PE (Standard)',
        desc: 'Tebal panel 4mm, skin aluminium 0.21mm cat Polyester (PE) untuk dekorasi dinding lobi, resepsionis, cover kolom/pilar & interior toko.',
        minRate: ACP_PRICE_RANGES.interior_pe.min,
        maxRate: ACP_PRICE_RANGES.interior_pe.max,
        targetRate: ACP_PRICE_RANGES.interior_pe.target,
        rate: 'Rp 550.000 – Rp 750.000 / m²',
        leadTime: '4–7 Hari Kerja',
        formula: 'Panel ACP PE + Rangka Hollow 2×4 + Baut Sekrup + Sealant Interior + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.48, hardware: 0.08, sealant: 0.08, fabrikasi: 0.14, pasang: 0.12, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'exterior_pvdf',
        name: ACP_PRICE_RANGES.exterior_pvdf.name,
        badge: 'Seven Outdoor PVDF (Premium)',
        desc: 'Tebal 4mm skin aluminium 0.30mm coating PVDF tahan panas matahari & hujan garansi warna 10 tahun, rangka hollow galvanis 40×40 anti karat, sealant non-staining.',
        minRate: ACP_PRICE_RANGES.exterior_pvdf.min,
        maxRate: ACP_PRICE_RANGES.exterior_pvdf.max,
        targetRate: ACP_PRICE_RANGES.exterior_pvdf.target,
        rate: 'Rp 750.000 – Rp 1.050.000 / m²',
        leadTime: '6–9 Hari Kerja',
        formula: 'Panel ACP PVDF 0.3mm + Rangka Hollow Galvanis 40×40 + Siku Breket + Baut Rivet + Sealant Non-Staining + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.50, hardware: 0.08, sealant: 0.07, fabrikasi: 0.13, pasang: 0.12, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'heavy_duty_pvdf',
        name: ACP_PRICE_RANGES.heavy_duty_pvdf.name,
        badge: 'Alucobond / Alcopan Grade (Heavy)',
        desc: 'Tebal 4mm skin aluminium 0.50mm cat PVDF kualitas gedung komersial/showroom, rangka besi hollow galvanis tebal 1.6mm + scaffolding kerja aman.',
        minRate: ACP_PRICE_RANGES.heavy_duty_pvdf.min,
        maxRate: ACP_PRICE_RANGES.heavy_duty_pvdf.max,
        targetRate: ACP_PRICE_RANGES.heavy_duty_pvdf.target,
        rate: 'Rp 1.100.000 – Rp 1.600.000 / m²',
        leadTime: '8–14 Hari Kerja',
        formula: 'Panel Heavy PVDF 0.5mm + Rangka Hollow 40×40 1.6mm + Braket Siku + Sealant Dow Corning + Scaffolding + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.52, hardware: 0.08, sealant: 0.06, fabrikasi: 0.13, pasang: 0.11, transport: 0.03, margin: 0.07 }
      }
    ]
  },

  curtain_wall: {
    id: 'curtain_wall',
    serviceId: 'curtain_wall',
    serviceName: 'Curtain Wall Fasad Kaca Komersial',
    label: 'Curtain Wall Fasad Kaca Komersial',
    category: 'curtain_wall',
    priceModel: 'curtain_wall',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    calculationType: 'm2',
    priceMin: 1800000,
    priceMax: 4200000,
    standardPriceMin: 1800000,
    standardPriceMax: 2400000,
    premiumPriceMin: 3000000,
    premiumPriceMax: 4200000,
    specification: 'Stick System Mullion + Panasap 6mm Tinted vs Tempered Stopsol 8mm vs Semi-Unitized High-Rise',
    minOrderValue: 10000000,
    wasteFactor: WASTE_FACTORS.glass,
    priceRanges: CURTAIN_WALL_PRICE_RANGES,
    summaryLabel: 'Sistem Fasad:',
    step2Label: '2. Pilih Sistem Mullion & Spesifikasi Kaca',
    guideText: 'Stick System Panasap 6mm vs Reflective 8mm vs Semi-Unitized',
    defaultQty: 30,
    presets: [15, 30, 60, 120, 250],
    options: [
      {
        id: 'stick_panasap',
        name: CURTAIN_WALL_PRICE_RANGES.stick_panasap.name,
        badge: 'Ruko & Gedung Kantor (Standard)',
        desc: 'Rangka mullion aluminium 150mm tebal 1.5mm, kaca Panasap Green / Dark Blue 6mm penolak panas surya, structural sealant Dow Corning, siku baja anchor.',
        minRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.target,
        rate: 'Rp 1.800.000 – Rp 2.400.000 / m²',
        leadTime: '10–15 Hari Kerja',
        formula: 'Rangka Mullion 150mm + Kaca Panasap 6mm + Structural Silicone + Siku Baja Anchor + Pasang',
        rabRatios: { kaca: 0.32, struktur: 0.32, hardware: 0.07, sealant: 0.06, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'stick_tempered8',
        name: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.name,
        badge: 'Showroom & Facade 8mm (Premium)',
        desc: 'Rangka mullion aluminium heavy duty 150×50mm tebal 2.0mm, kaca Tempered One-Way Reflective / Stopsol 8mm privasi tinggi & pantul panas optimal.',
        minRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.target,
        rate: 'Rp 2.200.000 – Rp 3.000.000 / m²',
        leadTime: '12–18 Hari Kerja',
        formula: 'Mullion Heavy 2.0mm + Kaca Tempered Stopsol 8mm + Braket WF Anchor + Sealant Struktural + Pasang',
        rabRatios: { kaca: 0.35, struktur: 0.31, hardware: 0.07, sealant: 0.05, fabrikasi: 0.09, pasang: 0.06, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'semi_unitized',
        name: CURTAIN_WALL_PRICE_RANGES.semi_unitized.name,
        badge: 'Green Building Low-E (Heavy Duty)',
        desc: 'Kaca Tempered Low-E 10mm hemat energi AC, fabrikasi panel modul semi-unitized presisi workshop, bracket jangkar baja siku 8mm tebal, scaffolding/gondola.',
        minRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.target,
        rate: 'Rp 3.000.000 – Rp 4.200.000 / m²',
        leadTime: '15–25 Hari Kerja',
        formula: 'Fabrikasi Modul Semi-Unitized + Kaca Tempered Low-E 10mm + Bracket Jangkar Baja 8mm + Gondola + Pasang',
        rabRatios: { kaca: 0.38, struktur: 0.28, hardware: 0.07, sealant: 0.05, fabrikasi: 0.09, pasang: 0.06, transport: 0.02, margin: 0.05 }
      }
    ]
  }
};

// Attach dynamic formula calculation function to each service
for (const key of Object.keys(services)) {
  services[key].formula = createPriceCalculator(key, services[key]);
}

// ------------------------------------------------------------------------------
// Browser global registration if loaded via <script> tag
// ------------------------------------------------------------------------------
const unifiedConfig = {
  services,
  constants: {
    KANOPI_PRICE_RANGES,
    RAILING_PRICE_RANGES,
    PARTISI_PRICE_RANGES,
    JENDELA_PRICE_RANGES,
    PINTU_PRICE_RANGES,
    SHOWER_PRICE_RANGES,
    KUSEN_PRICE_RANGES,
    PINTU_TEMPERED_PRICE_RANGES,
    BIFOLD_PRICE_RANGES,
    ETALASE_PRICE_RANGES,
    ACP_PRICE_RANGES,
    CURTAIN_WALL_PRICE_RANGES,
    REGIONAL_TRANSPORT_ESTIMATES,
    WASTE_FACTORS
  },
  benchmarks: {
    region: 'Karawang, Cikarang, Bekasi & Jabodetabek (Retail Supplier Benchmark)',
    transport: REGIONAL_TRANSPORT_ESTIMATES,
    wasteFactors: WASTE_FACTORS
  },
  disclaimer: 'Harga indikatif / rough budget. Harga final menyesuaikan ukuran, desain, material, hardware, kondisi lokasi, tingkat kesulitan pemasangan, dan hasil survey.'
};

if (typeof window !== 'undefined') {
  window.pricingConfig = unifiedConfig;
  window.PRICING_CONFIG = unifiedConfig;
}

const constants = unifiedConfig.constants;
const benchmarks = unifiedConfig.benchmarks;