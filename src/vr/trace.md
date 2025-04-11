# 前端监控

记录项目的错误, 还原错误; 3 种还原错误的方式: 定位源码 [source-map](https://github.com/mozilla/source-map), 播放异常录屏, 记录用户行为

一个完整的前端监控平台包括: 数据采集和上报, 数据分析和存储, 数据显示

## 异常分析

5W1H 分析法

- What 发生了什么错误: JS 错误, 异步错误, 资源加载错误, 后端接口错误
- When 发生错误时的时间戳, 或时间段
- Who 影响了多少用户: 包括错误事件数, 用户的 IP
- Where 报错的页面, 对应的设备信息
- Why 错误的原因: 包括错误堆栈, 代码行号/列号, SourceMap, 异常录屏
- How 如何异常报警; 定位, 还原问题, 避免类似的错误再发生

## 错误捕获方式

### try/catch

可以捕获运行时错误, 不能捕获语法错误和异步错误

::: code-group

```js [运行时错误 √]
try {
  let a = undefined;
  if (a.length) {
    console.log("浮槎竟天");
  }
} catch (e) {
  console.error(e);
}
```

```js [语法错误 ×]
try {
  const notDefined;
} catch(e) {
  console.error(e);
}
```

```js [异步错误 ×]
try {
  setTimeout(() => {
    console.log(notDefined);
  }, 0);
} catch (e) {
  console.error(e);
}
```

:::

### window.onerror

window.onerror 可以捕获运行时错误, 异步错误; 不能捕获语法错误, 资源加载错误

```js
/**
 * @param { string } message 错误信息
 * @param { string } source 发生错误的脚本 URL
 * @param { number } lineno 发生错误的行号
 * @param { number } colno 发生错误的列号
 * @param { object } error Error 对象
 */
window.onerror = function (message, source, lineno, colno, error) {
  console.error(message, source, lineno, colno, error);
};

// 例1: 常规运行时错误, 可以捕获
console.log(notDefined);
// 例2: 语法错误, 不能捕获
const notDefined;
// 例3: 异步错误, 可以捕获
setTimeout(() => {
  console.log(notDefined);
}, 0);
// 例4: 资源加载错误, 不能捕获
const script = document.createElement("script");
script.type = "text/javascript";
script.src = "https://161043261.github.io/index.js";
document.body.appendChild(script);
```

### window.addEventListener

静态资源 (CSS, JS, 图片, 视频等) 加载失败时, 会触发 error 事件, `window.onerror` 不能捕获 (`window.onerror` 仅捕获 JS 运行时错误), 但 error 事件 `window.addEventListener('error', cb)` 可以捕获

```js
// 静态资源 (CSS, JS, 图片, 视频等) 加载失败时, 会触发 error 事件
window.addEventListener("error", (e) => console.log(e), true);
```

### Promise 错误

Promise 中抛出的错误, `try/catch`, `window.onerror`, error 事件不能捕获, 但 unhandledrejection 事件 `window.addEventListener('unhandledrejection', cb)` 可以捕获

```js
// 捕获 Promise 中抛出的错误
window.addEventListener("unhandledrejection", (e) => {
  console.log(e);
  // 阻止默认行为, 不会在控制台打印
  e.preventDefault();
});
```

### Vue 错误

Vue 项目中, `window.onerror` 和 error 事件都不能捕获错误, 需要使用 `app.config.errorHandler` 为抛出的未捕获错误指定一个全局处理函数

```ts
import App from "@/App.vue";
const app = createApp(App);
app.config.errorHandler = (err, instance, info) => {
  // 错误上报
  // err 错误对象
  // instance 触发该错误的组件实例
  // info 错误来源信息, 例如错误在哪个生命周期钩子上抛出
  console.log(err, instance, info);
};
```

### React 错误

```tsx
import React, { ErrorInfo } from "react";
import { ReactNode } from "react";

interface IProps {
  // children 属性通常是 React.ReactNode 类型, 类似 Vue 的 slot 插槽
  children: ReactNode;
  fallback?: ReactNode;
}

interface IState {
  hasError: boolean;
}

// 错误边界组件 (类组件)
class ErrorBoundary extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  // 如果定义了 static getDerivedStateFromError, 则 React 会在子组件和后代组件渲染过程中
  // 抛出错误时, 调用该函数, 不是直接清理 UI, 而是显示错误消息, 渲染 fallback
  static getDerivedStateFromError(err: Error) {
    console.error("显示错误消息, 渲染 fallback:", err);
    return { hasError: true };
  }

  // 如果定义了 componentDidCatch, 则 React 会在子组件和后代组件渲染过程中
  // 抛出错误时, 调用该函数, 使得可以在生产环境中记录并报告错误
  componentDidCatch(err: Error, errorInfo: ErrorInfo) {
    console.error("在生产环境中记录并报告错误:", err, errorInfo.componentStack);
    // 上报错误信息给服务器
    reportInfo(err, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function Child() {
  const list: any = {};
  return (
    <div>
      {list.map((val: any, key: any) => (
        <div key={key}>{val}</div>
      ))}
    </div>
  );
}

const ErrorBoundaryDemo: React.FC = () => {
  return (
    <div>
      <ErrorBoundary fallback="报错">
        <Child />
      </ErrorBoundary>
    </div>
  );
};

export default ErrorBoundaryDemo;
```

### 跨域资源加载错误

当前页面中加载其他域名的 JS 等资源, 如果跨域资源加载错误, error 事件只会捕获到 `ErrorEvent { message: "Script error." }` 异常, 例:

::: code-group

```html [当前页面中加载跨域资源]
<script src="https://161043261.github.io/index.js"></script>
<script>
  window.addEventListener("error", console.error, true);
</script>
```

```js [加载的跨域 JS 代码]
function fn() {
  JSON.parse("");
}
```

:::

解决方法1: 前端 script 标签加 crossorigin, 其他域名的后端配置 Access-Control-Allow-Origin

::: code-group

```html [当前页面中加载跨域资源]
<script src="https://161043261.github.io/index.js" crossorigin></script>
<script>
  window.addEventListener("error", console.error, true);
</script>
```

```js [加载的跨域 JS 代码]
function fn() {
  JSON.parse("");
}
```

:::

解决方法2: 使用 try-catch 抛出错误

```html
<!doctype html>
<html>
  <body>
    <script src="https://161043261.github.io/index.js"></script>
    <script>
      window.addEventListener("error", console.error, true);
      try {
        fn();
      } catch (e) {
        throw e;
      }
    </script>
  </body>
</html>
```

### 接口错误

捕获接口错误的实现原理: 对于浏览器内置的 XMLHttpRequest, fetch 对象, 使用 AOP, Aspect Oriented Programming 面向切面编程, 拦截请求, 获取接口错误信息并上报

> [!important] 拦截 XMLHttpRequest 请求
> 详细代码

```js
function xhrReplace() {
  if (!("XMLHttpRequest" in window)) {
    return;
  }
  const xhrProto = XMLHttpRequest.prototype;
  // 重写 XMLHttpRequest 原型上的 open 方法

  /**
   *
   * @param {object} sourceObj 重写的对象
   * @param {string} propKey 重写的属性键
   * @param {function} wrapper 包裹函数
   */
  const replaceAop = (sourceObj, propKey, wrapper) => {
    if (!sourceObj || !(propKey in sourceObj)) return;
    const originalFn = sourceObj[propKey];
    const wrappedFn = wrapper(originalFn);
    sourceObj[propKey] = wrappedFn;
  };

  // 重写 XMLHttpRequest 原型上的 open 方法
  replaceAop(xhrProto, "open", (originalOpen) => {
    return function (...args) {
      // 获取 xhr 请求信息
      this._xhrTrace = {
        method: typeof args[0] === "string" ? args[0].toUpperCase() : args[0],
        url: args[1],
        startTime: new Date().getTime(),
        type: "xhr",
      };
      // 执行原始的 open 方法
      originalOpen.apply(this, args);
    };
  });

  // 重写 XMLHttpRequest 原型上的 send 方法
  replaceAop(xhrProto, "send", (originalSend) => {
    return function (...args) {
      // 请求结束时触发, 不管请求是成功还是失败
      this.addEventListener("loadend", () => {
        const { responseType, response, status } = this;
        const endTime = new Date().getTime();
        this._xhrTrace.reqData = args[0];
        this._xhrTrace.status = status;
        if (["", "json", "text"].indexOf(responseType) !== -1) {
          this._xhrTrace.responseText =
            typeof response === "object" ? JSON.stringify(response) : response;
        }
        // 计算 xhr 请求时长
        this._xhrTrace.elapsedTime = endTime - this._xhrTrace.startTime;
        // 上报 xhr 请求信息给服务器
        reportInfo(this._xhrTrace);
        // 执行原始的 send 方法
      });
      originalSend.apply(this, args);
    };
  });
}
```

> [!important] 拦截 fetch 请求
> 详细代码

```js
function fetchReplace() {
  if (!("fetch" in window)) {
    return;
  }
  const replaceAop = (sourceObj, propKey, wrapper) => {
    if (!sourceObj || !(propKey in sourceObj)) return;
    const originalFn = sourceObj[propKey];
    const wrappedFn = wrapper(originalFn);
    sourceObj[propKey] = wrappedFn;
  };

  replaceAop(window, "fetch", (originalFetch) => {
    return function (url, config) {
      const startTime = new Date().getTime();
      const method = config?.method ?? "GET";
      let _fetchTrace = {
        type: "fetch",
        method,
        reqData: config && config.body,
        url,
      };

      const reportInfo = (xhrTrace) => {
        console.log("上报 fetch 请求信息");
        console.log(xhrTrace);
      };

      return originalFetch.apply(window, [url, config]).then(
        (res) => {
          // res.clone() 克隆响应, 防止响应被标记为已消费
          const resClone = res.clone();
          const endTime = new Date().getTime();
          _fetchTrace = {
            ..._fetchTrace,
            elapsedTime: endTime - startTime,
            status: resClone.status,
          };
          resClone.text().then((data) => {
            _fetchTrace.responseText = data;
            // 上报 fetch 请求信息给服务器
            reportInfo(_fetchTrace);
          });
          // 返回原始 res, 外部继续使用 .then 调用
          return res;
        }, // onfulfilled
        (err) => {
          const endTime = new Date().getTime();
          _fetchTrace = {
            ..._fetchTrace,
            elapsedTime: endTime - startTime,
            status: 0,
            error: err,
          };
          // 上报 fetch 请求信息给服务器
          reportInfo(_fetchTrace);
          throw err;
        }, // onrejected
      );
    };
  });
}
```

## 性能数据采集

- 使用性能监测对象 [PerformanceObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver)
- 使用 [web-vitals](https://github.com/GoogleChrome/web-vitals) 库

## 用户行为数据采集

用户行为包括: 页面跳转 (路由改变), 用户点击事件, 资源加载, 接口调用, 代码报错等行为

### 思路

1. 创建 `Breadcrumb` 面包屑类, 用于记录用户行为
2. 通过重写或添加对应的事件, 完成用户行为数据的采集

```ts
interface ICrumb {
  timeStamp: number;
}

class Breadcrumbs {
  heapCap = 20;
  minHeap: ICrumb[] = [];
  constructor(maxBreadcrumbs_ = 20) {
    this.heapCap = maxBreadcrumbs_;
  }

  push(...data: ICrumb[]) {
    data = data.slice(0, this.heapCap);
    this.minHeap.unshift(...data);
    this.minHeap.slice(0, this.heapCap);
    this.buildMinHeap(data.length - 1, this.minHeap.length);
    return;
  }

  buildMinHeap(lastHeapifyIdx: number, heapSize: number) {
    const lastLeafIdx = heapSize - 1;
    const lastNonLeafIdx = Math.floor((lastLeafIdx - 1) / 2);
    lastHeapifyIdx = Math.min(lastHeapifyIdx, lastNonLeafIdx);
    for (let i = lastHeapifyIdx; i >= 0; i--) {
      this.minHeapify(i, heapSize);
    }
  }

  minHeapify(idx: number, heapSize: number) {
    let childIdx = idx;
    const left = idx * 2 + 1;
    const right = idx * 2 + 2;
    if (
      left < heapSize &&
      this.minHeap[left].timeStamp < this.minHeap[childIdx].timeStamp
    ) {
      childIdx = left;
    }
    if (
      right < heapSize &&
      this.minHeap[right].timeStamp < this.minHeap[childIdx].timeStamp
    ) {
      childIdx = right;
    }
    if (childIdx !== idx) {
      [this.minHeap[idx], this.minHeap[childIdx]] = [
        this.minHeap[childIdx],
        this.minHeap[idx],
      ];
      this.minHeapify(childIdx, heapSize);
    }
  }

  getAndClearHeap() {
    const ret = this.minHeap;
    this.minHeap = [];
    return ret;
  }
}
```

### Part1. 页面跳转 (路由改变)

- 路由的 hash 模式: 改变 `location.hash` 的值, 会触发 hashchange 事件
- 点击浏览器的前进/后退按钮改变 URL 时, 会触发 popstate 事件
- 路由的 history 模式: 点击 `<a>` 标签, 或调用 `history.pushState(), history.replaceState()` 改变 URL 时, 不会触发 popstate 事件

> [!warning] 结论
> 对于 Vue `const router = createRouter({ history: createWebHistory(), routes })` 或 React `const router = createBrowserRouter(routes)` 的 history 模式的路由, 通过重写 `window.history.pushState`, `window.history.replaceState` 以监听路由改变

::: code-group

```js [代码实现]
let preHref = document.location.href;
function historyReplace() {
  const reportInfo = (k, v) => {
    console.log("上报路由改变");
    console.log(k, v);
  };

  const replaceAop = (sourceObj, propKey, wrapper) => {
    if (!sourceObj || !(propKey in sourceObj)) return;
    const originalFn = sourceObj[propKey];
    const wrappedFn = wrapper(originalFn);
    sourceObj[propKey] = wrappedFn;
  };

  const historyReplaceFn = (originalHistoryFn) => {
    return function (...args) {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        const from = preHref;
        const to = String(url);
        preHref = to;
        // 上报路由改变
        reportInfo("routeChange", { from, to });
      }
      return originalHistoryFn.apply(this, args);
    };
  };
  replaceAop(window.history, "pushState", historyReplaceFn);
  replaceAop(window.history, "replaceState", historyReplaceFn);
}
```

```js [使用]
historyReplace();

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    history.pushState({}, "", "/pushState");
    resolve();
  }, 3000);
});

p1.then(() => {
  setTimeout(() => {
    history.replaceState({}, "", "/replaceState");
  }, 3000);
});
```

### Part2. 用户点击事件

方法: document 对象添加 click 事件监听器, 监听用户点击事件并上报

```js
function addClickListener() {
  const reportInfo = (data) => {
    console.log("上报用户点击事件");
    console.log(data);
  };
  document.addEventListener("click", ({ target }) => {
    if (!target) return null;
    const tagName = target.tagName.toLowerCase();
    if (tagName === "body" || tagName === "html") {
      return null;
    }
    let classNames = target.classList.value;
    console.log(classNames);
    if (classNames !== "") classNames = ` class="${classNames}"`;
    const id = target.id ? ` id="${target.id}"` : "";
    const innerText = target.innerText;
    const dom = `<${tagName}${id}${classNames}>${innerText}</${tagName}>`;
    reportInfo({ type: "click", dom });
  });
}
```
