import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import https from 'https';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '../docs/notion');

const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: TIMEOUT,
  agent: new https.Agent({
    keepAlive: true,
    timeout: TIMEOUT,
    rejectUnauthorized: true
  })
});

const n2m = new NotionToMarkdown({ notionClient: notion });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, retries = MAX_RETRIES) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 5000); // Exponential backoff
        console.log(`⚠️ Attempt ${i + 1}/${retries} failed. Retrying in ${delay/1000}s...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const database = await retry(() => notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    }));
    
    console.log('✅ Connected to database:', database.title[0]?.plain_text);
    console.log('📊 Database properties:', Object.keys(database.properties).join(', '));
    
    const testQuery = await retry(() => notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      page_size: 1
    }));
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.code === 'unauthorized') {
      console.log('🔑 Please verify:');
      console.log('  1. Your integration token is correct');
      console.log('  2. The integration is set to "Public"');
      console.log('  3. The integration has access to the database');
    }
    if (error.code === 'object_not_found') {
      console.log('📝 Please verify:');
      console.log('  1. Your database ID is correct');
      console.log('  2. The database is published');
      console.log('  3. The integration is added to the database');
    }
    return false;
  }
}

async function fetchNotionPages() {
  console.log('📚 Querying database for published pages...');
  
  return retry(async () => {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Status',
        status: {
          equals: 'Published'
        }
      }
    });

    console.log(`✅ Found ${response.results.length} published pages`);
    return response.results;
  });
}

async function convertToMarkdown(pageId) {
  console.log(`📝 Converting page ${pageId} to markdown...`);
  
  return retry(async () => {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    return n2m.toMarkdownString(mdBlocks);
  });
}

async function saveMarkdownFile(fileName, content, frontmatter) {
  await fs.mkdir(DOCS_DIR, { recursive: true });
  
  const fullContent = `---
title: ${frontmatter.title}
description: ${frontmatter.description || ''}
---

${content}`;

  const filePath = path.join(DOCS_DIR, `${fileName}.md`);
  await fs.writeFile(filePath, fullContent);
  console.log(`✅ Saved: ${filePath}`);
}

async function syncNotionContent() {
  console.log('🔄 Starting Notion sync...');
  console.log('📌 Using database:', process.env.NOTION_DATABASE_ID);
  
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.log('❌ Aborting sync due to connection issues');
    return;
  }
  
  try {
    const pages = await fetchNotionPages();
    
    if (pages.length === 0) {
      console.log('⚠️ No published pages found. Please verify:');
      console.log('  1. Your database has pages');
      console.log('  2. Pages have "Published" status');
      return;
    }
    
    for (const page of pages) {
      const title = page.properties.Title?.title[0]?.plain_text;
      if (!title) {
        console.log('⚠️ Skipping page with no title:', page.id);
        continue;
      }
      
      const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      console.log(`📄 Processing: ${title}`);
      
      const markdown = await convertToMarkdown(page.id);
      
      await saveMarkdownFile(fileName, markdown, {
        title,
        description: page.properties.Description?.rich_text[0]?.plain_text || ''
      });
    }
    
    console.log('✅ Sync completed successfully!');
  } catch (error) {
    console.error('❌ Error during sync:', error);
    console.error('Details:', error.message);
    if (error.code) console.error('Error code:', error.code);
  }
}

syncNotionContent();