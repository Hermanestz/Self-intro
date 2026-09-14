const $=selector=>document.querySelector(selector);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeUrl=value=>{const url=String(value||'').trim();return /^(https?:\/\/|mailto:|\/|#)/i.test(url)?escapeHTML(url):'#';};
function inlineMarkdown(value){
  const code=[];
  let text=String(value).replace(/`([^`]+)`/g,(_,content)=>`\u0000${code.push(`<code>${escapeHTML(content)}</code>`)-1}\u0000`);
  text=escapeHTML(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>`<img src="${safeUrl(url)}" alt="${alt}">`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${safeUrl(url)}"${/^https?:/i.test(url)?' target="_blank" rel="noopener"':''}>${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g,'$1<em>$2</em>');
  return text.replace(/\u0000(\d+)\u0000/g,(_,index)=>code[Number(index)]);
}
function markdownToHTML(markdown){
  const lines=String(markdown).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').split(/\r?\n/);
  let html='',paragraph=[],list=null,quote=[],code=[],language='';
  const flushParagraph=()=>{if(paragraph.length){html+=`<p>${inlineMarkdown(paragraph.join(' '))}</p>`;paragraph=[];}};
  const flushList=()=>{if(list){html+=`<${list.type}>${list.items.map(item=>`<li>${inlineMarkdown(item)}</li>`).join('')}</${list.type}>`;list=null;}};
  const flushQuote=()=>{if(quote.length){html+=`<blockquote>${inlineMarkdown(quote.join(' '))}</blockquote>`;quote=[];}};
  for(const line of lines){
    const fence=line.match(/^```\s*([\w-]*)/);
    if(fence){if(code){html+=`<pre><code${language?` class="language-${escapeHTML(language)}"`:''}>${escapeHTML(code.join('\n'))}</code></pre>`;code=[];language='';}else{flushParagraph();flushList();flushQuote();code.push('');language=fence[1]||'';}continue;}
    if(code.length){code.push(line);continue;}
    const heading=line.match(/^(#{1,3})\s+(.+)/);const bullet=line.match(/^[-*]\s+(.+)/);const ordered=line.match(/^\d+\.\s+(.+)/);const quoted=line.match(/^>\s?(.*)/);
    if(heading){flushParagraph();flushList();flushQuote();const level=heading[1].length+1;html+=`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;continue;}
    if(bullet||ordered){flushParagraph();flushQuote();const type=bullet?'ul':'ol';if(list&&list.type!==type)flushList();if(!list)list={type,items:[]};list.items.push((bullet||ordered)[1]);continue;}
    if(quoted){flushParagraph();flushList();quote.push(quoted[1]);continue;}
    if(/^---+$/.test(line.trim())){flushParagraph();flushList();flushQuote();html+='<hr>';continue;}
    if(!line.trim()){flushParagraph();flushList();flushQuote();continue;}
    paragraph.push(line.trim());
  }
  if(code.length)html+=`<pre><code>${escapeHTML(code.slice(1).join('\n'))}</code></pre>`;
  flushParagraph();flushList();flushQuote();return html;
}
let articles=[];let activeFilter='all';
function renderList(){
  const visible=articles.filter(article=>article.published!==false&&(activeFilter==='all'||article.source===activeFilter));
  $('#blog-list').innerHTML=visible.length?visible.map(article=>`<a class="blog-card" href="/blog.html?slug=${encodeURIComponent(article.slug)}"><span class="meta">${escapeHTML(article.date||'UNDATED')}<br>${escapeHTML(article.source==='notion'?'NOTION':'MARKDOWN')}</span><h2>${escapeHTML(article.title)}</h2><p>${escapeHTML(article.summary||'')}</p><span class="arrow" aria-hidden="true">↗</span></a>`).join(''):'<p class="blog-empty">这个分类下还没有文章。</p>';
}
async function renderArticle(article){
  $('#blog-index').hidden=true;$('#article-view').hidden=false;
  document.title=`${article.title} — Ziming Huang`;
  const sourceName=article.source==='notion'?'NOTION NOTE':'MARKDOWN NOTE';
  $('#article-head').innerHTML=`<span class="article-kicker">${escapeHTML(article.date||'')} / ${sourceName}</span><h1>${escapeHTML(article.title)}</h1><p class="article-summary">${escapeHTML(article.summary||'')}</p>${article.notionUrl?`<a class="article-source-link" href="${safeUrl(article.notionUrl)}" target="_blank" rel="noopener">在 Notion 查看原文 ↗</a>`:''}`;
  if(!article.contentPath){$('#article-body').innerHTML='<p>这篇 Notion 笔记尚未同步到站点。你仍然可以通过上方链接阅读原文。</p>';return;}
  try{const response=await fetch(article.contentPath);if(!response.ok)throw new Error('content unavailable');$('#article-body').innerHTML=markdownToHTML(await response.text());}
  catch{$('#article-body').innerHTML=`<p>文章内容暂时无法载入。${article.notionUrl?'请通过上方 Notion 链接阅读原文。':'请稍后再试。'}</p>`;}
}
async function start(){
  try{const response=await fetch('/content/blog.json');if(!response.ok)throw new Error('manifest unavailable');articles=(await response.json()).articles||[];}
  catch{$('#blog-list').innerHTML='<p class="blog-empty">文章目录暂时无法载入。</p>';return;}
  const slug=new URL(location.href).searchParams.get('slug');const article=articles.find(item=>item.slug===slug&&item.published!==false);
  if(slug&&article){await renderArticle(article);return;}renderList();
}
$('#blog-controls').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(!button)return;activeFilter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));renderList();});
start();
