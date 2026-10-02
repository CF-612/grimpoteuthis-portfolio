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
    const waterDefs = svgNode('defs');
    const soften = Math.min(width, height) * .008;
    const liquid = svgNode('filter', {id: id + '-liquid', filterUnits: 'userSpaceOnUse', x: -40, y: -40, width: width + 80, height: height + 80, 'color-interpolation-filters': 'sRGB'});
    liquid.append(svgNode('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: soften, result: 'soft'}));
    liquid.append(svgNode('feColorMatrix', {in: 'soft', type: 'matrix', values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9.5', result: 'joined'}));
    liquid.append(svgNode('feFlood', {'flood-color': flow.pink, result: 'pink'}));
    liquid.append(svgNode('feComposite', {in: 'pink', in2: 'joined', operator: 'in'}));
    waterDefs.append(liquid);
    const waterBody = svgNode('g', {filter: `url(#${id}-liquid)`});
    water.append(waterDefs, waterBody);
    const paths = Array.from({length: scene.count}, () => {
      const p = svgNode('path', {fill: flow.pink}); waterBody.append(p); return p;
    });
    const droplets = Array.from({length: 2}, () => {
      const e = svgNode('ellipse', {fill: flow.pink}); waterBody.append(e); return e;
    });
    const pass = svgNode('svg', {class: 'intro-pass', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none'});
    const defs = svgNode('defs');
    const gradient = svgNode('linearGradient', {id, x1: '0', y1: '0', x2: '1', y2: '.8'});
    for (const [offset, color] of [['0', '#e9d3e4'], ['.48', '#eddde8'], ['1', '#d5bcdb']]) gradient.append(svgNode('stop', {offset, 'stop-color': color}));
    const clip = svgNode('clipPath', {id: id + '-clip'});
    clip.append(svgNode('path', {d: scene.clothPath}));
    defs.append(gradient, clip);
    const cloth = svgNode('g');
    cloth.append(svgNode('path', {d: scene.clothPath, fill: `url(#${id})`}));
    const folds = svgNode('g', {'clip-path': `url(#${id}-clip)`});
    // Subtle sweeping contours support the author's white silhouette.
    for (let i = 0; i < 4; i++) {
      const y = height * (.22 + i * .31);
      folds.append(svgNode('path', {d: `M${-width * .1} ${y} C${width * .26} ${y-height*.32} ${width*.57} ${y+height*.3} ${width*1.1} ${y-height*.08}`, fill: 'none', stroke: i % 2 ? '#fffefa' : '#c4adc9', 'stroke-width': height * .002, opacity: '.27'}));
    }
    cloth.append(folds);
    pass.append(defs, cloth);
    layer.append(paper, quote, water, pass);
    const silhouette = document.createElement('img');
    silhouette.className = 'intro-white-figure';
    silhouette.src = 'assets/authored/falling-white-v21.png';
    silhouette.alt = ''; silhouette.fetchPriority = 'high';
    const figureWidth = width * (width / height < .85 ? 1.75 : 1);
    const figureStart = -Math.max(height * 1.12, figureWidth * 2130 / 3119 + height * .08);
    silhouette.style.width = figureWidth + 'px';
    silhouette.style.left = (width - figureWidth) / 2 + 'px';
    layer.append(silhouette);
    // Near and distant cloud banks travel with the veil at different depths.
    const clouds = [1, 2, 3, 4].map(i => {
      const img = document.createElement('img');
      img.className = 'intro-flight-cloud flight-' + i;
      img.src = 'assets/cloud-silk-v21.svg'; img.alt = '';
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
      const p = Math.max(0, Math.min(1, (t - 2.08) / (flow.duration - 2.08)));
      const fall = .8 * p + .2 * p * p;
      silhouette.style.opacity = String(Math.max(0, Math.min(1, (t - 2.08) / .18)));
      silhouette.style.transform = `translate(${width * (.10 - p * .20)}px, ${figureStart + (height * 1.58 - figureStart) * fall}px) rotate(${-16 + p * 17}deg)`;
      clouds.forEach((img, i) => {
        img.style.opacity = s.clothVisible ? String(Math.min(1, (t - 2.18) / .16)) : '0';
        img.style.transform = `translate(${width * Math.sin(p * 1.6 + i) * .025}px, ${s.clothY + height * ([.16, 1.0, .68, .95][i])}px) rotate(${[-8, 7, -6, 12][i]}deg)`;
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
    const failsafe = setTimeout(cleanup, (flow.duration + 1.3) * 1000);
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
  if (!reduced.matches && !document.hidden && (forced || (document.body.dataset.complete && (!location.hash || location.hash === '#hero')))) {
    scrollTo({top: 0, behavior: 'instant'});
    window.playPortfolioIntro();
  }
})();
