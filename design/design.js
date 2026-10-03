(() => {
  const data = window.portfolioData;
  if (!data) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion() {
    document.body.classList.toggle('moving', !reduced.matches && !document.hidden);
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();

  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  };
  const pendingImages = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){const img=entry.target;if(img.dataset.source){img.src=img.dataset.source;delete img.dataset.source;}pendingImages.unobserve(img);}});
  },{rootMargin:'250px'});
  function setImageSource(img,source){
    if(img.getAttribute('src')===source)return;
    const box=img.getBoundingClientRect();
    if(img.isConnected&&box.top<innerHeight+250&&box.bottom>-250&&getComputedStyle(img).visibility!=='hidden'){img.src=source;delete img.dataset.source;}
    else{img.dataset.source=source;pendingImages.observe(img);}
  }
  const preview = document.querySelector('.game-preview');
  const tabs = document.querySelector('.archive-tabs');
  const buttons = [];
  let folderFrame=0,folderUntil=0;
  function drawFolderFronts(time){
    folderFrame=0;
    buttons.forEach(button=>{
      const group=button.querySelector('.folder-tab-group');
      const x=new DOMMatrix(getComputedStyle(group).transform).e;
      button.querySelector('.folder-label').style.transform=`translateX(${x*button.clientWidth/400}px)`;
      // One continuous contour: the moving tab and the pocket share their outline.
      const contour=`M8 327V88Q8 74 ${Math.min(x,24)} 74H${x}V24Q${x} 9 ${x+15} 9H${x+200}Q${x+208} 9 ${x+213} 17L${x+234} 47Q${x+238} 53 ${x+238} 74H389Q393 74 393 88L384 327Q384 343 366 343H22Q7 343 8 327Z`;
      button.querySelector('.folder-front').setAttribute('d',contour);
      button.querySelector('.folder-mascot-clip path')?.setAttribute('d',contour);
    });
    if(time<folderUntil)folderFrame=requestAnimationFrame(drawFolderFronts);
  }
  function refreshFolders(){
    folderUntil=performance.now()+(reduced.matches?0:460);
    if(!folderFrame)folderFrame=requestAnimationFrame(drawFolderFronts);
  }
  addEventListener('resize',refreshFolders);
  reduced.addEventListener('change',refreshFolders);
  function chooseGame(index, animate = true) {
    const game = data.games[index];
    const imageBox = make(game.link ? 'a' : 'div', 'game-image');
    if(game.link){imageBox.href=game.link;imageBox.setAttribute('aria-label','查看'+game.name+'详情');}
    if (game.cover) {
      const img = make('img'); img.alt = game.name + '指定封面'; img.width = 1200; img.height = 800;setImageSource(img,game.cover);
      imageBox.append(img);
    } else imageBox.append(make('span', 'game-placeholder', game.name));
    const content = make('div', 'game-description');
    const genres=make('div','game-genres');
    (game.tags || []).forEach(tag=>genres.append(make('span','game-genre',tag)));
    content.append(genres);
    const title=make('h3');
    if(game.link){const link=make('a','game-title-link',game.name);link.href=game.link;title.append(link);}
    else title.textContent=game.name;
    content.append(title, make('p', '', game.summary));
    if(game.recognition?.length){
      const recognition=make('dl','project-recognition');recognition.setAttribute('aria-label','赛事与荣誉');
      game.recognition.forEach(({label,text})=>{const row=make('div');row.append(make('dt','',label),make('dd','',text));recognition.append(row);});
      content.append(recognition);
    }
    const tags = make('dl', 'project-tags');
    [['我的角色', game.role], ['团队规模', game.team], ['引擎 / 平台', game.platform]].forEach(([label,value]) => {
      const row = make('div'); row.append(make('dt', '', label), make('dd', '', value || '待核对')); tags.append(row);
    });
    content.append(tags);
    preview.replaceChildren(imageBox, content);
    buttons.forEach((button,i) => {button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
    refreshFolders();
    if (animate && !reduced.matches) preview.animate([{opacity:.6,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'ease-out'});
  }
  data.games.forEach((game,i) => {
    const button=make('button','folder-choice');button.setAttribute('aria-label',game.name);
    const colors=['#f2d8a5','#bad1d8','#d8d9bd','#d9c8e0','#edc7b8','#bdcfd8'];const offsets=[18,139,55,104,8,75];
    button.style.setProperty('--folder-color',colors[i]);button.style.setProperty('--home-tab',offsets[i]+'px');button.style.setProperty('--folder-index',i);button.style.zIndex=String(i+1);
    button.innerHTML='<svg viewBox="0 0 400 350" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="folderShade'+i+'" x2="0" y2="1"><stop stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity=".86"/></linearGradient></defs><path d="M13 65Q13 53 26 53H373Q389 53 389 69V324Q389 339 374 339H26Q11 339 11 324Z" fill="currentColor" stroke="#b79c8e" stroke-width="1.2"/><path d="M28 61H375V323H28Z" fill="#fff8e9" stroke="#d3bca6" stroke-width="1"/><path d="M33 64H369M36 68H365" stroke="#ded2bc" stroke-width="1.2"/><path class="folder-front" d="M8 327V88Q8 74 18 74H18V24Q18 9 33 9H218Q226 9 231 17L252 47Q256 53 256 74H389Q393 74 393 88L384 327Q384 343 366 343H22Q7 343 8 327Z" fill="url(#folderShade'+i+')" stroke="#aa9285" stroke-width="1.2"/><path d="M24 84Q188 73 378 83" stroke="#fff7e6" opacity=".6" fill="none" stroke-width="2"/><path d="M29 320H123M29 313H153" stroke="#9b8875" opacity=".4"/><rect x="270" y="278" width="85" height="43" rx="4" fill="#fffaf0" opacity=".5"/><path d="M281 294H344M281 305H323" stroke="#a99584" opacity=".5"/><g class="folder-tab-group"><path d="M14 20H197" stroke="#fff8e8" stroke-width="2" opacity=".55"/><circle class="folder-dot" cx="224" cy="56" r="3" fill="#fff7e6"/></g></svg>'; button.type='button'; button.setAttribute('aria-pressed',String(i===0));
    if(i===data.games.length-1){
      const svg=button.querySelector('svg');
      svg.insertAdjacentHTML('beforeend','<defs><mask id="folder-mascot-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="930" height="799" style="mask-type:alpha"><image href="assets/authored/octopus-outline.png" width="930" height="799"/></mask><clipPath id="folder-mascot-clip" class="folder-mascot-clip"><path/></clipPath></defs>');
      const mascot=document.createElementNS('http://www.w3.org/2000/svg','g');
      mascot.setAttribute('class','folder-mascot');mascot.setAttribute('clip-path','url(#folder-mascot-clip)');
      mascot.innerHTML='<g class="folder-mascot-content" transform="translate(-16 145) rotate(55 140 120) scale(.301)"><rect width="930" height="799" fill="#688ca2" mask="url(#folder-mascot-mask)"/></g>';
      button.querySelector('.folder-front').after(mascot);
      // The folder stretches to fit its column; keep its decoration uniformly scaled.
      const resizeMascot = () => {
        const style = getComputedStyle(svg);
        const width = parseFloat(style.width), height = parseFloat(style.height);
        if (!width || !height) return;
        const scaleX = width / 400, scaleY = height / 350;
        const uniformScale = Math.min(scaleX, scaleY);
        mascot.firstElementChild.setAttribute('transform', `translate(-16 145) scale(${uniformScale / scaleX} ${uniformScale / scaleY}) rotate(55 140 120) scale(.301)`);
      };
      new ResizeObserver(resizeMascot).observe(button);
      window.addEventListener('resize', resizeMascot);
    }
    const label=make('span','folder-label',game.name);button.append(label);new ResizeObserver(entries=>{button.style.setProperty('--folder-scale',entries[0].contentRect.width/400);}).observe(button);
    button.addEventListener('click',()=>chooseGame(i));buttons.push(button);
  });
  const gameReturn = window.PortfolioBoot?.gameReturn;
  const returnIndex = Number.isInteger(gameReturn?.index) && data.games[gameReturn.index] ? gameReturn.index : 0;
  tabs.replaceChildren(...buttons);chooseGame(returnIndex, !gameReturn);document.querySelector('.games').classList.add('enhanced');
  document.querySelector('#games').addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const index = data.games.findIndex(game => new URL(game.link, location.href).href === link.href);
    if (index < 0) return;
    const state = {index, y: scrollY};
    history.replaceState({...history.state, portfolioGameReturn: state}, '');
    try { sessionStorage.setItem('portfolio-game-return', JSON.stringify(state)); } catch {}
  });
  if (gameReturn) {
    const restore = () => scrollTo({top: Number.isFinite(gameReturn.y) ? gameReturn.y : document.querySelector('#games').offsetTop - document.querySelector('body > header').offsetHeight - 24, behavior: 'instant'});
    restore();
    requestAnimationFrame(() => {
      restore();
      document.documentElement.removeAttribute('data-game-return');
      history.scrollRestoration = 'auto';
      history.replaceState({...history.state, portfolioGameReturn: null}, '');
      try { sessionStorage.removeItem('portfolio-game-return'); } catch {}
    });
  }

  const stage=document.querySelector('.gallery-stage');
  const strip=document.querySelector('.gallery-thumbs');
  let thumbPitch=0;
  let thumbFrame=0;
  let inertiaFrame=0;
  function stopThumbMotion(){cancelAnimationFrame(thumbFrame);cancelAnimationFrame(inertiaFrame);}
  const thumbLoop=()=>data.arts.length*thumbPitch;
  function setThumbOffset(value){
    const loop=thumbLoop();
    if(data.arts.length<=1){strip.scrollLeft=0;return;}
    while(value<loop*.5)value+=loop;
    while(value>loop*1.5)value-=loop;
    strip.scrollLeft=value;
  }
  const dialog=document.querySelector('.art-dialog');
  const nodes=[];const thumbButtons=[];
  let focused=0;let around=[1,2,3,4,5];let orbitQueue=data.arts.map((_,i)=>i).slice(1);let busy=false;
  const slots=[
    {left:2,top:10,width:78,height:75,angle:-4},
    {left:60,top:67,width:40,height:52,angle:9},
    {left:-2,top:0,width:25,height:39,angle:-13},
    {left:80,top:12,width:24,height:45,angle:12},
    {left:19,top:75,width:29,height:39,angle:-11},
    {left:59,top:-13,width:27,height:36,angle:-9}
  ];
  const mobileSlots=[
    {left:4,top:14,width:82,height:75,angle:-4},
    {left:61,top:70,width:38,height:43,angle:8},
    {left:-2,top:0,width:26,height:31,angle:-12},
    {left:82,top:18,width:20,height:31,angle:12},
    {left:13,top:81,width:29,height:30,angle:-9},
    {left:60,top:-8,width:29,height:27,angle:-10}
  ];
  function openArt(i){
    const art=data.arts[i]; const img=dialog.querySelector('img');
    img.src=art.original || art.stage; img.alt=art.name;dialog.querySelector('p').textContent=art.name;
    dialog.showModal();
  }
  function placeCaption(node){
    const img=node.querySelector('img');if(!img.naturalWidth)return;
    const button=node.querySelector('button');
    const availableWidth=button.clientWidth,availableHeight=button.clientHeight;
    const ratio=img.naturalWidth/img.naturalHeight;
    const width=Math.min(availableWidth,availableHeight*ratio);
    const height=width/ratio;
    img.style.width=width+'px';img.style.height=height+'px';
    const caption=node.querySelector('figcaption');
    caption.style.top=((availableHeight-height)/2+height+7)+'px';
    caption.style.maxWidth=Math.min(availableWidth,width+24)+'px';
  }
  function syncThumbs(){
    layoutThumbs();
    strip.classList.toggle('has-overflow',data.arts.length>1);
  }
  function layoutThumbs(){
    const orbit=strip.querySelector('.thumb-orbit');
    if(!orbit||!thumbButtons.length)return;
    const width=strip.clientWidth,compact=innerWidth<=700;
    const sag=Math.min(compact?110:155,width*(compact ? .22 : .14));
    const radius=width*width/(8*sag)+sag/2;
    const centerY=12+sag+thumbButtons[0].offsetHeight/2;
    const offset=strip.scrollLeft;
    // Scroll position is distance along one stationary circle, not a translated curve.
    thumbButtons.forEach(button=>{
      const angle=(Number(button.dataset.slot)*thumbPitch-offset)/radius;
      const visible=Math.abs(angle)<Math.PI/2;
      button.style.visibility=visible?'visible':'hidden';
      button.tabIndex=visible?0:-1;
      button.style.left=(visible?offset+width/2+radius*Math.sin(angle):0)+'px';
      button.style.top=(centerY+radius*(Math.cos(angle)-1)-button.offsetHeight/2)+'px';
      button.style.setProperty('--thumb-angle',(-angle*180/Math.PI)+'deg');
    });
    const arc=orbit.querySelector('.thumb-arc');
    const edgeY=centerY+Math.sqrt(radius*radius-width*width/4)-radius;
    arc.setAttribute('viewBox',`0 0 ${width} ${strip.clientHeight}`);
    arc.style.left=offset+'px';arc.style.width=width+'px';arc.style.height=strip.clientHeight+'px';
    arc.querySelector('path').setAttribute('d',`M0 ${edgeY}A${radius} ${radius} 0 0 0 ${width} ${edgeY}`);
    strip.dataset.arcRadius=String(radius);
    strip.dataset.arcCenterY=String(centerY-radius);
  }
  function layout() {
    const orbit=strip.querySelector('.thumb-orbit');
    if(orbit){
      const position=thumbPitch?strip.scrollLeft/thumbPitch:(data.arts.length>1?data.arts.length:0);
      thumbPitch=innerWidth<=700?103:innerWidth<=1050?125:145;
      const required=strip.clientWidth+Math.max(0,thumbButtons.length-1)*thumbPitch;
      orbit.style.width=required+'px';orbit.style.minWidth=required+'px';
      strip.style.overflowX='auto';strip.style.overflowY='hidden';
      strip.scrollLeft=position*thumbPitch;
    }
    syncThumbs();
    const nextArt=(focused+1)%nodes.length;around=[nextArt,...orbitQueue.filter(i=>i!==focused&&i!==nextArt).slice(0,4)];
    const positions=innerWidth<=700?mobileSlots:slots;
    nodes.forEach((node,i)=>{
      const slot=i===focused?0:around.indexOf(i)+1;
      const visible=i===focused||around.includes(i);
      const pos=positions[visible?slot:1];
      node.className=i===focused?'focus-art':i===nextArt?'orbit-art next-art':'orbit-art';
      Object.assign(node.style,{left:pos.left+'%',top:pos.top+'%',width:pos.width+'%',height:pos.height+'%',transform:'rotate('+pos.angle+'deg)',zIndex:i===focused?3:i===nextArt?4:2,visibility:visible?'visible':'hidden',pointerEvents:visible?'auto':'none'});
      node.querySelector('figcaption').hidden=i!==focused&&i!==nextArt;node.querySelector('figcaption').firstChild.textContent=data.arts[i].name+' ';
      node.querySelector('button').setAttribute('aria-label',i===focused?'放大'+data.arts[i].name:'聚焦'+data.arts[i].name);
      if(visible&&!node.querySelector('img').getAttribute('src'))setImageSource(node.querySelector('img'),i===focused?data.arts[i].stage:data.arts[i].thumb);
      if(i===focused||i===nextArt)setImageSource(node.querySelector('img'),data.arts[i].stage);
      if(visible)placeCaption(node);
    });
    thumbButtons.forEach(button=>{const active=Number(button.dataset.artIndex)===focused;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  }
  async function rearrange(change) {
    if(busy)return;busy=true;
    const before=nodes.map(node=>({rect:node.getBoundingClientRect(),visible:node.style.visibility!=='hidden',transform:node.style.transform}));
    change();layout();
    if(!reduced.matches){
      const motions=[];
      nodes.forEach((node,n)=>{
        const old=before[n];const visible=node.style.visibility!=='hidden';const base=node.style.transform;
        if(visible){
          const next=node.getBoundingClientRect();
          const start=old.visible&&old.rect.width?`translate(${old.rect.left-next.left}px,${old.rect.top-next.top}px) scale(${old.rect.width/next.width},${old.rect.height/next.height}) ${base}`:`translate(${next.left<innerWidth/2?-35:35}px,20px) scale(.78) ${base}`;
          motions.push(node.animate([{transform:start,opacity:old.visible?1:0},{transform:base,opacity:1}],{duration:720,easing:'cubic-bezier(.22,.75,.25,1)',transformOrigin:'0 0'}).finished.catch(()=>{}));
        }else if(old.visible){
          Object.assign(node.style,{left:(old.rect.left-stage.getBoundingClientRect().left)+'px',top:(old.rect.top-stage.getBoundingClientRect().top)+'px',width:old.rect.width+'px',height:old.rect.height+'px',visibility:'visible',transform:old.transform,pointerEvents:'none',zIndex:1});
          motions.push(node.animate([{opacity:1,transform:old.transform},{opacity:0,transform:old.transform+' scale(.86)'}],{duration:380,easing:'ease-in'}).finished.catch(()=>{}).then(()=>{node.style.visibility='hidden';}));
        }
      });
      await Promise.all(motions);
    }
    layout();busy=false;
  }
  function centerThumb(i) {
    stopThumbMotion();
    const start=strip.scrollLeft,loop=thumbLoop();
    if(!loop)return;
    const delta=((i*thumbPitch-start+loop/2)%loop+loop)%loop-loop/2;
    if(reduced.matches){setThumbOffset(start+delta);syncThumbs();return;}
    const began=performance.now();
    function slide(now){
      const p=Math.min(1,(now-began)/480),eased=1-Math.pow(1-p,3);
      setThumbOffset(start+delta*eased);syncThumbs();
      if(p<1)thumbFrame=requestAnimationFrame(slide);
    }
    thumbFrame=requestAnimationFrame(slide);
  }
  async function focus(i,fromThumb=false) {
    if(busy)return;
    centerThumb(i);
    if(i===focused){if(!fromThumb)openArt(i);return;}
    await rearrange(()=>{
      const previous=focused;const slot=around.indexOf(i);
      const visibleRest=around.filter(n=>n!==i);
      const hiddenFirst=orbitQueue.filter(n=>n!==i&&n!==previous&&!visibleRest.includes(n));
      orbitQueue=[...hiddenFirst,...visibleRest.filter(n=>n!==previous)];
      orbitQueue.splice(slot>=0?slot:4,0,previous);
      focused=i;around=orbitQueue.slice(0,5);
    });
  }
  function rotateOrbit(){return rearrange(()=>{orbitQueue.push(...orbitQueue.splice(0,4));around=orbitQueue.slice(0,5);});}
  data.arts.forEach((art,i)=>{
    const figure=make('figure','orbit-art');const button=make('button');button.type='button';
    const img=make('img');img.alt=art.name;img.loading='lazy';img.decoding='async';img.addEventListener('load',()=>placeCaption(figure));button.append(img);button.addEventListener('click',()=>focus(i));
    const caption=make('figcaption','',art.name+' ');caption.append(make('span','',String(i+1).padStart(2,'0')+' / '+String(data.arts.length).padStart(2,'0')));
    figure.style.setProperty('--float-duration',(5.3+i%4*.8)+'s');figure.style.setProperty('--float-delay',(-i*.67)+'s');figure.style.setProperty('--float-y',(7+i%3*3)+'px');figure.style.setProperty('--float-x',(i%2?-5:5)+'px');figure.append(button,caption);nodes.push(figure);
    for(let cycle=0;cycle<(data.arts.length>1?3:1);cycle++){
    const thumb=make('button');thumb.type='button';thumb.setAttribute('aria-label','选择'+art.name);thumb.setAttribute('aria-pressed','false');thumb.dataset.artIndex=String(i);thumb.dataset.slot=String(cycle*data.arts.length+i);
    const small=make('img');small.alt=art.name;small.width=360;small.height=260;small.draggable=false;setImageSource(small,art.thumb);
    thumb.title=art.name;thumb.dataset.number=String(i+1).padStart(2,'0');thumb.style.setProperty('--thumb-x',String(data.arts.length>1?i/(data.arts.length-1):.5));thumb.append(small);thumb.addEventListener('click',()=>focus(i,true));thumbButtons.push(thumb);
    }
  });
  stage.replaceChildren(...nodes);const thumbOrbit=make('div','thumb-orbit');thumbOrbit.innerHTML='<svg class=thumb-arc viewBox="0 0 1200 240" preserveAspectRatio=none aria-hidden=true><path d="M25 20Q600 390 1175 20"/></svg>';thumbOrbit.append(...thumbButtons);strip.replaceChildren(thumbOrbit);
  strip.tabIndex=0;strip.setAttribute('role','group');
  strip.setAttribute('aria-label','拖动画作，或使用左右方向键选择绘画作品');
  let drag=null,suppressClickUntil=0;
  strip.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;
    stopThumbMotion();
    drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:performance.now(),velocity:0,active:false};
  });
  strip.addEventListener('pointermove',event=>{
    if(drag?.id!==event.pointerId)return;
    const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
    if(!drag.active){
      if(Math.max(Math.abs(dx),Math.abs(dy))<6)return;
      // Keep vertical touch gestures available for scrolling the page.
      if(Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      drag.active=true;strip.setPointerCapture(event.pointerId);strip.classList.add('dragging');
    }
    event.preventDefault();
    const now=performance.now(),step=drag.x-event.clientX,elapsed=Math.max(1,now-drag.time);
    drag.velocity=drag.velocity*.35+Math.max(-2.5,Math.min(2.5,step/elapsed))*.65;
    setThumbOffset(strip.scrollLeft+step);syncThumbs();drag.x=event.clientX;drag.time=now;
  });
  function finishDrag(event){
    if(drag?.id!==event.pointerId)return;
    const previous=drag;drag=null;strip.classList.remove('dragging');
    if(strip.hasPointerCapture(event.pointerId))strip.releasePointerCapture(event.pointerId);
    if(!previous.active)return;
    suppressClickUntil=performance.now()+300;
    if(event.type!=='pointerup'||reduced.matches)return;
    let velocity=performance.now()-previous.time<100?previous.velocity:0,last=performance.now();
    function coast(now){
      const elapsed=Math.min(32,now-last);last=now;
      velocity*=Math.exp(-elapsed/180);
      setThumbOffset(strip.scrollLeft+velocity*elapsed);syncThumbs();
      if(Math.abs(velocity)>.02)inertiaFrame=requestAnimationFrame(coast);
    }
    if(Math.abs(velocity)>.02)inertiaFrame=requestAnimationFrame(coast);
  }
  strip.addEventListener('pointerup',finishDrag);strip.addEventListener('pointercancel',finishDrag);
  strip.addEventListener('lostpointercapture',event=>{if(event.target===strip&&drag?.id===event.pointerId&&!strip.hasPointerCapture(event.pointerId)){drag=null;strip.classList.remove('dragging');}});
  strip.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  strip.addEventListener('keydown',event=>{
    const targets={ArrowLeft:(focused-1+data.arts.length)%data.arts.length,ArrowRight:(focused+1)%data.arts.length,Home:0,End:data.arts.length-1};
    if(!(event.key in targets))return;
    event.preventDefault();focus(targets[event.key],true);
  });
  strip.addEventListener('scroll',()=>{setThumbOffset(strip.scrollLeft);syncThumbs();},{passive:true});
  strip.addEventListener('wheel',stopThumbMotion,{passive:true});
  new ResizeObserver(()=>{if(!busy)layout();}).observe(strip);
  document.querySelector('.gallery').classList.add('enhanced');layout();
  addEventListener('resize',()=>{if(!busy)layout();});
  const gallery=document.querySelector('.gallery');let galleryVisible=false;
  document.querySelector('.orbit-next').addEventListener('click',rotateOrbit);
  const galleryObserver=new IntersectionObserver(entries=>{galleryVisible=entries[0].isIntersecting;},{threshold:.2});galleryObserver.observe(stage);
  setInterval(()=>{if(galleryVisible&&!busy&&!reduced.matches&&!document.hidden&&!gallery.matches(':hover')&&!gallery.contains(document.activeElement)&&!dialog.open)rotateOrbit();},5600);

  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});

  const scene=document.querySelector('.mail-scene');const mailbox=document.querySelector('.mailbox');let timer;let wasOpen=false;
  // Eye-level view matching the reference sketch: horizontal front edges,
  // a foreshortened tube, and a door swinging outward about the left hinge.
  const door=mailbox.querySelector('.mail-door');
  const letter=mailbox.querySelector('.mail-letter');
  const decoration=mailbox.querySelector('.door-decoration');
  const panel=mailbox.querySelector('.door-panel');
  const interior=mailbox.querySelector('.door-interior');
  let mailProgress=0,mailFrame=0;
  function drawMailbox(progress){
    const angle=Math.min(1,progress/.64)*110*Math.PI/180;
    const x=.75*Math.cos(angle)-.72*Math.sin(angle);
    const y=.06*Math.sin(angle);
    door.style.transform=`matrix(${x},${y},0,-1,112,234)`;
    const slide=Math.max(0,Math.min(1,(progress-.48)/.52));
    const depth=120-220*slide;
    // The letter grows gently after it emerges, keeping its center on the exit path.
    const emerge=Math.max(0,Math.min(1,(slide-.35)/.65));
    const scale=1+.6*emerge*emerge*(3-2*emerge);
    letter.style.transform=`matrix(${.75*scale},0,0,${-scale},${112+.72*depth-(scale-1)*.75*61},${234-.06*depth+(scale-1)*60})`;
    // In this turned view the edge-on point is at about 46 degrees, not 90.
    // Choose the visible face using the projected plane orientation.
    const backFacing=x<0;
    decoration.style.visibility=backFacing?'hidden':'visible';
    interior.style.visibility=backFacing?'visible':'hidden';
    panel.setAttribute('fill',backFacing?'#c7a5b9':'url(#doorRose)');
  }
  function animateMailbox(){
    cancelAnimationFrame(mailFrame);
    const target=scene.classList.contains('open')?1:0;
    const initial=mailProgress,start=performance.now();
    const duration=reduced.matches?0:1100*Math.abs(target-initial);
    function tick(now){
      const t=duration?Math.min(1,(now-start)/duration):1;
      const eased=t*t*(3-2*t);
      mailProgress=initial+(target-initial)*eased;
      drawMailbox(mailProgress);
      if(t<1)mailFrame=requestAnimationFrame(tick);
    }
    mailFrame=requestAnimationFrame(tick);
  }
  drawMailbox(0);
  new MutationObserver(animateMailbox).observe(scene,{attributes:true,attributeFilter:['class']});
  const open=()=>{clearTimeout(timer);scene.classList.add('open');mailbox.setAttribute('aria-expanded','true');};
  const close=()=>{scene.classList.remove('open');mailbox.setAttribute('aria-expanded','false');};
  mailbox.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')open();});
  scene.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')timer=setTimeout(close,250);});
  scene.addEventListener('focusin',open);scene.addEventListener('focusout',()=>{if(!scene.contains(document.activeElement))timer=setTimeout(close,250);});
  mailbox.addEventListener('pointerdown',()=>{wasOpen=scene.classList.contains('open');});
  mailbox.addEventListener('click',event=>{if(event.pointerType==='mouse')open();else wasOpen?close():open();});
  document.querySelector('.copy-email').addEventListener('click',async()=>{
    const status=document.querySelector('.copy-status');
    const address='2122457659@qq.com';
    try {
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(address);
      status.textContent='已复制';
    } catch {
      // HTTP LAN pages lack Clipboard API; use the current button gesture as a fallback.
      const field=document.createElement('textarea');
      field.value=address;field.readOnly=true;field.setAttribute('aria-hidden','true');
      Object.assign(field.style,{position:'fixed',left:'-9999px',top:'0',fontSize:'16px'});
      const previous=document.activeElement;document.body.append(field);field.select();field.setSelectionRange(0,address.length);
      let copied=false;try{copied=document.execCommand('copy');}catch{}
      field.remove();previous?.focus({preventScroll:true});
      status.textContent=copied?'已复制':'自动复制失败，请选中上方邮箱地址复制';
    }
  });
  scene.classList.add('mail-ready');

  function placeMailHint(){
    const svg=document.querySelector('.mail-geometry'),hint=document.querySelector('.mailbox-hint');
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const tip=new DOMPoint(157,88).matrixTransform(matrix);
    const section=document.querySelector('#contact').getBoundingClientRect();
    hint.style.left=(tip.x-section.left-136)+'px';hint.style.top=(tip.y-section.top-110)+'px';
  }
  addEventListener('resize',placeMailHint);placeMailHint();
  const hero=document.querySelector('.hero');const cloudBank=document.querySelector('.scroll-clouds');
  let cloudFrame=0,cloudTravel=0,cloudTime=0;
  const cloudStarts=[.06,.14,.24,.32,.40,.48,.55,.62,.68,.74,.80];
  function updateClouds(time){
    cloudFrame=0;
    const box=hero.getBoundingClientRect();
    const target=reduced.matches?0:Math.max(0,Math.min(1.15,-box.top/box.height));
    const dt=cloudTime?Math.min(32,time-cloudTime):16;cloudTime=time;
    cloudTravel+= (target-cloudTravel)*(1-Math.exp(-dt/320));
    if(Math.abs(target-cloudTravel)<.0001)cloudTravel=target;
    const mobile=innerWidth<=700;
    // The first two puffs are smaller; later groups build up over a longer scroll range.
    const positions=mobile?[[.69,.76,.48],[.29,.84,.53],[.02,.84,.88],[.38,.61,.95],[.08,.70,.93],[.72,.54,1],[-.08,.77,.88],[.44,.43,.92],[.12,.55,.87],[.71,.35,.99],[.30,.46,.96]]:
      [[.75,.73,.24],[.53,.83,.27],[.40,.84,.39],[.62,.61,.45],[.43,.75,.42],[.86,.55,.46],[.30,.87,.38],[.57,.43,.46],[.38,.59,.40],[.81,.39,.48],[.47,.51,.44]];
    cloudBank.querySelectorAll('.cloud-piece').forEach((cloud,i)=>{
      const local=Math.max(0,Math.min(1,(cloudTravel-cloudStarts[i])/(i<2?.30:.28)));
      const eased=local*local*(3-2*local);
      const [x,y,w]=positions[i];cloud.style.width=(w*100)+'%';
      cloud.style.opacity=String(eased);cloud.style.transform=`translate(${x*box.width}px,${(1.04+(y-1.04)*eased)*box.height}px) rotate(${[-8,6,-4,9,-6][i%5]}deg)`;
    });
    const conceal=Math.max(0,Math.min(1,(cloudTravel-.77)/.16));
    document.querySelector('.hero-character').style.opacity=String(1-conceal*conceal*(3-2*conceal));
    if(Math.abs(target-cloudTravel)>.0001)requestClouds();else cloudTime=0;
  }
  function requestClouds(){if(!cloudFrame)cloudFrame=requestAnimationFrame(updateClouds);}
  addEventListener('scroll',requestClouds,{passive:true});addEventListener('resize',requestClouds);reduced.addEventListener('change',requestClouds);requestClouds();
  const aboutObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){document.querySelector('#about').classList.add('about-visible');aboutObserver.disconnect();}
  },{threshold:.18});aboutObserver.observe(document.querySelector('#about'));
  const navLinks=[...document.querySelectorAll('nav a[href^="#"]')];
  const navObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting)navLinks.forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  },{rootMargin:'-15% 0px -55% 0px'});
  for(const section of document.querySelectorAll('main>section'))navObserver.observe(section);
})();
