# Distribuidora 3 Irmãos

Site com catálogo, ofertas programadas, painel administrativo, mapas das lojas, capa animada e jogo da história. Esta versão usa Next.js em Node.js e pode ser implantada na Hostinger. O código original da versão 31 em Cloudflare permanece no histórico do Git.

## Implantar na Hostinger

- Framework: **Next.js**.
- Node.js: **22.x** (22.13 ou superior) ou **24.x**.
- Gerenciador de pacotes: **npm**.
- Comando de compilação: **npm run build**.
- Diretório de saída: **.next**.
- Arquivo de entrada: deixe o padrão do Next.js; o build gera `.next/standalone/server.js`.
- Diretório raiz ao usar o ZIP fornecido: **3irmao-main**.

O build prepara automaticamente as fotos, scripts, estilos e modelos HTML. Não exige Python na hospedagem. Depois de publicar, o serviço escuta a porta fornecida pela plataforma.

## Banco e painel administrativo

O catálogo editável, as ofertas, contas e imagens enviadas no painel ficam em um banco MySQL. Crie um banco dedicado para esta loja na Hostinger e configure as variáveis de ambiente no hPanel:

| Variável | Conteúdo |
| --- | --- |
| `DB_HOST` | Host do banco MySQL. |
| `DB_PORT` | Porta; normalmente `3306`. |
| `DB_NAME` | Nome do banco. |
| `DB_USER` | Usuário do banco. |
| `DB_PASSWORD` | Senha do banco. |
| `ADMIN_USERNAME` | Login do administrador; padrão `admin`. |
| `ADMIN_PASSWORD` | Senha inicial com pelo menos 12 caracteres. |

Também é possível definir `DATABASE_URL` com uma URL `mysql://` no lugar das variáveis `DB_*`. As tabelas são criadas automaticamente no primeiro acesso.

A primeira entrada no painel exige trocar a senha inicial. A nova senha fica armazenada como hash PBKDF2. Cookies de sessão usam HttpOnly, SameSite e Secure em HTTPS; gravações exigem origem válida e token CSRF. O backend normaliza os cabeçalhos da proxy HTTPS da hospedagem.

Sem banco configurado em produção, as páginas públicas e o catálogo inicial continuam disponíveis, e o painel fica bloqueado. Para preservar os dados entre novas implantações, use MySQL. Contas, catálogo e fotos salvas no ambiente original de Cloudflare não são transferidos automaticamente para um novo banco da Hostinger.

## Executar e verificar localmente

```sh
npm ci
npm run build
npm start
```

Para desenvolvimento, `npm run dev` usa uma base SQLite local em `.data/`. Uma prévia do standalone também pode usar SQLite com `DATA_DIR` apontando para um diretório local de testes; essa opção não é o padrão de produção.

```sh
npm test
node scripts/test-standalone.mjs
python3 scripts/audit-static.py
```

`npm test` verifica catálogo, autenticação, períodos de oferta, proteção contra gravações concorrentes e persistência do backend Node.js, incluindo fotos e senhas. Os testes HTTP existentes usam apenas `localhost:4317` e uma conta fictícia; não devem ser executados contra produção.

## Editar

- `site/`: páginas geradas, CSS, JavaScript, fotos, fontes e áudio.
- `content/`: conteúdo inicial e templates.
- `scripts/generate_site.py`: edição dos modelos; execute com Python 3 quando alterar conteúdo/template.
- `server/api.mjs`: catálogo, ofertas e autenticação.
- `server/node-runtime.mjs`: MySQL, armazenamento das fotos e SQLite para prévia local.
- `app/`: rotas Next.js que servem HTML e API.
- `scripts/prepare-standalone.mjs`: inclui templates e arquivos públicos no servidor standalone.

As fontes das fotos estão em `SOURCES.md`; a origem da versão Sites está em `docs/proveniencia-sites.json`. Segredos, dados de produção e dependências locais são ignorados pelo Git.

Documentação da hospedagem: https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/
