# Build my own React

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
// const element = React.createElement(type, props, ...children)
// 类似于
//! const element = Object.assign({ type }, { props: Object.assign(props, { children }) });

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
const node = document.createElement(element.type);
// 将 React 元素的所有 props 分配给该 DOM 节点
// Object.keys(element.props)
//   .filter((propName) => propName !== "children") // 过滤 children 属性
//   .forEach((propName) => (node[propName] = element.props[propName]));

node["title"] = element.props.title;
```
