"""Generate independently addressable, progressively enhanced static pages."""
from pathlib import Path
import json, html

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'site'
ORIGIN = 'https://distribuidora-3-irmaos.josiasbonfim.chatgpt.site'
CATALOG = json.loads((ROOT / 'content/catalog.json').read_text())
PRODUCTS = json.loads((ROOT / 'content/products.json').read_text())
for category in CATALOG:
    category['products'] = [product for product in PRODUCTS if product['category'] == category['id']]
MEDIA = json.loads((ROOT / 'content/media.json').read_text())
EXPERIENCE = json.loads((ROOT / 'content/experience.json').read_text())
INSTAGRAM = json.loads((ROOT / 'content/instagram.json').read_text())
PHOTOGRAPHY = json.loads((ROOT / 'content/photography.json').read_text())
SOCIAL_POSTS = json.loads((ROOT / 'content/social-posts.json').read_text())
PHOTO_INFO = {photo['src']: photo for photo in [*INSTAGRAM, *PHOTOGRAPHY, *SOCIAL_POSTS]}
E = html.escape
PLUS = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
BAG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
HOME = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/></svg>'
GRID = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
CLOSE = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
WA = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.5Z"/><path d="M9 8c.4 3.5 2.5 5.7 6 6l1-2-2-1-1 1-2-2 1-1-1-2Z"/></svg>'
PIN = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
IG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01" stroke-linecap="round" stroke-width="3"/></svg>'
NAV = [('inicio','/','Início'),('produtos','/produtos/','Produtos'),('negocio','/para-seu-negocio/','Para seu negócio'),('novidades','/novidades/','Novidades'),('sobre','/a-3-irmaos/','Nossa história'),('lojas','/lojas/','Lojas e contato')]

def button(text, href, style='blue', attrs=''):
    return f'<a class="btn btn-{style}" href="{E(href)}" {attrs}><span>{text}</span></a>'

def image(src, alt, cls='', eager=False):
    real = src in ['/assets/caixas-kraft.webp','/assets/caixas-listradas.webp','/assets/baloes-florais.webp','/assets/doces-stitch.webp','/assets/doces-morango.webp']
    photo = PHOTO_INFO.get(src)
    if real: cls += ' source-photo'
    if photo: cls += ' studio-photo' if 'source_kind' in photo else ' instagram-photo'
    width = photo['width'] if photo else (1500 if real else 1200)
    height = photo['height'] if photo else (1875 if real else 1000)
    return f'<img class="{cls}" src="{E(src)}" alt="{E(photo["alt"] if photo else alt)}" width="{width}" height="{height}" {"fetchpriority=high" if eager else "loading=lazy"} decoding="async">'

def label(text, n=None):
    return f'<p class="kicker">{text.capitalize().replace("3 irmãos", "3 Irmãos")}</p>'

def ticker(texts, style='yellow'):
    group=''.join(f'<span>{E(t)}</span><b aria-hidden="true">✳</b>' for t in texts)
    return f'<div class="ticker ticker-{style}"><div class="ticker-track"><div>{group}</div><div aria-hidden="true">{group}</div></div></div>'

def photo_for(cat):
    return MEDIA.get('categories',{}).get(cat)


ICONS = {
 'confeitaria':'<path d="M4 12h16v8H4zM3 20h18M5 12V8h14v4M8 8V5m4 3V4m4 4V5M4 15c2 2 3 2 5 0 2 2 4 2 6 0 2 2 3 2 5 0"/>',
 'frios':'<path d="m3 11 11-7 7 7v9H3zM3 11h18"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="17" r="1"/><path d="M13 8h.01"/>',
 'doces':'<path d="m7 8-4-2v5l3 2m11-5 4-2v5l-3 2M8 17l-4 2v-5m12 3 4 2v-5"/><rect x="6" y="7" width="12" height="11" rx="4"/><path d="m9 8 6 9"/>',
 'embalagens':'<path d="m3 8 9-5 9 5v11l-9 3-9-3zM3 8l9 4 9-4m-9 4v10M7 6l10 4v5"/>',
 'festas':'<ellipse cx="9" cy="8" rx="5" ry="6"/><path d="m9 14-1 2h3l-2-2m0 2c5 3-3 3 0 6M16 5c6 0 6 10 1 10m0 0-1 2h3l-2-2m0 2c-2 2 3 3 0 5"/>',
 'utensilios':'<path d="m4 20 6-6m-2-2c-2-2 0-7 5-9 7-2 10 1 7 7-2 5-7 7-9 5zM9 13 20 3M11 15c0-5 3-9 9-12M8 12c5 0 9-3 12-9"/>',
 'cestas':'<path d="M3 9h18v5H3zM5 14v7h14v-7M12 9v12"/><path d="M12 9C2 9 5 1 9 4l3 5c10 0 7-8 3-5z"/>',
 'alimentos':'<path d="M5 7h7v14H5zM5 7l2-4h4l1 4M5 11h7M17 3h3v5l1 3v10h-5V11l1-3zM16 14h5"/>',
 'truck':'<path d="M2 5h12v12H2zM14 10h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 'shop':'<path d="M4 10v11h16V10M3 4h18l1 6c-2 2-4 2-5 0-2 2-4 2-5 0-2 2-4 2-5 0-1 2-3 2-5 0zM9 21v-7h6v7"/>'
}

def icon(key):
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">'+ICONS[key]+'</svg>'

def photo_tile(src, alt, title, href, cls='', eager=False):
    return f'<a class="photo-tile {cls}" href="{href}">{image(src,alt,eager=eager)}<span class="photo-tile-caption"><strong>{title}</strong></span></a>'

def quick_categories():
    return '<div class="quick-categories">'+''.join(f'<a href="/produtos/?categoria={c["id"]}"><span class="category-icon" style="--card-color:{c["color"]}">{icon(c["id"])}</span><span>{c["name"]}</span></a>' for c in CATALOG)+'</div>'


def category_rail():
    groups = [
        ('Alimentos e ingredientes', 'Para o preparo, o balcão e a revenda.', ['confeitaria', 'frios', 'doces', 'alimentos']),
        ('Embalagens, festas e utensílios', 'Para embalar, decorar e finalizar.', ['embalagens', 'festas', 'utensilios', 'cestas'])
    ]
    sections=[]
    for index, (title, description, ids) in enumerate(groups):
        cards=[]
        for catid in ids:
            c=next(cat for cat in CATALOG if cat['id']==catid)
            asset=photo_for(c['id'])
            photo=image(asset,c['name']) if asset else f'<div class="category-illustration">{icon(c["id"])}</div>'
            note='<small class="photo-note">Imagem ilustrativa</small>' if PHOTO_INFO.get(asset,{}).get('source_kind') == 'illustrative' else ''
            cards.append(f'<a class="department-card" href="/produtos/?categoria={c["id"]}"><div class="department-image">{photo}</div><div class="department-copy"><h4>{c["name"]}</h4><p>{c["short"]}</p>{note}</div></a>')
        sections.append(f'<section class="home-department-group" aria-labelledby="department-group-{index}"><div class="department-group-heading"><h3 id="department-group-{index}">{title}</h3><p>{description}</p></div><div class="department-grid">{"".join(cards)}</div></section>')
    return '<div class="wrap department-groups">'+''.join(sections)+'</div>'

def header(active):
    nav=''.join(f'<a href="{url}" {"aria-current=page" if key==active else ""}><span>{name}</span></a>' for key,url,name in NAV)
    return f'''<a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <div class="topline"><div class="wrap"><span>Rio Branco do Sul <i>·</i> Itaperuçu</span><div class="topline-links"><button class="offer-trigger" data-open-offer hidden><img data-offer-trigger-image alt="" width="25" height="25"><span data-offer-label>Oferta do dia</span></button><a href="/para-seu-negocio/">Atacado & varejo</a></div></div></div>
    <header class="site-header"><div class="wrap nav-wrap">
      <a class="logo" href="/" aria-label="Distribuidora 3 Irmãos — início"><img src="{MEDIA['logo']}" alt="3 Irmãos — Frios, doces, embalagens e festas" width="235" height="82"></a>
      <nav class="desktop-nav" aria-label="Navegação principal">{nav}</nav>
      <div class="header-actions"><button class="list-trigger" data-open-list aria-label="Abrir minha lista de consulta">{BAG}<span class="list-label">Minha lista</span><b data-list-count>0</b></button><button class="menu-trigger" data-menu-trigger aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menu"><span class="menu-bars"><i></i><i></i><i></i></span><span class="menu-label">Menu</span></button></div>
    </div><div class="reading-progress" aria-hidden="true"></div></header>
    <dialog class="mobile-menu" id="mobile-menu" aria-label="Menu de navegação"><div class="menu-head"><img src="{MEDIA['logo']}" alt="Distribuidora 3 Irmãos" width="160" height="56"><button class="icon-btn" data-close-menu aria-label="Fechar menu">{CLOSE}</button></div><form class="menu-search" action="/produtos/" role="search"><label class="sr-only" for="menu-search">Buscar produtos</label><input id="menu-search" type="search" name="q" placeholder="O que você procura?" maxlength="120"><button type="submit">Buscar</button></form><div class="menu-section"><p>Produtos e atendimento</p><nav aria-label="Compras"><a href="/produtos/" {'aria-current=page' if active=='produtos' else ''}>{GRID}<span>Catálogo de produtos<small>Encontre por nome, marca ou categoria</small></span></a><button data-open-offer hidden><span class="menu-offer-icon">%</span><span data-offer-label>Ofertas do dia</span></button><button data-open-list>{BAG}<span>Minha lista<small>Reúna os produtos para consultar a loja</small></span><b data-list-count>0</b></button><a href="/lojas/" {'aria-current=page' if active=='lojas' else ''}>{PIN}<span>Lojas e contato<small>Escolha a unidade para seu atendimento</small></span></a></nav></div><div class="menu-section menu-secondary"><p>Conheça a 3 Irmãos</p><nav aria-label="Institucional">{''.join(f'<a href="{url}" {"aria-current=page" if key==active else ""}>{name}</a>' for key,url,name in NAV if key not in ['produtos','lojas'])}</nav></div><div class="menu-bottom"><strong>Perto de você.</strong><span>Rio Branco do Sul · Itaperuçu</span></div></dialog>'''

def footer(active):
    last_call = f'''<section class="last-call"><div class="wrap"><div><h2>Precisa de preço ou disponibilidade?</h2><p>Escolha a unidade e consulte a equipe pelo WhatsApp.</p></div>{button('Falar com a loja','/lojas/#atendimento','blue')}</div></section>''' if active != 'inicio' else ''
    return f'''{last_call}
    <footer class="footer"><div class="wrap footer-content"><div class="footer-brand"><a class="logo" href="/"><img src="{MEDIA['logo']}" alt="Distribuidora 3 Irmãos" width="235" height="82" loading="lazy"></a><p>Frios, doces, embalagens e festas.<br>Atacado e varejo na nossa região.</p><a class="footer-instagram" href="https://www.instagram.com/distribuidoras3irmaos/" target="_blank" rel="noopener noreferrer">{IG}<span>@distribuidoras3irmaos</span></a></div><nav class="footer-column" aria-label="Navegação do rodapé"><h2>Explore a 3 Irmãos</h2><a href="/produtos/">Produtos</a><a href="/para-seu-negocio/">Para seu negócio</a><a href="/a-3-irmaos/">Nossa história</a><a href="/novidades/">Novidades</a></nav><div class="footer-column"><h2>Lojas e atendimento</h2><a href="/lojas/#rio-branco">Rio Branco do Sul</a><a href="tel:+554136523410">(41) 3652-3410</a><a class="footer-unit" href="/lojas/#itaperucu">Itaperuçu</a><a href="tel:+5541998538879">(41) 99853-8879</a><a class="underlink" href="/lojas/">Endereços e contato</a></div></div><div class="wrap footer-bottom"><span>© <span data-year>2026</span> Distribuidora 3 Irmãos.</span><a class="admin-link" href="/admin/">Área administrativa</a><button class="motion-toggle" data-motion-toggle aria-pressed="false">Pausar animações</button><span>Feito por <a href="https://jbapex.com.br" target="_blank" rel="noopener noreferrer">JB APEX</a></span></div></footer>
    <nav class="mobile-shop-nav" aria-label="Atalhos de navegação"><a href="/" {'aria-current=page' if active=='inicio' else ''}>{HOME}<span>Início</span></a><a href="/produtos/" {'aria-current=page' if active=='produtos' else ''}>{GRID}<span>Produtos</span></a><button data-open-list>{BAG}<span>Minha lista</span><b data-list-count>0</b></button><a href="/lojas/" {'aria-current=page' if active=='lojas' else ''}>{PIN}<span>Lojas</span></a></nav>
    <dialog class="list-dialog" id="list-dialog" aria-labelledby="list-title"><div class="drawer-head"><div>{label('Consulta de produtos')}<h2 id="list-title">Minha lista <small data-list-count>0</small></h2></div><button class="icon-btn" data-close-list aria-label="Fechar lista">{CLOSE}</button></div><div class="drawer-body"><div class="list-empty" data-empty-list><h3>Sua lista está vazia.</h3><p>Adicione os produtos que procura. Depois, consulte preços e disponibilidade com a loja.</p>{button('Ver produtos','/produtos/','blue')}</div><ul class="consultation-items" data-list-items></ul></div><div class="drawer-bottom" data-list-bottom hidden><p class="list-explanation">A equipe confirma modelos, marcas, preços e disponibilidade.</p><label for="list-store">Com qual loja você quer conversar?</label><select id="list-store"><option value="rio-branco">Rio Branco do Sul</option><option value="itaperucu">Itaperuçu</option></select><button class="btn btn-blue full-width" data-send-list><span>Consultar no WhatsApp</span><i>{WA}</i></button><p class="drawer-status" data-list-status role="status"></p></div></dialog>
    <dialog class="offer-dialog" id="offer-dialog" aria-labelledby="offer-title"><div class="offer-dialog-head"><p class="kicker">DISTRIBUIDORA 3 IRMÃOS</p><h2 id="offer-title">Ofertas do dia</h2><p data-offer-summary></p><button class="icon-btn offer-close" type="button" data-close-offer aria-label="Fechar ofertas">{CLOSE}</button></div><div class="offer-store-bar"><label for="offer-store">Consultar na loja</label><select id="offer-store"><option value="rio-branco">Rio Branco do Sul</option><option value="itaperucu">Itaperuçu</option></select></div><div class="offer-grid" data-offer-grid></div></dialog>
    <dialog class="catalog-product-dialog" id="catalog-product-dialog" aria-labelledby="catalog-product-title"><div class="product-detail-head"><span>Detalhes do produto</span><button class="icon-btn" data-close-product aria-label="Fechar produto">{CLOSE}</button></div><div data-product-detail></div></dialog>
    <div class="toast" role="status" aria-live="polite" data-toast hidden></div>'''

def experience():
    products=[]
    panels=[]
    tabs=[]
    first = EXPERIENCE[0]
    intro = first['intro']
    photo = next(scene for scene in EXPERIENCE if scene.get('kind') != 'game')
    for i,scene in enumerate(EXPERIENCE):
        active=i==0
        products.append(f'<span class="stage-product {"is-current" if active else ""}" data-framing="{scene["framing"]}" data-stage-product="{i}" aria-hidden="{"false" if active else "true"}"><img src="{scene["image"]}" alt="{E(scene["alt"])}" width="{scene.get("width",1500)}" height="{scene.get("height",1875)}" decoding="async" {"fetchpriority=high" if active else "loading=eager"}></span>')
        if scene.get('kind') == 'game':
            panels.append(f'<div class="universe-panel universe-panel-story" id="universe-panel-{i}" role="tabpanel" aria-labelledby="universe-tab-{i}" {"hidden" if not active else ""}><p>{scene["heading"]}</p></div>')
        else:
            panels.append(f'<div class="universe-panel" id="universe-panel-{i}" role="tabpanel" aria-labelledby="universe-tab-{i}" {"hidden" if not active else ""}><h2>{scene["heading"]}</h2><p class="universe-description">{scene["description"]}</p><a class="underlink" href="{scene["href"]}">{scene["button"]}</a></div>')
        tabs.append(f'<button type="button" id="universe-tab-{i}" role="tab" aria-label="{E(scene["name"])}" title="{E(scene["name"])}" aria-controls="universe-panel-{i}" aria-selected="{"true" if active else "false"}" tabindex="{0 if active else -1}" data-universe-tab="{i}"><span aria-hidden="true">{i+1:02d}</span></button>')
    return f"""<section class="experience" data-experience data-universe="{first['id']}" aria-label="Destaques da Distribuidora 3 Irmãos">
      <div class="experience-sticky"><div class="experience-atmosphere" aria-hidden="true"><div class="atmosphere-light"></div></div><div class="wrap experience-content">
        <div class="experience-layout">
          <div class="experience-intro"><p class="experience-eyebrow" data-intro-eyebrow {"hidden" if not intro["eyebrow"] else ""}>{intro['eyebrow']}</p><h1 data-intro-title>{intro['title']}</h1><p class="experience-intro-copy" data-intro-copy>{intro['copy']}</p><div class="experience-actions">{button(intro['button'],intro['href'],'yellow','data-intro-action')}<a class="experience-contact" href="/lojas/#atendimento">Falar com a loja {WA}</a></div></div>
          <div class="product-stage" data-product-stage><span class="stage-art"><span class="stage-ground" aria-hidden="true"></span><span class="stage-products">{''.join(products)}</span></span><a class="stage-inspect stage-play" data-play-story href="{first['href']}" aria-label="Jogar nossa história com o Dedei"><span class="stage-inspect-hint"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg><span>Entrar no jogo</span></span></a><button class="stage-inspect" type="button" data-inspect-product aria-label="Ver balões de coração de perto" hidden><span class="stage-inspect-hint"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6M10 7v6"/></svg><span>Ampliar foto</span></span></button><div class="stage-caption"><span data-stage-name>{first['product']}</span><span class="stage-caption-line"></span><span data-stage-count>01 / {len(EXPERIENCE):02d}</span></div></div>
          <div class="experience-scene-controls" role="tablist" aria-label="Cenas da capa">{''.join(tabs)}</div>
          <div class="universe-panels">{''.join(panels)}</div>
        </div>
      </div><div class="experience-progress" aria-hidden="true"><span></span></div></div>
    </section><dialog class="product-viewer" id="product-viewer" aria-labelledby="product-viewer-title"><div class="viewer-header"><div><p>Foto de produto da 3 Irmãos</p><h2 id="product-viewer-title">{photo['product']}</h2></div><button class="icon-btn" type="button" data-close-viewer aria-label="Fechar imagem">{CLOSE}</button></div><div class="viewer-image-area" data-framing="{photo['framing']}"><img data-viewer-image src="{photo['image']}" alt="{E(photo['alt'])}" width="{photo.get('width',1500)}" height="{photo.get('height',1875)}" loading="lazy"></div><div class="viewer-bottom"><p>Consulte modelos e disponibilidade com a equipe.</p><a class="btn btn-blue" data-viewer-link href="{photo['href']}"><span>Ver categoria</span></a></div></dialog>"""

def store_map():
    from urllib.parse import quote
    destination='Rua Duque de Caxias, 352, Rio Branco do Sul, PR'
    coordinates='-25.1838276,-49.3152138'
    query=quote(destination)
    return f'''<section class="store-map" id="mapa-das-lojas" aria-labelledby="store-map-title"><div class="store-map-heading"><div><p class="kicker">Venha nos visitar</p><h3 id="store-map-title">Encontre a 3 Irmãos.</h3></div><p>Escolha a unidade para ver o mapa e traçar sua rota.</p></div><div class="map-shell"><div class="map-control"><span>Qual loja você quer visitar?</span><div role="group" aria-label="Unidade exibida no mapa"><button type="button" data-map-store="rio-branco" aria-pressed="true">Rio Branco do Sul</button><button type="button" data-map-store="itaperucu" aria-pressed="false">Itaperuçu</button></div></div><iframe title="Mapa da 3 Irmãos de Rio Branco do Sul" src="https://maps.google.com/maps?q={query}&amp;ll={coordinates}&amp;z=17&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-map-frame></iframe><div class="map-store-info"><div><strong data-map-city>3 Irmãos · Rio Branco do Sul</strong><address data-map-address>Rua Duque de Caxias, 352<br>Rio Branco do Sul, PR</address></div><div class="map-store-actions"><a class="underlink" data-map-open href="https://www.google.com/maps/search/?api=1&amp;query={query}" target="_blank" rel="noopener noreferrer">Ampliar mapa</a><a class="btn btn-blue" data-map-route href="https://www.google.com/maps/dir/?api=1&amp;destination={coordinates}" target="_blank" rel="noopener noreferrer">{PIN}<span>Traçar rota</span></a></div></div></div></section>'''

def home_stores():
    units = [('rio-branco', 'Rio Branco do Sul', 'Rua Duque de Caxias, 352', 'Rio Branco do Sul, PR', '(41) 3652-3410', '554136523410'), ('itaperucu', 'Itaperuçu', 'Av. Crispim Furquim Siqueira, 503', 'Centro Industrial — Itaperuçu, PR', '(41) 99853-8879', '5541998538879')]
    cards=[]
    for key, city, street, location, phone, number in units:
        cards.append(f'<article class="home-store"><div class="home-store-heading">{PIN}<h3>{city}</h3></div><address>{street}<br>{location}</address><a class="home-store-phone" href="tel:+{number}">{phone}</a><div class="home-store-actions"><a class="btn btn-blue" href="https://wa.me/{number}?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%203%20Irm%C3%A3os." target="_blank" rel="noopener noreferrer">{WA}<span>WhatsApp da loja</span></a><a class="underlink" href="/lojas/#{key}">Como chegar</a></div></article>')
    return f'<section class="home-section home-stores" id="nossas-lojas" aria-labelledby="home-stores-title"><div class="wrap"><div class="home-section-head"><div>{label("Lojas e atendimento")}<h2 id="home-stores-title">Escolha a sua loja.</h2><p>Consulte preços, marcas e disponibilidade com a unidade.</p></div><a class="underlink" href="/lojas/#atendimento">Preparar minha mensagem</a></div><div class="home-store-grid">{"".join(cards)}</div>{store_map()}</div></section>'

def home():
    return f"""<section class="home-shop-search" aria-label="Encontrar produtos"><div class="wrap"><div><strong>O que você procura?</strong><a href="/produtos/">Ver catálogo</a></div><form action="/produtos/" role="search"><label class="sr-only" for="home-search">Buscar produtos</label><input id="home-search" name="q" type="search" placeholder="Produto, marca ou ingrediente" maxlength="120"><button type="submit">Buscar</button></form></div></section>{experience()}
    <div class="wrap offer-banner-wrap" data-offer-banner hidden><button class="offer-banner" data-open-offer><span class="offer-banner-photos" data-offer-banner-photos></span><span class="offer-banner-copy"><span class="offer-banner-label" data-offer-label>Oferta do dia</span><span class="offer-banner-name" data-offer-banner-name></span><span class="offer-banner-detail" data-offer-banner-detail></span></span><strong class="offer-banner-price" data-offer-banner-price></strong><span class="offer-banner-action" data-offer-banner-action>Ver oferta</span></button></div>
    <section class="home-section departments" id="departamentos" aria-labelledby="home-products-title"><div class="wrap home-section-head"><div>{label('Produtos')}<h2 id="home-products-title">Encontre por departamento.</h2><p>Ingredientes, alimentos, embalagens e artigos para festas.</p></div>{button('Ver catálogo completo','/produtos/','outline')}</div>{category_rail()}</section>
    <section class="home-section home-business" id="seu-negocio" aria-labelledby="home-business-title"><div class="wrap home-business-grid"><div class="home-business-copy">{label('Para seu negócio')}<h2 id="home-business-title">Produtos para quem<br>produz e revende.</h2><p>Reúna o que falta na sua rotina. No catálogo, você pode montar uma lista e consultar quantidades, marcas e preços com a equipe.</p><dl class="home-business-segments"><div><dt>Confeitaria</dt><dd>Ingredientes, recheios e utensílios.</dd></div><div><dt>Lanchonete e padaria</dt><dd>Frios, congelados e descartáveis.</dd></div><div><dt>Comércio e revenda</dt><dd>Doces, chocolates e mercearia.</dd></div><div><dt>Festas e presentes</dt><dd>Balões, caixas e acabamentos.</dd></div></dl>{button('Produtos para meu negócio','/para-seu-negocio/','blue')}</div><figure class="home-business-photo">{image('/assets/catalogo/cestas-v1.jpg','Caixa para presente com tampa xadrez')}<figcaption>Embalagens para cestas, presentes e encomendas.</figcaption></figure></div></section>
    {home_stores()}
    {story_preview()}
    <section class="home-section home-social" id="novidades-da-loja" aria-labelledby="home-social-title"><div class="wrap"><div class="home-section-head"><div>{label('Da loja para você')}<h2 id="home-social-title">Últimas da loja.</h2><p>Publicações recentes no Instagram da 3 Irmãos.</p></div><a class="underlink" href="https://www.instagram.com/distribuidoras3irmaos/" target="_blank" rel="noopener noreferrer">{IG}<span>Acompanhar a loja</span></a></div>{social_cards()}</div></section>"""

def story_preview():
    return f'''<section class="home-section home-history" id="nossa-historia" aria-labelledby="home-history-title"><div class="wrap home-history-grid"><div class="home-history-copy">{label('Nossa história')}<h2 id="home-history-title">Um negócio<br>feito em família.</h2><p>Dedei passou seis anos vendendo doces com o caminhão antes de abrir o primeiro balcão. Com a família, vieram novos produtos e as lojas em Rio Branco do Sul e Itaperuçu.</p><a class="underlink" href="/a-3-irmaos/#historia-completa">Ler a história da 3 Irmãos</a></div><a class="home-history-game" href="/a-3-irmaos/"><img src="/assets/historia/mundo-3-irmaos.webp" alt="Cenário ilustrativo do jogo sobre a história da 3 Irmãos" width="1672" height="941" loading="lazy" decoding="async"><div><span><strong>Jogue com o Dedei</strong><small>Uma aventura baseada na história da família.</small></span><span class="game-preview-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m9 5 11 7-11 7Z"/></svg></span></div></a></div></section>'''

def social_cards():
    out=[]
    for post in SOCIAL_POSTS:
        video=post['kind']=='video'
        marker='<span class="home-post-kind"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 2 9 6-9 6Z"/></svg>Vídeo</span>' if video else ''
        photo=f'<img src="{E(post["src"])}" alt="{E(post["alt"])}" width="{post["width"]}" height="{post["height"]}" loading="lazy" decoding="async">'
        action='Assistir à publicação' if video else 'Ver publicação'
        out.append(f'<a class="home-post" href="{E(post["href"])}" target="_blank" rel="noopener noreferrer" data-reveal><div class="home-post-media">{photo}{marker}</div><div class="home-post-copy"><div class="home-post-meta"><p class="mini-label">{E(post["tag"])}</p><time datetime="{post["date"]}">{E(post["date_label"])}</time></div><h3>{E(post["title"])}</h3><p>{E(post["description"])}</p><span class="underlink">{action}</span></div></a>')
    return '<div class="home-post-grid">'+''.join(out)+'</div>'


def products():
    controls=''.join(f'<button class="category-filter" data-filter="{c["id"]}" aria-pressed="false"><span class="filter-name">{icon(c["id"])}{c["name"]}</span><small>{len(c["items"])+len(c["products"]):02d}</small></button>' for c in CATALOG)
    specific=[]
    for i,product in enumerate(PRODUCTS):
        category=next(c for c in CATALOG if c['id']==product['category'])
        name=E(product['name'])
        post=product.get('source') or PHOTO_INFO.get(product['reference'],{}).get('post')
        source_link=f'<a class="catalog-product-source" href="{E(post)}" target="_blank" rel="noopener noreferrer">Ver publicação da loja</a>' if post else ''
        specific.append(f'''<article class="product-item catalog-product has-photo" data-product="{product['id']}" data-category="{category['id']}">
          <button class="product-item-photo" data-view-product="{product['id']}" aria-label="Ver detalhes de {name}">{image(product['image'],product['name'],eager=i<3)}</button>
          <div class="catalog-product-copy"><p class="catalog-product-brand">{E(product['brand'])}</p><h3><button data-view-product="{product['id']}">{name}</button></h3><p class="catalog-product-detail">{E(product['detail'])}</p><p class="catalog-product-description">{E(product['description'])}</p>{source_link}<p class="catalog-price" data-product-price="{product['id']}">Consultar preço</p></div>
          <button class="add-product" data-add="{product['id']}" aria-label="Adicionar {name} à lista"><span>Adicionar à lista</span><i>{PLUS}</i></button>
        </article>''')
    groups=[]
    for c in CATALOG:
        for j,name in enumerate(c['items']):
            itemid=c['id']+'-'+str(j)
            groups.append(f'<article class="product-item catalog-group" data-product="{itemid}" data-category="{c["id"]}"><div class="product-item-top"><span>{c["name"]}</span></div><h3>{E(name)}</h3><button class="add-product" data-add="{itemid}" aria-label="Adicionar {E(name)} à lista"><span>Adicionar à lista</span><i>{PLUS}</i></button></article>')
    return f'''<section class="page-intro catalog-intro"><div class="wrap">{label('Catálogo de produtos')}<div class="intro-row"><h1 class="page-title">Produtos da <em>3 Irmãos.</em></h1><div><p>Busque os produtos e monte sua lista para consultar a loja.</p></div></div></div></section>
    <div class="wrap offer-banner-wrap" data-offer-banner hidden><button class="offer-banner" data-open-offer><span class="offer-banner-photos" data-offer-banner-photos></span><span class="offer-banner-copy"><span class="offer-banner-label" data-offer-label>Oferta do dia</span><span class="offer-banner-name" data-offer-banner-name></span><span class="offer-banner-detail" data-offer-banner-detail></span></span><strong class="offer-banner-price" data-offer-banner-price></strong><span class="offer-banner-action" data-offer-banner-action>Ver oferta</span></button></div><section class="catalog-section"><div class="wrap"><div class="catalog-toolbar" id="catalogo"><label class="search-field" for="product-search"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg><input id="product-search" type="search" placeholder="Produto, marca ou ingrediente" aria-label="Buscar produtos" autocomplete="off"><span class="search-shortcut" aria-hidden="true">/</span></label><button class="catalog-list-button" data-open-list>Minha lista <b data-list-count>0</b></button></div><button class="category-chooser" data-open-categories aria-haspopup="dialog">{GRID}<span data-selected-category>Todos os departamentos</span><span class="category-chooser-action">Filtrar</span></button><dialog class="category-dialog" id="category-dialog" aria-labelledby="category-dialog-title"><div class="drawer-head"><h2 id="category-dialog-title">Departamentos</h2><button class="icon-btn" data-close-categories aria-label="Fechar departamentos">{CLOSE}</button></div><div data-category-options></div></dialog><div class="catalog-layout"><aside class="catalog-sidebar" aria-label="Categorias de produtos"><p class="mini-label">CATEGORIAS</p><div class="category-filters"><button class="category-filter" data-filter="todos" aria-pressed="true"><span>Todos os produtos</span><small>{len(PRODUCTS)+len(groups)}</small></button>{controls}</div></aside><div class="catalog-content"><div class="catalog-category-head"><p class="mini-label" data-category-tag>TODOS OS DEPARTAMENTOS</p><h2 data-category-title>Todos os produtos</h2><p data-category-description hidden></p></div><div class="catalog-count"><span data-results-count role="status">{len(PRODUCTS)} produtos e {len(groups)} grupos</span><button class="clear-filters" data-clear-filters hidden>Limpar busca</button></div>
    <section class="catalog-product-section" data-catalog-products aria-labelledby="specific-products-title"><div class="catalog-section-heading"><h3 id="specific-products-title">Escolha seus produtos</h3></div><div class="product-results">{''.join(specific)}</div></section>
    <section class="catalog-group-section" data-catalog-groups aria-labelledby="product-groups-title"><div class="catalog-section-heading"><h3 id="product-groups-title">Mais itens por departamento</h3><p>Procura outro ingrediente ou material? Adicione o grupo à lista e informe a marca ou modelo que precisa.</p></div><div class="product-results">{''.join(groups)}</div></section>
    <div class="no-results" data-no-results hidden><h3>Ainda não encontrou?</h3><p>Tente outro nome ou fale com a equipe para consultar o produto.</p>{button('Consultar a loja','/lojas/#atendimento','blue')}</div><p class="catalog-disclaimer">Fotos de referência dos produtos divulgados pela loja, com edição de fundo e iluminação. Modelos, marcas, preços e disponibilidade são confirmados no atendimento. A lista é uma consulta, sem reserva de estoque.</p></div></div></div></section>
    <section class="helium-section"><div class="wrap helium-grid"><div class="helium-photo">{photo_tile("/assets/catalogo/festas-v1.jpg","Balões metalizados de coração da 3 Irmãos","Festas & balões","/produtos/?categoria=festas")}</div><div>{label('Balões com gás hélio')}<h2 data-reveal>Vai precisar<br><em>de balões?</em></h2><p>Balões de látex e metalizados, artigos de decoração e opções com gás hélio. Consulte o enchimento de balões e os cilindros anunciados pela loja.</p>{button('Conversar sobre balões','/lojas/?assunto=baloes#atendimento','blue')}</div></div></section>'''

def business():
    segments=[('confeitaria','Confeitaria','Ingredientes e embalagens','Ingredientes, chocolates, coberturas, utensílios e embalagens para suas encomendas.',['confeitaria','utensilios','embalagens']),('lanchonete','Lanchonete e padaria','Frios e itens para o preparo','Frios, congelados, ingredientes e descartáveis para a rotina de produção e atendimento.',['frios','alimentos','embalagens']),('revenda','Comércio e revenda','Doces para revender','Doces, chocolates, guloseimas e produtos de mercearia para repor seu mix.',['doces','alimentos','embalagens']),('festas','Festas e presentes','Balões, doces e presentes','Balões, artigos de festa, doces e itens para montar cestas e presentes.',['festas','cestas','doces'])]
    tabs=''.join(f'<button role="tab" id="segment-tab-{k}" aria-controls="segment-{k}" aria-selected="{"true" if i==0 else "false"}" tabindex="{0 if i==0 else -1}" data-segment="{k}"><span>0{i+1}</span>{title}</button>' for i,(k,title,*_) in enumerate(segments))
    panels=[]
    for i,(key,title,headline,desc,cats) in enumerate(segments):
        links=''.join(f'<a href="/produtos/?categoria={cat}">{next(c["name"] for c in CATALOG if c["id"]==cat)}</a>' for cat in cats)
        photo=photo_for(cats[0])
        visual=f'<div class="segment-photo">{image(photo,title)}</div>' if photo else f'<div class="segment-panel-icon">{icon(cats[0])}</div>'
        panels.append(f'<div class="segment-panel" id="segment-{key}" role="tabpanel" aria-labelledby="segment-tab-{key}" {"hidden" if i else ""}>{visual}<p class="mini-label">Para {title.lower()}</p><h3>{headline}</h3><p>{desc}</p><div class="segment-links">{links}</div>{button("Montar minha lista","/produtos/?categoria="+cats[0],"yellow")}</div>')
    return f'''<section class="business-hero"><div class="wrap business-hero-grid"><div>{label('Atacado & varejo')}<h1 class="page-title">Produtos para<br><em>o seu negócio.</em></h1><p>Ingredientes, frios, embalagens e doces para confeitaria, lanchonete, padaria e revenda. Consulte condições e quantidades com a loja.</p>{button('Ver meu segmento','#seu-segmento','blue')}</div><div class="business-hero-pictures">{photo_tile('/assets/catalogo/embalagens-v1.jpg','Composição ilustrativa de embalagens para alimentos','Para suas encomendas','/produtos/?categoria=embalagens')}{photo_tile('/assets/catalogo/milka-v1.jpg','Chocolates Milka apresentados pela 3 Irmãos','Para a próxima venda','/produtos/?categoria=doces')}</div></div></section>
    <section class="section segment-section" id="seu-segmento"><div class="wrap"><div class="section-head"><div>{label('Por segmento','01')}<h2 data-reveal>O que você usa<br><em>no dia a dia?</em></h2></div><p>Selecione seu segmento para ver as categorias relacionadas.</p></div><div class="segment-layout"><div class="segment-tabs" role="tablist" aria-label="Segmento do seu negócio" aria-orientation="vertical">{tabs}</div><div class="segment-panels">{''.join(panels)}</div></div></div></section>
    <section class="section purchase-steps"><div class="wrap"><div>{label('Consulta pelo WhatsApp','02')}<h2 data-reveal>Como consultar<br><em>a loja.</em></h2></div><div class="steps-grid"><article data-reveal><span>01</span><h3>Encontre<br>os produtos.</h3><p>Explore os departamentos e adicione o que procura à sua lista de consulta.</p></article><article data-reveal><span>02</span><h3>Conte<br>a quantidade.</h3><p>Informe a quantidade ou embalagem que precisa. Pode ser para casa, encomenda ou revenda.</p></article><article data-reveal><span>03</span><h3>Converse<br>com a equipe.</h3><p>Escolha a loja. A equipe confirma os produtos disponíveis e as condições para sua compra.</p></article></div></div></section>
    <section class="business-note"><div class="wrap"><span class="note-big" aria-hidden="true">+</span><h2 data-reveal>Vai comprar<br><em>para casa?</em></h2><p>Atendemos no varejo também. Fale com a equipe sobre os produtos que procura.</p>{button('Falar com a 3 Irmãos','/lojas/?assunto=negocio#atendimento','blue')}</div></section>'''

def about():
    gallery=''.join(f'<figure class="gallery-photo" data-reveal><div class="gallery-frame">{image(g["src"],g["alt"])}</div><figcaption>{E(g.get("caption","Um pouco da nossa loja."))}</figcaption></figure>' for g in MEDIA.get('gallery',[])[:4])
    return (ROOT / "content/historia.html").read_text() + f'''
    {('<section class="real-gallery section"><div class="wrap">'+label('Fotos de produtos da loja')+'<div class="real-gallery-grid">'+gallery+'</div></div></section>') if gallery else ''}
    <section class="community-section"><div class="wrap community-grid"><div>{label('Aqui na região')}<h2 data-reveal>Além do balcão.</h2></div><div><p>O Arraiá, as degustações e a reinauguração reuniram clientes, equipe e família.</p><p>Compartilhamos esses encontros e os produtos das lojas no Instagram.</p><a class="underlink" href="https://www.instagram.com/distribuidoras3irmaos/" target="_blank" rel="noopener noreferrer">Ver o Instagram da loja</a></div></div></section>
'''

def stores():
    cards=[]
    for i,(key,name,street,city,phone,wa) in enumerate([('rio-branco','Rio Branco do Sul','Rua Duque de Caxias, 352','Rio Branco do Sul, PR','(41) 3652-3410','554136523410'),('itaperucu','Itaperuçu','Av. Crispim Furquim Siqueira, 503','Centro Industrial — Itaperuçu, PR','(41) 99853-8879','5541998538879')]):
        query='Distribuidora 3 Irmaos '+street+' '+city
        from urllib.parse import quote
        maps='https://www.google.com/maps/search/?api=1&query='+quote(query)
        contact_attrs = f'target="_blank" rel="noopener noreferrer" data-whatsapp="{key}"'
        whatsapp_button = button('WhatsApp da loja','https://wa.me/'+wa+'?text=Ol%C3%A1%21%20Vim%20pelo%20site%20da%203%20Irm%C3%A3os.','blue',contact_attrs)
        cards.append(f'<article class="store-card" id="{key}" data-reveal><div class="store-card-top"><span>0{i+1} / NOSSA LOJA</span>{PIN}</div><h2>{name}</h2><address>{street}<br>{city}</address><a class="phone" href="tel:+{wa}">{phone}</a><div class="store-card-actions">{whatsapp_button}<a class="underlink" href="{maps}" target="_blank" rel="noopener noreferrer" data-directions="{key}">Como chegar</a></div></article>')
    return f'''<section class="page-intro stores-intro"><div class="wrap">{label('Endereços e contato')}<div class="intro-row"><h1 class="page-title">Nossas lojas.</h1><div><p>Rio Branco do Sul e Itaperuçu. Veja o endereço ou fale direto com a unidade.</p><div class="stores-intro-links"><a class="underlink" href="#mapa-das-lojas">Ver no mapa</a><a class="underlink" href="#atendimento">Fale com a gente</a></div></div></div></div></section><section class="store-locations"><div class="wrap"><div class="store-grid">{''.join(cards)}</div><p class="store-hours">Consulte a unidade para confirmar horários de atendimento e funcionamento em feriados.</p>{store_map()}</div></section>
    <section class="contact-section section" id="atendimento"><div class="wrap contact-grid"><div>{label('Atendimento')}<h2 data-reveal>Como a gente<br><em>pode ajudar?</em></h2><p>O que você está procurando? Prepare sua mensagem e continue o atendimento no WhatsApp da loja escolhida.</p><a class="instagram-contact" href="https://www.instagram.com/distribuidoras3irmaos/" target="_blank" rel="noopener noreferrer">{IG}<span>Novidades no Instagram<strong>@distribuidoras3irmaos</strong></span></a></div><form id="contact-form" class="contact-form"><div class="form-row"><label for="name">Seu nome<input id="name" name="name" autocomplete="given-name" placeholder="Como podemos chamar você?" maxlength="80" required></label><label for="store">Qual loja?<select id="store" name="store"><option value="rio-branco">Rio Branco do Sul</option><option value="itaperucu">Itaperuçu</option></select></label></div><label for="purpose">Estou comprando para<select id="purpose" name="purpose"><option value="casa">Minha casa ou uma comemoração</option><option value="negocio">Meu negócio ou revenda</option></select></label><label for="message">O que você precisa?<textarea id="message" name="message" rows="4" placeholder="Ex.: preciso de recheio de damasco e 20 caixas para bolo." maxlength="1800" required></textarea></label><button type="button" class="include-list" data-include-list hidden>Incluir os produtos da minha lista {PLUS}</button><p class="form-note">Você vai revisar a mensagem no WhatsApp antes de enviar.</p><button class="btn btn-yellow full-width" type="submit"><span>Continuar no WhatsApp</span><i>{WA}</i></button><p class="form-status" id="form-status" role="status" hidden></p></form></div></section>'''

def schema(path):
    return {'@context':'https://schema.org','@type':'Organization','name':'Distribuidora 3 Irmãos','url':ORIGIN,'logo':ORIGIN+MEDIA['logo'],'sameAs':['https://www.instagram.com/distribuidoras3irmaos/'],'department':[{'@type':'Store','name':'Distribuidora 3 Irmãos — Rio Branco do Sul','telephone':'+554136523410','address':{'@type':'PostalAddress','streetAddress':'Rua Duque de Caxias, 352','addressLocality':'Rio Branco do Sul','addressRegion':'PR','addressCountry':'BR'}},{'@type':'Store','name':'Distribuidora 3 Irmãos — Itaperuçu','telephone':'+5541998538879','address':{'@type':'PostalAddress','streetAddress':'Av. Crispim Furquim Siqueira, 503, Centro','addressLocality':'Itaperuçu','addressRegion':'PR','addressCountry':'BR'}}]}

pages=[('inicio','/','Distribuidora 3 Irmãos | Frios, doces, embalagens e festas','Frios, doces, confeitaria, embalagens e festas. Distribuidora 3 Irmãos em Rio Branco do Sul e Itaperuçu. Atacado e varejo.',home),('produtos','/produtos/','Produtos | Distribuidora 3 Irmãos','Explore confeitaria, frios, doces, importados, embalagens, utensílios, festas e balões. Monte uma lista para consultar a 3 Irmãos pelo WhatsApp.',products),('negocio','/para-seu-negocio/','Para seu negócio | Atacado e varejo 3 Irmãos','Ingredientes, embalagens e produtos para confeitaria, lanchonete, padaria, comércio e revenda. Encontre o mix para o seu negócio.',business),('sobre','/a-3-irmaos/','Nossa história | Distribuidora 3 Irmãos','Do caminhão de doces de Dedei às lojas da família. Conheça a história da 3 Irmãos em Rio Branco do Sul e Itaperuçu.',about),('lojas','/lojas/','Lojas e contato | Distribuidora 3 Irmãos','Endereços, WhatsApp e localização da Distribuidora 3 Irmãos em Rio Branco do Sul e Itaperuçu. Fale com a unidade mais próxima.',stores)]

pages.insert(3,('novidades','/novidades/','Novidades | Cerro Azul e cozinha de treinamento | 3 Irmãos','A próxima etapa da 3 Irmãos: uma nova loja em Cerro Azul e uma cozinha de treinamento. Acompanhe o que vem aí.',lambda: (ROOT/'content/novidades.html').read_text()))

for key,path,title,desc,render in pages:
    body=render()
    experience_assets=('<link rel="stylesheet" href="/experience.css"><link rel="stylesheet" href="/home.css"><script src="/experience-data.js" defer></script><script src="/experience.js" defer></script>' if key=="inicio" else "")
    if key=='sobre':
        experience_assets='<link rel="stylesheet" href="/historia.css"><script type="module" src="/historia.js"></script>'
    if key=='novidades':
        experience_assets='<link rel="stylesheet" href="/novidades.css"><script src="/novidades.js" defer></script>'
    viewport_content = "width=device-width, initial-scale=1, viewport-fit=cover"
    output=f'''<!doctype html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="{viewport_content}"><meta name="theme-color" content="#103bb9"><title>{E(title)}</title><meta name="description" content="{E(desc)}"><link rel="canonical" href="{ORIGIN+path}"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:url" content="{ORIGIN+path}"><link rel="icon" href="/assets/favicon.png"><link rel="preload" href="/assets/manrope-700.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/styles.css">{experience_assets}<link rel="stylesheet" href="/photography.css"><link rel="stylesheet" href="/surfaces.css"><link rel="stylesheet" href="/offers.css"><link rel="stylesheet" href="/shopping.css?v=31"><script src="/config.js" defer></script><script src="/api/catalog.js" defer></script><script src="/model.js?v=30" defer></script><script src="/app.js?v=31" defer></script><script src="/offers.js?v=30" defer></script><script type="application/ld+json">{json.dumps(schema(path),ensure_ascii=False)}</script></head><body data-page="{key}">{header(key)}<main id="conteudo">{body}</main>{footer(key)}</body></html>'''
    target=DIST/path.strip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(output)
    print(path, '→', target.relative_to(ROOT))

(DIST/'catalog-data.js').write_text('window.CATALOG = '+json.dumps(CATALOG,ensure_ascii=False)+';\n')
(DIST/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+ORIGIN+p[1]+'</loc></url>' for p in pages)+'</urlset>')
(DIST/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+ORIGIN+'/sitemap.xml\n')

(DIST/'experience-data.js').write_text('window.EXPERIENCE = '+json.dumps(EXPERIENCE,ensure_ascii=False)+';\n')
