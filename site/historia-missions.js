// Historical copy paraphrases the client's transcript; objectives are playful interpretations.
export const missions = [
  { x:0, end:16, label:'A rota do Dedei', item:'doces', required:3, kind:'candy', objective:'Pegue os doces e faça a entrega.', actions:[
    {id:'entrega',x:16,label:'Entregar os doces',requires:3,title:'Antes da loja, a estrada.',pages:[
      'Andrei, o Dedei, passou seis anos vendendo doces na rua com o caminhão, antes de abrir a distribuidora.',
      'Nos três primeiros meses com o Sr. João Bela Vista, ele trabalhou em troca do almoço.',
      'Um dos filhos lembra do pai presente, apesar das longas jornadas. Aos 12 anos, o filho também começou a ajudar na rota.'
    ]}
  ]},
  { x:16, end:32, label:'Tem alguém aí?', item:'chave', required:1, kind:'key', objective:'Vá ao depósito, atenda o vizinho e encontre a chave.', actions:[
    {id:'vizinho',x:19.1,label:'Atender na porta',requires:0,title:'O depósito virou um convite.',pages:[
      'Dedei mudou o depósito da casa da mãe para a sala onde a loja começou.',
      'Vizinhos e comerciantes passaram a bater à porta para comprar doces. Só faltava alguém para atender.'
    ]},
    {id:'balcao',x:32,label:'Abrir o balcão',requires:1,after:['vizinho'],title:'Uma porta aberta para o bairro.',pages:[
      'Dedei chamou o cunhado Leandro para atender o pessoal enquanto ele seguia nas entregas com o caminhão.',
      'Gabriel, seu filho, também começou a ajudar. Aos poucos, o depósito se tornou uma loja.'
    ]}
  ]},
  { x:32, end:48, label:'A família faz crescer', item:'produtos', required:3, kind:'product', objective:'Leve os produtos para abastecer a loja com Gabriel.', actions:[
    {id:'prateleiras',x:48,label:'Abastecer com Gabriel',requires:3,title:'Crescer ouvindo os clientes.',pages:[
      'Os clientes pediam embalagens e produtos de confeitaria. Leandro, Gabriel e Dedei foram atrás de ampliar o mix.',
      'A parceria com a Plazel ajudou nas primeiras compras de embalagens. Doces, embalagens e queijos ganharam espaço.',
      'Antes, o nome era Doce Muriel: Murilo e Gabriel. Com a chegada do terceiro filho, veio o nome Três Irmãos.',
      'No depoimento, a família brinca: agora são quatro filhos! O nome Três Irmãos ficou e faz parte dessa trajetória.',
      'Depois de abrir a loja, Dedei continuou no caminhão por mais dois anos. A família dividia o trabalho.',
      'Na pandemia, a queda das vendas quase fechou a loja. O relato da família destaca trabalho, união e gratidão a Deus.'
    ]}
  ]},
  { x:48, end:64, label:'Olá, Itaperuçu!', item:'pedidos', required:2, kind:'order', objective:'Converse no balcão e reúna os pedidos de Itaperuçu.', actions:[
    {id:'pedido',x:52,label:'Conversar no balcão',requires:0,title:'Os clientes mostraram o caminho.',pages:[
      'Muitos clientes de Itaperuçu vinham comprar em Rio Branco do Sul. Outros recebiam os pedidos por motoboy.',
      'O pedido se repetia: uma loja mais perto. A família percebeu a demanda e começou a preparar esse novo passo.'
    ]},
    {id:'itaperucu',x:64,label:'Abrir Itaperuçu',requires:2,after:['pedido'],title:'Uma segunda loja. A mesma família.',pages:[
      'A unidade de Itaperuçu nasceu da demanda dos próprios clientes.',
      'Com a ajuda da esposa e da família, Dedei levou a 3 Irmãos para mais perto de quem já fazia parte da história.'
    ]}
  ]},
  { x:64, end:80, label:'Rio Branco, de casa nova', item:'peças', required:3, kind:'building', objective:'Reúna as peças e acenda a nova fachada.', actions:[
    {id:'rio-branco',x:80,label:'Acender a fachada',requires:3,title:'Uma nova fase em Rio Branco.',pages:[
      'Depois da abertura de Itaperuçu, chegou a reinauguração da loja de Rio Branco do Sul, em maio de 2026.',
      'Mais espaço para receber os clientes e continuar a história construída com a região.',
      'No depoimento, Dedei diz que se sente realizado trabalhando com a família. A equipe também se sente parte dela.'
    ]}
  ]},
  { x:80, end:100, label:'2027 · O próximo capítulo', item:'chaves', required:2, kind:'key', objective:'Encontre as chaves e explore as duas novas portas.', actions:[
    {id:'cerro',x:94,label:'Abrir Cerro Azul',requires:2,title:'Uma nova porta em Cerro Azul.',pages:[
      'Uma nova loja em Cerro Azul está a caminho. É mais um capítulo no crescimento da 3 Irmãos.',
      'Os detalhes da abertura serão anunciados na página Novidades. As duas portas mostram os próximos espaços.'
    ]},
    {id:'cozinha',x:100,label:'Abrir a cozinha',requires:2,title:'Espaço para aprender juntos.',pages:[
      'A 3 Irmãos também prepara uma cozinha de treinamento. Um novo espaço para compartilhar conhecimento.',
      '2027 abre o próximo capítulo. Datas, agenda e detalhes dos novos espaços serão anunciados pela 3 Irmãos.'
    ]}
  ]}
];
export const memoryNarrators={
  dedei:{name:'Andrei · Dedei',role:'Fundador da 3 Irmãos',photo:'/assets/historia/dedei-photo.webp',crop:[.14,.12,.5,.328],initials:'D'},
  gabriel:{name:'Gabriel',role:'Família 3 Irmãos',photo:'/assets/historia/gabriel-photo.webp',crop:[.22,.01,.6,.461],initials:'G'}
};
// Narrators guide the adaptation; the photos do not attribute anonymous video speech.
const encounters={
  entrega:{context:'Na parada de entregas',narrator:'dedei',marker:[14.6,1.8,.3],result:'Entrega feita. Siga até o depósito: há um vizinho esperando.'},
  vizinho:{context:'Vizinho na porta do depósito',cue:'O vizinho veio comprar doces. Vamos atendê-lo?',finish:'Atender o vizinho',narrator:'dedei',marker:[18.3,2.8,-1.2],result:'Agora busque a chave e abra o primeiro balcão.'},
  balcao:{context:'No primeiro balcão',narrator:'dedei',marker:[30,2.9,-.9],result:'O balcão abriu. Leve os produtos para Gabriel na loja.'},
  prateleiras:{context:'Com Gabriel, na loja',narrator:'gabriel',marker:[45.15,3.35,.03],result:'Prateleiras abastecidas. O próximo cliente está no balcão de pedidos.'},
  pedido:{context:'Cliente de Itaperuçu · balcão de pedidos',cue:'Este cliente veio de Itaperuçu. Ouça o pedido dele.',finish:'Anotar o pedido',narrator:'dedei',marker:[51.55,2.8,-.6],result:'Pedido anotado. Reúna os pedidos dos balcões e abra Itaperuçu.'},
  itaperucu:{context:'Na entrada de Itaperuçu',narrator:'dedei',marker:[61,2.9,-.9],result:'Itaperuçu abriu. A história segue para a nova fase de Rio Branco.'},
  'rio-branco':{context:'Na nova fachada de Rio Branco',narrator:'dedei',marker:[77,2.9,-.9]},
  cerro:{context:'Na porta de Cerro Azul',narrator:'dedei',marker:[92.6,3.8,-1.9]},
  cozinha:{context:'Na porta da cozinha',narrator:'gabriel',marker:[98.6,3.8,-1.9]}
};
missions.forEach(m=>m.actions.forEach(a=>Object.assign(a,encounters[a.id])));
export const allActions = missions.flatMap((mission,stage)=>mission.actions.map(action=>({...action,stage})));
export function actionById(id) { return allActions.find(action=>action.id===id); }
