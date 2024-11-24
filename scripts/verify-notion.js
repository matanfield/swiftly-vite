import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const MAX_RETRIES = 3;
const TIMEOUT = 30000; // Increased timeout to 30 seconds

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: TIMEOUT
});

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
        console.log(chalk.yellow(`⚠️ Attempt ${i + 1}/${retries} failed. Retrying in ${delay/1000}s...`));
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

async function verifySetup() {
  console.log(chalk.blue('🔍 Verifying Notion setup...'));

  try {
    // Verify environment variables
    if (!process.env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY is not set in .env file');
    }
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID is not set in .env file');
    }

    // Test basic connection
    console.log(chalk.gray('Testing connection...'));
    const user = await retry(() => notion.users.me());
    console.log(chalk.green('✓ Integration connection successful'));
    console.log(chalk.gray(`  Bot name: ${user.name}`));
    console.log(chalk.gray(`  Workspace name: ${user.bot.workspace_name}`));

    // Test database access
    console.log(chalk.gray('Testing database access...'));
    const database = await retry(() => notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    }));
    
    console.log(chalk.green('✓ Database access successful'));
    console.log(chalk.gray(`  Database name: ${database.title[0]?.plain_text}`));
    
    // Verify required properties
    const properties = database.properties;
    const requiredProps = ['Title', 'Description', 'Status'];
    const missingProps = requiredProps.filter(prop => !properties[prop]);
    
    if (missingProps.length > 0) {
      console.log(chalk.red('✗ Missing required properties:'), missingProps.join(', '));
      console.log(chalk.yellow('\nPlease add the following properties to your database:'));
      console.log(chalk.gray(`
Required Properties:
- Title (title type)
- Description (rich text type)
- Status (status type with options: Draft, Published)
      `));
    } else {
      console.log(chalk.green('✓ All required properties present'));
    }

    // Test query access
    console.log(chalk.gray('Testing query access...'));
    const pages = await retry(() => notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      page_size: 1
    }));
    
    console.log(chalk.green('✓ Query access successful'));
    console.log(chalk.gray(`  Found ${pages.results.length} pages`));

    console.log(chalk.green('\n✨ Verification completed successfully!'));

  } catch (error) {
    console.log(chalk.red('✗ Setup verification failed'));
    
    if (error.code === 'unauthorized' || error.message.includes('API token')) {
      console.log(chalk.yellow('\nPossible issues:'));
      console.log(chalk.gray(`
1. Invalid or expired integration token
   - Go to https://www.notion.so/my-integrations
   - Select your integration
   - Make sure it's set to "Public" integration
   - Copy the new "Internal Integration Token"
   - Update NOTION_API_KEY in your .env file

2. Database not shared with integration
   - Open your Notion database
   - Click "Share" in the top right
   - Click "Add people, emails, groups, or integrations"
   - Search for your integration name
   - Click "Invite"

3. Database permissions
   - Ensure the database is published
   - Verify the integration has read access
      `));
    }
    
    console.error(chalk.red('\nError details:'), error.message);
    process.exit(1);
  }
}

verifySetup();