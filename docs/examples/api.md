# Runtime API Examples

Practical examples of VitePress Runtime API usage.

## Data Usage

```vue
<script setup>
import { useData } from 'vitepress'

const { page } = useData()
</script>

<template>
  <h1>{{ page.title }}</h1>
</template>
```

## Route Usage

```vue
<script setup>
import { useRoute } from 'vitepress'

const route = useRoute()
</script>
```