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
  }
});

// Initialize on page ready
initAllFaqFeedback();

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
        const cardCat = card.getAttribute('data-cat');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}







