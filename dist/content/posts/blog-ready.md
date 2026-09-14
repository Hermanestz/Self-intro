# 技术博客，准备就绪

这个 Blog 使用一份统一的文章目录，同时接收本地 Markdown 和 Notion 笔记。页面负责阅读体验，内容仍然保留在最适合写作的地方。

## 发布一篇 Markdown 文章

1. 在 `content/posts/` 新建一个 `.md` 文件。
2. 在 `content/blog.json` 的 `articles` 数组中加入标题、摘要、日期和文件路径。
3. 将 `source` 设为 `markdown`，将 `published` 设为 `true`。

```json
{
  "slug": "my-new-note",
  "title": "文章标题",
  "summary": "一句话说明文章解决了什么问题。",
  "date": "2026-09-14",
  "source": "markdown",
  "contentPath": "/content/posts/my-new-note.md",
  "published": true
}
```

## 发布一篇 Notion 笔记

在文章目录中把 `source` 设为 `notion`，填写 `pageId`、`notionUrl`，并把 `contentPath` 指向同步缓存文件。运行同步脚本后，Notion 内容会被转换为 Markdown，访问者无需 Notion 账号也能在站内阅读。

> Notion Token 只在本地或部署环境中使用，不会进入浏览器代码。

## 支持的 Markdown

当前阅读器支持标题、段落、粗体、斜体、链接、图片、引用、有序与无序列表、分隔线、行内代码和代码块，适合大多数技术文章。
