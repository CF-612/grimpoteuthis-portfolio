// Rebuild with: node scripts/render-share-cover.cjs /absolute/path/to/sharp
// Uses the site's existing artwork and lettering; sharp is an authoring tool only.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.argv[2] || 'sharp');
const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'design/assets');
const svg = body => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${body}</svg>`);
const fontfile = path.join(assets, 'fonts/seto.ttf');

async function label(text, size, color) {
  return sharp({ text: { text: `<span foreground="${color}">${text}</span>`, font: `SetoFont ${size}`, fontfile, rgba: true, dpi: 72 } }).png().toBuffer();
}

(async () => {
  const background = svg(`
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="1" y2=".5">
        <stop stop-color="#fff4df"/><stop offset=".48" stop-color="#f6e0dc"/><stop offset="1" stop-color="#ddc7e1"/>
      </linearGradient>
      <radialGradient id="light" cx=".1" cy=".4" r=".8"><stop stop-color="#fff9ea" stop-opacity=".9"/><stop offset="1" stop-color="#fff9ea" stop-opacity="0"/></radialGradient>
    </defs>
    <path fill="url(#paper)" d="M0 0H1200V630H0Z"/>
    <path fill="url(#light)" d="M0 0H1200V630H0Z"/>
    <g fill="none" stroke="#fff5ed" stroke-width="1.5" opacity=".65">
      <ellipse cx="931" cy="315" rx="243" ry="312" transform="rotate(24 931 315)"/>
      <path d="M584 560Q907 405 1210 540"/>
    </g>
    <path d="M61 117H89M61 506H509" stroke="#a78392" stroke-width="1" opacity=".55"/>
    <g fill="#fff4da"><path d="M1040 62Q1042 81 1060 84Q1042 87 1040 105Q1037 87 1019 84Q1037 81 1040 62Z"/><path d="M575 139Q577 150 588 152Q577 154 575 165Q573 154 562 152Q573 150 575 139Z"/></g>
  `);
  const wordmark = await sharp(path.join(assets, 'wordmark-hero-v14.svg')).resize(448).png().toBuffer();
  const character = await sharp(path.join(assets, 'authored/hero-painted-v11.webp')).resize(720).png().toBuffer();
  const cloud = await sharp(path.join(assets, 'cloud-puff-1.svg')).resize(260).png().toBuffer();
  const mascot = await sharp(path.join(assets, 'octopus.png')).resize(37).png().toBuffer();
  const layers = [
    { input: cloud, left: 985, top: 488 },
    { input: character, left: 560, top: 35 },
    { input: mascot, left: 61, top: 57 },
    { input: await label('PERSONAL PORTFOLIO', 17, '#8c6d7d'), left: 112, top: 67 },
    { input: await label('GRIMPOTEUTHIS UMBELLATA', 14, '#957789'), left: 103, top: 111 },
    { input: wordmark, left: 60, top: 173 },
    { input: await label('游戏策划与绘画作品集', 28, '#765166'), left: 70, top: 408 },
    { input: await label('grimpoteuthis.pages.dev', 17, '#947286'), left: 63, top: 528 }
  ];
  // Clip individual artwork to the card before compositing, preserving an opaque canvas.
  for (const layer of layers) {
    const info = await sharp(layer.input).metadata();
    const width = Math.min(info.width, 1200 - layer.left);
    const height = Math.min(info.height, 630 - layer.top);
    layer.input = await sharp(layer.input).extract({ left: 0, top: 0, width, height }).png().toBuffer();
  }
  const output = path.join(assets, 'authored/share-cover-v1.jpg');
  await sharp(background).composite(layers).flatten({ background: '#fff9ef' }).jpeg({ quality: 93, chromaSubsampling: '4:4:4' }).toFile(output);
  console.log(`Created ${output} (${fs.statSync(output).size} bytes)`);
})().catch(error => { console.error(error); process.exitCode = 1; });
