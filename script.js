const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#mainNav');
if(toggle) toggle.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
