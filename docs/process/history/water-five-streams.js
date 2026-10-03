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
    const p=clamp((t-2.06)/1.4),y=-1270+(p*.65+p*p*.35)*2500;
    // A scalloped, folded skirt silhouette travels downwards, never sideways.
    return `<defs><linearGradient id="passShade" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#fff9ef"/><stop offset=".55" stop-color="#fffdf5"/><stop offset="1" stop-color="#e5dbe8"/></linearGradient></defs><g transform="translate(0 ${y})"><path fill="url(#passShade)" d="M-160 115C90 25 173 116 347 54S680 104 865 41S1120 92 1340 39L1375 1045C1226 1083 1161 970 1049 1069C911 1191 840 996 699 1122C574 1234 492 1074 364 1165C212 1276 122 1107 -82 1220Z"/><path d="M-60 180C198 98 307 213 543 144S930 203 1280 109" fill="none" stroke="#dfd3e4" stroke-width="10" opacity=".5"/><path d="M214 211C154 417 242 568 206 777S234 1036 279 1191M568 164C662 404 530 599 626 831S639 1035 699 1122M944 143C821 391 988 631 889 841S978 1008 1049 1069" fill="none" stroke="#cbbdd6" stroke-width="4" opacity=".38"/><path d="M254 267C218 546 313 842 330 1115M725 194C696 556 784 821 774 1078" fill="none" stroke="#fffef8" stroke-width="30" opacity=".75"/></g>`;
  }
window.HistoricalFlow={waterShape,passShape};
})();
