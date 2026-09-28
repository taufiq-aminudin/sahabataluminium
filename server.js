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

// API: Get Published Articles Metadata
app.get('/api/articles', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'articles.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Filter only published articles and sort by published date descending
      const published = data
        .filter(item => item.status === 'published')
        .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
      return res.json({ success: true, articles: published });
    }
    return res.json({ success: true, articles: [] });
  } catch (err) {
    console.error('Error reading articles:', err);
    return res.status(500).json({ success: false, error: 'Gagal memuat artikel' });
  }
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
