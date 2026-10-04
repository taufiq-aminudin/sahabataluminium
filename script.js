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
  document.querySelectorAll('.faq-gallery-carousel').forEach((c) => {
    if (c._autoRotate && c._autoRotate.resume) c._autoRotate.resume();
  });
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

  const titleElem = item.querySelector('.faq-question-text') || item.querySelector('.faq-question span:not(.faq-q-icon):not(.faq-chevron)') || item.querySelector('.faq-question span');
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

  // Update live feedback buttons and counts in drawer body
  if (typeof updateFaqFeedbackDisplay === 'function') {
    updateFaqFeedbackDisplay(faqId);
  }

  // Initialize interactive carousels inside mobile drawer body
  if (typeof initFaqCarousels === 'function' && faqDrawerBody) {
    initFaqCarousels(faqDrawerBody);
  }

  // Open Drawer UI
  faqMobileDrawer.classList.add('open');
  faqMobileDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('faq-drawer-open');

  // Synchronize matching search highlights if active search query exists
  if (typeof highlightFaqText === 'function' && faqSearchInput) {
    const activeQuery = faqSearchInput.value.trim();
    if (activeQuery.length >= 2 && faqDrawerBody) {
      highlightFaqText(faqDrawerBody, activeQuery);
    }
  }
}

function closeFaqDrawer() {
  if (!faqMobileDrawer) return;
  if (faqDrawerBody) {
    faqDrawerBody.querySelectorAll('.faq-gallery-carousel').forEach((c) => {
      if (c._autoRotate && c._autoRotate.stop) c._autoRotate.stop();
    });
  }
  faqMobileDrawer.classList.remove('open');
  faqMobileDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('faq-drawer-open');
  if (faqDrawerSheet) {
    faqDrawerSheet.style.transform = '';
    faqDrawerSheet.style.transition = '';
    faqDrawerSheet.classList.remove('is-dragging');
  }
  if (faqDrawerOverlay) {
    faqDrawerOverlay.style.opacity = '';
    faqDrawerOverlay.style.transition = '';
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

  /* =========================================================
     NATIVE-FEEL SWIPE-TO-CLOSE GESTURE INTERACTION (#faq drawer)
     Features:
     - 1:1 direct manipulation touch tracking
     - Downward velocity & inertia detection (fast flick dismiss)
     - Progressive backdrop overlay dimming
     - Upward pull rubber-band resistance damping
     - Pull-down anywhere on top handle / header or body at top scroll
     - Smooth spring snap-back if canceled
     - Desktop mouse drag support on handle
     ========================================================= */
  let startY = 0;
  let currentY = 0;
  let startTime = 0;
  let isDragging = false;
  let canDragFromContent = false;
  let isPointerDown = false;

  const isInteractiveElement = (elem) => {
    return !!(elem && (elem.closest('button') || elem.closest('a') || elem.closest('input') || elem.closest('textarea') || elem.closest('select')));
  };

  const onDragStart = (clientY, target) => {
    if (!faqMobileDrawer.classList.contains('open')) return false;
    if (isInteractiveElement(target)) return false;

    startY = clientY;
    currentY = clientY;
    startTime = Date.now();

    const isTopArea = target.closest('#faqDrawerHandle') || target.closest('.faq-drawer-head') || target.closest('.faq-drawer-title-wrap');
    const isBodyAtTop = faqDrawerBody && faqDrawerBody.scrollTop <= 2;

    if (isTopArea) {
      isDragging = true;
      canDragFromContent = false;
      faqDrawerSheet.classList.add('is-dragging');
      faqDrawerSheet.style.transition = 'none';
      if (faqDrawerOverlay) faqDrawerOverlay.style.transition = 'none';
      return true;
    } else if (isBodyAtTop) {
      canDragFromContent = true;
      return true;
    }
    return false;
  };

  const onDragMove = (clientY, cancelableEvent) => {
    if (!startY) return;
    currentY = clientY;
    const deltaY = currentY - startY;

    // If starting from content at top scroll, engage drag once downward motion is confirmed
    if (canDragFromContent && !isDragging) {
      if (deltaY > 6 && faqDrawerBody && faqDrawerBody.scrollTop <= 0) {
        isDragging = true;
        faqDrawerSheet.classList.add('is-dragging');
        faqDrawerSheet.style.transition = 'none';
        if (faqDrawerOverlay) faqDrawerOverlay.style.transition = 'none';
      }
    }

    if (!isDragging) return;

    if (cancelableEvent && cancelableEvent.cancelable) {
      cancelableEvent.preventDefault();
    }

    let translateY = 0;
    if (deltaY > 0) {
      // Linear downward tracking
      translateY = deltaY;
    } else {
      // Physical rubber-band resistance when pulling upward
      translateY = Math.max(-32, deltaY * 0.22);
    }

    faqDrawerSheet.style.transform = `translateY(${translateY}px)`;

    // Proportional backdrop opacity reduction
    if (faqDrawerOverlay && faqDrawerSheet) {
      const sheetH = faqDrawerSheet.offsetHeight || window.innerHeight * 0.7;
      const opacity = Math.max(0, Math.min(1, 1 - (deltaY / (sheetH * 0.85))));
      faqDrawerOverlay.style.opacity = opacity.toFixed(3);
    }
  };

  const onDragEnd = () => {
    if (!isDragging) {
      startY = 0;
      canDragFromContent = false;
      isPointerDown = false;
      return;
    }

    const deltaY = currentY - startY;
    const elapsedMs = Math.max(1, Date.now() - startTime);
    const velocityY = deltaY / elapsedMs; // px/ms
    const sheetH = (faqDrawerSheet && faqDrawerSheet.offsetHeight) || window.innerHeight * 0.7;

    isDragging = false;
    canDragFromContent = false;
    isPointerDown = false;
    if (faqDrawerSheet) faqDrawerSheet.classList.remove('is-dragging');

    // Thresholds:
    // 1. Distance > 80px or > 20% of sheet height
    // 2. OR swift downward flick (velocity > 0.42 px/ms with positive movement > 25px)
    const thresholdY = Math.min(110, Math.max(75, sheetH * 0.2));
    const shouldClose = (deltaY >= thresholdY) || (velocityY > 0.42 && deltaY > 25);

    if (shouldClose && faqDrawerSheet) {
      // Smooth flick/drop exit animation
      const remainingDist = Math.max(20, sheetH - deltaY);
      const duration = Math.min(260, Math.max(160, Math.round(remainingDist / Math.max(0.75, velocityY * 1.2))));

      faqDrawerSheet.style.transition = `transform ${duration}ms cubic-bezier(0.32, 1, 0.23, 1)`;
      faqDrawerSheet.style.transform = 'translateY(100%)';
      if (faqDrawerOverlay) {
        faqDrawerOverlay.style.transition = `opacity ${duration}ms ease`;
        faqDrawerOverlay.style.opacity = '0';
      }

      setTimeout(() => {
        closeFaqDrawer();
      }, duration);
    } else if (faqDrawerSheet) {
      // Gentle spring snap-back
      faqDrawerSheet.style.transition = 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.15)';
      faqDrawerSheet.style.transform = 'translateY(0)';
      if (faqDrawerOverlay) {
        faqDrawerOverlay.style.transition = 'opacity 0.22s ease';
        faqDrawerOverlay.style.opacity = '1';
      }

      setTimeout(() => {
        if (!faqDrawerSheet.classList.contains('is-dragging')) {
          faqDrawerSheet.style.transition = '';
          faqDrawerSheet.style.transform = '';
          if (faqDrawerOverlay) {
            faqDrawerOverlay.style.transition = '';
            faqDrawerOverlay.style.opacity = '';
          }
        }
      }, 290);
    }

    startY = 0;
    currentY = 0;
  };

  if (faqDrawerSheet) {
    // Touch Event Listeners on Sheet
    faqDrawerSheet.addEventListener('touchstart', (e) => {
      onDragStart(e.touches[0].clientY, e.target);
    }, { passive: true });

    faqDrawerSheet.addEventListener('touchmove', (e) => {
      onDragMove(e.touches[0].clientY, e);
    }, { passive: false });

    faqDrawerSheet.addEventListener('touchend', onDragEnd, { passive: true });
    faqDrawerSheet.addEventListener('touchcancel', onDragEnd, { passive: true });

    // Mouse Drag Support on Handle Bar (for desktop preview testing)
    const handleBar = document.getElementById('faqDrawerHandle');
    if (handleBar) {
      handleBar.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isPointerDown = true;
        onDragStart(e.clientY, e.target);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isPointerDown) return;
        onDragMove(e.clientY, e);
      });

      window.addEventListener('mouseup', () => {
        if (isPointerDown) {
          onDragEnd();
        }
      });
    }
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

  const carousel = item.querySelector('.faq-gallery-carousel');
  if (carousel && carousel._autoRotate && carousel._autoRotate.restart) {
    carousel._autoRotate.restart();
  }

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

  const carousel = item.querySelector('.faq-gallery-carousel');
  if (carousel && carousel._autoRotate && carousel._autoRotate.stop) {
    carousel._autoRotate.stop();
  }

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
   FAQ LIVE SEARCH & KEYWORD / CATEGORY FILTER SYSTEM
   Supports 'Material', 'Pricing', and 'Process' tag filters
   ========================================================= */
const faqSearchInput = document.getElementById('faqSearchInput');
const faqSearchClear = document.getElementById('faqSearchClear');
const faqSearchCount = document.getElementById('faqSearchCount');
const faqNoResults = document.getElementById('faqNoResults');
const faqQueryTerm = document.getElementById('faqQueryTerm');
const faqResetBtn = document.getElementById('faqResetBtn');
const faqTagBtns = document.querySelectorAll('.faq-tag-btn');
const faqTagFilters = document.querySelectorAll('.faq-tag-filter');

let currentFaqCategory = 'all';

/* =========================================================
   FAQ SEARCH KEYWORD HIGHLIGHTING ENGINE
   Safely wraps matching text nodes in <mark class="faq-search-highlight">
   without corrupting interactive components, carousels, or SVGs.
   ========================================================= */
function removeFaqHighlights(container) {
  if (!container) return;
  const marks = Array.from(container.querySelectorAll('mark.faq-search-highlight'));
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent) {
      const textNode = document.createTextNode(mark.textContent);
      parent.replaceChild(textNode, mark);
      parent.normalize();
    }
  });
}

function escapeRegexForFaq(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightFaqText(container, rawQuery) {
  if (!container || !rawQuery) return;
  removeFaqHighlights(container);

  const cleanQuery = rawQuery.trim();
  if (cleanQuery.length < 2) return;

  // Extract individual search terms (length >= 2) and full query
  const words = cleanQuery.split(/\s+/).filter(w => w.length >= 2);
  const terms = Array.from(new Set([cleanQuery, ...words]));
  // Sort longest terms first so multi-word phrases match before individual tokens
  terms.sort((a, b) => b.length - a.length);

  const pattern = '(' + terms.map(escapeRegexForFaq).join('|') + ')';
  const regex = new RegExp(pattern, 'gi');

  // Walk text nodes, skipping interactive elements like carousel, buttons, svg
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        // Skip non-prose and interactive elements
        if (
          parent.tagName === 'SCRIPT' ||
          parent.tagName === 'STYLE' ||
          parent.tagName === 'MARK' ||
          parent.closest('.faq-gallery-carousel') ||
          parent.closest('.faq-feedback-container') ||
          parent.closest('.faq-copy-wrap') ||
          parent.closest('.faq-wa-share-btn') ||
          parent.closest('button') ||
          parent.closest('svg')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodesToHighlight = [];
  while (walker.nextNode()) {
    regex.lastIndex = 0;
    if (regex.test(walker.currentNode.nodeValue)) {
      nodesToHighlight.push(walker.currentNode);
    }
  }

  nodesToHighlight.forEach((textNode) => {
    const text = textNode.nodeValue;
    const parent = textNode.parentNode;
    if (!parent) return;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    regex.lastIndex = 0;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;

      // Text before matched substring
      if (matchStart > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchStart)));
      }

      // Highlight element
      const mark = document.createElement('mark');
      mark.className = 'faq-search-highlight';
      mark.textContent = match[0];
      fragment.appendChild(mark);

      lastIndex = matchEnd;
    }

    // Remaining text after last match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    parent.replaceChild(fragment, textNode);
  });
}

function filterFaq(query, category) {
  if (category !== undefined) {
    currentFaqCategory = category;
  }
  const rawQ = query !== undefined ? query : (faqSearchInput ? faqSearchInput.value : '');
  const q = rawQ.trim().toLowerCase();
  let matchedCount = 0;
  const total = faqItems.length;

  if (faqSearchClear) {
    if (q.length > 0) {
      faqSearchClear.classList.remove('hidden');
    } else {
      faqSearchClear.classList.add('hidden');
    }
  }

  let firstMatch = null;

  faqItems.forEach((item) => {
    const questionText = item.querySelector('.faq-question')?.textContent.toLowerCase() || '';
    const answerElem = item.querySelector('.faq-answer');
    const answerText = answerElem?.textContent.toLowerCase() || '';
    const itemTags = (item.getAttribute('data-tags') || item.getAttribute('data-category') || '').toLowerCase();

    // Check category filter
    const matchesCategory = (currentFaqCategory === 'all') || itemTags.includes(currentFaqCategory);

    // Check search query
    const matchesQuery = !q || questionText.includes(q) || answerText.includes(q);

    if (matchesCategory && matchesQuery) {
      item.classList.remove('faq-filtered-out');
      matchedCount++;
      if (!firstMatch) firstMatch = item;

      // Highlight matching keywords within FAQ answers
      if (answerElem) {
        if (q.length >= 2) {
          highlightFaqText(answerElem, rawQ);
        } else {
          removeFaqHighlights(answerElem);
        }
      }
    } else {
      item.classList.add('faq-filtered-out');
      if (answerElem) {
        removeFaqHighlights(answerElem);
      }
      closeFaq(item);
    }
  });

  // Also synchronize keyword highlights in mobile drawer body if open
  if (faqDrawerBody && faqMobileDrawer && faqMobileDrawer.classList.contains('open')) {
    if (q.length >= 2) {
      highlightFaqText(faqDrawerBody, rawQ);
    } else {
      removeFaqHighlights(faqDrawerBody);
    }
  }

  // When searching with at least 2 characters, expand the first matched item on desktop
  if (q.length >= 2 && firstMatch && !isMobileView()) {
    openFaq(firstMatch);
  }

  // Update count indicator
  if (faqSearchCount) {
    const categoryNameMap = {
      'all': 'Semua',
      'material': 'Material',
      'pricing': 'Pricing',
      'process': 'Process'
    };
    const catLabel = currentFaqCategory === 'all' ? '' : ` (Topik: ${categoryNameMap[currentFaqCategory] || currentFaqCategory})`;
    if (!q && currentFaqCategory === 'all') {
      faqSearchCount.textContent = `Menampilkan semua ${total} pertanyaan`;
    } else {
      faqSearchCount.textContent = `Menampilkan ${matchedCount} dari ${total} pertanyaan${catLabel}`;
    }
  }

  // Update no results box
  if (faqNoResults) {
    if (matchedCount === 0) {
      faqNoResults.classList.remove('hidden');
      if (faqQueryTerm) {
        faqQueryTerm.textContent = q ? `"${q}"` : `Topik "${currentFaqCategory}"`;
      }
    } else {
      faqNoResults.classList.add('hidden');
    }
  }
}

// Tag-based category filters in section header
faqTagFilters.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const category = btn.getAttribute('data-category') || 'all';
    faqTagFilters.forEach((b) => {
      const isActive = (b === btn);
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    filterFaq(faqSearchInput ? faqSearchInput.value : '', category);
  });
});

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
      if (faqSearchInput) faqSearchInput.value = '';
      currentFaqCategory = 'all';
      faqTagFilters.forEach((b) => {
        const isAll = (b.getAttribute('data-category') === 'all');
        b.classList.toggle('active', isAll);
        b.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      filterFaq('', 'all');
    });
  }

  faqTagBtns.forEach((tagBtn) => {
    tagBtn.addEventListener('click', () => {
      const tagQuery = tagBtn.getAttribute('data-query') || '';
      const categoryMap = {
        'material': 'material',
        'harga': 'pricing',
        'survey': 'process',
        'waktu': 'process',
        'garansi': 'process'
      };
      const mappedCategory = categoryMap[tagQuery];
      if (mappedCategory) {
        currentFaqCategory = mappedCategory;
        faqTagFilters.forEach((b) => {
          const isActive = (b.getAttribute('data-category') === mappedCategory);
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }
      if (faqSearchInput) faqSearchInput.value = '';
      filterFaq('', mappedCategory || 'all');
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

  faqFloatBtn.addEventListener('click', (e) => {
    if (e) e.preventDefault();
    if (faqSection.classList.contains('faq-hidden')) {
      faqSection.classList.remove('faq-hidden');
      faqFloatBtn.setAttribute('aria-expanded', 'true');
    }
    if (faqFloatText) faqFloatText.textContent = 'Lihat FAQ';

    window.scrollTo({ top: document.querySelector('#faq').offsetTop, behavior: 'smooth' });
    faqSection.classList.add('faq-highlight');
    setTimeout(() => faqSection.classList.remove('faq-highlight'), 1200);
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
   WITH LOCALSTORAGE COPY COUNTER
   ========================================================= */
const FAQ_COPY_COUNTS_KEY = 'sahabat_faq_copy_counts_v1';

function getFaqCopyCounts() {
  try {
    const raw = localStorage.getItem(FAQ_COPY_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Gagal membaca copy counts dari localStorage:', err);
    return {};
  }
}

function updateFaqCounterDisplay(faqId, count) {
  const badge = document.querySelector(`.faq-copy-count[data-faq-id="${faqId}"]`);
  if (!badge) return;
  const numSpan = badge.querySelector('.faq-copy-count-num');
  if (numSpan) numSpan.textContent = count;
  badge.setAttribute('title', `Tautan pertanyaan ini telah disalin ${count} kali`);
  badge.setAttribute('aria-label', `Jumlah disalin: ${count}`);

  if (count > 0) {
    badge.classList.add('has-copies');
  } else {
    badge.classList.remove('has-copies');
  }
}

function incrementFaqCopyCount(faqId) {
  const counts = getFaqCopyCounts();
  const current = (typeof counts[faqId] === 'number') ? counts[faqId] : 0;
  const updated = current + 1;
  counts[faqId] = updated;

  try {
    localStorage.setItem(FAQ_COPY_COUNTS_KEY, JSON.stringify(counts));
  } catch (err) {
    console.warn('Gagal menyimpan copy count ke localStorage:', err);
  }

  updateFaqCounterDisplay(faqId, updated);

  // Trigger brief bounce animation on badge
  const badge = document.querySelector(`.faq-copy-count[data-faq-id="${faqId}"]`);
  if (badge) {
    badge.classList.remove('count-bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('count-bump');
    setTimeout(() => badge.classList.remove('count-bump'), 600);
  }

  return updated;
}

// Initialize counts from localStorage on page load
function initFaqCopyCounters() {
  const counts = getFaqCopyCounts();
  document.querySelectorAll('.faq-copy-count').forEach((badge) => {
    const faqId = badge.getAttribute('data-faq-id');
    if (faqId) {
      const count = (typeof counts[faqId] === 'number') ? counts[faqId] : 0;
      updateFaqCounterDisplay(faqId, count);
    }
  });
}

initFaqCopyCounters();

/* =========================================================
   FAQ HELPFULNESS FEEDBACK ('Was this helpful?' UPVOTE/DOWNVOTE)
   Provides live community feedback on which FAQs are most effective.
   ========================================================= */
const FAQ_FEEDBACK_COUNTS_KEY = 'sahabat_faq_feedback_counts_v1';
const FAQ_USER_VOTES_KEY = 'sahabat_faq_user_votes_v1';

const DEFAULT_FAQ_FEEDBACK = {
  'faq-harga': { up: 62, down: 2 },
  'faq-survey': { up: 54, down: 1 },
  'faq-material': { up: 44, down: 1 },
  'faq-garansi': { up: 38, down: 1 },
  'faq-waktu': { up: 31, down: 2 }
};

function getFaqFeedbackCounts() {
  try {
    const raw = localStorage.getItem(FAQ_FEEDBACK_COUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_FAQ_FEEDBACK, parsed);
    }
  } catch (e) {}
  return Object.assign({}, DEFAULT_FAQ_FEEDBACK);
}

function saveFaqFeedbackCounts(counts) {
  try {
    localStorage.setItem(FAQ_FEEDBACK_COUNTS_KEY, JSON.stringify(counts));
  } catch (e) {}
}

function getUserFaqVotes() {
  try {
    const raw = localStorage.getItem(FAQ_USER_VOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function saveUserFaqVotes(votes) {
  try {
    localStorage.setItem(FAQ_USER_VOTES_KEY, JSON.stringify(votes));
  } catch (e) {}
}

function getFaqHelpfulStats(faqId) {
  const counts = getFaqFeedbackCounts();
  const item = counts[faqId] || { up: 10, down: 0 };
  const up = Math.max(0, item.up || 0);
  const down = Math.max(0, item.down || 0);
  const total = up + down;
  const rate = total > 0 ? Math.round((up / total) * 100) : 100;
  return { up, down, total, rate };
}

function updateFaqFeedbackDisplay(faqId) {
  const stats = getFaqHelpfulStats(faqId);
  const userVotes = getUserFaqVotes();
  const userVote = userVotes[faqId] || null;

  // 1. Update all header helpfulness chips for this faqId
  document.querySelectorAll(`.faq-helpfulness-chip[data-faq-id="${faqId}"]`).forEach(chip => {
    const countEl = chip.querySelector('.faq-chip-count');
    if (countEl) countEl.textContent = stats.up;
    chip.setAttribute('title', `${stats.up} pengguna merasa jawaban ini membantu (${stats.rate}%)`);
    chip.setAttribute('aria-label', `Tingkat efektivitas: ${stats.rate}% terbantu`);
  });

  // 2. Update all feedback containers for this faqId (both inline and in mobile drawer)
  const containers = document.querySelectorAll(`.faq-feedback[data-faq-id="${faqId}"]`);
  containers.forEach(container => {
    const rateEl = container.querySelector('.faq-helpfulness-rate');
    if (rateEl) rateEl.textContent = `${stats.rate}%`;

    const totalEl = container.querySelector('.faq-total-votes');
    if (totalEl) totalEl.textContent = stats.total;

    const upBtn = container.querySelector('.faq-vote-up');
    if (upBtn) {
      const upCount = upBtn.querySelector('.faq-upvote-count');
      if (upCount) upCount.textContent = stats.up;
      upBtn.classList.toggle('voted-active', userVote === 'up');
      upBtn.setAttribute('aria-pressed', userVote === 'up' ? 'true' : 'false');
    }

    const downBtn = container.querySelector('.faq-vote-down');
    if (downBtn) {
      const downCount = downBtn.querySelector('.faq-downvote-count');
      if (downCount) downCount.textContent = stats.down;
      downBtn.classList.toggle('voted-active', userVote === 'down');
      downBtn.setAttribute('aria-pressed', userVote === 'down' ? 'true' : 'false');
    }
  });
}

function initAllFaqFeedback() {
  const counts = getFaqFeedbackCounts();
  Object.keys(counts).forEach(faqId => {
    updateFaqFeedbackDisplay(faqId);
  });
}

function handleFaqVoteClick(targetBtn) {
  const faqId = targetBtn.getAttribute('data-faq-id');
  const voteType = targetBtn.getAttribute('data-vote');
  if (!faqId || !voteType) return;

  const counts = getFaqFeedbackCounts();
  const userVotes = getUserFaqVotes();
  const currentVote = userVotes[faqId] || null;

  if (!counts[faqId]) {
    counts[faqId] = { up: 10, down: 0 };
  }

  let statusMsg = '';

  if (currentVote === voteType) {
    // Undo vote (toggle off)
    if (voteType === 'up') counts[faqId].up = Math.max(0, counts[faqId].up - 1);
    else counts[faqId].down = Math.max(0, counts[faqId].down - 1);
    delete userVotes[faqId];
    statusMsg = 'Pilihan dibatalkan';
  } else if (currentVote) {
    // Switch vote
    if (voteType === 'up') {
      counts[faqId].up = (counts[faqId].up || 0) + 1;
      counts[faqId].down = Math.max(0, (counts[faqId].down || 0) - 1);
    } else {
      counts[faqId].down = (counts[faqId].down || 0) + 1;
      counts[faqId].up = Math.max(0, (counts[faqId].up || 0) - 1);
    }
    userVotes[faqId] = voteType;
    statusMsg = voteType === 'up' ? 'Terima kasih atas masukannya! 👍' : 'Terima kasih, masukan dicatat 🙏';
  } else {
    // New vote
    if (voteType === 'up') {
      counts[faqId].up = (counts[faqId].up || 0) + 1;
      statusMsg = 'Terima kasih atas masukannya! 👍';
    } else {
      counts[faqId].down = (counts[faqId].down || 0) + 1;
      statusMsg = 'Terima kasih, masukan dicatat 🙏';
    }
    userVotes[faqId] = voteType;
  }

  saveFaqFeedbackCounts(counts);
  saveUserFaqVotes(userVotes);
  updateFaqFeedbackDisplay(faqId);

  // Show status feedback message
  document.querySelectorAll(`.faq-feedback[data-faq-id="${faqId}"] .faq-feedback-status`).forEach(statusEl => {
    statusEl.textContent = statusMsg;
    statusEl.classList.add('show');
    clearTimeout(statusEl._timer);
    statusEl._timer = setTimeout(() => {
      statusEl.classList.remove('show');
    }, 2800);
  });
}

// Global click delegation for vote buttons (handles inline accordion and mobile drawer)
document.addEventListener('click', (e) => {
  const voteBtn = e.target.closest('.faq-vote-btn');
  if (voteBtn) {
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering accordion or drawer gestures
    handleFaqVoteClick(voteBtn);
    return;
  }

  // Interactive step card click highlight within visual timeline
  const step = e.target.closest('.faq-timeline-step');
  if (step) {
    e.stopPropagation();
    const timeline = step.closest('.faq-process-timeline');
    if (timeline) {
      const isAlreadySelected = step.classList.contains('step-selected');
      timeline.querySelectorAll('.faq-timeline-step').forEach(s => s.classList.remove('step-selected'));
      if (!isAlreadySelected) {
        step.classList.add('step-selected');
      }
    }
  }
});

// Keyboard accessibility support for visual timeline step cards (Enter or Space)
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('faq-timeline-step')) {
    e.preventDefault();
    e.target.click();
  }
});

/* =========================================================
   FAQ IMAGE GALLERY / CAROUSEL SYSTEM (#faq)
   Supports: Next/Prev navigation, slide counter, active dots,
   touch swipe (mobile), keyboard arrows, and Lightbox inspection
   ========================================================= */
function openFaqLightbox(imageUrl, title) {
  if (!lightbox || !imageUrl) return;
  if (lightboxImage) {
    lightboxImage.src = imageUrl;
    lightboxImage.alt = title || 'Foto Visual FAQ Sahabat Kaca';
  }
  if (lightboxTitle) {
    lightboxTitle.textContent = title || '';
  }
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Pause any running FAQ carousels during lightbox inspection
  document.querySelectorAll('.faq-gallery-carousel').forEach((c) => {
    if (c._autoRotate && c._autoRotate.pause) c._autoRotate.pause();
  });
}

function initFaqCarousels(scope = document) {
  const carousels = scope.querySelectorAll('.faq-gallery-carousel');
  carousels.forEach((carousel) => {
    // Avoid double initialization
    if (carousel._carouselInitialized) return;
    carousel._carouselInitialized = true;

    const track = carousel.querySelector('.faq-carousel-track');
    const slides = carousel.querySelectorAll('.faq-carousel-slide');
    const prevBtn = carousel.querySelector('.faq-carousel-prev');
    const nextBtn = carousel.querySelector('.faq-carousel-next');
    const counter = carousel.querySelector('.faq-carousel-counter');
    const dots = carousel.querySelectorAll('.faq-carousel-dot');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const AUTO_ROTATE_INTERVAL = 3800; // Auto-rotate every 3.8 seconds
    let autoRotateTimer = null;
    let isPaused = false;
    let resumeTimeout = null;

    function isCarouselEligible() {
      if (slides.length <= 1) return false;
      // Respect user motion preference
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }
      // If lightbox is currently opened, pause
      if (lightbox && lightbox.classList.contains('open')) {
        return false;
      }
      // If document tab is hidden
      if (document.hidden) {
        return false;
      }
      // If inside mobile drawer:
      const drawer = carousel.closest('#faqMobileDrawer');
      if (drawer) {
        return drawer.classList.contains('open');
      }
      // If inside desktop FAQ item:
      const parentItem = carousel.closest('.faq-item');
      if (parentItem) {
        return parentItem.classList.contains('active');
      }
      // General visibility
      return carousel.offsetParent !== null;
    }

    function advanceSlide() {
      if (!isPaused && isCarouselEligible()) {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
      }
    }

    function startAutoRotate() {
      stopAutoRotate();
      if (slides.length <= 1) return;
      autoRotateTimer = setInterval(advanceSlide, AUTO_ROTATE_INTERVAL);
    }

    function stopAutoRotate() {
      if (autoRotateTimer) {
        clearInterval(autoRotateTimer);
        autoRotateTimer = null;
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    }

    function pauseAutoRotate() {
      isPaused = true;
    }

    function resumeAutoRotate(delay = 0) {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
      if (delay > 0) {
        resumeTimeout = setTimeout(() => {
          isPaused = false;
        }, delay);
      } else {
        isPaused = false;
      }
    }

    function restartAutoRotate() {
      startAutoRotate();
      isPaused = false;
    }

    // Attach controller to element
    carousel._autoRotate = {
      start: startAutoRotate,
      stop: stopAutoRotate,
      pause: pauseAutoRotate,
      resume: resumeAutoRotate,
      restart: restartAutoRotate,
      next: () => updateCarousel((currentIndex + 1) % slides.length),
      prev: () => updateCarousel(currentIndex > 0 ? currentIndex - 1 : slides.length - 1)
    };

    function updateCarousel(newIndex, animate = true) {
      if (slides.length === 0) return;
      // Cyclical wrap-around for smooth continuous viewing
      if (newIndex < 0) {
        newIndex = slides.length - 1;
      } else if (newIndex >= slides.length) {
        newIndex = 0;
      }
      currentIndex = newIndex;

      // Update slide track position
      if (!animate) {
        track.style.transition = 'none';
      } else {
        track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Update active class on slides
      slides.forEach((slide, idx) => {
        const isActive = (idx === currentIndex);
        slide.classList.toggle('active', isActive);
      });

      // Update counter text
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${slides.length}`;
      }

      // Update navigation button states - both enabled for cyclical wrap-around
      if (prevBtn) {
        prevBtn.disabled = slides.length <= 1;
        prevBtn.setAttribute('aria-disabled', slides.length <= 1 ? 'true' : 'false');
      }
      if (nextBtn) {
        nextBtn.disabled = slides.length <= 1;
        nextBtn.setAttribute('aria-disabled', slides.length <= 1 ? 'true' : 'false');
      }

      // Update dot indicators
      dots.forEach((dot, idx) => {
        const isDotActive = (idx === currentIndex);
        dot.classList.toggle('active', isDotActive);
        dot.setAttribute('aria-selected', isDotActive ? 'true' : 'false');
      });
    }

    // Previous Button Click
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1;
        updateCarousel(prevIndex);
        restartAutoRotate();
      });
    }

    // Next Button Click
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
        restartAutoRotate();
      });
    }

    // Dots Click
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateCarousel(idx);
        restartAutoRotate();
      });
    });

    // Pause on Hover & Focus
    carousel.addEventListener('mouseenter', () => pauseAutoRotate());
    carousel.addEventListener('mouseleave', () => resumeAutoRotate(600));
    carousel.addEventListener('focusin', () => pauseAutoRotate());
    carousel.addEventListener('focusout', () => resumeAutoRotate(600));

    // Touch Swipe Gesture on Viewport
    const viewport = carousel.querySelector('.faq-carousel-viewport') || carousel;
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    viewport.addEventListener('touchstart', (e) => {
      pauseAutoRotate();
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = true;
      }
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only respond if horizontal movement is dominant and > 35px
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
        if (diffX < 0) {
          updateCarousel((currentIndex + 1) % slides.length);
        } else if (diffX > 0) {
          updateCarousel(currentIndex > 0 ? currentIndex - 1 : slides.length - 1);
        }
      }
      // Resume auto-rotation after 2.5s grace period following user swipe
      resumeAutoRotate(2500);
    }, { passive: true });

    // Keyboard Arrow navigation when carousel is focused
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateCarousel((currentIndex + 1) % slides.length);
        restartAutoRotate();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateCarousel(currentIndex > 0 ? currentIndex - 1 : slides.length - 1);
        restartAutoRotate();
      }
    });

    // Pause when out of viewport via IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            resumeAutoRotate();
          } else {
            pauseAutoRotate();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(carousel);
    }

    // Lightbox inspection on slide image or zoom hint click
    slides.forEach((slide) => {
      const media = slide.querySelector('.faq-slide-media');
      if (media) {
        media.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const imgUrl = slide.getAttribute('data-image') || media.querySelector('img')?.src;
          const imgTitle = slide.getAttribute('data-title') || slide.querySelector('.faq-slide-caption-title')?.textContent || 'Contoh Kaca & Aluminium';
          openFaqLightbox(imgUrl, imgTitle);
        });
      }
    });

    // Initialize initial state without animation and launch auto-rotation
    updateCarousel(0, false);
    startAutoRotate();
  });
}

// Initialize on page ready
initAllFaqFeedback();
initFaqCarousels();

/* =========================================================
   FAQ SORTING: 'Most Popular', 'Most Helpful', OR 'Newest'
   Enhances navigation efficiency by organizing questions
   ========================================================= */
const faqSortSelect = document.getElementById('faqSortSelect');
const faqListContainer = document.querySelector('.faq-list');

function sortFaqItems(sortType) {
  if (!faqListContainer) return;
  const items = Array.from(faqListContainer.querySelectorAll('.faq-item'));
  const copyCounts = getFaqCopyCounts();

  items.sort((a, b) => {
    if (sortType === 'popular') {
      const aBasePop = parseInt(a.getAttribute('data-popularity'), 10) || 0;
      const bBasePop = parseInt(b.getAttribute('data-popularity'), 10) || 0;
      const aCopies = (typeof copyCounts[a.id] === 'number') ? copyCounts[a.id] : 0;
      const bCopies = (typeof copyCounts[b.id] === 'number') ? copyCounts[b.id] : 0;
      const aHelp = getFaqHelpfulStats(a.id);
      const bHelp = getFaqHelpfulStats(b.id);
      const aScore = aBasePop + (aCopies * 15) + (aHelp.up * 8);
      const bScore = bBasePop + (bCopies * 15) + (bHelp.up * 8);
      return bScore - aScore; // Descending (highest score first)
    } else if (sortType === 'helpful') {
      const aHelp = getFaqHelpfulStats(a.id);
      const bHelp = getFaqHelpfulStats(b.id);
      if (bHelp.up !== aHelp.up) return bHelp.up - aHelp.up;
      return bHelp.rate - aHelp.rate;
    } else if (sortType === 'newest') {
      const aDateStr = a.getAttribute('data-date') || '2026-09-01';
      const bDateStr = b.getAttribute('data-date') || '2026-09-01';
      const aTime = new Date(aDateStr).getTime();
      const bTime = new Date(bDateStr).getTime();
      return bTime - aTime; // Descending (newest date first)
    }
    return 0;
  });

  // Re-append items in sorted order with gentle transition animation
  items.forEach((item) => {
    faqListContainer.appendChild(item);
    item.classList.remove('faq-item-sorted');
    void item.offsetWidth; // trigger reflow
    item.classList.add('faq-item-sorted');
    setTimeout(() => item.classList.remove('faq-item-sorted'), 350);
  });

  // Re-apply search filtering if query exists
  if (faqSearchInput && faqSearchInput.value.trim().length > 0) {
    filterFaq(faqSearchInput.value);
  }
}

if (faqSortSelect) {
  faqSortSelect.addEventListener('change', (e) => {
    const selectedSort = e.target.value;
    try {
      localStorage.setItem('sahabat_faq_sort_pref', selectedSort);
    } catch (err) {}
    sortFaqItems(selectedSort);
  });

  // Load user saved preference if exists
  try {
    const savedSort = localStorage.getItem('sahabat_faq_sort_pref');
    if (savedSort && (savedSort === 'popular' || savedSort === 'helpful' || savedSort === 'newest')) {
      faqSortSelect.value = savedSort;
    }
  } catch (err) {}

  // Initial sort execution
  sortFaqItems(faqSortSelect.value);
}

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

    // Increment and record to localStorage on copy click
    incrementFaqCopyCount(faqId);

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

    // 1. Micro-feedback on button itself (icon checkmark animation & label)
    btn.classList.add('copied');
    const label = btn.querySelector('.faq-copy-text');
    const originalText = label ? label.textContent : 'Salin Link';
    if (label) label.textContent = 'Tersalin!';

    setTimeout(() => {
      btn.classList.remove('copied');
      if (label) label.textContent = originalText;
    }, 2200);

    // 2. Custom Tooltip / Popover confirming deep-link copied to clipboard
    const copyWrap = btn.closest('.faq-copy-wrap');
    if (copyWrap) {
      // Dismiss any other open tooltips
      document.querySelectorAll('.faq-copy-tooltip.show').forEach((t) => {
        t.classList.remove('show');
        t.setAttribute('aria-hidden', 'true');
      });

      const tooltip = copyWrap.querySelector('.faq-copy-tooltip');
      if (tooltip) {
        tooltip.classList.add('show');
        tooltip.setAttribute('aria-hidden', 'false');

        if (btn._tooltipTimer) {
          clearTimeout(btn._tooltipTimer);
        }

        btn._tooltipTimer = setTimeout(() => {
          tooltip.classList.remove('show');
          tooltip.setAttribute('aria-hidden', 'true');
          btn._tooltipTimer = null;
        }, 2600);
      }
    }
  });
});

/* =========================================================
   FAQ WHATSAPP SHARING: DYNAMIC PRE-FILLED MESSAGE WITH
   QUESTION TEXT & DIRECT ANCHOR LINK
   ========================================================= */
const faqWaShareButtons = document.querySelectorAll('.faq-wa-share-btn');

function getFaqWaShareUrl(btn) {
  const faqId = btn.getAttribute('data-faq-id');
  if (!faqId) return 'https://api.whatsapp.com/';
  const faqItem = document.getElementById(faqId);
  const questionEl = faqItem ? faqItem.querySelector('.faq-question-text') : null;
  const questionText = questionEl ? questionEl.textContent.trim() : 'Pertanyaan Kaca & Aluminium';

  const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
  const pathname = window.location.pathname || '/';
  const fullAnchorUrl = `${origin}${pathname}#${faqId}`;

  const message = `*Tanya Jawab Kaca & Aluminium - Sahabat Kaca:*\n"${questionText}"\n\nBaca jawaban lengkapnya di tautan berikut:\n${fullAnchorUrl}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

faqWaShareButtons.forEach((btn) => {
  // Pre-populate href immediately
  btn.href = getFaqWaShareUrl(btn);

  // Re-verify on hover or focus to account for any hash/path changes
  btn.addEventListener('mouseenter', () => {
    btn.href = getFaqWaShareUrl(btn);
  });
  btn.addEventListener('focus', () => {
    btn.href = getFaqWaShareUrl(btn);
  });

  // Prevent collapsing/expanding accordion on click
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.href = getFaqWaShareUrl(btn);
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
   DYNAMIC RECENT ARTICLES FETCHER & RENDERER WITH PAGINATION
   ========================================================= */
const recentArticlesGrid = document.getElementById('recentArticlesGrid');
const recentArticlesSkeleton = document.getElementById('recentArticlesSkeleton');
const recentArticlesEmpty = document.getElementById('recentArticlesEmpty');
const recentArticlesPagination = document.getElementById('recentArticlesPagination');

if (recentArticlesGrid && recentArticlesSkeleton) {
  let allPublishedArticles = [];
  let currentArticlesPage = 1;
  const articlesPerPage = 3; // 3 articles per page preserves clean layout, with multi-page navigation as library grows

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

  function renderArticlesPage(pageNumber, shouldScroll = false) {
    if (!allPublishedArticles.length) return;
    const totalPages = Math.ceil(allPublishedArticles.length / articlesPerPage);
    currentArticlesPage = Math.max(1, Math.min(pageNumber, totalPages));

    const startIndex = (currentArticlesPage - 1) * articlesPerPage;
    const pageArticles = allPublishedArticles.slice(startIndex, startIndex + articlesPerPage);

    // Render Grid with smooth fade-in
    recentArticlesGrid.innerHTML = pageArticles.map(art => {
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

    // Render Pagination Controls
    renderArticlesPagination(totalPages);

    // Scroll smoothly to top of recent articles section when switching pages
    if (shouldScroll) {
      const section = document.getElementById('artikel-terbaru');
      if (section) {
        const topPos = section.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }
  }

  function renderArticlesPagination(totalPages) {
    if (!recentArticlesPagination) return;

    if (totalPages <= 1) {
      recentArticlesPagination.classList.add('hidden');
      recentArticlesPagination.innerHTML = '';
      return;
    }

    recentArticlesPagination.classList.remove('hidden');

    let paginationHtml = '';

    // "Prev" button
    const prevDisabled = currentArticlesPage === 1;
    paginationHtml += `
      <button 
        type="button" 
        class="recent-page-btn recent-page-nav-btn ${prevDisabled ? 'disabled' : ''}" 
        data-page="${currentArticlesPage - 1}" 
        aria-label="Halaman Sebelumnya"
        ${prevDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span class="recent-page-nav-text">Sebelumnya</span>
      </button>
    `;

    // Page Numbers with smart ellipsis
    paginationHtml += `<div class="recent-page-numbers">`;
    for (let p = 1; p <= totalPages; p++) {
      if (
        p === 1 ||
        p === totalPages ||
        (p >= currentArticlesPage - 1 && p <= currentArticlesPage + 1)
      ) {
        const isActive = p === currentArticlesPage;
        paginationHtml += `
          <button 
            type="button" 
            class="recent-page-btn recent-page-num ${isActive ? 'active' : ''}" 
            data-page="${p}" 
            aria-label="Halaman ${p}"
            ${isActive ? 'aria-current="page"' : ''}
          >
            ${p}
          </button>
        `;
      } else if (
        (p === currentArticlesPage - 2 && p > 1) ||
        (p === currentArticlesPage + 2 && p < totalPages)
      ) {
        paginationHtml += `<span class="recent-page-dots" aria-hidden="true">&hellip;</span>`;
      }
    }
    paginationHtml += `</div>`;

    // "Next" button
    const nextDisabled = currentArticlesPage === totalPages;
    paginationHtml += `
      <button 
        type="button" 
        class="recent-page-btn recent-page-nav-btn ${nextDisabled ? 'disabled' : ''}" 
        data-page="${currentArticlesPage + 1}" 
        aria-label="Halaman Berikutnya"
        ${nextDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        <span class="recent-page-nav-text">Berikutnya</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;

    // Summary text (e.g. "Menampilkan 1-3 dari 8 artikel")
    const startIdx = (currentArticlesPage - 1) * articlesPerPage + 1;
    const endIdx = Math.min(currentArticlesPage * articlesPerPage, allPublishedArticles.length);
    paginationHtml += `
      <div class="recent-page-info">
        Halaman <b>${currentArticlesPage}</b> dari <b>${totalPages}</b> (${startIdx}&ndash;${endIdx} dari ${allPublishedArticles.length} artikel)
      </div>
    `;

    recentArticlesPagination.innerHTML = paginationHtml;

    // Attach click listeners to pagination buttons
    const buttons = recentArticlesPagination.querySelectorAll('.recent-page-btn:not(.disabled)');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = parseInt(btn.getAttribute('data-page'), 10);
        if (targetPage && targetPage !== currentArticlesPage) {
          renderArticlesPage(targetPage, true);
        }
      });
    });
  }

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
    allPublishedArticles = articles
      .filter(a => a && a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));

    // Hide skeleton loading
    recentArticlesSkeleton.classList.add('hidden');

    if (!allPublishedArticles.length) {
      if (recentArticlesEmpty) recentArticlesEmpty.classList.remove('hidden');
      if (recentArticlesPagination) recentArticlesPagination.classList.add('hidden');
      return;
    }

    // Render first page
    renderArticlesPage(1, false);
  }

  // Trigger load on DOM ready or immediate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecentArticles);
  } else {
    loadRecentArticles();
  }
}

/* =========================================================
   AUTOMATED WHATSAPP FORM INTERCEPTOR & CONTEXT-AWARE DISPATCHER
   ========================================================= */
const WA_OFFICIAL_NUMBER = '6289637371166';

// Format human-readable Indonesian date
function formatIndoDateContext(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(d.getTime())) return dateStr;
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Generate context-aware survey message
function buildSurveyContextMessage(formData) {
  const { name, phone, date, timeSlot, location, address, projectType, bringSamples } = formData;
  const dateFormatted = formatIndoDateContext(date);

  let msg = `*KONFIRMASI JADWAL SURVEY ON-SITE GRATIS*\n`;
  msg += `*Sahabat Kaca Aluminium Karawang*\n`;
  msg += `────────────────────────────\n\n`;
  msg += `Halo Tim Admin & Teknisi Sahabat Kaca Aluminium, saya ingin mengajukan dan mengonfirmasi jadwal survey lokasi gratis dengan rincian berikut:\n\n`;
  msg += `📅 *Tanggal Survey:* ${dateFormatted || '-'}\n`;
  msg += `⏰ *Sesi Waktu:* ${timeSlot || '09:00 - 11:00 WIB (Pagi)'}\n`;
  msg += `👤 *Nama Pemesan:* ${name || '-'}\n`;
  msg += `📱 *No. WhatsApp:* ${phone || '-'}\n`;
  msg += `📍 *Wilayah Area:* ${location || '-'}\n`;
  msg += `🏠 *Alamat Lengkap / Patokan:* ${address || '-'}\n`;
  msg += `🛠️ *Sistem yang Disurvey:* ${projectType || '-'}\n`;
  msg += `🧰 *Bawa Sampel Fisik Material:* ${bringSamples ? 'Ya, Mohon Bawa Sampel Aluminium & Kaca' : 'Tidak Perlu'}\n\n`;
  msg += `Biaya Survey: *Rp 0 (100% GRATIS)*\n`;
  msg += `Mohon konfirmasi kesiapan teknisi dan estimasi jam kedatangan. Terima kasih!`;
  return msg;
}

// Generate context-aware consultation message
function buildConsultationContextMessage(formData) {
  const name = (formData.name || '-').trim() || '-';
  const phone = (formData.phone || '').trim();
  const service = (formData.service || '-').trim() || '-';
  const location = (formData.location || '-').trim() || '-';
  const size = (formData.size || '-').trim() || '-';
  const message = (formData.message || '-').trim() || '-';

  let msg = `Halo Admin Sahabat Kaca Aluminium,\n\n`;
  msg += `Nama: ${name}\n`;
  if (phone) {
    msg += `No. WhatsApp: ${phone}\n`;
  }
  msg += `Jenis pekerjaan: ${service}\n`;
  msg += `Lokasi proyek: ${location}\n`;
  msg += `Ukuran: ${size}\n`;
  msg += `Keterangan: ${message}\n\n`;
  msg += `Saya ingin konsultasi mengenai proyek kaca/aluminium.`;
  return msg;
}

// UI Prompt Modal Builder for Local WhatsApp App Dispatch
function showWhatsAppPromptModal({ title, subtitle, formattedMessage, waUrl, localAppUrl, onSent }) {
  let modalBackdrop = document.getElementById('waPromptModalBackdrop');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'waPromptModalBackdrop';
    modalBackdrop.className = 'wa-prompt-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'waPromptTitle');
    modalBackdrop.innerHTML = `
      <div class="wa-prompt-dialog">
        <div class="wa-prompt-header">
          <div class="wa-prompt-header-title" id="waPromptTitle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span id="waPromptModalTitleText">Kirim ke WhatsApp Admin</span>
          </div>
          <button type="button" class="wa-prompt-close-btn" id="waPromptCloseBtn" aria-label="Tutup Dialog">×</button>
        </div>
        <div class="wa-prompt-body">
          <p class="wa-prompt-desc" id="waPromptSubtitleText">Data Anda telah dirangkum dalam format pesan siap kirim. Silakan lanjutkan untuk membuka aplikasi WhatsApp lokal Anda:</p>
          <div class="wa-prompt-bubble" id="waPromptMessageBubble"></div>
        </div>
        <div class="wa-prompt-footer">
          <button type="button" class="wa-prompt-send-btn" id="waPromptActionBtn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Kirim Pesan via Aplikasi WhatsApp</span>
          </button>
          <button type="button" class="wa-prompt-cancel-btn" id="waPromptCancelBtn">Kembali / Edit Formulir</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    const closeModal = () => {
      modalBackdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    };
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.getElementById('waPromptCloseBtn').addEventListener('click', closeModal);
    document.getElementById('waPromptCancelBtn').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  // Populate data
  document.getElementById('waPromptModalTitleText').textContent = title || 'Kirim ke WhatsApp Admin';
  document.getElementById('waPromptSubtitleText').textContent = subtitle || 'Silakan tinjau ringkasan pesan berikut dan lanjutkan kirim ke aplikasi WhatsApp:';
  document.getElementById('waPromptMessageBubble').textContent = formattedMessage;

  const actionBtn = document.getElementById('waPromptActionBtn');
  const newActionBtn = actionBtn.cloneNode(true);
  actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);

  newActionBtn.addEventListener('click', () => {
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formattedMessage).catch(() => {});
    }

    if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }

    modalBackdrop.classList.remove('is-active');
    document.body.style.overflow = '';
    if (typeof onSent === 'function') onSent();
  });

  modalBackdrop.classList.add('is-active');
  document.body.style.overflow = 'hidden';
}

// Automated Interceptor Function for Consultation & Survey Forms
window.initAutomatedWhatsAppFormInterceptors = function () {
  // 1. SURVEY FORM INTERCEPTOR
  const surveyForm = document.getElementById('siteSurveyScheduleForm');
  if (surveyForm && !surveyForm._waIntercepted) {
    surveyForm._waIntercepted = true;

    surveyForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = (document.getElementById('surveyNameInput')?.value || '').trim();
      const phone = (document.getElementById('surveyPhoneInput')?.value || '').trim();
      const date = (document.getElementById('surveyDateInput')?.value || '').trim();
      const timeSlot = (document.getElementById('surveyTimeSlotInput')?.value || '09:00 - 11:00 WIB (Pagi)').trim();
      const location = (document.getElementById('surveyLocationSelect')?.value || '').trim();
      const address = (document.getElementById('surveyAddressInput')?.value || '').trim();
      const projectType = (document.getElementById('surveySystemSelect')?.value || '').trim();
      const bringSamples = !!document.getElementById('surveyBringSamples')?.checked;

      if (!name || !phone || !date || !location || !address) {
        alert('Mohon lengkapi Nama, No. WhatsApp, Tanggal Survey, Wilayah, dan Alamat Lokasi Proyek.');
        return;
      }

      const payload = { name, phone, date, timeSlot, location, address, projectType, bringSamples };
      const formattedMessage = buildSurveyContextMessage(payload);
      const encodedMsg = encodeURIComponent(formattedMessage);
      const waUrl = `https://wa.me/${WA_OFFICIAL_NUMBER}?text=${encodedMsg}`;
      const localAppUrl = `whatsapp://send?phone=${WA_OFFICIAL_NUMBER}&text=${encodedMsg}`;

      // Save asynchronously to backend API if available
      fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('Survey background sync:', err));

      // Prompt user to send via WhatsApp app
      showWhatsAppPromptModal({
        title: 'Konfirmasi Jadwal Survey via WhatsApp',
        subtitle: 'Format jadwal survey gratis telah dibuat berdasarkan tanggal, sesi, dan lokasi yang Anda pilih. Lanjutkan untuk mengirim via aplikasi WhatsApp lokal Anda:',
        formattedMessage,
        waUrl,
        localAppUrl,
        onSent: () => {
          const summaryBox = document.getElementById('surveySummaryBox');
          if (summaryBox) {
            summaryBox.style.background = '#ecfdf5';
            summaryBox.style.borderColor = '#10b981';
            summaryBox.innerHTML = `
              <div style="font-size: 14px; font-weight: 800; color: #065f46; display:flex; align-items:center; gap:6px;">
                <span>✅</span> JADWAL SURVEY TERKONFIRMASI KE WHATSAPP
              </div>
              <div style="font-size: 12.5px; color: #047857; margin-top: 4px; line-height: 1.5;">
                Pesan booking telah dibuka di WhatsApp Admin. Teknisi kami akan segera memvalidasi rute kedatangan ke alamat <strong>${address}</strong> pada tanggal <strong>${formatIndoDateContext(date)}</strong>.
              </div>
            `;
          }
        }
      });
    });
  }

  // 2. CONSULTATION FORM INTERCEPTOR (waContactFormHome & waContactForm)
  const consultForms = [
    { formId: 'waContactFormHome', previewId: 'waHomePreviewText', tagsId: 'waHomeServiceTags', page: 'Beranda' },
    { formId: 'waContactForm', previewId: 'waPreviewText', tagsId: 'waServiceTags', page: 'Kontak' }
  ];

  consultForms.forEach(({ formId, previewId, tagsId }) => {
    const form = document.getElementById(formId);
    if (!form || form._waIntercepted) return;
    form._waIntercepted = true;

    const preview = document.getElementById(previewId);
    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const locationSelect = form.querySelector('[name="location"]');
    const serviceSelect = form.querySelector('[name="service"]');
    const sizeInput = form.querySelector('[name="size"]');
    const messageInput = form.querySelector('[name="message"]');
    const tagsContainer = document.getElementById(tagsId);
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedbackNotice = form.querySelector('.form-feedback-notice') || document.getElementById('waFormFeedback');

    // Quick tag pills handling
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

    function getFormData() {
      return {
        name: (nameInput?.value || '').trim(),
        phone: (phoneInput?.value || '').trim(),
        location: (locationSelect?.value || '').trim(),
        service: (serviceSelect?.value || '').trim(),
        size: (sizeInput?.value || '').trim(),
        message: (messageInput?.value || '').trim()
      };
    }

    function updatePreview() {
      if (!preview) return;
      const data = getFormData();
      preview.textContent = buildConsultationContextMessage({
        name: data.name || '-',
        phone: data.phone,
        location: data.location || '-',
        service: data.service || '-',
        size: data.size || '-',
        message: data.message || '-'
      });
    }

    [nameInput, phoneInput, locationSelect, serviceSelect, sizeInput, messageInput].forEach(el => {
      if (el) {
        el.addEventListener('input', () => {
          if (el.classList.contains('is-invalid')) el.classList.remove('is-invalid');
          updatePreview();
        });
        el.addEventListener('change', () => {
          if (el.classList.contains('is-invalid')) el.classList.remove('is-invalid');
          updatePreview();
        });
      }
    });

    updatePreview();

    // Intercept form submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Guard against double submission
      if (form._isSubmitting) return;

      // Clear previous invalid markings
      [nameInput, serviceSelect, locationSelect].forEach(el => {
        if (el) el.classList.remove('is-invalid');
      });

      const data = getFormData();

      // Basic input validation
      const missingFields = [];
      if (!data.name || data.name.length < 2) {
        missingFields.push('Nama Anda');
        if (nameInput) nameInput.classList.add('is-invalid');
      }
      if (!data.service) {
        missingFields.push('Jenis Pekerjaan');
        if (serviceSelect) serviceSelect.classList.add('is-invalid');
      }
      if (!data.location) {
        missingFields.push('Lokasi Proyek');
        if (locationSelect) locationSelect.classList.add('is-invalid');
      }

      if (missingFields.length > 0) {
        if (feedbackNotice) {
          feedbackNotice.style.display = 'block';
          feedbackNotice.style.background = '#fef2f2';
          feedbackNotice.style.color = '#991b1b';
          feedbackNotice.style.border = '1px solid #f87171';
          feedbackNotice.innerHTML = `⚠️ <strong>Mohon lengkapi:</strong> ${missingFields.join(', ')}.`;
        }
        if (!data.name && nameInput) nameInput.focus();
        else if (!data.service && serviceSelect) serviceSelect.focus();
        else if (!data.location && locationSelect) locationSelect.focus();
        return;
      }

      // Lock submission to prevent duplicate clicks / triggers
      form._isSubmitting = true;

      const formattedMessage = buildConsultationContextMessage(data);
      const encodedMsg = encodeURIComponent(formattedMessage);
      const waUrl = `https://wa.me/${WA_OFFICIAL_NUMBER}?text=${encodedMsg}`;

      // Update button state
      let originalBtnHtml = '';
      if (submitBtn) {
        originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>✓ Membuka WhatsApp...</span>`;
      }

      // Display feedback notice with direct fallback link
      if (feedbackNotice) {
        feedbackNotice.style.display = 'block';
        feedbackNotice.style.background = '#ecfdf5';
        feedbackNotice.style.color = '#065f46';
        feedbackNotice.style.border = '1px solid #6ee7b7';
        feedbackNotice.innerHTML = `
          <div style="font-weight:700;margin-bottom:4px;">✅ Menghubungkan ke WhatsApp Admin (0896-3737-1166)...</div>
          <div style="font-size:12px;">Jika WhatsApp tidak terbuka otomatis, <a href="${waUrl}" target="_blank" rel="noopener" style="color:#047857;font-weight:700;text-decoration:underline;">klik di sini untuk membuka chat WhatsApp ↗</a></div>
        `;
      }

      // Single dispatch per platform to prevent double opening
      const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        // Direct location navigation triggers WhatsApp app cleanly once on Android & iOS
        window.location.href = waUrl;
      } else {
        // Desktop opens in new tab cleanly
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      // Re-enable form after 3.5 seconds
      setTimeout(() => {
        form._isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }, 3500);
    });
  });
};

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.initAutomatedWhatsAppFormInterceptors();
  setupFaqAskForm();
});
if (document.readyState !== 'loading') {
  window.initAutomatedWhatsAppFormInterceptors();
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

/* =========================================================
   HOMEPAGE FEATURED PORTFOLIO FILTER
   ========================================================= */
const homePortfolioFilter = document.getElementById('featuredPortfolioFilter');
if (homePortfolioFilter) {
  const filterBtns = homePortfolioFilter.querySelectorAll('button');
  const projectCards = document.querySelectorAll('#featuredPortfolioGrid .featured-project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');

      projectCards.forEach(card => {
        const cardCat = card.getAttribute('data-cat') || '';
        const cats = cardCat.split(' ');
        if (cat === 'all' || cats.includes(cat)) {
          card.style.display = '';
          card.style.animation = 'none';
          void card.offsetHeight;
          card.style.animation = 'masonryCardFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* =========================================================
   PROJECT STATUS DASHBOARD (REAL-TIME ORDER TRACKING)
   ========================================================= */
const STAGE_CONFIG = {
  'Survey': {
    order: 1,
    percent: 25,
    title: 'Survey & Pengukuran',
    kicker: 'Tahap 1 dari 4',
    badgeText: 'Survey Lokasi',
    icon: '📐',
    desc: 'Pengukuran laser dimensi bukaan, analisis struktur dinding/lantai, dan approval shop drawing.'
  },
  'Fabrication': {
    order: 2,
    percent: 50,
    title: 'Fabrikasi Workshop',
    kicker: 'Tahap 2 dari 4',
    badgeText: 'Fabrikasi & Perakitan',
    icon: '⚙️',
    desc: 'Pemotongan profil kusen aluminium presisi sudut 45°, perakitan rangka, dan proses oven tempered kaca.'
  },
  'Installation': {
    order: 3,
    percent: 75,
    title: 'Instalasi On-Site',
    kicker: 'Tahap 3 dari 4',
    badgeText: 'Pemasangan di Lokasi',
    icon: '🏗️',
    desc: 'Pengiriman armada khusus, perakitan on-site, dynabolt pengikat, dan aplikasi sealant waterproofing anti bocor.'
  },
  'Completed': {
    order: 4,
    percent: 100,
    title: 'Selesai & Bergaransi',
    kicker: 'Tahap Selesai (100%)',
    badgeText: 'Selesai & Serah Terima',
    icon: '🛡️',
    desc: 'Quality check akhir, uji kekedapan air & kelancaran aksesoris, serta penyerahan sertifikat garansi resmi.'
  }
};

window.trackProjectOrder = async function(customId) {
  const inputEl = document.getElementById('orderIdInput');
  const btnEl = document.getElementById('btnTrackOrder');
  const btnText = document.getElementById('btnTrackText');
  const container = document.getElementById('orderResultContainer');

  const orderId = (customId || (inputEl ? inputEl.value : '')).trim();
  if (!orderId) {
    if (inputEl) inputEl.focus();
    return;
  }

  if (inputEl) inputEl.value = orderId;

  // Update preset chip active state
  document.querySelectorAll('.preset-chip-btn').forEach(btn => {
    if (btn.getAttribute('data-id').toLowerCase() === orderId.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (btnEl) btnEl.disabled = true;
  if (btnText) btnText.textContent = 'Memuat Status...';
  if (container) {
    container.classList.add('loading');
  }

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    const data = await res.json();

    if (container) container.classList.remove('loading');
    if (btnEl) btnEl.disabled = false;
    if (btnText) btnText.textContent = 'Lacak Status Proyek ↗';

    if (data.success && data.order) {
      renderProjectOrder(data.order);
    } else {
      renderProjectOrderError(data.error || 'Pesanan tidak ditemukan', data.availableIds || []);
    }
  } catch (err) {
    console.error('Error fetching order status:', err);
    if (container) container.classList.remove('loading');
    if (btnEl) btnEl.disabled = false;
    if (btnText) btnText.textContent = 'Lacak Status Proyek ↗';
    renderProjectOrderError('Terjadi gangguan jaringan saat memuat data pesanan. Silakan periksa koneksi Anda dan coba lagi.');
  }
};

function renderProjectOrder(order) {
  const container = document.getElementById('orderResultContainer');
  if (!container) return;

  const currentStage = order.currentStage || 'Survey';
  const stageCfg = STAGE_CONFIG[currentStage] || STAGE_CONFIG['Survey'];
  const percent = order.progressPercent || stageCfg.percent;

  const stagesList = ['Survey', 'Fabrication', 'Installation', 'Completed'];
  const currentStageIndex = stagesList.indexOf(currentStage);

  // Stepper HTML
  const stepperHtml = stagesList.map((stgKey, idx) => {
    const cfg = STAGE_CONFIG[stgKey];
    const stageData = (order.stages && order.stages[stgKey]) || {};
    let nodeStateClass = 'pending';
    let iconContent = idx + 1;

    if (idx < currentStageIndex || (currentStage === 'Completed' && idx === 3)) {
      nodeStateClass = 'completed';
      iconContent = '✓';
    } else if (idx === currentStageIndex) {
      nodeStateClass = 'current';
      iconContent = cfg.icon;
    }

    const stageDate = stageData.date || (nodeStateClass === 'completed' ? 'Selesai' : 'Pending');

    return `
      <div class="stepper-node ${nodeStateClass}">
        <div class="stepper-node-circle" title="${cfg.title}">
          ${iconContent}
        </div>
        <div class="stepper-node-label">${cfg.title}</div>
        <div class="stepper-node-date">${stageDate}</div>
      </div>
    `;
  }).join('');

  // Current stage note / callout
  const activeStageInfo = (order.stages && order.stages[currentStage]) || {};
  const activeNote = activeStageInfo.notes || stageCfg.desc;
  const activeDate = activeStageInfo.date ? `Tanggal: ${activeStageInfo.date}` : '';

  // Helper to format log timestamp nicely
  function formatLogTimestamp(ts) {
    if (!ts) return '-';
    try {
      const parts = ts.split(' ');
      if (parts.length === 2 && parts[0].includes('-')) {
        const [year, month, day] = parts[0].split('-');
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const mIdx = parseInt(month, 10) - 1;
        const mName = months[mIdx] || month;
        return `${parseInt(day, 10)} ${mName} ${year} · ${parts[1]} WIB`;
      }
    } catch (e) {}
    return `${ts} WIB`;
  }

  const stageLabels = {
    'Survey': { name: 'Survey & Pengukuran', pct: '25%', icon: '📐' },
    'Fabrication': { name: 'Fabrikasi Workshop', pct: '50%', icon: '⚙️' },
    'Installation': { name: 'Instalasi On-Site', pct: '75%', icon: '🏗️' },
    'Completed': { name: 'Selesai & Garansi', pct: '100%', icon: '🛡️' }
  };

  // Activity Logs & Previous Status Timestamps
  const activityLogs = Array.isArray(order.activityLog) ? order.activityLog : [];
  const photoLogs = activityLogs.filter(log => Boolean(log.photo));

  // Map the latest photo proof for each of the 4 milestones
  const stageProofKeys = ['Survey', 'Fabrication', 'Installation', 'Completed'];
  const stageProofMap = {
    Survey: null,
    Fabrication: null,
    Installation: null,
    Completed: null
  };

  activityLogs.forEach((log, lIdx) => {
    if (log.photo && stageProofMap[log.stage] === null) {
      stageProofMap[log.stage] = { log, index: lIdx };
    }
  });

  let stagesWithProofCount = 0;
  stageProofKeys.forEach(k => {
    if (stageProofMap[k]) stagesWithProofCount++;
  });

  const stageProofCardsHtml = stageProofKeys.map(stKey => {
    const stInfo = stageLabels[stKey] || { name: stKey, pct: '', icon: '📌' };
    const proof = stageProofMap[stKey];
    const sData = (order.stages && order.stages[stKey]) || {};
    const isCur = order.currentStage === stKey;

    if (proof && proof.log && proof.log.photo) {
      const safeTitle = (proof.log.title || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
      const safeCaption = (proof.log.photoCaption || proof.log.desc || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
      const safeUploader = (proof.log.uploader || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
      const formattedTime = formatLogTimestamp(proof.log.timestamp);

      return `
        <div class="stage-proof-card has-proof" onclick="window.openOrderPhotoModal('${proof.log.photo}', '${safeTitle}', '${safeCaption}', '${formattedTime}', '${order.id}', ${proof.index}, '${safeUploader}')" title="Klik untuk memperbesar bukti foto tahap ${stInfo.name}">
          <div class="stage-proof-header">
            <span class="stage-proof-badge">${stInfo.icon} ${stInfo.name}</span>
            <span class="stage-proof-pct">${stInfo.pct}</span>
          </div>
          <div class="stage-proof-thumb-wrap">
            <img src="${proof.log.photo}" alt="${proof.log.title}" class="stage-proof-thumb" loading="lazy" onerror="this.src='assets/logo.png'">
            <span class="stage-proof-check-pill">✓ Bukti Ada</span>
            <span class="stage-proof-zoom-pill">🔍 Perbesar</span>
          </div>
          <div class="stage-proof-caption" title="${proof.log.photoCaption || proof.log.title}">
            ${proof.log.photoCaption || proof.log.title}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="stage-proof-card no-proof">
          <div class="stage-proof-header">
            <span class="stage-proof-badge">${stInfo.icon} ${stInfo.name}</span>
            <span class="stage-proof-pct">${stInfo.pct}</span>
          </div>
          <div class="stage-proof-empty-box" onclick="window.openUploadWithStage('${order.id}', '${stKey}')" title="Klik untuk mengunggah foto untuk tahap ${stInfo.name}">
            <span class="stage-proof-empty-icon">📷</span>
            <span class="stage-proof-empty-text">Belum ada foto</span>
            <button type="button" class="btn-stage-proof-upload">
              <span>+</span> Unggah Foto
            </button>
          </div>
          <div class="stage-proof-caption empty">
            ${sData.notes || 'Menunggu dokumentasi teknisi'}
          </div>
        </div>
      `;
    }
  }).join('');

  const stageProofGalleryHtml = `
    <div class="stage-proof-gallery-section">
      <div class="stage-proof-gallery-header">
        <div class="stage-proof-gallery-title-box">
          <span class="stage-proof-gallery-icon">📸</span>
          <div>
            <h6 class="stage-proof-gallery-title">Bukti Visual Progres per Tahap</h6>
            <p class="stage-proof-gallery-subtitle">Pratinjau foto autentik dari lapangan untuk memastikan mutu pengerjaan di setiap tahapan proyek.</p>
          </div>
        </div>
        <div class="stage-proof-counter-badge">
          <span>${stagesWithProofCount}/4 Tahap Terdokumentasi</span>
        </div>
      </div>
      <div class="stage-proof-grid">
        ${stageProofCardsHtml}
      </div>
    </div>
  `;
  
  const historyLogsHtml = activityLogs.length > 0
    ? activityLogs.map((log, index) => {
        const stKey = log.stage || 'Survey';
        const stInfo = stageLabels[stKey] || { name: stKey, pct: '', icon: '📌' };
        const isLatest = index === 0;
        const formattedTime = formatLogTimestamp(log.timestamp);
        const hasPhoto = Boolean(log.photo);

        const safeTitle = (log.title || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
        const safeCaption = (log.photoCaption || log.desc || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");
        const safeUploader = (log.uploader || '').replace(/"/g, '&quot;').replace(/'/g, "\\'");

        return `
          <div class="history-log-item ${isLatest ? 'is-latest' : ''} ${hasPhoto ? 'has-photo' : ''}">
            <div class="history-log-item-dot">
              ${hasPhoto ? '📷' : (isLatest ? '★' : '✓')}
            </div>
            <div class="history-log-item-content">
              <div class="history-log-item-header">
                <span class="history-time-badge">
                  <span>🕒</span>
                  <span>${formattedTime}</span>
                </span>
                <span class="history-stage-pill stage-${stKey.toLowerCase()}">
                  ${stInfo.icon} ${stInfo.name} ${stInfo.pct ? `(${stInfo.pct})` : ''}
                </span>
                ${isLatest ? '<span class="history-latest-pill">Status Terkini / Live</span>' : ''}
                ${hasPhoto ? '<span class="history-photo-pill">📸 Dokumentasi Foto</span>' : ''}
              </div>
              <div class="history-event-title">${log.title}</div>
              <p class="history-event-desc">${log.desc}</p>
              ${hasPhoto ? `
                <div class="history-photo-attachment">
                  <div class="history-photo-card" onclick="window.openOrderPhotoModal('${log.photo}', '${safeTitle}', '${safeCaption}', '${formattedTime}', '${order.id}', ${index}, '${safeUploader}')" title="Klik untuk memperbesar pratinjau foto">
                    <div class="history-photo-img-wrap">
                      <img src="${log.photo}" alt="${log.title}" class="history-photo-img" loading="lazy" onerror="this.src='assets/logo.png'">
                      <span class="history-photo-stage-pill">${stInfo.icon} ${stInfo.name} (${stInfo.pct})</span>
                      <span class="history-photo-zoom-tag">🔍 Perbesar Foto</span>
                    </div>
                    <div class="history-photo-meta-box">
                      ${log.photoCaption ? `<div class="history-photo-caption">"${log.photoCaption}"</div>` : ''}
                    </div>
                  </div>
                  <div class="history-photo-footer-actions">
                    <button type="button" class="btn-edit-photo" onclick="event.stopPropagation(); window.openEditPhotoModal('${order.id}', ${index}, '${safeTitle}', '${safeCaption}', '${log.photo}', '${safeUploader}')" title="Ubah Nama & Keterangan Foto Proyek">
                      <span>✏️</span>
                      <span>Edit Keterangan / Nama</span>
                    </button>
                    ${log.editedAt ? `<span class="history-photo-edited-tag" title="Terakhir diedit pada ${log.editedAt}">✏️ Diedit</span>` : ''}
                    ${log.uploader ? `<div class="history-photo-author"><span>👤</span> Diunggah oleh: <b>${log.uploader}</b></div>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="history-log-empty">
        <p>Belum ada riwayat timestamp status untuk nomor pesanan #${order.id}.</p>
      </div>
    `;

  // Milestone QC Checkpoints for the details grid
  const stageCheckpointsHtml = stagesList.map((key, idx) => {
    const sInfo = (order.stages && order.stages[key]) || {};
    const cfg = STAGE_CONFIG[key] || {};
    const isPast = idx < currentStageIndex;
    const isCur = idx === currentStageIndex;
    const statusText = isPast ? '✓ Selesai & Lulus QC' : (isCur ? '▶ Sedang Berjalan' : '⏳ Menunggu Antrean');
    const badgeClass = isPast ? 'completed' : (isCur ? 'in-progress' : 'pending');
    return `
      <div class="timeline-entry">
        <div class="timeline-dot ${badgeClass}"></div>
        <div class="timeline-time">${sInfo.date || 'Estimasi'} · ${statusText}</div>
        <div class="timeline-title">${cfg.icon || '📌'} ${cfg.title || key} (${cfg.percent || 0}%)</div>
        <p class="timeline-desc">${sInfo.notes || cfg.desc || ''}</p>
      </div>
    `;
  }).join('');

  // WhatsApp Pre-filled URL
  const waMessage = encodeURIComponent(
    `Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi update untuk Order ID #${order.id} (${order.projectTitle}) atas nama ${order.customerName}. Status saat ini: ${stageCfg.title} (${percent}%).`
  );
  const waUrl = `https://wa.me/6289637371166?text=${waMessage}`;

  // Cache current active order for PDF reports
  window.currentProjectOrder = order;

  container.innerHTML = `
    <div class="dashboard-result-panel" id="orderResultPanel">
      
      <!-- Project Hero Header -->
      <div class="order-summary-header">
        <div>
          <div class="order-meta-breadcrumbs">
            <span class="order-id-badge">ORDER ID: ${order.id}</span>
            <span>·</span>
            <span>${order.projectType || 'Kaca & Aluminium'}</span>
            <span>·</span>
            <span>📍 ${order.location || 'Karawang'}</span>
          </div>
          <h3 class="order-project-heading">${order.projectTitle}</h3>
          <div class="order-customer-sub">
            <span>Pemesan: <strong>${order.customerName}</strong></span>
            <span>·</span>
            <span>Kontak: ${order.contactPhone || '-'}</span>
          </div>
        </div>

        <div class="order-stage-status-box">
          <div class="status-kicker">${stageCfg.kicker}</div>
          <div class="status-current-title">
            <span>${stageCfg.icon}</span>
            <span>${stageCfg.title}</span>
          </div>
          <div class="status-percent">Progres Pengerjaan: <strong>${percent}%</strong></div>
        </div>
      </div>

      <!-- Dedicated Visual Progress Bar Component -->
      <div class="order-progress-card">
        <div class="order-progress-header">
          <div class="order-progress-title-wrap">
            <h4>
              <span>📊</span>
              <span>Progres Pengerjaan Proyek (${percent}%)</span>
            </h4>
            <div class="order-progress-stage-desc">
              <span>Tahap Saat Ini:</span>
              <strong>${stageCfg.icon} ${stageCfg.title}</strong>
              <span>·</span>
              <span>${stageCfg.kicker}</span>
            </div>
          </div>

          <div class="order-progress-badge">
            <span class="progress-big-number" id="progressBigNumber">0%</span>
            <span class="progress-big-unit">Selesai</span>
          </div>
        </div>

        <!-- The Progress Bar Shell & Fill (Animated from 0% to target) -->
        <div class="progress-bar-shell" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progres pengerjaan proyek ${percent}%">
          <div class="progress-bar-fill stage-${currentStage.toLowerCase()}" id="progressBarFill" style="width: 0%;">
            <span class="progress-bar-label">${percent}%</span>
          </div>
        </div>

        <!-- 4 Key Milestone Markers on the Progress Bar -->
        <div class="progress-milestones-row">
          <div class="progress-milestone-item ${percent >= 25 ? (percent === 25 ? 'current' : 'passed') : ''}">
            <span class="milestone-pct">25%</span>
            <span class="milestone-label">📐 1. Survey</span>
          </div>
          <div class="progress-milestone-item ${percent >= 50 ? (percent === 50 ? 'current' : 'passed') : ''}">
            <span class="milestone-pct">50%</span>
            <span class="milestone-label">⚙️ 2. Fabrikasi</span>
          </div>
          <div class="progress-milestone-item ${percent >= 75 ? (percent === 75 ? 'current' : 'passed') : ''}">
            <span class="milestone-pct">75%</span>
            <span class="milestone-label">🏗️ 3. Instalasi</span>
          </div>
          <div class="progress-milestone-item ${percent >= 100 ? 'passed current' : ''}">
            <span class="milestone-pct">100%</span>
            <span class="milestone-label">🛡️ 4. Selesai</span>
          </div>
        </div>

        <!-- History Log with Previous Status Timestamps (Directly Underneath Progress Bar) -->
        <div class="order-history-log-section">
          <div class="history-log-top-bar">
            <div class="history-log-title-group">
              <span class="history-icon-badge">⏱️</span>
              <div>
                <h5 class="history-log-title">History Log & Status Timestamps</h5>
                <p class="history-log-subtitle">Riwayat pembaruan status resmi untuk Order ID <strong>#${order.id}</strong></p>
              </div>
            </div>
            <div class="history-top-actions">
              <button type="button" class="btn-history-upload" id="btnToggleUpload_${order.id}" onclick="window.toggleOrderPhotoUploadCard('${order.id}')" title="Ambil foto dari kamera ponsel atau pilih file dari memori perangkat">
                <span class="btn-upload-icon">📷</span>
                <span>Unggah Foto Proyek</span>
              </button>
              <button type="button" class="btn-history-pdf" onclick="window.generateProjectPdfReport('${order.id}')" title="Unduh laporan riwayat lengkap format PDF">
                <span class="btn-upload-icon">📄</span>
                <span>Unduh Laporan PDF</span>
              </button>
              <div class="history-count-badge">
                <span class="count-num">${activityLogs.length}</span>
                <span class="count-text">Pembaruan Tercatat</span>
              </div>
            </div>
          </div>

          <!-- Photo Upload Form Container (Camera / Device Storage) -->
          <div class="order-photo-upload-container" id="orderPhotoUploadCard_${order.id}" style="display: none;">
            <div class="upload-card-header">
              <h6 class="upload-card-title">
                <span>📷</span>
                <span>Unggah Dokumentasi Foto Proyek #${order.id}</span>
              </h6>
              <button type="button" class="upload-card-close-btn" onclick="window.toggleOrderPhotoUploadCard('${order.id}')" title="Tutup Formulir">✕</button>
            </div>

            <!-- Hidden File Inputs: Camera & Storage -->
            <input type="file" id="orderPhotoCameraInput_${order.id}" accept="image/*" capture="environment" style="display:none;" onchange="window.handleOrderPhotoSelected(event, '${order.id}')">
            <input type="file" id="orderPhotoStorageInput_${order.id}" accept="image/*" style="display:none;" onchange="window.handleOrderPhotoSelected(event, '${order.id}')">

            <!-- Source Selection: Mobile Camera vs Device Storage -->
            <div class="upload-source-row">
              <button type="button" class="btn-source-option" onclick="document.getElementById('orderPhotoCameraInput_${order.id}').click()">
                <span class="btn-source-icon">📸</span>
                <span>Buka Kamera Ponsel</span>
              </button>
              <button type="button" class="btn-source-option" onclick="document.getElementById('orderPhotoStorageInput_${order.id}').click()">
                <span class="btn-source-icon">📁</span>
                <span>Pilih File / Galeri Perangkat</span>
              </button>
            </div>

            <!-- Dropzone Area -->
            <div class="upload-dropzone" id="uploadDropzone_${order.id}" onclick="document.getElementById('orderPhotoStorageInput_${order.id}').click()">
              <span class="dropzone-icon">🖼️</span>
              <div class="dropzone-label">Ketuk di sini atau seret foto ke dalam area ini</div>
              <div class="dropzone-sublabel">Format foto didukung: JPG, PNG, WEBP (otomatis dioptimalkan)</div>
            </div>

            <!-- Image Preview Box -->
            <div class="upload-preview-card" id="uploadPreviewCard_${order.id}" style="display: none;">
              <img id="uploadPreviewImg_${order.id}" class="upload-preview-thumb" src="" alt="Pratinjau Foto">
              <div class="upload-preview-meta">
                <div class="upload-preview-name" id="uploadPreviewName_${order.id}">foto-proyek.jpg</div>
                <div class="upload-preview-size" id="uploadPreviewSize_${order.id}">0 KB</div>
                <div class="upload-preview-actions">
                  <button type="button" class="btn-preview-action" onclick="document.getElementById('orderPhotoStorageInput_${order.id}').click()">Ganti Foto</button>
                  <button type="button" class="btn-preview-action delete" onclick="window.clearOrderPhotoSelected('${order.id}')">Hapus Foto</button>
                </div>
              </div>
            </div>

            <!-- Form Details Grid -->
            <div class="upload-form-grid">
              <div class="upload-form-group">
                <label class="upload-label" for="uploadStageSelect_${order.id}">Tahap Dokumentasi</label>
                <select id="uploadStageSelect_${order.id}" class="upload-select">
                  <option value="Survey" ${order.currentStage === 'Survey' ? 'selected' : ''}>📐 1. Survey & Pengukuran</option>
                  <option value="Fabrication" ${order.currentStage === 'Fabrication' ? 'selected' : ''}>⚙️ 2. Fabrikasi Workshop</option>
                  <option value="Installation" ${order.currentStage === 'Installation' ? 'selected' : ''}>🏗️ 3. Instalasi On-Site</option>
                  <option value="Completed" ${order.currentStage === 'Completed' ? 'selected' : ''}>🛡️ 4. Selesai & Garansi</option>
                </select>
              </div>

              <div class="upload-form-group">
                <label class="upload-label" for="uploadUploaderInput_${order.id}">Pengunggah / Peran</label>
                <input type="text" id="uploadUploaderInput_${order.id}" class="upload-input" placeholder="Contoh: Klien / Teknisi Lapangan" value="Klien / Pengawas">
              </div>

              <div class="upload-form-group full-width">
                <label class="upload-label" for="uploadTitleInput_${order.id}">Judul Dokumentasi</label>
                <input type="text" id="uploadTitleInput_${order.id}" class="upload-input" placeholder="Contoh: Foto Pemasangan Kusen Alexindo 4 Inch" value="Dokumentasi Foto Lapangan (${order.currentStage || 'Survey'})">
              </div>

              <div class="upload-form-group full-width">
                <label class="upload-label" for="uploadCaptionInput_${order.id}">Catatan / Keterangan Foto Lapangan</label>
                <textarea id="uploadCaptionInput_${order.id}" class="upload-textarea" placeholder="Tambahkan rincian progres, seperti kondisi bukaan kusen, posisi kaca, atau catatan khusus..."></textarea>
              </div>
            </div>

            <!-- Feedback Message Container -->
            <div class="upload-feedback-msg" id="uploadFeedbackMsg_${order.id}"></div>

            <!-- Actions Bar -->
            <div class="upload-actions-bar">
              <button type="button" class="btn-upload-cancel" onclick="window.toggleOrderPhotoUploadCard('${order.id}')">Batal</button>
              <button type="button" class="btn-upload-submit" id="btnSubmitPhoto_${order.id}" onclick="window.submitOrderPhoto('${order.id}')">
                <span>Simpan ke History Log</span>
                <span>↗</span>
              </button>
            </div>
          </div>

          <!-- Visual Proof of Progress by Stage Gallery -->
          ${stageProofGalleryHtml}

          <!-- History Timeline Filter Bar -->
          <div class="history-timeline-filter-bar">
            <div class="history-filter-chips-group">
              <button type="button" class="history-filter-chip history-filter-chip-${order.id} active" onclick="window.filterHistoryTimeline('${order.id}', 'all', this)">
                <span>Semua Riwayat (${activityLogs.length})</span>
              </button>
              <button type="button" class="history-filter-chip history-filter-chip-${order.id} photos-chip" onclick="window.filterHistoryTimeline('${order.id}', 'photos-only', this)">
                <span>📸 Bukti Foto (${photoLogs.length})</span>
              </button>
            </div>
            <div style="font-size: 11px; color: #6d8692;">
              <span>Ketuk foto untuk melihat pratinjau penuh</span>
            </div>
          </div>

          <div class="history-timeline-list" id="historyTimelineList_${order.id}">
            ${historyLogsHtml}
          </div>
        </div>
      </div>

      <!-- Stepper Progress Pipeline -->
      <div class="order-stepper-wrap">
        <div class="stepper-progress-track-bg">
          <div class="stepper-progress-fill" id="stepperProgressFill" style="width: 0%;"></div>
          <div class="stepper-nodes-row">
            ${stepperHtml}
          </div>
        </div>

        <!-- Current Stage Callout -->
        <div class="current-stage-callout">
          <div class="current-stage-callout-icon">${stageCfg.icon}</div>
          <div class="current-stage-callout-text">
            <b>Status Terkini: ${stageCfg.title} ${activeDate ? `· ${activeDate}` : ''}</b>
            <p>${activeNote}</p>
          </div>
        </div>
      </div>

      <!-- Specifications & Activity Grid -->
      <div class="order-details-grid">
        
        <!-- Left Column: Technical Specifications -->
        <div class="details-column">
          <h3>
            <span>📋</span>
            <span>Spesifikasi & Informasi Proyek</span>
          </h3>

          <div class="spec-list">
            <div class="spec-item">
              <span class="spec-label">ID Pesanan (SPK)</span>
              <span class="spec-val highlight">${order.id}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Nama Klien / Instansi</span>
              <span class="spec-val">${order.customerName}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Lokasi Pemasangan</span>
              <span class="spec-val">${order.location || '-'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Tanggal Order</span>
              <span class="spec-val">${order.orderDate || '-'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Estimasi Serah Terima</span>
              <span class="spec-val highlight">${order.estimatedCompletion || '-'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Lead Engineer</span>
              <span class="spec-val">${order.leadEngineer || 'Tim Fabrikasi Sahabat Aluminium'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Pengawas Lapangan</span>
              <span class="spec-val">${order.fieldSupervisor || 'Supervisor K3'}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Material Terpasang</span>
              <span class="spec-val">${order.materialSpec || 'Kusen Aluminium SNI & Kaca Tempered Berkualitas'}</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Verification & QC Milestones -->
        <div class="details-column">
          <h3>
            <span>🔍</span>
            <span>Jadwal & Standar Verifikasi Lapangan</span>
          </h3>

          <div class="activity-timeline">
            ${stageCheckpointsHtml}
          </div>
        </div>

      </div>

      <!-- Action Footer -->
      <div class="order-action-footer">
        <div class="order-actions-left">
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn-order-wa">
            <span>💬</span>
            <span>Tanya Update Proyek Ini via WhatsApp</span>
          </a>
          <button type="button" class="btn-order-pdf" id="btnDownloadPdf_${order.id}" onclick="window.generateProjectPdfReport('${order.id}')" title="Unduh laporan lengkap status proyek dan riwayat pengerjaan dalam format PDF">
            <span>📄</span>
            <span>Download PDF Report</span>
            <span class="pdf-icon-badge">PDF</span>
          </button>
          <button type="button" class="btn-order-print" onclick="window.printProjectPdf ? window.printProjectPdf('${order.id}') : window.print()" title="Cetak langsung ringkasan status proyek">
            <span>🖨️</span>
            <span>Cetak Cepat</span>
          </button>
        </div>

        <!-- Simulation Controls for Testing Real-Time Stages -->
        <div class="order-simulator-controls">
          <span>Simulasi Tahap:</span>
          <select id="stageSimulatorSelect" class="simulator-select" aria-label="Pilih tahap simulasi">
            <option value="Survey" ${currentStage === 'Survey' ? 'selected' : ''}>1. Survey & Pengukuran</option>
            <option value="Fabrication" ${currentStage === 'Fabrication' ? 'selected' : ''}>2. Fabrikasi Workshop</option>
            <option value="Installation" ${currentStage === 'Installation' ? 'selected' : ''}>3. Instalasi On-Site</option>
            <option value="Completed" ${currentStage === 'Completed' ? 'selected' : ''}>4. Selesai & Garansi</option>
          </select>
          <button type="button" class="btn-simulate-apply" onclick="window.simulateStageTransition('${order.id}')">
            Ubah Status Real-Time ↗
          </button>
        </div>
      </div>

    </div>
  `;

  // Trigger CSS transition animation smoothly filling from 0% to target percentage
  requestAnimationFrame(() => {
    setTimeout(() => {
      const fillBar = document.getElementById('progressBarFill');
      const stepperFill = document.getElementById('stepperProgressFill');
      const numEl = document.getElementById('progressBigNumber');

      if (fillBar) {
        fillBar.style.width = `${percent}%`;
        fillBar.classList.add('animated');
      }
      if (stepperFill) {
        stepperFill.style.width = `${percent}%`;
      }

      // Smooth numerical counter from 0% to target percentage
      if (numEl) {
        let startTime = null;
        const duration = 1150;
        function stepCounter(timestamp) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic: 1 - (1 - progress)^3
          const ease = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.round(percent * ease);
          numEl.textContent = `${currentVal}%`;
          if (progress < 1) {
            requestAnimationFrame(stepCounter);
          } else {
            numEl.textContent = `${percent}%`;
          }
        }
        requestAnimationFrame(stepCounter);
      }
    }, 40);
  });
}

function renderProjectOrderError(errorMsg, availableIds = []) {
  const container = document.getElementById('orderResultContainer');
  if (!container) return;

  const suggestionsHtml = availableIds.length > 0
    ? `
      <div style="margin-top:16px;">
        <span style="font-size:13px;color:var(--muted);">Order ID yang tersedia untuk dicoba:</span>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
          ${availableIds.map(id => `
            <button type="button" class="preset-chip-btn" onclick="window.trackProjectOrder('${id}')">
              ${id}
            </button>
          `).join('')}
        </div>
      </div>
    `
    : '';

  container.innerHTML = `
    <div class="order-error-state">
      <div class="order-error-icon">🔍</div>
      <div class="order-error-title">Pesanan Tidak Ditemukan</div>
      <p class="order-error-msg">${errorMsg}</p>
      ${suggestionsHtml}
      <div style="margin-top:20px;">
        <a href="https://wa.me/6289637371166?text=Halo%20Admin%20Sahabat%20Kaca%20Aluminium%2C%20saya%20ingin%20menanyakan%20nomor%20SPK%20atau%20status%20pesanan%20saya." target="_blank" rel="noopener" class="btn-order-wa" style="display:inline-flex;">
          <span>💬</span>
          <span>Hubungi Admin untuk Cek Nomor SPK</span>
        </a>
      </div>
    </div>
  `;
}

window.simulateStageTransition = async function(orderId) {
  const selectEl = document.getElementById('stageSimulatorSelect');
  if (!selectEl) return;
  const targetStage = selectEl.value;

  const btn = document.querySelector('.btn-simulate-apply');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Memperbarui...';
  }

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: targetStage,
        notes: `Simulasi update real-time: Proyek berhasil dipindahkan ke tahap ${targetStage} dengan standar kualitas ISO/SNI.`
      })
    });
    const data = await res.json();
    if (data.success && data.order) {
      renderProjectOrder(data.order);
    } else {
      alert(data.error || 'Gagal mengubah status');
    }
  } catch (err) {
    console.error('Error simulating stage:', err);
    alert('Gagal menghubungi server');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Ubah Status Real-Time ↗';
    }
  }
};

// Initialize Project Tracker on Load
document.addEventListener('DOMContentLoaded', () => {
  const trackerSection = document.getElementById('status-proyek');
  if (!trackerSection) return;

  // Preset button click listener
  document.querySelectorAll('.preset-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-id');
      if (orderId) {
        window.trackProjectOrder(orderId);
      }
    });
  });

  // URL query parameter check (?order=SKA-2026-003 or #status-proyek)
  const urlParams = new URLSearchParams(window.location.search);
  const initialOrderId = urlParams.get('order') || urlParams.get('order_id') || 'SKA-2026-002';

  // Automatically load initial order
  window.trackProjectOrder(initialOrderId);
});

// =========================================================
// FOOTER NEWSLETTER SUBSCRIPTION CONTROLLER
// Simple client validation + API call + accessible feedback
// =========================================================
function initFooterNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  if (!forms.length) return;

  forms.forEach(form => {
    const input = form.querySelector('.newsletter-input');
    const btn = form.querySelector('.newsletter-btn');
    const inputGroup = form.querySelector('.newsletter-input-group');

    if (!input || !btn) return;

    // Reset error on typing
    input.addEventListener('input', () => {
      if (inputGroup) inputGroup.classList.remove('input-error');
      const feedback = form.querySelector('.newsletter-feedback');
      if (feedback && feedback.classList.contains('is-error')) {
        feedback.style.display = 'none';
        feedback.className = 'newsletter-feedback';
        feedback.innerHTML = '';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawVal = input.value || '';
      const email = rawVal.trim();

      // Simple Validation
      if (!email) {
        showFeedback(form, 'error', '⚠️ Harap masukkan alamat email Anda.');
        if (inputGroup) inputGroup.classList.add('input-error');
        input.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFeedback(form, 'error', '⚠️ Format email tidak valid (contoh: nama@perusahaan.com).');
        if (inputGroup) inputGroup.classList.add('input-error');
        input.focus();
        return;
      }

      // Loading state
      btn.disabled = true;
      const originalBtnHtml = btn.innerHTML;
      btn.innerHTML = '<span>Mendaftarkan...</span>';

      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: window.location.pathname })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showFeedback(form, 'success', `✓ ${data.message || 'Berhasil berlangganan update proyek!'}`);
          input.value = '';
          if (inputGroup) inputGroup.classList.remove('input-error');

          // Store local flag
          try {
            localStorage.setItem('subscribed_newsletter', 'true');
          } catch (_) {}
        } else {
          showFeedback(form, 'error', `⚠️ ${data.error || 'Gagal mendaftar. Silakan coba lagi.'}`);
          if (inputGroup) inputGroup.classList.add('input-error');
        }
      } catch (err) {
        console.error('Newsletter submission error:', err);
        showFeedback(form, 'error', '⚠️ Terjadi gangguan koneksi internet. Silakan coba lagi.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml;
      }
    });
  });

  function showFeedback(form, type, message) {
    const feedback = form.querySelector('.newsletter-feedback');
    if (!feedback) return;

    feedback.className = `newsletter-feedback is-${type}`;
    feedback.innerHTML = message;
    feedback.style.display = 'flex';
  }
}

// Attach newsletter listener
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterNewsletter);
  } else {
    initFooterNewsletter();
  }
}

// =========================================================
// PROJECT PHOTO UPLOAD & HISTORY LOG CONTROLLER
// Mobile camera capture & device storage photo uploads
// =========================================================

// Pending photo selection store mapped by orderId
window.orderPendingPhotos = window.orderPendingPhotos || {};

// Toggle visibility of the upload card
window.toggleOrderPhotoUploadCard = function(orderId) {
  const card = document.getElementById(`orderPhotoUploadCard_${orderId}`);
  const btn = document.getElementById(`btnToggleUpload_${orderId}`);
  if (!card) return;

  const isHidden = card.style.display === 'none' || !card.style.display;
  if (isHidden) {
    card.style.display = 'block';
    if (btn) btn.classList.add('active');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    card.style.display = 'none';
    if (btn) btn.classList.remove('active');
  }
};

// Handle photo selected from camera or file picker
window.handleOrderPhotoSelected = async function(event, orderId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  // Validate that it's an image
  if (!file.type.startsWith('image/')) {
    window.showOrderPhotoFeedback(orderId, 'error', '⚠️ File yang dipilih harus berformat gambar (JPG, PNG, atau WEBP).');
    return;
  }

  // Show dropzone loading
  const dropzone = document.getElementById(`uploadDropzone_${orderId}`);
  if (dropzone) {
    dropzone.innerHTML = `<span class="dropzone-icon">⏳</span><div class="dropzone-label">Mengoptimalkan foto...</div>`;
  }

  try {
    // Compress image to ensure fast uploads even on mobile networks
    const compressedDataUrl = await window.compressProjectImage(file, 1600, 0.85);

    // Store in pending memory
    window.orderPendingPhotos[orderId] = {
      dataUrl: compressedDataUrl,
      fileName: file.name || 'foto-lapangan.jpg',
      fileSize: Math.round(compressedDataUrl.length * 0.75 / 1024) + ' KB'
    };

    // Update Preview UI
    const previewCard = document.getElementById(`uploadPreviewCard_${orderId}`);
    const previewImg = document.getElementById(`uploadPreviewImg_${orderId}`);
    const previewName = document.getElementById(`uploadPreviewName_${orderId}`);
    const previewSize = document.getElementById(`uploadPreviewSize_${orderId}`);

    if (previewCard && previewImg) {
      previewImg.src = compressedDataUrl;
      if (previewName) previewName.textContent = file.name || 'foto-lapangan.jpg';
      if (previewSize) previewSize.textContent = window.orderPendingPhotos[orderId].fileSize;

      previewCard.style.display = 'flex';
      if (dropzone) dropzone.style.display = 'none';
    }

    // Clear any previous error feedback
    window.showOrderPhotoFeedback(orderId, 'clear', '');
  } catch (err) {
    console.error('Error processing photo:', err);
    window.showOrderPhotoFeedback(orderId, 'error', '⚠️ Gagal membaca foto. Silakan coba kembali.');
    if (dropzone) {
      dropzone.innerHTML = `
        <span class="dropzone-icon">🖼️</span>
        <div class="dropzone-label">Ketuk di sini atau seret foto ke dalam area ini</div>
        <div class="dropzone-sublabel">Format foto didukung: JPG, PNG, WEBP</div>
      `;
    }
  }
};

// Clear currently selected photo
window.clearOrderPhotoSelected = function(orderId) {
  delete window.orderPendingPhotos[orderId];

  const previewCard = document.getElementById(`uploadPreviewCard_${orderId}`);
  const dropzone = document.getElementById(`uploadDropzone_${orderId}`);
  const camInput = document.getElementById(`orderPhotoCameraInput_${orderId}`);
  const storageInput = document.getElementById(`orderPhotoStorageInput_${orderId}`);

  if (previewCard) previewCard.style.display = 'none';
  if (dropzone) {
    dropzone.style.display = 'block';
    dropzone.innerHTML = `
      <span class="dropzone-icon">🖼️</span>
      <div class="dropzone-label">Ketuk di sini atau seret foto ke dalam area ini</div>
      <div class="dropzone-sublabel">Format foto didukung: JPG, PNG, WEBP (otomatis dioptimalkan)</div>
    `;
  }
  if (camInput) camInput.value = '';
  if (storageInput) storageInput.value = '';
  window.showOrderPhotoFeedback(orderId, 'clear', '');
};

// Compress image via off-screen canvas
window.compressProjectImage = function(file, maxWidth = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Submit uploaded photo to backend API
window.submitOrderPhoto = async function(orderId) {
  const pending = window.orderPendingPhotos[orderId];
  if (!pending || !pending.dataUrl) {
    window.showOrderPhotoFeedback(orderId, 'error', '⚠️ Harap ambil foto dari kamera atau pilih file foto terlebih dahulu.');
    return;
  }

  const stageSelect = document.getElementById(`uploadStageSelect_${orderId}`);
  const titleInput = document.getElementById(`uploadTitleInput_${orderId}`);
  const captionInput = document.getElementById(`uploadCaptionInput_${orderId}`);
  const uploaderInput = document.getElementById(`uploadUploaderInput_${orderId}`);
  const submitBtn = document.getElementById(`btnSubmitPhoto_${orderId}`);

  const stage = stageSelect ? stageSelect.value : 'Survey';
  const title = titleInput ? titleInput.value.trim() : '';
  const caption = captionInput ? captionInput.value.trim() : '';
  const uploader = uploaderInput ? uploaderInput.value.trim() : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳ Mengunggah foto...</span>`;
  }

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/upload-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo: pending.dataUrl,
        stage,
        title: title || `Dokumentasi Foto Lapangan (${stage})`,
        caption,
        uploader: uploader || 'Pengguna / Pengawas Lapangan'
      })
    });

    const data = await res.json();

    if (res.ok && data.success && data.order) {
      window.showOrderPhotoFeedback(orderId, 'success', `✓ ${data.message || 'Foto progres berhasil disimpan ke history log!'}`);
      delete window.orderPendingPhotos[orderId];

      setTimeout(() => {
        renderProjectOrder(data.order);
        const timelineList = document.querySelector('.history-timeline-list');
        if (timelineList) {
          timelineList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 700);
    } else {
      window.showOrderPhotoFeedback(orderId, 'error', `⚠️ ${data.error || 'Gagal mengunggah foto. Silakan coba kembali.'}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Simpan ke History Log</span><span>↗</span>`;
      }
    }
  } catch (err) {
    console.error('Error submitting order photo:', err);
    window.showOrderPhotoFeedback(orderId, 'error', '⚠️ Terjadi gangguan koneksi saat mengunggah foto. Periksa jaringan Anda dan coba lagi.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Simpan ke History Log</span><span>↗</span>`;
    }
  }
};

// Display error/success feedback
window.showOrderPhotoFeedback = function(orderId, type, message) {
  const fb = document.getElementById(`uploadFeedbackMsg_${orderId}`);
  if (!fb) return;

  if (type === 'clear') {
    fb.style.display = 'none';
    fb.className = 'upload-feedback-msg';
    fb.textContent = '';
    return;
  }

  fb.className = `upload-feedback-msg ${type}`;
  fb.textContent = message;
  fb.style.display = 'block';
};

// Order Photo Full-Screen Lightbox Modal
window.openOrderPhotoModal = function(photoUrl, title, caption, time, orderId, logIndex, uploader) {
  let modal = document.getElementById('orderPhotoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orderPhotoModal';
    modal.className = 'order-photo-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="order-photo-modal-content">
        <div class="order-photo-modal-header">
          <h5 class="order-photo-modal-title" id="orderPhotoModalTitle">Dokumentasi Foto Proyek</h5>
          <button type="button" class="order-photo-modal-close" onclick="window.closeOrderPhotoModal()" aria-label="Tutup Pratinjau">✕</button>
        </div>
        <div class="order-photo-modal-body">
          <img id="orderPhotoModalImg" class="order-photo-modal-img" src="" alt="Pratinjau Dokumentasi">
        </div>
        <div class="order-photo-modal-footer">
          <div class="order-photo-modal-footer-top">
            <p id="orderPhotoModalCaption" class="order-photo-modal-caption"></p>
            <button type="button" class="btn-lightbox-edit" id="btnLightboxEdit" style="display: none;">
              <span>✏️</span>
              <span>Edit Keterangan</span>
            </button>
          </div>
          <div class="order-photo-modal-meta">
            <span id="orderPhotoModalTime"></span>
            <span id="orderPhotoModalUploader"></span>
          </div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeOrderPhotoModal();
    });
    document.body.appendChild(modal);
  }

  const imgEl = document.getElementById('orderPhotoModalImg');
  const titleEl = document.getElementById('orderPhotoModalTitle');
  const captionEl = document.getElementById('orderPhotoModalCaption');
  const timeEl = document.getElementById('orderPhotoModalTime');
  const uploaderEl = document.getElementById('orderPhotoModalUploader');
  const btnLightboxEdit = document.getElementById('btnLightboxEdit');

  if (imgEl) imgEl.src = photoUrl;
  if (titleEl) titleEl.textContent = title || 'Dokumentasi Foto Proyek';
  if (captionEl) {
    captionEl.textContent = caption || '';
    captionEl.style.display = caption ? 'block' : 'none';
  }
  if (timeEl) timeEl.textContent = time ? `Waktu: ${time}` : '';
  if (uploaderEl) uploaderEl.textContent = uploader ? `Pengunggah: ${uploader}` : '';

  if (btnLightboxEdit) {
    if (orderId) {
      btnLightboxEdit.style.display = 'inline-flex';
      btnLightboxEdit.onclick = function() {
        window.closeOrderPhotoModal();
        window.openEditPhotoModal(orderId, logIndex, title, caption, photoUrl, uploader);
      };
    } else {
      btnLightboxEdit.style.display = 'none';
    }
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeOrderPhotoModal = function() {
  const modal = document.getElementById('orderPhotoModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// =========================================================
// EDIT PHOTO CAPTION & NAME MODAL CONTROLLER
// =========================================================
window.currentEditingPhoto = null;

window.openEditPhotoModal = function(orderId, logIndex, currentTitle, currentCaption, photoUrl, currentUploader) {
  let modal = document.getElementById('editPhotoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editPhotoModal';
    modal.className = 'edit-photo-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="edit-photo-modal-content">
        <div class="edit-photo-modal-header">
          <h5 class="edit-photo-modal-title">
            <span>✏️</span>
            <span>Edit Nama & Keterangan Foto Proyek</span>
          </h5>
          <button type="button" class="edit-photo-modal-close" onclick="window.closeEditPhotoModal()" aria-label="Tutup Formulir">✕</button>
        </div>
        <div class="edit-photo-modal-body">
          <div class="edit-photo-preview-bar">
            <img id="editPhotoModalThumb" class="edit-photo-thumb" src="" alt="Pratinjau Foto">
            <div class="edit-photo-preview-info">
              <div class="edit-photo-target-order" id="editPhotoTargetOrder">ORDER #...</div>
              <div class="edit-photo-target-name" id="editPhotoTargetOriginalName">...</div>
            </div>
          </div>
          <div class="upload-form-group">
            <label class="upload-label" for="editPhotoTitleInput">Nama / Judul Foto Proyek</label>
            <input type="text" id="editPhotoTitleInput" class="upload-input" placeholder="Masukkan judul foto...">
          </div>
          <div class="upload-form-group">
            <label class="upload-label" for="editPhotoCaptionInput">Keterangan / Catatan Foto (Caption)</label>
            <textarea id="editPhotoCaptionInput" class="upload-textarea" placeholder="Tambahkan rincian progres atau catatan foto..."></textarea>
          </div>
          <div class="upload-form-group">
            <label class="upload-label" for="editPhotoUploaderInput">Nama Pengunggah / Editor</label>
            <input type="text" id="editPhotoUploaderInput" class="upload-input" placeholder="Nama pengunggah atau peran...">
          </div>
          <div class="upload-feedback-msg" id="editPhotoFeedbackMsg" style="display: none;"></div>
        </div>
        <div class="edit-photo-modal-footer">
          <button type="button" class="btn-edit-modal-cancel" onclick="window.closeEditPhotoModal()">Batal</button>
          <button type="button" class="btn-edit-modal-save" id="btnSavePhotoEdit" onclick="window.submitEditPhoto()">
            <span>Simpan Perubahan</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeEditPhotoModal();
    });
    document.body.appendChild(modal);
  }

  window.currentEditingPhoto = {
    orderId,
    logIndex,
    photoUrl,
    title: currentTitle || '',
    caption: currentCaption || '',
    uploader: currentUploader || ''
  };

  const thumbEl = document.getElementById('editPhotoModalThumb');
  const targetOrderEl = document.getElementById('editPhotoTargetOrder');
  const targetOriginalNameEl = document.getElementById('editPhotoTargetOriginalName');
  const titleInput = document.getElementById('editPhotoTitleInput');
  const captionInput = document.getElementById('editPhotoCaptionInput');
  const uploaderInput = document.getElementById('editPhotoUploaderInput');
  const feedbackEl = document.getElementById('editPhotoFeedbackMsg');
  const saveBtn = document.getElementById('btnSavePhotoEdit');

  if (thumbEl) thumbEl.src = photoUrl;
  if (targetOrderEl) targetOrderEl.textContent = `ORDER ID: #${orderId}`;
  if (targetOriginalNameEl) targetOriginalNameEl.textContent = currentTitle || 'Foto Proyek';
  if (titleInput) titleInput.value = currentTitle || '';
  if (captionInput) captionInput.value = currentCaption || '';
  if (uploaderInput) uploaderInput.value = currentUploader || 'Klien / Pengawas Lapangan';
  if (feedbackEl) {
    feedbackEl.style.display = 'none';
    feedbackEl.className = 'upload-feedback-msg';
    feedbackEl.textContent = '';
  }
  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<span>Simpan Perubahan</span><span>↗</span>`;
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (captionInput) captionInput.focus();
  }, 100);
};

window.closeEditPhotoModal = function() {
  const modal = document.getElementById('editPhotoModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  window.currentEditingPhoto = null;
};

window.submitEditPhoto = async function() {
  if (!window.currentEditingPhoto) return;

  const { orderId, logIndex, photoUrl } = window.currentEditingPhoto;
  const titleInput = document.getElementById('editPhotoTitleInput');
  const captionInput = document.getElementById('editPhotoCaptionInput');
  const uploaderInput = document.getElementById('editPhotoUploaderInput');
  const saveBtn = document.getElementById('btnSavePhotoEdit');
  const feedbackEl = document.getElementById('editPhotoFeedbackMsg');

  const newTitle = titleInput ? titleInput.value.trim() : '';
  const newCaption = captionInput ? captionInput.value.trim() : '';
  const newUploader = uploaderInput ? uploaderInput.value.trim() : '';

  if (!newTitle) {
    if (feedbackEl) {
      feedbackEl.className = 'upload-feedback-msg error';
      feedbackEl.textContent = '⚠️ Nama / judul foto tidak boleh kosong.';
      feedbackEl.style.display = 'block';
    }
    if (titleInput) titleInput.focus();
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<span>⏳ Menyimpan perubahan...</span>`;
  }

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/update-photo-caption`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logIndex,
        photoUrl,
        title: newTitle,
        caption: newCaption,
        uploader: newUploader
      })
    });

    const data = await res.json();

    if (res.ok && data.success && data.order) {
      if (feedbackEl) {
        feedbackEl.className = 'upload-feedback-msg success';
        feedbackEl.textContent = `✓ ${data.message || 'Keterangan dan nama foto berhasil diperbarui!'}`;
        feedbackEl.style.display = 'block';
      }

      setTimeout(() => {
        window.closeEditPhotoModal();
        renderProjectOrder(data.order);
      }, 500);
    } else {
      if (feedbackEl) {
        feedbackEl.className = 'upload-feedback-msg error';
        feedbackEl.textContent = `⚠️ ${data.error || 'Gagal menyimpan perubahan. Silakan coba lagi.'}`;
        feedbackEl.style.display = 'block';
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span>Simpan Perubahan</span><span>↗</span>`;
      }
    }
  } catch (err) {
    console.error('Error updating photo caption:', err);
    if (feedbackEl) {
      feedbackEl.className = 'upload-feedback-msg error';
      feedbackEl.textContent = '⚠️ Terjadi gangguan koneksi internet. Silakan coba kembali.';
      feedbackEl.style.display = 'block';
    }
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Simpan Perubahan</span><span>↗</span>`;
    }
  }
};

// Keyboard escape listener for modals
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeOrderPhotoModal();
      window.closeEditPhotoModal();
      window.closeProjectPdfModal();
    }
  });
}

// Quick Open Upload Form with Stage preselected
window.openUploadWithStage = function(orderId, stageKey) {
  const card = document.getElementById(`orderPhotoUploadCard_${orderId}`);
  if (card && (card.style.display === 'none' || !card.style.display)) {
    window.toggleOrderPhotoUploadCard(orderId);
  }
  const stageSelect = document.getElementById(`uploadStageSelect_${orderId}`);
  if (stageSelect && stageKey) {
    stageSelect.value = stageKey;
  }
  const titleInput = document.getElementById(`uploadTitleInput_${orderId}`);
  if (titleInput && stageKey) {
    titleInput.value = `Dokumentasi Foto Lapangan (${stageKey})`;
  }
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// Filter History Log Timeline: All vs Photos-only
window.filterHistoryTimeline = function(orderId, mode, btn) {
  const container = document.getElementById(`historyTimelineList_${orderId}`);
  if (!container) return;

  const filterBtns = document.querySelectorAll(`.history-filter-chip-${orderId}`);
  filterBtns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = container.querySelectorAll('.history-log-item');
  items.forEach(item => {
    if (mode === 'photos-only') {
      if (item.classList.contains('has-photo')) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    } else {
      item.style.display = 'flex';
    }
  });
};

// =========================================================
// PROJECT PDF REPORT GENERATOR & EXPORT CONTROLLER
// Generates official printable summary of current status
// & full history log for user's documentation and records.
// =========================================================

window.activePdfOrder = null;

// Generate printable HTML for the PDF Report
window.buildProjectPdfReportHtml = function(order) {
  if (!order) return '';

  const stagesMap = {
    Survey: { title: 'Survey & Pengukuran Lapangan', icon: '📐', pct: '25%' },
    Fabrication: { title: 'Fabrikasi Workshop & Perakitan', icon: '⚙️', pct: '50%' },
    Installation: { title: 'Pemasangan & Instalasi On-Site', icon: '🏗️', pct: '75%' },
    Completed: { title: 'Selesai & Garansi Terverifikasi', icon: '🛡️', pct: '100%' }
  };

  const currentStage = order.currentStage || 'Survey';
  const stageCfg = stagesMap[currentStage] || { title: currentStage, icon: '📌', pct: '' };
  const percent = order.currentPercent || 25;
  const now = new Date();
  const printTimestamp = `${now.getDate()} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][now.getMonth()]} ${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const reportDocNum = `REP-SKA-${order.id}-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;

  const stages = order.stages || {};
  const stageKeys = ['Survey', 'Fabrication', 'Installation', 'Completed'];

  const checkpointsRowsHtml = stageKeys.map((stKey, idx) => {
    const stInfo = stagesMap[stKey];
    const data = stages[stKey] || { status: 'pending', date: '-', notes: '-' };
    const statusText = data.status === 'completed' ? 'SELESAI (VERIFIED)' : (data.status === 'in-progress' ? 'SEDANG BERJALAN' : 'MENUNGGU GILIRAN');
    const pillClass = data.status === 'completed' ? 'completed' : (data.status === 'in-progress' ? 'in-progress' : 'pending');

    return `
      <tr>
        <td style="font-weight: 700; width: 35px; text-align: center;">0${idx + 1}</td>
        <td style="font-weight: 700;">${stInfo.icon} ${stInfo.title} (${stInfo.pct})</td>
        <td style="width: 140px; text-align: center;"><span class="pdf-stage-pill ${pillClass}">${statusText}</span></td>
        <td style="width: 110px; color: #557280;">${data.date || '-'}</td>
        <td style="font-size: 10.5px; color: #3b525f;">${data.notes || '-'}</td>
      </tr>
    `;
  }).join('');

  // History log rows
  const logs = Array.isArray(order.activityLog) ? order.activityLog : [];
  const historyRowsHtml = logs.length === 0 
    ? `<tr><td colspan="6" style="text-align: center; color: #7b94a0; padding: 16px;">Belum ada catatan aktivitas riwayat pada pesanan ini.</td></tr>`
    : logs.map((log, index) => {
        const hasPhoto = Boolean(log.photo);
        const stageInfo = stagesMap[log.stage] || { title: log.stage || '-', icon: '📌' };

        return `
          <tr>
            <td style="text-align: center; font-weight: 700; width: 30px;">${logs.length - index}</td>
            <td style="width: 110px; font-family: monospace; font-size: 10px; color: #496470;">${log.timestamp || '-'}</td>
            <td style="width: 105px; font-weight: 700; color: #0d5c73;">${stageInfo.icon} ${log.stage || '-'}</td>
            <td style="font-weight: 700; color: #061f29;">
              ${log.title || '-'}
              ${log.editedAt ? `<span style="font-size: 9px; color: #718a96; font-style: italic; display: block; margin-top: 2px;">(Diedit: ${log.editedAt})</span>` : ''}
            </td>
            <td style="color: #3b525f; font-size: 10.5px;">
              ${log.desc || '-'}
              ${hasPhoto ? `
                <div style="margin-top: 6px; padding: 4px; border: 1px solid #d4e5ea; border-radius: 4px; display: inline-block; background: #ffffff;">
                  <img src="${log.photo}" alt="${log.title || 'Foto Proyek'}" class="pdf-table-photo-thumb" style="width: 70px; height: 70px; object-fit: cover; display: block; border-radius: 3px;">
                  ${log.photoCaption ? `<div style="font-size: 9.5px; color: #557280; margin-top: 3px; max-width: 140px; font-style: italic;">"${log.photoCaption}"</div>` : ''}
                </div>
              ` : ''}
            </td>
            <td style="width: 100px; font-size: 10px; color: #5c7582;">${log.uploader || 'Sistem / Admin'}</td>
          </tr>
        `;
      }).join('');

  return `
    <div class="pdf-sheet" id="printableProjectReportContent">
      
      <!-- Official Header -->
      <div class="pdf-header">
        <div class="pdf-brand-box">
          <img src="assets/logo.png" alt="Sahabat Kaca Aluminium" class="pdf-logo-img" onerror="this.style.display='none'">
          <div class="pdf-brand-meta">
            <h2>SAHABAT KACA ALUMINIUM</h2>
            <p><strong>Spesialis Fabrikasi & Pemasangan Kaca Aluminium Terpercaya Karawang</strong></p>
            <p>Partisi Kaca Tempered · Kusen Aluminium SNI · Pintu/Jendela Kaca · Folding Door</p>
            <p>Workshop Karawang, Jawa Barat | Telp/WA: 0896-3737-1166 | Web: sahabatkacaaluminium.com</p>
          </div>
        </div>

        <div class="pdf-doc-meta">
          <span class="pdf-doc-badge">DOKUMEN RESMI PELACAKAN PROYEK</span>
          <div class="pdf-doc-num">No. Dok: ${reportDocNum}</div>
          <div>Tanggal Cetak: <strong>${printTimestamp}</strong></div>
          <div>Status: <strong style="color: #16b95b;">TERVERIFIKASI SISTEM</strong></div>
        </div>
      </div>

      <!-- Title Banner -->
      <div class="pdf-title-banner">
        <h3>LAPORAN STATUS PROYEK & RIWAYAT PENGERJAAN LENGKAP</h3>
        <p>Ringkasan resmi data teknis, progres milestone tahapan pengerjaan, dan catatan log audit lapangan untuk nomor pesanan <strong>#${order.id}</strong>.</p>
      </div>

      <!-- Project Information Grid -->
      <div class="pdf-section-title">
        <span>📋</span>
        <span>Informasi & Spesifikasi Proyek</span>
      </div>

      <div class="pdf-info-grid">
        <div class="pdf-info-item">
          <span class="pdf-info-label">No. SPK / Order ID:</span>
          <span class="pdf-info-value highlight">#${order.id}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Nama Klien / Instansi:</span>
          <span class="pdf-info-value">${order.customerName || '-'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Judul Pekerjaan:</span>
          <span class="pdf-info-value">${order.projectTitle || '-'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Tipe Pekerjaan:</span>
          <span class="pdf-info-value">${order.projectType || 'Kaca & Aluminium'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Lokasi Pemasangan:</span>
          <span class="pdf-info-value">${order.location || 'Karawang, Jawa Barat'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Kontak Klien:</span>
          <span class="pdf-info-value">${order.contactPhone || '-'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Tanggal Order (SPK):</span>
          <span class="pdf-info-value">${order.orderDate || '-'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Estimasi Serah Terima:</span>
          <span class="pdf-info-value highlight">${order.estimatedCompletion || '-'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Lead Engineer:</span>
          <span class="pdf-info-value">${order.leadEngineer || 'Tim Fabrikasi Sahabat Aluminium'}</span>
        </div>
        <div class="pdf-info-item">
          <span class="pdf-info-label">Pengawas Lapangan:</span>
          <span class="pdf-info-value">${order.fieldSupervisor || 'Supervisor Proyek'}</span>
        </div>
        <div class="pdf-info-item full">
          <span class="pdf-info-label">Spesifikasi Material:</span>
          <span class="pdf-info-value">${order.materialSpec || 'Kusen Aluminium SNI & Kaca Tempered Berkualitas'}</span>
        </div>
      </div>

      <!-- Current Progress Summary -->
      <div class="pdf-section-title">
        <span>📊</span>
        <span>Status Pengerjaan Saat Ini (Progres: ${percent}%)</span>
      </div>

      <div style="background: #f4f8fa; border: 1px solid #d5e5eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 10px; color: #c8943d; font-weight: 800; text-transform: uppercase;">TAHAPAN SAAT INI</div>
          <div style="font-size: 15px; font-weight: 800; color: #0d5c73; margin-top: 2px;">
            ${stageCfg.icon} ${stageCfg.title}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 22px; font-weight: 800; color: #0d5c73; line-height: 1;">${percent}%</div>
          <div style="font-size: 10px; color: #6a8592; font-weight: 700;">PROGRES FISIK</div>
        </div>
      </div>

      <!-- Stage Milestones Table -->
      <table class="pdf-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Milestone Tahapan Pengerjaan</th>
            <th style="text-align: center;">Status Verifikasi</th>
            <th>Tanggal Target / Selesai</th>
            <th>Catatan Teknis Pengerjaan</th>
          </tr>
        </thead>
        <tbody>
          ${checkpointsRowsHtml}
        </tbody>
      </table>

      <!-- Full History Log & Audit Trail Table -->
      <div class="pdf-section-title" style="margin-top: 22px;">
        <span>⏱️</span>
        <span>Riwayat Aktivitas & Log Pembaruan Lapangan (Full History Log)</span>
      </div>

      <table class="pdf-table">
        <thead>
          <tr>
            <th style="text-align: center;">#</th>
            <th>Waktu (WIB)</th>
            <th>Tahap</th>
            <th>Peristiwa / Pembaruan</th>
            <th>Deskripsi Teknis & Dokumentasi</th>
            <th>Petugas / PIC</th>
          </tr>
        </thead>
        <tbody>
          ${historyRowsHtml}
        </tbody>
      </table>

      <!-- Official Signatures Block -->
      <div class="pdf-signature-section">
        <div class="pdf-signature-box">
          <div class="pdf-sig-title">Disetujui & Diterima Oleh Klien:</div>
          <div class="pdf-sig-name">${order.customerName || 'Klien / Pemilik Bangunan'}</div>
          <div class="pdf-sig-role">Pemesan / Penanggung Jawab Lapangan</div>
        </div>

        <div class="pdf-signature-box">
          <div class="pdf-sig-title">Diterbitkan & Diverifikasi Oleh Pelaksana:</div>
          <div class="pdf-sig-name">${order.leadEngineer || 'Hendra Gunawan, S.T.'}</div>
          <div class="pdf-sig-role">Lead Engineer / Sahabat Kaca Aluminium</div>
        </div>
      </div>

      <!-- Legal Footer -->
      <div class="pdf-footer-note">
        Dokumen ini diterbitkan secara otomatis oleh Sistem Pelacakan Real-Time Sahabat Kaca Aluminium Karawang sebagai ringkasan status fisik proyek dan riwayat pembaruan resmi. Garansi pengerjaan dan material berlaku sesuai dengan Surat Perjanjian Kerja (SPK) yang telah disepakati bersama.
      </div>

    </div>
  `;
};

// Generate & Open the PDF Report Preview Modal
window.generateProjectPdfReport = async function(orderId) {
  let order = window.currentProjectOrder && window.currentProjectOrder.id === orderId
    ? window.currentProjectOrder
    : null;

  if (!order) {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (res.ok && data && data.order) {
        order = data.order;
        window.currentProjectOrder = order;
      }
    } catch (err) {
      console.error('Error fetching order for PDF:', err);
    }
  }

  if (!order) {
    alert('Gagal memuat data pesanan untuk laporan PDF.');
    return;
  }

  window.activePdfOrder = order;

  let modal = document.getElementById('projectPdfModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'projectPdfModal';
    modal.className = 'project-pdf-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="project-pdf-modal-content">
        <div class="project-pdf-modal-header">
          <h5 class="project-pdf-modal-title">
            <span>📄</span>
            <span id="pdfModalTitleText">Laporan Status Proyek PDF</span>
          </h5>
          <div class="project-pdf-modal-actions">
            <button type="button" class="btn-pdf-download-action" id="btnDownloadPdfFile" onclick="window.downloadPdfDirect()">
              <span>📥</span>
              <span>Unduh File PDF (.pdf)</span>
            </button>
            <button type="button" class="btn-pdf-print-action" id="btnPrintPdfDirect" onclick="window.printProjectPdf()">
              <span>🖨️</span>
              <span>Cetak / Print to PDF</span>
            </button>
            <button type="button" class="project-pdf-modal-close" onclick="window.closeProjectPdfModal()" aria-label="Tutup Pratinjau">✕</button>
          </div>
        </div>
        <div class="project-pdf-preview-scroll">
          <div id="pdfModalSheetContainer"></div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeProjectPdfModal();
    });
    document.body.appendChild(modal);
  }

  const titleEl = document.getElementById('pdfModalTitleText');
  const sheetContainer = document.getElementById('pdfModalSheetContainer');

  if (titleEl) {
    titleEl.textContent = `Laporan Status Proyek #${order.id} - ${order.customerName}`;
  }

  if (sheetContainer) {
    sheetContainer.innerHTML = window.buildProjectPdfReportHtml(order);
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

// Close PDF Preview Modal
window.closeProjectPdfModal = function() {
  const modal = document.getElementById('projectPdfModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Direct Download as .pdf file using html2pdf.js
window.downloadPdfDirect = function(orderId) {
  const order = window.activePdfOrder || window.currentProjectOrder;
  if (!order) return;

  const targetEl = document.getElementById('printableProjectReportContent');
  if (!targetEl) return;

  const downloadBtn = document.getElementById('btnDownloadPdfFile');
  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `<span>⏳</span><span>Memproses PDF...</span>`;
  }

  const fileName = `Laporan_Status_Proyek_${order.id}.pdf`;

  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: [8, 8, 8, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(targetEl).save()
      .then(() => {
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = `<span>✓</span><span>Tersimpan! Unduh Lagi</span>`;
          setTimeout(() => {
            downloadBtn.innerHTML = `<span>📥</span><span>Unduh File PDF (.pdf)</span>`;
          }, 3000);
        }
      })
      .catch((err) => {
        console.error('Error generating PDF via html2pdf:', err);
        // Fallback to print
        window.printProjectPdf();
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = `<span>📥</span><span>Unduh File PDF (.pdf)</span>`;
        }
      });
  } else {
    // Fallback: trigger print dialog (which allows saving as PDF)
    window.printProjectPdf();
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `<span>📥</span><span>Unduh File PDF (.pdf)</span>`;
    }
  }
};

// Print using high-fidelity isolated iframe
window.printProjectPdf = function(orderId) {
  let order = window.activePdfOrder || window.currentProjectOrder;
  if (!order && orderId) {
    window.generateProjectPdfReport(orderId).then(() => {
      window.printProjectPdf();
    });
    return;
  }
  if (!order) return;

  const reportHtml = window.buildProjectPdfReportHtml(order);

  // Use isolated printable iframe
  let printIframe = document.getElementById('pdfPrintIframe');
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'pdfPrintIframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.zIndex = '-9999';
    document.body.appendChild(printIframe);
  }

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan_Status_Proyek_${order.id}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1a2b32;
          background: #ffffff;
          font-size: 11px;
          line-height: 1.45;
        }
        .pdf-sheet { width: 100%; max-width: 100%; padding: 0; }
        .pdf-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0d5c73; padding-bottom: 12px; margin-bottom: 16px; gap: 16px; }
        .pdf-brand-box { display: flex; align-items: center; gap: 12px; }
        .pdf-logo-img { width: 55px; height: 55px; object-fit: contain; }
        .pdf-brand-meta h2 { font-size: 16px; font-weight: 800; color: #0d5c73; margin: 0 0 2px; }
        .pdf-brand-meta p { font-size: 9.5px; color: #4b6673; margin: 0; line-height: 1.3; }
        .pdf-doc-meta { text-align: right; font-size: 10px; color: #557280; line-height: 1.35; }
        .pdf-doc-badge { display: inline-block; background: #0d5c73; color: #ffffff; font-weight: 800; font-size: 9px; padding: 2px 7px; border-radius: 4px; margin-bottom: 3px; }
        .pdf-doc-num { font-family: monospace; font-weight: 700; color: #061f29; }
        .pdf-title-banner { background: #f1f7f9; border-left: 4px solid #c8943d; padding: 9px 12px; margin-bottom: 14px; border-radius: 0 4px 4px 0; }
        .pdf-title-banner h3 { font-size: 13px; font-weight: 800; color: #073746; margin: 0 0 2px; }
        .pdf-title-banner p { font-size: 10.5px; color: #557280; margin: 0; }
        .pdf-section-title { font-size: 11px; font-weight: 800; color: #0d5c73; border-bottom: 1.5px solid #dce8ec; padding-bottom: 3px; margin: 14px 0 8px; text-transform: uppercase; }
        .pdf-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; background: #fafcfe; border: 1px solid #e1ecf0; border-radius: 6px; padding: 10px 12px; margin-bottom: 14px; }
        .pdf-info-item { display: flex; font-size: 10.5px; }
        .pdf-info-item.full { grid-column: 1 / -1; }
        .pdf-info-label { width: 130px; flex-shrink: 0; color: #6a8592; font-weight: 600; }
        .pdf-info-value { flex: 1; color: #0d2833; font-weight: 700; }
        .pdf-info-value.highlight { color: #0d5c73; }
        .pdf-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 14px; }
        .pdf-table th { background: #edf5f7; color: #0d5c73; font-weight: 800; text-align: left; padding: 6px 8px; border: 1px solid #d4e4e9; }
        .pdf-table td { padding: 6px 8px; border: 1px solid #e1ecf0; vertical-align: top; color: #263e48; }
        .pdf-table tr:nth-child(even) td { background: #fbfdfe; }
        .pdf-stage-pill { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 800; }
        .pdf-stage-pill.completed { background: #d4edda; color: #155724; }
        .pdf-stage-pill.in-progress { background: #cce5ff; color: #004085; }
        .pdf-stage-pill.pending { background: #e2e3e5; color: #383d41; }
        .pdf-table-photo-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #c2dbe4; }
        .pdf-signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 18px; page-break-inside: avoid; }
        .pdf-signature-box { border: 1px solid #d5e5eb; border-radius: 5px; padding: 10px 12px; background: #fafcfe; text-align: center; }
        .pdf-sig-title { font-size: 9.5px; font-weight: 700; color: #557280; margin-bottom: 40px; }
        .pdf-sig-name { font-size: 11px; font-weight: 800; color: #061f29; border-top: 1px solid #061f29; display: inline-block; padding-top: 3px; min-width: 150px; }
        .pdf-sig-role { font-size: 9px; color: #6a8592; margin-top: 2px; }
        .pdf-footer-note { margin-top: 14px; padding-top: 8px; border-top: 1px dashed #d5e5eb; font-size: 8.5px; color: #7b94a0; text-align: center; }
      </style>
    </head>
    <body>
      ${reportHtml}
    </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      window.print();
    }
  }, 400);
};

// =========================================================
// SOCIAL PROOF TOAST NOTIFICATION: SURVEY REQUESTS
// Periodically displays a small, non-intrusive toast in the
// corner showing real-time survey requests across service areas
// to boost user trust and social proof.
// =========================================================

(function initSurveyProofToast() {
  const surveyRequests = [
    {
      location: "Galuh Mas, Karawang",
      timeAgo: "2 menit yang lalu",
      project: "Kusen & Jendela Casement Aluminium",
      icon: "📐",
      initial: "Bpk. R"
    },
    {
      location: "Kawasan Industri KIIC, Karawang",
      timeAgo: "5 menit yang lalu",
      project: "Partisi Kaca Cleanroom 10mm",
      icon: "🏢",
      initial: "PT. M"
    },
    {
      location: "Subang Smartpolitan, Subang",
      timeAgo: "9 menit yang lalu",
      project: "Pintu Kaca Sliding Otomatis",
      icon: "🚪",
      initial: "Bpk. H"
    },
    {
      location: "Kota Bukit Indah (BIC), Purwakarta",
      timeAgo: "14 menit yang lalu",
      project: "Fasad Aluminium Composite Panel (ACP)",
      icon: "🏗️",
      initial: "Ibu D"
    },
    {
      location: "Grand Taruma, Karawang Barat",
      timeAgo: "18 menit yang lalu",
      project: "Kanopi Kaca Tempered Carport",
      icon: "🛡️",
      initial: "Bpk. A"
    },
    {
      location: "Kawasan Industri Indotaisei, Cikampek",
      timeAgo: "24 menit yang lalu",
      project: "Partisi Kaca Kantor Modular",
      icon: "🏢",
      initial: "PT. T"
    },
    {
      location: "Jababeka Industrial Estate, Cikarang",
      timeAgo: "31 menit yang lalu",
      project: "Pintu Kaca Tempered Patch Fitting",
      icon: "✨",
      initial: "Bpk. F"
    },
    {
      location: "Resinda Estate, Karawang",
      timeAgo: "37 menit yang lalu",
      project: "Folding Door & Jendela Akustik",
      icon: "🏠",
      initial: "Ibu S"
    },
    {
      location: "MM2100 Industrial Town, Cikarang",
      timeAgo: "45 menit yang lalu",
      project: "Partisi Rangka Aluminium Alexindo SNI",
      icon: "⚙️",
      initial: "Bpk. W"
    },
    {
      location: "Sadang & Campaka, Purwakarta",
      timeAgo: "52 menit yang lalu",
      project: "Shower Screen Kaca Tempered Kamar Mandi",
      icon: "🚿",
      initial: "Ibu N"
    }
  ];

  let toastContainer = null;
  let toastElement = null;
  let currentIndex = 0;
  let toastTimeout = null;
  let nextCycleTimeout = null;
  let isPaused = false;
  let isDismissedPermanently = false;

  // Shuffle survey requests on session start for organic feel
  for (let i = surveyRequests.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [surveyRequests[i], surveyRequests[j]] = [surveyRequests[j], surveyRequests[i]];
  }

  function createToastContainer() {
    if (document.getElementById('surveyToastContainer')) {
      return document.getElementById('surveyToastContainer');
    }
    const container = document.createElement('div');
    container.id = 'surveyToastContainer';
    container.className = 'survey-toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  }

  function hideToast() {
    if (!toastElement) return;
    toastElement.classList.remove('toast-visible');
    toastElement.classList.add('toast-exiting');

    setTimeout(() => {
      if (toastElement && toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
        toastElement = null;
      }
    }, 400);
  }

  function showNextToast() {
    if (isDismissedPermanently) return;
    if (document.hidden) {
      // Pause if tab is inactive, retry in 10s
      nextCycleTimeout = setTimeout(showNextToast, 10000);
      return;
    }

    if (!toastContainer) {
      toastContainer = createToastContainer();
    }

    // Remove any lingering toast
    if (toastElement && toastElement.parentNode) {
      toastElement.parentNode.removeChild(toastElement);
      toastElement = null;
    }

    const item = surveyRequests[currentIndex];
    currentIndex = (currentIndex + 1) % surveyRequests.length;

    const toast = document.createElement('div');
    toast.className = 'survey-toast';
    toast.setAttribute('role', 'alert');
    toast.title = 'Klik untuk konsultasi dan jadwalkan survey lokasi gratis via WhatsApp';

    const waText = encodeURIComponent(`Halo Sahabat Kaca Aluminium, saya melihat notifikasi survey di ${item.location} untuk pekerjaan ${item.project}. Saya ingin konsultasi & jadwalkan survey lokasi gratis juga.`);
    const waUrl = `https://wa.me/6289637371166?text=${waText}`;

    toast.innerHTML = `
      <div class="survey-toast-avatar-box">
        <div class="survey-toast-avatar">${item.icon}</div>
        <span class="survey-toast-pulse-dot" title="Survey Terjadwal"></span>
      </div>
      <div class="survey-toast-body">
        <div class="survey-toast-badge">
          <span>✓</span>
          <span>Survey Gratis Terjadwal</span>
        </div>
        <p class="survey-toast-message">
          Someone in <strong>${item.location}</strong> just requested a free survey!
        </p>
        <div class="survey-toast-meta">
          <span class="survey-toast-time">
            <span>⏱️</span>
            <span>${item.timeAgo}</span>
          </span>
          <a href="${waUrl}" target="_blank" rel="noopener" class="survey-toast-action-link" onclick="event.stopPropagation();">
            Ajukan Survey ↗
          </a>
        </div>
      </div>
      <button type="button" class="survey-toast-close" aria-label="Tutup notifikasi" title="Tutup">✕</button>
      <div class="survey-toast-progress" id="surveyToastProgress"></div>
    `;

    // Click handler: opens WhatsApp inquiry or scrolls to booking
    toast.addEventListener('click', (e) => {
      if (e.target.closest('.survey-toast-close')) return;
      window.open(waUrl, '_blank', 'noopener');
    });

    // Close button handler
    const closeBtn = toast.querySelector('.survey-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideToast();
        // Give longer respite if user explicitly closed it
        clearTimeout(nextCycleTimeout);
        nextCycleTimeout = setTimeout(showNextToast, 35000);
      });
    }

    // Hover pause: freeze auto-hide while reading
    toast.addEventListener('mouseenter', () => {
      isPaused = true;
      const progress = toast.querySelector('#surveyToastProgress');
      if (progress) progress.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
      isPaused = false;
      const progress = toast.querySelector('#surveyToastProgress');
      if (progress) progress.style.animationPlayState = 'running';
    });

    toastContainer.appendChild(toast);
    toastElement = toast;

    // Trigger entrance animation next frame
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    // Progress bar animation for display duration (6.5s)
    const DISPLAY_DURATION = 6500;
    const progressEl = toast.querySelector('#surveyToastProgress');
    if (progressEl) {
      progressEl.style.transition = `transform ${DISPLAY_DURATION}ms linear`;
      progressEl.style.transform = 'scaleX(1)';
      requestAnimationFrame(() => {
        progressEl.style.transform = 'scaleX(0)';
      });
    }

    // Auto hide after DISPLAY_DURATION
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      if (!isPaused) {
        hideToast();
      } else {
        // If hovered, recheck every 1s
        const checkInterval = setInterval(() => {
          if (!isPaused) {
            clearInterval(checkInterval);
            hideToast();
          }
        }, 1000);
      }
    }, DISPLAY_DURATION);

    // Schedule next toast periodically (every 18 to 28 seconds randomly)
    const randomInterval = Math.floor(Math.random() * (28000 - 18000 + 1)) + 18000;
    clearTimeout(nextCycleTimeout);
    nextCycleTimeout = setTimeout(showNextToast, DISPLAY_DURATION + randomInterval);
  }

  // Initial delay of 4.5 seconds after page load before first appearance
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(showNextToast, 4500);
    });
  } else {
    setTimeout(showNextToast, 4500);
  }

  // Pause when window/tab is hidden to save resources
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hideToast();
      clearTimeout(nextCycleTimeout);
    } else {
      clearTimeout(nextCycleTimeout);
      nextCycleTimeout = setTimeout(showNextToast, 5000);
    }
  });

  // Expose test method if needed for manual verification
  window.triggerSurveyToastTest = function(customLocation) {
    if (customLocation) {
      surveyRequests.unshift({
        location: customLocation,
        timeAgo: "baru saja",
        project: "Survey Lapangan & Pengukuran",
        icon: "📐",
        initial: "Klien"
      });
      currentIndex = 0;
    }
    showNextToast();
  };
})();

// =========================================================
// FULL-SCREEN PROJECT PHOTO GALLERY VIEWER
// Supports full-screen view, responsive navigation, zoom,
// keyboard shortcuts, and fluid mobile swipe gestures.
// =========================================================

(function initFullscreenGalleryViewer() {
  const defaultGalleryPhotos = [
    {
      src: "assets/gallery/partisi-aluminium.jpg",
      title: "Partisi Kaca Aluminium Ruang Rapat & Kantor",
      category: "Partisi Kantor • Industri",
      location: "KIIC Karawang Barat",
      desc: "Instalasi sekat kaca polos 8mm dengan kusen aluminium Alexindo 4 inch black doff kedap suara untuk fasilitas pabrik di kawasan KIIC."
    },
    {
      src: "assets/gallery/pintu-kaca.jpg",
      title: "Pintu Kaca Tempered Frameless Floor Hinge",
      category: "Kaca Tempered • Komersial",
      location: "Ruko Galuh Mas Karawang",
      desc: "Pintu kaca tempered 12mm menggunakan patch fitting Dekson stainless steel 304 dan floor hinge tahan beban intensif untuk toko retail dan ruko."
    },
    {
      src: "assets/gallery/pintu-sliding.jpg",
      title: "Pintu Sliding Aluminium Kaca Akses Taman",
      category: "Pintu Geser • Hunian",
      location: "Grand Taruma Karawang",
      desc: "Pintu geser aluminium 3 daun dengan rel triple track hemat ruang, menghubungkan ruang keluarga dengan taman belakang rumah minimalis."
    },
    {
      src: "assets/gallery/pintu-aluminium.jpg",
      title: "Pintu Aluminium Swing Modern Warna Hitam Doff",
      category: "Pintu Aluminium • Modern",
      location: "Cikarang Baru / Jababeka",
      desc: "Pintu swing kokoh aluminium Inkalum warna black doff anti karat dan anti rayap dengan aksesoris kunci lever handle silinder keamanan tinggi."
    },
    {
      src: "assets/gallery/jendela-aluminium.jpg",
      title: "Jendela Aluminium Jungkit (Casement) Presisi",
      category: "Jendela • Kedap Suara",
      location: "Telukjambe Timur Karawang",
      desc: "Sistem jendela casement kedap suara dan anti tampias air hujan dengan engsel friction stay stainless steel dan kaca rayban peredam panas."
    },
    {
      src: "assets/gallery/shower-kaca.jpg",
      title: "Shower Screen Kaca Frameless Kamar Mandi",
      category: "Kamar Mandi • Kaca Tempered",
      location: "Grand Wisata Bekasi",
      desc: "Penyekat kaca tempered 10mm transparan pemisah area basah dan kering dengan glass clip stainless steel 304 anti karat untuk kamar mandi mewah."
    },
    {
      src: "assets/gallery/pintu-kamar-mandi.jpg",
      title: "Pintu Kaca Kamar Mandi Motif Sandblast",
      category: "Kamar Mandi • Sandblast",
      location: "Klari Karawang Timur",
      desc: "Pintu kamar mandi kaca tempered dengan aksen buram sandblast untuk privasi maksimal serta kusen aluminium anti lapuk terkena cipratan air harian."
    },
    {
      src: "assets/gallery/pintu-kaca-putih.jpg",
      title: "Pintu Kaca Aluminium Frame Putih Powder Coating",
      category: "Pintu Aluminium • Scandinavian",
      location: "Harapan Indah Bekasi",
      desc: "Pintu kaca minimalis bergaya Scandinavian dengan cat oven powder coating putih bersih dan kaca jernih untuk akses balkon dan area indoor."
    },
    {
      src: "assets/gallery/jendela-kaca.jpg",
      title: "Jendela Kaca Aluminium Fasad & Skylight",
      category: "Jendela & Fasad • Industri",
      location: "Suryacipta City of Industry",
      desc: "Pemasangan bidang kaca fasad dengan profil aluminium Dacon/Alexindo tebal untuk pencahayaan alami optimal pada lobi kantor dan gudang logistik."
    }
  ];

  let currentGalleryList = [...defaultGalleryPhotos];
  let currentIndex = 0;
  let viewerEl = null;
  let mainImgEl = null;
  let imgContainerEl = null;
  let loaderEl = null;
  let locBadgeEl = null;
  let catBadgeEl = null;
  let currIdxEl = null;
  let totalCountEl = null;
  let titleEl = null;
  let descEl = null;
  let waBtnEl = null;
  let filmstripEl = null;
  let gestureHintEl = null;
  let fullscreenBtnEl = null;

  // Zoom & Transform state
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  let isMousePanning = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  // Touch & Swipe state
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoveX = 0;
  let touchMoveY = 0;
  let touchStartTime = 0;
  let isSwiping = false;
  let isPinching = false;
  let initialPinchDist = 0;
  let lastTapTime = 0;
  let hasShownHint = false;

  function buildViewerDOM() {
    if (document.getElementById('fullscreenGalleryViewer')) {
      return document.getElementById('fullscreenGalleryViewer');
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'fullscreenGalleryViewer';
    wrapper.className = 'fs-gallery-viewer';
    wrapper.setAttribute('role', 'dialog');
    wrapper.setAttribute('aria-modal', 'true');
    wrapper.setAttribute('aria-label', 'Penampil Foto Portofolio Layar Penuh');

    wrapper.innerHTML = `
      <!-- Top Bar Toolbar -->
      <header class="fs-gallery-topbar">
        <div class="fs-topbar-meta">
          <div class="fs-badge-group">
            <span class="fs-location-badge" id="fsLocationBadge">KIIC Karawang</span>
            <span class="fs-category-badge" id="fsCategoryBadge">Partisi Kantor</span>
          </div>
          <span class="fs-counter-pill">
            <span id="fsCurrentIndex">1</span> / <span id="fsTotalCount">9</span>
          </span>
        </div>

        <div class="fs-topbar-controls">
          <button type="button" class="fs-ctrl-btn" id="fsZoomOutBtn" title="Perkecil (-)" aria-label="Perkecil">
            <span>−</span>
          </button>
          <button type="button" class="fs-ctrl-btn" id="fsZoomResetBtn" title="Reset Ukuran (0)" aria-label="Reset Ukuran">
            <span style="font-size: 11px; font-weight: 800;">1:1</span>
          </button>
          <button type="button" class="fs-ctrl-btn" id="fsZoomInBtn" title="Perbesar (+)" aria-label="Perbesar">
            <span>+</span>
          </button>
          <button type="button" class="fs-ctrl-btn" id="fsFullscreenToggleBtn" title="Layar Penuh (F)" aria-label="Beralih Layar Penuh">
            <span id="fsFsIcon">⛶</span>
          </button>
          <button type="button" class="fs-ctrl-btn fs-close-btn" id="fsCloseBtn" title="Tutup Viewer (Esc)" aria-label="Tutup">
            <span>✕</span>
          </button>
        </div>
      </header>

      <!-- Main Stage -->
      <div class="fs-stage">
        <button type="button" class="fs-nav-btn fs-nav-prev" id="fsNavPrev" aria-label="Foto Sebelumnya" title="Foto Sebelumnya (Panah Kiri)">
          ‹
        </button>

        <div class="fs-viewport" id="fsViewport">
          <div class="fs-gesture-hint" id="fsGestureHint" style="display: none;">
            <span>👈 Geser untuk ganti foto • Tarik ke bawah untuk menutup 👉</span>
          </div>
          <div class="fs-loader" id="fsLoader"></div>
          <div class="fs-image-container" id="fsImageContainer">
            <img src="" alt="Proyek Kaca Aluminium" class="fs-main-image" id="fsMainImage" draggable="false">
          </div>
        </div>

        <button type="button" class="fs-nav-btn fs-nav-next" id="fsNavNext" aria-label="Foto Selanjutnya" title="Foto Selanjutnya (Panah Kanan)">
          ›
        </button>
      </div>

      <!-- Bottom Bar Info & Filmstrip -->
      <footer class="fs-gallery-bottombar">
        <div class="fs-info-row">
          <div class="fs-info-main">
            <h3 class="fs-image-title" id="fsImageTitle">Judul Proyek</h3>
            <p class="fs-image-desc" id="fsImageDesc">Deskripsi teknis spesifikasi pekerjaan.</p>
          </div>
          <div class="fs-info-actions">
            <a href="#" target="_blank" rel="noopener" class="fs-wa-consult-btn" id="fsWaConsultBtn">
              <span>💬</span>
              <span>Konsultasi Proyek Ini</span>
            </a>
          </div>
        </div>

        <!-- Thumbnails Strip -->
        <div class="fs-filmstrip-wrap">
          <div class="fs-filmstrip" id="fsFilmstrip"></div>
        </div>
      </footer>
    `;

    document.body.appendChild(wrapper);

    // Cache elements
    viewerEl = wrapper;
    mainImgEl = wrapper.querySelector('#fsMainImage');
    imgContainerEl = wrapper.querySelector('#fsImageContainer');
    loaderEl = wrapper.querySelector('#fsLoader');
    locBadgeEl = wrapper.querySelector('#fsLocationBadge');
    catBadgeEl = wrapper.querySelector('#fsCategoryBadge');
    currIdxEl = wrapper.querySelector('#fsCurrentIndex');
    totalCountEl = wrapper.querySelector('#fsTotalCount');
    titleEl = wrapper.querySelector('#fsImageTitle');
    descEl = wrapper.querySelector('#fsImageDesc');
    waBtnEl = wrapper.querySelector('#fsWaConsultBtn');
    filmstripEl = wrapper.querySelector('#fsFilmstrip');
    gestureHintEl = wrapper.querySelector('#fsGestureHint');
    fullscreenBtnEl = wrapper.querySelector('#fsFullscreenToggleBtn');

    bindViewerEvents();
    return wrapper;
  }

  function renderFilmstrip() {
    if (!filmstripEl) return;
    filmstripEl.innerHTML = currentGalleryList.map((item, idx) => `
      <button type="button" class="fs-thumb-item ${idx === currentIndex ? 'is-active' : ''}" data-idx="${idx}" aria-label="Lihat foto ${idx + 1}: ${item.title}" title="${item.title}">
        <img src="${item.src}" alt="${item.title}" loading="lazy">
      </button>
    `).join('');

    const thumbs = filmstripEl.querySelectorAll('.fs-thumb-item');
    thumbs.forEach(t => {
      t.addEventListener('click', () => {
        const idx = parseInt(t.dataset.idx, 10);
        if (!isNaN(idx)) goToPhoto(idx);
      });
    });
  }

  function updateActiveThumbnail() {
    if (!filmstripEl) return;
    const thumbs = filmstripEl.querySelectorAll('.fs-thumb-item');
    thumbs.forEach((t, i) => {
      if (i === currentIndex) {
        t.classList.add('is-active');
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        t.classList.remove('is-active');
      }
    });
  }

  function resetZoom() {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
    if (imgContainerEl) {
      imgContainerEl.classList.remove('is-zoomed');
    }
    const viewport = document.getElementById('fsViewport');
    if (viewport) viewport.classList.remove('is-zoomed');
  }

  function zoom(delta, clientX, clientY) {
    const oldZoom = currentZoom;
    currentZoom = Math.min(3.5, Math.max(1, currentZoom + delta));

    if (currentZoom === 1) {
      resetZoom();
      return;
    }

    const viewport = document.getElementById('fsViewport');
    if (viewport) viewport.classList.add('is-zoomed');

    // Pan towards zoom focal point if provided
    if (clientX !== undefined && clientY !== undefined && mainImgEl) {
      const rect = mainImgEl.getBoundingClientRect();
      const offsetX = clientX - (rect.left + rect.width / 2);
      const offsetY = clientY - (rect.top + rect.height / 2);
      panX -= offsetX * (currentZoom - oldZoom) * 0.4;
      panY -= offsetY * (currentZoom - oldZoom) * 0.4;
    }

    applyTransform();
  }

  function applyTransform(extraTranslateX = 0, extraTranslateY = 0, rotationDeg = 0) {
    if (!mainImgEl) return;
    const finalX = panX + extraTranslateX;
    const finalY = panY + extraTranslateY;
    
    if (currentZoom === 1 && (extraTranslateX !== 0 || extraTranslateY !== 0 || rotationDeg !== 0)) {
      const scaleFactor = Math.max(0.7, 1 - Math.abs(extraTranslateX) / 2500 - Math.abs(extraTranslateY) / 1500);
      mainImgEl.style.transform = `translate(${finalX}px, ${finalY}px) scale(${scaleFactor}) rotate(${rotationDeg}deg)`;
    } else {
      mainImgEl.style.transform = `translate(${finalX}px, ${finalY}px) scale(${currentZoom})`;
    }
  }

  function displayPhoto(index, direction = 0) {
    if (!viewerEl) buildViewerDOM();
    if (index < 0) index = currentGalleryList.length - 1;
    if (index >= currentGalleryList.length) index = 0;
    currentIndex = index;

    const item = currentGalleryList[currentIndex];
    if (!item) return;

    resetZoom();

    // Fade transition
    if (direction !== 0 && mainImgEl) {
      mainImgEl.style.transition = 'transform 0.22s ease, opacity 0.2s ease';
      mainImgEl.style.opacity = '0';
      mainImgEl.style.transform = `translate(${direction * -40}px, 0) scale(0.95)`;
    }

    if (loaderEl) loaderEl.style.display = 'block';

    const tempImg = new Image();
    tempImg.onload = () => {
      if (loaderEl) loaderEl.style.display = 'none';
      if (mainImgEl) {
        mainImgEl.src = item.src;
        mainImgEl.alt = item.title;
        mainImgEl.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
        mainImgEl.style.opacity = '1';
        mainImgEl.style.transform = 'translate(0, 0) scale(1)';
      }
    };
    tempImg.onerror = () => {
      if (loaderEl) loaderEl.style.display = 'none';
      if (mainImgEl) {
        mainImgEl.src = 'assets/logo.png';
        mainImgEl.style.opacity = '1';
      }
    };
    tempImg.src = item.src;

    // Update metadata texts
    if (locBadgeEl) locBadgeEl.textContent = item.location || 'Karawang & Sekitarnya';
    if (catBadgeEl) catBadgeEl.textContent = item.category || 'Portofolio';
    if (currIdxEl) currIdxEl.textContent = currentIndex + 1;
    if (totalCountEl) totalCountEl.textContent = currentGalleryList.length;
    if (titleEl) titleEl.textContent = item.title || 'Proyek Kaca Aluminium';
    if (descEl) descEl.textContent = item.desc || '';

    // Update WhatsApp Consultation link
    if (waBtnEl) {
      const waMsg = encodeURIComponent(`Halo Sahabat Kaca Aluminium, saya melihat foto portofolio "${item.title}" (${item.location}). Saya tertarik konsultasi spesifikasi bahan dan estimasi biaya untuk proyek serupa.`);
      waBtnEl.href = `https://wa.me/6289637371166?text=${waMsg}`;
    }

    updateActiveThumbnail();

    // Show mobile swipe hint briefly on first open
    if (!hasShownHint && gestureHintEl && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      gestureHintEl.style.display = 'flex';
      setTimeout(() => {
        gestureHintEl.style.opacity = '0';
        setTimeout(() => { gestureHintEl.style.display = 'none'; }, 600);
      }, 3500);
      hasShownHint = true;
    }
  }

  function nextPhoto() {
    displayPhoto(currentIndex + 1, 1);
  }

  function prevPhoto() {
    displayPhoto(currentIndex - 1, -1);
  }

  function goToPhoto(index) {
    const dir = index > currentIndex ? 1 : -1;
    displayPhoto(index, dir);
  }

  function openGalleryViewer(startIndex = 0, customList = null) {
    buildViewerDOM();

    // Check if on galeri.html and sync with current category filter if available
    const activeFilterBtn = document.querySelector('.portfolio-filter button.active');
    const cards = Array.from(document.querySelectorAll('.portfolio-card-wrap'));

    if (customList && Array.isArray(customList) && customList.length > 0) {
      currentGalleryList = customList;
    } else if (cards.length > 0) {
      // Build list from actual DOM cards on page
      const visibleCards = cards.filter(c => c.style.display !== 'none');
      const targetCards = visibleCards.length > 0 ? visibleCards : cards;

      currentGalleryList = targetCards.map(c => {
        const img = c.querySelector('.portfolio-img-box img');
        const loc = c.querySelector('.portfolio-loc-tag');
        const cat = c.querySelector('.portfolio-card-cat');
        const t = c.querySelector('.portfolio-card-title');
        const d = c.querySelector('.portfolio-card-desc');
        return {
          src: img ? img.getAttribute('src') : '',
          title: t ? t.textContent.trim() : 'Proyek Kaca Aluminium',
          category: cat ? cat.textContent.trim() : 'Portofolio',
          location: loc ? loc.textContent.trim() : 'Karawang',
          desc: d ? d.textContent.trim() : ''
        };
      });
    } else {
      currentGalleryList = [...defaultGalleryPhotos];
    }

    renderFilmstrip();

    if (startIndex < 0 || startIndex >= currentGalleryList.length) {
      startIndex = 0;
    }

    viewerEl.style.display = 'flex';
    requestAnimationFrame(() => {
      viewerEl.classList.add('is-open');
    });

    document.body.style.overflow = 'hidden';
    displayPhoto(startIndex);
  }

  function closeGalleryViewer() {
    if (!viewerEl) return;
    viewerEl.classList.remove('is-open');

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (e) {}
    }

    setTimeout(() => {
      viewerEl.style.display = 'none';
      document.body.style.overflow = '';
      resetZoom();
    }, 250);
  }

  function toggleBrowserFullscreen() {
    if (!viewerEl) return;
    if (!document.fullscreenElement) {
      if (viewerEl.requestFullscreen) {
        viewerEl.requestFullscreen().catch(() => {});
      } else if (viewerEl.webkitRequestFullscreen) {
        viewerEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function updateFullscreenIcon() {
    const icon = document.getElementById('fsFsIcon');
    if (icon) {
      icon.textContent = document.fullscreenElement ? '🗗' : '⛶';
    }
  }

  function bindViewerEvents() {
    if (!viewerEl) return;

    // Controls
    const closeBtn = viewerEl.querySelector('#fsCloseBtn');
    const navPrev = viewerEl.querySelector('#fsNavPrev');
    const navNext = viewerEl.querySelector('#fsNavNext');
    const zoomIn = viewerEl.querySelector('#fsZoomInBtn');
    const zoomOut = viewerEl.querySelector('#fsZoomOutBtn');
    const zoomReset = viewerEl.querySelector('#fsZoomResetBtn');
    const fsToggle = viewerEl.querySelector('#fsFullscreenToggleBtn');
    const viewport = viewerEl.querySelector('#fsViewport');

    if (closeBtn) closeBtn.addEventListener('click', closeGalleryViewer);
    if (navPrev) navPrev.addEventListener('click', prevPhoto);
    if (navNext) navNext.addEventListener('click', nextPhoto);
    if (zoomIn) zoomIn.addEventListener('click', () => zoom(0.4));
    if (zoomOut) zoomOut.addEventListener('click', () => zoom(-0.4));
    if (zoomReset) zoomReset.addEventListener('click', resetZoom);
    if (fsToggle) fsToggle.addEventListener('click', toggleBrowserFullscreen);

    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!viewerEl || !viewerEl.classList.contains('is-open')) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextPhoto();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPhoto();
          break;
        case 'Escape':
          e.preventDefault();
          closeGalleryViewer();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoom(0.3);
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoom(-0.3);
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleBrowserFullscreen();
          break;
      }
    });

    // =========================================================
    // TOUCH & MOBILE SWIPE GESTURE CONTROLLER
    // Real-time horizontal track dragging, pull-down to dismiss,
    // double-tap to zoom, and pinch-to-zoom support.
    // =========================================================

    if (viewport) {
      // Touch Start
      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          // Pinch Zoom Start
          isPinching = true;
          isSwiping = false;
          initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          return;
        }

        if (e.touches.length === 1) {
          const t = e.touches[0];
          touchStartX = t.clientX;
          touchStartY = t.clientY;
          touchMoveX = t.clientX;
          touchMoveY = t.clientY;
          touchStartTime = Date.now();
          isSwiping = true;
          isPinching = false;

          // Double Tap Check
          const now = Date.now();
          if (now - lastTapTime < 320) {
            e.preventDefault();
            if (currentZoom > 1) {
              resetZoom();
            } else {
              zoom(1.5, t.clientX, t.clientY);
            }
            lastTapTime = 0;
            return;
          }
          lastTapTime = now;

          if (mainImgEl) {
            mainImgEl.style.transition = 'none';
          }
        }
      }, { passive: false });

      // Touch Move
      viewport.addEventListener('touchmove', (e) => {
        if (isPinching && e.touches.length === 2) {
          e.preventDefault();
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const factor = (currentDist - initialPinchDist) * 0.008;
          initialPinchDist = currentDist;
          zoom(factor);
          return;
        }

        if (!isSwiping || e.touches.length !== 1) return;

        const t = e.touches[0];
        touchMoveX = t.clientX;
        touchMoveY = t.clientY;

        const deltaX = touchMoveX - touchStartX;
        const deltaY = touchMoveY - touchStartY;

        // If zoomed in: allow smooth 2D panning
        if (currentZoom > 1) {
          e.preventDefault();
          panX += (deltaX * 0.4);
          panY += (deltaY * 0.4);
          touchStartX = touchMoveX;
          touchStartY = touchMoveY;
          applyTransform();
          return;
        }

        // Horizontal Swipe Dragging
        if (Math.abs(deltaX) > Math.abs(deltaY) || Math.abs(deltaX) > 15) {
          e.preventDefault();
          const rotation = deltaX * 0.025;
          applyTransform(deltaX, 0, rotation);
        }
        // Downward Drag (Pull to Dismiss)
        else if (deltaY > 15 && Math.abs(deltaY) > Math.abs(deltaX)) {
          e.preventDefault();
          applyTransform(0, deltaY, 0);
          const bgOpacity = Math.max(0.3, 0.97 - deltaY / 400);
          if (viewerEl) viewerEl.style.backgroundColor = `rgba(3, 16, 22, ${bgOpacity})`;
        }
      }, { passive: false });

      // Touch End
      const onTouchEnd = (e) => {
        if (isPinching) {
          isPinching = false;
          return;
        }

        if (!isSwiping) return;
        isSwiping = false;

        const deltaX = touchMoveX - touchStartX;
        const deltaY = touchMoveY - touchStartY;
        const duration = Date.now() - touchStartTime;

        // Reset viewer background if modified during pull
        if (viewerEl) viewerEl.style.backgroundColor = '';

        if (currentZoom > 1) {
          return;
        }

        if (mainImgEl) {
          mainImgEl.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease';
        }

        // 1. Pull down to close threshold (> 80px downward)
        if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
          if (mainImgEl) {
            mainImgEl.style.transform = `translate(0, 160px) scale(0.85)`;
            mainImgEl.style.opacity = '0';
          }
          closeGalleryViewer();
          return;
        }

        // 2. Horizontal Swipe thresholds (> 45px or quick flick < 250ms with > 25px)
        const isQuickFlick = duration < 280 && Math.abs(deltaX) > 28;
        const isLongSwipe = Math.abs(deltaX) > 55;

        if ((isLongSwipe || isQuickFlick) && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            // Swiped Left -> Next Photo
            nextPhoto();
          } else {
            // Swiped Right -> Previous Photo
            prevPhoto();
          }
        } else {
          // Snap back to center
          if (mainImgEl) {
            mainImgEl.style.transform = 'translate(0, 0) scale(1)';
          }
        }
      };

      viewport.addEventListener('touchend', onTouchEnd);
      viewport.addEventListener('touchcancel', onTouchEnd);

      // Desktop Mouse Pan & Drag when zoomed
      viewport.addEventListener('mousedown', (e) => {
        if (currentZoom > 1 && e.button === 0) {
          isMousePanning = true;
          mouseStartX = e.clientX;
          mouseStartY = e.clientY;
          viewport.classList.add('is-dragging');
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (!isMousePanning || currentZoom <= 1) return;
        const dx = e.clientX - mouseStartX;
        const dy = e.clientY - mouseStartY;
        panX += dx;
        panY += dy;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        applyTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isMousePanning) {
          isMousePanning = false;
          if (viewport) viewport.classList.remove('is-dragging');
        }
      });
    }
  }

  // Auto-bind click handlers on page elements
  function bindPageTriggers() {
    // 1. galeri.html cards (.portfolio-card-wrap)
    const portfolioCards = document.querySelectorAll('.portfolio-card-wrap');
    portfolioCards.forEach((card, idx) => {
      const imgBox = card.querySelector('.portfolio-img-box');
      if (imgBox) {
        imgBox.addEventListener('click', (e) => {
          e.preventDefault();
          openGalleryViewer(idx);
        });
      }
      const zoomBtn = card.querySelector('.btn-card-zoom');
      if (zoomBtn) {
        zoomBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openGalleryViewer(idx);
        };
      }
    });

    // 2. index.html featured portfolio (.featured-project-card)
    const featuredCards = document.querySelectorAll('.featured-project-card');
    featuredCards.forEach((card) => {
      const thumb = card.querySelector('.featured-project-thumb');
      if (thumb) {
        thumb.addEventListener('click', (e) => {
          e.preventDefault();
          const img = thumb.querySelector('img');
          const src = img ? img.getAttribute('src') : '';
          window.openGalleryViewerBySrc(src);
        });
      }
    });
  }

  // Global APIs
  window.openGalleryViewer = function(startIndex = 0) {
    openGalleryViewer(startIndex);
  };

  window.openGalleryViewerBySrc = function(src, customTitle) {
    if (!src) {
      openGalleryViewer(0);
      return;
    }
    const cleanSrc = src.replace(/^https?:\/\/[^\/]+/, '');
    const foundIdx = defaultGalleryPhotos.findIndex(p => p.src.includes(cleanSrc) || cleanSrc.includes(p.src));
    if (foundIdx !== -1) {
      openGalleryViewer(foundIdx);
    } else {
      // Create temporary item if src not in list
      const tempItem = {
        src: src,
        title: customTitle || 'Dokumentasi Proyek Kaca Aluminium',
        category: 'Portofolio',
        location: 'Karawang & Sekitarnya',
        desc: 'Dokumentasi hasil pengerjaan tim profesional Sahabat Kaca Aluminium.'
      };
      openGalleryViewer(0, [tempItem, ...defaultGalleryPhotos]);
    }
  };

  window.openPortfolioLightbox = function(src, title) {
    window.openGalleryViewerBySrc(src, title);
  };

  window.closeGalleryViewer = function() {
    closeGalleryViewer();
  };

  // Bind on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPageTriggers);
  } else {
    bindPageTriggers();
  }
})();

// =========================================================
// LOCATION-BASED SITE SWITCHER (SUBANG, PURWAKARTA, CIKAMPEK, CIKARANG, KARAWANG)
// Dynamically personalizes header, hero copy, benefits,
// WhatsApp CTA inquiries, and tailored local SEO metadata.
// =========================================================

(function initLocationSiteSwitcher() {
  const cityData = {
    all: {
      name: "Semua Wilayah",
      shortName: "Regional Jabar",
      brandLocation: "Subang • Purwakarta • Cikampek • Cikarang",
      eyebrow: "PORTOFOLIO 180+ PROYEK • SUBANG • PURWAKARTA • CIKAMPEK • CIKARANG • KARAWANG",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek",
      subtitle: "Subang, Purwakarta, Cikampek & Cikarang",
      description: "Rekomendasi aplikator spesialis kaca dan aluminium untuk proyek ruko komersial, gedung perkantoran, perumahan, hingga pabrik kawasan industri di Subang (Smartpolitan & Patimban), Purwakarta (Kota Bukit Indah BIC), Cikampek (Indotaisei & KIKC), Cikarang (Jababeka, EJIP, MM2100), dan Karawang. Material SNI bergaransi, sertifikasi K3, dan survey lokasi gratis.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek kaca dan aluminium.",
      benefits: [
        "Material<br>Berkualitas SNI",
        "Pengerjaan<br>Rapi & Presisi",
        "Tepat<br>Waktu & Garansi",
        "Layanan<br>Profesional K3"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM",
      photoCaptionDesc: "Hasil rapi untuk kebutuhan bangunan Anda",
      photoAlt: "Proyek partisi kaca dan aluminium Sahabat Kaca Aluminium Karawang Subang Purwakarta Cikampek Cikarang",
      surveyNotice: "Teknisi Siaga Free Survey Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Proyek Subang, Purwakarta, Cikampek, Cikarang",
      seoDesc: "Kontraktor spesialis aluminium dan partisi kaca proyek pabrik industri, kantor & ruko di Subang, Purwakarta, Cikampek, Cikarang, Karawang. Free survey & RAB!"
    },
    subang: {
      name: "Subang",
      shortName: "Kota & Kab. Subang",
      brandLocation: "Area Subang Smartpolitan & Patimban",
      eyebrow: "SPESIALIS KACA & ALUMINIUM KABUPATEN SUBANG • AREA SUBANG SMARTPOLITAN & PELABUHAN PATIMBAN",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek Subang",
      subtitle: "Spesialis Subang Smartpolitan, Pelabuhan Patimban, Kalijati & Subang Kota",
      description: "Layanan kontraktor aplikator kaca dan aluminium terpercaya di Subang. Melayani proyek partisi kantor, sekat pabrik industri, pintu sliding, jendela casement kedap debu, kusen aluminium Alexindo SNI, dan fasad ACP untuk kawasan industri Subang Smartpolitan, area logistik Pelabuhan Patimban, perkantoran, ruko, dan residensial di Subang Kota, Pagaden, dan Kalijati. Tim teknisi siap survey lokasi dan hitung RAB gratis ke Subang dalam 1x24 jam.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek partisi kaca dan kusen aluminium untuk wilayah Subang (Smartpolitan / Patimban / Subang Kota).",
      benefits: [
        "Survey Cepat<br>Subang 1x24 Jam",
        "Fokus Industri<br>Smartpolitan & Patimban",
        "Bebas Biaya<br>Transportasi Survey",
        "Garansi Resmi<br>Material SNI"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM SUBANG",
      photoCaptionDesc: "Partisi kantor & pabrik industri Subang Smartpolitan",
      photoAlt: "Proyek partisi kaca aluminium pabrik kawasan industri Subang Smartpolitan dan Pelabuhan Patimban",
      surveyNotice: "Tim Teknisi Siaga Survey ke Subang Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Subang | Smartpolitan & Patimban",
      seoDesc: "Aplikator partisi kaca kantor industri, pintu tempered, kanopi & kusen aluminium di Subang. Layanan cepat kawasan Smartpolitan & Patimban. Free survey & RAB!"
    },
    purwakarta: {
      name: "Purwakarta",
      shortName: "Kab. Purwakarta",
      brandLocation: "Kawasan Industri BIC & Sadang",
      eyebrow: "KONTRAKTOR KACA & ALUMINIUM PURWAKARTA • KAWASAN INDUSTRI KOTA BUKIT INDAH (BIC) & SADANG",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek Purwakarta",
      subtitle: "Aplikator Kusen SNI, Partisi Kaca & ACP Kawasan BIC Purwakarta, Sadang & Jatiluhur",
      description: "Spesialis pemasangan partisi kaca kantor industri, pintu otomatis ruko, kanopi kaca tempered carport, jendela aluminium kedap suara, dan curtain wall ACP di seluruh Kabupaten Purwakarta. Berpengalaman menangani proyek manufaktur di Kawasan Industri Kota Bukit Indah (BIC), Sadang, Campaka, dan area komersial Purwakarta dengan standar safety K3 lengkap.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek partisi kaca dan aluminium untuk wilayah Purwakarta (Kota Bukit Indah BIC / Sadang).",
      benefits: [
        "Survey Lokasi<br>Cepat ke BIC & Sadang",
        "Standar Pabrik<br>Sertifikasi Safety K3",
        "RAB Transparan<br>Tanpa Biaya Tersembunyi",
        "Garansi Resmi<br>10 Tahun Profil SNI"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM PURWAKARTA",
      photoCaptionDesc: "Instalasi partisi kaca Kawasan Industri BIC Purwakarta",
      photoAlt: "Proyek partisi kaca aluminium pabrik manufaktur Kawasan Industri Kota Bukit Indah BIC Purwakarta",
      surveyNotice: "Tim Teknisi Siaga Survey ke Purwakarta (BIC) Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Purwakarta | Kawasan Industri BIC",
      seoDesc: "Spesialis aplikator kusen aluminium, partisi kaca pabrik dan pintu tempered toko di Purwakarta dan Kota Bukit Indah (BIC). Garansi resmi, survey lokasi gratis!"
    },
    cikampek: {
      name: "Cikampek",
      shortName: "Area Cikampek",
      brandLocation: "Kawasan Industri Indotaisei & Dawuan",
      eyebrow: "KONTRAKTOR KACA & ALUMINIUM CIKAMPEK • KAWASAN INDUSTRI INDOTAISEI, KIKC & DAWUAN",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek Cikampek",
      subtitle: "Spesialis Partisi Pabrik, Kusen Aluminium & Fasad Kawasan Indotaisei, Dawuan & Kotabaru",
      description: "Penyedia solusi aplikator kaca dan aluminium terlengkap di Cikampek. Siap melayani kebutuhan partisi ruangan pabrik, sekat gudang logistik, pintu sliding double glass, pintu swing aluminium heavy-duty, dan kaca tempered untuk pabrik manufaktur di Kawasan Industri Indotaisei, KIKC, Mandala Pratama Dawuan, hingga ruko bisnis di Kotabaru Cikampek. Pengiriman material cepat dan survey gratis.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek partisi kaca / aluminium untuk wilayah Cikampek (Indotaisei / Dawuan / Kotabaru).",
      benefits: [
        "Akses Dekat<br>Kirim Cepat ke Indotaisei",
        "Workshop Siaga<br>Fabrikasi Cepat 2-4 Hari",
        "Survey On-Site<br>Gratis Wilayah Cikampek",
        "Material Terbaik<br>Alexindo, Inkalum, Dacon"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM CIKAMPEK",
      photoCaptionDesc: "Fabrikasi sekat partisi pabrik Indotaisei Cikampek",
      photoAlt: "Proyek partisi kaca aluminium industri Indotaisei Dawuan Kotabaru Cikampek",
      surveyNotice: "Tim Teknisi Siaga Survey ke Cikampek & Indotaisei Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Cikampek | Indotaisei & KIKC",
      seoDesc: "Aplikator aluminium dan partisi kaca pabrik di Cikampek, Indotaisei, KIKC, dan Dawuan. Pengerjaan rapi, material SNI, survey & RAB gratis!"
    },
    cikarang: {
      name: "Cikarang",
      shortName: "Kawasan Cikarang",
      brandLocation: "Jababeka • EJIP • MM2100 • Delta Silicon",
      eyebrow: "SPESIALIS KACA & ALUMINIUM CIKARANG • KAWASAN INDUSTRI JABABEKA, EJIP, MM2100 & DELTA SILICON",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek Cikarang",
      subtitle: "Pemasangan Partisi Kantor Industri, Pintu Tempered & Kusen Aluminium Jababeka, MM2100 & Lippo Cikarang",
      description: "Kontraktor aplikator partisi kaca dan kusen aluminium terpercaya untuk kawasan mega industri Cikarang (Jababeka I-VI, EJIP Cikarang Selatan, MM2100 Cibitung-Cikarang Barat, Delta Silicon, GIIC, serta ruko komersial Lippo Cikarang). Berpengalaman mengerjakan sekat cleanroom, partisi ruang meeting kedap suara, pintu floor hinge frameless, dan kanopi kaca tempered dengan standar industri tinggi.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi pekerjaan partisi kaca / aluminium di Cikarang (Jababeka / EJIP / MM2100 / Lippo Cikarang).",
      benefits: [
        "Fasilitas Industri<br>Cleanroom & Meeting Room",
        "K3 Compliant<br>Izin Masuk Kawasan Siap",
        "Survey Prioritas<br>Cikarang Hari Ini Siaga",
        "Garansi Resmi<br>Dukungan Purna Jual"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM CIKARANG",
      photoCaptionDesc: "Instalasi partisi kaca frameless kantor Jababeka Cikarang",
      photoAlt: "Proyek partisi kaca kantor pabrik industri Jababeka MM2100 Delta Silicon Cikarang",
      surveyNotice: "Tim Teknisi Siaga Survey ke Cikarang & Jababeka Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Cikarang | Jababeka & MM2100",
      seoDesc: "Spesialis kontraktor partisi kaca kantor, pintu tempered ruko & kusen aluminium di Cikarang: Jababeka, EJIP, MM2100, Lippo Cikarang. Free survey & estimasi RAB!"
    },
    karawang: {
      name: "Karawang",
      shortName: "Karawang Pusat",
      brandLocation: "Pusat Workshop • KIIC & Suryacipta",
      eyebrow: "PUSAT BENGKEL & KONTRAKTOR KACA ALUMINIUM KARAWANG • KIIC, SURYACIPTA & GALUH MAS",
      heading: "Kontraktor Aluminium & Partisi Kaca Proyek Karawang",
      subtitle: "Workshop Pusat & Aplikator Resmi Kusen SNI, Partisi Kaca & Kanopi Tempered di Seluruh Karawang",
      description: "Pusat fabrikasi dan jasa aplikator kusen aluminium SNI, pintu kaca tempered, jendela minimalis, shower screen, dan partisi kantor langsung dari workshop kami di Karawang. Melayani area KIIC Karawang Barat, Suryacipta Karawang Timur, KIM, ruko Galuh Mas, hunian Grand Taruma, Resinda, Telukjambe, dan Klari dengan harga bersaing langsung dari aplikator tangan pertama.",
      waMsg: "Halo Admin Sahabat Kaca Aluminium, saya ingin konsultasi proyek kaca dan aluminium untuk wilayah Karawang (KIIC / Suryacipta / Galuh Mas / Resinda).",
      benefits: [
        "Workshop Lokal<br>Aplikator Tangan Pertama",
        "Survey Cepat<br>Kunjungan Hari yang Sama",
        "Koleksi Lengkap<br>Sampel Profil & Kaca",
        "Garansi Pabrik<br>Sertifikasi SNI & K3"
      ],
      photoCaptionTitle: "PROYEK KACA & ALUMINIUM KARAWANG",
      photoCaptionDesc: "Partisi kaca sekat pabrik kawasan KIIC Karawang Barat",
      photoAlt: "Proyek partisi kaca aluminium bengkel workshop Karawang KIIC Suryacipta",
      surveyNotice: "Workshop Karawang Siap Kirim Surveyor Hari Ini",
      seoTitle: "Kontraktor Aluminium & Partisi Kaca Karawang | KIIC & Suryacipta",
      seoDesc: "Bengkel dan kontraktor spesialis partisi kaca kantor, kusen aluminium & pintu tempered di Karawang Barat, KIIC, Suryacipta, Galuh Mas. Survey lokasi & RAB gratis!"
    }
  };

  let activeCity = 'all';

  function updateMetaTag(selector, attr, val) {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      const parts = selector.replace(/[\[\]"]/g, '').split('=');
      if (parts.length === 2) {
        el.setAttribute(parts[0], parts[1]);
        document.head.appendChild(el);
      }
    }
    el.setAttribute(attr, val);
  }

  function switchServiceCity(cityKey, clickedBtn) {
    const data = cityData[cityKey] || cityData.all;
    activeCity = cityKey in cityData ? cityKey : 'all';

    // 1. Update Active Buttons in Top Bar & In-Hero Switcher
    const allChips = document.querySelectorAll('.loc-chip, .hero-loc-btn');
    allChips.forEach(chip => {
      if (chip.getAttribute('data-city') === activeCity) {
        chip.classList.add('active');
        chip.setAttribute('aria-selected', 'true');
        chip.setAttribute('aria-pressed', 'true');
      } else {
        chip.classList.remove('active');
        chip.setAttribute('aria-selected', 'false');
        chip.setAttribute('aria-pressed', 'false');
      }
    });

    // 2. Update Top Bar Indicators
    const locBarCurrentCity = document.getElementById('locBarCurrentCity');
    if (locBarCurrentCity) locBarCurrentCity.textContent = data.shortName;

    const locBarSurveyText = document.getElementById('locBarSurveyText');
    if (locBarSurveyText) locBarSurveyText.textContent = data.surveyNotice;

    // 3. Update Header Brand Location Tag & Contact Links
    const brandLocTag = document.getElementById('brandLocationTag');
    if (brandLocTag) brandLocTag.textContent = data.brandLocation;

    const headerContact = document.getElementById('headerContactBtn');
    if (headerContact) {
      const waUrl = `https://wa.me/6289637371166?text=${encodeURIComponent(data.waMsg)}`;
      headerContact.href = waUrl;
    }

    // 4. Update Hero Content with Smooth Fade
    const heroCopy = document.getElementById('heroCopyContainer');
    if (heroCopy) {
      heroCopy.classList.remove('hero-content-switching');
      void heroCopy.offsetWidth; // Trigger reflow
      heroCopy.classList.add('hero-content-switching');
    }

    const heroEyebrow = document.getElementById('heroEyebrow');
    if (heroEyebrow) {
      heroEyebrow.innerHTML = `<span></span>${data.eyebrow}`;
    }

    const heroHeading = document.getElementById('heroHeading');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroHeading && heroSubtitle) {
      heroHeading.childNodes[0].nodeValue = data.heading + " ";
      heroSubtitle.textContent = data.subtitle;
    }

    const heroDesc = document.getElementById('heroDescription');
    if (heroDesc) heroDesc.textContent = data.description;

    const heroWaBtn = document.getElementById('heroWaBtn');
    if (heroWaBtn) {
      heroWaBtn.href = `https://wa.me/6289637371166?text=${encodeURIComponent(data.waMsg)}`;
    }

    // 5. Update Hero Benefits
    if (Array.isArray(data.benefits) && data.benefits.length >= 4) {
      const b1 = document.getElementById('heroBenefit1Text');
      const b2 = document.getElementById('heroBenefit2Text');
      const b3 = document.getElementById('heroBenefit3Text');
      const b4 = document.getElementById('heroBenefit4Text');
      if (b1) b1.innerHTML = data.benefits[0];
      if (b2) b2.innerHTML = data.benefits[1];
      if (b3) b3.innerHTML = data.benefits[2];
      if (b4) b4.innerHTML = data.benefits[3];
    }

    // 6. Update Hero Photo Caption & Alt
    const photoCaptionTitle = document.getElementById('heroPhotoCaptionTitle');
    if (photoCaptionTitle) photoCaptionTitle.textContent = data.photoCaptionTitle;

    const photoCaptionDesc = document.getElementById('heroPhotoCaptionDesc');
    if (photoCaptionDesc) photoCaptionDesc.textContent = data.photoCaptionDesc;

    const heroPhotoImg = document.getElementById('heroPhotoImg');
    if (heroPhotoImg) heroPhotoImg.alt = data.photoAlt;

    // 7. Update Tailored SEO Tags
    document.title = data.seoTitle;
    updateMetaTag('meta[name="description"]', 'content', data.seoDesc);
    updateMetaTag('meta[property="og:title"]', 'content', data.seoTitle);
    updateMetaTag('meta[property="og:description"]', 'content', data.seoDesc);
    updateMetaTag('meta[name="twitter:title"]', 'content', data.seoTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', data.seoDesc);

    // 8. Sync URL Query Parameter and LocalStorage
    try {
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        if (activeCity === 'all') {
          url.searchParams.delete('kota');
          url.searchParams.delete('city');
        } else {
          url.searchParams.set('kota', activeCity);
        }
        window.history.replaceState({ city: activeCity }, '', url.toString());
      }
      localStorage.setItem('selectedServiceCity', activeCity);
    } catch (e) {
      // Local storage or URL param error suppression
    }
  }

  // Hydrate initial city from URL param (?kota=...) or LocalStorage
  function hydrateInitialCity() {
    let initialCity = 'all';
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCity = (params.get('kota') || params.get('city') || '').toLowerCase().trim();
      if (urlCity && urlCity in cityData) {
        initialCity = urlCity;
      } else {
        const hashCity = window.location.hash.replace('#', '').toLowerCase().trim();
        if (hashCity && hashCity in cityData) {
          initialCity = hashCity;
        } else {
          const storedCity = localStorage.getItem('selectedServiceCity');
          if (storedCity && storedCity in cityData) {
            initialCity = storedCity;
          }
        }
      }
    } catch (e) {}

    switchServiceCity(initialCity);
  }

  // Global APIs
  window.switchServiceCity = function(cityKey, clickedBtn) {
    switchServiceCity(cityKey, clickedBtn);
  };

  window.getServiceCity = function() {
    return activeCity;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateInitialCity);
  } else {
    hydrateInitialCity();
  }
})();

/* =========================================================
   COST CALCULATOR WIDGET CONTROLLER (ROUGH BUDGET ESTIMATE)
   ========================================================= */
(function initCostCalculatorWidget() {
  const COST_CALC_DATA = {
    kusen: {
      unit: 'm1',
      unitName: 'Meter Lari (m1)',
      label: 'Kusen Aluminium (Profil 3" / 4")',
      defaultQty: 12,
      presets: [6, 12, 20, 35, 50],
      standard: {
        min: 85000,
        max: 110000,
        spec: 'Standard SNI (Dacon / Inkalum 0.9–1.0mm)',
        desc: 'Kisaran rata-rata: Rp 85.000 – Rp 110.000 / m1 (Standard SNI)'
      },
      premium: {
        min: 135000,
        max: 165000,
        spec: 'Premium Grade (Alexindo / Alcomexindo 1.1–1.3mm)',
        desc: 'Kisaran rata-rata: Rp 135.000 – Rp 165.000 / m1 (Premium Grade)'
      }
    },
    pintu: {
      unit: 'unit',
      unitName: 'Unit Pintu',
      label: 'Pintu Aluminium (Sliding / Swing)',
      defaultQty: 2,
      presets: [1, 2, 4, 6, 8],
      standard: {
        min: 1250000,
        max: 1550000,
        spec: 'Standard SNI (Profil Dacon / Clear Glass 5mm)',
        desc: 'Kisaran rata-rata: Rp 1.250.000 – Rp 1.550.000 / unit (Standard SNI)'
      },
      premium: {
        min: 2200000,
        max: 2800000,
        spec: 'Premium Grade (Alexindo + Kaca Tempered / Moru + SUS304)',
        desc: 'Kisaran rata-rata: Rp 2.200.000 – Rp 2.800.000 / unit (Premium Grade)'
      }
    },
    jendela: {
      unit: 'unit',
      unitName: 'Unit Jendela',
      label: 'Jendela Aluminium (Casement / Sliding)',
      defaultQty: 4,
      presets: [2, 4, 6, 8, 12],
      standard: {
        min: 550000,
        max: 750000,
        spec: 'Standard SNI (Casement / Sliding Standar)',
        desc: 'Kisaran rata-rata: Rp 550.000 – Rp 750.000 / unit (Standard SNI)'
      },
      premium: {
        min: 850000,
        max: 1150000,
        spec: 'Premium Grade (Alexindo + Friction Stay SUS304 Heavy Duty)',
        desc: 'Kisaran rata-rata: Rp 850.000 – Rp 1.150.000 / unit (Premium Grade)'
      }
    },
    partisi: {
      unit: 'm²',
      unitName: 'Meter Persegi (m²)',
      label: 'Partisi Kaca Tempered Kantor / Sekat',
      defaultQty: 15,
      presets: [6, 12, 18, 25, 40],
      standard: {
        min: 850000,
        max: 1050000,
        spec: 'Standard SNI (Kaca Tempered 10mm Clear Frameless)',
        desc: 'Kisaran rata-rata: Rp 850.000 – Rp 1.050.000 / m² (Standard SNI)'
      },
      premium: {
        min: 1250000,
        max: 1550000,
        spec: 'Premium Grade (Kaca Tempered 12mm + U-Channel Tanam / Lis Anodize)',
        desc: 'Kisaran rata-rata: Rp 1.250.000 – Rp 1.550.000 / m² (Premium Grade)'
      }
    },
    pintu_tempered: {
      unit: 'unit',
      unitName: 'Unit Pintu',
      label: 'Pintu Kaca Frameless Floor Hinge',
      defaultQty: 1,
      presets: [1, 2, 3, 4, 6],
      standard: {
        min: 3200000,
        max: 3800000,
        spec: 'Standard SNI (Tempered 10mm + Floor Hinge Standar)',
        desc: 'Kisaran rata-rata: Rp 3.200.000 – Rp 3.800.000 / unit (Standard SNI)'
      },
      premium: {
        min: 4500000,
        max: 5500000,
        spec: 'Premium Grade (Tempered 12mm + Floor Hinge Dorma / Dekson SUS304)',
        desc: 'Kisaran rata-rata: Rp 4.500.000 – Rp 5.500.000 / unit (Premium Grade)'
      }
    },
    kanopi: {
      unit: 'm²',
      unitName: 'Meter Persegi (m²)',
      label: 'Kanopi Kaca Tempered Carport',
      defaultQty: 18,
      presets: [12, 18, 24, 30, 45],
      standard: {
        min: 1450000,
        max: 1750000,
        spec: 'Standard SNI (Tempered 8mm + Rangka Hollow 40x80)',
        desc: 'Kisaran rata-rata: Rp 1.450.000 – Rp 1.750.000 / m² (Standard SNI)'
      },
      premium: {
        min: 1950000,
        max: 2450000,
        spec: 'Premium Grade (Tempered 10mm / Laminated + Rangka Hollow Galvanis 50x100)',
        desc: 'Kisaran rata-rata: Rp 1.950.000 – Rp 2.450.000 / m² (Premium Grade)'
      }
    },
    shower: {
      unit: 'unit',
      unitName: 'Unit Shower Screen',
      label: 'Shower Screen Kaca Kamar Mandi',
      defaultQty: 1,
      presets: [1, 2, 3, 4, 5],
      standard: {
        min: 2100000,
        max: 2600000,
        spec: 'Standard SNI (Tempered 10mm + Fitting Chrome)',
        desc: 'Kisaran rata-rata: Rp 2.100.000 – Rp 2.600.000 / unit (Standard SNI)'
      },
      premium: {
        min: 3100000,
        max: 3800000,
        spec: 'Premium Grade (Tempered 10mm + Hardware Black Matte / Gold SUS304)',
        desc: 'Kisaran rata-rata: Rp 3.100.000 – Rp 3.800.000 / unit (Premium Grade)'
      }
    },
    bifold: {
      unit: 'daun',
      unitName: 'Daun Pintu Lipat',
      label: 'Pintu Lipat Bifold System',
      defaultQty: 4,
      presets: [3, 4, 5, 6, 8],
      standard: {
        min: 1950000,
        max: 2350000,
        spec: 'Standard SNI (Profil Bifold Standar + Rel Gantung Awet)',
        desc: 'Kisaran rata-rata: Rp 1.950.000 – Rp 2.350.000 / daun (Standard SNI)'
      },
      premium: {
        min: 2750000,
        max: 3350000,
        spec: 'Premium Grade (Heavy-Duty European Style + Kaca Tempered / Fluted Moru)',
        desc: 'Kisaran rata-rata: Rp 2.750.000 – Rp 3.350.000 / daun (Premium Grade)'
      }
    },
    etalase: {
      unit: 'm1',
      unitName: 'Meter Lari (m1)',
      label: 'Etalase Kaca Toko & Display Counter',
      defaultQty: 3,
      presets: [2, 3, 5, 8, 12],
      standard: {
        min: 650000,
        max: 850000,
        spec: 'Standard SNI (Rangka Aluminium Standar + Kaca 5mm Polos)',
        desc: 'Kisaran rata-rata: Rp 650.000 – Rp 850.000 / m1 (Standard SNI)'
      },
      premium: {
        min: 950000,
        max: 1350000,
        spec: 'Premium Grade (Aluminium Tebal Anodize + Kaca Tempered + Lampu LED & Kunci Sentral)',
        desc: 'Kisaran rata-rata: Rp 950.000 – Rp 1.350.000 / m1 (Premium Grade)'
      }
    },
    railing: {
      unit: 'm1',
      unitName: 'Meter Lari (m1)',
      label: 'Railing Tangga & Balkon Kaca Tempered',
      defaultQty: 6,
      presets: [3, 6, 10, 15, 25],
      standard: {
        min: 1100000,
        max: 1450000,
        spec: 'Standard SNI (Kaca Tempered 10mm + Tiang Hollow Stainless 201)',
        desc: 'Kisaran rata-rata: Rp 1.100.000 – Rp 1.450.000 / m1 (Standard SNI)'
      },
      premium: {
        min: 1650000,
        max: 2250000,
        spec: 'Premium Grade (Kaca Tempered 12mm Frameless / Base Shoe U-Channel + SUS304 / Handrail Kayu)',
        desc: 'Kisaran rata-rata: Rp 1.650.000 – Rp 2.250.000 / m1 (Premium Grade)'
      }
    },
    acp: {
      unit: 'm²',
      unitName: 'Meter Persegi (m²)',
      label: 'Fasad ACP (Aluminium Composite Panel)',
      defaultQty: 30,
      presets: [15, 30, 50, 80, 150],
      standard: {
        min: 600000,
        max: 750000,
        spec: 'Standard SNI (ACP Marks / Alcopan 3–4mm PE Interior/Semi-Outdoor)',
        desc: 'Kisaran rata-rata: Rp 600.000 – Rp 750.000 / m² (Standard SNI)'
      },
      premium: {
        min: 850000,
        max: 1150000,
        spec: 'Premium Grade (ACP Seven / Alustar 4mm PVDF 0.3–0.5mm Skin Tahan Cuaca Berat)',
        desc: 'Kisaran rata-rata: Rp 850.000 – Rp 1.150.000 / m² (Premium Grade)'
      }
    },
    curtain_wall: {
      unit: 'm²',
      unitName: 'Meter Persegi (m²)',
      label: 'Curtain Wall Fasad Kaca Komersial',
      defaultQty: 25,
      presets: [15, 25, 50, 100, 200],
      standard: {
        min: 1350000,
        max: 1750000,
        spec: 'Standard SNI (Mullion & Transom Standar 50x100 + Kaca Panasap 6mm / Stopsol)',
        desc: 'Kisaran rata-rata: Rp 1.350.000 – Rp 1.750.000 / m² (Standard SNI)'
      },
      premium: {
        min: 1950000,
        max: 2650000,
        spec: 'Premium Grade (Mullion Heavy Duty Alexindo/YKK 50x150 + Kaca Tempered Reflective / Double Glass)',
        desc: 'Kisaran rata-rata: Rp 1.950.000 – Rp 2.650.000 / m² (Premium Grade)'
      }
    }
  };

  const SERVICE_SPEC_DETAILS = {
    kusen: {
      title: 'Spesifikasi Konstruksi Kusen Aluminium',
      std: 'Profil 3 Inch (3 x 7 cm), tebal profil 0.9–1.0 mm SNI, spigot siku standar proyek, kaca polos/riben 5mm.',
      prem: 'Profil 4 Inch (4 x 10 cm), tebal profil 1.15–1.35 mm Alexindo heavy-duty, sambungan mitre 45° presisi laser, perkuatan ganda & seal EPDM.'
    },
    pintu: {
      title: 'Spesifikasi Daun Pintu, Kaca & Kunci',
      std: 'Rangka profil 7 cm, kaca clear 5mm SNI, engsel kupu-kupu standar, lockset lever handle aluminium.',
      prem: 'Rangka profil 8.5–9 cm ekstra kokoh, kaca tempered 8mm / fluted moru estetis, mortise lockset SUS-304 anti congkel & bearing halus.'
    },
    jendela: {
      title: 'Spesifikasi Engsel & Mekanisme Jendela',
      std: 'Casement arm standar, rambuncis aluminium, kaca bening 5mm SNI, peredam getaran standar.',
      prem: 'Friction stay SUS-304 heavy-duty (tahan angin badai), rambuncis multi-point lock kokoh, kaca tinted Panasap penolak panas.'
    },
    partisi: {
      title: 'Spesifikasi Partisi Kaca Kantor & Sekat',
      std: 'Kaca Tempered 10mm clear frameless, penjepit lis aluminium U-channel ekspos standar, sealant netral.',
      prem: 'Kaca Tempered 12mm super jernih (low-iron optional), lis recessed tanam lantai/plafon anti-getar, estetika seamless modern.'
    },
    pintu_tempered: {
      title: 'Spesifikasi Pintu Floor Hinge Tempered',
      std: 'Kaca Tempered 10mm SNI, mesin floor hinge standar kapasitas 80kg, top patch fitting standar, handle pipa stainless.',
      prem: 'Kaca Tempered 12mm, floor hinge Dorma / Dekson SUS-304 kapasitas 120kg, lock corner patch SUS-304, push bar mewah.'
    },
    kanopi: {
      title: 'Spesifikasi Struktur Rangka & Kaca Kanopi',
      std: 'Kaca Tempered 8mm clear, rangka besi hollow 40x80mm cat primer anti karat, sealant tahan bocor standar.',
      prem: 'Kaca Tempered Laminated 5+5mm (safety glass double-layer tidak runtuh jika retak), rangka galvanis 50x100mm cat epoxy oven 2 lapis.'
    },
    shower: {
      title: 'Spesifikasi Shower Box Kaca Kamar Mandi',
      std: 'Kaca Tempered 8–10mm, fitting engsel zinc-alloy chrome tahan lembap standar, handle towel bar standar.',
      prem: 'Kaca Tempered 10mm + Nano Hydrophobic anti kerak air/sabun, hardware 100% Solid Stainless SUS-304 (Pilihan Black Matte / Brushed Gold).'
    },
    bifold: {
      title: 'Spesifikasi Rel & Roda Pintu Lipat Bifold',
      std: 'Rel gantung aluminium standar, 4 roda nilon per daun, engsel lipat standar, operasional lancar hunian biasa.',
      prem: 'Heavy-duty European style top-hung bearing rel, dorongan super senyap & ringan tanpa goyang, seal karet ganda EPDM kedap suara.'
    },
    etalase: {
      title: 'Spesifikasi Rangka Display & Keamanan Toko',
      std: 'Rangka profil etalase 1.5 inch standar, kaca polos 5mm, roda nilon, kunci sliding standar.',
      prem: 'Rangka tebal heavy-duty finishing anodize / powder coating premium, kaca tempered display, lampu LED strip tersembunyi & central lock system.'
    },
    railing: {
      title: 'Spesifikasi Tiang, Kaca & Base Shoe Railing',
      std: 'Kaca Tempered 10mm, tiang hollow stainless 201 kombinasi bracket, handrail pipa stainless standar.',
      prem: 'Kaca Tempered 12mm / Laminated frameless, U-channel base shoe aluminium tanam lantai (tanpa tiang penghalang pandang) + handrail kayu jati/SUS304.'
    },
    acp: {
      title: 'Spesifikasi Lembar Panel ACP & Rangka Fasad',
      std: 'ACP tebal 3–4mm PE 0.21mm (Merk Marks/Alcopan), rangka hollow besi 20x40/40x40mm, sealant netral standar.',
      prem: 'ACP Seven / Alustar 4mm PVDF skin 0.3–0.5mm outdoor exterior grade (garansi warna 10+ tahun), rangka besi galvanis tebal + sealant Dowsil anti jamur.'
    },
    curtain_wall: {
      title: 'Spesifikasi Rangka Mullion & Kaca Fasad Gedung',
      std: 'Mullion & Transom 50x100mm, kaca Stopsol / Panasap 6mm single glass, silicone structural glazing standar.',
      prem: 'Mullion heavy duty 50x150mm Alexindo/YKK arsitektural, kaca tempered reflective 8mm / Double Glazing (IGU kedap suara & panas maksimal).'
    }
  };

  let activeQuality = 'standard';

  function formatIDRCurrency(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  }

  function updateRoughEstimate() {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    if (!serviceSelect || !qtyInput) return;

    const serviceKey = serviceSelect.value || 'kusen';
    const config = COST_CALC_DATA[serviceKey] || COST_CALC_DATA.kusen;
    const specInfo = SERVICE_SPEC_DETAILS[serviceKey] || SERVICE_SPEC_DETAILS.kusen;

    let qty = parseFloat(qtyInput.value) || 1;
    if (qty < 1) qty = 1;

    const rate = config[activeQuality] || config.standard;
    const minTotal = qty * rate.min;
    const maxTotal = qty * rate.max;

    // Update displays
    const estimateMain = document.getElementById('calcEstimateMain');
    const estimateSub = document.getElementById('calcEstimateSub');
    const summaryService = document.getElementById('calcSummaryService');
    const summaryQuality = document.getElementById('calcSummaryQuality');
    const summaryQty = document.getElementById('calcSummaryQty');
    const summaryRate = document.getElementById('calcSummaryRate');
    const qtyUnitSuffix = document.getElementById('qtyUnitSuffix');
    const qtyUnitBadge = document.getElementById('qtyUnitBadge');
    const stdQualityRate = document.getElementById('stdQualityRate');
    const premQualityRate = document.getElementById('premQualityRate');
    const stdQualityDesc = document.getElementById('stdQualityDesc');
    const premQualityDesc = document.getElementById('premQualityDesc');

    if (estimateMain) estimateMain.textContent = `${formatIDRCurrency(minTotal)} – ${formatIDRCurrency(maxTotal)}`;
    if (estimateSub) estimateSub.textContent = rate.desc;
    if (summaryService) summaryService.textContent = config.label;
    if (summaryQuality) summaryQuality.textContent = rate.spec;
    if (summaryQty) summaryQty.textContent = `${qty} ${config.unitName}`;
    if (summaryRate) summaryRate.textContent = `${formatIDRCurrency(rate.min)} – ${formatIDRCurrency(rate.max)} / ${config.unit}`;
    if (qtyUnitSuffix) qtyUnitSuffix.textContent = config.unit;
    if (qtyUnitBadge) qtyUnitBadge.textContent = `Satuan: ${config.unitName}`;

    // Update quality cards rates and descriptions for the selected service
    if (stdQualityRate) stdQualityRate.textContent = `${formatIDRCurrency(config.standard.min)} – ${formatIDRCurrency(config.standard.max)} / ${config.unit}`;
    if (premQualityRate) premQualityRate.textContent = `${formatIDRCurrency(config.premium.min)} – ${formatIDRCurrency(config.premium.max)} / ${config.unit}`;
    if (stdQualityDesc) stdQualityDesc.textContent = config.standard.spec;
    if (premQualityDesc) premQualityDesc.textContent = config.premium.spec;

    // Update comparison table elements
    const tableStdRate = document.getElementById('tableStdRate');
    const tablePremRate = document.getElementById('tablePremRate');
    const specContextBadge = document.getElementById('specContextServiceBadge');
    const specDynamicTitle = document.getElementById('specDynamicFeatureName');
    const specDynamicStd = document.getElementById('specDynamicStdVal');
    const specDynamicPrem = document.getElementById('specDynamicPremVal');

    if (tableStdRate) tableStdRate.textContent = `${formatIDRCurrency(config.standard.min)} – ${formatIDRCurrency(config.standard.max)} / ${config.unit}`;
    if (tablePremRate) tablePremRate.textContent = `${formatIDRCurrency(config.premium.min)} – ${formatIDRCurrency(config.premium.max)} / ${config.unit}`;
    if (specContextBadge) specContextBadge.textContent = config.label;
    if (specDynamicTitle) specDynamicTitle.textContent = specInfo.title;
    if (specDynamicStd) specDynamicStd.textContent = specInfo.std;
    if (specDynamicPrem) specDynamicPrem.textContent = specInfo.prem;

    // Synchronize comparison table active column classes & buttons
    const thStd = document.getElementById('thColStandard');
    const thPrem = document.getElementById('thColPremium');
    const btnPickStd = document.getElementById('btnPickStd');
    const btnPickPrem = document.getElementById('btnPickPrem');
    const stdCells = document.querySelectorAll('.col-standard');
    const premCells = document.querySelectorAll('.col-premium');

    if (activeQuality === 'standard') {
      if (thStd) thStd.classList.add('active');
      if (thPrem) thPrem.classList.remove('active');
      stdCells.forEach(el => el.classList.add('active'));
      premCells.forEach(el => el.classList.remove('active'));

      if (btnPickStd) {
        btnPickStd.innerHTML = '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>';
      }
      if (btnPickPrem) {
        btnPickPrem.innerHTML = '<span class="pick-icon">⭐</span> <span class="pick-text">Pilih Premium</span>';
      }
    } else {
      if (thPrem) thPrem.classList.add('active');
      if (thStd) thStd.classList.remove('active');
      premCells.forEach(el => el.classList.add('active'));
      stdCells.forEach(el => el.classList.remove('active'));

      if (btnPickStd) {
        btnPickStd.innerHTML = '<span class="pick-icon">🔘</span> <span class="pick-text">Pilih Standard</span>';
      }
      if (btnPickPrem) {
        btnPickPrem.innerHTML = '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>';
      }
    }

    // Store state for consultation
    window._lastRoughEstimate = {
      service: config.label,
      quality: rate.spec,
      qty: `${qty} ${config.unitName}`,
      estimateRange: `${formatIDRCurrency(minTotal)} – ${formatIDRCurrency(maxTotal)}`
    };
  }

  // Update presets when service changes
  function updatePresetsForService(serviceKey) {
    const config = COST_CALC_DATA[serviceKey];
    if (!config) return;
    const row = document.getElementById('qtyPresetRow');
    if (!row) return;

    let html = `<span style="font-size:11.5px;color:#64748b;margin-right:2px;display:inline-flex;align-items:center;">Contoh Cepat:</span>`;
    config.presets.forEach(p => {
      html += `<button type="button" class="qty-preset-chip" onclick="window.setCalcPreset(${p})">${p} ${config.unit}</button>`;
    });
    row.innerHTML = html;
  }

  // Global methods
  window.setCalcQuality = function(qualityKey) {
    activeQuality = qualityKey === 'premium' ? 'premium' : 'standard';
    const cardStd = document.getElementById('cardQualityStandard');
    const cardPrem = document.getElementById('cardQualityPremium');

    if (cardStd && cardPrem) {
      if (activeQuality === 'standard') {
        cardStd.classList.add('active');
        cardStd.setAttribute('aria-checked', 'true');
        cardPrem.classList.remove('active');
        cardPrem.setAttribute('aria-checked', 'false');
      } else {
        cardPrem.classList.add('active');
        cardPrem.setAttribute('aria-checked', 'true');
        cardStd.classList.remove('active');
        cardStd.setAttribute('aria-checked', 'false');
      }
    }
    updateRoughEstimate();
  };

  window.toggleSpecComparisonTable = function(shouldScroll) {
    const wrapper = document.getElementById('specComparisonWrapper');
    if (!wrapper) return;
    if (shouldScroll) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  window.consultEstimateViaWa = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const message = `*KONSULTASI HASIL ESTIMASI BIAYA WEB*\n` +
      `*Sahabat Kaca Aluminium Karawang*\n` +
      `────────────────────────────\n\n` +
      `Halo Admin, saya baru saja menghitung estimasi anggaran di kalkulator web:\n\n` +
      `🛠️ *Jenis Layanan:* ${data.service}\n` +
      `⭐ *Kualitas Material:* ${data.quality}\n` +
      `📏 *Kuantitas / Volume:* ${data.qty}\n` +
      `💰 *Rough Budget Estimate:* ${data.estimateRange}\n\n` +
      `Mohon info ketersediaan jadwal survey gratis ke lokasi saya untuk pengecekan dan pengukuran laser presisi. Terima kasih!`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/6289637371166?text=${encodedMsg}`;
    const localAppUrl = `whatsapp://send?phone=6289637371166&text=${encodedMsg}`;

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

  // Event bindings
  document.addEventListener('DOMContentLoaded', () => {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');

    if (serviceSelect) {
      serviceSelect.addEventListener('change', () => {
        const serviceKey = serviceSelect.value;
        const config = COST_CALC_DATA[serviceKey];
        if (config && qtyInput) {
          qtyInput.value = config.defaultQty;
          updatePresetsForService(serviceKey);
        }
        updateRoughEstimate();
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener('input', updateRoughEstimate);
      qtyInput.addEventListener('change', updateRoughEstimate);
    }

    updateRoughEstimate();
  });

  if (document.readyState !== 'loading') {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    if (serviceSelect && qtyInput) {
      serviceSelect.addEventListener('change', () => {
        const serviceKey = serviceSelect.value;
        const config = COST_CALC_DATA[serviceKey];
        if (config && qtyInput) {
          qtyInput.value = config.defaultQty;
          updatePresetsForService(serviceKey);
        }
        updateRoughEstimate();
      });
      qtyInput.addEventListener('input', updateRoughEstimate);
      qtyInput.addEventListener('change', updateRoughEstimate);
      updateRoughEstimate();
    }
  }
})();














