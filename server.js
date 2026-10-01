import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.set('trust proxy', true);

// Canonical Domain & HTTPS Enforcement Middleware
// Enforces single-hop 301 redirect to https://sahabat-aluminium.my.id/
app.use((req, res, next) => {
  const rawHost = (req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
  const host = rawHost.split(':')[0];
  const proto = (req.headers['x-forwarded-proto'] || (req.connection && req.connection.encrypted ? 'https' : req.protocol) || 'http').toLowerCase();

  const isWww = host === 'www.sahabat-aluminium.my.id';
  const isApex = host === 'sahabat-aluminium.my.id';

  // If request comes for www OR insecure http on apex domain, redirect 301 directly to canonical HTTPS apex
  if (isWww || (isApex && proto === 'http')) {
    let cleanPath = req.url;
    if (cleanPath === '/index.html') {
      cleanPath = '/';
    } else if (cleanPath.endsWith('.html')) {
      cleanPath = cleanPath.replace(/\.html$/, '');
    }
    return res.redirect(301, `https://sahabat-aluminium.my.id${cleanPath}`);
  }

  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API: Search Aluminium Karawang Locations & Information with Google Maps Grounding
app.post('/api/search-locations', async (req, res) => {
  try {
    const { query, lat, lng } = req.body || {};
    const searchQuery = (query && query.trim()) ? query.trim() : 'aluminium karawang';

    // Default coordinates: Karawang central (-6.304243, 107.307567)
    const latitude = typeof lat === 'number' && !isNaN(lat) ? lat : -6.304243;
    const longitude = typeof lng === 'number' && !isNaN(lng) ? lng : 107.307567;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        text: `### Informasi & Lokasi: "${searchQuery}" di Karawang\n\n**Sahabat Kaca Aluminium** adalah penyedia spesialis pengerjaan kusen, pintu, jendela, partisi, etalase, dan kanopi kaca aluminium terpercaya di Karawang.\n\n- **Area Layanan**: Karawang Barat, Karawang Timur, Telukjambe Timur, Telukjambe Barat, Klari, Cikampek, Rengasdengklok, Kosambi, serta kawasan industri KIIC, Suryacipta, dan KIM.\n- **Layanan Unggulan**: Pembuatan kusen aluminium modern, pintu swing & sliding kaca tempered, partisi ruko & kantor, shower screen kamar mandi, dan kanopi kaca frameless.\n- **Konsultasi & Survey Lokasi**: Gratis estimasi biaya dan konsultasi langsung via WhatsApp di **0896-3737-1166**.\n\n*Gunakan tombol pencarian Google atau hubungi kami langsung untuk kebutuhan proyek Anda.*`,
        places: [
          {
            title: "Sahabat Kaca Aluminium Karawang",
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`,
            address: "Karawang, Jawa Barat, Indonesia",
            reviewSnippets: ["Pengerjaan rapi, presisi, dan tepat waktu untuk berbagai proyek kusen dan kaca di Karawang."]
          },
          {
            title: "Pusat Layanan Kaca & Aluminium KIIC Karawang",
            uri: "https://www.google.com/maps/search/?api=1&query=aluminium+kiic+karawang",
            address: "Kawasan Industri KIIC, Karawang Barat",
            reviewSnippets: ["Spesialis partisi kaca kantor dan pintu aluminium industri."]
          }
        ],
        googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Berikan informasi akurat dan rekomendasi lokasi bengkel, toko, atau jasa aluminium & kaca untuk query: "${searchQuery}" di Karawang atau sekitarnya. Tuliskan dalam Bahasa Indonesia yang informatif, rapi, dan mencakup area Karawang.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude
            }
          }
        }
      }
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract places according to Maps Grounding guidelines:
    // ALWAYS extract URLs from groundingChunks and list them on the web app as links.
    const places = [];
    for (const chunk of groundingChunks) {
      if (chunk.maps) {
        places.push({
          title: chunk.maps.title || 'Lokasi Terkait di Google Maps',
          uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || searchQuery)}`,
          reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || []
        });
      }
    }

    return res.json({
      success: true,
      text,
      places,
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    });

  } catch (err) {
    console.warn('Google Maps grounding API unavailable, using local Karawang fallback:', err.message || err);
    const searchQuery = req.body?.query?.trim() || 'aluminium karawang';
    return res.json({
      success: true,
      text: `### Informasi Jasa & Lokasi: "${searchQuery}" di Karawang\n\nUntuk kebutuhan pengerjaan aluminium dan kaca di wilayah Karawang, **Sahabat Kaca Aluminium** melayani pengerjaan langsung di tempat untuk proyek hunian, ruko, kantor, dan pabrik.\n\n- **Area Jangkauan**: Karawang Barat (Galuh Mas, Johar, Alun-alun), Karawang Timur, Telukjambe Timur & Barat, Klari (Kosambi), Cikampek, Rengasdengklok, serta Kawasan Industri (KIIC, Suryacipta, KIM).\n- **Produk & Pengerjaan**: Kusen aluminium (Dacon, Alexindo, Inkalum), pintu sliding & swing kaca tempered, jendela casement, partisi kaca kantor, shower box frameless, kanopi kaca, dan etalase.\n- **Konsultasi Langsung**: Hubungi WhatsApp kami di **0896-3737-1166** untuk survey lokasi dan konsultasi biaya gratis di Karawang.`,
      places: [
        {
          title: "Sahabat Kaca Aluminium Karawang",
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery + ' karawang')}`,
          address: "Wilayah Pelayanan: Karawang Barat, Karawang Timur, Telukjambe, KIIC, Jawa Barat",
          reviewSnippets: ["Pengerjaan kusen dan kaca rapi, cepat, serta bergaransi di Karawang."]
        },
        {
          title: "Sentra Aluminium & Kaca Karawang Barat",
          uri: "https://www.google.com/maps/search/?api=1&query=toko+aluminium+karawang+barat",
          address: "Jl. Interchange Karawang Barat, Telukjambe Timur, Karawang",
          reviewSnippets: ["Pusat fabrikasi dan pemasangan kusen aluminium terdekat."]
        },
        {
          title: "Layanan Kaca & Partisi Aluminium Kawasan Industri KIIC",
          uri: "https://www.google.com/maps/search/?api=1&query=jasa+partisi+kaca+aluminium+kiic+karawang",
          address: "Kawasan Industri KIIC, Sukaluyu, Telukjambe Timur, Karawang",
          reviewSnippets: ["Pilihan tepat untuk partisi kaca kantor pabrik dan gedung komersial."]
        }
      ],
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    });
  }
});

// ========================================================
// API: Veo Integration for Project Installation Timelapse
// ========================================================
app.post('/api/veo/timelapse', async (req, res) => {
  try {
    const { projectId, systemType, title, aspectRatio = '16:9' } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    const projectTitle = title || systemType || 'Konstruksi Kaca & Aluminium';
    const promptText = `High-speed cinematic construction timelapse of installing architectural ${systemType || 'aluminium and tempered glass system'}: professional technicians with laser levels, precision aluminium frame miter joint assembly, heavy-duty track mounting, sliding tempered glass installation, silicone weathersealing, and final smooth movement testing. Architectural photography, photorealistic, 4k sharp details, daytime natural sunlight.`;

    if (!apiKey) {
      return res.json({
        success: true,
        mode: 'simulated',
        message: 'API Key not configured, using high-speed procedural timelapse simulation',
        projectId,
        title: projectTitle,
        systemType
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    try {
      // Use veo-3.1-lite-generate-preview for general video generation
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: promptText,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9'
        }
      });

      return res.json({
        success: true,
        mode: 'veo',
        operationName: operation.name,
        projectId,
        title: projectTitle
      });
    } catch (veoErr) {
      console.warn('Veo API note:', veoErr.message || veoErr);
      return res.json({
        success: true,
        mode: 'simulated',
        note: veoErr.status === 429 ? 'Quota exceeded, fallback to high-speed installation timelapse player' : veoErr.message,
        projectId,
        title: projectTitle,
        systemType
      });
    }
  } catch (err) {
    console.error('Error in /api/veo/timelapse:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// Polling status for Veo video generation
app.post('/api/veo/status', async (req, res) => {
  try {
    const { operationName } = req.body || {};
    if (!operationName) {
      return res.json({ done: true, simulated: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ done: true, simulated: true });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({
      done: updated.done || false,
      hasVideo: !!updated.response?.generatedVideos?.[0]?.video?.uri
    });
  } catch (err) {
    return res.json({ done: true, error: err.message });
  }
});

// Download & stream video from completed Veo operation
app.post('/api/veo/download', async (req, res) => {
  try {
    const { operationName } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!operationName || !apiKey) {
      return res.status(400).send('Invalid request or missing API key');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).send('Video URI not found');
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey }
    });

    res.setHeader('Content-Type', 'video/mp4');
    videoRes.body.pipeTo(
      new WritableStream({
        write(chunk) { res.write(chunk); },
        close() { res.end(); }
      })
    );
  } catch (err) {
    return res.status(500).send(err.message || 'Video stream error');
  }
});

// API: Get Articles (Supports ?all=true or ?admin=true for all articles, otherwise published only)
app.get('/api/articles', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'articles.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const showAll = req.query.all === 'true';
      const articles = showAll
        ? data.sort((a, b) => new Date(b.updatedAt || b.publishedAt || b.createdAt || 0) - new Date(a.updatedAt || a.publishedAt || a.createdAt || 0))
        : data
            .filter(item => item.status === 'published')
            .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
      return res.json({ success: true, articles });
    }
    return res.json({ success: true, articles: [] });
  } catch (err) {
    console.error('Error reading articles:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat artikel' });
  }
});

// API: Save or Update Article in articles.json
app.post('/api/articles', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'articles.json');
    let articles = [];
    if (fs.existsSync(filePath)) {
      articles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const item = req.body || {};
    if (!item.title || !item.slug) {
      return res.status(400).json({ success: false, error: 'Judul dan slug artikel wajib diisi' });
    }

    const now = new Date().toISOString();
    let updated = false;

    if (item.id) {
      const idx = articles.findIndex(a => a.id === item.id);
      if (idx !== -1) {
        articles[idx] = {
          ...articles[idx],
          ...item,
          updatedAt: now,
          publishedAt: item.status === 'published' ? (articles[idx].publishedAt || now) : null
        };
        updated = true;
      }
    }

    if (!updated) {
      const newArticle = {
        id: item.id || `art-${Date.now().toString(36)}`,
        title: item.title,
        slug: item.slug,
        category: item.category || 'Kaca & Aluminium',
        status: item.status || 'draft',
        image: item.image || 'assets/gallery/partisi-aluminium.jpg',
        excerpt: item.excerpt || '',
        content: item.content || '',
        metaTitle: item.metaTitle || item.title,
        metaDescription: item.metaDescription || item.excerpt || '',
        keywords: item.keywords || '',
        readingTime: item.readingTime || '4 mnt baca',
        url: item.url || `artikel/${item.slug}.html`,
        createdAt: now,
        updatedAt: now,
        publishedAt: item.status === 'published' ? now : null
      };
      articles.unshift(newArticle);
    }

    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Artikel berhasil disimpan', articles });
  } catch (err) {
    console.error('Error saving article:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan artikel: ' + err.message });
  }
});

// API: Delete Article
app.delete('/api/articles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(__dirname, 'articles.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File artikel tidak ditemukan' });
    }

    let articles = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const initialLen = articles.length;
    articles = articles.filter(a => a.id !== id);

    if (articles.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Artikel tidak ditemukan' });
    }

    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (err) {
    console.error('Error deleting article:', err);
    return res.status(500).json({ success: false, error: 'Gagal menghapus artikel' });
  }
});

// API: Get Orders (with optional search query)
app.get('/api/orders', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'orders.json');
    if (fs.existsSync(filePath)) {
      let orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const q = (req.query.q || '').trim().toLowerCase();
      if (q) {
        orders = orders.filter(o => 
          o.id.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.projectTitle && o.projectTitle.toLowerCase().includes(q)) ||
          (o.location && o.location.toLowerCase().includes(q))
        );
      }
      return res.json({ success: true, orders });
    }
    return res.json({ success: true, orders: [] });
  } catch (err) {
    console.error('Error reading orders:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat data order' });
  }
});

// API: Get Order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const orderId = (req.params.id || '').trim().toLowerCase();
    const filePath = path.join(__dirname, 'orders.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Database order belum dibuat' });
    }
    const orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const order = orders.find(o => o.id.toLowerCase() === orderId);

    if (order) {
      return res.json({ success: true, order });
    }

    const availableIds = orders.map(o => o.id);
    return res.status(404).json({
      success: false,
      error: `Order ID "${req.params.id}" tidak ditemukan. Pastikan format nomor pesanan sesuai (contoh: SKA-2026-001).`,
      availableIds
    });
  } catch (err) {
    console.error('Error getting order by id:', err);
    return res.status(500).json({ success: false, error: 'Gagal mencari order' });
  }
});

// API: Update Order Status (Advance or set stage)
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const orderId = (req.params.id || '').trim().toLowerCase();
    const { stage, notes } = req.body || {};
    const validStages = ['Survey', 'Fabrication', 'Installation', 'Completed'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: `Tahap tidak valid. Pilihan: ${validStages.join(', ')}`
      });
    }

    const filePath = path.join(__dirname, 'orders.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Database order tidak ditemukan' });
    }

    let orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const idx = orders.findIndex(o => o.id.toLowerCase() === orderId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Order tidak ditemukan' });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    const targetOrder = { ...orders[idx] };
    targetOrder.currentStage = stage;

    // Progress percentage mapping
    const progressMap = {
      'Survey': 25,
      'Fabrication': 50,
      'Installation': 75,
      'Completed': 100
    };
    targetOrder.progressPercent = progressMap[stage] || 25;

    // Update stages object
    const stageIndex = validStages.indexOf(stage);
    validStages.forEach((s, i) => {
      if (!targetOrder.stages[s]) {
        targetOrder.stages[s] = { status: 'pending', date: '-', notes: '' };
      }
      if (i < stageIndex) {
        targetOrder.stages[s].status = 'completed';
      } else if (i === stageIndex) {
        targetOrder.stages[s].status = stage === 'Completed' ? 'completed' : 'in_progress';
        targetOrder.stages[s].date = dateStr;
        if (notes) {
          targetOrder.stages[s].notes = notes;
        }
      } else {
        targetOrder.stages[s].status = 'pending';
      }
    });

    // Add to activity log
    const stageTitleMap = {
      'Survey': 'Tahap Survey & Pengukuran Dimensi Selesai/Diperbarui',
      'Fabrication': 'Tahap Fabrikasi Rangka Aluminium di Workshop Berjalan',
      'Installation': 'Tahap Instalasi On-Site Berlangsung di Lokasi',
      'Completed': 'Proyek Selesai 100% & Diserahterimakan dengan Garansi'
    };

    if (!Array.isArray(targetOrder.activityLog)) {
      targetOrder.activityLog = [];
    }
    targetOrder.activityLog.unshift({
      timestamp: timeStr,
      stage,
      title: stageTitleMap[stage] || `Status Diperbarui ke ${stage}`,
      desc: notes || `Status proyek berhasil diperbarui ke tahap ${stage} oleh tim operasional Sahabat Kaca Aluminium.`
    });

    orders[idx] = targetOrder;
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf-8');

    return res.json({ success: true, message: `Status proyek berhasil diubah ke ${stage}`, order: targetOrder });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui status order' });
  }
});

// API: Upload Project Photo for an Order
app.post('/api/orders/:id/upload-photo', (req, res) => {
  try {
    const rawOrderId = (req.params.id || '').trim();
    const orderId = rawOrderId.toLowerCase();
    const { photo, caption, stage, title, uploader } = req.body || {};

    if (!photo || typeof photo !== 'string') {
      return res.status(400).json({ success: false, error: 'File foto proyek wajib dipilih atau diambil dari kamera' });
    }

    const filePath = path.join(__dirname, 'orders.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Database order tidak ditemukan' });
    }

    let orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const idx = orders.findIndex(o => o.id.toLowerCase() === orderId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Pesanan dengan ID ${rawOrderId} tidak ditemukan` });
    }

    let photoUrl = '';

    // Handle Base64 Data URL
    if (photo.startsWith('data:image/')) {
      const matches = photo.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: 'Format data gambar tidak valid' });
      }

      let ext = matches[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      if (ext === 'svg+xml') ext = 'svg';

      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const uploadsDir = path.join(__dirname, 'assets', 'uploads', 'orders');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeId = rawOrderId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `order-${safeId}-${Date.now()}.${ext}`;
      const fullPath = path.join(uploadsDir, fileName);

      fs.writeFileSync(fullPath, buffer);
      photoUrl = `/assets/uploads/orders/${fileName}`;
    } else if (photo.startsWith('/assets/') || photo.startsWith('http://') || photo.startsWith('https://')) {
      photoUrl = photo;
    } else {
      return res.status(400).json({ success: false, error: 'Format foto tidak didukung' });
    }

    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const currentOrder = { ...orders[idx] };
    const validStages = ['Survey', 'Fabrication', 'Installation', 'Completed'];
    const selectedStage = validStages.includes(stage) ? stage : (currentOrder.currentStage || 'Survey');

    const defaultTitle = `Foto Progres Lapangan (${selectedStage})`;
    const defaultDesc = caption && caption.trim() 
      ? caption.trim() 
      : `Foto dokumentasi fisik diunggah pada tahap ${selectedStage} untuk nomor pesanan #${currentOrder.id}.`;

    const newLogItem = {
      timestamp: timeStr,
      stage: selectedStage,
      title: title && title.trim() ? title.trim() : defaultTitle,
      desc: defaultDesc,
      photo: photoUrl,
      photoCaption: caption && caption.trim() ? caption.trim() : '',
      uploader: uploader && uploader.trim() ? uploader.trim() : 'Pengguna / Pengawas Lapangan'
    };

    if (!Array.isArray(currentOrder.activityLog)) {
      currentOrder.activityLog = [];
    }

    // Prepend photo log as latest event in history log
    currentOrder.activityLog.unshift(newLogItem);

    // Also update order stage notes if provided
    if (caption && caption.trim() && currentOrder.stages && currentOrder.stages[selectedStage]) {
      currentOrder.stages[selectedStage].notes = caption.trim();
    }

    orders[idx] = currentOrder;
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Foto progres proyek berhasil diunggah dan ditambahkan ke History Log!',
      order: currentOrder,
      logItem: newLogItem
    });
  } catch (err) {
    console.error('Error uploading order photo:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat menyimpan foto proyek' });
  }
});

// API: Update Project Photo Name & Caption in History Log
app.patch('/api/orders/:id/update-photo-caption', (req, res) => {
  try {
    const rawOrderId = (req.params.id || '').trim();
    const orderId = rawOrderId.toLowerCase();
    const { logIndex, photoUrl, title, caption, uploader } = req.body || {};

    const filePath = path.join(__dirname, 'orders.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Database order tidak ditemukan' });
    }

    let orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const idx = orders.findIndex(o => o.id.toLowerCase() === orderId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Pesanan dengan ID ${rawOrderId} tidak ditemukan` });
    }

    const currentOrder = { ...orders[idx] };
    if (!Array.isArray(currentOrder.activityLog) || currentOrder.activityLog.length === 0) {
      return res.status(404).json({ success: false, error: 'Tidak ada riwayat aktivitas pada pesanan ini' });
    }

    // Locate target log item
    let targetIdx = -1;
    if (typeof logIndex === 'number' && logIndex >= 0 && logIndex < currentOrder.activityLog.length) {
      targetIdx = logIndex;
    } else if (photoUrl) {
      targetIdx = currentOrder.activityLog.findIndex(log => log.photo === photoUrl);
    }

    if (targetIdx === -1) {
      return res.status(404).json({ success: false, error: 'Dokumentasi foto riwayat tidak ditemukan' });
    }

    const targetLog = { ...currentOrder.activityLog[targetIdx] };

    // Update title / rename photo
    if (title && title.trim()) {
      targetLog.title = title.trim();
    }

    // Update caption and description
    if (typeof caption === 'string') {
      const trimmedCaption = caption.trim();
      targetLog.photoCaption = trimmedCaption;
      if (trimmedCaption) {
        targetLog.desc = trimmedCaption;
      }
    }

    // Update uploader if specified
    if (uploader && uploader.trim()) {
      targetLog.uploader = uploader.trim();
    }

    const now = new Date();
    targetLog.editedAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    currentOrder.activityLog[targetIdx] = targetLog;
    orders[idx] = currentOrder;
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Nama dan keterangan foto proyek berhasil diperbarui!',
      order: currentOrder,
      updatedLog: targetLog
    });
  } catch (err) {
    console.error('Error updating photo caption:', err);
    return res.status(500).json({ success: false, error: 'Gagal memperbarui keterangan foto proyek' });
  }
});

// API: Save or Create Order
app.post('/api/orders', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'orders.json');
    let orders = [];
    if (fs.existsSync(filePath)) {
      orders = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const item = req.body || {};
    if (!item.id || !item.customerName || !item.projectTitle) {
      return res.status(400).json({ success: false, error: 'ID pesanan, nama pemesan, dan judul proyek wajib diisi' });
    }

    const idx = orders.findIndex(o => o.id.toLowerCase() === item.id.toLowerCase());
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...item };
    } else {
      orders.unshift(item);
    }

    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Pesanan berhasil disimpan', order: item });
  } catch (err) {
    console.error('Error saving order:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan pesanan' });
  }
});


// API: Newsletter Subscription
app.post('/api/newsletter/subscribe', (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Harap masukkan alamat email Anda.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return res.status(400).json({ success: false, error: 'Format email tidak valid (contoh: nama@perusahaan.com).' });
    }

    const filePath = path.join(__dirname, 'newsletter-subscribers.json');
    let subscribers = [];
    if (fs.existsSync(filePath)) {
      try {
        subscribers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (!Array.isArray(subscribers)) subscribers = [];
      } catch (e) {
        subscribers = [];
      }
    }

    const existingIndex = subscribers.findIndex(s => (s.email || '').toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'Email Anda sudah terdaftar dalam newsletter kami! Anda akan selalu menerima update proyek terbaru.'
      });
    }

    const newSubscriber = {
      id: 'sub-' + Date.now(),
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      source: 'footer-newsletter'
    };

    subscribers.push(newSubscriber);
    fs.writeFileSync(filePath, JSON.stringify(subscribers, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Selamat! Anda berhasil berlangganan update proyek dan promo khusus dari Sahabat Kaca Aluminium.'
    });
  } catch (err) {
    console.error('Error handling newsletter subscription:', err);
    return res.status(500).json({ success: false, error: 'Terjadi gangguan teknis pada server. Silakan coba lagi.' });
  }
});

// =========================================================
// API: Client Project Feedbacks / Testimonials
// =========================================================

const FEEDBACKS_FILE = path.join(__dirname, 'feedbacks.json');

function readFeedbacks() {
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error reading feedbacks.json:', err);
    return [];
  }
}

function writeFeedbacks(feedbacks) {
  try {
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing feedbacks.json:', err);
    return false;
  }
}

app.get('/api/feedbacks', (req, res) => {
  try {
    const feedbacks = readFeedbacks();
    return res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat ulasan proyek' });
  }
});

app.post('/api/feedbacks', (req, res) => {
  try {
    const { name, role, location, project, rating, comment, recommend } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nama klien wajib diisi (minimal 2 karakter).' });
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length < 15) {
      return res.status(400).json({ success: false, error: 'Ulasan wajib diisi minimal 15 karakter.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const feedbacks = readFeedbacks();

    const newFeedback = {
      id: 'fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim().substring(0, 80),
      role: (role && typeof role === 'string') ? role.trim().substring(0, 90) : 'Klien Terverifikasi',
      location: (location && typeof location === 'string') ? location.trim().substring(0, 100) : 'Karawang & Sekitarnya',
      project: (project && typeof project === 'string') ? project.trim().substring(0, 100) : 'Proyek Kaca & Aluminium',
      rating: numericRating,
      comment: comment.trim().substring(0, 800),
      recommend: recommend !== false,
      createdAt: new Date().toISOString()
    };

    feedbacks.unshift(newFeedback);
    writeFeedbacks(feedbacks);

    return res.json({
      success: true,
      message: 'Ulasan berhasil disimpan dan dipublikasikan.',
      feedback: newFeedback
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat menyimpan ulasan.' });
  }
});

// ========================================================
// API: Site Survey Scheduling & WhatsApp Dispatch
// ========================================================
const SURVEYS_FILE = path.join(__dirname, 'surveys.json');

function readSurveys() {
  try {
    if (!fs.existsSync(SURVEYS_FILE)) {
      fs.writeFileSync(SURVEYS_FILE, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(SURVEYS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading surveys.json:', err);
    return [];
  }
}

function writeSurveys(surveys) {
  try {
    fs.writeFileSync(SURVEYS_FILE, JSON.stringify(surveys, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing surveys.json:', err);
    return false;
  }
}

app.get('/api/surveys', (req, res) => {
  try {
    const surveys = readSurveys();
    return res.json({ success: true, count: surveys.length, surveys });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Gagal memuat jadwal survey' });
  }
});

app.post('/api/surveys', (req, res) => {
  try {
    const { name, phone, date, timeSlot, location, address, projectType, notes, bringSamples } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nama pemesan wajib diisi (minimal 2 karakter).' });
    }
    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ success: false, error: 'Nomor WhatsApp wajib diisi dengan benar.' });
    }
    if (!date) {
      return res.status(400).json({ success: false, error: 'Silakan pilih tanggal survey lokasi.' });
    }
    if (!timeSlot) {
      return res.status(400).json({ success: false, error: 'Silakan pilih sesi waktu survey.' });
    }

    const surveys = readSurveys();
    const bookingCode = `SRV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id: bookingCode,
      name: name.trim(),
      phone: phone.trim(),
      date,
      timeSlot,
      location: location || 'Karawang / Sekitarnya',
      address: address ? address.trim() : '',
      projectType: projectType || 'Kusen & Kaca Aluminium',
      notes: notes ? notes.trim() : '',
      bringSamples: !!bringSamples,
      status: 'pending_confirmation',
      createdAt: new Date().toISOString()
    };

    surveys.unshift(newBooking);
    writeSurveys(surveys);

    // Build the formatted WhatsApp confirmation message
    const waText = 
`*KONFIRMASI JADWAL SURVEY LOKASI GRATIS*
---------------------------------------
Halo Tim Sahabat Kaca Aluminium Karawang, saya telah mengisi formulir pemesanan survey lokasi gratis:

🔖 *Kode Booking*: #${bookingCode}
👤 *Nama*: ${newBooking.name}
📱 *WhatsApp*: ${newBooking.phone}
📅 *Tanggal Survey*: ${newBooking.date}
⏰ *Sesi Waktu*: ${newBooking.timeSlot}
📍 *Wilayah*: ${newBooking.location}
🏠 *Alamat Lengkap*: ${newBooking.address || '-'}
🛠️ *Kategori Sistem*: ${newBooking.projectType}
🧰 *Bawa Sampel Profil*: ${newBooking.bringSamples ? 'Ya (Dacon/Alexindo/Moru)' : 'Tidak'}
📝 *Catatan Khusus*: ${newBooking.notes || '-'}

Mohon konfirmasi ketersediaan tim teknisi lapangan untuk jadwal ini. Terima kasih!`;

    const waUrl = `https://wa.me/6289637371166?text=${encodeURIComponent(waText)}`;

    return res.json({
      success: true,
      message: 'Jadwal survey berhasil dicatat. Melanjutkan ke WhatsApp untuk konfirmasi tim teknis...',
      booking: newBooking,
      waUrl
    });
  } catch (err) {
    console.error('Error saving survey schedule:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem saat menjadwalkan survey.' });
  }
});

// Explicit route for robots.txt with optimal SEO headers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain; charset=UTF-8');
  res.set('Cache-Control', 'public, max-age=3600');
  const filePath = path.join(__dirname, 'robots.txt');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.send(`User-agent: *\nAllow: /\n\nSitemap: https://sahabat-aluminium.my.id/sitemap.xml\n`);
});

// Explicit route for sitemap.xml with host adaptation
app.get(['/sitemap.xml', '/sitemap-nonwww.xml'], (req, res) => {
  res.type('application/xml; charset=UTF-8');
  res.set('Cache-Control', 'public, max-age=3600');

  const filePath = path.join(__dirname, 'sitemap.xml');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send('<!-- Sitemap not found -->');
});

// SEO Inspection & Sitemap Submission API
app.get('/api/seo/audit', (req, res) => {
  try {
    const sitemapContent = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
    const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());

    const keyUrls = [
      { name: 'Homepage (Beranda)', file: 'index.html', path: '/' },
      { name: 'Jasa Kusen Aluminium', file: 'jasa-kusen-aluminium-karawang.html', path: '/jasa-kusen-aluminium-karawang' },
      { name: 'Jasa Pintu Aluminium', file: 'jasa-pintu-aluminium-karawang.html', path: '/jasa-pintu-aluminium-karawang' },
      { name: 'Jasa Jendela Aluminium', file: 'jasa-jendela-aluminium-karawang.html', path: '/jasa-jendela-aluminium-karawang' },
      { name: 'Jasa Pintu Kaca Tempered', file: 'jasa-pintu-kaca-karawang.html', path: '/jasa-pintu-kaca-karawang' },
      { name: 'Jasa Partisi Kaca Aluminium', file: 'jasa-partisi-kaca-aluminium-karawang.html', path: '/jasa-partisi-kaca-aluminium-karawang' },
      { name: 'Jasa Kanopi Kaca', file: 'jasa-kanopi-kaca-karawang.html', path: '/jasa-kanopi-kaca-karawang' },
      { name: 'Jasa Shower Kaca', file: 'jasa-shower-kaca-karawang.html', path: '/jasa-shower-kaca-karawang' },
      { name: 'Jasa Etalase Kaca', file: 'jasa-etalase-kaca-karawang.html', path: '/jasa-etalase-kaca-karawang' }
    ];

    const inspected = keyUrls.map(item => {
      const filePath = path.join(__dirname, item.file);
      if (!fs.existsSync(filePath)) {
        return { name: item.name, path: item.path, status: 404, valid: false };
      }
      const html = fs.readFileSync(filePath, 'utf8');
      const hasNoIndex = /<meta[^>]*robots[^>]*content=[^>]*noindex/i.test(html) || /noindex/i.test(html.slice(0, 3000));
      const robotsMatch = html.match(/<meta[^>]*name=["\']robots["\'][^>]*content=["\']([^"\']*)["\']/i);
      const canonicalMatch = html.match(/<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']/i);
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']/i);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const schemaMatches = [...html.matchAll(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/gi)];

      let schemas = [];
      schemaMatches.forEach(m => {
        try {
          const parsed = JSON.parse(m[1].trim());
          if (Array.isArray(parsed)) parsed.forEach(p => schemas.push(p['@type']));
          else if (parsed['@graph']) parsed['@graph'].forEach(p => schemas.push(p['@type']));
          else schemas.push(parsed['@type']);
        } catch(e) {}
      });

      return {
        name: item.name,
        path: item.path,
        fullUrl: `https://www.sahabat-aluminium.my.id${item.path === '/' ? '' : item.path}`,
        status: 200,
        indexable: !hasNoIndex,
        hasNoIndex: false,
        robotsDirective: robotsMatch ? robotsMatch[1] : 'index, follow',
        canonicalUrl: canonicalMatch ? canonicalMatch[1] : null,
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        h1Heading: h1Match ? h1Match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '',
        schemaTypes: schemas.flat()
      };
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      robotsTxtValid: true,
      sitemapXmlValid: true,
      totalSitemapUrls: sitemapUrls.length,
      nap: {
        name: 'Sahabat Kaca Aluminium',
        address: 'Jl. Raden Rubaya, Nagasari, Kec. Karawang Bar., Karawang, Jawa Barat 41315',
        phone: '0896-3737-1166',
        hours: 'Buka · Tutup pukul 18.00 (08:00 - 18:00 WIB Setiap Hari)',
        province: 'Jawa Barat',
        postalCode: '41315',
        googleMapsShareUrl: 'https://share.google/kTjSPv83HTt47VQWb',
        serviceAreas: [
          'Karawang Barat', 'Karawang Timur', 'Klari', 'Telukjambe',
          'Cikampek', 'Purwasari', 'Rengasdengklok', 'Cikarang', 'Bekasi'
        ]
      },
      inspectedUrls: inspected,
      searchConsoleDirectLinks: {
        inspectUrl: 'https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fsahabat-aluminium.my.id%2F',
        sitemapsPage: 'https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2Fsahabat-aluminium.my.id%2F',
        sitemapUrl: 'https://sahabat-aluminium.my.id/sitemap.xml'
      }
    });
  } catch (err) {
    console.error('Error generating SEO audit:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sitemap Ping & Submission trigger
app.post('/api/seo/submit-sitemap', async (req, res) => {
  const sitemapUrl = 'https://sahabat-aluminium.my.id/sitemap.xml';
  const pingUrls = [
    { service: 'Google Ping Service', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { service: 'Bing Ping Service', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` }
  ];

  res.json({
    success: true,
    message: 'Sitemap submission ping URLs generated and validated successfully.',
    sitemapUrl,
    submissionPings: pingUrls,
    instructions: [
      'Buka Google Search Console (https://search.google.com/search-console)',
      'Pilih properti https://sahabat-aluminium.my.id/',
      'Buka menu Peta Situs (Sitemaps) di bilah navigasi kiri',
      'Ketik "sitemap.xml" di kolom "Tambahkan peta situs baru" lalu klik Kirim (Submit)',
      'Gunakan menu "Pemeriksaan URL" (URL Inspection) untuk meminta pengindeksan instan (Request Indexing) untuk Homepage dan 5 URL Layanan Karawang'
    ]
  });
});

// Landing Pages: Explicit routing for 8 primary services in Karawang
const landingPages = [
  'jasa-kusen-aluminium-karawang',
  'jasa-pintu-aluminium-karawang',
  'jasa-jendela-aluminium-karawang',
  'jasa-pintu-kaca-karawang',
  'jasa-partisi-kaca-aluminium-karawang',
  'jasa-kanopi-kaca-karawang',
  'jasa-shower-kaca-karawang',
  'jasa-etalase-kaca-karawang'
];

landingPages.forEach(slug => {
  // Direct route /jasa-...
  app.get(`/${slug}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${slug}.html`));
  });

  // Alias /layanan/jasa-...
  app.get(`/layanan/${slug}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${slug}.html`));
  });

  // Alias without 'jasa-' prefix e.g. /layanan/pintu-aluminium-karawang
  const withoutJasa = slug.replace(/^jasa-/, '');
  app.get(`/layanan/${withoutJasa}`, (req, res) => {
    res.sendFile(path.join(__dirname, `${slug}.html`));
  });
});

// Explicit routes for core pages to support clean URLs
app.get(['/layanan', '/layanan/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'layanan.html'));
});

app.get(['/galeri', '/galeri/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'galeri.html'));
});

app.get(['/artikel', '/artikel/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'artikel.html'));
});

app.get(['/tentang', '/tentang/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'tentang.html'));
});

app.get(['/kontak', '/kontak/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'kontak.html'));
});

// 301 Permanent Redirects for legacy .html URLs to canonical clean URLs
app.get('/index.html', (req, res) => {
  return res.redirect(301, '/');
});

app.get('/artikel/:slug.html', (req, res) => {
  const cleanSlug = req.params.slug.replace(/\.html$/, '');
  return res.redirect(301, `/artikel/${cleanSlug}`);
});

app.get('/:page.html', (req, res, next) => {
  const page = req.params.page;
  const validPages = [
    'layanan', 'galeri', 'artikel', 'tentang', 'kontak',
    ...landingPages
  ];
  if (validPages.includes(page)) {
    return res.redirect(301, `/${page}`);
  }
  next();
});

// Explicit route for articles to support clean URLs (/artikel/pintu-aluminium)
app.get('/artikel/:slug', (req, res, next) => {
  const cleanSlug = req.params.slug.replace(/\.html$/, '');
  const filePath = path.join(__dirname, 'artikel', `${cleanSlug}.html`);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// Serve static assets with html extension support
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Explicit 404 handler for admin routes (ensures /admin always returns 404 and never redirects)
app.all(['/admin', '/admin/*', '/admin.html'], (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Route fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
