const {chromium}=require(process.env.TOKYO_PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'..');
const base=process.env.TOKYO_PREVIEW_URL||'http://127.0.0.1:8021';
(async()=>{
 const menu=JSON.parse(fs.readFileSync(`${root}/data/menu.json`));
 const lunch=JSON.parse(fs.readFileSync(`${root}/data/lunch.json`));
 const drinks=JSON.parse(fs.readFileSync(`${root}/data/drinks.json`));
 for(const items of [menu,lunch.dishes,drinks.dishes]){
  assert.equal(new Set(items.map(d=>d.reference)).size,items.length);
  for(const d of items){assert.ok(d.name.es&&d.name.en);if(d.image)assert.ok(fs.existsSync(`${root}/${d.image}`),d.image);}
 }
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(base);await page.locator('.experience-button').last().waitFor();
 assert.equal(await page.locator('.experience-button').count(),5);
 if(await page.locator('#nye-promo').count() && await page.locator('#nye-promo').evaluate(e=>e.open))await page.locator('.nye-close').click();
 await page.screenshot({path:`${root}/tmp/home-mobile.png`,fullPage:true});
 for(const mode of ['carta','buffet','drinks','lunch']){
  await page.goto(`${base}/menu.html?mode=${mode}`);await page.locator('#menu[aria-busy="false"]').waitFor();
  const expected=mode==='carta'?menu.length:mode==='buffet'?menu.filter(d=>d.category!=='postres').length:mode==='drinks'?drinks.dishes.length:lunch.dishes.length;
  assert.equal(await page.locator('.dish-card').count(),expected,mode);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode} overflow`);
  if(mode==='buffet'){await page.locator('#conditions-open').click();assert.ok(await page.locator('#conditions-dialog').evaluate(e=>e.open));await page.locator('#conditions-close').click();}
  if(mode==='lunch'){
   assert.match(await page.locator('#mode-summary').innerText(),/16,90/);
   await page.getByRole('button',{name:'Cena',exact:true}).click();const dinner=await page.locator('#mode-summary').innerText();assert.match(dinner,/19,90/);assert.match(dinner,/20,90/);assert.match(dinner,/lunes a jueves/);
   await page.screenshot({path:`${root}/tmp/menu-cena-mobile.png`});
   await page.locator('[data-language="en"]').click();assert.match(await page.locator('#mode-summary').innerText(),/Monday to Thursday/);
   await page.locator('#theme-toggle').click();
  }
  if(mode==='carta'){
   await page.locator('#dish-PS184').getByRole('button',{name:'Mango · Sin gluten',exact:true}).click();assert.match(await page.locator('#dish-PS184 .dish-media img').getAttribute('src'),/mochi-mango/);
   await page.locator('#dish-E6 .allergen-button').click();assert.equal(await page.locator('#allergens-E6').isVisible(),true);
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}/menu.html?mode=carta`);await page.locator('#menu[aria-busy="false"]').waitFor();await page.screenshot({path:`${root}/tmp/carta-desktop.png`});
 assert.deepEqual(errors,[]);await browser.close();console.log(`OK: ${menu.length} platos, ${lunch.dishes.length} de comida/cena, ${drinks.dishes.length} bebidas; navegación, idiomas, horarios, precios, alérgenos, sabores y móvil.`);
})().catch(e=>{console.error(e);process.exit(1)});
