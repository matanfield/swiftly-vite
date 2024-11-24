import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// Dynamically generate sidebar for Notion content
function getNotionSidebar() {
  const notionDir = path.join(__dirname, '../notion')
  let notionPages = []
  
  try {
    if (fs.existsSync(notionDir)) {
      const files = fs.readdirSync(notionDir)
      notionPages = files
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          text: file.replace('.md', '').split('-').map(
            word => word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          link: `/notion/${file.replace('.md', '')}`
        }))
    }
  } catch (error) {
    console.error('Error reading Notion directory:', error)
  }

  return notionPages
}

export default defineConfig({
  lang: 'en-US',
  title: 'VitePress',
  description: 'Vite & Vue powered static site generator.',

  themeConfig: {
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/configuration' },
      { text: 'Examples', link: '/examples/markdown' },
      { text: 'Notion Content', link: '/notion/' },
      { text: 'About', link: '/about/team' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Writing',
          collapsed: false,
          items: [
            { text: 'Markdown', link: '/guide/markdown' },
            { text: 'Asset Handling', link: '/guide/asset-handling' },
            {
              text: 'Frontmatter',
              link: '/guide/frontmatter',
              collapsed: true,
              items: [
                { text: 'Basic Usage', link: '/guide/frontmatter-basic' },
                { text: 'Advanced', link: '/guide/frontmatter-advanced' }
              ]
            }
          ]
        }
      ],
      '/notion/': [
        {
          text: 'Notion Content',
          items: getNotionSidebar()
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          collapsed: false,
          items: [
            { text: 'Site Config', link: '/reference/configuration' },
            { text: 'Frontmatter Config', link: '/reference/frontmatter' },
            { text: 'Runtime API', link: '/reference/runtime-api' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Markdown Examples', link: '/examples/markdown' },
            { text: 'Runtime API Examples', link: '/examples/api' },
            {
              text: 'Theme Customization',
              collapsed: true,
              items: [
                { text: 'Custom Layout', link: '/examples/custom-layout' },
                { text: 'Custom Theme', link: '/examples/custom-theme' }
              ]
            }
          ]
        }
      ]
    }
  }
})