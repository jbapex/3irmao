import assert from 'node:assert/strict';
import { createGameScreen } from '../site/historia-screen.js';

// Small DOM stand-ins exercise lifecycle behavior without WebGL or a browser.
class Style {
  values = new Map(); priorities = new Map();
  setProperty(k, v, p = '') { this.values.set(k, v); this.priorities.set(k, p); }
  getPropertyValue(k) { return this.values.get(k) || ''; }
  getPropertyPriority(k) { return this.priorities.get(k) || ''; }
  removeProperty(k) { this.values.delete(k); this.priorities.delete(k); }
}
class Element {
  style = new Style(); children = []; inert = false; classList = new Set();
  constructor(doc, parent) { this.ownerDocument = doc; this.parentElement = parent; parent?.children.push(this); this.classList.remove = this.classList.delete; }
  setAttribute() {}
  before(element) { element.parentElement = this.parentElement; this.parentElement.children.unshift(element); }
  remove() { this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
  getBoundingClientRect() { return { height: 480 }; }
  querySelector() { return this.dialogOpen ? {} : null; }
  focus(options) { this.focused = options; }
}
function setup(native = 'missing') {
  const doc = new EventTarget(), win = new EventTarget();
  win.innerWidth = 390; win.innerHeight = 844; win.scrollX = 0; win.scrollY = 280;
  win.scrollTo = (x, y) => { win.scrollX = x; win.scrollY = y; };
  win.visualViewport = Object.assign(new EventTarget(), { width: 390, height: 744, offsetTop: 0, offsetLeft: 0 });
  doc.defaultView = win; doc.documentElement = new Element(doc); doc.body = new Element(doc);
  doc.createElement = () => new Element(doc);
  const header = new Element(doc, doc.body), main = new Element(doc, doc.body);
  const host = new Element(doc, main), story = new Element(doc, main), play = new Element(doc, host);
  story.inert = true; // Existing inert state must survive the round trip.
  doc.body.style.setProperty('width', '99%', 'important');
  let exits = 0, resizes = 0, resolveRequest;
  const change = () => doc.dispatchEvent(new Event('fullscreenchange'));
  doc.exitFullscreen = async () => { doc.fullscreenElement = null; change(); };
  if (native === 'success') host.requestFullscreen = async () => { doc.fullscreenElement = host; change(); };
  if (native === 'rejected') host.requestFullscreen = async () => { throw new Error('Denied'); };
  if (native === 'pending') host.requestFullscreen = () => new Promise(resolve => { resolveRequest = () => { doc.fullscreenElement = host; change(); resolve(); }; });
  const screen = createGameScreen({ host, returnFocus: play, onExit: () => exits++, onResize: () => resizes++, onChange() {} });
  return { doc, win, header, main, host, story, play, screen, change, get exits() { return exits; }, get resizes() { return resizes; }, resolveRequest: () => resolveRequest() };
}

for (const support of ['missing', 'rejected', 'success']) {
  const t = setup(support);
  await t.screen.enter();
  assert.equal(t.screen.active, true, `${support}: entering must work even without native fullscreen`);
  assert.ok(t.host.classList.has('is-immersive'));
  assert.equal(t.header.inert, true); assert.equal(t.host.inert, false);
  assert.equal(t.doc.body.style.getPropertyValue('top'), '-280px');
  if (support !== 'success') {
    t.win.visualViewport.height = 800;
    t.win.visualViewport.dispatchEvent(new Event('resize'));
    assert.equal(t.host.style.getPropertyValue('--game-screen-height'), '800px', 'Browser toolbar changes must update the available height');
  }
  if (support === 'success') { t.doc.fullscreenElement = null; t.change(); }
  else t.screen.exit();
  assert.equal(t.screen.active, false); assert.equal(t.exits, 1);
  assert.equal(t.header.inert, false); assert.equal(t.story.inert, true);
  assert.equal(t.doc.body.style.getPropertyValue('position'), '');
  assert.equal(t.doc.body.style.getPropertyValue('width'), '99%');
  assert.equal(t.doc.body.style.getPropertyPriority('width'), 'important');
  assert.equal(t.win.scrollY, 280); assert.deepEqual(t.play.focused, { preventScroll: true });
  assert.equal(t.main.children.length, 2, 'No duplicate stage or leftover placeholder');
  await t.screen.enter(); t.screen.exit();
  assert.equal(t.exits, 2, 'The same game can be reopened and closed');
  const count = t.resizes; t.screen.destroy(); t.win.dispatchEvent(new Event('resize'));
  assert.equal(t.resizes, count, 'Destroy must remove resize listeners');
}

const late = setup('pending');
const pending = late.screen.enter(); late.screen.exit(); late.resolveRequest(); await pending;
assert.equal(late.screen.active, false); assert.equal(late.doc.fullscreenElement, null);
assert.equal(late.exits, 1, 'An outstanding native request cannot trap the visitor after Exit');
late.screen.destroy();

const escape = setup(); await escape.screen.enter();
const escapeKey = () => { const event = new Event('keydown', { cancelable: true }); event.key = 'Escape'; escape.doc.dispatchEvent(event); };
escape.host.dialogOpen = true; escapeKey();
assert.equal(escape.screen.active, true, 'A dialog gets its own Escape action');
escape.host.dialogOpen = false; escapeKey();
assert.equal(escape.screen.active, false, 'Escape exits the fallback game screen');
escape.screen.destroy();
console.log('Fullscreen lifecycle passed: native, unsupported, denied, browser exit, reopen, pending request, viewport resize, scroll/focus/inert restoration, dialog Escape and cleanup.');
