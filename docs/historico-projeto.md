# Distribuidora 3 Irmãos

Site institucional em português com seis páginas reais, catálogo interativo e consulta por WhatsApp. Não realiza compras ou reservas de estoque.

## Revisão 19 — textos e apresentação

A abertura apresenta o mix de produtos com duas colunas, fotos reais selecionáveis e acesso ao catálogo e ao atendimento. Os oito departamentos aparecem em uma grade, sem depender de carrossel. Textos de catálogo, negócios, novidades e contato passam a descrever produtos e ações concretas. A história da família ganha destaque no início. Gradientes decorativos, órbitas, flutuação contínua, mudanças de abertura por rolagem e excesso de etiquetas e molduras foram retirados. As abas, ampliação das fotos, lista de consulta, portas de novidades e jogo da história continuam disponíveis.

Verificação desta revisão: abertura em 390 × 844 e 1440 × 900, sem rolagem horizontal; troca e ampliação de fotos; busca por “requeijao” com um resultado; inclusão e remoção na lista; links, âncoras e assets das seis páginas; oito categorias e 52 grupos; sintaxe dos JavaScripts modificados. Jogo e dados de contato preservados.

## Páginas

- `/`: início com três universos de produtos, movimento por cursor/rolagem, ampliação e vitrine de departamentos arrastável.
- `/novidades/`: anúncio da futura loja em Cerro Azul e cozinha de treinamento; duas portas que se abrem, transição de entrada, fotografias reais e navegação por links próprios.
- `/produtos/`: oito departamentos e 52 grupos de produtos, busca sem acentos, filtros com links próprios e lista de consulta.
- `/para-seu-negocio/`: conteúdo de atacado/varejo, quatro segmentos interativos e orientação de atendimento.
- `/a-3-irmaos/`: jogo de plataforma em 3D com Dedei, seis missões, 14 objetos, nove interações, lembranças no cenário, trilha e efeitos; leitura direta e materiais reais de produtos.
- `/lojas/`: duas unidades, seleção do mapa, contato direto e formulário que prepara uma mensagem no WhatsApp.

## Editar

Templates: `scripts/generate_site.py`. Catálogo: `content/catalog.json`. Mídia: `content/media.json`. Fotos e fontes do Instagram: `content/instagram.json`. Universos da abertura: `content/experience.json`. Após editar, execute `python scripts/generate_site.py` para atualizar os HTML em `dist/` e seus metadados.

Visual: `dist/styles.css`, `dist/experience.css`, `dist/novidades.css` e `dist/historia.css`. Interações: `dist/app.js`, `dist/experience.js`, `dist/novidades.js` e `dist/historia.js`. Conteúdo da nova página: `content/novidades.html`. Modelo de lista e mensagens: `dist/model.js`. Contatos e Analytics: `dist/config.js`. O site não tem dependências de instalação nem servidor. HTML, JS e assets gerados estão rastreados em Git e são publicados como estáticos.

## Direção visual

Tipografia Manrope em caixa normal, com títulos principais de aproximadamente 34 a 54 px e títulos de seção de aproximadamente 30 a 41 px. A abertura coloca os produtos no centro de três ambientes: produzir (azul), celebrar (amarelo) e revender (azul profundo). Os produtos usam as fotografias reais com enquadramento em CSS; as páginas de produtos, negócios e história recebem composições próprias com fotos. Azul e amarelo da marca ocupam os fundos principais, a navegação de categorias, os estados ativos e os destaques. Áreas brancas preservam a leitura do catálogo. Sem blocos de palavras gigantes ou fonte condensada.

As fotografias no topo do catálogo também funcionam como filtros e levam o visitante até os resultados. O restante do mix continua acessível por oito categorias, busca e lista de consulta.

## Movimento e interação

Três universos selecionáveis por abas e teclado; troca de capítulo por rolagem em telas de pelo menos 1200 × 800 px; gesto horizontal no produto em telas de toque; inclinação sutil pelo cursor, flutuação, mudanças de cor e ampliação em diálogo nativo. No celular as abas aparecem antes do produto. São fotografias em planos animados, sem modelo 3D. A rolagem vertical continua nativa. Movimento suspenso fora da área visível, com aba inativa, durante a ampliação ou pela preferência de movimento reduzido. Revelação por rolagem, progresso de leitura, transições de documentos nos navegadores compatíveis, vitrine arrastável com toque/teclado, microinterações, animação de resultados, abas por segmento e gaveta de lista. Preferência por movimento reduzido respeitada e controle de pausa no rodapé. Navegação normal funciona nos navegadores sem View Transitions.

## Dados

A lista contém somente IDs de grupos e observações de quantidade, em sessionStorage da própria aba. Nome e mensagem do formulário não são persistidos. O visitante revisa e envia sua mensagem no WhatsApp; o site não a envia automaticamente. Analytics não recebe texto do formulário ou observações.

Analytics desativado até informar o ID real G-. Cliques em WhatsApp, consultas de rota e adição à lista são eventos distintos; não representam vendas ou conversas confirmadas.

## Fontes e pendências

Conteúdo obtido do cadastro, contexto fornecido, publicações oficiais acessíveis e fotos vinculadas ao Planeje/Drive. O perfil do Instagram foi acessado diretamente nesta revisão; a seleção não é inventário completo nem garantia de estoque. Consulte SOURCES.md.

As cinco fotografias anteriores foram complementadas por imagens baixadas diretamente do Instagram. Os produtos fotografados aparecem nos departamentos, no catálogo, nos segmentos de negócio e na galeria. Artes originais foram enquadradas por CSS para destacar os produtos; as composições e embalagens são preservadas. A imagem ilustrativa da versão anterior não aparece nesta versão.

Os Reels do Dia do Bacon e de balões com gás hélio foram acessados, mas o download não gerou arquivos de vídeo. O Reel de balões tem link direto no bloco de redes sociais. Vídeos de reinauguração/showroom e a logo mais recente com mascotes continuam pendentes. A versão mantém a logo anterior e usa fotos reais de produtos. Não simula fachada, equipe ou vídeo da loja.

Domínio definitivo e Analytics ainda não informados. A versão é privada para revisão. O Perfil da Empresa no Google previsto na proposta ainda não foi executado.

## Verificação

Sintaxe JS, seis páginas, rotas/âncoras, assets, títulos, labels e IDs verificados. Testes do modelo cobrem busca sem acentos, categorias, restauração da lista, rejeição de entradas inválidas, quantidades e links/mensagens das duas lojas. Não houve teste visual em navegador nesta etapa.


## Novidades — revisão 9

A página `/novidades/` abre em duas portas: azul para a futura loja em Cerro Azul e amarela para a cozinha de treinamento. As superfícies são imagens originais; não são fotografias ou projetos das futuras instalações. Ao passar o cursor ou focar a porta, uma fresta revela detalhes das fotos reais usadas no anúncio. No clique, a abertura desacelera para revelar a prévia; a iluminação cresce e só depois a cena avança para o conteúdo. A transição inteira leva cerca de dois segundos. A escultura e o canvas WebGL anteriores foram removidos.

Links próprios `#cerro-azul` e `#cozinha`, botão Voltar às portas, Escape e histórico do navegador. Teclado e toque usam a mesma navegação, com foco no título após a entrada e devolvido à porta na volta. Sem JavaScript todos os anúncios e links continuam visíveis. Movimento reduzido e pausa global dão acesso imediato ao conteúdo, sem aproximação; mudanças de aba, tamanho de tela ou histórico encerram uma transição em andamento.

O usuário confirmou apenas a futura unidade em Cerro Azul e a cozinha de treinamento. Não foram publicados endereço, data de inauguração, localização da cozinha, agenda, instrutores, inscrições, preços ou serviços adicionais. As duas unidades atuais continuam sendo os únicos contatos operacionais.


## História em jogo — revisão 11

A página Nossa história agora contém um jogo de plataforma 3D controlado pelo visitante. Três trechos, nove doces colecionáveis, caixas sólidas para pular e vãos no caminho. O visitante precisa pegar três doces em cada trecho e chegar ao marco para revelar o capítulo seguinte. As lojas viram pontos de retorno; cair preserva os doces coletados. A conclusão revela os próximos espaços e oferece acesso à página Novidades. Sem avanço automático nem teletransporte por escolha de capítulo.

Teclado: setas esquerda/direita ou A/D; Espaço, seta para cima ou W para pular; Esc para pausar. Controles de toque permitem andar e pular simultaneamente. Há pausa, retomada e reinício; o jogo só começa após Jogar. Jogo suspenso fora de vista, com aba oculta e com diálogos abertos. Movimento reduzido remove efeitos secundários e suavização da câmera, preservando o movimento essencial do jogo iniciado pelo visitante. Texto completo, galeria e comunidade permanecem acessíveis abaixo, independentemente do progresso.

Conteúdo: `content/historia.html` e `dist/historia-model.js`. Regras e física: `dist/historia-game.js`. Cenário e personagem: `dist/historia-world.js`; controles, interface e ciclo de vida: `dist/historia.js`. Edifícios e personagem são ilustrações, não réplicas de fachadas ou pessoas reais. Three.js 0.160.1 distribuído localmente com licença MIT. Sem dependência de CDN em produção.

`node scripts/test-historia.mjs` verifica uma partida completa com os nove doces e três missões usando apenas os comandos comuns, colisão com caixas, controle de pulo, não repetição ao segurar o botão, requisitos de chegada, retorno após queda com progresso preservado, reinício, geometria e enquadramento matemático em três proporções de tela. Não foi realizado teste visual em navegador.

## Jogo no celular — revisão 12

Jogar abre a experiência em tela cheia nos dispositivos de toque e telas pequenas. O botão Tela cheia também permite ampliar no computador. A Fullscreen API é solicitada pelo toque do visitante; quando indisponível ou recusada, o jogo ocupa a área disponível do navegador, acompanhando mudanças de tamanho via Visual Viewport. Essa alternativa não remove barras que o próprio navegador mantém na tela. Sem bloqueio de orientação: retrato e paisagem têm câmera própria, respeitam as áreas seguras do aparelho e mantêm controles simultâneos de andar e pular.

Sair ou Voltar ao site pausa a partida, restaura a rolagem e devolve o foco ao botão de retomada. O progresso fica na memória enquanto a página estiver aberta; não há gravação entre recarregamentos. Mudança de orientação ou troca de aplicativo pausa o jogo. Reiniciar fica no painel de pausa para reduzir toques acidentais. Os diálogos de capítulos ficam dentro do elemento ampliado e recebem uma composição em duas colunas nas telas deitadas de pouca altura. Fora do jogo, a navegação e o zoom da página continuam disponíveis.

`dist/historia-screen.js` concentra tela cheia, restauração de foco/rolagem e isolamento do conteúdo ao fundo. `node scripts/test-historia-screen.mjs` verifica o ciclo com API nativa, indisponível e recusada, saída pelo navegador, pedido pendente, reabertura, redimensionamento e restauração de estado com simulações de DOM. O teste do jogo agora verifica personagem, ápice do pulo e próximo obstáculo em dez tamanhos, incluindo retrato e paisagem de celular. Sintaxe e referências locais também verificadas. Sem teste visual ou em aparelhos físicos nesta revisão.

## Dedei e as missões — revisão 13

Seis missões baseadas no relato enviado pelo cliente: rota do caminhão, nascimento do balcão, expansão do mix com a família, abertura de Itaperuçu, reinauguração de Rio Branco do Sul e próximos espaços em 2027. O jogo usa 14 objetos de cinco tipos visuais, nove ações e 24 trechos curtos de memória. Ouvir o vizinho e atender o pedido são requisitos próprios; chegar à loja e coletar objetos não conclui automaticamente a missão. As duas portas finais podem ser exploradas em qualquer ordem.

As lembranças são placas tridimensionais dentro do cenário. A câmera se aproxima do objeto; o visitante avança pelo botão de ação ou E e pode voltar a jogar sem concluir a leitura. O jogador fica parado durante essa interação. Não há pop-up de capítulo ou de vitória. O único diálogo do jogo é a pausa solicitada pelo visitante ou pelo ciclo de vida do celular. Cada lembrança também tem leitura acessível em uma região de status. Abrir o balcão e as lojas levanta as portas, abastecer revela produtos e cada porta futura se abre separadamente.

O personagem é uma interpretação estilizada de Andrei, conhecido como Dedei, baseada na foto fornecida: cabelo curto com entradas, rosto adulto, barba discreta, camiseta escura da marca e jeans. Continua sendo um modelo articulado de malhas 3D, não uma fotografia recortada nem uma digitalização fiel. O retrato de apresentação foi gerado a partir da mesma referência; sua aparência é ilustrativa. `dist/assets/historia/dedei.webp` tem 1024 × 1024 pixels e cerca de 88 KB. O vídeo não foi recebido como arquivo; os textos usam a transcrição fornecida. A sequência inclui Itaperuçu antes da reinauguração de Rio Branco e o próximo capítulo em 2027. Não foram atribuídas datas de abertura, endereço de Cerro Azul ou localização/agenda da cozinha.

Dados das missões: `dist/historia-missions.js`; regras: `dist/historia-game.js`; cena, personagem, placas e mudanças no ambiente: `dist/historia-world.js`; interface e entrada: `dist/historia.js`. A tela cheia e a retomada permanecem disponíveis. `node scripts/test-historia.mjs` verifica uma partida completa sem quedas, objetivos, pré-requisitos, ordem alternativa das portas, releitura sem duplicar progresso, física, retorno após queda e enquadramento do personagem e das placas em dez tamanhos. `node scripts/test-historia-screen.mjs` verifica o ciclo de tela cheia. Não foi realizado teste visual em navegador ou aparelho físico.


## Som e cenário vivo — revisão 14

Trilha instrumental original “Pequenas Descobertas” e 11 efeitos originais: passos, pulo, aterrissagem, coleta, portas, páginas, missão, conclusão, dica, retorno e clique. Os arquivos locais ficam em `dist/assets/historia/audio/`. Não há amostras de terceiros, música de jogos existentes, falas sintéticas ou voz clonada. O script `scripts/generate-game-audio.py DIRETORIO_DE_SAIDA` reproduz os assets com NumPy, SciPy e FFmpeg; o WAV mestre não é publicado.

`dist/historia-audio.js` só cria o contexto e carrega os arquivos após uma ação do visitante. Música e efeitos começam em 25% e 80%, com volumes independentes no painel de pausa e botão de som na apresentação, no jogo e na pausa. Preferências validadas ficam em sessionStorage. A trilha baixa durante a leitura; pausa, saída do jogo, aba oculta e mudança de aplicativo interrompem o áudio. Retomada preserva a posição da música. Downloads que terminem depois da saída não iniciam reprodução. Navegadores sem Web Audio mantêm o jogo disponível sem som.

Missão reunida em um painel compacto; barra de ações com som, pausa e tela cheia; avisos acima da área de movimento; textos de lembranças ampliados e enquadramento que reserva espaço para os controles. Céu em gradiente, sombras mais definidas, vegetação e flores, nuvens e balões em movimento, figurantes que acenam, respiração e piscadas do Dedei, sombra de contato e partículas de coleta/conquista. Flores e partículas usam instâncias e limites fixos; movimentos decorativos respeitam a preferência de movimento reduzido.

Verificados: ciclo de áudio por gesto, 12 arquivos, pausa/silêncio, volumes, preferências, retomada, carregamento tardio, ausência de loops duplicados, API indisponível e descarte; partida completa e regras das seis missões; tela cheia; enquadramento em dez tamanhos e texto das 24 lembranças. Sintaxe, seis rotas, IDs, links e assets locais conferidos. Sem teste visual em navegador ou aparelho físico nesta revisão.


## Gabriel e leitura protegida — revisão 15

Gabriel aparece junto à loja da missão da família, com rosto, cabelo volumoso e barba interpretados a partir da foto fornecida pelo cliente. Usa camiseta escura da 3 Irmãos e jeans; não reproduz a camiseta da seleção da referência. O personagem acena quando Dedei se aproxima. A ação existente de abastecer a loja passa a mencionar Gabriel; requisitos, progresso e os 24 trechos históricos permanecem iguais. Modelo em `dist/historia-gabriel.js`.

A sobreposição mostrada no print era causada pela profundidade: Dedei e bandeiras ficavam à frente da placa. A placa continua ancorada no espaço 3D, com câmera de aproximação, mas agora é desenhada em uma segunda cena após limpar a profundidade. O cenário não pode cobrir o texto nessa etapa. Dedei, bandeiras, marcadores e avisos saem da leitura; o estado normal volta ao fechar a lembrança. Texturas de texto usam resolução maior e o frame não recebe sombras. Continua havendo somente o diálogo de pausa, sem pop-ups de história.

`dist/historia-village.js` acrescenta cobblestones com textura local, telhados inclinados com telhas instanciadas, vitrines com prateleiras e produtos, luminárias, janelas em arco, pequenas sacadas, bancos, copas com folhas instanciadas e casas distantes. Paleta diurna azul/amarelo, luz quente e céu mais azul. A textura de piso original tem 1024 × 1024 e cerca de 168 KB. Não há novos serviços externos ou CDN; o limite de densidade de pixels continua em 1,5. A direção se aproxima da imagem de referência, sem afirmar equivalência a um render offline ou desempenho medido em celular.

Testes do jogo, tela cheia e áudio passaram. Acrescentada regressão da ordem de desenho: cenário, limpeza da profundidade e cena de leitura, com restauração ao sair; enquadramento continua coberto em dez tamanhos. Verificações de sintaxe, rotas e assets locais. Sem inspeção visual em navegador ou medição de GPU/aparelho físico nesta revisão.


## Cor e renderização — revisão 16

Iluminação recalibrada para preservar contraste: menos preenchimento ambiente, sol quente e exposição menor. Céu mais azul, fachadas amarelas mais intensas, terreno em verdes profundos e relevo contínuo no horizonte, substituindo as grandes esferas pálidas. Copas usam folhas pontudas em grupos irregulares, com menos geometria base que as bolinhas anteriores. Gramado com textura, bordas com lâminas 3D e pequenas flores com pétalas. Piso e paredes recebem relevo por bump map; pintura, vidro e metal têm rugosidade e reflexos próprios.

`dist/historia-rendering.js` adiciona um passe HDR linear em GPUs WebGL2 com EXT_color_buffer_float, sombras de contato calculadas com profundidade e 12 amostras estáveis, transformação ACES/sRGB única e leve ajuste de intensidade de cor. Antialiasing usa a contagem suportada de até quatro amostras. Um ambiente original pré-filtrado por PMREM fornece reflexos suaves. Os textos continuam desenhados depois da cena, protegidos de sobreposição e desses efeitos. Sem suporte aos recursos avançados, o jogo usa a renderização direta; exceções no efeito também retornam ao caminho básico. Densidade de pixels limitada a 1,25 em toque e 1,5 nos demais dispositivos; mapa de sombras de 2048 em telas largas e 1024 nas demais.

Materiais e texturas: `dist/historia-surfaces.js`, `/assets/historia/meadow-grass.webp` e `/assets/historia/lime-plaster.webp`. Duas imagens originais, 1024 × 1024, cerca de 855 KB combinadas. Folhas e lâminas de grama são instanciadas; árvores e cenário permanecem ilustrações. Não se afirma equivalência à imagem de referência ou taxa de quadros medida.

Verificação: partida completa, 24 lembranças, leitura em segundo passe, restauração do estado, dez proporções, tela cheia, áudio, sintaxe e assets. A implementação HDR foi revisada contra a versão local de Three.js 0.160.1: targets HalfFloat, conversão de cor única, resolução de profundidade, capacidades e descarte. Sem compilação de shaders em GPU, inspeção visual em navegador ou teste em celular físico nesta revisão.

## Fluidez e encontros — revisão 17

Corrigido o HUD móvel: o inset inferior herdado esticava o grid por toda a tela e posicionava a missão sobre o personagem. Agora a altura acompanha o conteúdo no topo. O aviso sobre a adaptação da história fica abaixo do jogo. As placas e bandeiras repetidas foram retiradas; indicadores pequenos aparecem junto à pessoa, à porta ou ao balcão próximo.

O vizinho espera na porta do depósito. O cliente de Itaperuçu está junto ao balcão de pedidos da loja existente; o antigo prédio pequeno identificado como Itaperuçu foi removido. Os dois pedidos ficam sobre balcões, em posições seguras, e conversar não exige coletar um pedido antes. Chamadas e mensagens de conclusão indicam o motivo do encontro e o próximo destino. As lembranças incluem fotos fornecidas de Dedei e Gabriel, identificação e papel na família, com textos em terceira pessoa e indicação “Memória da família”. As imagens são guias editoriais da adaptação, sem atribuir depoimentos anônimos a uma pessoa específica.

Desktop solicita a GPU de maior desempenho como preferência do navegador. O buffer tem limite de 2,1 milhões de pixels, DPR inicial até 1,25 no desktop e 1 em toque. `historia-performance.js` reduz a resolução em até dois níveis somente após lentidão sustentada durante o jogo, com aquecimento e exclusão de leitura/pausa/interrupções. Física continua em 120 Hz. HDR, cor e ambiente refletido permanecem; desktop usa seis amostras de contato e até duas de MSAA, toque desativa o contato em pós-processamento e MSAA do target. Sombras usam 1536 no desktop largo ou 1024 nos demais. Atualizações de HUD redundantes em passos físicos sem eventos foram removidas.

Verificação: partida completa sem quedas, nove interações, 24 páginas, dez proporções de câmera, leitura sem obstrução, tela cheia e áudio. Regressões adicionadas para HUD móvel, pedidos em terreno seguro, conversa sem coleta prévia e fotos. Teste de orçamento de resolução cobre desktop 4K, aparelhos fluidos, lentidão sustentada, pausa e leitura. Limites tipográficos calculados para as 48 combinações de páginas/orientação com métricas Nimbus Sans. Rotas, assets, imports e sintaxe verificados. Sem navegador, compilação GPU ou medição de FPS em aparelho nesta revisão; o relato de fluidez no iPhone 17 Pro Max veio do usuário.

## Personagens arredondados — revisão 18

`historia-character-shapes.js` substitui os blocos do corpo por perfis suaves compartilhados. Dedei, Gabriel e os dois clientes usam tronco contínuo, braços e pernas afunilados, mãos com polegar, sapatos ovais e sola baixa. Os logos das camisetas são planos transparentes, sem a espessura de uma placa. Sobrancelhas curvas e uma superfície contínua de bochechas/mandíbula suavizam os rostos. Dedei mantém testa alta, cabelo recuado e barba leve; Gabriel mantém a barba e o cabelo volumoso. Uniformes escuros e fotos reais dos cards preservados.

A caminhada articula joelhos e cotovelos, com balanço discreto do corpo. Gabriel e clientes acenam com o antebraço. As formas são calculadas uma vez e reutilizadas; não há subdivisão por quadro, novas luzes, texturas externas ou pós-processamento adicional. Perfil adaptativo e limites de resolução da revisão 17 permanecem. Contagem estática do cenário: 1.238 meshes / 223.802 vértices, cerca de 3,3% mais vértices que a revisão anterior. Pequenos detalhes dos olhos e sobrancelhas não projetam sombras. Essa contagem não é uma medição de FPS.

Verificação: partida completa, 24 páginas, nove interações, leitura sem sobreposição e enquadramento em dez tamanhos; integridade de geometria, imports e sintaxe. Sem inspeção visual em navegador ou comparação de desempenho em aparelho físico. A direção é de animação 3D estilizada, com personagens originais inspirados nas referências fornecidas.


## Abertura animada e links — revisão 20

Restaurados a flutuação dos produtos, a resposta ao cursor, as transições de cor e a troca de cenas pela rolagem no desktop. Celulares mantêm a escolha pelas abas e gesto horizontal. Movimento reduzido e pausa continuam disponíveis. Textos e fotos reais da revisão anterior foram preservados.

Removidas as setas decorativas repetidas dos botões, departamentos, abas, fotos e links. Links textuais têm sublinhado para facilitar a identificação. Setas de voltar e avançar nas novidades e comandos do jogo conservam sua função de navegação.

Verificação: geração das seis páginas, sintaxe de JavaScript, links, âncoras, assets, IDs únicos e inspeção visual desktop/mobile; troca por rolagem, abas, teclado, ampliação de imagem e pausa.


## Organização da página inicial — revisão 21

A página inicial separa catálogo, compra para negócios, lojas e atendimento, história da família e publicações do Instagram. Os oito departamentos são agrupados em alimentos/ingredientes e embalagens/festas/utensílios. Títulos, espaçamentos, bordas, fotos e controles seguem um mesmo padrão em `dist/home.css`.

As duas unidades têm endereço, telefone e WhatsApp próprios na página inicial. A história oferece caminhos distintos para leitura e para o jogo do Dedei. O rodapé das seis páginas separa a marca, a navegação e os contatos; as unidades têm âncoras próprias. O chamado final repetido foi retirado da página inicial.

A animação da abertura e o jogo foram preservados. Não foram adicionadas setas decorativas. Conferidos visualmente desktop e celular, catálogo por departamento, destinos das lojas e leitura da história; seis páginas, links, âncoras, arquivos e IDs validados.

## Convite para jogar na abertura — revisão 22

A primeira das três cenas agora apresenta o jogo da história da família. Imagem original gerada com a ferramenta integrada de imagens, usando o cenário existente e o retrato do Dedei como referências: uma cidade em miniatura emerge de um livro aberto. Asset otimizado em `dist/assets/historia/convite-jogo-v1.jpg`, 1536 × 1024. Trata-se de uma cena criativa ilustrativa, não de uma foto histórica.

O botão “Jogar nossa história” e a imagem abrem `/a-3-irmaos/`. As cenas seguintes mantêm Festas e Doces, com fotos reais e ampliação. A flutuação, a resposta ao cursor, as transições e a rolagem continuam; a seleção pelas abas usa o centro de cada trecho de rolagem. Movimento reduzido e pausa preservados. Nenhuma seta decorativa acrescentada.

Verificação: links, assets, âncoras, IDs, seis páginas e sintaxe de JavaScript; inspeção visual em 1440, 390 e 320 pixels, navegação por abas e teclado, ampliação de produto e acesso ao jogo pela imagem. Sem rolagem horizontal nas larguras verificadas.

## Capa da abertura no desktop — revisão 23

A primeira cena usa toda a largura da abertura a partir de 1101 pixels. A imagem mantém sua proporção e mostra o livro e o Dedei inteiros, com o título, o botão e a navegação sobre uma faixa escurecida à esquerda. Flutuação e movimento pelo cursor continuam ativos, com inclinação mais suave para a imagem ampliada. As cenas de produtos e o enquadramento do celular foram preservados.

Conferidos desktop 1440 × 900 e notebook 1366 × 768, troca entre as cenas, acesso ao jogo pela capa e celular de 390 pixels. Sem rolagem horizontal nas larguras verificadas.

## Controles discretos e proporção do Dedei — revisão 24

Retirados o aviso de rolagem, a linha de seletores com nomes abaixo da imagem e o chamado repetido para entrar no jogo. Três segmentos numerados no topo da arte selecionam as cenas; nomes acessíveis, foco de teclado, setas/Home/End e áreas de toque de 44 pixels permanecem. A cena da história não repete título e link abaixo da capa. Festas e Doces mantêm a descrição, o acesso à categoria e a ampliação de foto.

A ferramenta integrada image_gen editou a capa existente para reduzir a cabeça do Dedei e preservar o cenário do livro. Imagem otimizada de 1536 × 1024 em `dist/assets/historia/convite-jogo-v2.jpg`. A largura total no desktop, a flutuação, a troca por rolagem e os controles de movimento permanecem.

Verificação: seis páginas geradas; sintaxe de JavaScript, links, âncoras, assets e IDs; inspeção visual em 1440 × 900, 1366 × 768, 390 × 844 e 320 × 780 sem rolagem horizontal. Conferidos troca por clique, teclado e rolagem, ampliação da foto e acesso ao jogo pela capa.

## Fotografia dos produtos e publicações recentes — revisão 25

Doze imagens com apresentação consistente em `dist/assets/catalogo/`: dez edições de fotos de produtos da loja, sem mãos, prateleiras ou faixas promocionais, e duas composições ilustrativas para alimentos e embalagens. Ferramenta integrada `image_gen.imagegen`; JPEGs de 1024 × 1024, fundos claros, luz suave e produto completo. Referências, textos alternativos e origem em `content/photography.json`. As composições têm indicação de imagem ilustrativa nos departamentos e o catálogo explica as referências e a confirmação de modelos pela equipe. Fotos anteriores preservadas como referências.

A home, o catálogo, a página para negócios, a galeria da história e os produtos das portas de novidades usam o mesmo tratamento. `dist/photography.css` mantém embalagens completas, legendas fora das fotos e adaptação às telas. Festas mostra balões de coração; Doces mostra gomas Amos Peelirz. Removida a frase “Nossa história em jogo” da primeira cena, incluindo a marcação inicial e o texto carregado. A capa do livro e a animação das três cenas permanecem.

O Instagram oficial foi consultado em 9/10/2026. `content/social-posts.json` guarda três publicações verificadas de 6 a 8/10: oficina de squishy, kit achocolatado e anúncio da Popper. Fotos originais, data, descrição curta e link para cada publicação; nenhuma atualização automática do feed ou promessa de estoque. Consultadas também fontes oficiais de Docile, Alcremo e DiCaramella para as categorias de produtos.

Verificação: seis páginas geradas, links, âncoras, assets, IDs únicos, oito departamentos e 52 grupos; sintaxe de JavaScript e diff. Inspeção visual em 1440 × 900, 390 × 844 e 320 × 780, sem rolagem horizontal. Conferidos enquadramentos completos, troca de cena por clique e teclado, ampliação de produto, filtro por departamento, inclusão e remoção na lista de consulta e imagens/datas das publicações. Não houve alteração nas regras do jogo.

## Produtos identificados no catálogo — revisão 26

A página de produtos apresenta primeiro 21 produtos concretos divulgados pela loja, com foto, nome, marca, apresentação, descrição curta e botão para a lista de consulta. Inclui DiCaramella, três bisnagas Alcremo, chocolates Milka, gomas Amos, alfajor Oreo, doces Pietrobon, importados, balões Silver Festas, bico Wilton, caixas para presente e o kit achocolatado publicado no Instagram. Dados e referências em `content/products.json`; links para a publicação original quando disponíveis. Preços e disponibilidade continuam sendo confirmados no atendimento.

Os 52 grupos gerais estão separados em “Mais itens por departamento”. IDs e nomes anteriores foram preservados para listas salvas. Busca reconhece nome, marca, sabor, apresentação e palavras relacionadas, respeita o departamento selecionado e conta separadamente produtos e grupos. Seções sem resultados ficam ocultas. O cabeçalho do catálogo foi reduzido e o antigo painel de fotos dos departamentos retirado dessa página para antecipar os produtos.

Oito edições adicionais de fotos da loja, com `image_gen.imagegen`, em `dist/assets/catalogo/` e metadados em `content/photography.json`. Balões de estrela, biscoitos Stitch e kit achocolatado conservam as fotos originais. A edição tentada dos balões de estrela mudou a medida impressa e foi descartada. O CSS apresenta o produto completo sem cortes. A home, a animação das três cenas e o jogo mantêm a revisão anterior.

Verificação: seis páginas geradas; auditoria de arquivos, links, âncoras e IDs; sintaxe de JavaScript; `scripts/test-catalog.mjs` cobre produtos novos, compatibilidade das listas anteriores, busca por marca/sabor, isolamento por categoria e controles gerados. Revisão em navegador nas larguras CSS de 1440, 390 e 320 pixels, sem rolagem horizontal. Conferidos filtros, busca sem resultados e limpeza, inclusão de produto concreto, quantidade mantida ao trocar de página e remoção da lista.

## Contraste entre blocos — revisão 27

`dist/surfaces.css`, carregado após os estilos de cada página, define sombras em camadas para produtos, departamentos, unidades, publicações, fotografias e convite para o jogo. Grupos gerais usam uma sombra menor; formulário, mapa e painéis de segmento usam uma sombra mais ampla; a lista de consulta tem maior profundidade. Bordas discretas e fundos brancos reforçam a separação dos cards. Links e produtos recebem uma sombra mais evidente ao passar o mouse no desktop. O cabeçalho fixo tem uma sombra leve durante a rolagem.

No celular, as sombras são compactas para manter a leitura entre os cards. Movimento reduzido elimina as transições adicionadas. Regras do jogo e animação da capa preservadas; a sombra externa do cenário não se aplica em tela cheia.

Verificação: seis páginas geradas e auditadas, referências de arquivos e âncoras; inspeção visual das sombras na página inicial, catálogo, lojas e atendimento, com conferência de overflow em desktop e celular. Não há alteração de dados ou comportamento de compra.

### v28 — administração e ofertas programadas

O site usa o starter Vinext/Sites para servir as páginas existentes e uma API com D1 (catálogo, ofertas, conta e sessões) e R2 (fotos enviadas). A animação, as fotos e o jogo permanecem em `site/`. `scripts/generate_site.py` gera os seis modelos; `node scripts/prepare-public.mjs` copia os arquivos públicos antes do build oficial Sites. A configuração mantém a identidade do projeto e a audiência pública.

`/admin/` permite cadastrar, editar, ocultar e excluir produtos e categorias, enviar fotos JPG/PNG/WebP de até 5 MB e gerenciar ofertas com preço, início e término no horário de Brasília. O exemplo Milka Bubbly de R$ 9,90 começa como rascunho. Cada gravação verifica a revisão para impedir sobreposição entre sessões. Categorias com produtos precisam ser reorganizadas antes da exclusão.

O botão Oferta do dia abre um diálogo com foto, preço, validade e consulta por WhatsApp. O servidor inclui apenas ofertas ativadas dentro do período; o navegador remove a oferta no término e consulta atualizações a cada 30 segundos. Produtos/categorias ocultos não aparecem em ofertas.

O primeiro acesso exige trocar a senha inicial. A senha usa hash PBKDF2; sessões aleatórias ficam em cookies HttpOnly/Secure/SameSite, e gravações exigem origem válida e token CSRF. O login possui limite de tentativas por IP. Os valores de produção `ADMIN_USERNAME`, `ADMIN_SALT` e `ADMIN_PASSWORD_HASH` são configurados como variáveis/segredos do Sites. Nenhuma senha ou estado local de teste acompanha o código.

Validação: testes de API para autenticação, troca de senha, CSRF, persistência, revisão concorrente, visibilidade e limites de início/término; regressões do catálogo e lista; auditoria de links/ativos; build de produção e revisão no navegador.
