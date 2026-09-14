# Self-intro

## Blog 内容管理

文章目录位于 `content/blog.json`，Blog 页面会读取它并展示已发布文章。

### Markdown

把文章放在 `content/posts/`，再向 `content/blog.json` 添加一条记录：`source` 使用 `markdown`，`contentPath` 指向该文件的站点绝对路径。

### Notion

1. 创建 Notion integration，把需要发布的页面共享给该 integration。
2. 在 `content/blog.json` 添加文章，使用 `source: "notion"`，并填写 `pageId`、公开原文地址 `notionUrl` 和 `contentPath: "/content/notion-cache/<slug>.md"`。
3. 在本地或部署环境中设置 `NOTION_TOKEN`，运行 `node scripts/sync-notion.mjs`。

同步脚本会把常用 Notion blocks 转成 Markdown 缓存。Token 不会发送到浏览器。提交生成的 `content/notion-cache/*.md` 后，站点仍然可以作为纯静态文件部署。
