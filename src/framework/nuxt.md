# Nuxt 基础

- nuxt.config.ts 中的 runtimeConfig: 需要在构建后使用环境变量指定的私有 (服务器可用) 或公有 (服务器和客户端都可用) 令牌
- app.config.ts 中的 appConfig: 构建时已确定的公有令牌, 例如页面的标题, 主题等

## 组件

在 components/ 目录下创建组件, 自动隐式导入

## 页面

在 pages/ 目录下创建页面, pages/ 目录下的 vue 文件自动绑定路由

## 路由 (文件路由)

::: code-group

```bash [文件路由]
.
└── pages/
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

在 `nuxt.config.ts` 中开启页面过渡, 为所有页面应用过渡效果

```ts
export default defineNuxtConfig({
  app: {
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
/* 前缀是 page */
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

可以通过 definePageMeta 宏函数指定 pageTransition 属性, 设置特定路由的页面过渡效果, 可以覆盖全局页面过渡效果

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
  // 可以通过 definePageMeta 宏函数指定 pageTransition 属性
  // 设置特定路由的页面过渡效果, 可以覆盖全局页面过渡效果
  pageTransition: {
    name: "rotate", // 该路由使用 rotate 页面过渡效果
  },
});
</script>
```

:::

### 布局过渡

在 `nuxt.config.ts` 中开启布局过渡, 为所有布局应用过渡效果

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
/* 前缀是 layout */
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

可以通过 definePageMeta 宏函数指定 layoutTransition 属性, 设置特定路由的布局过渡效果, 可以覆盖全局布局过渡效果

```vue
<script setup lang="ts">
definePageMeta({
  // 可以通过 definePageMeta 宏函数指定 layoutTransition 属性
  // 设置特定路由的布局过渡效果, 可以覆盖全局布局过渡效果
  layout: "lightblue", // 该路由使用 lightblue 布局
  layoutTransition: {
    name: "fade", // 该路由使用 fade 布局过渡效果
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

### 全局设置过渡效果

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: {
      // css 类名
      // .fade-enter-from .fade-enter-active .fade-enter-to
      // .fade-leave-from .fade-leave-active .fade-leave-to
      name: "fade",
      mode: "out-in", // 默认值
    },
    layoutTransition: {
      // css 类名
      // .slide-enter-from .slide-enter-active .slide-enter-to
      // .slide-leave-from .slide-leave-active .slide-leave-to
      name: "slide",
      mode: "out-in", // 默认值
    },
  },
});
```

在 app.vue 中使用 `<NuxtPage>` 时，可以传递过渡效果对象, 作为组件属性, 以设置全局过渡效果

```vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage
        :transition="{
          // css 类名
          // .bounce-enter-from .bounce-enter-active .bounce-enter-to
          // .bounce-leave-from .bounce-leave-active .bounce-leave-to
          name: 'bounce',
          mode: 'out-in',
        }"
      />
    </NuxtLayout>
  </div>
</template>
```

### 禁用过渡效果

可以为特定的路由禁用 `pageTransition` 页面过渡效果和 `layoutTransition` 布局过渡效果

```vue
<script setup lang="ts">
definePageMeta({
  pageTransition: false,
  layoutTransition: false,
});
</script>
```

全局禁用过渡效果

```ts
defineNuxtConfig({
  app: {
    pageTransition: false,
    layoutTransition: false,
  },
});
```

### JS 钩子 (适用于 GSAP 等动画库)

```vue
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    // css 类名
    // .fade-enter-from .fade-enter-active .fade-enter-to
    // .fade-leave-from .fade-leave-active .fade-leave-to
    name: "flip",
    mode: "out-in",
    onBeforeEnter(el) => {},
    onEnter: (el, done) => {},
    onAfterEnter: (el) => {},
    onEnterCancelled(el) => {},
    onBeforeLeave(el) => {},
    onLeave(el, done) => {},
    onAfterLeave(el) => {},
    onLeaveCancelled(el) => {},
  },
});
</script>
```

### 条件过渡效果

::: code-group

```vue [pages/[id].vue]
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: "slide-right", // 默认使用 slide-right 页面过渡效果
    mode: "out-in", // 默认值
  },
  middleware(to: any, from: any) {
    // 条件过渡效果
    to.meta.pageTransition.name =
      // id 小到大: 使用 slide-left 页面过渡效果
      // id 大到小: 使用 slide-right 页面过渡效果
      Number.parseInt(to.params.id) > Number.parseInt(from.params.id)
        ? "slide-left" // slide-left: leave-to <--- 500px --- id <--- 500px --- enter-from
        : "slide-right"; // slide-right: enter-from --- 500px ---> id --- 500px ---> leave-to
  },
});
const route = useRoute();
</script>

<template>
  <div class="flex items-center justify-center">{{ route.params.id }}</div>
</template>

<style lang="css" scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s;
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translate(500px, 0);
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translate(-500px, 0);
}
</style>
```

```vue [layouts/default.vue]
<script setup lang="ts">
const route = useRoute();
const id = computed(() => Number(route.params.id ?? 1));
const subId = computed(() => `/${id.value - 1}`);
const addId = computed(() => `/${id.value + 1}`);
</script>

<template>
  <div>
    <slot />
    <div v-if="route.params.id">
      <NuxtLink :to="subId">id 大到小: 使用 slide-right 页面过渡效果</NuxtLink>
      <NuxtLink :to="addId">id 小到大: 使用 slide-left 页面过渡效果</NuxtLink>
    </div>
  </div>
</template>
```

```vue [app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

:::

## 数据获取

- useFetch 函数: 用于获取数据, 是对 useAsyncData 和 $fetch 的封装
- $fetch 函数: 适用于用户交互事件, 或者配合 useAsyncData 使用
- useAsyncData 函数: 可以结合 $fetch, 实现更精细的控制

如果在 Vue 组件的 setup 函数中使用 $fetch 函数获取数据, 可能导致数据获取两次

1. 在服务器端获取一次, 服务器会执行一次 $fetch, 将渲染的静态 HTML 发送给浏览器
2. 在浏览器获取一次, **浏览器的 Vue 组件将服务器端渲染的静态 HTML "激活" 为交互式 SPA 单页应用 (Hydration)** 时, 也会执行一次 $fetch

useFetch 和 useAsyncData 组合函数, 可以避免浏览器 Hydration 时重复获取相同的数据

```vue
<script setup lang="ts">
// useFetch 用于获取数据
const { data } = await useFetch("/api/data");

async function handleFormSubmit() {
  // $fetch 函数: 适用于用户交互事件
  const res = await $fetch("/api/submit", {
    method: "POST",
    body: {
      // form data
    },
  });
}
</script>

<template>
  <div v-if="data == null">No data</div>
  <div v-else>{{ data }}</div>
  <form @submit="handleFormSubmit"></form>
</template>
```

### `<Suspense>`

Nuxt 底层使用 Vue 的 `<Suspense>`, 可以确保获取所有异步数据后, 才进行路由导航 (联想 `<Suspense>` 的 #fallback 插槽)

可以为路由导航添加进度条

```vue
<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

### $fetch

$fetch 基于 [ofetch](https://github.com/unjs/ofetch) 库, ofetch 库提供了解析响应, 错误处理, 自动重试, 超时, 拦截器等功能

> [!warning]
>
> - $fetch 不能避免浏览器 Hydration 时重复获取相同的数据
> - $fetch 不能确保获取所有异步数据后, 才进行路由导航
> - $fetch 适用于用户交互事件, 或者结合 useAsyncData 使用

### useFetch

useFetch 组合函数是对 useAsyncData 和 $fetch 的封装

```vue
<script setup lang="ts">
const { data: count } = await useFetch("/api/count");
</script>

<template>页面访问量: {{ count }}</template>
```

### useAsyncData

`useAsyncData` 获取并缓存响应, 第一个参数 key 是标识第二个参数 (查询函数 handler) 响应缓存的唯一键, key 是可选的

`useFetch(url)` 约等于 `useAsyncData(url, () => $fetch(url))`

返回值: `{ data, refresh, clear, error, status }`

- data: handler 的返回值 (响应数据)
- error: 错误对象
- status: 请求状态 'idle' | 'pending' | 'success' | 'error'
- refresh/execute 函数: `refresh()` 刷新 handler 的返回值 (刷新响应数据)
- clear 函数: `clear()` 设置 data = undefined; 设置 error = null; 设置 status = 'idle'; 并取消当前请求

```vue
<script setup lang="ts">
// 第一个参数 key 是标识第二个参数 (查询函数 handler) 响应的缓存的唯一键
const { data, error, status /** refresh, clear */ } = await useAsyncData(
  "key", // key
  () => $fetch("url"), // handler
);
</script>
```

默认 useFetch 和 useAsyncData 确保获取所有异步数据后, 才进行路由导航; 可以使用 lazy 选项, 先进行路由导航, 再获取异步数据

```vue
<script setup lang="ts">
const { status, data } = useFetch("/api/posts", {
  lazy: true,
});
// 等价于 const { status, data } = useLazyFetch("/api/posts")
</script>

<template>
  <div v-if="status === 'pending'">pending</div>
  <div v-else>{{ JSON.stringify(data) }}</div>
</template>
```

### 仅客户端执行的数据获取

适用于首次渲染不需要的数据, 例如非 SEO 敏感数据

```ts
/* 服务器 (SSR 时), 客户端都执行的数据获取  */
const articles = await useFetch("/api/article");

/* 仅客户端执行的数据获取 */
const { status, data: comments } = useFetch("/api/comments", {
  lazy: true,
  server: false,
});
```

useFetch/useAsyncData 等组合函数必须在 setup 函数中调用, 或者在生命周期函数的顶层调用, 否则应该使用 $fetch 函数

### pick 选项

pick 可以过滤响应数据的有效字段, 减小有效负载的大小

```vue
<script lang="ts" setup>
// 第一个参数 key 是标识第二个参数 (查询函数 handler) 响应的缓存的唯一键
const { data: payload } = await useAsyncData("key", () => $fetch("url"));
console.log(payload.value); // { code: 200, message: 'ok', data: {...} }

const { data: payload2 } = await useAsyncData("key2", () => $fetch("url"), {
  pick: ["data"],
});
console.log(payload2.value); // { data: {...} } 减小有效负载的大小
</script>
```

### watch 选项

```vue
<script setup lang="ts">
const id = ref(1);

const { data, error, refresh } = await useFetch(`/api/users/${id.value}`, {
  // id 改变时, 自动触发 refetch, 但 URL 始终是 /api/users/1
  // 如果需要响应式的 URL, 则使用计算属性, 或计算 URL
  watch: [id],
});
</script>
```

### 计算 URL (基于 computed 计算属性)

```vue
<script setup lang="ts">
const id = ref(null);

const { data, status } = useLazyFetch("/api/user", {
  query: {
    user_id: id, // id 改变时, 自动触发 refetch, 并且 URL 是响应式的 `/api/user?user_id=${id}`
  },
});
</script>
```

### immediate 选项

```vue
<script setup lang="ts">
const id = ref(null);

// lazy: 先进行路由导航, 再获取异步数据
const { data, status } = useLazyFetch(() => `/api/users/${id.value}`, {
  // 不立即执行, 即不会 fetch(`/api/users/${null}`)
  // 等待 ID 改变后, 才 fetch(`/api/users/${id.value}`)
  immediate: false,
});

const pending = computed(() => status.value === "pending");
</script>

<template>
  <div>
    <!-- fetching 时, 禁用输入框 -->
    <input v-model="id" type="number" :disabled="pending" />
    <div v-if="status === 'idle'">输入 ID</div>
    <div v-else-if="pending">fetching, 请等待</div>
    <!-- status: 'idle' | 'pending' | 'error' | 'success' -->
    <div v-else>{{ data }}</div>
  </div>
</template>
```

## 序列化

::: code-group

```ts [服务器 server/api/foo.ts]
export default defineEventHandler(() => {
  const thisObj = new Date();
  return thisObj; // 使用 JSON.stringify() 序列化
});
```

```vue [客户端 app.vue]
<script setup lang="ts">
// 虽然服务器返回一个 Date 对象, 但是 data 被推断为字符串类型
const { data } = await useFetch("/api/foo");
</script>
```

:::

### 自定义序列化器函数

::: code-group

```ts [服务器 server/api/bar.ts]
export default defineEventHandler(() => {
  const thisObj = {
    createdAt: new Date(),

    toJSON() {
      // 自定义序列化器函数
      return {
        createdAt: {
          year: this.createdAt.getFullYear(),
          month: this.createdAt.getMonth() + 1,
          day: this.createdAt.getDate(),
        },
      };
    },
  };

  return thisObj;
});
```

```vue [客户端 app.vue]
<script setup lang="ts">
// data 的类型被推断为
// {
//   createdAt: {
//     year: number
//     month: number
//     day: number
//   },
// }
const { data } = await useFetch("/api/bar");
</script>
```

:::

## 状态管理

### 组合函数 useState

- 入参: key, initializer (可选)
- useState 在服务器端渲染, 在客户端 hydration 时保留, 原生支持 SSR
- useState 使用唯一的键, 创建一个**在所有组件和页面共享的**响应式状态
- useState 的响应式状态会被序列化为 JSON 字符串, 所以不能包含任何无法序列化的: 类,函数, Symbol

最佳实践

- 不要在 `<script setup>` 或 setup() 函数外定义 `const state = ref()`
- 执行 `export state = ref({})` 将导致服务器上的多个请求共享状态, 可能导致内存泄漏

```vue
<script setup lang="ts">
const counter = useState(
  "counter" /** key */,
  () => Math.round(Math.random() * 100) /** initializer */,
);
</script>

<template>
  <main>
    {{ counter }}
    <button @click="counter++">counter++</button>
    <button @click="counter--">counter--</button>
  </main>
</template>
```

### 使用 callOnce 异步函数初始化状态

如果需要使用异步获取的数据初始化状态, 则可以使用 callOnce 异步函数

```vue
<script setup lang="ts">
const myState = useState("key");

await callOnce(async () => {
  myState.value = await $fetch("url");
});
</script>
```

### 同时使用 Nuxt useState 和 Pinia

- useState 适合轻量级状态管理, 和 SSR 场景
- Pinia 适合复杂状态管理

```bash
# 安装 Pinia
pnpx nuxi@latest module add pinia
```

::: code-group

```ts [store/user.ts]
export const useUserStore = defineStore("user", () => {
  const name = ref("");
  const age = ref(0);

  const fetch = () => {
    const data = await $fetch("url");
    name.value = data.name;
    age.value = data.age;
  };
});
```

```vue [app.vue]
<script setup lang="ts">
const userStore = useUserStore();

await callOnce(userStore.fetch);
</script>

<template>
  <main>
    <h1>{{ userStore.name }}</h1>
    <p>{{ userStore.age }}</p>
  </main>
</template>
```

:::

### composables 目录

composables 目录下的组合函数可以自动导入

> Nuxt 仅扫描 composables/ 目录的顶层文件
>
> 1. 可以在 composables/index.ts 中重新导出内层文件中的组合函数 (推荐)
> 2. 可以在 `nuxt.config.ts` 中设置深度扫描

可以命名导出, auto-import: useFoo

```ts
// composables/useFoo.ts
export const useFoo = () => {
  return useState("foo" /** key */, () => "foo" /** initializer */);
};
```

可以默认导出, auto-import: useBar

```ts
// composables/useBar.ts
export default function () {
  return useState("bar" /** key */, () => "bar" /** initializer */);
}
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: [
      "composables", // 扫描顶层文件 (扫描深度 = 0)
      // 扫描深度 = 1, 文件名 index, 拓展名 ts,js,mts,mjs
      "composables/*/index.{ts,js,mts,mjs}",
      "composables/**", // 扫描所有文件
    ],
  },
});
```

```bash
# 生成类型声明和元数据
pnpx nuxi prepare
pnpx nuxi dev
pnpx nuxi build
```

### 案例

pages/about.vue 和 pages/index.vue 的状态: foo, bar, baz 在所有组件和页面中都是同步的, 键名相同即可

::: code-group

```ts [composables/useFoo.ts]
// 命名导出
export const useFoo = () => {
  return useState("foo", () => 3);
};
```

```ts [composables/useBar.ts]
// 默认导出
export default function () {
  return useState("bar", () => 7);
}
```

```vue [pages/index.vue]
<script setup lang="ts">
const useBar = () => useState("bar", () => 3);
const useFoo = () => useState("foo", () => 4);
const bar = useBar();
const foo = useFoo();
const addBar = () => bar.value++;
const addFoo = () => foo.value++;

const useBaz = () => useState("baz", () => 5);
const baz = useBaz();
const addBaz = () => baz.value++;
</script>

<template>
  <main>
    <NuxtLink to="/about">About page</NuxtLink>
    foo: {{ foo }}
    <button @click="addFoo">addFoo</button>
    bar: {{ bar }}
    <button @click="addBar">addBar</button>
    baz: {{ baz }}
    <button @click="addBaz">addBaz</button>
  </main>
</template>
```

```vue [pages/about.vue]
<script setup lang="ts">
const useBar = () => useState("bar", () => 3);
const useFoo = () => useState("foo", () => 4);
const bar = useBar();
const foo = useFoo();
const addBar = () => bar.value++;
const addFoo = () => foo.value++;

const useBaz = () => useState("baz", () => 5);
const baz = useBaz();
const addBaz = () => baz.value++;
</script>

<template>
  <main>
    <NuxtLink to="/">Index page</NuxtLink>
    <div>
      foo: {{ foo }}
      <button @click="addFoo">addFoo</button>
      bar: {{ bar }}
      <button @click="addBar">addBar</button>
      baz: {{ baz }}
      <button @click="addBaz">addBaz</button>
    </div>
  </main>
</template>
```

:::

## 错误处理

- SSR, Server-Side Rendering 服务器端渲染
- CSR, Client-Side Rendering 客户端渲染

Nuxt 是一个全栈框架, 可能发生无法预防的运行时错误

1. Vue 错误 (SSR 和 CSR)
2. 启动错误 (SSR 和 CSR)
3. Nitro 服务器错误 (server/ 目录)
4. 下载 JS chunk 时错误

### 编写错误处理插件

```ts
// plugins/error-handler.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 打印所有 Vue 错误, 包括已处理的错误
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.log(error, instance, info);
  };

  // 等价于
  nuxtApp.hook("vue:error", (error, instance, info) => {
    console.log(error, instance, info);
  });

  // 打印所有启动错误
  nuxtApp.hook("app:error", (error) => {
    console.log(error);
  });
});
```

### 编写全局错误页面

错误页面 error.vue 不能放在 /pages 目录下, 不能使用 definePageMeta 宏函数

```vue
<!-- error.vue -->
<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();

const handleError = () => {
  // 清除当前的 Nuxt 错误, 并导航到指定页面
  clearError({ redirect: "/" });
};
</script>

<template>
  <div>
    <p>statusCode: {{ error.statusCode }}</p>
    <p>fatal: {{ error.fatal }}</p>
    <p>unhandled: {{ error.unhandled }}</p>
    <p>statusMessage: {{ error.statusMessage }}</p>
    <!-- 可以在 data 中设置自定义字段 -->
    <p>data: {{ JSON.stringify(error.data) }}</p>
    <p>cause: {{ JSON.stringify(error.cause) }}</p>
    <button @click="handleError">处理错误</button>
  </div>
</template>
```

### 错误工具

`useError()`: 返回正在处理的全局 Nuxt 错误

`createError(): Error` 抛出 Nuxt 错误

- 服务器端抛出 createError 创建的错误, 会触发全局错误页面
- 客户端只有抛出 createError 创建的 `{ fatal: true }` 致命错误, 才会触发全局错误页面

```ts
throw createError({
  data: {
    timestamp: new Date(),
  },
  statusCode: 500,
  statusMessage: "致命错误",
  fatal: true,
});
```

`showError()` 手动触发全局错误页面

`clearError()` 清除当前的 Nuxt 错误, 并导航到指定页面

### 客户端组件渲染错误

Nuxt 提供了 `<NuxtErrorBoundary>` 组件, 处理客户端组件渲染错误, 而无需使用全局错误页面替换当前页面

```vue
<script lang="ts" setup>
const errorLogger = (err: unknown) => console.error(err);
</script>

<template>
  <!-- 页面内容 -->
  <NuxtErrorBoundary @error="errorLogger">
    <template #error="{ error, clearError }">
      客户端组件渲染错误: {{ error }}
      <button @click="clearError">清除错误</button>
    </template>
  </NuxtErrorBoundary>
</template>
```

## Nitro 服务器

### server 目录

```bash
└── server/
    ├── api/           # 带 /api 前缀的服务器端接口文件
    │   └── hello.ts   # /api/hello
    ├── routes/        # 不带 /api 前缀的服务器端接口文件
    │   └── bonjour.ts # /bonjour
    └── middleware/    # 服务器端中间件
        └── log.ts     # 后端日志中间件
```

每个文件 (hello.ts, bonjour.ts, log.ts, ...) 都应该**默认导出**一个使用 `defineEventHandler()` 或 `eventHandler` (别名) 定义的函数, handler 可以 return JSON 字符串, return Promise 对象, 或使用 `event.node.res.end()` 发送响应数据

::: code-group

```ts [server/api/hello.ts]
export default defineEventHandler((event) => {
  return { hello: "Nitro" };
  // return JSON.stringify({ hello: "Nitro" });
  // return Promise.resolve("Nitro");
  // event.node.res.end({ hello: "Nitro" }); return;
});
```

```vue [pages/index.vue]
<script setup lang="ts">
const { clear, data, error, refresh, status } = await useFetch("/api/hello");
console.log(data.value); // { hello: 'Nitro' }
</script>
```

:::

| 目录               | 文件                         |
| ------------------ | ---------------------------- |
| server/api/        | 带 /api 前缀的服务器端接口   |
| server/routes/     | 不带 /api 前缀的服务器端接口 |
| server/middleware/ | 服务器端中间件               |
| server/plugins/    | 服务器插件                   |
| server/utils/      | 服务器 utils                 |

### 服务器中间件

中间件会处理服务器端路由上的每个请求

示例 `server/middleware/log.ts`

```ts
export default defineEventHandler((event) => {
  // 新请求的 URL: http://localhost:3000/
  // context 的键名数组: [ 'nitro', '_nitro' ]
  // 注意: 在 pages/index.vue 中 `await useFetch('/api/hello')`

  // 新请求的 URL: http://localhost:3000/api/hello
  // context 的键名数组: [ 'nitro', '_nitro', 'auth', 'matchedRoute', 'params', '_payloadReducers' ]
  console.log("新请求的 URL:", getRequestURL(event).href);
  console.log("context 的键名数组:", Object.keys(event.context));
  event.context.auth = { timestamp: Date.now() };
});
```

### 动态路由参数

::: code-group

```ts [server/api/hello/[name].ts]
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name");
  return `Hello ${name}`;
});
```

```vue [pages/index.vue]
<script setup lang="ts">
const { data } = await useFetch("/api/hello/Yukino");
console.log(data); // Hello Yukino
</script>
```

:::

### 匹配 HTTP 请求方法

使用 .get, .post, .put, .delete 文件名后缀, 以匹配 HTTP 请求方法

::: code-group

```ts [server/api/test.get.ts]
export default defineEventHandler(() => "Get test");
```

```ts [server/api/test.post.ts]
export default defineEventHandler(() => "Post test");
```

:::

- GET 方法: 返回 'Get test'
- POST 方法: 返回 'Post test'
- 其他方法: 抛出 `405 Method Not Allowed` HTTP 错误

::: code-group

```ts [server/api/foo/index.get.ts]
export default defineEventHandler((event) => event.node.res.end("GET api/foo"));
```

```ts [server/api/foo/index.post.ts]
export default defineEventHandler((event) =>
  event.node.res.end("POST api/foo"),
);
```

```ts [/server/api/foo/bar.get.ts]
export default defineEventHandler((event) =>
  event.node.res.end("GET api/foo/bar"),
);
```

:::

### Catch-all 路由

- server/api/foo/[...].ts 文件, 处理 /api/foo/\*\* 路由匹配失败的请求
- server/api/foo/[...slug].ts 文件, 处理 /api/foo/\*\* 路由匹配失败的请求, 并且可以获取匹配失败的路由段

```ts
// server/api/foo/[...slug].ts
export default defineEventHandler((event) => {
  return `匹配失败的路由段: ${event.context.params.slug}`;
});
```

### 解析请求体 `readBody`

readBody 只能在 POST endpoint 中使用, 在 GET endpoint 中使用时, 会抛出 `405 Method Not Allowed` HTTP 错误

::: code-group

```ts [server/api/submit.post.ts]
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return { body };
});
```

```vue [app.vue]
<script setup lang="ts">
async function submit() {
  const { body } = await $fetch("/api/submit", {
    method: "post",
    body: { test: 123 },
  });
}
</script>
```

:::

### 请求行参数

- Query parameters 查询参数
- Path/Router parameters 路径参数

::: code-group

```ts [server/api/ab.get.ts]
// Query parameters 查询参数
// 示例查询 /api/ab?a=foo&b=bar
export default defineEventHandler((event) => {
  const params = getQuery(event);
  // { p1: foo, p2: bar };
  return { p1: params.a, p2: params.b };
});
```

```ts [server/api/hello/[name].get.ts]
// Path/Router parameters 路径参数
// 示例查询 /api/hello/Yukino
export default defineEventHandler(async (event) => {
  const name = event.context.params?.name;
  const name2 = getRouterParam(event, "name"); // 推荐
  console.log(name === name2); // true
  // Hello Yukino
  return `Hello ${name2}`;
});
```

:::

### 错误处理

- 没有抛出错误, 返回状态码 `200 OK`
- 任何未捕获的错误, 返回状态码 `500 Internal Server Error`
- 如果需要返回其他 2xx 状态码, 请使用 `setResponseStatus` 函数
- 如果需要返回其他 4xx/5xx 状态码, 请抛出 `createError` 函数创建的错误

```ts
// server/api/validation/[id].ts
export default defineEventHandler((event) => {
  const id = Number.parseInt(event.context.params?.id);
  if (!Number.isInteger(id)) {
    throw createError({
      // 抛出 createError 函数创建的错误, 返回其他 4xx/5xx 状态码
      statusCode: 400, // 400 Bad Request
      statusMessage: "ID 校验失败",
    });
  }
  // 使用 setResponseStatus 函数, 返回其他 2xx 状态码
  setResponseStatus(event, 202); // 202 Accepted
  return "ID 校验成功";
});
```

### runtimeConfig 运行时配置

nuxt.config.ts 中的 runtimeConfig: 需要在构建后使用环境变量指定的私有 (服务器可用) 或公有 (服务器和客户端都可用) 令牌

::: code-group

```ts [server/api/runtimeConfig.ts]
export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  // { public: { myToken: 'my-token' }, myServerToken: 'my-server-token' }
  console.log("runtimeConfig:", runtimeConfig);
  return { runtimeConfig };
});
```

```vue [pages/index.vue]
<script lang="ts" setup>
const { data } = await useFetch("/api/runtimeConfig");
const runtimeConfigFromServer = data.value?.runtimeConfig;
// { public: { myToken: 'my-token' }, myServerToken: 'my-server-token' }
console.log(runtimeConfigFromServer);

const runtimeConfig = useRuntimeConfig();
// { public: { myToken: 'my-token' }}
console.log(runtimeConfig);
</script>
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // nuxt.config.ts 中定义的 runtimeConfig
  runtimeConfig: {
    // 只在服务器端可用的私有键
    myServerToken: "",
    public: {
      // public 中的键在客户端也可用
      myToken: "",
    },
  },
});
```

```bash [.env]
NUXT_MY_SERVER_TOKEN='my-server-token' # 需要添加 NUXT_ 前缀 (默认)
NUXT_PUBLIC_MY_TOKEN='my-token' # 需要添加 NUXT_PUBLIC_ 前缀 (默认)
```

:::

### 解析 cookies `parseCookies`

```ts
// server/api/cookies.ts
export default defineEventHandler((event) => {
  const cookies = parseCookies(event);
  return { cookies };
});
```

### Awaiting Promises After Response

1. 使用 `event.waitUtil` 方法 + return 结束请求
2. 使用 `event.node.res.end` 方法结束请求 + await

::: code-group

```ts [server/api/background-task.ts]
const timeConsumingBackgroundTask = async () => {
  console.log(
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve("Time consuming background task done");
      }, 3000),
    ),
  );
};

export default eventHandler((event) => {
  event.waitUntil(timeConsumingBackgroundTask());
  return "pong";
});
```

```ts [server/api/background-task2.ts]
const timeConsumingBackgroundTask = async () => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve("Time consuming background task2 done");
    }, 3000),
  );
};

export default eventHandler(async (event) => {
  event.node.res.end("pong");
  console.log(await timeConsumingBackgroundTask());
});
```

:::

### Nitro 服务器配置

::: code-group

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // https://nitro.unjs.io/config
  nitro: {
    storage: {
      redis: {
        driver: "redis",
        port: 6379,
        host: "127.0.0.1",
        db: 0,
      },
    },
  },
});
```

```ts [server/api/storage/test.ts]
export default defineEventHandler(async (event) => {
  // KEYS *
  const keys = await useStorage("redis").getKeys();
  // SET foo bar
  await useStorage("redis").setItem("foo", "bar");
  // DEL foo bar
  await useStorage("redis").removeItem("foo");
  return {};
});
```

:::

使用服务器插件和运行时配置创建存储挂载点

::: code-group

```ts [server/plugins/storage.ts]
import redisDriver from "unstorage/drivers/redis";

export default defineNitroPlugin(() => {
  const storage = useStorage();
  const driver = redisDriver({
    base: "redis",
    host: useRuntimeConfig().redis.host,
    port: useRuntimeConfig().redis.port,
  });
  storage.mount("redis", driver);
});
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    redis: {
      host: "",
      port: 0,
    },
  },
});
```

```bash [.env]
NUXT_REDIS_HOST='127.0.0.1'
NUXT_REDIS_PORT=6379
```

:::
