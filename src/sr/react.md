# React 基础

1. 组件化
2. 声明式编程, 数据改变时, 自动更新视图
3. 虚拟 DOM: 虚拟 DOM 是描述真实 DOM 的 JS 对象; 视图更新时, 不直接操作真实 DOM, 创建一个新的虚拟 DOM, 与旧的虚拟 DOM 进行比较, 使用 diff 算法找到最小差异, 将最小差异应用到真实 DOM 上, 以提高性能
4. 单项数据流: 数据从父组件通过 props 传递到子组件, 子组件不能直接修改父组件的数据

## 创建 React 项目

```bash
pnpm create vite@latest
```

public 公有目录和 assets 静态资源目录的区别: public 目录直接被 `cp -r` 到 dist 目录下, assets 目录会被 vite 打包

## main.ts

```ts
import { createRoot } from "react-dom/client";
import { App } from "./App";

const app = document.getElementById("root")!;
const root = createRoot(app);
root.render(<App />);
```

## JSX

1. JSX 插值 `{value}`
2. CSS `class` => `className`
3. 有多个 class `<hr className={`${classVal} class2`} />`
4. 插入 HTML 片段

```tsx
function App() {
  const htmlSnippet: string = '<section style="color: red">whoami</section>';
  return <div dangerouslySetInnerHTML={{ __html: htmlSnippet }}></div>;
}
```

## babel, swc

1. es6 => es5: 将新版本的 js 语法转换为旧版本的 js 语法
2. Polyfill: 垫片, 使得新功能在旧浏览器中可用
3. jsx => js: 将 jsx 语法转换为 js 语法
4. 自定义插件

```bash
pnpm install @babel/core @babel/cli @babel/preset-env @babel/preset-react -D
```

## 虚拟 DOM

虚拟 DOM 是描述真实 DOM 的 JS 对象; 视图更新时, 不是直接操作真实 DOM, 而是创建一个新的虚拟 DOM, 与旧的虚拟 DOM 比较, 使用 diff 算法找到最小更新, 再将最小化 DOM 操作高效的提交到真实 DOM 上, 以提高性能

优点: 性能好 (diff 算法), 跨平台 (Web 端, 移动端)

::: code-group

```tsx [原 TSX]
const App = () => {
  return (
    <div age="23">
      <span>Tiancheng</span>
    </div>
  );
};
```

```js [使用 babel/swc 转换后的 JS]
const App = () => {
  return React.createElement(
    "div",
    { age: 23 },
    React.createElement(
      "span" /** type: 元素类型 */,
      null /** props: 属性 */,
      "Tiancheng" /** children: 子元素, 可以是其他虚拟 DOM 对象, 或数字/字符串 */,
    ),
  );
};
```

:::

## 虚拟 DOM 转 Fiber, 时间切片

Fiber 架构: React16 引入的新协调引擎, 解决大组件更新时的卡顿现象

### Fiber 架构实现了 4 个目标

1. 可中断的渲染: Fiber 架构下, React 可以将大渲染任务切片为多个小的工作单元 (unitOfWork), Fiber 树的一个节点代表一个工作单元, 使得 React 可以在浏览器空闲时 (类似 requestIdleCallback) 执行小的工作单元; 浏览器需要执行高优先级的任务时, 例如用户输入时, 可以先暂停渲染, 执行高优先级任务, 再恢复渲染
2. 优先级调度: Fiber 架构下, React 可以根据任务优先级决定调度顺序, React 优先执行动画, 用户交互等的高优先级任务, 例如用户输入; 延迟执行低优先级任务, 例如数据加载后的页面渲染, 同时任务有 timeout 过期时间, timeout 越短, 优先级越高
   - Immediate: 立即执行, 例如动画
   - UserBlocking: 用户交互
   - Normal: 默认
   - Low: 低优先级
   - Idle: 空闲时执行
3. 双缓存树 (Fiber Tree): 保证更新的原子性, 避免页面卡顿 (参考双缓存树)
4. 任务切片: React 通过时间分片, 将大渲染任务切片为多个小的工作单元 unitOfWork, 低优先级的工作单元可以在浏览器空闲时执行 (类似 requestIdleCallback), 避免一次性完成大渲染任务 (构建 workInProgressFiberTree 树), 导致主渲染线程阻塞

### 双缓存树

React 中有两颗 Fiber 树

- currentFiberTree 当前渲染的 Fiber 树 (保存更新前的状态)
- workInProgressFiberTree 当前处理的 Fiber 树 (保存更新后的状态)
- 直接修改新当前渲染的 Fiber 树, 会导致页面卡顿, 页面同步更新, 不可中断
- React 有两颗 Fiber 树, 保存更新前/后的状态
  - 协调阶段: 构建 workInProgress 树, 计算副作用; 即在内存中预计算更新后的页面, 使用 diff 算法复用 fiber 节点, 找到最小更新, 协调阶段异步更新, 可以中断
  - 提交阶段: 预计算完成后, 更新 currentFiberTree = workInProgressTree, 将最小化 DOM 操作高效的提交到真实 DOM 上, 保证更新的原子性, 避免页面卡顿

### 浏览器在 1 帧中做了什么

对于 60fps 的屏幕, 1 帧是 1000/60 = 16.7ms, 浏览器在 1 帧中:

- 处理用户事件: 例如 change, click, input 等
- 执行定时器回调函数
- 执行 requestAnimationFrame
- 计算布局, 绘制: 执行 DOM 的重绘 (repaint 有关颜色的..., 性能开销小) 和回流 (reflow 重排, 有关宽高的..., 性能开销大) 等
- 如果有空闲时间, 则执行 requestIdleCallback (IDLE 期间可以懒加载 JS 脚本)

### requestIdleCallback, React 调度器

requestIdleCallback: 当前帧的空闲时间执行传递的 callback, callback 有两个参数 deadline, options

- deadline.timeRemaining() 当前帧的剩余时间 (ms)
- deadline.didTimeout() 返回是否因为超时, 强制执行 callback
- options: 例如 `{ timeout: 1000 }`, 指定超时时间, 如果 1000ms 内没有空闲时间, 则强制执行 callback

```js
// requestIdleCallback 示例
const largeListLen = 1000;
const largeList = [];
function genLargeList() {
  for (let i = 0; i < largeListLen; i++) {
    largeList.push(() => {
      document.body.innerHTML += `<div>largeListItem-${i}</div>`;
    });
  }
}
genLargeList();

function workLoop(deadline) {
  if (deadline.timeRemaining() > 1 && largeList.length > 0) {
    const fn = largeList.shift();
    fn();
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop, { timeout: 1000 });
```

> [!important] 面试题
> 为什么 React 不使用原生的 requestIdleCallback, 而使用自定义的 scheduler 调度器

1. requestIdleCallback 兼容性较差
2. 优先级调度: React 有自定义的任务优先级 Immediate, UserBlocking, Normal, Low, Idle
3. 时间分片: requestIdleCallback 中 callback 执行间隔是 50ms; React 有自定义的时间分片

### requestIdleCallback 的替代方案 MessageChannel

1. MessageChannel 是宏任务, 1 帧内执行 1 次
2. setTimeout 可能有 4ms 的最小延迟
3. 如果浏览器不支持 MessageChannel, 则会降级为 setTimeout

```js
// MessageChannel 示例
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

## JSX.Element, React.ComponentType, React.ElementType, React.FC, React.ReactElement, React.ReactNode

- `React.ReactNode`: React 可以渲染的所有类型, 是最广泛的类型
- `React.ReactElement, JSX.Element` 使用 React.createElement() 或 JSX 标签语法创建的元素的类型
- `React.ComponentType<IProps>` 函数组件或类组件
- `React.ElementType` React 所有的标签类型
- `React.FC` 函数组件, 有特殊的 children 属性, children 属性通常是 `React.ReactNode` 类型, 类似 Vue 的 slot 插槽
- `React.ReactElement` 类型, 可以类比 Vue 中的 `VNode` 类型
- `React.FC/React.FunctionComponent` 类型, 可以类比 Vue 中的 `Component` 类型

|            | React                                                    | Vue                                                                                 |
| ---------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 渲染函数   | `const renderFn: () => ReactElement = () => <div></div>` | `const renderFn: () => VNode = () => <div></div>`                                   |
| 函数式组件 | `const Compo: React.FC = () => <div></div>`              | `const Compo = defineComponent(setup)` 或 `const Card = defineComponent({ setup })` |

React (和 Vue) 中都是单向数据流, 即子组件不能直接修改父组件通过 props 传递的数据

React 源码中使用 `Object.freeze()` 冻结 props 对象

> [!important]
>
> - props 中的 children, 类似 Vue 的 slot 插槽
> - props 中的回调函数, 类似 Vue 的 emit 事件

## 使用 props 进行父子组件通信

props 属性的类型可以是: null, undefined, boolean, number, string, object, Array, function, JSX Element

## 兄弟组件通信

原理: 发布订阅 [mitt](https://github.com/developit/mitt)

```js
import mitt from "mitt";
const emitter = mitt();
// listen to an event
emitter.on("foo", (ev) => console.log("foo", ev));
// listen to all events
emitter.on("*", (type, ev) => console.log(type, ev));
// fire an event 触发 foo 事件
emitter.emit("foo", { key: "value" });
// clearing all events
emitter.all.clear();
// working with handler references:
function onFoo() {}
emitter.on("foo", onFoo); // 监听 foo 事件
emitter.off("foo", onFoo); // 取消监听 foo 事件
```

## 受控组件/非受控组件

- 受控组件: 使用 `useState` 实现数据双向绑定, 类似 Vue 的 v-model
  - 数据更新后, 自动更新视图
  - 视图更新后 (例如 `onChange`), 需要手动调用 `setState` 更新数据
- 非受控组件: 不是响应式数据, 使用 `useRef` 操作 DOM 获取值
- 特殊的非受控组件: `<input type="file" />`, 文件上传

```tsx
export const ComponentDemo: React.FC = () => {
  const [value, setValue] = useState("value");
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    // 操作 DOM 获取值
    setValue(ev.target.value);
  };

  const value2 = "value2";
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange2 = () => {
    console.log(inputRef.current?.value);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    console.log(fileRef.current?.files);
  };
  return (
    <main>
      <div>value: {value}</div>
      {/* 受控组件: 使用 useState 实现数据双向绑定 */}
      <input type="text" value={value} onChange={handleChange} />
      <div>value2: {value2}</div>
      {/* 非受控组件: 使用 useRef 操作 DOM 获取值 */}
      <input
        type="text"
        defaultValue={value2}
        ref={inputRef}
        onChange={handleChange2}
      />
      <input type="file" ref={fileRef} onChange={handleUpload} />
    </main>
  );
};
```

## Immutable Updates 状态不可变性

> [!important] Immutable Updates 状态不可变性
>
> - 直接修改原对象/原数组, 可能不会触发重新渲染
> - React 中, 建议将状态视为 "只读的"
> - 不修改原对象/原数组, 而是返回一个新对象/新数组, 无需深层侦听, 可以提高性能

| 操作 | 不使用                    | 使用                               |
| ---- | ------------------------- | ---------------------------------- |
| 插入 | push(), unshift()         | concat, [newHead, ...arr, newTail] |
| 删除 | pop(), shift(), splice()  | filter(), slice(), toSpliced()     |
| 替换 | splice(), arr[i] = newVal | map(), toSpliced(), with()         |
| 排序 | reverse(), sort()         | toReversed(), toSorted()           |

以下 4 个方法不会修改原数组, 返回一个新数组

- toReversed(): 逆序
- toSorted(): 升序排序
- toSpliced(): 指定位置插入删除
- with(): 指定位置替换

> [!important]
> React 中, 所有的 hook (useXxx 函数) 都必须在组件的顶层调用

## hook: useState

- setState 是异步更新的, 可以提高性能
- 调用 setState 异步更新 state 值时, 会导致组件重新渲染

```js
const [state /** 状态 */, setState /** 更新状态的函数 */] =
  useState(initialState | () => initialState /** 初始状态 */);
```

- `const [state, setState] = useState(initialState | () => initialState);` 中, setState 是异步的, 可以提高性能
- 多次传入相同的 newVal 调用 `setState(newVal)` 时, React 跳过后续更新, 即自带防抖功能
- 对比 `setState(newVal)` 和 `setState((preVal) => newVal)`

```tsx
export default function UseStateDemo() {
  const [curVal, setCurVal] = useState(0);
  const handleClick = () => {
    setCurVal(curVal + 1);
    setCurVal(curVal + 1); // 跳过, 不会更新 curVal
    setCurVal(curVal + 1); // 跳过, 不会更新 curVal
    console.log("handleClick:", curVal); // 0, 先执行
  };

  const handleClick2 = () => {
    // 传递一个更新函数
    setCurVal((curVal /** 1 */) => curVal + 1);
    setCurVal((curVal /** 2 */) => curVal + 1);
    setCurVal((curVal /** 3 */) => curVal + 1);
    console.log("handleClick2:", curVal); // 1, 先执行
  };

  return (
    <>
      <h1>Current Value: {curVal}</h1>
      {/* Click first */}
      <button onClick={handleClick}>curVal += 1</button>
      {/* Click second */}
      <button onClick={handleClick2}>curVal += 3</button>
    </>
  );
}
```

## 高级 hook: useReducer

- useReducer 可用于基本类型和引用类型, 用于**集中式状态管理** (类似于 Vue 的 reactive, 但 reactive 只能用于引用类型)
- useState 也可用于基本类型和引用类型 (类似于 Vue 的 ref, ref 可用于基本类型和引用类型)

`const [state, dispatch] = useReducer(reducer, initialState, initializer)`

- state 状态
- dispatch: `dispatch(action) => reducer(state, action)`, 接收一个 action, 派发 reducer 的调用, 以根据不同的 action 更新状态
- reducer: `reducer: (state, action: any) => newState` 根据不同的 action 更新状态的纯函数
- initialState, 初始状态
- initializer: 初始化状态的函数, 返回 (修改后的) initialState, 只执行 1 次, 可选

默认 `initializer = (initialState) => initialState`

```ts
const [
  state /* 状态 */,
  dispatch /* `dispatch(action) => reducer(state, action)`, 接收一个 action, 派发 reducer 的调用, 以根据不同的 action 更新状态 */
] = useReducer(
  reducer /* `reducer: (state, action: any) => newState` 根据不同的 action 更新状态的纯函数 */,
  initialState /* 初始状态 */,
  initializer? /* 初始化状态的函数, 返回 (修改后的) initialState, 只执行 1 次, 可选 */,
);
```

::: code-group

```ts [reducer]
const initialState = { cnt: 0 };
type TState = typeof initialState;

// reducer 根据不同的 action 更新状态的纯函数
const reducer = (
  state: TState,
  action: { type: "add" | "sub"; delta: number },
) => {
  console.log("reducer:", action);
  switch (action.type) {
    case "add":
      return { cnt: state.cnt + action.delta }; // 必须返回新对象, 不能修改原对象
    case "sub":
      return { cnt: state.cnt - action.delta }; // 必须返回新对象, 不能修改原对象
    default:
      return state;
  }
};
```

```ts [initializer]
// initializer 初始化状态的函数, 返回 (修改后的) initialState, 只执行 1 次
const initializer = (state: TState) => {
  console.log("initializer:", state);
  state.cnt++; // 实际的初始状态: { cnt: 1 };
  return state;
};

const [cntState /* state */, dispatch] = useReducer(
  reducer,
  initialState, // { cnt: 0 };
  initializer, // 可选, 默认 initializer = (initialState) => initialState;
);
```

```tsx [template]
export function UseReducerDemo() {
  // ...
  return (
    <>
      <div>
        <p>useReducer cnt: {cntState.cnt}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "add", delta: 1 })}
        >
          add
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "sub", delta: 1 })}
        >
          subtract
        </button>
      </div>
    </>
  );
}
```

:::

## hook: useSyncExternalStore

1. 订阅外部 store, 例如 zustand (类似于 pinia)
2. 订阅浏览器 api, 例如 online, storage, location, hash, history 等
3. 抽离逻辑, 编写自定义 hooks
4. 支持服务器端渲染

```js
const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

- subscribe: 用于订阅数据源更新的函数, 接收 React 提供的 onStoreChange 回调函数, 数据源更新时调用 onStoreChange, 返回取消订阅的函数
- 💡onStoreChange 通知 React 外部数据源改变, 通知 React 重新调用 getSnapshot 获取当前数据源快照, 以同步状态, 触发重新渲染
- 💡getSnapshot: 获取当前数据源快照的函数; getSnapshot 返回引用类型时, 如果 getSnapshot 返回值的内存地址与上一个返回值的内存地址不同, 则 React 会重新渲染组件, 如果 getSnapshot 返回值的内存地址**总是**不同的, 则会无限循环, 导致报错 `Maximum update depth exceeded`
- getServerSnapshot: 服务器端渲染时, 获取数据源快照的函数

案例 1: 订阅浏览器 window.localStorage 数据源的自定义 hook `useStorage`

::: code-group

```ts [自定义 hook: useStorage]
import { useSyncExternalStore } from "react";
export function useStorage(
  key: string,
  initialValue: any,
): [any, (value: any) => void] {
  // subscribe 用于订阅数据源更新的函数
  const subscribe = (onStoreChange: () => void) => {
    // 接收 React 提供的 onStoreChange 回调函数, 数据源更新时调用 onStoreChange
    // onStoreChange 通知 React 外部数据源改变, 通知 React 重新调用 getSnapshot 获取当前数据源快照, 以同步状态, 触发重新渲染
    window.addEventListener("storage", onStoreChange);
    // 返回取消订阅的函数
    return () => {
      window.removeEventListener("storage", onStoreChange);
    };
  };

  // 获取当前数据源快照的函数
  const getSnapshot = () => {
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key)!)
      : initialValue;
  };

  const state /** 状态 */ = useSyncExternalStore(subscribe, getSnapshot);
  const setData = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    // 手动触发 storage 事件 -> 订阅调用 onStorageChange -> 通知调用 getSnapshot
    window.dispatchEvent(new StorageEvent("storage"));
  };
  return [state, setData] as const; // as const: 数组 array 转元组 tuple
}
```

```tsx [使用 useStorage]
export function UseSyncExternalStoreDemo() {
  const [cnt, setCnt] = useStorage("cnt", 1);
  return (
    <div>
      <p>cnt: {cnt}</p>
      <button type="button" onClick={() => setCnt(cnt + 1)}>
        add
      </button>
      <button type="button" onClick={() => setCnt(cnt - 1)}>
        subtract
      </button>
    </div>
  );
}
```

:::

> [!warning] Vue 的路由模式: history, hash
> hash 底层是监听 hashchange 事件, 修改 location.hash 值
>
> history 底层是:
>
> 1. 监听 popstate 事件 (点击浏览器的前进/后退按钮, 调用 history.go() 时会触发 popstate 事件)
> 2. 对于编程式导航, router.push() 会调用 window.history.pushState()
>
>    调用 history.pushState() 不会触发 popstate 事件
>
> 3. 对于编程式导航, router.replace() 会调用 window.history.replaceState()
>
>    调用 history.replaceState() 不会触发 popstate 事件

案例 2: 订阅浏览器 window.location.href 数据源的自定义 hook `useHistory`

::: code-group

```ts [自定义 hook: useHistory]
export function useHistory(): [
  string,
  (url: string) => void, // push
  (url: string) => void, // replace
] {
  const subscribe = (onUrlChange: () => void) => {
    window.addEventListener("popstate", onUrlChange);
    // 返回取消订阅
    return () => {
      window.removeEventListener("popstate", onUrlChange);
    };
  };
  const getSnapshot = () => {
    return window.location.href;
  };
  const url = useSyncExternalStore(subscribe, getSnapshot);
  const push = (url: string) => {
    window.history.pushState({}, "", url);
    // 手动触发 popstate 事件 -> 订阅调用 onStorageChange -> 通知调用 getSnapshot
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const replace = (url: string) => {
    window.history.replaceState({}, "", url);
    // 手动触发 popstate 事件 -> 订阅调用 onStorageChange -> 通知调用 getSnapshot
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return [url, push, replace] as const;
}
```

```tsx [使用 useHistory]
export function UseSyncExternalStoreDemo() {
  const [url, push, replace] = useHistory();
  return (
    <div>
      <p>url: {url}</p>
      <button type="button" onClick={() => push("/push")}>
        push
      </button>
      <button type="button" onClick={() => replace("/replace")}>
        replace
      </button>
    </div>
  );
}
```

:::

## 性能优化 hook: useTransition

- useTransition 用于性能优化, 适用于长时间任务, 例如网络请求/密集计算/渲染大量数据等
- useTransition 将某些更新标记为 "过渡" 更新, 即降低某些更新的优先级, React 先处理高优先级的更新, 例如用户输入; 延迟处理 "过渡" 更新, 例如网络请求

```js
const [isPending, startTransition] = useTransition();
// isPending = true: 正在过渡
// isPending = false: 过渡结束
```

案例

```tsx
import { Input, List } from "antd";
import React, { useState, useTransition } from "react";

interface Item {
  id: number;
  name: string;
  address: string;
}

// chrome: 检查 -> 性能 -> CPU: 4 倍降速
export function UseTransitionAntd() {
  const [val, setVal] = useState("");
  const [list, setList] = useState<Item[]>();
  // 在不阻塞 UI 的情况下更新 state, 用于性能优化
  const [isPending, startTransition] = useTransition();
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setVal(newVal);
    fetch("/api/list?keyword=" + newVal)
      .then((res) => res.json())
      .then((res) => {
        // setList(res.list); [!code --]
        startTransition(() => {
          // useTransition 有类似防抖 (debounce) 的功能: 连续触发事件, n 秒内函数只执行最后 1 次
          setList(res.list);
        });
      });
  };

  return (
    <div>
      <Input value={val} onChange={changeHandler}></Input>
      {isPending && <div>加载中...</div>}
      <List
        dataSource={list}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={item.name} description={item.address} />
          </List.Item>
        )}
      />
    </div>
  );
}
```

> [!warning]
> startTransition 必须是**同步**的

::: code-group

```js [案例 1]
// startTransition 执行结束后更新状态, 错误
startTransition(() => {
  setTimeout(() => {
    setState(newVal);
  }, 3000);
}); // startTransition 执行结束, 但 setState(newVal) 未执行

// startTransition 执行时更新状态, 正确
setTimeout(() => {
  // startTransition 执行时, 执行 setState(newVal)
  startTransition(() => {
    setState(newVal);
  });
}, 3000);
```

```js [案例 2]
// startTransition 执行结束后更新状态, 错误
startTransition(async () => {
  await fetch("http://localhost:5173");
  setState(newVal);
}); // startTransition 执行结束, 但 fetch 未返回, setState(newVal) 未执行

// startTransition 执行时更新状态, 正确
await fetch("http://localhost:5173");
// startTransition 执行时, 执行 setState(newVal)
startTransition(() => {
  setState(newVal);
});
```

:::

原理: useTransition 将某些状态的更新标记为低优先级

```js
// React 的优先级
const ImmediatePriority = 1; // 立即执行的优先级: 点击, 输入, ...
const UserBlockingPriority = 2; // 用户阻塞的优先级: 滚动, 拖拽, ...
const NormalPriority = 3; // 普通优先级: 渲染 DOM, 网络请求, ...
const LowPriority = 4; // 低优先级
const IdlePriority = 5; // 空闲优先级: console.log(), ...
```

## 性能优化 hook: useDeferredValue

useDeferredValue 根据设备的情况, 延迟**某个值**的更新 (将该值的更新标记为低优先级), 适用于频繁更新的值, 例如输入框的值, 避免频繁更新导致的性能问题

> useTransition 和 useDeferredValue 的区别

1. useTransition 和 useDeferredValue 都是延迟更新, 用于性能优化
2. useTransition 和 useDeferredValue 都有类似防抖 (debounce) 的功能: 连续触发事件, n 秒内函数只执行最后 1 次
3. useTransition 关注状态的过渡, 例如渲染大列表, 并且提供了过渡标识 `isPending`; useDeferredValue 关注某个值的延迟更新, 例如输入框的值

- useDeferredValue 不是防抖, 防抖有确定的延迟时间, useDeferredValue 没有确定的延迟时间, 而是根据设备的情况, 延迟某个值的更新

```tsx
import { Input, List } from "antd";
import { useDeferredValue, useState } from "react";
import mockjs from "mockjs";

interface Item {
  id: number;
  name: number;
  address: string;
}

// chrome: 检查 -> 性能 -> CPU: 4 倍降速
export function UseDeferredValueAntd() {
  const [val, setVal] = useState("");
  const list: Item[] = mockjs.mock({
    "addrlist|1000": [
      {
        "id|+1": 1,
        name: "@natural", // 数字
        address: "@county(true)",
      },
    ],
  }).addrlist;
  console.log(list.length);
  const deferredVal = useDeferredValue(val);
  const isDeferred = deferredVal !== val;
  const findItem = () => {
    // useTransition, useDeferredValue 都有类似防抖 (debounce) 的功能: 连续触发事件, n 秒内函数只执行最后 1 次
    // 输入框, 用户连续输入 1, 2, 3
    // useDeferredValue 不会对 1 搜索一次, 对 12 搜索一次, 对 123 再搜索一次
    // 而是延迟的只对 123 搜索一次, 性能优化
    console.log("val:", val);
    console.log("deferredVal:", deferredVal);
    console.log("isDeferred:", isDeferred);
    return list.filter((item) => item.name.toString().includes(deferredVal)); // 搜索
  };
  return (
    <div>
      <Input value={val} onChange={(e) => setVal(e.target.value)}></Input>
      <List
        style={{
          opacity: isDeferred ? 0.1 : 1,
          // ease-in-out 慢 -> 快 -> 慢
          transition: "opacity 1s ease-in-out",
        }}
        dataSource={findItem()}
        renderItem={(item: Item) => (
          <List.Item>
            <List.Item.Meta title={item.name} description={item.address} />
          </List.Item>
        )}
      />
    </div>
  );
}
```

## hook: useEffect

useEffect 是 React 中处理副作用的钩子

### 纯函数, 副作用函数

纯函数

1. 输入决定输出: 相同的输入总是得到相同的输出
2. 无副作用: 不会改变外部状态, 也不依赖外部可变状态, 即纯函数不会影响外部的变量, 文件, 数据库...

副作用函数: 会改变外部状态, 或依赖外部可变状态

### 如何深拷贝

1. `JSON.parse(JSON.stringfy(obj));` 会丢失属性值为 undefined 的属性
2. lodash `cloneDeep`
3. `window.structuredClone(obj);` 浏览器自带

```ts
// effect 处理函数
// destructor 清理函数
// effect: () => void | destructor

// useEffect 无返回值
useEffect(
  effect, // effect 处理函数, 返回一个 destructor 清理函数
  dependencies, // 依赖项数组
);
```

> useEffect 的执行时机

1. 组件挂载后, 执行 effect 处理函数 (类比 Vue 的 onMounted), 此时获取的到 DOM 元素
2. 依赖项更新, 组件重新渲染后, 先执行 destructor 清理函数, 再执行 effect 处理函数 (类比 Vue 的 onUpdated)
3. 组件卸载后, 执行 destructor 清理函数 (类比 Vue 的 onUnmounted), 此时获取不到 DOM 元素
4. 如果不传入 deps, deps 依赖项数组为 undefined, 则每次组件重新渲染后, 都会执行 effect 处理函数
5. 如果 deps 依赖项数组为 [] 空数组, 则 effect 处理函数只会在组件挂载后执行一次
6. effect 处理函数和 destructor 清理函数都是**异步**执行的

## hook: useLayoutEffect

```ts
// effect 处理函数
// destructor 清理函数
// effect: () => void | destructor

// useEffect 无返回值
useLayoutEffect(
  effect, // effect 处理函数, 返回一个 destructor 清理函数
  dependencies, // 依赖项数组
);
```

useLayoutEffect 在浏览器重绘前**同步**执行

```js
useLayoutEffect(() => void | Destructor, // setup
dependencies?: Array);
```

> [!important]
> 对比 useEffect 和 useLayoutEffect

|          | 重排/回流 reflow   | 重绘 repaint     |
| -------- | ------------------ | ---------------- |
| 触发原因 | 宽高等改变         | 颜色等改变       |
| 开销     | 大                 | 小               |
|          | 重排一定会触发重绘 | 重绘不会触发重排 |

| 区别                | useLayoutEffect        | useEffect              |
| ------------------- | ---------------------- | ---------------------- |
| effect 函数执行时机 | 浏览器回流, 重绘前执行 | 浏览器回流, 重绘后执行 |
| effect 函数执行方式 | 同步执行               | 异步执行               |
| DOM 渲染            | **阻塞 DOM 渲染**      | **不阻塞 DOM 渲染**    |

useLayoutEffect 使用场景

- 同步获取或修改 DOM 元素
- 异步的 useEffect 可能会导致页面闪烁, 同步的 useLayoutEffect 可以避免页面闪烁
- useLayoutEffect 可以模拟生命周期钩子

```tsx
import { useEffect, useLayoutEffect } from "react";
import styled from "styled-components";

const Block = styled.div`
  width: 200px;
  height: 200px;
  background: lightpink;
  opacity: 0;
  transition: opacity 5s;
`;

const Block2 = styled(Block)`
  background: lightblue;
  position: absolute;
  top: 300px;
`;

export function UseLayoutEffect() {
  // 使用 useEffect, effect 异步执行, 有淡入动画
  useEffect(() => {
    const block = document.getElementById("block")!;
    block.style.opacity = "1"; // 不透明度
  }, []);
  // 使用 useLayoutEffect, effect 同步执行, 没有淡入动画
  useLayoutEffect(() => {
    const block2 = document.getElementById("block2")!;
    block2.style.opacity = "1"; // 不透明度
  });

  return (
    <div>
      <Block id="block">block</Block>
      <Block2 id="block2">block2</Block2>
    </div>
  );
}
```

## hook: useRef

```ts
const [state /* 状态 */, setState] = useState(initialVal);
const refVal /* 普通 JS 对象 */ = useRef(initialVal);
```

- React 的 useRef 返回的 refVal 是普通 JS 对象, 不是 state 状态 (没有对应的 setState); 改变 refVal.current 值时, 不会触发组件重新渲染
- Vue 的 ref 返回的 refVal 是 Proxy 代理对象; 改变 refVal.value 值时, 会触发组件重新渲染
- 组件每次重新渲染, 组件函数会重新执行, 所有的局部变量都会重新初始化
- useRef 只会在组件挂载时调用 1 次, 组件重新渲染时, 不会重新调用 useRef
- useRef 的返回值不能作为 useEffect 等其他 hooks 的 dependencies 中的依赖项, 因为 useRef 返回普通 JS 对象, 不是 state 状态 (没有对应的 setState)

### 案例

问题 1: num 为什么一直是 0

- 组件每次重新渲染, 组件函数会重新执行, 所有的局部变量 (例如 num) 都会重新初始化
- setCnt 执行后, 触发组件重新渲染, 组件每次重新渲染时, num 都会重新初始化为 0
- useRef 只会在组件挂载时调用 1 次, 组件重新渲染时, 不会重新调用 useRef

问题 2: refNum.current 为什么一直比 cnt 小 1

- const [state, setState] = useState(initialState | () => initialState)
- setState 异步更新 state 值
- `setCnt(val => { refNum.current = val + 1; return val + 1; })` 可以解决问题 2

::: code-group

```tsx [案例 1]
import React, { useRef, useState } from "react";

const UseRefDemo: React.FC = () => {
  let num = 0; // 组件每次重新渲染时, num 都会重新初始化为 0
  const refNum = useRef(0); // useRef 只会在组件挂载时执行 1 次
  const [cnt, setCnt] = useState(0);
  const handleClick = () => {
    setCnt(cnt + 1); // setCnt 执行后, 触发组件重新渲染
    num = cnt;
    refNum.current = cnt;
  };

  return (
    <div>
      <button onClick={handleClick}>++</button>
      <div>cnt: {cnt}</div>
      {/* num 为什么一直为 0 */}
      <div>num: {num}</div>
      {/* refNum.current 为什么一直比 cnt 小 1 */}
      <div>refNum.current: {refNum.current}</div>
    </div>
  );
};
```

```tsx [案例 2]
export default function UseRefDemo2() {
  // 组件每次重新渲染时, timer 都会重新初始化为 null
  // let timer: null | NodeJS.Timeout = null;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [cnt, setCnt] = useState(0);
  const handleStart = () => {
    timer.current = setInterval(() => {
      setCnt((cnt) => cnt + 1);
    }, 500);
  };
  const handleEnd = () => {
    console.log(timer);
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  return (
    <div>
      <div>cnt: {cnt}</div>
      <button onClick={handleStart}>Start counter</button>
      <button onClick={handleEnd}>End counter</button>
    </div>
  );
}
```

:::

## hook: useImperativeHandle (Vue defineExpose)

Imperative Handle 命令式句柄

类似 Vue 的 defineExpose, 父组件可以获取子组件的 DOM 节点, 访问子组件的属性, 调用子组件的方法

```js
useImperativeHandle(
  ref, // 父组件通过子组件 props 传递的 ref 对象
  () => {
    return {}; // 返回暴露的属性, 方法
  } /** createHandle */,
  dependencies, // 依赖项数组, 可选
);
```

useImperativeHandle 的执行时机, 同 useEffect, useLayoutEffect

1. 组件挂载后, 执行 createHandle
2. 依赖项更新, 组件重新渲染后, 执行 createHandle
3. 如果不传入 deps, deps 依赖项数组为 undefined, 则每次组件重新渲染后, 都会执行 createHandle
4. 如果 deps 依赖项数组为 [] 空数组, 则 createHandle 只会在组件挂载后执行一次

::: code-group

```tsx [案例 1]
const Child = ({ ref }: { ref: React.Ref<HTMLDivElement> } /** props */) => {
  return <div ref={ref}>Child</div>;
};

// 父组件获取子组件的 DOM 节点
export function UseImperativeHandleDemo() {
  const childRef = useRef<HTMLDivElement>(null /** initialVal */);
  const getChildDOM = () => {
    console.log(childRef.current);
  };
  return (
    <div>
      <button type="button" onClick={getChildDOM}>
        获取子组件的 DOM 节点
      </button>
      <Child ref={childRef} />
    </div>
  );
}
```

```tsx [案例 2]
interface ChildRef {
  cnt: number;
  addCnt: () => void;
}

const Child = ({ ref }: { ref: React.Ref<ChildRef> }) => {
  const [cnt, setCnt] = useState(0);
  const [flag, setFlag] = useState(false);
  // 类似 Vue 的 defineExpose
  useImperativeHandle(
    ref, // 父组件通过子组件 props 传递的 ref 对象
    () => {
      // 返回暴露的属性, 方法
      console.log("Invoke createHandle");
      return {
        cnt,
        addCnt: () => setCnt(cnt + 1),
      }; // createHandle
    },
    [cnt], // 依赖项数组
  );

  return (
    <div>
      <div>flag: {flag ? "true" : "false"}</div>
      <div>cnt: {cnt}</div>
      <button type="button" onClick={() => setFlag(!flag)}>
        setFlag
      </button>
      <button type="button" onClick={() => setCnt(cnt + 1)}>
        addCnt
      </button>
    </div>
  );
};

export function UseImperativeHandleDemo2() {
  const childRef = useRef<ChildRef>(null);
  const printChildRef = () => {
    console.log(childRef.current);
  };
  return (
    <div>
      <button type="button" onClick={printChildRef}>
        printChildRef
      </button>
      <button type="button" onClick={() => childRef.current?.addCnt()}>
        addCnt
      </button>
      <Child ref={childRef}></Child>
    </div>
  );
}
```

:::

## hook: useContext (Vue provide/inject)

类似 Vue 的 provide/inject, 祖孙通信

对于同一个 context, 内层 context 的值会覆盖外层 context 的值

```tsx{7,10,11,23,24,45-51}
interface ICntCtx {
  cnt: number;
  setCnt: (cnt: number) => void;
}

// 全局上下文
const cntCtx = createContext<ICntCtx>({} as ICntCtx /* defaultVal */);

function Child() {
  const ctxVal = useContext<ICntCtx>(cntCtx); // ctxVal: readonly
  const { cnt, setCnt } = ctxVal;
  return (
    <>
      <div>Child cnt: {cnt} </div>
      <button type="button" onClick={() => setCnt(cnt + 1)}>
        Child add
      </button>
    </>
  );
}

function Parent() {
  const ctxVal = useContext<ICntCtx>(cntCtx); // ctxVal: readonly
  const { cnt, setCnt } = ctxVal;
  return (
    <>
      <div>Parent cnt: {cnt}</div>
      <button type="button" onClick={() => setCnt(cnt + 1)}>
        Parent add
      </button>
      <Child />
    </>
  );
}

const Demo = (props) => JSON.stringify(props);

export function UseContextDemo() {
  const [_cnt, _setCnt] = useState(416);
  const [cnt, setCnt] = useState(0);
  return (
    <div>
      <div>Grandparent cnt: {cnt}</div>
      <button type="button" onClick={() => setCnt(cnt + 1)}>
        Grandparent add
      </button>
      {/* props 键必须是 value */}
      <cntCtx.Provider value={{ cnt: _cnt, setCnt: _setCnt }}>
        <cntCtx.Provider value={{ cnt, setCnt }}>
          {/* 对于同一个 context (这里是 cntContext), 内层 context 的值会覆盖外层 context 的值 (这里 cnt 的初始值为 0) */}
          <Parent />
          <cntCtx.Consumer>{(arg) => <Demo {...arg} />}</cntCtx.Consumer>
        </cntCtx.Provider>
        <cntCtx.Consumer>
          {(arg) => {
            console.log("arg", arg);
            return JSON.stringify(arg);
          }}
        </cntCtx.Consumer>
      </cntCtx.Provider>
    </div>
  );
}
```

## 性能优化 API: React.memo

### 触发组件重新渲染的条件

1. 组件的 props 改变
2. 组件的 state 改变
3. useContext 改变
4. 父组件重新渲染时, 子组件也会重新渲染; 使用 React.memo 包裹子组件, 如果子组件的 props 没有改变则跳过子组件的重新渲染

### 性能优化 API: React.memo

- React.memo 用于性能优化, 缓存上一次的渲染结果, 避免不必要的重新渲染
- React.memo 对组件的 props 进行浅比较 (不关心 state 和 useContext), 如果 props 没有改变则跳过重新渲染

```tsx
interface User {
  name: string;
}

const Boy = (props: { user: User }) => {
  console.log("Boy is rendering");
  const { user } = props;
  return <h1>name: {user.name}</h1>;
};

// 使用 React.memo 包裹子组件, 避免不必要的重新渲染
const Girl = React.memo((props: { user: User }) => {
  console.log("Girl is rendering");
  const { user } = props;
  return <h1>name: {user.name}</h1>;
});

export function MemoDemo() {
  const [inputVal, setInputVal] = useState("");
  const [user, setUser] = useState({
    name: "whoami",
  });
  return (
    <div>
      <input value={inputVal} onChange={(ev) => setInputVal(ev.target.value)} />
      <button onClick={() => setUser({ ...user, name: inputVal })}>
        更改子组件的 props
      </button>
      <Boy user={user}></Boy>
      <Girl user={user}></Girl>
    </div>
  );
}
```

## 性能优化 hook: useMemo (Vue computed)

- `const computedVal = useMemo(computeFn /* 计算函数 (工厂函数) */, deps /* 依赖项数组, 必传 */);`
- useMemo 类似 Vue 的 computed 计算属性: 缓存计算结果, 仅当依赖项改变时才会重新计算
- useMemo 用于性能优化, 返回缓存的计算结果 (computeFn 的返回值 computedVal), 避免重新渲染时不必要的重新计算, 仅当依赖项改变时才会重新计算
- 如果依赖项数组是空数组, 则只会在组件挂载后计算一次

```tsx
const UseMemoDemo: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const [nums, setNums] = useState([1, 2]);
  const handleChange = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);
  // calcSum 未使用 useMemo, 每次重新渲染时都会重新计算两数的和
  const calcSum = () => {
    console.log("Calculating sum");
    return nums[0] + nums[1];
  };
  // computedProduct 使用 useMemo, 仅当依赖项改变时才会重新计算两数的乘积
  const computedProduct = useMemo<number>(() => {
    console.log("Computing product");
    return nums[0] * nums[1];
  }, [nums]);
  const addNum0 = () => setNums([++nums[0], nums[1]]);
  const addNum1 = () => setNums([nums[0], ++nums[1]]);
  return (
    <div>
      {/* 修改输入框的值 (inputVal 状态) 时, 触发重新渲染 */}
      <input type="text" value={inputVal} onChange={handleChange} />
      <div>nums: {JSON.stringify(nums)}</div>
      <div>sum: {calcSum()}</div>
      <div>product: {computedProduct}</div>
      <button onClick={addNum0}>addNum0</button>
      <button onClick={addNum1}>addNum1</button>
    </div>
  );
};
```

## 性能优化 hook: useCallback

- `const cachedCallback = useCallback(callback /* 回调函数 */, deps /* 依赖项数组, 必传 */)`
- useCallback 用于性能优化, 返回缓存的回调函数 cachedCallback, 避免重新渲染时, callback 不必要的重新创建, 仅当依赖项改变时才会重新创建 callback

### 案例

```tsx
import { ChangeEvent, useCallback, useState } from "react";

const wm = new WeakMap();
let cbCnt = 1;
let cachedCbCnt = 1;

export function UseCallbackDemo() {
  console.log("UseCallbackDemo is Invoking");
  const [inputVal, setInputVal] = useState("");
  // 每次重新渲染时都会重新创建 cb
  const cb = (ev: ChangeEvent<HTMLInputElement>) => {
    console.log(ev);
  };
  if (!wm.has(cb)) {
    wm.set(cb, cbCnt++);
  }
  const cachedCb = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setInputVal(ev.target.value);
    },
    [] /* 依赖项数组是空数组, 只会在组件挂载后创建一次 cachedCb */,
  );
  if (!wm.has(cachedCb)) {
    wm.set(cachedCb, cachedCbCnt++);
  }

  console.log("wm:", wm);
  return (
    <div>
      <input
        type="text"
        value={inputVal}
        onChange={(ev) => {
          cb(ev);
          achedCb(ev);
        }}
      />
    </div>
  );
}
```

### 对比 useMemo 和 useCallback

- `const computedVal = useMemo(computeFn /* 计算函数 (工厂函数) */, deps /* 依赖项数组, 必传 */);`
- `const cachedCallback = useCallback(callback /* 回调函数 */, deps /* 依赖项数组, 必传 */);`
- useMemo 返回缓存的计算结果 (computeFn 的返回值 computedVal)
- useCallback 返回缓存的回调函数 cachedCallback

### React.memo, useCallback 综合案例

```tsx
import React, { ChangeEvent, useCallback, useState } from "react";

const Child = React.memo(({ callback }: { callback: () => void }) => {
  console.log("Child is rendering");
  return <button onClick={callback}>I'm Child!</button>;
});

const MemoUseCallback: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const changeHandler = (ev: ChangeEvent<HTMLInputElement>) =>
    setInputVal(ev.target.value);
  // 修改输入框的值 (inputVal 状态) 时, 触发父组件重新渲染
  // 如果不使用 useCallback, 则父组件重新渲染时重新创建 callback
  // 子组件的 props 改变, 触发子组件重新渲染
  // const callback = () => console.log("Goodbye Happiness");
  // 依赖项数组是空数组, 只会在组件挂载后创建一次 callback
  const callback = useCallback(() => console.log("Goodbye Happiness"), []);
  return (
    <div>
      <input type="text" value={inputVal} onChange={changeHandler} />
      <Child callback={callback} />
    </div>
  );
};
```

## 调试用 hook: useDebugValue

`const debugValue = useDebugValue(value, formatter? /* 格式化函数 */)`

```tsx
const useCookie = (key: string, defaultValue: string = "") => {
  const getCookie = () => {
    const match = document.cookie.match(new RegExp(`${key}`));
    // 格式 key=value
    return match ? match[2] : defaultValue;
  };
  const [cookieState, setCookieState] = useState(getCookie());

  useDebugValue(
    cookieState,
    (val) => {
      return `formatted: cookieState: ${cookieState}, val: ${val}`;
    } /** formatter */,
  );

  const setCookie = (newVal: string) => {
    document.cookie = `${key}=${newVal}`;
    setCookieState(newVal); // 同步更新 cookieState 状态
  };

  const delCookie = () => {
    // 过期删除
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setCookie(""); // 同步删除 cookieState 状态
  };

  return [cookieState, setCookie, delCookie] as const;
};

export function UseDebugValueDemo() {
  const [cookieState, setCookie, delCookie] = useCookie(
    "name" /* key */,
    "defaultName" /* defaultValue */,
  );
  return (
    <main>
      <div>cookieVal: {cookieState}</div>
      <button onClick={() => setCookie(cookieState + "!")}>setCookie</button>
      <button onClick={() => delCookie()}>delCookie</button>
    </main>
  );
}
```

## hook: useId

生成跨服务器和客户端的唯一稳定 ID; SSR 场景下, 服务器和客户端渲染顺序可能不同, 如果递增生成 ID, 双端生成的 ID 可能不同, 导致 Hydration 水合错误; 使用 useId 可以保证服务器和客户端生成的 ID 相同

案例: 为组件生成唯一 ID

```tsx
export const UseIdDemo: React.FC = () => {
  const id = useId();
  const inputId = useId();
  console.log("id =", id, "inputId =", inputId);
  // id = :r0: inputId = :r1:
  // id = :r2: inputId = :r3:
  return (
    <main>
      <label htmlFor={inputId}>输入框</label>
      <input type="text" id={inputId}></input>
    </main>
  );
};
```

## createPortal 传送组件

将一个组件传送到指定的 DOM 节点上, 成为指定 DOM 节点的直接子元素, 类似 Vue 的 Teleport

### 入参

- children: 被传送的组件
- domNode: 目标 DOM 节点, 一般是 document.body
- key: 可选参数, 用于唯一标识被传送的组件
- 返回一个 React 元素 (ReactElement, JSX.Element)

## Suspense 异步渲染

异步组件/数据/图片加载时, 先展示占位符 (loading state), 即骨架屏, 类似 Vue 的 Suspense

::: code-group

```tsx [React Suspense]
<Suspense fallback={<div>请等待</div>}>
  <AsyncComponent />
</Suspense>
```

```vue [Vue Suspense]
<template>
  <Suspense>
    <!-- fallback 插槽 -->
    <template #fallback>
      <div>请等待</div>
    </template>
    <!-- default 插槽 -->
    <AsyncComponent />
  </Suspense>
</template>
```

:::

## CSS 模块化

Vite 项目中使用 css-modules: 将文件命名为 `filename.module.[css|scss|...]` 即可

```bash
pnpm install sass -D # 安装 CSS 预处理器
```

::: code-group

```scss [app.module.scss]
// app.module.scss
.rowStyle {
  display: flex;
  justify-content: space-around;
  height: 200px;

  .itemStyle {
    border: 1px solid lightblue;
    border-radius: 10px;
    padding: 5px;
  }
}
```

```tsx [App.tsx]
import styled from "./app.module.scss";
export function App() {
  const arr = ["Vue", "React", "Angular"];
  return (
    <div className={styled.rowStyle}>
      <div className={styled.itemStyle}>
        <ul>
          {arr.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

```html [编译后的 css 类名]
<div class="_rowStyle_1dnxg_1">
  <div class="_itemStyle_1dnxg_6"></div>
</div>
```

:::

### vite.config.ts 中配置 css-module 规则

::: code-group

```ts [vite.config.ts]
export default defineConfig({
  // 基于 postcss-module
  css: {
    modules: {
      // 修改 css-module 类名规则
      // dashes: 仅将 kebab-case 的类名转为 camelCase 的类名, 并保留原类名
      // dashesOnly: 仅将 kebab-case 的类名转为 camelCase 的类名, 并删除原类名
      // camelCase: 将所有非 camelCase 的类名转换为 camelCase 的类名, 并保留原类名
      // camelCaseOnly: 将所有非 camelCase 的类名转换为 camelCase 的类名, 并删除原类名
      localsConvention: "dashes",
      // 修改编译后的类名规则: name 源文件名, local 原类名
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },
});
```

```html [编译后的 css 类名]
<div class="app-module__rowStyle_YENXn">
  <div class="app-module__itemStyle__QOx0D"></div>
</div>
```

:::

### 维持类名

使用 :global() 保留, 不编译 `.module.css` 中的某些类名

::: code-group

```scss [app.module.scss]
.rowStyle {
  display: flex;
  justify-content: space-around;
  height: 200px;

  // 维持类名
  :global(.itemStyle) {
    border: 1px solid lightblue;
    border-radius: 10px;
    padding: 5px;
  }
}
```

```tsx [App.tsx]
import styled from "./app.module.scss";
export function App() {
  const arr = ["Vue", "React", "Angular"];
  return (
    <div className={styled.rowStyle}>
      <div className="itemStyle">
        <ul>
          {arr.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

:::

## styled (CSS-in-JS)

```bash
pnpm install styled-components -D
```

::: code-group

```tsx [src/pages/Styled.tsx]
// Button 的 CSS 类名是 JS 随机生成的, 避免类名冲突
const ColoredBtn = styled.button<{ success?: boolean }>`
  ${(props) =>
    props.success ? "background: lightblue" : "background: lightgreen"};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 30px;
`;

// styled 继承
const AnchorBtn = styled(ColoredBtn)`
  text-decoration: underline;
  background: transparent;
`;

// styled 属性
const NumberInput = styled.input.attrs({
  type: "number",
  defaultValue: 1,
})`
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
`;

const NumberInput2 = styled.input.attrs<{ defaultValue: number }>((props) => {
  return {
    type: "number",
    defaultValue: props.defaultValue,
  };
})`
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
`;

// styled 全局属性
const GlobalStyle = createGlobalStyle`
* {
  padding: 0;
  margin: 0;
}
:root {
  background: azure;
}
`;

// styled 动画
const xMove = keyframes`
0% {
  transform: translateX(0);
}
50% {
  transform: translateX(300px);
}
100% {
  transform: translateX(0);
}
`;

const Box = styled.div`
  position: fixed;
  left: 10%;
  top: 10%;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: lightpink;
  animation: ${xMove} 3s ease infinite;
`;

const StyledDemo: React.FC<{
  children?: ReactNode;
}> = (props) => {
  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <ColoredBtn>{props.children ?? "默认文本"}</ColoredBtn>
      <AnchorBtn success>{props.children ?? "链接文本"}</AnchorBtn>
      <NumberInput></NumberInput>
      <NumberInput2 defaultValue={30}></NumberInput2>
      {/* 注册全局样式 */}
      <GlobalStyle></GlobalStyle>
      {createPortal(<Box></Box>, document.body)}
    </main>
  );
};

export default StyledDemo;
```

```tsx [src/router/index.tsx]
const router = createBrowserRouter([
  {
    path: "/styled",
    element: <StyledDemo>Styled Component</StyledDemo>,
  },
]);

export default router;
```

:::

### styled 原理: ES6 模板字符串

```ts
const twArg = "slate";
const twArg2 = 500;
// const templateStr = `text-${twArg}-${twArg2}`

// parser: 模板字符串的解析函数
function parser(
  templateStrArr: TemplateStringsArray,
  ...insertedValues: any[]
) {
  // templateStrArr: ['text-', '-', '']
  // insertedValues: ['slate', 500]
  console.log(templateStrArr, insertedValues);
  return `color: #62748e;`;
}
const parsedStr = parser`text-${twArg}-${twArg2}`;
console.log(parsedStr); // color: #62748e
```
