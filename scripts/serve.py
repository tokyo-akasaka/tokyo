"""Vista previa local. No sirve material_base, .git ni documentos internos."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse

ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_GET(self):
        path=unquote(urlsplit(self.path).path);parts=Path(path.lstrip('/')).parts
        target=(ROOT/path.lstrip('/')).resolve()
        if not target.is_relative_to(ROOT) or '..' in parts or not (path in ['/','/index.html','/menu.html','/index_tokyo.html','/index_akasaka.html','/index_ocha-yaki.html'] or (parts and parts[0] in ['css','js','data','assets'])):
            self.send_error(404);return
        super().do_GET()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8021);args=parser.parse_args()
    print(f'TOKYO: http://127.0.0.1:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
