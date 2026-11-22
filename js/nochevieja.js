import {initialLanguage,applyLanguage,trackHeader} from './language.js';
const copy={
 es:{title:'Cena de Nochevieja · TOKYO',date:'31 de diciembre · Una noche para celebrar',dinner:'Cena de',night:'Nochevieja',person:'POR PERSONA · IVA INCLUIDO',buffet:'BUFFET LIBRE',drinks:'BEBIDA ILIMITADA',caption:'Come todo lo que quieras. ¡Y brinda por lo que viene!',cta:'Todo lo que incluye tu cena',includes:'Una cena para celebrarlo todo',benefitTitles:['Bebida ilimitada','Postre incluido','Uvas y cotillón'],benefitDescriptions:['Refrescos, agua, cerveza, vino y cava.','El toque dulce de la noche.','Las uvas de la suerte y el cotillón, incluidos.'],coffee:'Y café incluido.',children:'Los pequeños, a mitad de precio',childCondition:'Para niños de menos de 120 cm de altura.',conditions:'Para disfrutar de la noche',ruleTitles:['Pide lo que vayas a disfrutar','Celebración en la mesa'],ruleDescriptions:['Rogamos no desperdiciar la comida pedida. La comida sobrante se cobrará desde 5 € hasta un máximo de 15 €.','No habrá baile.'],vat:'Todos los precios incluyen el 10 % de IVA.',note:'Puede haber pequeñas diferencias entre las imágenes de los platos de la carta y su presentación real.',greeting:'¡Feliz Año Nuevo!'},
 en:{title:'New Year’s Eve Dinner · TOKYO',date:'31 December · A night to celebrate',dinner:'Dinner on',night:'New Year’s Eve',person:'PER PERSON · VAT INCLUDED',buffet:'ALL YOU CAN EAT',drinks:'UNLIMITED DRINKS',caption:'Eat all you like. Here’s to what comes next!',cta:'Discover everything included',includes:'Everything for a night to celebrate',benefitTitles:['Unlimited drinks','Dessert included','Grapes & party favours'],benefitDescriptions:['Soft drinks, water, beer, wine and cava.','A sweet way to end the evening.','Lucky grapes and party favours are included.'],coffee:'Coffee is included too.',children:'Children dine for half price',childCondition:'For children under 120 cm tall.',conditions:'Before the celebration',ruleTitles:['Order what you will enjoy','A celebration at the table'],ruleDescriptions:['Please avoid wasting food. Leftover food will incur a charge of €5 up to a maximum of €15.','There will be no dancing.'],vat:'All prices include 10% VAT.',note:'There may be slight differences between menu photographs and the dishes served.',greeting:'Happy New Year!'}
};
function set(selector,text){const element=document.querySelector(selector);if(element)element.textContent=text;}
function update(language){
 applyLanguage(language);const t=copy[language];document.title=t.title;
 set('.eyebrow',t.date);
 const heading=document.querySelector('.hero h1'),label=document.createElement('span');label.textContent=t.dinner;heading.replaceChildren(label,document.createTextNode(t.night));
 for(const [selector,key] of [['.per-person','person'],['.buffet','buffet'],['.unlimited','drinks'],['.offer-caption','caption'],['#incluye-titulo','includes'],['.benefit .extra','coffee'],['.children>strong','children'],['.children>small','childCondition'],['#condiciones-titulo','conditions'],['.footer-greeting','greeting']])set(selector,t[key]);
 const cta=document.querySelector('.hero-cta'),arrow=document.createElement('span');arrow.textContent='↓';arrow.setAttribute('aria-hidden','true');cta.replaceChildren(document.createTextNode(t.cta+' '),arrow);
 document.querySelectorAll('.benefit h3').forEach((el,i)=>el.textContent=t.benefitTitles[i]);
 document.querySelectorAll('.benefit p:not(.extra)').forEach((el,i)=>el.textContent=t.benefitDescriptions[i]);
 document.querySelectorAll('.rule').forEach((rule,i)=>{
  const title=rule.querySelector('h3'),symbol=title.querySelector('.triangle');title.replaceChildren(...(symbol?[symbol]:[]),document.createTextNode(t.ruleTitles[i]));
  const paragraph=rule.querySelector('p');paragraph.textContent=t.ruleDescriptions[i];
 });
 const vat=document.createElement('strong');vat.textContent=t.vat;document.querySelector('.footnotes').replaceChildren(vat,document.createTextNode(' '+t.note));
}
update(initialLanguage());trackHeader();
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>update(button.dataset.language)));
