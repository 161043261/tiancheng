# JS/TS

## Event Loop 事件循环

**JS 是单线程的**: JS 的主要任务是操作 DOM, 处理用户交互; 如果 JS 是多线程的, 可能操作 DOM 冲突, 例如两个线程同时操作一个 DOM, 一个负责修改另一个负责删除

chrome 为每一个页面创建一个渲染进程, 渲染进程是多线程的, 主要包含

- **GUI 渲染线程**: 负责渲染页面, 解析 HTML, CSS; 构建 DOM 树, CSSOM 树; 将 DOM 树和 CSSOM 树合并为渲染树 (Render Tree); 布局和绘制等; 当页面需要重绘 (repaint) 或回流 (reflow, 也称为重排) 时, 执行 GUI 渲染线程; 注意: GUI 渲染线程和 JS 引擎线程是互斥执行的, 即 GUI 渲染线程执行时, JS 引擎线程会被挂起; JS 引擎线程执行时, GUI 渲染线程会被挂起
- **JS 引擎线程**: 负责解析, 执行 JS 代码, JS 是单线程的, 一个页面 (一个渲染进程) 中只有一个 JS 引擎线程 (例如 V8 引擎), JS 的主要任务是操作 DOM, 处理用户交互; 如果 JS 是多线程的, 可能操作 DOM 冲突, 例如两个线程同时操作一个 DOM, 一个负责修改另一个负责删除
- **事件触发线程**: 控制事件循环, 负责将同步任务加入同步任务栈 (函数调用栈), 将异步任务加入异步任务队列 (宏任务加入宏任务队列, 微任务加入微任务队列)
- **定时器触发线程**: 执行 setTimeout, setInterval 的线程
- **异步 http 请求线程**: 执行 XMLHttpRequest 的线程
- **I/O 线程**: 负责文件 I/O, 进程间通信 IPC

**单线程本质**: JS 主线程负责执行所有同步代码, 微任务和宏任务回调, 宏任务触发可能依赖其他线程

- setTimeout/setInterval: 依赖定时器触发线程
- I/O 操作: XMLHttpRequest, fetch, postMessage 依赖网络线程, node 环境依赖 libuv
- requestAnimationFrame: 依赖 GUI 渲染线程

## 同步任务, 异步任务 (宏任务, 微任务)

- 同步任务: 代码从上到下顺序执行
- 异步任务: 分为宏任务和微任务
  - 宏任务: `<script>` 整体代码, setTimeout, setInterval, I/O 操作 (XMLHttpRequest, fetch, postMessage), requestAnimationFrame (下一帧时执行传递的回调函数), setImmediate (node 环境, 当前事件循环结束后执行传递的回调函数)
  - 微任务: Promise[.then, .catch, .finally], MutationObserver (监听 DOM 树的改变), process.nextTick (node 环境)

Promise 的构造函数是同步的 `new Promise((resolve, reject) => {/** 同步代码 */})`

### 运行机制

- 同步任务栈 Stack: 存放同步任务
- 异步任务队列 Queue: 先执行一个宏任务, 再执行当前宏任务的微任务, 然后进入下一个事件循环
  - 宏任务队列
  - 微任务队列

### 练习

```js
// 宏任务 0 (整体代码)

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
4. 计算布局, 绘制: 执行 DOM 的重绘 (repaint 有关颜色的..., 性能开销小) 和回流 (reflow 重排, 有关宽高的..., 性能开销大) 等
5. 如果有空闲时间, 则执行 requestIdleCallback (IDLE 期间可以懒加载 JS 脚本)

- `Partial<Type>` 所有字段可选
- `Required<Type>` 所有字段必选
- `Readonly<Type>` 所有字段只读
- `Record<Key, Value>`

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

## v8 垃圾回收

v8 将堆内存分为新生代和老年代, 新生代中的对象存活时间较短, 老生代中的对象存活时间较长, 或常驻内存

垃圾回收中, 代际假说认为大多数对象存活时间较短

### 新生代 gc: Scavenge 算法

在分代的基础上, 新生代的对象主要通过 Scavenge 算法进行垃圾回收

1. Scavenge 算法将堆内存一分为二, 每个内存空间称为 semi-space
2. 两个 semi-space 中, 只有一个处于使用状态, 称为 from-space; 另外一个处于闲置状态, 称为 to-space
3. 分配对象时, 先在 from-space 中分配
4. 垃圾回收时, 检查 from-space 中的存活对象, 复制存活对象到 to-space 中, 释放非存活对象占用的内存
5. 复制后, 交换 from-space 和 to-space

即新生代的 gc 就是将存活对象在两个 semi-space 间复制

### 对象晋升 (新生代 => 老年代)

对象从新生代 (from-space) 晋升到老年代的条件: 对象至少经历过 1 次 gc, 或 to-space 的内存使用率超过 25%

### 老年代 gc: Mark-Sweep (标记清除) 或 Mark-Compact (紧凑)

```js
// 引用计数法不能解决循环引用问题
(() => {
  let a = {};
  let b = {};
  a.ptr = b;
  b.ptr = a;
})();
```

### Mark-Sweep (标记-清除) 内存碎片化程度低时执行

**标记**

- 构建一个根列表, 从根节点出发, 遍历所有可达对象, 标记为存活的; 不可达对象视为死亡的 (垃圾)
- 根节点包括全局对象; 函数的参数, 局部变量; 闭包引用的对象; DOM 元素等...

**清除**: 清除阶段直接回收死亡对象 (垃圾) 占用的内存, 可能导致内存碎片化

### Mark-Compact (标记-紧凑) 内存碎片化程度高时执行

**标记**

- 构建一个根列表, 从根节点出发, 遍历所有可达对象, 标记为存活的; 不可达对象视为死亡的 (垃圾)
- 根节点包括全局对象; 函数的参数, 局部变量; 闭包引用的对象; DOM 元素等...

**紧凑**: 紧凑阶段先将存活的对象移动到连续内存区域, 以消除内存碎片; 再回收其他内存区域

### 如何避免内存泄漏

1. 少创建全局变量
2. 手动清除定时器 (clearTimeout, clearInterval)
3. 少使用闭包
4. 清除 DOM 引用
5. WeakMap 和 WeakSet 的键名引用的对象都是弱引用, 不会增加引用计数

```js
function foo() {
  let a = 1;
  return function () {
    return a;
  };
}

const bar = foo();
console.log(bar());
```

foo 函数返回一个匿名函数, 该匿名函数引用 foo 函数内部变量 a, 通过 `const bar = foo()`, 使得可以在 foo 函数外部访问 a; 一般的, 函数执行结束后, 该函数的内部变量就会被释放, 但是 foo 函数执行结束后, 返回 bar 函数, bar 函数有对 foo 函数内部变量 a 的引用, foo 函数的内部变量不会被释放, 显式 `bar = null`, foo 函数的内部变量才会被释放

```js
const map = new Map([["btn", document.getElementById("btn")]]);
const record = { btn: document.getElementById("btn") };
function remove() {
  document.body.removeChild(document.getElementById("btn"));
}
```

调用 `remove` 以移除 button 元素, 但是 map, record 中仍有对该 button 元素的引用, 需要手动 `map.delete('btn')` 和 `delete record.btn` (或 `record.btn = null`)

### WeakMap 实验

```js
// node --expose-gc # 允许手动 gc
global.gc();
// 查看当前内存占用
process.memoryUsage().heapUsed; // 5399792

const wm = new WeakMap();
let bigArray = new Array(1000000);
wm.set(bigArray /** key */, 1 /** value */);
process.memoryUsage().heapUsed; // 13293888

bigArray = null;
process.memoryUsage().heapUsed; // 13629312
global.gc();
process.memoryUsage().heapUsed; // 5478168
```

## Web Worker

### 概述

Web Workers 允许主线程创建 worker 线程, 主线程负责 UI 事件, worker 线程负责计算密集型任务 (不允许操作 DOM), 页面会更加流畅, worker 线程创建后, 就会始终运行, 不会被主线程打断

Web Workers 有以下限制

1. 同源限制: worker 线程执行的脚本必须与主线程执行的脚本同源
2. worker 线程不允许操作 DOM, 不允许使用 document, window, parent 等对象, 但是可以使用 navigator 和 location 对象
3. worker 线程不允许调用 alert() 和 confirm 方法, 但是可以使用 XMLHttpRequest 对象发送 AJAX 请求
4. worker 线程不允许读取本地文件, 只允许加载网络文件

### 基本使用

::: code-group

```js [主线程]
// 主线程创建一个 worker 子线程
const worker = new Worker("./concurrent.js");
// 主线程向 worker 子线程发送消息
worker.postMessage("ping" /** any */);

// 主线程监听 worker 子线程的错误
worker.onerror = function (err) {
  console.log(err.filename, err.lineno, err.message);
};
// 等价于
worker.addEventListener("error", function (err) {
  console.log(err.filename, err.lineno, err.message);
});

// 主线程监听 worker 子线程返回的消息
worker.onmessage = function (ev) {
  // 主线程收到 worker 子线程返回的计算密集型任务的结果
  console.log("Receive message:", ev.data);
  // 主线程终止子线程
  worker.terminate();
};
```

```js [worker 子线程]
// worker 子线程监听 message 事件, 即监听主线程发送的消息
/** self. */ addEventListener("message", function (ev) {
  /** self. */ postMessage("Echo:", ev.data);
  // worker 子线程可以加载其他脚本
  importScripts("web_script.js");
  // worker 子线程可以自我关闭
  /** self. */ close();
});
```

:::

## 数据通信

主进程和 worker 进程的通信: 深拷贝

避免深拷贝: 使用 Transferable Objects (转移所有权)

```js
// 主进程
const arr = new Uint8Array(new ArrayBuffer(10));
worker.postMessage(arr); // 发送深拷贝后的字节数组
worker.postMessage(arr, [arr]); // 转移所有权

// worker 线程
/* self. */ onmessage = function (ev) {
  console.log(ev.data);
};
```

## infer (TS)

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

## 装饰器 (TS)

::: code-group

```ts [ClassDecorator]
// 类装饰器
// target: 类, 类是构造函数的语法糖
const classDecorator: ClassDecorator = (target) => {
  console.log(target.name); // Sugar
  console.log(typeof target); // function
  console.log(target.toString());
  // class Sugar {
  //   constructor() {}
  // }
  target.prototype.name = "instance";
};

@classDecorator
class Sugar {
  constructor() {}
}

const sugar: any = new Sugar();
console.log(sugar.name); // instance
// classDecorator(Sugar); // @classDecorator 等价于 classDecorator(Sugar)
```

```ts [PropertyDecorator]
// 属性装饰器
//! target: 原型对象
//! propertyKey: 属性名
const propDecorator: PropertyDecorator = (target, propertyKey) => {
  // {} name
  // {} foo
  // {} bar
  console.log(target, propertyKey);
};

class Sugar {
  @propDecorator
  public name: string = "instance";

  @propDecorator
  foo: (a: number, b: number) => number = function (a, b) {
    return a + b;
  };

  @propDecorator
  bar: (a: number, b: number) => number = (a, b) => a + b;
}

const sugar = new Sugar();
console.log(sugar.name); // instance
```

```ts [MethodDecorator]
// 方法装饰器
//! target: 原型对象
//! propertyKey: 方法名
//! propDescriptor: 属性描述对象
const methodDecorator: MethodDecorator = (
  target,
  propertyKey, // methodName
  propDescriptor,
) => {
  // {} foo { value, writable, enumerable, configurable }
  // {} name { get, set, enumerable, configurable }
  console.log(target, propertyKey, propDescriptor);
};

// 不能对 get, set 同时使用装饰器, 对 get 或 set 中任意一个使用装饰器即可
class Sugar {
  private _name: string = "instance";

  @methodDecorator
  foo(a: number, b: number) {
    return a + b;
  }

  @methodDecorator
  get name() {
    return this._name;
  }

  set name(newName: string) {
    this._name = newName;
  }
}

const sugar = new Sugar();
console.log(sugar.name); // instance
sugar.name = "newInstance";
console.log(sugar.name); // newInstance
```

```ts [ParameterDecorator]
// 参数装饰器
// target: 原型对象
// propertyKey: 方法名
// parameterIndex: 参数索引
const paramDecorator: ParameterDecorator = (
  target,
  propertyKey,
  parameterIndex,
) => {
  // {} foo 1
  // {} foo 0
  console.log(target, propertyKey, parameterIndex);
};
class Sugar {
  private _name: string = "instance";
  foo(@paramDecorator a: number, @paramDecorator b: number) {
    return a + b;
  }
  get name() {
    return this._name;
  }
  set name(@paramDecorator newName: string) {
    this._name = newName;
  }
}

const sugar = new Sugar();
console.log(sugar.name); // instance
sugar.name = "newInstance";
console.log(sugar.name); // newInstance
```

:::

```ts
// 高阶函数
const Get: (url: string) => MethodDecorator = (url: string) => {
  return (target, propKey, propDescriptor) => {
    // console.log(propDescriptor.value);
    const method: any = propDescriptor.value;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        method(data, { statusCode: 200, statusText: "OK" });
      })
      .catch((err) => {
        method(err, { statusCode: 404, statusText: "Not Found" });
      });
  };
};

class Controller {
  constructor() {}
  @Get("https://api.apiopen.top/api/getHaoKanVideo?page=0&size=10")
  getList(
    res: any,
    status: {
      statusCode: number;
      statusText: string;
    },
  ) {
    console.log(res?.result?.list, status);
  }
}
```
