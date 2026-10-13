// Adapted dialogues from the family video published in August 2024.
// Later updates supplied by the family carry their own date labels.
export const missions = [
  {x:0,end:16,label:'A rota do Dedei',item:'doces',required:3,kind:'candy',objective:'Pegue os doces e conheça a rota de pai e filho.',actions:[
    {id:'entrega',x:16,label:'Entregar os doces',requires:3,title:'Antes da loja, a estrada.',narrator:'dedei',voices:['dedei','dedei','gabriel','gabriel'],pages:[
      'Antes de abrir a distribuidora, passei seis anos vendendo doces na rua com o caminhão.',
      'Nos primeiros três meses com o Sr. João Bela Vista, trabalhei em troca do almoço. Foi assim que essa caminhada começou.',
      'Meu pai saía cedo e chegava tarde, mas sempre foi presente. Mesmo trabalhando de segunda a segunda, estava ali para me ajudar.',
      'Por volta dos 12 anos, eu estudava de manhã e ajudava nas entregas à tarde. A rota dos doces também virou parte da minha história.'
    ]}
  ]},
  {x:16,end:32,label:'Tem alguém aí?',item:'chave',required:1,kind:'key',objective:'Atenda o vizinho e leve a chave ao primeiro balcão.',actions:[
    {id:'vizinho',x:19.1,label:'Atender na porta',requires:0,title:'Tem doce para vender?',narrator:'dedei',pages:[
      'Mudei o depósito da casa da minha mãe para esta sala. Logo os vizinhos e comerciantes começaram a bater à porta para comprar doces.',
      'Só que eu seguia na rua com o caminhão. O pessoal chegava e não tinha ninguém para atender. Precisávamos abrir esse balcão.'
    ]},
    {id:'balcao',x:32,label:'Abrir com Leandro',requires:1,after:['vizinho'],title:'Leandro chega ao balcão.',narrator:'leandro',sourceLabel:'História contada por Dedei · ago. 2024',pages:[
      'Leandro, cunhado de Dedei, estava desempregado quando recebeu o convite para atender no depósito. Dedei continuava com as entregas.',
      'Gabriel também passou a ajudar. Com alguém no balcão e os clientes chegando, aquele depósito começou a virar loja.'
    ]}
  ]},
  {x:32,end:48,label:'A família faz crescer',item:'produtos',required:3,kind:'product',objective:'Ouça Fernanda e leve os produtos para Gabriel.',actions:[
    {id:'fernanda',x:36,label:'Conversar com Fernanda',requires:0,title:'A força de estar junto.',narrator:'fernanda',pages:[
      'No começo, tive receio. O Dedei era muito tímido. Mas vi a vontade e a força dele, e meu papel foi incentivar.',
      'Tivemos momentos bons e momentos difíceis. Na pandemia, chegamos a pensar em fechar. Nossa união ajudou a gente a se reerguer.',
      'Meu sentimento é gratidão a Deus, aos meus filhos e aos funcionários. Cada um faz parte dessa história.'
    ]},
    {id:'prateleiras',x:48,label:'Abastecer com Gabriel',requires:3,after:['fernanda'],title:'O cliente pedia. A gente ia atrás.',narrator:'gabriel',pages:[
      'Os clientes começaram a pedir embalagens, produtos de confeitaria e outras mercadorias. Meu pai, Leandro e eu fomos atrás do que eles precisavam.',
      'A parceria com a Plazel ajudou nas primeiras compras de embalagens. Doces, embalagens e queijos foram ganhando espaço.',
      'Depois de abrir a loja, meu pai ainda ficou mais dois anos no caminhão. A família dividia o trabalho para fazer tudo acontecer.'
    ]}
  ]},
  {x:48,end:64,label:'Olá, Itaperuçu!',item:'pedidos',required:2,kind:'order',objective:'Reúna os pedidos e encontre Camila em Itaperuçu.',actions:[
    {id:'pedido',x:52,label:'Conversar no balcão',requires:0,title:'Uma loja mais perto.',narrator:'gabriel',pages:[
      'Muitos clientes de Itaperuçu vinham comprar em Rio Branco do Sul. Também fazíamos bastante entrega por motoboy.',
      'O pessoal pedia uma loja lá. Conversei com a Camila, minha esposa, para ela me ajudar nessa nova etapa.'
    ]},
    {id:'itaperucu',x:64,label:'Abrir com Camila',requires:2,after:['pedido'],title:'Camila faz parte dessa história.',narrator:'camila',sourceLabels:['Adaptação do relato · ago. 2024','A loja hoje · Itaperuçu','A loja hoje · Itaperuçu'],pages:[
      'Quando entrei na distribuidora, logo me senti parte da família. No vídeo de 2024, contei o orgulho de fazer parte dessa loja.',
      'Hoje, Camila participa das novidades da loja e está mais presente em Itaperuçu, dando continuidade a essa história com Gabriel e a família.',
      'Os pedidos dos clientes abriram caminho para esta unidade. Agora, as novidades também passam por aqui. A próxima parada é com Murilo!'
    ]}
  ]},
  {x:64,end:80,label:'Rio Branco, de casa nova',item:'peças',required:3,kind:'building',objective:'Descubra o nome com Murilo e acenda a nova fachada.',actions:[
    {id:'murilo',x:70,label:'Encontrar Murilo',requires:0,title:'Por que Três Irmãos?',narrator:'murilo',voices:['murilo','dedei','gabriel'],pages:[
      'Eu sou o Murilo, o segundo irmão. Estou dando continuidade a essa história. Se você ainda não conhece a distribuidora, venha conhecer!',
      'Antes de Três Irmãos, era Doce Muriel: Murilo e Gabriel. Quando chegou o Davi, nosso terceiro filho, veio o novo nome.',
      'No vídeo de agosto de 2024, a gente já contava com o Henriquinho, o quarto irmão. A família cresceu, e a marca continuou Três Irmãos.'
    ]},
    {id:'rio-branco',x:80,label:'Acender a fachada',requires:3,after:['murilo'],title:'Uma nova fase em Rio Branco.',narrator:'dedei',sourceLabel:'A história continua · maio de 2026',pages:[
      'A reinauguração de Rio Branco do Sul, em maio de 2026, marcou uma nova etapa depois da abertura de Itaperuçu.',
      'Mais espaço para receber os clientes e continuar uma história que começou com um caminhão, um balcão e a participação de toda a família.'
    ]}
  ]},
  {x:80,end:100,label:'2027 · O próximo capítulo',item:'chaves',required:2,kind:'key',objective:'Explore as novas portas e receba o convite do Davi.',actions:[
    {id:'cerro',x:94,label:'Abrir Cerro Azul',requires:2,title:'Uma nova porta em Cerro Azul.',narrator:'dedei',sourceLabel:'Próximos capítulos · 2027',pages:[
      'Uma nova loja em Cerro Azul está a caminho. É mais um capítulo no crescimento da 3 Irmãos.',
      'Os detalhes da abertura serão anunciados na página Novidades. As duas portas mostram os próximos espaços.'
    ]},
    {id:'cozinha',x:100,label:'Abrir a cozinha e falar com Davi',requires:2,title:'A história continua com você.',narrator:'gabriel',voices:['gabriel','gabriel','davi'],sourceLabels:['Próximos capítulos · 2027','Próximos capítulos · 2027','O convite de Davi · ago. 2024'],pages:[
      'A 3 Irmãos também prepara uma cozinha de treinamento. Um novo espaço para compartilhar conhecimento.',
      'Datas, agenda e detalhes dos novos espaços serão anunciados pela loja. E quem deixa o convite para você é o Davi, o terceiro irmão.',
      'Eu sou o terceiro irmão. Venha para a Distribuidora!'
    ]}
  ]}
];
export const memoryNarrators={
  dedei:{name:'Dedei',role:'Fundador da 3 Irmãos',photo:'/assets/historia/dedei-photo.webp',crop:[.14,.12,.5,.328],initials:'D'},
  gabriel:{name:'Gabriel',role:'Filho de Dedei · marido de Camila',photo:'/assets/historia/gabriel-photo.webp',crop:[.22,.01,.6,.461],initials:'G'},
  leandro:{name:'Leandro',role:'Cunhado de Dedei · primeiro balcão',initials:'L'},
  fernanda:{name:'Fernanda',role:'Esposa de Dedei · incentivo e união',initials:'F'},
  camila:{name:'Camila',role:'Novidades da loja · Itaperuçu',photo:'/assets/historia/camila-photo.png',crop:[.23,.03,.55,.426],initials:'C'},
  murilo:{name:'Murilo',role:'O segundo irmão',initials:'M'},
  davi:{name:'Davi',role:'O terceiro irmão',initials:'D'}
};
const encounters={
  entrega:{context:'Na parada de entregas · Dedei e Gabriel',marker:[14.6,1.8,.3],result:'Entrega feita. Siga até o depósito: há um vizinho esperando.'},
  vizinho:{context:'Vizinho na porta do depósito',cue:'O vizinho veio comprar doces. Vamos atendê-lo?',finish:'Atender o vizinho',marker:[18.3,2.8,-1.2],result:'Agora busque a chave e abra o primeiro balcão com Leandro.'},
  balcao:{context:'Com Leandro, no primeiro balcão',marker:[32,3.1,1],result:'O balcão abriu. Fernanda está logo à frente para conversar.'},
  fernanda:{context:'Uma conversa com Fernanda',marker:[36,3.1,1],result:'União para seguir. Reúna os produtos e encontre Gabriel.'},
  prateleiras:{context:'Com Gabriel, na loja',marker:[45.15,3.35,.03],result:'Prateleiras abastecidas. Vamos ouvir o pedido de Itaperuçu.'},
  pedido:{context:'Cliente de Itaperuçu · balcão de pedidos',cue:'Este cliente veio de Itaperuçu. Ouça o pedido dele.',finish:'Anotar o pedido',marker:[51.55,2.8,-.6],result:'Pedido anotado. Reúna os pedidos e leve até Camila.'},
  itaperucu:{context:'Com Camila, em Itaperuçu',marker:[64.2,3.1,1],result:'Itaperuçu abriu. Murilo espera você na próxima parada.'},
  murilo:{context:'Com Murilo · a família e o nome da loja',marker:[70,3.1,1],result:'Agora você conhece o nome. Reúna as peças e acenda a fachada.'},
  'rio-branco':{context:'Na nova fachada de Rio Branco',marker:[77,2.9,-.9]},
  cerro:{context:'Na porta de Cerro Azul',marker:[92.6,3.8,-1.9]},
  cozinha:{context:'Na cozinha · um convite de Davi',marker:[98.6,3.8,-1.9]}
};
missions.forEach(m=>m.actions.forEach(a=>Object.assign(a,encounters[a.id])));
export const allActions=missions.flatMap((mission,stage)=>mission.actions.map(action=>({...action,stage})));
export function actionById(id){return allActions.find(action=>action.id===id);}
export function memoryPage(action,index=0){
  const narrator=action.voices?.[index]||action.narrator;
  return{text:action.pages[index],narrator,person:memoryNarrators[narrator],sourceLabel:action.sourceLabels?.[index]||action.sourceLabel||'Adaptação do relato · ago. 2024'};
}
