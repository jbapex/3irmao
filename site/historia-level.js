import { allActions } from './historia-missions.js';

// Coordinates describe the same walking plane used by the renderer and physics.
// y is always the TOP of a platform, rather than its centre.
export const level = {
  end: 102,
  environments: [
    {id:'estrada',name:'A rota dos doces',hint:'Salte as caixas e atravesse a estrada até a primeira entrega.'},
    {id:'deposito',name:'O primeiro depósito',hint:'Explore as prateleiras. A chave está no alto do depósito.'},
    {id:'loja',name:'A loja ganha espaço',hint:'Passe pelas vitrines e toldos para reunir os novos produtos.'},
    {id:'canal',name:'Caminho de Itaperuçu',hint:'Use a alavanca para baixar a ponte sobre o canal.'},
    {id:'obra',name:'Uma nova fachada',hint:'Ligue o elevador e explore os andaimes da obra.'},
    {id:'jardim',name:'As próximas portas',hint:'Atravesse o jardim e encontre as chaves dos próximos capítulos.'}
  ],
  gaps: [[10.7,13.1],[40.8,42.1],[56,61],[72.15,75.6],[86.6,88],[91,92.7]],
  blocks: [
    {x:4.8,width:1.65,height:.85},{x:8.35,width:2.05,height:1.45},
    {x:21.2,width:1.6,height:.7},{x:24,width:1.75,height:1.15},
    {x:38.2,width:1.55,height:.7},
    {x:66.8,width:1.5,height:.8},
    {x:84.9,width:1.35,height:.65}
  ],
  platforms: [
    {id:'carga',stage:0,x:9.4,y:2.35,width:1.35,height:.22,kind:'wood'},
    {id:'prateleira-baixa',stage:1,x:25.4,y:1.75,width:2.5,height:.28,kind:'shelf'},
    {id:'prateleira-alta',stage:1,x:28.5,y:2.55,width:2.8,height:.28,kind:'shelf'},
    {id:'toldo-esquerdo',stage:2,x:40.2,y:1.45,width:2.9,height:.25,kind:'awning'},
    {id:'toldo-direito',stage:2,x:44.1,y:2.35,width:3.1,height:.25,kind:'awning'},
    {id:'mirante-canal',stage:3,x:54.7,y:1.65,width:1.6,height:.25,kind:'wood'},
    {id:'ponte-canal',stage:3,x:58.5,y:0,width:5.3,height:.24,kind:'bridge',switchId:'ponte-itaperucu'},
    {id:'elevador',stage:4,x:73.3,y:.35,width:2.1,height:.28,kind:'lift',switchId:'elevador-rio',motion:{axis:'y',distance:2,period:4.8}},
    {id:'andaime',stage:4,x:76,y:2.4,width:2.2,height:.25,kind:'scaffold'},
    {id:'jardim-passo-1',stage:5,x:87.3,y:.4,width:1.25,height:.22,kind:'wood'},
    {id:'jardim-mirante',stage:5,x:89.2,y:1.75,width:1.6,height:.24,kind:'wood'},
    {id:'jardim-passo-2',stage:5,x:91.8,y:.75,width:1.7,height:.24,kind:'wood'}
  ],
  mechanisms: [
    {id:'ponte-itaperucu',stage:3,x:54,label:'Baixar a ponte',context:'Abra a passagem sobre o canal.',kind:'bridge'},
    {id:'elevador-rio',stage:4,x:71.5,label:'Ligar o elevador',context:'Suba até os andaimes da nova fachada.',kind:'lift'}
  ],
  checkpoints: [
    {id:'rota-segura',stage:0,x:14,y:0},
    {id:'deposito-seguro',stage:1,x:30.3,y:0},
    {id:'loja-segura',stage:2,x:46.4,y:0},
    {id:'canal-seguro',stage:3,x:62,y:0},
    {id:'obra-segura',stage:4,x:78.2,y:0},
    {id:'jardim-seguro',stage:5,x:93.3,y:0}
  ],
  candies: [
    {id:0,stage:0,x:3.15,y:1.35,kind:'candy',name:'Doces'},
    {id:1,stage:0,x:8.35,y:3.3,kind:'candy',name:'Doces'},
    {id:2,stage:0,x:11.85,y:3.8,kind:'candy',name:'Doces'},
    {id:3,stage:1,x:28.5,y:3.7,kind:'key',name:'Chave'},
    {id:6,stage:2,x:35.15,y:1.35,kind:'product',name:'Doces'},
    {id:7,stage:2,x:40.2,y:3.1,kind:'product',name:'Embalagens'},
    {id:8,stage:2,x:44.15,y:3.8,kind:'product',name:'Confeitaria'},
    {id:9,stage:3,x:51.15,y:1.3,kind:'order',name:'Pedidos'},
    {id:10,stage:3,x:62,y:1.3,kind:'order',name:'Pedidos'},
    {id:12,stage:4,x:67,y:1.35,kind:'building',name:'Peças'},
    {id:13,stage:4,x:73.3,y:3.15,kind:'building',name:'Peças'},
    {id:14,stage:4,x:76.1,y:3.9,kind:'building',name:'Peças'},
    {id:15,stage:5,x:83.15,y:1.35,kind:'key',name:'Chaves'},
    {id:16,stage:5,x:89.2,y:3.1,kind:'key',name:'Chaves'}
  ],
  bonuses: [
    {id:'lembranca-estrada',stage:0,x:9.4,y:5.1},
    {id:'lembranca-deposito',stage:1,x:28.5,y:5.25},
    {id:'lembranca-loja',stage:2,x:44.1,y:5.15},
    {id:'lembranca-canal',stage:3,x:54.7,y:4.45},
    {id:'lembranca-obra',stage:4,x:76,y:5.2},
    {id:'lembranca-jardim',stage:5,x:89.2,y:4.55}
  ],
  actions: allActions
};

export function platformAt(platform, game) {
  const active = !platform.switchId || game.activated.has(platform.switchId);
  const point = {x:platform.x,y:platform.y,active};
  if (active && platform.motion) {
    const started = game.activatedAt?.[platform.switchId] || 0;
    const phase = Math.max(0, game.time - started) / platform.motion.period * Math.PI * 2;
    point[platform.motion.axis] += platform.motion.distance * (1 - Math.cos(phase)) / 2;
  }
  return point;
}
