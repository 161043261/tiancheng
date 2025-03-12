# Nuxt 入门

runtimeConfig: 需要在构建后使用环境变量指定的私有 (服务器可用) 或公有 (服务器和客户端都可用) 令牌
appConfig: 构建时已确定的公有令牌, 例如页面的标题, 主题等

## 组件

在 components/ 目录下创建组件, 自动隐式导入

## 页面

在 pages/ 目录下创建页面, pages/ 目录下的 vue 文件自动绑定路由

### 文件路由

::: code-group

```txt [文件路由]
.
├── pages/
    ├── about.vue
    ├── index.vue
    └── posts/
        └── [id].vue
```

```json [生成的路由文件]
{
  "routes": [
    {
      "path": "/about",
      "component": "pages/about.vue"
    },
    {
      "path": "/",
      "component": "pages/index.vue"
    },
    {
      "path": "/posts/:id",
      "component": "pages/posts/[id].vue"
    }
  ]
}
```

:::

### NuxtLink

类似 vue-router 的 `<RouterView>`

`<NuxtLink>` 渲染一个 `<a>` 标签, 将 href 属性设置为页面的路由; 使用 JS 更新浏览器 URL 以实现路由导航, 这样可以避免整页刷新, 同时允许动画效果

Nuxt 会预取 prefetch 组件和生成的页面, 加快路由导航速度

```vue
<NuxtLink to="/about">About</NuxtLink>
```

### 路由参数

和 vue-router 相同

```ts
const route = useRoute();
console.log(route.params); // URL 路径参数
console.log(route.query); // URL 查询参数
```

### 路由中间件

类似 vue-router 导航前置守卫

有 3 种路由中间件

1. 匿名 (或内联) 路由中间件, 直接写在页面中
2. 命名路由中间件, 放在 /middleware 目录中, 例如 `auth.ts`, 在页面中使用时, **自动隐式导入, 异步加载**
3. 全局路由中间件, 放在 /middleware 目录中, 文件名后缀 `.global`, 例如 `auth.global.ts`

> [!important]
> /middleware 目录下的文件 **自动隐式导入, 异步加载**
> 路由中间件名: 根据 ts 文件名转换为 kebab-case 烤串命名, 例如 `someMiddleware.ts` 对应的路由中间件名 `some-middleware`

::: code-group

```ts [middleware/checkAuth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  if (isAuthenticated() === false) {
    return navigateTo("/login");
  }
});
```

```vue [pages/dashboard.vue]
<script setup lang="ts">
definePageMeta({
  middleware: "check-auth",
});
</script>
```

:::

### 路由校验

Nuxt 通过 definePageMeta() 宏函数的 validate 属性提供路由校验

`/pages/posts/[id].vue`

```vue
<script setup lang="ts">
definePageMeta({
  // 接受一个 route 参数, 返回一个 bool 值表示路由是否有效
  validate: async (route) => {
    // 如果返回 false, 并且未找到其他匹配项, 将导致 404 错误
    // 也可以返回一个有 statusCode/statusMessage 属性的对象,
    // 以立即响应错误 (不会继续寻找其他匹配项)
    return /^\d+$/.test(route.params.id);
  },
});
</script>
```

## 布局

在 layouts/ 目录下创建布局, 布局是页面的包装器, /layouts/default.vue 是默认的布局

> [!important]
> /layouts 目录下的文件 **自动隐式导入, 异步加载**
> 布局名: 根据 ts 文件名转换为 kebab-case 烤串命名, 例如 `someLayout.ts` 对应的布局名 `some-layout`

### 在 app.vue 中开启布局

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

### 使用布局

- 设置 `<NuxtLayout>` 的 name 属性
- 在页面中, 使用 definePageMeta 宏函数指定 layout 布局, 如果没有指定布局, 则使用 /layouts/default.vue 默认布局
- 如果 app 只有一个布局, 建议直接使用 app.vue 代替 layout
- 布局必须有一个根元素

默认布局 /layouts/default.vue

```vue
<template>
  <!-- 布局必须有一个根元素 -->
  <div>
    <header>所有页面共享的默认布局内容</header>
    <!-- 页面内容 -->
    <slot />
  </div>
</template>
```

| 文件名                                 | 布局名          |
| -------------------------------------- | --------------- |
| ~/layouts/desktop/default.vue          | desktop-default |
| ~/layouts/desktop-base/base.vue        | desktop-base    |
| ~/layouts/desktop/index.vue            | desktop         |
| ~/layouts/desktop/DesktopDefault.vue   | desktop-default |
| ~/layouts/desktop-base/DesktopBase.vue | desktop-base    |
| ~/layouts/desktop/Desktop.vue          | desktop         |

### 动态更改布局

使用 setPageLayout 函数动态更改布局

```vue
<script setup lang="ts">
definePageMeta({
  layout: false, // 默认不使用布局
});

function enableCustomLayout() {
  setPageLayout("custom"); // 开启 custom 布局
}
</script>

<template>
  <div>
    <button @click="enableCustomLayout">开启 custom 布局</button>
  </div>
</template>
```

### 覆盖默认的布局内容

如果在页面中使用 `<NuxtLayout>`, 请确保他不是根元素 (或者[禁用布局/页面过渡效果](https://nuxt.com.cn/docs/getting-started/transitions#disable-transitions))

::: code-group

```vue [layouts/custom.vue]
<template>
  <div>
    <header>
      <slot name="header">默认的页眉内容</slot>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
```

```vue [pages/index.vue]
<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>

<template>
  <div>
    <NuxtLayout name="custom">
      <template #header>覆盖默认的页眉内容</template>
    </NuxtLayout>
  </div>
</template>
```

:::

## 资源

- /public 目录中的资源, vite/webpack 不会处理
- /assets 目录中的资源, vite/webpack 会处理, 可以使用 ~/@ 别名

### 全局样式

nuxt.config.ts

```ts
// assets/_global.scss
export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/_global.scss" as *;',
        },
      },
    },
  },
});
```
