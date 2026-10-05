/**
 * ==============================================================================
 * PRICING CONFIGURATION & PRICE ENGINE
 * Sahabat Aluminium Karawang & Jabodetabek
 *
 * Centralized pricing configuration module.
 * Defines realistic selling price benchmarks for local retail applicator/contractor.
 * No global 'Standard/Premium' configuration for glass products.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. REALISTIC PRICE RANGE CONSTANTS PER SERVICE
// ------------------------------------------------------------------------------

export const KANOPI_PRICE_RANGES = {
  hollow_tempered_8: {
    name: 'Rangka Hollow Galvanis 100×50 + Tempered 8 mm',
    min: 1550000,
    max: 1750000,
    target: 1650000,
    unit: 'm²'
  },
  hollow_tempered_10: {
    name: 'Rangka Hollow 100×50×2 mm + Tempered Clear 10 mm (Target TEST 1)',
    min: 1700000,
    max: 1900000,
    target: 1800000,
    unit: 'm²'
  },
  wf_tempered_12: {
    name: 'Rangka Baja WF 150 / Double Hollow + Tempered 12 mm',
    min: 1800000,
    max: 2000000,
    target: 1900000,
    unit: 'm²'
  },
  stainless_tempered: {
    name: 'Rangka Stainless Steel SUS304 + Tempered 10/12 mm',
    min: 2600000,
    max: 3400000,
    target: 2950000,
    unit: 'm²'
  },
  laminated_canopy: {
    name: 'Struktur Rangka + Tempered Laminated 5+5 mm PVB',
    min: 2200000,
    max: 2800000,
    target: 2450000,
    unit: 'm²'
  }
};

export const RAILING_PRICE_RANGES = {
  uchannel_ss304: {
    name: 'Sistem U-Channel Base Tanam + Tempered 12 mm (Target TEST 2)',
    min: 2200000,
    max: 2500000,
    target: 2400000,
    unit: 'm1'
  },
  spigot_ss304: {
    name: 'Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm',
    min: 2500000,
    max: 3000000,
    target: 2750000,
    unit: 'm1'
  },
  handrail_ss304: {
    name: 'Tiang Baluster + Handrail SUS304 + Tempered 10 mm',
    min: 2400000,
    max: 2900000,
    target: 2650000,
    unit: 'm1'
  },
  railing_tangga: {
    name: 'Railing Tangga Custom Void + Tempered 10/12 mm',
    min: 2500000,
    max: 3000000,
    target: 2750000,
    unit: 'm1'
  }
};

export const PARTISI_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI 3 Inch (Dacon/Inkalum + Kaca 5 mm)',
    min: 850000,
    max: 1050000,
    target: 950000,
    unit: 'm²'
  },
  premium: {
    name: 'Premium Grade 4 Inch (Alexindo/Forta + Kaca 6/8 mm)',
    min: 1100000,
    max: 1350000,
    target: 1250000,
    unit: 'm²'
  }
};

export const JENDELA_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI (Casement 3" + Kaca 5 mm)',
    min: 850000,
    max: 1050000,
    target: 950000,
    unit: 'm²'
  },
  premium: {
    name: 'Premium Grade (Casement 4" Alexindo + Kaca Panasap/Dekkson)',
    min: 1100000,
    max: 1400000,
    target: 1250000,
    unit: 'm²'
  }
};

export const PINTU_PRICE_RANGES = {
  swing: {
    name: 'Pintu Aluminium Swing 1 Daun Modern Komplit',
    min: 2000000,
    max: 2800000,
    target: 2350000,
    unit: 'unit'
  },
  sliding: {
    name: 'Pintu Aluminium Sliding Geser (Silent Roller Rail)',
    min: 2500000,
    max: 3500000,
    target: 2850000,
    unit: 'unit'
  },
  folding: {
    name: 'Pintu Aluminium Folding / Lipat (per unit opening)',
    min: 3500000,
    max: 5000000,
    target: 4200000,
    unit: 'unit'
  }
};

export const SHOWER_PRICE_RANGES = {
  framed: {
    name: 'Framed Shower Screen (Bingkai Aluminium Keliling)',
    min: 1500000,
    max: 2000000,
    target: 1750000,
    unit: 'unit'
  },
  semi_frameless: {
    name: 'Semi Frameless Shower Screen (U-Channel + Header Track)',
    min: 2000000,
    max: 2800000,
    target: 2350000,
    unit: 'unit'
  },
  frameless: {
    name: 'Full Frameless Shower Screen (Tempered 10 mm SUS304)',
    min: 2500000,
    max: 3500000,
    target: 2950000,
    unit: 'unit'
  }
};

export const KUSEN_PRICE_RANGES = {
  standard: {
    name: 'Standard SNI 3 Inch (Dacon / Inkalum)',
    min: 85000,
    max: 110000,
    target: 100000,
    unit: 'm1'
  },
  premium: {
    name: 'Premium Grade 4 Inch (Alexindo / Alcomexindo)',
    min: 135000,
    max: 165000,
    target: 150000,
    unit: 'm1'
  }
};

export const PINTU_TEMPERED_PRICE_RANGES = {
  single_10: {
    name: 'Single Leaf Tempered 10 mm + Mesin BTS 84',
    min: 3250000,
    max: 3850000,
    target: 3500000,
    unit: 'unit'
  },
  single_12: {
    name: 'Single Leaf Tempered 12 mm + Floor Hinge Dorma BTS 75V',
    min: 4200000,
    max: 5250000,
    target: 4650000,
    unit: 'unit'
  },
  double_12: {
    name: 'Double Leaf (Kupu Tarung) Tempered 12 mm + Dorma',
    min: 7800000,
    max: 9400000,
    target: 8500000,
    unit: 'unit'
  }
};

export const BIFOLD_PRICE_RANGES = {
  standard: {
    name: 'Bifold Standard Track (Inkalum 1.1 mm)',
    min: 2800000,
    max: 3500000,
    target: 3150000,
    unit: 'daun'
  },
  premium: {
    name: 'Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm / 250 kg)',
    min: 3500000,
    max: 4800000,
    target: 4100000,
    unit: 'daun'
  }
};

export const ETALASE_PRICE_RANGES = {
  standard: {
    name: 'Etalase Counter Toko Standar 1.5 Meter',
    min: 1200000,
    max: 1650000,
    target: 1450000,
    unit: 'unit'
  },
  premium: {
    name: 'Display Showcase Premium Full Kaca Tempered + LED',
    min: 2000000,
    max: 3500000,
    target: 2750000,
    unit: 'unit'
  }
};

export const ACP_PRICE_RANGES = {
  interior_pe: {
    name: 'ACP Interior PE 0.21 mm (Seven / Marks)',
    min: 650000,
    max: 850000,
    target: 750000,
    unit: 'm²'
  },
  exterior_pvdf: {
    name: 'ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca',
    min: 850000,
    max: 1150000,
    target: 950000,
    unit: 'm²'
  },
  heavy_duty_pvdf: {
    name: 'ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)',
    min: 1250000,
    max: 1650000,
    target: 1450000,
    unit: 'm²'
  }
};

export const CURTAIN_WALL_PRICE_RANGES = {
  stick_panasap: {
    name: 'Stick System Back Mullion + Panasap 6 mm Tinted',
    min: 1600000,
    max: 1900000,
    target: 1750000,
    unit: 'm²'
  },
  stick_tempered8: {
    name: 'Stick System + Tempered Reflective / Stopsol 8 mm',
    min: 1850000,
    max: 2450000,
    target: 2150000,
    unit: 'm²'
  },
  semi_unitized: {
    name: 'Semi-Unitized High-Rise + Low-E 10 mm Tempered',
    min: 2500000,
    max: 3250000,
    target: 2850000,
    unit: 'm²'
  }
};

// ------------------------------------------------------------------------------
// 2. REGIONAL BENCHMARK CONSTANTS (TRANSPORT & WASTE)
// ------------------------------------------------------------------------------

export const REGIONAL_TRANSPORT_ESTIMATES = {
  karawang: { name: 'Karawang (Basis Workshop: Klari, Telukjambe, KIIC)', min: 300000, max: 500000, default: 400000 },
  cikampek: { name: 'Cikampek & Jatisari (Karawang Timur)', min: 400000, max: 600000, default: 500000 },
  cikarang: { name: 'Cikarang (Lippo, Jababeka, Delta Mas, MM2100)', min: 500000, max: 750000, default: 600000 },
  bekasi: { name: 'Bekasi (Kota & Kabupaten, Tambun, Cibitung)', min: 700000, max: 1000000, default: 850000 },
  jakarta: { name: 'DKI Jakarta (Pusat, Selatan, Timur, Barat, Utara)', min: 900000, max: 1500000, default: 1200000 },
  depok_tangerang: { name: 'Depok, Tangerang & Tangerang Selatan', min: 1000000, max: 1800000, default: 1350000 },
  bogor: { name: 'Bogor (Kota & Kabupaten)', min: 1000000, max: 1800000, default: 1350000 }
};

export const WASTE_FACTORS = {
  glass: 0.05,      // 5% toleransi potong kaca
  aluminium: 0.08,  // 8% toleransi cutting bar profil aluminium
  steel: 0.06       // 6% toleransi pemotongan baja hollow/WF
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
      category: config.category,
      priceModel: config.priceModel,
      unit: config.unit,
      unitName: config.unitName,
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
// 3. EXPORTED 'services' OBJECT (12 SERVICES)
// ------------------------------------------------------------------------------

export const services = {
  kanopi: {
    id: 'kanopi',
    label: 'Kanopi Kaca Tempered Carport / Teras',
    category: 'glass_canopy',
    priceModel: 'glass_canopy',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    minOrderValue: 7500000,
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
        rate: 'Rp 1.550.000 – Rp 1.750.000 / m²',
        leadTime: '5–7 Hari Kerja',
        formula: '(Luas m² × Tarif) + Rangka Hollow 100×50 + Tempered 8mm + Bracket Dynabolt + Sealant Dowsil + Fabrikasi + Pasang',
        rabRatios: { kaca: 0.34, struktur: 0.22, hardware: 0.06, sealant: 0.03, fabrikasi: 0.11, pasang: 0.13, transport: 0.04, margin: 0.07 }
      },
      {
        id: 'hollow_tempered_10',
        name: KANOPI_PRICE_RANGES.hollow_tempered_10.name,
        badge: 'Target Standar Carport (TEST 1)',
        desc: 'Kaca Tempered Clear 10mm SNI Asahimas, struktur hollow galvanis 100×50×2 mm bentang rigid, plat anchor baja, sealant weatherseal netral struktural Dowsil 795.',
        minRate: KANOPI_PRICE_RANGES.hollow_tempered_10.min,
        maxRate: KANOPI_PRICE_RANGES.hollow_tempered_10.max,
        targetRate: KANOPI_PRICE_RANGES.hollow_tempered_10.target,
        rate: 'Rp 1.700.000 – Rp 1.900.000 / m²',
        leadTime: '6–8 Hari Kerja',
        formula: '18 m² × Rp 1.800.000 = Rp 32.400.000 (Kaca 11.7M + Rangka 6.3M + Hardware 2M + Sealant 900k + Fabrikasi 3.6M + Pasang 4.5M + Transport 1.2M + Margin 2.2M)',
        rabRatios: {
          kaca: 11700000 / 32400000,
          struktur: 6300000 / 32400000,
          hardware: 2000000 / 32400000,
          sealant: 900000 / 32400000,
          fabrikasi: 3600000 / 32400000,
          pasang: 4500000 / 32400000,
          transport: 1200000 / 32400000,
          margin: 2200000 / 32400000
        }
      },
      {
        id: 'wf_tempered_12',
        name: KANOPI_PRICE_RANGES.wf_tempered_12.name,
        badge: 'Heavy Duty WF 150',
        desc: 'Kaca Tempered Clear 12mm tebal anti lendut, struktur balok baja profil WF 150 / double hollow 100×50 heavy tanpa tiang tengah, plat sambung anchor baja tebal 10mm.',
        minRate: KANOPI_PRICE_RANGES.wf_tempered_12.min,
        maxRate: KANOPI_PRICE_RANGES.wf_tempered_12.max,
        targetRate: KANOPI_PRICE_RANGES.wf_tempered_12.target,
        rate: 'Rp 1.800.000 – Rp 2.000.000 / m²',
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
        rate: 'Rp 2.600.000 – Rp 3.400.000 / m²',
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
        rate: 'Rp 2.200.000 – Rp 2.800.000+ / m²',
        leadTime: '8–12 Hari Kerja',
        formula: '(Luas m² × Tarif) + Rangka Baja + Tempered Laminated 5+5 PVB + Sealant Struktural + Scaffolding + Pasang',
        rabRatios: { kaca: 0.44, struktur: 0.20, hardware: 0.05, sealant: 0.03, fabrikasi: 0.10, pasang: 0.10, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  railing: {
    id: 'railing',
    label: 'Railing Tangga & Balkon Kaca Tempered',
    category: 'glass_railing',
    priceModel: 'glass_railing',
    unit: 'm1',
    unitName: 'Meter Lari (m1)',
    minOrderValue: 5500000,
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
        badge: 'U-Channel SS304 Tanam (TEST 2)',
        desc: 'Kaca Tempered 12mm SNI Asahimas, base shoe profil aluminium/stainless SUS304 tanam rata lantai marmer/keramik dengan chemical anchor Fischer/Hilti, cover cladding samping estetik.',
        minRate: RAILING_PRICE_RANGES.uchannel_ss304.min,
        maxRate: RAILING_PRICE_RANGES.uchannel_ss304.max,
        targetRate: RAILING_PRICE_RANGES.uchannel_ss304.target,
        rate: 'Rp 2.200.000 – Rp 2.500.000 / m1',
        leadTime: '6–9 Hari Kerja',
        formula: '18 m¹ × Rp 2.400.000 = Rp 43.200.000 (Base U-Channel + Kaca Tempered 12mm + Chemical Anchor + Sealant EPDM + Pasang Presisi)',
        rabRatios: { kaca: 0.35, struktur: 0.24, hardware: 0.08, sealant: 0.03, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'spigot_ss304',
        name: RAILING_PRICE_RANGES.spigot_ss304.name,
        badge: 'Spigot SS304 Solid 2 Titik/m',
        desc: 'Kaca Tempered 12mm SNI, dudukan spigot bulat/kotak cor Stainless SUS304 padat (2 unit per meter), dynabolt M12 beton, tampilan minimalis murni tanpa tiang atas.',
        minRate: RAILING_PRICE_RANGES.spigot_ss304.min,
        maxRate: RAILING_PRICE_RANGES.spigot_ss304.max,
        targetRate: RAILING_PRICE_RANGES.spigot_ss304.target,
        rate: 'Rp 2.500.000 – Rp 3.000.000 / m1',
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
        rate: 'Rp 2.400.000 – Rp 2.900.000 / m1',
        leadTime: '5–8 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Kaca Tempered 10mm + Tiang Baluster SUS304 + Handrail Pipa 2" + Bracket Klem Kaca + Pasang',
        rabRatios: { kaca: 0.30, struktur: 0.28, hardware: 0.10, sealant: 0.02, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'railing_tangga',
        name: RAILING_PRICE_RANGES.railing_tangga.name,
        badge: 'Railing Tangga Presisi',
        desc: 'Kaca Tempered 10mm/12mm custom bevel mengikuti sudut derajat kemiringan trap anak tangga (akurasi laser), pin standoff void / tiang miring SUS304.',
        minRate: RAILING_PRICE_RANGES.railing_tangga.min,
        maxRate: RAILING_PRICE_RANGES.railing_tangga.max,
        targetRate: RAILING_PRICE_RANGES.railing_tangga.target,
        rate: 'Rp 2.500.000 – Rp 3.000.000 / m1',
        leadTime: '7–12 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Mal Triplek Sudut Trap + Kaca Tempered Custom Bevel + Hardware Tangga SUS304 + Pasang Khusus',
        rabRatios: { kaca: 0.33, struktur: 0.25, hardware: 0.09, sealant: 0.03, fabrikasi: 0.11, pasang: 0.10, transport: 0.03, margin: 0.06 }
      }
    ]
  },

  partisi: {
    id: 'partisi',
    label: 'Partisi Kaca Kantor & Sekat Ruangan Aluminium',
    category: 'aluminium',
    priceModel: 'aluminium_partition',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    minOrderValue: 3500000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: PARTISI_PRICE_RANGES,
    summaryLabel: 'Grade Partisi:',
    step2Label: '2. Pilih Grade Profil & Kaca Partisi',
    guideText: 'Standard SNI 3" vs Premium Heavy Duty 4" (TEST 3)',
    defaultQty: 16.8,
    presets: [8, 12, 16.8, 25, 40],
    options: [
      {
        id: 'standard',
        name: PARTISI_PRICE_RANGES.standard.name,
        badge: 'Standard SNI 3" (TEST 3)',
        desc: 'Kusen aluminium 3" tebal 0.9–1.0mm (Dacon/Inkalum), kaca clear polos 5mm SNI, karet EPDM lis keliling, sealant netral kedap suara kantor.',
        minRate: PARTISI_PRICE_RANGES.standard.min,
        maxRate: PARTISI_PRICE_RANGES.standard.max,
        targetRate: PARTISI_PRICE_RANGES.standard.target,
        rate: 'Rp 850.000 – Rp 1.050.000 / m²',
        leadTime: '3–5 Hari Kerja',
        formula: '16,8 m² × Rp 950.000 = Rp 15.960.000 (Kusen 3" + Kaca 5mm + Karet EPDM + Sealant + Sekrup Fisher + Jasa Pasang Presisi)',
        rabRatios: { kaca: 0.28, struktur: 0.30, hardware: 0.06, sealant: 0.05, fabrikasi: 0.10, pasang: 0.11, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'premium',
        name: PARTISI_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" Heavy (TEST 3)',
        desc: 'Kusen aluminium 4" tebal 1.1–1.3mm profil tebal rigid (Alexindo/Forta), kaca clear/riben 6mm / tempered 8mm, peredam suara kantor akustik lebih hening.',
        minRate: PARTISI_PRICE_RANGES.premium.min,
        maxRate: PARTISI_PRICE_RANGES.premium.max,
        targetRate: PARTISI_PRICE_RANGES.premium.target,
        rate: 'Rp 1.100.000 – Rp 1.350.000 / m²',
        leadTime: '4–7 Hari Kerja',
        formula: '16,8 m² × Rp 1.250.000 = Rp 21.000.000 (Kusen 4" Alexindo + Kaca 6mm/8mm + Sealant Akustik + Bracket Baja + Pasang Presisi)',
        rabRatios: { kaca: 0.32, struktur: 0.28, hardware: 0.06, sealant: 0.05, fabrikasi: 0.10, pasang: 0.10, transport: 0.03, margin: 0.06 }
      }
    ]
  },

  jendela: {
    id: 'jendela',
    label: 'Jendela Aluminium (Casement / Sliding)',
    category: 'aluminium',
    priceModel: 'aluminium_window',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    minOrderValue: 1800000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: JENDELA_PRICE_RANGES,
    summaryLabel: 'Grade Jendela:',
    step2Label: '2. Pilih Grade Profil & Aksesoris Jendela',
    guideText: 'Standard SNI vs Premium Alexindo Heavy Duty (TEST 4)',
    defaultQty: 10,
    presets: [3, 6, 10, 15, 20],
    options: [
      {
        id: 'standard',
        name: JENDELA_PRICE_RANGES.standard.name,
        badge: 'Inkalum / Dacon 3" (TEST 4)',
        desc: 'Profil kusen & daun 3" tebal 1.0mm, kaca clear 5mm SNI, friction stay stainless 12", kunci rambuncis zinc alloy, weatherstrip bulu & karet kedap air hujan.',
        minRate: JENDELA_PRICE_RANGES.standard.min,
        maxRate: JENDELA_PRICE_RANGES.standard.max,
        targetRate: JENDELA_PRICE_RANGES.standard.target,
        rate: 'Rp 850.000 – Rp 1.050.000 / m²',
        leadTime: '3–5 Hari Kerja',
        formula: '10 m² × Rp 950.000 = Rp 9.500.000 (Kusen + Daun Casement + Kaca 5mm + Friction Stay + Rambuncis + Pasang)',
        rabRatios: { kaca: 0.25, struktur: 0.34, hardware: 0.10, sealant: 0.04, fabrikasi: 0.10, pasang: 0.08, transport: 0.03, margin: 0.06 }
      },
      {
        id: 'premium',
        name: JENDELA_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" SUS304 (TEST 4)',
        desc: 'Profil heavy duty 4" tebal 1.2mm Alexindo, kaca Panasap tolak panas / Euro Grey 5mm, friction stay heavy duty Dekkson SUS304, multi-point lock lever hening.',
        minRate: JENDELA_PRICE_RANGES.premium.min,
        maxRate: JENDELA_PRICE_RANGES.premium.max,
        targetRate: JENDELA_PRICE_RANGES.premium.target,
        rate: 'Rp 1.100.000 – Rp 1.400.000 / m²',
        leadTime: '4–6 Hari Kerja',
        formula: '10 m² × Rp 1.250.000 = Rp 12.500.000 (Kusen 4" Alexindo + Kaca Panasap + Multi-point Lock Dekkson + Weatherseal + Pasang)',
        rabRatios: { kaca: 0.28, struktur: 0.33, hardware: 0.12, sealant: 0.04, fabrikasi: 0.08, pasang: 0.07, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  pintu: {
    id: 'pintu',
    label: 'Pintu Aluminium (Swing / Sliding / Folding Modern)',
    category: 'aluminium',
    priceModel: 'aluminium_door',
    unit: 'unit',
    unitName: 'Unit Pintu',
    minOrderValue: 2000000,
    wasteFactor: WASTE_FACTORS.aluminium,
    priceRanges: PINTU_PRICE_RANGES,
    summaryLabel: 'Tipe Bukaan:',
    step2Label: '2. Pilih Tipe Bukaan Pintu Aluminium',
    guideText: 'PILIH SISTEM PINTU: Swing, Sliding, atau Folding (TEST 5)',
    defaultQty: 1,
    presets: [1, 2, 4, 6, 8],
    options: [
      {
        id: 'swing',
        name: PINTU_PRICE_RANGES.swing.name,
        badge: 'Swing 1 Daun Modern (TEST 5)',
        desc: '1 Unit pintu swing buka dorong/tarik lengkap kusen 3"/4", panel kaca clear 5mm / spandrel dobel aluminium, engsel tebal stainless 4", lockset mortise lock lever handle awet.',
        minRate: PINTU_PRICE_RANGES.swing.min,
        maxRate: PINTU_PRICE_RANGES.swing.max,
        targetRate: PINTU_PRICE_RANGES.swing.target,
        rate: 'Rp 2.000.000 – Rp 2.800.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kusen 3" + Daun Pintu + Kaca 5mm / Spandrel + Mortise Lockset + Engsel Stainless + Jasa Pasang',
        rabRatios: { kaca: 0.18, struktur: 0.40, hardware: 0.15, sealant: 0.03, fabrikasi: 0.10, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'sliding',
        name: PINTU_PRICE_RANGES.sliding.name,
        badge: 'Sliding Silent Roller (TEST 5)',
        desc: '1 Unit pintu geser hemat ruang, rel gantung / rel bawah aluminium presisi, roda bearing roller hening anti-anjlok, kunci hook lock tanam, stopper peredam benturan.',
        minRate: PINTU_PRICE_RANGES.sliding.min,
        maxRate: PINTU_PRICE_RANGES.sliding.max,
        targetRate: PINTU_PRICE_RANGES.sliding.target,
        rate: 'Rp 2.500.000 – Rp 3.500.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Kusen Pintu + Daun Sliding + Rel Atas Bawah + Roller Bearing + Kunci Hook Lock Tanam + Sealant + Pasang',
        rabRatios: { kaca: 0.16, struktur: 0.38, hardware: 0.18, sealant: 0.03, fabrikasi: 0.10, pasang: 0.07, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'folding',
        name: PINTU_PRICE_RANGES.folding.name,
        badge: 'Folding Multi-Leaf',
        desc: 'Sistem pintu lipat bukaan penuh teras/taman, rel gantung heavy duty, engsel kupu-kupu lipat, flush bolt tanam pengunci atas bawah antar daun.',
        minRate: PINTU_PRICE_RANGES.folding.min,
        maxRate: PINTU_PRICE_RANGES.folding.max,
        targetRate: PINTU_PRICE_RANGES.folding.target,
        rate: 'Rp 3.500.000 – Rp 5.000.000+ / unit',
        leadTime: '5–8 Hari Kerja',
        formula: 'Daun Pintu Lipat + Rel Gantung Heavy + Engsel Lipat SUS304 + Flush Bolt + Kaca 5mm + Pasang Presisi',
        rabRatios: { kaca: 0.20, struktur: 0.36, hardware: 0.18, sealant: 0.03, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      }
    ]
  },

  shower: {
    id: 'shower',
    label: 'Shower Screen Kaca Kamar Mandi',
    category: 'glass_shower',
    priceModel: 'glass_shower',
    unit: 'unit',
    unitName: 'Set Shower Screen',
    minOrderValue: 1800000,
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
        badge: 'Framed Ekonomis',
        desc: 'Frame aluminium anodize tahan lembab keliling, kaca tempered 6mm / kaca es buram moru, door seal magnet kedap percikan air, handle knop minimalis.',
        minRate: SHOWER_PRICE_RANGES.framed.min,
        maxRate: SHOWER_PRICE_RANGES.framed.max,
        targetRate: SHOWER_PRICE_RANGES.framed.target,
        rate: 'Rp 1.500.000 – Rp 2.000.000 / unit',
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
        rate: 'Rp 2.000.000 – Rp 2.800.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kaca Tempered 8mm + U-Channel Dinding + Engsel Glass-to-Wall + Handle Handuk L + Sealant Anti Jamur',
        rabRatios: { kaca: 0.40, struktur: 0.16, hardware: 0.16, sealant: 0.04, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'frameless',
        name: SHOWER_PRICE_RANGES.frameless.name,
        badge: 'Luxury Frameless 10mm',
        desc: 'Kaca Tempered 10mm murni frameless bebas bingkai, 2 engsel kuningan SUS304 chrome duty 50kg, pipa stabilizer stainless atas kaca, magnetic seal air 100% kedap.',
        minRate: SHOWER_PRICE_RANGES.frameless.min,
        maxRate: SHOWER_PRICE_RANGES.frameless.max,
        targetRate: SHOWER_PRICE_RANGES.frameless.target,
        rate: 'Rp 2.500.000 – Rp 3.500.000 / unit',
        leadTime: '4–6 Hari Kerja',
        formula: 'Kaca Tempered 10mm Bevel + Engsel SUS304 + Pipa Stabilizer SUS304 + Handle Handuk L + Sealant Dowsil Sanitasi',
        rabRatios: { kaca: 0.42, struktur: 0.08, hardware: 0.22, sealant: 0.04, fabrikasi: 0.08, pasang: 0.08, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  kusen: {
    id: 'kusen',
    label: 'Kusen Aluminium (Profil 3" / 4" SNI)',
    category: 'aluminium',
    priceModel: 'aluminium_profile',
    unit: 'm1',
    unitName: 'Meter Lari (m1)',
    minOrderValue: 1500000,
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
        badge: 'Dacon / Inkalum 3"',
        desc: 'Profil batangan 3" tebal 0.9–1.0mm, anodize/powder coating standar, perakitan siku miter 45° presisi, sekrup fisher baja + sealant netral.',
        minRate: KUSEN_PRICE_RANGES.standard.min,
        maxRate: KUSEN_PRICE_RANGES.standard.max,
        targetRate: KUSEN_PRICE_RANGES.standard.target,
        rate: 'Rp 85.000 – Rp 110.000 / m1',
        leadTime: '2–4 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Sekrup Fisher + Sealant Neutral + Upah Tukang Presisi + Cutting Waste 8%',
        rabRatios: { kaca: 0.00, struktur: 0.54, hardware: 0.08, sealant: 0.08, fabrikasi: 0.12, pasang: 0.08, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'premium',
        name: KUSEN_PRICE_RANGES.premium.name,
        badge: 'Alexindo 4" Heavy',
        desc: 'Profil batangan 4" tebal 1.1–1.3mm kekakuan tinggi, bentangan lebar kokoh, powder coating tahan luntur cuaca eksterior, sealant struktural.',
        minRate: KUSEN_PRICE_RANGES.premium.min,
        maxRate: KUSEN_PRICE_RANGES.premium.max,
        targetRate: KUSEN_PRICE_RANGES.premium.target,
        rate: 'Rp 135.000 – Rp 165.000 / m1',
        leadTime: '3–5 Hari Kerja',
        formula: '(Panjang m1 × Tarif) + Sekrup Fisher Heavy + Sealant Weatherseal + Upah Pasang + Cutting Waste 8%',
        rabRatios: { kaca: 0.00, struktur: 0.56, hardware: 0.08, sealant: 0.07, fabrikasi: 0.12, pasang: 0.07, transport: 0.03, margin: 0.07 }
      }
    ]
  },

  pintu_tempered: {
    id: 'pintu_tempered',
    label: 'Pintu Kaca Frameless Floor Hinge',
    category: 'glass_door',
    priceModel: 'glass_door',
    unit: 'unit',
    unitName: 'Set Daun Pintu',
    minOrderValue: 3500000,
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
        rate: 'Rp 3.250.000 – Rp 3.850.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Kaca Tempered 10mm + Mesin Floor Hinge BTS 84 + Patch Fitting + Pull Handle 60cm + Pasang',
        rabRatios: { kaca: 0.38, struktur: 0.06, hardware: 0.30, sealant: 0.03, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'single_12',
        name: PINTU_TEMPERED_PRICE_RANGES.single_12.name,
        badge: 'Dorma BTS 75V Heavy',
        desc: 'Kaca Tempered 12mm kokoh anti getar, mesin floor hinge Dorma BTS 75V standar gedung komersial, patch fitting SUS304 heavy, pull handle 80cm elegan.',
        minRate: PINTU_TEMPERED_PRICE_RANGES.single_12.min,
        maxRate: PINTU_TEMPERED_PRICE_RANGES.single_12.max,
        targetRate: PINTU_TEMPERED_PRICE_RANGES.single_12.target,
        rate: 'Rp 4.200.000 – Rp 5.250.000 / unit',
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
        rate: 'Rp 7.800.000 – Rp 9.400.000 / unit',
        leadTime: '5–8 Hari Kerja',
        formula: '2 Daun Kaca Tempered 12mm + 2 Mesin Floor Hinge + 4 Patch Fitting + 2 Handle 80cm + Central Lock + Pasang',
        rabRatios: { kaca: 0.36, struktur: 0.06, hardware: 0.34, sealant: 0.03, fabrikasi: 0.08, pasang: 0.06, transport: 0.02, margin: 0.05 }
      }
    ]
  },

  bifold: {
    id: 'bifold',
    label: 'Pintu Lipat Bifold System Aluminium',
    category: 'aluminium',
    priceModel: 'aluminium_bifold',
    unit: 'daun',
    unitName: 'Daun Pintu',
    minOrderValue: 5000000,
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
        badge: 'Inkalum SNI',
        desc: 'Profil aluminium tebal 1.1mm, kaca clear 5mm, rel gantung atas & guide rel bawah bantalan roller bearing tahan beban 120kg, engsel lipat antar daun.',
        minRate: BIFOLD_PRICE_RANGES.standard.min,
        maxRate: BIFOLD_PRICE_RANGES.standard.max,
        targetRate: BIFOLD_PRICE_RANGES.standard.target,
        rate: 'Rp 2.800.000 – Rp 3.500.000 / daun',
        leadTime: '5–7 Hari Kerja',
        formula: '(Jumlah Daun × Tarif) + Rel Gantung + Roller Bearing + Flush Bolt + Kaca 5mm + Pasang',
        rabRatios: { kaca: 0.18, struktur: 0.40, hardware: 0.18, sealant: 0.03, fabrikasi: 0.09, pasang: 0.06, transport: 0.01, margin: 0.05 }
      },
      {
        id: 'premium',
        name: BIFOLD_PRICE_RANGES.premium.name,
        badge: 'Alexindo Heavy 250kg',
        desc: 'Profil Alexindo 1.3mm ekstra kaku, kaca tempered 6–8mm, rel gantung heavy duty suspended tahan 250kg buka tutup sangat halus (whisper quiet), flush floor threshold.',
        minRate: BIFOLD_PRICE_RANGES.premium.min,
        maxRate: BIFOLD_PRICE_RANGES.premium.max,
        targetRate: BIFOLD_PRICE_RANGES.premium.target,
        rate: 'Rp 3.500.000 – Rp 4.800.000 / daun',
        leadTime: '7–10 Hari Kerja',
        formula: '(Jumlah Daun × Tarif) + Rel Heavy Duty 250kg + Engsel SUS304 + Kaca Tempered + Flush Threshold + Pasang',
        rabRatios: { kaca: 0.22, struktur: 0.38, hardware: 0.18, sealant: 0.03, fabrikasi: 0.08, pasang: 0.05, transport: 0.01, margin: 0.05 }
      }
    ]
  },

  etalase: {
    id: 'etalase',
    label: 'Etalase Kaca Toko & Display Counter',
    category: 'aluminium',
    priceModel: 'aluminium_showcase',
    unit: 'unit',
    unitName: 'Unit Etalase',
    minOrderValue: 1200000,
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
        rate: 'Rp 1.200.000 – Rp 1.650.000 / unit',
        leadTime: '3–5 Hari Kerja',
        formula: 'Rangka Hollow Etalase + Kaca 5mm + Roda Rem + Kunci Huben + Perakitan Workshop',
        rabRatios: { kaca: 0.30, struktur: 0.34, hardware: 0.10, sealant: 0.04, fabrikasi: 0.12, pasang: 0.02, transport: 0.02, margin: 0.06 }
      },
      {
        id: 'premium',
        name: ETALASE_PRICE_RANGES.premium.name,
        badge: 'Boutique Display + LED',
        desc: 'Frame aluminium anodize hitam doff / champagne profil tebal, kaca tempered 6mm tahan gores, lampu LED strip tersembunyi warm/white, kunci sentral keamanan.',
        minRate: ETALASE_PRICE_RANGES.premium.min,
        maxRate: ETALASE_PRICE_RANGES.premium.max,
        targetRate: ETALASE_PRICE_RANGES.premium.target,
        rate: 'Rp 2.000.000 – Rp 3.500.000 / unit',
        leadTime: '5–7 Hari Kerja',
        formula: 'Rangka Anodize Hitam + Kaca Tempered 6mm + LED Strip Hidden + Kunci Sentral + Fabrikasi',
        rabRatios: { kaca: 0.32, struktur: 0.32, hardware: 0.12, sealant: 0.04, fabrikasi: 0.10, pasang: 0.02, transport: 0.02, margin: 0.06 }
      }
    ]
  },

  acp: {
    id: 'acp',
    label: 'Fasad ACP Aluminium Composite Panel',
    category: 'facade_acp',
    priceModel: 'acp_facade',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    minOrderValue: 5000000,
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
        badge: 'Seven Interior PE',
        desc: 'Tebal panel 4mm, skin aluminium 0.21mm cat Polyester (PE) untuk dekorasi dinding lobi, resepsionis, cover kolom/pilar & interior toko.',
        minRate: ACP_PRICE_RANGES.interior_pe.min,
        maxRate: ACP_PRICE_RANGES.interior_pe.max,
        targetRate: ACP_PRICE_RANGES.interior_pe.target,
        rate: 'Rp 650.000 – Rp 850.000 / m²',
        leadTime: '4–7 Hari Kerja',
        formula: 'Panel ACP PE + Rangka Hollow 2×4 + Baut Sekrup + Sealant Interior + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.48, hardware: 0.08, sealant: 0.08, fabrikasi: 0.14, pasang: 0.12, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'exterior_pvdf',
        name: ACP_PRICE_RANGES.exterior_pvdf.name,
        badge: 'Seven Outdoor PVDF',
        desc: 'Tebal 4mm skin aluminium 0.30mm coating PVDF tahan panas matahari & hujan garansi warna 10 tahun, rangka hollow galvanis 40×40 anti karat, sealant non-staining.',
        minRate: ACP_PRICE_RANGES.exterior_pvdf.min,
        maxRate: ACP_PRICE_RANGES.exterior_pvdf.max,
        targetRate: ACP_PRICE_RANGES.exterior_pvdf.target,
        rate: 'Rp 850.000 – Rp 1.150.000 / m²',
        leadTime: '6–9 Hari Kerja',
        formula: 'Panel ACP PVDF 0.3mm + Rangka Hollow Galvanis 40×40 + Siku Breket + Baut Rivet + Sealant Non-Staining + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.50, hardware: 0.08, sealant: 0.07, fabrikasi: 0.13, pasang: 0.12, transport: 0.03, margin: 0.07 }
      },
      {
        id: 'heavy_duty_pvdf',
        name: ACP_PRICE_RANGES.heavy_duty_pvdf.name,
        badge: 'Alucobond / Alcopan Grade',
        desc: 'Tebal 4mm skin aluminium 0.50mm cat PVDF kualitas gedung komersial/showroom, rangka besi hollow galvanis tebal 1.6mm + scaffolding kerja aman.',
        minRate: ACP_PRICE_RANGES.heavy_duty_pvdf.min,
        maxRate: ACP_PRICE_RANGES.heavy_duty_pvdf.max,
        targetRate: ACP_PRICE_RANGES.heavy_duty_pvdf.target,
        rate: 'Rp 1.250.000 – Rp 1.650.000 / m²',
        leadTime: '8–14 Hari Kerja',
        formula: 'Panel Heavy PVDF 0.5mm + Rangka Hollow 40×40 1.6mm + Braket Siku + Sealant Dow Corning + Scaffolding + Pasang',
        rabRatios: { kaca: 0.00, struktur: 0.52, hardware: 0.08, sealant: 0.06, fabrikasi: 0.13, pasang: 0.11, transport: 0.03, margin: 0.07 }
      }
    ]
  },

  curtain_wall: {
    id: 'curtain_wall',
    label: 'Curtain Wall Fasad Kaca Komersial',
    category: 'curtain_wall',
    priceModel: 'curtain_wall',
    unit: 'm²',
    unitName: 'Meter Persegi (m²)',
    minOrderValue: 15000000,
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
        badge: 'Ruko & Gedung Kantor',
        desc: 'Rangka mullion aluminium 150mm tebal 1.5mm, kaca Panasap Green / Dark Blue 6mm penolak panas surya, structural sealant Dow Corning, siku baja anchor.',
        minRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.stick_panasap.target,
        rate: 'Rp 1.600.000 – Rp 1.900.000 / m²',
        leadTime: '10–15 Hari Kerja',
        formula: 'Rangka Mullion 150mm + Kaca Panasap 6mm + Structural Silicone + Siku Baja Anchor + Pasang',
        rabRatios: { kaca: 0.32, struktur: 0.32, hardware: 0.07, sealant: 0.06, fabrikasi: 0.09, pasang: 0.07, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'stick_tempered8',
        name: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.name,
        badge: 'Showroom & Facade 8mm',
        desc: 'Rangka mullion aluminium heavy duty 150×50mm tebal 2.0mm, kaca Tempered One-Way Reflective / Stopsol 8mm privasi tinggi & pantul panas optimal.',
        minRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.stick_tempered8.target,
        rate: 'Rp 1.850.000 – Rp 2.450.000 / m²',
        leadTime: '12–18 Hari Kerja',
        formula: 'Mullion Heavy 2.0mm + Kaca Tempered Stopsol 8mm + Braket WF Anchor + Sealant Struktural + Pasang',
        rabRatios: { kaca: 0.35, struktur: 0.31, hardware: 0.07, sealant: 0.05, fabrikasi: 0.09, pasang: 0.06, transport: 0.02, margin: 0.05 }
      },
      {
        id: 'semi_unitized',
        name: CURTAIN_WALL_PRICE_RANGES.semi_unitized.name,
        badge: 'Green Building Low-E',
        desc: 'Kaca Tempered Low-E 10mm hemat energi AC, fabrikasi panel modul semi-unitized presisi workshop, bracket jangkar baja siku 8mm tebal, scaffolding/gondola.',
        minRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.min,
        maxRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.max,
        targetRate: CURTAIN_WALL_PRICE_RANGES.semi_unitized.target,
        rate: 'Rp 2.500.000 – Rp 3.250.000 / m²',
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
if (typeof window !== 'undefined') {
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
    }
  };
  window.pricingConfig = unifiedConfig;
  window.PRICING_CONFIG = unifiedConfig;
}

export default services;
