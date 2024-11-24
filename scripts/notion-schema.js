import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function createDatabase() {
  try {
    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: "your_page_id" // Replace with your workspace page ID
      },
      title: [
        {
          type: "text",
          text: { content: "Documentation Pages" }
        }
      ],
      properties: {
        Title: {
          title: {}
        },
        Description: {
          rich_text: {}
        },
        Status: {
          status: {
            options: [
              {
                name: "Draft",
                color: "gray"
              },
              {
                name: "Published",
                color: "green"
              }
            ]
          }
        },
        Category: {
          select: {
            options: [
              { name: "Guide", color: "blue" },
              { name: "Reference", color: "red" },
              { name: "Tutorial", color: "green" },
              { name: "API", color: "yellow" }
            ]
          }
        },
        Order: {
          number: {}
        }
      }
    });
    
    console.log("✅ Database created successfully!");
    console.log("Database ID:", response.id);
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
  }
}

createDatabase();