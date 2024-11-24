# Custom Theme Example

Create your own VitePress theme.

## Theme Structure

```
.vitepress/theme/
├── index.ts        # theme entry
├── Layout.vue      # layout component
└── components/     # other components
```

## Theme Configuration

```ts
// .vitepress/theme/index.ts
import Layout from './Layout.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    // register global components
  }
}
```