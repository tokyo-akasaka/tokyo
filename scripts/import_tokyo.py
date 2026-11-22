"""Importa los PDF locales de TOKYO. Solo escribe dentro de este proyecto."""
from pathlib import Path
import json, re
from collections import Counter
import pdfplumber
from pdfplumber.utils import extract_text
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
REF = r'\b(?:ES|GY|UD|SM|SH|HM|TK|RS|CR|MR|TA|PS|CM|DR|SA|E|S|M)\s*\d{1,3}\b'
def save(name, value):
    (ROOT/'data'/f'{name}.json').write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def clean(s):
    for a,b in [('fi l','fil'),('fi s','fis'),('fl a','fla'),('fl e','fle'),('truffl e','truffle'),('fi de','fide')]: s=s.replace(a,b)
    return re.sub(r'\s+',' ',re.sub(r'-\n(?=\w)','',s)).strip()
def text(chars): return clean(extract_text(chars,x_tolerance=1,y_tolerance=3)) if chars else ''
def signature(curves):
    return Counter(tuple(op[0] for op in c['path']) for c in curves)
KEYS=['gluten','crustaceans','fish','peanuts','egg','soy','milk','sulphites','mustard','celery','nuts','molluscs','sesame','lupins']
signatures={}
for i,key in enumerate(KEYS,1):
    with pdfplumber.open(next((ROOT.parent/'akasaka_web/material_base/Alergenos vectores').glob(f'{i:02d} *.ai'))) as doc:
        signatures[key]=signature(doc.pages[0].curves)
def allergens(page,box):
    x0,y0,x1,y1=box
    circles=[c for c in page.curves if x0<=c['x0']<x1 and y0<=c['top']<y1 and 12<c['width']<32 and abs(c['width']-c['height'])<.7 and len(c['path'])==7]
    result=[];unknown=[]
    for c in circles:
        curves=[v for v in page.curves if v['x0']>=c['x0']-1 and v['x1']<=c['x1']+1 and v['top']>=c['top']-1 and v['bottom']<=c['bottom']+1]
        sig=signature(curves)
        matches=[k for k,v in signatures.items() if v==sig]
        if len(matches)==1:result.append(matches[0])
        else:unknown.append((round(c['x0'],1),round(c['top'],1),len(curves)))
    return (list(dict.fromkeys(result)) if not unknown else None),unknown

def import_pdf(filename,lunch=False):
    source=ROOT/'material_base'/filename; rendered=pdfium.PdfDocument(str(source));dishes=[];audit=[]
    # Correcciones verificadas visualmente: no inferir símbolos por ingredientes
    # ni reutilizar listas entre documentos con recetas o símbolos distintos.
    verified_path=ROOT/'docs/verified-allergens.json'
    verified=json.loads(verified_path.read_text()).get(filename,{}) if verified_path.exists() else {}
    with pdfplumber.open(source) as doc:
        for idx,page in enumerate(doc.pages):
            num=idx+1
            if num==1 or (not lunch and num>24):continue
            refs=page.search(REF)
            dual=not lunch and num in [9,10,11]
            groups=[[r for r in refs if (r['x0']<310)==left] for left in [True,False]] if dual else [refs]
            image=rendered[idx].render(scale=3).to_pil().convert('RGB')
            for group in groups:
                group.sort(key=lambda r:r['top'])
                for j,r in enumerate(group):
                    ref=re.sub(r'\s+','',r['text']);ref='SH44' if ref=='SH044' else ref
                    top=r['top']-9;bottom=group[j+1]['top']-9 if j+1<len(group) else 810
                    left=dual and r['x0']<310
                    x0,x1=(170,310) if left else (420,570) if dual else (200,565)
                    if ref=='PS184':x0=120
                    chars=[c for c in page.chars if x0-1<=c['x0']<x1 and top<=c['top']<bottom]
                    title_chars=[c for c in chars if r['top']+9<=c['top']<r['top']+31 and c['size']>=10.8 and 'BankGothic' in c['fontname'] and c['text']!='€']
                    title=text(title_chars)
                    title_bottom=max((c['bottom'] for c in title_chars),default=r['bottom'])
                    desc=[c for c in chars if c['top']>=title_bottom-.5 and c['size']<=11.1 and 'BankGothic' in c['fontname']]
                    def pink(c):
                        color=c.get('non_stroking_color')
                        return isinstance(color,tuple) and len(color)==4 and color[1]>.7 and color[0]<.2
                    es=text([c for c in desc if not pink(c)])
                    en=text([c for c in desc if pink(c)])
                    if not title:raise ValueError(('Missing name',num,ref))
                    prices=re.findall(r'(\d+[,.]\d{2})\s*€',text(chars))
                    if not lunch and not prices:raise ValueError(('Missing price',num,ref,text(chars)))
                    category='primeros' if lunch and num<=5 else 'segundos' if lunch and num<=7 else 'sushi' if lunch else ('entrantes' if num<=5 else 'sopa' if num==6 and ref.startswith('S') else 'ramen' if num==6 or ref=='UD148' else 'poke' if num==7 else 'arroz' if num==8 else 'nigiri' if num<=10 else 'hosomaki' if num==11 else 'temaki' if num==12 else 'rollitos' if num<=15 else 'carpaccio' if num==16 else 'sashimi' if num==17 and ref.startswith('SM') else 'tartar' if num==17 else 'carnes' if num<=19 else 'pescado' if num<=21 else 'postres')
                    allergy,unknown=allergens(page,(x0,top,x1,bottom))
                    if ref in verified:
                        allergy=list(verified[ref]);unknown=[]
                    dish={'reference':ref,'category':category,'name':{'es':title.capitalize(),'en':title.capitalize()},'description':{'es':es,'en':en or es},'portion':{'es':'','en':''},'allergens':allergy,'sourcePage':num,'sourceDocument':filename,'buffetStars':0,'twoPersons':False,'isNew':False}
                    if not lunch:dish['price']=float(prices[0].replace(',','.'))
                    # Las estrellas son los trazados amarillos de la cabecera de cada plato.
                    stars=[c for c in page.curves if x0<=c['x0']<x1 and top-5<=c['top']<r['top']+14 and 8<c['width']<14 and 9<c['height']<15 and len(c['path'])==19]
                    dish['buffetStars']=min(2,len(stars))
                    people=[c for c in page.curves if x0<=c['x0']<x1 and top-5<=c['top']<r['top']+14 and len(c['path']) in [3,4,6] and 2<c['width']<9]
                    dish['twoPersons']=len(people)>=3 or bool(re.search(r'(?:por|para)\s*2\s*personas',es,re.I))
                    ix0,ix1=(64,170) if left else (310,420) if dual else (55,min(c['x0'] for c in title_chars)-8)
                    photos=[v for v in page.images if v['width']>25 and v['height']>25 and v['height']<280 and v['width']<300 and v['x0']<ix1 and v['x1']>ix0+30 and v['top']<min(bottom-10,r['top']+65) and v['bottom']>top+10]
                    if photos and ref!='PS184':
                        box=(max(ix0,min(v['x0'] for v in photos)),max(top-4,min(v['top'] for v in photos)),min(ix1,max(v['x1'] for v in photos)),min(bottom,max(v['bottom'] for v in photos)))
                        crop=image.crop(tuple(round(v*3) for v in box));crop.thumbnail((1000,1000));asset=f'assets/dishes/{"lunch-" if lunch else "tokyo-"}{ref.lower()}.webp';crop.save(ROOT/asset,'WEBP',quality=88);dish['image']=asset
                    dishes.append(dish)
                    audit.append({'reference':ref,'page':num,'allergensUnmatched':unknown,'photo':dish.get('image')})
    (ROOT/'docs'/('lunch-import.json' if lunch else 'catalogue-import.json')).write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    return dishes

if __name__=='__main__':
    menu=import_pdf('Revista TOKYO - 20260929.pdf');save('menu',menu)
    lunch=json.loads((ROOT/'data/lunch.json').read_text());lunch['dishes']=import_pdf('TOKYO MENU COMIDA O CENA.pdf',True);save('lunch',lunch)
    print('Carta:',len(menu),'Menú comida/cena:',len(lunch['dishes']))
    print('Alérgenos pendientes:',sum(d['allergens'] is None for d in menu))
