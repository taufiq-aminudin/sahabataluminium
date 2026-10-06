window.toggleNav = function() {
  const n = document.getElementById('mainNav');
  if (n) n.classList.toggle('open');
};

window.toggleDropdown = function(e) {
  if (window.innerWidth <= 992) {
    if (e && e.preventDefault) e.preventDefault();
    const d = document.getElementById('navDropdownLayanan');
    if (d) d.classList.toggle('active-mobile');
  }
};

window.toggleNavMenu = window.toggleNav;
window.toggleMobileDropdown = window.toggleDropdown;

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#mainNav');
if (toggle && nav) {
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    window.toggleNav();
  });
}
if (nav) {
  document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        e.stopPropagation();
        const parent = btn.closest('.nav-dropdown');
        if (parent) parent.classList.toggle('active-mobile');
      }
    });
  });

  document.querySelectorAll('#mainNav a:not(.nav-dropdown-toggle)').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      const openDd = document.querySelector('.nav-dropdown.active-mobile');
      if (openDd) openDd.classList.remove('active-mobile');
    });
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
   COST CALCULATOR WIDGET CONTROLLER (CENTRALIZED PRICING CONFIG & REALISTIC RAB ENGINE)
   Basis: Aplikator / Kontraktor Retail Lokal Wilayah Karawang & Jabodetabek
   ========================================================= */

// 1. Centralized Regional Pricing Configuration Object
/* ==============================================================================
 * MASTER DATA SYNCHRONIZATION (Single Source of Truth)
 * Services: 12 | Projects: 26 (Verified: 6, Pending: 20)
 * ============================================================================== */
window.PROJECT_CATALOG = window.PROJECT_CATALOG || {
  "TOTAL_PROJECTS": 26,
  "VERIFIED_PROJECTS_COUNT": 6,
  "UNVERIFIED_PROJECTS_COUNT": 20,
  "TOTAL_SERVICES": 12,
  "TOTAL_TESTIMONIALS": 13,
  "services": [
    {
      "id": "glass-canopy",
      "calcKey": "kanopi",
      "name": "Kanopi Kaca Tempered Carport / Teras",
      "rabConfigId": "rab-canopy",
      "category": "glass_canopy",
      "priceModel": "glass_canopy",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Rangka & Kaca:",
      "guideText": "PILIH SISTEM STRUKTUR • PILIH JENIS KACA"
    },
    {
      "id": "glass-railing",
      "calcKey": "railing",
      "name": "Railing Tangga & Balkon Kaca Tempered",
      "rabConfigId": "rab-railing",
      "category": "glass_railing",
      "priceModel": "glass_railing",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "summaryLabel": "Sistem Railing:",
      "guideText": "PILIH SISTEM RAILING (U-Channel, Spigot, Handrail SS304)"
    },
    {
      "id": "aluminium-partition",
      "calcKey": "partisi",
      "name": "Partisi Kaca Kantor & Sekat Ruangan Aluminium",
      "rabConfigId": "rab-partition",
      "category": "aluminium",
      "priceModel": "aluminium_partition",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Partisi:",
      "guideText": "Standard SNI 3\" vs Premium Heavy Duty 4\""
    },
    {
      "id": "aluminium-window",
      "calcKey": "jendela",
      "name": "Jendela Aluminium (Casement / Sliding)",
      "rabConfigId": "rab-window",
      "category": "aluminium",
      "priceModel": "aluminium_window",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Jendela:",
      "guideText": "Standard SNI vs Premium Alexindo Heavy Duty"
    },
    {
      "id": "aluminium-door",
      "calcKey": "pintu",
      "name": "Pintu Aluminium (Swing / Sliding Modern)",
      "rabConfigId": "rab-door",
      "category": "aluminium",
      "priceModel": "aluminium_door",
      "unit": "unit",
      "unitName": "Unit Pintu",
      "summaryLabel": "Tipe Bukaan:",
      "guideText": "PILIH SISTEM PINTU: Swing, Sliding, atau Folding"
    },
    {
      "id": "shower-glass",
      "calcKey": "shower",
      "name": "Shower Screen Kaca Kamar Mandi",
      "rabConfigId": "rab-shower",
      "category": "glass_shower",
      "priceModel": "glass_shower",
      "unit": "unit",
      "unitName": "Set Shower Screen",
      "summaryLabel": "Sistem Shower:",
      "guideText": "PILIH SISTEM SHOWER: Framed, Semi Frameless, Full Frameless"
    },
    {
      "id": "aluminium-profile",
      "calcKey": "kusen",
      "name": "Kusen Aluminium (Profil 3\" / 4\" SNI)",
      "rabConfigId": "rab-profile",
      "category": "aluminium",
      "priceModel": "aluminium_profile",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "summaryLabel": "Grade Kusen:",
      "guideText": "Standar SNI 3\" vs Alexindo Heavy 4\""
    },
    {
      "id": "tempered-door",
      "calcKey": "pintu_tempered",
      "name": "Pintu Kaca Frameless Floor Hinge",
      "rabConfigId": "rab-tempered-door",
      "category": "glass_door",
      "priceModel": "glass_door",
      "unit": "unit",
      "unitName": "Set Daun Pintu",
      "summaryLabel": "Sistem Bukaan:",
      "guideText": "PILIH SISTEM: Single Leaf 10/12mm vs Double Leaf Kupu Tarung"
    },
    {
      "id": "aluminium-bifold",
      "calcKey": "bifold",
      "name": "Pintu Lipat Bifold System Aluminium",
      "rabConfigId": "rab-bifold",
      "category": "aluminium",
      "priceModel": "aluminium_bifold",
      "unit": "daun",
      "unitName": "Daun Pintu",
      "summaryLabel": "Grade Bifold:",
      "guideText": "Standard Inkalum vs Premium Alexindo Heavy 250kg"
    },
    {
      "id": "aluminium-showcase",
      "calcKey": "etalase",
      "name": "Etalase Kaca Toko & Display Counter",
      "rabConfigId": "rab-showcase",
      "category": "aluminium",
      "priceModel": "aluminium_showcase",
      "unit": "unit",
      "unitName": "Unit Etalase",
      "summaryLabel": "Spesifikasi Etalase:",
      "guideText": "Standard Toko 1.5m vs Premium Display Full Kaca"
    },
    {
      "id": "acp-facade",
      "calcKey": "acp",
      "name": "Fasad ACP Aluminium Composite Panel",
      "rabConfigId": "rab-acp",
      "category": "facade_acp",
      "priceModel": "acp_facade",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Panel ACP:",
      "guideText": "Tipe cat PE Interior vs PVDF Outdoor 0.3mm vs Heavy Duty 0.5mm"
    },
    {
      "id": "curtain-wall",
      "calcKey": "curtain_wall",
      "name": "Curtain Wall Fasad Kaca Komersial",
      "rabConfigId": "rab-curtain-wall",
      "category": "curtain_wall",
      "priceModel": "curtain_wall",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Sistem Fasad:",
      "guideText": "Stick System Panasap 6mm vs Reflective 8mm vs Semi-Unitized"
    }
  ],
  "projects": [
    {
      "id": "proj-01",
      "slug": "partisi-kaca-aluminium-ruang-rapat-kiic-karawang",
      "title": "Partisi Kaca Aluminium Ruang Rapat & Kantor Industri",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "KIIC Karawang Barat",
      "loc": "KIIC Karawang Barat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca aluminium ruang rapat kantor industri KIIC Karawang Barat",
      "imageIds": [
        "img-proj-01-cover"
      ],
      "description": "Pemasangan partisi kaca modular ruang meeting eksekutif pada fasilitas manufaktur kawasan industri KIIC Karawang Barat. Memberikan kekedapan suara tinggi agar rapat internal tidak bocor ke area produksi.",
      "desc": "Pemasangan partisi kaca modular ruang meeting eksekutif pada fasilitas manufaktur kawasan industri KIIC Karawang Barat. Memberikan kekedapan suara tinggi agar rapat internal tidak bocor ke area produksi.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.35mm SNI",
        "finishing": "Powder Coating Matte Black UV-Resistance",
        "kaca": "Kaca Polos Clear 8mm Asahimas Polished Edge",
        "hardware": "Dekkson Patch Fitting & Engsel Heavy-Duty",
        "sealant": "Dowsil Neutral Weatherseal Silicone + Karet EPDM Kedap Suara",
        "volume": "Luas 32 m² (Tinggi 3.2m × Panjang 10m)",
        "solusi": "Aplikasi double acoustic seal EPDM pada sambungan kusen dan dinding beton untuk meminimalisir kebisingan mesin pabrik masuk ke ruang rapat.",
        "durasi": "3 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran & Struktur"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.35mm SNI",
        "finishing": "Powder Coating Matte Black UV-Resistance",
        "kaca": "Kaca Polos Clear 8mm Asahimas Polished Edge",
        "hardware": "Dekkson Patch Fitting & Engsel Heavy-Duty",
        "sealant": "Dowsil Neutral Weatherseal Silicone + Karet EPDM Kedap Suara",
        "volume": "Luas 32 m² (Tinggi 3.2m × Panjang 10m)",
        "solusi": "Aplikasi double acoustic seal EPDM pada sambungan kusen dan dinding beton untuk meminimalisir kebisingan mesin pabrik masuk ke ruang rapat.",
        "durasi": "3 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran & Struktur"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Panduan Partisi Kaca Kantor & Pabrik Industri"
    },
    {
      "id": "proj-02",
      "slug": "pintu-kaca-tempered-frameless-ruko-galuh-mas",
      "title": "Pintu Kaca Tempered Frameless Floor Hinge Toko & Showroom",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Ruko Galuh Mas Karawang",
      "loc": "Ruko Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kaca.jpg",
      "imageAlt": "Pintu kaca tempered frameless floor hinge toko Ruko Galuh Mas Karawang",
      "imageIds": [
        "img-proj-02-cover"
      ],
      "description": "Pintu kaca tempered frameless untuk outlet komersial ruko Galuh Mas Karawang. Menghadirkan visibilitas display barang dagangan secara maksimal dari luar ruangan tanpa halangan bingkai.",
      "desc": "Pintu kaca tempered frameless untuk outlet komersial ruko Galuh Mas Karawang. Menghadirkan visibilitas display barang dagangan secara maksimal dari luar ruangan tanpa halangan bingkai.",
      "specifications": {
        "kusen": "Frameless (Tanpa Kusen) dengan Lis U Stainless Bawah",
        "finishing": "Stainless Steel SUS304 Hairline Mirror Polish",
        "kaca": "Tempered Glass 12mm Asahimas SNI Kualitas Tinggi",
        "hardware": "Floor Hinge Dekkson FH-84 Heavy-Duty 120kg, Patch Fitting PT-10/PT-20",
        "sealant": "Silicone Clear Anti Jamur & Seal Karet Bawah Penahan Air",
        "volume": "2 Daun Kupu Tarung (L 1.8m × T 2.4m)",
        "solusi": "Penanaman silinder floor hinge Dekkson FH-84 pada lantai granit dengan semen grouting anti susut agar stabil pada lalu lintas pengunjung tinggi.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Floor Hinge"
      },
      "specs": {
        "kusen": "Frameless (Tanpa Kusen) dengan Lis U Stainless Bawah",
        "finishing": "Stainless Steel SUS304 Hairline Mirror Polish",
        "kaca": "Tempered Glass 12mm Asahimas SNI Kualitas Tinggi",
        "hardware": "Floor Hinge Dekkson FH-84 Heavy-Duty 120kg, Patch Fitting PT-10/PT-20",
        "sealant": "Silicone Clear Anti Jamur & Seal Karet Bawah Penahan Air",
        "volume": "2 Daun Kupu Tarung (L 1.8m × T 2.4m)",
        "solusi": "Penanaman silinder floor hinge Dekkson FH-84 pada lantai granit dengan semen grouting anti susut agar stabil pada lalu lintas pengunjung tinggi.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Floor Hinge"
      },
      "testimonialId": "testi-01",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Tips Memilih Kaca Tempered & Safety Glass Toko"
    },
    {
      "id": "proj-03",
      "slug": "pintu-sliding-aluminium-grand-taruma",
      "title": "Pintu Sliding Aluminium Kaca Akses Taman & Ruang Keluarga",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Grand Taruma Karawang",
      "loc": "Grand Taruma Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu sliding aluminium kaca akses taman Grand Taruma Karawang",
      "imageIds": [
        "img-proj-03-cover"
      ],
      "description": "Pintu sliding kaca connecting room taman belakang pada hunian 2 lantai Grand Taruma. Memungkinkan pencahayaan alami masuk leluasa dan sirkulasi angin segar mengalir ke seluruh lantai satu.",
      "desc": "Pintu sliding kaca connecting room taman belakang pada hunian 2 lantai Grand Taruma. Memungkinkan pencahayaan alami masuk leluasa dan sirkulasi angin segar mengalir ke seluruh lantai satu.",
      "specifications": {
        "kusen": "Inkalum 3 Inch Profil Ramping Kokoh",
        "finishing": "Anodized Dark Brown 18 Micron Tahan Gores",
        "kaca": "Kaca Rayban Euro Grey 6mm Peredam Silau & Panas",
        "hardware": "Roda Sliding Double Bearing Nylon & Flush Handle Lock Dekson",
        "sealant": "Mohair Brush Seal (Bulu Peredam Debu) + Karet EPDM",
        "volume": "3 Daun Triple Track (L 2.7m × T 2.2m)",
        "solusi": "Pemasangan rel triple track dengan lubang drainase air (weep holes) tersembunyi mencegah genangan air saat hujan lebat berangin kencang.",
        "durasi": "2 Hari Kerja",
        "garansi": "12 Bulan Resmi Garansi Roda & Kusen"
      },
      "specs": {
        "kusen": "Inkalum 3 Inch Profil Ramping Kokoh",
        "finishing": "Anodized Dark Brown 18 Micron Tahan Gores",
        "kaca": "Kaca Rayban Euro Grey 6mm Peredam Silau & Panas",
        "hardware": "Roda Sliding Double Bearing Nylon & Flush Handle Lock Dekson",
        "sealant": "Mohair Brush Seal (Bulu Peredam Debu) + Karet EPDM",
        "volume": "3 Daun Triple Track (L 2.7m × T 2.2m)",
        "solusi": "Pemasangan rel triple track dengan lubang drainase air (weep holes) tersembunyi mencegah genangan air saat hujan lebat berangin kencang.",
        "durasi": "2 Hari Kerja",
        "garansi": "12 Bulan Resmi Garansi Roda & Kusen"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Inspirasi Pintu Sliding Geser Hemat Ruang"
    },
    {
      "id": "proj-04",
      "slug": "pintu-lipat-bifold-summarecon-bekasi",
      "title": "Pintu Lipat (Bifold) Aluminium 4 Daun Teras Belakang",
      "serviceId": "aluminium-bifold",
      "rabConfigId": "rab-bifold",
      "calcServiceKey": "bifold",
      "location": "Summarecon Bekasi",
      "loc": "Summarecon Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu lipat bifold aluminium 4 daun Summarecon Bekasi",
      "imageIds": [
        "img-proj-04-cover"
      ],
      "description": "Konsep indoor-outdoor living dengan folding door 4 daun bukaan 100%, sistem rel tanam rata lantai dan kaca tempered 8mm aman untuk keluarga.",
      "desc": "Konsep indoor-outdoor living dengan folding door 4 daun bukaan 100%, sistem rel tanam rata lantai dan kaca tempered 8mm aman untuk keluarga.",
      "specifications": {
        "kusen": "Alexindo Heavy Duty Bifold Profile 1.35mm",
        "finishing": "Powder Coating White Arctic Glossy",
        "kaca": "Tempered Glass 8mm SNI Safety Glazing",
        "hardware": "Heavy Duty Suspended Top Track Roller & Stainless Flush Bolt",
        "sealant": "Double Weatherstrip Karet Santoprene Kedap Suara",
        "volume": "4 Daun (Lebar Bukaan 3.6m × Tinggi 2.4m)",
        "solusi": "Penerapan bottom guide rail tanam rata lantai (flush floor threshold) sehingga tidak ada hambatan tersandung bagi lansia dan anak kecil.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Garansi Rel Gantung & Roda"
      },
      "specs": {
        "kusen": "Alexindo Heavy Duty Bifold Profile 1.35mm",
        "finishing": "Powder Coating White Arctic Glossy",
        "kaca": "Tempered Glass 8mm SNI Safety Glazing",
        "hardware": "Heavy Duty Suspended Top Track Roller & Stainless Flush Bolt",
        "sealant": "Double Weatherstrip Karet Santoprene Kedap Suara",
        "volume": "4 Daun (Lebar Bukaan 3.6m × Tinggi 2.4m)",
        "solusi": "Penerapan bottom guide rail tanam rata lantai (flush floor threshold) sehingga tidak ada hambatan tersandung bagi lansia dan anak kecil.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Garansi Rel Gantung & Roda"
      },
      "testimonialId": "testi-06",
      "articleUrl": "artikel/desain-pintu-lipat-aluminium-bifold-minimalis.html",
      "articleTitle": "Desain Pintu Lipat Bifold Aluminium Modern"
    },
    {
      "id": "proj-05",
      "slug": "sekat-partisi-dapur-moru-galuh-mas",
      "title": "Sekat Partisi Kaca Dapur Minimalis Fluted Moru Glass",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "Galuh Mas Karawang",
      "loc": "Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Sekat partisi kaca dapur moru glass Galuh Mas Karawang",
      "imageIds": [
        "img-proj-05-cover"
      ],
      "description": "Sekat pemisah dapur bersih dan ruang makan menggunakan kaca bertekstur garis Moru (fluted glass). Menghalangi percikan minyak memasak dan bau dapur namun tetap meneruskan cahaya alami estetis.",
      "desc": "Sekat pemisah dapur bersih dan ruang makan menggunakan kaca bertekstur garis Moru (fluted glass). Menghalangi percikan minyak memasak dan bau dapur namun tetap meneruskan cahaya alami estetis.",
      "specifications": {
        "kusen": "Inkalum Slimline Minimalist Black Doff 3 Inch",
        "finishing": "Powder Coating Sand Texture Black",
        "kaca": "Fluted Glass (Kaca Moru Bergaris Estetik) 8mm Tempered",
        "hardware": "Handle Tanam Minimalis & Engsel Soft-Closing SUS304",
        "sealant": "Food-Grade Sanitary Neutral Silicone Anti Jamur",
        "volume": "Luas 9.6 m² (L 3.2m × T 3.0m)",
        "solusi": "Menggunakan silikon grade sanitasi khusus dapur yang anti jamur minyak dan mudah dibersihkan dengan sabun pembersih biasa.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum Slimline Minimalist Black Doff 3 Inch",
        "finishing": "Powder Coating Sand Texture Black",
        "kaca": "Fluted Glass (Kaca Moru Bergaris Estetik) 8mm Tempered",
        "hardware": "Handle Tanam Minimalis & Engsel Soft-Closing SUS304",
        "sealant": "Food-Grade Sanitary Neutral Silicone Anti Jamur",
        "volume": "Luas 9.6 m² (L 3.2m × T 3.0m)",
        "solusi": "Menggunakan silikon grade sanitasi khusus dapur yang anti jamur minyak dan mudah dibersihkan dengan sabun pembersih biasa.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-ruangan-minimalis-estetik.html",
      "articleTitle": "Inspirasi Partisi Kaca Ruangan Minimalis Estetik"
    },
    {
      "id": "proj-06",
      "slug": "fasad-acp-seven-pintu-otomatis-jababeka",
      "title": "Fasad ACP Seven & Pintu Sensor Gerak Otomatis",
      "serviceId": "acp-facade",
      "rabConfigId": "rab-acp",
      "calcServiceKey": "acp",
      "location": "Jababeka Cikarang",
      "loc": "Jababeka Cikarang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Fasad ACP Seven dan pintu otomatis sensor Jababeka Cikarang",
      "imageIds": [
        "img-proj-06-cover"
      ],
      "description": "Transformasi fasad eksterior showroom komersial dengan penutup dinding ACP merek Seven garansi warna 10 tahun dan pintu sliding otomatis sensor microwave.",
      "desc": "Transformasi fasad eksterior showroom komersial dengan penutup dinding ACP merek Seven garansi warna 10 tahun dan pintu sliding otomatis sensor microwave.",
      "specifications": {
        "kusen": "Rangka Hollow Galvanis 40×40×1.6mm + Braket Siku Baja",
        "finishing": "Seven ACP PVDF 0.30mm Metallic Silver & Dark Grey",
        "kaca": "Kaca Tempered Panasap Dark Blue 8mm Anti Panas",
        "hardware": "Mesin Sliding Otomatis Dorma ES-200 Radar Microwave Sensor",
        "sealant": "Dowsil Non-Staining Neutral Silicone Khusus Eksterior Gedung",
        "volume": "Luas ACP 85 m² + 1 Unit Pintu Otomatis 2 Daun",
        "solusi": "Pemasangan water drip flashing aluminium di atas kusen otomatis untuk mengalirkan air hujan lebat menjauh dari sensor inframerah pintu.",
        "durasi": "7 Hari Kerja",
        "garansi": "10 Tahun Garansi Warna ACP & 24 Bulan Mesin Pintu"
      },
      "specs": {
        "kusen": "Rangka Hollow Galvanis 40×40×1.6mm + Braket Siku Baja",
        "finishing": "Seven ACP PVDF 0.30mm Metallic Silver & Dark Grey",
        "kaca": "Kaca Tempered Panasap Dark Blue 8mm Anti Panas",
        "hardware": "Mesin Sliding Otomatis Dorma ES-200 Radar Microwave Sensor",
        "sealant": "Dowsil Non-Staining Neutral Silicone Khusus Eksterior Gedung",
        "volume": "Luas ACP 85 m² + 1 Unit Pintu Otomatis 2 Daun",
        "solusi": "Pemasangan water drip flashing aluminium di atas kusen otomatis untuk mengalirkan air hujan lebat menjauh dari sensor inframerah pintu.",
        "durasi": "7 Hari Kerja",
        "garansi": "10 Tahun Garansi Warna ACP & 24 Bulan Mesin Pintu"
      },
      "testimonialId": "testi-09",
      "articleUrl": "artikel/keunggulan-kusen-aluminium-dibanding-kayu.html",
      "articleTitle": "Material Eksterior Modern Tahan Cuaca"
    },
    {
      "id": "proj-07",
      "slug": "kanopi-kaca-carport-summarecon-bekasi",
      "title": "Kanopi Kaca Tempered Laminated Carport Modern",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Summarecon Bekasi",
      "loc": "Summarecon Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Kanopi kaca tempered laminated carport Summarecon Bekasi",
      "imageIds": [
        "img-proj-07-cover"
      ],
      "description": "Atap kanopi carport mobil mewah menggunakan kaca tempered 10mm dengan struktur hollow galvanis 100×50 tebal 2mm bebas tiang tengah mengganggu manuver kendaraan.",
      "desc": "Atap kanopi carport mobil mewah menggunakan kaca tempered 10mm dengan struktur hollow galvanis 100×50 tebal 2mm bebas tiang tengah mengganggu manuver kendaraan.",
      "specifications": {
        "kusen": "Baja Hollow Galvanis 100×50×2.0mm & 50×50×1.8mm",
        "finishing": "Cat Dasar Epoxy Primer Anti Karat + Top Coat Polyurethane Hitam Doff",
        "kaca": "Tempered Glass 10mm Clear SNI Asahimas Flat Polished Edge",
        "hardware": "Dynabolt Anchor M12 Baja, Karet Bantalan EPDM & Spider Clamp SUS304",
        "sealant": "Dowsil 795 Structural Weatherseal Glazing Sealant",
        "volume": "Luas 24 m² (Panjang 6m × Lebar 4m)",
        "solusi": "Kemiringan atap 5 derajat dengan talang air pipa hollow tersembunyi mengalir langsung ke saluran drainase depan tanpa cipratan ke mobil.",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran Sealant & Struktur"
      },
      "specs": {
        "kusen": "Baja Hollow Galvanis 100×50×2.0mm & 50×50×1.8mm",
        "finishing": "Cat Dasar Epoxy Primer Anti Karat + Top Coat Polyurethane Hitam Doff",
        "kaca": "Tempered Glass 10mm Clear SNI Asahimas Flat Polished Edge",
        "hardware": "Dynabolt Anchor M12 Baja, Karet Bantalan EPDM & Spider Clamp SUS304",
        "sealant": "Dowsil 795 Structural Weatherseal Glazing Sealant",
        "volume": "Luas 24 m² (Panjang 6m × Lebar 4m)",
        "solusi": "Kemiringan atap 5 derajat dengan talang air pipa hollow tersembunyi mengalir langsung ke saluran drainase depan tanpa cipratan ke mobil.",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran Sealant & Struktur"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kanopi-kaca-tempered-carport.html",
      "articleTitle": "Tips Memilih Kanopi Kaca Tempered Carport Awet"
    },
    {
      "id": "proj-08",
      "slug": "jendela-aluminium-jungkit-casement-telukjambe",
      "title": "Jendela Aluminium Jungkit (Casement) Akustik",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Telukjambe Timur Karawang",
      "loc": "Telukjambe Timur Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/jendela-aluminium.jpg",
      "imageAlt": "Jendela aluminium jungkit casement kedap suara Telukjambe Karawang",
      "imageIds": [
        "img-proj-08-cover"
      ],
      "description": "Instalasi paket jendela casement buka samping dan jungkit awning pada hunian dekat jalan raya Telukjambe. Meredam kebisingan lalu lintas hingga 32 desibel.",
      "desc": "Instalasi paket jendela casement buka samping dan jungkit awning pada hunian dekat jalan raya Telukjambe. Meredam kebisingan lalu lintas hingga 32 desibel.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.2mm Profil Khusus Kedap",
        "finishing": "Powder Coating Ivory White High-Gloss",
        "kaca": "Kaca Laminated Akustik 5+5mm PVB 0.76mm Sound Control",
        "hardware": "Friction Stay Heavy-Duty Dekkson SUS304 14\" & Multi-Point Lock Handle",
        "sealant": "Double EPDM Gasket Seal Keliling Daun Jendela",
        "volume": "6 Daun Jendela Kamar Tidur & Ruang Kerja",
        "solusi": "Penggunaan sistem multi-point lock lever yang menekan daun jendela rapat merata ke kusen 4 penjuru saat handle dikunci ke bawah.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Aksesoris Friction Stay"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.2mm Profil Khusus Kedap",
        "finishing": "Powder Coating Ivory White High-Gloss",
        "kaca": "Kaca Laminated Akustik 5+5mm PVB 0.76mm Sound Control",
        "hardware": "Friction Stay Heavy-Duty Dekkson SUS304 14\" & Multi-Point Lock Handle",
        "sealant": "Double EPDM Gasket Seal Keliling Daun Jendela",
        "volume": "6 Daun Jendela Kamar Tidur & Ruang Kerja",
        "solusi": "Penggunaan sistem multi-point lock lever yang menekan daun jendela rapat merata ke kusen 4 penjuru saat handle dikunci ke bawah.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Aksesoris Friction Stay"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Perawatan Jendela Aluminium Casement"
    },
    {
      "id": "proj-09",
      "slug": "shower-screen-kaca-frameless-grand-wisata",
      "title": "Shower Screen Kaca Frameless Kamar Mandi",
      "serviceId": "shower-glass",
      "rabConfigId": "rab-shower",
      "calcServiceKey": "shower",
      "location": "Grand Wisata Bekasi",
      "loc": "Grand Wisata Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/shower-kaca.jpg",
      "imageAlt": "Shower screen kaca frameless tempered 10mm Grand Wisata Bekasi",
      "imageIds": [
        "img-proj-09-cover"
      ],
      "description": "Penyekat area basah dan kering kamar mandi utama model pintu swing frameless kaca tempered 10mm. Menjaga lantai luar tetap kering dan higienis.",
      "desc": "Penyekat area basah dan kering kamar mandi utama model pintu swing frameless kaca tempered 10mm. Menjaga lantai luar tetap kering dan higienis.",
      "specifications": {
        "kusen": "Frameless Glass-to-Wall Hinge System",
        "finishing": "Chrome Mirror Polish Stainless Steel SUS304",
        "kaca": "Tempered Glass 10mm Clear dengan Lapisan Nano Anti Kerak Air",
        "hardware": "Engsel Shower 90° Glass-to-Wall Dekson SUS304 & Pipa Header Stabilizer",
        "sealant": "Clear Silicone Sanitasi Khusus Anti Lumut & Jamur Hitam",
        "volume": "Set L-Shape Sekat Kaca (100cm × 100cm × Tinggi 200cm)",
        "solusi": "Dilengkapi strip magnetic door seal di bibir pintu dan lis aluminium penahan air (water barrier threshold) di lantai mencegah rembesan busa sabun.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi Garansi Engsel & Seal"
      },
      "specs": {
        "kusen": "Frameless Glass-to-Wall Hinge System",
        "finishing": "Chrome Mirror Polish Stainless Steel SUS304",
        "kaca": "Tempered Glass 10mm Clear dengan Lapisan Nano Anti Kerak Air",
        "hardware": "Engsel Shower 90° Glass-to-Wall Dekson SUS304 & Pipa Header Stabilizer",
        "sealant": "Clear Silicone Sanitasi Khusus Anti Lumut & Jamur Hitam",
        "volume": "Set L-Shape Sekat Kaca (100cm × 100cm × Tinggi 200cm)",
        "solusi": "Dilengkapi strip magnetic door seal di bibir pintu dan lis aluminium penahan air (water barrier threshold) di lantai mencegah rembesan busa sabun.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi Garansi Engsel & Seal"
      },
      "testimonialId": "testi-08",
      "articleUrl": "artikel/kaca-kamar-mandi.html",
      "articleTitle": "Panduan Sekat Kaca Kamar Mandi Mewah"
    },
    {
      "id": "proj-10",
      "slug": "pintu-kaca-kamar-mandi-sandblast-klari",
      "title": "Pintu Kaca Kamar Mandi Motif Sandblast Buram",
      "serviceId": "shower-glass",
      "rabConfigId": "rab-shower",
      "calcServiceKey": "shower",
      "location": "Klari Karawang Timur",
      "loc": "Klari Karawang Timur",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kamar-mandi.jpg",
      "imageAlt": "Pintu aluminium kamar mandi kaca sandblast buram Klari Karawang",
      "imageIds": [
        "img-proj-10-cover"
      ],
      "description": "Pintu swing kamar mandi tahan cipratan air dengan motif sandblast buram gradasi modern. Tidak akan pernah keropos, berkarat, ataupun diserang rayap.",
      "desc": "Pintu swing kamar mandi tahan cipratan air dengan motif sandblast buram gradasi modern. Tidak akan pernah keropos, berkarat, ataupun diserang rayap.",
      "specifications": {
        "kusen": "Aluminium 3 Inch Anti Karat Khusus Area Lembab",
        "finishing": "Anodized Silver Satin 15 Micron",
        "kaca": "Kaca Es Frosted Buram Sandblast Kimia 6mm SNI Asahimas",
        "hardware": "Engsel Kupu Stainless 4 Inch & Lever Lockset Anti Karat",
        "sealant": "Neutral Silicone Karet Santoprene",
        "volume": "1 Daun Pintu Kamar Mandi (L 80cm × T 200cm)",
        "solusi": "Menggunakan kaca sandblast etsa kimia yang tahan air dan tidak meninggalkan noda sidik jari jika tersentuh sabun mandi.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Aluminium 3 Inch Anti Karat Khusus Area Lembab",
        "finishing": "Anodized Silver Satin 15 Micron",
        "kaca": "Kaca Es Frosted Buram Sandblast Kimia 6mm SNI Asahimas",
        "hardware": "Engsel Kupu Stainless 4 Inch & Lever Lockset Anti Karat",
        "sealant": "Neutral Silicone Karet Santoprene",
        "volume": "1 Daun Pintu Kamar Mandi (L 80cm × T 200cm)",
        "solusi": "Menggunakan kaca sandblast etsa kimia yang tahan air dan tidak meninggalkan noda sidik jari jika tersentuh sabun mandi.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-08",
      "articleUrl": "artikel/kaca-kamar-mandi.html",
      "articleTitle": "Tips Memilih Kaca Kamar Mandi Awet & Anti Keropos"
    },
    {
      "id": "proj-11",
      "slug": "railing-tangga-balkon-kaca-tempered-grand-taruma",
      "title": "Railing Tangga & Balkon Kaca Tempered Frameless Spigot SUS304",
      "serviceId": "glass-railing",
      "rabConfigId": "rab-railing",
      "calcServiceKey": "railing",
      "location": "Grand Taruma Karawang",
      "loc": "Grand Taruma Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Railing kaca tempered 12mm spigot Grand Taruma Karawang",
      "imageIds": [
        "img-proj-11-cover"
      ],
      "description": "Instalasi railing tangga kaca pada rumah hunian 2 lantai. Memberikan efek melayang yang memukau tanpa kisi-kisi besi penghalang pandangan, sekaligus sangat aman bagi anak kecil.",
      "desc": "Instalasi railing tangga kaca pada rumah hunian 2 lantai. Memberikan efek melayang yang memukau tanpa kisi-kisi besi penghalang pandangan, sekaligus sangat aman bagi anak kecil.",
      "specifications": {
        "kusen": "Frameless Spigot System (Penjepit Kaki Lantai Bebas Tiang)",
        "finishing": "Stainless Steel SUS304 Solid Cast Satin Finish",
        "kaca": "Tempered Glass 12mm SNI Flat Polished Rounded Edges",
        "hardware": "Spigot Clamp Kotak Heavy-Duty 20cm dengan Dynabolt M12 Cor Beton",
        "sealant": "Epoxy Anchor Grout + Rubber Gasket Pad",
        "volume": "Panjang 11 Meter Lari (Balkon Lantai 2 & Void Tangga)",
        "solusi": "Pemasangan klem spigot solid SUS304 dengan bor inti (core drill) ke dalam balok struktur beton lantai, kokoh menahan beban benturan samping hingga 150 kg.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Kekuatan Struktur"
      },
      "specs": {
        "kusen": "Frameless Spigot System (Penjepit Kaki Lantai Bebas Tiang)",
        "finishing": "Stainless Steel SUS304 Solid Cast Satin Finish",
        "kaca": "Tempered Glass 12mm SNI Flat Polished Rounded Edges",
        "hardware": "Spigot Clamp Kotak Heavy-Duty 20cm dengan Dynabolt M12 Cor Beton",
        "sealant": "Epoxy Anchor Grout + Rubber Gasket Pad",
        "volume": "Panjang 11 Meter Lari (Balkon Lantai 2 & Void Tangga)",
        "solusi": "Pemasangan klem spigot solid SUS304 dengan bor inti (core drill) ke dalam balok struktur beton lantai, kokoh menahan beban benturan samping hingga 150 kg.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Kekuatan Struktur"
      },
      "testimonialId": "testi-07",
      "articleUrl": "artikel/desain-railing-balkon-tangga-kaca-frameless.html",
      "articleTitle": "Desain Railing Tangga & Balkon Kaca Frameless"
    },
    {
      "id": "proj-12",
      "slug": "partisi-cleanroom-pabrik-suryacipta",
      "title": "Partisi Kaca Cleanroom Higienis & Pintu Airtight Pabrik",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "Suryacipta Ciampel",
      "loc": "Suryacipta Ciampel",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca cleanroom pabrik Suryacipta Ciampel Karawang",
      "imageIds": [
        "img-proj-12-cover"
      ],
      "description": "Instalasi partisi kaca ruang laboratorium uji kualitas (QA/QC) dan cleanroom industri komponen otomotif kawasan Suryacipta Karawang.",
      "desc": "Instalasi partisi kaca ruang laboratorium uji kualitas (QA/QC) dan cleanroom industri komponen otomotif kawasan Suryacipta Karawang.",
      "specifications": {
        "kusen": "Aluminium Profil R-Shape Bebas Sudut Mati Debu",
        "finishing": "Powder Coating White Anti Bakteri & Kimia Ringan",
        "kaca": "Tempered Glass Clear 10mm Double Glass dengan Seal Kedap Gas",
        "hardware": "Airtight Drop Seal Otomatis Bawah Pintu & Push-Pull Handle SUS304",
        "sealant": "Cleanroom Grade Silicone Sealant Non-Offgassing",
        "volume": "Luas Partisi 48 m² + 2 Set Pintu Airtight Swing",
        "solusi": "Penerapan lis aluminium sudut melengkung cembung (curved coving) pada pertemuan lantai dan dinding partisi agar tidak ada penumpukan debu.",
        "durasi": "5 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran Udara"
      },
      "specs": {
        "kusen": "Aluminium Profil R-Shape Bebas Sudut Mati Debu",
        "finishing": "Powder Coating White Anti Bakteri & Kimia Ringan",
        "kaca": "Tempered Glass Clear 10mm Double Glass dengan Seal Kedap Gas",
        "hardware": "Airtight Drop Seal Otomatis Bawah Pintu & Push-Pull Handle SUS304",
        "sealant": "Cleanroom Grade Silicone Sealant Non-Offgassing",
        "volume": "Luas Partisi 48 m² + 2 Set Pintu Airtight Swing",
        "solusi": "Penerapan lis aluminium sudut melengkung cembung (curved coving) pada pertemuan lantai dan dinding partisi agar tidak ada penumpukan debu.",
        "durasi": "5 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran Udara"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Standar Partisi Kaca Cleanroom Pabrik Industri"
    },
    {
      "id": "proj-13",
      "slug": "jendela-sliding-aluminium-cikarang-baru",
      "title": "Jendela Sliding (Geser) Aluminium 4 Daun Ruang Tamu",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Cikarang Baru Jababeka",
      "loc": "Cikarang Baru Jababeka",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Jendela sliding geser 4 daun Cikarang Baru Jababeka",
      "imageIds": [
        "img-proj-13-cover"
      ],
      "description": "Bukaan jendela lebar 4 daun geser sentral menghadap taman depan. Ruangan menerima sirkulasi udara maksimal dengan view lanskap taman tanpa sekat masif.",
      "desc": "Bukaan jendela lebar 4 daun geser sentral menghadap taman depan. Ruangan menerima sirkulasi udara maksimal dengan view lanskap taman tanpa sekat masif.",
      "specifications": {
        "kusen": "Dacon 3 Inch Profil Ekonomis Berkualitas SNI",
        "finishing": "Powder Coating Coklat Kayu Urat Halus (Woodgrain)",
        "kaca": "Kaca Polos 5mm Clear SNI Asahimas",
        "hardware": "Kunci Crescent Lock Tengah & Roda Tandem Bearing Stainless",
        "sealant": "Karet Lis EPDM Tahan Panas Matahari",
        "volume": "Dimensi L 2.8m × T 1.6m (2 Set Opening)",
        "solusi": "Menggunakan roda sliding tandem bearing ganda sehingga daun jendela terasa sangat ringan digeser oleh anak-anak sekalipun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Dacon 3 Inch Profil Ekonomis Berkualitas SNI",
        "finishing": "Powder Coating Coklat Kayu Urat Halus (Woodgrain)",
        "kaca": "Kaca Polos 5mm Clear SNI Asahimas",
        "hardware": "Kunci Crescent Lock Tengah & Roda Tandem Bearing Stainless",
        "sealant": "Karet Lis EPDM Tahan Panas Matahari",
        "volume": "Dimensi L 2.8m × T 1.6m (2 Set Opening)",
        "solusi": "Menggunakan roda sliding tandem bearing ganda sehingga daun jendela terasa sangat ringan digeser oleh anak-anak sekalipun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Keunggulan Jendela Geser Sliding Aluminium"
    },
    {
      "id": "proj-14",
      "slug": "pintu-aluminium-swing-spandrel-cikampek",
      "title": "Pintu Aluminium Swing Modern Daun Panel Spandrel Full",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Kota Baru Cikampek",
      "loc": "Kota Baru Cikampek",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-aluminium.jpg",
      "imageAlt": "Pintu aluminium swing panel spandrel full Cikampek Karawang",
      "imageIds": [
        "img-proj-14-cover"
      ],
      "description": "Pintu akses samping dan area servis rumah memakai panel spandrel aluminium double layer anti dobrakan, privasi 100% dan tahan air hujan.",
      "desc": "Pintu akses samping dan area servis rumah memakai panel spandrel aluminium double layer anti dobrakan, privasi 100% dan tahan air hujan.",
      "specifications": {
        "kusen": "Inkalum 3 Inch Tebal 1.1mm Kusen Siku Presisi",
        "finishing": "Powder Coating Grey Charcoal Abu-Abu Tua Elegan",
        "kaca": "Panel Spandrel Aluminium Double Wall Tebal Kokoh (Non-Kaca)",
        "hardware": "Lockcase Mortise Lock Roller & Silinder Kunci Kuningan 3 Anak Kunci",
        "sealant": "Karet Bantalan Peredam Suara Benturan Pintu",
        "volume": "2 Unit Pintu Single Leaf (L 90cm × T 215cm)",
        "solusi": "Konstruksi panel spandrel aluminium double wall yang padat memberikan isolasi termal terhadap terik matahari dan kokoh anti dobrakan.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum 3 Inch Tebal 1.1mm Kusen Siku Presisi",
        "finishing": "Powder Coating Grey Charcoal Abu-Abu Tua Elegan",
        "kaca": "Panel Spandrel Aluminium Double Wall Tebal Kokoh (Non-Kaca)",
        "hardware": "Lockcase Mortise Lock Roller & Silinder Kunci Kuningan 3 Anak Kunci",
        "sealant": "Karet Bantalan Peredam Suara Benturan Pintu",
        "volume": "2 Unit Pintu Single Leaf (L 90cm × T 215cm)",
        "solusi": "Konstruksi panel spandrel aluminium double wall yang padat memberikan isolasi termal terhadap terik matahari dan kokoh anti dobrakan.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Pilihan Pintu Aluminium Awet Bebas Rayap"
    },
    {
      "id": "proj-15",
      "slug": "skylight-atap-kaca-purwakarta",
      "title": "Skylight Atap Kaca Tempered Void Tangga Rumah Tingkat",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Purwakarta Kota",
      "loc": "Purwakarta Kota",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Skylight atap kaca tempered void tangga Purwakarta Kota",
      "imageIds": [
        "img-proj-15-cover"
      ],
      "description": "Atap penerangan alami (skylight) di atas void tangga tengah hunian 3 lantai. Menghemat pemakaian listrik lampu di siang hari secara signifikan.",
      "desc": "Atap penerangan alami (skylight) di atas void tangga tengah hunian 3 lantai. Menghemat pemakaian listrik lampu di siang hari secara signifikan.",
      "specifications": {
        "kusen": "Rangka Balok Besi Hollow 100×50×2.3mm Rangka Kaku",
        "finishing": "Cat Duco Epoxy Heavy Primer + Polyurethane Putih Bersih",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 0.76mm Safety Glass",
        "hardware": "Plat Anchor Sambung Baja 8mm Dynabolt Ramset Beton",
        "sealant": "Dowsil 795 Weatherseal Structural Glazing Silicone",
        "volume": "Luas 12 m² (3.0m × 4.0m Bentang Void Tangga)",
        "solusi": "Menggunakan kaca laminated safety glass 6+6mm, jika kaca terbentur batu sekalipun pecahannya tetap menempel pada lapisan film PVB tanpa jatuh ke bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran"
      },
      "specs": {
        "kusen": "Rangka Balok Besi Hollow 100×50×2.3mm Rangka Kaku",
        "finishing": "Cat Duco Epoxy Heavy Primer + Polyurethane Putih Bersih",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 0.76mm Safety Glass",
        "hardware": "Plat Anchor Sambung Baja 8mm Dynabolt Ramset Beton",
        "sealant": "Dowsil 795 Weatherseal Structural Glazing Silicone",
        "volume": "Luas 12 m² (3.0m × 4.0m Bentang Void Tangga)",
        "solusi": "Menggunakan kaca laminated safety glass 6+6mm, jika kaca terbentur batu sekalipun pecahannya tetap menempel pada lapisan film PVB tanpa jatuh ke bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Keamanan Skylight Kaca Laminated Rumah Bertingkat"
    },
    {
      "id": "proj-16",
      "slug": "pintu-kaca-frame-putih-harapan-indah",
      "title": "Pintu Kaca Aluminium Frame Putih Gaya Scandinavian",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Harapan Indah Bekasi",
      "loc": "Harapan Indah Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kaca-putih.jpg",
      "imageAlt": "Pintu kaca aluminium frame putih scandinavian Harapan Indah Bekasi",
      "imageIds": [
        "img-proj-16-cover"
      ],
      "description": "Pintu kaca frame putih dengan kisi ornamen kotak modern memadukan estetika Skandinavia terang dan bersih untuk akses ruang keluarga ke teras samping.",
      "desc": "Pintu kaca frame putih dengan kisi ornamen kotak modern memadukan estetika Skandinavia terang dan bersih untuk akses ruang keluarga ke teras samping.",
      "specifications": {
        "kusen": "Alexindo 3 Inch Profil Lembut Presisi",
        "finishing": "Powder Coating White Arctic Smooth Finish",
        "kaca": "Kaca Polos Clear 6mm Asahimas Bebas Distorsi",
        "hardware": "Engsel Stainless 4 Inch SUS304 & Kunci Lever Handle Minimalis Modern",
        "sealant": "White Sanitary Silicone Sealant",
        "volume": "1 Unit Pintu Swing Single (L 90cm × T 220cm)",
        "solusi": "Finishing powder coating oven pabrik membuat cat putih tidak menguning meski terpapar sinar UV matahari bertahun-tahun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Garansi Cat & Engsel"
      },
      "specs": {
        "kusen": "Alexindo 3 Inch Profil Lembut Presisi",
        "finishing": "Powder Coating White Arctic Smooth Finish",
        "kaca": "Kaca Polos Clear 6mm Asahimas Bebas Distorsi",
        "hardware": "Engsel Stainless 4 Inch SUS304 & Kunci Lever Handle Minimalis Modern",
        "sealant": "White Sanitary Silicone Sealant",
        "volume": "1 Unit Pintu Swing Single (L 90cm × T 220cm)",
        "solusi": "Finishing powder coating oven pabrik membuat cat putih tidak menguning meski terpapar sinar UV matahari bertahun-tahun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Garansi Cat & Engsel"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/keunggulan-kusen-aluminium-dibanding-kayu.html",
      "articleTitle": "Tren Pintu Aluminium Putih Scandinavian"
    },
    {
      "id": "proj-17",
      "slug": "curtain-wall-fasad-gedung-subang-smartpolitan",
      "title": "Curtain Wall Kaca Fasad Gedung Ruko & Perkantoran 3 Lantai",
      "serviceId": "curtain-wall",
      "rabConfigId": "rab-curtain-wall",
      "calcServiceKey": "curtain_wall",
      "location": "Subang Smartpolitan",
      "loc": "Subang Smartpolitan",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Curtain wall fasad kaca ruko gedung 3 lantai Subang Smartpolitan",
      "imageIds": [
        "img-proj-17-cover"
      ],
      "description": "Pemasangan dinding tirai kaca (curtain wall stick system) fasad depan ruko 3 lantai. Memberi kesan megah arsitektural modern penunjang citra profesional kantor.",
      "desc": "Pemasangan dinding tirai kaca (curtain wall stick system) fasad depan ruko 3 lantai. Memberi kesan megah arsitektural modern penunjang citra profesional kantor.",
      "specifications": {
        "kusen": "Back Mullion Aluminium 150×50mm Tebal 2.0mm Heavy Duty",
        "finishing": "Anodized Dark Brown 20 Micron Kualitas Gedung Tinggi",
        "kaca": "Kaca Panasap Green Tinted 6mm Anti Panas Surya Asahimas",
        "hardware": "Bracket Siku Jangkar Baja 8mm Hot-Dip Galvanized & Baut Grade 8.8",
        "sealant": "Dow Corning Structural Glazing Silicone Sealant",
        "volume": "Luas Fasad Kaca 120 m² (Bentang 3 Lantai)",
        "solusi": "Pemasangan back mullion yang dijangkar ke balok tepi lantai dengan joint expansion fleksibel untuk mengantisipasi gempa mikro dan pergerakan termal gedung.",
        "durasi": "14 Hari Kerja",
        "garansi": "60 Bulan Garansi Struktural & Kebocoran"
      },
      "specs": {
        "kusen": "Back Mullion Aluminium 150×50mm Tebal 2.0mm Heavy Duty",
        "finishing": "Anodized Dark Brown 20 Micron Kualitas Gedung Tinggi",
        "kaca": "Kaca Panasap Green Tinted 6mm Anti Panas Surya Asahimas",
        "hardware": "Bracket Siku Jangkar Baja 8mm Hot-Dip Galvanized & Baut Grade 8.8",
        "sealant": "Dow Corning Structural Glazing Silicone Sealant",
        "volume": "Luas Fasad Kaca 120 m² (Bentang 3 Lantai)",
        "solusi": "Pemasangan back mullion yang dijangkar ke balok tepi lantai dengan joint expansion fleksibel untuk mengantisipasi gempa mikro dan pergerakan termal gedung.",
        "durasi": "14 Hari Kerja",
        "garansi": "60 Bulan Garansi Struktural & Kebocoran"
      },
      "testimonialId": "testi-10",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Konstruksi Curtain Wall Gedung Komersial"
    },
    {
      "id": "proj-18",
      "slug": "pintu-kaca-sliding-otomatis-sensor-kosambi",
      "title": "Pintu Kaca Sliding Otomatis Sensor Gerak Minimarket & Apotek",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Kosambi Klari Karawang",
      "loc": "Kosambi Klari Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu kaca sliding otomatis sensor gerak apotek Kosambi Klari",
      "imageIds": [
        "img-proj-18-cover"
      ],
      "description": "Instalasi pintu geser otomatis kaca tempered tanpa sentuh untuk pintu masuk apotek modern dan minimarket, mendukung kenyamanan pengunjung dan efisiensi AC ruangan.",
      "desc": "Instalasi pintu geser otomatis kaca tempered tanpa sentuh untuk pintu masuk apotek modern dan minimarket, mendukung kenyamanan pengunjung dan efisiensi AC ruangan.",
      "specifications": {
        "kusen": "Cover Box Aluminium Slimline Header Otomatis 12cm",
        "finishing": "Natural Anodized Silver Hairline",
        "kaca": "Tempered Glass Clear 10mm SNI Asahimas Flat Edges",
        "hardware": "Drive Motor DC Brushless, Microcontroller Controller & 2 Radar Microwave",
        "sealant": "Karet Lis Mohair Peredam Kebocoran AC",
        "volume": "2 Daun Bi-Parting (Opening Bersih Lebar 1.8m × Tinggi 2.2m)",
        "solusi": "Sistem safety beam sensor di ketinggian 40cm mencegah pintu menjepit pengunjung atau anak kecil yang sedang melintas di tengah opening.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Motor & Sensor"
      },
      "specs": {
        "kusen": "Cover Box Aluminium Slimline Header Otomatis 12cm",
        "finishing": "Natural Anodized Silver Hairline",
        "kaca": "Tempered Glass Clear 10mm SNI Asahimas Flat Edges",
        "hardware": "Drive Motor DC Brushless, Microcontroller Controller & 2 Radar Microwave",
        "sealant": "Karet Lis Mohair Peredam Kebocoran AC",
        "volume": "2 Daun Bi-Parting (Opening Bersih Lebar 1.8m × Tinggi 2.2m)",
        "solusi": "Sistem safety beam sensor di ketinggian 40cm mencegah pintu menjepit pengunjung atau anak kecil yang sedang melintas di tengah opening.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Motor & Sensor"
      },
      "testimonialId": "testi-04",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Sistem Pintu Otomatis Sensor Komersial"
    },
    {
      "id": "proj-19",
      "slug": "pintu-lipat-bifold-6-daun-kota-bukit-indah",
      "title": "Pintu Lipat (Bifold) Aluminium 6 Daun Ruang Serbaguna & Garasi",
      "serviceId": "aluminium-bifold",
      "rabConfigId": "rab-bifold",
      "calcServiceKey": "bifold",
      "location": "Kota Bukit Indah Purwakarta",
      "loc": "Kota Bukit Indah Purwakarta",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu lipat bifold aluminium 6 daun Kota Bukit Indah Purwakarta",
      "imageIds": [
        "img-proj-19-cover"
      ],
      "description": "Penyekat fleksibel aula serbaguna yang dapat dilipat ke sisi kiri dan kanan, membuka akses lapang tanpa tiang tengah saat ada acara keluarga besar.",
      "desc": "Penyekat fleksibel aula serbaguna yang dapat dilipat ke sisi kiri dan kanan, membuka akses lapang tanpa tiang tengah saat ada acara keluarga besar.",
      "specifications": {
        "kusen": "Alexindo Heavy Duty Bifold 4 Inch Ketebalan 1.35mm",
        "finishing": "Powder Coating Matte Grey Charcoal",
        "kaca": "Kaca Tempered Clear 8mm SNI Safety Glazing",
        "hardware": "Top Hanging Track SUS304 Kapasitas 250kg & Engsel Lipat Stainless",
        "sealant": "Santoprene Double Gasket Seal Kedap Suara",
        "volume": "6 Daun Lipat (Lebar Bukaan 5.4m × Tinggi 2.6m)",
        "solusi": "Sistem rel gantung suspensi dengan penahan beban di balok atas beton, tidak membebani lantai dasar dan roda berputar whisper-quiet.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Garansi Sistem Lipat"
      },
      "specs": {
        "kusen": "Alexindo Heavy Duty Bifold 4 Inch Ketebalan 1.35mm",
        "finishing": "Powder Coating Matte Grey Charcoal",
        "kaca": "Kaca Tempered Clear 8mm SNI Safety Glazing",
        "hardware": "Top Hanging Track SUS304 Kapasitas 250kg & Engsel Lipat Stainless",
        "sealant": "Santoprene Double Gasket Seal Kedap Suara",
        "volume": "6 Daun Lipat (Lebar Bukaan 5.4m × Tinggi 2.6m)",
        "solusi": "Sistem rel gantung suspensi dengan penahan beban di balok atas beton, tidak membebani lantai dasar dan roda berputar whisper-quiet.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Garansi Sistem Lipat"
      },
      "testimonialId": "testi-06",
      "articleUrl": "artikel/desain-pintu-lipat-aluminium-bifold-minimalis.html",
      "articleTitle": "Aplikasi Pintu Bifold Lebar Garasi & Aula"
    },
    {
      "id": "proj-20",
      "slug": "partisi-kaca-akustik-double-glass-giic-cikarang",
      "title": "Partisi Kaca Akustik Double Glass & Louver Blinds Ruang Direksi",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "GIIC Cikarang Pusat",
      "loc": "GIIC Cikarang Pusat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca akustik double glass GIIC Cikarang Pusat",
      "imageIds": [
        "img-proj-20-cover"
      ],
      "description": "Ruang kerja direksi pabrik GIIC dengan partisi kaca ganda kedap suara tinggi dan tirai venetian blinds magnetik di dalam rongga kaca.",
      "desc": "Ruang kerja direksi pabrik GIIC dengan partisi kaca ganda kedap suara tinggi dan tirai venetian blinds magnetik di dalam rongga kaca.",
      "specifications": {
        "kusen": "Aluminium Akustik Profil 4 Inch Tebal 1.4mm",
        "finishing": "Anodized Black Matte 20 Micron",
        "kaca": "Double Glass Unit (Tempered 6mm + Rongga Udara 12mm + Tempered 6mm)",
        "hardware": "Magnetic Slider Pengontrol Tirai Venetian & Mortise Lockset Dekson",
        "sealant": "Butyl Sealant + Desiccant Penyerap Kelembaban Rongga",
        "volume": "Luas 26 m² (Tinggi 3.0m × Panjang 8.6m)",
        "solusi": "Tirai venetian blinds terpasang di ruang hampa antar kaca sehingga tidak akan pernah kotor berdebu dan tidak membutuhkan pembersihan selamanya.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Resmi"
      },
      "specs": {
        "kusen": "Aluminium Akustik Profil 4 Inch Tebal 1.4mm",
        "finishing": "Anodized Black Matte 20 Micron",
        "kaca": "Double Glass Unit (Tempered 6mm + Rongga Udara 12mm + Tempered 6mm)",
        "hardware": "Magnetic Slider Pengontrol Tirai Venetian & Mortise Lockset Dekson",
        "sealant": "Butyl Sealant + Desiccant Penyerap Kelembaban Rongga",
        "volume": "Luas 26 m² (Tinggi 3.0m × Panjang 8.6m)",
        "solusi": "Tirai venetian blinds terpasang di ruang hampa antar kaca sehingga tidak akan pernah kotor berdebu dan tidak membutuhkan pembersihan selamanya.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Resmi"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Teknologi Partisi Akustik Ruang Direksi"
    },
    {
      "id": "proj-21",
      "slug": "pintu-utama-pivot-oversized-resinda",
      "title": "Pintu Utama Pivot Oversized Jumbo Rangka Aluminium Minimalis",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Resinda Karawang Barat",
      "loc": "Resinda Karawang Barat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu utama pivot oversized jumbo Resinda Karawang Barat",
      "imageIds": [
        "img-proj-21-cover"
      ],
      "description": "Pintu masuk utama rumah mewah dengan sistem engsel putar pivot lantai offset. Daun pintu berukuran besar memberi sambutan megah saat dibuka.",
      "desc": "Pintu masuk utama rumah mewah dengan sistem engsel putar pivot lantai offset. Daun pintu berukuran besar memberi sambutan megah saat dibuka.",
      "specifications": {
        "kusen": "Profil Kusen Aluminium Khusus Tebal 2.0mm Reinforced Steel Inside",
        "finishing": "Powder Coating AkzoNobel Sand Black Metallic",
        "kaca": "Kaca Tempered Grey Fluted 10mm Paduan Plat Spandrel Motif Kayu",
        "hardware": "Heavy Duty Floor Pivot Hinge Dekkson 200kg + Smart Digital Door Lock",
        "sealant": "Perimeter EPDM Seal Kedap Udara & Air Hujan",
        "volume": "1 Daun Jumbo (Lebar 1.4m × Tinggi 2.8m)",
        "solusi": "Titik tumpu engsel pivot berjarak 20cm dari tepi kusen memungkinkan daun pintu seberat 110 kg dapat didorong ringan hanya dengan satu jari.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Pivot"
      },
      "specs": {
        "kusen": "Profil Kusen Aluminium Khusus Tebal 2.0mm Reinforced Steel Inside",
        "finishing": "Powder Coating AkzoNobel Sand Black Metallic",
        "kaca": "Kaca Tempered Grey Fluted 10mm Paduan Plat Spandrel Motif Kayu",
        "hardware": "Heavy Duty Floor Pivot Hinge Dekkson 200kg + Smart Digital Door Lock",
        "sealant": "Perimeter EPDM Seal Kedap Udara & Air Hujan",
        "volume": "1 Daun Jumbo (Lebar 1.4m × Tinggi 2.8m)",
        "solusi": "Titik tumpu engsel pivot berjarak 20cm dari tepi kusen memungkinkan daun pintu seberat 110 kg dapat didorong ringan hanya dengan satu jari.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Pivot"
      },
      "testimonialId": "testi-01",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Desain Pintu Pivot Modern Rumah Mewah"
    },
    {
      "id": "proj-22",
      "slug": "kanopi-kaca-teras-kolam-renang-galuh-mas",
      "title": "Kanopi Kaca Tempered Laminated Teras Kolam Renang Cantilever",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Galuh Mas Karawang",
      "loc": "Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Kanopi kaca kolam renang cantilever Galuh Mas Karawang",
      "imageIds": [
        "img-proj-22-cover"
      ],
      "description": "Kanopi kaca bening santai tepi kolam renang dengan sistem gantung kabel sling baja stainless SUS304 (cantilever) tanpa tiang penyangga di pinggir kolam.",
      "desc": "Kanopi kaca bening santai tepi kolam renang dengan sistem gantung kabel sling baja stainless SUS304 (cantilever) tanpa tiang penyangga di pinggir kolam.",
      "specifications": {
        "kusen": "Struktur Balok Baja WF 150 & Kabel Sling Baja Stainless SUS304 12mm",
        "finishing": "Cat Dasar Epoxy Marine Grade + PU Top Coat Putih Cerah",
        "kaca": "Tempered Laminated 5+5mm PVB Tinted Light Blue",
        "hardware": "Turnbuckle Jarum Keras SUS304 & Spider Fitting 2 Arah",
        "sealant": "Dowsil Neutral Structural Silicone",
        "volume": "Luas 18 m² (Panjang 6m × Overhang Maju 3m)",
        "solusi": "Sistem tarikan kabel sling baja SUS304 dari atas kolom beton menahan beban angin angkat (uplift wind load) dan bebas tiang bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktur & Sealant"
      },
      "specs": {
        "kusen": "Struktur Balok Baja WF 150 & Kabel Sling Baja Stainless SUS304 12mm",
        "finishing": "Cat Dasar Epoxy Marine Grade + PU Top Coat Putih Cerah",
        "kaca": "Tempered Laminated 5+5mm PVB Tinted Light Blue",
        "hardware": "Turnbuckle Jarum Keras SUS304 & Spider Fitting 2 Arah",
        "sealant": "Dowsil Neutral Structural Silicone",
        "volume": "Luas 18 m² (Panjang 6m × Overhang Maju 3m)",
        "solusi": "Sistem tarikan kabel sling baja SUS304 dari atas kolom beton menahan beban angin angkat (uplift wind load) dan bebas tiang bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktur & Sealant"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kanopi-kaca-tempered-carport.html",
      "articleTitle": "Konstruksi Kanopi Kaca Kolam Renang"
    },
    {
      "id": "proj-23",
      "slug": "etalase-kaca-toko-emas-pasar-johar",
      "title": "Etalase Kaca Aluminium & Rak Display Toko Perhiasan Emas",
      "serviceId": "aluminium-showcase",
      "rabConfigId": "rab-showcase",
      "calcServiceKey": "etalase",
      "location": "Pasar Johar Karawang",
      "loc": "Pasar Johar Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Etalase kaca display perhiasan emas Pasar Johar Karawang",
      "imageIds": [
        "img-proj-23-cover"
      ],
      "description": "Pembuatan counter etalase perhiasan emas full kaca tempered dengan pencahayaan warm white LED strip tersembunyi dan sistem penguncian keamanan ganda.",
      "desc": "Pembuatan counter etalase perhiasan emas full kaca tempered dengan pencahayaan warm white LED strip tersembunyi dan sistem penguncian keamanan ganda.",
      "specifications": {
        "kusen": "Profil Aluminium Khusus Etalase Mewah Chamfered Edge",
        "finishing": "Anodized Mirror Black Glossy",
        "kaca": "Kaca Tempered Clear 8mm Extra Clear (Low Iron) Bebas Kehijauan",
        "hardware": "Roda Rel Tanam Halus, Kunci Sentral Huben & Bracket Rak SUS304",
        "sealant": "Clear UV-Curing Glue & Silicone Sanitasi",
        "volume": "Set Counter Display (Panjang Total 6 Meter)",
        "solusi": "Menggunakan kaca low-iron ekstra jernih agar kilau perhiasan emas dan berlian terlihat 100% akurat tanpa bias warna kehijauan kaca standar.",
        "durasi": "4 Hari Fabrikasi Workshop + Pasang",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Profil Aluminium Khusus Etalase Mewah Chamfered Edge",
        "finishing": "Anodized Mirror Black Glossy",
        "kaca": "Kaca Tempered Clear 8mm Extra Clear (Low Iron) Bebas Kehijauan",
        "hardware": "Roda Rel Tanam Halus, Kunci Sentral Huben & Bracket Rak SUS304",
        "sealant": "Clear UV-Curing Glue & Silicone Sanitasi",
        "volume": "Set Counter Display (Panjang Total 6 Meter)",
        "solusi": "Menggunakan kaca low-iron ekstra jernih agar kilau perhiasan emas dan berlian terlihat 100% akurat tanpa bias warna kehijauan kaca standar.",
        "durasi": "4 Hari Fabrikasi Workshop + Pasang",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-11",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Desain Etalase Display Komersial"
    },
    {
      "id": "proj-24",
      "slug": "jendela-pivot-vertikal-grand-wisata",
      "title": "Jendela Pivot Aluminium Vertikal Putar 180° Ruang Tangga",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Grand Wisata Bekasi",
      "loc": "Grand Wisata Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Jendela pivot vertikal putar 180 derajat Grand Wisata Bekasi",
      "imageIds": [
        "img-proj-24-cover"
      ],
      "description": "Jendela aksen arsitektural void tangga yang dapat diputar 180 derajat untuk memudahkan pembersihan kaca sisi luar dari dalam rumah.",
      "desc": "Jendela aksen arsitektural void tangga yang dapat diputar 180 derajat untuk memudahkan pembersihan kaca sisi luar dari dalam rumah.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Heavy Profile Siku Presisi",
        "finishing": "Powder Coating Matte Black",
        "kaca": "Tempered Glass 8mm Clear SNI Asahimas",
        "hardware": "Engsel Pivot Vertikal Heavy Duty Stainless Steel SUS304 90kg",
        "sealant": "EPDM Double Compression Bulb Gasket",
        "volume": "2 Unit Jendela Tinggi (L 80cm × T 240cm)",
        "solusi": "Sistem stopper multi-posisi memungkinkan jendela terkunci aman pada sudut bukaan 30° untuk sirkulasi angin tanpa risiko terbanting angin badai.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Resmi Garansi Engsel"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Heavy Profile Siku Presisi",
        "finishing": "Powder Coating Matte Black",
        "kaca": "Tempered Glass 8mm Clear SNI Asahimas",
        "hardware": "Engsel Pivot Vertikal Heavy Duty Stainless Steel SUS304 90kg",
        "sealant": "EPDM Double Compression Bulb Gasket",
        "volume": "2 Unit Jendela Tinggi (L 80cm × T 240cm)",
        "solusi": "Sistem stopper multi-posisi memungkinkan jendela terkunci aman pada sudut bukaan 30° untuk sirkulasi angin tanpa risiko terbanting angin badai.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Resmi Garansi Engsel"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Jendela Pivot Putar Desain Modern"
    },
    {
      "id": "proj-25",
      "slug": "pintu-sliding-barn-door-cikampek",
      "title": "Pintu Sliding Model Barn Door Industrial Kisi Kotak Hitam",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Villa Permata Cikampek",
      "loc": "Villa Permata Cikampek",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu sliding barn door industrial kisi hitam Cikampek",
      "imageIds": [
        "img-proj-25-cover"
      ],
      "description": "Pintu geser gaya industrial modern dengan lis kisi kotak aluminium hitam (french door style) untuk pemisah ruang kerja di rumah tinggal.",
      "desc": "Pintu geser gaya industrial modern dengan lis kisi kotak aluminium hitam (french door style) untuk pemisah ruang kerja di rumah tinggal.",
      "specifications": {
        "kusen": "Inkalum Slim Grid Profile Black Doff",
        "finishing": "Powder Coating Black Doff Sand Texture",
        "kaca": "Kaca Clear Polos 5mm dengan Lis Ornamen Aluminium Tempel Presisi",
        "hardware": "Roda Rel Gantung Exposed Track SUS304 & Handle Pipa Industrial 40cm",
        "sealant": "Karet Lis Gasket Rapi Tanpa Noda Lem",
        "volume": "1 Unit Barn Door (L 100cm × T 220cm)",
        "solusi": "Roda gantung exposed industrial berbahan nilon karbon anti berisik saat digeser, memberi karakter visual kuat pada interior ruang.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum Slim Grid Profile Black Doff",
        "finishing": "Powder Coating Black Doff Sand Texture",
        "kaca": "Kaca Clear Polos 5mm dengan Lis Ornamen Aluminium Tempel Presisi",
        "hardware": "Roda Rel Gantung Exposed Track SUS304 & Handle Pipa Industrial 40cm",
        "sealant": "Karet Lis Gasket Rapi Tanpa Noda Lem",
        "volume": "1 Unit Barn Door (L 100cm × T 220cm)",
        "solusi": "Roda gantung exposed industrial berbahan nilon karbon anti berisik saat digeser, memberi karakter visual kuat pada interior ruang.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Inspirasi Pintu Barn Door Industrial Aluminium"
    },
    {
      "id": "proj-26",
      "slug": "railing-balkon-u-channel-subang",
      "title": "Railing Balkon Kaca Tempered U-Channel Aluminium Tanam (Base Shoe)",
      "serviceId": "glass-railing",
      "rabConfigId": "rab-railing",
      "calcServiceKey": "railing",
      "location": "Subang Smart City",
      "loc": "Subang Smart City",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Railing balkon kaca tempered u-channel tanam Subang Smart City",
      "imageIds": [
        "img-proj-26-cover"
      ],
      "description": "Pagar balkon kaca tampilan bersih total tanpa tiang ataupun spigot bawah. Profil U-channel struktural ditanam rata permukaan keramik teras lantai 2.",
      "desc": "Pagar balkon kaca tampilan bersih total tanpa tiang ataupun spigot bawah. Profil U-channel struktural ditanam rata permukaan keramik teras lantai 2.",
      "specifications": {
        "kusen": "Base Shoe U-Channel Aluminium Ekstrusi Heavy Duty 120×70mm Tanam",
        "finishing": "Cover Cladding Stainless Steel Hairline SUS304 Rata Lantai",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 1.52mm Extra Safety Glass",
        "hardware": "Chemical Anchor Hilti HIT-RE 500 V3 & Baji Pengunci Kaca Presisi",
        "sealant": "Epoxy Grout Struktural + Sealant Non-Sagging Tahan Cuaca",
        "volume": "Panjang 14 Meter Lari Balkon Utama",
        "solusi": "Pemasangan profil U-channel sebelum pengecoran screed keramik lantai balkon menghasilkan pemandangan lanskap tanpa batas (infinity view).",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktural"
      },
      "specs": {
        "kusen": "Base Shoe U-Channel Aluminium Ekstrusi Heavy Duty 120×70mm Tanam",
        "finishing": "Cover Cladding Stainless Steel Hairline SUS304 Rata Lantai",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 1.52mm Extra Safety Glass",
        "hardware": "Chemical Anchor Hilti HIT-RE 500 V3 & Baji Pengunci Kaca Presisi",
        "sealant": "Epoxy Grout Struktural + Sealant Non-Sagging Tahan Cuaca",
        "volume": "Panjang 14 Meter Lari Balkon Utama",
        "solusi": "Pemasangan profil U-channel sebelum pengecoran screed keramik lantai balkon menghasilkan pemandangan lanskap tanpa batas (infinity view).",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktural"
      },
      "testimonialId": "testi-07",
      "articleUrl": "artikel/desain-railing-balkon-tangga-kaca-frameless.html",
      "articleTitle": "Pemasangan Railing Balkon Kaca Base Shoe Tanam Rata Lantai"
    }
  ],
  "images": [
    {
      "id": "img-proj-02-cover",
      "imageId": "img-proj-02-cover",
      "projectId": "proj-02",
      "url": "assets/gallery/pintu-kaca.jpg",
      "src": "assets/gallery/pintu-kaca.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu kaca tempered frameless floor hinge toko Ruko Galuh Mas Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-08-cover",
      "imageId": "img-proj-08-cover",
      "projectId": "proj-08",
      "url": "assets/gallery/jendela-aluminium.jpg",
      "src": "assets/gallery/jendela-aluminium.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Jendela aluminium jungkit casement kedap suara Telukjambe Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-09-cover",
      "imageId": "img-proj-09-cover",
      "projectId": "proj-09",
      "url": "assets/gallery/shower-kaca.jpg",
      "src": "assets/gallery/shower-kaca.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Shower screen kaca frameless tempered 10mm Grand Wisata Bekasi",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-10-cover",
      "imageId": "img-proj-10-cover",
      "projectId": "proj-10",
      "url": "assets/gallery/pintu-kamar-mandi.jpg",
      "src": "assets/gallery/pintu-kamar-mandi.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu aluminium kamar mandi kaca sandblast buram Klari Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-14-cover",
      "imageId": "img-proj-14-cover",
      "projectId": "proj-14",
      "url": "assets/gallery/pintu-aluminium.jpg",
      "src": "assets/gallery/pintu-aluminium.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu aluminium swing panel spandrel full Cikampek Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-16-cover",
      "imageId": "img-proj-16-cover",
      "projectId": "proj-16",
      "url": "assets/gallery/pintu-kaca-putih.jpg",
      "src": "assets/gallery/pintu-kaca-putih.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu kaca aluminium frame putih scandinavian Harapan Indah Bekasi",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-01-cover",
      "imageId": "img-proj-01-cover",
      "projectId": "proj-01",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca aluminium ruang rapat kantor industri KIIC Karawang Barat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-03-cover",
      "imageId": "img-proj-03-cover",
      "projectId": "proj-03",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu sliding aluminium kaca akses taman Grand Taruma Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-04-cover",
      "imageId": "img-proj-04-cover",
      "projectId": "proj-04",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu lipat bifold aluminium 4 daun Summarecon Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-05-cover",
      "imageId": "img-proj-05-cover",
      "projectId": "proj-05",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Sekat partisi kaca dapur moru glass Galuh Mas Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-06-cover",
      "imageId": "img-proj-06-cover",
      "projectId": "proj-06",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Fasad ACP Seven dan pintu otomatis sensor Jababeka Cikarang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-07-cover",
      "imageId": "img-proj-07-cover",
      "projectId": "proj-07",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Kanopi kaca tempered laminated carport Summarecon Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-11-cover",
      "imageId": "img-proj-11-cover",
      "projectId": "proj-11",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Railing kaca tempered 12mm spigot Grand Taruma Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-12-cover",
      "imageId": "img-proj-12-cover",
      "projectId": "proj-12",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca cleanroom pabrik Suryacipta Ciampel Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-13-cover",
      "imageId": "img-proj-13-cover",
      "projectId": "proj-13",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Jendela sliding geser 4 daun Cikarang Baru Jababeka",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-15-cover",
      "imageId": "img-proj-15-cover",
      "projectId": "proj-15",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Skylight atap kaca tempered void tangga Purwakarta Kota",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-17-cover",
      "imageId": "img-proj-17-cover",
      "projectId": "proj-17",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Curtain wall fasad kaca ruko gedung 3 lantai Subang Smartpolitan",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-18-cover",
      "imageId": "img-proj-18-cover",
      "projectId": "proj-18",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu kaca sliding otomatis sensor gerak apotek Kosambi Klari",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-19-cover",
      "imageId": "img-proj-19-cover",
      "projectId": "proj-19",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu lipat bifold aluminium 6 daun Kota Bukit Indah Purwakarta",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-20-cover",
      "imageId": "img-proj-20-cover",
      "projectId": "proj-20",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca akustik double glass GIIC Cikarang Pusat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-21-cover",
      "imageId": "img-proj-21-cover",
      "projectId": "proj-21",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu utama pivot oversized jumbo Resinda Karawang Barat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-22-cover",
      "imageId": "img-proj-22-cover",
      "projectId": "proj-22",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Kanopi kaca kolam renang cantilever Galuh Mas Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-23-cover",
      "imageId": "img-proj-23-cover",
      "projectId": "proj-23",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Etalase kaca display perhiasan emas Pasar Johar Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-24-cover",
      "imageId": "img-proj-24-cover",
      "projectId": "proj-24",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Jendela pivot vertikal putar 180 derajat Grand Wisata Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-25-cover",
      "imageId": "img-proj-25-cover",
      "projectId": "proj-25",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu sliding barn door industrial kisi hitam Cikampek",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-26-cover",
      "imageId": "img-proj-26-cover",
      "projectId": "proj-26",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Railing balkon kaca tempered u-channel tanam Subang Smart City",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    }
  ],
  "testimonials": [
    {
      "testimonialId": "testi-01",
      "projectId": "proj-02",
      "serviceId": "tempered-door",
      "location": "Ruko Galuh Mas, Karawang Barat",
      "author": "Bpk. Hendra Gunawan",
      "role": "Owner Ruko Galuh Mas, Karawang Barat",
      "quote": "Pengerjaan pintu kaca tempered frameless dan partisi sekat toko ruko kami di Galuh Mas sangat presisi dan tepat waktu. Mesin floor hinge Dekkson empuk dan aksesoris stainless 304 sangat kokoh.",
      "rating": 5,
      "date": "2026-01-14"
    },
    {
      "testimonialId": "testi-02",
      "projectId": "proj-03",
      "serviceId": "aluminium-door",
      "location": "Perumahan Grand Taruma, Karawang",
      "author": "Ibu Ratna Dewi",
      "role": "Perumahan Grand Taruma, Karawang",
      "quote": "Teknisi Sahabat Kaca sangat profesional membawa sampel profil Alexindo dan Inkalum saat survey gratis. Pintu sliding aluminium 3 daun taman belakang kami geserannya sangat halus dan kedap air hujan.",
      "rating": 5,
      "date": "2026-01-28"
    },
    {
      "testimonialId": "testi-03",
      "projectId": "proj-01",
      "serviceId": "aluminium-partition",
      "location": "KIIC Karawang Barat",
      "author": "Bpk. Agus Prasetyo",
      "role": "Facility Manager Pabrik, KIIC Karawang",
      "quote": "Standar industri yang sangat rapi. Pemasangan partisi sekat ruang meeting kantor pabrik kami di KIIC selesai sesuai standar K3, sambungan profil miter rapat, dan ruangan langsung kedap suara.",
      "rating": 5,
      "date": "2026-02-05"
    },
    {
      "testimonialId": "testi-04",
      "projectId": "proj-18",
      "serviceId": "tempered-door",
      "location": "Telukjambe Timur, Karawang",
      "author": "dr. Sinta Maharani",
      "role": "Klinik Pratama Medika, Telukjambe Timur",
      "quote": "Pemasangan pintu sliding kaca otomatis untuk klinik kami hasilnya sangat bersih dan higienis. Sensor gerak responsif dan buka-tutup sangat hening, pasien merasa sangat nyaman.",
      "rating": 5,
      "date": "2026-02-12"
    },
    {
      "testimonialId": "testi-05",
      "projectId": "proj-07",
      "serviceId": "glass-canopy",
      "location": "Summarecon Bekasi",
      "author": "Bpk. Dedi Kurniawan",
      "role": "Residensial Summarecon Bekasi",
      "quote": "Kanopi kaca tempered laminated untuk carport depan rumah sangat kokoh. Rangka pipa hollow galvanis dicat primer epoxy tebal dan sealant silikon Dowsil 795 rapi tanpa rembes hujan lebat.",
      "rating": 5,
      "date": "2026-02-20"
    },
    {
      "testimonialId": "testi-06",
      "projectId": "proj-04",
      "serviceId": "aluminium-bifold",
      "location": "Summarecon Bekasi",
      "author": "Ibu Maya Angelina",
      "role": "Owner Cafe & Eatery, Bekasi",
      "quote": "Pintu lipat bifold 4 daun untuk area semi-outdoor kafe kami sangat fungsional dan estetik. Bukaan 100% membuat sirkulasi udara lega dan harga transparan bersahabat.",
      "rating": 5,
      "date": "2026-03-02"
    },
    {
      "testimonialId": "testi-07",
      "projectId": "proj-11",
      "serviceId": "glass-railing",
      "location": "Grand Taruma Karawang",
      "author": "Bpk. Ir. Bambang Sugiarto",
      "role": "Pemilik Hunian Grand Taruma Karawang",
      "quote": "Instalasi railing tangga & balkon kaca tempered 12mm dengan klem spigot solid stainless SUS304 sangat kokoh. Dibor inti ke beton lantai balok, tidak goyang dan ruangan terlihat jauh lebih luas.",
      "rating": 5,
      "date": "2026-03-10"
    },
    {
      "testimonialId": "testi-08",
      "projectId": "proj-09",
      "serviceId": "shower-glass",
      "location": "Grand Wisata Bekasi",
      "author": "Ibu Cindy Claudia",
      "role": "Residensial Grand Wisata Bekasi",
      "quote": "Pemasangan shower screen kaca frameless 10mm kamar mandi utama hasilnya sangat rapi. Engsel kuningan lapis krom awet tahan lembab dan magnet door seal benar-benar kedap cipratan air.",
      "rating": 5,
      "date": "2026-03-15"
    },
    {
      "testimonialId": "testi-09",
      "projectId": "proj-06",
      "serviceId": "acp-facade",
      "location": "Jababeka Cikarang",
      "author": "Bpk. Wisnu Wardhana",
      "role": "Kontraktor Showroom Komersial Jababeka",
      "quote": "Fasad ACP Seven eksterior gedung showroom sangat presisi. Nat sealant silikon lurus rapi dan rangka hollow galvanis anti karat sangat kokoh menahan cuaca panas hujan.",
      "rating": 5,
      "date": "2026-03-22"
    },
    {
      "testimonialId": "testi-10",
      "projectId": "proj-17",
      "serviceId": "curtain-wall",
      "location": "Subang Smartpolitan",
      "author": "Bpk. Gunawan Wibisono",
      "role": "Project Manager Ruko Subang",
      "quote": "Curtain wall stick system kaca Panasap 6mm fasad gedung kantor 3 lantai selesai sesuai target schedule. Penolakan panas matahari efektif dan tampilan gedung terlihat megah berkelas.",
      "rating": 5,
      "date": "2026-03-29"
    },
    {
      "testimonialId": "testi-11",
      "projectId": "proj-23",
      "serviceId": "aluminium-showcase",
      "location": "Pasar Johar Karawang",
      "author": "Ibu Linda Susanti",
      "role": "Owner Toko Perhiasan Emas Johar",
      "quote": "Etalase custom rangka aluminium anodize tebal dan kaca tempered clear 8mm dengan lampu LED strip tersembunyi. Display cincin dan kalung jadi berkilau indah, kunci pengaman sangat mantap.",
      "rating": 5,
      "date": "2026-04-01"
    },
    {
      "testimonialId": "testi-12",
      "projectId": "proj-08",
      "serviceId": "aluminium-window",
      "location": "Telukjambe Timur Karawang",
      "author": "Bpk. Ahmad Fauzi",
      "role": "Perumahan Telukjambe Timur Karawang",
      "quote": "Jendela casement aluminium kedap suara jalan raya sangat signifikan. Karet EPDM dan friction stay stainless Dekkson tebal menutup sangat rapat tanpa getaran.",
      "rating": 5,
      "date": "2026-04-03"
    },
    {
      "testimonialId": "testi-general-01",
      "projectId": null,
      "serviceId": "aluminium-profile",
      "location": "Klari, Karawang",
      "author": "Bpk. H. Rahmat",
      "role": "Pelanggan Residensial Karawang",
      "quote": "Pelayanan cepat dan transparan. Survey gratis ke rumah, tim ramah, dan estimasi biaya di web sama persis dengan tagihan akhir tanpa biaya siluman.",
      "rating": 5,
      "date": "2026-03-25"
    }
  ]
};

// Attach catalog lookup helpers
window.PROJECT_CATALOG.getProjectById = function(id) {
  return (window.PROJECT_CATALOG.projects || []).find(p => p.id === id) || null;
};
window.PROJECT_CATALOG.getServiceById = function(id) {
  return (window.PROJECT_CATALOG.services || []).find(s => s.id === id || s.calcKey === id) || null;
};
window.PROJECT_CATALOG.getImageById = function(id) {
  return (window.PROJECT_CATALOG.images || []).find(img => img.id === id || img.imageId === id) || null;
};
window.PROJECT_CATALOG.getTestimonialsByProjectId = function(projectId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.projectId === projectId);
};
window.PROJECT_CATALOG.getTestimonialsByServiceId = function(serviceId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.serviceId === serviceId);
};
window.PROJECT_CATALOG.getVerifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getUnverifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => !p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getMasterStats = function() {
  return {
    totalProjects: window.PROJECT_CATALOG.TOTAL_PROJECTS || 26,
    verifiedProjectsCount: window.PROJECT_CATALOG.VERIFIED_PROJECTS_COUNT || 6,
    unverifiedProjectsCount: window.PROJECT_CATALOG.UNVERIFIED_PROJECTS_COUNT || 20,
    totalServices: window.PROJECT_CATALOG.TOTAL_SERVICES || 12,
    totalTestimonials: window.PROJECT_CATALOG.TOTAL_TESTIMONIALS || 13
  };
};

// Global shortcuts for window
window.getProjectById = window.PROJECT_CATALOG.getProjectById;
window.getServiceById = window.PROJECT_CATALOG.getServiceById;

// Master Pricing Configuration Object
/* ==============================================================================
 * MASTER DATA SYNCHRONIZATION (Single Source of Truth)
 * Services: 12 | Projects: 26 (Verified: 6, Pending: 20)
 * ============================================================================== */
window.PROJECT_CATALOG = window.PROJECT_CATALOG || {
  "TOTAL_PROJECTS": 26,
  "VERIFIED_PROJECTS_COUNT": 6,
  "UNVERIFIED_PROJECTS_COUNT": 20,
  "TOTAL_SERVICES": 12,
  "TOTAL_TESTIMONIALS": 13,
  "services": [
    {
      "id": "glass-canopy",
      "calcKey": "kanopi",
      "name": "Kanopi Kaca Tempered Carport / Teras",
      "rabConfigId": "rab-canopy",
      "category": "glass_canopy",
      "priceModel": "glass_canopy",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Rangka & Kaca:",
      "guideText": "PILIH SISTEM STRUKTUR • PILIH JENIS KACA"
    },
    {
      "id": "glass-railing",
      "calcKey": "railing",
      "name": "Railing Tangga & Balkon Kaca Tempered",
      "rabConfigId": "rab-railing",
      "category": "glass_railing",
      "priceModel": "glass_railing",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "summaryLabel": "Sistem Railing:",
      "guideText": "PILIH SISTEM RAILING (U-Channel, Spigot, Handrail SS304)"
    },
    {
      "id": "aluminium-partition",
      "calcKey": "partisi",
      "name": "Partisi Kaca Kantor & Sekat Ruangan Aluminium",
      "rabConfigId": "rab-partition",
      "category": "aluminium",
      "priceModel": "aluminium_partition",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Partisi:",
      "guideText": "Standard SNI 3\" vs Premium Heavy Duty 4\""
    },
    {
      "id": "aluminium-window",
      "calcKey": "jendela",
      "name": "Jendela Aluminium (Casement / Sliding)",
      "rabConfigId": "rab-window",
      "category": "aluminium",
      "priceModel": "aluminium_window",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Jendela:",
      "guideText": "Standard SNI vs Premium Alexindo Heavy Duty"
    },
    {
      "id": "aluminium-door",
      "calcKey": "pintu",
      "name": "Pintu Aluminium (Swing / Sliding Modern)",
      "rabConfigId": "rab-door",
      "category": "aluminium",
      "priceModel": "aluminium_door",
      "unit": "unit",
      "unitName": "Unit Pintu",
      "summaryLabel": "Tipe Bukaan:",
      "guideText": "PILIH SISTEM PINTU: Swing, Sliding, atau Folding"
    },
    {
      "id": "shower-glass",
      "calcKey": "shower",
      "name": "Shower Screen Kaca Kamar Mandi",
      "rabConfigId": "rab-shower",
      "category": "glass_shower",
      "priceModel": "glass_shower",
      "unit": "unit",
      "unitName": "Set Shower Screen",
      "summaryLabel": "Sistem Shower:",
      "guideText": "PILIH SISTEM SHOWER: Framed, Semi Frameless, Full Frameless"
    },
    {
      "id": "aluminium-profile",
      "calcKey": "kusen",
      "name": "Kusen Aluminium (Profil 3\" / 4\" SNI)",
      "rabConfigId": "rab-profile",
      "category": "aluminium",
      "priceModel": "aluminium_profile",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "summaryLabel": "Grade Kusen:",
      "guideText": "Standar SNI 3\" vs Alexindo Heavy 4\""
    },
    {
      "id": "tempered-door",
      "calcKey": "pintu_tempered",
      "name": "Pintu Kaca Frameless Floor Hinge",
      "rabConfigId": "rab-tempered-door",
      "category": "glass_door",
      "priceModel": "glass_door",
      "unit": "unit",
      "unitName": "Set Daun Pintu",
      "summaryLabel": "Sistem Bukaan:",
      "guideText": "PILIH SISTEM: Single Leaf 10/12mm vs Double Leaf Kupu Tarung"
    },
    {
      "id": "aluminium-bifold",
      "calcKey": "bifold",
      "name": "Pintu Lipat Bifold System Aluminium",
      "rabConfigId": "rab-bifold",
      "category": "aluminium",
      "priceModel": "aluminium_bifold",
      "unit": "daun",
      "unitName": "Daun Pintu",
      "summaryLabel": "Grade Bifold:",
      "guideText": "Standard Inkalum vs Premium Alexindo Heavy 250kg"
    },
    {
      "id": "aluminium-showcase",
      "calcKey": "etalase",
      "name": "Etalase Kaca Toko & Display Counter",
      "rabConfigId": "rab-showcase",
      "category": "aluminium",
      "priceModel": "aluminium_showcase",
      "unit": "unit",
      "unitName": "Unit Etalase",
      "summaryLabel": "Spesifikasi Etalase:",
      "guideText": "Standard Toko 1.5m vs Premium Display Full Kaca"
    },
    {
      "id": "acp-facade",
      "calcKey": "acp",
      "name": "Fasad ACP Aluminium Composite Panel",
      "rabConfigId": "rab-acp",
      "category": "facade_acp",
      "priceModel": "acp_facade",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Grade Panel ACP:",
      "guideText": "Tipe cat PE Interior vs PVDF Outdoor 0.3mm vs Heavy Duty 0.5mm"
    },
    {
      "id": "curtain-wall",
      "calcKey": "curtain_wall",
      "name": "Curtain Wall Fasad Kaca Komersial",
      "rabConfigId": "rab-curtain-wall",
      "category": "curtain_wall",
      "priceModel": "curtain_wall",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "summaryLabel": "Sistem Fasad:",
      "guideText": "Stick System Panasap 6mm vs Reflective 8mm vs Semi-Unitized"
    }
  ],
  "projects": [
    {
      "id": "proj-01",
      "slug": "partisi-kaca-aluminium-ruang-rapat-kiic-karawang",
      "title": "Partisi Kaca Aluminium Ruang Rapat & Kantor Industri",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "KIIC Karawang Barat",
      "loc": "KIIC Karawang Barat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca aluminium ruang rapat kantor industri KIIC Karawang Barat",
      "imageIds": [
        "img-proj-01-cover"
      ],
      "description": "Pemasangan partisi kaca modular ruang meeting eksekutif pada fasilitas manufaktur kawasan industri KIIC Karawang Barat. Memberikan kekedapan suara tinggi agar rapat internal tidak bocor ke area produksi.",
      "desc": "Pemasangan partisi kaca modular ruang meeting eksekutif pada fasilitas manufaktur kawasan industri KIIC Karawang Barat. Memberikan kekedapan suara tinggi agar rapat internal tidak bocor ke area produksi.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.35mm SNI",
        "finishing": "Powder Coating Matte Black UV-Resistance",
        "kaca": "Kaca Polos Clear 8mm Asahimas Polished Edge",
        "hardware": "Dekkson Patch Fitting & Engsel Heavy-Duty",
        "sealant": "Dowsil Neutral Weatherseal Silicone + Karet EPDM Kedap Suara",
        "volume": "Luas 32 m² (Tinggi 3.2m × Panjang 10m)",
        "solusi": "Aplikasi double acoustic seal EPDM pada sambungan kusen dan dinding beton untuk meminimalisir kebisingan mesin pabrik masuk ke ruang rapat.",
        "durasi": "3 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran & Struktur"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.35mm SNI",
        "finishing": "Powder Coating Matte Black UV-Resistance",
        "kaca": "Kaca Polos Clear 8mm Asahimas Polished Edge",
        "hardware": "Dekkson Patch Fitting & Engsel Heavy-Duty",
        "sealant": "Dowsil Neutral Weatherseal Silicone + Karet EPDM Kedap Suara",
        "volume": "Luas 32 m² (Tinggi 3.2m × Panjang 10m)",
        "solusi": "Aplikasi double acoustic seal EPDM pada sambungan kusen dan dinding beton untuk meminimalisir kebisingan mesin pabrik masuk ke ruang rapat.",
        "durasi": "3 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran & Struktur"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Panduan Partisi Kaca Kantor & Pabrik Industri"
    },
    {
      "id": "proj-02",
      "slug": "pintu-kaca-tempered-frameless-ruko-galuh-mas",
      "title": "Pintu Kaca Tempered Frameless Floor Hinge Toko & Showroom",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Ruko Galuh Mas Karawang",
      "loc": "Ruko Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kaca.jpg",
      "imageAlt": "Pintu kaca tempered frameless floor hinge toko Ruko Galuh Mas Karawang",
      "imageIds": [
        "img-proj-02-cover"
      ],
      "description": "Pintu kaca tempered frameless untuk outlet komersial ruko Galuh Mas Karawang. Menghadirkan visibilitas display barang dagangan secara maksimal dari luar ruangan tanpa halangan bingkai.",
      "desc": "Pintu kaca tempered frameless untuk outlet komersial ruko Galuh Mas Karawang. Menghadirkan visibilitas display barang dagangan secara maksimal dari luar ruangan tanpa halangan bingkai.",
      "specifications": {
        "kusen": "Frameless (Tanpa Kusen) dengan Lis U Stainless Bawah",
        "finishing": "Stainless Steel SUS304 Hairline Mirror Polish",
        "kaca": "Tempered Glass 12mm Asahimas SNI Kualitas Tinggi",
        "hardware": "Floor Hinge Dekkson FH-84 Heavy-Duty 120kg, Patch Fitting PT-10/PT-20",
        "sealant": "Silicone Clear Anti Jamur & Seal Karet Bawah Penahan Air",
        "volume": "2 Daun Kupu Tarung (L 1.8m × T 2.4m)",
        "solusi": "Penanaman silinder floor hinge Dekkson FH-84 pada lantai granit dengan semen grouting anti susut agar stabil pada lalu lintas pengunjung tinggi.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Floor Hinge"
      },
      "specs": {
        "kusen": "Frameless (Tanpa Kusen) dengan Lis U Stainless Bawah",
        "finishing": "Stainless Steel SUS304 Hairline Mirror Polish",
        "kaca": "Tempered Glass 12mm Asahimas SNI Kualitas Tinggi",
        "hardware": "Floor Hinge Dekkson FH-84 Heavy-Duty 120kg, Patch Fitting PT-10/PT-20",
        "sealant": "Silicone Clear Anti Jamur & Seal Karet Bawah Penahan Air",
        "volume": "2 Daun Kupu Tarung (L 1.8m × T 2.4m)",
        "solusi": "Penanaman silinder floor hinge Dekkson FH-84 pada lantai granit dengan semen grouting anti susut agar stabil pada lalu lintas pengunjung tinggi.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Floor Hinge"
      },
      "testimonialId": "testi-01",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Tips Memilih Kaca Tempered & Safety Glass Toko"
    },
    {
      "id": "proj-03",
      "slug": "pintu-sliding-aluminium-grand-taruma",
      "title": "Pintu Sliding Aluminium Kaca Akses Taman & Ruang Keluarga",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Grand Taruma Karawang",
      "loc": "Grand Taruma Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu sliding aluminium kaca akses taman Grand Taruma Karawang",
      "imageIds": [
        "img-proj-03-cover"
      ],
      "description": "Pintu sliding kaca connecting room taman belakang pada hunian 2 lantai Grand Taruma. Memungkinkan pencahayaan alami masuk leluasa dan sirkulasi angin segar mengalir ke seluruh lantai satu.",
      "desc": "Pintu sliding kaca connecting room taman belakang pada hunian 2 lantai Grand Taruma. Memungkinkan pencahayaan alami masuk leluasa dan sirkulasi angin segar mengalir ke seluruh lantai satu.",
      "specifications": {
        "kusen": "Inkalum 3 Inch Profil Ramping Kokoh",
        "finishing": "Anodized Dark Brown 18 Micron Tahan Gores",
        "kaca": "Kaca Rayban Euro Grey 6mm Peredam Silau & Panas",
        "hardware": "Roda Sliding Double Bearing Nylon & Flush Handle Lock Dekson",
        "sealant": "Mohair Brush Seal (Bulu Peredam Debu) + Karet EPDM",
        "volume": "3 Daun Triple Track (L 2.7m × T 2.2m)",
        "solusi": "Pemasangan rel triple track dengan lubang drainase air (weep holes) tersembunyi mencegah genangan air saat hujan lebat berangin kencang.",
        "durasi": "2 Hari Kerja",
        "garansi": "12 Bulan Resmi Garansi Roda & Kusen"
      },
      "specs": {
        "kusen": "Inkalum 3 Inch Profil Ramping Kokoh",
        "finishing": "Anodized Dark Brown 18 Micron Tahan Gores",
        "kaca": "Kaca Rayban Euro Grey 6mm Peredam Silau & Panas",
        "hardware": "Roda Sliding Double Bearing Nylon & Flush Handle Lock Dekson",
        "sealant": "Mohair Brush Seal (Bulu Peredam Debu) + Karet EPDM",
        "volume": "3 Daun Triple Track (L 2.7m × T 2.2m)",
        "solusi": "Pemasangan rel triple track dengan lubang drainase air (weep holes) tersembunyi mencegah genangan air saat hujan lebat berangin kencang.",
        "durasi": "2 Hari Kerja",
        "garansi": "12 Bulan Resmi Garansi Roda & Kusen"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Inspirasi Pintu Sliding Geser Hemat Ruang"
    },
    {
      "id": "proj-04",
      "slug": "pintu-lipat-bifold-summarecon-bekasi",
      "title": "Pintu Lipat (Bifold) Aluminium 4 Daun Teras Belakang",
      "serviceId": "aluminium-bifold",
      "rabConfigId": "rab-bifold",
      "calcServiceKey": "bifold",
      "location": "Summarecon Bekasi",
      "loc": "Summarecon Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu lipat bifold aluminium 4 daun Summarecon Bekasi",
      "imageIds": [
        "img-proj-04-cover"
      ],
      "description": "Konsep indoor-outdoor living dengan folding door 4 daun bukaan 100%, sistem rel tanam rata lantai dan kaca tempered 8mm aman untuk keluarga.",
      "desc": "Konsep indoor-outdoor living dengan folding door 4 daun bukaan 100%, sistem rel tanam rata lantai dan kaca tempered 8mm aman untuk keluarga.",
      "specifications": {
        "kusen": "Alexindo Heavy Duty Bifold Profile 1.35mm",
        "finishing": "Powder Coating White Arctic Glossy",
        "kaca": "Tempered Glass 8mm SNI Safety Glazing",
        "hardware": "Heavy Duty Suspended Top Track Roller & Stainless Flush Bolt",
        "sealant": "Double Weatherstrip Karet Santoprene Kedap Suara",
        "volume": "4 Daun (Lebar Bukaan 3.6m × Tinggi 2.4m)",
        "solusi": "Penerapan bottom guide rail tanam rata lantai (flush floor threshold) sehingga tidak ada hambatan tersandung bagi lansia dan anak kecil.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Garansi Rel Gantung & Roda"
      },
      "specs": {
        "kusen": "Alexindo Heavy Duty Bifold Profile 1.35mm",
        "finishing": "Powder Coating White Arctic Glossy",
        "kaca": "Tempered Glass 8mm SNI Safety Glazing",
        "hardware": "Heavy Duty Suspended Top Track Roller & Stainless Flush Bolt",
        "sealant": "Double Weatherstrip Karet Santoprene Kedap Suara",
        "volume": "4 Daun (Lebar Bukaan 3.6m × Tinggi 2.4m)",
        "solusi": "Penerapan bottom guide rail tanam rata lantai (flush floor threshold) sehingga tidak ada hambatan tersandung bagi lansia dan anak kecil.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Garansi Rel Gantung & Roda"
      },
      "testimonialId": "testi-06",
      "articleUrl": "artikel/desain-pintu-lipat-aluminium-bifold-minimalis.html",
      "articleTitle": "Desain Pintu Lipat Bifold Aluminium Modern"
    },
    {
      "id": "proj-05",
      "slug": "sekat-partisi-dapur-moru-galuh-mas",
      "title": "Sekat Partisi Kaca Dapur Minimalis Fluted Moru Glass",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "Galuh Mas Karawang",
      "loc": "Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Sekat partisi kaca dapur moru glass Galuh Mas Karawang",
      "imageIds": [
        "img-proj-05-cover"
      ],
      "description": "Sekat pemisah dapur bersih dan ruang makan menggunakan kaca bertekstur garis Moru (fluted glass). Menghalangi percikan minyak memasak dan bau dapur namun tetap meneruskan cahaya alami estetis.",
      "desc": "Sekat pemisah dapur bersih dan ruang makan menggunakan kaca bertekstur garis Moru (fluted glass). Menghalangi percikan minyak memasak dan bau dapur namun tetap meneruskan cahaya alami estetis.",
      "specifications": {
        "kusen": "Inkalum Slimline Minimalist Black Doff 3 Inch",
        "finishing": "Powder Coating Sand Texture Black",
        "kaca": "Fluted Glass (Kaca Moru Bergaris Estetik) 8mm Tempered",
        "hardware": "Handle Tanam Minimalis & Engsel Soft-Closing SUS304",
        "sealant": "Food-Grade Sanitary Neutral Silicone Anti Jamur",
        "volume": "Luas 9.6 m² (L 3.2m × T 3.0m)",
        "solusi": "Menggunakan silikon grade sanitasi khusus dapur yang anti jamur minyak dan mudah dibersihkan dengan sabun pembersih biasa.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum Slimline Minimalist Black Doff 3 Inch",
        "finishing": "Powder Coating Sand Texture Black",
        "kaca": "Fluted Glass (Kaca Moru Bergaris Estetik) 8mm Tempered",
        "hardware": "Handle Tanam Minimalis & Engsel Soft-Closing SUS304",
        "sealant": "Food-Grade Sanitary Neutral Silicone Anti Jamur",
        "volume": "Luas 9.6 m² (L 3.2m × T 3.0m)",
        "solusi": "Menggunakan silikon grade sanitasi khusus dapur yang anti jamur minyak dan mudah dibersihkan dengan sabun pembersih biasa.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-ruangan-minimalis-estetik.html",
      "articleTitle": "Inspirasi Partisi Kaca Ruangan Minimalis Estetik"
    },
    {
      "id": "proj-06",
      "slug": "fasad-acp-seven-pintu-otomatis-jababeka",
      "title": "Fasad ACP Seven & Pintu Sensor Gerak Otomatis",
      "serviceId": "acp-facade",
      "rabConfigId": "rab-acp",
      "calcServiceKey": "acp",
      "location": "Jababeka Cikarang",
      "loc": "Jababeka Cikarang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Fasad ACP Seven dan pintu otomatis sensor Jababeka Cikarang",
      "imageIds": [
        "img-proj-06-cover"
      ],
      "description": "Transformasi fasad eksterior showroom komersial dengan penutup dinding ACP merek Seven garansi warna 10 tahun dan pintu sliding otomatis sensor microwave.",
      "desc": "Transformasi fasad eksterior showroom komersial dengan penutup dinding ACP merek Seven garansi warna 10 tahun dan pintu sliding otomatis sensor microwave.",
      "specifications": {
        "kusen": "Rangka Hollow Galvanis 40×40×1.6mm + Braket Siku Baja",
        "finishing": "Seven ACP PVDF 0.30mm Metallic Silver & Dark Grey",
        "kaca": "Kaca Tempered Panasap Dark Blue 8mm Anti Panas",
        "hardware": "Mesin Sliding Otomatis Dorma ES-200 Radar Microwave Sensor",
        "sealant": "Dowsil Non-Staining Neutral Silicone Khusus Eksterior Gedung",
        "volume": "Luas ACP 85 m² + 1 Unit Pintu Otomatis 2 Daun",
        "solusi": "Pemasangan water drip flashing aluminium di atas kusen otomatis untuk mengalirkan air hujan lebat menjauh dari sensor inframerah pintu.",
        "durasi": "7 Hari Kerja",
        "garansi": "10 Tahun Garansi Warna ACP & 24 Bulan Mesin Pintu"
      },
      "specs": {
        "kusen": "Rangka Hollow Galvanis 40×40×1.6mm + Braket Siku Baja",
        "finishing": "Seven ACP PVDF 0.30mm Metallic Silver & Dark Grey",
        "kaca": "Kaca Tempered Panasap Dark Blue 8mm Anti Panas",
        "hardware": "Mesin Sliding Otomatis Dorma ES-200 Radar Microwave Sensor",
        "sealant": "Dowsil Non-Staining Neutral Silicone Khusus Eksterior Gedung",
        "volume": "Luas ACP 85 m² + 1 Unit Pintu Otomatis 2 Daun",
        "solusi": "Pemasangan water drip flashing aluminium di atas kusen otomatis untuk mengalirkan air hujan lebat menjauh dari sensor inframerah pintu.",
        "durasi": "7 Hari Kerja",
        "garansi": "10 Tahun Garansi Warna ACP & 24 Bulan Mesin Pintu"
      },
      "testimonialId": "testi-09",
      "articleUrl": "artikel/keunggulan-kusen-aluminium-dibanding-kayu.html",
      "articleTitle": "Material Eksterior Modern Tahan Cuaca"
    },
    {
      "id": "proj-07",
      "slug": "kanopi-kaca-carport-summarecon-bekasi",
      "title": "Kanopi Kaca Tempered Laminated Carport Modern",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Summarecon Bekasi",
      "loc": "Summarecon Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Kanopi kaca tempered laminated carport Summarecon Bekasi",
      "imageIds": [
        "img-proj-07-cover"
      ],
      "description": "Atap kanopi carport mobil mewah menggunakan kaca tempered 10mm dengan struktur hollow galvanis 100×50 tebal 2mm bebas tiang tengah mengganggu manuver kendaraan.",
      "desc": "Atap kanopi carport mobil mewah menggunakan kaca tempered 10mm dengan struktur hollow galvanis 100×50 tebal 2mm bebas tiang tengah mengganggu manuver kendaraan.",
      "specifications": {
        "kusen": "Baja Hollow Galvanis 100×50×2.0mm & 50×50×1.8mm",
        "finishing": "Cat Dasar Epoxy Primer Anti Karat + Top Coat Polyurethane Hitam Doff",
        "kaca": "Tempered Glass 10mm Clear SNI Asahimas Flat Polished Edge",
        "hardware": "Dynabolt Anchor M12 Baja, Karet Bantalan EPDM & Spider Clamp SUS304",
        "sealant": "Dowsil 795 Structural Weatherseal Glazing Sealant",
        "volume": "Luas 24 m² (Panjang 6m × Lebar 4m)",
        "solusi": "Kemiringan atap 5 derajat dengan talang air pipa hollow tersembunyi mengalir langsung ke saluran drainase depan tanpa cipratan ke mobil.",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran Sealant & Struktur"
      },
      "specs": {
        "kusen": "Baja Hollow Galvanis 100×50×2.0mm & 50×50×1.8mm",
        "finishing": "Cat Dasar Epoxy Primer Anti Karat + Top Coat Polyurethane Hitam Doff",
        "kaca": "Tempered Glass 10mm Clear SNI Asahimas Flat Polished Edge",
        "hardware": "Dynabolt Anchor M12 Baja, Karet Bantalan EPDM & Spider Clamp SUS304",
        "sealant": "Dowsil 795 Structural Weatherseal Glazing Sealant",
        "volume": "Luas 24 m² (Panjang 6m × Lebar 4m)",
        "solusi": "Kemiringan atap 5 derajat dengan talang air pipa hollow tersembunyi mengalir langsung ke saluran drainase depan tanpa cipratan ke mobil.",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran Sealant & Struktur"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kanopi-kaca-tempered-carport.html",
      "articleTitle": "Tips Memilih Kanopi Kaca Tempered Carport Awet"
    },
    {
      "id": "proj-08",
      "slug": "jendela-aluminium-jungkit-casement-telukjambe",
      "title": "Jendela Aluminium Jungkit (Casement) Akustik",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Telukjambe Timur Karawang",
      "loc": "Telukjambe Timur Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/jendela-aluminium.jpg",
      "imageAlt": "Jendela aluminium jungkit casement kedap suara Telukjambe Karawang",
      "imageIds": [
        "img-proj-08-cover"
      ],
      "description": "Instalasi paket jendela casement buka samping dan jungkit awning pada hunian dekat jalan raya Telukjambe. Meredam kebisingan lalu lintas hingga 32 desibel.",
      "desc": "Instalasi paket jendela casement buka samping dan jungkit awning pada hunian dekat jalan raya Telukjambe. Meredam kebisingan lalu lintas hingga 32 desibel.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.2mm Profil Khusus Kedap",
        "finishing": "Powder Coating Ivory White High-Gloss",
        "kaca": "Kaca Laminated Akustik 5+5mm PVB 0.76mm Sound Control",
        "hardware": "Friction Stay Heavy-Duty Dekkson SUS304 14\" & Multi-Point Lock Handle",
        "sealant": "Double EPDM Gasket Seal Keliling Daun Jendela",
        "volume": "6 Daun Jendela Kamar Tidur & Ruang Kerja",
        "solusi": "Penggunaan sistem multi-point lock lever yang menekan daun jendela rapat merata ke kusen 4 penjuru saat handle dikunci ke bawah.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Aksesoris Friction Stay"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Profil Tebal 1.2mm Profil Khusus Kedap",
        "finishing": "Powder Coating Ivory White High-Gloss",
        "kaca": "Kaca Laminated Akustik 5+5mm PVB 0.76mm Sound Control",
        "hardware": "Friction Stay Heavy-Duty Dekkson SUS304 14\" & Multi-Point Lock Handle",
        "sealant": "Double EPDM Gasket Seal Keliling Daun Jendela",
        "volume": "6 Daun Jendela Kamar Tidur & Ruang Kerja",
        "solusi": "Penggunaan sistem multi-point lock lever yang menekan daun jendela rapat merata ke kusen 4 penjuru saat handle dikunci ke bawah.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Aksesoris Friction Stay"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Perawatan Jendela Aluminium Casement"
    },
    {
      "id": "proj-09",
      "slug": "shower-screen-kaca-frameless-grand-wisata",
      "title": "Shower Screen Kaca Frameless Kamar Mandi",
      "serviceId": "shower-glass",
      "rabConfigId": "rab-shower",
      "calcServiceKey": "shower",
      "location": "Grand Wisata Bekasi",
      "loc": "Grand Wisata Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/shower-kaca.jpg",
      "imageAlt": "Shower screen kaca frameless tempered 10mm Grand Wisata Bekasi",
      "imageIds": [
        "img-proj-09-cover"
      ],
      "description": "Penyekat area basah dan kering kamar mandi utama model pintu swing frameless kaca tempered 10mm. Menjaga lantai luar tetap kering dan higienis.",
      "desc": "Penyekat area basah dan kering kamar mandi utama model pintu swing frameless kaca tempered 10mm. Menjaga lantai luar tetap kering dan higienis.",
      "specifications": {
        "kusen": "Frameless Glass-to-Wall Hinge System",
        "finishing": "Chrome Mirror Polish Stainless Steel SUS304",
        "kaca": "Tempered Glass 10mm Clear dengan Lapisan Nano Anti Kerak Air",
        "hardware": "Engsel Shower 90° Glass-to-Wall Dekson SUS304 & Pipa Header Stabilizer",
        "sealant": "Clear Silicone Sanitasi Khusus Anti Lumut & Jamur Hitam",
        "volume": "Set L-Shape Sekat Kaca (100cm × 100cm × Tinggi 200cm)",
        "solusi": "Dilengkapi strip magnetic door seal di bibir pintu dan lis aluminium penahan air (water barrier threshold) di lantai mencegah rembesan busa sabun.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi Garansi Engsel & Seal"
      },
      "specs": {
        "kusen": "Frameless Glass-to-Wall Hinge System",
        "finishing": "Chrome Mirror Polish Stainless Steel SUS304",
        "kaca": "Tempered Glass 10mm Clear dengan Lapisan Nano Anti Kerak Air",
        "hardware": "Engsel Shower 90° Glass-to-Wall Dekson SUS304 & Pipa Header Stabilizer",
        "sealant": "Clear Silicone Sanitasi Khusus Anti Lumut & Jamur Hitam",
        "volume": "Set L-Shape Sekat Kaca (100cm × 100cm × Tinggi 200cm)",
        "solusi": "Dilengkapi strip magnetic door seal di bibir pintu dan lis aluminium penahan air (water barrier threshold) di lantai mencegah rembesan busa sabun.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi Garansi Engsel & Seal"
      },
      "testimonialId": "testi-08",
      "articleUrl": "artikel/kaca-kamar-mandi.html",
      "articleTitle": "Panduan Sekat Kaca Kamar Mandi Mewah"
    },
    {
      "id": "proj-10",
      "slug": "pintu-kaca-kamar-mandi-sandblast-klari",
      "title": "Pintu Kaca Kamar Mandi Motif Sandblast Buram",
      "serviceId": "shower-glass",
      "rabConfigId": "rab-shower",
      "calcServiceKey": "shower",
      "location": "Klari Karawang Timur",
      "loc": "Klari Karawang Timur",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kamar-mandi.jpg",
      "imageAlt": "Pintu aluminium kamar mandi kaca sandblast buram Klari Karawang",
      "imageIds": [
        "img-proj-10-cover"
      ],
      "description": "Pintu swing kamar mandi tahan cipratan air dengan motif sandblast buram gradasi modern. Tidak akan pernah keropos, berkarat, ataupun diserang rayap.",
      "desc": "Pintu swing kamar mandi tahan cipratan air dengan motif sandblast buram gradasi modern. Tidak akan pernah keropos, berkarat, ataupun diserang rayap.",
      "specifications": {
        "kusen": "Aluminium 3 Inch Anti Karat Khusus Area Lembab",
        "finishing": "Anodized Silver Satin 15 Micron",
        "kaca": "Kaca Es Frosted Buram Sandblast Kimia 6mm SNI Asahimas",
        "hardware": "Engsel Kupu Stainless 4 Inch & Lever Lockset Anti Karat",
        "sealant": "Neutral Silicone Karet Santoprene",
        "volume": "1 Daun Pintu Kamar Mandi (L 80cm × T 200cm)",
        "solusi": "Menggunakan kaca sandblast etsa kimia yang tahan air dan tidak meninggalkan noda sidik jari jika tersentuh sabun mandi.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Aluminium 3 Inch Anti Karat Khusus Area Lembab",
        "finishing": "Anodized Silver Satin 15 Micron",
        "kaca": "Kaca Es Frosted Buram Sandblast Kimia 6mm SNI Asahimas",
        "hardware": "Engsel Kupu Stainless 4 Inch & Lever Lockset Anti Karat",
        "sealant": "Neutral Silicone Karet Santoprene",
        "volume": "1 Daun Pintu Kamar Mandi (L 80cm × T 200cm)",
        "solusi": "Menggunakan kaca sandblast etsa kimia yang tahan air dan tidak meninggalkan noda sidik jari jika tersentuh sabun mandi.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-08",
      "articleUrl": "artikel/kaca-kamar-mandi.html",
      "articleTitle": "Tips Memilih Kaca Kamar Mandi Awet & Anti Keropos"
    },
    {
      "id": "proj-11",
      "slug": "railing-tangga-balkon-kaca-tempered-grand-taruma",
      "title": "Railing Tangga & Balkon Kaca Tempered Frameless Spigot SUS304",
      "serviceId": "glass-railing",
      "rabConfigId": "rab-railing",
      "calcServiceKey": "railing",
      "location": "Grand Taruma Karawang",
      "loc": "Grand Taruma Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Railing kaca tempered 12mm spigot Grand Taruma Karawang",
      "imageIds": [
        "img-proj-11-cover"
      ],
      "description": "Instalasi railing tangga kaca pada rumah hunian 2 lantai. Memberikan efek melayang yang memukau tanpa kisi-kisi besi penghalang pandangan, sekaligus sangat aman bagi anak kecil.",
      "desc": "Instalasi railing tangga kaca pada rumah hunian 2 lantai. Memberikan efek melayang yang memukau tanpa kisi-kisi besi penghalang pandangan, sekaligus sangat aman bagi anak kecil.",
      "specifications": {
        "kusen": "Frameless Spigot System (Penjepit Kaki Lantai Bebas Tiang)",
        "finishing": "Stainless Steel SUS304 Solid Cast Satin Finish",
        "kaca": "Tempered Glass 12mm SNI Flat Polished Rounded Edges",
        "hardware": "Spigot Clamp Kotak Heavy-Duty 20cm dengan Dynabolt M12 Cor Beton",
        "sealant": "Epoxy Anchor Grout + Rubber Gasket Pad",
        "volume": "Panjang 11 Meter Lari (Balkon Lantai 2 & Void Tangga)",
        "solusi": "Pemasangan klem spigot solid SUS304 dengan bor inti (core drill) ke dalam balok struktur beton lantai, kokoh menahan beban benturan samping hingga 150 kg.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Kekuatan Struktur"
      },
      "specs": {
        "kusen": "Frameless Spigot System (Penjepit Kaki Lantai Bebas Tiang)",
        "finishing": "Stainless Steel SUS304 Solid Cast Satin Finish",
        "kaca": "Tempered Glass 12mm SNI Flat Polished Rounded Edges",
        "hardware": "Spigot Clamp Kotak Heavy-Duty 20cm dengan Dynabolt M12 Cor Beton",
        "sealant": "Epoxy Anchor Grout + Rubber Gasket Pad",
        "volume": "Panjang 11 Meter Lari (Balkon Lantai 2 & Void Tangga)",
        "solusi": "Pemasangan klem spigot solid SUS304 dengan bor inti (core drill) ke dalam balok struktur beton lantai, kokoh menahan beban benturan samping hingga 150 kg.",
        "durasi": "3 Hari Kerja",
        "garansi": "24 Bulan Kekuatan Struktur"
      },
      "testimonialId": "testi-07",
      "articleUrl": "artikel/desain-railing-balkon-tangga-kaca-frameless.html",
      "articleTitle": "Desain Railing Tangga & Balkon Kaca Frameless"
    },
    {
      "id": "proj-12",
      "slug": "partisi-cleanroom-pabrik-suryacipta",
      "title": "Partisi Kaca Cleanroom Higienis & Pintu Airtight Pabrik",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "Suryacipta Ciampel",
      "loc": "Suryacipta Ciampel",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca cleanroom pabrik Suryacipta Ciampel Karawang",
      "imageIds": [
        "img-proj-12-cover"
      ],
      "description": "Instalasi partisi kaca ruang laboratorium uji kualitas (QA/QC) dan cleanroom industri komponen otomotif kawasan Suryacipta Karawang.",
      "desc": "Instalasi partisi kaca ruang laboratorium uji kualitas (QA/QC) dan cleanroom industri komponen otomotif kawasan Suryacipta Karawang.",
      "specifications": {
        "kusen": "Aluminium Profil R-Shape Bebas Sudut Mati Debu",
        "finishing": "Powder Coating White Anti Bakteri & Kimia Ringan",
        "kaca": "Tempered Glass Clear 10mm Double Glass dengan Seal Kedap Gas",
        "hardware": "Airtight Drop Seal Otomatis Bawah Pintu & Push-Pull Handle SUS304",
        "sealant": "Cleanroom Grade Silicone Sealant Non-Offgassing",
        "volume": "Luas Partisi 48 m² + 2 Set Pintu Airtight Swing",
        "solusi": "Penerapan lis aluminium sudut melengkung cembung (curved coving) pada pertemuan lantai dan dinding partisi agar tidak ada penumpukan debu.",
        "durasi": "5 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran Udara"
      },
      "specs": {
        "kusen": "Aluminium Profil R-Shape Bebas Sudut Mati Debu",
        "finishing": "Powder Coating White Anti Bakteri & Kimia Ringan",
        "kaca": "Tempered Glass Clear 10mm Double Glass dengan Seal Kedap Gas",
        "hardware": "Airtight Drop Seal Otomatis Bawah Pintu & Push-Pull Handle SUS304",
        "sealant": "Cleanroom Grade Silicone Sealant Non-Offgassing",
        "volume": "Luas Partisi 48 m² + 2 Set Pintu Airtight Swing",
        "solusi": "Penerapan lis aluminium sudut melengkung cembung (curved coving) pada pertemuan lantai dan dinding partisi agar tidak ada penumpukan debu.",
        "durasi": "5 Hari Kerja On-Site",
        "garansi": "12 Bulan Garansi Kebocoran Udara"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Standar Partisi Kaca Cleanroom Pabrik Industri"
    },
    {
      "id": "proj-13",
      "slug": "jendela-sliding-aluminium-cikarang-baru",
      "title": "Jendela Sliding (Geser) Aluminium 4 Daun Ruang Tamu",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Cikarang Baru Jababeka",
      "loc": "Cikarang Baru Jababeka",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Jendela sliding geser 4 daun Cikarang Baru Jababeka",
      "imageIds": [
        "img-proj-13-cover"
      ],
      "description": "Bukaan jendela lebar 4 daun geser sentral menghadap taman depan. Ruangan menerima sirkulasi udara maksimal dengan view lanskap taman tanpa sekat masif.",
      "desc": "Bukaan jendela lebar 4 daun geser sentral menghadap taman depan. Ruangan menerima sirkulasi udara maksimal dengan view lanskap taman tanpa sekat masif.",
      "specifications": {
        "kusen": "Dacon 3 Inch Profil Ekonomis Berkualitas SNI",
        "finishing": "Powder Coating Coklat Kayu Urat Halus (Woodgrain)",
        "kaca": "Kaca Polos 5mm Clear SNI Asahimas",
        "hardware": "Kunci Crescent Lock Tengah & Roda Tandem Bearing Stainless",
        "sealant": "Karet Lis EPDM Tahan Panas Matahari",
        "volume": "Dimensi L 2.8m × T 1.6m (2 Set Opening)",
        "solusi": "Menggunakan roda sliding tandem bearing ganda sehingga daun jendela terasa sangat ringan digeser oleh anak-anak sekalipun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Dacon 3 Inch Profil Ekonomis Berkualitas SNI",
        "finishing": "Powder Coating Coklat Kayu Urat Halus (Woodgrain)",
        "kaca": "Kaca Polos 5mm Clear SNI Asahimas",
        "hardware": "Kunci Crescent Lock Tengah & Roda Tandem Bearing Stainless",
        "sealant": "Karet Lis EPDM Tahan Panas Matahari",
        "volume": "Dimensi L 2.8m × T 1.6m (2 Set Opening)",
        "solusi": "Menggunakan roda sliding tandem bearing ganda sehingga daun jendela terasa sangat ringan digeser oleh anak-anak sekalipun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Keunggulan Jendela Geser Sliding Aluminium"
    },
    {
      "id": "proj-14",
      "slug": "pintu-aluminium-swing-spandrel-cikampek",
      "title": "Pintu Aluminium Swing Modern Daun Panel Spandrel Full",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Kota Baru Cikampek",
      "loc": "Kota Baru Cikampek",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-aluminium.jpg",
      "imageAlt": "Pintu aluminium swing panel spandrel full Cikampek Karawang",
      "imageIds": [
        "img-proj-14-cover"
      ],
      "description": "Pintu akses samping dan area servis rumah memakai panel spandrel aluminium double layer anti dobrakan, privasi 100% dan tahan air hujan.",
      "desc": "Pintu akses samping dan area servis rumah memakai panel spandrel aluminium double layer anti dobrakan, privasi 100% dan tahan air hujan.",
      "specifications": {
        "kusen": "Inkalum 3 Inch Tebal 1.1mm Kusen Siku Presisi",
        "finishing": "Powder Coating Grey Charcoal Abu-Abu Tua Elegan",
        "kaca": "Panel Spandrel Aluminium Double Wall Tebal Kokoh (Non-Kaca)",
        "hardware": "Lockcase Mortise Lock Roller & Silinder Kunci Kuningan 3 Anak Kunci",
        "sealant": "Karet Bantalan Peredam Suara Benturan Pintu",
        "volume": "2 Unit Pintu Single Leaf (L 90cm × T 215cm)",
        "solusi": "Konstruksi panel spandrel aluminium double wall yang padat memberikan isolasi termal terhadap terik matahari dan kokoh anti dobrakan.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum 3 Inch Tebal 1.1mm Kusen Siku Presisi",
        "finishing": "Powder Coating Grey Charcoal Abu-Abu Tua Elegan",
        "kaca": "Panel Spandrel Aluminium Double Wall Tebal Kokoh (Non-Kaca)",
        "hardware": "Lockcase Mortise Lock Roller & Silinder Kunci Kuningan 3 Anak Kunci",
        "sealant": "Karet Bantalan Peredam Suara Benturan Pintu",
        "volume": "2 Unit Pintu Single Leaf (L 90cm × T 215cm)",
        "solusi": "Konstruksi panel spandrel aluminium double wall yang padat memberikan isolasi termal terhadap terik matahari dan kokoh anti dobrakan.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Pilihan Pintu Aluminium Awet Bebas Rayap"
    },
    {
      "id": "proj-15",
      "slug": "skylight-atap-kaca-purwakarta",
      "title": "Skylight Atap Kaca Tempered Void Tangga Rumah Tingkat",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Purwakarta Kota",
      "loc": "Purwakarta Kota",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Skylight atap kaca tempered void tangga Purwakarta Kota",
      "imageIds": [
        "img-proj-15-cover"
      ],
      "description": "Atap penerangan alami (skylight) di atas void tangga tengah hunian 3 lantai. Menghemat pemakaian listrik lampu di siang hari secara signifikan.",
      "desc": "Atap penerangan alami (skylight) di atas void tangga tengah hunian 3 lantai. Menghemat pemakaian listrik lampu di siang hari secara signifikan.",
      "specifications": {
        "kusen": "Rangka Balok Besi Hollow 100×50×2.3mm Rangka Kaku",
        "finishing": "Cat Duco Epoxy Heavy Primer + Polyurethane Putih Bersih",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 0.76mm Safety Glass",
        "hardware": "Plat Anchor Sambung Baja 8mm Dynabolt Ramset Beton",
        "sealant": "Dowsil 795 Weatherseal Structural Glazing Silicone",
        "volume": "Luas 12 m² (3.0m × 4.0m Bentang Void Tangga)",
        "solusi": "Menggunakan kaca laminated safety glass 6+6mm, jika kaca terbentur batu sekalipun pecahannya tetap menempel pada lapisan film PVB tanpa jatuh ke bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran"
      },
      "specs": {
        "kusen": "Rangka Balok Besi Hollow 100×50×2.3mm Rangka Kaku",
        "finishing": "Cat Duco Epoxy Heavy Primer + Polyurethane Putih Bersih",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 0.76mm Safety Glass",
        "hardware": "Plat Anchor Sambung Baja 8mm Dynabolt Ramset Beton",
        "sealant": "Dowsil 795 Weatherseal Structural Glazing Silicone",
        "volume": "Luas 12 m² (3.0m × 4.0m Bentang Void Tangga)",
        "solusi": "Menggunakan kaca laminated safety glass 6+6mm, jika kaca terbentur batu sekalipun pecahannya tetap menempel pada lapisan film PVB tanpa jatuh ke bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Kebocoran"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Keamanan Skylight Kaca Laminated Rumah Bertingkat"
    },
    {
      "id": "proj-16",
      "slug": "pintu-kaca-frame-putih-harapan-indah",
      "title": "Pintu Kaca Aluminium Frame Putih Gaya Scandinavian",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Harapan Indah Bekasi",
      "loc": "Harapan Indah Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": true,
      "image": "assets/gallery/pintu-kaca-putih.jpg",
      "imageAlt": "Pintu kaca aluminium frame putih scandinavian Harapan Indah Bekasi",
      "imageIds": [
        "img-proj-16-cover"
      ],
      "description": "Pintu kaca frame putih dengan kisi ornamen kotak modern memadukan estetika Skandinavia terang dan bersih untuk akses ruang keluarga ke teras samping.",
      "desc": "Pintu kaca frame putih dengan kisi ornamen kotak modern memadukan estetika Skandinavia terang dan bersih untuk akses ruang keluarga ke teras samping.",
      "specifications": {
        "kusen": "Alexindo 3 Inch Profil Lembut Presisi",
        "finishing": "Powder Coating White Arctic Smooth Finish",
        "kaca": "Kaca Polos Clear 6mm Asahimas Bebas Distorsi",
        "hardware": "Engsel Stainless 4 Inch SUS304 & Kunci Lever Handle Minimalis Modern",
        "sealant": "White Sanitary Silicone Sealant",
        "volume": "1 Unit Pintu Swing Single (L 90cm × T 220cm)",
        "solusi": "Finishing powder coating oven pabrik membuat cat putih tidak menguning meski terpapar sinar UV matahari bertahun-tahun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Garansi Cat & Engsel"
      },
      "specs": {
        "kusen": "Alexindo 3 Inch Profil Lembut Presisi",
        "finishing": "Powder Coating White Arctic Smooth Finish",
        "kaca": "Kaca Polos Clear 6mm Asahimas Bebas Distorsi",
        "hardware": "Engsel Stainless 4 Inch SUS304 & Kunci Lever Handle Minimalis Modern",
        "sealant": "White Sanitary Silicone Sealant",
        "volume": "1 Unit Pintu Swing Single (L 90cm × T 220cm)",
        "solusi": "Finishing powder coating oven pabrik membuat cat putih tidak menguning meski terpapar sinar UV matahari bertahun-tahun.",
        "durasi": "1 Hari Kerja",
        "garansi": "12 Bulan Garansi Cat & Engsel"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/keunggulan-kusen-aluminium-dibanding-kayu.html",
      "articleTitle": "Tren Pintu Aluminium Putih Scandinavian"
    },
    {
      "id": "proj-17",
      "slug": "curtain-wall-fasad-gedung-subang-smartpolitan",
      "title": "Curtain Wall Kaca Fasad Gedung Ruko & Perkantoran 3 Lantai",
      "serviceId": "curtain-wall",
      "rabConfigId": "rab-curtain-wall",
      "calcServiceKey": "curtain_wall",
      "location": "Subang Smartpolitan",
      "loc": "Subang Smartpolitan",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Curtain wall fasad kaca ruko gedung 3 lantai Subang Smartpolitan",
      "imageIds": [
        "img-proj-17-cover"
      ],
      "description": "Pemasangan dinding tirai kaca (curtain wall stick system) fasad depan ruko 3 lantai. Memberi kesan megah arsitektural modern penunjang citra profesional kantor.",
      "desc": "Pemasangan dinding tirai kaca (curtain wall stick system) fasad depan ruko 3 lantai. Memberi kesan megah arsitektural modern penunjang citra profesional kantor.",
      "specifications": {
        "kusen": "Back Mullion Aluminium 150×50mm Tebal 2.0mm Heavy Duty",
        "finishing": "Anodized Dark Brown 20 Micron Kualitas Gedung Tinggi",
        "kaca": "Kaca Panasap Green Tinted 6mm Anti Panas Surya Asahimas",
        "hardware": "Bracket Siku Jangkar Baja 8mm Hot-Dip Galvanized & Baut Grade 8.8",
        "sealant": "Dow Corning Structural Glazing Silicone Sealant",
        "volume": "Luas Fasad Kaca 120 m² (Bentang 3 Lantai)",
        "solusi": "Pemasangan back mullion yang dijangkar ke balok tepi lantai dengan joint expansion fleksibel untuk mengantisipasi gempa mikro dan pergerakan termal gedung.",
        "durasi": "14 Hari Kerja",
        "garansi": "60 Bulan Garansi Struktural & Kebocoran"
      },
      "specs": {
        "kusen": "Back Mullion Aluminium 150×50mm Tebal 2.0mm Heavy Duty",
        "finishing": "Anodized Dark Brown 20 Micron Kualitas Gedung Tinggi",
        "kaca": "Kaca Panasap Green Tinted 6mm Anti Panas Surya Asahimas",
        "hardware": "Bracket Siku Jangkar Baja 8mm Hot-Dip Galvanized & Baut Grade 8.8",
        "sealant": "Dow Corning Structural Glazing Silicone Sealant",
        "volume": "Luas Fasad Kaca 120 m² (Bentang 3 Lantai)",
        "solusi": "Pemasangan back mullion yang dijangkar ke balok tepi lantai dengan joint expansion fleksibel untuk mengantisipasi gempa mikro dan pergerakan termal gedung.",
        "durasi": "14 Hari Kerja",
        "garansi": "60 Bulan Garansi Struktural & Kebocoran"
      },
      "testimonialId": "testi-10",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Konstruksi Curtain Wall Gedung Komersial"
    },
    {
      "id": "proj-18",
      "slug": "pintu-kaca-sliding-otomatis-sensor-kosambi",
      "title": "Pintu Kaca Sliding Otomatis Sensor Gerak Minimarket & Apotek",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Kosambi Klari Karawang",
      "loc": "Kosambi Klari Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu kaca sliding otomatis sensor gerak apotek Kosambi Klari",
      "imageIds": [
        "img-proj-18-cover"
      ],
      "description": "Instalasi pintu geser otomatis kaca tempered tanpa sentuh untuk pintu masuk apotek modern dan minimarket, mendukung kenyamanan pengunjung dan efisiensi AC ruangan.",
      "desc": "Instalasi pintu geser otomatis kaca tempered tanpa sentuh untuk pintu masuk apotek modern dan minimarket, mendukung kenyamanan pengunjung dan efisiensi AC ruangan.",
      "specifications": {
        "kusen": "Cover Box Aluminium Slimline Header Otomatis 12cm",
        "finishing": "Natural Anodized Silver Hairline",
        "kaca": "Tempered Glass Clear 10mm SNI Asahimas Flat Edges",
        "hardware": "Drive Motor DC Brushless, Microcontroller Controller & 2 Radar Microwave",
        "sealant": "Karet Lis Mohair Peredam Kebocoran AC",
        "volume": "2 Daun Bi-Parting (Opening Bersih Lebar 1.8m × Tinggi 2.2m)",
        "solusi": "Sistem safety beam sensor di ketinggian 40cm mencegah pintu menjepit pengunjung atau anak kecil yang sedang melintas di tengah opening.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Motor & Sensor"
      },
      "specs": {
        "kusen": "Cover Box Aluminium Slimline Header Otomatis 12cm",
        "finishing": "Natural Anodized Silver Hairline",
        "kaca": "Tempered Glass Clear 10mm SNI Asahimas Flat Edges",
        "hardware": "Drive Motor DC Brushless, Microcontroller Controller & 2 Radar Microwave",
        "sealant": "Karet Lis Mohair Peredam Kebocoran AC",
        "volume": "2 Daun Bi-Parting (Opening Bersih Lebar 1.8m × Tinggi 2.2m)",
        "solusi": "Sistem safety beam sensor di ketinggian 40cm mencegah pintu menjepit pengunjung atau anak kecil yang sedang melintas di tengah opening.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Motor & Sensor"
      },
      "testimonialId": "testi-04",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Sistem Pintu Otomatis Sensor Komersial"
    },
    {
      "id": "proj-19",
      "slug": "pintu-lipat-bifold-6-daun-kota-bukit-indah",
      "title": "Pintu Lipat (Bifold) Aluminium 6 Daun Ruang Serbaguna & Garasi",
      "serviceId": "aluminium-bifold",
      "rabConfigId": "rab-bifold",
      "calcServiceKey": "bifold",
      "location": "Kota Bukit Indah Purwakarta",
      "loc": "Kota Bukit Indah Purwakarta",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu lipat bifold aluminium 6 daun Kota Bukit Indah Purwakarta",
      "imageIds": [
        "img-proj-19-cover"
      ],
      "description": "Penyekat fleksibel aula serbaguna yang dapat dilipat ke sisi kiri dan kanan, membuka akses lapang tanpa tiang tengah saat ada acara keluarga besar.",
      "desc": "Penyekat fleksibel aula serbaguna yang dapat dilipat ke sisi kiri dan kanan, membuka akses lapang tanpa tiang tengah saat ada acara keluarga besar.",
      "specifications": {
        "kusen": "Alexindo Heavy Duty Bifold 4 Inch Ketebalan 1.35mm",
        "finishing": "Powder Coating Matte Grey Charcoal",
        "kaca": "Kaca Tempered Clear 8mm SNI Safety Glazing",
        "hardware": "Top Hanging Track SUS304 Kapasitas 250kg & Engsel Lipat Stainless",
        "sealant": "Santoprene Double Gasket Seal Kedap Suara",
        "volume": "6 Daun Lipat (Lebar Bukaan 5.4m × Tinggi 2.6m)",
        "solusi": "Sistem rel gantung suspensi dengan penahan beban di balok atas beton, tidak membebani lantai dasar dan roda berputar whisper-quiet.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Garansi Sistem Lipat"
      },
      "specs": {
        "kusen": "Alexindo Heavy Duty Bifold 4 Inch Ketebalan 1.35mm",
        "finishing": "Powder Coating Matte Grey Charcoal",
        "kaca": "Kaca Tempered Clear 8mm SNI Safety Glazing",
        "hardware": "Top Hanging Track SUS304 Kapasitas 250kg & Engsel Lipat Stainless",
        "sealant": "Santoprene Double Gasket Seal Kedap Suara",
        "volume": "6 Daun Lipat (Lebar Bukaan 5.4m × Tinggi 2.6m)",
        "solusi": "Sistem rel gantung suspensi dengan penahan beban di balok atas beton, tidak membebani lantai dasar dan roda berputar whisper-quiet.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Garansi Sistem Lipat"
      },
      "testimonialId": "testi-06",
      "articleUrl": "artikel/desain-pintu-lipat-aluminium-bifold-minimalis.html",
      "articleTitle": "Aplikasi Pintu Bifold Lebar Garasi & Aula"
    },
    {
      "id": "proj-20",
      "slug": "partisi-kaca-akustik-double-glass-giic-cikarang",
      "title": "Partisi Kaca Akustik Double Glass & Louver Blinds Ruang Direksi",
      "serviceId": "aluminium-partition",
      "rabConfigId": "rab-partition",
      "calcServiceKey": "partisi",
      "location": "GIIC Cikarang Pusat",
      "loc": "GIIC Cikarang Pusat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Partisi kaca akustik double glass GIIC Cikarang Pusat",
      "imageIds": [
        "img-proj-20-cover"
      ],
      "description": "Ruang kerja direksi pabrik GIIC dengan partisi kaca ganda kedap suara tinggi dan tirai venetian blinds magnetik di dalam rongga kaca.",
      "desc": "Ruang kerja direksi pabrik GIIC dengan partisi kaca ganda kedap suara tinggi dan tirai venetian blinds magnetik di dalam rongga kaca.",
      "specifications": {
        "kusen": "Aluminium Akustik Profil 4 Inch Tebal 1.4mm",
        "finishing": "Anodized Black Matte 20 Micron",
        "kaca": "Double Glass Unit (Tempered 6mm + Rongga Udara 12mm + Tempered 6mm)",
        "hardware": "Magnetic Slider Pengontrol Tirai Venetian & Mortise Lockset Dekson",
        "sealant": "Butyl Sealant + Desiccant Penyerap Kelembaban Rongga",
        "volume": "Luas 26 m² (Tinggi 3.0m × Panjang 8.6m)",
        "solusi": "Tirai venetian blinds terpasang di ruang hampa antar kaca sehingga tidak akan pernah kotor berdebu dan tidak membutuhkan pembersihan selamanya.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Resmi"
      },
      "specs": {
        "kusen": "Aluminium Akustik Profil 4 Inch Tebal 1.4mm",
        "finishing": "Anodized Black Matte 20 Micron",
        "kaca": "Double Glass Unit (Tempered 6mm + Rongga Udara 12mm + Tempered 6mm)",
        "hardware": "Magnetic Slider Pengontrol Tirai Venetian & Mortise Lockset Dekson",
        "sealant": "Butyl Sealant + Desiccant Penyerap Kelembaban Rongga",
        "volume": "Luas 26 m² (Tinggi 3.0m × Panjang 8.6m)",
        "solusi": "Tirai venetian blinds terpasang di ruang hampa antar kaca sehingga tidak akan pernah kotor berdebu dan tidak membutuhkan pembersihan selamanya.",
        "durasi": "4 Hari Kerja",
        "garansi": "24 Bulan Resmi"
      },
      "testimonialId": "testi-03",
      "articleUrl": "artikel/partisi-kaca-kantor-cleanroom-pabrik-industri.html",
      "articleTitle": "Teknologi Partisi Akustik Ruang Direksi"
    },
    {
      "id": "proj-21",
      "slug": "pintu-utama-pivot-oversized-resinda",
      "title": "Pintu Utama Pivot Oversized Jumbo Rangka Aluminium Minimalis",
      "serviceId": "tempered-door",
      "rabConfigId": "rab-tempered-door",
      "calcServiceKey": "pintu_tempered",
      "location": "Resinda Karawang Barat",
      "loc": "Resinda Karawang Barat",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu utama pivot oversized jumbo Resinda Karawang Barat",
      "imageIds": [
        "img-proj-21-cover"
      ],
      "description": "Pintu masuk utama rumah mewah dengan sistem engsel putar pivot lantai offset. Daun pintu berukuran besar memberi sambutan megah saat dibuka.",
      "desc": "Pintu masuk utama rumah mewah dengan sistem engsel putar pivot lantai offset. Daun pintu berukuran besar memberi sambutan megah saat dibuka.",
      "specifications": {
        "kusen": "Profil Kusen Aluminium Khusus Tebal 2.0mm Reinforced Steel Inside",
        "finishing": "Powder Coating AkzoNobel Sand Black Metallic",
        "kaca": "Kaca Tempered Grey Fluted 10mm Paduan Plat Spandrel Motif Kayu",
        "hardware": "Heavy Duty Floor Pivot Hinge Dekkson 200kg + Smart Digital Door Lock",
        "sealant": "Perimeter EPDM Seal Kedap Udara & Air Hujan",
        "volume": "1 Daun Jumbo (Lebar 1.4m × Tinggi 2.8m)",
        "solusi": "Titik tumpu engsel pivot berjarak 20cm dari tepi kusen memungkinkan daun pintu seberat 110 kg dapat didorong ringan hanya dengan satu jari.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Pivot"
      },
      "specs": {
        "kusen": "Profil Kusen Aluminium Khusus Tebal 2.0mm Reinforced Steel Inside",
        "finishing": "Powder Coating AkzoNobel Sand Black Metallic",
        "kaca": "Kaca Tempered Grey Fluted 10mm Paduan Plat Spandrel Motif Kayu",
        "hardware": "Heavy Duty Floor Pivot Hinge Dekkson 200kg + Smart Digital Door Lock",
        "sealant": "Perimeter EPDM Seal Kedap Udara & Air Hujan",
        "volume": "1 Daun Jumbo (Lebar 1.4m × Tinggi 2.8m)",
        "solusi": "Titik tumpu engsel pivot berjarak 20cm dari tepi kusen memungkinkan daun pintu seberat 110 kg dapat didorong ringan hanya dengan satu jari.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Garansi Mesin Pivot"
      },
      "testimonialId": "testi-01",
      "articleUrl": "artikel/tips-memilih-kaca-tempered-dan-laminated-aman.html",
      "articleTitle": "Desain Pintu Pivot Modern Rumah Mewah"
    },
    {
      "id": "proj-22",
      "slug": "kanopi-kaca-teras-kolam-renang-galuh-mas",
      "title": "Kanopi Kaca Tempered Laminated Teras Kolam Renang Cantilever",
      "serviceId": "glass-canopy",
      "rabConfigId": "rab-canopy",
      "calcServiceKey": "kanopi",
      "location": "Galuh Mas Karawang",
      "loc": "Galuh Mas Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Kanopi kaca kolam renang cantilever Galuh Mas Karawang",
      "imageIds": [
        "img-proj-22-cover"
      ],
      "description": "Kanopi kaca bening santai tepi kolam renang dengan sistem gantung kabel sling baja stainless SUS304 (cantilever) tanpa tiang penyangga di pinggir kolam.",
      "desc": "Kanopi kaca bening santai tepi kolam renang dengan sistem gantung kabel sling baja stainless SUS304 (cantilever) tanpa tiang penyangga di pinggir kolam.",
      "specifications": {
        "kusen": "Struktur Balok Baja WF 150 & Kabel Sling Baja Stainless SUS304 12mm",
        "finishing": "Cat Dasar Epoxy Marine Grade + PU Top Coat Putih Cerah",
        "kaca": "Tempered Laminated 5+5mm PVB Tinted Light Blue",
        "hardware": "Turnbuckle Jarum Keras SUS304 & Spider Fitting 2 Arah",
        "sealant": "Dowsil Neutral Structural Silicone",
        "volume": "Luas 18 m² (Panjang 6m × Overhang Maju 3m)",
        "solusi": "Sistem tarikan kabel sling baja SUS304 dari atas kolom beton menahan beban angin angkat (uplift wind load) dan bebas tiang bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktur & Sealant"
      },
      "specs": {
        "kusen": "Struktur Balok Baja WF 150 & Kabel Sling Baja Stainless SUS304 12mm",
        "finishing": "Cat Dasar Epoxy Marine Grade + PU Top Coat Putih Cerah",
        "kaca": "Tempered Laminated 5+5mm PVB Tinted Light Blue",
        "hardware": "Turnbuckle Jarum Keras SUS304 & Spider Fitting 2 Arah",
        "sealant": "Dowsil Neutral Structural Silicone",
        "volume": "Luas 18 m² (Panjang 6m × Overhang Maju 3m)",
        "solusi": "Sistem tarikan kabel sling baja SUS304 dari atas kolom beton menahan beban angin angkat (uplift wind load) dan bebas tiang bawah.",
        "durasi": "3 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktur & Sealant"
      },
      "testimonialId": "testi-05",
      "articleUrl": "artikel/tips-memilih-kanopi-kaca-tempered-carport.html",
      "articleTitle": "Konstruksi Kanopi Kaca Kolam Renang"
    },
    {
      "id": "proj-23",
      "slug": "etalase-kaca-toko-emas-pasar-johar",
      "title": "Etalase Kaca Aluminium & Rak Display Toko Perhiasan Emas",
      "serviceId": "aluminium-showcase",
      "rabConfigId": "rab-showcase",
      "calcServiceKey": "etalase",
      "location": "Pasar Johar Karawang",
      "loc": "Pasar Johar Karawang",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Etalase kaca display perhiasan emas Pasar Johar Karawang",
      "imageIds": [
        "img-proj-23-cover"
      ],
      "description": "Pembuatan counter etalase perhiasan emas full kaca tempered dengan pencahayaan warm white LED strip tersembunyi dan sistem penguncian keamanan ganda.",
      "desc": "Pembuatan counter etalase perhiasan emas full kaca tempered dengan pencahayaan warm white LED strip tersembunyi dan sistem penguncian keamanan ganda.",
      "specifications": {
        "kusen": "Profil Aluminium Khusus Etalase Mewah Chamfered Edge",
        "finishing": "Anodized Mirror Black Glossy",
        "kaca": "Kaca Tempered Clear 8mm Extra Clear (Low Iron) Bebas Kehijauan",
        "hardware": "Roda Rel Tanam Halus, Kunci Sentral Huben & Bracket Rak SUS304",
        "sealant": "Clear UV-Curing Glue & Silicone Sanitasi",
        "volume": "Set Counter Display (Panjang Total 6 Meter)",
        "solusi": "Menggunakan kaca low-iron ekstra jernih agar kilau perhiasan emas dan berlian terlihat 100% akurat tanpa bias warna kehijauan kaca standar.",
        "durasi": "4 Hari Fabrikasi Workshop + Pasang",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Profil Aluminium Khusus Etalase Mewah Chamfered Edge",
        "finishing": "Anodized Mirror Black Glossy",
        "kaca": "Kaca Tempered Clear 8mm Extra Clear (Low Iron) Bebas Kehijauan",
        "hardware": "Roda Rel Tanam Halus, Kunci Sentral Huben & Bracket Rak SUS304",
        "sealant": "Clear UV-Curing Glue & Silicone Sanitasi",
        "volume": "Set Counter Display (Panjang Total 6 Meter)",
        "solusi": "Menggunakan kaca low-iron ekstra jernih agar kilau perhiasan emas dan berlian terlihat 100% akurat tanpa bias warna kehijauan kaca standar.",
        "durasi": "4 Hari Fabrikasi Workshop + Pasang",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-11",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Desain Etalase Display Komersial"
    },
    {
      "id": "proj-24",
      "slug": "jendela-pivot-vertikal-grand-wisata",
      "title": "Jendela Pivot Aluminium Vertikal Putar 180° Ruang Tangga",
      "serviceId": "aluminium-window",
      "rabConfigId": "rab-window",
      "calcServiceKey": "jendela",
      "location": "Grand Wisata Bekasi",
      "loc": "Grand Wisata Bekasi",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Jendela pivot vertikal putar 180 derajat Grand Wisata Bekasi",
      "imageIds": [
        "img-proj-24-cover"
      ],
      "description": "Jendela aksen arsitektural void tangga yang dapat diputar 180 derajat untuk memudahkan pembersihan kaca sisi luar dari dalam rumah.",
      "desc": "Jendela aksen arsitektural void tangga yang dapat diputar 180 derajat untuk memudahkan pembersihan kaca sisi luar dari dalam rumah.",
      "specifications": {
        "kusen": "Alexindo 4 Inch Heavy Profile Siku Presisi",
        "finishing": "Powder Coating Matte Black",
        "kaca": "Tempered Glass 8mm Clear SNI Asahimas",
        "hardware": "Engsel Pivot Vertikal Heavy Duty Stainless Steel SUS304 90kg",
        "sealant": "EPDM Double Compression Bulb Gasket",
        "volume": "2 Unit Jendela Tinggi (L 80cm × T 240cm)",
        "solusi": "Sistem stopper multi-posisi memungkinkan jendela terkunci aman pada sudut bukaan 30° untuk sirkulasi angin tanpa risiko terbanting angin badai.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Resmi Garansi Engsel"
      },
      "specs": {
        "kusen": "Alexindo 4 Inch Heavy Profile Siku Presisi",
        "finishing": "Powder Coating Matte Black",
        "kaca": "Tempered Glass 8mm Clear SNI Asahimas",
        "hardware": "Engsel Pivot Vertikal Heavy Duty Stainless Steel SUS304 90kg",
        "sealant": "EPDM Double Compression Bulb Gasket",
        "volume": "2 Unit Jendela Tinggi (L 80cm × T 240cm)",
        "solusi": "Sistem stopper multi-posisi memungkinkan jendela terkunci aman pada sudut bukaan 30° untuk sirkulasi angin tanpa risiko terbanting angin badai.",
        "durasi": "2 Hari Kerja",
        "garansi": "24 Bulan Resmi Garansi Engsel"
      },
      "testimonialId": "testi-12",
      "articleUrl": "artikel/tips-merawat-kusen-aluminium-tetap-mengkilap.html",
      "articleTitle": "Jendela Pivot Putar Desain Modern"
    },
    {
      "id": "proj-25",
      "slug": "pintu-sliding-barn-door-cikampek",
      "title": "Pintu Sliding Model Barn Door Industrial Kisi Kotak Hitam",
      "serviceId": "aluminium-door",
      "rabConfigId": "rab-door",
      "calcServiceKey": "pintu",
      "location": "Villa Permata Cikampek",
      "loc": "Villa Permata Cikampek",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Pintu sliding barn door industrial kisi hitam Cikampek",
      "imageIds": [
        "img-proj-25-cover"
      ],
      "description": "Pintu geser gaya industrial modern dengan lis kisi kotak aluminium hitam (french door style) untuk pemisah ruang kerja di rumah tinggal.",
      "desc": "Pintu geser gaya industrial modern dengan lis kisi kotak aluminium hitam (french door style) untuk pemisah ruang kerja di rumah tinggal.",
      "specifications": {
        "kusen": "Inkalum Slim Grid Profile Black Doff",
        "finishing": "Powder Coating Black Doff Sand Texture",
        "kaca": "Kaca Clear Polos 5mm dengan Lis Ornamen Aluminium Tempel Presisi",
        "hardware": "Roda Rel Gantung Exposed Track SUS304 & Handle Pipa Industrial 40cm",
        "sealant": "Karet Lis Gasket Rapi Tanpa Noda Lem",
        "volume": "1 Unit Barn Door (L 100cm × T 220cm)",
        "solusi": "Roda gantung exposed industrial berbahan nilon karbon anti berisik saat digeser, memberi karakter visual kuat pada interior ruang.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "specs": {
        "kusen": "Inkalum Slim Grid Profile Black Doff",
        "finishing": "Powder Coating Black Doff Sand Texture",
        "kaca": "Kaca Clear Polos 5mm dengan Lis Ornamen Aluminium Tempel Presisi",
        "hardware": "Roda Rel Gantung Exposed Track SUS304 & Handle Pipa Industrial 40cm",
        "sealant": "Karet Lis Gasket Rapi Tanpa Noda Lem",
        "volume": "1 Unit Barn Door (L 100cm × T 220cm)",
        "solusi": "Roda gantung exposed industrial berbahan nilon karbon anti berisik saat digeser, memberi karakter visual kuat pada interior ruang.",
        "durasi": "1 Hari Kerja On-Site",
        "garansi": "12 Bulan Resmi"
      },
      "testimonialId": "testi-02",
      "articleUrl": "artikel/rekomendasi-pintu-sliding-geser-minimalis.html",
      "articleTitle": "Inspirasi Pintu Barn Door Industrial Aluminium"
    },
    {
      "id": "proj-26",
      "slug": "railing-balkon-u-channel-subang",
      "title": "Railing Balkon Kaca Tempered U-Channel Aluminium Tanam (Base Shoe)",
      "serviceId": "glass-railing",
      "rabConfigId": "rab-railing",
      "calcServiceKey": "railing",
      "location": "Subang Smart City",
      "loc": "Subang Smart City",
      "status": "✓ Selesai & Bergaransi",
      "hasVerifiedPhoto": false,
      "image": null,
      "imageAlt": "Railing balkon kaca tempered u-channel tanam Subang Smart City",
      "imageIds": [
        "img-proj-26-cover"
      ],
      "description": "Pagar balkon kaca tampilan bersih total tanpa tiang ataupun spigot bawah. Profil U-channel struktural ditanam rata permukaan keramik teras lantai 2.",
      "desc": "Pagar balkon kaca tampilan bersih total tanpa tiang ataupun spigot bawah. Profil U-channel struktural ditanam rata permukaan keramik teras lantai 2.",
      "specifications": {
        "kusen": "Base Shoe U-Channel Aluminium Ekstrusi Heavy Duty 120×70mm Tanam",
        "finishing": "Cover Cladding Stainless Steel Hairline SUS304 Rata Lantai",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 1.52mm Extra Safety Glass",
        "hardware": "Chemical Anchor Hilti HIT-RE 500 V3 & Baji Pengunci Kaca Presisi",
        "sealant": "Epoxy Grout Struktural + Sealant Non-Sagging Tahan Cuaca",
        "volume": "Panjang 14 Meter Lari Balkon Utama",
        "solusi": "Pemasangan profil U-channel sebelum pengecoran screed keramik lantai balkon menghasilkan pemandangan lanskap tanpa batas (infinity view).",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktural"
      },
      "specs": {
        "kusen": "Base Shoe U-Channel Aluminium Ekstrusi Heavy Duty 120×70mm Tanam",
        "finishing": "Cover Cladding Stainless Steel Hairline SUS304 Rata Lantai",
        "kaca": "Kaca Tempered Laminated 6+6mm PVB 1.52mm Extra Safety Glass",
        "hardware": "Chemical Anchor Hilti HIT-RE 500 V3 & Baji Pengunci Kaca Presisi",
        "sealant": "Epoxy Grout Struktural + Sealant Non-Sagging Tahan Cuaca",
        "volume": "Panjang 14 Meter Lari Balkon Utama",
        "solusi": "Pemasangan profil U-channel sebelum pengecoran screed keramik lantai balkon menghasilkan pemandangan lanskap tanpa batas (infinity view).",
        "durasi": "4 Hari Kerja",
        "garansi": "36 Bulan Garansi Struktural"
      },
      "testimonialId": "testi-07",
      "articleUrl": "artikel/desain-railing-balkon-tangga-kaca-frameless.html",
      "articleTitle": "Pemasangan Railing Balkon Kaca Base Shoe Tanam Rata Lantai"
    }
  ],
  "images": [
    {
      "id": "img-proj-02-cover",
      "imageId": "img-proj-02-cover",
      "projectId": "proj-02",
      "url": "assets/gallery/pintu-kaca.jpg",
      "src": "assets/gallery/pintu-kaca.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu kaca tempered frameless floor hinge toko Ruko Galuh Mas Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-08-cover",
      "imageId": "img-proj-08-cover",
      "projectId": "proj-08",
      "url": "assets/gallery/jendela-aluminium.jpg",
      "src": "assets/gallery/jendela-aluminium.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Jendela aluminium jungkit casement kedap suara Telukjambe Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-09-cover",
      "imageId": "img-proj-09-cover",
      "projectId": "proj-09",
      "url": "assets/gallery/shower-kaca.jpg",
      "src": "assets/gallery/shower-kaca.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Shower screen kaca frameless tempered 10mm Grand Wisata Bekasi",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-10-cover",
      "imageId": "img-proj-10-cover",
      "projectId": "proj-10",
      "url": "assets/gallery/pintu-kamar-mandi.jpg",
      "src": "assets/gallery/pintu-kamar-mandi.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu aluminium kamar mandi kaca sandblast buram Klari Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-14-cover",
      "imageId": "img-proj-14-cover",
      "projectId": "proj-14",
      "url": "assets/gallery/pintu-aluminium.jpg",
      "src": "assets/gallery/pintu-aluminium.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu aluminium swing panel spandrel full Cikampek Karawang",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-16-cover",
      "imageId": "img-proj-16-cover",
      "projectId": "proj-16",
      "url": "assets/gallery/pintu-kaca-putih.jpg",
      "src": "assets/gallery/pintu-kaca-putih.jpg",
      "type": "photo",
      "role": "cover",
      "alt": "Pintu kaca aluminium frame putih scandinavian Harapan Indah Bekasi",
      "verified": true,
      "status": "VERIFIED"
    },
    {
      "id": "img-proj-01-cover",
      "imageId": "img-proj-01-cover",
      "projectId": "proj-01",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca aluminium ruang rapat kantor industri KIIC Karawang Barat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-03-cover",
      "imageId": "img-proj-03-cover",
      "projectId": "proj-03",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu sliding aluminium kaca akses taman Grand Taruma Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-04-cover",
      "imageId": "img-proj-04-cover",
      "projectId": "proj-04",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu lipat bifold aluminium 4 daun Summarecon Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-05-cover",
      "imageId": "img-proj-05-cover",
      "projectId": "proj-05",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Sekat partisi kaca dapur moru glass Galuh Mas Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-06-cover",
      "imageId": "img-proj-06-cover",
      "projectId": "proj-06",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Fasad ACP Seven dan pintu otomatis sensor Jababeka Cikarang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-07-cover",
      "imageId": "img-proj-07-cover",
      "projectId": "proj-07",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Kanopi kaca tempered laminated carport Summarecon Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-11-cover",
      "imageId": "img-proj-11-cover",
      "projectId": "proj-11",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Railing kaca tempered 12mm spigot Grand Taruma Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-12-cover",
      "imageId": "img-proj-12-cover",
      "projectId": "proj-12",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca cleanroom pabrik Suryacipta Ciampel Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-13-cover",
      "imageId": "img-proj-13-cover",
      "projectId": "proj-13",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Jendela sliding geser 4 daun Cikarang Baru Jababeka",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-15-cover",
      "imageId": "img-proj-15-cover",
      "projectId": "proj-15",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Skylight atap kaca tempered void tangga Purwakarta Kota",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-17-cover",
      "imageId": "img-proj-17-cover",
      "projectId": "proj-17",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Curtain wall fasad kaca ruko gedung 3 lantai Subang Smartpolitan",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-18-cover",
      "imageId": "img-proj-18-cover",
      "projectId": "proj-18",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu kaca sliding otomatis sensor gerak apotek Kosambi Klari",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-19-cover",
      "imageId": "img-proj-19-cover",
      "projectId": "proj-19",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu lipat bifold aluminium 6 daun Kota Bukit Indah Purwakarta",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-20-cover",
      "imageId": "img-proj-20-cover",
      "projectId": "proj-20",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Partisi kaca akustik double glass GIIC Cikarang Pusat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-21-cover",
      "imageId": "img-proj-21-cover",
      "projectId": "proj-21",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu utama pivot oversized jumbo Resinda Karawang Barat",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-22-cover",
      "imageId": "img-proj-22-cover",
      "projectId": "proj-22",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Kanopi kaca kolam renang cantilever Galuh Mas Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-23-cover",
      "imageId": "img-proj-23-cover",
      "projectId": "proj-23",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Etalase kaca display perhiasan emas Pasar Johar Karawang",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-24-cover",
      "imageId": "img-proj-24-cover",
      "projectId": "proj-24",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Jendela pivot vertikal putar 180 derajat Grand Wisata Bekasi",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-25-cover",
      "imageId": "img-proj-25-cover",
      "projectId": "proj-25",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Pintu sliding barn door industrial kisi hitam Cikampek",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    },
    {
      "id": "img-proj-26-cover",
      "imageId": "img-proj-26-cover",
      "projectId": "proj-26",
      "url": null,
      "src": null,
      "type": "none",
      "role": "cover",
      "alt": "Railing balkon kaca tempered u-channel tanam Subang Smart City",
      "verified": false,
      "status": "NO_VALID_IMAGE"
    }
  ],
  "testimonials": [
    {
      "testimonialId": "testi-01",
      "projectId": "proj-02",
      "serviceId": "tempered-door",
      "location": "Ruko Galuh Mas, Karawang Barat",
      "author": "Bpk. Hendra Gunawan",
      "role": "Owner Ruko Galuh Mas, Karawang Barat",
      "quote": "Pengerjaan pintu kaca tempered frameless dan partisi sekat toko ruko kami di Galuh Mas sangat presisi dan tepat waktu. Mesin floor hinge Dekkson empuk dan aksesoris stainless 304 sangat kokoh.",
      "rating": 5,
      "date": "2026-01-14"
    },
    {
      "testimonialId": "testi-02",
      "projectId": "proj-03",
      "serviceId": "aluminium-door",
      "location": "Perumahan Grand Taruma, Karawang",
      "author": "Ibu Ratna Dewi",
      "role": "Perumahan Grand Taruma, Karawang",
      "quote": "Teknisi Sahabat Kaca sangat profesional membawa sampel profil Alexindo dan Inkalum saat survey gratis. Pintu sliding aluminium 3 daun taman belakang kami geserannya sangat halus dan kedap air hujan.",
      "rating": 5,
      "date": "2026-01-28"
    },
    {
      "testimonialId": "testi-03",
      "projectId": "proj-01",
      "serviceId": "aluminium-partition",
      "location": "KIIC Karawang Barat",
      "author": "Bpk. Agus Prasetyo",
      "role": "Facility Manager Pabrik, KIIC Karawang",
      "quote": "Standar industri yang sangat rapi. Pemasangan partisi sekat ruang meeting kantor pabrik kami di KIIC selesai sesuai standar K3, sambungan profil miter rapat, dan ruangan langsung kedap suara.",
      "rating": 5,
      "date": "2026-02-05"
    },
    {
      "testimonialId": "testi-04",
      "projectId": "proj-18",
      "serviceId": "tempered-door",
      "location": "Telukjambe Timur, Karawang",
      "author": "dr. Sinta Maharani",
      "role": "Klinik Pratama Medika, Telukjambe Timur",
      "quote": "Pemasangan pintu sliding kaca otomatis untuk klinik kami hasilnya sangat bersih dan higienis. Sensor gerak responsif dan buka-tutup sangat hening, pasien merasa sangat nyaman.",
      "rating": 5,
      "date": "2026-02-12"
    },
    {
      "testimonialId": "testi-05",
      "projectId": "proj-07",
      "serviceId": "glass-canopy",
      "location": "Summarecon Bekasi",
      "author": "Bpk. Dedi Kurniawan",
      "role": "Residensial Summarecon Bekasi",
      "quote": "Kanopi kaca tempered laminated untuk carport depan rumah sangat kokoh. Rangka pipa hollow galvanis dicat primer epoxy tebal dan sealant silikon Dowsil 795 rapi tanpa rembes hujan lebat.",
      "rating": 5,
      "date": "2026-02-20"
    },
    {
      "testimonialId": "testi-06",
      "projectId": "proj-04",
      "serviceId": "aluminium-bifold",
      "location": "Summarecon Bekasi",
      "author": "Ibu Maya Angelina",
      "role": "Owner Cafe & Eatery, Bekasi",
      "quote": "Pintu lipat bifold 4 daun untuk area semi-outdoor kafe kami sangat fungsional dan estetik. Bukaan 100% membuat sirkulasi udara lega dan harga transparan bersahabat.",
      "rating": 5,
      "date": "2026-03-02"
    },
    {
      "testimonialId": "testi-07",
      "projectId": "proj-11",
      "serviceId": "glass-railing",
      "location": "Grand Taruma Karawang",
      "author": "Bpk. Ir. Bambang Sugiarto",
      "role": "Pemilik Hunian Grand Taruma Karawang",
      "quote": "Instalasi railing tangga & balkon kaca tempered 12mm dengan klem spigot solid stainless SUS304 sangat kokoh. Dibor inti ke beton lantai balok, tidak goyang dan ruangan terlihat jauh lebih luas.",
      "rating": 5,
      "date": "2026-03-10"
    },
    {
      "testimonialId": "testi-08",
      "projectId": "proj-09",
      "serviceId": "shower-glass",
      "location": "Grand Wisata Bekasi",
      "author": "Ibu Cindy Claudia",
      "role": "Residensial Grand Wisata Bekasi",
      "quote": "Pemasangan shower screen kaca frameless 10mm kamar mandi utama hasilnya sangat rapi. Engsel kuningan lapis krom awet tahan lembab dan magnet door seal benar-benar kedap cipratan air.",
      "rating": 5,
      "date": "2026-03-15"
    },
    {
      "testimonialId": "testi-09",
      "projectId": "proj-06",
      "serviceId": "acp-facade",
      "location": "Jababeka Cikarang",
      "author": "Bpk. Wisnu Wardhana",
      "role": "Kontraktor Showroom Komersial Jababeka",
      "quote": "Fasad ACP Seven eksterior gedung showroom sangat presisi. Nat sealant silikon lurus rapi dan rangka hollow galvanis anti karat sangat kokoh menahan cuaca panas hujan.",
      "rating": 5,
      "date": "2026-03-22"
    },
    {
      "testimonialId": "testi-10",
      "projectId": "proj-17",
      "serviceId": "curtain-wall",
      "location": "Subang Smartpolitan",
      "author": "Bpk. Gunawan Wibisono",
      "role": "Project Manager Ruko Subang",
      "quote": "Curtain wall stick system kaca Panasap 6mm fasad gedung kantor 3 lantai selesai sesuai target schedule. Penolakan panas matahari efektif dan tampilan gedung terlihat megah berkelas.",
      "rating": 5,
      "date": "2026-03-29"
    },
    {
      "testimonialId": "testi-11",
      "projectId": "proj-23",
      "serviceId": "aluminium-showcase",
      "location": "Pasar Johar Karawang",
      "author": "Ibu Linda Susanti",
      "role": "Owner Toko Perhiasan Emas Johar",
      "quote": "Etalase custom rangka aluminium anodize tebal dan kaca tempered clear 8mm dengan lampu LED strip tersembunyi. Display cincin dan kalung jadi berkilau indah, kunci pengaman sangat mantap.",
      "rating": 5,
      "date": "2026-04-01"
    },
    {
      "testimonialId": "testi-12",
      "projectId": "proj-08",
      "serviceId": "aluminium-window",
      "location": "Telukjambe Timur Karawang",
      "author": "Bpk. Ahmad Fauzi",
      "role": "Perumahan Telukjambe Timur Karawang",
      "quote": "Jendela casement aluminium kedap suara jalan raya sangat signifikan. Karet EPDM dan friction stay stainless Dekkson tebal menutup sangat rapat tanpa getaran.",
      "rating": 5,
      "date": "2026-04-03"
    },
    {
      "testimonialId": "testi-general-01",
      "projectId": null,
      "serviceId": "aluminium-profile",
      "location": "Klari, Karawang",
      "author": "Bpk. H. Rahmat",
      "role": "Pelanggan Residensial Karawang",
      "quote": "Pelayanan cepat dan transparan. Survey gratis ke rumah, tim ramah, dan estimasi biaya di web sama persis dengan tagihan akhir tanpa biaya siluman.",
      "rating": 5,
      "date": "2026-03-25"
    }
  ]
};

// Attach catalog lookup helpers
window.PROJECT_CATALOG.getProjectById = function(id) {
  return (window.PROJECT_CATALOG.projects || []).find(p => p.id === id) || null;
};
window.PROJECT_CATALOG.getServiceById = function(id) {
  return (window.PROJECT_CATALOG.services || []).find(s => s.id === id || s.calcKey === id) || null;
};
window.PROJECT_CATALOG.getImageById = function(id) {
  return (window.PROJECT_CATALOG.images || []).find(img => img.id === id || img.imageId === id) || null;
};
window.PROJECT_CATALOG.getTestimonialsByProjectId = function(projectId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.projectId === projectId);
};
window.PROJECT_CATALOG.getTestimonialsByServiceId = function(serviceId) {
  return (window.PROJECT_CATALOG.testimonials || []).filter(t => t.serviceId === serviceId);
};
window.PROJECT_CATALOG.getVerifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getUnverifiedProjects = function() {
  return (window.PROJECT_CATALOG.projects || []).filter(p => !p.hasVerifiedPhoto);
};
window.PROJECT_CATALOG.getMasterStats = function() {
  return {
    totalProjects: window.PROJECT_CATALOG.TOTAL_PROJECTS || 26,
    verifiedProjectsCount: window.PROJECT_CATALOG.VERIFIED_PROJECTS_COUNT || 6,
    unverifiedProjectsCount: window.PROJECT_CATALOG.UNVERIFIED_PROJECTS_COUNT || 20,
    totalServices: window.PROJECT_CATALOG.TOTAL_SERVICES || 12,
    totalTestimonials: window.PROJECT_CATALOG.TOTAL_TESTIMONIALS || 13
  };
};

// Global shortcuts for window
window.getProjectById = window.PROJECT_CATALOG.getProjectById;
window.getServiceById = window.PROJECT_CATALOG.getServiceById;

// Master Pricing Configuration Object
/* ==============================================================================
 * SERVICE_MASTER (Single Source of Truth for Services, Cards & Detail Pages)
 * Centralized registry of all 12 services with id, name, slug, priceMin, specifications, models
 * ============================================================================== */
const SERVICE_MASTER = {
  services: [
  {
    "id": "kusen-aluminium",
    "name": "Kusen Aluminium",
    "slug": "kusen-aluminium",
    "calcKey": "kusen",
    "title": "Jasa Pasang Kusen Aluminium Karawang Profil 3\" & 4\" SNI",
    "order": 1,
    "category": "aluminium",
    "priceMin": 212500,
    "priceMax": 412500,
    "priceStarting": "Mulai Rp 212.500 / m1",
    "priceRange": "Rp 212.500 – Rp 412.500 / m1",
    "unit": "m1",
    "unitName": "Meter Lari (m1)",
    "warranty": "18 Bulan Resmi",
    "badge": "Profil 3\" & 4\" SNI",
    "description": "Fabrikasi dan pemasangan kusen aluminium presisi standar SNI untuk rumah tinggal, ruko, gedung perkantoran, dan pabrik industri di Karawang. Menggunakan profil aluminium pilihan Alexindo, Inkalum, dan Dacon dengan potongan sudut miter 45 derajat dobel spigot anti renggang dan karet EPDM kedap cuaca.",
    "summary": "Pembuatan & pasang kusen jendela, pintu profil 3 & 4 inch. Siku miter 45° presisi, anti rayap & lapuk seumur hidup.",
    "image": "assets/gallery/kusen-aluminium.jpg",
    "imageAlt": "Jasa Pasang Kusen Aluminium Karawang Profil Alexindo Inkalum Presisi",
    "galleryImages": [
      "assets/gallery/kusen-aluminium.jpg",
      "assets/gallery/jendela-aluminium.jpg",
      "assets/gallery/pintu-aluminium.jpg"
    ],
    "specifications": {
      "dimensi": "3 Inch (7.6x3.8cm) & 4 Inch (10.1x4.4cm)",
      "ketebalan": "1.0 mm s/d 1.35 mm Standar SNI",
      "warna": "Hitam Doff, Putih Powder Coating, Cokelat Anodized, Silver Natural, Serat Kayu",
      "sambungan": "Miter Joint 45° Potong Otomatis Double Blade + Kunci Spigot",
      "toleransi": "Presisi laser leveling ±1 mm on-site",
      "garansi": "Garansi kebocoran sudut 18 bulan"
    },
    "models": [
      {
        "name": "Kusen Profil 3 Inch (Standard)",
        "desc": "Ukuran 7.6 x 3.8 cm, sangat hemat tempat untuk kamar dan sekat rumah tinggal.",
        "rate": "Rp 212.500 – Rp 275.000 / m1"
      },
      {
        "name": "Kusen Profil 4 Inch (Heavy Duty)",
        "desc": "Ukuran 10.1 x 4.4 cm, kokoh dan gagah untuk pintu utama, ruko, fasad, dan bukaan tinggi.",
        "rate": "Rp 337.500 – Rp 412.500 / m1"
      },
      {
        "name": "Kusen Finishing Serat Kayu (Wood Grain)",
        "desc": "Tampilan alami urat kayu berpadu ketahanan aluminium anti rayap seumur hidup.",
        "rate": "Rp 362.500 – Rp 437.500 / m1"
      }
    ],
    "materials": [
      "Alexindo Tebal 1.15 - 1.35 mm (Premium Grade)",
      "Inkalum Tebal 1.0 - 1.15 mm (Standard SNI)",
      "Dacon Tebal 0.95 - 1.05 mm (Ekonomis Kuat)",
      "Karet Gasket Sintetis EPDM Tahan Panas & UV",
      "Sekrup Stainless SUS304 & Spigot Aluminium Solid"
    ],
    "faq": [
      {
        "q": "Apa perbedaan kusen aluminium 3 inch dan 4 inch?",
        "a": "Kusen 3 inch memiliki penampang 7.6 x 3.8 cm, cocok untuk kusen kamar tidur, jendela kamar, atau perumahan standar. Kusen 4 inch (10.1 x 4.4 cm) memiliki profil lebih lebar dan tebal, sangat ideal untuk pintu utama, pintu balkon, ruko, maupun gedung kantor."
      },
      {
        "q": "Apakah kusen aluminium bisa bocor tempias air hujan?",
        "a": "Tidak. Kami memotong profil dengan mesin otomatis sudut miter 45 derajat presisi, mengunci dengan spigot ganda di dalam profil, serta mengaplikasikan sealant elastis neutral weatherproof pada perimeter luar dan karet EPDM pada sisi kaca."
      }
    ]
  },
  {
    "id": "pintu-aluminium",
    "name": "Pintu Aluminium",
    "slug": "pintu-aluminium",
    "calcKey": "pintu",
    "title": "Jasa Pasang Pintu Aluminium Karawang (Sliding, Swing, Bifold)",
    "order": 2,
    "category": "aluminium",
    "priceMin": 5000000,
    "priceMax": 12500000,
    "priceStarting": "Mulai Rp 3.125.000 / unit",
    "priceRange": "Rp 3.125.000 – Rp 8.750.000+ / unit",
    "unit": "unit",
    "unitName": "Unit Pintu",
    "warranty": "24 Bulan Resmi",
    "badge": "Sliding • Swing • Bifold",
    "description": "Pemasangan pintu aluminium modern dengan berbagai pilihan sistem bukaan: sliding geser rel gantung senyap, swing satu daun maupun kupu tarung dua daun, hingga sistem pintu lipat bifold opening 100%. Didukung hardware Dekkson stainless SUS304 anti karat dan roda nilon heavy-duty tahan beban.",
    "summary": "Pintu sliding geser rel gantung, pintu swing kupu tarung, dan pintu lipat bifold taman belakang. Rel SUS304 anti anjlok.",
    "image": "assets/gallery/pintu-aluminium.jpg",
    "imageAlt": "Jasa Pasang Pintu Aluminium Karawang Model Sliding Swing Bifold",
    "galleryImages": [
      "assets/gallery/pintu-aluminium.jpg",
      "assets/gallery/pintu-sliding.jpg",
      "assets/gallery/pintu-kaca-putih.jpg"
    ],
    "specifications": {
      "dimensi": "Single: 80-90x210-240cm | Double: 160-180x210-240cm | Custom Survey",
      "ketebalan": "1.2 mm s/d 1.4 mm",
      "kaca": "Tempered 8mm, Clear 5mm, Rayban Hitam, Moru Glass, Spandrel Aluminium",
      "hardware": "Dekkson / Dorma / Hampton SUS304",
      "fitur": "Soft-closing damper, stopper rel gantung, anti-jump safety pin",
      "garansi": "Garansi aksesoris rel & kunci 24 bulan"
    },
    "models": [
      {
        "name": "Pintu Sliding Geser (1 - 4 Daun)",
        "desc": "Rel gantung atas tanpa rel bawah atau rel tanam stainless rata lantai.",
        "rate": "Rp 3.750.000 – Rp 6.250.000 / unit"
      },
      {
        "name": "Pintu Swing Kupu Tarung & Single",
        "desc": "Pintu bukaan ayun dengan lockset multi-point dan handle panjang modern.",
        "rate": "Rp 3.125.000 – Rp 5.000.000 / unit"
      },
      {
        "name": "Pintu Lipat Bifold (3 - 8 Daun)",
        "desc": "Bukaan maksimal 100% menghubungkan ruang keluarga dengan taman belakang.",
        "rate": "Rp 4.625.000 – Rp 6.000.000 / daun"
      }
    ],
    "materials": [
      "Profil Daun Pintu Aluminium Ekstrusi Lebar 8-10 cm Tebal 1.2-1.4 mm",
      "Kaca Tempered 8mm / Kaca Polos 5mm / Kaca Ribbed Moru / Panel Spandrel",
      "Roda Bearing Nilon Heavy-Duty Dekkson (Kapasitas 120 kg/daun)",
      "Rel Gantung / Rel Tanam Stainless Steel SUS304 Anti Aus",
      "Kunci Mortise Lockset Dekkson & Handle Tarik Stainless"
    ],
    "faq": [
      {
        "q": "Apakah pintu sliding aluminium mudah anjlok dari rel?",
        "a": "Tidak. Kami menggunakan sistem roda gantung heavy-duty nilon berbearing baja dengan pin pengaman anti-jump yang mengunci roda di dalam rel overhead tebal 2 mm."
      },
      {
        "q": "Apakah pintu lipat bifold bisa dipasang rata dengan lantai?",
        "a": "Bisa. Kami menyediakan opsi rel tanam (flush bottom track) stainless SUS304 setinggi permukaan keramik/lantai parket sehingga ramah anak dan lansia tanpa resiko tersandung."
      }
    ]
  },
  {
    "id": "jendela-aluminium",
    "name": "Jendela Aluminium",
    "slug": "jendela-aluminium",
    "calcKey": "jendela",
    "title": "Jasa Pasang Jendela Aluminium Karawang (Casement, Sliding, Jungkit)",
    "order": 3,
    "category": "aluminium",
    "priceMin": 2125000,
    "priceMax": 3500000,
    "priceStarting": "Mulai Rp 1.375.000 / daun",
    "priceRange": "Rp 1.375.000 – Rp 3.500.000 / daun",
    "unit": "m²",
    "unitName": "Meter Persegi (m²)",
    "warranty": "24 Bulan Resmi",
    "badge": "Casement • Sliding • Jungkit",
    "description": "Fabrikasi jendela aluminium modern tahan cuaca ekstrem dan kedap suara untuk hunian serta perkantoran di Karawang. Pilihan model casement buka samping yang rapat, jendela jungkit atas (awning) aman saat hujan gerimis, dan jendela sliding praktis hemat ruang.",
    "summary": "Jendela casement buka samping, sliding geser hemat ruang, dan jungkit awning. Kedap suara dan anti rembesan air hujan.",
    "image": "assets/gallery/jendela-aluminium.jpg",
    "imageAlt": "Jasa Pasang Jendela Aluminium Karawang Casement Sliding Jungkit",
    "galleryImages": [
      "assets/gallery/jendela-aluminium.jpg",
      "assets/gallery/jendela-sliding.jpg",
      "assets/gallery/jendela-kaca.jpg"
    ],
    "specifications": {
      "dimensi": "Casement: 60x120cm, 70x140cm | Sliding: 120x120cm, 160x140cm | Custom Survey",
      "ketebalan": "Kusen 1.15 mm, Daun Jendela 1.2 mm",
      "peredam": "Acoustic seal meredam kebisingan hingga STC 32 dB",
      "finishing": "Powder coating tahan cuaca atau anodized silver/brown",
      "drainage": "Sistem weep hole anti genangan air di rel",
      "garansi": "Garansi kerapatan seal & aksesoris 24 bulan"
    },
    "models": [
      {
        "name": "Jendela Casement (Buka Samping)",
        "desc": "Tingkat kekedapan tertinggi dengan engsel friction stay dan grendel rambuncis rapat.",
        "rate": "Rp 1.625.000 – Rp 2.375.000 / daun"
      },
      {
        "name": "Jendela Jungkit / Awning Window",
        "desc": "Bukaan dorong bawah keluar, sirkulasi udara tetap aman saat hujan rintik-rintik.",
        "rate": "Rp 1.375.000 – Rp 2.125.000 / daun"
      },
      {
        "name": "Jendela Sliding Geser Horizontal",
        "desc": "Sistem geser dua atau empat daun yang tidak memakan area teras luar maupun gorden.",
        "rate": "Rp 1.750.000 – Rp 2.750.000 / set"
      }
    ],
    "materials": [
      "Kusen Jendela Aluminium Profil SNI Tebal 1.15 mm",
      "Kaca Polos Clear 5mm / Kaca Rayban Panasap 5mm / Kaca Es Frosted",
      "Friction Stay Engsel Geser Stainless Steel SUS304 Anti Patah",
      "Kunci Rambuncis Dekkson / Casement Handle Tebal",
      "Karet EPDM Weatherstrip & Lubang Drainage Anti Banjir"
    ],
    "faq": [
      {
        "q": "Apakah air hujan bisa merembes lewat celah jendela aluminium?",
        "a": "Tidak. Jendela kami dirancang dengan rongga bertingkat, lubang pembuangan air (weep holes) berkatup satu arah, dan gasket karet EPDM ganda keliling yang menekan rapat saat dikunci."
      },
      {
        "q": "Kaca apa yang terbaik untuk meredam panas terik matahari Karawang?",
        "a": "Kami menyarankan Kaca Panasap Dark Grey atau Kaca Stopsol One-Way yang mampu memantulkan radiasi panas UV hingga 65% dan menjaga ruangan tetap sejuk."
      }
    ]
  },
  {
    "id": "pintu-kaca-tempered",
    "name": "Pintu Kaca Tempered",
    "slug": "pintu-kaca-tempered",
    "calcKey": "pintu_tempered",
    "title": "Jasa Pasang Pintu Kaca Tempered Karawang (Frameless & Floor Hinge)",
    "order": 4,
    "category": "aluminium",
    "priceMin": 8125000,
    "priceMax": 23500000,
    "priceStarting": "Paket Mulai Rp 7.250.000 / daun",
    "priceRange": "Rp 7.250.000 – Rp 13.125.000 / daun",
    "unit": "unit",
    "unitName": "Set Daun Pintu",
    "warranty": "36 Bulan Hidrolik Floor Hinge",
    "badge": "Tempered 10mm & 12mm",
    "description": "Pemasangan pintu kaca frameless floor hinge bersertifikat SNI kaca tempered 10mm & 12mm Asahimas. Sangat cocok untuk entrance toko ruko, kantor perbankan, lobi hotel, kafe, dan showroom di Karawang. Dilengkapi mesin engsel tanam lantai Dekkson/Dorma dengan katup oli hidrolik stabil anti hentak.",
    "summary": "Pintu kaca frameless floor hinge Dekkson/Dorma untuk ruko, kantor, bank & kafe. Desain mewah & garansi hidrolik engsel.",
    "image": "assets/gallery/pintu-kaca.jpg",
    "imageAlt": "Jasa Pasang Pintu Kaca Tempered Karawang Frameless Floor Hinge Dekkson",
    "galleryImages": [
      "assets/gallery/pintu-kaca.jpg",
      "assets/gallery/pintu-kaca-putih.jpg"
    ],
    "specifications": {
      "ketebalan": "10 mm atau 12 mm Full Tempered Polished Flat Edge",
      "kekuatan": "Kekuatan benturan 5x lipat kaca biasa, pecahan granul tumpul jagung",
      "mesinLantai": "Floor hinge oil buffer hidrolik fitur stop 90° & 115°",
      "finishingHardware": "Stainless Steel Satin SUS304 Tahan Karat",
      "standar": "SNI ISO 9001 & AS/NZS Safety Standards",
      "garansi": "Garansi mesin floor hinge 36 bulan"
    },
    "models": [
      {
        "name": "Pintu Frameless Single Leaf (1 Daun)",
        "desc": "Ukuran standar 90x210-240 cm dengan patch fitting SUS304 dan floor hinge.",
        "rate": "Rp 8.125.000 – Rp 9.625.000 / paket"
      },
      {
        "name": "Pintu Frameless Double Leaf (Kupu Tarung)",
        "desc": "Dua daun bukaan lebar 180-200 cm untuk akses utama ruko, bank, dan kantor.",
        "rate": "Rp 16.250.000 – Rp 18.750.000 / paket"
      },
      {
        "name": "Pintu Kaca Sliding Otomatis Sensor",
        "desc": "Dilengkapi motor gerak otomatis microwave radar sensor minimarket & apotek.",
        "rate": "Rp 36.250.000 – Rp 45.000.000 / set"
      }
    ],
    "materials": [
      "Kaca Tempered Clear 10mm atau 12mm SNI Asahimas (Safety Glass)",
      "Floor Hinge Tanam Lantai Dekkson FH84 / Dorma BTS 75V",
      "Top Patch, Bottom Patch, US-10 Bottom Lock SUS304 Stainless Steel",
      "Handle Tubular / Bulat Panjang 80 - 150 cm Stainless Steel SUS304",
      "Stiker Sandblast Motif Logo / Garis Buram Privasi"
    ],
    "faq": [
      {
        "q": "Apakah pintu kaca tempered bisa pecah dan membahayakan pengunjung?",
        "a": "Kaca tempered kami melewati proses pemanasan 700°C lalu pendinginan cepat berstandar SNI. Jika terjadi benturan ekstrim, kaca akan pecah menjadi butiran kristal tumpul seukuran biji jagung tanpa sudut tajam runcing."
      },
      {
        "q": "Berapa lama garansi mesin engsel tanam floor hinge?",
        "a": "Kami memberikan garansi mesin floor hinge Dekkson / Dorma selama 36 bulan (3 tahun). Jika terjadi kebocoran oli atau pintu menutup terlalu kencang, tim teknisi kami akan menyetel atau menggantinya gratis."
      }
    ]
  },
  {
    "id": "partisi-kaca-aluminium",
    "name": "Partisi Kaca Aluminium",
    "slug": "partisi-kaca-aluminium",
    "calcKey": "partisi",
    "title": "Jasa Pasang Partisi Kaca Aluminium Karawang (Kantor, Ruko & Pabrik)",
    "order": 5,
    "category": "aluminium",
    "priceMin": 2125000,
    "priceMax": 3375000,
    "priceStarting": "Mulai Rp 1.375.000 / m²",
    "priceRange": "Rp 1.375.000 – Rp 3.375.000 / m²",
    "unit": "m²",
    "unitName": "Meter Persegi (m²)",
    "warranty": "24 Bulan Resmi",
    "badge": "Kantor & Pabrik KIIC",
    "description": "Spesialis instalasi sekat partisi kaca kantor, ruang rapat, laboratorium cleanroom pabrik industri KIIC & Suryacipta Karawang, hingga sekat dapur minimalis perumahan. Menghadirkan kesan ruangan lapang, mewah, pencahayaan alami optimal, serta insulasi suara rapat internal yang terjaga.",
    "summary": "Sekat kaca ruang rapat, kantor staff, cleanroom pabrik Karawang. Akustik kedap suara & stiker sandblast.",
    "image": "assets/gallery/partisi-aluminium.jpg",
    "imageAlt": "Jasa Pasang Partisi Kaca Aluminium Karawang Sekat Ruang Kantor Rapat",
    "galleryImages": [
      "assets/gallery/partisi-aluminium.jpg",
      "assets/gallery/jendela-kaca.jpg"
    ],
    "specifications": {
      "tinggiMaksimal": "Hingga 4.5 meter modul bentangan tinggi",
      "peredamSuara": "Akustik STC 38 - 42 dB peredam percakapan ruang rapat",
      "integrasiPintu": "Bisa dipadukan pintu kaca floor hinge, swing kusen, atau sliding",
      "finishingKusen": "Powder coating matte black, anodized silver, atau white gloss",
      "garansi": "24 bulan kekokohan struktur partisi"
    },
    "models": [
      {
        "name": "Partisi Full Glass Frameless Office",
        "desc": "Panel kaca tempered 10/12mm dengan U-channel aluminium tanam minimalis.",
        "rate": "Rp 1.875.000 – Rp 2.875.000 / m²"
      },
      {
        "name": "Partisi Kusen Aluminium 4\" Modul Kotak",
        "desc": "Rangka kusen Alexindo 4 inch dengan panel kaca 8mm & pintu swing/sliding.",
        "rate": "Rp 1.375.000 – Rp 2.375.000 / m²"
      },
      {
        "name": "Partisi Dapur Moru Glass / Fluted",
        "desc": "Sekat dapur basah dan kering dengan motif kaca garis tekstur elegan modern.",
        "rate": "Rp 2.125.000 – Rp 3.125.000 / m²"
      }
    ],
    "materials": [
      "Kusen Aluminium Alexindo / Inkalum 3 & 4 Inch Finishing Black/Silver/White",
      "Kaca Clear Tempered 8mm / 10mm / 12mm SNI",
      "Kaca Fluted Moru Glass (Tekstur Garis Vertikal)",
      "Acoustic Sealant Silikon & Gasket Ganda Kedap Suara",
      "Stiker Kaca Film Buram Sandblast Custom Cutting Logo"
    ],
    "faq": [
      {
        "q": "Apakah partisi kaca kantor bisa kedap suara untuk ruang direksi?",
        "a": "Bisa. Kami mengombinasikan kusen profil 4 inch, kaca tebal 10-12mm atau sistem double glass, seal akustik perimeter, dan gasket karet kedap udara yang efektif meredam suara hingga STC 42 dB."
      },
      {
        "q": "Bisa sekalian dipasangkan stiker kaca film sandblast buram?",
        "a": "Bisa sekali. Kami menyediakan stiker kaca film buram sandblast polos, motif garis minimalis, maupun custom cutting logo perusahaan Anda."
      }
    ]
  },
  {
    "id": "kanopi-kaca-tempered",
    "name": "Kanopi Kaca Tempered",
    "slug": "kanopi-kaca-tempered",
    "calcKey": "kanopi",
    "title": "Jasa Pasang Kanopi Kaca Tempered Karawang (Carport & Skylight)",
    "order": 6,
    "category": "aluminium",
    "priceMin": 3875000,
    "priceMax": 8500000,
    "priceStarting": "Mulai Rp 3.125.000 / m²",
    "priceRange": "Rp 3.125.000 – Rp 7.000.000 / m²",
    "unit": "m²",
    "unitName": "Meter Persegi (m²)",
    "warranty": "36 Bulan Struktur & 12 Bulan Sealant",
    "badge": "Carport & Skylight",
    "description": "Pemasangan kanopi atap kaca tempered dan laminated untuk carport mobil rumah mewah, teras belakang, koridor kanopi ruko, dan skylight void tangga di Karawang. Struktur rangka besi hollow galvanis tebal 2 mm dilapisi cat epoxy anti karat dan lem sealant struktural tahan radiasi matahari.",
    "summary": "Kanopi atap kaca tempered 8–10mm & laminated 5+5mm. Rangka besi hollow galvanis tebal 2mm anti karat & anti bocor.",
    "image": "assets/gallery/kanopi-kaca.jpg",
    "imageAlt": "Jasa Pasang Kanopi Kaca Tempered Karawang Carport Atap Skylight Rangka Hollow",
    "galleryImages": [
      "assets/gallery/kanopi-kaca.jpg",
      "assets/gallery/kanopi-kaca-carport.svg"
    ],
    "specifications": {
      "kemiringanAtap": "Standar 5° - 10° memastikan debit air hujan mengalir deras tanpa genangan",
      "ketahananBeban": "Mampu menahan beban injak teknisi perawatan & benturan benda jatuh",
      "safetyFilm": "Opsi PVB film laminated kaca tidak akan berhamburan jatuh",
      "rangkaBaja": "Besi hollow galvanis anti karat atau baja WF 150",
      "garansi": "Garansi struktur 3 tahun & garansi kebocoran seal 1 tahun"
    },
    "models": [
      {
        "name": "Kanopi Carport Kaca Tempered 10mm",
        "desc": "Atap kaca bening/rayban tebal 10mm dengan rangka hollow 100x50x2mm.",
        "rate": "Rp 3.875.000 – Rp 4.625.000 / m²"
      },
      {
        "name": "Kanopi Kaca Tempered Laminated 5+5mm",
        "desc": "Safety glass ganda film PVB 0.76mm anti-jatuh jika kaca retak.",
        "rate": "Rp 5.250.000 – Rp 7.000.000 / m²"
      },
      {
        "name": "Skylight Void Atap Rumah Modern",
        "desc": "Penerangan alami di atas tangga atau taman indoor tanpa resiko tempias.",
        "rate": "Rp 4.125.000 – Rp 5.500.000 / m²"
      }
    ],
    "materials": [
      "Kaca Tempered 8mm / 10mm / Tempered Laminated 5+5mm PVB Interlayer",
      "Rangka Hollow Galvanis 50x100mm & 100x100mm Tebal 2.0 - 2.3 mm SNI",
      "Pengecatan 3 Lapis: Zinc Chromate Primer + Epoxy + Cat Duco Polyurethane",
      "Structural Sealant Dow Corning Dowsil 795 Anti UV & Anti Jamur",
      "Talang Air Tersembunyi (Hidden Gutter) Stainless Steel"
    ],
    "faq": [
      {
        "q": "Apakah kanopi kaca aman jika tertimpa dahan pohon atau genteng jatuh?",
        "a": "Sangat aman, terutama tipe Tempered Laminated 5+5mm PVB. Kaca laminated terdiri dari 2 lembar kaca tempered yang disatukan film PVB tebal. Jika terjadi benturan ekstrim, kaca tetap merekat utuh di rangka tanpa tembus atau jatuh menimpa kendaraan di bawahnya."
      },
      {
        "q": "Apakah kaca kanopi tidak akan bocor pada sambungannya?",
        "a": "Kami menggunakan sealant struktural kelas industri Dow Corning Dowsil 795 yang memiliki elastisitas tinggi terhadap pemuaian panas matahari dan tahan cuaca hujan selama puluhan tahun."
      }
    ]
  },
  {
    "id": "shower-kaca",
    "name": "Shower Kaca",
    "slug": "shower-kaca",
    "calcKey": "shower",
    "title": "Jasa Pasang Shower Kaca Karawang (Sekat Kamar Mandi Tempered 10mm)",
    "order": 7,
    "category": "aluminium",
    "priceMin": 3750000,
    "priceMax": 8750000,
    "priceStarting": "Paket Mulai Rp 4.125.000 / unit",
    "priceRange": "Rp 4.125.000 – Rp 8.750.000 / unit",
    "unit": "unit",
    "unitName": "Set Shower Screen",
    "warranty": "24 Bulan Resmi",
    "badge": "Kamar Mandi Mewah",
    "description": "Pemasangan sekat kaca pembatas area basah dan kering (dry bathroom) untuk kamar mandi hotel dan rumah tinggal modern di Karawang. Menggunakan kaca tempered 10mm anti jamur dengan hardware engsel kaca-ke-dinding (glass to wall) dan klem stainless SUS304 anti karat dari air sabun.",
    "summary": "Sekat walk-in shower & pintu swing kamar mandi kaca tempered 10mm. Kamar mandi tetap kering, bersih & higienis.",
    "image": "assets/gallery/shower-kaca.jpg",
    "imageAlt": "Jasa Pasang Shower Kaca Karawang Sekat Kamar Mandi Tempered 10mm",
    "galleryImages": [
      "assets/gallery/shower-kaca.jpg",
      "assets/gallery/pintu-kamar-mandi.jpg"
    ],
    "specifications": {
      "dimensi": "Panel Lurus: 90-150x200cm | Sudut L: 90x90x200cm s/d 120x120x200cm",
      "ketebalan": "10 mm Tempered Safety Glass",
      "kunciEngsel": "Engsel self-closing 25° dengan penahan 90°",
      "kebersihan": "Permukaan licin mudah dibersihkan dari kerak air dan residu sabun",
      "garansi": "Garansi aksesoris engsel stainless 24 bulan"
    },
    "models": [
      {
        "name": "Sekat Shower Walk-In Fixed (Tanpa Pintu)",
        "desc": "Satu panel kaca mati tempered 10mm dengan header rod stabilizer ke dinding.",
        "rate": "Rp 4.125.000 – Rp 5.500.000 / paket"
      },
      {
        "name": "Shower Box L-Shape Sudut (Pintu Swing)",
        "desc": "Model sudut 90 derajat kombinasi kaca mati dan pintu ayun dengan seal magnetik.",
        "rate": "Rp 8.000.000 – Rp 10.500.000 / paket"
      },
      {
        "name": "Shower Screen Geser / Sliding Glass",
        "desc": "Cocok untuk kamar mandi mungil dengan rel sliding gantung stainless minimalis.",
        "rate": "Rp 7.000.000 – Rp 9.500.000 / paket"
      }
    ],
    "materials": [
      "Kaca Tempered Clear 10mm SNI Asahimas Flat Polished Edge",
      "Engsel Kaca ke Dinding Glass-to-Wall SUS304 Heavy-Duty",
      "Pipa Header & Batang Stabilizer Stainless Steel SUS304",
      "Seal Strip Magnetik & Strip Sirip Silikon Bawah Anti Bocor Air",
      "Silicone Sealant Sanitari Khusus Area Basah Anti-Jamur"
    ],
    "faq": [
      {
        "q": "Apakah engsel shower kaca tidak akan berkarat terkena air dan sabun mandi?",
        "a": "Aksesoris engsel dan baut klem yang kami gunakan 100% Stainless Steel grade SUS304 asli tahan karat terhadap air sabun dan kelembapan kamar mandi."
      },
      {
        "q": "Bagaimana cara mencegah air shower merembes keluar area kering?",
        "a": "Kami memasang magnetic seal strip pada bibir pintu dan strip sirip silikon elastis di bawah daun pintu yang menahan cipratan air tetap di dalam bak shower."
      }
    ]
  },
  {
    "id": "etalase-kaca",
    "name": "Etalase Kaca",
    "slug": "etalase-kaca",
    "calcKey": "etalase",
    "title": "Jasa Pembuatan Etalase Kaca Karawang (Toko, HP, & Display Custom)",
    "order": 8,
    "category": "aluminium",
    "priceMin": 3000000,
    "priceMax": 8750000,
    "priceStarting": "Mulai Rp 2.125.000 / unit",
    "priceRange": "Rp 2.125.000 – Rp 8.750.000 / unit",
    "unit": "unit",
    "unitName": "Unit Etalase",
    "warranty": "12 Bulan Resmi",
    "badge": "Toko & Konter HP",
    "description": "Pembuatan aneka etalase kaca custom rangka profil aluminium untuk toko kelontong, konter handphone, display toko emas, lemari display tas/sepatu, hingga etalase warung makanan di Karawang. Dibuat dengan presisi tinggi, kaca bening kokoh, rak bertingkat, dan roda putar 360 derajat dengan kunci rem.",
    "summary": "Pembuatan etalase konter HP, display toko emas, etalase warung makan/kue & lemari tas custom. Rangka kuat & roda rem.",
    "image": "assets/gallery/etalase-kaca.jpg",
    "imageAlt": "Jasa Pembuatan Etalase Kaca Karawang Display Konter Toko Lemari Kaca",
    "galleryImages": [
      "assets/gallery/etalase-kaca.jpg",
      "assets/gallery/etalase-kaca-counter.svg"
    ],
    "specifications": {
      "dimensi": "Panjang 100 - 300 cm, Lebar 40 - 60 cm, Tinggi 90 - 180 cm (Custom)",
      "rak": "2 s/d 4 tingkat rak kaca tebal dengan penopang braket stainless",
      "mobilitas": "4 s/d 6 unit roda caster kuat digeser saat display toko ditata",
      "keamanan": "Kunci gerigi rel geser menjaga keamanan produk dagangan",
      "garansi": "Garansi sambungan rangka 12 bulan"
    },
    "models": [
      {
        "name": "Etalase Konter HP & Aksesoris",
        "desc": "Tinggi 1 meter dengan rak kaca bertingkat, pintu geser rel kunci, dan laci kasir.",
        "rate": "Rp 2.125.000 – Rp 3.750.000 / unit"
      },
      {
        "name": "Etalase Display Toko Emas / Perhiasan",
        "desc": "Full kaca tempered flat dengan lampu LED strip warm white tanam premium.",
        "rate": "Rp 5.000.000 – Rp 8.750.000 / unit"
      },
      {
        "name": "Etalase Warung Makan / Makanan Bersih",
        "desc": "Kaca penutup higienis anti lalat dan debu dengan ventilasi sirkulasi udara.",
        "rate": "Rp 2.375.000 – Rp 4.500.000 / unit"
      }
    ],
    "materials": [
      "Rangka Aluminium Profil Hollow & Siku Tebal Kokoh Tahan Beban",
      "Kaca Polos Clear 5mm / Kaca Tempered 8mm Kuat Anti Gores",
      "Roda Karet Swivel Caster 360° dengan Kunci Rem Kaki",
      "Rel Geser U-Track Nilon Halus & Kunci Gergaji Etalase",
      "Lampu LED Strip Tersembunyi (Warm White / Pure White)"
    ],
    "faq": [
      {
        "q": "Apakah bisa pesan etalase kaca ukuran custom sesuai luas toko saya?",
        "a": "Bisa sekali! Kami menerima pembuatan etalase custom 100% menyesuaikan panjang, lebar, jumlah tingkat rak, maupun model bertingkat L-shape toko Anda."
      },
      {
        "q": "Apakah etalase bisa diantar langsung ke lokasi di Karawang?",
        "a": "Bisa. Kami melayani pengiriman langsung ke alamat toko, ruko, atau rumah Anda di seluruh wilayah Karawang dan Cikarang dalam kondisi siap pakai."
      }
    ]
  },
  {
    "id": "railing-kaca",
    "name": "Railing Kaca Tempered",
    "slug": "railing-kaca",
    "calcKey": "railing",
    "title": "Jasa Pasang Railing Kaca Tempered Karawang (Tangga & Balkon Frameless)",
    "order": 9,
    "category": "aluminium",
    "priceMin": 5500000,
    "priceMax": 7500000,
    "priceStarting": "Mulai Rp 5.500.000 / m1",
    "priceRange": "Rp 5.500.000 – Rp 7.500.000 / m1",
    "unit": "m1",
    "unitName": "Meter Lari (m1)",
    "warranty": "36 Bulan Resmi",
    "badge": "Tangga & Balkon SUS304",
    "description": "Fabrikasi dan pemasangan railing kaca tempered balkon dan void tangga untuk hunian mewah, kantor, kafe, dan showroom di Karawang. Menggunakan kaca tempered tebal 10mm atau 12mm Asahimas dengan pilihan sistem base tanam U-Channel profil aluminium tersembunyi rata lantai, spigot klem solid stainless SUS304, atau tiang baluster handrail atas.",
    "summary": "Railing tangga void minimalis & balkon kaca tempered frameless sistem base shoe tanam atau spigot SUS304 padat.",
    "image": "assets/gallery/railing-tangga-kaca.svg",
    "imageAlt": "Jasa Pasang Railing Kaca Tempered Karawang Balkon Void Stainless SUS304",
    "galleryImages": [
      "assets/gallery/railing-tangga-kaca.svg",
      "assets/gallery/railing-balkon-kaca.svg"
    ],
    "specifications": {
      "dimensi": "Tinggi standar balkon 100-110 cm | Railing tangga 90-100 cm sudut custom",
      "ketebalan": "10 mm atau 12 mm Full Tempered Polished Edge",
      "sistemFiksasi": "Chemical anchor tanam beton mutu tinggi beban geser 4.5 kN",
      "keamanan": "Mampu menahan beban dorong horizontal sesuai standar keselamatan gedung",
      "garansi": "Garansi kekokohan struktur fiksasi 36 bulan"
    },
    "models": [
      {
        "name": "Sistem U-Channel Base Tanam + Tempered 12 mm",
        "desc": "Base shoe aluminium/stainless ditanam rata keramik dengan cover cladding estetis.",
        "rate": "Rp 5.500.000 – Rp 6.250.000 / m1"
      },
      {
        "name": "Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm",
        "desc": "Dudukan klem cor SUS304 padat 2 titik per meter dengan dynabolt stainless kuat.",
        "rate": "Rp 6.250.000 – Rp 7.500.000 / m1"
      },
      {
        "name": "Tiang Baluster + Handrail SUS304 + Tempered 10 mm",
        "desc": "Kombinasi tiang kokoh dan pipa pegangan tangan stainless minimalis ergonomis.",
        "rate": "Rp 6.000.000 – Rp 7.250.000 / m1"
      }
    ],
    "materials": [
      "Kaca Tempered Clear 10mm / 12mm SNI Asahimas Flat Edge Bevel",
      "Spigot Clamp Stainless Steel SUS304 Solid Padat Anti Karat",
      "Base Shoe U-Channel Aluminium Heavy-Duty Tanam Rata Lantai",
      "Chemical Anchor Fischer / Hilti untuk Ikatan Beton Solid",
      "Handrail Profil Stainless SUS304 / Aluminium Wood Finish"
    ],
    "faq": [
      {
        "q": "Apakah railing kaca balkon aman dari resiko pecah dan jatuh?",
        "a": "Sangat aman. Kami menggunakan kaca tempered SNI tebal 12mm yang 5 kali lebih kuat dari kaca biasa serta diangkur dengan dynabolt stainless atau chemical anchor ke cor dak beton."
      },
      {
        "q": "Apakah sistem spigot stainless bisa berkarat di area balkon terbuka?",
        "a": "Tidak. Spigot kami menggunakan bahan Stainless Steel SUS304 murni padat (solid casting) yang terbukti tahan hujan, panas, dan kelembapan ekstrem tanpa korosi."
      }
    ]
  },
  {
    "id": "pintu-lipat-bifold",
    "name": "Pintu Lipat Bifold System",
    "slug": "pintu-lipat-bifold",
    "calcKey": "bifold",
    "title": "Jasa Pasang Pintu Lipat Bifold Aluminium Karawang",
    "order": 10,
    "category": "aluminium",
    "priceMin": 7000000,
    "priceMax": 12000000,
    "priceStarting": "Mulai Rp 7.000.000 / daun",
    "priceRange": "Rp 7.000.000 – Rp 12.000.000 / daun",
    "unit": "daun",
    "unitName": "Daun Pintu",
    "warranty": "24 Bulan Resmi",
    "badge": "Bukaan Maksimal 100%",
    "description": "Pintu lipat bifold multi-daun dengan rel gantung heavy-duty dan roda bearing nilon senyap. Memberikan bukaan penuh fleksibel untuk menghubungkan area ruang tamu dengan kolam renang atau taman terbuka.",
    "summary": "Pintu lipat aluminium 3 s/d 8 daun membuka fleksibel 100% tanpa sekat ruang keluarga ke taman belakang.",
    "image": "assets/gallery/pintu-bifold.svg",
    "imageAlt": "Jasa Pasang Pintu Lipat Bifold Aluminium Karawang Penyekat Taman",
    "galleryImages": [
      "assets/gallery/pintu-bifold.svg"
    ],
    "specifications": {
      "dimensi": "Lebar daun 60-90 cm, tinggi hingga 280 cm",
      "ketebalan": "1.2 s/d 1.4 mm",
      "garansi": "24 bulan aksesoris rel dan engsel lipat"
    },
    "models": [
      {
        "name": "Bifold Standard Track (Inkalum 1.1 mm)",
        "desc": "Sistem rel gantung standar hunian untuk bukaan 3-5 daun.",
        "rate": "Rp 7.000.000 – Rp 8.750.000 / daun"
      },
      {
        "name": "Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm)",
        "desc": "Profil arsitektural tebal kapasitas roda 250kg daun kaca tinggi.",
        "rate": "Rp 8.750.000 – Rp 12.000.000 / daun"
      }
    ],
    "materials": [
      "Profil Daun Lipat Aluminium Lebar 8-10 cm Tebal 1.2-1.4 mm",
      "Rel Gantung Atas Heavy-Duty & Flush Bottom Track Stainless",
      "Kaca Tempered 8mm Clear / Moru Fluted Glass"
    ],
    "faq": [
      {
        "q": "Berapa jumlah daun maksimal untuk pintu bifold?",
        "a": "Bisa dibuat mulai dari 3 daun hingga 8 daun lipat, dengan konfigurasi buka satu arah atau buka dua arah ke kiri dan ke kanan."
      }
    ]
  },
  {
    "id": "fasad-acp",
    "name": "Fasad ACP Aluminium Composite Panel",
    "slug": "fasad-acp",
    "calcKey": "acp",
    "title": "Jasa Pasang ACP Aluminium Composite Panel Karawang & Cikarang",
    "order": 11,
    "category": "aluminium",
    "priceMin": 1625000,
    "priceMax": 4125000,
    "priceStarting": "Mulai Rp 1.625.000 / m²",
    "priceRange": "Rp 1.625.000 – Rp 4.125.000 / m²",
    "unit": "m²",
    "unitName": "Meter Persegi (m²)",
    "warranty": "60 Bulan Garansi Warna PVDF",
    "badge": "Gedung & Ruko Modern",
    "description": "Pemasangan ACP (Aluminium Composite Panel) merek Seven, Marks, dan Alustar untuk peremajaan fasad ruko dan gedung kantor industri Karawang. Rangka hollow galvanis las kuat dengan sambungan sealant neutral weatherseal rapi.",
    "summary": "Cladding fasad gedung perkantoran, ruko, pom bensin & showroom dengan material ACP tahan cuaca anti pudar.",
    "image": "assets/gallery/fasad-acp.svg",
    "imageAlt": "Jasa Pasang Fasad ACP Aluminium Karawang Seven Marks PVDF Eksterior",
    "galleryImages": [
      "assets/gallery/fasad-acp.svg"
    ],
    "specifications": {
      "dimensi": "Modul panel lembar 122 x 244 cm / 122 x 488 cm",
      "coating": "PVDF (Polyvinylidene Fluoride) 3-layer coating",
      "garansi": "Garansi pudar warna hingga 10 tahun pabrikan"
    },
    "models": [
      {
        "name": "ACP Interior PE 0.21 mm (Seven / Marks)",
        "desc": "Khusus partisi, pilar dan dekorasi interior kantor.",
        "rate": "Rp 1.625.000 – Rp 2.125.000 / m²"
      },
      {
        "name": "ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca",
        "desc": "Standar fasad ruko luar anti pudar sinar matahari.",
        "rate": "Rp 2.125.000 – Rp 2.875.000 / m²"
      },
      {
        "name": "ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)",
        "desc": "Panel tebal premium tahan terpaan angin kencang bentang tinggi.",
        "rate": "Rp 3.125.000 – Rp 4.125.000 / m²"
      }
    ],
    "materials": [
      "Lembar ACP Seven / Marks Tebal Total 4 mm (Skin Aluminium 0.30-0.50 mm)",
      "Rangka Besi Hollow Galvanis 40x40x1.6 mm / 40x20x1.4 mm",
      "Neutral Weatherseal Silicone Dowsil 791 Anti UV & Rembes"
    ],
    "faq": [
      {
        "q": "Berapa lama daya tahan warna panel ACP eksterior?",
        "a": "ACP dengan lapisan coating PVDF memiliki ketahanan warna lebih dari 10-15 tahun terhadap paparan sinar ultraviolet dan hujan asam perkotaan."
      }
    ]
  },
  {
    "id": "curtain-wall",
    "name": "Curtain Wall Fasad Kaca Komersial",
    "slug": "curtain-wall",
    "calcKey": "curtain_wall",
    "title": "Jasa Pasang Curtain Wall Kaca Gedung Karawang & KIIC",
    "order": 12,
    "category": "aluminium",
    "priceMin": 4000000,
    "priceMax": 8125000,
    "priceStarting": "Mulai Rp 4.000.000 / m²",
    "priceRange": "Rp 4.000.000 – Rp 8.125.000 / m²",
    "unit": "m²",
    "unitName": "Meter Persegi (m²)",
    "warranty": "60 Bulan Struktur & 24 Bulan Sealant",
    "badge": "Fasad Gedung Bertingkat",
    "description": "Instalasi curtain wall stick system dan semi-unitized untuk fasad gedung perkantoran pabrik KIIC Karawang dan ruko bertingkat. Menggunakan kaca Stopsol reflective atau Panasap tempered untuk efisiensi pendingin ruangan.",
    "summary": "Dinding kaca struktural gedung bertingkat, ruko modern & showroom dengan rangka mullion aluminium heavy-duty.",
    "image": "assets/gallery/curtain-wall.svg",
    "imageAlt": "Jasa Pasang Curtain Wall Fasad Kaca Gedung Karawang KIIC Modern",
    "galleryImages": [
      "assets/gallery/curtain-wall.svg"
    ],
    "specifications": {
      "dimensi": "Ketinggian bentang hingga 30+ meter dengan perhitungan wind-load",
      "insulasiPanas": "Shading coefficient 0.45 menurunkan beban AC ruangan hingga 35%",
      "garansi": "Garansi struktur 5 tahun & garansi kebocoran seal 2 tahun"
    },
    "models": [
      {
        "name": "Stick System Back Mullion + Panasap 6 mm Tinted",
        "desc": "Rangka mullion profil aluminium tebal dengan kaca penahan panas matahari.",
        "rate": "Rp 4.000.000 – Rp 4.750.000 / m²"
      },
      {
        "name": "Stick System + Tempered Reflective / Stopsol 8 mm",
        "desc": "Kaca one-way reflektif memantulkan panas dan menjaga privasi siang hari.",
        "rate": "Rp 4.625.000 – Rp 6.125.000 / m²"
      },
      {
        "name": "Semi-Unitized High-Rise + Low-E 10 mm Tempered",
        "desc": "Sistem fasad modern gedung bertingkat insulasi termal maksimal.",
        "rate": "Rp 6.250.000 – Rp 8.125.000 / m²"
      }
    ],
    "materials": [
      "Profil Mullion & Transom Aluminium Alexindo / YKK Arsitektural Tebal 2.0-3.0 mm",
      "Kaca Tempered Panasap 6mm/8mm atau Kaca Reflektif Stopsol Asahimas",
      "Bracket Baja Siku Galvanis & Dynabolt Heavy Anchor M16",
      "Structural Glazing Sealant Dowsil 983 / Dowsil 795"
    ],
    "faq": [
      {
        "q": "Apakah curtain wall tahan terhadap hembusan angin kencang gedung tinggi?",
        "a": "Tentu. Tim engineer kami menghitung kekuatan momen inersia balok mullion vertikal dan ketebalan kaca berdasarkan analisis beban angin (wind load calculation) standar SNI."
      }
    ]
  }
],

  // Getter lookup by id, slug, or calcKey
  get: function(key) {
    if (!key) return null;
    const k = String(key).toLowerCase().trim();
    return this.services.find(function(s) {
      return s.id === k || s.slug === k || s.calcKey === k;
    }) || null;
  },

  // Get all services
  getAll: function() {
    return this.services;
  },

  // Helper to format IDR currency
  formatCurrency: function(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  },

  // Dynamically render service cards into any container
  renderCards: function(containerOrSelector, options) {
    options = options || {};
    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : containerOrSelector;
    if (!container) return;

    const list = options.filter
      ? this.services.filter(options.filter)
      : (options.limit ? this.services.slice(0, options.limit) : this.services);

    let html = '';
    const self = this;
    list.forEach(function(service, index) {
      const numStr = (index + 1 < 10 ? '0' : '') + (index + 1);
      const shortBadge = service.badge || 'Spesialis Resmi';

      // 3 bullet highlights from materials or specifications
      let highlightsHtml = '';
      if (service.materials && service.materials.length > 0) {
        service.materials.slice(0, 3).forEach(function(m) {
          highlightsHtml += '<li>' + m + '</li>';
        });
      } else if (service.specifications) {
        Object.entries(service.specifications).slice(0, 3).forEach(function(entry) {
          highlightsHtml += '<li>' + entry[0] + ': ' + entry[1] + '</li>';
        });
      }

      html += '<article class="service-master-card" data-service-id="' + service.id + '" style="background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(7,55,70,0.06);display:flex;flex-direction:column;transition:transform 0.2s ease, box-shadow 0.2s ease;">' +
        '<div style="position:relative;height:210px;overflow:hidden;background:#0d2c38;">' +
          '<img src="/' + service.image + '" alt="' + service.imageAlt + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
          '<span style="position:absolute;top:12px;left:12px;background:rgba(7,46,59,0.92);color:#5eead4;font-size:11px;font-weight:800;padding:4px 10px;border-radius:6px;">' + numStr + '. ' + service.name.toUpperCase() + '</span>' +
          '<span style="position:absolute;top:12px;right:12px;background:#ffd88a;color:#073746;font-size:11px;font-weight:700;padding:4px 9px;border-radius:6px;">' + shortBadge + '</span>' +
        '</div>' +
        '<div style="padding:22px;display:flex;flex-direction:column;flex-grow:1;">' +
          '<h3 style="margin:0 0 10px;font-size:20px;color:var(--deep);font-weight:800;">' + service.name + '</h3>' +
          '<p style="font-size:14px;color:#556972;margin:0 0 16px;line-height:1.6;">' +
            service.summary +
          '</p>' +
          '<ul style="margin:0 0 18px;padding-left:18px;font-size:12.5px;color:#475569;display:flex;flex-direction:column;gap:5px;">' +
            highlightsHtml +
          '</ul>' +
          '<div style="margin-top:auto;display:flex;flex-direction:column;gap:12px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf2f4;padding-top:12px;">' +
              '<span style="font-size:13.5px;color:var(--blue);font-weight:800;">' + service.priceStarting + '</span>' +
              '<span style="font-size:11.5px;background:#e6f8f5;color:#0d9488;padding:3px 8px;border-radius:6px;font-weight:700;">Garansi ' + service.warranty + '</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
              '<a href="/layanan/' + service.slug + '" class="btn primary" style="padding:10px 12px;font-size:12.5px;text-align:center;justify-content:center;">Lihat Detail &rarr;</a>' +
              '<a href="https://wa.me/6289637371166?text=Halo%20Admin%2C%20saya%20tertarik%20konsultasi%20' + encodeURIComponent(service.name) + '." target="_blank" rel="noopener" class="btn ghost" style="padding:10px 12px;font-size:12.5px;text-align:center;justify-content:center;color:#0f5132;border-color:#25d366;">Chat WA</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
    });

    container.innerHTML = html;
  },

  // Dynamically render a complete service detail page view
  renderDetail: function(slugOrId, containerOrSelector) {
    const service = this.get(slugOrId);
    if (!service) return false;

    const container = typeof containerOrSelector === 'string'
      ? document.querySelector(containerOrSelector)
      : (containerOrSelector || document.getElementById('serviceDetailContainer') || document.getElementById('spa-content'));

    // If targeted sub-elements exist in an already static/hydrated detail page, update them smoothly
    const heroTitle = document.getElementById('serviceHeroTitle');
    const heroDesc = document.getElementById('serviceHeroDesc');
    const heroStartingPrice = document.getElementById('serviceHeroStartingPrice');
    const heroBadge = document.getElementById('serviceHeroBadge');
    const heroImg = document.getElementById('serviceHeroImg');

    if (heroTitle) heroTitle.textContent = service.title;
    if (heroDesc) heroDesc.textContent = service.description;
    if (heroStartingPrice) heroStartingPrice.textContent = service.priceStarting;
    if (heroBadge) heroBadge.textContent = '★ SPESIALIS RESMI KARAWANG • GARANSI ' + service.warranty.toUpperCase();
    if (heroImg) {
      heroImg.src = '/' + service.image;
      heroImg.alt = service.imageAlt;
    }

    // Dynamic models list
    const modelsBox = document.getElementById('serviceDetailModels');
    if (modelsBox && service.models) {
      let modelsHtml = '';
      service.models.forEach(function(m) {
        modelsHtml += '<div style="background:#fff;border:1px solid #dce5e9;border-radius:12px;padding:24px;box-shadow:0 6px 18px rgba(7,55,70,0.06);display:flex;flex-direction:column;">' +
          '<h3 style="margin:0 0 10px;font-size:18px;color:var(--deep);">' + m.name + '</h3>' +
          '<p style="font-size:13.5px;color:var(--muted);margin:0 0 16px;line-height:1.6;flex-grow:1;">' + m.desc + '</p>' +
          '<div style="border-top:1px solid #eef3f5;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">' +
            '<span style="font-size:13px;font-weight:700;color:var(--blue);">' + m.rate + '</span>' +
            '<a href="/hitung-estimasi?service=' + service.calcKey + '" style="font-size:12px;color:var(--deep);font-weight:700;">Hitung RAB &rarr;</a>' +
          '</div>' +
        '</div>';
      });
      modelsBox.innerHTML = modelsHtml;
    }

    // Dynamic specs table
    const specsTable = document.getElementById('serviceDetailSpecs');
    if (specsTable && service.specifications) {
      let specsHtml = '';
      Object.entries(service.specifications).forEach(function(entry) {
        const keyFormatted = entry[0].replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); });
        specsHtml += '<tr>' +
          '<td style="padding:12px 16px;border-bottom:1px solid #eef3f5;font-weight:700;color:var(--deep);width:32%;">' + keyFormatted + '</td>' +
          '<td style="padding:12px 16px;border-bottom:1px solid #eef3f5;color:#334155;">' + entry[1] + '</td>' +
        '</tr>';
      });
      specsTable.innerHTML = specsHtml;
    }

    // Dynamic materials
    const materialsList = document.getElementById('serviceDetailMaterials');
    if (materialsList && service.materials) {
      let matHtml = '';
      service.materials.forEach(function(mat) {
        matHtml += '<li style="margin-bottom:10px;display:flex;align-items:flex-start;gap:8px;font-size:14.5px;color:#244450;">' +
          '<span style="color:var(--gold);font-weight:bold;">✔</span>' +
          '<span>' + mat + '</span>' +
        '</li>';
      });
      materialsList.innerHTML = matHtml;
    }

    // Dynamic FAQs
    const faqContainer = document.getElementById('serviceDetailFaq');
    if (faqContainer && service.faq) {
      let faqHtml = '';
      service.faq.forEach(function(f) {
        faqHtml += '<div style="background:#fff;border:1px solid #dce5e9;border-radius:10px;padding:20px;margin-bottom:14px;">' +
          '<h3 style="margin:0 0 8px;font-size:16.5px;color:var(--deep);">❓ ' + f.q + '</h3>' +
          '<p style="margin:0;font-size:14px;color:var(--muted);line-height:1.7;">' + f.a + '</p>' +
        '</div>';
      });
      faqContainer.innerHTML = faqHtml;
    }

    // Dynamic Gallery
    const galleryBox = document.getElementById('serviceDetailGallery');
    if (galleryBox && service.galleryImages) {
      let galHtml = '';
      service.galleryImages.forEach(function(img) {
        galHtml += '<div style="height:200px;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">' +
          '<img src="/' + img + '" alt="' + service.name + ' Proyek Karawang" style="width:100%;height:100%;object-fit:cover;" loading="lazy">' +
        '</div>';
      });
      galleryBox.innerHTML = galHtml;
    }

    return true;
  },

  // Auto-initialize components on page load
  init: function() {
    const servicesGrid = document.getElementById('servicesGridContainer');
    if (servicesGrid) {
      this.renderCards(servicesGrid);
    }

    // Detect if on detail page via pathname
    if (typeof window !== 'undefined' && window.location) {
      const pathStr = window.location.pathname || '';
      const match = pathStr.match(/\/layanan\/([a-z0-9-]+)(?:\.html)?$/);
      if (match && match[1]) {
        this.renderDetail(match[1]);
      }
    }
  }
};

window.SERVICE_MASTER = SERVICE_MASTER;


// SINGLE SOURCE OF TRUTH: Master Pricing Configuration with built-in default
const DEFAULT_PRICING_CONFIG = {
  "services": {
    "kanopi": {
      "id": "kanopi",
      "serviceId": "kanopi",
      "serviceName": "Kanopi Kaca Tempered",
      "label": "Kanopi Kaca Tempered Carport / Teras",
      "category": "glass_canopy",
      "priceModel": "glass_canopy",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "calculationType": "m2",
      "priceMin": 1450000,
      "priceMax": 3800000,
      "standardPriceMin": 1450000,
      "standardPriceMax": 1950000,
      "premiumPriceMin": 2800000,
      "premiumPriceMax": 3800000,
      "specification": "Rangka Hollow Galvanis 100×50 tebal 2mm + Kaca Tempered Clear 8mm/10mm SNI Asahimas & Sealant Dowsil 795",
      "minOrderValue": 5000000,
      "wasteFactor": 0.05,
      "priceRanges": {
        "hollow_tempered_8": {
          "name": "Rangka Hollow Galvanis 100×50 + Tempered 8 mm",
          "min": 1450000,
          "max": 1750000,
          "target": 1600000,
          "unit": "m²"
        },
        "hollow_tempered_10": {
          "name": "Rangka Hollow 100×50×2 mm + Tempered Clear 10 mm (Target Carport Standar)",
          "min": 1550000,
          "max": 1950000,
          "target": 1750000,
          "unit": "m²"
        },
        "wf_tempered_12": {
          "name": "Rangka Baja WF 150 / Double Hollow + Tempered 12 mm",
          "min": 1750000,
          "max": 2200000,
          "target": 1950000,
          "unit": "m²"
        },
        "stainless_tempered": {
          "name": "Rangka Stainless Steel SUS304 + Tempered 10/12 mm",
          "min": 2800000,
          "max": 3800000,
          "target": 3250000,
          "unit": "m²"
        },
        "laminated_canopy": {
          "name": "Struktur Rangka + Tempered Laminated 5+5 mm PVB",
          "min": 1850000,
          "max": 2400000,
          "target": 2100000,
          "unit": "m²"
        }
      },
      "summaryLabel": "Rangka & Kaca:",
      "step2Label": "2. Pilih Sistem Struktur & Jenis Kaca",
      "guideText": "PILIH SISTEM STRUKTUR • PILIH JENIS KACA",
      "defaultQty": 18,
      "presets": [
        12,
        18,
        24,
        30,
        45
      ],
      "options": [
        {
          "id": "hollow_tempered_8",
          "name": "Rangka Hollow Galvanis 100×50 + Tempered 8 mm",
          "badge": "Hollow 100×50 + Temp 8mm",
          "desc": "Kaca Tempered Clear 8mm SNI Asahimas, rangka pipa hollow galvanis anti-karat 100×50×2 mm, cat dasar epoxy primer & finish polyurethane, bantalan karet EPDM & sealant Dowsil 795.",
          "minRate": 1450000,
          "maxRate": 1750000,
          "targetRate": 1600000,
          "rate": "Rp 1.450.000 – Rp 1.750.000 / m²",
          "leadTime": "5–7 Hari Kerja",
          "formula": "(Luas m² × Tarif) + Rangka Hollow 100×50 + Tempered 8mm + Bracket Dynabolt + Sealant Dowsil + Fabrikasi + Pasang",
          "rabRatios": {
            "kaca": 0.34,
            "struktur": 0.22,
            "hardware": 0.06,
            "sealant": 0.03,
            "fabrikasi": 0.11,
            "pasang": 0.13,
            "transport": 0.04,
            "margin": 0.07
          }
        },
        {
          "id": "hollow_tempered_10",
          "name": "Rangka Hollow 100×50×2 mm + Tempered Clear 10 mm (Target Carport Standar)",
          "badge": "Target Standar Carport",
          "desc": "Kaca Tempered Clear 10mm SNI Asahimas, struktur hollow galvanis 100×50×2 mm bentang rigid, plat anchor baja, sealant weatherseal netral struktural Dowsil 795.",
          "minRate": 1550000,
          "maxRate": 1950000,
          "targetRate": 1750000,
          "rate": "Rp 1.550.000 – Rp 1.950.000 / m²",
          "leadTime": "6–8 Hari Kerja",
          "formula": "Luas m² × Tarif + Kaca Tempered 10mm + Rangka Hollow 100×50×2mm + Sealant Struktural + Pasang",
          "rabRatios": {
            "kaca": 0.36,
            "struktur": 0.2,
            "hardware": 0.06,
            "sealant": 0.03,
            "fabrikasi": 0.11,
            "pasang": 0.14,
            "transport": 0.03,
            "margin": 0.07
          }
        },
        {
          "id": "wf_tempered_12",
          "name": "Rangka Baja WF 150 / Double Hollow + Tempered 12 mm",
          "badge": "Heavy Duty WF 150",
          "desc": "Kaca Tempered Clear 12mm tebal anti lendut, struktur balok baja profil WF 150 / double hollow 100×50 heavy tanpa tiang tengah, plat sambung anchor baja tebal 10mm.",
          "minRate": 1750000,
          "maxRate": 2200000,
          "targetRate": 1950000,
          "rate": "Rp 1.750.000 – Rp 2.200.000 / m²",
          "leadTime": "7–10 Hari Kerja",
          "formula": "(Luas m² × Tarif) + Baja WF 150 + Tempered 12mm + Plat Anchor Baja + Sealant Weatherseal + Alat Berat/Crane + Pasang",
          "rabRatios": {
            "kaca": 0.38,
            "struktur": 0.23,
            "hardware": 0.06,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.11,
            "transport": 0.03,
            "margin": 0.06
          }
        },
        {
          "id": "stainless_tempered",
          "name": "Rangka Stainless Steel SUS304 + Tempered 10/12 mm",
          "badge": "Stainless SUS304 Anti Karat",
          "desc": "Struktur pipa kotak/bulat Stainless Steel SUS304 kilap/hairline anti karat seumur hidup, kaca Tempered 10mm/12mm, bracket spider clamp SUS304 presisi.",
          "minRate": 2800000,
          "maxRate": 3800000,
          "targetRate": 3250000,
          "rate": "Rp 2.800.000 – Rp 3.800.000 / m²",
          "leadTime": "10–14 Hari Kerja",
          "formula": "(Luas m² × Tarif) + Rangka Stainless SUS304 + Tempered 10/12mm + Spider Clamp SUS304 + Polishing + Sealant + Pasang",
          "rabRatios": {
            "kaca": 0.3,
            "struktur": 0.32,
            "hardware": 0.08,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.09,
            "transport": 0.02,
            "margin": 0.06
          }
        },
        {
          "id": "laminated_canopy",
          "name": "Struktur Rangka + Tempered Laminated 5+5 mm PVB",
          "badge": "Maximum Safety PVB",
          "desc": "Kaca Tempered Laminated 5+5mm (kaca tetap utuh terikat interlayer PVB 0.76mm jika retak benturan ekstrem), struktur rangka baja hollow galvanis tebal.",
          "minRate": 1850000,
          "maxRate": 2400000,
          "targetRate": 2100000,
          "rate": "Rp 1.850.000 – Rp 2.400.000 / m²",
          "leadTime": "8–12 Hari Kerja",
          "formula": "(Luas m² × Tarif) + Rangka Baja + Tempered Laminated 5+5 PVB + Sealant Struktural + Scaffolding + Pasang",
          "rabRatios": {
            "kaca": 0.44,
            "struktur": 0.2,
            "hardware": 0.05,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.1,
            "transport": 0.02,
            "margin": 0.06
          }
        }
      ]
    },
    "railing": {
      "id": "railing",
      "serviceId": "railing",
      "serviceName": "Railing Kaca Tempered",
      "label": "Railing Tangga & Balkon Kaca Tempered",
      "category": "glass_railing",
      "priceModel": "glass_railing",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "calculationType": "m1",
      "priceMin": 2200000,
      "priceMax": 3200000,
      "standardPriceMin": 2200000,
      "standardPriceMax": 2700000,
      "premiumPriceMin": 2400000,
      "premiumPriceMax": 3200000,
      "specification": "Sistem U-Channel Base Tanam / Spigot Clamp Solid SUS304 + Tempered 10mm/12mm SNI Asahimas",
      "minOrderValue": 5000000,
      "wasteFactor": 0.05,
      "priceRanges": {
        "uchannel_ss304": {
          "name": "Sistem U-Channel Base Tanam + Tempered 12 mm",
          "min": 2200000,
          "max": 2700000,
          "target": 2450000,
          "unit": "m1"
        },
        "spigot_ss304": {
          "name": "Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm",
          "min": 2400000,
          "max": 3000000,
          "target": 2700000,
          "unit": "m1"
        },
        "handrail_ss304": {
          "name": "Tiang Baluster + Handrail SUS304 + Tempered 10 mm",
          "min": 2400000,
          "max": 3000000,
          "target": 2700000,
          "unit": "m1"
        },
        "railing_tangga": {
          "name": "Railing Tangga Custom Void + Tempered 10/12 mm",
          "min": 2500000,
          "max": 3200000,
          "target": 2850000,
          "unit": "m1"
        }
      },
      "summaryLabel": "Sistem Railing:",
      "step2Label": "2. Pilih Sistem Railing Kaca",
      "guideText": "PILIH SISTEM RAILING (U-Channel, Spigot, Handrail SS304)",
      "defaultQty": 18,
      "presets": [
        4,
        8,
        12,
        18,
        24
      ],
      "options": [
        {
          "id": "uchannel_ss304",
          "name": "Sistem U-Channel Base Tanam + Tempered 12 mm",
          "badge": "U-Channel SS304 Tanam (Standard)",
          "desc": "Kaca Tempered 12mm SNI Asahimas, base shoe profil aluminium/stainless SUS304 tanam rata lantai marmer/keramik dengan chemical anchor Fischer/Hilti, cover cladding samping estetik.",
          "minRate": 2200000,
          "maxRate": 2700000,
          "targetRate": 2450000,
          "rate": "Rp 2.200.000 – Rp 2.700.000 / m1",
          "leadTime": "6–9 Hari Kerja",
          "formula": "Panjang m1 × Tarif + Base U-Channel + Kaca Tempered 12mm + Chemical Anchor + Sealant EPDM + Pasang Presisi",
          "rabRatios": {
            "kaca": 0.35,
            "struktur": 0.24,
            "hardware": 0.08,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.11,
            "transport": 0.03,
            "margin": 0.06
          }
        },
        {
          "id": "spigot_ss304",
          "name": "Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm",
          "badge": "Spigot SS304 Solid 2 Titik/m (Premium)",
          "desc": "Kaca Tempered 12mm SNI, dudukan spigot bulat/kotak cor Stainless SUS304 padat (2 unit per meter), dynabolt M12 beton, tampilan minimalis murni tanpa tiang atas.",
          "minRate": 2400000,
          "maxRate": 3000000,
          "targetRate": 2700000,
          "rate": "Rp 2.400.000 – Rp 3.000.000 / m1",
          "leadTime": "5–8 Hari Kerja",
          "formula": "(Panjang m1 × Tarif) + Kaca Tempered 12mm + 2 Spigot SUS304 Solid/m + Dynabolt Stainless + Setting Laser + Pasang",
          "rabRatios": {
            "kaca": 0.32,
            "struktur": 0.26,
            "hardware": 0.12,
            "sealant": 0.02,
            "fabrikasi": 0.09,
            "pasang": 0.1,
            "transport": 0.03,
            "margin": 0.06
          }
        },
        {
          "id": "handrail_ss304",
          "name": "Tiang Baluster + Handrail SUS304 + Tempered 10 mm",
          "badge": "Handrail SS304 Safety",
          "desc": "Kaca Tempered 10mm SNI, tiang baluster pipa bulat/kotak SUS304, handrail pegangan stainless 2\" atau kayu kamper/jati atas kaca, sangat ramah anak & lansia.",
          "minRate": 2400000,
          "maxRate": 3000000,
          "targetRate": 2700000,
          "rate": "Rp 2.400.000 – Rp 3.000.000 / m1",
          "leadTime": "5–8 Hari Kerja",
          "formula": "(Panjang m1 × Tarif) + Kaca Tempered 10mm + Tiang Baluster SUS304 + Handrail Pipa 2\" + Bracket Klem Kaca + Pasang",
          "rabRatios": {
            "kaca": 0.3,
            "struktur": 0.28,
            "hardware": 0.1,
            "sealant": 0.02,
            "fabrikasi": 0.1,
            "pasang": 0.11,
            "transport": 0.03,
            "margin": 0.06
          }
        },
        {
          "id": "railing_tangga",
          "name": "Railing Tangga Custom Void + Tempered 10/12 mm",
          "badge": "Railing Tangga Presisi Bevel",
          "desc": "Kaca Tempered 10mm/12mm custom bevel mengikuti sudut derajat kemiringan trap anak tangga (akurasi laser), pin standoff void / tiang miring SUS304.",
          "minRate": 2500000,
          "maxRate": 3200000,
          "targetRate": 2850000,
          "rate": "Rp 2.500.000 – Rp 3.200.000 / m1",
          "leadTime": "7–12 Hari Kerja",
          "formula": "(Panjang m1 × Tarif) + Mal Triplek Sudut Trap + Kaca Tempered Custom Bevel + Hardware Tangga SUS304 + Pasang Khusus",
          "rabRatios": {
            "kaca": 0.33,
            "struktur": 0.25,
            "hardware": 0.09,
            "sealant": 0.03,
            "fabrikasi": 0.11,
            "pasang": 0.1,
            "transport": 0.03,
            "margin": 0.06
          }
        }
      ]
    },
    "partisi": {
      "id": "partisi",
      "serviceId": "partisi",
      "serviceName": "Partisi Kaca Aluminium",
      "label": "Partisi Kaca Kantor & Sekat Ruangan Aluminium",
      "category": "aluminium",
      "priceModel": "aluminium_partition",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "calculationType": "m2",
      "priceMin": 650000,
      "priceMax": 1200000,
      "standardPriceMin": 650000,
      "standardPriceMax": 850000,
      "premiumPriceMin": 850000,
      "premiumPriceMax": 1200000,
      "specification": "Standard SNI 3\" (Dacon/Inkalum + Kaca 5 mm) vs Premium Grade 4\" (Alexindo/Forta + Kaca 6/8 mm)",
      "minOrderValue": 3500000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "standard": {
          "name": "Standard SNI 3 Inch (Dacon/Inkalum + Kaca 5 mm)",
          "min": 650000,
          "max": 850000,
          "target": 750000,
          "unit": "m²"
        },
        "premium": {
          "name": "Premium Grade 4 Inch (Alexindo/Forta + Kaca 6/8 mm)",
          "min": 850000,
          "max": 1200000,
          "target": 1025000,
          "unit": "m²"
        }
      },
      "summaryLabel": "Grade Partisi:",
      "step2Label": "2. Pilih Grade Profil & Kaca Partisi",
      "guideText": "Standard SNI 3\" vs Premium Heavy Duty 4\"",
      "defaultQty": 16.8,
      "presets": [
        8,
        12,
        16.8,
        25,
        40
      ],
      "options": [
        {
          "id": "standard",
          "name": "Standard SNI 3 Inch (Dacon/Inkalum + Kaca 5 mm)",
          "badge": "Standard SNI 3\"",
          "desc": "Kusen aluminium 3\" tebal 0.9–1.0mm (Dacon/Inkalum), kaca clear polos 5mm SNI, karet EPDM lis keliling, sealant netral kedap suara kantor.",
          "minRate": 650000,
          "maxRate": 850000,
          "targetRate": 750000,
          "rate": "Rp 1.250.000 – Rp 1.650.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Luas m² × Tarif + Kusen 3\" + Kaca 5mm + Karet EPDM + Sealant + Sekrup Fisher + Jasa Pasang Presisi",
          "rabRatios": {
            "kaca": 0.28,
            "struktur": 0.3,
            "hardware": 0.06,
            "sealant": 0.05,
            "fabrikasi": 0.1,
            "pasang": 0.11,
            "transport": 0.03,
            "margin": 0.07
          }
        },
        {
          "id": "premium",
          "name": "Premium Grade 4 Inch (Alexindo/Forta + Kaca 6/8 mm)",
          "badge": "Alexindo 4\" Heavy",
          "desc": "Kusen aluminium 4\" tebal 1.1–1.3mm profil tebal rigid (Alexindo/Forta), kaca clear/riben 6mm / tempered 8mm, peredam suara kantor akustik lebih hening.",
          "minRate": 850000,
          "maxRate": 1200000,
          "targetRate": 1025000,
          "rate": "Rp 2.400.000 – Rp 3.500.000 / unit",
          "leadTime": "4–7 Hari Kerja",
          "formula": "Luas m² × Tarif + Kusen 4\" Alexindo + Kaca 6mm/8mm + Sealant Akustik + Bracket Baja + Pasang Presisi",
          "rabRatios": {
            "kaca": 0.32,
            "struktur": 0.28,
            "hardware": 0.06,
            "sealant": 0.05,
            "fabrikasi": 0.1,
            "pasang": 0.1,
            "transport": 0.03,
            "margin": 0.06
          }
        }
      ]
    },
    "jendela": {
      "id": "jendela",
      "serviceId": "jendela",
      "serviceName": "Jendela Aluminium",
      "label": "Jendela Aluminium (Casement / Sliding)",
      "category": "aluminium",
      "priceModel": "aluminium_window",
      "unit": "unit",
      "unitName": "Unit Jendela",
      "calculationType": "unit",
      "priceMin": 850000,
      "priceMax": 1800000,
      "standardPriceMin": 850000,
      "standardPriceMax": 1150000,
      "premiumPriceMin": 1200000,
      "premiumPriceMax": 1800000,
      "specification": "Standard SNI Casement 3\" + Kaca 5mm vs Premium Alexindo 4\" + Kaca Panasap/Dekkson",
      "minOrderValue": 1500000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "standard": {
          "name": "Standard SNI (Casement 3\" + Kaca 5 mm)",
          "min": 850000,
          "max": 1150000,
          "target": 1000000,
          "unit": "unit"
        },
        "premium": {
          "name": "Premium Grade (Casement 4\" Alexindo + Kaca Panasap/Dekkson)",
          "min": 1200000,
          "max": 1800000,
          "target": 1500000,
          "unit": "unit"
        }
      },
      "summaryLabel": "Grade Jendela:",
      "step2Label": "2. Pilih Grade Profil & Aksesoris Jendela",
      "guideText": "Standard SNI vs Premium Alexindo Heavy Duty",
      "defaultQty": 10,
      "presets": [
        3,
        6,
        10,
        15,
        20
      ],
      "options": [
        {
          "id": "standard",
          "name": "Standard SNI (Casement 3\" + Kaca 5 mm)",
          "badge": "Inkalum / Dacon 3\"",
          "desc": "Profil kusen & daun 3\" tebal 1.0mm, kaca clear 5mm SNI, friction stay stainless 12\", kunci rambuncis zinc alloy, weatherstrip bulu & karet kedap air hujan.",
          "minRate": 850000,
          "maxRate": 1150000,
          "targetRate": 1000000,
          "rate": "Rp 2.125.000 – Rp 2.625.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Jumlah unit × Tarif + Kusen + Daun Casement + Kaca 5mm + Friction Stay + Rambuncis + Pasang",
          "rabRatios": {
            "kaca": 0.25,
            "struktur": 0.34,
            "hardware": 0.1,
            "sealant": 0.04,
            "fabrikasi": 0.1,
            "pasang": 0.08,
            "transport": 0.03,
            "margin": 0.06
          }
        },
        {
          "id": "premium",
          "name": "Premium Grade (Casement 4\" Alexindo + Kaca Panasap/Dekkson)",
          "badge": "Alexindo 4\" SUS304",
          "desc": "Profil heavy duty 4\" tebal 1.2mm Alexindo, kaca Panasap tolak panas / Euro Grey 5mm, friction stay heavy duty Dekkson SUS304, multi-point lock lever hening.",
          "minRate": 1200000,
          "maxRate": 1800000,
          "targetRate": 1500000,
          "rate": "Rp 2.750.000 – Rp 3.500.000 / unit",
          "leadTime": "4–6 Hari Kerja",
          "formula": "Jumlah unit × Tarif + Kusen 4\" Alexindo + Kaca Panasap + Multi-point Lock Dekkson + Weatherseal + Pasang",
          "rabRatios": {
            "kaca": 0.28,
            "struktur": 0.33,
            "hardware": 0.12,
            "sealant": 0.04,
            "fabrikasi": 0.08,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.06
          }
        }
      ]
    },
    "pintu": {
      "id": "pintu",
      "serviceId": "pintu",
      "serviceName": "Pintu Aluminium",
      "label": "Pintu Aluminium (Swing / Sliding / Folding Modern)",
      "category": "aluminium",
      "priceModel": "aluminium_door",
      "unit": "unit",
      "unitName": "Unit Pintu",
      "calculationType": "unit",
      "priceMin": 1450000,
      "priceMax": 10500000,
      "standardPriceMin": 1450000,
      "standardPriceMax": 4500000,
      "premiumPriceMin": 7500000,
      "premiumPriceMax": 10500000,
      "specification": "Pintu Aluminium Swing 1 Daun Modern Komplit vs Sliding Silent Roller vs Folding Multi-Leaf",
      "minOrderValue": 2500000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "swing": {
          "name": "Pintu Aluminium Swing 1 Daun Modern Komplit",
          "min": 1450000,
          "max": 1850000,
          "target": 1650000,
          "unit": "unit"
        },
        "sliding": {
          "name": "Pintu Aluminium Sliding Geser (Silent Roller Rail)",
          "min": 3200000,
          "max": 4500000,
          "target": 3850000,
          "unit": "unit"
        },
        "folding": {
          "name": "Pintu Aluminium Folding / Lipat (per unit opening)",
          "min": 7500000,
          "max": 10500000,
          "target": 9000000,
          "unit": "unit"
        }
      },
      "summaryLabel": "Tipe Bukaan:",
      "step2Label": "2. Pilih Tipe Bukaan Pintu Aluminium",
      "guideText": "PILIH SISTEM PINTU: Swing, Sliding, atau Folding",
      "defaultQty": 1,
      "presets": [
        1,
        2,
        4,
        6,
        8
      ],
      "options": [
        {
          "id": "swing",
          "name": "Pintu Aluminium Swing 1 Daun Modern Komplit",
          "badge": "Swing 1 Daun Modern (Standard)",
          "desc": "1 Unit pintu swing buka dorong/tarik lengkap kusen 3\"/4\", panel kaca clear 5mm / spandrel dobel aluminium, engsel tebal stainless 4\", lockset mortise lock lever handle awet.",
          "minRate": 1450000,
          "maxRate": 1850000,
          "targetRate": 1650000,
          "rate": "Rp 1.450.000 – Rp 1.850.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Kusen 3\" + Daun Pintu + Kaca 5mm / Spandrel + Mortise Lockset + Engsel Stainless + Jasa Pasang",
          "rabRatios": {
            "kaca": 0.18,
            "struktur": 0.4,
            "hardware": 0.15,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.05
          }
        },
        {
          "id": "sliding",
          "name": "Pintu Aluminium Sliding Geser (Silent Roller Rail)",
          "badge": "Sliding Silent Roller (Premium)",
          "desc": "1 Unit pintu geser hemat ruang, rel gantung / rel bawah aluminium presisi, roda bearing roller hening anti-anjlok, kunci hook lock tanam, stopper peredam benturan.",
          "minRate": 3200000,
          "maxRate": 4500000,
          "targetRate": 3850000,
          "rate": "Rp 3.200.000 – Rp 4.500.000 / unit",
          "leadTime": "4–6 Hari Kerja",
          "formula": "Kusen Pintu + Daun Sliding + Rel Atas Bawah + Roller Bearing + Kunci Hook Lock Tanam + Sealant + Pasang",
          "rabRatios": {
            "kaca": 0.16,
            "struktur": 0.38,
            "hardware": 0.18,
            "sealant": 0.03,
            "fabrikasi": 0.1,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.06
          }
        },
        {
          "id": "folding",
          "name": "Pintu Aluminium Folding / Lipat (per unit opening)",
          "badge": "Folding Multi-Leaf (Heavy)",
          "desc": "Sistem pintu lipat bukaan penuh teras/taman, rel gantung heavy duty, engsel kupu-kupu lipat, flush bolt tanam pengunci atas bawah antar daun.",
          "minRate": 7500000,
          "maxRate": 10500000,
          "targetRate": 9000000,
          "rate": "Rp 7.500.000 – Rp 10.500.000 / unit",
          "leadTime": "5–8 Hari Kerja",
          "formula": "Daun Pintu Lipat + Rel Gantung Heavy + Engsel Lipat SUS304 + Flush Bolt + Kaca 5mm + Pasang Presisi",
          "rabRatios": {
            "kaca": 0.2,
            "struktur": 0.36,
            "hardware": 0.18,
            "sealant": 0.03,
            "fabrikasi": 0.09,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.05
          }
        }
      ]
    },
    "shower": {
      "id": "shower",
      "serviceId": "shower",
      "serviceName": "Shower Kaca",
      "label": "Shower Screen Kaca Kamar Mandi",
      "category": "glass_shower",
      "priceModel": "glass_shower",
      "unit": "unit",
      "unitName": "Set Shower Screen",
      "calculationType": "unit",
      "priceMin": 2000000,
      "priceMax": 5500000,
      "standardPriceMin": 2000000,
      "standardPriceMax": 3000000,
      "premiumPriceMin": 4200000,
      "premiumPriceMax": 5500000,
      "specification": "Framed Shower Screen vs Semi Frameless 8mm vs Full Frameless 10mm SUS304",
      "minOrderValue": 2000000,
      "wasteFactor": 0.05,
      "priceRanges": {
        "framed": {
          "name": "Framed Shower Screen (Bingkai Aluminium Keliling)",
          "min": 2000000,
          "max": 3000000,
          "target": 2500000,
          "unit": "unit"
        },
        "semi_frameless": {
          "name": "Semi Frameless Shower Screen (U-Channel + Header Track)",
          "min": 3300000,
          "max": 4500000,
          "target": 3900000,
          "unit": "unit"
        },
        "frameless": {
          "name": "Full Frameless Shower Screen (Tempered 10 mm SUS304)",
          "min": 4200000,
          "max": 5500000,
          "target": 4800000,
          "unit": "unit"
        }
      },
      "summaryLabel": "Sistem Shower:",
      "step2Label": "2. Pilih Sistem Shower Screen",
      "guideText": "PILIH SISTEM SHOWER: Framed, Semi Frameless, Full Frameless",
      "defaultQty": 1,
      "presets": [
        1,
        2,
        3,
        4,
        5
      ],
      "options": [
        {
          "id": "framed",
          "name": "Framed Shower Screen (Bingkai Aluminium Keliling)",
          "badge": "Framed Ekonomis (Standard)",
          "desc": "Frame aluminium anodize tahan lembab keliling, kaca tempered 6mm / kaca es buram moru, door seal magnet kedap percikan air, handle knop minimalis.",
          "minRate": 2000000,
          "maxRate": 3000000,
          "targetRate": 2500000,
          "rate": "Rp 2.000.000 – Rp 3.000.000 / unit",
          "leadTime": "3–4 Hari Kerja",
          "formula": "Frame Aluminium Shower + Kaca Tempered 6mm + Karet Seal Magnet + Engsel Pivot + Pasang",
          "rabRatios": {
            "kaca": 0.35,
            "struktur": 0.26,
            "hardware": 0.11,
            "sealant": 0.04,
            "fabrikasi": 0.1,
            "pasang": 0.06,
            "transport": 0.02,
            "margin": 0.06
          }
        },
        {
          "id": "semi_frameless",
          "name": "Semi Frameless Shower Screen (U-Channel + Header Track)",
          "badge": "Semi Frameless 8mm",
          "desc": "Kaca Tempered 8mm SNI Asahimas, sekat mati dengan U-channel aluminium tipis dinding & lantai, pintu swing engsel kaca-ke-tembok kuningan lapis chrome.",
          "minRate": 3300000,
          "maxRate": 4500000,
          "targetRate": 3900000,
          "rate": "Rp 3.300.000 – Rp 4.500.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Kaca Tempered 8mm + U-Channel Dinding + Engsel Glass-to-Wall + Handle Handuk L + Sealant Anti Jamur",
          "rabRatios": {
            "kaca": 0.4,
            "struktur": 0.16,
            "hardware": 0.16,
            "sealant": 0.04,
            "fabrikasi": 0.09,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.06
          }
        },
        {
          "id": "frameless",
          "name": "Full Frameless Shower Screen (Tempered 10 mm SUS304)",
          "badge": "Luxury Frameless 10mm (Premium)",
          "desc": "Kaca Tempered 10mm murni frameless bebas bingkai, 2 engsel kuningan SUS304 chrome duty 50kg, pipa stabilizer stainless atas kaca, magnetic seal air 100% kedap.",
          "minRate": 4200000,
          "maxRate": 5500000,
          "targetRate": 4800000,
          "rate": "Rp 4.200.000 – Rp 5.500.000 / unit",
          "leadTime": "4–6 Hari Kerja",
          "formula": "Kaca Tempered 10mm Bevel + Engsel SUS304 + Pipa Stabilizer SUS304 + Handle Handuk L + Sealant Dowsil Sanitasi",
          "rabRatios": {
            "kaca": 0.42,
            "struktur": 0.08,
            "hardware": 0.22,
            "sealant": 0.04,
            "fabrikasi": 0.08,
            "pasang": 0.08,
            "transport": 0.02,
            "margin": 0.06
          }
        }
      ]
    },
    "kusen": {
      "id": "kusen",
      "serviceId": "kusen",
      "serviceName": "Kusen Aluminium",
      "label": "Kusen Aluminium (Profil 3\" / 4\" SNI)",
      "category": "aluminium",
      "priceModel": "aluminium_profile",
      "unit": "m1",
      "unitName": "Meter Lari (m1)",
      "calculationType": "m1",
      "priceMin": 85000,
      "priceMax": 175000,
      "standardPriceMin": 85000,
      "standardPriceMax": 130000,
      "premiumPriceMin": 135000,
      "premiumPriceMax": 175000,
      "specification": "Profil 3\" Standard (Dacon/Inkalum 0.9-1.0mm) vs Profil 4\" Heavy Duty (Alexindo/Alcomexindo 1.1-1.3mm)",
      "minOrderValue": 1000000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "standard": {
          "name": "Standard SNI 3 Inch (Dacon / Inkalum)",
          "min": 85000,
          "max": 130000,
          "target": 105000,
          "unit": "m1"
        },
        "premium": {
          "name": "Premium Grade 4 Inch (Alexindo / Alcomexindo)",
          "min": 135000,
          "max": 175000,
          "target": 155000,
          "unit": "m1"
        }
      },
      "summaryLabel": "Grade Kusen:",
      "step2Label": "2. Pilih Grade Profil Kusen Aluminium",
      "guideText": "Standar SNI 3\" vs Alexindo Heavy 4\"",
      "defaultQty": 12,
      "presets": [
        6,
        12,
        20,
        35,
        50
      ],
      "options": [
        {
          "id": "standard",
          "name": "Standard SNI 3 Inch (Dacon / Inkalum)",
          "badge": "Dacon / Inkalum 3\" (Standard)",
          "desc": "Profil batangan 3\" tebal 0.9–1.0mm, anodize/powder coating standar, perakitan siku miter 45° presisi, sekrup fisher baja + sealant netral.",
          "minRate": 85000,
          "maxRate": 130000,
          "targetRate": 105000,
          "rate": "Rp 212.500 – Rp 275.000 / m1",
          "leadTime": "2–4 Hari Kerja",
          "formula": "(Panjang m1 × Tarif) + Sekrup Fisher + Sealant Neutral + Upah Tukang Presisi + Cutting Waste 8%",
          "rabRatios": {
            "kaca": 0,
            "struktur": 0.54,
            "hardware": 0.08,
            "sealant": 0.08,
            "fabrikasi": 0.12,
            "pasang": 0.08,
            "transport": 0.03,
            "margin": 0.07
          }
        },
        {
          "id": "premium",
          "name": "Premium Grade 4 Inch (Alexindo / Alcomexindo)",
          "badge": "Alexindo 4\" Heavy (Premium)",
          "desc": "Profil batangan 4\" tebal 1.1–1.3mm kekakuan tinggi, bentangan lebar kokoh, powder coating tahan luntur cuaca eksterior, sealant struktural.",
          "minRate": 135000,
          "maxRate": 175000,
          "targetRate": 155000,
          "rate": "Rp 337.500 – Rp 412.500 / m1",
          "leadTime": "3–5 Hari Kerja",
          "formula": "(Panjang m1 × Tarif) + Sekrup Fisher Heavy + Sealant Weatherseal + Upah Pasang + Cutting Waste 8%",
          "rabRatios": {
            "kaca": 0,
            "struktur": 0.56,
            "hardware": 0.08,
            "sealant": 0.07,
            "fabrikasi": 0.12,
            "pasang": 0.07,
            "transport": 0.03,
            "margin": 0.07
          }
        }
      ]
    },
    "pintu_tempered": {
      "id": "pintu_tempered",
      "serviceId": "pintu_tempered",
      "serviceName": "Pintu Kaca Tempered",
      "label": "Pintu Kaca Frameless Floor Hinge",
      "category": "glass_door",
      "priceModel": "glass_door",
      "unit": "unit",
      "unitName": "Set Daun Pintu",
      "calculationType": "unit",
      "priceMin": 2900000,
      "priceMax": 8500000,
      "standardPriceMin": 2900000,
      "standardPriceMax": 5200000,
      "premiumPriceMin": 3900000,
      "premiumPriceMax": 8500000,
      "specification": "Single Leaf Tempered 10mm/12mm BTS 84 vs Dorma BTS 75V vs Double Leaf",
      "minOrderValue": 3000000,
      "wasteFactor": 0.05,
      "priceRanges": {
        "single_10": {
          "name": "Single Leaf Tempered 10 mm + Mesin BTS 84",
          "min": 2900000,
          "max": 3600000,
          "target": 3250000,
          "unit": "unit"
        },
        "single_12": {
          "name": "Single Leaf Tempered 12 mm + Floor Hinge Dorma BTS 75V",
          "min": 3900000,
          "max": 5200000,
          "target": 4550000,
          "unit": "unit"
        },
        "double_12": {
          "name": "Double Leaf (Kupu Tarung) Tempered 12 mm + Dorma",
          "min": 6500000,
          "max": 8500000,
          "target": 7500000,
          "unit": "unit"
        }
      },
      "summaryLabel": "Sistem Bukaan:",
      "step2Label": "2. Pilih Sistem Floor Hinge & Kaca",
      "guideText": "PILIH SISTEM: Single Leaf 10/12mm vs Double Leaf Kupu Tarung",
      "defaultQty": 1,
      "presets": [
        1,
        2,
        3,
        4,
        6
      ],
      "options": [
        {
          "id": "single_10",
          "name": "Single Leaf Tempered 10 mm + Mesin BTS 84",
          "badge": "Single 10mm Standard",
          "desc": "Kaca Tempered 10mm SNI Asahimas, mesin floor hinge Dekkson BTS 84 tanam lantai beton, top patch fitting SUS304, pull handle stainless 60cm, kunci silinder bawah.",
          "minRate": 2900000,
          "maxRate": 3600000,
          "targetRate": 3250000,
          "rate": "Rp 2.900.000 – Rp 3.600.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Kaca Tempered 10mm + Mesin Floor Hinge BTS 84 + Patch Fitting + Pull Handle 60cm + Pasang",
          "rabRatios": {
            "kaca": 0.38,
            "struktur": 0.06,
            "hardware": 0.3,
            "sealant": 0.03,
            "fabrikasi": 0.09,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.05
          }
        },
        {
          "id": "single_12",
          "name": "Single Leaf Tempered 12 mm + Floor Hinge Dorma BTS 75V",
          "badge": "Dorma BTS 75V Heavy (Premium)",
          "desc": "Kaca Tempered 12mm kokoh anti getar, mesin floor hinge Dorma BTS 75V standar gedung komersial, patch fitting SUS304 heavy, pull handle 80cm elegan.",
          "minRate": 3900000,
          "maxRate": 5200000,
          "targetRate": 4550000,
          "rate": "Rp 3.900.000 – Rp 5.200.000 / unit",
          "leadTime": "4–6 Hari Kerja",
          "formula": "Kaca Tempered 12mm + Mesin Floor Hinge Dorma BTS 75V + Patch Fitting Heavy + Pull Handle 80cm + Pasang",
          "rabRatios": {
            "kaca": 0.36,
            "struktur": 0.06,
            "hardware": 0.34,
            "sealant": 0.03,
            "fabrikasi": 0.08,
            "pasang": 0.06,
            "transport": 0.02,
            "margin": 0.05
          }
        },
        {
          "id": "double_12",
          "name": "Double Leaf (Kupu Tarung) Tempered 12 mm + Dorma",
          "badge": "Lobby 2 Daun Kupu Tarung",
          "desc": "2 daun pintu kaca tempered 12mm (opening 180×220cm), 2 unit mesin floor hinge independen, 4 set patch fitting SUS304, 2 pasang pull handle 80cm, kunci sentral lantai.",
          "minRate": 6500000,
          "maxRate": 8500000,
          "targetRate": 7500000,
          "rate": "Rp 6.500.000 – Rp 8.500.000 / unit",
          "leadTime": "5–8 Hari Kerja",
          "formula": "2 Daun Kaca Tempered 12mm + 2 Mesin Floor Hinge + 4 Patch Fitting + 2 Handle 80cm + Central Lock + Pasang",
          "rabRatios": {
            "kaca": 0.36,
            "struktur": 0.06,
            "hardware": 0.34,
            "sealant": 0.03,
            "fabrikasi": 0.08,
            "pasang": 0.06,
            "transport": 0.02,
            "margin": 0.05
          }
        }
      ]
    },
    "bifold": {
      "id": "bifold",
      "serviceId": "bifold",
      "serviceName": "Pintu Lipat Bifold System",
      "label": "Pintu Lipat Bifold System Aluminium",
      "category": "aluminium",
      "priceModel": "aluminium_bifold",
      "unit": "daun",
      "unitName": "Daun Pintu",
      "calculationType": "unit",
      "priceMin": 7500000,
      "priceMax": 10500000,
      "standardPriceMin": 7500000,
      "standardPriceMax": 8750000,
      "premiumPriceMin": 8750000,
      "premiumPriceMax": 10500000,
      "specification": "Bifold Standard Track (Inkalum 1.1mm) vs Heavy Duty Panoramic 250kg (Alexindo 1.3mm)",
      "minOrderValue": 7500000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "standard": {
          "name": "Bifold Standard Track (Inkalum 1.1 mm)",
          "min": 7500000,
          "max": 8750000,
          "target": 8125000,
          "unit": "daun"
        },
        "premium": {
          "name": "Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm / 250 kg)",
          "min": 8750000,
          "max": 10500000,
          "target": 9500000,
          "unit": "daun"
        }
      },
      "summaryLabel": "Grade Bifold:",
      "step2Label": "2. Pilih Grade Rel & Profil Bifold",
      "guideText": "Standard Inkalum vs Premium Alexindo Heavy 250kg",
      "defaultQty": 4,
      "presets": [
        3,
        4,
        5,
        6,
        8
      ],
      "options": [
        {
          "id": "standard",
          "name": "Bifold Standard Track (Inkalum 1.1 mm)",
          "badge": "Inkalum SNI (Standard)",
          "desc": "Profil aluminium tebal 1.1mm, kaca clear 5mm, rel gantung atas & guide rel bawah bantalan roller bearing tahan beban 120kg, engsel lipat antar daun.",
          "minRate": 7500000,
          "maxRate": 8750000,
          "targetRate": 8125000,
          "rate": "Rp 7.000.000 – Rp 8.750.000 / daun",
          "leadTime": "5–7 Hari Kerja",
          "formula": "(Jumlah Daun × Tarif) + Rel Gantung + Roller Bearing + Flush Bolt + Kaca 5mm + Pasang",
          "rabRatios": {
            "kaca": 0.18,
            "struktur": 0.4,
            "hardware": 0.18,
            "sealant": 0.03,
            "fabrikasi": 0.09,
            "pasang": 0.06,
            "transport": 0.01,
            "margin": 0.05
          }
        },
        {
          "id": "premium",
          "name": "Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm / 250 kg)",
          "badge": "Alexindo Heavy 250kg (Premium)",
          "desc": "Profil Alexindo 1.3mm ekstra kaku, kaca tempered 6–8mm, rel gantung heavy duty suspended tahan 250kg buka tutup sangat halus (whisper quiet), flush floor threshold.",
          "minRate": 8750000,
          "maxRate": 10500000,
          "targetRate": 9500000,
          "rate": "Rp 8.750.000 – Rp 12.000.000 / daun",
          "leadTime": "7–10 Hari Kerja",
          "formula": "(Jumlah Daun × Tarif) + Rel Heavy Duty 250kg + Engsel SUS304 + Kaca Tempered + Flush Threshold + Pasang",
          "rabRatios": {
            "kaca": 0.22,
            "struktur": 0.38,
            "hardware": 0.18,
            "sealant": 0.03,
            "fabrikasi": 0.08,
            "pasang": 0.05,
            "transport": 0.01,
            "margin": 0.05
          }
        }
      ]
    },
    "etalase": {
      "id": "etalase",
      "serviceId": "etalase",
      "serviceName": "Etalase Kaca",
      "label": "Etalase Kaca Toko & Display Counter",
      "category": "aluminium",
      "priceModel": "aluminium_showcase",
      "unit": "unit",
      "unitName": "Unit Etalase",
      "calculationType": "unit",
      "priceMin": 1250000,
      "priceMax": 3500000,
      "standardPriceMin": 1250000,
      "standardPriceMax": 1650000,
      "premiumPriceMin": 2400000,
      "premiumPriceMax": 3500000,
      "specification": "Etalase Counter Toko Standar 1.5m vs Showcase Premium Full Tempered LED",
      "minOrderValue": 1250000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "standard": {
          "name": "Etalase Counter Toko Standar 1.5 Meter",
          "min": 1250000,
          "max": 1650000,
          "target": 1450000,
          "unit": "unit"
        },
        "premium": {
          "name": "Display Showcase Premium Full Kaca Tempered + LED",
          "min": 2400000,
          "max": 3500000,
          "target": 2950000,
          "unit": "unit"
        }
      },
      "summaryLabel": "Spesifikasi Etalase:",
      "step2Label": "2. Pilih Spesifikasi Konstruksi Etalase",
      "guideText": "Standard Toko 1.5m vs Premium Display Full Kaca",
      "defaultQty": 1,
      "presets": [
        1,
        2,
        3,
        5,
        8
      ],
      "options": [
        {
          "id": "standard",
          "name": "Etalase Counter Toko Standar 1.5 Meter",
          "badge": "Standard Counter 1.5m",
          "desc": "Ukuran P150 × L50 × T100 cm, frame aluminium silver hollow etalase, kaca polos 5mm SNI, 2 susun rak kaca, pintu geser sliding dengan kunci gergaji, roda rem 2\".",
          "minRate": 1250000,
          "maxRate": 1650000,
          "targetRate": 1450000,
          "rate": "Rp 3.000.000 – Rp 4.125.000 / unit",
          "leadTime": "3–5 Hari Kerja",
          "formula": "Rangka Hollow Etalase + Kaca 5mm + Roda Rem + Kunci Huben + Perakitan Workshop",
          "rabRatios": {
            "kaca": 0.3,
            "struktur": 0.34,
            "hardware": 0.1,
            "sealant": 0.04,
            "fabrikasi": 0.12,
            "pasang": 0.02,
            "transport": 0.02,
            "margin": 0.06
          }
        },
        {
          "id": "premium",
          "name": "Display Showcase Premium Full Kaca Tempered + LED",
          "badge": "Boutique Display + LED (Premium)",
          "desc": "Frame aluminium anodize hitam doff / champagne profil tebal, kaca tempered 6mm tahan gores, lampu LED strip tersembunyi warm/white, kunci sentral keamanan.",
          "minRate": 2400000,
          "maxRate": 3500000,
          "targetRate": 2950000,
          "rate": "Rp 5.000.000 – Rp 8.750.000 / unit",
          "leadTime": "5–7 Hari Kerja",
          "formula": "Rangka Anodize Hitam + Kaca Tempered 6mm + LED Strip Hidden + Kunci Sentral + Fabrikasi",
          "rabRatios": {
            "kaca": 0.32,
            "struktur": 0.32,
            "hardware": 0.12,
            "sealant": 0.04,
            "fabrikasi": 0.1,
            "pasang": 0.02,
            "transport": 0.02,
            "margin": 0.06
          }
        }
      ]
    },
    "acp": {
      "id": "acp",
      "serviceId": "acp",
      "serviceName": "Fasad ACP Aluminium Composite Panel",
      "label": "Fasad ACP Aluminium Composite Panel",
      "category": "facade_acp",
      "priceModel": "acp_facade",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "calculationType": "m2",
      "priceMin": 550000,
      "priceMax": 1600000,
      "standardPriceMin": 550000,
      "standardPriceMax": 750000,
      "premiumPriceMin": 1100000,
      "premiumPriceMax": 1600000,
      "specification": "ACP Interior PE 0.21mm vs Eksterior PVDF 0.30mm vs Heavy Duty 0.50mm (Seven / Marks)",
      "minOrderValue": 3000000,
      "wasteFactor": 0.08,
      "priceRanges": {
        "interior_pe": {
          "name": "ACP Interior PE 0.21 mm (Seven / Marks)",
          "min": 550000,
          "max": 750000,
          "target": 650000,
          "unit": "m²"
        },
        "exterior_pvdf": {
          "name": "ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca",
          "min": 750000,
          "max": 1050000,
          "target": 900000,
          "unit": "m²"
        },
        "heavy_duty_pvdf": {
          "name": "ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)",
          "min": 1100000,
          "max": 1600000,
          "target": 1350000,
          "unit": "m²"
        }
      },
      "summaryLabel": "Grade Panel ACP:",
      "step2Label": "2. Pilih Spesifikasi Panel ACP",
      "guideText": "Tipe cat PE Interior vs PVDF Outdoor 0.3mm vs Heavy Duty 0.5mm",
      "defaultQty": 25,
      "presets": [
        10,
        25,
        50,
        100,
        200
      ],
      "options": [
        {
          "id": "interior_pe",
          "name": "ACP Interior PE 0.21 mm (Seven / Marks)",
          "badge": "Seven Interior PE (Standard)",
          "desc": "Tebal panel 4mm, skin aluminium 0.21mm cat Polyester (PE) untuk dekorasi dinding lobi, resepsionis, cover kolom/pilar & interior toko.",
          "minRate": 550000,
          "maxRate": 750000,
          "targetRate": 650000,
          "rate": "Rp 550.000 – Rp 750.000 / m²",
          "leadTime": "4–7 Hari Kerja",
          "formula": "Panel ACP PE + Rangka Hollow 2×4 + Baut Sekrup + Sealant Interior + Pasang",
          "rabRatios": {
            "kaca": 0,
            "struktur": 0.48,
            "hardware": 0.08,
            "sealant": 0.08,
            "fabrikasi": 0.14,
            "pasang": 0.12,
            "transport": 0.03,
            "margin": 0.07
          }
        },
        {
          "id": "exterior_pvdf",
          "name": "ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca",
          "badge": "Seven Outdoor PVDF (Premium)",
          "desc": "Tebal 4mm skin aluminium 0.30mm coating PVDF tahan panas matahari & hujan garansi warna 10 tahun, rangka hollow galvanis 40×40 anti karat, sealant non-staining.",
          "minRate": 750000,
          "maxRate": 1050000,
          "targetRate": 900000,
          "rate": "Rp 750.000 – Rp 1.050.000 / m²",
          "leadTime": "6–9 Hari Kerja",
          "formula": "Panel ACP PVDF 0.3mm + Rangka Hollow Galvanis 40×40 + Siku Breket + Baut Rivet + Sealant Non-Staining + Pasang",
          "rabRatios": {
            "kaca": 0,
            "struktur": 0.5,
            "hardware": 0.08,
            "sealant": 0.07,
            "fabrikasi": 0.13,
            "pasang": 0.12,
            "transport": 0.03,
            "margin": 0.07
          }
        },
        {
          "id": "heavy_duty_pvdf",
          "name": "ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)",
          "badge": "Alucobond / Alcopan Grade (Heavy)",
          "desc": "Tebal 4mm skin aluminium 0.50mm cat PVDF kualitas gedung komersial/showroom, rangka besi hollow galvanis tebal 1.6mm + scaffolding kerja aman.",
          "minRate": 1100000,
          "maxRate": 1600000,
          "targetRate": 1350000,
          "rate": "Rp 1.100.000 – Rp 1.600.000 / m²",
          "leadTime": "8–14 Hari Kerja",
          "formula": "Panel Heavy PVDF 0.5mm + Rangka Hollow 40×40 1.6mm + Braket Siku + Sealant Dow Corning + Scaffolding + Pasang",
          "rabRatios": {
            "kaca": 0,
            "struktur": 0.52,
            "hardware": 0.08,
            "sealant": 0.06,
            "fabrikasi": 0.13,
            "pasang": 0.11,
            "transport": 0.03,
            "margin": 0.07
          }
        }
      ]
    },
    "curtain_wall": {
      "id": "curtain_wall",
      "serviceId": "curtain_wall",
      "serviceName": "Curtain Wall Fasad Kaca Komersial",
      "label": "Curtain Wall Fasad Kaca Komersial",
      "category": "curtain_wall",
      "priceModel": "curtain_wall",
      "unit": "m²",
      "unitName": "Meter Persegi (m²)",
      "calculationType": "m2",
      "priceMin": 1800000,
      "priceMax": 4200000,
      "standardPriceMin": 1800000,
      "standardPriceMax": 2400000,
      "premiumPriceMin": 3000000,
      "premiumPriceMax": 4200000,
      "specification": "Stick System Mullion + Panasap 6mm Tinted vs Tempered Stopsol 8mm vs Semi-Unitized High-Rise",
      "minOrderValue": 10000000,
      "wasteFactor": 0.05,
      "priceRanges": {
        "stick_panasap": {
          "name": "Stick System Back Mullion + Panasap 6 mm Tinted",
          "min": 1800000,
          "max": 2400000,
          "target": 2100000,
          "unit": "m²"
        },
        "stick_tempered8": {
          "name": "Stick System + Tempered Reflective / Stopsol 8 mm",
          "min": 2200000,
          "max": 3000000,
          "target": 2600000,
          "unit": "m²"
        },
        "semi_unitized": {
          "name": "Semi-Unitized High-Rise + Low-E 10 mm Tempered",
          "min": 3000000,
          "max": 4200000,
          "target": 3600000,
          "unit": "m²"
        }
      },
      "summaryLabel": "Sistem Fasad:",
      "step2Label": "2. Pilih Sistem Mullion & Spesifikasi Kaca",
      "guideText": "Stick System Panasap 6mm vs Reflective 8mm vs Semi-Unitized",
      "defaultQty": 30,
      "presets": [
        15,
        30,
        60,
        120,
        250
      ],
      "options": [
        {
          "id": "stick_panasap",
          "name": "Stick System Back Mullion + Panasap 6 mm Tinted",
          "badge": "Ruko & Gedung Kantor (Standard)",
          "desc": "Rangka mullion aluminium 150mm tebal 1.5mm, kaca Panasap Green / Dark Blue 6mm penolak panas surya, structural sealant Dow Corning, siku baja anchor.",
          "minRate": 1800000,
          "maxRate": 2400000,
          "targetRate": 2100000,
          "rate": "Rp 1.800.000 – Rp 2.400.000 / m²",
          "leadTime": "10–15 Hari Kerja",
          "formula": "Rangka Mullion 150mm + Kaca Panasap 6mm + Structural Silicone + Siku Baja Anchor + Pasang",
          "rabRatios": {
            "kaca": 0.32,
            "struktur": 0.32,
            "hardware": 0.07,
            "sealant": 0.06,
            "fabrikasi": 0.09,
            "pasang": 0.07,
            "transport": 0.02,
            "margin": 0.05
          }
        },
        {
          "id": "stick_tempered8",
          "name": "Stick System + Tempered Reflective / Stopsol 8 mm",
          "badge": "Showroom & Facade 8mm (Premium)",
          "desc": "Rangka mullion aluminium heavy duty 150×50mm tebal 2.0mm, kaca Tempered One-Way Reflective / Stopsol 8mm privasi tinggi & pantul panas optimal.",
          "minRate": 2200000,
          "maxRate": 3000000,
          "targetRate": 2600000,
          "rate": "Rp 2.200.000 – Rp 3.000.000 / m²",
          "leadTime": "12–18 Hari Kerja",
          "formula": "Mullion Heavy 2.0mm + Kaca Tempered Stopsol 8mm + Braket WF Anchor + Sealant Struktural + Pasang",
          "rabRatios": {
            "kaca": 0.35,
            "struktur": 0.31,
            "hardware": 0.07,
            "sealant": 0.05,
            "fabrikasi": 0.09,
            "pasang": 0.06,
            "transport": 0.02,
            "margin": 0.05
          }
        },
        {
          "id": "semi_unitized",
          "name": "Semi-Unitized High-Rise + Low-E 10 mm Tempered",
          "badge": "Green Building Low-E (Heavy Duty)",
          "desc": "Kaca Tempered Low-E 10mm hemat energi AC, fabrikasi panel modul semi-unitized presisi workshop, bracket jangkar baja siku 8mm tebal, scaffolding/gondola.",
          "minRate": 3000000,
          "maxRate": 4200000,
          "targetRate": 3600000,
          "rate": "Rp 3.000.000 – Rp 4.200.000 / m²",
          "leadTime": "15–25 Hari Kerja",
          "formula": "Fabrikasi Modul Semi-Unitized + Kaca Tempered Low-E 10mm + Bracket Jangkar Baja 8mm + Gondola + Pasang",
          "rabRatios": {
            "kaca": 0.38,
            "struktur": 0.28,
            "hardware": 0.07,
            "sealant": 0.05,
            "fabrikasi": 0.09,
            "pasang": 0.06,
            "transport": 0.02,
            "margin": 0.05
          }
        }
      ]
    }
  },
  "constants": {
    "KANOPI_PRICE_RANGES": {
      "hollow_tempered_8": {
        "name": "Rangka Hollow Galvanis 100×50 + Tempered 8 mm",
        "min": 1450000,
        "max": 1750000,
        "target": 1600000,
        "unit": "m²"
      },
      "hollow_tempered_10": {
        "name": "Rangka Hollow 100×50×2 mm + Tempered Clear 10 mm (Target Carport Standar)",
        "min": 1550000,
        "max": 1950000,
        "target": 1750000,
        "unit": "m²"
      },
      "wf_tempered_12": {
        "name": "Rangka Baja WF 150 / Double Hollow + Tempered 12 mm",
        "min": 1750000,
        "max": 2200000,
        "target": 1950000,
        "unit": "m²"
      },
      "stainless_tempered": {
        "name": "Rangka Stainless Steel SUS304 + Tempered 10/12 mm",
        "min": 2800000,
        "max": 3800000,
        "target": 3250000,
        "unit": "m²"
      },
      "laminated_canopy": {
        "name": "Struktur Rangka + Tempered Laminated 5+5 mm PVB",
        "min": 1850000,
        "max": 2400000,
        "target": 2100000,
        "unit": "m²"
      }
    },
    "RAILING_PRICE_RANGES": {
      "uchannel_ss304": {
        "name": "Sistem U-Channel Base Tanam + Tempered 12 mm",
        "min": 2200000,
        "max": 2700000,
        "target": 2450000,
        "unit": "m1"
      },
      "spigot_ss304": {
        "name": "Sistem Spigot Clamp Solid SUS304 + Tempered 12 mm",
        "min": 2400000,
        "max": 3000000,
        "target": 2700000,
        "unit": "m1"
      },
      "handrail_ss304": {
        "name": "Tiang Baluster + Handrail SUS304 + Tempered 10 mm",
        "min": 2400000,
        "max": 3000000,
        "target": 2700000,
        "unit": "m1"
      },
      "railing_tangga": {
        "name": "Railing Tangga Custom Void + Tempered 10/12 mm",
        "min": 2500000,
        "max": 3200000,
        "target": 2850000,
        "unit": "m1"
      }
    },
    "PARTISI_PRICE_RANGES": {
      "standard": {
        "name": "Standard SNI 3 Inch (Dacon/Inkalum + Kaca 5 mm)",
        "min": 650000,
        "max": 850000,
        "target": 750000,
        "unit": "m²"
      },
      "premium": {
        "name": "Premium Grade 4 Inch (Alexindo/Forta + Kaca 6/8 mm)",
        "min": 850000,
        "max": 1200000,
        "target": 1025000,
        "unit": "m²"
      }
    },
    "JENDELA_PRICE_RANGES": {
      "standard": {
        "name": "Standard SNI (Casement 3\" + Kaca 5 mm)",
        "min": 850000,
        "max": 1150000,
        "target": 1000000,
        "unit": "unit"
      },
      "premium": {
        "name": "Premium Grade (Casement 4\" Alexindo + Kaca Panasap/Dekkson)",
        "min": 1200000,
        "max": 1800000,
        "target": 1500000,
        "unit": "unit"
      }
    },
    "PINTU_PRICE_RANGES": {
      "swing": {
        "name": "Pintu Aluminium Swing 1 Daun Modern Komplit",
        "min": 1450000,
        "max": 1850000,
        "target": 1650000,
        "unit": "unit"
      },
      "sliding": {
        "name": "Pintu Aluminium Sliding Geser (Silent Roller Rail)",
        "min": 3200000,
        "max": 4500000,
        "target": 3850000,
        "unit": "unit"
      },
      "folding": {
        "name": "Pintu Aluminium Folding / Lipat (per unit opening)",
        "min": 7500000,
        "max": 10500000,
        "target": 9000000,
        "unit": "unit"
      }
    },
    "SHOWER_PRICE_RANGES": {
      "framed": {
        "name": "Framed Shower Screen (Bingkai Aluminium Keliling)",
        "min": 2000000,
        "max": 3000000,
        "target": 2500000,
        "unit": "unit"
      },
      "semi_frameless": {
        "name": "Semi Frameless Shower Screen (U-Channel + Header Track)",
        "min": 3300000,
        "max": 4500000,
        "target": 3900000,
        "unit": "unit"
      },
      "frameless": {
        "name": "Full Frameless Shower Screen (Tempered 10 mm SUS304)",
        "min": 4200000,
        "max": 5500000,
        "target": 4800000,
        "unit": "unit"
      }
    },
    "KUSEN_PRICE_RANGES": {
      "standard": {
        "name": "Standard SNI 3 Inch (Dacon / Inkalum)",
        "min": 85000,
        "max": 130000,
        "target": 105000,
        "unit": "m1"
      },
      "premium": {
        "name": "Premium Grade 4 Inch (Alexindo / Alcomexindo)",
        "min": 135000,
        "max": 175000,
        "target": 155000,
        "unit": "m1"
      }
    },
    "PINTU_TEMPERED_PRICE_RANGES": {
      "single_10": {
        "name": "Single Leaf Tempered 10 mm + Mesin BTS 84",
        "min": 2900000,
        "max": 3600000,
        "target": 3250000,
        "unit": "unit"
      },
      "single_12": {
        "name": "Single Leaf Tempered 12 mm + Floor Hinge Dorma BTS 75V",
        "min": 3900000,
        "max": 5200000,
        "target": 4550000,
        "unit": "unit"
      },
      "double_12": {
        "name": "Double Leaf (Kupu Tarung) Tempered 12 mm + Dorma",
        "min": 6500000,
        "max": 8500000,
        "target": 7500000,
        "unit": "unit"
      }
    },
    "BIFOLD_PRICE_RANGES": {
      "standard": {
        "name": "Bifold Standard Track (Inkalum 1.1 mm)",
        "min": 7500000,
        "max": 8750000,
        "target": 8125000,
        "unit": "daun"
      },
      "premium": {
        "name": "Bifold Heavy-Duty Panoramic (Alexindo 1.3 mm / 250 kg)",
        "min": 8750000,
        "max": 10500000,
        "target": 9500000,
        "unit": "daun"
      }
    },
    "ETALASE_PRICE_RANGES": {
      "standard": {
        "name": "Etalase Counter Toko Standar 1.5 Meter",
        "min": 1250000,
        "max": 1650000,
        "target": 1450000,
        "unit": "unit"
      },
      "premium": {
        "name": "Display Showcase Premium Full Kaca Tempered + LED",
        "min": 2400000,
        "max": 3500000,
        "target": 2950000,
        "unit": "unit"
      }
    },
    "ACP_PRICE_RANGES": {
      "interior_pe": {
        "name": "ACP Interior PE 0.21 mm (Seven / Marks)",
        "min": 550000,
        "max": 750000,
        "target": 650000,
        "unit": "m²"
      },
      "exterior_pvdf": {
        "name": "ACP Eksterior PVDF 0.30 mm SNI Tahan Cuaca",
        "min": 750000,
        "max": 1050000,
        "target": 900000,
        "unit": "m²"
      },
      "heavy_duty_pvdf": {
        "name": "ACP Heavy-Duty PVDF 0.50 mm (Gedung & High-Rise)",
        "min": 1100000,
        "max": 1600000,
        "target": 1350000,
        "unit": "m²"
      }
    },
    "CURTAIN_WALL_PRICE_RANGES": {
      "stick_panasap": {
        "name": "Stick System Back Mullion + Panasap 6 mm Tinted",
        "min": 1800000,
        "max": 2400000,
        "target": 2100000,
        "unit": "m²"
      },
      "stick_tempered8": {
        "name": "Stick System + Tempered Reflective / Stopsol 8 mm",
        "min": 2200000,
        "max": 3000000,
        "target": 2600000,
        "unit": "m²"
      },
      "semi_unitized": {
        "name": "Semi-Unitized High-Rise + Low-E 10 mm Tempered",
        "min": 3000000,
        "max": 4200000,
        "target": 3600000,
        "unit": "m²"
      }
    },
    "REGIONAL_TRANSPORT_ESTIMATES": {
      "karawang": {
        "name": "Karawang (Basis Workshop: Karawang Barat/Klari/Telukjambe/KIIC)",
        "min": 350000,
        "max": 750000,
        "default": 500000
      },
      "cikampek": {
        "name": "Cikampek & Jatisari (Karawang Timur)",
        "min": 500000,
        "max": 900000,
        "default": 700000
      },
      "cikarang": {
        "name": "Cikarang (Lippo, Jababeka, Delta Mas, MM2100)",
        "min": 750000,
        "max": 1250000,
        "default": 1000000
      },
      "bekasi": {
        "name": "Bekasi (Kota & Kabupaten, Tambun, Cibitung)",
        "min": 1000000,
        "max": 1750000,
        "default": 1350000
      },
      "jakarta": {
        "name": "DKI Jakarta (Pusat, Selatan, Timur, Barat, Utara)",
        "min": 1500000,
        "max": 2500000,
        "default": 2000000
      },
      "depok_tangerang": {
        "name": "Depok, Tangerang & Tangerang Selatan",
        "min": 1750000,
        "max": 3000000,
        "default": 2250000
      },
      "bogor": {
        "name": "Bogor (Kota & Kabupaten)",
        "min": 1750000,
        "max": 3000000,
        "default": 2250000
      }
    },
    "WASTE_FACTORS": {
      "glass": 0.05,
      "aluminium": 0.08,
      "steel": 0.06
    }
  },
  "benchmarks": {
    "region": "Karawang, Cikarang, Bekasi & Jabodetabek (Retail Supplier Benchmark)",
    "transport": {
      "karawang": {
        "name": "Karawang (Basis Workshop: Karawang Barat/Klari/Telukjambe/KIIC)",
        "min": 350000,
        "max": 750000,
        "default": 500000
      },
      "cikampek": {
        "name": "Cikampek & Jatisari (Karawang Timur)",
        "min": 500000,
        "max": 900000,
        "default": 700000
      },
      "cikarang": {
        "name": "Cikarang (Lippo, Jababeka, Delta Mas, MM2100)",
        "min": 750000,
        "max": 1250000,
        "default": 1000000
      },
      "bekasi": {
        "name": "Bekasi (Kota & Kabupaten, Tambun, Cibitung)",
        "min": 1000000,
        "max": 1750000,
        "default": 1350000
      },
      "jakarta": {
        "name": "DKI Jakarta (Pusat, Selatan, Timur, Barat, Utara)",
        "min": 1500000,
        "max": 2500000,
        "default": 2000000
      },
      "depok_tangerang": {
        "name": "Depok, Tangerang & Tangerang Selatan",
        "min": 1750000,
        "max": 3000000,
        "default": 2250000
      },
      "bogor": {
        "name": "Bogor (Kota & Kabupaten)",
        "min": 1750000,
        "max": 3000000,
        "default": 2250000
      }
    },
    "wasteFactors": {
      "glass": 0.05,
      "aluminium": 0.08,
      "steel": 0.06
    }
  }
};

const PRICING_CONFIG = (window.PRICING_CONFIG && window.PRICING_CONFIG.services)
  ? window.PRICING_CONFIG
  : (window.pricingConfig && window.pricingConfig.services)
    ? window.pricingConfig
    : DEFAULT_PRICING_CONFIG;

window.pricingConfig = PRICING_CONFIG;
window.PRICING_CONFIG = PRICING_CONFIG;
const SERVICE_CATALOG = PRICING_CONFIG.services;

(function initCostCalculatorWidget() {
  const ALIAS_MAP = {
    'railing': 'railing',
    'railing-kaca': 'railing',
    'railing-tangga': 'railing',
    'railing-balkon': 'railing',
    'glass-railing': 'railing',
    'railing-kaca-tempered': 'railing',
    'railing-stainless': 'railing',
    'railing_kaca': 'railing',
    'railing_tangga': 'railing',

    'kanopi': 'kanopi',
    'kanopi-kaca': 'kanopi',
    'kanopi-kaca-tempered': 'kanopi',
    'glass-canopy': 'kanopi',
    'canopy': 'kanopi',
    'kanopi_kaca': 'kanopi',

    'kusen': 'kusen',
    'kusen-aluminium': 'kusen',
    'aluminium-profile': 'kusen',
    'kusen_aluminium': 'kusen',

    'pintu': 'pintu',
    'pintu-aluminium': 'pintu',
    'aluminium-door': 'pintu',
    'pintu_aluminium': 'pintu',

    'jendela': 'jendela',
    'jendela-aluminium': 'jendela',
    'aluminium-window': 'jendela',
    'jendela_aluminium': 'jendela',
    'jendela-casement': 'jendela',
    'jendela-sliding': 'jendela',

    'pintu-tempered': 'pintu_tempered',
    'pintu_tempered': 'pintu_tempered',
    'tempered-door': 'pintu_tempered',
    'pintu-kaca': 'pintu_tempered',
    'pintu-kaca-tempered': 'pintu_tempered',
    'pintu_kaca_tempered': 'pintu_tempered',
    'pintu-frameless': 'pintu_tempered',

    'partisi': 'partisi',
    'partisi-kaca': 'partisi',
    'partisi-kaca-aluminium': 'partisi',
    'aluminium-partition': 'partisi',
    'partisi_kaca': 'partisi',

    'shower': 'shower',
    'shower-kaca': 'shower',
    'shower-glass': 'shower',
    'shower-screen': 'shower',
    'shower_kaca': 'shower',

    'bifold': 'bifold',
    'pintu-lipat': 'bifold',
    'pintu-bifold': 'bifold',
    'aluminium-bifold': 'bifold',
    'pintu_lipat': 'bifold',

    'etalase': 'etalase',
    'etalase-kaca': 'etalase',
    'aluminium-showcase': 'etalase',
    'etalase_kaca': 'etalase',

    'acp': 'acp',
    'fasad-acp': 'acp',
    'acp-facade': 'acp',
    'acp-aluminium': 'acp',
    'fasad_acp': 'acp',

    'curtain-wall': 'curtain_wall',
    'curtain_wall': 'curtain_wall',
    'curtainwall': 'curtain_wall',
    'fasad-kaca': 'curtain_wall'
  };

  function resolveServiceKey(val) {
    if (!val) return 'kusen';
    const str = String(val).toLowerCase().trim();
    if (SERVICE_CATALOG[str]) return str;
    if (ALIAS_MAP[str]) return ALIAS_MAP[str];
    const cleaned = str.replace(/[\s_]+/g, '-');
    if (ALIAS_MAP[cleaned]) return ALIAS_MAP[cleaned];
    const rawUnderscore = cleaned.replace(/-/g, '_');
    if (SERVICE_CATALOG[rawUnderscore]) return rawUnderscore;
    for (const [k, v] of Object.entries(SERVICE_CATALOG)) {
      if (v.serviceId === str || v.serviceId === cleaned) return k;
      if (v.serviceName && v.serviceName.toLowerCase().includes(cleaned)) return k;
      if (v.label && v.label.toLowerCase().includes(cleaned)) return k;
    }
    return 'kusen';
  }

  // State management per product
  let currentServiceKey = 'kusen';
  let currentOptionId = 'standard';

  function formatIDRCurrency(val) {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  }

  // Render option cards dynamically based on currentServiceKey
  function renderOptionCards(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const container = document.getElementById('calcOptionsContainer') || document.getElementById('calcOptionsGrid');
    const labelStep2 = document.getElementById('calcStep2Label') || document.getElementById('step2LabelTitle');
    const guideText = document.getElementById('qualityGuideText');

    if (labelStep2 && config.step2Label) {
      labelStep2.textContent = config.step2Label;
    }
    if (guideText && config.guideText) {
      guideText.textContent = config.guideText;
    }

    if (!container) return;

    let html = '';
    config.options.forEach(opt => {
      const isSelected = opt.id === currentOptionId;
      html += `
        <div 
          class="quality-option-card ${isSelected ? 'active' : ''}" 
          id="cardOption_${opt.id}" 
          role="radio" 
          aria-checked="${isSelected ? 'true' : 'false'}" 
          tabindex="0" 
          onclick="window.selectCalcOption('${opt.id}')"
          onkeydown="if(event.key==='Enter'||event.key===' '){ window.selectCalcOption('${opt.id}'); event.preventDefault(); }"
        >
          <div class="quality-card-head">
            <div style="display:flex;align-items:center;">
              <span class="quality-radio-circle" aria-hidden="true"></span>
              <span class="quality-title">${opt.name}</span>
            </div>
            <span class="quality-badge">${opt.badge}</span>
          </div>
          <div class="quality-desc">
            ${opt.desc}
          </div>
          <div>
            <span class="quality-rate-pill">${opt.rate}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Update presets for current service
  function updatePresetsForService(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const row = document.getElementById('qtyPresetRow');
    if (!row) return;

    let html = `<span style="font-size:11.5px;color:#64748b;margin-right:2px;display:inline-flex;align-items:center;">Pilihan Cepat:</span>`;
    config.presets.forEach(p => {
      html += `<button type="button" class="qty-preset-chip" onclick="window.setCalcPreset(${p})">${p} ${config.unit}</button>`;
    });
    row.innerHTML = html;
  }

  // Calculate and update rough estimate & full RAB breakdown
  function updateRoughEstimate() {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    const regionSelect = document.getElementById('calcRegion');
    if (!serviceSelect || !qtyInput) return;

    const serviceKey = resolveServiceKey(serviceSelect ? serviceSelect.value : currentServiceKey);
    currentServiceKey = serviceKey;
    if (serviceSelect && serviceSelect.value !== serviceKey && serviceSelect.querySelector('option[value="' + serviceKey + '"]')) {
      serviceSelect.value = serviceKey;
    }
    const config = SERVICE_CATALOG[serviceKey];
    if (!config) {
      console.error('[Sahabat Aluminium] Service config tidak ditemukan:', serviceKey);
      return;
    }

    let activeOption = config.options.find(o => o.id === currentOptionId);
    if (!activeOption) {
      activeOption = config.options[0];
      currentOptionId = activeOption.id;
    }

    let qty = parseFloat(qtyInput.value) || 1;
    if (qty < 0.1) qty = 0.1;

    // Transport calculation based on selected region:
    const regionKey = (regionSelect && regionSelect.value) || 'karawang';
    const transportConfig = PRICING_CONFIG.benchmarks.transport[regionKey] || PRICING_CONFIG.benchmarks.transport.karawang;
    const regionBadge = document.getElementById('regionTransportBadge');
    if (regionBadge) {
      regionBadge.textContent = transportConfig.name;
    }

    // Material selling price raw calculation:
    const rawMin = Math.round(qty * activeOption.minRate);
    const rawMax = Math.round(qty * activeOption.maxRate);
    const rawTarget = Math.round(qty * (activeOption.targetRate || (activeOption.minRate + activeOption.maxRate) / 2));

    // Minimum order baseline protection for small jobs:
    const minOrderAlert = document.getElementById('calcMinOrderAlert');
    let effectiveMin = rawMin;
    let effectiveMax = rawMax;
    let effectiveTarget = rawTarget;

    if (config.minOrderValue && rawMin < config.minOrderValue) {
      effectiveMin = config.minOrderValue;
      effectiveMax = Math.max(rawMax, Math.round(config.minOrderValue * 1.18));
      effectiveTarget = Math.max(rawTarget, Math.round(config.minOrderValue * 1.08));

      if (minOrderAlert) {
        minOrderAlert.style.display = 'block';
        minOrderAlert.innerHTML = `⚠️ <strong>Ketentuan Minimum Order Lapangan:</strong> ${formatIDRCurrency(config.minOrderValue)} (Pekerjaan volume kecil dikenakan batas minimum handling & mobilisasi teknisi presisi).`;
      }
    } else {
      if (minOrderAlert) {
        minOrderAlert.style.display = 'none';
      }
    }

    // Update displays
    const estimateMain = document.getElementById('calcEstimateMain');
    const estimateSub = document.getElementById('calcEstimateSub');
    const summaryService = document.getElementById('calcSummaryService');
    const summaryQuality = document.getElementById('calcSummaryQuality');
    const summaryQualityLabel = document.getElementById('calcSummaryQualityLabel');
    const summaryQty = document.getElementById('calcSummaryQty');
    const summaryRate = document.getElementById('calcSummaryRate');
    const summaryLeadTime = document.getElementById('calcSummaryLeadTime');
    const summaryRegion = document.getElementById('calcSummaryRegion');
    const qtyUnitSuffix = document.getElementById('qtyUnitSuffix');
    const qtyUnitBadge = document.getElementById('qtyUnitBadge');

    if (estimateMain) estimateMain.textContent = `${formatIDRCurrency(effectiveMin)} – ${formatIDRCurrency(effectiveMax)}`;
    if (estimateSub) estimateSub.textContent = `Acuan tarif: ${activeOption.rate} × ${qty} ${config.unit}`;
    if (summaryService) summaryService.textContent = config.serviceName || config.label;
    if (summaryQualityLabel && config.summaryLabel) summaryQualityLabel.textContent = config.summaryLabel;
    if (summaryQuality) summaryQuality.textContent = `${activeOption.name} (${activeOption.badge})`;
    if (summaryQty) summaryQty.textContent = `${qty} ${config.unitName || config.unit}`;
    if (summaryRate) summaryRate.textContent = activeOption.rate;
    if (summaryLeadTime) summaryLeadTime.textContent = activeOption.leadTime;
    if (summaryRegion) summaryRegion.textContent = transportConfig.name;
    if (qtyUnitSuffix) qtyUnitSuffix.textContent = config.unit;
    if (qtyUnitBadge) qtyUnitBadge.textContent = `Satuan: ${config.unitName || config.unit}`;

    // Detailed RAB Itemized Breakdown calculation:
    const ratios = activeOption.rabRatios || {
      kaca: 0.32,
      struktur: 0.28,
      hardware: 0.08,
      sealant: 0.04,
      fabrikasi: 0.10,
      pasang: 0.10,
      transport: 0.03,
      margin: 0.05
    };

    // Calculate individual components for the transparent RAB table:
    const calcComp = (ratio, minTotal, maxTotal) => {
      const minVal = Math.round(minTotal * ratio);
      const maxVal = Math.round(maxTotal * ratio);
      return `${formatIDRCurrency(minVal)} – ${formatIDRCurrency(maxVal)}`;
    };

    const aluminiumEl = document.getElementById('calcRabAluminium');
    const kacaEl = document.getElementById('calcRabKaca');
    const aksesorisEl = document.getElementById('calcRabAksesoris');
    const hardwareEl = document.getElementById('calcRabHardware');
    const prodLaborEl = document.getElementById('calcRabProdLabor');
    const installLaborEl = document.getElementById('calcRabInstallLabor');
    const transportEl = document.getElementById('calcRabTransport');
    const wasteEl = document.getElementById('calcRabWaste');
    const subtotalEl = document.getElementById('calcRabSubtotal');
    const marginEl = document.getElementById('calcRabMargin');
    const totalEl = document.getElementById('calcRabTotal');

    // Jangan tampilkan HPP/margin internal kepada customer.
    [subtotalEl, marginEl].forEach((el) => {
      if (el && el.parentElement) el.parentElement.style.display = 'none';
    });

    const rabDetailProduct = document.getElementById('rabDetailProduct');
    const rabDetailSpec = document.getElementById('rabDetailSpec');
    const rabDetailVolume = document.getElementById('rabDetailVolume');
    const rabDetailRegion = document.getElementById('rabDetailRegion');

    if (rabDetailProduct) rabDetailProduct.textContent = config.serviceName || config.label;
    if (rabDetailSpec) rabDetailSpec.textContent = `${activeOption.name} [${activeOption.badge}]`;
    if (rabDetailVolume) rabDetailVolume.textContent = `${qty} ${config.unitName || config.unit}`;
    if (rabDetailRegion) rabDetailRegion.textContent = transportConfig.name;

    if (aluminiumEl) aluminiumEl.textContent = calcComp(ratios.struktur, effectiveMin, effectiveMax);
    if (kacaEl) kacaEl.textContent = calcComp(ratios.kaca, effectiveMin, effectiveMax);
    if (aksesorisEl) aksesorisEl.textContent = calcComp(ratios.sealant, effectiveMin, effectiveMax);
    if (hardwareEl) hardwareEl.textContent = calcComp(ratios.hardware, effectiveMin, effectiveMax);
    if (prodLaborEl) prodLaborEl.textContent = calcComp(ratios.fabrikasi, effectiveMin, effectiveMax);
    if (installLaborEl) installLaborEl.textContent = calcComp(ratios.pasang, effectiveMin, effectiveMax);
    if (transportEl) transportEl.textContent = calcComp(ratios.transport, effectiveMin, effectiveMax);
    
    // Cutting waste factor:
    const wasteRatio = config.wasteFactor || 0.06;
    if (wasteEl) wasteEl.textContent = calcComp(wasteRatio, effectiveMin, effectiveMax);

    // Subtotal (HPP + Operational without profit):
    const subtotalMin = Math.round(effectiveMin * (1 - ratios.margin));
    const subtotalMax = Math.round(effectiveMax * (1 - ratios.margin));
    if (subtotalEl) subtotalEl.textContent = `${formatIDRCurrency(subtotalMin)} – ${formatIDRCurrency(subtotalMax)}`;

    // Margin & Risk reserve:
    if (marginEl) marginEl.textContent = calcComp(ratios.margin, effectiveMin, effectiveMax);

    // Final total:
    if (totalEl) totalEl.textContent = `${formatIDRCurrency(effectiveMin)} – ${formatIDRCurrency(effectiveMax)}`;

    // Store state for consultation & actions
    window._lastRoughEstimate = {
      serviceKey: serviceKey,
      service: config.serviceName || config.label,
      category: config.category,
      priceModel: config.priceModel,
      optionId: activeOption.id,
      optionName: activeOption.name,
      badge: activeOption.badge,
      desc: activeOption.desc,
      qty: `${qty} ${config.unitName || config.unit}`,
      rate: activeOption.rate,
      estimateRange: `${formatIDRCurrency(effectiveMin)} – ${formatIDRCurrency(effectiveMax)}`,
      leadTime: activeOption.leadTime,
      formula: activeOption.formula,
      regionName: transportConfig.name,
      disclaimer: 'Harga indikatif / rough budget. Harga final menyesuaikan ukuran, desain, material, hardware, kondisi lokasi, tingkat kesulitan pemasangan, dan hasil survey.'
    };

    // Update Specification Comparison Table dynamically per service
    updateSpecComparisonTable(serviceKey);
  }

  // Update comparison table dynamically according to selected service
  function updateSpecComparisonTable(serviceKey) {
    const validKey = resolveServiceKey(serviceKey);
    const config = SERVICE_CATALOG[validKey] || SERVICE_CATALOG.kusen;
    const badge = document.getElementById('specContextServiceBadge');
    if (badge) {
      badge.textContent = config.serviceName || config.label;
    }

    const table = document.getElementById('specComparisonTable');
    if (!table || !config.options || config.options.length === 0) return;

    const optA = config.options[0];
    const optB = config.options.length > 1 ? config.options[1] : config.options[0];

    const colStd = document.getElementById('thColStandard');
    const colPrem = document.getElementById('thColPremium');
    const tableStdRate = document.getElementById('tableStdRate');
    const tablePremRate = document.getElementById('tablePremRate');
    const btnPickStd = document.getElementById('btnPickStd');
    const btnPickPrem = document.getElementById('btnPickPrem');

    if (colStd && optA) {
      const nameEl = colStd.querySelector('.th-tier-name');
      const pitchEl = colStd.querySelector('.th-tier-pitch');
      const badgeEl = colStd.querySelector('.th-tier-badge');
      if (nameEl) nameEl.textContent = optA.badge || optA.name;
      if (pitchEl) pitchEl.textContent = optA.name;
      if (badgeEl) badgeEl.textContent = 'Pilihan Populer';
      if (tableStdRate) tableStdRate.textContent = optA.rate;
      if (btnPickStd) {
        btnPickStd.onclick = () => window.selectCalcOption(optA.id);
        const isSel = currentOptionId === optA.id;
        btnPickStd.innerHTML = isSel ? '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>' : '<span class="pick-icon">👉</span> <span class="pick-text">Pilih Opsi Ini</span>';
      }
    }

    if (colPrem && optB) {
      const nameEl = colPrem.querySelector('.th-tier-name');
      const pitchEl = colPrem.querySelector('.th-tier-pitch');
      const badgeEl = colPrem.querySelector('.th-tier-badge');
      if (nameEl) nameEl.textContent = optB.badge || optB.name;
      if (pitchEl) pitchEl.textContent = optB.name;
      if (badgeEl) badgeEl.textContent = config.options.length > 1 ? 'Grade Spesifikasi Tinggi' : 'Pilihan Alternatif';
      if (tablePremRate) tablePremRate.textContent = optB.rate;
      if (btnPickPrem) {
        btnPickPrem.onclick = () => window.selectCalcOption(optB.id);
        const isSel = currentOptionId === optB.id;
        btnPickPrem.innerHTML = isSel ? '<span class="pick-icon">✓</span> <span class="pick-text">Sedang Dipilih</span>' : '<span class="pick-icon">⭐</span> <span class="pick-text">Pilih Opsi Ini</span>';
      }
    }

    const dynamicFeatureName = document.getElementById('specDynamicFeatureName');
    const dynamicStdVal = document.getElementById('specDynamicStdVal');
    const dynamicPremVal = document.getElementById('specDynamicPremVal');

    if (dynamicFeatureName) {
      dynamicFeatureName.textContent = `Sistem & Material: ${config.serviceName || config.label}`;
    }
    if (dynamicStdVal && optA) {
      dynamicStdVal.innerHTML = `<strong>${optA.name}</strong><div class="spec-note">${optA.desc}</div>`;
    }
    if (dynamicPremVal && optB) {
      dynamicPremVal.innerHTML = `<strong>${optB.name}</strong><div class="spec-note">${optB.desc}</div>`;
    }

    // Avoid displaying Kusen-specific technical rows for non-kusen services
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      const isKusen = validKey === 'kusen';
      for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = isKusen ? '' : 'none';
      }
    }
  }

  // Public methods
  window.selectCalcOption = function(optionId) {
    currentOptionId = optionId;
    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;

    // Update visual classes in options container
    config.options.forEach(opt => {
      const card = document.getElementById(`cardOption_${opt.id}`);
      if (card) {
        if (opt.id === currentOptionId) {
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
        } else {
          card.classList.remove('active');
          card.setAttribute('aria-checked', 'false');
        }
      }
    });

    updateRoughEstimate();
  };

  // Legacy fallback for backward compatibility
  window.setCalcQuality = function(qualityKey) {
    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
    if (qualityKey === 'premium' && config.options.length > 1) {
      window.selectCalcOption(config.options[1].id);
    } else {
      window.selectCalcOption(config.options[0].id);
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

  window.updateCalcRegion = function() {
    updateRoughEstimate();
  };

  window.toggleRabBreakdown = function() {
    const box = document.getElementById('calcRabBreakdownBox');
    const btn = document.getElementById('btnToggleRabBreakdown');
    if (!box) return;
    const isHidden = box.style.display === 'none' || !box.style.display;
    box.style.display = isHidden ? 'block' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      const arrow = btn.querySelector('span:last-child');
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  };

  window.toggleDimHelper = function() {
    const box = document.getElementById('calcDimHelperBox');
    const btn = document.getElementById('btnToggleDimHelper');
    if (!box) return;
    const isHidden = box.style.display === 'none' || !box.style.display;
    box.style.display = isHidden ? 'block' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      const arrow = btn.querySelector('span:last-child');
      if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
    }
  };

  window.calculateFromDimensions = function() {
    const wInput = document.getElementById('dimHelperWidth');
    const hInput = document.getElementById('dimHelperHeight');
    const qInput = document.getElementById('dimHelperQty');
    const openingSelect = document.getElementById('dimHelperOpeningType');
    const noteEl = document.getElementById('dimHelperResultNote');
    const mainQtyInput = document.getElementById('calcQuantityInput');

    if (!wInput || !hInput || !qInput || !mainQtyInput) return;

    const wCm = parseFloat(wInput.value) || 0;
    const hCm = parseFloat(hInput.value) || 0;
    const units = parseInt(qInput.value, 10) || 1;

    const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;

    let computedQty = 1;
    let noteText = '';

    if (config.unit === 'm²') {
      const areaPerUnit = (wCm / 100) * (hCm / 100);
      computedQty = Math.round(areaPerUnit * units * 10) / 10;
      noteText = `Total Luas: ${computedQty} m² (${units} unit × ${areaPerUnit.toFixed(2)} m²)`;
    } else if (config.unit === 'm1') {
      const isDoor = openingSelect ? openingSelect.value === 'door' : true;
      let kelilingPerUnit = 0;
      if (isDoor) {
        kelilingPerUnit = (2 * hCm + wCm) / 100;
      } else {
        kelilingPerUnit = (2 * hCm + 2 * wCm) / 100;
      }
      computedQty = Math.round(kelilingPerUnit * units * 10) / 10;
      noteText = `Total Panjang: ${computedQty} m1 (${units} opening)`;
    } else {
      computedQty = units;
      noteText = `Total Unit: ${computedQty} ${config.unitName || config.unit}`;
    }

    if (computedQty < 1 && (config.unit === 'unit' || config.unit === 'daun')) computedQty = 1;

    mainQtyInput.value = computedQty;
    if (noteEl) noteEl.textContent = noteText;

    updateRoughEstimate();
  };

  window.toggleSpecComparisonTable = function(show) {
    const modal = document.getElementById('specComparisonModal');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
    }
  };

  window.consultEstimateViaWa = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const message = `*KONSULTASI HASIL ESTIMASI BIAYA WEB*\n` +
      `*Sahabat Kaca Aluminium Karawang*\n` +
      `────────────────────────────\n\n` +
      `Halo Admin, saya baru saja menghitung estimasi anggaran di kalkulator web:\n\n` +
      `🛠️ *Pekerjaan:* ${data.service}\n` +
      `⭐ *Sistem / Spesifikasi:* ${data.optionName} (${data.badge})\n` +
      `📋 *Rincian Teknis:* ${data.desc}\n` +
      `📏 *Kuantitas / Volume:* ${data.qty}\n` +
      `🏷️ *Acuan Tarif:* ${data.rate}\n` +
      `💰 *Rough Budget Estimate:* ${data.estimateRange}\n` +
      `📍 *Wilayah Proyek:* ${data.regionName || 'Karawang'}\n` +
      `⏱️ *Estimasi Waktu:* ${data.leadTime}\n\n` +
      `💡 *Catatan:* ${data.disclaimer}\n\n` +
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

  window.copyEstimateText = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const text = `ESTIMASI ANGGARAN PROYEK (ROUGH BUDGET ESTIMATE)\n` +
      `Sahabat Kaca Aluminium Karawang\n` +
      `Web: https://sahabat-aluminium.my.id\n` +
      `──────────────────────────────────────────────\n` +
      `• Pekerjaan: ${data.service}\n` +
      `• Price Model: ${data.priceModel}\n` +
      `• Spesifikasi / Sistem: ${data.optionName} [${data.badge}]\n` +
      `• Rincian Teknis: ${data.desc}\n` +
      `• Kuantitas / Volume: ${data.qty}\n` +
      `• Acuan Tarif Satuan: ${data.rate}\n` +
      `• Perkiraan Anggaran: ${data.estimateRange}\n` +
      `• Wilayah Proyek: ${data.regionName || 'Karawang'}\n` +
      `• Estimasi Waktu Kerja: ${data.leadTime}\n` +
      `• Formula RAB: ${data.formula}\n` +
      `• Biaya Survey Lokasi: Rp 0 (100% GRATIS se-Karawang & Bekasi)\n` +
      `──────────────────────────────────────────────\n` +
      `*Catatan: ${data.disclaimer}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('calcCopyBtn');
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ Tersalin!';
          btn.style.background = '#0d9488';
          btn.style.borderColor = '#0d9488';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 2500);
        }
      }).catch(() => {
        prompt('Salin rincian estimasi di bawah ini:', text);
      });
    } else {
      prompt('Salin rincian estimasi di bawah ini:', text);
    }
  };

  window.printEstimateSheet = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const data = window._lastRoughEstimate;
    if (!data) return;

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Rough Budget Estimate - Sahabat Kaca Aluminium</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 36px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
          .title { font-size: 22px; font-weight: 800; color: #072e3b; margin: 0; }
          .badge { background: #f0fdfa; color: #0d9488; border: 1.5px solid #99f6e4; padding: 5px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table td, .table th { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 13.5px; }
          .table th { background: #f8fafc; text-align: left; width: 32%; color: #334155; font-weight: 700; }
          .total-box { background: #f0fdfa; border: 2px solid #0d9488; border-radius: 12px; padding: 18px 22px; margin: 25px 0; }
          .total-label { font-size: 12.5px; color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
          .total-val { font-size: 26px; font-weight: 800; color: #0f766e; margin-top: 4px; }
          .footer { margin-top: 36px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print { .no-print { display: none !important; } body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Sahabat Kaca Aluminium</h1>
            <div style="font-size:13px;color:#64748b;margin-top:2px;">Spesialis Kaca Tempered, Kusen & Fasad Aluminium Karawang - Bekasi</div>
          </div>
          <div class="badge">Rough Budget Estimate</div>
        </div>
        <table class="table">
          <tr><th>Pekerjaan</th><td><strong>${data.service}</strong></td></tr>
          <tr><th>Price Model & Kategori</th><td><strong>${data.priceModel}</strong> (${data.category.toUpperCase()})</td></tr>
          <tr><th>Sistem / Spesifikasi</th><td><strong>${data.optionName}</strong> (${data.badge})</td></tr>
          <tr><th>Rincian Material & Teknis</th><td>${data.desc}</td></tr>
          <tr><th>Volume Dihitung</th><td><strong>${data.qty}</strong></td></tr>
          <tr><th>Acuan Tarif Satuan</th><td>${data.rate}</td></tr>
          <tr><th>Wilayah Proyek</th><td>${data.regionName || 'Karawang'}</td></tr>
          <tr><th>Estimasi Waktu Kerja</th><td>${data.leadTime}</td></tr>
          <tr><th>Formula RAB</th><td>${data.formula}</td></tr>
          <tr><th>Biaya Survey & Pengukuran Laser</th><td><strong style="color:#0d9488;">Rp 0 (100% GRATIS)</strong></td></tr>
        </table>
        <div class="total-box">
          <div class="total-label">Perkiraan Estimasi Anggaran Proyek:</div>
          <div class="total-val">${data.estimateRange}</div>
          <div style="font-size:12px;color:#0f766e;margin-top:6px;">*${data.disclaimer}</div>
        </div>
        <div class="footer">
          <div>Dokumen rincian estimasi resmi web: https://sahabat-aluminium.my.id</div>
          <div>Konsultasi & Kunci Jadwal Survey: WhatsApp <strong>0896-3737-1166</strong> • Karawang, Jawa Barat</div>
        </div>
        <div class="no-print" style="margin-top:24px;text-align:center;">
          <button onclick="window.print()" style="padding:10px 22px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;">🖨️ Cetak / Simpan PDF Sekarang</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  function setupEventListeners() {
    const serviceSelect = document.getElementById('calcServiceType');
    const qtyInput = document.getElementById('calcQuantityInput');
    const regionSelect = document.getElementById('calcRegion');

    if (serviceSelect && !serviceSelect._hasListener) {
      serviceSelect._hasListener = true;
      serviceSelect.addEventListener('change', () => {
        const newKey = resolveServiceKey(serviceSelect.value);
        currentServiceKey = newKey;
        serviceSelect.value = newKey;
        const config = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
        currentOptionId = config.options[0].id;
        if (qtyInput) {
          qtyInput.value = config.defaultQty || 1;
        }
        updatePresetsForService(currentServiceKey);
        renderOptionCards(currentServiceKey);
        updateRoughEstimate();
      });
    }

    if (qtyInput && !qtyInput._hasListener) {
      qtyInput._hasListener = true;
      qtyInput.addEventListener('input', updateRoughEstimate);
      qtyInput.addEventListener('change', updateRoughEstimate);
    }

    if (regionSelect && !regionSelect._hasListener) {
      regionSelect._hasListener = true;
      regionSelect.addEventListener('change', updateRoughEstimate);
    }

    // Initial render & pre-selection detection
    let sParam = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      sParam = urlParams.get('service') || urlParams.get('calc') || urlParams.get('id') || urlParams.get('layanan');

      if (!sParam && window.location.hash.includes('service=')) {
        const hashPart = window.location.hash.split('?')[1] || window.location.hash.split('&')[1];
        if (hashPart) {
          const hashParams = new URLSearchParams(hashPart);
          sParam = hashParams.get('service');
        }
      }

      if (!sParam && typeof sessionStorage !== 'undefined') {
        sParam = sessionStorage.getItem('ska_rab_preselect');
        sessionStorage.removeItem('ska_rab_preselect');
      }
    } catch (e) {}

    if (sParam) {
      currentServiceKey = resolveServiceKey(sParam);
      if (serviceSelect) {
        serviceSelect.value = currentServiceKey;
      }
      setTimeout(() => {
        const calcSection = document.getElementById('kalkulator-biaya');
        if (calcSection) {
          calcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else if (serviceSelect && serviceSelect.value) {
      currentServiceKey = resolveServiceKey(serviceSelect.value);
    } else {
      currentServiceKey = 'kusen';
    }

    const initConfig = SERVICE_CATALOG[currentServiceKey] || SERVICE_CATALOG.kusen;
    currentOptionId = initConfig.options[0].id;
    if (qtyInput) {
      qtyInput.value = initConfig.defaultQty || 1;
    }

    updatePresetsForService(currentServiceKey);
    renderOptionCards(currentServiceKey);
    updateRoughEstimate();
  }

  window.updateRoughEstimate = updateRoughEstimate;
  window.updateCalcEstimate = updateRoughEstimate;
  window.resolveServiceKey = resolveServiceKey;
  window.initCostCalculator = setupEventListeners;

  // Bind on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }
})();

/* =========================================================================
   CLIENT-SIDE SPA ROUTER FOR SAHABAT KACA ALUMINIUM
   Dynamically manages pages (/tentang-kami, /layanan, /hitung-estimasi, etc.)
   while preserving styles, handling browser history, and updating content.
   ========================================================================= */
(function() {
  'use strict';

  // In-memory cache for fetched pages
  const pageCache = new Map();
  let isNavigating = false;

  // Create or retrieve top progress bar
  function getProgressBar() {
    let bar = document.getElementById('spa-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'spa-progress-bar';
      bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#0d9488,#2dd4bf,#ffd88a);z-index:999999;transition:width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;width:0%;opacity:0;pointer-events:none;box-shadow:0 0 10px rgba(45,212,191,0.7);';
      document.body.appendChild(bar);
    }
    return bar;
  }

  function showProgress() {
    const bar = getProgressBar();
    bar.style.opacity = '1';
    bar.style.width = '30%';
    setTimeout(() => {
      if (isNavigating) bar.style.width = '70%';
    }, 150);
  }

  function finishProgress() {
    const bar = getProgressBar();
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => {
        bar.style.width = '0%';
      }, 250);
    }, 150);
  }

  // Get or initialize #spa-content wrapper between <header> and <footer>
  function getSpaContainer() {
    let container = document.getElementById('spa-content');
    if (container) return container;

    const header = document.querySelector('header.site-header') || document.querySelector('header');
    const footer = document.querySelector('footer');

    if (!header || !footer) return null;

    container = document.createElement('div');
    container.id = 'spa-content';
    container.className = 'spa-content';
    container.style.cssText = 'display:block;width:100%;min-height:50vh;transition:opacity 0.15s ease-out;';

    // Insert container immediately after header
    header.parentNode.insertBefore(container, header.nextSibling);

    // Move all siblings between header and footer into container
    let next = container.nextSibling;
    while (next && next !== footer) {
      const current = next;
      next = current.nextSibling;
      container.appendChild(current);
    }

    return container;
  }

  // Extract content between header and footer from parsed doc
  function extractPageContent(newDoc) {
    const existingSpa = newDoc.getElementById('spa-content');
    if (existingSpa) return existingSpa.innerHTML;

    const header = newDoc.querySelector('header.site-header') || newDoc.querySelector('header');
    const footer = newDoc.querySelector('footer');

    if (header && footer) {
      let html = '';
      let curr = header.nextElementSibling;
      while (curr && curr !== footer) {
        html += curr.outerHTML + '\n';
        curr = curr.nextElementSibling;
      }
      return html;
    }

    const main = newDoc.querySelector('main');
    if (main) return main.outerHTML;

    return newDoc.body.innerHTML;
  }

  // Sync head metadata (title, description, canonical, open graph, stylesheets, and styles)
  function syncHeadMetadata(newDoc) {
    // 1. Title
    if (newDoc.title) {
      document.title = newDoc.title;
    }

    // 2. Meta description
    const newDesc = newDoc.querySelector('meta[name="description"]');
    if (newDesc) {
      let desc = document.querySelector('meta[name="description"]');
      if (!desc) {
        desc = document.createElement('meta');
        desc.name = 'description';
        document.head.appendChild(desc);
      }
      desc.content = newDesc.content;
    }

    // 3. Canonical
    const newCanon = newDoc.querySelector('link[rel="canonical"]');
    if (newCanon) {
      let canon = document.querySelector('link[rel="canonical"]');
      if (!canon) {
        canon = document.createElement('link');
        canon.rel = 'canonical';
        document.head.appendChild(canon);
      }
      canon.href = newCanon.href;
    }

    // 4. Stylesheets: add any missing <link rel="stylesheet">
    newDoc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const absHref = new URL(href, window.location.origin).href;
        const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => {
          return new URL(l.getAttribute('href'), window.location.origin).href === absHref;
        });
        if (!exists) {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href;
          document.head.appendChild(newLink);
        }
      }
    });

    // 5. Injected page-specific <style> tags
    document.querySelectorAll('style[data-spa-injected]').forEach(el => el.remove());
    newDoc.querySelectorAll('head style').forEach(style => {
      const newStyle = document.createElement('style');
      newStyle.setAttribute('data-spa-injected', 'true');
      newStyle.textContent = style.textContent;
      document.head.appendChild(newStyle);
    });
  }

  // Update navigation active states
  function updateNavActiveState(pathname) {
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    // Reset all nav links
    nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));

    // Highlight dropdown for /layanan routes
    const dropdown = document.getElementById('navDropdownLayanan');
    const dropdownBtn = document.getElementById('dropdownLayananBtn');
    if (dropdown && cleanPath.startsWith('/layanan')) {
      dropdown.classList.add('active');
      if (dropdownBtn) dropdownBtn.classList.add('active');
    } else if (dropdown) {
      dropdown.classList.remove('active');
    }

    // Find and highlight matching link
    nav.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const linkPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
      if (linkPath === cleanPath) {
        a.classList.add('active');
      }
    });

    // Close mobile menus
    nav.classList.remove('open');
    if (dropdown) dropdown.classList.remove('active-mobile');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // Re-run inline and page-specific scripts
  function executePageScripts(container, newDoc) {
    const scriptsToRun = [];

    // Scripts inside the new content container
    container.querySelectorAll('script').forEach(s => scriptsToRun.push(s));

    // Scripts in newDoc body (bottom scripts)
    const footerInDoc = newDoc.querySelector('footer');
    if (footerInDoc) {
      let next = footerInDoc.nextElementSibling;
      while (next) {
        if (next.tagName === 'SCRIPT') {
          const src = next.getAttribute('src') || '';
          if (!src.includes('script.js') && !src.includes('googletagmanager') && !src.includes('pagead2') && !src.includes('html2pdf')) {
            scriptsToRun.push(next);
          }
        }
        next = next.nextElementSibling;
      }
    }

    scriptsToRun.forEach(oldScript => {
      const src = oldScript.getAttribute('src');
      if (src) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          document.body.appendChild(s);
        }
      } else if (oldScript.textContent.trim()) {
        try {
          const s = document.createElement('script');
          s.textContent = oldScript.textContent;
          document.body.appendChild(s);
          s.remove();
        } catch (err) {
          console.warn('Script execution notice:', err);
        }
      }
      if (oldScript.parentNode) {
        oldScript.remove();
      }
    });
  }

  // Re-bind interactive components on page change
  function reinitializeComponents(pathname) {
    // 1. Calculator
    if (document.getElementById('kalkulator-biaya') || document.getElementById('calcServiceType')) {
      if (typeof window.initCostCalculator === 'function') {
        try {
          window.initCostCalculator();
        } catch (e) {
          console.warn('Calculator re-init:', e);
        }
      }
    }

    // 2. Lightbox attachments
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImage');
    const lbTitle = document.getElementById('lightboxTitle');
    if (lb && lbImg) {
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.onclick = function() {
          lbImg.src = item.dataset.image || '';
          lbImg.alt = item.dataset.title || '';
          if (lbTitle) lbTitle.textContent = item.dataset.title || '';
          lb.classList.add('open');
          lb.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        };
      });
    }

    // 3. Re-bind dropdown & mobile menu toggles
    const nav = document.querySelector('#mainNav');
    if (nav) {
      document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
        btn.onclick = function(e) {
          if (window.innerWidth <= 992) {
            e.preventDefault();
            e.stopPropagation();
            const parent = btn.closest('.nav-dropdown');
            if (parent) parent.classList.toggle('active-mobile');
          }
        };
      });
      document.querySelectorAll('#mainNav a:not(.nav-dropdown-toggle)').forEach(a => {
        a.onclick = function() {
          nav.classList.remove('open');
          const openDd = document.querySelector('.nav-dropdown.active-mobile');
          if (openDd) openDd.classList.remove('active-mobile');
        };
      });
    }

    // 4. FAQ Accordion toggles if present
    document.querySelectorAll('.faq-toggle, .faq-question').forEach(btn => {
      btn.onclick = function() {
        const item = btn.closest('.faq-item, .faq-card');
        if (item) item.classList.toggle('active');
      };
    });
  }

  // Fetch page HTML with caching
  async function fetchPage(url) {
    const cleanUrl = url.split('#')[0];
    if (pageCache.has(cleanUrl)) {
      return pageCache.get(cleanUrl);
    }
    const res = await fetch(cleanUrl, {
      headers: { 'X-Requested-With': 'SPARouter' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    pageCache.set(cleanUrl, text);
    return text;
  }

  // Main Navigate function
  async function navigate(url, options = {}) {
    const { pushState = true, scrollToTop = true } = options;
    const targetUrl = new URL(url, window.location.origin);
    const path = targetUrl.pathname;
    const hash = targetUrl.hash;
    const search = targetUrl.search;

    // Check same page anchor navigation
    if (path === window.location.pathname && search === window.location.search) {
      if (hash) {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (pushState) window.history.pushState({ path: targetUrl.href }, '', targetUrl.href);
      } else if (scrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (isNavigating) return;
    isNavigating = true;
    showProgress();

    try {
      const htmlText = await fetchPage(targetUrl.href);
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(htmlText, 'text/html');

      // 1. Sync Head metadata & styles
      syncHeadMetadata(newDoc);

      // 2. Extract & swap page content
      const container = getSpaContainer();
      if (container) {
        container.style.opacity = '0.7';
        const newHtml = extractPageContent(newDoc);
        container.innerHTML = newHtml;
        requestAnimationFrame(() => {
          container.style.opacity = '1';
        });

        // 3. Execute scripts inside new content
        executePageScripts(container, newDoc);
      }

      // 4. Update Nav active indicators
      updateNavActiveState(path);

      // 5. Update history
      if (pushState) {
        window.history.pushState({ path: targetUrl.href }, '', targetUrl.href);
      }

      // 6. Reinitialize interactive components
      reinitializeComponents(path);

      // 7. Scroll handling
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else if (scrollToTop) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }

      // 8. Event notification
      window.dispatchEvent(new CustomEvent('spa:navigated', {
        detail: { url: targetUrl.href, pathname: path }
      }));

    } catch (err) {
      console.warn('SPA navigation fallback to standard load:', err);
      window.location.href = targetUrl.href;
    } finally {
      isNavigating = false;
      finishProgress();
    }
  }

  // Prefetch a route into cache
  function prefetch(url) {
    try {
      const u = new URL(url, window.location.origin);
      if (u.origin !== window.location.origin) return;
      if (/\.(pdf|png|jpe?g|webp|svg|css|js|json|xml|txt)$/i.test(u.pathname)) return;
      const cleanUrl = u.origin + u.pathname + u.search;
      if (!pageCache.has(cleanUrl)) {
        fetch(cleanUrl, { priority: 'low' })
          .then(r => r.text())
          .then(text => pageCache.set(cleanUrl, text))
          .catch(() => {});
      }
    } catch (e) {}
  }

  // Global link interception
  function initLinkInterception() {
    document.addEventListener('click', function(e) {
      // Find closest anchor tag
      const a = e.target.closest('a');
      if (!a || !a.href) return;

      // Ignore modified clicks or secondary button clicks
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Ignore target="_blank", download, or external protocols
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;

      const url = new URL(a.href, window.location.origin);

      // Ignore external domains
      if (url.origin !== window.location.origin) return;

      // Ignore static file downloads or media
      if (/\.(pdf|png|jpe?g|webp|svg|css|js|json|xml|txt)$/i.test(url.pathname)) return;

      // Same-page anchor handling
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        const targetEl = document.querySelector(url.hash);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', url.hash);
        }
        return;
      }

      // Intercept and navigate client-side!
      e.preventDefault();
      navigate(a.href);
    }, false);

    // Popstate listener for back/forward buttons
    window.addEventListener('popstate', function() {
      navigate(window.location.href, { pushState: false });
    });

    // Prefetch on hover and touchstart
    let prefetchTimeout = null;
    document.addEventListener('mouseover', function(e) {
      const a = e.target.closest('a');
      if (a && a.href) {
        clearTimeout(prefetchTimeout);
        prefetchTimeout = setTimeout(() => prefetch(a.href), 50);
      }
    }, { passive: true });

    document.addEventListener('touchstart', function(e) {
      const a = e.target.closest('a');
      if (a && a.href) prefetch(a.href);
    }, { passive: true });
  }

  // Bootstrap router on page load
  function initRouter() {
    // Cache current page HTML
    pageCache.set(window.location.origin + window.location.pathname + window.location.search, document.documentElement.outerHTML);

    // Ensure #spa-content is initialized
    getSpaContainer();

    // Set active link on initial load
    updateNavActiveState(window.location.pathname);

    // Bind link click interception
    initLinkInterception();

    // Re-bind components
    reinitializeComponents(window.location.pathname);
  }

  // Expose router API globally
  window.router = {
    navigate: navigate,
    prefetch: prefetch,
    clearCache: () => pageCache.clear(),
    getCurrentPath: () => window.location.pathname
  };
  window.SPARouter = window.router;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
})();

// Auto-run SERVICE_MASTER on DOMContentLoaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (window.SERVICE_MASTER && window.SERVICE_MASTER.init) window.SERVICE_MASTER.init();
    });
  } else {
    if (window.SERVICE_MASTER && window.SERVICE_MASTER.init) window.SERVICE_MASTER.init();
  }
}