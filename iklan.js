(function(){
  'use strict';

  const STORAGE_KEY = 'sahabat_kaca_aluminium_ads_v1';
  const POSITIONS = ['top','bottom','left','right'];
  const state = {};

  function esc(value){
    return String(value ?? '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function getAds(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    }catch(e){
      return [];
    }
  }

  function removeOldPlaceholders(){
    document.querySelectorAll('.ad-space, .side-ad').forEach(el => el.remove());
  }

  function createSlot(position){
    const slot = document.createElement('div');
    slot.className = 'ad-slot ad-' + position;
    slot.dataset.adPosition = position;
    slot.setAttribute('aria-label','Iklan ' + position);
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

    return {top,bottom,left,right};
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
      img.alt = String(ad.name || 'Iklan');
      img.loading = 'lazy';
      img.addEventListener('error',function(){
        item.innerHTML = '<div class="ad-placeholder">SPACE IKLAN<small>' + esc(ad.name || 'Gambar iklan tidak dapat dimuat') + '</small></div>';
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

    item.innerHTML = '<div class="ad-placeholder">SPACE IKLAN<small>' + esc(ad.name || '') + '</small></div>';
    return item;
  }

  function renderSlot(slot, ads, position){
    if(!slot) return;
    slot.innerHTML = '';
    slot.classList.remove('has-content');

    const active = ads.filter(ad => ad && ad.active && ad.position === position);
    if(!active.length){
      slot.innerHTML = '<div class="ad-placeholder">SPACE IKLAN<small>' +
        (position === 'top' ? 'Banner Atas 970 × 100' :
         position === 'bottom' ? 'Banner Bawah 970 × 250' : '160 × 300') +
        '</small></div>';
      return;
    }

    slot.classList.add('has-content');
    active.forEach((ad,index)=>{
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
      },5000);
    }else if(state[position]?.timer){
      clearInterval(state[position].timer);
      state[position].timer = null;
    }
  }

  function renderAll(slots){
    const ads = getAds();
    renderSlot(slots.top, ads, 'top');
    renderSlot(slots.bottom, ads, 'bottom');
    renderSlot(slots.left, ads, 'left');
    renderSlot(slots.right, ads, 'right');
  }

  function init(){
    if(location.pathname.endsWith('/admin') || location.pathname.includes('/admin/')) return;
    removeOldPlaceholders();
    const slots = insertSlots();
    if(!slots) return;
    renderAll(slots);

    window.addEventListener('storage',function(event){
      if(event.key === STORAGE_KEY) renderAll(slots);
    });

    document.addEventListener('visibilitychange',function(){
      if(!document.hidden) renderAll(slots);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
