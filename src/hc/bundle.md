# webpack & vite

## webpack 基本概念

- chunk 模块
  - JS 模块有 esm, cjs, umd, ...
  - CSS 模块有 @import
  - webpack 模块有 esm, cjs, amd, assets, wasm
- entry 入口文件: (模块 chunk), 默认值是 `./src/index.js` 作为构建依赖图的起点
- output: 指定创建的 bundle 的输出目录, 输出文件名, 默认输出目录是 `dist`, 主要输出文件的默认值是 `./dist/index.js`
- loader: webpack 原生支持加载 JavaScript 和 JSON 文件, loader 使得 webpack 可以加载其他类型的文件, 并转换为有效的模块; `webpack.config` 中, loader 有两个属性:
  - test 属性, 匹配转换的文件 (使用正则表达式匹配转换的文件时, 不要加引号)
  - use 属性, 指定转换时, 使用哪个 loader
- plugin 插件: 用于转换某些类型的模块, 而插件可以执行其他任务, 扩展 webpack 能力, 例如注入环境变量, 资源管理, 打包优化
- mode 模式: 可以是 development, production 或 none, 设置 mode 参数以开启 webpack 在对应模式下的优化, 默认是 production

::: code-group

```js [loader]
// webpack.config.js
module.exports = {
  output: {
    filename: "my-first-webpack.bundle.js",
  },
  module: {
    // webpack 打包器遇到 require()/import 导入 .txt 文件时, 先使用 raw-loader 转换
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
};
```

```js [plugin 插件]
// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack"); // 用于访问内置插件

module.exports = {
  mode: "production",
  module: {
    rules: [{ test: /\.txt$/, use: "raw-loader" }],
  },
  // 生成一个 html 文件, 并自动注入生成的所有 bundle
  plugins: [new HtmlWebpackPlugin({ template: "./src/index.html" })],
};
```

:::

移除 `package.json` 中的 `main: index.js` 入口, 添加 `private: true` 防止意外发布代码

```json
// package.json
{
  "main": "index.js", // [!code --]
  "private": true // [!code ++]
}
```

## webpack 打包简单原理

```js
// index.js
const lodash = require("lodash");
import Vue from "vue";

// webpack 打包后
(function (modules) {
  function webpack_require() {
    /** implements... */
  }
  modules[entry](webpack_require);
})({
  "index.js": (webpack_require) => {
    const lodash = webpack_require("lodash");
    const Vue = webpack_require("vue");
  },
})``;
```

webpack 支持多种模块化 (esm, cjs, umd), 兼容性更好, vite 使用 esm 实现按需加载和 hmr 模块热更新

## vite

冷启动 webpack 开发服务器时, webpack 需要打包整个 app, 然后才能提供服务; vite 将 app 中的模块分为依赖和源码两类

- 依赖: 依赖的代码通常是不改变的纯 JavaScript, 也可能有多种模块化格式 (esm, cjs, umd), vite 使用 esbuild 预构建依赖
- 源码通常有非纯 JS 文件: .css, .scss, .ts, .tsx, .vue 等, 通常会有修改, 不是所有的源码都需要加载, 例如路由组件

vite 以原生 esm 方式提供源码 `<script type="module" src="/src/main.js"></script>`, 可以理解为浏览器接管了部分打包工作; 浏览器请求源码时, vite 拦截, 转换 (使用 esbuild 转换为 JS, 转换导入路径等), 并按需提供转换后的源码, 按需提供: 只有当前页面使用时, 才提供转换后的源码

## `pnpm create vite@latest` 做了什么

```sh
# 全局安装 create-vite@latest 脚手架, 等价于 pnpm install create-vite@latest
pnpm create vite@latest # 创建 vite 项目
pnpm create vite@latest --template vue # 创建 vue 模板项目
pnpm install vite -D # 手动创建 vite 空项目, vite 开箱即用 (out of box)
```

- 默认 esm 导入模块时, 要么使用绝对路径, 要么使用相对路径
- esm 不会搜索 node_modules: 因为是客户端, 需要避免大量的网络请求 (对应下面的 vite 依赖预构建第 2 点)
- cjs 会搜索 node_modules, 因为是服务端, 直接从磁盘读取, 不需要发送网络请求

```js
import { defineComponent } from "vue";
// 对于源码, vite 会转换导入路径
import { defineComponent } from "/node_modules/.vite/deps/vue.js?v=bb0c94a1";
```

## vite 项目结构

```sh
.
├── env.d.ts
├── index.html # vite 项目的入口文件
├── package.json
├── pnpm-lock.yaml
├── public
│   └── favicon.ico
├── src
│   ├── App.tsx/App.vue
│   └── main.ts/main.tsx
└── vite.config.ts
```

```json
{
  "scripts": {
    "dev": "vite", // 启动开发服务器, 别名 vite dev, vite serve
    "build": "vite build", // 生产模式打包
    "preview": "vite preview" // 预览生产模式打包
  }
}
```

- 开发模式使用 esbuild 打包源码, 转换导入路径: 先查找当前目录下的 node_modules, 再向上逐层查找 node_modules 直到根目录, 最后查找全局 node_modules
- 生产模式使用 rollup 打包源码和依赖, rollup 支持输入 esm, cjs, umd 等, 输出 esm, cjs, umd 等

## 依赖预构建 (Pre-bundling dependencies)

开发模式下, 首次启动 vite 时, vite 自动且透明的使用 esbuild 打包依赖, 即依赖预构建

### 依赖预构建的目的

1. 兼容 cjs 和 umd 模块: 依赖可能是 esm 模块, 也可能是 cjs 或 umd 模块, 生产模式下, vite 的 devServer 开发服务器将所有代码 (源码 + 依赖) 视为 esm 模块, vite 必须先将 cjs 或 umd 模块转换为 esm 模块
2. 性能: 某个依赖有很多个内部模块, 都使用 export 导出, 并且内部模块有相互引用, 可能导致浏览器同时发送很多个 http 请求, vite 可以将该依赖的多个内部模块预构建为 1 个 esm 模块, 这样只需要发送 1 个 HTTP 请求!
3. 方便转换导入路径, 统一从 `node_modules/.vite/deps` 目录下导入, 例 `import { defineComponent } from "/node_modules/.vite/deps/?;`
4. 依赖预构建只适用于开发模式, 并使用 esbuild 将依赖转换为 esm 模块, 生产模式使用 rollup

### 自动依赖收集

如果没有 `node_modules/.vite` 依赖预构建的缓存, vite 会扫描源码, 自动寻找引入的依赖项 (bare import), 并将这些依赖项作为预构建的入口点

### monorepo 和链接依赖

monorepo 项目中, 某个子包可能是另一个子包的依赖, vite 自动检测没有从 node_modules 中解析的依赖 (例如 `@my-app/core`), 将 `@my-app/core` 视为源码, 并分析该 `@my-app/core` 的依赖列表

### 预构建缓存

文件系统缓存: vite 会将预构建的依赖缓存到 `node_modules/.vite`, 根据以下决定是否需要重新运行依赖预构建

1. package.json 中的 dependencies 列表
2. 包管理器的锁文件: package-lock.json, pnpm-lock.yaml
3. vite.config.js 中的某些配置项
4. 使用 --force 命令行选项, 或手动删除 `node_modules/.vite` 缓存目录

### 浏览器缓存

预构建的依赖使用浏览器的强制缓存 `max-age=31536000, immutable`, 强制缓存不会再请求 devServer 开发服务器, 减少网络请求次数

```js
export default defineConfig({
  optimizeDeps: {
    exclude: [], // 指定不进行预构建的依赖项列表
    include: [], // 指定进行预构建的依赖项列表
  },
});
```

## vite 配置

### 基于策略模式的 `vite.config.js`

```js
import { defineConfig } from "vite";
import { viteBaseConfig } from "vite.base.config";
import { viteDevConfig } from "vite.dev.config";
import { viteProdConfig } from "vite.prod.config";

// 策略模式
const cmdToConfig = {
  build: () => {
    // 其他代码
    return Object.assign({}, viteBaseConfig, viteProdConfig);
  },
  serve: () => {
    // 其他代码
    return { ...viteBaseConfig, ...viteProdConfig };
  },
};

// pnpm build 时, command === 'build'
// pnpm dev 时, command=== 'serve'
export default defineConfig(({ command /** "build" | "serve" */ }) => {
  // 避免过多的 if-else
  return cmdToConfig[command]();
});
```

> [!note]
> 没有在 package.json 中设置 "type": "module" 或使用 .mjs 扩展名, 为什么 vite.config.js 仍可以使用 esm 模块语法

vite 会先检查 `vite.config.js` 的模块语法, 如果是 esm, 则会先转换为 cjs

## 环境变量

1. 开发模式 .env.development
2. 生产模式 .env.production
3. ...

vite 在 `import.meta.env` 对象上暴露环境变量, 内置环境变量有

- import.meta.env.MODE `@type {string}` 应用运行的模式
- import.meta.env.BASE_URL `@type {string}` 部署应用的基本 url
- import.meta.env.PROD `@type {boolean}` 是不是生产模式
- import.meta.env.DEV `@type {boolean}` 是不是开发模式
- import.meta.env.SSR `@type {boolean}` 是不是服务器端渲染

vite 基于 [dotenv](https://github.com/motdotla/dotenv) 从 envDir 环境目录中的以下文件加载其他的环境变量

- `.env` 所有情况下都会被加载
- `.env.local` 所有情况下都会被加载, 但会被 git 忽略
- `.env.[mode]` 只在对应模式下会被加载, 优先级更高, 例如 .env.development, .env.production
- `.env.[mode].local` 只在对应模式下会被加载, 优先级更高, 但会被 git 忽略

```ts
//! pnpm dev 时, command=serve, 默认 mode=development, 会加载 .env, .env.development
//! pnpm build 时, command=build, 默认 mode=production, 会加载 .env, .env.production
export default defineConfig(({ command, mode }) => {
  console.log("command:", command); // command: serve
  console.log("mode:", mode); // mode: development
  const envDir = process.cwd();
  const env = loadEnv(mode, envDir, "CHAHAN");
  // env: { CHAHAN_PROJECT_ID: '161043261' }
  console.log("env:", env);
});
```

也可以在启动 vite 时指定 mode `vite --mode development`

- 只有 `VITE_` 或指定前缀 (envPrefix 配置项) 的环境变量才会暴露给 vue/react 的前端环境, 普通环境变量只会暴露给 vite/node 环境
- 前端环境变量挂载在 `import.meta.env` 对象上, vite/node 环境变量挂载在 `process.env` 对象上
- `VITE_` 或指定前缀 (envPrefix 配置项) 的环境变量不应该包含任何敏感信息

### `process.env.NODE_ENV` 和 vite 模式

- NODE_ENV 和 mode 是两个不同的概念
- NODE_ENV 决定 `import.meta.env.PROD` 和 `import.meta.env.DEV` 的 true/false
- mode 决定 `import.meta.env.MODE` 的值

```sh
# process.env.NODE_ENV=production, mode=production
vite build
# process.env.NODE_ENV=production, mode=development
vite build --mode development
# process.env.NODE_ENV=development, mode=production
NODE_ENV=development vite build
# process.env.NODE_ENV=development, mode=development
NODE_ENV=development vite build --mode development

# import.meta.env.PROD=true, import.meta.env.DEV=false
NODE_ENV=production
# import.meta.env.PROD=false, import.meta.env.DEV=true
NODE_ENV=development
# import.meta.env.PROD=false, import.meta.env.DEV=true
NODE_ENV=other

# import.meta.env.MODE=production
--mode production
# import.meta.env.MODE=development
--mode development
# import.meta.env.MODE=staging
--mode staging
```

## devServer 开发服务器

```sh
mkdir dev-server && cd dev-server && pnpm init
pnpm i koa -D
```

```bash
# tree -L 2
.
└── src
    ├── App.vue
    ├── index.html
    ├── index.js
    └── main.js
```

### devServer 简单原理

::: code-group

```js [index.js (模拟 devServer)]
import Koa from "koa";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
// console.log("__filename", __filename);
const __dirname = path.dirname(__filename);
console.log("__dirname", __dirname);

const app = new Koa();

// 127.0.0.1 主机 IP 地址
// localhost 主机域名
app.use(async (ctx) => {
  if (ctx.request.url === "/") {
    const htmlContent = await fs.readFile(path.join(__dirname, "./index.html"));
    ctx.response.body = htmlContent;
    ctx.response.set("Content-Type", "text/html");
  }

  if (ctx.request.url.endsWith(".js")) {
    console.log(ctx.request.url);
    const jsContent = await fs.readFile(path.join(__dirname, ctx.request.url));
    ctx.response.body = jsContent;
    ctx.response.set("Content-Type", "text/javascript");
  }

  if (ctx.request.url.endsWith(".vue")) {
    console.log(ctx.request.url);
    const vueContent = await fs.readFile(path.join(__dirname, ctx.request.url));
    // vite 先将 vue 代码编译为 JS 代码
    ctx.response.body = vueContent;
    // vite 开发服务器会设置 http 响应头 Content-Type=text/javascript
    // 告诉浏览器, 即使是 .vue 文件, 也请使用 JS 的方式解析
    ctx.response.set("Content-Type", "text/javascript");
  }
});

app.listen(5173, () => {
  console.log("http://localhost:3000");
});
```

```html [index.html]
<!-- 浏览器请求 localhost:5173, devServer 响应 index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    I'm index.html
    <!-- 浏览器解析 index.html, index.html 中引用 ./main.js
   浏览器再请求 main.js -->
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js [main.js]
// 浏览器解析 main.js, main.js 中导入 ./App.vue
// 浏览器再请求 App.vue
import "./App.vue";

console.log("I'm main.js");
```

```js [App.vue]
// 这是编译前的 .vue 文件
// <script lang="js">
//   console.log("I'm App.vue, my content is compiled pure JS");
// </script>

// 这是编译后的 .vue 文件
// 即使后缀名还是 .vue, 内容已经是纯 JS 了!
// vite 开发服务器会设置 http 响应头 Content-Type=text/javascript
// 告诉浏览器, 即使是 .vue 文件, 也请使用 JS 的方式解析
console.log("I'm App.vue, my content is compiled pure JS");
```

:::

## CSS 支持

1. vite 使用 AST 解析 App.vue, 发现 App.vue 中导入了 CSS 文件 (例如 `import './app.css`)
2. vite 使用 node:fs 模块读取 ./app.css 文件内容
3. vite 创建一个 style 标签, 将 ./app.css 文件内容复制到 style 标签中
4. vite 将创建的 style 标签插入到 index.html 的 head 标签中 (如果是 .module.css, 则插入前会修改选择器名, 以避免样式冲突)
5. vite 将 ./app.css 文件内容替换为纯 JS, 即使后缀名还是 .css, 内容已经是纯 JS 了! vite 开发服务器会设置 http 响应头 Content-Type=text/javascript, 告诉浏览器, 即使是 .css 文件, 也请使用 JS 的方式解析; 目的是方便模块热更新 (hmr, hot module replacement) 和 CSS 模块化 (.module.css)

### CSS 模块化

- 对于 \*.css, 插入到 head 标签前, 不修改选择器名, 如果一个 .vue/.jsx 文件导入了多个 .css 文件, 且多个 .css 文件中存在同名的选择器, 则会发生样式冲突!
- 对于 \*.module.css, 插入到 head 标签前, 会修改选择器名: 添加前缀 \_, 添加后缀随机 hash 值 (也可以自定义 CSS 模块化规则, 参考本站 React 基础: CSS 模块化), 避免了样式冲突

::: code-group

```scss [原 scss]
/** scrollbar.scss */
.container::-webkit-scrollbar {
  display: none;
}
/** transition.module.scss */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

```css [插入到 head 标签后]
/** 如果一个 .vue/.jsx 文件导入了多个 .css 文件, 且多个 .css 文件中存在同名的选择器, 则会发生样式冲突! */
.container::-webkit-scrollbar {
  display: none;
}

/** 修改类名: 添加前缀 _, 添加后缀随机 hash 值, 避免了样式冲突 */
._fade-enter-active_12xur_1,
._fade-leave-active_12xur_2 {
  transition: opacity 1s ease;
}

._fade-enter-from_12xur_6,
._fade-leave-to_12xur_7 {
  opacity: 0;
}
```

:::

### vite 集成了 postcss

- postcss: CSS 世界中的 babel, CSS 语法降级; 浏览器私有前缀补全 (例如 -webkit-)
- 例子: `global.scss` ---sass 预处理器--> `global.pre.css` ---postcss 后处理器--> `global.post.css`

```sh
pnpm install postcss postcss-cli postcss-preset-env -D
npx postcss ./src/app.css -o ./dist/app.post.css
# 或
pnpm exec postcss ./src/app.css -o ./dist/app.post.css
```

关于 npx, pnpm exec

- npx 先在当前目录下的 node_modules/.bin 中查找目标命令, 类似 `npm run`, 但不需要在 package.json 的 scripts 中定义
- 如果当前目录下未找到, 则在全局目录下查找; 如果全局目录下也未找到, 则从 npm 仓库下载包到临时目录
