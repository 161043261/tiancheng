# react-router

安装

```bash
pnpm install react-router
```

## 数据模式和声明模式

推荐使用数据模式

::: code-group

```tsx [数据模式 router.tsx]
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/about",
    element: <About />,
  },
]);
```

```tsx [数据模式 main.tsx]
const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<RouterProvider router={router} />);
```

```tsx [声明模式 main.tsx]
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/about" element={<About />} />
    </Routes>
  </BrowserRouter>,
);
```

`<Link>`, `<NavLink>` 类似 Vue 的 `<RouterLink>`

:::

## 路由模式

1. `createBrowserRouter`: 使用 H5 的 history API (pushState, replaceState, popState), URL 中没有 #
2. `createHashRouter`: 使用 URL # 后的 hash 值, 适用于静态页面
3. `createMemoryRouter` 使用内存中的路由表, 路由跳转时 (地址栏的) URL 不改变, 适用于非浏览器环境, 例如 react-native, electron, 单元测试组件 (例如 jest, vitest)
4. `createStaticRouter` 服务器端匹配请求路径, 生成静态 HTML, 需要与客户端路由器 (例如 createBrowserRouter) 配合使用, 适用于服务器端渲染, 例如 Nest.js, 需要 SEO 优化的页面

### 解决刷新后 404 问题

页面刷新后状态丢失, 浏览器将前端路由视为后端接口, 解决方法: nginx 配置 fallback 路由

```txt
// nginx.conf
//! nginx -s reload c 重新加载配置文件
//! nginx -t 检查配置文件是否有语法错误
http {
  server {
    listen 80;
    server_name localhost;
    location / {
      root html
      index index.html
      try_files $uri $uri/ /index.html; // [!code ++]
      // try_files $uri $uri.html $uri/ =404;
    }
  }
}
```

## 路由导航

安装 antd, antd-icons

```sh
pnpm install antd
pnpm install @ant-design/icons

tree /path/to/layout

# layout
# ├── Content
# │   └── index.tsx
# ├── Header
# │   └── index.tsx
# ├── Menu
# │   └── index.tsx
# └── index.tsx
```

::: code-group

```tsx [Content/index.tsx]
import { TwitterOutlined } from "@ant-design/icons";
import { Menu as AntdMenu, MenuProps } from "antd";
import { useNavigate } from "react-router";
export default function Menu() {
  const navigate = useNavigate();
  const handleClick: MenuProps["onClick"] = (info) => {
    const toPath = info.key;
    navigate(toPath); // 编程式导航
  };
  const menuItems = [
    {
      key: "/home",
      label: "Home",
      icon: <TwitterOutlined />,
    },
    {
      key: "/about",
      label: "About",
      icon: <TwitterOutlined />,
    },
  ];
  return (
    <AntdMenu
      onClick={handleClick}
      style={{ height: "100vh" }}
      items={menuItems}
    ></AntdMenu>
  );
}
```

```tsx [Header/index.tsx, Content/index.tsx]
// Header/index.tsx
import { Breadcrumb } from "antd";

export default function Header() {
  return (
    <Breadcrumb
      items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
    />
  );
}

// Content/index.tsx
export default function Content() {
  return <div>Content</div>;
}
```

```tsx [index.tsx]
import { Layout as AntdLayout } from "antd";
import Menu from "./Menu";
import Header from "./Header";
import Content from "./Content";

export default function Layout() {
  return (
    <AntdLayout>
      <AntdLayout.Sider>
        <Menu />
      </AntdLayout.Sider>
      <AntdLayout>
        <Header />
        <Content />
      </AntdLayout>
    </AntdLayout>
  );
}
```

:::

### 嵌套路由

```tsx
export const router = createBrowserRouter([
  {
    path: "/demo",
    element: <Demo />, // 等价于 Component: Demo
    children: [
      {
        // 索引路由
        index: true, // 默认二级路由, 等价于设置 path: ''
        element: <About />, // 等价于 Component: About
      },
      {
        path: "about", // 等价于 path: "/demo/about"
        Component: About, // 等价于 element: <About />
      },
      {
        path: "/demo/home", // 等价于 path: "home"
        Component: Home, // 等价于 element: <Home />
      },
    ],
  },
]);
```

子路由组件默认不显示 (即使路由已匹配成功), 需要父组件使用 `<Outlet>` 组件以显示子路由组件, 类似 Vue 的 `<RouterView>` 作为路由组件的容器

### 布局路由

布局路由是特殊的嵌套路由, 可以省略父路由的 path

```tsx
export router = createBrowserRouter({
  Component: Layout,
  // 省略父路由的 path
  children:[
    {
      path: 'home', // /home
      Component: Home,
    },
    {
      path: 'about', // /about
      Component: About,
    }
  ]
})
```

### 动态路由

```tsx
// router/index.ts
export router = createBrowserRouter([
  {
    path: '/article/:name/:age',
    Component: Article,
  },
])

// pages/Article.tsx
import { useParams, useSearchParams } from 'react-router'

export function Article() {
  const [urlSearchParams /** , setURLSearchParams */] = useSearchParams()
  const params = useParams()
  const { name, age } = params
  return (
    <>
      <div>Article</div>
      useSearchParams
      <ul>
        <li>name: {urlSearchParams.get('name') ?? 'defaultName'}</li>
        <li>age: {urlSearchParams.get('age') ?? 'defaultAge'}</li>
      </ul>
      useParams
      <ul>
        <li>name: {name ?? 'defaultName'}</li>
        <li>age: {age ?? 'defaultAge'}</li>
      </ul>
    </>
  )
}
```

### 其他

- 索引路由: 即 `index: true`
- 前缀路由: 可以省略父路由的 Component

### 404 路由

```tsx
export const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFound />,
  },
]);
```

## 路由传参

### URL 查询参数 (hook: useSearchParams)

::: code-group

```tsx [@/pages/Home.tsx]
import { NavLink, useNavigate } from "react-router";

export function Home() {
  const navigate = useNavigate();
  return (
    <div>
      {/* useNavigate */}
      <button
        onClick={() => navigate("/demo/about?company=米哈游&project=原神")}
      >
        About
      </button>
      {/* NavLink */}
      <NavLink to="/demo/about?company=米哈游&project=原神">About2</NavLink>
    </div>
  );
}
```

```tsx [@/pages/About.tsx]
import { useSearchParams, useLocation } from "react-router";

export function About() {
  const [searchParams, setSearchParams] = useSearchParams();
  const company = searchParams.get("company");
  const project = searchParams.get("project");
  console.log(company, project);

  const location = useLocation();
  // 如果 searchParams 中有中文, 则需要对 location.search 手动解码
  console.log(location.search);

  return (
    <div>
      <button
        onClick={() =>
          setSearchParams((params) => {
            params.set("company", "hoyoverse");
            params.set("project", "genshin");
            return params;
          })
        }
      >
        setSearchParams
      </button>
    </div>
  );
}
```

:::

### URL 路径参数 (hook: useParams)

::: code-group

```tsx [@/router/index.ts]
//! http://localhost:5173/article/EvanYou/Vue3
export const router = createBrowserRouter([
  {
    path: "/article/:name/:age",
    element: <Article />,
  },
]);
```

```tsx [@/pages/Article.tsx]
import { useParams, useSearchParams } from "react-router";

export function Article() {
  const params = useParams();
  return (
    <>
      <div>Article</div>
      useParams
      <ul>
        <li>name: {params.name}</li>
        <li>age: {params.age}</li>
      </ul>
    </>
  );
}
```

:::

### state 传递状态

- 参数在 URL 中不显示
- 支持传递复杂数据类型的数据
- 使用 state 传递参数时, 当前页面不方便分享

::: code-group

```tsx [@/pages/Home.tsx]
import { NavLink, useNavigate } from "react-router";

export function Home() {
  const navigate = useNavigate();
  return (
    <div>
      {/* useNavigate */}
      <button
        onClick={() =>
          navigate("/demo/about", {
            state: { project: "崩坏星穹铁道", version: 3.2 },
          })
        }
      >
        About
      </button>
      {/* NavLink */}
      <NavLink
        to="/demo/about"
        state={{ project: "崩坏星穹铁道", version: 3.2 }}
      >
        About2
      </NavLink>
    </div>
  );
}
```

```tsx [@/pages/About.tsx]
import { useLocation } from "react-router";

export function About() {
  const location = useLocation();
  console.log(location.state);
  return <div>About</div>;
}
```

:::

## 懒加载

懒加载: 延迟加载组件, 代码分包, 提高页面性能

- useNavigate: `const navigate = useNavigate; navigate("/home");`
- useNavigation: 获取当前页面的导航状态 `const navigation = useNavigation()`
  - navigation.state: idle 空闲; loading 加载; submitting 提交
  - 路由导航时: idle -> loading -> idle

::: code-group

```tsx [@/router/index.tsx]
import { createBrowserRouter } from "react-router";
import { Demo } from "../layout/Demo";
import About from "../pages/About";

export const router = createBrowserRouter([
  {
    path: "/demo",
    element: <Demo />,
    children: [
      {
        path: "about", // 等价于 path: "/demo/about"
        // 延迟加载组件, 代码分包, 提高页面性能
        lazy: async () => {
          const startTime = Date.now();
          await new Promise((resolve) => {
            setTimeout(() => {
              console.log(Date.now() - startTime);
              resolve(null);
            }, 10000);
          });
          const About = await import("@/pages/About.tsx");
          return {
            Component: About.default,
          };
        },
      },
    ],
  },
]);
```

```tsx [@/layout/Demo.tsx]
import { Link, Outlet, useNavigation } from "react-router";
import { Alert, Spin } from "antd";

export function Demo() {
  const navigation = useNavigation();
  console.log(navigation.state); // idle -> loading -> idle
  const isLoading = navigation.state === "loading";
  return (
    <div>
      <Link to="/demo/about">About</Link>
      {/* Outlet: 渲染父路由的匹配子路由, 如果没有匹配的子路由, 则不渲染
      类比 Vue 的 <RouterView> */}
      {isLoading ? (
        <Spin size="large" tip="loading...">
          <Alert description="loading2... " message="loading3..." type="info" />
        </Spin>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
```

:::

## 路由操作: loader, action

- GET 请求会触发 loader, 适合获取数据 (查)
- POST, DELETE, PATCH 请求会触发 action, 适合提交表单 (增删改)

### loader 适合获取数据 (查)

::: code-group

```tsx [@/router/index.tsx]
const data = [
  { name: "Microsoft", age: 1 },
  { name: "Facebook", age: 2 },
];

async function fetchData(ms: number) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(ms);
  return data;
}

export const router = createBrowserRouter([
  {
    path: "/demo",
    element: <Demo />,
    children: [
      {
        path: "/demo/loader",
        Component: Loader,
        // 使用 loader 代替 useEffect
        loader: async () => {
          const data = await fetchData(5000);
          return {
            okOrErr: "OK",
            data,
          };
        },
      },
    ],
  },
]);
```

```tsx [@/layout/Demo.tsx]
const data = [
  { name: "Microsoft", age: 1 },
  { name: "Facebook", age: 2 },
];

async function fetchData(ms: number) {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await sleep(ms);
  return data;
}

export function Demo() {
  const navigation = useNavigation();
  //! idle -> loading -> idle
  console.log(navigation.state);
  const isLoading = navigation.state === "loading";
  return (
    <div>
      <Link to="/demo/loader">Loader</Link>
      {isLoading ? (
        <Spin size="large" tip="loading...">
          <Alert description="loading2... " message="loading3..." type="info" />
        </Spin>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
```

```tsx [@/pages/LoaderAction/Loader.tsx]
import { useLoaderData } from "react-router";

export default function Loader() {
  const { data, okOrErr } = useLoaderData<{
    data: { name: string; age: string }[];
    okOrErr: string;
  }>();
  return (
    <main>
      <div>okOrErr: {okOrErr}</div>
      <div>
        {data.map((item, idx) => (
          <div key={idx}>
            name: {item.name}, age: {item.age}
          </div>
        ))}
      </div>
    </main>
  );
}
```

:::

### action 适合提交表单 (增删改)

::: code-group

```tsx [@/router/index.tsx]
export const router = createBrowserRouter([
  {
    path: "/demo",
    element: <Demo />,
    children: [
      {
        path: "/demo/action",
        Component: Action,
        //! loader
        loader: async () => {
          const data = await fetchData(1000);
          return {
            okOrErr: "OK",
            data,
          };
        },
        //! action
        action: async ({ request }) => {
          const item = await request.json();
          data.push({ name: item.name, age: Number(item.age) });
          return { okOrErr: "OK" }; // actionData
        },
      },
    ],
  },
]);
```

```tsx [@/layout/Demo.tsx]
export function Demo() {
  const navigation = useNavigation();
  //! idle -> submitting -> loading -> idle
  //! 实际 idle -> loading -> idle
  console.log(navigation.state);
  const isLoading = navigation.state === "loading";
  return (
    <div>
      <Link to="/demo/action">Action</Link>
      {isLoading ? (
        <Spin size="large" tip="loading...">
          <Alert description="loading2... " message="loading3..." type="info" />
        </Spin>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
```

```tsx [@/pages/LoaderAction/Action.tsx]
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { Button, Card, Form, Input } from "antd";

export default function Action() {
  const navigation = useNavigation();
  console.log(navigation.state);
  //! actionData
  const actionData = useActionData();
  console.log(actionData); // { okOrErr: 'OK' }
  //! loader
  const { data, okOrErr } = useLoaderData<{
    data: { name: string; age: string }[];
    okOrErr: string;
  }>();
  //! action
  const submit = useSubmit();
  const handleSubmitForm = (data: { name: string; age: string }) => {
    submit(data, {
      method: "POST",
      encType: "application/json", // 默认 encType: 'multipart/form-data'
    });
  };
  return (
    <Card>
      <Form onFinish={handleSubmitForm}>
        <Form.Item label="name" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="age" name="age">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            submit
          </Button>
        </Form.Item>
      </Form>

      <div>okOrErr: {okOrErr}</div>
      <div>
        {data.map((item, idx) => (
          <div key={idx}>
            name: {item.name}, age: {item.age}
          </div>
        ))}
      </div>
    </Card>
  );
}
```

:::

## 4 种导航方式

1. `<Link>`: `<Link>` 组件会被渲染为 `<a>` 标签, 并阻止了默认的重新加载页面的行为
2. `<NavLink>`
3. 编程式导航 `useNavigate`
4. 重定向 `redirect`

### `<Link>`

`<Link to="/about">About</Link>`

`<Link>` 属性

- to 导航的目标路径
- replace
  - 不替换当前路径, 保留历史记录, 反映在浏览器的前进/后退按钮 `history.pushState`
  - 替换当前路径, 不保留历史记录, 反映在浏览器的前进/后退按钮 `history.replaceState`
- state 传递给目标页面的状态, 参考路由传参: state 传递状态
- relative
  - `relative='route'` 必须使用绝对路径, 例如当前路径 `/home`, 目标路径 `/about`, `'/home/user'`
  - `relative='path'` 可以使用相对路径, 例如当前路径 `/home`, 目标路径 `../about`, `'./user'`
- reloadDocument 路由跳转时, 是否重新加载页面
- preventScrollReset 是否阻止滚动位置重置 (是否保留当前滚动高度)
- viewTransition 是否开启视图过渡, 自动添加页面过渡动画

### `<NavLink>`

`<NavLink>` 属性和 `<Link>` 属性相同

不同: `<NavLink>` 会经过 3 个状态的转换, `<Link>` 不会, `<NavLink>` 是 `<Link>` 的增强版

- active 激活状态, 当前路径和目标路径匹配
- pending 等待状态, 等待 loader 加载数据, 参考路由操作: loader
- transitioning 过渡状态, 使用 viewTransition 属性开启视图过渡时

```css
/* 激活状态时, react-router 自动添加类名 active */
a.active {
}
/* 等待状态时, react-router 自动添加类名 pending */
a.pending {
}
/* 过渡状态时, react-router 自动添加类名 transitioning */
a.transitioning {
}
```

也可以使用 style 属性

```jsx
<NavLink
  viewTransition
  style={({ isActive, isPending, isTransitioning }) => {
    return {
      color: (() => {
        if (isActive) return "lightpink";
        if (isPending) return "lightgreen";
        if (isTransitioning) return "lightblue";
        return "black";
      })(),
    };
  }}
  to="/about"
>
  About
</NavLink>
```

### useNavigate

```js
import { useNavigate } from "react-router";

const navigate = useNavigate();
navigate("/home");
```

useNavigate 参数

- to 导航的目标路径
- options
  - replace 是否替换当前路径 (是否不保留历史记录)
  - state 传递给目标页面的状态
  - relative 是否使用相对路径
  - preventScrollReset 是否阻止滚动位置重置 (是否保留当前滚动高度)

### redirect

例 `redirect('/login')`, 需要配合 loader 使用

```jsx
export const router = createBrowserRouter([
  {
    path: "/home",
    Component: Home,
    loader: async () => {
      const token = await getToken();
      if (!token) return redirect("/login");
      return {
        token,
      };
    },
  },
]);
```

## 边界处理

- 404 页面
- `<ErrorBoundary>`

### 404 页面

```jsx
export const router = createBrowserRouter([
  // ...
  {
    path: "*",
    Component: NotFound,
    // element: <NotFound />,
  },
]);
```

### `<ErrorBoundary>`

::: code-group

```tsx [@/router/index.tsx]
export const router = createBrowserRouter([
  {
    path: "/about",
    Component: About,
    loader: async () => {
      throw { msg: "NotFound" };
    },
    // 只有 loader 或 action 抛出错误时, 跳转到 ErrorPage 页面
    ErrorBoundary: Error,
  },
]);
```

```tsx [@/pages/Error.tsx]
import { useRouteError } from "react-router";

export default function Error() {
  const err = useRouteError();
  return <div>{err.msg}</div>;
}
```

:::
