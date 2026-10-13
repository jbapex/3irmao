from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path(__file__).resolve().parents[1];site=root/'site'
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.h1=0
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:self.ids.append(attrs['id'])
  if tag=='h1':self.h1+=1
  self.links.extend(attrs[a] for a in ['href','src'] if attrs.get(a))
errors=[];pages=[p for p in site.rglob('index.html') if p.parent.name!='admin'];assert len(pages)==6
for page in pages:
 a=Audit();a.feed(page.read_text());assert a.h1==1;assert len(a.ids)==len(set(a.ids))
 for link in a.links:
  u=urlsplit(link)
  if u.scheme or u.netloc or u.path.startswith('/api/'):continue
  target=site/unquote(u.path.lstrip('/')) if u.path.startswith('/') else page.parent/unquote(u.path)
  if not u.path:target=page
  if target.is_dir():target=target/'index.html'
  if not target.is_file():errors.append(str(page)+': missing '+link)
  elif u.fragment and target.suffix=='.html':
   b=Audit();b.feed(target.read_text())
   if u.fragment not in b.ids:errors.append(str(page)+': missing anchor '+link)
assert not errors,'\n'.join(errors)
m=json.loads((root/'.openai/hosting.json').read_text());assert m['project_id']=='appgprj_6a9c44a294cc8191af8e77118c87e77d';assert m['d1']=='DB' and m['r2']=='BUCKET' and 'static' not in m
print('Static audit passed: six pages, unique headings/IDs, links, local assets/anchors and Worker storage configuration.')
