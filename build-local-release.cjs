const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=__dirname,source=path.join(root,'design'),target=path.join(root,'dist');
// index-v2.html is the sole editable template; index.html is generated every build.
const finalize=path.join(source,'finalize-preview.cjs');delete require.cache[require.resolve(finalize)];require(finalize);
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(source,'data.js'),'utf8'),scope);
const data=scope.window.portfolioData;
const configuredOrigin=process.env.PORTFOLIO_SITE_ORIGIN||JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8')).publicOrigin;
let origin='';if(configuredOrigin){const u=new URL(configuredOrigin);if(!['https:','http:'].includes(u.protocol))throw new Error('Site origin must use HTTP or HTTPS');origin=u.href.replace(/\/?$/,'/');}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const entry of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,entry.name),b=path.join(to,entry.name);if(entry.isDirectory())copyTree(a,b);else if(entry.isFile())fs.copyFileSync(a,b);else throw new Error('Unexpected non-file entry: '+a);}}
function replaceOnce(html,needle,replacement){if(html.split(needle).length!==2)throw new Error('Expected one template marker: '+needle);return html.replace(needle,replacement);}
function shareMeta(html,title,description,image,page){const absolute=p=>origin?new URL(p,origin).href:p;const imagePath=origin?absolute(image):(page.startsWith('games/')?'../':'')+image;const canonical=origin?'<link rel="canonical" href="'+escape(absolute(page))+'"><meta property="og:url" content="'+escape(absolute(page))+'">':'';return replaceOnce(html,'</head>',`<meta property="og:type" content="website"><meta property="og:site_name" content="烟灰蛸"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${escape(imagePath)}"><meta name="twitter:card" content="summary_large_image">${canonical}</head>`);}
// dist is generated output. Refuse redirects before removing an old build.
if(fs.existsSync(target)){if(fs.realpathSync(target)!==target)throw new Error('Release directory must not be a symlink');fs.rmSync(target,{recursive:true,force:true});}
fs.mkdirSync(target,{recursive:true});
for(const name of ['design.css','refinement.css','polish.css','editorial.css','intro.css','design.js','intro.js','intro-flow.js','storyboard.html','data.js','detail.css'])fs.copyFileSync(path.join(source,name),path.join(target,name));
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
html=replaceOnce(html,'<body>','<body data-complete="true">');
if(!/<aside class="design-notice">[\s\S]*?<\/aside>/.test(html))throw new Error('Missing design notice marker');
html=html.replace(/<aside class="design-notice">[\s\S]*?<\/aside>/,'');
const description='烟灰蛸的个人作品集，游戏策划与绘画。';
html=replaceOnce(html,'<title>烟灰蛸</title>','<title>烟灰蛸</title><meta name="description" content="'+description+'"><meta name="theme-color" content="#fff9ef"><link rel="icon" href="assets/octopus.png?v=18">');
if((html.match(/<div class="archive-tabs"/g)||[]).length!==1)throw new Error('Missing archive navigation marker');
html=html.replace(/(<div class="archive-tabs"[^>]*>).*?<\/div>/s,'$1'+data.games.map(g=>'<a href="'+escape(g.link)+'">'+escape(g.name)+'</a>').join('')+'</div>');
html=shareMeta(html,'烟灰蛸 · 游戏策划与绘画作品集',description,'assets/authored/hero-painted-mobile-v11.webp','index.html');
fs.writeFileSync(path.join(target,'index.html'),html);
fs.mkdirSync(path.join(target,'games'),{recursive:true});
for(const game of data.games){let content=fs.readFileSync(path.join(source,game.link),'utf8');content=replaceOnce(content,'</head>','<link rel="icon" href="../assets/octopus.png?v=18"></head>');content=shareMeta(content,game.name+' · 烟灰蛸',game.summary,game.cover,game.link);fs.writeFileSync(path.join(target,game.link),content);}
const assetDir=path.join(target,'assets');fs.mkdirSync(assetDir,{recursive:true});
for(const dir of ['games','thumbs','stage','media','authored'])copyTree(path.join(source,'assets',dir),path.join(assetDir,dir));
const fontDir=path.join(assetDir,'fonts');fs.mkdirSync(fontDir,{recursive:true});
for(const name of ['brush.ttf','seto.ttf','nerko.ttf','intro-serif-v21.otf'])fs.copyFileSync(path.join(source,'assets/fonts',name),path.join(fontDir,name));
copyTree(path.join(source,'assets/fonts/licenses'),path.join(fontDir,'licenses'));
for(const name of ['kocho.otf','intro.ttf','intro-v11.ttf']){const obsolete=path.join(fontDir,name);if(fs.existsSync(obsolete))fs.unlinkSync(obsolete);}
const originalDir=path.join(assetDir,'originals');fs.mkdirSync(originalDir,{recursive:true});const originals=new Set(data.arts.map(a=>path.basename(a.original)));
for(const art of data.arts){if(!/^assets\/originals\/[^/]+$/.test(art.original))throw new Error('Unexpected original path: '+art.original);fs.copyFileSync(path.join(source,art.original),path.join(target,art.original));}
// Prune only obsolete generated art files in this exact release subdirectory.
for(const name of fs.readdirSync(originalDir)){if(/^art-\d+\.(png|webp)$/.test(name)&&!originals.has(name))fs.unlinkSync(path.join(originalDir,name));}
for(const file of ['cloud-silk-v21.svg','skirt-pass-v11.svg','octopus.png','wordmark-stacked-v6.svg','wordmark-hero-v13.svg','wordmark-hero-v14.svg',...Array.from({length:4},(_,i)=>'cloud-puff-'+(i+1)+'.svg')])fs.copyFileSync(path.join(source,'assets',file),path.join(assetDir,file));
// Fail before handing off a package containing broken local HTML/CSS references.
const missing=[];function check(file,text,re){for(const match of text.matchAll(re)){const value=match[1];if(/^(?:[a-z]+:|\/\/|#)/i.test(value))continue;const relative=decodeURIComponent(value.split(/[?#]/)[0]);if(!relative)continue;const resolved=path.resolve(relative.startsWith('/')?target:path.dirname(file),relative.startsWith('/')?'.'+relative:relative);if(resolved!==target&&!resolved.startsWith(target+path.sep))throw new Error('Reference escapes release: '+value);if(!fs.existsSync(resolved))missing.push(path.relative(target,file)+': '+value);}}
for(const file of [path.join(target,'index.html'),...data.games.map(g=>path.join(target,g.link)),path.join(target,'storyboard.html')])check(file,fs.readFileSync(file,'utf8'),/(?:src|href|poster)="([^"]+)"/g);
for(const name of fs.readdirSync(target).filter(n=>n.endsWith('.css')))check(path.join(target,name),fs.readFileSync(path.join(target,name),'utf8'),/url\(['"]?([^)'"\s]+)['"]?\)/g);
if(missing.length)throw new Error('Missing release assets:\n'+missing.join('\n'));
console.log('Built and validated complete local site in '+target+'. No public publishing performed.');
