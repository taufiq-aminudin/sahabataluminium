const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#mainNav');
if(toggle) toggle.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const lightbox=document.querySelector('#lightbox');
const lightboxImage=document.querySelector('#lightboxImage');
const lightboxTitle=document.querySelector('#lightboxTitle');
const closeLightbox=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow='';};
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{
  lightboxImage.src=item.dataset.image;
  lightboxImage.alt=item.dataset.title;
  lightboxTitle.textContent=item.dataset.title;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}));
document.querySelector('.lightbox-close').addEventListener('click',closeLightbox);
lightbox.addEventListener('click',e=>{if(e.target===lightbox) closeLightbox();});
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeLightbox();});

/* =========================================================
   GOOGLE MAPS GROUNDING & ALUMINIUM KARAWANG SEARCH
   ========================================================= */
let userGeoCoords = null;

function detectUserLocation() {
  const statusEl = document.getElementById('searchLocationStatus');
  if (!navigator.geolocation) {
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.textContent = 'Geolocation tidak didukung oleh browser Anda. Menggunakan koordinat pusat Karawang.';
    }
    return;
  }
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.textContent = 'Mendeteksi lokasi Anda...';
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userGeoCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      if (statusEl) {
        statusEl.textContent = `✓ Lokasi terdeteksi (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}). Pencarian akan difokuskan dari titik lokasi Anda.`;
        statusEl.style.color = '#16824b';
      }
    },
    (err) => {
      if (statusEl) {
        statusEl.textContent = 'Izin lokasi tidak diberikan. Menggunakan koordinat default Karawang (-6.3042, 107.3075).';
        statusEl.style.color = '#5f7380';
      }
    },
    { timeout: 7000 }
  );
}

function parseSimpleMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    .replace(/\n\n/gim, '<p></p>')
    .replace(/\n/gim, '<br>');
}

async function executeMapsSearch() {
  const inputEl = document.getElementById('mapsSearchInput');
  const panelEl = document.getElementById('searchResultsPanel');
  const loadingEl = document.getElementById('searchLoadingState');
  const contentEl = document.getElementById('groundedContent');
  const placesGrid = document.getElementById('placesGrid');
  const btnExternal = document.getElementById('btnExternalGoogle');
  const submitBtn = document.getElementById('btnSearchSubmit');

  if (!inputEl) return;
  const query = inputEl.value.trim() || 'aluminium karawang';

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (panelEl) panelEl.classList.add('hidden');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const payload = {
      query,
      lat: userGeoCoords ? userGeoCoords.lat : -6.304243,
      lng: userGeoCoords ? userGeoCoords.lng : 107.307567
    };

    const res = await fetch('/api/search-locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (loadingEl) loadingEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;

    if (panelEl && data.success) {
      panelEl.classList.remove('hidden');

      if (btnExternal) {
        btnExternal.href = data.googleSearchUrl || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        btnExternal.textContent = `Buka "${query}" di Google Search ↗`;
      }

      if (contentEl) {
        contentEl.innerHTML = parseSimpleMarkdown(data.text);
      }

      if (placesGrid) {
        placesGrid.innerHTML = '';
        const places = Array.isArray(data.places) ? data.places : [];
        if (places.length > 0) {
          places.forEach((p) => {
            const card = document.createElement('div');
            card.className = 'place-card';
            
            let reviewsHtml = '';
            if (p.reviewSnippets && p.reviewSnippets.length > 0) {
              reviewsHtml = `<div class="place-card-review">“${p.reviewSnippets[0]}”</div>`;
            }

            const mapUri = p.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.title + ' Karawang')}`;

            card.innerHTML = `
              <div class="place-card-title">📍 ${p.title}</div>
              ${p.address ? `<div class="place-card-address">${p.address}</div>` : ''}
              ${reviewsHtml}
              <a class="place-card-link" href="${mapUri}" target="_blank" rel="noopener">
                Lihat di Google Maps ↗
              </a>
            `;
            placesGrid.appendChild(card);
          });
        } else {
          placesGrid.innerHTML = `
            <div class="place-card">
              <div class="place-card-title">📍 Sahabat Kaca Aluminium Karawang</div>
              <div class="place-card-address">Melayani seluruh wilayah Karawang, Klari, Telukjambe, Cikampek, hingga Kawasan Industri.</div>
              <a class="place-card-link" href="https://www.google.com/maps/search/?api=1&query=aluminium+karawang" target="_blank" rel="noopener">
                Buka di Google Maps ↗
              </a>
            </div>
          `;
        }
      }
    }
  } catch (err) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    if (panelEl) {
      panelEl.classList.remove('hidden');
      if (contentEl) {
        contentEl.innerHTML = `<p style="color:var(--danger)">Gagal memuat data pencarian. Silakan gunakan tautan langsung ke <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" style="color:var(--blue);text-decoration:underline;">Google Search untuk ${query}</a>.</p>`;
      }
    }
  }
}

/* =========================================================
   FAQ ACCORDION TOGGLE
   ========================================================= */
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-item').forEach((other) => {
      if (other !== item) {
        other.classList.remove('active');
        const otherBtn = other.querySelector('.faq-question');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      }
    });

    item.classList.toggle('active');
    btn.setAttribute('aria-expanded', !isExpanded);
  });
});


