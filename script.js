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
