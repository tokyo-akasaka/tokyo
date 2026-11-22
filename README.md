# Carta digital de TOKYO

Proyecto independiente para la carta digital del restaurante TOKYO.

Sitio estático en JavaScript, HTML y CSS que reproduce el diseño y funcionamiento de Akasaka con el logo y la carta de TOKYO. No requiere compilación ni servicios externos.

## Vista previa

Con Node.js instalado, ejecutar `npm run dev` y abrir http://127.0.0.1:8021.

## Contenido

- `index.html`: entrada con las cuatro modalidades y el acceso destacado a Nochevieja.
- `menu.html`: carta, buffet, menú comida o cena y bebidas.
- `data/`: textos ES/EN, precios, raciones y alérgenos.
- `assets/`: logo original de TOKYO, fotografías optimizadas e iconos.
- `css/` y `js/`: diseño adaptable, temas claro/oscuro, idiomas, lectura por voz y enlaces para compartir platos.
- `docs/revision.json`: datos del PDF que necesitan confirmación del restaurante.

Comida: lunes a viernes, excepto festivos, 16,90 € / 17,90 € con segundo de sushi. Cena: lunes a jueves, excepto festivos, 19,90 € / 20,90 € con segundo de sushi. Ambas incluyen dos primeros, un segundo, bebida y gyoza de manzana con helado o café.

Los alérgenos se extraen de los símbolos originales. Los que no se pueden verificar quedan pendientes y no se deducen de las recetas. El catálogo de comida/cena conserva sus propias recetas y raciones.

## Comprobaciones

Instalar las dependencias con `npm install`, iniciar la vista previa y ejecutar `npm test`. Las pruebas de navegador usan Google Chrome instalado; cubren las cuatro modalidades, precios de cena, idiomas, navegación móvil, alérgenos y sabores de mochi.

## GitHub Pages

Una vez revisado el contenido y subidos los archivos, seleccionar en GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)`. Los enlaces son relativos y funcionan bajo la ruta del repositorio. `.nojekyll` permite servir los recursos como archivos estáticos.

## Fuentes e importación

`scripts/import_tokyo.py` extrae datos y fotografías de los dos PDF locales. Requiere pdfplumber, pypdfium2 y Pillow; consulta los vectores de Akasaka solo como referencia de lectura. Después ejecutar `scripts/finalize_tokyo.py` para aplicar ajustes editoriales y condiciones de TOKYO. No ejecutar una nueva importación después de ajustes manuales sin conservarlos primero.

Los documentos originales de `material_base/` se mantienen en local y no se publican en el repositorio.

## Nochevieja

`index_tokyo.html` integra la página de Nochevieja de TOKYO con cabecera, idiomas y temas compartidos. La portada muestra el anuncio automáticamente una vez cada 20 minutos por navegador, usando la clave independiente `tokyo-nye-last-shown`. El acceso destacado permanece disponible aunque se cierre el anuncio.

Se conservan los precios y condiciones del original de TOKYO: 49 € por persona; 24,50 € para niños de menos de 120 cm; buffet, bebida ilimitada, postre, café, uvas y cotillón. Las condiciones propias de Akasaka sobre platos fuera del precio fijo no se trasladan al contenido de TOKYO. Las páginas independientes de Akasaka y Ocha-Yaki mantienen los enlaces originales del grupo.

Ejecutar `npm run test:nochevieja` para comprobar anuncio, frecuencia, cierre por teclado, foco, idiomas, precios, condiciones y tamaños de pantalla.
