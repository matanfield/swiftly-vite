# Custom Layout Example

Learn how to create custom layouts in VitePress.

## Basic Layout

```vue
<!-- .vitepress/theme/Layout.vue -->
<template>
  <div class="custom-layout">
    <header>
      <slot name="header" />
    </header>
    <main>
      <Content />
    </main>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>
```