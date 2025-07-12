# Vue3 路由

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

| 路由模式                                                        | vue-router               |
| --------------------------------------------------------------- | ------------------------ |
| history 模式 (html5 模式, 推荐)                                 | `createWebHistory()`     |
| hash 模式 (#, 不利于 SEO)                                       | `createWebHashHistory()` |
| memory 模式, 适合 node 环境和 SSR, 没有历史记录, 不能后退或前进 | `createMemoryHistory()`  |

### hash-mode

`location.hash` 是 url 中 hash(#) 和后面的部分, 例 `https://161043261.github.io/t/vue_router#hash-mode`, `location.hash = '#hash-mode'`, 改变 url 中的 hash 值不会引起页面的重新加载, 通常用于单页面内的导航

hash 模式和 hashchange 事件

- Vue3 路由的 hash 模式通过改变 `location.hash` 的值, 会触发 hashchange 事件
- vue-router 监听 hashchange 事件, 实现无刷新的路由导航, 不利于 SEO

```js
addEventListener("hashchange", (ev) => console.log(ev));
```

#### 改变 url 的方式

1. 改变 `location.hash`, 页面不会重新加载
2. 改变 `location.href`, 页面会重新加载
3. 点击浏览器的前进/后退按钮
4. 调用 `history.forward()`, `history.back()`, `history.go(delta: number)`, 等价于 3
5. 点击 `<a>` 标签 (`<RouterLink />` 默认渲染为 `<a>` 标签)
6. 调用 `history.pushState()`, `history.replaceState()`, 不会引起页面的重新加载

### history-mode

html5 模式 (history 模式) 和 popstate 事件

- 点击浏览器的前进/后退按钮改变 url 时, 会触发 popstate 事件
- 调用 `history.forward()`, `history.back()`, `history.go(delta: number)` 改变 url 时, 也会触发 popstate 事件
- 点击 `<a>` 标签, 或调用 `history.pushState()`, `history.replaceState()` 改变 url 时, 不会触发 popstate 事件

```js
location.href = "http://localhost:5173/t/vue";
// 改变 location.href, 页面会重新加载
location.href = "http://localhost:5173/t/vue_router";
addEventListener("hashchange", (ev) => console.log("[hashchange]", ev));
addEventListener("popstate", (ev) => console.log("[popstate]", ev));

// 改变 location.hash 页面不会重新加载
// 触发 popstate, hashchange 事件
location.hash = "#hash-mode";

// 改变 location.hash 页面不会重新加载
// 触发 popstate, hashchange 事件
location.href = "http://localhost:5173/t/vue_router#history-mode";
console.log(history.length);

// 未触发 popstate, hashchange 事件
history.pushState({}, "", "vue");
// history.length 加 1
console.log(history.length);
// history.pushState 仅改变 url, 页面不会重新加载
console.log(location.href); // http://localhost:5173/t/vue

// 未触发 popstate, hashchange 事件
history.replaceState({}, "", "/t/vue_router");
// history.length 不变
console.log(history.length);
// history.replaceState 仅改变 url, 页面不会重新加载
console.log(location.href); // http://localhost:5173/t/vue_router
```

## 命名路由

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

## 编程式路由

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

================================================== 07/12

## 命名视图

RouterView 的 name 属性

::: code-group

```ts{6,7} [@/router/index.ts]
const routes: Array<RouteRecordRaw> = [
  // 命名视图
  {
    path: "/container",
    component: () => import("@/views/ViewsContainer.vue"),
    redirect: '/container/ab', // 路由重定向
    alias: '/views/container', // 路由别名
    children: [
      {
        path: "ab",
        name: 'AB',
        components: {
          default: () => import("@/views/NameA.vue"), // 视图名 default
          nameB: () => import("@/views/NameB.vue"), // 视图名 nameB
        },
      },
      {
        path: "bc",
        name: 'BC',
        components: {
          nameB: () => import("@/views/NameB.vue"), // 视图名 nameB
          nameC: () => import("@/views/NameC.vue"), // 视图名 nameC
        },
      },
    ],
  },
];
```

```vue [ViewsContainer.vue]
<template>
  <div style="background: azure">
    <div>name: default (视图 @/views/NameA 的容器)</div>
    <!-- name="default" -->
    <RouterView></RouterView>
    <div>name: nameB (视图 @/views/NameB 的容器)</div>
    <RouterView name="nameB"></RouterView>
    <div>name: nameC (视图 @/views/NameC 的容器)</div>
    <RouterView name="nameC"></RouterView>
    <RouterLink to="/container/ab">AB</RouterLink>
    <RouterLink to="/container/bc">BC</RouterLink>
  </div>
</template>
```

:::

## 路由重定向, 路由别名

- 路由重定向 redirect
- 路由别名 alias

```ts
const routes: Array<RouteRecordRaw> = [
  {
    path: "/container",
    component: () => import("@/views/ViewsContainer.vue"),
    // redirect: '/container/ab', // 路由重定向

    // redirect: {
    //   path: '/container/ab',
    //   // name: 'AB',
    // },

    // http://localhost:5173/container?k=v
    // 重定向到 http://localhost:5173/container/ab?k=v
    redirect: (to) => {
      console.log("to:", to);
      // return '/container/ab'

      return {
        // path: '/container/ab',
        name: "AB",
        query: to.query, // 默认
      };
    },

    // alias: '/views/container', // 路由别名
    alias: ["/ViewsContainer", "/views/container"],
    // http://localhost:5173/ViewsContainer?k=v // 不区分大小写
    // http://localhost:5173/views/container?k=v
    // 都重定向到 http://localhost:5173/container/ab?k=v
  },
];
```

## 路由守卫

需要在 main.ts 中副作用导入路由守卫文件

### 前置守卫

`router.beforeEach((to, from, next) => void)`;

```ts
// main.ts
// 路由前置守卫, 前置守卫函数在 redirect 重定向后, 路由跳转前执行
router.beforeEach(
  (
    to /** (@/router/index.ts
    createRouter
    RouterOptions.routes 重定向后的) 目的路由 */,
    from /** 源路由 */,
    next,
  ) => {
    console.log("from:", from);
    console.log("to:", to);
    if (whitelist.includes(to.path) || sessionStorage.getItem("token")) {
      next(); // 放行
    } else {
      next("/login"); // 重定向到登录
    }
  } /** guard 前置守卫函数 */,
);
```

```ts
router.beforeEach((to) => {
  if (whitelist.includes(to.path) || sessionStorage.getItem("token")) {
    // vue-router@4 新版本
    // 没有返回值: 放行
    // 有返回值: 重定向
    return {
      name: "Login",
    };
  }
});
```

### 后置守卫

`router.afterEach((to, from) => void)`;

::: code-group

```vue [进度条组件]
<script setup lang="ts">
const progress = ref(1);
const bar = ref<HTMLElement>();
let requestId = 0;

function loadStart() {
  const barDom = bar.value!;
  progress.value = 1;
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
  // 要求浏览器在下一次重绘前, 调用传递的回调函数
  requestId = window.requestAnimationFrame(function fn() {
    if (progress.value < 90) {
      progress.value++;
      barDom.style.width = progress.value + "%";
      requestId = window.requestAnimationFrame(fn);
    } else {
      progress.value = 1;
      window.cancelAnimationFrame(requestId);
    }
  });
}

function loadEnd() {
  const barDom = bar.value!;
  setTimeout(() => {
    requestId = window.requestAnimationFrame(() => {
      progress.value = 100;
      barDom.style.width = progress.value + "%";
    });
  }, 1000);
}

defineExpose({ loadStart, loadEnd });
</script>

<template>
  <div class="wrapper">
    <div ref="bar" class="bar"></div>
  </div>
</template>

<style scoped lang="css">
.wrapper {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 3px;

  .bar {
    height: inherit;
    width: 0;
    background: lightpink;
  }
}
</style>
```

```ts [main.ts]
import ProgressBar from "./views/ProgressBar.vue";

const barVNode = createVNode(ProgressBar); // 创建虚拟 DOM
// <body>
//   <barVNode />
// </body>
render(barVNode, document.body); // 渲染真实 DOM
// 路由前置守卫, 前置守卫函数在 redirect 重定向后, 路由跳转前执行
router.beforeEach(
  (
    to /** (@/router/index.ts 重定向后的) 目的路由 */,
    from /** 源路由 */,
    next,
  ) => {
    barVNode.component?.exposed?.loadStart();
    next(); // 放行
  } /** guard 前置守卫函数 */,
);

// 路由后置守卫, 后置守卫函数在路由跳转后执行
router.afterEach(
  (to, from) => {
    barVNode.component?.exposed?.loadEnd();
  } /** guard 后置守卫函数 */,
);
```

:::

## 路由元信息

::: code-group

```ts [@/router/index.ts]
declare module "vue-router" {
  interface RouteMeta {
    title: string;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "PiniaView",
    component: () => import("@/views/PiniaView.vue"),
    // 路由元信息
    meta: {
      title: "Pinia 状态管理库",
    },
  },
];
```

```ts [main.ts]
// 路由前置守卫
router.beforeEach(
  (to, from, next) => {
    // 路由元信息
    if (to.meta.title) {
      document.title = to.meta /** : RouteMeta */.title;
    }
  } /** guard 前置守卫函数 */,
);
```

:::

## 路由过渡动效

参考 [Transition 过渡/动画组件](./d2vue#transition-过渡-动画组件)

::: code-group

```ts [main.ts]
//! pnpm install animate.css
// 全局导入 animate.css
import "animate.css";
```

```ts [@/router/index.ts]
declare module "vue-router" {
  interface RouteMeta {
    title: string;
    transition: string;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "PiniaView",
    component: () => import("@/views/PiniaView.vue"),
    // 路由元信息
    meta: {
      title: "Pinia 状态管理库",
      transition: "animate__bounceIn",
    },
  },
];
```

```vue [@/App.vue]
<template>
  <RouterView v-slot="{ route, Component }">
    <!-- Transition 只允许一个直接子元素
     Transition 包裹组件时, 组件必须有唯一的根元素, 否则不能被动画化 -->
    <Transition
      :enter-active-class="`animate__animated ${route.meta.transition ?? 'animate__bounceIn'}`"
    >
      <!-- Component 必须有唯一的根元素 -->
      <component :is="Component"></component>
    </Transition>
  </RouterView>
</template>
```

:::

## 滚动行为

仅 `history.pushState` 时可用

```ts
const router = createRouter({
  history: createWebHistory(),

  // 滚动行为, 仅 history.pushState 时可用
  scrollBehavior: (to, from, savedPosition) => {
    // 滚动到原位置
    if (savedPosition) {
      console.log("savedPosition:", savedPosition);
      return savedPosition;
    }
    // 滚动到锚点
    if (to.hash) {
      console.log("to.hash:", to.hash);
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    // 滚动到顶部
    return {
      top: 0,
    };
    // 延迟滚动
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve({
    //       left: 0,
    //       top: 0
    //     })
    //  }, 1000)
    // })
  },

  routes, // routes: routes
}); // options
```

## 动态路由

- `router.addRoute()` 动态添加路由
- `router.removeRoute()` 动态删除路由
- `router.hasRoute()` 判断路由是否存在
- `router.getRoutes()` 获取所有路由信息

案例: 根据后端的响应, 动态添加路由

::: code-group

```ts [后端]
import express from "express";
import fs from "node:fs";

const files = fs.readdirSync("../src/views");
for (const file of files) {
  if (file.startsWith("Demo")) {
    console.log(file); // DemoView.vue DemoView2.vue DemoView3.vue
  }
}

const app = express();
app.get("/login", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  // get 方法, 使用 req.query 获取参数
  // post 方法, 使用 req.body 获取参数
  console.log(req.query);
  if (req.query.username === "admin") {
    res.json({
      routes: [
        { path: "/demo", name: "Demo", component: "DemoView" },
        { path: "/demo2", name: "Demo2", component: "DemoView2" },
      ],
    });
  } else if (req.query.username === "admin2") {
    res.json({
      routes: [
        { path: "/demo", name: "Demo", component: "DemoView" },
        { path: "/demo3", name: "Demo3", component: "DemoView3" },
      ],
    });
  } else {
    res.json({
      routes: [],
      message: "Not admin",
    });
  }
});

app.listen(3333, () => {
  console.log("http://localhost:3333");
});
```

```vue [@/views/LoginDemo.vue]
<script setup lang="ts">
const router = useRouter();
const onSubmit = () => {
  // console.log(form.value)
  form.value?.validate((isValid) => {
    console.log("isValid:", isValid);
    if (isValid) {
      addDynamicRouter(); // 根据后端的响应, 动态添加路由
      router.push("/index");
      sessionStorage.setItem("token", Date.now().toString());
    } else {
      ElMessage.error("请输入账号/密码");
    }
  });
};

// http://localhost:5173/login
async function addDynamicRouter() {
  const res = await axios.get("http://localhost:3333/login", {
    params: formData, // { username: 'admin' | 'admin2', password: '1234' }
  });
  console.log(res);
  // 根据后端的响应, 动态添加路由
  res.data.routes.forEach(
    (route: { path: string; name: string; component: string }) => {
      // router.addRoute() 动态添加路由, 返回删除该路由的回调函数
      /* const removeRoute =  */ router.addRoute({
        path: route.path,
        name: route.name,
        // 这里动态导入时, 不要使用 @ (src 别名), 使用相对路径
        // component: () => import(`@/views/${route.component}.vue`),
        component: () => import(`../views/${route.component}.vue`),
      });
    },
  );
  // router.getRoutes() 获取所有路由信息
  console.log(router.getRoutes());
}
</script>

<template>
  <div class="login">
    <el-form
      ref="form"
      :rules="rules"
      :model="formData"
      class="demo-form-inline"
    >
      <!-- ... -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

```vue [@/views/IndexDemo.vue]
<template>
  <div class="index">
    <div>Index</div>
    <!-- 对于动态导入的路由组件, 不要指定 name, 指定 path -->
    <RouterLink to="/demo">Demo</RouterLink>
    <RouterLink to="/demo2">Demo2</RouterLink>
    <RouterLink :to="{ path: '/demo3' }">Demo3</RouterLink>
  </div>
</template>
```

:::
