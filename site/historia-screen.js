// Fullscreen is progressive: the same game also fills the browser's available
// viewport when native fullscreen is unavailable or denied.
export function createGameScreen({ host, returnFocus, onExit, onResize, onChange }) {
  const doc = host.ownerDocument, win = doc.defaultView, body = doc.body;
  let active = false, nativeEntered = false, scrollX = 0, scrollY = 0, placeholder;
  let savedStyles = [], inertSiblings = [];
  const nativeElement = () => doc.fullscreenElement || doc.webkitFullscreenElement;

  function fit() {
    if (!active) return;
    const view = nativeElement() === host ? null : win.visualViewport;
    host.style.setProperty('--game-screen-width', (view?.width || win.innerWidth) + 'px');
    host.style.setProperty('--game-screen-height', (view?.height || win.innerHeight) + 'px');
    host.style.setProperty('--game-screen-top', (view?.offsetTop || 0) + 'px');
    host.style.setProperty('--game-screen-left', (view?.offsetLeft || 0) + 'px');
    onResize();
  }
  function exitNative() {
    if (nativeElement() !== host) return;
    try {
      const result = (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc);
      result?.catch(() => {});
    } catch { /* The viewport fallback can still be exited. */ }
  }
  function restore() {
    if (!active) return;
    active = false; nativeEntered = false;
    host.classList.remove('is-immersive');
    body.classList.remove('game-screen-open');
    for (const [property, value, priority] of savedStyles) {
      if (value) body.style.setProperty(property, value, priority);
      else body.style.removeProperty(property);
    }
    inertSiblings.forEach(([element, previous]) => { element.inert = previous; });
    inertSiblings = []; savedStyles = [];
    placeholder?.remove(); placeholder = null;
    ['width', 'height', 'top', 'left'].forEach(key => host.style.removeProperty('--game-screen-' + key));
    const htmlStyle = doc.documentElement.style;
    const behavior = htmlStyle.getPropertyValue('scroll-behavior');
    const priority = htmlStyle.getPropertyPriority('scroll-behavior');
    htmlStyle.setProperty('scroll-behavior', 'auto', 'important');
    win.scrollTo(scrollX, scrollY);
    if (behavior) htmlStyle.setProperty('scroll-behavior', behavior, priority);
    else htmlStyle.removeProperty('scroll-behavior');
    onChange(false); onExit(); onResize();
    returnFocus?.focus({ preventScroll: true });
  }
  function exit() { exitNative(); restore(); }
  async function enter() {
    if (active) return;
    active = true; scrollX = win.scrollX; scrollY = win.scrollY;
    placeholder = doc.createElement('div');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.height = host.getBoundingClientRect().height + 'px';
    host.before(placeholder);
    savedStyles = ['position', 'top', 'left', 'width'].map(property => [property, body.style.getPropertyValue(property), body.style.getPropertyPriority(property)]);
    body.style.setProperty('position', 'fixed'); body.style.setProperty('top', -scrollY + 'px');
    body.style.setProperty('left', -scrollX + 'px'); body.style.setProperty('width', '100%');
    // Keep keyboard and assistive-technology focus inside the game in fallback mode.
    for (let current = host; current && current !== body; current = current.parentElement) {
      for (const sibling of current.parentElement?.children || []) {
        if (sibling !== current) { inertSiblings.push([sibling, sibling.inert]); sibling.inert = true; }
      }
    }
    body.classList.add('game-screen-open'); host.classList.add('is-immersive');
    onChange(true); fit();
    // Call before awaiting anything: browsers require the Play/Fullscreen tap.
    try {
      const request = host.requestFullscreen || host.webkitRequestFullscreen;
      if (request) await request.call(host, { navigationUI: 'hide' });
      if (!active) exitNative();
    } catch { /* Remain in the usable viewport-filling mode. */ }
    if (active) fit();
  }
  function fullscreenChanged() {
    if (nativeElement() === host) { nativeEntered = true; if (!active) exitNative(); else fit(); }
    else if (nativeEntered) restore();
  }
  function escape(event) {
    if (active && event.key === 'Escape' && !nativeElement() && !host.querySelector('dialog[open]')) {
      event.preventDefault(); event.stopPropagation(); exit();
    }
  }
  doc.addEventListener('fullscreenchange', fullscreenChanged);
  doc.addEventListener('webkitfullscreenchange', fullscreenChanged);
  doc.addEventListener('keydown', escape, true);
  win.addEventListener('resize', fit);
  win.visualViewport?.addEventListener('resize', fit);
  win.visualViewport?.addEventListener('scroll', fit);
  return {
    enter, exit, get active() { return active; },
    destroy() {
      exit();
      doc.removeEventListener('fullscreenchange', fullscreenChanged);
      doc.removeEventListener('webkitfullscreenchange', fullscreenChanged);
      doc.removeEventListener('keydown', escape, true);
      win.removeEventListener('resize', fit);
      win.visualViewport?.removeEventListener('resize', fit);
      win.visualViewport?.removeEventListener('scroll', fit);
    }
  };
}
