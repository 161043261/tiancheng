# Event Loop 事件循环

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

# 同步任务, 异步任务 (宏任务, 微任务)

- 同步任务: 代码从上到下顺序执行
- 异步任务: 分为宏任务和微任务
  - 宏任务: `<script>` 整体代码, setTimeout, setInterval, I/O 操作 (XMLHttpRequest, fetch, postMessage), requestAnimationFrame (下一帧时执行传递的回调函数), setImmediate (node 环境, 当前事件循环结束后执行传递的回调函数)
  - 微任务: Promise[.then, .catch, .finally], MutationObserver (监听 DOM 树的改变), process.nextTick (node 环境)

Promise 的构造函数是同步的 `new Promise((resolve, reject) => {/** 同步代码 */})`

## 运行机制

- 同步任务栈 Stack: 存放同步任务
- 异步任务队列 Queue: 先执行一个宏任务, 再执行当前宏任务的微任务, 然后进入下一个事件循环
  - 宏任务队列
  - 微任务队列

## 练习

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
