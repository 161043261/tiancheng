# vitepress

```bash
pnpm init
pnpm add -D vitepress
pnpm exec vitepress init
```

### 路由

默认项目根目录等于源目录

```bash
.                       # 项目根目录 (源目录)
├─ .vitepress           # 配置目录
├─ getting-started.md
└─ index.md
```

可以在 .vitepress/config.mts 中配置源目录

```ts
export default defineConfig({
  // ...
  srcDir: "./src",
});
```

```bash
.                          # 项目根目录
├─ .vitepress              # 配置目录
└─ src                     # 源目录
   ├─ getting-started.md   # -->  /getting-started.html
   └─ index.md             # -->  /index.html (可以通过 / 访问)
```

链接 vitepress 页面

```html
<!-- 可以省略文件扩展名 -->
[Getting Started](./getting-started)
```

链接非 vitepress 页面, 需要使用完整 URL

```html
<!-- 在新标签页中打开 -->
[github](https://www.github.com/)
<!-- 在本标签页中打开 -->
[github](https://www.github.com/){target="_self"}
```

### vitepress 的 markdown 拓展

- 行高亮 `js{2,5-8}`, `// [!code highlight]`
- 警告和错误 `// [!code warning]`, `// [!code error]`
- 行聚焦 `// [!code focus]`, `// [!code focus::<lines>]`
- diff `// [!code ++]`, `// [!code --]`
- 代码组

````md
::: code-group

```vue [ParentDemo.vue]
<script lang="ts" setup>
</script>

<template>ParentDemo</template>

<style lang="css" scoped>
</style>
```

```vue [ChildDemo.vue]
<script lang="ts" setup>
</script>

<template>ChildDemo</template>

<style lang="css" scoped>
</style>
```

:::
````

````md
```js{2}
export default {
  msg: 'highlighted!'
}
```
````

```md
> [!caution]
> [!important]
> [!note]
> [!tip]
> [!warning]
> 
> 自定义容器
```
