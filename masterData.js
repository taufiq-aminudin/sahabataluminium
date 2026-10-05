/**
 * ============================================================================
 * SAHABAT KACA ALUMINIUM KARAWANG - MASTER DATA REPOSITORY
 * Single Source of Truth for Services, Projects, Testimonials & Specifications
 * ============================================================================
 */

function factory() {

  const COMPANY = {
    name: 'Sahabat Kaca Aluminium',
    legalName: 'CV. Sahabat Kaca Aluminium Karawang',
    tagline: 'Spesialis Kaca Tempered, Kusen & Fasad Aluminium Bergaransi Resmi SNI',
    phone: '0896-3737-1166',
    phoneFormatted: '+62 896-3737-1166',
    whatsapp: '6289637371166',
    email: 'info@sahabat-aluminium.my.id',
    workshopAddress: 'Jl. Raden Rubaya, Nagasari, Kec. Karawang Barat, Kabupaten Karawang, Jawa Barat 41315',
    googleMapsUrl: 'https://share.google/kTjSPv83HTt47VQWb',
    coordinates: { lat: -6.304243, lng: 107.307567 },
    operatingHours: '08.00 - 18.00 WIB (Buka Setiap Hari)',
    serviceAreas: [
      'Karawang Barat',
      'Karawang Timur',
      'Telukjambe Timur & Barat',
      'Klari & Kosambi',
      'Cikampek & Kotabaru',
      'Rengasdengklok',
      'Kawasan Industri KIIC & Surya Cipta',
      'Cikarang & Jababeka',
      'Cibitung & MM2100',
      'Bekasi Kota & Tambun'
    ]
  };

  const SERVICES = [
    {
      id: 'kusen-aluminium',
      calcKey: 'kusen',
      order: 1,
      slug: 'kusen-aluminium',
      name: 'Kusen Aluminium',
      title: 'Jasa Pasang Kusen Aluminium Karawang Profil 3" & 4" SNI',
      shortTitle: 'Kusen Aluminium',
      badge: 'Profil 3" & 4" SNI',
      image: 'assets/gallery/kusen-aluminium.jpg',
      imageAlt: 'Jasa Pasang Kusen Aluminium Karawang Profil Alexindo Inkalum Presisi',
      galleryImages: [
        'assets/gallery/kusen-aluminium.jpg',
        'assets/gallery/jendela-aluminium.jpg',
        'assets/gallery/pintu-aluminium.jpg'
      ],
      priceStarting: 'Mulai Rp 85.000 / m1',
      priceUnit: 'm1',
      priceRange: 'Rp 85.000 – Rp 165.000 / m1',
      warranty: '18 Bulan Resmi',
      summary: 'Pembuatan & pasang kusen jendela, pintu profil 3 & 4 inch. Siku miter 45° presisi, anti rayap & lapuk seumur hidup.',
      description: 'Fabrikasi dan pemasangan kusen aluminium presisi standar SNI untuk rumah tinggal, ruko, gedung perkantoran, dan pabrik industri di Karawang. Menggunakan profil aluminium pilihan Alexindo, Inkalum, dan Dacon dengan potongan sudut miter 45 derajat dobel spigot anti renggang dan karet EPDM kedap cuaca.',
      models: [
        { name: 'Kusen Profil 3 Inch (Standard)', desc: 'Ukuran 7.6 x 3.8 cm, sangat hemat tempat untuk kamar dan sekat rumah tinggal.', rate: 'Rp 85.000 - Rp 110.000 / m1' },
        { name: 'Kusen Profil 4 Inch (Heavy Duty)', desc: 'Ukuran 10.1 x 4.4 cm, kokoh dan gagah untuk pintu utama, ruko, fasad, dan bukaan tinggi.', rate: 'Rp 135.000 - Rp 165.000 / m1' },
        { name: 'Kusen Finishing Serat Kayu (Wood Grain)', desc: 'Tampilan alami urat kayu berpadu ketahanan aluminium anti rayap seumur hidup.', rate: 'Rp 145.000 - Rp 175.000 / m1' }
      ],
      materials: [
        'Alexindo Tebal 1.15 - 1.35 mm (Premium Grade)',
        'Inkalum Tebal 1.0 - 1.15 mm (Standard SNI)',
        'Dacon Tebal 0.95 - 1.05 mm (Ekonomis Kuat)',
        'Karet Gasket Sintetis EPDM Tahan Panas & UV',
        'Sekrup Stainless SUS304 & Spigot Aluminium Solid'
      ],
      specifications: {
        dimensi: '3 Inch (7.6x3.8cm) & 4 Inch (10.1x4.4cm)',
        ketebalan: '1.0 mm s/d 1.35 mm Standar SNI',
        warna: 'Hitam Doff, Putih Powder Coating, Cokelat Anodized, Silver Natural, Serat Kayu',
        sambungan: 'Miter Joint 45° Potong Otomatis Double Blade + Kunci Spigot',
        toleransi: 'Presisi laser leveling ±1 mm on-site',
        garansi: 'Garansi kebocoran sudut 18 bulan'
      },
      faq: [
        {
          q: 'Apa perbedaan kusen aluminium 3 inch dan 4 inch?',
          a: 'Kusen 3 inch memiliki penampang 7.6 x 3.8 cm, cocok untuk kusen kamar tidur, jendela kamar, atau perumahan standar. Kusen 4 inch (10.1 x 4.4 cm) memiliki profil lebih lebar dan tebal, sangat ideal untuk pintu utama, pintu balkon, ruko, maupun gedung kantor.'
        },
        {
          q: 'Apakah kusen aluminium bisa bocor tempias air hujan?',
          a: 'Tidak. Kami memotong profil dengan mesin otomatis sudut miter 45 derajat presisi, mengunci dengan spigot ganda di dalam profil, serta mengaplikasikan sealant elastis neutral weatherproof pada perimeter luar dan karet EPDM pada sisi kaca.'
        }
      ],
      portfolioIds: ['proj-08', 'proj-14', 'proj-16']
    },
    {
      id: 'pintu-aluminium',
      calcKey: 'pintu',
      order: 2,
      slug: 'pintu-aluminium',
      name: 'Pintu Aluminium',
      title: 'Jasa Pasang Pintu Aluminium Karawang (Sliding, Swing, Bifold)',
      shortTitle: 'Pintu Aluminium',
      badge: 'Sliding • Swing • Bifold',
      image: 'assets/gallery/pintu-aluminium.jpg',
      imageAlt: 'Jasa Pasang Pintu Aluminium Karawang Model Sliding Swing Bifold',
      galleryImages: [
        'assets/gallery/pintu-aluminium.jpg',
        'assets/gallery/pintu-sliding.jpg',
        'assets/gallery/pintu-kaca-putih.jpg'
      ],
      priceStarting: 'Mulai Rp 1.250.000 / unit',
      priceUnit: 'unit',
      priceRange: 'Rp 1.250.000 – Rp 3.500.000+ / unit',
      warranty: '24 Bulan Resmi',
      summary: 'Pintu sliding geser rel gantung, pintu swing kupu tarung, dan pintu lipat bifold taman belakang. Rel SUS304 anti anjlok.',
      description: 'Pemasangan pintu aluminium modern dengan berbagai pilihan sistem bukaan: sliding geser rel gantung senyap, swing satu daun maupun kupu tarung dua daun, hingga sistem pintu lipat bifold opening 100%. Didukung hardware Dekkson stainless SUS304 anti karat dan roda nilon heavy-duty tahan beban.',
      models: [
        { name: 'Pintu Sliding Geser (1 - 4 Daun)', desc: 'Rel gantung atas tanpa rel bawah atau rel tanam stainless rata lantai.', rate: 'Rp 1.500.000 - Rp 2.500.000 / unit' },
        { name: 'Pintu Swing Kupu Tarung & Single', desc: 'Pintu bukaan ayun dengan lockset multi-point dan handle panjang modern.', rate: 'Rp 1.250.000 - Rp 2.000.000 / unit' },
        { name: 'Pintu Lipat Bifold (3 - 8 Daun)', desc: 'Bukaan maksimal 100% menghubungkan ruang keluarga dengan taman belakang.', rate: 'Rp 1.850.000 - Rp 2.400.000 / daun' }
      ],
      materials: [
        'Profil Daun Pintu Aluminium Ekstrusi Lebar 8-10 cm Tebal 1.2-1.4 mm',
        'Kaca Tempered 8mm / Kaca Polos 5mm / Kaca Ribbed Moru / Panel Spandrel',
        'Roda Bearing Nilon Heavy-Duty Dekkson (Kapasitas 120 kg/daun)',
        'Rel Gantung / Rel Tanam Stainless Steel SUS304 Anti Aus',
        'Kunci Mortise Lockset Dekkson & Handle Tarik Stainless'
      ],
      specifications: {
        dimensi: 'Single: 80-90x210-240cm | Double: 160-180x210-240cm | Custom Survey',
        ketebalan: '1.2 mm s/d 1.4 mm',
        kaca: 'Tempered 8mm, Clear 5mm, Rayban Hitam, Moru Glass, Spandrel Aluminium',
        hardware: 'Dekkson / Dorma / Hampton SUS304',
        fitur: 'Soft-closing damper, stopper rel gantung, anti-jump safety pin',
        garansi: 'Garansi aksesoris rel & kunci 24 bulan'
      },
      faq: [
        {
          q: 'Apakah pintu sliding aluminium mudah anjlok dari rel?',
          a: 'Tidak. Kami menggunakan sistem roda gantung heavy-duty nilon berbearing baja dengan pin pengaman anti-jump yang mengunci roda di dalam rel overhead tebal 2 mm.'
        },
        {
          q: 'Apakah pintu lipat bifold bisa dipasang rata dengan lantai?',
          a: 'Bisa. Kami menyediakan opsi rel tanam (flush bottom track) stainless SUS304 setinggi permukaan keramik/lantai parket sehingga ramah anak dan lansia tanpa resiko tersandung.'
        }
      ],
      portfolioIds: ['proj-03', 'proj-04', 'proj-14', 'proj-16', 'proj-19']
    },
    {
      id: 'jendela-aluminium',
      calcKey: 'jendela',
      order: 3,
      slug: 'jendela-aluminium',
      name: 'Jendela Aluminium',
      title: 'Jasa Pasang Jendela Aluminium Karawang (Casement, Sliding, Jungkit)',
      shortTitle: 'Jendela Aluminium',
      badge: 'Casement • Sliding • Jungkit',
      image: 'assets/gallery/jendela-aluminium.jpg',
      imageAlt: 'Jasa Pasang Jendela Aluminium Karawang Casement Sliding Jungkit',
      galleryImages: [
        'assets/gallery/jendela-aluminium.jpg',
        'assets/gallery/jendela-sliding.jpg',
        'assets/gallery/jendela-kaca.jpg'
      ],
      priceStarting: 'Mulai Rp 550.000 / daun',
      priceUnit: 'daun',
      priceRange: 'Rp 550.000 – Rp 1.400.000 / daun',
      warranty: '24 Bulan Resmi',
      summary: 'Jendela casement buka samping, sliding geser hemat ruang, dan jungkit awning. Kedap suara dan anti rembesan air hujan.',
      description: 'Fabrikasi jendela aluminium modern tahan cuaca ekstrem dan kedap suara untuk hunian serta perkantoran di Karawang. Pilihan model casement buka samping yang rapat, jendela jungkit atas (awning) aman saat hujan gerimis, dan jendela sliding praktis hemat ruang.',
      models: [
        { name: 'Jendela Casement (Buka Samping)', desc: 'Tingkat kekedapan tertinggi dengan engsel friction stay dan grendel rambuncis rapat.', rate: 'Rp 650.000 - Rp 950.000 / daun' },
        { name: 'Jendela Jungkit / Awning Window', desc: 'Bukaan dorong bawah keluar, sirkulasi udara tetap aman saat hujan rintik-rintik.', rate: 'Rp 550.000 - Rp 850.000 / daun' },
        { name: 'Jendela Sliding Geser Horizontal', desc: 'Sistem geser dua atau empat daun yang tidak memakan area teras luar maupun gorden.', rate: 'Rp 700.000 - Rp 1.100.000 / set' }
      ],
      materials: [
        'Kusen Jendela Aluminium Profil SNI Tebal 1.15 mm',
        'Kaca Polos Clear 5mm / Kaca Rayban Panasap 5mm / Kaca Es Frosted',
        'Friction Stay Engsel Geser Stainless Steel SUS304 Anti Patah',
        'Kunci Rambuncis Dekkson / Casement Handle Tebal',
        'Karet EPDM Weatherstrip & Lubang Drainage Anti Banjir'
      ],
      specifications: {
        dimensi: 'Casement: 60x120cm, 70x140cm | Sliding: 120x120cm, 160x140cm | Custom Survey',
        ketebalan: 'Kusen 1.15 mm, Daun Jendela 1.2 mm',
        peredam: 'Acoustic seal meredam kebisingan hingga STC 32 dB',
        finishing: 'Powder coating tahan cuaca atau anodized silver/brown',
        drainage: 'Sistem weep hole anti genangan air di rel',
        garansi: 'Garansi kerapatan seal & aksesoris 24 bulan'
      },
      faq: [
        {
          q: 'Apakah air hujan bisa merembes lewat celah jendela aluminium?',
          a: 'Tidak. Jendela kami dirancang dengan rongga bertingkat, lubang pembuangan air (weep holes) berkatup satu arah, dan gasket karet EPDM ganda keliling yang menekan rapat saat dikunci.'
        },
        {
          q: 'Kaca apa yang terbaik untuk meredam panas terik matahari Karawang?',
          a: 'Kami menyarankan Kaca Panasap Dark Grey atau Kaca Stopsol One-Way yang mampu memantulkan radiasi panas UV hingga 65% dan menjaga ruangan tetap sejuk.'
        }
      ],
      portfolioIds: ['proj-08', 'proj-13', 'proj-24']
    },
    {
      id: 'pintu-kaca-tempered',
      calcKey: 'pintu_tempered',
      order: 4,
      slug: 'pintu-kaca-tempered',
      name: 'Pintu Kaca Tempered',
      title: 'Jasa Pasang Pintu Kaca Tempered Karawang (Frameless & Floor Hinge)',
      shortTitle: 'Pintu Kaca Tempered',
      badge: 'Tempered 10mm & 12mm',
      image: 'assets/gallery/pintu-kaca.jpg',
      imageAlt: 'Jasa Pasang Pintu Kaca Tempered Karawang Frameless Floor Hinge Dekkson',
      galleryImages: [
        'assets/gallery/pintu-kaca.jpg',
        'assets/gallery/pintu-kaca-putih.jpg'
      ],
      priceStarting: 'Paket Mulai Rp 2.900.000 / daun',
      priceUnit: 'daun',
      priceRange: 'Rp 2.900.000 – Rp 5.250.000 / daun',
      warranty: '36 Bulan Hidrolik Floor Hinge',
      summary: 'Pintu kaca frameless floor hinge Dekkson/Dorma untuk ruko, kantor, bank & kafe. Desain mewah & garansi hidrolik engsel.',
      description: 'Pemasangan pintu kaca frameless floor hinge bersertifikat SNI kaca tempered 10mm & 12mm Asahimas. Sangat cocok untuk entrance toko ruko, kantor perbankan, lobi hotel, kafe, dan showroom di Karawang. Dilengkapi mesin engsel tanam lantai Dekkson/Dorma dengan katup oli hidrolik stabil anti hentak.',
      models: [
        { name: 'Pintu Frameless Single Leaf (1 Daun)', desc: 'Ukuran standar 90x210-240 cm dengan patch fitting SUS304 dan floor hinge.', rate: 'Rp 3.250.000 - Rp 3.850.000 / paket' },
        { name: 'Pintu Frameless Double Leaf (Kupu Tarung)', desc: 'Dua daun bukaan lebar 180-200 cm untuk akses utama ruko, bank, dan kantor.', rate: 'Rp 6.500.000 - Rp 7.500.000 / paket' },
        { name: 'Pintu Kaca Sliding Otomatis Sensor', desc: 'Dilengkapi motor gerak otomatis microwave radar sensor minimarket & apotek.', rate: 'Rp 14.500.000 - Rp 18.000.000 / set' }
      ],
      materials: [
        'Kaca Tempered Clear 10mm atau 12mm SNI Asahimas (Safety Glass)',
        'Floor Hinge Tanam Lantai Dekkson FH84 / Dorma BTS 75V',
        'Top Patch, Bottom Patch, US-10 Bottom Lock SUS304 Stainless Steel',
        'Handle Tubular / Bulat Panjang 80 - 150 cm Stainless Steel SUS304',
        'Stiker Sandblast Motif Logo / Garis Buram Privasi'
      ],
      specifications: {
        ketebalan: '10 mm atau 12 mm Full Tempered Polished Flat Edge',
        kekuatan: 'Kekuatan benturan 5x lipat kaca biasa, pecahan granul tumpul jagung',
        mesinLantai: 'Floor hinge oil buffer hidrolik fitur stop 90° & 115°',
        finishingHardware: 'Stainless Steel Satin SUS304 Tahan Karat',
        standar: 'SNI ISO 9001 & AS/NZS Safety Standards',
        garansi: 'Garansi mesin floor hinge 36 bulan'
      },
      faq: [
        {
          q: 'Apakah pintu kaca tempered bisa pecah dan membahayakan pengunjung?',
          a: 'Kaca tempered kami melewati proses pemanasan 700°C lalu pendinginan cepat berstandar SNI. Jika terjadi benturan ekstrim, kaca akan pecah menjadi butiran kristal tumpul seukuran biji jagung tanpa sudut tajam runcing.'
        },
        {
          q: 'Berapa lama garansi mesin engsel tanam floor hinge?',
          a: 'Kami memberikan garansi mesin floor hinge Dekkson / Dorma selama 36 bulan (3 tahun). Jika terjadi kebocoran oli atau pintu menutup terlalu kencang, tim teknisi kami akan menyetel atau menggantinya gratis.'
        }
      ],
      portfolioIds: ['proj-02', 'proj-18', 'proj-21']
    },
    {
      id: 'partisi-kaca-aluminium',
      calcKey: 'partisi',
      order: 5,
      slug: 'partisi-kaca-aluminium',
      name: 'Partisi Kaca Aluminium',
      title: 'Jasa Pasang Partisi Kaca Aluminium Karawang (Kantor, Ruko & Pabrik)',
      shortTitle: 'Partisi Kaca',
      badge: 'Kantor & Pabrik KIIC',
      image: 'assets/gallery/partisi-aluminium.jpg',
      imageAlt: 'Jasa Pasang Partisi Kaca Aluminium Karawang Sekat Ruang Kantor Rapat',
      galleryImages: [
        'assets/gallery/partisi-aluminium.jpg',
        'assets/gallery/jendela-kaca.jpg'
      ],
      priceStarting: 'Mulai Rp 550.000 / m2',
      priceUnit: 'm²',
      priceRange: 'Rp 550.000 – Rp 1.350.000 / m²',
      warranty: '24 Bulan Resmi',
      summary: 'Sekat kaca ruang rapat, kantor staff, cleanroom pabrik Karawang. Akustik kedap suara & stiker sandblast.',
      description: 'Spesialis instalasi sekat partisi kaca kantor, ruang rapat, laboratorium cleanroom pabrik industri KIIC & Suryacipta Karawang, hingga sekat dapur minimalis perumahan. Menghadirkan kesan ruangan lapang, mewah, pencahayaan alami optimal, serta insulasi suara rapat internal yang terjaga.',
      models: [
        { name: 'Partisi Full Glass Frameless Office', desc: 'Panel kaca tempered 10/12mm dengan U-channel aluminium tanam minimalis.', rate: 'Rp 750.000 - Rp 1.150.000 / m²' },
        { name: 'Partisi Kusen Aluminium 4" Modul Kotak', desc: 'Rangka kusen Alexindo 4 inch dengan panel kaca 8mm & pintu swing/sliding.', rate: 'Rp 550.000 - Rp 950.000 / m²' },
        { name: 'Partisi Dapur Moru Glass / Fluted', desc: 'Sekat dapur basah dan kering dengan motif kaca garis tekstur elegan modern.', rate: 'Rp 850.000 - Rp 1.250.000 / m²' }
      ],
      materials: [
        'Kusen Aluminium Alexindo / Inkalum 3 & 4 Inch Finishing Black/Silver/White',
        'Kaca Clear Tempered 8mm / 10mm / 12mm SNI',
        'Kaca Fluted Moru Glass (Tekstur Garis Vertikal)',
        'Acoustic Sealant Silikon & Gasket Ganda Kedap Suara',
        'Stiker Kaca Film Buram Sandblast Custom Cutting Logo'
      ],
      specifications: {
        tinggiMaksimal: 'Hingga 4.5 meter modul bentangan tinggi',
        peredamSuara: 'Akustik STC 38 - 42 dB peredam percakapan ruang rapat',
        integrasiPintu: 'Bisa dipadukan pintu kaca floor hinge, swing kusen, atau sliding',
        finishingKusen: 'Powder coating matte black, anodized silver, atau white gloss',
        garansi: '24 bulan kekokohan struktur partisi'
      },
      faq: [
        {
          q: 'Apakah partisi kaca kantor bisa kedap suara untuk ruang direksi?',
          a: 'Bisa. Kami mengombinasikan kusen profil 4 inch, kaca tebal 10-12mm atau sistem double glass, seal akustik perimeter, dan gasket karet kedap udara yang efektif meredam suara hingga STC 42 dB.'
        },
        {
          q: 'Bisa sekalian dipasangkan stiker kaca film sandblast buram?',
          a: 'Bisa sekali. Kami menyediakan stiker kaca film buram sandblast polos, motif garis minimalis, maupun custom cutting logo perusahaan Anda.'
        }
      ],
      portfolioIds: ['proj-01', 'proj-05', 'proj-12', 'proj-20']
    },
    {
      id: 'kanopi-kaca-tempered',
      calcKey: 'kanopi',
      order: 6,
      slug: 'kanopi-kaca-tempered',
      name: 'Kanopi Kaca Tempered',
      title: 'Jasa Pasang Kanopi Kaca Tempered Karawang (Carport & Skylight)',
      shortTitle: 'Kanopi Kaca',
      badge: 'Carport & Skylight',
      image: 'assets/gallery/kanopi-kaca.jpg',
      imageAlt: 'Jasa Pasang Kanopi Kaca Tempered Karawang Carport Atap Skylight Rangka Hollow',
      galleryImages: [
        'assets/gallery/kanopi-kaca.jpg',
        'assets/gallery/kanopi-kaca-carport.svg'
      ],
      priceStarting: 'Mulai Rp 1.250.000 / m2',
      priceUnit: 'm²',
      priceRange: 'Rp 1.250.000 – Rp 2.800.000 / m²',
      warranty: '36 Bulan Struktur & 12 Bulan Sealant',
      summary: 'Kanopi atap kaca tempered 8–10mm & laminated 5+5mm. Rangka besi hollow galvanis tebal 2mm anti karat & anti bocor.',
      description: 'Pemasangan kanopi atap kaca tempered dan laminated untuk carport mobil rumah mewah, teras belakang, koridor kanopi ruko, dan skylight void tangga di Karawang. Struktur rangka besi hollow galvanis tebal 2 mm dilapisi cat epoxy anti karat dan lem sealant struktural tahan radiasi matahari.',
      models: [
        { name: 'Kanopi Carport Kaca Tempered 10mm', desc: 'Atap kaca bening/rayban tebal 10mm dengan rangka hollow 100x50x2mm.', rate: 'Rp 1.550.000 - Rp 1.850.000 / m²' },
        { name: 'Kanopi Kaca Tempered Laminated 5+5mm', desc: 'Safety glass ganda film PVB 0.76mm anti-jatuh jika kaca retak.', rate: 'Rp 2.100.000 - Rp 2.800.000 / m²' },
        { name: 'Skylight Void Atap Rumah Modern', desc: 'Penerangan alami di atas tangga atau taman indoor tanpa resiko tempias.', rate: 'Rp 1.650.000 - Rp 2.200.000 / m²' }
      ],
      materials: [
        'Kaca Tempered 8mm / 10mm / Tempered Laminated 5+5mm PVB Interlayer',
        'Rangka Hollow Galvanis 50x100mm & 100x100mm Tebal 2.0 - 2.3 mm SNI',
        'Pengecatan 3 Lapis: Zinc Chromate Primer + Epoxy + Cat Duco Polyurethane',
        'Structural Sealant Dow Corning Dowsil 795 Anti UV & Anti Jamur',
        'Talang Air Tersembunyi (Hidden Gutter) Stainless Steel'
      ],
      specifications: {
        kemiringanAtap: 'Standar 5° - 10° memastikan debit air hujan mengalir deras tanpa genangan',
        ketahananBeban: 'Mampu menahan beban injak teknisi perawatan & benturan benda jatuh',
        safetyFilm: 'Opsi PVB film laminated kaca tidak akan berhamburan jatuh',
        rangkaBaja: 'Besi hollow galvanis anti karat atau baja WF 150',
        garansi: 'Garansi struktur 3 tahun & garansi kebocoran seal 1 tahun'
      },
      faq: [
        {
          q: 'Apakah kanopi kaca aman jika tertimpa dahan pohon atau genteng jatuh?',
          a: 'Sangat aman, terutama tipe Tempered Laminated 5+5mm PVB. Kaca laminated terdiri dari 2 lembar kaca tempered yang disatukan film PVB tebal. Jika terjadi benturan ekstrim, kaca tetap merekat utuh di rangka tanpa tembus atau jatuh menimpa kendaraan di bawahnya.'
        },
        {
          q: 'Apakah kaca kanopi tidak akan bocor pada sambungannya?',
          a: 'Kami menggunakan sealant struktural kelas industri Dow Corning Dowsil 795 yang memiliki elastisitas tinggi terhadap pemuaian panas matahari dan tahan cuaca hujan selama puluhan tahun.'
        }
      ],
      portfolioIds: ['proj-07', 'proj-15', 'proj-22']
    },
    {
      id: 'shower-kaca',
      calcKey: 'shower',
      order: 7,
      slug: 'shower-kaca',
      name: 'Shower Kaca',
      title: 'Jasa Pasang Shower Kaca Karawang (Sekat Kamar Mandi Tempered 10mm)',
      shortTitle: 'Shower Kaca',
      badge: 'Kamar Mandi Mewah',
      image: 'assets/gallery/shower-kaca.jpg',
      imageAlt: 'Jasa Pasang Shower Kaca Karawang Sekat Kamar Mandi Tempered 10mm',
      galleryImages: [
        'assets/gallery/shower-kaca.jpg',
        'assets/gallery/pintu-kamar-mandi.jpg'
      ],
      priceStarting: 'Paket Mulai Rp 1.650.000 / unit',
      priceUnit: 'unit',
      priceRange: 'Rp 1.650.000 – Rp 3.500.000 / unit',
      warranty: '24 Bulan Resmi',
      summary: 'Sekat walk-in shower & pintu swing kamar mandi kaca tempered 10mm. Kamar mandi tetap kering, bersih & higienis.',
      description: 'Pemasangan sekat kaca pembatas area basah dan kering (dry bathroom) untuk kamar mandi hotel dan rumah tinggal modern di Karawang. Menggunakan kaca tempered 10mm anti jamur dengan hardware engsel kaca-ke-dinding (glass to wall) dan klem stainless SUS304 anti karat dari air sabun.',
      models: [
        { name: 'Sekat Shower Walk-In Fixed (Tanpa Pintu)', desc: 'Satu panel kaca mati tempered 10mm dengan header rod stabilizer ke dinding.', rate: 'Rp 1.650.000 - Rp 2.200.000 / paket' },
        { name: 'Shower Box L-Shape Sudut (Pintu Swing)', desc: 'Model sudut 90 derajat kombinasi kaca mati dan pintu ayun dengan seal magnetik.', rate: 'Rp 3.200.000 - Rp 4.200.000 / paket' },
        { name: 'Shower Screen Geser / Sliding Glass', desc: 'Cocok untuk kamar mandi mungil dengan rel sliding gantung stainless minimalis.', rate: 'Rp 2.800.000 - Rp 3.800.000 / paket' }
      ],
      materials: [
        'Kaca Tempered Clear 10mm SNI Asahimas Flat Polished Edge',
        'Engsel Kaca ke Dinding Glass-to-Wall SUS304 Heavy-Duty',
        'Pipa Header & Batang Stabilizer Stainless Steel SUS304',
        'Seal Strip Magnetik & Strip Sirip Silikon Bawah Anti Bocor Air',
        'Silicone Sealant Sanitari Khusus Area Basah Anti-Jamur'
      ],
      specifications: {
        dimensi: 'Panel Lurus: 90-150x200cm | Sudut L: 90x90x200cm s/d 120x120x200cm',
        ketebalan: '10 mm Tempered Safety Glass',
        kunciEngsel: 'Engsel self-closing 25° dengan penahan 90°',
        kebersihan: 'Permukaan licin mudah dibersihkan dari kerak air dan residu sabun',
        garansi: 'Garansi aksesoris engsel stainless 24 bulan'
      },
      faq: [
        {
          q: 'Apakah engsel shower kaca tidak akan berkarat terkena air dan sabun mandi?',
          a: 'Aksesoris engsel dan baut klem yang kami gunakan 100% Stainless Steel grade SUS304 asli tahan karat terhadap air sabun dan kelembapan kamar mandi.'
        },
        {
          q: 'Bagaimana cara mencegah air shower merembes keluar area kering?',
          a: 'Kami memasang magnetic seal strip pada bibir pintu dan strip sirip silikon elastis di bawah daun pintu yang menahan cipratan air tetap di dalam bak shower.'
        }
      ],
      portfolioIds: ['proj-09', 'proj-10']
    },
    {
      id: 'etalase-kaca',
      calcKey: 'etalase',
      order: 8,
      slug: 'etalase-kaca',
      name: 'Etalase Kaca',
      title: 'Jasa Pembuatan Etalase Kaca Karawang (Toko, HP, & Display Custom)',
      shortTitle: 'Etalase Kaca',
      badge: 'Toko & Konter HP',
      image: 'assets/gallery/etalase-kaca.jpg',
      imageAlt: 'Jasa Pembuatan Etalase Kaca Karawang Display Konter Toko Lemari Kaca',
      galleryImages: [
        'assets/gallery/etalase-kaca.jpg',
        'assets/gallery/etalase-kaca-counter.svg'
      ],
      priceStarting: 'Mulai Rp 850.000',
      priceUnit: 'unit',
      priceRange: 'Rp 850.000 – Rp 3.500.000 / unit',
      warranty: '12 Bulan Resmi',
      summary: 'Pembuatan etalase konter HP, display toko emas, etalase warung makan/kue & lemari tas custom. Rangka kuat & roda rem.',
      description: 'Pembuatan aneka etalase kaca custom rangka profil aluminium untuk toko kelontong, konter handphone, display toko emas, lemari display tas/sepatu, hingga etalase warung makanan di Karawang. Dibuat dengan presisi tinggi, kaca bening kokoh, rak bertingkat, dan roda putar 360 derajat dengan kunci rem.',
      models: [
        { name: 'Etalase Konter HP & Aksesoris', desc: 'Tinggi 1 meter dengan rak kaca bertingkat, pintu geser rel kunci, dan laci kasir.', rate: 'Rp 850.000 - Rp 1.500.000 / unit' },
        { name: 'Etalase Display Toko Emas / Perhiasan', desc: 'Full kaca tempered flat dengan lampu LED strip warm white tanam premium.', rate: 'Rp 2.000.000 - Rp 3.500.000 / unit' },
        { name: 'Etalase Warung Makan / Makanan Bersih', desc: 'Kaca penutup higienis anti lalat dan debu dengan ventilasi sirkulasi udara.', rate: 'Rp 950.000 - Rp 1.800.000 / unit' }
      ],
      materials: [
        'Rangka Aluminium Profil Hollow & Siku Tebal Kokoh Tahan Beban',
        'Kaca Polos Clear 5mm / Kaca Tempered 8mm Kuat Anti Gores',
        'Roda Karet Swivel Caster 360° dengan Kunci Rem Kaki',
        'Rel Geser U-Track Nilon Halus & Kunci Gergaji Etalase',
        'Lampu LED Strip Tersembunyi (Warm White / Pure White)'
      ],
      specifications: {
        dimensi: 'Panjang 100 - 300 cm, Lebar 40 - 60 cm, Tinggi 90 - 180 cm (Custom)',
        rak: '2 s/d 4 tingkat rak kaca tebal dengan penopang braket stainless',
        mobilitas: '4 s/d 6 unit roda caster kuat digeser saat display toko ditata',
        keamanan: 'Kunci gerigi rel geser menjaga keamanan produk dagangan',
        garansi: 'Garansi sambungan rangka 12 bulan'
      },
      faq: [
        {
          q: 'Apakah bisa pesan etalase kaca ukuran custom sesuai luas toko saya?',
          a: 'Bisa sekali! Kami menerima pembuatan etalase custom 100% menyesuaikan panjang, lebar, jumlah tingkat rak, maupun model bertingkat L-shape toko Anda.'
        },
        {
          q: 'Apakah etalase bisa diantar langsung ke lokasi di Karawang?',
          a: 'Bisa. Kami melayani pengiriman langsung ke alamat toko, ruko, atau rumah Anda di seluruh wilayah Karawang dan Cikarang dalam kondisi siap pakai.'
        }
      ],
      portfolioIds: ['proj-23']
    }
  ];

  // Helper getters
  function getAllServices() {
    return SERVICES;
  }

  function getServiceById(id) {
    return SERVICES.find(s => s.id === id || s.calcKey === id || s.slug === id);
  }

  function getServiceBySlug(slug) {
    const clean = slug.replace(/^\/layanan\//, '').replace(/^jasa-/, '').replace(/-karawang$/, '');
    return SERVICES.find(s => s.slug === slug || s.slug === clean || s.id === clean);
  }

  return {
    COMPANY,
    SERVICES,
    getAllServices,
    getServiceById,
    getServiceBySlug
  };
}

const masterData = factory();

export default masterData;
export const COMPANY = masterData.COMPANY;
export const SERVICES = masterData.SERVICES;
export const getAllServices = masterData.getAllServices;
export const getServiceById = masterData.getServiceById;
export const getServiceBySlug = masterData.getServiceBySlug;

if (typeof window !== 'undefined') {
  window.MASTER_DATA = masterData;
}

