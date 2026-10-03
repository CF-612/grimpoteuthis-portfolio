(() => {
  const ns='http://www.w3.org/2000/svg';
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const pink='#f1bfd0';
  // Connected cubic curves form the leading edge; all water uses the same fill.
  function waterShape(t){
    if(t>=2.22)return `<rect width="1200" height="1000" fill="${pink}"/>`;
    let paths='';
    for(const [x,start,phase] of [[170,.62,0],[1020,.78,1]]){
      const p=clamp((t-start)/1.08);if(!p)continue;
      const y=-80+p*1180;const w=20+smooth(p)*95;const sway=Math.sin(p*5+phase)*18;
      paths+=`<path fill="${pink}" d="M${x-w-10} -40 C${x-w+12} ${y*.25} ${x-w-32} ${y*.55} ${x-w+sway} ${y-38} C${x-w+sway+12} ${y+8} ${x+w+sway-18} ${y+35} ${x+w+sway} ${y-12} C${x+w+35} ${y*.57} ${x+w-15} ${y*.25} ${x+w+10} -40Z"/>`;
    }
    const p=smooth((t-1.14)/1.08);if(p>0){
      const y=-250+p*1500;const a=140*(1-p);
      paths+=`<path fill="${pink}" d="M-30 -30H1230V${y-a*.1} C1130 ${y-a*.8} 1080 ${y+a*.8} 1000 ${y+a*.6} S855 ${y-a*.8} 780 ${y-a*.3} S625 ${y+a*.9} 540 ${y+a*.5} S385 ${y-a*.6} 310 ${y-a*.2} S150 ${y+a} 75 ${y+a*.6} S-10 ${y-a*.8} -30 ${y-a*.1}Z"/>`;
    }
    return paths;
  }
  function passShape(t){
    if(t<2.48||t>3.58)return '';
    const y=-1450+smooth((t-2.48)/1.1)*2900;
    return `<defs><linearGradient id="passShade" x2="0" y2="1"><stop stop-color="#fffefd"/><stop offset=".8" stop-color="#fffaf4"/><stop offset="1" stop-color="#e5e5f0"/></linearGradient></defs><g transform="translate(0 ${y})"><path fill="url(#passShade)" d="M-100 310C-30 240 20 190 100 235C130 140 250 150 290 210C325 85 470 75 525 195C620 125 690 170 715 235C810 135 930 160 965 250C1040 185 1160 195 1300 295V1160C1160 1100 1070 1340 930 1240C810 1130 700 1320 590 1280C430 1170 345 1370 195 1215C105 1110 20 1260-100 1140Z"/><path d="M-70 345C180 245 330 405 570 310S975 370 1270 310" fill="none" stroke="#dadcea" stroke-width="12" opacity=".38"/><path d="M95 560C260 725 135 895 195 1215M450 480C345 770 500 990 590 1280M885 510C1060 820 775 1050 930 1240" fill="none" stroke="#d9dce9" stroke-width="5" opacity=".55"/><path d="M210 575C305 790 250 1020 280 1190M625 570C575 835 655 1040 680 1210" fill="none" stroke="#fff" stroke-width="16" opacity=".65"/></g>`;
  }
  window.renderIntroWater=waterShape;window.renderIntroPass=passShape;
  window.playPortfolioIntro=({showResult=false}={})=>{
    if(document.querySelector('.intro-layer')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const layer=document.createElement('div');layer.className='intro-layer';layer.setAttribute('aria-hidden','true');
    if(showResult)layer.innerHTML='<div class="intro-result"><div class="intro-latin">GRIMPOTEUTHIS<br>UMBELLATA</div><img src="assets/hero-v3.webp" alt=""><div class="wordmark"><span>烟</span><span>灰</span><span>蛸</span></div><p class="intro-subtitle">世界是阿兹卡班，故事是假释</p></div>';
    const paper=document.createElement('div');paper.className='intro-paper';
    const quote=document.createElement('div');quote.className='intro-quote';quote.innerHTML='<div>在二十一世纪走下去，<br>带着<span class="cold">冷漠</span>、<span class="pure">纯粹</span>和<span class="love">爱</span></div>';
    const water=document.createElementNS(ns,'svg'),pass=document.createElementNS(ns,'svg');
    for(const [svg,name] of [[water,'intro-water'],[pass,'intro-pass']]){svg.setAttribute('class',name);svg.setAttribute('viewBox','0 0 1200 1000');svg.setAttribute('preserveAspectRatio','none');}
    layer.append(paper,quote,water,pass);document.body.append(layer);
    let frame;const cleanup=()=>{cancelAnimationFrame(frame);layer.remove();clearTimeout(failsafe);};
    // Independent cleanup still works if rendering throws midway.
    const failsafe=setTimeout(cleanup,5000);const started=performance.now();
    function draw(now){const t=(now-started)/1000;
      quote.style.opacity=String(1-smooth((t-.76)/.45));water.innerHTML=t<2.98?waterShape(t):'';pass.innerHTML=passShape(t);
      if(t>=2.98)paper.hidden=true;
      if(t>=3.8){cleanup();return;}frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
  };
  document.body.classList.add('intro-ready');
  document.querySelectorAll('[data-play-intro]').forEach(button=>button.addEventListener('click',()=>{if(!button.dataset.result)scrollTo({top:0,behavior:'instant'});window.playPortfolioIntro({showResult:button.dataset.result==='true'});}));
  if(new URLSearchParams(location.search).has('intro')){scrollTo(0,0);window.playPortfolioIntro();}
})();
