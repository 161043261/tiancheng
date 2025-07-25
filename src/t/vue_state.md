# Vue 状态管理

## 使用 Pinia

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.mount("#app");
```

## options 选项式 store

store 仓库是缓存 state 状态的容器

::: code-group

```ts [@/stores/user.ts]
import { defineStore } from "pinia";

export const useUserStore /** 命名规范 useXxxStore */ = defineStore(
  "user" /** storeId */,
  {
    state: () => ({
      name: "username",
      age: 18,
    }),

    // getters 类似 computed 计算属性, 会缓存计算结果
    getters: {
      userInfo: (state) => {
        console.log("[useUserStore] computed userInfo:");
        return `name: ${state.name}, age: ${state.age}`;
      },
    },

    // actions 中可以写同步或异步方法
    actions: {
      resetUser() {
        ({ name: this.name, age: this.age } = { name: "username", age: 18 });
      },
      // actions 中不能写箭头函数, 否则没有 this
      setAge: function (newAge: number) {
        this.age = newAge;
      },
      setName: async function (newName: string) {
        return new Promise((resolve) => {
          setTimeout(() => {
            this.name = newName;
            resolve(newName);
          }, 3000);
        });
      },
    },
  } /** options */,
);
```

```vue [@/App.vue]
<script lang="ts" setup>
import { useUserStore } from "@/stores/user";
import { isProxy, isReactive, isRef } from "vue";

const userStore = useUserStore();
console.log(isRef(userStore), isReactive(userStore), isProxy(userStore)); // false true true

// 方式 1: 直接更新 state
const addAge = () => userStore.age++;

// 方式 2, 使用 store.$patch 更新部分 state
const patchUser = () => {
  // store.$patch 可以接收部分 state
  userStore.$patch({ age: userStore.age + 1 });

  // store.$patch 也可以接收一个更新函数
  userStore.$patch((state) => {
    state.name += "!";
  });
};

// 方式 3: 使用 store.$state 更新全部 state
const setUser = () => {
  userStore.$state = {
    age: userStore.age + 1,
    name: userStore.name + "!",
  };
};

const genAge = () => Math.floor(Math.random() * 100);
const genName = () => {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8);
};
</script>

<template>
  <div>name: {{ userStore.name }}, age: {{ userStore.age }}</div>

  <!-- getters -->
  <div>{{ userStore.userInfo }}</div>

  <div class="flex flex-col gap-5">
    <button @click="addAge">addAge</button>
    <button @click="patchUser">patchUser</button>
    <button @click="setUser">setUser</button>

    <!-- 方式 4: 使用 actions 更新 state -->
    <button @click="userStore.setAge(genAge())">setAge</button>
    <button @click="userStore.setName(genName())">setName</button>
    <button @click="userStore.resetUser()">resetUser</button>
  </div>
</template>
```

:::

## storeToRefs

对 store 直接解构会失去响应式, 需要使用 vue 的 `toRef`, `toRefs` 或 pinia 的 `storeToRefs` 解构

```ts
// 直接解构会失去响应式
// const { age, name } = userStore;
// 需要使用 vue 的 toRef, toRefs 或 pinia 的 storeToRefs 解构
const { age, name } = storeToRefs(userStore);
```

## store 仓库实例 api

- `store.$patch` 更新部分 state, 可以接收部分 state, 也可以接收一个更新函数
- `store.$state` 更新全部 state
- `userStore.$reset` 重置 state 到初始值
- `store.$subscribe` (类似 watch) 侦听 state 的改变, 改变 state 时, 调用传入的 callback; 返回停止侦听 (移除该 callback) 的函数
- `store.$onAction` 侦听 actions 的调用, 调用 actions 时, 调用传入的 callback; 返回停止侦听 (移除该 callback) 的函数

### store.$subscribe

`store.$subscribe((mutation, newState) => void)`

```ts
userStore.$subscribe(
  (mutation, newState) => {
    console.log(mutation, newState);
  } /** callback */,
  {
    detached: false, // 默认 false, 组件卸载时移除 callback

    // deep: true, // 默认 false, 深层侦听
    immediate: false,
    // 是否立即执行 callback
    // 默认 false, 即默认懒执行 callback
    flush: "pre", // "pre" | "post" | "sync", 默认 pre
    // pre: state 更新前调用
    // post: state 更新后调用 callback
    // sync: 同步调用 callback
    once: false, // 一次性侦听, callback 只调用一次
  } /** options */,
);
```

### store.$onAction

- `store.$onAction((context) => void)`
- `context.after((actionReturnValue) => void /** callback */)` callback 的参数是 action 方法的返回值
- `context.onError((err) => void /** callback */)` callback 的参数是 action 方法抛出的错误
- `context.args` action 方法的参数数组
- `context.store` store 仓库实例

```ts
userStore.$onAction(
  (context) => {
    // callback 的参数是 action 方法的返回值
    context.after(
      (actionReturnValue) =>
        console.log(
          "[$onAction] context.after, actionReturnValue:",
          actionRetVal,
        ) /** callback */,
    );
    // callback 的参数是 action 方法抛出的错误
    context.onError(
      (err) =>
        console.log("[$onAction] context.onError, err:", err) /** callback */,
    );
    // action 方法的参数数组
    console.log("[$onAction] context.args:", context.args);
    // store 仓库实例
    console.log(
      "[$onAction] context.store === userStore:",
      context.store === userStore,
    );
  },
  false, // 默认 detached: false, 组件卸载时移除 callback
);
```

## composition 组合式 store (setup 语法糖)

使用 setup 语法糖创建的 store 仓库实例没有 $reset 方法, 需要手动实现

::: code-group

```ts [@/stores/count.ts]
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

export const useCntStore = defineStore("count", () => {
  // state
  const cnt = reactive({ v: 0 });

  // getters (使用计算属性)
  const cntInfo = computed(() => `count: ${cnt.v}`);

  // actions
  const resetCnt = () => {
    cnt.v = 0;
  };
  const incCnt = () => cnt.v++;
  const decCnt = () => cnt.v--;

  // 使用 setup 语法糖创建的 store 仓库实例没有 $reset 方法, 需要手动实现
  const $reset = () => {
    resetCnt();
  };

  // 一定要 return!
  return {
    // state
    cnt,

    // getters (使用计算属性)
    cntInfo,

    // actions
    incCnt,
    decCnt,
    $reset,
  };
});
```

```vue [@/App.vue]
<script lang="ts" setup>
import { useCntStore } from "@/stores/count";
import { storeToRefs } from "pinia";

const cntStore = useCntStore();
const { cnt, cntInfo } = storeToRefs(cntStore);
const { incCnt, decCnt } = cntStore;

const addCnt = () => cntStore.cnt.v++;
const subCnt = () => cnt.value.v--;
</script>

<template>
  <div>cntStore.cnt: {{ cntStore.cnt }}</div>
  <div>cnt: {{ cnt }}</div>
  <div>cntStore.cntInfo: {{ cntStore.cntInfo }}</div>
  <div>cntStore.cnt: {{ cntInfo }}</div>

  <div class="flex flex-col gap-5">
    <button @click="addCnt">addCnt</button>
    <button @click="subCnt">subCnt</button>
    <button @click="incCnt">incCnt</button>
    <button @click="decCnt">decCnt</button>

    <button @click="cntStore.$reset()">$reset</button>
  </div>
</template>
```

:::

## Pinia 持久化

对比 localStorage 和 sessionStorage

- localStorage: 数据存储到磁盘, 没有过期时间
- sessionStorage: 数据缓存到内存, 会话结束时自动清除

> [!important] 页面刷新后, store 仓库缓存的 state 状态丢失
>
> - 对于选项式 store 仓库实例, 调用 `toRaw(store.$state)` 将 $state 转换为普通对象
> - 对于组合式 store 仓库实例, 必须递归调用 `toRaw(store.$state)` 将 $state 转换为普通对象

::: code-group

```js [@/utils/deepToRaw.js]
import { isRef, unref } from "vue";

export function deepToRaw(observed) {
  const isObj = (val) => val !== null && typeof val === "object";
  // unref(obj)
  // 如果 obj 是 ref 创建的响应式对象, 则返回 obj.value, 否则直接返回 obj
  const val = isRef(observed) ? unref(observed) : observed;

  if (!isObj(val)) {
    return val;
  }

  if (Array.isArray(val)) {
    const rawArr = [];
    val.forEach((item) => {
      rawArr.push(deepToRaw(item));
    });
    return rawArr;
  }

  const rawObj = {};
  Object.keys(val).forEach((key) => {
    rawObj[key] = deepToRaw(val[key]);
  });

  return rawObj;
}
```

```ts [@/main.ts]
import { deepToRaw } from "@/utils/deepToRaw";

import { createApp } from "vue";
import { createPinia, type PiniaPlugin, type PiniaPluginContext } from "pinia";
import App from "./App.vue";

const app = createApp(App);

const setLocalStorage = (key: string, value: unknown) => {
  const rawVal = deepToRaw(value);
  localStorage.setItem(key, JSON.stringify(rawVal));
};

const getLocalStorage = (key: string) =>
  JSON.parse(localStorage.getItem(key) ?? "{}");

const piniaPluginPersist = (): PiniaPlugin => {
  return (ctx: PiniaPluginContext) => {
    const key = ctx.store.$id;
    const val = getLocalStorage(key);
    console.log(`[piniaPluginPersist] key: ${key}, value: ${val}`);
    // store.$subscribe
    // (类似 watch) 侦听 state 的改变, 改变 state 时, 调用传入的 callback; 返回停止侦听 (移除该 callback) 的函数
    ctx.store.$subscribe(() =>
      setLocalStorage(key, deepToRaw(ctx.store.$state)),
    );
    return val;
  };
};

const pinia = createPinia();
pinia.use(piniaPluginPersist());
app.use(pinia);

app.mount("#app");
```

:::
