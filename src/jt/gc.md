# v8 垃圾回收

v8 将堆内存分为新生代和老年代, 新生代中的对象存活时间较短, 老生代中的对象存活时间较长, 或常驻内存

垃圾回收中, 代际假说认为大多数对象存活时间较短

## 新生代 gc: Scavenge 算法

在分代的基础上, 新生代的对象主要通过 Scavenge 算法进行垃圾回收

1. Scavenge 算法将堆内存一分为二, 每个内存空间称为 semi-space
2. 两个 semi-space 中, 只有一个处于使用状态, 称为 from-space; 另外一个处于闲置状态, 称为 to-space
3. 分配对象时, 先在 from-space 中分配
4. 垃圾回收时, 检查 from-space 中的存活对象, 复制存活对象到 to-space 中, 释放非存活对象占用的内存
5. 复制后, 交换 from-space 和 to-space

即新生代的 gc 就是将存活对象在两个 semi-space 间复制

## 对象晋升 (新生代 => 老年代)

对象从新生代 (from-space) 晋升到老年代的条件: 对象至少经历过 1 次 gc, 或 to-space 的内存使用率超过 25%

## 老年代 gc: Mark-Sweep (标记清除) 或 Mark-Compact (紧凑)

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

## 如何避免内存泄漏

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

## WeakMap 实验

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
