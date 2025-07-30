# vue-router

## 使用 vue-router

- `<RouterLink />` 链接到 `to` 属性指定的路由
- `<RouterView />` 路由组件的容器
- `useRoute()` 获取路由对象
- `useRouter()` 获取路由器对象

::: code-group

```ts [@/router/index.ts]
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LoginView from "@/views/LoginView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    // 同步导入的路由组件, 合并打包
    component: LoginView,
  },
  {
    path: "/register",
    // 异步导入的路由组件, 分开分包
    component: () => import("@/views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

```vue [@/App.vue]
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <!-- <RouterLink /> 链接到 to 属性指定的路由 -->
    <RouterLink to="/">login</RouterLink>
    <RouterLink to="/register">register</RouterLink>
    <!-- <RouterView /> 路由组件的容器 -->
    <RouterView />
  </div>
</template>
```

```ts [@/main.ts]
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);

app.mount("#app");
```

:::

`<RouterLink to="/where" />` 和 `<a href="/where"></a>` 的区别

1. `<RouterLink />` 在 hash 模式和 history 模式下的行为相同
2. `<RouterLink />` 会阻止 `<a>` 标签点击事件的默认行为, 不会重新加载页面

## 路由模式

| 路由模式                                          | vue-router               |
| ------------------------------------------------- | ------------------------ |
| history 模式 (html5 模式): 推荐                   | `createWebHistory()`     |
| hash 模式: 不利于 SEO                             | `createWebHashHistory()` |
| memory 模式: 适用于 node 环境和 SSR, url 不会改变 | `createMemoryHistory()`  |

### hash-mode

`location.hash` 是 url 中的 hash 值, 例 `https://161043261.github.io/t/vue_router#hash-mode`, `location.hash = '#hash-mode'`, 改变 url 中的 hash 值时, 页面不会重新加载, 通常用于单页面内的导航, 不需要服务器配置, 不利于 SEO

hash 模式和 hashchange 事件

- Vue 路由的 hash 模式通过改变 `location.hash` 的值, 会触发 hashchange 事件
- vue-router 监听 hashchange 事件, 实现无刷新的路由导航

```js
addEventListener("hashchange", (ev) => console.log(ev));
```

### history-mode

html5 模式 (history 模式): url 中没有 #, 需要服务器配置 fallback 路由

popstate 事件

- 改变 url 中的 hash 值时, 页面一定不会重新加载
- 点击浏览器的前进/后退按钮改变 url 时, 会触发 popstate 事件
- 调用 `history.forward()`, `history.back()`, `history.go(delta: number)` 改变 url 时, 也会触发 popstate 事件
- 调用 `history.pushState()`, `history.replaceState()` 改变 url 时, 不会触发 popstate 事件, 页面一定不会重新加载

## 具名路由

路由组件可以有一个唯一的名字

::: code-group

```ts{11,16} [@/router/index.ts]
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import LoginView from "@/views/LoginView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

```vue [@/App.vue]
<template>
  <!-- 默认使用 history.pushState() -->
  <RouterLink :to="{ name: 'login' }">login</RouterLink>
  <!-- 使用 history.replaceState() -->
  <RouterLink replace :to="{ name: 'register' }">register</RouterLink>
</template>
```

:::

## 编程式导航

- `router.push` 向 history 栈顶添加一条记录
- `router.replace` 替换 history 栈顶的记录

```ts
const router = useRouter(); // 获取路由器对象

const routeJumpByUrl = (url: string) => {
  // window.history.pushState();
  router.push(url);
  // router.push({ path: url, replace: false });
};

const routeJumpByName = (name: string) => {
  // window.history.replaceState();
  router.replace({ name, replace: true });
};

const routeJump2prev = (delta?: number) => {
  // window.history.go(delta ?? -1);
  router.go(delta ?? -1);
  // window.history.back();
  router.back();
};

const routeJump2next = (delta?: number) => {
  // window.history.go(delta ?? 1);
  router.go(delta ?? 1);
  // window.history.forward();
  router.forward();
};
```

## 路由传参

1. query: url 查询参数
2. params: url 路径参数
3. window.history.state
4. 路由前置守卫

::: code-group

```ts [@/router/index.ts]
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
  },
  {
    path: "/register/:id/:name?/:age?", // url 路径参数
    // :id 必传参数
    // :name? :age? 可选参数
    name: "registerWithId",
    component: () => import("@/views/RegisterView.vue"),
  },
];
```

```ts [@/views/LoginView.vue]
import { useRouter } from "vue-router";

type User = {
  id: number;
  name: string;
  age: number;
};

const router = useRouter();
const routeJumpByQuery = (user: User) => {
  router.push({
    path: "/register", // name: 'register',
    // query: url 查询参数
    // http://localhost:5173/register?id=1&name=whoami&age=23
    query: user,
    state: user,
  });
};

const routeJumpByParams = (user: User) => {
  router.replace({
    name: "registerWithId",
    // params: url 路径参数
    // http://localhost:5173/register/1
    params: {
      id: user.id,
    },
  });
};
```

```ts [@/views/RegisterView.vue]
import { isProxy, isReactive, isRef } from "vue";
import { useRoute } from "vue-router";

const route = useRoute(); // useRoute() 获取路由对象
console.log(isRef(route), isReactive(route), isProxy(route)); // false true true

console.log("route.query:", route.query);
console.log("route.params:", route.params);
```

:::

### 布尔模式

props 设置为 true 时, `route.params` url 路径参数将被设置为路由组件的 props

```ts{6}
const routes: Array<RouteRecordRaw> = [
  {
    path: "/register/:id/:name?/:age?", // url 路径参数
    name: "registerWithId",
    component: () => import("@/views/RegisterView.vue"),
    props: true,
  },
];
```

### 对象模式

props 是一个对象时, 将该对象设置为路由组件的 props

```ts{6}
const routes: Array<RouteRecordRaw> = [
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
    props: { foo: "bar" }
  },
];
```

### 函数模式

props 是一个函数时, 将该函数的返回值设置为路由组件的 props

```ts{6}
const routes: Array<RouteRecordRaw> = [
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
    props: (route: RouteLocationNormalizedGeneric) => ({ ...route.query }),
  },
];
```

## `<RouterView />` 插槽

```vue
<template>
  <!-- <RouterView /> 等价于 -->
  <RouterView v-slot="{ route, Component }">
    <!-- Component 必须有唯一的根元素 -->
    <component :is="Component" />
  </RouterView>
</template>
```

使用 `<Transition />` 过渡组件和 `<KeepAlive />` 缓存组件

```vue
<template>
  <RouterView v-slot="{ route, Component }">
    <Transition>
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>
```

## 嵌套路由

::: code-group

```ts{17,18} [@/router/index.ts]
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home', // 路由重定向
  },
  {
    path: '/home',
    component: () => import('@/views/HomeView.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
      },
      {
        path: 'register',
        // path: "register", 实际路由 "/home/register"
        // path: "/register", 实际路由 "/register"
        name: 'register',
        component: () => import('@/views/RegisterView.vue'),
      },
    ],
  },
]
```

```vue [HomeView.vue]
<template>
  <div>
    <!-- 必须加上 /home 前缀 -->
    <RouterLink to="/home">login</RouterLink>
    <RouterLink to="/home/register">register</RouterLink>
    <RouterView />
  </div>
</template>
```

:::

## 具名 `<RouterView />`, 路由别名, 路由重定向

::: code-group

```ts [@/router/index.ts]
const routes: Array<RouteRecordRaw> = [
  {
    path: "/views",

    // 路由别名
    // alias: '/',
    alias: ["/", "/home"],

    // 路由重定向
    // redirect: '/views/ab',

    // redirect: {
    //   path: '/views/ab',
    //   // name: 'ab',
    // },

    redirect: (to) => {
      console.log("[redirect] to:", to);
      return {
        // path: '/views/ab',
        name: "ab",
        query: to.query, // 默认
      };
    },

    children: [
      {
        path: "/views/ab", // path: 'ab'
        name: "ab",
        components: {
          // name="default"
          default: () => import("@/views/AView.vue"),
          // name="pageB"
          pageB: () => import("@/views/BView.vue"),
        },
      },
      {
        path: "bc", // path: '/views/bc'
        name: "bc",
        components: {
          // name="pageB"
          pageB: () => import("@/views/BView.vue"),
          // name="pageC"
          pageC: () => import("@/views/CView.vue"),
        },
      },
    ],
  },
];
```

```vue [@/App.vue]
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div>
    <RouterLink to="/views/ab">/views/ab</RouterLink>
    <RouterLink :to="{ name: 'bc' }">/views/bc</RouterLink>

    <div>@/views/AView.vue 的容器</div>
    <!-- name="default" -->
    <RouterView />

    <div>@/views/BView.vue 的容器</div>
    <!-- name="pageB" -->
    <RouterView name="pageB" />

    <div>@/views/CView.vue 的容器</div>
    <!-- name="pageC" -->
    <RouterView name="pageC" />
  </div>
</template>
```

:::

## 路由守卫

- 前置守卫函数在 redirect 重定向后, 路由跳转前执行
- 后置守卫函数在路由跳转后执行

### 前置守卫

`router.beforeEach((to, from, next) => void)`

::: code-group

```ts [写法 1]
const whitelist: string[] = ["/register", "/login"];

router.beforeEach(
  (
    to, // (重定向后的) 目的路由
    from, // 源路由
    next, // 放行函数
  ) => {
    console.log("[beforeGuard] from:", from);
    console.log("[beforeGuard] to:", to);
    if (whitelist.includes(to.path) || sessionStorage.getItem("token")) {
      next(); // 放行
    } else {
      next("/login"); // 重定向到登录
    }
  },
);
```

```ts [写法 2]
const whitelist: string[] = ["/register", "/login"];

router.beforeEach((to) => {
  if (!whitelist.includes(to.path) && !sessionStorage.getItem("token")) {
    // 没有返回值: 放行
    // 有返回值: 重定向
    return { name: "login" };
  }
});
```

:::

### 后置守卫

`router.afterEach((to, from) => void)`

Demo: Progress Bar

::: code-group

```vue [@/components/ProgressBar.vue]
<script lang="ts" setup>
import { computed, ref } from "vue";

const progress = ref(0);
const barWidth = computed(() => progress.value + "%");
let requestId = 0;

const loadStart = () => {
  progress.value = 0;
  const cb = () => {
    if (progress.value < 100) {
      progress.value++;
      requestId = requestAnimationFrame(cb);
    } else {
      progress.value = 0;
      cancelAnimationFrame(requestId);
    }
  };
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
  // 要求浏览器在下一次重绘前, 调用回调函数 cb
  requestId = requestAnimationFrame(cb);
};

const loadEnd = () => {
  progress.value = 100;
  setTimeout(() => {
    requestId = requestAnimationFrame(() => {
      progress.value = 0;
    });
  }, 300);
};

defineExpose({ loadStart, loadEnd });
</script>

<template>
  <div class="fixed top-0 w-dvw h-[3px]">
    <div class="h-[inherit] w-0 bg-lime-100 bar" />
  </div>
</template>

<style lang="css" scoped>
.bar {
  width: v-bind(barWidth);
}
</style>
```

```ts [@/main.ts]
import ProgressBar from "@/components/ProgressBar.vue";

import { createApp, createVNode, render } from "vue";

import App from "./App.vue";
import router from "./router";

const barVNode = createVNode(ProgressBar);
render(barVNode, document.body);

// 前置守卫: 在 redirect 重定向后, 路由跳转前执行
router.beforeEach((to, from, next) => {
  barVNode.component?.exposed?.loadStart();
  next();
});

// 后置守卫: 在路由跳转后执行
router.afterEach((/** to, from */) => {
  barVNode.component?.exposed?.loadEnd();
});

const app = createApp(App);

app.use(router);

app.mount("#app");
```

:::

## 路由元信息, 路由过渡动画

::: code-group

```ts [@/router/index.ts]
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
    transition?: string;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    // 路由元信息
    meta: {
      title: "Homepage",
      // 路由过渡动画
      transition: "animate__bounceIn",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to /** from, next */) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
});

export default router;
```

```vue [@/App.vue]
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView v-slot="{ route, Component }">
    <!-- <Transition /> 只允许一个直接子元素
     <Transition /> 包裹组件时, 组件必须有唯一的根元素, 否则无法应用过渡动画 -->
    <Transition
      :enter-active-class="`animate__animated ${route.meta.transition ?? ''}`"
    >
      <!-- Component 必须有唯一的根元素 -->
      <component :is="Component"></component>
    </Transition>
  </RouterView>
</template>
```

:::

## 滚动行为

仅点击浏览器的前进/后退按钮 (触发 popstate 事件) 时可用

```ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为
  scrollBehavior: (to, from, savedPosition) => {
    // 滚动到原位置
    if (savedPosition) {
      return savedPosition;
    }
    // 滚动到锚点
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    // 滚动到顶部
    return { top: 0 };
  },
});
```

## 动态路由

- `router.addRoute()` 动态添加路由, 返回删除该路由的函数
- `router.removeRoute()` 动态删除路由
- `router.hasRoute()` 判断路由是否存在
- `router.getRoutes()` 获取所有路由信息

案例: 根据后端的响应, 动态添加路由

::: code-group

```ts [vite.config.ts]
import { fileURLToPath, URL } from "node:url";

import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import url from "node:url";

const vitePluginServer = (): Plugin => {
  return {
    name: "vite-plugin-server",
    configureServer(server) {
      server.middlewares.use("/routes", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const queryParams = url.parse(
          req.originalUrl!,
          true /** parseQueryString */,
        ).query;
        const { username } = queryParams;
        let resData: {
          routes: { path: string; name: string; component: string }[];
        } = {
          routes: [],
        };
        switch (username) {
          case "admin":
            resData = {
              routes: [
                { path: "/admin", name: "admin", component: "AdminView" },
                { path: "/admin2", name: "admin2", component: "AdminView2" },
              ],
            };
            break;
          default:
            resData = {
              routes: [
                { path: "/user", name: "user", component: "UserView" },
                { path: "/user2", name: "user2", component: "UserView2" },
              ],
            };
            break;
        }
        res.end(JSON.stringify(resData));
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vitePluginServer()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

```vue [@/App.vue]
<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const routes = router.getRoutes();

// http://localhost:5173/login
const addRoutes = async () => {
  const res = await fetch(`/routes?username=${username.value}`);
  const { routes } = (await res.json()) as {
    routes: { path: string; name: string; component: string }[];
  };
  routes.forEach((route: { path: string; name: string; component: string }) => {
    // 返回删除该路由的函数 removeRoute
    const removeRoute = router.addRoute({
      path: route.path,
      name: route.name,
      // 动态导入时, 不要使用 @ 别名, 使用相对路径; 并且必须有文件扩展名
      component: () => import(`./views/${route.component}.vue`),
    });
  });
  console.log("routes:", router.getRoutes());
};

const username = ref("admin");
</script>

<template>
  <div>
    <input v-model="username" />
    <button @click="addRoutes">addRoutes</button>

    <!-- 对于动态导入的路由组件, 不能指定 name, 指定 path -->
    <RouterLink to="/admin">AdminView</RouterLink>
    <RouterLink to="/admin2">AdminView2</RouterLink>
    <RouterLink :to="{ path: '/user' }">UserView</RouterLink>
    <RouterLink :to="{ path: '/user2' }">UserView2</RouterLink>

    <RouterView />
  </div>
</template>
```

:::
