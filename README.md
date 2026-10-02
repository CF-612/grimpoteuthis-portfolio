# 烟灰蛸 · 个人作品集

一个围绕坠落、云朵和手绘素材设计的个人网站，展示游戏策划、人物美术和绘画作品。包含入场动画、六个游戏详情页、画廊和云下邮箱，支持桌面与手机布局、键盘操作和减少动态效果设置。

## 本地运行

安装 Node.js 20 或更新版本。项目没有第三方运行依赖，无需安装依赖包。

```sh
git clone https://github.com/CF-612/grimpoteuthis-portfolio.git
cd grimpoteuthis-portfolio
npm run build
npm start
```

打开 <http://localhost:4173/>。预览服务监听本机所有网卡，可用于局域网测试；端口可通过环境变量 `PORT` 修改。

```sh
npm run check
```

检查会构建网站，并验证六个作品详情页、标题、说明、素材引用、大图格式和公开文件许可。它不代替浏览器中的视觉和互动验收，最近的验收记录见 [RELEASE_REVIEW.md](RELEASE_REVIEW.md)。

## 修改内容

| 位置 | 用途 |
| --- | --- |
| `design/index-v2.html` | 首页唯一可编辑模板 |
| `design/data.js` | 游戏与画廊数据；新增画作时加入数组，数量由数据决定 |
| `design/games/*.html` | 六个作品的详情页正文 |
| `design/assets/` | 网站使用的图片、视频和字体子集 |
| `design/design.js` | 画廊、文件夹、邮箱和滚动交互 |
| `design/intro.js`、`intro-flow.js` | 入场动画及其状态流程 |
| `design/*.css` | 主样式及逐步调整的样式层；加载顺序由模板确定 |
| `build-local-release.cjs` | 构建及资源校验 |

每次修改后重新构建。`design/index.html` 和 `dist/` 是生成文件，不提交到仓库。PNG 原稿、策划文档、备份和历史验收截图保留在作者本地；仓库包含运行网站所需的展示素材。

字体已裁剪为当前页面需要的字符。新增文字后，如果出现缺字，需要更新对应字体子集，或使用具有相应字符和许可的字体替换。

## 公开网址与分享卡片

仓库公开不代表网站已经上线。确定网址后，在 `site.config.json` 的 `publicOrigin` 填入完整网址（也支持子目录），再构建；也可设置环境变量 `PORTFOLIO_SITE_ORIGIN`。构建会生成绝对图片地址、规范网址和分享信息。未配置时保留相对地址，便于本地预览。

实际部署的是 `dist/`。公开分享卡片需要在最终网址上另行验证。

## 许可

- 网站代码（HTML、CSS、JavaScript 与构建脚本）使用 [MIT](LICENSE)。
- 绘画、人物、图标、截图、视频及其他展示素材保留相应作者的版权。允许查看、克隆和在本地运行本项目；单独转载、改编、销售或用于自己的公开网站，需要获得相关权利人的许可。
- 字体按各自许可使用，详见 [ASSET_LICENSE.md](ASSET_LICENSE.md)。MIT 不覆盖素材和字体。

如果复用网站代码，请替换成自己的作品、联系方式和品牌素材。
