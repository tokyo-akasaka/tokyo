const {chromium}=require(process.env.TOKYO_PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const base='http://127.0.0.1:8022';
(async()=>{
 const server=spawn(process.execPath,[path.join(__dirname,'serve.cjs')],{cwd:root,env:{...process.env,PORT:'8022'}});
 let browser;
 try{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited: ${code}`)));});
  browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base);await page.locator('#nye-promo[open]').waitFor();
  assert.equal(await page.locator('.experience-button').count(),5);
  assert.equal(await page.locator('.nye-entry').getAttribute('href'),'index_tokyo.html');
  await page.screenshot({path:`${root}/tmp/nye-promo-mobile.png`});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#nye-promo').evaluate(d=>d.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('nye-entry')),true);
  await page.reload();assert.equal(await page.locator('#nye-promo').evaluate(d=>d.open),false);
  await page.evaluate(()=>localStorage.setItem('tokyo-nye-last-shown',String(Date.now()-21*60*1000)));
  await page.reload();await page.locator('#nye-promo[open]').waitFor();await page.locator('.nye-close').click();
  await page.screenshot({path:`${root}/tmp/nye-home-mobile.png`,fullPage:true});
  await page.locator('.nye-entry').click();await page.locator('.hero').waitFor();
  assert.match(await page.title(),/TOKYO/);assert.equal(await page.locator('.brand img').getAttribute('src'),'assets/brand/tokyo.png');
  assert.equal(await page.locator('.brand-header .logo').getAttribute('src'),'assets/brand/tokyo.png');
  assert.match(await page.locator('.price').innerText(),/49/);assert.match(await page.locator('.child-price').innerText(),/24,50/);
  assert.equal(await page.locator('.rule').count(),2);
  assert.match(await page.locator('#condiciones').innerText(),/5 € hasta un máximo de 15/);
  await page.screenshot({path:`${root}/tmp/nye-page-mobile.png`,fullPage:true});
  await page.locator('[data-language="en"]').click();assert.match(await page.title(),/New Year.*TOKYO/);assert.match(await page.locator('.rule').first().innerText(),/Leftover food/);
  await page.locator('#theme-toggle').click();
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
  }
  await page.screenshot({path:`${root}/tmp/nye-page-desktop.png`,fullPage:true});
  for(const filename of ['index_akasaka.html','index_ocha-yaki.html']){await page.goto(`${base}/${filename}`);assert.ok(await page.locator('.logo').evaluate(im=>im.complete&&im.naturalWidth>0));}
  assert.deepEqual(errors,[]);
  console.log('OK Nochevieja: anuncio, frecuencia de 20 minutos, teclado/foco, identidad TOKYO, precios, condiciones originales, ES/EN, temas, móvil/escritorio y enlaces del grupo.');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exit(1)});
