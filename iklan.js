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

  // Fetch full configuration (combining API and localStorage)
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
      // offline or static fallback
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
      slots: {}
    };

    return { adminAds, adsense };
  }

  function removeOldPlaceholders(){
    document.querySelectorAll('.ad-space, .side-ad').forEach(el => el.remove());
  }

  function createSlot(position){
    const slot = document.createElement('div');
    slot.className = 'ad-slot ad-' + position;
    slot.dataset.adPosition = position;
    slot.setAttribute('aria-label','Area Iklan ' + position);
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

  // Load Google AdSense Script if Auto Ads or AdSense enabled
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

  // Render Google AdSense Unit
  function renderAdSenseUnit(slot, slotConfig, publisherId, fallbackAdminAds, position){
    slot.innerHTML = '';
    const cleanPub = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;
    const slotId = slotConfig?.slotId || '8912345671';
    const format = slotConfig?.format || 'auto';

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.width = '100%';
    ins.style.minHeight = position === 'top' ? '60px' : (position === 'bottom' ? '90px' : '180px');
    ins.dataset.adClient = cleanPub;
    ins.dataset.adSlot = slotId;
    ins.dataset.adFormat = format;
    ins.dataset.fullWidthResponsive = 'true';

    // Label AdSense
    const badge = document.createElement('span');
    badge.className = 'ad-type-badge adsense-badge';
    badge.textContent = 'Google AdSense';

    slot.appendChild(badge);
    slot.appendChild(ins);
    slot.classList.add('has-content', 'is-adsense-slot');

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch(e) {
      console.warn('AdSense push error:', e);
      if (fallbackAdminAds && fallbackAdminAds.length) {
        renderAdminAds(slot, fallbackAdminAds, position);
      }
    }
  }

  function renderAdItem(ad, position){
    const item = document.createElement('div');
    item.className = 'ad-item';

    const html = String(ad.html || '').trim();
    const image = String(ad.image || '').trim();
    const link = String(ad.link || '').trim();

    if(html){
      const htmlWrap = document.createElement('div');
      htmlWrap.className = 'ad-html';
      htmlWrap.innerHTML = html;
      item.appendChild(htmlWrap);
      return item;
    }

    if(image){
      const img = document.createElement('img');
      img.src = image;
      img.alt = String(ad.name || 'Iklan Sahabat Kaca Aluminium');
      img.loading = 'lazy';
      img.addEventListener('error',function(){
        item.innerHTML = '<div class="ad-placeholder">SPACE IKLAN ADMIN<small>' + esc(ad.name || 'Gambar tidak dapat dimuat') + '</small></div>';
      },{once:true});

      if(link){
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer sponsored';
        a.appendChild(img);
        item.appendChild(a);
      }else{
        item.appendChild(img);
      }
      return item;
    }

    item.innerHTML = '<div class="ad-placeholder">SPACE IKLAN ADMIN<small>' + esc(ad.name || '') + '</small></div>';
    return item;
  }

  function renderAdminAds(slot, ads, position){
    slot.innerHTML = '';
    slot.classList.remove('has-content', 'is-adsense-slot');

    const active = ads.filter(ad => ad && ad.active && ad.position === position);
    if(!active.length){
      slot.innerHTML = '<div class="ad-placeholder">IKLAN ADMIN (MANDIRI)<small>' +
        (position === 'top' ? 'Banner Atas 970 × 100' :
         position === 'bottom' ? 'Banner Bawah 970 × 250' : 'Sidebar 160 × 300') +
        '</small></div>';
      return;
    }

    slot.classList.add('has-content');
    
    // Add Admin Ad Badge
    const badge = document.createElement('span');
    badge.className = 'ad-type-badge admin-badge';
    badge.textContent = 'Iklan Mitra / Admin';
    slot.appendChild(badge);

    active.forEach((ad, index) => {
      const item = renderAdItem(ad, position);
      item.classList.toggle('active', index === 0);
      slot.appendChild(item);
    });

    if(active.length > 1){
      state[position] = state[position] || {index:0,timer:null};
      clearInterval(state[position].timer);
      state[position].index = 0;
      state[position].timer = setInterval(()=>{
        const items = Array.from(slot.querySelectorAll('.ad-item'));
        if(items.length < 2) return;
        items.forEach(el => el.classList.remove('active'));
        state[position].index = (state[position].index + 1) % items.length;
        items[state[position].index].classList.add('active');
      }, 5000);
    }else if(state[position]?.timer){
      clearInterval(state[position].timer);
      state[position].timer = null;
    }
  }

  function renderSlotWithSeparation(slot, config, position){
    if(!slot) return;
    const { adminAds, adsense } = config;
    const slotAdSense = adsense?.slots?.[position] || {};
    const mode = slotAdSense.mode || (adsense?.enabled ? 'hybrid' : 'admin');

    // Slot turned off
    if(mode === 'off' || slotAdSense.enabled === false && mode === 'adsense'){
      slot.style.display = 'none';
      return;
    }
    slot.style.display = '';

    // Route based on explicit separation
    if(mode === 'adsense' && adsense?.enabled){
      renderAdSenseUnit(slot, slotAdSense, adsense.publisherId, [], position);
    } else if(mode === 'hybrid' && adsense?.enabled && slotAdSense.slotId){
      renderAdSenseUnit(slot, slotAdSense, adsense.publisherId, adminAds, position);
    } else {
      // Default: Admin Ads (Iklan Mandiri / Banner Toko)
      renderAdminAds(slot, adminAds, position);
    }
  }

  async function renderAll(slots){
    const config = await loadConfig();
    
    // Check if AdSense autoAds or slots enabled
    if(config.adsense?.enabled && (config.adsense?.autoAds || Object.values(config.adsense?.slots || {}).some(s => s.enabled))){
      injectAdSenseScript(config.adsense.publisherId, config.adsense.autoAds);
    }

    renderSlotWithSeparation(slots.top, config, 'top');
    renderSlotWithSeparation(slots.bottom, config, 'bottom');
    renderSlotWithSeparation(slots.left, config, 'left');
    renderSlotWithSeparation(slots.right, config, 'right');
  }

  function init(){
    if(location.pathname.endsWith('/admin') || location.pathname.includes('/admin/')) return;
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
