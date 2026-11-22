import {initialLanguage,applyLanguage,trackHeader} from './language.js';
applyLanguage(initialLanguage());trackHeader();
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.language)));


// Limit the automatic promotion to once every 20 minutes in this browser.
const promotionStorageKey='tokyo-nye-last-shown';
const promotionInterval=20*60*1000;
let lastShown=0;
const promotion=document.querySelector('#nye-promo');
const promotionClose=promotion.querySelector('.nye-close');
function openPromotion(){
 if(promotion.open)return;
 const now=Date.now();
 try{lastShown=Number(localStorage.getItem(promotionStorageKey))||lastShown;}catch{}
 if(lastShown>0&&now-lastShown<promotionInterval)return;
 promotion.showModal();
 lastShown=now;
 try{localStorage.setItem(promotionStorageKey,String(now));}catch{}
 document.documentElement.classList.add('modal-open');
}
promotionClose.addEventListener('click',()=>promotion.close());
promotion.addEventListener('click',event=>{
 if(event.target!==promotion)return;
 const bounds=promotion.getBoundingClientRect();
 if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)promotion.close();
});
promotion.addEventListener('close',()=>{
 document.documentElement.classList.remove('modal-open');
 document.querySelector('.nye-entry').focus({preventScroll:true});
});
window.addEventListener('pageshow',event=>{if(event.persisted)openPromotion();});
openPromotion();
