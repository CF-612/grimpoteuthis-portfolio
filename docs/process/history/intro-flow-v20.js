/* Deterministic silhouettes shared by the entrance and the storyboard player. */
(function (root) {
  'use strict';
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const n = x => Number(x.toFixed(2));
  const duration = 3.9;
  const pink = '#f1bfd0';

  function spline(points) {
    let d = `M${n(points[0][0])} ${n(points[0][1])}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[Math.max(0, i - 1)], b = points[i];
      const c = points[i + 1], e = points[Math.min(points.length - 1, i + 2)];
      d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`;
    }
    return d;
  }

  function createScene(width, height) {
    const compact = width / height < .85;
    const starts = compact ? [.48, .73, .86, .98, .81, .59, .76] : [.48, .72, .83, .68, .91, .99, .86, .78, .93, .58, .74];
    const count = starts.length;
    const fallTime = .66;
    const positions = compact ? [0, .15, .34, .5, .67, .85, 1] : [0, .07, .18, .31, .41, .51, .615, .71, .84, .94, 1.02];
    const streams = starts.map((start, i) => ({start, x: width * positions[i], phase: i * 1.79, seed: width * (compact ? .020 : .012) * (1 + .22 * Math.sin(i * 2.3))}));
    const topPad = height * .083;

    function stream(i, t) {
      const s = streams[i], age = t - s.start;
      if (age <= 0) return '';
      // Gravity accelerates the head. A section widens only after water reaches it.
      const head = -topPad + height * Math.pow(age / fallTime, 1.85);
      const tip = Math.min(head, height * 1.17);
      if (tip < -height * .045) return '';
      const arrive = y => fallTime * Math.pow(Math.max(0, y + topPad) / height, 1 / 1.85);
      function edge(y) {
        const maturity = smooth((age - arrive(y) - .065) / .43);
        const ripple = Math.sin(y / height * 10 - age * 6 + s.phase);
        const sway = Math.sin(y / height * 5 - age * 2.6 + s.phase);
        const x = s.x + width * .012 * sway * (1 - maturity);
        const w = s.seed * (1 + .18 * ripple) + width * (compact ? .12 : .080) * maturity;
        return {x, w};
      }
      const end = edge(tip), radiusY = Math.min(end.w * 1.5, Math.max(height * .004, (tip + topPad) * .3));
      const neckY = tip - radiusY;
      const left = [], right = [];
      for (let k = 0; k <= 20; k++) {
        const y = -topPad + (neckY + topPad) * k / 20, e = edge(y);
        // A slight neck and a rounded, stretched head suggest surface tension.
        const neck = 1 - .14 * Math.exp(-Math.pow((k / 20 - .83) / .12, 2)) * (1 - smooth((age - .8) / .3));
        left.push([e.x - e.w * neck, y]);
        right.push([e.x + e.w * neck, y]);
      }
      const l = left[left.length - 1], r = right[right.length - 1];
      return spline(left) + `C${n(l[0])} ${n(tip + radiusY * .30)} ${n(r[0])} ${n(tip + radiusY * .30)} ${n(r[0])} ${n(neckY)}` + spline(right.reverse()).replace(/^M[^C]+/, '') + 'Z';
    }

    function drops(t) {
      return [1, count - 2].map((i, j) => {
        const age = t - starts[i], visible = age > .06 && age < .64;
        const r = Math.min(width, height) * (.004 + j * .001);
        return {x: streams[i].x + width * .012 * Math.sin(age * 3 + i), y: -height * .044 + height * Math.pow(Math.max(0, age + .07) / fallTime, 1.85), rx: r, ry: r * 2.1, visible};
      });
    }

    // One opaque fabric shape covers the pink before revealing the real homepage.
    const clothHeight = height * 1.45;
    const topEdge = [[-width * .08, height * .04], [width * .18, -height * .065], [width * .43, height * .045], [width * .68, -height * .08], [width * .9, height * .035], [width * 1.08, -height * .02]];
    const bottomEdge = [[width * 1.08, clothHeight - height * .045], [width * .84, clothHeight + height * .03], [width * .62, clothHeight - height * .06], [width * .37, clothHeight + height * .05], [width * .13, clothHeight - height * .01], [-width * .08, clothHeight + height * .06]];
    const clothPath = spline(topEdge) + `L${n(bottomEdge[0][0])} ${n(bottomEdge[0][1])}` + spline(bottomEdge).replace(/^M[^C]+/, '') + 'Z';
    const folds = Array.from({length: compact ? 4 : 7}, (_, i) => {
      const x = width * (i + .3) / (compact ? 4 : 7), w = width * .045;
      return `M${n(x)} 0C${n(x - w)} ${n(height * .4)} ${n(x + w * 2)} ${n(height * .8)} ${n(x + w)} ${n(clothHeight)}L${n(x + w * 2)} ${n(clothHeight)}C${n(x + w * 3)} ${n(height * .8)} ${n(x)} ${n(height * .4)} ${n(x + w)} 0Z`;
    });
    function state(t) {
      const p = clamp((t - 2.18) / (duration - 2.18));
      const clothY = height * (-1.55 + 2.95 * (.83 * p + .17 * p * p));
      return {
        quoteOpacity: 1 - smooth((t - 1.00) / .45),
        clothVisible: t >= 2.18 && t < duration,
        clothY,
        // At this point the trailing edge is above y=0 and the leading edge below H.
        covered: clothY >= -height * .22,
        phase: t < .48 ? '文字' : t < 1.1 ? '细流下落' : t < 1.8 ? '水流汇合' : t < 2.18 ? '铺满' : clothY < -height * .22 ? '裙摆遮挡' : t < duration ? '露出头图' : '完成'
      };
    }
    return {width, height, count, stream, drops, clothPath, folds, state};
  }

  const api = {createScene, duration, pink};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortfolioIntroFlow = api;
})(typeof window === 'undefined' ? globalThis : window);
