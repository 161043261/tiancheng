# tiny-react

## 开始

```jsx
// 定义一个 React 元素
const element = <h1 title="foo">Hello</h1>; // 第 1 行代码
// 获取一个 DOM 节点, 作为容器
const container = document.getElementById("root"); // 第 2 行代码
// 将 React 元素渲染到容器中
ReactDOM.render(element, container); // 第 3 行代码
```

替换第 1 行代码

```jsx
// 替换第 1 行代码
const element = React.createElement(
  "h1" /** type */,
  { title: "foo" } /** props */,
  "Hello" /** children */,
);

// 得到
const element = {
  type: "h1",
  // type: 创建的 DOM 节点的类型
  // 创建 HTML 元素时, 传递给 document.createElement(tagName, options?) 中的 tagName
  // type 也可以是一个函数
  props: {
    title: "foo",
    // props: props 有一个特殊属性 children
    // children: 这里 children 是一个字符串, 但通常 children 是一个元素数组
    children: "Hello",
  },
};
```

继续替换第 3 行代码

React 使用 render 方法更新 DOM

```js
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};
const container = document.getElementById("root");

// 继续替换第 3 行代码
// 使用 React 元素的 type 创建一个 DOM 节点
// Web API: document.createElement(tagName, options);
const node = document.createElement(element.type);
// 将 React 元素的所有 props 分配给该 DOM 节点
// Object.keys(element.props)
//   // 先过滤 props 中的 children 属性
//   .filter((propName) => propName !== "children")
//   .forEach((propName) => (node[propName] = element.props[propName]));
node["title"] = element.props.title;

// 对于 props 中的 children 属性, 为 node 创建子节点
// 这里的 children 是一段文本, 所以创建一个文本节点
// Web API: document.createTextNode(data);
const text = document.createTextNode("");
// 使用 document.createTextNode 而不是设置 innerText 允许后续以相同方式处理所有元素
text["nodeValue"] = elements.props.children;

// 最后, 将 textNode (这里的 text) 添加到 h1 (这里的 node)
// 并将 h1 (这里的 node) 添加到 container
node.appendChild(text);
container.appendChild(node);
```

### 对比

::: code-group

```jsx [原 JSX]
const element = <h1 title="foo">Hello</h1>;
const container = document.getElementById("root");
ReactDOM.render(element, container);
```

```js [转换后的 JS]
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
};

const container = document.getElementById("root");

const node = document.createElement(element.type);
node["title"] = element.props.title;

const text = document.createTextNode("");
text["nodeValue"] = elements.props.children;

node.appendChild(text);
container.appendChild(node);
```

:::

## step 1: 实现 createElement 函数

观察 `createElement` 的调用

::: code-group

```jsx [原 JSX]
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
```

```js [转换后的 JS]
const element = React.createElement(
  "div", // element.type
  { id: "foo" }, // element.props
  // element.children
  React.createElement(
    "a" /** type */,
    null /** props */,
    "bar" /** children */,
  ),
  React.createElement("b" /** type */),
);
```

```js [ 实现 createElement]
function createElement(type, props, ...children /** 剩余参数 */) {
  return {
    type,
    props: {
      ...props, // 扩展运算符
      children,
    },
  };
}
```

:::

children 数组可以包含数字或字符串等基本类型, 像这样:

- `<div>416</div> --> createElement("div", null, 416)`
- `<div>foo</div> --> createElement("div", null, "foo")`

需要将所有基本类型包装在自定义元素中, 指定自定义类型 `type = TEXT_ELEMENT`

::: code-group

```js [优化后的 createElement]
function createElement(type, props, ...children /** 剩余参数 */) {
  return {
    type,
    props: {
      ...props, // 扩展运算符
      children: children.map((child) => typeof child === "object")
        ? child
        : createTextElement(child),
    },
  };
}

function createTextElement(text /** number, string, ... */) {
  return {
    type: "TEXT_ELEMENT", // 自定义类型
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

```js [创建 MyReact 库]
const MyReact = {
  createElement,
};

const element = MyReact.createElement(
  "div", // element.type
  { id: "foo" }, // element.props
  // element.children
  MyReact.createElement(
    "a" /** type */,
    null /** props */,
    "bar" /** children */,
  ),
  MyReact.createElement("b" /** type */),
);

const container = document.getElementById("root");
ReactDOM.render(element, container);
```

```jsx [使用 MyReact.createElement]
// 使用以下注释, 当 babel 转换 JSX 时, babel 将使用 MyReact.createElement
/** @jsx MyReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);

const container = document.getElementById("root");
ReactDOM.render(element, container);
```

## step2: 实现 render 函数
