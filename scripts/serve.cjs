const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const filename=pathname==='/'?'/index.html':pathname;
  if(!(/^\/(index\.html|menu\.html|index_tokyo\.html|index_akasaka\.html|index_ocha-yaki\.html)$/.test(filename)||/^\/(assets|data|css|js)\//.test(filename))||filename.split('/').some(part=>part==='..'||part.startsWith('.'))){res.writeHead(404);res.end();return;}
  const target=path.resolve(root,'.'+filename);
  if(!target.startsWith(root+path.sep))throw new Error('path');
  const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT)||8021,'127.0.0.1',()=>console.log(`TOKYO: http://127.0.0.1:${Number(process.env.PORT)||8021}`));
