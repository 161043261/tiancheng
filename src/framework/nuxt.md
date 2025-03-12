# Nuxt 入门

- nuxt.config.ts 中的 runtimeConfig: 需要在构建后使用环境变量指定的私有 (服务器可用) 或公有 (服务器和客户端都可用) 令牌
- app.config.ts 中的 appConfig: 构建时已确定的公有令牌, 例如页面的标题, 主题等

## 组件

在 components/ 目录下创建组件, 自动隐式导入

## 页面

在 pages/ 目录下创建页面, pages/ 目录下的 vue 文件自动绑定路由

## 路由 (文件路由)

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

### `<NuxtLink>` 标签

类似 vue-router 的 `<RouterLink>` 标签

`<NuxtLink>` 渲染一个 `<a>` 标签, 将 href 属性设置为页面的路由; 使用 JS 更新浏览器 URL 以实现路由导航, 这样可以避免整页刷新, 同时允许动画效果

Nuxt 会预取 (prefetch) 组件和生成的页面, 加快路由导航速度

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

> [!warning]
>
> - `<NuxtLink>` 类似 Vue 的 `<RouterLink>`, 用于路由导航
> - `<NuxtPage>` 类似 Vue 的 `<RouterView>`, 用于渲染当前路由对应的页面

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

### 字体文件

字体文件放在 /public 目录下, 可以在样式表中使用 url 引入

/assets/css/global.css

```css
@font-face {
  font-family: 'Iosevka Web';
  // 避免字体闪烁
  font-display: swap;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  src: url('/Iosevka-Regular.woff2') format('woff2');
}
```

## 样式

### 在组件中导入样式

pages/index.vue

```vue
<script lang="ts" setup>
// 静态导入, 兼容服务器端
import "~/assets/css/style.css";
// 动态导入, 不兼容服务器端
import("~/assets/css/style.css");
</script>
```

### 全局样式

nuxt.config.ts

```ts
export default defineNuxtConfig({
  css: ["~/assets/css/global.css"],
});
```

### animate.css

::: code-group

```bash [安装]
pnpm install animate.css
```

```vue [在组件中使用]
<!-- 在 script 标签中使用 -->
<script lang="ts" setup>
/** 打包的 HTML 文件将内联 animated.css, 不会分包  */
import "animate.css";
</script>

<!-- 在 style 标签中使用 -->
<style lang="css">
/** 打包的 HTML 文件将内联 animated.css, 不会分包  */
@import url("animate.css");
</style>
```

```ts [在 nuxt.config.ts 中全局使用]
/** 打包的所有 HTML 文件将内联 animated.css, 不会分包  */
export default defineNuxtConfig({
  css: ["animate.css"],
});
```

:::

### 外部样式表 (CDN)

`nuxt.config.ts`

```ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
        },
      ],
    },
  },
});
```

使用 useHead 组合式函数, 动态导入外部样式表

```ts
useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
    },
  ],
});
```

### 使用预处理器

`pnpm install sass` 安装 Sass 预处理器

::: code-group

```vue [在组件中使用]
<style lang="scss">
// 打包的 HTML 文件将内联 global.scss, 不会分包
@use "~/assets/scss/global.scss";
</style>
```

```ts [在 nuxt.config.ts 中全局使用]
// 打包的所有 HTML 文件将内联 global.scss, 不会分包
export default defineNuxtConfig({
  css: ["~/assets/scss/global.scss"],
});
```

:::

### Vue 单文件组件 (SFC)

::: code-group

```vue [ref/reactive]
<script setup lang="ts">
const isActive = ref(true);
const hasError = ref(false);
const classObject = reactive({
  active: true,
  "text-danger": false,
});
</script>

<template>
  <div class="static" :class="{ active: isActive, 'text-danger': hasError }">
    Nuxt
  </div>
  <div :class="classObject">Nuxt</div>
</template>
```

```vue [computed 计算属性]
<script setup lang="ts">
const isActive = ref(true);
const error = ref<{ type: string } | null>(null);

const classObject = computed(() => ({
  active: isActive.value && !error.value,
  "text-danger": error.value && error.value.type === "fatal",
}));
</script>

<template>
  <div :class="classObject">Nuxt</div>
</template>
```

```vue [动态类名数组]
<script setup lang="ts">
const isActive = ref(true);
const errorClass = ref("text-danger");
</script>

<template>
  <div :class="[{ active: isActive }, errorClass]">Nuxt</div>
</template>
```

```vue [v-bind 动态样式]
<script setup lang="ts">
const color = ref("#ff0000");
</script>

<template>
  <div class="text">Nuxt</div>
</template>

<style>
.text {
  color: v-bind(color);
}
</style>
```

:::

### Vue `<style>` 标签的 module 属性

```vue
<template>
  <p :class="$style.red">This should be red</p>
</template>

<style lang="css" module>
.red {
  color: #ff0000;
}
</style>
```

### 使用 PostCSS

Nuxt 内置了 PostCSS

## SEO 和 meta

SSR 对 SEO 友好

## 过渡效果

基于 Vue 的 `<Transition>`

### 页面过渡

- 在 `nuxt.config.ts` 中开启页面过渡, 为所有 /pages/\* 页面应用过渡效果
- 内置的过渡效果名 page, 应用于所有页面

```ts
export default defineNuxtConfig({
  app: {
    // 内置的过渡效果名 page, 应用于所有页面
    pageTransition: { name: "page", mode: "out-in" },
  },
});
```

编写页面过渡效果的样式

::: code-group

```vue [app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="css">
.page-enter-active,
.page-leave-active {
  transition: all 0.5s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0; /** 完全透明  */
  filter: blur(1rem); /** 页面模糊, 模糊半径 1rem, 1rem 通常是 16px  */
}
</style>
```

```vue [pages/index.vue]
<template>
  <div>
    <h1>Index page</h1>
    <NuxtLink to="/about">About page</NuxtLink>
  </div>
</template>
```

```vue [pages/about.vue]
<template>
  <div>
    <h1>About page</h1>
    <NuxtLink to="/">Index page</NuxtLink>
  </div>
</template>
```

:::

> - 可以通过 definePageMeta 宏函数指定 pageTransition 属性, 单独指定某个页面的页面过渡效果
> - 可以通过 definePageMeta 宏函数指定 layoutTransition 属性, 单独指定某个页面的布局过渡效果

::: code-group

```vue [app.vue]
<template>
  <NuxtPage />
</template>

<style>
/* 过渡效果名: rotate */
.rotate-enter-active,
.rotate-leave-active {
  transition: all 0.5s;
}
.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  transform: rotate3d(1, 1, 1, 15deg);
}
</style>
```

```vue [pages/about.vue]
<script setup lang="ts">
definePageMeta({
  // 可以通过 definePageMeta 宏函数指定 pageTransition 属性, 单独指定某个页面的页面过渡效果
  pageTransition: {
    name: "rotate", // 该页面使用 rotate 页面过渡效果 (在 app.vue 中定义)
  },
});
</script>
```

:::

### 布局过渡

- 在 `nuxt.config.ts` 中开启布局过渡, 为所有 /layouts/\* 布局应用过渡效果
- 内置的过渡效果名 layout, 应用于所有布局

```ts
export default defineNuxtConfig({
  app: {
    layoutTransition: { name: "layout", mode: "out-in" },
  },
});
```

编写布局过渡效果的样式

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="css">
.layout-enter-active,
.layout-leave-active {
  transition: all 0.5s;
}

.layout-enter-from,
.layout-leave-to {
  filter: grayscale(1);
}
</style>
```

备注: 可以使用 setPageLayout 函数动态更改布局

> - 可以通过 definePageMeta 宏函数指定 pageTransition 属性, 单独指定某个页面的页面过渡效果
> - 可以通过 definePageMeta 宏函数指定 layoutTransition 属性, 单独指定某个页面的布局过渡效果

```vue
<script setup lang="ts">
definePageMeta({
  // 可以通过 definePageMeta 宏函数指定 layoutTransition 属性, 单独指定某个页面的布局过渡效果
  layout: "lightblue", // 该页面使用 lightblue 布局
  layoutTransition: {
    name: "fade", // 该页面使用 fade 布局过渡效果 (在 app.vue 中定义)
  },
});
</script>
```

> [!warning]
>
> 1. 只更改页面, 不更改布局: 触发页面过渡效果
> 2. 只更改布局, 不更改页面: 触发布局过渡效果
> 3. 布局打开/关闭 `definePageMeta({ layout: false })` 或 `setPageLayout(false)` 时, 不会触发布局过渡效果
> 4. 同时更改页面和布局: 只会触发布局过渡效果
