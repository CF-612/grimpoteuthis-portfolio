(() => {
  'use strict';
  const flow = window.PortfolioIntroFlow;
  if (!flow) { window.PortfolioBoot?.release(); return; }
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
    const gradient = svgNode('linearGradient', {id, x1: '0%', y1: '0%', x2: '85%', y2: '100%'});
    for (const [offset, color] of [['0', '#bea8ce'], ['.32', '#dcc6e0'], ['.64', '#f0dddf'], ['1', '#cbb3d5']]) gradient.append(svgNode('stop', {offset, 'stop-color': color}));
    const glow = svgNode('radialGradient', {id: id + '-glow', cx: '64%', cy: '42%', r: '67%'});
    for (const [offset, color, opacity] of [['0', '#fff9e7', '.92'], ['.4', '#fff5e9', '.44'], ['1', '#fff4e8', '0']]) glow.append(svgNode('stop', {offset, 'stop-color': color, 'stop-opacity': opacity}));
    const ribbon = svgNode('linearGradient', {id: id + '-ribbon', x1: '0%', y1: '0%', x2: '0%', y2: '100%'});
    for (const [offset, opacity] of [['0', '0'], ['.36', '.08'], ['.6', '.65'], ['.78', '.18'], ['1', '0']]) ribbon.append(svgNode('stop', {offset, 'stop-color': '#fffaf0', 'stop-opacity': opacity}));
    const warmth = svgNode('linearGradient', {id: id + '-warmth', x1: '0%', y1: '100%', x2: '90%', y2: '0%'});
    warmth.append(svgNode('stop', {offset: '0', 'stop-color': '#f4cfc5', 'stop-opacity': '.76'}), svgNode('stop', {offset: '.58', 'stop-color': '#fff0d3', 'stop-opacity': '.6'}), svgNode('stop', {offset: '1', 'stop-color': '#fff1e4', 'stop-opacity': '0'}));
    const glint = svgNode('linearGradient', {id: id + '-glint', x1: '0%', y1: '0%', x2: '100%', y2: '0%'});
    glint.append(svgNode('stop', {offset: '0', 'stop-color': '#fff8df', 'stop-opacity': '0'}), svgNode('stop', {offset: '.46', 'stop-color': '#fffdf4', 'stop-opacity': '.85'}), svgNode('stop', {offset: '1', 'stop-color': '#fff5de', 'stop-opacity': '0'}));
    const clip = svgNode('clipPath', {id: id + '-clip'});
    clip.append(svgNode('path', {d: scene.clothPath}));
    defs.append(gradient, glow, ribbon, warmth, glint, clip);
    const cloth = svgNode('g');
    cloth.append(svgNode('path', {d: scene.clothPath, fill: `url(#${id})`}));
    cloth.append(svgNode('path', {d: scene.clothPath, fill: `url(#${id}-glow)`}));
    const warmLight = svgNode('path', {d: scene.clothPath, fill: `url(#${id}-warmth)`});
    cloth.append(warmLight);
    const folds = svgNode('g', {'clip-path': `url(#${id}-clip)`});
    // Broad light ribbons give the opaque veil depth without extra bitmap loads.
    const lightBands = [];
    for (let i = 0; i < 3; i++) {
      const y = height * (.28 + i * .43), depth = height * .18;
      const band = svgNode('g');
      const curve = `M${-width*.14} ${y} C${width*.18} ${y-height*.26} ${width*.55} ${y+height*.24} ${width*1.14} ${y-height*.1}`;
      band.append(svgNode('path', {d: curve + ` L${width*1.14} ${y-height*.1+depth} C${width*.55} ${y+height*.24+depth} ${width*.18} ${y-height*.26+depth} ${-width*.14} ${y+depth}Z`, fill: `url(#${id}-ribbon)`}));
      band.append(svgNode('path', {d: curve, fill: 'none', stroke: `url(#${id}-glint)`, 'stroke-width': Math.max(1, height * .0015), opacity: '.48'}));
      band.append(svgNode('path', {d: curve, fill: 'none', stroke: '#b498be', 'stroke-width': height * .015, opacity: '.07', transform: `translate(0 ${depth*.88})`}));
      folds.append(band); lightBands.push(band);
    }
    const wake = svgNode('g', {class: 'intro-silk-wake', fill: 'none', stroke: `url(#${id}-glint)`});
    for (let i = 0; i < 3; i++) {
      const y = height * i * .038;
      wake.append(svgNode('path', {d: `M${-width*.4} ${y+height*.08} C${-width*.16} ${y-height*.12} ${width*.1} ${y+height*.13} ${width*.38} ${y-height*.04}`, 'stroke-width': Math.max(1, height * (i ? .002 : .007)), opacity: i ? '.56' : '.3'}));
    }
    folds.append(wake);
    cloth.append(folds);
    cloth.append(svgNode('path', {d: scene.clothPath, fill: 'none', stroke: '#fff4df', 'stroke-width': Math.max(1.5, height * .003), opacity: '.52'}));
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
    // Decode the actual transition artwork and first-screen images before revealing.
    const images = [...layer.querySelectorAll('img'), ...(!contained ? document.querySelectorAll('#hero img, header .brand-symbol') : [])];
    const loading = {total: images.length + 1, completed: 0, failed: 0};
    const tasks = images.map(async img => {
      img.loading = 'eager';
      try { await img.decode(); }
      catch { loading.failed++; }
      finally { loading.completed++; }
    });
    tasks.push((async () => {
      try { await document.fonts.load('23px Intro', '世界是阿兹卡班，故事是假释'); await document.fonts.ready; }
      catch { loading.failed++; }
      finally { loading.completed++; }
    })());
    const ready = Promise.all(tasks);
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
      const figureY = figureStart + (height * 1.58 - figureStart) * fall;
      warmLight.setAttribute('opacity', String(Math.max(0, Math.min(.82, (p - .18) * 1.25))));
      lightBands.forEach((band, i) => band.setAttribute('transform', `translate(${width * .035 * Math.sin(p * 2.8 + i)} ${height * .022 * Math.sin(p * 3.5 + i * 1.3)})`));
      const wakeProgress = Math.max(0, Math.min(1, (p - .2) / .75));
      wake.setAttribute('opacity', String(Math.sin(wakeProgress * Math.PI) * .8));
      wake.setAttribute('transform', `translate(${width * (.57 - p * .2)} ${figureY + figureWidth * .4 - s.clothY}) rotate(-12)`);
      silhouette.style.opacity = String(Math.max(0, Math.min(1, (t - 2.08) / .18)));
      silhouette.style.transform = `translate(${width * (.10 - p * .20)}px, ${figureY}px) rotate(${-16 + p * 17}deg)`;
      clouds.forEach((img, i) => {
        img.style.opacity = s.clothVisible ? String(Math.min(1, (t - 2.18) / .16)) : '0';
        img.style.transform = `translate(${width * Math.sin(p * 1.6 + i) * .025}px, ${s.clothY + height * ([.16, 1.0, .68, .95][i])}px) rotate(${[-8, 7, -6, 12][i]}deg)`;
      });
    }
    render(0);
    return {render, remove: () => layer.remove(), layer, loading, ready};
  }

  window.PortfolioIntro = {mount, duration: flow.duration};
  window.playPortfolioIntro = ({showResult = false} = {}) => {
    if (document.querySelector('.intro-layer:not(.intro-contained)') || reduced.matches) return;
    let player = mount(document.body, {showResult});
    document.documentElement.setAttribute('data-intro-playing', '');
    window.PortfolioBoot?.release();
    const started = performance.now();
    let frame = 0, finished = false, assetsReady = false, revealStarted = null;
    let timeline = 0, lastFrame = started;
    function watch(current) {
      assetsReady = false;
      current.ready.then(() => { if (current === player) assetsReady = true; });
    }
    watch(player);
    function cleanup() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      player.remove();
      document.documentElement.removeAttribute('data-intro-playing');
      reduced.removeEventListener('change', onReduced);
      window.removeEventListener('resize', onResize);
    }
    function onReduced() { if (reduced.matches) cleanup(); }
    function onResize() {
      player.remove();
      player = mount(document.body, {showResult});
      timeline = Math.min(timeline, 2.16);
      player.render(timeline);
      watch(player);
      // A newly selected responsive image must also decode before the reveal.
      revealStarted = null;
    }
    function draw(now) {
      const elapsed = (now - started) / 1000;
      if (revealStarted === null) {
        const progress = player.loading.completed / player.loading.total;
        const goal = Math.min(elapsed, .48 + progress * 1.68);
        timeline = Math.min(goal, timeline + Math.min(.1, (now - lastFrame) / 1000));
        player.layer.dataset.loadingProgress = progress.toFixed(3);
        player.layer.dataset.waiting = String(!assetsReady);
        if (assetsReady && timeline >= 2.15) {
          // A failed transition image gets a simple fade, never an empty purple pass.
          if (player.loading.failed) {
            player.layer.animate([{opacity:1},{opacity:0}], {duration:350}).finished.then(cleanup);
            return;
          }
          revealStarted = now;
        }
      } else {
        timeline = 2.18 + (now - revealStarted) / 1000;
      }
      if (timeline >= flow.duration) { cleanup(); return; }
      player.render(timeline);
      lastFrame = now;
      frame = requestAnimationFrame(draw);
    }
    reduced.addEventListener('change', onReduced);
    window.addEventListener('resize', onResize);
    frame = requestAnimationFrame(draw);
  };

  document.body.classList.add('intro-ready');
  document.querySelectorAll('[data-play-intro]').forEach(button => button.addEventListener('click', () => {
    if (!button.dataset.result) scrollTo({top: 0, behavior: 'instant'});
    window.playPortfolioIntro({showResult: button.dataset.result === 'true'});
  }));
  const forced = new URLSearchParams(location.search).has('intro');
  // Homepage loads wait for critical images; chapter links and reduced motion stay direct.
  if (!reduced.matches && !document.hidden && (forced || (document.body.dataset.complete && (!location.hash || location.hash === '#hero')))) {
    scrollTo({top: 0, behavior: 'instant'});
    window.playPortfolioIntro();
  } else window.PortfolioBoot?.release();
})();
