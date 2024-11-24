# Configuration Reference

## Site Config

You can configure your site by editing `.vitepress/config.ts`

::: details View Full Config Options
```ts
export default {
  title: string
  description: string
  themeConfig: {
    nav: NavItem[]
    sidebar: Sidebar
  }
}
```
:::

## Theme Config

::: tip
Theme config helps you customize the look and feel
:::

### Sidebar Options

- `collapsed`: Toggle section collapse
- `items`: Define nested pages