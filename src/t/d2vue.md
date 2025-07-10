# Vue3 高级

## 缓存组件 `<KeepAlive />`

1. 默认缓存 `<KeepAlive />` 内部的所有组件
2. include 包含属性: 缓存指定 name 的组件, 支持 `string` (可以以逗号分隔), `RegExp` 或 `(string | RegExp)[]`
3. exclude 属性: 不缓存指定 name 的组件
4. max 属性: 最大缓存组件数, 如果实际组件数 > max, 则使用 LRU 算法计算具体缓存哪些组件

::: code-group

```vue [ParentDemo]
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

```vue [BoyDemo]
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

```vue [GirlDemo]
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
  <!-- tag="htmlTagName" tag 属性为多个列表项包裹一层 htmlTagName 标签 -->
  <div class="wrapper">
    <TransitionGroup
      tag="main"
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__bounceOut"
    >
      <div class="item" v-for="(item, idx) of list" :key="idx">{{ item }}</div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.wrapper > main {
  border: 1px solid #333;
  display: flex;
  // flex-wrap: nowrap; // 单行 flex 容器
  flex-wrap: wrap; // 多行 flex 容器
  gap: 1rem;
}
</style>
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

```vue [ParentDemo]
<script setup lang="ts">
import { ref } from "vue";
import ChildDemo from "./ChildDemo.vue";

const text = ref<string>("Awesome Vue3");
</script>

<template>
  ParentDemo
  <div>text: {{ text }}</div>
  <ChildDemo v-model:textVal.myModifier="text" />
  <ChildDemo :textVal="text" @update:textVal="(newVal) => (text = newVal)" />
</template>
```

```vue [ChildDemo]
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
// mock 后端返回的数据
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

```vue [ParentDemo]
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

```vue [ChildDemo]
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

```vue [ParentDemo]
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

```vue [ChildDemo]
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
<main data-v-0483219d class="box wrap">
  <section data-v-5733c3a6 data-v-0483219d="" class="box child-bg">
    <div data-v-5733c3a6 class="h-[100%] child-bg"></div>
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

```vue [ParentDemo]
<script setup lang="ts">
import ChildDemo from "./ChildDemo.vue";
</script>

<template>
  <ChildDemo>
    <div class="parent-bg">插入到子组件的匿名插槽 default</div>
  </ChildDemo>
</template>
```

```vue [ChildDemo]
<template>
  <div>
    <!-- 匿名插槽 name="default" -->
    <slot />
  </div>
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

1. 不加 `scoped`, 就是全局选择器
2. 加 `scoped`, 并使用 `:global(selector) {}`, 也是全局选择器

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

- rem: 相对 `<html />` 根元素的字体大小
- vw/vh: 相对视口 viewport 的宽高, 1vw 是视口宽度的 1%, 1vh 是视口高度的 1%
- 百分比: 相对父元素的宽高

全局字体大小原理

- 定义 :root 伪类选择器的全局 CSS 变量, 所有页面都可以使用
- :root 伪类选择器和 html 元素选择器都选中 `<html />` 根元素, 但是 :root 伪类选择器的优先级更高

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

h 函数原理是 `createVNode`, 优点是跳过了模板的编译 (`<template>` ==parser=> AST ==transformer=> JS API ==generator=> render 渲染函数)

```vue
<script setup lang="ts">
import { h, reactive } from "vue";

const list = reactive([
  { id: 1, name: "item1", age: 11 },
  { id: 2, name: "item2", age: 22 },
  { id: 3, name: "item3", age: 33 },
]);

interface IProps {
  type: "success" | "error";
}

// Vue 函数式编程
const OperateButton = (props: IProps, ctx: any /** { emit, slots } */) => {
  return h(
    /* HyperScript */ "button", // type
    {
      style: { color: props.type === "success" ? "green" : "red" },
      onClick: () => {
        console.log(ctx);
      },
    }, // props
    ctx.slots.default(), // children
  );
};
</script>

<template>
  <main>
    <table>
      <thead>
        <tr>
          <th>name</th>
          <th>age</th>
          <th>operate</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item of list" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.age }}</td>
          <td>
            <OperateButton type="success">修改</OperateButton>
            <OperateButton type="error">删除</OperateButton>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
```

## Vue 编译宏

### defineProps, defineEmits

::: code-group

```vue [父组件]
<script setup lang="ts">
import VueMacroChild from "./VueMacroChild.vue";
</script>

<template>
  <main>
    <VueMacroChild
      :name="['whoami']"
      @my-groupies="(...args) => console.log(args)"
    ></VueMacroChild>
  </main>
</template>
```

```vue [子组件]
<!-- <script setup lang="ts">
// import type { PropType } from 'vue'
// const props = defineProps({
//   name: { type: Array as PropType<string[]>, required: true },
// })
const props = defineProps<{
  name: string[]
}>()
</script> -->

<!-- 泛型支持 -->
<script generic="T /** extends object */" lang="ts" setup>
const props = defineProps<{
  name: T[];
}>();
console.log(props.name);
// const emit = defineEmits(['eventName'])
const emit = defineEmits<{
  // <eventName>: <expected arguments>
  // (eventName: string, arg: number, arg2: string): void;
  myGroupies: [arg: number, arg2: string]; // 命名元组语法
}>();
</script>

<template>
  <main>
    <button @click="emit('myGroupies', 1, 'arg')"></button>
  </main>
</template>
```

:::

### defineOptions

```ts
defineOptions({
  // 属性和 Options API 相同: data, methods, render, ...
  // 不能定义 props 和 emits, 使用 defineProps, defineEmits
  name: "VueMacroChild",
});
```

### defineSlots

::: code-group

```vue [父组件]
<script setup lang="ts">
import DefineSlotChild from "./DefineSlotChild.vue";
const list = [
  {
    name: "item1",
    age: 1,
  },
  {
    name: "item2",
    age: 2,
  },
];
</script>

<template>
  <main>
    <DefineSlotChild :list="list">
      <!-- item 先通过子组件的 props 父传子,
      再通过子组件的 slot 子传父, v-slot 等价于 # -->
      <template #default="{ item, idx }">
        <div>{{ `idx: ${idx}, name: ${item.name}, age: ${item.age}` }}</div>
      </template>
    </DefineSlotChild>
  </main>
</template>
```

```vue [子组件]
<!-- 泛型支持 -->
<script generic="T extends object" setup lang="ts">
import { toRef } from "vue";
const props = defineProps<{ list: T[] }>();
const list = toRef(props, "list");
defineSlots<{
  default(props: { item: T; idx: number }): void;
}>();
</script>

<template>
  <main>
    <ul>
      <li v-for="(item, idx) of list" :key="idx">
        <!-- 匿名插槽 -->
        <slot :item="item" :idx="idx"></slot>
      </li>
    </ul>
  </main>
</template>
```

:::

## 环境变量

在项目根目录下创建 `.env.development`, `.env.production`, 修改 `package.json`

::: code-group

```bash [.env.development]
VITE_HTTP = 'http://121.41.121.204:8080'
```

```bash [.env.production]
VITE_HTTP = 'http://121.41.121.204:80'
```

```json [package.json]
{
  "scripts": {
    "dev": "vite --mode development"
  }
}
```

:::

使用 `import.meta.env` 读取项目根目录下的 `.env.development`, `.env.production`

```ts
//! pnpm dev
console.log("import.meta.env:", import.meta.env);
// {
//   BASE_URL: '/',
//   DEV: true,
//   MODE: 'development',
//   PROD: false,
//   SSR: false
//   VITE_HTTP: 'http://121.41.121.204:8080'
// }
```

`vite.config.ts` 是 Node.js 环境, 无法使用 `import.meta.env` 读取项目根目录下的 `.env.development`, `.env.production`

```ts{7}
import { defineConfig, loadEnv } from "vite";
// export default defineConfig({/** ... */});

// console.log(process.env)
export default ({ mode }: { mode: string }) => {
  console.log("mode:", mode); // mode: development
  console.log(loadEnv(mode, process.cwd())); // { VITE_HTTP: 'http://121.41.121.204:8080' }
  return defineConfig({
    /** ... */
  });
};
```

## 使用 [Webpack](https://webpack.docschina.org/concepts/) 构建 Vue3 项目

见 [vue-webpack](https://github.com/161043261/type/tree/main/awesome/vue-webpack)

## Vue3 性能优化

检查 -> Lighthouse -> 分析网页加载情况

- FCP, First Contentful Paint 首次内容绘制时间: 从页面开始加载到浏览器首次渲染出内容的时间 (用户首次看到内容的时间, 内容: 首个文本或首张图片)
- SI, Speed Index 速度指数: 页面的各个可视区域的平均绘制时间, 页面等待后端发送的数据时, 会影响到 Speed Index
- LCP, Largest Contentful Paint 最大 DOM 元素的绘制时间
- TTI, Time to Interactive 首次可交互时间: 从页面开始加载到用户与页面可以交互的时间, 此时页面渲染已完成, 交互元素绑定的事件已注册
- TBT, Total Blocking Time 总阻塞时间: 从页面开始加载到首次可交互时间 (TTI) 期间, 主线程被阻塞, 无法与用户交互的总时间
- CLS, Cumulative Layout Shift 累积布局偏移: 比较两次渲染的布局偏移情况

### 分析 Vite 项目打包后的代码体积

```bash
# 适用于 vite 项目, vite 基于 rollup
pnpm install rollup-plugin-visualizer -D
# 适用于 webpack 项目
pnpm install webpack-bundle-analyzer -D
```

`vite.config.ts` 中使用 `rollup-plugin-visualizer` 插件

```ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer({ open: true })],
  build: {
    // 代码块 (chunk) 大小 >2000 KiB 时警告
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true, // 开启 CSS 拆分
    sourcemap: false, // 不生成源代码映射文件 sourcemap
    minify: "esbuild", // 最小化混淆, esbuild 打包速度最快, terser 打包体积最小
    cssMinify: "esbuild", // CSS 最小化混淆
    assetsInlineLimit: 5000, // 静态资源大小 <5000 Bytes 时, 将打包为 base64
  },
});
```

### PWA 渐进式 Web 应用程序, 离线缓存技术

1. 可以添加到桌面, 基于 manifest 实现
2. 可以离线缓存, 基于 service worker 实现
3. 可以发送应用程序通知, 基于 service worker 实现

```bash
pnpm install vite-plugin-pwa
pnpm install -g http-server
pnpm build
cd dist && http-server -p 5173
```

vite.config.ts

```ts
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      // dist/manifest.webmanifest, dist/sw.js
      workbox: {
        cacheId: "d2vue", // 缓存名
        runtimeCaching: [
          {
            urlPattern: /.*\.js.*/, // 缓存文件
            handler: "StaleWhileRevalidate", // 重新验证时失效
            options: {
              cacheName: "d2vue-js",
              expiration: {
                maxEntries: 30, // 最大缓存文件数量, LRU 算法
                maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存有效期
              },
            },
          },
        ],
      },
    }),
  ],
});
```

- 虚拟滚动列表, 参考 element-plus [Virtualized Table 虚拟化表格](https://element-plus.org/zh-CN/component/table-v2.html)
- WebWorker 多线程: vue-use `useWebWorker`
- 防抖, 节流: vue-use `useDebounceFn, useThrottleFn`

## Web Component 自定义元素

### 原生自定义元素

::: code-group

```js [btn.js]
class Btn extends HTMLElement {
  constructor() {
    super();
    // shallow DOM: 样式隔离
    const shallowDom = this.attachShadow({ mode: "open" });
    this.p = this.h("p");
    this.p.innerText = "d2vue Btn";
    this.p.setAttribute(
      "style",
      `width: 100px;
       height: 30px;
       line-height: 30px;
       text-align: center;
       border: 1px solid #ccc;
       border-radius: 5px;
       cursor: pointer;
       `,
    );
    shallowDom.appendChild(this.p);
  }

  h /**HyperScript */(el) {
    return document.createElement(el);
  }
}

window.customElements.define("d2vue-btn", Btn);
```

```js [btn2.js]
class Btn2 extends HTMLElement {
  constructor() {
    super();
    // shallow DOM: 样式隔离
    const shallowDom = this.attachShadow({ mode: "open" });
    this.template = this.h("template");
    this.template.innerHTML = `
      <style>
      p {
        width: 100px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
      }
      </style>
      <p>d2vue Btn2</p>`;
    shallowDom.appendChild(this.template.content.cloneNode(true));
  }

  h /**HyperScript */(el) {
    return document.createElement(el);
  }
  connectedCallback() {
    console.log("Connected");
  }
  disconnectedCallback() {
    console.log("Disconnect");
  }
  adoptedCallback() {
    console.log("Adopted");
  }
  attributeChangedCallback() {
    console.log("Attribute changed");
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
    <title>Native Custom Element</title>
    <script src="./btn.js"></script>
    <script src="./btn2.js"></script>
  </head>
  <body>
    <d2vue-btn></d2vue-btn>
    <d2vue-btn2 />
  </body>
</html>
```

:::

### Vue 自定义元素

vite.config.ts

```ts
import { defineConfig /** , loadEnv */ } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 文件名后缀为 .ce.vue 的文件, 前缀为 d2vue-, 将被视为自定义元素
          isCustomElement: (tag) => tag.startsWith("d2vue-"),
        },
      },
    }),
  ],
});
```

::: code-group

```vue [d2vue-btn.ce.vue]
<script setup lang="ts">
defineProps<{ item: { name: string; age: number } }>();
</script>

<template>
  <p>name: {{ item.name }}, age: {{ item.age }}</p>
</template>

<style scoped lang="css">
p {
  width: 200px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}
</style>
```

```vue [App.vue]
<script lang="ts" setup>
import D2vueBtn from "@/components/d2vue-btn.ce.vue";
import { defineCustomElement } from "vue";
// 自定义元素
const Btn = defineCustomElement(D2vueBtn);
window.customElements.define("d2vue-btn", Btn);
const item = { name: "whoami", age: 22 };
</script>

<template>
  <div>
    <d2vue-btn
      :item="item /** 较早版本需要 JSON.stringify(item) */"
    ></d2vue-btn>
  </div>
</template>
```

:::

## Proxy 跨域

同源: 两个 URL 的协议, 端口和主机都相同

### JSONP

原理: HTML 文件的 `<script>` 标签没有跨域限制

::: code-group

```html [frontend -> localhost:5500]
<script>
  function jsonp(req) {
    const script = document.createElement("script");
    const url = `${req.url}?callback=${req.callback.name}`;
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }
  function namedCallback(res) {
    alert(`JSONP: ${res.data}`);
  }
  jsonp({
    url: "http://localhost:8080",
    callback: namedCallback,
  });
</script>
```

```js [backend -> localhost:8080]
import http from "node:http";
import urllib from "node:url";

const port = 8080;
const replyArgs = { data: "200" };
http
  .createServer((req, res) => {
    const params = urllib.parse(req.url, true);
    if (params.query.callback) {
      console.log("callback:", params.query.callback); // callback: namedCallback
      //                                      jsonp
      const chunk = `${params.query.callback}(${JSON.stringify(replyArgs)})`;
      console.log("chunk:", chunk); // chunk: namedCallback({"data":"200"})
      res.end(chunk);
    } else {
      res.end();
    }
  })
  .listen(port, () => {
    console.log(`Server: http://localhost:${port}`);
  });
```

:::

### 后端设置 CORS, 允许跨域资源共享

```json
{
  "Access-Control-Allow-Origin": "https://121.41.121.204", // 指定主机可访问
  "Access-Control-Allow-Origin": "*" // 任意主机可访问, 不安全
}
```

### Vite 代理

::: code-group

```js [backend -> localhost:8080]
import express from "express";
const port = 8080;
const app = express();

app.get("/user", (req, res) => {
  res.json({
    code: 200,
    message: "200",
  });
});

app.listen(port, () => {
  console.log(`Server: http://localhost:${port}`);
});
```

```ts [vite.config.ts]
export default defineConfig({
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

```vue [frontend -> localhost:5173]
<script lang="ts" setup>
// fetch('http://localhost:8080/user')
fetch("/api/user")
  .then((res) => res.json())
  .then((data) => console.log(data));
</script>
```

:::
