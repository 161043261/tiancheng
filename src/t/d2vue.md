# Vue 高级

## 缓存组件 `<KeepAlive />`

1. 默认缓存 `<KeepAlive />` 内部的所有组件
2. include 包含属性: 缓存指定 name 的组件, 支持 `string` (可以以逗号分隔), `RegExp` 或 `(string | RegExp)[]`
3. exclude 属性: 不缓存指定 name 的组件
4. max 属性: 最大缓存组件数, 如果实际组件数 > max, 则使用 LRU 算法计算具体缓存哪些组件

::: code-group

```vue [ParentDemo.vue]
<script lang="ts" setup>
import { ref } from "vue";
import BoyDemo from "./BoyDemo.vue";
import GirlDemo from "./GirlDemo.vue";

const flag = ref<boolean>(true);
</script>

<template>
  <KeepAlive>
    <BoyDemo v-if="flag" />
    <GirlDemo v-else />
  </KeepAlive>
  <button @click="flag = !flag">switch</button>
</template>
```

```vue [BoyDemo.vue]
<script lang="ts" setup>
import { ref } from "vue";

const name = ref("");
const age = ref(0);
</script>

<template>
  <div>Boy</div>
  <input v-model="name" type="text" />
  <input v-model="age" type="number" />
</template>
```

```vue [GirlDemo.vue]
<script lang="ts" setup>
import { ref } from "vue";

const name = ref("");
const age = ref(0);
</script>

<template>
  <div>Girl</div>
  <input v-model="name" type="text" />
  <input v-model="age" type="number" />
</template>
```

:::

### 缓存组件的生命周期

使用 `<KeepAlive />` 缓存组件时, 会增加两个生命周期 onActivated 和 onDeactivated

```ts
// 这两个生命周期钩子不仅适用于 <KeepAlive /> 缓存的根组件, 也适用于缓存树的后代组件
onActivated(() => {
  // 调用时机为组件挂载时, 和每次读缓存后插入到 DOM 中
});

onDeactivated(() => {
  // 调用时机为组件卸载时, 和每次从 DOM 中移除后写缓存
});
```

## `<Transition />` 过渡/动画组件

- `<Transition />` 只允许一个直接子元素; 同时, `<Transition />` 包裹组件时, 组件必须有唯一的根元素, 否则无法应用过渡动画
- `<Transition />` 会在一个元素或组件插入/移除 DOM (v-if 挂载/卸载)、显示/隐藏 (v-show) 时应用过渡动画
- `<TransitionGroup />` 允许多个直接子元素, 会在一个 v-for 列表中的元素或组件插入、删除、移动时应用过渡动画

### [enter | leave]-[from | active | to]

对比 CSS 过渡 transition 和动画 animation

|              | 过渡 transition           | 动画 animation                       |
| ------------ | ------------------------- | ------------------------------------ |
| 触发         | 需要事件触发, 例如 :hover | 可以自动触发, 例如页面加载后自动播放 |
| 状态         | 只有起始状态和结束状态    | 可以使用 @keyframes 定义多个关键帧   |
| 自动循环播放 | 不支持                    | 支持                                 |

前置要求: 安装 [tailwindcss](https://tailwindcss.com/docs/installation/using-vite) 和 [animate.css](https://animate.style/)

::: code-group

```vue [Demo 1]
<script lang="ts" setup>
import { ref } from "vue";

const flag = ref<boolean>(true);
</script>

<template>
  <button @click="flag = !flag">mount/unMount</button>
  <!-- 默认 name="v" -->
  <Transition name="my-prefix">
    <div v-if="flag" className="w-50 h-50 bg-lime-200">TransitionDemo</div>
  </Transition>
</template>

<style lang="css" scoped>
@reference "tailwindcss";

/** 默认 .v-enter-from, .v-leave-to */
.my-prefix-enter-from,
.my-prefix-leave-to {
  @apply w-0 h-0;
}

/** 默认 v-enter-active, .v-leave-active */
.my-prefix-enter-active,
.my-prefix-leave-active {
  @apply transition-all duration-1500;
}

/** 默认 v-enter-to, .v-leave-from */
.my-prefix-enter-to,
.my-prefix-leave-from {
  @apply w-50 h-50 rotate-360;
}
</style>
```

```vue [Demo 2]
<script lang="ts" setup>
import { ref } from "vue";

const flag = ref<boolean>(true);
</script>

<template>
  <button @click="flag = !flag">mount/unMount</button>
  <!-- 除了 .[my-prefix]-[enter | leave]-[from | active | to] 约定的类名 -->
  <!-- 也可以自定义类名 [enter | leave]-[from | active | to]-class="your_custom_className" -->

  <!-- :duration="1500" 表示持续时间 1500ms -->
  <!-- 或 :duration="{ enter: 1500, leave: 1500 }" -->
  <Transition
    :duration="{ enter: 1500, leave: 1500 }"
    leaveActiveClass="animate__animated animate__fadeOut"
    enterActiveClass="animate__animated animate__fadeIn"
  >
    <div v-if="flag" className="w-50 h-50 bg-lime-200">TransitionDemo</div>
  </Transition>
</template>
```

:::

### `<Transition />` 的钩子函数

| 事件名         | 对应的 CSS 类名 |
| -------------- | --------------- |
| beforeEnter    | v-enter-from    |
| enter          | v-enter-active  |
| afterEnter     | v-enter-to      |
| enterCancelled |                 |
| beforeLeave    | v-leave-from    |
| leave          | v-leave-active  |
| afterLeave     | v-leave-to      |
| leaveCancelled |                 |

案例

```vue
<script lang="ts" setup>
import { ref } from "vue";

const flag = ref(true);

const handleEnterActive = (el: Element, done: () => void) => {
  console.log("onEnterActive");
  setTimeout(() => done() /** 过渡结束 */, 3000);
};

const handleLeaveActive = (el: Element, done: () => void) => {
  console.log("onLeaveActive");
  setTimeout(() => done() /** 过渡结束 */, 3000);
};
</script>

<template>
  <div>
    <button type="button" @click="flag = !flag">switch</button>
    <Transition
      class="animate__animated"
      enterActiveClass="animate__fadeIn"
      leaveActiveClass="animate__fadeOut"
      :duration="1000"
      @beforeEnter="(el: Element) => console.log('onBeforeEnter')"
      @enter="handleEnterActive"
      @afterEnter="(el: Element) => console.log('onAfterEnter')"
      @enterCancelled="(el: Element) => console.log('onEnterCancelled')"
      @beforeLeave="(el: Element) => console.log('onBeforeLeave')"
      @leave="handleLeaveActive"
      @afterLeave="(el: Element) => console.log('onAfterLeave')"
      @leaveCancelled="(el: Element) => console.log('onLeaveCancelled')"
    >
      <div class="box" v-if="flag">Transition by animate.css</div>
    </Transition>

    <Transition name="my-prefix">
      <!-- className prefix -->
      <div class="box" v-show="flag" style="background: lightpink">
        Transition by custom CSS
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@mixin wh0 {
  width: 0;
  height: 0;
}

@mixin wh50 {
  width: 200px;
  height: 200px;
}

.box {
  @include wh50;
  background: skyblue;
}

.my-prefix-enter-from {
  @include wh0;
  transform: rotate(360deg);
}

.my-prefix-enter-active {
  transition: all 3s ease;
}

// .my-prefix-enter-to {}
// .my-prefix-leave-from {}

.my-prefix-leave-active {
  transition: all 3s ease;
}

.my-prefix-leave-to {
  @include wh0;
  transform: rotate(360deg);
}
</style>
```

### `<Transition />` + [GSAP](https://gsap.com/demos/)

```vue
<!-- pnpm add gsap -->
<script lang="ts" setup>
import gsap from "gsap";
import { ref } from "vue";

const isAlive = ref(true);
const handleBeforeEnter = (el: Element) =>
  gsap.set(el, { width: 0, height: 0 });

const handleEnter = (el: Element, done: () => void) =>
  gsap.to(el, { width: 200, height: 200, onComplete: done });

const handleLeave = (el: Element, done: () => void) =>
  gsap.to(el, { width: 0, height: 0, onComplete: done });
</script>

<template>
  <button type="button" @click="isAlive = !isAlive">switch</button>
  <Transition
    @beforeEnter="handleBeforeEnter"
    @enter="handleEnter"
    @leave="handleLeave"
  >
    <div v-if="isAlive" class="h-50 w-50 bg-lime-200">Transition by GASP</div>
  </Transition>
</template>
```

### appear-[from | active | to]-class

appear-[from | active | to]-class 只在首次渲染时应用 1 次过渡动画

```vue
<script lang="ts" setup>
import { ref } from "vue";

const flag = ref<boolean>(true);
</script>

<template>
  <button @click="flag = !flag">mount/unMount</button>
  <Transition
    appear
    appearFromClass="my-appear-from"
    appearActiveClass="my-appear-active"
    appearToClass="my-appear-to"
  >
    <!-- 只在首次渲染时应用 1 次过渡动画 -->
    <div v-if="flag" className="w-50 h-50 bg-lime-200">TransitionDemo</div>
  </Transition>
</template>

<style lang="css" scoped>
@reference "tailwindcss";

.my-appear-from {
  @apply w-0 h-0;
}

.my-appear-active {
  @apply transition-all duration-1500;
}

.my-appear-to {
  @apply w-50 h-50;
}
</style>
```

## `<TransitionGroup />`

- `<Transition />` 只允许一个直接子元素; 同时, `<Transition />` 包裹组件时, 组件必须有唯一的根元素, 否则无法应用过渡动画
- `<Transition />` 会在一个元素或组件插入/移除 DOM (v-if 挂载/卸载)、显示/隐藏 (v-show) 时应用过渡动画
- `<TransitionGroup />` 允许多个直接子元素, 会在一个 v-for 列表中的元素或组件插入、删除、移动时应用过渡动画

### `<TransitionGroup />` 列表的插入、删除过渡

```vue
<script lang="ts" setup>
import { reactive } from "vue";
import "animate.css";

const list = reactive<number[]>([0, 1, 2]);
</script>

<template>
  <button @click="list.push(list.length)">push</button>
  <button @click="list.pop()">pop</button>
  <!-- tag="htmlTagName" tag 属性为多个列表项包裹一层 htmlTagName 元素 -->
  <div class="wrapper">
    <TransitionGroup
      tag="main"
      class="border-1 flex flex-wrap gap-1"
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div class="item" v-for="(item, idx) of list" :key="idx">{{ item }}</div>
    </TransitionGroup>
  </div>
</template>
```

### `<TransitionGroup />` 列表的移动过渡

```vue
<!-- pnpm i lodash && pnpm i @types/lodash -D -->
<script lang="ts" setup>
import { ref } from "vue";
import { shuffle } from "lodash";

const arr = ref(
  Array.from({ length: 81 }, (_, idx) => ({ key: idx, val: (idx % 9) + 1 })),
);

const shuffleList = () => (arr.value = shuffle(arr.value));
</script>

<template>
  <div>
    <button @click="shuffleList">shuffleList</button>
    <!-- move-class: 平移的过渡动画 -->
    <TransitionGroup moveClass="mv" class="flex flex-wrap w-[378px]" tag="div">
      <!-- v-for 绑定 key 时, 不能使用数组下标, 否则无法应用过渡动画 -->
      <div
        class="w-10 h-10 border-slate-300 border-1 flex justify-center items-center"
        v-for="item of arr"
        :key="item.key"
      >
        {{ item.val }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="css" scoped>
.mv {
  transition: all 1s;
}
</style>
```

## 状态过渡 + [GASP](https://gsap.com/)

案例

```vue
<script setup lang="ts">
import gsap from "gsap";

import { reactive, watch } from "vue";
const num = reactive({
  targetVal: 0,
  renderVal: 0,
});

watch(
  () => num.targetVal,
  (newVal, oldVal) => {
    console.log(newVal, "<-", oldVal);
    gsap.to(num, {
      duration: 1, // 1s
      renderVal: newVal,
    });
  },
);
</script>

<template>
  <input v-model="num.targetVal" :step="20" type="number" />
  <div>{{ num.renderVal.toFixed(0) }}</div>
</template>
```

## 编写 vite 插件解析 JSX

安装依赖

```bash
pnpm i @vue/babel-plugin-jsx -D &&              \
pnpm i @babel/core -D &&                        \
pnpm i @babel/plugin-transform-typescript -D && \
pnpm i @babel/plugin-syntax-import-meta -D &&   \
pnpm i @types/babel__core -D
```

```ts
import type { Plugin } from "vite";
import babel from "@babel/core";
import babelPluginJsx from "@vue/babel-plugin-jsx";

function vitePluginVueTsx(): Plugin {
  return {
    name: "vite-plugin-vue-tsx",
    config(/** config */) {
      return {
        esbuild: {
          include: /\.ts$/,
        },
      };
    },
    async transform(code, id) {
      if (/.tsx$/.test(id)) {
        const ts = await import("@babel/plugin-transform-typescript").then(
          (res) => res.default,
        );
        const res = await babel.transformAsync(code, {
          ast: true, // ast 抽象语法树
          babelrc: false, // 没有 .babelrc 文件, 所以是 false
          configFile: false, // 没有 babel.config.json 文件, 所以是 false
          plugins: [
            babelPluginJsx,
            [ts, { isTSX: true, allowExtensions: true }],
          ],
        });
        return res?.code;
      }
      return code;
    },
  };
}
```

## v-model 双向绑定

### v-model 本质是语法糖

- 父组件使用 `v-bind` 传递 props 给子组件, 预定义的属性名 `modelValue`
- 子组件派发预定义事件, 父组件使用 `v-on` 为预定义事件绑定回调函数, 监听子组件派发的预定义事件, 预定义事件名 `update:modelValue`
- 父组件修改值时, 父组件使用 `v-bind` 传递新的 `modelValue` 值给子组件
- 子组件修改值时, 子组件派发 `update:modelValue` 预定义事件, emit 发射新的 `modelValue` 值给父组件
- 支持多个 v-model: v-model 预定义的属性名是 `modelValue`, 事件名是 `update:modelValue`, 支持自定义 v-model 的属性名、事件名
- v-model 修饰符: `.trim`, `.number`, `.lazy`, 支持自定义修饰符 `v-model.customModifier`

::: code-group

```vue [ParentDemo.vue]
<script setup lang="ts">
import { ref } from "vue";
import ChildDemo from "./ChildDemo.vue";

const text = ref<string>("Awesome Vue");
</script>

<template>
  ParentDemo
  <div>text: {{ text }}</div>
  <ChildDemo v-model:textVal.myModifier="text" />
  <ChildDemo :textVal="text" @update:textVal="(newVal) => (text = newVal)" />
</template>
```

```vue [ChildDemo.vue]
<script setup lang="ts">
const props = defineProps<{
  textVal: string;
  // 约定 xxxModifiers
  textValModifiers?: {
    myModifier: boolean; // 修饰符存在则为 true
  };
}>();

const emit = defineEmits(["update:textVal"]);

const handleInput = (ev: Event) => {
  emit("update:textVal", (ev.target as HTMLInputElement).value);
};
</script>

<template>
  ChildDemo
  <div>Has myModifier: {{ props.textValModifiers?.myModifier ?? false }}</div>
  <div>
    textVal: <input type="text" :value="textVal" @input="handleInput" />
  </div>
</template>
```

:::

## 自定义指令

自定义指令名: 以 v 开头, vDirectiveName

自定义指令的钩子函数

- created
- beforeMount/mounted
- beforeUpdate/updated
- beforeUnmount/unmounted

```vue
<script setup lang="ts">
import { ref, type Directive, type DirectiveBinding } from "vue";
import ChildDemo from "./ChildDemo.vue";

// 自定义指令名: 以 v 开头, vDirectiveName
const vCustomDirective: Directive = {
  created(...args) {
    console.log("[vCustomDirective] created:", args);
  },

  beforeMount(...args) {
    console.log("[vCustomDirective] beforeMount:", args);
  },

  mounted(
    el: HTMLElement,
    binding: DirectiveBinding<{ background: string; textContent: string }>,
  ) {
    console.log("[vCustomDirective] mounted:", el, binding);
    el.style.background = binding.value.background;
    el.textContent = binding.value.textContent;
  },

  beforeUpdate(...args) {
    console.log("[vCustomDirective] beforeUpdate:", args);
  },

  updated(...args) {
    const el = args[0];
    el.textContent = textContent.value;
    console.log("[vCustomDirective] updated:", args);
  },

  beforeUnmount(...args) {
    console.log("[vCustomDirective] beforeUnmount", args);
  },

  unmounted(...args) {
    console.log("[vCustomDirective] unmounted", args);
  },
};

const isAlive = ref(true);
const textContent = ref("Vue");
const handleUpdate = () => {
  textContent.value += "!";
};
</script>

<template>
  <button @click="isAlive = !isAlive">挂载/卸载</button>
  <button @click="handleUpdate">更新</button>
  <ChildDemo
    v-if="isAlive"
    v-custom-directive:propName.myModifier="{
      background: 'skyblue',
      textContent,
    }"
  />
</template>
```

### 自定义指令 `v-auth` 实现按钮鉴权

```vue
<script setup lang="ts">
import type { Directive, DirectiveBinding } from "vue";

const userId = "whoami";
const authList = [
  "whoami:item:create",
  "whoami:item:update" /** 'whoami:item:delete' */,
];

const vAuth: Directive<HTMLElement, string> = (el, binding) => {
  if (!authList.includes(userId + ":" + binding.value)) {
    el.style.display = "none"; // 如果没有权限, 则隐藏按钮
  }
};
</script>

<template>
  <button v-auth="'item:create'">创建</button>
  <button v-auth="'item:update'">更新</button>
  <button v-auth="'item:delete'">删除</button>
</template>
```

### 自定义指令 `v-drag` 实现可拖拽窗口

```vue
<script lang="ts" setup>
import type { Directive } from "vue";

const vDrag: Directive<HTMLElement> = (el) => {
  const draggableElem = el.firstElementChild as HTMLElement;
  const handleMouseDown = (downEv: MouseEvent) => {
    const dx = downEv.clientX - el.offsetLeft;
    const dy = downEv.clientY - el.offsetTop;

    const handleMouseMove = (moveEv: MouseEvent) => {
      el.style.left = `${moveEv.clientX - dx}px`;
      el.style.top = `${moveEv.clientY - dy}px`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", () =>
      document.removeEventListener("mousemove", handleMouseMove),
    );
  };

  draggableElem.addEventListener("mousedown", handleMouseDown);
};
</script>

<template>
  <!-- fixed 固定定位 -->
  <div v-drag class="fixed">
    <div class="h-20 w-50 bg-lime-100 cursor-pointer" />
    <div class="h-50 w-50 bg-lime-200" />
  </div>
</template>
```

### 自定义指令 `v-lazy` 实现图片懒加载

```vue
<script lang="ts" setup>
import { type Directive } from "vue";

// glob 默认懒加载
const images = import.meta.glob(["@/assets/*.jpg", "@/assets/*.png"], {
  eager: true, // 指定立即加载
});
const arr = Object.values(images).map((item) => (item as any).default);
// arr.length = 1
const flattedArr = arr.flatMap((item) => new Array(10).fill(item));
// flattedArr.length = 10
const vLazy: Directive<HTMLImageElement, string> = async (el, binding) => {
  const placeholder = await import("@/assets/vue.svg");
  el.src = placeholder.default;

  // 监听目标元素与祖先元素或视口 viewport 的相交情况
  // 监听目标元素和视口 viewport 的相交情况, 即监听一个元素是否可见
  // entries[0].intersectionRatio 相交的比例、一个元素可见的比例
  const intersectionObserver = new IntersectionObserver((entries) => {
    const visibleRatio = entries[0].intersectionRatio;
    if (visibleRatio > 0) {
      setTimeout(() => (el.src = binding.value), 1500);
      intersectionObserver.unobserve(el);
    }
  });
  intersectionObserver.observe(el);
};
</script>

<template>
  <div>
    <img
      v-lazy="item"
      width="1000"
      v-for="(item, idx) of flattedArr"
      :key="idx"
    />
  </div>
</template>
```

## 自定义 hook

### Demo

```vue
<script lang="ts" setup>
import { onMounted, ref, type Ref } from "vue";

const useBase64str = (
  el: Ref<HTMLImageElement | null>,
): Promise<{ base64str: string }> => {
  const toBase64str = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    [canvas.width, canvas.height] = [img.width, img.height];
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg =
          (data[i] + // r
            data[i + 1] + // g
            data[i + 2]) / // b
          3;
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
    }
    const base64str = canvas.toDataURL(`image/${getExtName(img.src)}`);
    return base64str;
  };

  const getExtName = (url: string) => {
    const urlObj = new URL(url);
    return urlObj.pathname.split(".").at(-1);
  };

  return new Promise((resolve) => {
    onMounted(() => {
      el.value!.onload = () => {
        const base64str = toBase64str(el.value!);
        resolve({ base64str });
      };
    });
  });
};

const imgRef = ref<HTMLImageElement | null>(null);
useBase64str(imgRef).then((res) => {
  imgRef.value!.src = res.base64str;
});
</script>

<template>
  <img src="@/assets/bg.jpg" id="bg" ref="imgRef" />
</template>
```

### 自定义指令 + 自定义 hook 综合案例

- InterSectionObserver 监听目标元素与祖先元素或视口 viewport 的相交情况
- MutationObserver 监听整个 DOM 树的改变
- ResizeObserver 监听元素宽高的改变

::: code-group

```ts{23,24} [main.ts]
import App from "./App.vue";
import { createApp } from "vue";
import type { App as VueApp } from "vue";

// Vue 插件可以是一个有 install 方法的对象
// 也可以直接是一个安装函数
// 也可以是一个有 install 属性的安装函数, install 属性值也是一个函数, 接收一个 App 实例
// useResize 是一个自定义 hook, 也是一个 Vue 插件
export const useResize = (
  el: HTMLElement,
  cb: (contentRect: DOMRectReadOnly) => void,
) => {
  const resizeObserver = new ResizeObserver((entries) => {
    cb(entries[0].contentRect);
  });
  resizeObserver.observe(el);
};

useResize.install = (app: VueApp) => {
  // 注册 v-resize 自定义指令
  app.directive('resize', {
    mounted(el, binding) {
      console.log('[v-resize] mounted:', el, binding)
      // binding.value
      // (rect) => console.log("[v-resize] contentRect:", rect)
      useResize(el, binding.value /** cb */)
    },
  })
}

const app = createApp(App);
app.use(useResize);
app.mount("#app");
```

```vue{15} [App.vue]
<script lang="ts" setup>
import { useResize } from '@/main'
import { onMounted } from 'vue'

onMounted(() => {
  useResize(document.querySelector('#parent') as HTMLElement, (rect) =>
    console.log('[useResize] contentRect:', rect),
  )
})
</script>

<template>
  <textarea
    id="parent"
    v-resize="(rect: DOMRectReadOnly) => console.log('[v-resize] contentRect:', rect)"
  />
</template>
```

:::

## 全局变量 `app.config.globalProperties`

::: code-group

```ts [main.ts]
import { createApp } from "vue";
import App from "./App.vue";
import mitt from "mitt";

interface IEncoding {
  jsonMarshal<T extends object>(arg: T): string;
}

const app = createApp(App);
// 类型扩展
declare module "vue" {
  export interface ComponentCustomProperties {
    $env: string;
    $encoding: IEncoding;
    $bus: ReturnType<typeof mitt>;
  }
}

// 全局变量 $bus, $env, $encoding
const emitter = mitt();
app.config.globalProperties.$bus = emitter;
app.config.globalProperties.$env = "DEV";
app.config.globalProperties.$encoding = {
  jsonMarshal<T extends object>(arg: T) {
    return JSON.stringify(arg);
  },
};

app.mount("#app");
```

```vue [App.vue]
<template>
  <div>$env: {{ $env }}</div>
  <div>
    $encoding.jsonMarshal:
    {{ $encoding.jsonMarshal({ name: "whoami", age: 23 }) }}
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance } from "vue";

const app = getCurrentInstance();
console.log(app?.proxy?.$env);
console.log(app?.proxy?.$encoding.jsonMarshal({ name: "whoami", age: 23 }));
</script>
```

:::

## 全局变量 + Vue 插件综合案例

- Vue 插件可以是一个有 install 方法的对象
- 也可以直接是一个安装函数

::: code-group

```vue [ToastDemo.vue]
<script setup lang="ts">
import { ref } from "vue";
const visible = ref<boolean>(true);

defineExpose({
  visible,
  show: () => (visible.value = true),
  hide: () => (visible.value = false),
});
</script>

<template>
  <Transition
    enter-active-class="animate__animated animate__bounceIn"
    leave-active-class="animate__animated animate__bounceOut"
  >
    <div v-if="visible" class="w-50 h-50 bg-lime-100" />
  </Transition>
</template>
```

```ts [main.ts]
import "animate.css";

import { createApp, createVNode, render } from "vue";
import App from "./App.vue";
import type { Ref, VNode, App as VueApp } from "vue";
import ToastDemo from "./components/ToastDemo.vue";

declare module "vue" {
  export interface ComponentCustomProperties {
    $toast: {
      show: () => void;
      hide: () => void;
      visible: Ref<boolean>;
    };
  }
}

// Vue 插件可以是一个有 install 方法的对象
// 也可以直接是一个安装函数
export const vuePluginToast = {
  install(app: VueApp) {
    const vnode: VNode = createVNode(ToastDemo);
    render(vnode, document.body);
    app.config.globalProperties.$toast = {
      show: vnode.component?.exposed?.show,
      hide: vnode.component?.exposed?.hide,
      visible: vnode.component?.exposed?.visible,
    };
  },
};

const app = createApp(App);
app.use(vuePluginToast);

app.mount("#app");
```

```vue [App.vue]
<template>
  <div class="flex flex-col gap-5">
    <button @click="$toast.show">show</button>
    <button @click="$toast.hide">hide</button>
    <button @click="$toast.visible.value = true">show2</button>
    <button @click="$toast.visible.value = false">hide2</button>
  </div>
</template>
```

:::

### `app.use()` 源码

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import type { App as VueApp } from "vue";

interface Plugin {
  install: (app: VueApp, ...options: unknown[]) => unknown;
}
const installed = new Set();

function myUse<T extends Plugin>(plugin: T, ...options: Array<unknown>) {
  if (installed.has(plugin)) {
    return;
  }
  plugin.install(this as VueApp /** app */, ...options);
  installed.add(plugin);
  return;
}

const app = createApp(App);

// app.use(createPinia())
myUse.call(app, createPinia());

app.mount("#app");
```

## nextTick

Vue 同步更新数据, 异步更新 DOM

- Vue 将 DOM 更新加入任务队列, 等到下一个 tick (类似事件循环) 时, 才统一更新 DOM, 避免多次重复渲染, 提高性能
- nextTick 延迟执行 callback, 即等到下一个 tick, DOM 更新后, 再执行 callback

案例

```vue
<script setup lang="ts">
import { reactive, ref, useTemplateRef, nextTick } from "vue";

const itemList = reactive([
  { name: "item1", id: 1 },
  { name: "item2", id: 2 },
]);

const inputVal = ref("");
const box = useTemplateRef<HTMLDivElement>("box");

// Vue 同步更新数据, 异步更新 DOM
const addItem = () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  box.value!.scrollTop = 520_520_520; // 更新滚动位置 (此时 DOM 未更新)
};

const addItem2 = () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  // nextTick 延迟执行 callback, 即等到下一个 tick, DOM 更新后, 再执行 callback
  nextTick(
    () => (box.value!.scrollTop = 520_520_520), // callback (此时 DOM 已更新)
  );
};

const addItem3 = async () => {
  itemList.push({ name: inputVal.value, id: itemList.length });
  await nextTick(); // 等到下一个 tick, DOM 更新后
  box.value!.scrollTop = 520_520_520; // 更新滚动位置 (此时 DOM 已更新)
};
</script>

<template>
  <div ref="box" class="border-1 h-30 w-50 overflow-auto">
    <div class="border-b-1 truncate" v-for="item in itemList" :key="item.id">
      {{ item }}
    </div>
  </div>
  <div>
    <textarea v-model="inputVal" type="text" class="my-3 border-1" />
    <div class="flex gap-5">
      <button @click="addItem">addItem</button>
      <button @click="addItem2">addItem2</button>
      <button @click="addItem3">addItem3</button>
    </div>
  </div>
</template>
```

## `scoped` 样式隔离, `:deep()` 样式穿透

### `scoped` 样式隔离

1. 通过 PostCSS, 为 DOM 添加唯一的 `data-v-<hash>` 属性
2. CSS 使用 `selector[data-v-<hash>]` 选择器, 以实现样式隔离

::: code-group

```vue [ParentDemo.vue]
<script setup lang="ts">
import ChildDemo from "./ChildDemo.vue";
</script>

<template>
  <main class="box wrap">
    <ChildDemo class="box" />
  </main>

  <div class="box my-rounded"></div>
</template>

<style lang="css" scoped>
.box {
  width: 10rem;
  height: 10rem;
}

.wrap {
  margin: 2rem;
}

.my-rounded {
  background: #ecfcca;
  border-radius: 5rem;
}
</style>
```

```vue [ChildDemo.vue]
<template>
  <section>
    <div class="bg-lime-100 h-[100%]" />
  </section>
</template>
```

```html [HTML]
<!-- @prettier-ignore -->
<main data-v-0123abcd class="box wrap">
  <section data-v-0123abcd class="box">
    <div class="bg-lime-100 h-[100%]"></div>
  </section>
</main>
<div data-v-0123abcd class="box my-rounded"></div>
```

```css [CSS]
.box[data-v-0123abcd] {
  width: 10rem;
  height: 10rem;
}
.wrap[data-v-0123abcd] {
  margin: 2rem;
}
.my-rounded[data-v-0123abcd] {
  background: #ecfcca;
  border-radius: 5rem;
}
```

:::

### `:deep()` 样式穿透

::: code-group

```vue [ParentDemo.vue]
<script setup lang="ts">
import ChildDemo from "./ChildDemo.vue";
</script>

<template>
  <main class="box wrap">
    <ChildDemo class="box child-bg" />
  </main>
</template>

<style lang="css" scoped>
.box {
  width: 10rem;
  height: 10rem;
}

.wrap {
  margin: 2rem;
}

/* .wrap .child-bg { // [!code --] */
.wrap :deep(.child-bg) {
  background: lightblue;
}
</style>
```

```vue [ChildDemo.vue]
<template>
  <section>
    <div class="h-[100%] child-bg" />
  </section>
</template>

<style lang="css" scoped>
.child-bg {
  background: lightpink;
}
</style>
```

```html [HTML]
<!-- @prettier-ignore -->
<main data-v-0123abcd class="box wrap">
  <section data-v-4567efgh data-v-0123abcd class="box child-bg">
    <div data-v-4567efgh class="h-[100%] child-bg"></div>
  </section>
</main>
```

```html [CSS (未使用样式穿透)]
<!-- ParentDemo -->
<style type="text/css">
  .box[data-v-0123abcd] {
    width: 10rem;
    height: 10rem;
  }
  .wrap[data-v-0123abcd] {
    margin: 2rem;
  }
  .wrap .child-bg[data-v-0123abcd] {
    background: lightblue;
  }
</style>

<!-- ChildDemo -->
<style type="text/css">
  .child-bg[data-v-4567efgh] {
    background: lightpink;
  }
</style>
```

```html [CSS (使用样式穿透)]
<!-- ParentDemo -->
<style type="text/css">
  .box[data-v-0123abcd] {
    width: 10rem;
    height: 10rem;
  }
  .wrap[data-v-0123abcd] {
    margin: 2rem;
  }
  .wrap[data-v-0123abcd] .child-bg {
    background: lightblue;
  }
</style>

<!-- ChildDemo -->
<style type="text/css">
  .child-bg[data-v-4567efgh] {
    background: lightpink;
  }
</style>
```

:::

## `:slotted` 插槽选择器, `:global` 全局选择器

### `:slotted()` 插槽选择器

::: code-group

```vue [ParentDemo.vue]
<script setup lang="ts">
import ChildDemo from "./ChildDemo.vue";
</script>

<template>
  <ChildDemo>
    <div class="parent-bg">插入到子组件的匿名插槽 default</div>
  </ChildDemo>
</template>
```

```vue [ChildDemo.vue]
<template>
  <!-- 匿名插槽 name="default" -->
  <slot />
</template>

<style lang="css" scoped>
/* .parent-bg { // [!code --] */
:slotted(.parent-bg) {
  background: lightpink;
}
</style>
```

:::

### `:global` 全局选择器

1. 全局选择器: 使用 `:global` 的选择器, 不会被 vite 编译
2. `<style lang="css">` 中的选择器, 是全局选择器
3. `<style lang="css" scoped>` 中, 并使用 `:global` 的选择器, 也是全局选择器

### `v-bind` 动态 CSS

```vue
<script setup lang="ts">
import { ref } from "vue";

const bg = ref("#000");
const text = ref({ color: "#fff" });

setInterval(() => {
  bg.value = bg.value === "#fff" ? "#000" : "#fff";
  text.value.color = text.value.color === "#fff" ? "#000" : "#fff";
}, 1000);
</script>

<template>
  <div class="box w-20 h-20 border-1">v-bind: Dynamic CSS</div>
</template>

<style scoped lang="css">
.box {
  background: v-bind(bg);
  color: v-bind("text.color");
}
</style>
```

### CSS 模块化

```vue
<script setup lang="ts">
import { useCssModule } from "vue";

const styles = useCssModule(); // 默认模块 $style
const customStyles = useCssModule("customName"); // 自定义模块名 customName
console.log("styles:", styles);
console.log("customStyles:", customStyles);
</script>

<template>
  <main class="flex flex-col gap-5">
    <!-- 默认模块 $style -->
    <div :class="$style.box">CSS Module</div>
    <div :class="styles.box">CSS Module</div>
    <!-- class 可以绑定数组 -->
    <div :class="[$style.box, styles.border]">CSS Module</div>
    <!-- 可以自定义模块名 -->
    <div :class="[$style.box, customName.bg]">CSS Module</div>
    <div :class="[styles.box, customStyles.bg]">CSS Module</div>
  </main>
</template>

<style module lang="css">
.box {
  width: 5rem;
  height: 5rem;
  background: lightblue;
}

.border {
  border: 1px solid #333;
}
</style>

<!-- 可以自定义模块名 -->
<style module="customName">
.bg {
  background: lightpink;
}
</style>
```

## H5 适配

```html
<!-- h5 适配: 设置 meta 标签 -->
<meta name="viewport" content="width=device-width,initial-scale=1" />
```

### 圣杯布局 + 全局字体大小

圣杯布局: 两侧盒子宽度固定, 中间盒子宽度自适应的三栏布局

- rem: 相对 `<html>` 根元素的字体大小
- vw/vh: 相对视口 viewport 的宽高, 1vw 是视口宽度的 1%, 1vh 是视口高度的 1%
- 百分比: 相对父元素的宽高

全局字体大小原理

- 定义 :root 伪类选择器的全局 CSS 变量, 所有页面都可以使用
- :root 伪类选择器和 html 元素选择器都选中 `<html>` 根元素, 但是 :root 伪类选择器的优先级更高

```vue
<script setup lang="ts">
import { useCssVar } from "@vueuse/core";

const setGlobalFontSize = (pxVal: number) => {
  const fontSize = useCssVar("--font-size");
  fontSize.value = `${pxVal}px`;
  // 底层: document.documentElement.style.setProperty('--font-size', `${pxVal}px`)
};
</script>

<template>
  <header class="flex">
    <div class="w-[100px] bg-lime-200 my-div">left</div>
    <div class="flex-1 bg-blue-300 my-div">
      center
      <button class="mx-[10px]" @click="setGlobalFontSize(36)">大号字体</button>
      <button class="mx-[10px]" @click="setGlobalFontSize(24)">中号字体</button>
      <button class="mx-[10px]" @click="setGlobalFontSize(12)">小号字体</button>
    </div>
    <div class="w-[100px] bg-lime-200 my-div">right</div>
  </header>
</template>

<style scoped lang="css">
@reference "tailwindcss";

.my-div {
  @apply h-[100px] leading-[100px] text-slate-500 text-center;
  font-size: var(--font-size);
}
</style>
```

### 编写 postcss 插件

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { Plugin } from "postcss";

// pnpm i postcss -D
function postcssPluginPx2viewport(): Plugin {
  return {
    postcssPlugin: "postcss-plugin-px2viewport",
    Declaration(node) {
      if (node.value.includes("px")) {
        // console.log(node.prop, node.value);
        const val = Number.parseFloat(node.value);
        node.value = `${((val / 375) /** 设计稿宽度 375 */ * 100).toFixed(2)}vw`;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      // 自定义 postcss 插件
      plugins: [postcssPluginPx2viewport()],
    },
  },
});
```

## Vue 函数式编程

```vue
<script setup lang="ts">
import { h } from "vue";

interface IProps {
  type: "primary" | "danger";
}

// Vue 函数式编程
const Btn = (props: IProps, ctx: any /** { attrs, emit, slots } */) => {
  console.log("[btn] ctx", ctx);
  return h(
    "button", // type
    {
      style: { color: props.type === "primary" ? "lightblue" : "lightcoral" },
      onClick: () => {
        console.log(ctx);
      },
    }, // props
    ctx.slots.default(), // children
  );
};
</script>

<template>
  <Btn type="primary">primary</Btn>
  <Btn type="danger">danger</Btn>
</template>
```

## Vue 宏函数

- defineProps
- defineEmits
- defineOptions
- defineSlots

### defineSlots

::: code-group

```vue [ParentDemo.vue]
<script setup lang="ts">
import ChildDemo from "./ChildDemo.vue";
const list = [
  { name: "love", age: 1 },
  { name: "you", age: 2 },
];
</script>

<template>
  <main>
    <ChildDemo :defaultList="list" :namedList="list">
      <!-- item 先通过子组件的 props 父传子,
      再通过子组件的 slot 子传父 -->
      <template #default="{ item }">
        <div>defaultSlot {{ `name: ${item.name}, age: ${item.age}` }}</div>
      </template>

      <template #named="{ item }">
        <div>namedSlot {{ `name: ${item.name}, age: ${item.age}` }}</div>
      </template>
    </ChildDemo>
  </main>
</template>
```

```vue [ChildDemo.vue]
<!-- 泛型支持 -->
<script generic="T extends object" setup lang="ts">
import { toRefs, type RenderFunction } from "vue";

const props = defineProps<{ defaultList: T[]; namedList: T[] }>();
const { defaultList, namedList } = toRefs(props);

defineSlots<{
  default(props: { item: T }): unknown;
  named(props: { item: T }): unknown;
}>();
</script>

<template>
  <main>
    <ul>
      <li v-for="(item, idx) of defaultList" :key="idx">
        <!-- 匿名的作用域插槽 -->
        <slot :item="item" />
      </li>
    </ul>

    <ul>
      <li v-for="(item, idx) of namedList" :key="idx">
        <!-- 具名的作用域插槽 -->
        <slot :item="item" name="named" />
      </li>
    </ul>
  </main>
</template>
```

:::

## 环境变量

在项目根目录下创建环境变量文件 `.env.development`, `.env.production`, 修改 `package.json`

::: code-group

```bash [.env.development]
VITE_CUSTOM_ENV = '[VITE_CUSTOM_ENV] development'
```

```bash [.env.production]
VITE_CUSTOM_ENV = '[VITE_CUSTOM_ENV] production'
```

```json [package.json]
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "run-p type-check \"build-only {@}\" --",
    "preview": "vite preview"
  }
}
```

```ts [pnpm dev]
console.log("import.meta.env:", import.meta.env);
// {
//   BASE_URL: '/',
//   DEV: true,
//   MODE: 'development',
//   PROD: false,
//   SSR: false
//   VITE_CUSTOM_ENV: '[VITE_CUSTOM_ENV] development'
// }
```

```ts [pnpm build && pnpm preview]
console.log("import.meta.env:", import.meta.env);
// {
//   BASE_URL: '/',
//   DEV: false,
//   MODE: 'production',
//   PROD: true,
//   SSR: false
//   VITE_CUSTOM_ENV: '[VITE_CUSTOM_ENV] production'
// }
```

:::

`vite.config.ts` 是 node 环境, 无法使用 `import.meta.env` 读取项目根目录下的环境变量文件

```ts
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  // mode: development
  console.log("mode:", mode);
  // loadEnv: { VITE_CUSTOM_ENV: '[custom_env] development' }
  console.log("loadEnv:", loadEnv(mode, process.cwd()));
  return defineConfig({ plugins: [vue()] });
};
```

## Vue 性能优化

### lighthouse

- 首次内容绘制 FCP, First Contentful Paint: 从页面开始加载到浏览器首次渲染出内容的时间 (用户首次看到内容的时间, 内容可以是首段文本或首张图片)
- 最大内容绘制 LCP, Largest Contentful Paint 视口内最大的内容元素完成渲染的时间
- 速度指数 SI, Speed Index: 页面的各个可视区域的平均渲染时间, 页面等待后端响应数据时, 会影响到 Speed Index
- 首次可交互时间 TTI, Time to Interactive: 从页面开始加载到用户可以与页面交互的时间, 此时页面渲染已完成, 交互元素绑定的事件已注册
- 总阻塞时间 TBT, Total Blocking Time: 从页面开始加载到首次可交互时间 (TTI) 期间, 主线程被阻塞的总时间
- 累积布局偏移 CLS, Cumulative Layout Shift: 比较两次渲染的布局偏移情况, 数值越小越好

### 分析打包产物

```ts
// pnpm install rollup-plugin-visualizer -D
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), visualizer({ open: true })],
  build: {
    // 代码块 (chunk) 大小 > 2000KB 时警告
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true, // 开启 CSS 拆分
    sourcemap: false, // 不生成源代码映射文件 source-map
    minify: "esbuild", // JS 最小化混淆
    cssMinify: "esbuild", // CSS 最小化混淆
    assetsInlineLimit: 5000, // 静态资源大小 < 5000B 时, 将内联为 base64
  },
});
```

## 自定义元素

### 原生 Web Component 自定义元素

优点: CSS, JS 隔离

::: code-group

```js [btn.js]
class Btn extends HTMLElement {
  constructor() {
    super();
    const shadowDOM = this.attachShadow({ mode: "open" });
    this.div = this.h("div");
    this.div.innerText = "d2vue-btn";
    this.div.setAttribute(
      "style",
      `width: 100px;
       height: 30px;
       line-height: 30px;
       text-align: center;
       border: 1px solid #ccc;
       border-radius: 15px;
       cursor: pointer;
       `,
    );
    shadowDOM.appendChild(this.div);
  }

  h(el) {
    return document.createElement(el);
  }

  connectedCallback() {
    console.log("[d2vue-btn] Connected");
  }
  disconnectedCallback() {
    console.log("[d2vue-btn] Disconnect");
  }
  adoptedCallback() {
    console.log("[d2vue-btn] Adopted");
  }
  attributeChangedCallback() {
    console.log("[d2vue-btn] Attribute changed");
  }
}

window.customElements.define("d2vue-btn", Btn);
```

```js [btn2.js]
class Btn2 extends HTMLElement {
  constructor() {
    super();
    const shadowDOM = this.attachShadow({ mode: "open" });
    this.template = this.h("template");
    this.template.innerHTML = `
      <style>
        .btn {
          width: 100px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          border: 1px solid #ccc;
          border-radius: 15px;
          cursor: pointer;
        }
      </style>
      <div class="btn">d2vue-btn2</div>`;
    shadowDOM.appendChild(this.template.content.cloneNode(true));
  }

  h(el) {
    return document.createElement(el);
  }
  connectedCallback() {
    console.log("[d2vue-btn2] Connected");
  }
  disconnectedCallback() {
    console.log("[d2vue-btn2] Disconnect");
  }
  adoptedCallback() {
    console.log("[d2vue-btn2] Adopted");
  }
  attributeChangedCallback() {
    console.log("[d2vue-btn2] Attribute changed");
  }
}

window.customElements.define("d2vue-btn2", Btn2);
```

```html [index.html]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="./btn.js"></script>
    <script src="./btn2.js"></script>
  </head>
  <body>
    <d2vue-btn></d2vue-btn>
    <d2vue-btn2></d2vue-btn2>
  </body>
</html>
```

:::

### Vue 中使用 Web Component 自定义元素

::: code-group

```ts [vite.config.ts]
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 文件名带 - , 文件拓展名 .ce.vue 的单文件组件, 视为 Web Component 自定义元素
          isCustomElement: (tag) => tag.startsWith("d2vue-"),
        },
      },
    }),
  ],
});
```

```vue [d2vue-btn.ce.vue]
<script setup lang="ts">
defineProps<{ item: { name: string; age: number } }>();
</script>

<template>
  <!-- 不能使用 tailwindcss -->
  <div class="btn">name: {{ item.name }}, age: {{ item.age }}</div>
</template>

<style lang="css" scoped>
.btn {
  width: 250px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 25px;
  cursor: pointer;
}
</style>
```

```vue [App.vue]
<script setup lang="ts">
import { defineCustomElement } from "vue";
import D2vueBtn from "@/components/d2vue-btn.ce.vue";

// Vue 中使用 Web Component 自定义元素
const Btn = defineCustomElement(D2vueBtn);
window.customElements.define("d2vue-btn", Btn);
const item = { name: "whoami", age: 23 };
</script>

<template>
  <d2vue-btn :item="item"></d2vue-btn>
</template>
```

:::

## Proxy 跨域

同源: 主机 (域名), 端口, 协议都相同

### JSONP

原理: HTML 文件的 `<script>` 标签没有跨域限制

::: code-group

```html [frontend (localhost:5500)]
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script>
      function jsonp(req /* { url, callback } */) {
        const script = document.createElement("script");
        const url = `${req.url}?callback=${req.callback.name}`;
        script.src = url;
        // 浏览器请求该 <script> 标签的 src
        // 响应: frontendFn({"data":"I love you"})
        document.getElementsByTagName("head")[0].appendChild(script);
      }

      function frontendFn(res) {
        alert(`res.data: ${res.data}`);
      }

      // frontendFn.name: frontendFn
      console.log("frontendFn.name:", frontendFn.name);
      jsonp({ url: "http://localhost:8080", callback: frontendFn });
    </script>
  </head>
  <body></body>
</html>
```

```js [backend (localhost:8080)]
import http from "node:http";
import urllib from "node:url";

const port = 8080;
const cbParams = { data: "I love you" };
http
  .createServer((req, res) => {
    const params = urllib.parse(req.url, true);
    if (params.query.callback) {
      // callback: frontendFn
      console.log("callback:", params.query.callback);
      // JSONP, JSON with Padding
      const jsonWithPadding = `${params.query.callback}(${JSON.stringify(cbParams)})`;
      // jsonWithPadding: frontendFn({"data":"I love you"})
      console.log("jsonWithPadding:", jsonWithPadding);
      res.end(jsonWithPadding);
    } else {
      res.end();
    }
  })
  .listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
```

:::

### Vite 代理

```ts
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### 后端允许跨域

```js
function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  // res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Content-type", "application/json;charset=utf-8");
  // 预检 (pre-flight) 请求
  if (req.method.toUpperCase() === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
}
```
