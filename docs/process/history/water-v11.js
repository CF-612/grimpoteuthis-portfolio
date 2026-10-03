(()=>{
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const pink='#f1bfd0';
  // Separate flowing columns widen into one opaque surface, as in the storyboard.
  function waterShape(t){
    if(t>=1.92)return `<rect width="1200" height="1000" fill="${pink}"/>`;
    let paths='';
    const streams=[[70,.5,62,0],[1080,.58,83,1],[335,.73,48,2],[790,.84,69,3],[520,.96,42,4]];
    for(const [x,start,width,phase] of streams){
      const p=clamp((t-start)/1.05);if(!p)continue;
      const y=-90+Math.pow(p,1.22)*1400;
      const w=width*(.36+.64*p),sway=Math.sin(p*4+phase)*20;
      paths+=`<path fill="${pink}" d="M${x-w} -70 C${x-w-8} ${y*.24} ${x-w+14} ${y*.57} ${x-w+sway} ${y-28} Q${x-w+sway-2} ${y+14} ${x+sway} ${y+21} Q${x+w+sway+4} ${y+17} ${x+w+sway} ${y-24} C${x+w-10} ${y*.59} ${x+w+18} ${y*.23} ${x+w} -70Z"/>`;
    }
    const p=smooth((t-1.13)/.79);
    if(p>0){const y=-260+p*1550,a=115*(1-p);
      paths+=`<path fill="${pink}" d="M-40 -40H1240V${y}C1140 ${y-a} 1080 ${y+a} 980 ${y}S820 ${y-a} 740 ${y}S590 ${y+a} 510 ${y}S355 ${y-a} 275 ${y}S90 ${y+a} -40 ${y}Z"/>`;
    }return paths;
  }
  function passShape(t){
    if(t<2.06||t>3.46)return '';
    const p=clamp((t-2.06)/1.4),y=-1450+(p*.65+p*p*.35)*2700;
    return `<g transform="translate(0 ${y})"><image href="assets/skirt-pass-v11.svg" x="-120" width="1440" height="1680"/></g>`;
  }
window.HistoricalFlow={waterShape,passShape};
})();
