const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menuButton.setAttribute('aria-expanded','false');nav.classList.remove('open')}));

const modal=document.querySelector('#intro-modal');
const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');modal.querySelector('.modal-close').focus()};
const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');document.querySelector('#watch-open').focus()};
document.querySelector('#watch-open').addEventListener('click',openModal);
modal.querySelectorAll('.modal-close,.modal-backdrop').forEach(el=>el.addEventListener('click',closeModal));
document.querySelector('#modal-contact').addEventListener('click',()=>{modal.classList.remove('open');document.body.classList.remove('modal-open')});

const searchPanel=document.querySelector('.search-panel');
const searchInput=searchPanel.querySelector('input');
const searchOpen=()=>{searchPanel.classList.add('open');searchPanel.setAttribute('aria-hidden','false');searchInput.focus()};
const searchClose=()=>{searchPanel.classList.remove('open');searchPanel.setAttribute('aria-hidden','true');document.querySelector('.search-open').focus()};
document.querySelector('.search-open').addEventListener('click',searchOpen);
searchPanel.querySelector('.search-close').addEventListener('click',searchClose);
searchPanel.addEventListener('click',e=>{if(e.target===searchPanel)searchClose()});
searchInput.addEventListener('input',()=>{const q=searchInput.value.trim().toLowerCase();searchPanel.querySelectorAll('.search-results a').forEach(a=>a.hidden=q&&!a.textContent.toLowerCase().includes(q))});
searchPanel.querySelectorAll('.search-results a').forEach(a=>a.addEventListener('click',searchClose));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal.classList.contains('open'))closeModal();if(searchPanel.classList.contains('open'))searchClose()}});
document.querySelector('#year').textContent=new Date().getFullYear();
