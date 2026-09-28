/**
 * Google AdSense Exclusive Integration
 * Sahabat Kaca Aluminium - Karawang, Cikarang & Bekasi
 * Publisher ID: ca-pub-2437971183769682
 */
(function() {
  'use strict';

  const DEFAULT_PUB_ID = 'ca-pub-2437971183769682';

  // Remove any legacy manual ad elements, floating sidebars, or placeholders
  function removeLegacyAdElements() {
    const selectors = [
      '.ad-space',
      '.side-ad',
      '.ad-side',
      '.ad-left',
      '.ad-right',
      '.ad-sidebar-header',
      '.ad-card-link',
      '.ad-banner-inner',
      '.ad-type-badge',
      '[data-ad-position="left"]',
      '[data-ad-position="right"]'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  }

  // Load configuration from server
  async function loadAdSenseConfig() {
    try {
      const res = await fetch('/api/ads-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config && data.config.adsense) {
          return data.config.adsense;
        }
      }
    } catch (e) {
      // Fallback to default
    }

    return {
      enabled: true,
      publisherId: 'pub-2437971183769682',
      autoAds: true,
      slots: {
        top: { enabled: true, slotId: '8912345671', format: 'auto' },
        in_article: { enabled: true, slotId: '8912345672', format: 'auto' },
        bottom: { enabled: true, slotId: '8912345673', format: 'auto' }
      }
    };
  }

  // Inject official Google AdSense script
  function injectAdSenseScript(publisherId) {
    const cleanPub = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;
    const scriptId = 'google-adsense-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cleanPub)}`;
    document.head.appendChild(script);
  }

  // Create an AdSense <ins> tag
  function createAdSenseTag(cleanPub, slotId, format = 'auto') {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = cleanPub;
    if (slotId) {
      ins.dataset.adSlot = slotId;
    }
    ins.dataset.adFormat = format;
    ins.dataset.fullWidthResponsive = 'true';
    return ins;
  }

  // Push to AdSense queue
  function pushAdSense() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense handles its own errors
    }
  }

  // Populate existing in-article .adsense-slot elements
  function setupArticleSlots(cleanPub, slotConfig) {
    const articleSlots = document.querySelectorAll('.adsense-slot');
    articleSlots.forEach(slot => {
      // If already initialized, skip
      if (slot.querySelector('.adsbygoogle')) return;

      const slotId = slotConfig?.slotId || '8912345672';
      const ins = createAdSenseTag(cleanPub, slotId, 'auto');
      slot.innerHTML = '';
      slot.appendChild(ins);
      pushAdSense();

      // Collapse if unfilled by Google
      const observer = new MutationObserver(() => {
        if (ins.getAttribute('data-ad-status') === 'unfilled') {
          slot.style.display = 'none';
        }
      });
      observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    });
  }

  // Insert standard top and bottom AdSense units
  function setupLayoutSlots(cleanPub, config) {
    const main = document.querySelector('main');
    const header = document.querySelector('header.site-header, header');
    const footer = document.querySelector('footer');
    if (!main) return;

    // Top AdSense Unit (between Header and Main)
    if (config.slots?.top?.enabled && !document.getElementById('adsense-top-wrap')) {
      const topWrap = document.createElement('div');
      topWrap.id = 'adsense-top-wrap';
      topWrap.className = 'adsense-wrapper';
      const topIns = createAdSenseTag(cleanPub, config.slots.top.slotId, config.slots.top.format || 'auto');
      topWrap.appendChild(topIns);

      if (header && header.parentNode) {
        header.parentNode.insertBefore(topWrap, main);
      } else {
        main.parentNode.insertBefore(topWrap, main);
      }
      pushAdSense();

      const topObs = new MutationObserver(() => {
        if (topIns.getAttribute('data-ad-status') === 'unfilled') {
          topWrap.style.display = 'none';
        }
      });
      topObs.observe(topIns, { attributes: true, attributeFilter: ['data-ad-status'] });
    }

    // Bottom AdSense Unit (before Footer)
    if (config.slots?.bottom?.enabled && footer && !document.getElementById('adsense-bottom-wrap')) {
      const bottomWrap = document.createElement('div');
      bottomWrap.id = 'adsense-bottom-wrap';
      bottomWrap.className = 'adsense-wrapper';
      const bottomIns = createAdSenseTag(cleanPub, config.slots.bottom.slotId, config.slots.bottom.format || 'auto');
      bottomWrap.appendChild(bottomIns);

      footer.parentNode.insertBefore(bottomWrap, footer);
      pushAdSense();

      const bottomObs = new MutationObserver(() => {
        if (bottomIns.getAttribute('data-ad-status') === 'unfilled') {
          bottomWrap.style.display = 'none';
        }
      });
      bottomObs.observe(bottomIns, { attributes: true, attributeFilter: ['data-ad-status'] });
    }
  }

  async function init() {
    removeLegacyAdElements();

    const config = await loadAdSenseConfig();
    if (!config || config.enabled === false) {
      return;
    }

    const publisherId = config.publisherId || DEFAULT_PUB_ID;
    const cleanPub = publisherId.startsWith('ca-') ? publisherId : `ca-${publisherId}`;

    injectAdSenseScript(cleanPub);
    setupArticleSlots(cleanPub, config.slots?.in_article);
    setupLayoutSlots(cleanPub, config);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
