# Distribuidora 3 Irmãos

Código da versão 31 do site, publicada em ChatGPT Sites. Inclui o catálogo, as fotos, a animação da capa, o jogo da história, as duas lojas com mapas e o painel administrativo.

Site: https://distribuidora-3-irmaos.josiasbonfim.chatgpt.site/

## Estrutura

- `site/`: HTML, CSS, JavaScript, fotos, fontes e áudio.
- `content/`: conteúdo inicial do catálogo e templates.
- `scripts/generate_site.py`: gera as seis páginas públicas em `site/`.
- `server/`: API do catálogo, ofertas e autenticação do painel.
- `app/`: rotas Vinext/Cloudflare que servem as páginas e a API.
- `db/` e `drizzle/`: esquema e migração do banco.
- `.openai/hosting.json`: identidade do projeto Sites e bindings D1/R2.

## Funcionalidades

- Busca por produto, marca e categoria, fotos ampliadas e lista com quantidades.
- Consulta por WhatsApp com seleção da unidade.
- Ofertas com preço, início e término; ocultação automática fora do período.
- Admin em `/admin/` para produtos, categorias, fotos e ofertas.
- Mapas de Rio Branco do Sul e Itaperuçu na home e na página de lojas.
- Capa animada com três cenas e jogo da história com Dedei.
- Navegação adaptada ao celular.

## Executar

Requer Node.js 24 e Python 3. Instale as dependências e gere os arquivos públicos:

```sh
npm ci
python3 scripts/generate_site.py
node scripts/prepare-public.mjs
npm run build
```

A aplicação usa Cloudflare Workers, D1 (`DB`) e R2 (`BUCKET`). Para a prévia local, aplique a migração no banco local criado pelo build:

```sh
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_silky_praxagora.sql
npm start -- --port 4317
```

A migração deve ser aplicada uma vez em um banco novo. O painel requer `ADMIN_USERNAME`, `ADMIN_SALT` e `ADMIN_PASSWORD_HASH`, configurados como segredos no ambiente de hospedagem. O hash usa PBKDF2 com SHA-256, 100.000 iterações e 256 bits. Para uma prévia autenticada, configure esses valores em `dist/server/.dev.vars`, que é ignorado pelo Git.

## Verificações

```sh
node scripts/test-catalog.mjs
node scripts/test-admin.mjs
python3 scripts/audit-static.py
```

Os testes HTTP em `scripts/test-admin-http.mjs` e `scripts/test-shopping-http.mjs` usam uma instância local de teste em `localhost:4317` e a conta fictícia definida nesses testes. Não devem ser executados contra o site de produção.

## Dados de produção

Este repositório contém código e assets versionados. O catálogo editado no painel, ofertas salvas, sessões e contas permanecem no D1 do site; imagens enviadas no painel permanecem no R2. Esses dados e segredos de produção não fazem parte do Git. O site publicado continua usando o ambiente existente.

A origem das imagens e do conteúdo está em `SOURCES.md`. A versão Sites e o commit de origem estão em `docs/proveniencia-sites.json`. As notas antigas de desenvolvimento foram preservadas em `docs/historico-projeto.md`.
