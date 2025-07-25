# JS/TS

## node 命令行

```bash
node ./index.js --watch

node ./index.js --env-file ./.env.development
node ./index.js --env-file ./.env.production
```

## 彩色打印

```js
// 彩色打印
import { styleText } from "node:util";
console.log(styleText("green", "Hello World"));
```

## 事件循环

JS 是单线程的

- 如果 JS 是多线程的, 同时操作 DOM 时可能冲突; 例如两个线程同时操作一个 DOM, 一个负责修改、另一个负责删除
- 有多线程的 Web Worker, 但是 Web Worker 不允许操作 DOM (没有 GUI 渲染线程的访问权限)

chrome 为每一个页面分配一个进程, 该进程是多线程的, 主要包含

- GUI 渲染线程: 负责解析 HTML、CSS; 构建 DOM 树、CSSOM 树; 将 DOM 树和 CSSOM 树合并为渲染树; 回流和重绘等
  - 当页面需要重绘 (repaint) 或回流 (reflow) 时, 执行 GUI 渲染线程
  - GUI 渲染线程和 JS 引擎线程是互斥执行的, 即 GUI 渲染线程执行时, JS 引擎线程会被挂起; JS 引擎线程执行时, GUI 渲染线程会被挂起
  - requestAnimationFrame 依赖 GUI 渲染线程
- JS 引擎线程 (主线程): 负责将同步任务加入同步任务栈 (函数调用栈), 执行所有同步代码, 宏任务和微任务
- 事件触发线程: 负责将异步任务加入异步任务队列 (宏任务加入宏任务队列, 微任务加入微任务队列), 包括:
  - 定时器触发线程: setTimeout, setInterval 依赖定时器触发线程
  - 网络线程: XMLHttpRequest, fetch 依赖网络线程
  - I/O 线程: 负责文件读写, postMessage 等

单线程本质: JS 引擎线程 (主线程) 负责执行所有同步代码, 宏任务和微任务, 宏任务触发可能依赖其他线程

## 模板字符串

```ts
const twArg = "slate";
const twArg2 = 500;
// const templateStr = `text-${twArg}-${twArg2}`

// parser: 模板字符串的解析函数
function parser(
  templateStrArr: TemplateStringsArray,
  ...insertedValues: unknown[]
) {
  // templateStrArr: ['text-', '-', '']
  // insertedValues: ['slate', 500]
  console.log(templateStrArr, insertedValues);
  return `color: #62748e;`;
}

const parsedStr = parser`text-${twArg}-${twArg2}`;
console.log(parsedStr); // color: #62748e
```

## 同步任务, 异步任务 (宏任务, 微任务)

同步任务: 代码从上到下顺序执行

异步任务: 分为宏任务和微任务

- 宏任务
  - `<script>` 整体代码
  - `setTimeout`, `setInterval` 定时器触发
  - `XMLHttpRequest`, `fetch`, `postMessage` I/O 操作
  - `requestAnimationFrame` 下一帧重绘、回流前, 执行传递的回调函数
  - `setImmediate`
- 微任务

  - `Promise[.then, .catch, .finally]`
  - `MutationObserver` 监听整个 DOM 树的改变
  - `process.nextTick` node 环境, 当前事件循环的所有的微任务执行前, 执行传递的回调函数

- Promise 的构造函数是同步的 `new Promise((resolve, reject) => {/** 同步代码 */})`

### 运行机制

- 同步任务栈: 存放同步任务 (无需关注)
- 异步任务队列
  - 宏任务队列: 宏任务加入宏任务队列
  - 微任务队列: 微任务加入微任务队列

> [!important]
>
> 每一个事件循环, 先执行一个宏任务, 再执行该宏任务的所有微任务, 再进入下一个事件循环

### 练习

```js
//=======================
// 宏任务 0 (整体代码)
//=======================

async function wtf() {
  console.log("Y");
  await Promise.resolve(); // 宏任务 0 的微任务 4
  console.log("X");
  // 等价于
  // Promise.resolve().then((/* value */) => console.log('X'))
}

// 宏任务 1
setTimeout(() => {
  console.log(1);
  Promise.resolve().then((/* value */) => console.log(2)); // 宏任务 1 的微任务 5
}, 0);

// 宏任务 2
setTimeout(() => {
  console.log(3);
  Promise.resolve().then(() => console.log(4)); // 宏任务 2 的微任务 6
}, 0);

Promise.resolve().then((/* value */) => console.log(5)); // 宏任务 0 的微任务 0
Promise.resolve().then((/* value */) => console.log(6)); // 宏任务 0 的微任务 1
Promise.resolve().then((/* value */) => console.log(7)); // 宏任务 0 的微任务 2
Promise.resolve().then((/* value */) => console.log(8)); // 宏任务 0 的微任务 3

wtf();
console.log(0);

// 宏任务队列: 宏任务 0,           宏任务 1,   宏任务 2
// 微任务队列: 微任务 0,1,2,3,4,   微任务 5,   微任务 6

// Y 0 5 6 7 8 X 1 2 3 4 (一共 3 轮事件循环)
```

## 浏览器在 1 帧中做了什么

对于 60fps 的屏幕, 1 帧是 1000/60 = 16.7ms, 浏览器在 1 帧中:

1. 处理用户事件: 例如 change, click, input 等
2. 执行定时器回调函数
3. 执行 requestAnimationFrame
4. 回流和重绘: 回流 reflow, 有关宽高等, 性能开销大; 重绘 repaint, 有关颜色等, 性能开销小
5. 如果有空闲时间, 则执行 requestIdleCallback (例如 idle 期间可以懒加载 JS 脚本)

## v8 垃圾回收

v8 将堆内存分为新生代和老年代, 新生代中的对象存活时间较短, 老生代中的对象存活时间较长, 甚至常驻内存

代际假说认为, 大多数对象存活时间较短

### 新生代 gc: Scavenge 算法

新生代 gc 主要使用 Scavenge 算法

1. Scavenge 算法将新生代的堆内存一分为二, 每个内存空间称为 semi-space
2. 两个 semi-space 中, 一个处于使用状态, 称为 from-space; 另一个处于闲置状态, 称为 to-space
3. 分配对象时, 先在 from-space 中分配
4. 垃圾回收时, 复制 from-space 中的存活对象到 to-space 中, 释放死亡对象 (垃圾) 占用的内存
5. 复制后, 交换 from-space 和 to-space

即新生代的 gc 是将存活对象在两个 semi-space 间复制

### 对象晋升 (新生代 => 老年代)

对象从新生代 from-space 晋升到老年代的条件: 对象至少经历过 1 次 gc, 或新生代 to-space 的内存占用率超过 25%

### 老年代 gc: Mark-Sweep (标记-清除) 或 Mark-Compact (标记-紧凑)

```js
// 引用计数法不能解决循环引用问题
(() => {
  let a = {};
  let b = {};
  a.ptr = b;
  b.ptr = a;
})();
```

#### Mark-Sweep (标记-清除) 内存碎片化程度低时执行

标记

- 构建一个根列表, 从根节点出发, 遍历所有可达对象, 标记为存活的; 不可达对象视为死亡的 (垃圾)
- 根节点包括全局对象、函数的参数, 局部变量、闭包引用的对象、DOM 元素等...

清除: 清除阶段直接回收死亡对象 (垃圾) 占用的内存, 可能导致内存碎片化

#### Mark-Compact (标记-紧凑) 内存碎片化程度高时执行

标记

- 构建一个根列表, 从根节点出发, 遍历所有可达对象, 标记为存活的; 不可达对象视为死亡的 (垃圾)
- 根节点包括全局对象; 函数的参数, 局部变量; 闭包引用的对象; DOM 元素等...

紧凑: 紧凑阶段先将存活的对象移动到连续内存区域, 以消除内存碎片; 再回收其他内存区域

### 如何避免内存泄漏

1. 少创建全局变量
2. 手动清除定时器 (clearTimeout, clearInterval)
3. 少使用闭包
4. 清除 DOM 引用
5. WeakMap 和 WeakSet 的键名引用的对象都是弱引用, 不会增加引用计数

案例 1

```js
function foo() {
  let a = 1;
  return function () {
    return a;
  };
}

const bar = foo();
```

- 通常, 函数执行结束后, 该函数的内部变量会被释放
- foo 函数返回 bar 函数, bar 函数有对 foo 函数的内部变量 a 的引用, foo 函数执行结束后, foo 函数的内部变量不会被释放
- 需要手动 `bar = null`, foo 函数的内部变量才会被释放

案例 2

```js
const map = new Map([["btn", document.getElementById("btn")]]);
const obj = { btn: document.getElementById("btn") };

function remove() {
  document.body.removeChild(document.getElementById("btn"));
}
```

- 调用 remove 函数以移除 button 元素, 但是 map, obj 中仍有对该 button 元素的引用
- 需要手动 `map.delete('btn')` 和 `delete obj.btn` (或 `obj.btn = null`)

### WeakMap 实验

```js
// node --expose-gc # 允许手动 gc
global.gc();
// 查看当前内存占用
process.memoryUsage().heapUsed; // 5e6

const wm = new WeakMap();
let bigArray = new Array(1000000);
wm.set(bigArray /** key */, 1 /** value */);
process.memoryUsage().heapUsed; // 1e7

bigArray = null;
process.memoryUsage().heapUsed; // 1e7
global.gc();
process.memoryUsage().heapUsed; // 5e6
```

## Web Worker

### 概述

Web Worker 允许主线程创建 worker 线程 (不允许操作 DOM), worker 线程创建后, 就会始终运行, 不会被主线程打断

Web Worker 有以下限制

1. worker 线程执行的脚本与主线程执行的脚本必须同源
2. worker 线程不允许操作 DOM
3. worker 线程不允许读取本地文件, 只允许加载网络文件

### 基本使用

::: code-group

```js [主线程]
// 主线程创建一个 worker 子线程
const worker = new Worker("./webWorker.js");
// 主线程向 worker 子线程发送消息
worker.postMessage({ send: "ping" });

// 主线程监听 worker 子线程抛出的错误
worker.onerror = function (err) {
  console.log("[main] error:", err);
};

// 主线程监听 worker 子线程发送的消息
worker.onmessage = function (ev) {
  console.log("[main] message:", ev.data); // { echo: "pong" }
  // 主线程终止子线程
  worker.terminate();
};
```

```js [worker 子线程]
const messageListener = function (ev) {
  console.log("[worker] message:", ev.data); // { send: 'ping' }
  self.postMessage({ echo: "pong" });
  // worker 子线程主动关闭
  self.close();
};

// worker 子线程监听主线程发送的消息
self.addEventListener("message", messageListener);
```

:::

## 数据通信

主线程和 worker 线程的通信: 深拷贝

避免深拷贝: 转移所有权

```js
// 主线程
const arr = new Uint8Array(new ArrayBuffer(8));
worker.postMessage(arr); // 深拷贝
worker.postMessage(arr, [arr]); // 转移所有权

// worker 线程
self.onmessage = function (ev) {
  console.log(ev.data);
};
```

## TS 类型工具

- `Partial<Type>` 所有字段可选
- `Required<Type>` 所有字段必选
- `Readonly<Type>` 所有字段只读
- `Record<Key, Value>`
- Pick, Exclude, Omit, ReturnType

```ts
// 接口
interface IAdd {
  (a: number, b: number): number;
}

// Pick
interface IUser {
  name: string;
  age: number;
  gender: "male" | "female";
}

type TLgbt = Pick<IUser, "name" | "age">; // { name: string; age: number; }

// Exclude
type TOptions = "A" | "B" | "C" | "D";
type TError = "A" | "B";
type TOk = Exclude<TOptions, TError>; // "C" | "D"

// Omit
type TGender = Omit<IUser, "name" | "age">; // { gender: "male" | "female"; }

// ReturnType<Fn>
const fn = (a: number, b: number) => [a, b];
type TParameters /** [a: number, b: number] */ = Parameters<typeof fn>;
type TReturnType /** number[] */ = ReturnType<typeof fn>;
```

## TS 泛型推断

### infer 泛型推断

```ts
//==================
// 泛型推断
//==================
interface IUser {
  name: string;
  age: number;
}

type PromisifiedUser = Promise<IUser>;

type TryInferGenericsType<T> =
  T extends Promise<infer UnknownGenericsType>
    ? UnknownGenericsType // infer succeed
    : T; // infer failed

// type InferredGenericsType = IUser
type InferredGenericsType = TryInferGenericsType<PromisifiedUser>;
const user: InferredGenericsType = { name: "whoami", age: 1 };

//==================
// 递归的泛型推断
//==================
type DeepPromisifiedUser = Promise<Promise<Promise<IUser>>>;
type TryRecursivelyInferGenericsType<T> =
  T extends Promise<infer UnknownGenericsType>
    ? TryRecursivelyInferGenericsType<UnknownGenericsType>
    : T;
type RecursivelyInferredGenericsType =
  TryRecursivelyInferGenericsType<DeepPromisifiedUser>;

// type RecursivelyInferredGenericsType = IUser
const user2: RecursivelyInferredGenericsType = { name: "whoami", age: 1 };
```

### infer 协变 (类型的并集)、逆变 (类型的交集)

```ts
const user = { name: "whoami", age: 1 };
type TryInferType<T> = T extends {
  name: infer UnknownNameType;
  age: infer UnknownAgeType;
}
  ? [UnknownNameType, UnknownAgeType]
  : T;

type InferredType /** [string, number] */ = TryInferType<typeof user>;
const user2: InferredType = [user.name, user.age];

//==================
// 协变返回或类型
//==================
type TryInferType<T> = T extends {
  name: infer UnknownUnionType;
  age: infer UnknownUnionType;
}
  ? UnknownUnionType
  : T;
type InferredType /** string | number */ = TryInferType<typeof user>;
const str: InferredType = "whoami";
const num: InferredType = 1;

//==================
// 逆变返回与类型
//==================
type TryInferType<T> = T extends {
  fn1: (arg: infer UnknownArgType) => void;
  fn2: (arg: infer UnknownArgType) => void;
}
  ? UnknownArgType
  : unknown;

type InferredType /** never (number & string === never) */ = TryInferType<{
  fn1: (arg: number) => void;
  fn2: (arg: string) => void;
}>;
type InferredType2 /** number */ = TryInferType<{
  fn1: (arg: number) => void;
  fn2: (arg: number) => void;
}>;
```

### Demo 1

```ts
type Arr = ["a", "b", "c"];

type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  infer UnknownSecondElemType,
  infer UnknownThirdElemType,
]
  ? {
      first: UnknownFirstElemType;
      second: UnknownSecondElemType;
      third: UnknownThirdElemType;
    }
  : unknown;

// { first: "a", second: "b", third: "c" }
type InferredType = TryInferType<Arr>;
```

### Demo 2

```ts
//==================
// FirstElemType
//==================
type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  ...unknown[],
]
  ? UnknownFirstElemType
  : unknown;

type InferredType /** "a" */ = TryInferType<Arr>;

//==================
// PreRestType
//==================
type TryInferType<T extends unknown[]> = T extends [
  ...infer UnknownPreRestType,
  unknown,
]
  ? UnknownPreRestType
  : unknown;

type InferredType /** ["a", "b"] */ = TryInferType<Arr>;

//==================
// LastElemType
//==================
type TryInferType<T extends unknown[]> = T extends [
  ...unknown[],
  infer UnknownLastElemType,
]
  ? UnknownLastElemType
  : unknown;

type InferredType /** "c" */ = TryInferType<Arr>;

//==================
// RestType
//==================
type TryInferType<T extends unknown[]> = T extends [
  unknown,
  ...infer UnknownRestType,
]
  ? UnknownRestType
  : unknown;

type InferredType /** ["b", "c"] */ = TryInferType<Arr>;
```

### Demo 3

```ts
type Arr = [1, 2, 3, 4, 5];
type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  ...infer UnknownRestType,
]
  ? [...TryInferType<UnknownRestType>, UnknownFirstElemType] // Recurse
  : T;

type InferredType /** [5, 4, 3, 2, 1] */ = TryInferType<Arr>;
type ReversedArr = InferredType;
```

## TS 装饰器

::: code-group

```ts [类装饰器]
const ClassDecoratorInst: ClassDecorator = (target) => {
  // target: 类, 类是构造函数的语法糖
  console.log(target.name); // Sugar
  console.log(typeof target); // function
  target.prototype.name = "NewSugar";
};

@ClassDecoratorInst
class Sugar {}

const sugar: any = new Sugar();
console.log(sugar.name); // NewSugar
```

```ts [属性装饰器]
const PropDecoratorInst: PropertyDecorator = (target, propKey) => {
  // target: 原型对象
  // propKey: 属性名
  console.log(target, propKey);
};

class Sugar {
  @PropDecoratorInst
  public name: string = "sugarInst";

  @PropDecoratorInst
  add = function (a: number, b: number) {
    return a + b;
  };

  @PropDecoratorInst
  sub = (a: number, b: number) => a - b;
}

const sugar = new Sugar();
console.log(sugar.name); // sugarInst
console.log(sugar.add(1, 2)); // 3
console.log(sugar.sub(1, 2)); // -1
```

```ts [方法装饰器]
const MethodDecoratorInst: MethodDecorator = (
  target, // 原型对象
  propKey, // 属性名, 即方法名
  propDescriptor, // 属性描述对象
) => {
  console.log(target, propKey, propDescriptor);
};

class Sugar {
  private _name: string = "sugarInst";

  @MethodDecoratorInst
  foo(a: number, b: number) {
    return a + b;
  }

  @MethodDecoratorInst
  get name() {
    return this._name;
  }

  set name(newName: string) {
    this._name = newName;
  }
}

const sugar = new Sugar();
console.log(sugar.name); // sugarInst
sugar.name = "newSugarInst";
console.log(sugar.name); // newSugarInst
```

```ts [参数装饰器]
const ParamDecoratorInst: ParameterDecorator = (
  target, // 原型对象
  propKey, // 属性名, 即方法名
  paramIndex, // 参数索引
) => {
  console.log(target, propKey, paramIndex);
};

class Sugar {
  private _name: string = "sugarInst";

  add(@ParamDecoratorInst a: number, @ParamDecoratorInst b: number) {
    return a + b;
  }

  get name() {
    return this._name;
  }

  set name(@ParamDecoratorInst newName: string) {
    this._name = newName;
  }
}

const sugar = new Sugar();
console.log(sugar.name); // sugarInst
sugar.name = "newSugarInst";
console.log(sugar.name); // newSugarInst
```

:::

```ts
// 高阶函数
const Get: (url: string) => MethodDecorator = (url: string) => {
  return (target, propKey, propDescriptor) => {
    const method: any = propDescriptor.value;
    fetch(url)
      .then((res) => res.text())
      .then((data) => {
        method(data, { code: 200, msg: "OK" });
      })
      .catch((err) => {
        method(err, { code: 404, msg: "Not Found" });
      });
  };
};

class Controller {
  constructor() {}

  @Get("https://161043261.github.io/")
  getHomepage(
    res: any,
    status: {
      code: number;
      msg: string;
    },
  ) {
    console.log(res, status);
  }
}
```
