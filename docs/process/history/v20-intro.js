(() => {
  'use strict';
  const flow = window.PortfolioIntroFlow;
  if (!flow) return; // Failed enhancements must never hide the page.
  const ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let serial = 0;
  const svgNode = (name, attrs = {}) => {
    const el = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    return el;
  };

  function mount(host, {contained = false, showResult = false} = {}) {
    const layer = document.createElement('div');
    layer.className = 'intro-layer' + (contained ? ' intro-contained' : '');
    layer.setAttribute('aria-hidden', 'true');
    const width = contained ? host.clientWidth : innerWidth;
    const height = contained ? host.clientHeight : innerHeight;
    const scene = flow.createScene(width, height);
    const id = 'intro-silk-' + (++serial);
    if (showResult) {
      const result = document.createElement('div');
      result.className = 'intro-result';
      result.innerHTML = '<div class="intro-latin">GRIMPOTEUTHIS<br>UMBELLATA</div><img src="assets/authored/hero-painted-v11.webp" alt=""><div class="wordmark"><img src="assets/wordmark-hero-v14.svg" alt=""></div>';
      layer.append(result);
    }
    const paper = document.createElement('div'); paper.className = 'intro-paper';
    const quote = document.createElement('div'); quote.className = 'intro-quote';
    quote.innerHTML = '<div><span class="quote-line">世界是<span class="azkaban">阿兹卡班</span>，</span><span class="quote-line">故事是<span class="parole">假释</span></span></div>';
    const water = svgNode('svg', {class: 'intro-water', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none'});
    const paths = Array.from({length: scene.count}, () => {
      const p = svgNode('path', {fill: flow.pink}); water.append(p); return p;
    });
    const droplets = Array.from({length: 2}, () => {
      const e = svgNode('ellipse', {fill: flow.pink}); water.append(e); return e;
    });
    const pass = svgNode('svg', {class: 'intro-pass', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none'});
    const defs = svgNode('defs');
    const gradient = svgNode('linearGradient', {id, x1: '0', y1: '0', x2: '1', y2: '.8'});
    for (const [offset, color] of [['0', '#fffdf5'], ['.52', '#fffaf2'], ['1', '#eee4ef']]) gradient.append(svgNode('stop', {offset, 'stop-color': color}));
    const clip = svgNode('clipPath', {id: id + '-clip'});
    clip.append(svgNode('path', {d: scene.clothPath}));
    defs.append(gradient, clip);
    const cloth = svgNode('g');
    cloth.append(svgNode('path', {d: scene.clothPath, fill: `url(#${id})`}));
    const folds = svgNode('g', {'clip-path': `url(#${id}-clip)`});
    scene.folds.forEach((d, i) => folds.append(svgNode('path', {d, fill: i % 2 ? '#fffefa' : '#c6b5ce', opacity: i % 2 ? '.55' : '.14'})));
    cloth.append(folds);
    pass.append(defs, cloth);
    layer.append(paper, quote, water, pass);
    // Clouds share the descending fabric's motion, with no timed pop-in.
    const clouds = [1, 2, 3].map(i => {
      const img = document.createElement('img');
      img.className = 'intro-flight-cloud flight-' + i;
      img.src = 'assets/cloud-puff-' + i + '.svg'; img.alt = '';
      layer.append(img); return img;
    });
    host.append(layer);
    function render(t) {
      const s = scene.state(t);
      layer.dataset.phase = s.phase;
      layer.dataset.time = t.toFixed(3);
      quote.style.opacity = String(s.quoteOpacity);
      paper.hidden = s.covered;
      water.style.display = s.covered ? 'none' : '';
      if (!s.covered) {
        paths.forEach((p, i) => p.setAttribute('d', scene.stream(i, t)));
        scene.drops(t).forEach((drop, i) => {
          const el = droplets[i];
          for (const [attr, key] of [['cx', 'x'], ['cy', 'y'], ['rx', 'rx'], ['ry', 'ry']]) el.setAttribute(attr, drop[key]);
          el.style.display = drop.visible ? '' : 'none';
        });
      }
      pass.style.display = s.clothVisible ? '' : 'none';
      cloth.setAttribute('transform', `translate(0 ${s.clothY})`);
      clouds.forEach((img, i) => {
        img.style.opacity = s.clothVisible ? '1' : '0';
        img.style.transform = `translateY(${s.clothY + height * (.05 + i * .075)}px) rotate(${i === 1 ? -8 : 7}deg)`;
      });
    }
    render(0);
    return {render, remove: () => layer.remove(), layer};
  }

  window.PortfolioIntro = {mount, duration: flow.duration};
  window.playPortfolioIntro = ({showResult = false} = {}) => {
    if (document.querySelector('.intro-layer:not(.intro-contained)') || reduced.matches) return;
    const player = mount(document.body, {showResult});
    const started = performance.now();
    let frame = 0, finished = false;
    const interrupts = ['pointerdown', 'wheel', 'keydown', 'touchstart'];
    function cleanup() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      clearTimeout(failsafe);
      player.remove();
      for (const event of interrupts) window.removeEventListener(event, cleanup);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onReduced);
      window.removeEventListener('resize', cleanup);
    }
    function onVisibility() { if (document.hidden) cleanup(); }
    function onReduced() { if (reduced.matches) cleanup(); }
    const failsafe = setTimeout(cleanup, 5200);
    function draw(now) {
      const t = (now - started) / 1000;
      if (t >= flow.duration) { cleanup(); return; }
      player.render(t);
      frame = requestAnimationFrame(draw);
    }
    for (const event of interrupts) window.addEventListener(event, cleanup, {once: true, passive: true});
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onReduced);
    window.addEventListener('resize', cleanup, {once: true});
    frame = requestAnimationFrame(draw);
  };

  document.body.classList.add('intro-ready');
  document.querySelectorAll('[data-play-intro]').forEach(button => button.addEventListener('click', () => {
    if (!button.dataset.result) scrollTo({top: 0, behavior: 'instant'});
    window.playPortfolioIntro({showResult: button.dataset.result === 'true'});
  }));
  const forced = new URLSearchParams(location.search).has('intro');
  // Keep v19: each homepage load plays; chapter links and reduced motion stay direct.
  if (!reduced.matches && !document.hidden && (forced || (document.body.dataset.complete && (!location.hash || location.hash === '#hero') && scrollY < 20))) {
    scrollTo({top: 0, behavior: 'instant'});
    window.playPortfolioIntro();
  }
})();
