# vitepress

vitepress 是一个静态站点生成器 (SSG, Static Site Generator)

```bash
pnpm add -D vitepress # npm
pnpm vitepress init # npx
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

链接页面

```html
<!-- 省略文件扩展名 -->
[Getting Started](./getting-started)
```

链接非 VitePress 页面, 需要使用完整 URL

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

```vue [ParentDemo]
<script lang="ts" setup></script>
<template>ParentDemo</template>
<style lang="css" scoped></style>
```

```vue [ChildDemo]
<script lang="ts" setup></script>
<template>ChildDemo</template>
<style lang="css" scoped></style>
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
> [!important] | [!tip] | [!note] | [!warning] | [!caution]
> 自定义容器
```

build.sh

```bash
sudo rm -rf /var/www/dist
sudo mv ./dist /var/www/
sudo systemctl restart nginx
sudo chmod -R 755 /var/www/dist
echo "IPv4: http://121.41.121.204"
```
