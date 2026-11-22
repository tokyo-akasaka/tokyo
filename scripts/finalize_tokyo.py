"""Aplica ajustes editoriales explícitos a la importación de TOKYO."""
from pathlib import Path
import json,re
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
def read(n):return json.loads((ROOT/'data'/f'{n}.json').read_text())
def save(n,v):(ROOT/'data'/f'{n}.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
menu=read('menu');lunch=read('lunch');drinks=read('drinks');buffet=read('buffet')
fixes={
 'S112':('Sopa de miso con espinaca.','Miso soup with spinach.'),
 'SM107':(None,'Salmon, avocado, rice, yuzu and wasabi sauce, wakame and black sesame.'),
 'SH43':(None,'Kabayaki eel · 2 pcs.'),
 'CR118':('Pollo, arroz blanco, cebolla y salsa teriyaki.','Chicken, white rice, onion and teriyaki sauce.'),
 'CR128':(None,'Beef entrecôte with yakiniku sauce.'),
 'M161':('Salmón con arroz.','Salmon with rice.'),
}
for dish in menu+lunch['dishes']:
 for lang in ['es','en']:
  s=dish['description'][lang]
  for a,b in [('teriaky','teriyaki'),('filadelfi a','Philadelphia'),('fi nas','finas'),('fl ying','flying'),('lagostinos','langostinos'),('lagonostino','langostino'),('matequilla','mantequilla'),('tarrat','tartar')]:s=s.replace(a,b)
  dish['description'][lang]=s[:1].upper()+s[1:]
 if dish['reference'] in fixes:
  for lang,value in zip(['es','en'],fixes[dish['reference']]):
   if value:dish['description'][lang]=value
 if dish['reference']=='CR139' and dish in lunch['dishes']:
  dish['description']={'es':'Langostinos con verduras de temporada y salsa de chili.','en':'Prawns with seasonal vegetables and chili sauce.'}
 for lang in ['es','en']:dish['name'][lang]=dish['name'][lang].replace('teriaky','teriyaki').replace('matequilla','mantequilla').replace('Lagostinos','Langostinos').replace('Carpacho','Carpaccio')
 if dish['reference']=='PS180':dish['image']='assets/dishes/ps180.webp'
 if dish['reference']=='PS184':
  dish['description']={'es':'Dos unidades. Elige tu sabor: pistacho, té verde, vainilla, chocolate, yuzu, mango o frambuesa.','en':'Two pieces. Choose your flavour: pistachio, green tea, vanilla, chocolate, yuzu, mango or raspberry.'}
  dish['portion']={'es':'2 uds.','en':'2 pcs.'}
  dish['flavours']=[]
  for key,es,en,file in [('pistacho','Pistacho','Pistachio','WhatsApp Image 2026-11-10 at 19.02.35.jpeg'),('te-verde','Té verde','Green tea','mochi te verde.png'),('vainilla','Vainilla','Vanilla','mochi vanilla.png'),('chocolate','Chocolate','Chocolate','mocohi chocolate.png'),('yuzu','Yuzu','Yuzu','mochi limon.png'),('mango','Mango','Mango','mochi mango sin gluten.png'),('frambuesa','Frambuesa','Raspberry','mochi frambuesa.png')]:
   source=next((ROOT/'material_base').rglob(file))
   im=Image.open(source).convert('RGB');im.thumbnail((1200,1500));asset=f'assets/dishes/mochi-{key}.webp';im.save(ROOT/asset,'WEBP',quality=88)
   dish['flavours'].append({'name':{'es':es,'en':en},'image':asset})
  dish['image']=dish['flavours'][0]['image']
lunch.update({'availability':{'es':'Comida: lunes a viernes. Cena: lunes a jueves (+3 €). Excepto festivos.','en':'Lunch: Monday to Friday. Dinner: Monday to Thursday (+€3). Excluding public holidays.'},'choice':{'es':'Elige 2 primeros + 1 segundo. Incluye 1 bebida y gyoza de manzana con helado o café.','en':'Choose 2 starters + 1 main. Includes 1 drink and apple gyoza with ice cream or coffee.'},'prices':{'standard':16.9,'sushi':17.9},'dinnerSupplement':3,'services':[{'id':'lunch','label':{'es':'Comida','en':'Lunch'},'availability':{'es':'De lunes a viernes · Excepto festivos','en':'Monday to Friday · Excluding public holidays'},'supplement':0},{'id':'dinner','label':{'es':'Cena','en':'Dinner'},'availability':{'es':'De lunes a jueves · Excepto festivos · Suplemento de 3 € incluido','en':'Monday to Thursday · Excluding public holidays · €3 supplement included'},'supplement':3}]})
lunch['categories']=[c for c in lunch['categories'] if c['id']!='postres']
buffet['rates'][0]['price']=21.9;buffet['rates'][2]['price']=13.9
drinks['dishes']=[d for d in drinks['dishes'] if d['reference'] not in ['210','211']]
save('menu',menu);save('lunch',lunch);save('drinks',drinks);save('buffet',buffet);save('restaurant',{'name':'TOKYO','city':'Alicante','currency':'EUR','taxIncluded':True})
print('Datos de TOKYO y condiciones de comida/cena preparados.')
