# React

## React 特点

1. 组件化
2. 虚拟 DOM: 虚拟 DOM 是描述真实 DOM 的 JS 对象; 数据改变时, 不直接操作真实 DOM, 创建一个新的虚拟 DOM, 对比旧的虚拟 DOM, 使用 diff 算法找到最小更新, 将最小更新提交到真实 DOM 上, 以提高性能
3. 单向数据流: 父组件通过 props 将数据传递给子组件, 子组件不能直接修改父组件的数据
4. 组件挂载即首次渲染, 组件更新即重新渲染

## 对比 Vue 和 React 的 main.ts

::: code-group

```tsx [React @/main.tsx]
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```ts [Vue @/main.ts]
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);
app.mount("#app");
```

:::

## JSX

```tsx
function App() {
  const htmlSnippet = '<div style="color: skyblue">whoami</div>';
  // 类似 v-html
  return <div dangerouslySetInnerHTML={{ __html: htmlSnippet }}></div>;
}
```

## Babel

1. ES6 => ES5: JS 语法降级
2. polyfill: 使得 JS 新功能在旧浏览器中可用
3. JSX => JS: 将 JSX 语法转换为 JS 语法
4. 自定义 Babel 插件

```bash
pnpm install @babel/core @babel/cli @babel/preset-env @babel/preset-react -D
```

## 虚拟 DOM

虚拟 DOM 是描述真实 DOM 的 JS 对象; 数据改变时, 不直接操作真实 DOM, 创建一个新的虚拟 DOM, 对比旧的虚拟 DOM, 使用 diff 算法找到最小更新, 将最小更新提交到真实 DOM 上, 以提高性能

优点: 性能好 (diff 算法)、跨平台 (web 端, 移动端)

## Fiber 架构

Fiber 架构: 解决大组件更新时的卡顿问题

- 可中断的渲染
- 优先级调度
- 双缓存树
- 时间分片、任务切片

### Fiber 架构的 4 个目标

1. 可中断的渲染: Fiber 架构下, React 可以将大渲染任务切片为多个工作单元 (unitOfWork), Fiber 树的一个节点代表一个工作单元, 使得 React 可以在浏览器空闲时 (类似 requestIdleCallback) 执行低优先级的工作单元; 浏览器需要执行高优先级的任务时, 例如用户输入时, 可以先暂停渲染、执行高优先级任务, 再恢复渲染
2. 优先级调度: Fiber 架构下, React 可以根据任务优先级决定调度顺序, React 优先执行动画、用户交互等高优先级任务, 例如用户输入; 延迟执行低优先级任务, 例如数据加载后的页面渲染, 同时任务有 timeout 过期时间, 过期时间越短, 优先级越高
   - Immediate: 立即执行, 例如动画
   - UserBlocking: 用户交互
   - Normal: 默认
   - Low: 低优先级
   - Idle: 空闲时执行
3. 双缓存树 (Fiber Tree): 保证更新的原子性, 避免页面卡顿 (参考双缓存树)
4. 任务切片: React 通过时间分片, 将大渲染任务切片为多个工作单元 (unitOfWork), 低优先级的工作单元可以在浏览器空闲时执行 (类似 requestIdleCallback), 避免一次性完成大渲染任务 (即构建 workInProgressFiberTree), 导致主渲染线程阻塞

### 双缓存树

React 中有两颗 Fiber 树

- currentFiberTree 当前渲染的 Fiber 树, 保存更新前的状态
- workInProgressFiberTree 当前处理的 Fiber 树, 保存更新后的状态
- 直接修改 currentFiberTree, 会导致页面卡顿, 页面同步更新, 不可中断
- 协调阶段 reconcile 和提交阶段 commit
  - 协调阶段: 计算副作用, 构建 workInProgressFiberTree; 即预计算更新后的页面, 使用 diff 算法复用 fiber 节点, 找到最小更新, 协调阶段异步更新, 可以中断
  - 提交阶段: 预计算完成后, 更新 currentFiberTree = workInProgressFiberTree, 将最小更新 (最小 DOM 操作) 提交到真实 DOM 上, 保证更新的原子性, 避免页面卡顿

### 浏览器在 1 帧中做了什么

对于 60fps 的屏幕, 1 帧是 1000/60 = 16.7ms, 浏览器在 1 帧中:

1. 处理用户事件: 例如 change, click, input 等
2. 执行定时器回调函数
3. 执行 requestAnimationFrame
4. 回流和重绘: 回流 reflow, 有关宽高等, 性能开销大; 重绘 repaint, 有关颜色等, 性能开销小
5. 如果有空闲时间, 则执行 requestIdleCallback (例如 idle 期间可以懒加载 JS 脚本)

### requestIdleCallback, React 调度器

requestIdleCallback: 当前帧的空闲时间, 执行传递的 callback; callback 有两个参数 deadline, options

- deadline.timeRemaining() 当前帧的剩余时间 (ms)
- deadline.didTimeout() 返回是否因为超时而强制执行 callback
- options: 例 `{ timeout: 1000 }`, 指定超时时间, 如果 1000ms 内没有空闲时间, 则强制执行 callback

```js
// requestIdleCallback 案例
const largeList: (() => void)[] = [];
const largeListLen = 1000;
function genLargeList() {
  for (let i = 0; i < largeListLen; i++) {
    largeList.push(() => {
      document.body.innerHTML += `<div>largeListItem-${i}</div>`;
    });
  }
}
genLargeList();

const workLoop: IdleRequestCallback = (deadline) => {
  if (deadline.timeRemaining() > 1 && largeList.length > 0) {
    const fn = largeList.shift()!;
    fn();
  }
  requestIdleCallback(workLoop);
};
requestIdleCallback(workLoop, { timeout: 1000 });
```

为什么 React 不使用原生的 requestIdleCallback, 而使用自定义的 scheduler 调度器

1. requestIdleCallback 兼容性较差
2. 优先级调度: React 有自定义的任务优先级 Immediate, UserBlocking, Normal, Low, Idle
3. 时间分片: requestIdleCallback 中 callback 执行间隔是 50ms; React 有自定义的时间分片

### requestIdleCallback 的替代方案 MessageChannel

1. MessageChannel 是宏任务, 1 帧内只执行 1 次
2. setTimeout 可能有 4ms 的最小延迟
3. 如果浏览器不支持 MessageChannel, 则会降级为 setTimeout

```js
// MessageChannel 案例
const msgChan = new MessageChannel();
msgChan.port1.onmessage = (ev) => {
  // msgChan.port1 receive: Message from msgChan.port2
  console.log("msgChan.port1 receive:", ev.data);
  msgChan.port1.postMessage("Reply from msgChan.port1");
};
msgChan.port2.onmessage = (ev) => {
  // msgChan.port2 receive: Reply from msgChan.port1
  console.log("msgChan.port2 receive:", ev.data);
};
msgChan.port2.postMessage("Message from msgChan.port2");
```

## JSX.Element, React.ReactElement, React.ComponentType, React.FC, React.ReactNode

- `React.ReactNode`: React 可以渲染的所有类型
- `JSX.Element`, `React.ReactElement`: 使用 `React.createElement()` 或 JSX 语法创建的元素的类型
- `React.ComponentType`: 组件 (函数组件, 类组件) 的类型
- `React.FC`, `React.FunctionComponent`: 函数组件的类型
- Vue 的 `VNode`: 是 `h` 函数的返回值类型
- Vue 的 `Component`: 组件 (选项式组件, 组合式组件) 的类型, 也是 `defineComponent` 函数的返回值类型
- Vue 的 `RenderFunction`: `type RenderFunction = () => VNode | VNode[]`

```tsx
type ReactNode =
  | null
  | undefined
  | boolean
  | number
  | string
  | ReactElement
  | ReactNode[];

const Comp: ReactFC<IProps> = (props) => <>Comp</>;

const hoc = (Comp: React.ComponentType<IProps>) => <Comp />;
```

### React.FC 的 children 属性

::: code-group

```tsx [ParentDemo.tsx]
import ChildDemo, { type IUser } from "./ChildDemo";

export default function ParentDemo() {
  return (
    <ChildDemo>
      {
        {
          DefaultSlot: (props: IUser) => (
            <div>
              DefaultSlot name: {props.name}, age: {props.age}
            </div>
          ),
          NamedSlot: (props: IUser) => (
            <div>
              NamedSlot name: {props.name}, age: {props.age}
            </div>
          ),
          ScopedSlot: (props: IUser) => (
            <div>
              ScopedSlot name: {props.name}, age: {props.age}
            </div>
          ),
        } /** children */
      }
    </ChildDemo>
  );
}
```

```tsx [ChildDemo.tsx]
export interface IUser {
  name: string;
  age: number;
}

interface IProps {
  children: {
    DefaultSlot: React.FC<IUser>;
    NamedSlot: React.FC<IUser>;
    ScopedSlot: React.FC<IUser>;
  };
}

const ChildDemo: React.FC<IProps> = (props: IProps) => {
  const {
    children: { DefaultSlot, NamedSlot, ScopedSlot },
  } = props;
  const defaultUser: IUser = { name: "default", age: 1 };
  const namedUser: IUser = { name: "named", age: 2 };
  const scopedUser: IUser = { name: "scoped", age: 3 };
  const users = [defaultUser, namedUser, scopedUser];

  return (
    <>
      <DefaultSlot {...defaultUser} />
      <NamedSlot {...namedUser} />
      {users.map((user, idx) => (
        <ScopedSlot {...user} key={idx} />
      ))}
    </>
  );
};

export default ChildDemo;
```

:::

React 和 Vue 都是单向数据流, 即子组件不能直接修改父组件通过 props 传递的数据, React 使用 `Object.freeze()` 冻结 props 对象

## 兄弟组件通信

mitt 发布/订阅库

```tsx
import { createRoot } from "react-dom/client";
import mitt from "mitt";

const emitter = mitt();

const handlerA = (args: unknown) => console.log("[handlerA] args:", args);
const handlerB = (args: unknown) => console.log("[handlerB] args:", args);
emitter.on("eventA", handlerA);
emitter.on("eventB", handlerB);
emitter.on("*", (evName, args) => console.log("[*]:", evName, args));

createRoot(document.getElementById("root")!).render(
  <>
    <button onClick={() => emitter.emit("eventA", { a: 1 })}>emitA</button>
    <button onClick={() => emitter.emit("eventB", { b: 2 })}>emitB</button>
    <button onClick={() => emitter.off("eventA", handlerA)}>offA</button>
    <button onClick={() => emitter.off("eventB", handlerB)}>offB</button>
    <button onClick={() => emitter.all.clear()}>clear</button>
  </>,
);
```

## 受控组件/非受控组件

- 受控组件: 组件的状态由 React 的 state 管理, 即数据双向绑定, 类似 Vue 的 v-model
- 非受控组件: 组件的状态不由 React 的 state 管理, 由 DOM 元素管理
- 特殊的非受控组件: `<input type="file" />`, 文件上传

```tsx
import { useRef, useState, type ChangeEvent } from "react";

export default function App() {
  const [val, setVal] = useState("val");
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setVal(ev.target.value);
    console.log("val:", ev.target.value);
  };

  let val2 = "val2";
  const inputRef = useRef<HTMLInputElement>(null);
  const handleInput2 = (ev: ChangeEvent<HTMLInputElement>) => {
    val2 = inputRef.current?.value ?? "";
    console.log("val2:", val2);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    console.log("files:", fileRef.current?.files);
  };

  return (
    <>
      {/* 受控组件 */}
      <input type="text" value={val} onChange={handleChange} />
      {/* 非受控组件 */}
      <input
        type="text"
        ref={inputRef}
        defaultValue={val2}
        onChange={handleInput2}
      />
      {/* 特殊的非受控组件 */}
      <input type="file" ref={fileRef} onChange={handleUpload} />
    </>
  );
}
```

## 状态不可变性

- 直接修改原对象/原数组, 不会触发组件更新
- 不是直接修改原对象/原数组, 而是返回一个新对象/新数组, 无需深层侦听, 可以提高性能

| 操作 | 不使用                         | 使用                                 |
| ---- | ------------------------------ | ------------------------------------ |
| 插入 | `push()`, `unshift()`          | `concat()`, ... 展开运算符           |
| 删除 | `pop()`, `shift()`, `splice()` | `filter()`, `slice()`, `toSpliced()` |
| 替换 | `arr[i] = newVal`, `splice()`  | `map()`, `toSpliced()`, `with()`     |
| 排序 | `reverse()`, `sort()`          | `toReversed()`, `toSorted()`         |

以下 4 个方法不会修改原数组, 返回一个新数组

- `toReversed()`: 逆序
- `toSorted()`: 升序排序
- `toSpliced()`: 指定位置插入删除
- `with()`: 指定位置替换

> [!warning]
> React 中, 所有的 hook (useXxx 函数) 只能在组件或自定义 hook 的顶层调用

## hook: useState

```js
const [state /** 状态 */, setState /** 更新状态的函数 */] =
  useState(initialVal | () => initialVal /** 状态的初始值 */);
```

- setState 异步更新 state 值, 以提高性能
- 调用 setState 异步更新 state 值时, 会触发组件更新
- 多次传入相同的 newVal 调用 `setState(newVal)` 时, React 跳过后续更新 (防抖)
- 对比传递一个新值 `setState(newVal)` 和传递一个更新函数 `setState((preVal) => newVal)`

```tsx
import { useState } from "react";

export default function App() {
  const [curVal, setCurVal] = useState(0);
  const handleClick = () => {
    // 传递一个新值 newVal
    setCurVal(curVal + 1);
    setCurVal(curVal + 1); // 跳过更新
    setCurVal(curVal + 1); // 跳过更新
    console.log("[handleClick] curVal:", curVal);
  };

  const handleClick2 = () => {
    // 传递一个更新函数 (preVal) => newVal
    setCurVal((curVal /** 1 */) => curVal + 1);
    setCurVal((curVal /** 2 */) => curVal + 1);
    setCurVal((curVal /** 3 */) => curVal + 1);
    console.log("[handleClick2] curVal:", curVal);
  };

  return (
    <>
      <div>curVal: {curVal}</div>
      <button onClick={handleClick}>curVal += 1</button>
      <button onClick={handleClick2}>curVal += 3</button>
    </>
  );
}
```

## hook: useReducer

useReducer 集中式状态管理

```js
const [
  state, // 状态

  // dispatch(action) => reducer(state, action)
  // dispatch 接收一个 action, 派发 reducer 的调用
  // 以根据不同的 action 更新状态, 并触发组件更新
  dispatch
] = useReducer(
  // reducer: (state, action) => newState
  // reducer 根据不同的 action 更新状态的纯函数
  reducer,

  // 状态的初始值
  initialVal,

  // 初始化状态的函数, 返回 (修改后的) initialVal
  // 如果传递了 init 函数, 则使用 init 函数的返回值作为状态的初始值, 否则使用 initialVal
  init?,
);
```

案例

```tsx
import { useReducer } from "react";

interface TState {
  cnt: number;
}

interface TAction {
  type: "add" | "sub";
  delta: number;
}

export default function App() {
  const initialVal: TState = { cnt: 0 };

  const reducer = (state: TState, action: TAction) => {
    switch (action.type) {
      case "add":
        return { cnt: state.cnt + action.delta };
      case "sub":
        return { cnt: state.cnt - action.delta };
      default:
        return state;
    }
  };

  const init = (state: TState) => {
    state.cnt += 528;
    return state; // { cnt: 528 }
  };

  const [state, dispatch] = useReducer(reducer, initialVal, init);
  return (
    <>
      <div>state.cnt: {state.cnt}</div>
      <button onClick={() => dispatch({ type: "add", delta: 1 })}>+1</button>
      <button onClick={() => dispatch({ type: "sub", delta: 1 })}>-1</button>
    </>
  );
}
```

## hook: useSyncExternalStore

订阅数据源的更新, 支持 SSR 服务器端渲染

- 可以订阅外部 store, 例如 zustand
- 可以订阅 Web API, 例如 localStorage, sessionStorage, history, location 等

```js
const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- subscribe 订阅数据源的更新, subscribe 接收 React 提供的 onStoreChange 回调函数, subscribe 返回取消订阅的函数
- onStoreChange 通知 React 数据源有更新, 通知 React 调用 getSnapshot 获取数据源的快照, 以更新 state, 触发组件更新
- getSnapshot 获取数据源的快照, 如果 getSnapshot 返回值的内存地址与上一个返回值的内存地址不同, 则会触发组件更新; 如果 getSnapshot 返回值的内存地址总是不同的, 则会报错 `Maximum update depth exceeded`
- getServerSnapshot: SSR 服务器端渲染时, 获取数据源快照, 可选

案例: 订阅 Web API: `window.localStorage` 的自定义 hook `useLocalStorage`

::: code-group

```ts [@/hooks/useLocalStorage.ts]
import { useSyncExternalStore } from "react";

type TCallback = () => void;
export default function useLocalStorage<T>(key: string, initialVal: T) {
  // subscribe 订阅数据源的更新
  // subscribe 接收 React 提供的 onStoreChange 回调函数
  // 数据源更新时, 调用 onStoreChange
  const subscribe = (onStoreChange: TCallback): TCallback => {
    // function() { checkIfSnapshotChanged(inst) && forceStoreRerender(fiber); }
    console.log("[subscribe] onStoreChange:", onStoreChange.toString());

    // onStoreChange 通知 React 数据源有更新
    // 通知 React 调用 getSnapshot 获取数据源的快照, 以更新 state, 触发组件更新
    window.addEventListener("storage", onStoreChange);

    // subscribe 返回取消订阅的函数
    return () => window.removeEventListener("storage", onStoreChange);
  };

  // getSnapshot 获取数据源的快照
  // 如果 getSnapshot 返回值的内存地址与上一个返回值的内存地址不同, 则会触发组件更新
  const getSnapshot = (): T => {
    const jsonStr = localStorage.getItem(key);
    // 如果 getSnapshot 返回值的内存地址总是不同的, 则会报错 Maximum update depth exceeded
    return jsonStr ? (JSON.parse(jsonStr) as T) : initialVal;
  };

  const state: T = useSyncExternalStore<T>(subscribe, getSnapshot);
  const setState = (newVal: T) => {
    localStorage.setItem(key, JSON.stringify(newVal));
    window.dispatchEvent(new StorageEvent("storage"));
  };

  return [state, setState] as const;
}
```

```tsx [@/App.tsx]
import useLocalStorage from "@/hooks/useLocalStorage";

export default function App() {
  const [cnt, setCnt] = useLocalStorage("cnt", 0);
  return (
    <>
      <div>cnt: {cnt}</div>
      <button onClick={() => setCnt(cnt + 1)}>+1</button>
      <button onClick={() => setCnt(cnt - 1)}>-1</button>
    </>
  );
}
```

:::

案例 2: 订阅 Web API: `window.location.href` 的自定义 hook `useHistory`

::: code-group

```ts [@/hooks/useHistory.ts]
import { useSyncExternalStore } from "react";

interface IUseLocationHref {
  (): [
    url: string,
    push: (url: string) => void,
    replace: (url: string) => void,
  ];
}

type TCallback = () => void;

export const useHistory: IUseLocationHref = () => {
  const subscribe = (onStoreChange: TCallback): TCallback => {
    window.addEventListener("popstate", onStoreChange);
    return () => window.removeEventListener("popstate", onStoreChange);
  };

  const getSnapshot = () => window.location.href;

  const url = useSyncExternalStore(subscribe, getSnapshot);

  const push = (url: string) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const replace = (url: string) => {
    window.history.replaceState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return [url, push, replace] as const;
};
```

```tsx [@/App.tsx]
import { useHistory } from "@/hooks/useHistory";

export default function App() {
  const [url, push, replace] = useHistory();
  return (
    <div>
      <div>url: {url}</div>
      <button onClick={() => push("/push")}>push</button>
      <button onClick={() => replace("/replace")}>replace</button>
    </div>
  );
}
```

:::

## hook: useTransition (perf)

useTransition 将某些更新标记为「过渡」更新, 即降低某些更新的优先级, React 先处理高优先级的更新, 例如用户输入; 延迟处理 "过渡" 更新, 例如网络请求、密集计算、渲染大量数据等

```js
// isPending = true: 正在过渡
// isPending = false: 过渡结束
const [
  isPending, // boolean
  startTransition, // (callback: () => void) => void
] = useTransition();
```

案例

::: code-group

```tsx [@/App.tsx]
import { useState, useTransition } from "react";

interface IUser {
  id: number;
  name: string;
  age: number;
}

// chrome: 性能 -> cpu: 4 倍降速
export default function App() {
  const [len, setLen] = useState(528);
  const [list, setList] = useState<IUser[]>([]);

  // 不阻塞 UI 的前提下更新 state
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal: string = e.target.value;
    setLen(Number.parseInt(newVal));

    fetch(`/api/list?len=${newVal}`)
      .then((res) => res.json())
      .then((res: { list: IUser[] }) => {
        console.log(res);
        startTransition(() => setList(res.list));
      });
  };

  return (
    <>
      <input type="number" value={len} onChange={handleChange} />
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {list.map((item) => (
            <li key={item.id}>
              <div>name: {item.name}</div>
              <div>age: {item.age}</div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

```ts [vite.config.ts]
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import url from "node:url";
import crypto from "node:crypto";

const vitePluginServer = (): Plugin => {
  return {
    name: "vite-plugin-server",
    configureServer(server) {
      server.middlewares.use("/list", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        const queryParams = url.parse(
          req.originalUrl!,
          true /** parseQueryString */,
        ).query;
        const { len } = queryParams;
        const resData = {
          list: Array.from(
            { length: Number.parseInt(len as string) },
            (_, idx) => ({
              id: idx,
              name: crypto.randomBytes(4).toString("hex"),
              age: Math.floor(Math.random() * 100),
            }),
          ),
        };
        setTimeout(() => res.end(JSON.stringify(resData)), 3000);
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginServer()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

:::

> [!important]
>
> `const [isPending, startTransition] = useTransition()`
>
> 传递给 startTransition 的回调函数必须同步执行状态更新

::: code-group

```js [错误案例 1]
// 错误: startTransition 执行结束后, 调用 setState 更新状态
startTransition(() => {
  setTimeout(() => {
    setState(newState);
  }, 3000);
}); // startTransition 执行结束, 但 setState(newState) 未执行
```

```js [正确案例 1]
// 正确: startTransition 执行时, 调用 setState 更新状态
setTimeout(() => {
  startTransition(() => {
    setState(newState);
  }); // startTransition 执行时, 同步执行 setState(newState)
}, 3000);
```

```js [错误案例 2]
// 错误: startTransition 执行结束后, 调用 setState 更新状态
startTransition(async () => {
  await fetch("http://localhost:5173");
  setState(newState);
}); // startTransition 执行结束, 但 fetch 未返回, setState(newState) 未执行
```

```js [正确案例 2]
// 正确: startTransition 执行时, 调用 setState 更新状态
await fetch("http://localhost:5173");
startTransition(() => {
  setState(newState);
}); // startTransition 执行时, 同步执行 setState(newState)
```

:::

原理: useTransition 将某些更新标记为低优先级

```js
// React 的优先级
const Immediate = 1; // 立即执行, 例如动画
const UserBlocking = 2; // 用户交互
const Normal = 3; // 用户交互
const Low = 4; // 低优先级
const Idle = 5; // 空闲时执行, 例如 console.log()
```

## hook: useDeferredValue (perf)

```js
const deferredVal = useDeferredValue(val);
```

根据设备的性能情况, 延迟某个值的更新 (将该值的更新标记为低优先级), 适用于频繁更新的值, 避免频繁更新导致的性能问题

### 对比 useTransition 和 useDeferredValue

1. useTransition 和 useDeferredValue 都是延迟更新, 用于性能优化
2. useTransition 关注状态的过渡, 例如大列表的渲染, 并且提供了过渡标识 `isPending`
3. useDeferredValue 关注某个值的延迟更新, 例如输入框的值
4. useDeferredValue 类似防抖: 连续调用, 只执行最后 1 次
5. useDeferredValue 不是防抖, 防抖有确定的延迟时间, useDeferredValue 没有确定的延迟时间, 而是根据设备的性能情况, 延迟某个值的更新

```tsx
import { useDeferredValue, useState } from "react";

export default function App() {
  const list = Array.from({ length: 1000 }, (_, idx) => {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return {
      id: idx,
      name: Array.from(arr, (b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 8),
      age: Math.floor(Math.random() * 100),
    };
  });

  const [val, setVal] = useState("");
  const deferredVal = useDeferredValue(val);
  const isDeferred = deferredVal !== val;
  const findItem = () => {
    console.log("[findItem] val:", val);
    console.log("[findItem] deferredVal:", deferredVal);
    console.log("[findItem] isDeferred:", isDeferred);
    return list.filter((item) => item.name.includes(deferredVal));
  };

  return (
    <>
      <input value={val} onChange={(e) => setVal(e.target.value)} />
      {findItem().map((item) => (
        <div key={item.id}>
          <div>name: {item.name}</div>
          <div>age: {item.age}</div>
        </div>
      ))}
    </>
  );
}
```

## hook: useEffect

useEffect 是 React 中处理副作用的钩子

### 纯函数, 副作用函数

纯函数 (Pure Function)

1. 确定性: 相同输入总是返回相同输出
2. 无副作用: 不依赖外部状态, 也不会改变外部状态

副作用函数 (Impure Function)

1. 不确定性: 相同输入可能返回不同输出
2. 有副作用: 或依赖外部状态, 或会改变外部状态

```js
// effect 副作用函数
// destructor 清理函数
// effect: () => void | destructor

// useEffect 无返回值
useEffect(
  effect, // effect 副作用函数, 返回一个 destructor 清理函数
  deps, // deps 依赖项数组
);
```

### useEffect 的执行时机

1. 如果传入的 deps 是非空数组
   - 组件挂载后, 执行 effect 副作用函数 (类比 Vue 的 onMounted), 此时可以获取到 DOM 元素
   - 依赖项改变时, 先执行 destructor 清理函数, 再执行 effect 副作用函数
   - 组件卸载后, 执行 destructor 清理函数 (类比 Vue 的 onUnmounted), 此时获取不到 DOM 元素
2. 如果不传入 deps, 即 deps 为 undefined, 则组件挂载、每次更新后, 都会执行 effect 副作用函数 (类比 Vue 的 onUpdated)
3. 如果传入的 deps 是 [] 空数组, 则 effect 副作用函数只会在组件挂载后执行一次 (类比 Vue 的 onMounted)
4. effect 副作用函数和 destructor 清理函数都是异步执行的

## hook: useLayoutEffect

```js
// effect 副作用函数
// destructor 清理函数
// effect: () => void | destructor

// useEffect 无返回值
useLayoutEffect(
  effect, // effect 副作用函数, 返回一个 destructor 清理函数
  deps, // 依赖项数组
);
```

### 对比回流和重绘

|          | 回流 reflow      | 重绘 repaint       |
| -------- | ---------------- | ------------------ |
| 触发原因 | 宽高等改变       | 颜色等改变         |
| 开销     | 大               | 小                 |
|          | 回流后一定有重绘 | 重绘前不一定有回流 |

### 对比 useEffect 和 useLayoutEffect

| 区别                        | useLayoutEffect        | useEffect              |
| --------------------------- | ---------------------- | ---------------------- |
| destructor, effect 执行时机 | 浏览器回流、重绘前执行 | 浏览器回流、重绘后执行 |
| destructor, effect 执行方式 | 同步执行               | 异步执行               |
| 是否阻塞 DOM 渲染           | 会阻塞 DOM 渲染        | 不会阻塞 DOM 渲染      |

useLayoutEffect 使用场景

- 同步获取或修改 DOM 元素
- 异步的 useEffect 可能导致页面闪烁, 同步的 useLayoutEffect 可以避免页面闪烁

```tsx
import { useEffect, useLayoutEffect } from "react";

export default function App() {
  useEffect(() => {
    const box = document.getElementById("box")!;
    box.style.opacity = "1"; // 不透明度
  }, []);

  useLayoutEffect(() => {
    const box2 = document.getElementById("box2")!;
    box2.style.opacity = "1"; // 不透明度
  });

  return (
    <>
      {/* 使用 useEffect(effect, deps), effect 异步执行, 有淡入过渡 */}
      <div className="w-20 h-20 bg-lime-200 opacity-0 duration-[5s]" id="box" />
      {/* 使用 useLayoutEffect(effect, deps), effect 同步执行, 没有淡入过渡 */}
      <div
        className="w-20 h-20 bg-lime-200 opacity-0 duration-[5s]"
        id="box2"
      />
    </>
  );
}
```

## hook: useRef

```js
const [state /* 状态 */, setState] = useState(initialVal);
const refVal /* 普通 JS 对象 */ = useRef(initialVal);
```

1. React 的 useRef 返回的 refVal 是普通 JS 对象, 改变 refVal.current 的值时, 不会触发组件更新
2. Vue 的 ref 返回的 refObj 是 Proxy 代理对象, 改变 refObj.value 的值时, 会触发组件更新
3. 每次组件更新时, 都会重新执行组件函数、重新创建所有的局部变量
4. useRef 只在组件挂载时调用 1 次, 组件更新时, 不会重新调用 useRef, 即不会重新创建 refVal
5. 组件挂载后, refVal 的内存地址就不会改变
6. 不要将 useRef 返回的 refVal 作为 useEffect 等其他 hooks 的 deps 中的依赖项

案例

```tsx
import React, { useRef, useState } from "react";

const App: React.FC = () => {
  // 每次组件更新时, 都会重新初始化 num 为 0
  let num = 0;
  // useRef 只会在组件挂载时执行 1 次, 组件更新时, 不会重新创建 refNum
  const refNum = useRef(0);
  const [cnt, setCnt] = useState(0);
  const handleClick = () => {
    // setCnt 异步更新 cnt 的值, 调用 setCnt 会触发组件更新
    setCnt(cnt + 1);
    num = cnt;
    refNum.current = cnt;
  };

  return (
    <div>
      <button onClick={handleClick}>+1</button>
      <div>cnt: {cnt}</div>
      {/* num 始终是 0 */}
      <div>num: {num}</div>
      {/* refNum.current 始终比 cnt 小 1 */}
      <div>refNum.current: {refNum.current}</div>
    </div>
  );
};

export default App;
```

## hook: useImperativeHandle

类似 Vue 的 defineExpose, 父组件获取子组件的 DOM 节点, 访问子组件暴露的属性, 调用子组件暴露的方法

```js
useImperativeHandle(
  ref, // 父组件通过子组件的 props 传递的 ref 对象
  () => {
    return {}; // 返回子组件暴露的属性、方法
  }, // createHandle
  deps, // 依赖项数组, 可选
);
```

useImperativeHandle 的执行时机

1. 如果传入的 deps 是非空数组
   - 组件挂载后, 执行 createHandle
   - 依赖项改变时, 执行 createHandle
2. 如果不传入 deps, 即 deps 为 undefined, 则组件挂载、每次更新后, 都会执行 createHandle
3. 如果传入的 deps 是 [] 空数组, 则 createHandle 只会在组件挂载后执行一次

::: code-group

```tsx [Demo 1]
import { forwardRef, useRef } from "react";

// react@latest
const Boy = ({ ref }: { ref: React.Ref<HTMLDivElement> } /** props */) => {
  return <div ref={ref}>Boy</div>;
};

// react@18
const Girl = forwardRef<HTMLDivElement>((props, ref) => {
  return <div ref={ref}>Girl</div>;
});

export default function App() {
  const boyRef = useRef<HTMLDivElement>(null /** initialVal */);
  const girlRef = useRef<HTMLDivElement>(null /** initialVal */);

  const handleClick = () => {
    console.log(boyRef.current);
    console.log(girlRef.current);
  };

  return (
    <>
      <button
        className="p-3 rounded-full border-1 cursor-pointer"
        onClick={handleClick}
      >
        父组件获取子组件的 DOM 节点
      </button>
      <Boy ref={boyRef} />
      <Girl ref={girlRef} />
    </>
  );
}
```

```tsx [Demo 2]
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

interface IExpose {
  cnt: number;
  addCnt: () => void;
}

// react@latest
const Boy = ({ ref }: { ref: React.Ref<IExpose> }) => {
  const [cnt, setCnt] = useState(0);
  useImperativeHandle(
    ref, // 父组件通过子组件的 props 传递的 ref 对象
    // 返回子组件暴露的属性、方法
    () => {
      console.log("[Boy] Call createHandle");
      return {
        // 返回子组件暴露的属性、方法
        cnt,
        addCnt: () => {
          console.log("[Boy] cnt:", cnt);
          setCnt(cnt + 1);
        },
      };
    }, // createHandle
    [cnt], // 依赖项数组, 可选
  );

  return (
    <div>
      <div>boyCnt: {cnt}</div>
      <button onClick={() => setCnt(cnt + 1)}>addBoyCnt</button>
    </div>
  );
};

// react@18
const Girl = forwardRef<IExpose /**  IProps */>((props, ref) => {
  const [cnt, setCnt] = useState(0);

  useImperativeHandle(
    ref, // 父组件通过子组件的 props 传递的 ref 对象
    () => {
      console.log("[Girl] Call createHandle");
      return {
        // 返回子组件暴露的属性、方法
        cnt,
        addCnt: () => {
          console.log("[Girl] cnt:", cnt);
          setCnt(cnt + 1);
        },
      };
    }, // createHandle
    [], // 依赖项数组, 可选
  );

  return (
    <div>
      <div>girlCnt: {cnt}</div>
      <button onClick={() => setCnt(cnt + 1)}>addGirlCnt</button>
    </div>
  );
});

export default function App() {
  const boyRef = useRef<IExpose>(null);
  const girlRef = useRef<IExpose>(null);

  const printChildRef = () => {
    console.log("[App] boyRef:", boyRef.current);
    console.log("[App] girlRef:", girlRef.current);
  };
  return (
    <div className="flex flex-col gap-5">
      <button onClick={() => boyRef.current?.addCnt()}>addBoyCnt</button>
      <button onClick={() => girlRef.current?.addCnt()}>addGirlCnt</button>
      <button onClick={printChildRef}>printChildRef</button>
      <Boy ref={boyRef} />
      <Girl ref={girlRef} />
    </div>
  );
}
```

:::

## hook: useContext

```js
const ctx = createContext(initialVal);
```

类似 Vue 的 provide/inject, 祖孙通信

对于同一个 context, 内层 context 的值会覆盖外层 context 的值

```tsx
import { createContext, useContext, useState } from "react";

interface ICtx {
  cnt: number;
  setCnt: (cnt: number) => void;
}

const cntCtx = createContext<ICtx>({} as ICtx /* initialVal */);

function Child() {
  const ctxVal = useContext<ICtx>(cntCtx); // ctxVal: readonly
  const { cnt, setCnt } = ctxVal;
  return (
    <>
      <div className="border-t-1">Child cnt: {cnt} </div>
      <button onClick={() => setCnt(cnt + 1)}>Child addCnt</button>
    </>
  );
}

function Parent() {
  const ctxVal = useContext<ICtx>(cntCtx); // ctxVal: readonly
  const { cnt, setCnt } = ctxVal;
  return (
    <>
      <div className="border-t-1">Parent cnt: {cnt}</div>
      <button onClick={() => setCnt(cnt + 1)}>Parent addCnt</button>
      <Child />
    </>
  );
}

export default function App() {
  const [outerCnt, setOuterCnt] = useState(123);
  const [innerCnt, setInnerCnt] = useState(456);
  return (
    <div>
      <div>App outerCnt: {outerCnt}</div>
      <button onClick={() => setOuterCnt(outerCnt + 1)}>App addOuterCnt</button>

      <div>App innerCnt: {innerCnt}</div>
      <button onClick={() => setInnerCnt(innerCnt + 1)}>App addInnerCnt</button>

      {/* props 键名必须是 value */}
      <cntCtx.Provider value={{ cnt: outerCnt, setCnt: setOuterCnt }}>
        <Parent />
        <cntCtx.Consumer>
          {(ctxVal) => "[outer] ctxVal: " + JSON.stringify(ctxVal)}
        </cntCtx.Consumer>

        {/* props 键名必须是 value */}
        <cntCtx.Provider value={{ cnt: innerCnt, setCnt: setInnerCnt }}>
          <Parent />
          <cntCtx.Consumer>
            {(ctxVal) => "[inner] ctxVal: " + JSON.stringify(ctxVal)}
          </cntCtx.Consumer>
        </cntCtx.Provider>
      </cntCtx.Provider>
    </div>
  );
}
```

## React.memo (perf)

### 触发组件更新的条件

1. `useState`: 组件的 state 改变
2. 组件的 props 改变
3. `useContext`: context 改变
4. 父组件更新, 也会触发子组件更新
   - React.memo 用于性能优化, 会缓存渲染结果
   - 使用 React.memo 包裹子组件, 避免父组件更新时, 不必要的子组件更新
   - 如果子组件的 props 没有改变, 则跳过子组件的更新

```tsx
import React, { useState } from "react";

interface IProps {
  user: { name: string };
}

const Boy = (props: IProps) => {
  console.log("Boy update...");
  return <div>Boy name: {props.user.name}</div>;
};

const Girl = React.memo((props: IProps) => {
  console.log("Girl update...");
  return <div>Girl name: {props.user.name}</div>;
});

export default function App() {
  const [inputVal, setInputVal] = useState("whoami");
  const [user, setUser] = useState({ name: "whoami" });
  return (
    <>
      <input value={inputVal} onChange={(ev) => setInputVal(ev.target.value)} />
      <button onClick={() => setUser({ name: inputVal })}>
        改变子组件的 props
      </button>
      <Boy user={user} />
      <Girl user={user} />
    </>
  );
}
```

## hook: useMemo (perf)

```js
const computedVal = useMemo(
  computeFn, // 计算函数
  deps, // 依赖项数组, 必传
);
```

- 类似 Vue 的 computed 计算属性: 会缓存计算结果, 只有当依赖项改变时, 才会重新计算
- useMemo 用于性能优化, 返回缓存的计算结果 (computeFn 的返回值 computedVal), 避免组件更新时, 不必要的重新计算 computeFn
- 如果传入的 deps 是非空数组, 则仅当依赖项改变时, 才会重新计算 computeFn
- 如果传入的 deps 是 [] 空数组, 则 computeFn 只会在组件挂载后计算一次

```tsx
import { useState, type ChangeEvent, useMemo } from "react";

const App: React.FC = () => {
  console.log("App update...");
  const [inputVal, setInputVal] = useState("528");
  const [nums, setNums] = useState([1, 2]);

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);

  // getSum 未使用 useMemo, 每次组件更新时, 都会重新计算
  const getSum = () => {
    console.log("Get sum");
    return nums[0] + nums[1];
  };

  // computedProduct 使用 useMemo, 仅当依赖项改变时, 才会重新计算
  const computedProduct = useMemo<number>(() => {
    console.log("Compute product");
    return nums[0] * nums[1];
  }, [nums]);

  const addNum0 = () => setNums([++nums[0], nums[1]]);
  const addNum1 = () => setNums([nums[0], ++nums[1]]);

  return (
    <div>
      {/* 修改输入框的值, 以触发组件更新 */}
      <input value={inputVal} onChange={handleChange} />

      <div>
        nums: {nums[0]}, {nums[1]}
      </div>
      <div>sum: {getSum()}</div>
      <div>product: {computedProduct}</div>

      <button onClick={addNum0}>addNum0</button>
      <button onClick={addNum1}>addNum1</button>
    </div>
  );
};

export default App;
```

## hook: useCallback

```js
const cachedCallback = useCallback(
  callback, // 回调函数
  deps, // 依赖项数组
);
```

- useCallback 用于性能优化, 返回缓存的回调函数 (cachedCallback), 避免组件更新时, 不必要的重新创建 callback
- 如果传入的 deps 是非空数组, 则仅当依赖项改变时, 才会重新创建 cachedCallback
- 如果传入的 deps 是 [] 空数组, 则 cachedCallback 只会在组件挂载后创建一次

案例

```tsx
import { type ChangeEvent, useCallback, useState } from "react";

const wm = new WeakMap();

export default function App() {
  console.log("App update...");
  const [inputVal, setInputVal] = useState("");
  // 每次组件更新时, 都会重新创建 cb
  const cb = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);

  const cachedCb = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => setInputVal(ev.target.value),
    [], // deps 是 [] 空数组, cachedCb 只会在组件挂载后创建一次
  );

  wm.set(cb, (wm.get(cb) ?? 0) + 1);
  wm.set(cachedCb, (wm.get(cachedCb) ?? 0) + 1);

  console.log("wm:", wm);
  return (
    <input
      value={inputVal}
      onChange={(ev) => {
        cb(ev);
        cachedCb(ev);
      }}
    />
  );
}
```

### React.memo, useCallback 综合案例

```tsx
import React, { type ChangeEvent, useCallback, useState } from "react";

interface IProps {
  cb: () => void;
}

// 父组件更新, 也会触发子组件更新
// React.memo 会缓存渲染结果
// 使用 React.memo 包裹子组件, 避免父组件更新时, 不必要的子组件更新
// 如果子组件的 props 没有改变, 则跳过子组件的更新
const Boy = React.memo(({ cb }: IProps) => {
  console.log("Boy update...");
  return <button onClick={cb}>Boy cb</button>;
});

const Girl = React.memo(({ cb }: IProps) => {
  console.log("Girl update...");
  return <button onClick={cb}>Girl cb</button>;
});

const App: React.FC = () => {
  console.log("App update...");
  const [inputVal, setInputVal] = useState("");
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);
  const cb = () => console.log("[Boy] inputVal:", inputVal);
  // useCallback 返回缓存的回调函数 (cachedCb)
  // 避免组件更新时, 不必要的重新创建 callback
  const cachedCb = useCallback(
    () => console.log("[Girl] inputVal:", inputVal),
    [], // deps 是 [] 空数组, cachedCb 只会在组件挂载后创建一次
  );
  return (
    <>
      <input value={inputVal} onChange={handleChange} />
      <Boy cb={cb} />
      <Girl cb={cachedCb} />
    </>
  );
};

export default App;
```

## hook: useDebugValue

```js
const debugValue = useDebugValue(value, format? /* 格式化函数 */)
```

调试用 hook

```tsx
import { useDebugValue, useEffect, useState } from "react";

const useCookie = (key: string, initialVal: string = "") => {
  const [cookieVal, setCookieVal] = useState(initialVal);

  useEffect(() => {
    document.cookie = `${key}=${initialVal}`;
  }, []);

  useDebugValue(
    cookieVal,
    (val) =>
      `val: ${val}, cookieVal: ${cookieVal}, document.cookie: ${document.cookie}`, // format
  );

  const setCookie = (newVal: string) => {
    setCookieVal(newVal);
    document.cookie = `${key}=${newVal}`;
  };

  const removeCookie = () => {
    setCookie("");
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  return [cookieVal, setCookie, removeCookie] as const;
};

export default function App() {
  const [cookieVal, setCookie, removeCookie] = useCookie("myKey", "myVal");
  return (
    <>
      <div>cookieVal: {cookieVal}</div>
      <button onClick={() => setCookie(cookieVal + "!")}>setCookie</button>
      <button onClick={() => removeCookie()}>delCookie</button>
    </>
  );
}
```

## hook: useId

useId 用于 SSR 场景下, 在双端生成相同的 ID, 避免 Hydration 水合错误

```ts
const id: string = useId();
```

## createPortal 传送组件

类似 Vue 的 `<Teleport />`, 将一个组件传送到指定 DOM 节点上, 成为该 DOM 节点的直接子元素

```js
const reactElement /** jsxElement */ = createPortal(
  children, // 被传送的组件
  container, // 目标 DOM 节点, 通常是 document.body
  key?, // 唯一标识被传送的组件, 可选
);
```

案例

```tsx
import { useState } from "react";
import { createPortal } from "react-dom";

interface IProps {
  header?: string;
  content?: string;
  footer?: string;
}

const Modal: React.FC<IProps> = (props: IProps) => {
  return createPortal(
    <>
      <header> {props.header ?? "header"} </header>
      <section> {props.content ?? "content"} </section>
      <footer> {props.footer ?? "footer"} </footer>
    </>,
    document.body,
  );
};

export default function App() {
  const [alive, setAlive] = useState(false);
  return (
    <>
      <button onClick={() => setAlive(!alive)}>Modal</button>
      {alive && <Modal header="I" content="love" footer="you" />}
    </>
  );
}
```

## `<Suspense />` 异步组件

类似 Vue 的 `<Suspense />`

::: code-group

```tsx [React <Suspense />]
<Suspense fallback={<div>请等待...</div>}>
  <ChildAsync />
</Suspense>
```

```vue [Vue <Suspense />]
<template>
  <Suspense>
    <!-- fallback 插槽 -->
    <template #default>
      <ChildAsync />
    </template>
    <!-- default 插槽 -->
    <template v-slot:fallback>
      <div>请等待...</div>
    </template>
  </Suspense>
</template>
```

:::

### 案例 1: 子组件使用 `use` 等待异步结果

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

```ts [ChildAsync.tsx]
import { use } from "react";

const fetchData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return await fetch("http://localhost:5174/data.json").then((res) =>
    res.json()
  );
};
const dataPromise = fetchData();

export default function ChildAsync() {
  // 子组件使用 use 等待异步结果
  const { data } = use(dataPromise) as any;
  console.log(data);
  return (
    <>
      <div>ChildAsync</div>
      <div>data: {JSON.stringify(data)}</div>
    </>
  );
}
```

```tsx [App.tsx]
import { Suspense } from "react";
import ChildAsync from "./ChildAsync";

export default function App() {
  return (
    <Suspense fallback={<div>请等待...</div>}>
      <ChildAsync />
    </Suspense>
  );
}
```

:::

### 案例 2: 父组件使用 `lazy` 懒加载子组件

::: code-group

```tsx [ChildDemo.tsx]
export default function ChildDemo() {
  return <div>ChildDemo</div>;
}
```

```tsx [App.tsx]
import { Suspense, lazy } from "react";

// 父组件使用 lazy 懒加载子组件
const ChildDemo = lazy(() => import("./ChildDemo"));

export default function App() {
  return (
    <Suspense fallback={<div>请等待...</div>}>
      <ChildDemo />
    </Suspense>
  );
}
```

:::

## 高阶组件

案例

```tsx
import { useEffect, useState } from "react";

const trackService = {
  sendEvent: <T,>(trackType: string, data?: T) => {
    const eventData = {
      timestamp: new Date().toISOString(),
      trackType,
      data,
      userAgent: navigator.userAgent,
      url: location.href,
    };
    console.log("[trackService] eventData:", eventData);
    navigator.sendBeacon("http://127.0.0.1:5173", JSON.stringify(eventData));
  },
};

const withTrack = (
  Component: React.FC<{
    trackEvent: (evName: string, data?: Record<string, unknown>) => void;
  }>,
  trackType: string,
) => {
  return (props: Record<string, unknown>) => {
    useEffect(() => {
      trackService.sendEvent<{ username: string }>(`${trackType}-mount`, {
        username: "whoami",
      });
      return () => {
        trackService.sendEvent<{ username: string }>(`${trackType}-unmount`, {
          username: "whoami",
        });
      };
    }, []);

    const trackEvent = (evName: string, data?: Record<string, unknown>) => {
      trackService.sendEvent<Record<string, unknown>>(
        `${trackType}-${evName}`,
        data,
      );
    };

    return <Component {...props} trackEvent={trackEvent} />;
  };
};

const RawButton = (props: {
  trackEvent: (evName: string, data?: Record<string, unknown>) => void;
}) => {
  const { trackEvent } = props;
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent(
      e.type, // evName
      // data
      {
        type: e.type,
        clientX: e.clientX,
        clientY: e.clientY,
      },
    );
  };
  return <button onClick={handleClick}>button-{JSON.stringify(props)}</button>;
};

const TrackedButton = withTrack(RawButton, "button" /** trackType */);

export default function HocDemo2() {
  const [isMounted, setIsMounted] = useState(true);
  return (
    <>
      <button onClick={() => setIsMounted(!isMounted)}>setIsMounted</button>
      {isMounted ? <TrackedButton a={1} b={2} c={3} /> : <div>Empty</div>}
    </>
  );
}
```

## CSS 模块化

::: code-group

```css [app.module.css]
.header-bg {
  background: lightpink;
}

.footer-bg {
  background: lightblue;
}
```

```tsx [App.tsx]
import styles from "./app.module.css";

export default function App() {
  return (
    <>
      <header className={styles["header-bg"]}>header</header>
      <footer className={styles["footer-bg"]}>footer</footer>
    </>
  );
}
```

:::

### `:global` 全局选择器

全局选择器: 使用 `:global` 的选择器, 不会被 vite 编译

::: code-group

```css [app.module.css]
.header-bg {
  background: lightpink;
}

:global(.footer-bg) {
  background: lightblue;
}
```

```tsx [App.tsx]
import styles from "./app.module.css";

export default function App() {
  return (
    <>
      <header className={styles["header-bg"]}>header</header>
      <footer className="footer-bg">footer</footer>
    </>
  );
}
```

:::
