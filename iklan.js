(function(){
  'use strict';

  const STORAGE_KEY_ADMIN = 'sahabat_kaca_aluminium_ads_v1';
  const STORAGE_KEY_ADSENSE = 'sahabat_kaca_aluminium_adsense_v1';
  const POSITIONS = ['top', 'bottom', 'left', 'right'];
  const state = {};

  function esc(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  // Fetch full configuration (combining server JSON and local storage)
  async function loadConfig(){
    let remoteConfig = null;
    try {
      const res = await fetch('/api/ads-config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.config) {
          remoteConfig = json.config;
        }
      }
    } catch(e) {
      // Offline or static fallback
    }

    let localAdminAds = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ADMIN);
      if (raw) localAdminAds = JSON.parse(raw);
    } catch(e) {}

    let localAdSense = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ADSENSE);
      if (raw) localAdSense = JSON.parse(raw);
    } catch(e) {}

    const adminAds = (localAdminAds && localAdminAds.length)
      ? localAdminAds
      : (remoteConfig?.adminAds || []);

    const adsense = localAdSense || remoteConfig?.adsense || {
      enabled: true,
      publisherId: "pub-2437971183769682",
      autoAds: false,
      slots: {
        top: { enabled: true, slotId: "8912345671", format: "horizontal", mode: "hybrid" },
        bottom: { enabled: true, slotId: "8912345672", format: "horizontal", mode: "hybrid" },
        left: { enabled: true, slotId: "8912345674", format: "vertical", mode: "hybrid" },
        right: { enabled: true, slotId: "8912345675", format: "vertical", mode: "hybrid" }
      }
    };

    return { adminAds, adsense };
  }

  function removeOldPlaceholders(){
    document.querySelectorAll('.ad-space, .side-ad').forEach(el => el.remove());
  }

  function createSlot(position){
    const slot = document.createElement('div');
    const isSidebar = (position === 'left' || position === 'right');
    slot.className = 'ad-slot ad-' + position + (isSidebar ? ' ad-side' : '');
    slot.dataset.adPosition = position;
    slot.setAttribute('aria-label', 'Area Iklan ' + position);

    // If previously dismissed in current session, hide initially
    if (isSidebar) {
      try {
        if (sessionStorage.getItem('ad_dismissed_' + position) === 'true') {
          slot.classList.add('is-dismissed');
          slot.style.display = 'none';
        }
      } catch(e) {}
    }

    return slot;
  }

  function insertSlots(){
    const header = document.querySelector('header.site-header, header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    if(!main || !footer) return null;

    const top = createSlot('top');
    const bottom = createSlot('bottom');
    const left = createSlot('left');
    const right = createSlot('right');

    if(header && header.parentNode){
      header.parentNode.insertBefore(top, main);
    }else{
      main.parentNode.insertBefore(top, main);
    }
    footer.parentNode.insertBefore(bottom, footer);
    document.body.appendChild(left);
    document.body.appendChild(right);

    return {top, bottom, left, right};
  }

  // Load Google AdSense Script once
  function injectAdSenseScript(publisherId, isAutoAds){
    if(!publisherId) return;
    const cleanPub = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;
    const scriptId = 'google-adsense-script';
    if(document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cleanPub)}`;
    document.head.appendChild(script);
  }

  // Create Sidebar Header Bar with Label & Dismiss Button
  function createSidebarHeader(position, isAdSense = false){
    const header = document.createElement('div');
    header.className = 'ad-sidebar-header';

    const label = document.createElement('span');
    label.className = 'ad-sidebar-label' + (isAdSense ? ' adsense-label' : '');
    label.textContent = isAdSense ? 'Google AdSense' : 'Iklan Sponsor';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ad-close-btn';
    closeBtn.setAttribute('aria-label', 'Tutup Iklan');
    closeBtn.title = 'Tutup Iklan';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slot = header.closest('.ad-slot');
      if (slot) {
        slot.classList.add('is-dismissed');
        try {
          sessionStorage.setItem('ad_dismissed_' + position, 'true');
        } catch(err) {}
        setTimeout(() => {
          slot.style.display = 'none';
        }, 360);
      }
    });

    header.appendChild(label);
    header.appendChild(closeBtn);
    return header;
  }

  // Render Horizontal Banner Content (Top / Bottom)
  function renderHorizontalBanner(ad, position){
    const a = document.createElement('a');
    a.className = 'ad-banner-inner';
    a.href = ad.link || 'https://wa.me/6289637371166';
    a.target = '_blank';
    a.rel = 'noopener noreferrer sponsored';

    const imgUrl = ad.image || '/assets/gallery/pintu-aluminium.jpg';
    const title = ad.title || ad.name || 'Spesialis Kaca & Aluminium Karawang';
    const subtitle = ad.subtitle || 'Kusen Aluminium SNI, Pintu, Jendela & Partisi Kaca';
    const cta = ad.ctaText || 'Konsultasi WhatsApp →';

    a.innerHTML = `
      <div class="ad-banner-media">
        <img src="${esc(imgUrl)}" alt="${esc(title)}" loading="lazy">
      </div>
      <div class="ad-banner-text">
        <h4 class="ad-banner-title">${esc(title)}</h4>
        <p class="ad-banner-desc">${esc(subtitle)}</p>
      </div>
      <span class="ad-banner-cta">${esc(cta)}</span>
    `;
    return a;
  }

  // Render Vertical Sidebar Ad Card (Left / Right)
  function renderSidebarCard(ad, position){
    const card = document.createElement('div');
    card.className = 'ad-sidebar-body';

    const a = document.createElement('a');
    a.className = 'ad-card-link';
    a.href = ad.link || 'https://wa.me/6289637371166';
    a.target = '_blank';
    a.rel = 'noopener noreferrer sponsored';

    const imgUrl = ad.image || (position === 'left' ? '/assets/gallery/pintu-sliding.jpg' : '/assets/gallery/partisi-aluminium.jpg');
    const title = ad.title || ad.name || (position === 'left' ? 'Pintu & Jendela' : 'Partisi & Kanopi');
    const subtitle = ad.subtitle || (position === 'left' ? 'Kusen Alexindo / Inkalum SNI' : 'Kaca Tempered 8-12mm Standar Pabrik');
    const badgeText = ad.badge || (position === 'left' ? 'PROMO' : 'SURVEY GRATIS');
    const ctaText = ad.ctaText || 'Chat WhatsApp →';

    a.innerHTML = `
      <div class="ad-card-thumb">
        <img src="${esc(imgUrl)}" alt="${esc(title)}" loading="lazy">
        <span class="ad-card-badge">${esc(badgeText)}</span>
      </div>
      <h4 class="ad-card-title">${esc(title)}</h4>
      <p class="ad-card-desc">${esc(subtitle)}</p>
      <span class="ad-card-btn">${esc(ctaText)}</span>
    `;

    card.appendChild(a);
    return card;
  }

  // Render Manual Ads
  function renderAdminAds(slot, ads, position){
    slot.innerHTML = '';
    const isSidebar = (position === 'left' || position === 'right');

    const active = ads.filter(ad => ad && ad.active && ad.position === position);
    
    // Provide attractive default if no specific ad configured
    const effectiveAd = active.length > 0 ? active[0] : {
      id: `default-${position}`,
      name: position === 'left' ? 'Pintu Sliding Aluminium' : (position === 'right' ? 'Partisi Kaca Tempered' : 'Promo Kaca Aluminium'),
      title: position === 'left' ? 'Pintu Sliding & Jendela' : (position === 'right' ? 'Partisi Kaca & Kanopi' : 'Promo Kusen Aluminium Karawang'),
      subtitle: position === 'left' ? 'Kusen Alexindo / Inkalum SNI' : (position === 'right' ? 'Kaca Tempered 8-12mm Bergaransi' : 'Survey & Konsultasi Gratis'),
      image: position === 'left' ? '/assets/gallery/pintu-sliding.jpg' : (position === 'right' ? '/assets/gallery/partisi-aluminium.jpg' : '/assets/gallery/pintu-aluminium.jpg'),
      link: 'https://wa.me/6289637371166',
      badge: position === 'left' ? 'PROMO TERBAIK' : 'SURVEY GRATIS',
      ctaText: 'Chat WhatsApp →',
      active: true
    };

    if(isSidebar){
      slot.appendChild(createSidebarHeader(position, false));
      const card = renderSidebarCard(effectiveAd, position);
      slot.appendChild(card);
    } else {
      const banner = renderHorizontalBanner(effectiveAd, position);
      slot.appendChild(banner);
    }
  }

  // Render Google AdSense Unit
  function renderAdSenseUnit(slot, slotConfig, publisherId, fallbackAdminAds, position){
    slot.innerHTML = '';
    const cleanPub = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;
    const slotId = slotConfig?.slotId || '8912345671';
    const isSidebar = (position === 'left' || position === 'right');
    const format = isSidebar ? 'vertical' : (slotConfig?.format || 'auto');

    if(isSidebar){
      slot.appendChild(createSidebarHeader(position, true));
    }

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.width = '100%';
    ins.style.minHeight = isSidebar ? '280px' : (position === 'top' ? '80px' : '90px');
    ins.dataset.adClient = cleanPub;
    ins.dataset.adSlot = slotId;
    ins.dataset.adFormat = format;
    ins.dataset.fullWidthResponsive = 'true';

    slot.appendChild(ins);
    slot.classList.add('has-content', 'is-adsense-slot');

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch(e) {
      console.warn('AdSense push error, falling back to manual banner:', e);
      if(fallbackAdminAds && fallbackAdminAds.length){
        renderAdminAds(slot, fallbackAdminAds, position);
      }
    }
  }

  function renderSlotWithSeparation(slot, config, position){
    if(!slot) return;
    const { adminAds, adsense } = config;
    const slotAdSense = adsense?.slots?.[position] || {};
    const mode = slotAdSense.mode || (adsense?.enabled ? 'hybrid' : 'admin');

    if(mode === 'off' || (slotAdSense.enabled === false && mode === 'adsense')){
      slot.style.display = 'none';
      return;
    }
    
    // Check if dismissed
    if((position === 'left' || position === 'right') && slot.classList.contains('is-dismissed')){
      slot.style.display = 'none';
      return;
    }

    slot.style.display = '';

    if(mode === 'adsense' && adsense?.enabled){
      renderAdSenseUnit(slot, slotAdSense, adsense.publisherId, adminAds, position);
    } else if(mode === 'hybrid' && adsense?.enabled && slotAdSense.slotId){
      renderAdSenseUnit(slot, slotAdSense, adsense.publisherId, adminAds, position);
    } else {
      renderAdminAds(slot, adminAds, position);
    }
  }

  async function renderAll(slots){
    const config = await loadConfig();

    if(config.adsense?.enabled && (config.adsense?.autoAds || Object.values(config.adsense?.slots || {}).some(s => s.enabled))){
      injectAdSenseScript(config.adsense.publisherId, config.adsense.autoAds);
    }

    renderSlotWithSeparation(slots.top, config, 'top');
    renderSlotWithSeparation(slots.bottom, config, 'bottom');
    renderSlotWithSeparation(slots.left, config, 'left');
    renderSlotWithSeparation(slots.right, config, 'right');
  }

  function init(){
    removeOldPlaceholders();
    const slots = insertSlots();
    if(!slots) return;
    renderAll(slots);

    window.addEventListener('storage', function(event){
      if(event.key === STORAGE_KEY_ADMIN || event.key === STORAGE_KEY_ADSENSE){
        renderAll(slots);
      }
    });

    document.addEventListener('visibilitychange', function(){
      if(!document.hidden) renderAll(slots);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  }else{
    init();
  }
})();
