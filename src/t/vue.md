# Vue 基础

## MVVM 架构

MVVM, Model-View-ViewModel

1. View 视图层, Vanilla DOM
2. ViewModel 视图模型层: Vue
3. Model 模型层: Vanilla JavaScript

## 使用 vscode 调试

```json
// launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Vue: chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Vue 新特性

### 重写双向数据绑定

- Vue2 的双向数据绑定基于 `Object.defineProperty()`; 创建一个 Vue 实例时, for...in 遍历 vm.data 中的所有属性, 使用 `Object.defineProperty()` 将属性转换为 getter 和 setter
- Vue 的双向数据绑定基于 Proxy 代理对象

优点

1. 不需要数据备份
2. 可以监听数组的索引和 length 属性
3. 可以监听新增属性、删除属性操作

### 虚拟 DOM 性能优化

- Vue2 中, 每次使用 diff 算法更新虚拟 DOM 时, 都是全量对比
- Vue 中, 每次使用 diff 算法更新虚拟 DOM 时, 只对比有 patch 标记的节点

### Vue Fragments

Vue 允许组件有多个根节点, 支持 JSX, TSX

```vue
<template>
  <div>root1</div>
  <div>root2</div>
</template>
```

```jsx
render() {
  return (
    <>
      <div>root1</div>
      <div>root2</div>
    </>
  )
}
```

Vue Tree-Shaking: 删除冗余代码

## 创建 Vue 项目

### Vue 脚手架

```bash
# npm install create-vue@latest -g
# npx create-vue
npm create vue@latest --verbose # 推荐

# npm install create-vite@latest -g
# npx create-vite
npm create vite@latest --verbose

pnpm create vue@latest

pnpm create vite@latest
```

### Vue 项目结构

- public 公有目录会被直接 `cp -r` 到 dist 目录下, 不会被 vite 打包
- src/assets 静态资源目录会被 vite 打包
- src/App.vue Vue 应用的根组件
- src/main.ts Vue 应用的入口 JS/TS 文件, 导入 ./App.vue 根组件并创建 App 对象, 并挂载到 index.html, 也可以导入全局样式, 全局 api
- index.html Vue 应用的入口 HTML 文件, `<div id="app"></div>` 是 App 对象的挂载点

## SFC

SFC, Single File Component 单文件组件

对于 .vue 文件

- script 标签: setup 只能有一个, 非 setup 可以有多个
- template 标签: 只能有一个
- style 标签: 可以有多个

## 风格指南

### setup 函数

```vue
<script lang="ts">
import { ref } from "vue";

export default {
  setup() {
    const cnt = ref(1);
    const addCnt = () => {
      cnt.value++;
    };
    // 一定要 return!
    return {
      cnt,
      addCnt,
    };
  },
};
</script>
```

- 单向绑定: 模型 (数据) 改变 --> 视图 (页面) 改变. 例: {{ }} 插值; v-bind 指令
- 双向绑定: 模型 (数据) 改变 <-> 视图 (页面) 改变. 例: v-model 指令, 常用于输入框

### setup 语法糖

```vue
<script lang="ts" setup>
import { ref } from "vue";
const cnt = ref(1);
const addCnt = () => {
  cnt.value++;
};
</script>
```

## vue 指令

- v-text 渲染文本字符串, 会忽略子节点
- v-html 渲染 HTML 字符串, 会忽略子节点, 不支持渲染 Vue 组件
- v-if, v-else-if, v-else 节点的条件渲染, 不渲染则将节点卸载, 表现为注释节点 `<!-- v-if -->`, 操作 DOM
- v-show 节点的显示/隐藏: 改变内联 CSS 样式 `display: none`, 操作 CSS
- v-on 为元素绑定事件
- v-bind 为元素绑定属性, 模型到视图的单向绑定; v-bind 也可以绑定 style
- v-model 模型, 视图的双向绑定, 本质是 v-bind 和 v-on 的语法糖
- v-for 遍历元素
- v-once 性能优化, 只渲染一次
- v-memo 性能优化, 缓存

```vue
<script lang="ts" setup>
const eventName = "click";
const handleClick = (ev) => console.log(ev);
</script>

<template>
  <!-- 动态事件名 -->
  <button @[eventName]="handleClick">log</button>
</template>
```

- v-on: 可以简写为 @
- v-bind: 可以简写为 :
- v-model 本质是 v-bind 和 v-on 的语法糖

```vue
<template>
  <input v-model="text" />
  <!-- 等价于 -->
  <input v-bind:value="text" @input="text = $event.target.value" />
  <!-- 等价于 -->
  <input :value="text" @input="(ev) => (text = ev.target.value)" />
</template>
```

```vue{20,21,23}
<script lang="ts" setup>
const evType = ref("click");
function clickHandler(ev: Event) {
  console.log("[Child] evType:", evType);
}
</script>

<template>
  <!-- 动态事件名 -->
  <!-- ev: PointerEvent -->
  <!-- evType: click -->
  <div
    @click="
      (ev) => {
        console.log('[Parent] ev:', ev);
      }
    "
  >
    <button v-on:[evType]="clickHandler">点击</button>
    <button @[evType]="(ev: Event) => clickHandler(ev)">点击</button>
    <!-- 阻止事件冒泡 -->
    <button @[evType].stop="clickHandler">点击</button>
  </div>
</template>
```

这里点击 button 子元素时, 事件会冒泡到 div 父元素, 触发 div 父元素的点击事件, 可以使用 .stop 修饰符阻止事件冒泡

事件传播分为 3 个阶段: 捕获阶段, 目标阶段和冒泡阶段

| v-on 指令的修饰符       | 原生 JS (Vanilla JS)                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `v-on:[evType].stop`    | `ev.stopPropagation();` .stop 指令: 阻止事件冒泡                                                                              |
| `v-on:[evType].prevent` | `ev.preventDefault();` .prevent 指令: 阻止事件的默认行为                                                                      |
| `v-on:[evType].capture` | `elem.addEventListener(evType, listener, true /* useCapture */)`.capture 指令: 事件在捕获阶段触发, 而不是在默认的冒泡阶段触发 |
| `v-on:[evType].self`    | .self 指令: 只触发本元素绑定的事件, 不触发从子元素冒泡的事件                                                                  |
| `v-on:[evType].once`    | `elem.removeEventListener(*args)` .once 指令: 事件只触发一次, 触发后移除监听器                                                |
| `@scroll.passive`       | .passive 指令: 对于滚动、触摸事件, 不调用 `ev.preventDefault()`, 提高流畅度                                                   |
| `@keydown.enter`        | 键修饰符 Key Modifiers: 按 enter 键                                                                                           |
| `@click.ctrl`           | 系统修饰符 System Modifiers: 按 ctrl 键并点击                                                                                 |

```vue{16}
<script lang="ts" setup>
const autofill = ref('')
function handleEnter(ev: Event) {
  console.log('[handleEnter] ev: ', ev)
  console.log('[handleEnter] autofill:', autofill)
  autofill.value = 'Autofill context'
}
</script>

<!-- v-model: 双向绑定 -->
<template>
  <input
    id="text"
    type="text"
    @keydown.enter="handleEnter"
    v-model="autofill"
    placeholder="按 enter 键自动填充"
  />
</template>
```

### v-memo

- v-memo 接收一个依赖项数组
- 组件更新时, 如果 v-memo 标记的元素的依赖项都未改变, 则跳过该元素的更新
- 依赖项数组为空时, `v-memo="[]"` 等价于 `v-once`, 该元素只会渲染一次

```vue
<script lang="ts" setup>
const cnt = ref(1);
const cnt2 = ref(1);
const addCnt = () => {
  cnt.value++;
};
const addCnt2 = () => {
  cnt2.value++;
};
</script>

<template>
  <!-- addCnt2 时, 不会触发组件更新 -->
  <div v-memo="[cnt]">cnt: {{ cnt }}; cnt2: {{ cnt2 }}</div>
  <button @click="() => addCnt()">addCnt</button>
  <button @click="() => addCnt2()">addCnt2</button>
</template>
```

## 虚拟 DOM 和 diff 算法

vnode: Virtual DOM Node

真实 DOM 的属性过多, 操作真实 DOM 浪费性能, 虚拟 DOM 是一个 JS 对象

### diff 算法

<!-- 2001.05.28 -->
<image src="/diff.png" alt="diff" width="528rem" />

1. 前序对比: 从头到尾对比 vnode 类型和 key, 相同则复用, 不同则转到 2
2. 后序对比: 从尾到头对比 vnode 类型和 key, 相同则复用, 不同则转到 3
3. 如果旧节点全部 patch, 有多余的新节点, 则新增 (挂载)
4. 如果新节点全部 patch, 有多余的旧节点, 则删除 (卸载)
5. 特殊情况: 乱序 (基于[最长递增子序列 LIS](https://leetcode.cn/problems/longest-increasing-subsequence/description/))
   - 例: 原序列 2,3,4,0,6,1 的最长递增子序列为 2,3,4
   - 将原 vnode 序列的最长递增子序列作为参照序列, 复用、新增或删除不在参照序列中的节点

- 错误实践: 使用索引 index (拼接其他值) 作为 key
- 正确实践: 使用唯一 id 作为 key

```vue
<script lang="ts" setup>
const arr = ref<string[]>(["a", "b", "c", "d"]);
</script>

<template>
  <!-- eslint-disable-next-line vue/require-v-for-key -->
  <span v-for="val of arr">
    <!-- 没有 key -->
    {{ val }}
  </span>
  <br />

  <span :key="idx" v-for="(val, idx) of arr">
    <!-- 有 key -->
    {{ val }}
  </span>
  <br />

  <button @click="(console.log($event), arr.splice(2, 0, 'e'))">splice</button>
</template>
```

## ref 家族

家族成员: ref, shallowRef, isRef, triggerRef, customRef

- ref 深层响应式, 底层会调用 triggerRef 强制收集依赖, 触发深层响应式
- shallowRef 浅层响应式, 只响应 `.value` 的改变
- isRef 判断是否为使用 ref, shallowRef 创建的响应式对象
  - `isRef(refObj) === true`, `isRef(shallowRefObj) === true`
  - `isRef(reactiveObj) === false`, `isRef(shallowReactiveObj) === false`
- triggerRef 调用 triggerRef 强制收集依赖, 触发深层响应式, `shallowRef + triggerRef` 等价于 `ref`

同时使用 ref 和 shallowRef 时, shallowRef 的浅层响应式会失效, 表现为深层响应式 (参考 setUser4)

```vue
<script lang="ts" setup>
import { ref, shallowRef, triggerRef } from "vue";

const user = ref({ name: "Alice", age: 1 });
const user2 = shallowRef({ name: "Bob", age: 2 });

// user.value.age++
const setUser = () => user.value.age++;
// 无改变
const setUser2 = () => user2.value.age++;
// user2.value.age++
const setUser3 = () =>
  (user2.value = { ...user2.value, age: user2.value.age + 1 });
// user.value.age++; user2.value.age++
const setUser4 = () => {
  user.value.age++;
  user2.value.age++;
};
// user2.value.age++
const setUser5 = () => {
  user2.value.age++;
  triggerRef(user2); // 强制收集依赖
};
</script>

<template>
  <main>
    <div>user: {{ JSON.stringify(user) }}</div>
    <div>user2: {{ JSON.stringify(user2) }}</div>

    <button @click="setUser">setUser</button>
    <button @click="setUser2">setUser2</button>
    <button @click="setUser3">setUser3</button>
    <button @click="setUser4">setUser4</button>
    <button @click="setUser5">setUser5</button>
  </main>
</template>
```

### customRef

```vue
<script lang="ts" setup>
import { customRef, type Ref } from "vue";

const primaryValue = "raw";

function debouncedRef<T>(value: T, timeout: number) {
  let timer: number | null = null;
  const ret: Ref<T> = customRef<T>(
    (
      track: () => void /** 收集依赖 */,
      trigger: () => void /** 触发更新 */,
    ) => {
      return {
        get: () => {
          track(); // 收集依赖
          return value;
        },
        set: (newValue: T) => {
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            value = newValue;
            trigger(); // 触发更新
            timer = null;
          }, timeout);
        },
      };
    },
  );
  return ret;
}

const str = debouncedRef(primaryValue, 3000);
const setPrimaryValue = () => {
  str.value = "brandNew";
};
</script>

<template>
  <main>
    <div>str: {{ str }}</div>
    <button @click="setPrimaryValue">setPrimaryValue</button>
  </main>
</template>
```

### ref 绑定 DOM 元素

```vue
<script lang="ts" setup>
import { ref, onMounted, useTemplateRef } from "vue";

const sameName = ref<HTMLDivElement>();
// 也可以使用 useTemplateRef
const divElem = useTemplateRef("sameName");
onMounted(() => {
  console.log(sameName.value?.innerText);
  console.log(divElem.value?.innerText);
});
</script>

<template>
  <div ref="sameName">Awesome Vue</div>
</template>
```

## reactive 家族, readonly

家族成员: reactive, shallowReactive

- reactive 深层响应式, 底层会调用 triggerRef 强制收集依赖, 触发深层响应式
- shallowReactive 浅层响应式, 只响应 `.[keyName]` 的改变
- readonly 返回一个只读的响应式对象

相同的, 同时使用 reactive 和 shallowReactive 时, shallowReactive 的浅层响应式会失效, 表现为深层响应式

### reactive 对比 React 的 useState

1. React 的 useState 可以接收任意的数据类型
2. reactive 只能接收引用数据类型
3. React 的 useState 返回一个普通对象 (状态) 和 set 函数, 调用 set 函数更新状态时, 必须修改该普通对象 (状态) 的引用的指向
4. reactive 返回一个代理对象, 不能修改该代理对象的引用的指向, 否则会失去响应式!

### ref 对比 reactive

```ts
const refObj = ref(1);
const refObj2 = ref({ name: "whoami", age: 1 });
const reactiveObj = reactive({ name: "whoami", age: 1 });
```

1. ref 可以接收任意的数据类型; reactive 只能接收引用数据类型
2. ref 存取时需要加 `.value`; reactive 不需要
3. ref 更适合简单数据结构; reactive 更适合复杂数据结构
4. reactiveObj 是一个 Proxy 对象
   - ref 接收基本数据类型时, refObj.value 是一个基本数据类型的值
   - ref 接收引用数据类型时, refObj2.value 是一个 Proxy 对象
5. 可以直接对 refObj.value 赋值; 不能直接对 reactiveObj 赋值, 否则会失去响应式!

### readonly

```ts
import { reactive, readonly } from "vue";

const items = reactive<string[]>([]);
const readonlyItems = readonly(items);
readonlyItems.push("item");
console.log(items, readonlyItems); // [] []

items.push("item");
console.log(items, readonlyItems); // ["item"] ["item"]
```

> [!important] ref/reactive 深层响应式
> 使用的 ref/reactive 创建的响应式对象更新时, 会更新整个 template, 类似 React 重新执行整个组件函数

## toRef, toRefs, toRaw

- toRef: 将 ref/reactive 创建的响应式对象上的属性值, 转换为响应式对象 (值是绑定的)
- toRefs: 将 ref/reactive 创建的响应式对象上的属性值, 批量解构为响应式对象 (值是绑定的)
- toRaw: 将代理对象 refObj.value, reactiveObj 转换为普通对象
- toRef/toRefs 作用于普通对象时, 视图不会更新 (没有 track, trigger)

```ts
// 实现 toRefs
const myToRefs = (obj) => {
  const ret = {};
  for (const k in obj) {
    ret[k] = toRef(obj, k);
  }
  return ret;
};
// 实现 toRaw
const myToRaw = (obj) => obj["__v_raw"];
```

## computed 计算属性

- 计算属性 `computed({ getter, setter })`
- 只读的计算属性 `computed(getter)`
- 计算属性会缓存计算结果, 只有当依赖项改变时, 才会重新计算 (基于脏值检测)

```ts
const firstName = ref("Tiancheng");
const lastName = ref("Hang");
const fullName = computed<string>({
  get() {
    return firstName.value + "-" + lastName.value;
  }, // getter
  set(newVal: string) {
    [firstName.value, lastName.value] = newVal.split("-");
  }, // setter
});

const readonlyFullName = computed<string>(
  () => firstName.value + "-" + lastName.value, // getter
);
```

## watch 侦听器

### watch

::: code-group

```ts [Demo 1]
const refObj = ref(
  /* (.value) deep = 0 */ {
    // deep = 1
    foo: {
      // deep = 2
      bar: {
        // deep = 3
        type: "ref",
      },
    },
  },
);

// ref 创建的响应式对象, 默认浅层侦听 deep: false; deep: 0
watch(
  refObj,
  (newVal, oldVal) => {
    console.log("[watch] newVal", newVal);
    console.log("[watch] oldVal", oldVal);
  },
  { deep: 3 },
);
```

```ts [Demo 2]
const reactiveObj = reactive(
  /* deep = 0 */ {
    // deep = 1
    foo: {
      // deep = 2
      bar: {
        // deep = 3
        type: "reactive",
      },
    },
  },
);

// reactive 创建的响应式对象, 默认深层侦听 deep: true
watch(
  reactiveObj,
  (newVal, oldVal) => {
    console.log("[watch2] newVal", newVal);
    console.log("[watch2] oldVal", oldVal);
  },
  { deep: 3 },
);
```

```ts [Demo 3]
const name = ref("whoami");

// 返回停止侦听的函数
// 调用 watchHandle() 或 watchHandle.stop() 停止侦听
const watchHandle = watch(
  [refObj, reactiveObj, name],
  (newVal, oldVal) => {
    console.log("[watch3] newVal:", newVal);
    console.log("[watch3] oldVal:", oldVal);
  } /** watchCallback */,
  {
    // deep: true, // 默认 false, 深层侦听
    immediate: false,
    // 是否立即执行 watchCallback
    // 默认 false, 即默认懒执行 watchCallback
    flush: "pre", // "pre" | "post" | "sync", 默认 pre
    // pre: 组件挂载、更新前调用 watchCallback
    // post: 组件挂载、更新后调用 watchCallback
    // sync: 同步调用 watchCallback
    once: false, // 一次性侦听, watchCallback 只调用一次
  } /** options */,
);

// 可以传递一个 getter, 侦听响应式对象中指定的属性
watch(
  [() => refObj.value.foo.bar.type, () => reactiveObj.foo.bar.type],
  (newVal, oldVal) => {
    console.log("[watch4] newVal:", newVal);
    console.log("[watch4] oldVal:", oldVal);
  },
);
```

:::

### watchEffect

不需要指定依赖项, 自动侦听 (自动收集 watchEffectCallback 中的响应式依赖), 默认立即执行 watchEffectCallback

```ts
// 调用 watchHandle() 或 watchHandle.stop() 停止侦听
const watchHandle = watchEffect(
  // watchEffectCallback
  (onCleanup) => {
    console.log("[watchEffect]", msg.value, msg2.value);
    onCleanup(() => {
      console.log("[onCleanup]", msg.value, msg2.value);
    });
  },
  {
    flush: "post", // "pre" | "post" | "sync"
    // pre: 组件挂载、更新前调用 watchCallback
    // post: 组件挂载、更新后调用 watchCallback
    // sync: 同步调用 watchCallback
    onTrigger: (ev) => {
      console.log(ev);
    }, // 调试选项
    onTrack: (ev) => {
      console.log(ev);
    }, // 调试选项
  },
);
```

总结: 未指定 deep 时, 地址改变则可以侦听到, 地址未改变则侦听不到

## 组件的生命周期

setup 语法糖中, 将 beforeCreate, created 合并为 setup

组件的生命周期: setup -> onBeforeMount -> onMounted -> onBeforeUpdate -> onUpdated -> onBeforeUnmount -> onUnmount

1. setup 创建阶段
2. onBeforeMount 挂载前, 获取不到 DOM
3. onMounted 挂载后, 可以获取到 DOM
4. onRenderTriggered 触发更新后, 回调函数接收一个事件对象, 可以同时获取到 newValue 和 oldValue, 调试用 hook, 不属于组件生命周期
5. onBeforeUpdate 更新前, 获取的是 oldValue
6. onRenderTracked 收集依赖后, 回调函数接收一个事件对象, 只能获取到 newValue, 调试用 hook, 不属于组件生命周期
7. onUpdated 更新后, 获取的是 newValue
8. onBeforeUnmount 卸载前, 可以获取到 DOM
9. onUnmounted 卸载后, 获取不到 DOM

## 父子组件通信

子组件中使用宏函数 defineProps 定义自定义属性

> [!caution] 宏函数
>
> 1. 宏函数只能在 setup 代码块中使用
> 2. 宏函数不需要显式导入
> 3. 宏函数 defineProps 编译 (Vue -> JS) 时执行, 编译为组件的 props

### 父传子, defineProps 对比 useAttrs

父组件

```vue
<script lang="ts" setup>
import { ref, reactive } from "vue";
import ChildDemo from "./ChildDemo.vue";

// 父子组件传参
const str_ = "str_parent";
const refStr_ = ref("refStr_parent");
const reactiveArr_ = reactive([6, 6, 6]);
</script>

<template>
  <div>ParentDemo: {{ str_ }} {{ refStr_ }} {{ reactiveArr_ }}</div>
  <ChildDemo
    :str="str_"
    :refStr="refStr_"
    :reactiveArr="reactiveArr_"
    extraAttr="1"
    extraAttr2="2"
  />
  <!-- str_ 不是响应式的, refStr_, reactiveArr_ 是响应式的 -->
  <button @click="str_ += '!'">setStr</button>
  <button @click="refStr_ += '!'">setRefStr</button>
  <button @click="reactiveArr_.push(6)">setReactiveArr</button>
</template>
```

子组件

:::code-group

```vue{4} [写法 1]
<script lang="ts" setup>
import { useAttrs } from 'vue';

const props = defineProps(["str", "refStr", "reactiveArr"]);
// {str: 'str_parent', refStr: 'refStr_parent', reactiveArr: Proxy(Array)}
console.log("[Child] props:", props);

const attrs = useAttrs();
// {extraAttr: '1', extraAttr2: '2'}
console.log("[Child] attrs:", attrs);
</script>

<template>
  <!-- template 中, 使用 props.propName 或直接使用 propName 都可以 -->
  <div>ChildDemo: {{ str }} {{ props.refStr }} {{ reactiveArr }}</div>
</template>
```

```ts{3-16} [写法 2]
import { toRefs, useAttrs } from 'vue'

const props = defineProps({
  str: {
    type: String,
    default: 'str_default',
  },
  refStr: {
    type: String,
    default: 'refStr_default',
  },
  reactiveArr: {
    type: Array<number>, // Array
    default: () => [5, 2, 8], // 引用类型必须转换为箭头函数
  },
})

const { str, refStr, reactiveArr } = toRefs(props)
console.log('[ChildDemo] props:', str, refStr, reactiveArr)
```

```ts [写法 3 (推荐)]
const props = defineProps<{
  str?: string;
  refStr?: string;
  reactiveArr?: number[];
}>();

console.log("[ChildDemo] props:", props.str, props.refStr, props.reactiveArr);
```

```ts [写法 4]
const props = withDefaults(
  defineProps<{
    str?: string;
    refStr?: string;
    reactiveArr?: number[];
  }>(),
  {
    str: "str_default",
    refStr: "refStr_default",
    reactiveArr: () => [5, 2, 8], // 引用类型必须转换为箭头函数
  },
);

console.log("[ChildDemo] props:", props.str, props.refStr, props.reactiveArr);
```

:::

### Grandparent 传 Child

::: code-group

```vue [GrandparentDemo.vue]
<script lang="ts" setup>
import { reactive, ref } from "vue";
import ParentDemo from "./ParentDemo.vue";

const a = ref(1);
const b = reactive({ v: 2 });
const addA = (da: number) => (a.value += da);
</script>

<template>
  <div>
    <!-- v-bind="{ p1: "v1", p2: "v2" }" 等价于 :p1="v1" :p2="v2" -->
    <ParentDemo :a="a" :b="b" :addA="addA" :="{ p1: 'v1', p2: 'v2' }" />
  </div>
</template>
```

```vue [ParentDemo.vue]
<script lang="ts" setup>
import { useAttrs } from "vue";
import ChildDemo from "./ChildDemo.vue";

const props = defineProps(["a", "b", "addA"]);
// {a: 1, b: Proxy(Object), addA: ƒ}
console.log("[ParentDemo] props:", props);

const attrs = useAttrs();
// {p1: 'v1', p2: 'v2'}
console.log("[ParentDemo] attrs:", attrs);
</script>

<template>
  <div>
    <div>[ParentDemo] a={{ a }} b={{ b }} attrs={{ attrs }}</div>
    <ChildDemo :a="a" :b="b" :addA="addA" :="attrs" />
  </div>
</template>
```

```vue [ChildDemo.vue]
<script lang="ts" setup>
import { useAttrs } from "vue";

const props = defineProps(["p1", "p2"]);
// {p1: 'v1', p2: 'v2'}
console.log("[ChildDemo] props:", props);

const attrs = useAttrs();
// {a: 1, b: Proxy(Object)}
console.log("[ChildDemo] attrs:", attrs);
</script>

<template>
  <div>
    <p>[ChildDemo] p1={{ p1 }} p2={{ p2 }} attrs={{ attrs }}</p>
    <button @click="(attrs.addA as Function)(1)">Add grandparent's a</button>
  </div>
</template>
```

:::

### 子传父

1. 子组件使用 defineEmits 定义自定义事件
2. 子组件派发自定义事件, emit 发射参数给父组件
3. 父组件为子组件的自定义事件绑定回调函数, 监听子组件派发的自定义事件; 自定义事件派发时, 父组件接收子组件发射的参数, 作为回调函数的参数

子组件

::: code-group

```vue{4} [写法 1]
<script lang="ts" setup>
// 子组件使用 defineEmits 定义自定义事件
// 自定义事件名 evName, evName2
const emit = defineEmits(['evName', 'evName2'])

const emitToParent = (ev: Event) => {
  // 子组件派发自定义事件, emit 发射参数给父组件
  emit('evName', ev)
}
const emitToParent2 = () => {
  emit('evName2', 'foo', 'bar')
}
</script>

<template>
  <button @click="(ev) => emitToParent(ev)">子传父</button>
  <button @click="emitToParent2">子传父2</button>
</template>
```

```ts{3-6} [写法 2]
// 子组件使用 defineEmits 定义自定义事件
// 自定义事件名 evName, evName2
const emit = defineEmits<{
  (e: 'evName', arg: Event): void,
  (e: 'evName2', arg: string, arg2: string): void
}>()

const emitToParent = (ev: Event) => {
  // 子组件派发自定义事件, emit 发射参数给父组件
  emit('evName', ev)
}
const emitToParent2 = () => {
  emit('evName2', 'foo', 'bar')
}
```

```ts{3-6} [写法 3 (推荐)]
// 子组件使用 defineEmits 定义自定义事件
// 自定义事件名 evName, evName2
const emit = defineEmits<{
  evName: [arg: Event], // 具名元组
  evName2: [arg: string, arg2: string] // 具名元组
}>()

const emitToParent = (ev: Event) => {
  // 子组件派发自定义事件, emit 发射参数给父组件
  emit('evName', ev)
}
const emitToParent2 = () => {
  emit('evName2', 'foo', 'bar')
}
```

:::

父组件

```vue
<script lang="ts" setup>
import ChildDemo from "./ChildDemo.vue";
// 子传父
// 自定义事件派发时, 父组件接收子组件发射的数据, 作为回调函数的参数
const receiveFromChild = (...args: unknown[]) => console.log(args);
</script>

<template>
  <!-- 父组件为子组件的自定义事件绑定回调函数, 监听子组件派发的自定义事件 -->
  <ChildDemo
    @evName="(...args: unknown[]) => receiveFromChild(args)"
    @evName2="receiveFromChild"
  />
</template>
```

### 子组件暴露接口

子组件使用 defineExpose 暴露接口, 包括属性和方法

::: code-group

```vue [ChildDemo.vue]
<script lang="ts" setup>
defineExpose({
  name: "whoami",
  getAge() {
    return 23;
  },
});
</script>

<template>ChildDemo</template>
```

```vue [ParentDemo.vue]
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import ChildDemo from "./ChildDemo.vue";

const sameName = ref<InstanceType<typeof ChildDemo>>();
onMounted(() => {
  console.log(
    "[ParentDemo] Child expose:",
    sameName.value?.name,
    sameName.value?.getAge(),
  );
});
</script>

<template>
  <ChildDemo ref="sameName" />
</template>
```

:::

## 兄弟组件通信

### 方式 1: 通过父组件转发 (forward)

BoyDemo.vue -> ParentDemo.vue (forward) -> GirlDemo.vue

::: code-group

```vue [BoyDemo.vue]
<!-- Boy 组件使用 defineEmits 定义自定义事件 -->
<script lang="ts" setup>
// const emit = defineEmits(['customEvent'])
const emit = defineEmits<{
  customEvent: [flag: boolean, timestamp: string]; // 具名元组
}>();

let flag = false;
const emitArgs = () => {
  flag = !flag;
  const timestamp = new Date().toLocaleTimeString();
  emit("customEvent", flag, timestamp);
};
</script>

<template>
  <!-- 点击按钮以触发自定义事件, 向父组件发射参数 -->
  <button @click="emitArgs">emitArgs</button>
</template>
```

```vue [ParentDemo.vue]
<!-- 父组件为子组件的自定义事件绑定回调函数
自定义事件发生时, 父组件接收子组件发射的参数, 作为回调函数的参数 -->
<script lang="ts" setup>
import { ref } from "vue";
import BoyDemo from "./BoyDemo.vue";
import GirlDemo from "./GirlDemo.vue";

const flag = ref<boolean>(false);
const timestamp = ref<string>("");

const receiveArgs = (flag_: boolean, timestamp_: string) => {
  flag.value = flag_;
  timestamp.value = timestamp_;
};
</script>

<template>
  <div>
    <BoyDemo
      @custom-event="
        (flag: boolean, timestamp: string) => receiveArgs(flag, timestamp)
      "
    />
    <!-- 转发: 将父组件接收的 BoyDemo 子组件发射的参数, 传递给 GirlDemo 子组件 -->
    <GirlDemo :flag="flag" :timestamp="timestamp" />
  </div>
</template>
```

```vue [GirlDemo.vue]
<script lang="ts" setup>
defineProps<{
  flag: boolean;
  timestamp: string;
}>();
</script>

<template>
  <div>[GirlDemo] flag: {{ flag }}</div>
  <div>[GirlDemo] timestamp: {{ timestamp }}</div>
</template>
```

:::

### 方式 2: 事件总线 (发布/订阅)

BoyDemo 发布, GirlDemo 订阅, 无需父组件参与

::: code-group

```ts [bus.ts]
// type TCallback = (...args: any[]) => void | Promise<void>
interface ICallback {
  (...args: any[]): void | Promise<void>;
}

class Bus {
  evName2cbs: Map<string, Set<ICallback>> = new Map();

  // 发布
  pub(evName: string, ...args: unknown[]) {
    const cbs = this.evName2cbs.get(evName);
    if (!cbs) {
      return;
    }
    for (const cb of cbs) {
      cb.apply(this, args);
    }
  }

  // 订阅
  sub(evName: string, cb: ICallback) {
    const cbs = this.evName2cbs.get(evName);
    if (!cbs) {
      this.evName2cbs.set(evName, new Set([cb]));
      return;
    }
    cbs.add(cb);
  }

  // 取消订阅
  off(evName: string, cb: ICallback) {
    const cbs = this.evName2cbs.get(evName);
    if (!cbs) {
      return;
    }
    cbs.delete(cb);
    if (cbs.size === 0) {
      this.evName2cbs.delete(evName);
    }
  }

  // 订阅一次
  once(evName: string, cb: ICallback) {
    const onceCb = (...args: Parameters<typeof cb>) => {
      cb.apply(this, args);
      this.off(evName, cb);
    };
    this.sub(evName, onceCb);
  }
}

export default new Bus();
```

```vue [BoyDemo.vue]
<script lang="ts" setup>
import bus from "./bus";

let flag = false;
const emitArgs = () => {
  flag = !flag;
  // 发布
  bus.pub("customEvent", flag, new Date().toLocaleTimeString()); // 发布
};
</script>

<template>
  <button @click="emitArgs">emitArgs</button>
</template>
```

```vue [GirlDemo.vue]
<script lang="ts" setup>
import { ref } from "vue";
import bus from "./bus";

const flag = ref(false);
const timestamp = ref("");

// 订阅
bus.sub("customEvent", (flag_: boolean, timestamp_: string) => {
  flag.value = flag_;
  timestamp.value = timestamp_;
});
</script>

<template>
  <div>[GirlDemo] flag: {{ flag }}</div>
  <div>[GirlDemo] timestamp: {{ timestamp }}</div>
</template>
```

:::

### mitt 发布/订阅库

```vue
<script setup lang="ts">
import mitt from "mitt";

const emitter = mitt();

const handlerA = (args: unknown) => console.log("[handlerA] args:", args);
const handlerB = (args: unknown) => console.log("[handlerB] args:", args);
emitter.on("eventA", handlerA);
emitter.on("eventB", handlerB);
emitter.on("*", (evName, args) => console.log("[*]:", evName, args));
</script>

<template>
  <button @click="emitter.emit('eventA', { a: 1 })">emitA</button>
  <button @click="emitter.emit('eventB', { b: 2 })">emitB</button>
  <button @click="emitter.off('eventA', handlerA)">offA</button>
  <button @click="emitter.off('eventB', handlerB)">offB</button>
  <button @click="emitter.all.clear()">clear</button>
</template>
```

## 依赖注入 provide/inject

~~类似的技术: IoC/DI~~

- ~~控制反转 IoC, Inversion of Control, 不手动 new 对象, 或导入对象, 而是从容器 (Map) 中取对象~~
- ~~依赖注入 DI, Dependency Injection: 不导出对象, 而是将对象放到容器 (Map) 中~~

provide/inject: 祖先 provide 提供, 并 inject 注入到后代, 实现祖孙通信

::: code-group

```vue [GrandparentDemo.vue]
<script lang="ts" setup>
import { provide, ref } from "vue";
import ParentDemo from "./ParentDemo.vue";

const colorVal = ref("lightpink");
// 祖先 provide 提供
provide("colorKey" /** key */, colorVal /** value */);
// 可以提供一个 readonly 的 colorVal, 防止后代组件修改
// provide('colorKey', readonly(colorVal))
</script>

<template>
  <div>[Grandparent] colorVal: {{ colorVal }}</div>
  <button @click="colorVal = 'lightpink'">lightpink</button>
  <ParentDemo />
</template>
```

```vue [ParentDemo.vue]
<script lang="ts" setup>
import { inject, ref, type Ref } from "vue";
import ChildDemo from "./ChildDemo.vue";
// 并 inject 注入到后代
const injectedColor = inject<Ref<string>>(
  "colorKey",
  ref("unknown-color") /** defaultVal */,
);
</script>

<template>
  <div>[Parent] injectedColor {{ injectedColor }}</div>
  <button @click="injectedColor = 'lightgreen'">lightgreen</button>
  <ChildDemo />
</template>
```

```vue [ChildDemo.vue]
<script lang="ts" setup>
import { inject, type Ref, ref } from "vue";
// 并 inject 注入到后代
const injectedColor = inject<Ref<string>>(
  "colorKey",
  ref("unknown-color") /** defaultVal */,
);
</script>

<template>
  <div>[Child] injectedColor {{ injectedColor }}</div>
  <button @click="injectedColor = 'lightblue'">lightblue</button>
</template>
```

:::

## 局部组件、全局组件、递归组件

### 局部组件、全局组件

- 默认是局部组件
- 可以在 main.ts 中注册全局组件

```ts
// main.ts
import CardComponent from "@/components/global/CardComponent.vue";
const app = createApp(App);
app.component("GlobalCard", CardComponent); // 注册 <GlobalCard /> 全局组件
// .vue 文件可以直接使用 <GlobalCard /> 全局组件, 无需导入
```

批量注册全局组件

```ts
// main.ts
import * as GlobalComponents from "./components/global";

const app = createApp(App);
for (const [key, component] of Object.entries(GlobalComponents)) {
  app.component(key, component);
}
```

### 递归组件

父组件 ParentDemo.vue

```vue
<script lang="ts" setup>
import { reactive } from "vue";
import RecursiveChild from "./RecursiveChild.vue";

export interface ITreeNode {
  name: string;
  checked: boolean;
  children?: ITreeNode[];
}

const data = reactive<ITreeNode[]>([
  { name: "1", checked: false },
  { name: "2", checked: true, children: [{ name: "2-1", checked: false }] },
  {
    name: "3",
    checked: true,
    children: [
      {
        name: "3-1",
        checked: false,
        children: [{ name: "3-1-1", checked: true }],
      },
    ],
  },
]);
</script>

<template>
  <RecursiveChild :data="data" />
</template>
```

递归子组件 RecursiveChild.vue

使用递归组件时, 需要阻止事件冒泡 (使用 .stop 修饰符)

```vue
<!-- <script lang="ts">
// 可以自定义组件名
// 不能同时使用 defineOptions 宏函数和 export default 默认导出
export default { name: "RecursiveChild" };
</script> -->

<script lang="ts" setup>
import type { ITreeNode } from "./ParentDemo.vue";

defineProps<{ data?: ITreeNode[] }>();
// 可以自定义组件名
// 不能同时使用 defineOptions 宏函数和 export default 默认导出
defineOptions({ name: "RecursiveChild" });

const check = (item: ITreeNode) => console.log(item);
</script>

<template>
  <!-- .stop 修饰符: 阻止事件冒泡 -->
  <div @click.stop="check(item)" v-for="(item, idx) of data" :key="idx">
    <div>
      <input type="checkbox" v-model="item.checked" />
      <span>{{ item.name }}</span>
    </div>
    <!-- 递归组件, 默认组件名等于文件名 -->
    <RecursiveChild v-if="item.children" :data="item.children" />
  </div>
</template>
```

## 动态组件 `<component />`

多个组件使用同一个 `<component />` 挂载点, 并可以动态切换

`<component :is="componentShallowRef | componentName" />`

不要创建组件的 ref 对象, 避免不必要的性能开销, 可以使用 shallowRef 代替 ref, 也可以使用 markRaw 跳过代理

::: code-group

```vue [写法 1 (推荐)]
<script lang="ts" setup>
import { markRaw, reactive, shallowRef } from "vue";
import DynamicA from "./DynamicA.vue";
import DynamicB from "./DynamicB.vue";
import DynamicC from "./DynamicC.vue";
type DynamicComp = typeof DynamicA | typeof DynamicB | typeof DynamicC;

const activeComp = shallowRef<DynamicComp>(DynamicA);
const setComp = (comp: DynamicComp) => (activeComp.value = comp);
const options = reactive([
  { name: "compA", handler: () => setComp(DynamicA) },
  { name: "compB", handler: () => setComp(DynamicB) },
  // 不要创建组件的 ref 对象, 避免不必要的性能开销
  // 可以使用 shallowRef 代替 ref
  // 也可以使用 markRaw 跳过代理
  { name: "compC ", handler: () => setComp(markRaw(DynamicC)) },
]);
</script>

<template>
  <div v-for="{ name, handler } of options" :key="name">
    <div @click="handler">{{ name }}</div>
  </div>
  <!-- is 可以是组件的 shallowRef, 也可以是注册的组件名 componentName-->
  <component :is="activeComp" />
</template>
```

```vue [写法 2]
<script lang="ts">
import DynamicA from "./DynamicA.vue";
import DynamicB from "./DynamicB.vue";
import DynamicC from "./DynamicC.vue";

export default {
  // 注册子组件
  components: {
    compA: DynamicA, // 注册的组件名 compA
    compB: DynamicB, // 注册的组件名 compB
    compC: DynamicC, // 注册的组件名 compC
  },
};
</script>

<script lang="ts" setup>
import { reactive, ref } from "vue";

const activeComp = ref<string>("compA");
const setComp = (comp: string) => (activeComp.value = comp);
const options = reactive([
  { name: "compA_", handler: () => setComp("compA") },
  { name: "compB_", handler: () => setComp("compB") },
  { name: "compC_", handler: () => setComp("compC") },
]);
</script>

<template>
  <div v-for="{ name, handler } of options" :key="name">
    <div @click="handler">{{ name }}</div>
  </div>
  <!-- is 可以是组件的 shallowRef, 也可以是注册的组件名 componentName-->
  <component :is="activeComp" />
</template>
```

```vue [写法 3]
<script lang="ts" setup>
import { reactive, ref } from "vue";
import DynamicA from "./DynamicA.vue";
import DynamicB from "./DynamicB.vue";
import DynamicC from "./DynamicC.vue";

defineOptions({
  // 注册子组件
  components: {
    compA: DynamicA, // 注册的组件名 compA
    compB: DynamicB, // 注册的组件名 compB
    compC: DynamicC, // 注册的组件名 compC
  },
});

const activeComp = ref<string>("compA");
const setComp = (comp: string) => (activeComp.value = comp);
const options = reactive([
  { name: "compA_", handler: () => setComp("compA") },
  { name: "compB_", handler: () => setComp("compB") },
  { name: "compC_", handler: () => setComp("compC") },
]);
</script>

<template>
  <div v-for="{ name, handler } of options" :key="name">
    <div @click="handler">{{ name }}</div>
  </div>
  <!-- is 可以是组件的 shallowRef, 也可以是注册的组件名 componentName-->
  <component :is="activeComp" />
</template>
```

:::

## 插槽 `<slot />`

插槽: **子组件**提供给**父组件**的占位符, 可以插入父组件的 template

1. 匿名插槽 name="default"
2. 具名插槽
3. 作用域插槽
4. 动态插槽

::: code-group

```vue{15,21,27} [ChildDemo.vue]
<script lang="ts" setup>
import { reactive } from 'vue'

const users = reactive([
  { name: 'foo', age: 1 },
  { name: 'bar', age: 2 },
  { name: 'baz', age: 3 },
])
</script>

<template>
  <div>
    <header>
      <!-- 匿名插槽 name="default" -->
      <slot>placeholder: 匿名插槽</slot>
    </header>

    <main>
      <div v-for="(item, idx) of users" :key="idx">
        <!-- 作用域插槽 -->
        <slot name="scoped" :item="item" :idx="idx">placeholder: 作用域插槽</slot>
      </div>
    </main>

    <footer>
      <!-- 具名插槽 -->
      <slot name="named">placeholder: 具名插槽</slot>
    </footer>
  </div>
</template>
```

```vue{10,14,20} [ParentDemo.vue]
<script lang="ts" setup>
import ChildDemo from './ChildDemo.vue'
</script>

<template>
  <div>
    <!-- 子组件 -->
    <ChildDemo>
      <!-- <div>默认插入到子组件的匿名插槽</div> -->
      <template v-slot:default>
        <div>插入到子组件的匿名插槽 default</div>
      </template>

      <template v-slot:scoped="{ item, idx }">
        <div>插入到子组件的作用域插槽 scoped</div>
        <div>{{ `idx: ${idx}, name: ${item.name}, age: ${item.age}` }}</div>
      </template>

      <template #named>
        <div>插入到子组件的具名插槽 named, v-slot: 可以简写为 #</div>
      </template>
    </ChildDemo>
  </div>
</template>
```

```vue [ParentDemo.vue 动态插槽]
<script lang="ts" setup>
import { ref } from "vue";
import ChildDemo from "./ChildDemo.vue";

const slotName = ref("default");
</script>

<template>
  <div>
    <ChildDemo>
      <!-- 动态插槽, 等价于 #[slotName] -->
      <template v-slot:[slotName]="{ item, idx }">
        <div>动态插槽</div>
        <div v-if="item">
          {{ `idx: ${idx}, name: ${item.name}, age: ${item.age}` }}
        </div>
      </template>
    </ChildDemo>
    <button @click="slotName = 'default'">default</button>
    <button @click="slotName = 'scoped'">scoped</button>
    <button @click="slotName = 'named'">named</button>
  </div>
</template>
```

:::

## 传送模板 `<Teleport />`

`<Teleport />` 将部分 template 传送到指定 DOM 节点上, 成为该 DOM 节点的直接子元素

```vue
<script lang="ts" setup>
import { ref } from "vue";

const popupVisible = ref(false);
</script>

<template>
  <button @click="popupVisible = true">显示弹窗</button>

  <!-- .popup 是 #app 的直接子元素 -->
  <Teleport to="#app" :disabled="false">
    <!-- disable 是否禁用 <Teleport /> -->
    <div class="w-20 h-20 bg-lime-200" v-show="popupVisible">
      我是 #app 的直接子元素
      <button @click="popupVisible = false">隐藏弹窗</button>
    </div>
    <div>我也是 #app 的直接子元素</div>
  </Teleport>
</template>
```

:::

## 异步组件 `<Suspense />`

1. setup 语法糖中使用顶层 await, 会被编译为 `async setup()`
2. 父组件使用 `defineAsyncComponent(() => import(...))` 导入异步组件
3. `<Suspense />` 组件有两个插槽: default 和 fallback, 两个插槽都只允许一个直接子节点

`xhr.readyState`

- xhr.readyState === 0 [unsent] 未调用 open 方法
- xhr.readyState === 1 [opened] 已调用 open 方法, 未调用 send 方法
- xhr.readyState === 2 [headers_received] 已调用 send 方法, 已收到响应头
- xhr.readyState === 3 [loading] 正在接收响应体
- xhr.readyState === 4 [done] 请求结束, 数据传输成功或失败

::: code-group

```ts [public/data.json]
{
  "data": {
    "name": "whoami",
    "age": 23,
    "url": "https://161043261.github.io",
    "desc": "VitePress; Vite & Vue Powered; Static Site Generator; Markdown to Beautiful Docs in Minutes"
  }
}
```

```ts [@/utils/axios.ts]
// 原生 AJAX
export const myAxios = {
  get<T>(url: string): Promise<T> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onreadystatechange = () => {
        // xhr.readyState === 4 [done] 请求结束, 数据传输成功或失败
        if (xhr.readyState === 4 && xhr.status === 200) {
          setTimeout(() => {
            resolve(JSON.parse(xhr.responseText));
          }, 3000);
        }
      };
      xhr.send(null);
    });
  },
};
```

```vue [ChildAsync.vue]
<script lang="ts" setup>
import { myAxios } from "@/utils/axios.ts";
// setup 语法糖中使用顶层 await, 会被编译为 async setup()
const { data } = await myAxios.get<{ data: unknown }>("/data.json");
</script>

<template>
  <div>ChildAsync</div>
  <div>data: {{ JSON.stringify(data) }}</div>
</template>
```

```vue [ChildSkeleton.vue]
<template>
  <div>ChildSkeleton</div>
  <div>请等待...</div>
</template>
```

```vue [ParentDemo.vue]
<script lang="ts" setup>
import { defineAsyncComponent } from "vue";
import ChildSkeleton from "./ChildSkeleton.vue";
// 父组件使用 defineAsyncComponent(() => import(...)) 导入异步组件
const ChildAsync = defineAsyncComponent(
  () => import("@/components/ChildAsync.vue"),
);
</script>

<template>
  <Suspense>
    <template #default>
      <ChildAsync />
    </template>
    <template v-slot:fallback>
      <ChildSkeleton />
    </template>
  </Suspense>
</template>
```

:::

- setup 语法糖中使用顶层 await, 父组件使用 `defineAsyncComponent(() => import(...))` 导入的异步组件, vite 会分包、懒加载
- `import(...)` 异步导入的路由组件, vite 会分包、懒加载

## 使用 TSX

- 支持 v-show、v-model
- 特有的 v-slots

::: code-group

```tsx [ChildDemo.vue 写法 1]
import { defineComponent, toRefs, type Ref, type RenderFunction } from "vue";

interface IProps {
  name: Ref<string>;
  age: Ref<number>;
}

const ChildDemo: Component<IProps> = defineComponent({
  name: "ChildDemo", // componentName
  // props: ['name', 'age'], // propNames (defineProps)
  props: {
    name: String,
    age: {
      type: Number,
      required: true,
    },
  },
  emits: [] as string[], // eventNames (defineEmits)
  expose: [] as string[], // exposedKeys (defineExpose)

  setup(props: IProps, { attrs, slots, emit, expose } /** ctx */) {
    console.log("[ChildDemo] props:", props);
    console.log(
      "[ChildDemo] ctx:",
      attrs,
      slots,
      emit.toString(),
      expose.toString(),
    );
    const { name, age } = toRefs(props);

    return (() => (
      <>
        <div>Child name: {name.value}</div>
        <div>Child age: {age.value}</div>
        <button onClick={() => (name.value += "_Child")}>Child setName</button>
        <button onClick={() => (age.value += 1)}>Child setAge</button>
        {slots.default ? slots.default() : <>placeholder: 匿名插槽</>}
      </>
    )) as RenderFunction;
  },
});

export default ChildDemo;
```

```tsx [ParentDemo.vue 写法 2]
import { ref, defineComponent } from "vue";
import ChildDemo from "./ChildDemo";

export default defineComponent(
  // setup
  () => {
    const name = ref("whoami");
    const age = ref(23);
    const slots = { default: () => <>插槽写法 1</> };
    const slots2 = { default: () => <>插槽写法 2</> };
    // return a renderFunc
    return () => (
      <>
        <div>Parent name: {name.value}</div>
        <div>Parent age: {age.value}</div>
        <button onClick={() => (name.value += "_Parent")}>
          Parent setName
        </button>
        <button onClick={() => (age.value += 1)}>Parent setAge</button>
        <ChildDemo name={name} age={age}>
          {slots}
        </ChildDemo>
        <ChildDemo name={name} age={age} v-slots={slots2} />
      </>
    );
  },
  {
    name: "ParentDemo", // componentName
    props: [] as string[], // propNames (defineProps)
    emits: [] as string[], // eventNames (defineEmits)
  },
);
```

:::
