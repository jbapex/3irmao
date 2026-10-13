import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const context = {module:{exports:{}}};
new Function('module',readFileSync(new URL('../site/model.js',import.meta.url),'utf8'))(context.module);
const core = context.module.exports;
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const catalog = JSON.parse(read('../content/catalog.json'));
const products = JSON.parse(read('../content/products.json'));
const combined = catalog.map(category => ({...category, products: products.filter(product => product.category === category.id)}));
const index = core.indexCatalog(combined);
assert.equal(Object.keys(index).length, 73);
assert.equal(products.length, 21);
assert.equal(new Set(products.map(p => p.id)).size, 21);
for (const category of catalog) {
  category.items.forEach((name, i) => assert.equal(index[category.id+'-'+i].name, name, 'Saved group IDs must retain their meaning'));
}
const match = (category, query) => Object.values(index).filter(item => core.matching(item, category, query));
assert.equal(match('todos', 'frutas amarelas')[0].id, 'produto-dicaramella-frutas-amarelas');
assert.equal(match('todos', 'alcremo').filter(p => p.kind === 'product').length, 3);
assert.equal(match('doces', 'peelirz').find(p => p.kind === 'product').id, 'produto-amos-peelirz');
assert.equal(match('frios', 'peelirz').length, 0);
assert.equal(match('todos', 'pêssego').find(p => p.kind === 'product').id, 'produto-amos-peelirz');
assert.equal(match('todos', 'produto que nao existe 987').length, 0);
const restored = core.restoreList(JSON.stringify([
  {id:'confeitaria-0', quantity:'2 caixas'},
  {id:'produto-alcremo-culinario', quantity:'3 bisnagas'},
  {id:'confeitaria-0', quantity:'duplicado'},
  {id:'inexistente', quantity:'1'}
]), index);
assert.deepEqual(restored.map(p => p.id), ['confeitaria-0', 'produto-alcremo-culinario']);
assert.match(core.listText(restored, index), /Mistura culinária Alcremo — 3 bisnagas/);
assert.match(core.listText(restored, index), /2 caixas/);
const html = read('../site/produtos/index.html');
const cards = [...html.matchAll(/data-product="([^"]+)"/g)].map(m => m[1]);
const buttons = [...html.matchAll(/data-add="([^"]+)"/g)].map(m => m[1]);
assert.equal(cards.length, 73);
assert.equal(new Set(cards).size, 73);
assert.deepEqual(buttons, cards);
assert.ok(cards.every(id => index[id]));
assert.ok(html.indexOf('data-catalog-products') < html.indexOf('data-catalog-groups'));
console.log('Catalog regression checks passed: named products, legacy lists, brand/flavor search, category isolation and generated controls.');
