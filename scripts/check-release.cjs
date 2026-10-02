const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(root, 'build-local-release.cjs')], {
  cwd: root, stdio: 'inherit'
});
const read = name => fs.readFileSync(path.join(root, 'dist', name), 'utf8');
const scope = { window: {} };
vm.runInNewContext(read('data.js'), scope);
const { games, arts } = scope.window.portfolioData;
const homepage = read('index.html');
assert.match(homepage, /<h1\b[^>]*>[\s\S]*?visually-hidden[^>]*>烟灰蛸/);
assert.equal(new Set(games.map(game => game.id)).size, games.length);
for (const game of games) {
  const page = read(game.link);
  assert.ok(page.includes(`<title>${game.name} · 烟灰蛸</title>`), game.link);
  assert.match(page, /<meta name="description" content="[^"]+"/);
  assert.match(page, /<meta property="og:image" content="[^"]+"/);
  assert.match(page, /href="\.\.\/index\.html(?:\?from=detail)?#games"/);
}
for (const art of arts) {
  assert.ok(art.original.endsWith('.webp'), art.original);
  assert.ok(fs.existsSync(path.join(root, 'dist', art.original)), art.original);
}
for (const name of ['design.js', 'intro.js', 'intro-flow.js', 'data.js']) {
  new vm.Script(read(name), { filename: name });
}
const fonts = fs.readdirSync(path.join(root, 'dist/assets/fonts'));
assert.ok(!fonts.includes('kocho.otf') && !fonts.includes('intro-v11.ttf'));
assert.ok(fonts.includes('licenses'));
console.log(`检查通过：${games.length} 个作品详情页，${arts.length} 张画作，元信息、返回导航、脚本语法及字体许可文件。`);
