import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(join(root,'content','blog.json'),'utf8'));
const token=process.env.NOTION_TOKEN;
const notionArticles=(manifest.articles||[]).filter(article=>article.source==='notion'&&article.pageId);
if(!notionArticles.length){console.log('No Notion articles configured.');process.exit(0);}
if(!token)throw new Error('NOTION_TOKEN is required to sync Notion articles.');

const richText=items=>(items||[]).map(item=>{
  let text=item.plain_text||'';const marks=item.annotations||{};
  if(marks.code)text=`\`${text}\``;if(marks.bold)text=`**${text}**`;if(marks.italic)text=`*${text}*`;
  return item.href?`[${text}](${item.href})`:text;
}).join('');
async function children(blockId){let cursor;const blocks=[];do{const url=new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);url.searchParams.set('page_size','100');if(cursor)url.searchParams.set('start_cursor',cursor);const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`,'Notion-Version':'2022-06-28'}});if(!response.ok)throw new Error(`Notion API ${response.status}: ${await response.text()}`);const page=await response.json();blocks.push(...page.results);cursor=page.has_more?page.next_cursor:null;}while(cursor);return blocks;}
async function blockToMarkdown(block){const value=block[block.type]||{};const text=richText(value.rich_text);let line='';
  if(block.type==='paragraph')line=text;
  else if(block.type==='heading_1')line=`# ${text}`;
  else if(block.type==='heading_2')line=`## ${text}`;
  else if(block.type==='heading_3')line=`### ${text}`;
  else if(block.type==='bulleted_list_item')line=`- ${text}`;
  else if(block.type==='numbered_list_item')line=`1. ${text}`;
  else if(block.type==='to_do')line=`- [${value.checked?'x':' '}] ${text}`;
  else if(block.type==='quote'||block.type==='callout')line=`> ${text}`;
  else if(block.type==='code')line=`\`\`\`${value.language||''}\n${text}\n\`\`\``;
  else if(block.type==='divider')line='---';
  else if(block.type==='image'){const url=value.external?.url||value.file?.url;if(url)line=`![${escapeTitle(value.caption)}](${url})`;}
  else if(block.type==='bookmark')line=`[${value.url}](${value.url})`;
  if(block.has_children){const nested=await children(block.id);const nestedText=(await Promise.all(nested.map(blockToMarkdown))).filter(Boolean).join('\n\n');line=[line,nestedText].filter(Boolean).join('\n\n');}
  return line;
}
const escapeTitle=value=>richText(value).replace(/[\[\]]/g,'');
await mkdir(join(root,'content','notion-cache'),{recursive:true});
for(const article of notionArticles){const blocks=await children(article.pageId);const markdown=(await Promise.all(blocks.map(blockToMarkdown))).filter(Boolean).join('\n\n');const target=join(root,'content','notion-cache',`${article.slug}.md`);await writeFile(target,`${markdown}\n`,'utf8');console.log(`Synced ${article.slug} -> ${target}`);}
