# react-router

## 数据模式, 声明模式

- 推荐使用数据模式
- `<Link />`, `<NavLink />` 类似 Vue 的 `<RouterLink />`

::: code-group

```tsx [数据模式 @/router/index.tsx]
import Home from "@/pages/Home";
import About from "@/pages/About";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home, // Component
  },
  {
    path: "/about",
    element: <About />, // element
  },
]);
```

```tsx [数据模式 @/main.tsx]
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "@/router/index.tsx";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(<RouterProvider router={router} />);
```

```tsx [声明模式 @/main.tsx]
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "@/pages/Home";
import About from "@/pages/About";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      {/* Component */}
      <Route path="/" Component={Home} />
      {/* element */}
      <Route path="/about" element={<About />} />
    </Routes>
  </BrowserRouter>,
);
```

```tsx [@/pages/Home.tsx]
import { Link } from "react-router";

export default function Home() {
  return (
    <>
      Home
      <Link to="/about">about</Link>
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { NavLink } from "react-router";

export default function About() {
  return (
    <>
      About
      <NavLink to="/">home</NavLink>
    </>
  );
}
```

:::

## 路由模式

1. `createBrowserRouter`: 使用 html5 的 history API (pushState, replaceState, popState), url 中没有 #, 需要服务器配置 fallback 路由, 以解决用户直接访问或刷新非 / 根路径的页面时, 返回 404 Not Found 问题
2. `createHashRouter`: 使用 url 的 hash 值, 改变 url 中的 hash 值不会导致页面的重新加载, 通常用于单页面内的导航, 不需要服务器配置, 不利于 SEO
3. `createMemoryRouter`: 适用于 node 环境和 SSR, url 不会改变
4. `createStaticRouter`: 适用于 SSR

### nginx 配置 fallback 路由

解决用户直接访问或刷新非 / 根路径的页面时, 返回 404 Not Found 问题

```bash
# 检查配置文件是否有语法错误
nginx -t
# 重新加载配置文件
nginx -s reload c
```

```txt
// nginx.conf
http {
  server {
    listen 80;
    server_name localhost;
    location / {
      root html
      index index.html
      // try_files $uri $uri.html $uri/ =404; // [!code --]
      try_files $uri $uri.html $uri/ /index.html; // [!code ++]
    }
  }
}
```

## useNavigate 编程式导航

::: code-group

```tsx [@/router/index.tsx]
import App from "@/App";
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
  {
    path: "/home",
    Component: lazy(() => import("@/pages/Home")),
  },
  {
    path: "/about",
    Component: lazy(() => import("@/pages/About")),
  },
]);
```

```tsx [@/App.tsx]
import { useNavigate } from "react-router";

export default function App() {
  const navigate = useNavigate();

  return (
    <>
      App
      <button onClick={() => navigate("/home")}>home</button>
      <button onClick={() => navigate("/about")}>about</button>
    </>
  );
}
```

:::

### 嵌套路由、索引路由、布局路由、前缀路由

- 嵌套路由: 有 children 属性, 父组件默认不挂载子路由组件, 需要父组件使用 `<Outlet />` 组件, 作为子路由组件的容器, 以挂载子路由组件
- 索引路由: `index: true`, 即默认二级路由
- 布局路由: 没有 path 属性, 只提供统一的页面布局
- 前缀路由: 没有 Component 或 element 属性, 只提供统一的路由前缀

::: code-group

```tsx [嵌套路由、索引路由]
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/layout",
    element: <Layout />,
    // 嵌套路由: 有 children 属性
    children: [
      {
        // 索引路由: index: true, 即默认二级路由
        index: true,
        Component: Home,
      },
      {
        path: "home", // 等价于 path: "/layout/home"
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/layout/about", // 等价于 path: "about"
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [布局路由]
import Layout from "@/pages/Layout";
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    // 布局路由: 没有 path 属性, 只提供统一的页面布局
    element: <Layout />,
    children: [
      {
        path: "/home",
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/about",
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [前缀路由]
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    // 前缀路由: 没有 Component 或 element 属性, 只提供统一的路由前缀
    path: "/layout",
    children: [
      {
        path: "home", // 等价于 path: "/layout/home"
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/layout/about", // 等价于 path: "about"
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [@/pages/Layout.tsx]
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <header>header</header>
      {/* 默认不挂载子路由组件 */}
      {/* 需要父组件使用 <Outlet /> 组件, 作为子路由组件的容器, 以挂载子路由组件 */}
      <Outlet />
      <footer>footer</footer>
    </>
  );
}
```

:::

### fallback 路由

```tsx
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  // ...
  {
    path: "*",
    element: <>Not Found</>,
  },
]);
```

## 路由传参

### hook: useSearchParams (url 查询参数)

::: code-group

```tsx [@/router/index.tsx]
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    Component: lazy(() => import("@/pages/Layout")),
    children: [
      {
        path: "/home",
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/about",
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [@/pages/Home.tsx]
import { NavLink, useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      Home
      {/* useNavigate */}
      <button onClick={() => navigate("/about?id=1&project=原神")}>原神</button>
      {/* <NavLink /> */}
      <NavLink to="/about?id=2&project=星穹铁道">星穹铁道</NavLink>
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { useSearchParams, useLocation } from "react-router";

export default function About() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const project = searchParams.get("project");
  console.log(id, project);

  const location = useLocation();
  console.log(location.search);
  // 如果 url 查询参数中有中文, 则需要手动解码
  console.log(decodeURIComponent(location.search));

  const handleClick = () =>
    setSearchParams((params) => {
      params.set("id", "1");
      params.set("project", "Genshin Impact");
      return params;
    });

  return (
    <>
      About
      <button onClick={handleClick}>setSearchParams</button>
    </>
  );
}
```

:::

### hook: useParams (url 路径参数)

::: code-group

```tsx [@/router/index.tsx]
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    Component: lazy(() => import("@/pages/Layout")),
    children: [
      {
        path: "/home",
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/about/:id/:project",
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [@/pages/About.tsx]
// http://localhost:5173/about/1/原神
import { useParams } from "react-router";

export default function About() {
  const params = useParams() as { id: string; project: string };
  return (
    <>
      About
      <div>id: {params.id}</div>
      <div>project: {params.project}</div>
    </>
  );
}
```

:::

### state 传递参数

- 使用 state 传递的参数, url 中不显示
- 使用 state 传递参数时, 不方便通过 url 分享

::: code-group

```tsx [@/router/index.tsx]
import { lazy } from "react";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    Component: lazy(() => import("@/pages/Layout")),
    children: [
      {
        path: "/home",
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/about",
        Component: lazy(() => import("@/pages/About")),
      },
    ],
  },
]);
```

```tsx [@/pages/Home.tsx]
import { NavLink, useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  const handleClick = () =>
    navigate("/about", { state: { id: 1, project: "原神" } });

  return (
    <>
      {/* useNavigate */}
      <button onClick={handleClick}>原神</button>
      {/* <NavLink /> */}
      <NavLink to="/about" state={{ id: 2, project: "星穹铁道" }}>
        星穹铁道
      </NavLink>
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { useLocation } from "react-router";

export default function About() {
  const location = useLocation();
  const state = location.state as { id: number; project: string };

  return (
    <>
      About
      <div>id: {state.id}</div>
      <div>project: {state.project}</div>
    </>
  );
}
```

:::

## 懒加载

懒加载: 延迟加载路由组件、代码分包

- useNavigate: 获取路由器对象
- useLocation: 获取路由对象
- useNavigation: 获取导航状态
  - `navigation.state`: idle 空闲、loading 加载、submitting 提交
  - 路由导航时, 导航状态 idle -> loading -> idle

::: code-group

```tsx [@/router/index.tsx]
import App from "@/App";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

const Home = lazy(() =>
  new Promise((resolve) => {
    setTimeout(resolve, 5000);
  }).then(() => import("@/pages/Home")),
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/home",
        // react 提供的懒加载: 延迟加载路由组件、代码分包
        // 需要配合 <Suspense /> 异步组件使用
        // 路由导航时, 导航状态始终是 idle
        element: (
          <Suspense fallback="请等待 Home 加载...">
            <Home />
          </Suspense>
        ),
      },
      {
        path: "/about",
        // react-router 提供的懒加载: 延迟加载路由组件、代码分包
        // 路由导航时, 导航状态 idle -> loading -> idle
        lazy: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
          const About = await import("@/pages/About");
          return {
            Component: About.default,
          };
        },
      },
    ],
  },
]);
```

```tsx [@/App.tsx]
import { Outlet, useNavigate, useNavigation } from "react-router";

export default function App() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  // 路由导航时, 导航状态 idle -> loading -> idle
  console.log("[App] navigation.state:", navigation.state);

  return (
    <>
      App
      <button onClick={() => navigate("/home")}>home</button>
      <button onClick={() => navigate("/about")}>about</button>
      {navigation.state === "loading" ? (
        <div>请等待子路由组件加载...</div>
      ) : (
        <Outlet />
      )}
    </>
  );
}
```

```tsx [@/pages/Home.tsx]
import { NavLink } from "react-router";

export default function Home() {
  return (
    <>
      Home
      <NavLink to="/">app</NavLink>
      <NavLink to="/about">about</NavLink>
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { NavLink } from "react-router";

export default function About() {
  return (
    <>
      About
      <NavLink to="/">app</NavLink>
      <NavLink to="/home">home</NavLink>
    </>
  );
}
```

:::

## 路由操作: loader, action

- loader 用于查询, GET 请求会触发 loader
- loader 路由导航时, 导航状态 idle -> loading -> idle
- action 用于增删改, POST、DELETE、PATCH 请求会触发 action
- action 路由导航时, 导航状态 idle -> submitting -> loading -> idle

### ErrorBoundary

loader 或 action 抛出错误时, fallback 到 ErrorBoundary

::: code-group

```ts [vite.config.ts]
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const vitePluginServer = (): Plugin => {
  return {
    name: "vite-plugin-server",
    configureServer(server) {
      const data = [
        { name: "foo", age: 22 },
        { name: "bar", age: 23 },
      ];

      server.middlewares.use("/queryUsers", async (req, res) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });
        res.setHeader("Content-Type", "application/json");
        const resData = { data };
        res.end(JSON.stringify(resData));
      });

      server.middlewares.use("/addUser", async (req, res) => {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          data.push(JSON.parse(body));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ code: 0, echo: body }));
        });
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginServer()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

```tsx [@/router/index.tsx]
import App from "@/App";
import About from "@/pages/About";
import Fallback from "@/pages/Fallback";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/about",
        Component: About,

        // loader 用于查询
        loader: async () => {
          const { data } = await fetch("/queryUsers").then((res) => res.json());
          return { code: 200, data };
        },

        // action 用于增删改
        action: async ({ request }) => {
          const item = await request.json();
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });

          return await fetch("/addUser", {
            method: "POST",
            body: JSON.stringify(item),
          }).then((res) => res.json());
        },

        // loader 或 action 抛出错误时, fallback 到 ErrorBoundary
        ErrorBoundary: Fallback,
      },
    ],
  },
]);
```

```tsx [@/App.tsx]
import { Outlet, useNavigate, useNavigation } from "react-router";

export default function App() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  // loader 路由导航时, 导航状态 idle -> loading -> idle
  // action 路由导航时, 导航状态 idle -> submitting -> loading -> idle
  console.log("[App] navigation.state:", navigation.state);

  return (
    <>
      App
      <button onClick={() => navigate("/about")}>about</button>
      {
        (() => {
          switch (navigation.state) {
            case "idle":
              return <Outlet />;
            case "loading":
              return <div>请等待子路由组件加载...</div>;
            case "submitting":
              return <div>请等待子路由组件提交...</div>;
          }
        })() /** IIFE */
      }
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { useState } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router";

export default function About() {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);

  // loader
  const { code, data } = useLoaderData<{
    code: 0 | 1;
    data: { name: string; age: number }[];
  }>();

  // actionData
  const actionData = useActionData();
  console.log(actionData);

  // action
  const submit = useSubmit();
  const handleClick = (data: { name: string; age: number }) => {
    submit(data, { method: "POST", encType: "application/json" });
  };

  return (
    <>
      About
      <input
        placeholder="name"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />
      <input
        placeholder="age"
        value={age}
        onChange={(ev) => setAge(Number.parseInt(ev.target.value))}
        type="number"
      />
      {/* action */}
      <button onClick={() => handleClick({ name, age })}>submit</button>
      {/* loader */}
      <div>code: {code}</div>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>
            name: {item.name}, age: {item.age}
          </li>
        ))}
      </ul>
    </>
  );
}
```

```tsx [@/pages/Fallback.tsx]
import { useRouteError } from "react-router";

export default function Fallback() {
  const routeErr = useRouteError();
  return <div>routeErr: {JSON.stringify(routeErr)}</div>;
}
```

:::

## 4 种导航方式

1. `<Link />`: `<Link />` 组件会被渲染为 `<a>` 标签, 并且阻止了 `<a>` 标签点击事件的默认行为, 不会重新加载页面
2. `<NavLink />`: `<NavLink />` 属性和 `<Link />` 属性相同
3. 编程式导航 `useNavigate`
4. 重定向 `redirect`

### `<Link />`

- to 导航的目的路径
- replace
  - `replace={false}` 默认, 不替换当前路径, 保留历史记录, 反映在浏览器的前进/后退按钮 (history.pushState)
  - `replace={true}` 替换当前路径, 不保留历史记录, 反映在浏览器的前进/后退按钮 (history.replaceState)
- state 参考路由传参, state 传递参数
- relative
  - 例如 3 条路径 /layout, /layout/home, /layout/about
  - `relative="route"` 默认, 必须使用绝对路径
    - 例如当前路径 `/layout/home`
    - 目的路径 `/layout`, `/layout/about`
  - `relative="path"` 可以使用相对路径
    - 例如当前路径 `/layout/home`
    - 目标路径 `../`, `../about`
- reloadDocument 页面跳转时, 是否重新加载页面
- preventScrollReset 是否阻止滚动位置重置
- viewTransition 页面跳转时, 是否开启 opacity 过渡

### `<NavLink />`

`<NavLink />` 属性和 `<Link />` 属性相同

不同: 路由导航时, `<NavLink />` 会经过 3 个状态的转换, `<Link />` 不会

- active 激活状态, 当前路径和目的路径匹配
- pending 等待状态, 等待 loader 加载数据, 参考路由操作: loader
- transitioning 过渡状态, 需要使用 viewTransition 属性开启 opacity 过渡

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
  to="/about"
  viewTransition
  style={({ isActive, isPending, isTransitioning }) => {
    return {
      color: (() => {
        if (isActive) {
          return "#ff0000";
        }
        if (isPending) {
          return "#00ff00";
        }
        if (isTransitioning) {
          return "#0000ff";
        }
        return "#000";
      })(), // IIFE
    };
  }}
>
  about
</NavLink>
```

### useNavigate

```ts
import { useNavigate } from "react-router";

const navigate = useNavigate();

navigate(
  "/home",
  {
    replace: false, // 默认, 不替换当前路径, 保留历史记录
    state: { love: "you" }, // 参考路由传参, state 传递参数
    relative: "route", // 默认, 必须使用绝对路径
    preventScrollReset: false, // 不阻止滚动位置重置
    viewTransition: true, // 页面跳转时, 开启 opacity 过渡
  } /** options */,
);
```

### redirect

需要配合 loader 使用

::: code-group

```tsx [@/router/index.tsx]
import App from "@/App";
import { lazy } from "react";
import { createBrowserRouter, redirect } from "react-router";

const getToken = () => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(Math.random() * 10 > 5 ? "I love you" : null),
      3000,
    );
  });
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/home",
        Component: lazy(() => import("@/pages/Home")),
      },
      {
        path: "/about",
        Component: lazy(() => import("@/pages/About")),
        loader: async () => {
          const token = await getToken();
          if (!token) {
            return redirect("/home");
          }
          return { token };
        },
      },
    ],
  },
]);
```

```tsx [@/App.tsx]
import { Outlet, useNavigate } from "react-router";

export default function App() {
  const navigate = useNavigate();

  return (
    <>
      App
      <button onClick={() => navigate("/home")}>home</button>
      <button onClick={() => navigate("/about")}>about</button>
      <Outlet />
    </>
  );
}
```

```tsx [@/pages/Home.tsx]
import { NavLink } from "react-router";

export default function Home() {
  return (
    <>
      Home
      <NavLink to="/">app</NavLink>
      <NavLink to="/about">about</NavLink>
    </>
  );
}
```

```tsx [@/pages/About.tsx]
import { NavLink, useLoaderData } from "react-router";

export default function About() {
  const { token } = useLoaderData<{ token: string }>();
  return (
    <>
      About
      <div>token: {token}</div>
      <NavLink to="/">app</NavLink>
      <NavLink to="/home">home</NavLink>
    </>
  );
}
```

:::
