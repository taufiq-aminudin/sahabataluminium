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

app.use(express.json());

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

    const ai = new GoogleGenAI();
    let response;

    // Use gemini-3.5-flash with googleMaps tool as requested
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
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
    } catch (modelError) {
      console.warn('gemini-3.5-flash fallback to gemini-3.8-flash:', modelError.message);
      response = await ai.models.generateContent({
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
    }

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

// API: Get Articles (Supports ?all=true or ?admin=true for all articles, otherwise published only)
app.get('/api/articles', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'articles.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const showAll = req.query.all === 'true' || req.query.admin === 'true';
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

// API: Get Ads Configuration (Admin Ads + AdSense Separated)
app.get('/api/ads-config', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'ads-config.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json({ success: true, config: data });
    }
    return res.json({ success: false, error: 'Konfigurasi iklan belum ada' });
  } catch (err) {
    console.error('Error reading ads-config:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat konfigurasi iklan' });
  }
});

// API: Save Ads Configuration
app.post('/api/ads-config', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'ads-config.json');
    const { adminAds, adsense } = req.body || {};
    
    // Ensure both adminAds and adsense exist and are cleanly separated
    const newConfig = {
      adminAds: Array.isArray(adminAds) ? adminAds : [],
      adsense: adsense || {
        enabled: true,
        publisherId: "pub-2437971183769682",
        autoAds: false,
        adsTxtVerified: true,
        slots: {}
      },
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Konfigurasi iklan berhasil disimpan', config: newConfig });
  } catch (err) {
    console.error('Error saving ads-config:', err);
    return res.status(500).json({ success: false, error: 'Gagal menyimpan konfigurasi iklan' });
  }
});

// Dedicated route for /admin to ensure smooth loading
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static assets with html extension support
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Route fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
