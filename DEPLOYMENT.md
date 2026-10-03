# Cloudflare Pages 发布

项目名：`grimpoteuthis`。生产分支：`main`。公开地址：<https://grimpoteuthis.pages.dev/>。

网站是纯静态页面，上传 `dist/` 即可。源码在 GitHub，当前采用 Direct Upload；Git 推送不会自动更新线上网站。

## 更新网站

先提交准备发布的修改，再检查并构建：

```sh
npm run check
```

首次使用这台电脑时，登录 Cloudflare：

```sh
npx wrangler login
```

上传到现有项目的生产环境：

```sh
npx wrangler pages deploy dist --project-name grimpoteuthis --branch main
```

发布成功后检查首页、六个详情页、新增画作的大图与邮箱。也可在 Cloudflare 控制台的项目部署列表查看状态、预览版本和回滚。

## 在控制台上传

也可将构建后的 `dist/` 文件夹拖入现有 Pages 项目的部署页面。不要上传整个源码仓库或作者的原稿目录。

## 更换网址

`site.config.json` 的 `publicOrigin` 已设置为当前生产地址。更换网址后更新它，再构建和发布；也可以用 `PORTFOLIO_SITE_ORIGIN` 临时覆盖。该设置用于生成规范网址和分享卡片的绝对图片地址。

以后绑定自有域名，需要先持有该域名，再在 Pages 项目中添加 Custom domain，并按控制台提示配置 DNS。`pages.dev` 是 Cloudflare 提供的免费子域名。

官方说明：[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) · [自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。
