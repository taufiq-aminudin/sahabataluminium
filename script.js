const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#mainNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}
if (nav) {
  document.querySelectorAll('#mainNav a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightboxImage');
const lightboxTitle = document.querySelector('#lightboxTitle');
const lightboxClose = document.querySelector('.lightbox-close');

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

if (lightbox) {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      if (lightboxImage) {
        lightboxImage.src = item.dataset.image || '';
        lightboxImage.alt = item.dataset.title || '';
      }
      if (lightboxTitle) {
        lightboxTitle.textContent = item.dataset.title || '';
      }
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
}

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
   FAQ ACCORDION & MOBILE DRAWER (BOTTOM-SHEET) OPTIMIZATION
   ========================================================= */
const faqItems = document.querySelectorAll('.faq-item');
const faqMobileDrawer = document.getElementById('faqMobileDrawer');
const faqDrawerOverlay = document.getElementById('faqDrawerOverlay');
const faqDrawerSheet = document.getElementById('faqDrawerSheet');
const faqDrawerClose = document.getElementById('faqDrawerClose');
const faqDrawerBadge = document.getElementById('faqDrawerBadge');
const faqDrawerId = document.getElementById('faqDrawerId');
const faqDrawerTitle = document.getElementById('faqDrawerTitle');
const faqDrawerBody = document.getElementById('faqDrawerBody');
const faqDrawerCopyBtn = document.getElementById('faqDrawerCopyBtn');
const faqDrawerCopyText = document.getElementById('faqDrawerCopyText');
const faqDrawerWaBtn = document.getElementById('faqDrawerWaBtn');
const faqDrawerHandle = document.getElementById('faqDrawerHandle');

function isMobileView() {
  return window.innerWidth <= 768;
}

// Drawer: Open on Mobile
let currentDrawerFaqId = null;

function getFaqCategoryBadge(id, title) {
  if (id === 'faq-material' || /material/i.test(title)) return 'Pilihan Material';
  if (id === 'faq-waktu' || /waktu|lama/i.test(title)) return 'Waktu Pengerjaan';
  if (id === 'faq-harga' || /harga|biaya/i.test(title)) return 'Estimasi Biaya & RAB';
  if (id === 'faq-survey' || /survey/i.test(title)) return 'Survey Gratis On-Site';
  if (id === 'faq-garansi' || /garansi/i.test(title)) return 'Garansi Pemasangan';
  return 'Tanya Jawab';
}

function openFaqDrawer(item) {
  if (!faqMobileDrawer) return;

  const titleElem = item.querySelector('.faq-question span');
  const answerElem = item.querySelector('.faq-answer');
  if (!titleElem || !answerElem) return;

  const questionTitle = titleElem.textContent.trim();
  const answerHtml = answerElem.innerHTML;
  const faqId = item.id || 'faq';
  currentDrawerFaqId = faqId;

  // Set Content
  if (faqDrawerTitle) faqDrawerTitle.textContent = questionTitle;
  if (faqDrawerBody) {
    faqDrawerBody.innerHTML = answerHtml;
    faqDrawerBody.scrollTop = 0;
  }
  if (faqDrawerBadge) {
    faqDrawerBadge.textContent = getFaqCategoryBadge(faqId, questionTitle);
  }
  if (faqDrawerId) {
    faqDrawerId.textContent = `#${faqId}`;
  }

  // Set WhatsApp button link
  if (faqDrawerWaBtn) {
    const waText = `Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi terkait pertanyaan FAQ: "${questionTitle}"`;
    faqDrawerWaBtn.href = `https://wa.me/6289637371166?text=${encodeURIComponent(waText)}`;
  }

  // Reset copy button text
  if (faqDrawerCopyBtn && faqDrawerCopyText) {
    faqDrawerCopyBtn.classList.remove('copied');
    faqDrawerCopyText.textContent = 'Salin Link';
  }

  // Highlight item in list
  faqItems.forEach(other => other.classList.remove('active'));
  item.classList.add('active');

  // Open Drawer UI
  faqMobileDrawer.classList.add('open');
  faqMobileDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('faq-drawer-open');
}

function closeFaqDrawer() {
  if (!faqMobileDrawer) return;
  faqMobileDrawer.classList.remove('open');
  faqMobileDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('faq-drawer-open');
  if (faqDrawerSheet) {
    faqDrawerSheet.style.transform = '';
  }
  currentDrawerFaqId = null;
}

// Drawer Event Listeners
if (faqMobileDrawer) {
  if (faqDrawerClose) {
    faqDrawerClose.addEventListener('click', closeFaqDrawer);
  }
  if (faqDrawerOverlay) {
    faqDrawerOverlay.addEventListener('click', closeFaqDrawer);
  }

  // Keyboard escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && faqMobileDrawer.classList.contains('open')) {
      closeFaqDrawer();
    }
  });

  // Drawer Copy Button
  if (faqDrawerCopyBtn) {
    faqDrawerCopyBtn.addEventListener('click', async () => {
      if (!currentDrawerFaqId) return;
      const shareUrl = `${window.location.origin}${window.location.pathname}#${currentDrawerFaqId}`;
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch (e) {}
      }
      if (!copied) {
        try {
          const inp = document.createElement('input');
          inp.value = shareUrl;
          inp.style.position = 'fixed';
          inp.style.opacity = '0';
          document.body.appendChild(inp);
          inp.select();
          copied = document.execCommand('copy');
          document.body.removeChild(inp);
        } catch (e) {}
      }
      faqDrawerCopyBtn.classList.add('copied');
      if (faqDrawerCopyText) faqDrawerCopyText.textContent = 'Tersalin!';
      setTimeout(() => {
        faqDrawerCopyBtn.classList.remove('copied');
        if (faqDrawerCopyText) faqDrawerCopyText.textContent = 'Salin Link';
      }, 2000);
    });
  }

  // Touch Swipe Down to Dismiss Drawer
  let touchStartY = 0;
  let currentTouchY = 0;
  let isDragging = false;

  const dragTarget = faqDrawerHandle || faqDrawerSheet;
  if (dragTarget && faqDrawerSheet) {
    dragTarget.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      isDragging = true;
      faqDrawerSheet.style.transition = 'none';
    }, { passive: true });

    dragTarget.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentTouchY = e.touches[0].clientY;
      const diffY = currentTouchY - touchStartY;
      if (diffY > 0) {
        faqDrawerSheet.style.transform = `translateY(${diffY}px)`;
      }
    }, { passive: true });

    dragTarget.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      faqDrawerSheet.style.transition = '';
      const diffY = currentTouchY - touchStartY;
      if (diffY > 70) {
        closeFaqDrawer();
      } else {
        faqDrawerSheet.style.transform = '';
      }
      touchStartY = 0;
      currentTouchY = 0;
    });
  }

  // Handle Resize: if resized to desktop, close drawer and let desktop accordion take over
  window.addEventListener('resize', () => {
    if (!isMobileView() && faqMobileDrawer.classList.contains('open')) {
      closeFaqDrawer();
    }
  });
}

function openFaq(item) {
  if (isMobileView() && faqMobileDrawer) {
    openFaqDrawer(item);
    return;
  }

  const answer = item.querySelector('.faq-answer');
  const btn = item.querySelector('.faq-question');
  if (!answer) return;

  item.classList.add('active');
  if (btn) btn.setAttribute('aria-expanded', 'true');

  answer.style.height = '0px';
  void answer.offsetHeight; // Force reflow
  const targetHeight = answer.scrollHeight;
  answer.style.height = targetHeight + 'px';

  const handleEnd = (e) => {
    if (e.propertyName === 'height') {
      answer.removeEventListener('transitionend', handleEnd);
      if (item.classList.contains('active')) {
        answer.style.height = 'auto';
      }
    }
  };
  answer.addEventListener('transitionend', handleEnd);
}

function closeFaq(item) {
  const answer = item.querySelector('.faq-answer');
  const btn = item.querySelector('.faq-question');
  if (!answer) return;

  if (btn) btn.setAttribute('aria-expanded', 'false');

  answer.style.height = answer.scrollHeight + 'px';
  void answer.offsetHeight; // Force reflow

  item.classList.remove('active');
  requestAnimationFrame(() => {
    answer.style.height = '0px';
  });
}

faqItems.forEach((item) => {
  const btn = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  // Initial desktop state (open first if active on desktop)
  if (!isMobileView() && item.classList.contains('active') && answer) {
    answer.style.height = 'auto';
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  if (btn) {
    btn.addEventListener('click', () => {
      if (isMobileView() && faqMobileDrawer) {
        openFaqDrawer(item);
        return;
      }

      const isActive = item.classList.contains('active');

      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('active')) {
          closeFaq(other);
        }
      });

      if (isActive) {
        closeFaq(item);
      } else {
        openFaq(item);
      }
    });
  }
});

/* =========================================================
   FAQ COLLAPSE ALL BUTTON HANDLER
   ========================================================= */
const faqCollapseAllBtn = document.getElementById('faqCollapseAllBtn');
const faqCollapseLabel = document.getElementById('faqCollapseLabel');

function collapseAllFaqs() {
  faqItems.forEach((item) => {
    closeFaq(item);
    item.classList.remove('active');
    const btn = item.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });

  // Also close mobile bottom drawer if currently displayed
  if (faqMobileDrawer && faqMobileDrawer.classList.contains('open')) {
    closeFaqDrawer();
  }

  // Visual feedback on button
  if (faqCollapseAllBtn) {
    faqCollapseAllBtn.classList.add('collapsed-feedback');
    const prevText = faqCollapseLabel ? faqCollapseLabel.textContent : 'Tutup Semua Jawaban (Collapse All)';
    if (faqCollapseLabel) {
      faqCollapseLabel.textContent = '✓ Semua Jawaban Ditutup';
    }
    setTimeout(() => {
      faqCollapseAllBtn.classList.remove('collapsed-feedback');
      if (faqCollapseLabel) {
        faqCollapseLabel.textContent = prevText;
      }
    }, 1800);
  }
}

if (faqCollapseAllBtn) {
  faqCollapseAllBtn.addEventListener('click', collapseAllFaqs);
}

/* =========================================================
   FAQ LIVE SEARCH & KEYWORD FILTER
   ========================================================= */
const faqSearchInput = document.getElementById('faqSearchInput');
const faqSearchClear = document.getElementById('faqSearchClear');
const faqSearchCount = document.getElementById('faqSearchCount');
const faqNoResults = document.getElementById('faqNoResults');
const faqQueryTerm = document.getElementById('faqQueryTerm');
const faqResetBtn = document.getElementById('faqResetBtn');
const faqTagBtns = document.querySelectorAll('.faq-tag-btn');

function filterFaq(query) {
  const q = (query || '').trim().toLowerCase();
  let matchedCount = 0;
  const total = faqItems.length;

  if (faqSearchClear) {
    if (q.length > 0) {
      faqSearchClear.classList.remove('hidden');
    } else {
      faqSearchClear.classList.add('hidden');
    }
  }

  faqItems.forEach((item, index) => {
    const questionText = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
    const answerText = item.querySelector('.faq-answer')?.textContent.toLowerCase() || '';

    if (!q || questionText.includes(q) || answerText.includes(q)) {
      item.classList.remove('faq-filtered-out');
      matchedCount++;

      // When searching with at least 2 characters, expand the matched item smoothly on desktop
      if (q.length >= 2) {
        if (!isMobileView()) {
          openFaq(item);
        }
      } else if (!q) {
        // Reset state: first item open, others closed on desktop
        if (index === 0 && !isMobileView()) {
          openFaq(item);
        } else {
          closeFaq(item);
        }
      }
    } else {
      item.classList.add('faq-filtered-out');
      closeFaq(item);
    }
  });

  // Update count indicator
  if (faqSearchCount) {
    if (!q) {
      faqSearchCount.textContent = `Menampilkan ${total} pertanyaan`;
    } else {
      faqSearchCount.textContent = `Ditemukan ${matchedCount} dari ${total} pertanyaan`;
    }
  }

  // Update no results box
  if (faqNoResults) {
    if (matchedCount === 0 && q.length > 0) {
      faqNoResults.classList.remove('hidden');
      if (faqQueryTerm) faqQueryTerm.textContent = query;
    } else {
      faqNoResults.classList.add('hidden');
    }
  }
}

if (faqSearchInput) {
  faqSearchInput.addEventListener('input', (e) => {
    filterFaq(e.target.value);
  });

  if (faqSearchClear) {
    faqSearchClear.addEventListener('click', () => {
      faqSearchInput.value = '';
      faqSearchInput.focus();
      filterFaq('');
    });
  }

  if (faqResetBtn) {
    faqResetBtn.addEventListener('click', () => {
      faqSearchInput.value = '';
      faqSearchInput.focus();
      filterFaq('');
    });
  }

  faqTagBtns.forEach((tagBtn) => {
    tagBtn.addEventListener('click', () => {
      const tagQuery = tagBtn.getAttribute('data-query') || '';
      faqSearchInput.value = tagQuery;
      faqSearchInput.focus();
      filterFaq(tagQuery);
    });
  });
}

/* =========================================================
   FLOATING FAQ BUTTON: SCROLL & VISIBILITY TOGGLE (#faq)
   ========================================================= */
const faqFloatBtn = document.getElementById('faqFloatBtn');
const faqSection = document.getElementById('faq');

if (faqFloatBtn && faqSection) {
  const faqFloatText = faqFloatBtn.querySelector('.faq-float-text');

  faqFloatBtn.addEventListener('click', () => {
    const isHidden = faqSection.classList.contains('faq-hidden');

    if (isHidden) {
      // If hidden, restore visibility and smooth scroll to it
      faqSection.classList.remove('faq-hidden');
      faqFloatBtn.setAttribute('aria-expanded', 'true');
      if (faqFloatText) faqFloatText.textContent = 'Lihat FAQ';
      
      window.scrollTo({ top: document.querySelector('#faq').offsetTop, behavior: 'smooth' });
      faqSection.classList.add('faq-highlight');
      setTimeout(() => faqSection.classList.remove('faq-highlight'), 1200);
    } else {
      // Check if #faq is currently in viewport
      const rect = faqSection.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.7 && rect.bottom >= 100;

      if (!inView) {
        // Smoothly scroll to #faq
        window.scrollTo({ top: document.querySelector('#faq').offsetTop, behavior: 'smooth' });
        faqSection.classList.add('faq-highlight');
        setTimeout(() => faqSection.classList.remove('faq-highlight'), 1200);
      } else {
        // Toggle visibility (hide the #faq section)
        faqSection.classList.add('faq-hidden');
        faqFloatBtn.setAttribute('aria-expanded', 'false');
        if (faqFloatText) faqFloatText.textContent = 'Buka FAQ';
      }
    }
  });

  // Dynamically reflect scroll position on button
  window.addEventListener('scroll', () => {
    if (faqSection.classList.contains('faq-hidden')) {
      if (faqFloatText) faqFloatText.textContent = 'Buka FAQ';
      faqFloatBtn.classList.remove('active');
      return;
    }
    const rect = faqSection.getBoundingClientRect();
    const inView = rect.top <= window.innerHeight * 0.6 && rect.bottom >= 150;
    if (inView) {
      faqFloatBtn.classList.add('active');
      if (faqFloatText) faqFloatText.textContent = 'Tutup FAQ';
    } else {
      faqFloatBtn.classList.remove('active');
      if (faqFloatText) faqFloatText.textContent = 'Lihat FAQ';
    }
  }, { passive: true });
}

/* =========================================================
   FAQ DIRECT ANCHOR LINK COPY & DEEP LINK AUTO-OPEN
   ========================================================= */
const faqCopyButtons = document.querySelectorAll('.faq-copy-btn');

faqCopyButtons.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent toggling the accordion
    const faqId = btn.getAttribute('data-faq-id');
    if (!faqId) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}#${faqId}`;
    
    let copySuccessful = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copySuccessful = true;
      } catch (err) {
        copySuccessful = false;
      }
    }
    
    if (!copySuccessful) {
      // Fallback copy method
      try {
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        copySuccessful = document.execCommand('copy');
        document.body.removeChild(tempInput);
      } catch (err) {
        copySuccessful = false;
      }
    }

    // Update URL hash without instant jumping
    try {
      history.replaceState(null, '', `#${faqId}`);
    } catch (e) {}

    // Ensure item is opened and highlighted
    const targetItem = document.getElementById(faqId);
    if (targetItem) {
      openFaq(targetItem);
      targetItem.classList.add('faq-target-highlight');
      setTimeout(() => targetItem.classList.remove('faq-target-highlight'), 1600);
    }

    // Visual feedback on button
    btn.classList.add('copied');
    const label = btn.querySelector('.faq-copy-text');
    const originalText = label ? label.textContent : 'Salin Link';
    if (label) label.textContent = 'Tersalin!';

    setTimeout(() => {
      btn.classList.remove('copied');
      if (label) label.textContent = originalText;
    }, 2000);
  });
});

// Auto-open target FAQ item when page loads or hash changes
function checkFaqAnchorTarget() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#faq-')) return;
  const targetId = hash.substring(1);
  const targetItem = document.getElementById(targetId);
  if (targetItem && targetItem.classList.contains('faq-item')) {
    if (isMobileView() && faqMobileDrawer) {
      openFaqDrawer(targetItem);
      setTimeout(() => {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetItem.classList.add('faq-target-highlight');
        setTimeout(() => targetItem.classList.remove('faq-target-highlight'), 1800);
      }, 300);
    } else {
      openFaq(targetItem);
      setTimeout(() => {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetItem.classList.add('faq-target-highlight');
        setTimeout(() => targetItem.classList.remove('faq-target-highlight'), 1800);
      }, 300);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkFaqAnchorTarget);
} else {
  checkFaqAnchorTarget();
}
window.addEventListener('hashchange', checkFaqAnchorTarget);

/* =========================================================
   DYNAMIC RECENT ARTICLES FETCHER & RENDERER
   ========================================================= */
const recentArticlesGrid = document.getElementById('recentArticlesGrid');
const recentArticlesSkeleton = document.getElementById('recentArticlesSkeleton');
const recentArticlesEmpty = document.getElementById('recentArticlesEmpty');

if (recentArticlesGrid && recentArticlesSkeleton) {
  async function loadRecentArticles() {
    let articles = [];

    // 1. Fetch from server endpoint (/api/articles or fallback to articles.json)
    try {
      const response = await fetch('/api/articles');
      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result.articles)) {
          articles = result.articles;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat /api/articles, mencoba fallback:', err);
    }

    // Fallback to static articles.json if /api/articles returned empty or failed
    if (!articles.length) {
      try {
        const fallbackRes = await fetch('articles.json');
        if (fallbackRes.ok) {
          const rawData = await fallbackRes.json();
          if (Array.isArray(rawData)) {
            articles = rawData.filter(a => a && a.status === 'published');
          }
        }
      } catch (e2) {
        console.warn('Fallback articles.json gagal:', e2);
      }
    }

    // 2. Also merge with any local articles saved in browser's localStorage by the admin
    try {
      const localRaw = localStorage.getItem('sahabat_kaca_aluminium_articles_v1');
      if (localRaw) {
        const localArticles = JSON.parse(localRaw);
        if (Array.isArray(localArticles)) {
          localArticles.forEach(item => {
            if (item && item.status === 'published') {
              const idx = articles.findIndex(a => a.id === item.id || (item.slug && a.slug === item.slug));
              if (idx >= 0) {
                articles[idx] = { ...articles[idx], ...item };
              } else {
                articles.unshift(item);
              }
            } else if (item && item.status !== 'published') {
              // If draft, exclude from published list
              articles = articles.filter(a => a.id !== item.id && a.slug !== item.slug);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Gagal membaca localStorage artikel:', err);
    }

    // 3. Strictly filter published status and sort by published date descending
    const publishedArticles = articles
      .filter(a => a && a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));

    // Hide skeleton loading
    recentArticlesSkeleton.classList.add('hidden');

    if (!publishedArticles.length) {
      if (recentArticlesEmpty) recentArticlesEmpty.classList.remove('hidden');
      return;
    }

    // Limit to latest 6 published articles for the homepage grid
    const latestArticles = publishedArticles.slice(0, 6);

    // Format Indonesian date helper
    const formatDate = (dateString) => {
      if (!dateString) return 'Terbaru';
      try {
        const d = new Date(dateString);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      } catch (e) {
        return 'Terbaru';
      }
    };

    // Helper escape HTML
    const escapeHtml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    recentArticlesGrid.innerHTML = latestArticles.map(art => {
      const artUrl = art.url || (art.slug ? `artikel/${art.slug}.html` : 'artikel.html');
      const artImg = art.image || 'assets/gallery/partisi-aluminium.jpg';
      const artTitle = art.title || 'Artikel Kaca & Aluminium';
      const artExcerpt = art.excerpt || 'Panduan dan informasi seputar pemasangan kaca dan kusen aluminium profesional.';
      const artCategory = art.category || 'Kaca & Aluminium';
      const artDate = formatDate(art.publishedAt || art.createdAt);
      const artReadingTime = art.readingTime || '4 mnt baca';

      return `
        <article class="recent-article-card" data-slug="${escapeHtml(art.slug || '')}">
          <a href="${escapeHtml(artUrl)}" class="recent-article-thumb-link" aria-label="${escapeHtml(artTitle)}">
            <img 
              src="${escapeHtml(artImg)}" 
              alt="${escapeHtml(artTitle)}" 
              class="recent-article-thumb-img" 
              loading="lazy"
              onerror="this.onerror=null; this.src='assets/gallery/partisi-aluminium.jpg';"
            >
            <span class="recent-article-badge">${escapeHtml(artCategory)}</span>
          </a>
          <div class="recent-article-body">
            <div class="recent-article-meta">
              <span class="recent-article-meta-date">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${escapeHtml(artDate)}
              </span>
              <span class="recent-article-meta-time">${escapeHtml(artReadingTime)}</span>
            </div>
            <h3 class="recent-article-title">
              <a href="${escapeHtml(artUrl)}">${escapeHtml(artTitle)}</a>
            </h3>
            <p class="recent-article-excerpt">${escapeHtml(artExcerpt)}</p>
            <div class="recent-article-action">
              <a href="${escapeHtml(artUrl)}" class="recent-article-link">
                <span>Baca Selengkapnya</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    recentArticlesGrid.classList.remove('hidden');
  }

  // Trigger load on DOM ready or immediate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecentArticles);
  } else {
    loadRecentArticles();
  }
}

/* =========================================================
   WHATSAPP LEAD CONVERSION CONTACT FORM HANDLER
   ========================================================= */
function setupWhatsAppForm(formId, previewId, tagsContainerId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const preview = document.getElementById(previewId);
  const nameInput = form.querySelector('[name="name"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const locationSelect = form.querySelector('[name="location"]');
  const serviceSelect = form.querySelector('[name="service"]');
  const messageInput = form.querySelector('[name="message"]');
  const tagsContainer = document.getElementById(tagsContainerId);
  const submitBtn = form.querySelector('button[type="submit"]');

  // Handle Quick Service Tags
  if (tagsContainer && serviceSelect) {
    const tags = tagsContainer.querySelectorAll('.service-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        const val = tag.getAttribute('data-val');
        if (val) {
          serviceSelect.value = val;
          tags.forEach(t => t.classList.remove('active'));
          tag.classList.add('active');
          updatePreview();
        }
      });
    });

    serviceSelect.addEventListener('change', () => {
      const currentVal = serviceSelect.value;
      tags.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-val') === currentVal);
      });
      updatePreview();
    });
  }

  // Update Live Preview Message
  function buildMessage() {
    const name = (nameInput?.value || '').trim() || '[Nama Anda]';
    const phone = (phoneInput?.value || '').trim() || '[Nomor WhatsApp]';
    const location = (locationSelect?.value || '').trim() || '[Wilayah Proyek]';
    const service = (serviceSelect?.value || '').trim() || '[Kebutuhan Layanan]';
    const note = (messageInput?.value || '').trim();

    let text = `Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek:\n\n`;
    text += `*Nama:* ${name}\n`;
    text += `*No. WhatsApp:* ${phone}\n`;
    text += `*Lokasi Proyek:* ${location}\n`;
    text += `*Kebutuhan:* ${service}\n`;
    if (note) {
      text += `*Keterangan / Ukuran:* ${note}\n`;
    }
    text += `\nMohon info estimasi biaya (RAB) dan jadwal survey lokasi gratis. Terima kasih!`;
    return text;
  }

  function updatePreview() {
    if (!preview) return;
    preview.textContent = buildMessage();
  }

  // Bind input listeners for live preview
  [nameInput, phoneInput, locationSelect, serviceSelect, messageInput].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', updatePreview);
      elem.addEventListener('change', updatePreview);
    }
  });

  // Initial preview update
  updatePreview();

  // Form submission: open direct WhatsApp API URL
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = (nameInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();
    const location = (locationSelect?.value || '').trim();
    const service = (serviceSelect?.value || '').trim();

    if (!name || !phone || !location || !service) {
      alert('Mohon lengkapi Nama, No. WhatsApp, Lokasi Proyek, dan Kebutuhan Layanan.');
      return;
    }

    const message = buildMessage();
    const waNumber = '6289637371166';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    // Feedback on button
    if (submitBtn) {
      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Menghubungkan ke WhatsApp...</span>`;
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }, 3000);
    }

    // Open WhatsApp directly
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

// Initialize on both possible forms
document.addEventListener('DOMContentLoaded', () => {
  setupWhatsAppForm('waContactForm', 'waPreviewText', 'waServiceTags');
  setupWhatsAppForm('waContactFormHome', 'waHomePreviewText', 'waHomeServiceTags');
  setupFaqAskForm();
});
if (document.readyState !== 'loading') {
  setupWhatsAppForm('waContactForm', 'waPreviewText', 'waServiceTags');
  setupWhatsAppForm('waContactFormHome', 'waHomePreviewText', 'waHomeServiceTags');
  setupFaqAskForm();
}

/* =========================================================
   FAQ ASK A QUESTION FORM HANDLER (WHATSAPP DISPATCH)
   ========================================================= */
function setupFaqAskForm() {
  const form = document.getElementById('faqAskForm');
  if (!form) return;

  const nameInput = document.getElementById('faqAskName');
  const questionInput = document.getElementById('faqAskQuestion');
  const submitBtn = document.getElementById('faqAskSubmitBtn');
  const chips = document.querySelectorAll('.faq-ask-chip');

  // Handle prompt chips click
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText && questionInput) {
        questionInput.value = promptText;
        questionInput.focus();
        // Visual feedback on chip
        chips.forEach(c => c.style.borderColor = '');
        chip.style.borderColor = 'var(--blue)';
      }
    });
  });

  // Handle form submission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const question = (questionInput?.value || '').trim();
    const name = (nameInput?.value || '').trim() || 'Pengunjung Website';

    if (!question) {
      alert('Silakan tuliskan pertanyaan Anda terlebih dahulu.');
      if (questionInput) questionInput.focus();
      return;
    }

    let text = `Halo Admin Sahabat Kaca Aluminium, saya ingin mengajukan pertanyaan seputar proyek / FAQ:\n\n`;
    text += `*Pertanyaan:*\n"${question}"\n\n`;
    text += `*Dari:* ${name}\n`;
    text += `\nMohon info dan penjelasannya. Terima kasih!`;

    const waNumber = '6289637371166';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    if (submitBtn) {
      const originalContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Membuka WhatsApp Admin...</span>`;
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
      }, 3000);
    }

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}







