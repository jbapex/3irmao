'use strict';
(() => {
  const root = document.querySelector('[data-doors-experience]');
  if (!root) return;
  const lobby = root.querySelector('[data-doors-lobby]');
  const rooms = [...root.querySelectorAll('[data-door-room]')];
  const doors = [...lobby.querySelectorAll('[data-enter]')];
  const status = root.querySelector('[data-doors-status]');
  const motionButton = root.querySelector('[data-door-motion]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const names = { 'cerro-azul': 'Nova loja em Cerro Azul', cozinha: 'Cozinha de treinamento' };
  let current = '', lastDoor = doors[0], journey = null, sequence = 0, roomAnimation = null;

  function moving() {
    return !reduce.matches && !document.documentElement.classList.contains('motion-paused');
  }
  function route() {
    const hash = location.hash.slice(1);
    return Object.hasOwn(names, hash) ? hash : '';
  }
  function writeRoute(id) {
    const hash = '#' + (id || 'novos-capitulos');
    if (location.hash !== hash) history.pushState(null, '', hash);
  }
  function scrollToExperience() {
    const header = document.querySelector('.site-header');
    const top = root.getBoundingClientRect().top + scrollY - (header?.offsetHeight || 84);
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }
  function stopJourney() {
    sequence++;
    if (journey) {
      journey.animations.forEach(animation => animation.cancel());
      journey.overlay.remove();
      journey = null;
    }
    root.classList.remove('is-entering');
    root.removeAttribute('aria-busy');
    lobby.inert = false;
  }
  function show(id, focus = true, scroll = true) {
    roomAnimation?.cancel();
    roomAnimation = null;
    current = id;
    root.dataset.view = id || 'portas';
    lobby.hidden = !!id;
    rooms.forEach(room => { room.hidden = room.dataset.doorRoom !== id; });
    if (scroll) scrollToExperience();
    if (focus) {
      const target = id ? rooms.find(room => room.dataset.doorRoom === id).querySelector('h2') : lastDoor;
      target.focus({ preventScroll: true });
      status.textContent = id ? names[id] : 'Escolha uma porta para explorar as novidades.';
    }
  }
  function animateRoom(id) {
    if (!moving() || !Element.prototype.animate) return;
    const room = rooms.find(item => item.dataset.doorRoom === id);
    roomAnimation = room.querySelector('.room-copy').animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
  async function enter(id, fromDoor) {
    if (!Object.hasOwn(names, id) || journey || id === current) return;
    if (fromDoor) lastDoor = fromDoor;
    writeRoute(id);
    if (!fromDoor || !moving() || !Element.prototype.animate) {
      show(id);
      animateRoom(id);
      return;
    }
    const portal = fromDoor.querySelector('.entry-portal');
    const box = portal.getBoundingClientRect();
    const initialLeaf = getComputedStyle(portal.querySelector('.entry-leaf')).transform;
    const initialPreview = getComputedStyle(portal.querySelector('.entry-preview'));
    const previewFilter = initialPreview.filter;
    const previewTransform = initialPreview.transform;
    const shadeOpacity = getComputedStyle(portal.querySelector('.entry-preview-shade')).opacity;
    if (!box.width || !box.height) { show(id); return; }
    const overlay = document.createElement('div');
    overlay.className = 'door-transit';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.setProperty('--arrival-color', id === 'cozinha' ? '#ffd23f' : '#1747c8');
    const wash = document.createElement('div');
    wash.className = 'door-transit-wash';
    const object = document.createElement('div');
    object.className = fromDoor.className + ' door-transit-object';
    Object.assign(object.style, {
      left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px'
    });
    object.append(portal.cloneNode(true));
    overlay.append(wash, object);
    document.body.append(overlay);
    root.classList.add('is-entering');
    root.setAttribute('aria-busy', 'true');
    lobby.inert = true;
    status.textContent = 'Entrando: ' + names[id];
    const leaf = object.querySelector('.entry-leaf');
    const preview = object.querySelector('.entry-preview');
    const shade = object.querySelector('.entry-preview-shade');
    const scale = Math.max(innerWidth / box.width, innerHeight / box.height) * 1.65;
    const dx = innerWidth / 2 - (box.left + box.width / 2);
    const dy = innerHeight / 2 - (box.top + box.height / 2);
    const animations = [];
    journey = { overlay, animations };
    const ticket = ++sequence;
    try {
      animations.push(
        // Reveal a glimpse before moving the visitor through the opening.
        leaf.animate([
          { transform: initialLeaf, offset: 0 },
          { transform: 'rotateY(-43deg)', offset: .42 },
          { transform: 'rotateY(-52deg)', offset: .62 },
          { transform: 'rotateY(-108deg)', offset: 1 }
        ], { duration: 1180, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'forwards' }),
        preview.animate([
          { filter: previewFilter, transform: previewTransform },
          { filter: 'brightness(1) saturate(1)', transform: 'scale(1)' }
        ], { duration: 1050, easing: 'ease-out', fill: 'forwards' }),
        shade.animate([{ opacity: shadeOpacity }, { opacity: .12 }],
          { duration: 1150, easing: 'ease-in-out', fill: 'forwards' }),
        object.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx}px,${dy}px) scale(${scale})` }],
          { delay: 650, duration: 1050, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' }),
        wash.animate([{ opacity: 0 }, { opacity: 1 }], { delay: 650, duration: 900, fill: 'forwards' })
      );
      await Promise.all(animations.map(animation => animation.finished));
      if (ticket !== sequence) return;
      lobby.inert = false;
      show(id);
      animateRoom(id);
      const fade = overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'forwards' });
      animations.push(fade);
      await fade.finished;
    } catch {
      // Cancellations are resolved by navigation; unsupported effects skip to the content.
      if (ticket === sequence) show(id);
    } finally {
      if (ticket === sequence) stopJourney();
    }
  }
  root.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const back = event.target.closest('[data-back-doors]');
    const entry = event.target.closest('[data-enter]');
    if (back) {
      event.preventDefault(); stopJourney(); writeRoute(''); show('');
    } else if (entry) {
      event.preventDefault();
      enter(entry.dataset.enter, lobby.contains(entry) ? entry : null);
    }
  });
  function restoreFromURL() {
    stopJourney();
    show(route());
  }
  window.addEventListener('popstate', restoreFromURL);
  window.addEventListener('hashchange', () => { if (route() !== current || journey) restoreFromURL(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]') || (!current && !journey)) return;
    event.preventDefault(); stopJourney(); writeRoute(''); show('');
  });
  function syncMotion() {
    const paused = !moving();
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Animações pausadas' : 'Pausar animações';
    motionButton.disabled = reduce.matches;
    if (paused) {
      roomAnimation?.cancel();
      if (journey) { stopJourney(); show(route()); }
    }
  }
  motionButton.addEventListener('click', () => {
    // Reuse the existing site-wide preference and its persistence.
    document.querySelector('[data-motion-toggle]')?.click();
  });
  new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  reduce.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      roomAnimation?.cancel();
      if (journey) { stopJourney(); show(route(), false, false); }
    }
  });
  window.addEventListener('resize', () => {
    if (journey) { stopJourney(); show(route()); }
  });
  root.classList.add('has-doors');
  motionButton.hidden = false;
  syncMotion();
  show(route(), false, !!route());
})();
