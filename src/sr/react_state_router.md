# react state&router

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
        path: "/demo/board", // 等价于 path: "board"
        Component: Board, // 等价于 element: <Board />
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

================================================================================

### 声明式导航

```tsx
import { Link, NavLink } from "react-router";

export function Login() {
  return (
    <div>
      Login
      <Link to="/article">Link to article</Link>
      <NavLink to="/article">Link to article</NavLink>
    </div>
  );
}
```

### 编程式导航 (hook: useNavigate)

```tsx
export function Login() {
  const navigate = useNavigate();
  return (
    <div>
      Login
      <button onClick={() => navigate("/article")}>Navigate to article</button>
    </div>
  );
}
```

## 路由导航传参

### SearchParams 传参 (hook: useSearchParams)

URL 查询参数

```tsx
// src/page/Login.tsx
navigate("/article?name=whoami&age=23");
// src/page/Article.tsx
const [params, setParams] = useSearchParams();
const name = params.get("name");
const age = params.get("age");
```

### Params 传参 (hook: useParams)

URL 路径参数

```tsx
// src/page/Login.tsx
navigate("/article/whoami/23"); // /article/:name/:age
// src/page/Article.tsx
const params = useParams(); // params 只读
console.log(params.name, params.age);
```

## 嵌套路由, 默认二级路由

::: code-group

```tsx [@/router/index.tsx]
export const router = createBrowserRouter([
  {
    path: "/layout",
    element: <Layout />,
    children: [
      {
        index: true, // 默认二级路由 (默认渲染的二级路由组件)
        // 等价于设置 path: '',
        element: <About />,
      },
      {
        path: "about", // /layout/about
        element: <About />,
      },
      {
        path: "/layout/board", // board
        element: <Board />,
      },
    ],
  },
]);
```

```tsx [@/page/Layout.tsx]
export function Layout() {
  return (
    <div>
      Layout 一级路由
      {/* 等价于 to="about" */}
      <Link to="/layout/about">About</Link>
      {/* 等价于 to="/layout/board" */}
      <Link to="board">Board</Link>
      {/* Outlet: 渲染父路由的匹配子路由, 如果没有匹配的子路由, 则不渲染
      类比 Vue 的 <RouterView> */}
      <Outlet />
    </div>
  );
}
```

:::

## 404 路由配置

```tsx
export const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFound />,
  },
]);
```

## 路由模式

- history 模式: `createBrowserRouter()`
- hash 模式 `createHashRouter()`

| 路由模式 | URL      | 原理                          | 方法                    |
| -------- | -------- | ----------------------------- | ----------------------- |
| history  | /login   | history 对象的 pushState 方法 | `createBrowserRouter()` |
| hash     | /#/login | 监听 hashchange 事件          | `createHashRouter()`    |

```bash
pnpm install zustand -D
```

## zustand 创建并使用 store

::: code-group

```ts [@/store/cnt_list.ts]
interface Store {
  cnt: number;
  addCnt: () => void;
  resetCnt: () => void;
}

export const useCntAndListStore = create<Store>((set) => {
  return {
    cnt: 0,

    addCnt: () => {
      set((state: Store) => ({ cnt: state.cnt + 1 }));
    },

    resetCnt: () => {
      set({ cnt: 0 });
    },
  };
});
```

```tsx [@/App.tsx]
function App() {
  const { cnt, addCnt, resetCnt } = useCntAndListStore();
  return (
    <>
      <div>
        <div>cnt: {cnt}</div>
        <button type="button" onClick={addCnt} className="rounded border-1">
          addCnt
        </button>
        <button type="button" onClick={resetCnt} className="rounded border-1">
          resetCnt
        </button>
      </div>
    </>
  );
}
```

:::

## 异步 zustand

::: code-group

```ts [@/store/cnt_list.ts]
interface Store {
  nameList: { id: number; cnName: string }[];
  fetchList: () => Promise<void>;
}

export const useCntAndListStore = create<Store>((set) => {
  return {
    nameList: [],

    fetchList: async () => {
      const res = await fetch("/api/list").then((res) => res.json());
      const { code, message, data } = res;
      console.log(code, message);

      // 修改 zustand 状态必须调用 set 方法
      set({ nameList: data.list });
    },
  };
});
```

```tsx [@/App.tsx]
function App() {
  const { nameList, fetchList } = useCntAndListStore();
  // fetchList()
  useEffect(() => {
    fetchList(); // effect: React.EffectCallback
    fetchList2(); // effect: React.EffectCallback
  }, [fetchList, fetchList2]); // deps?: React.DependencyList

  return (
    <>
      <div>nameList.length: {nameList.length}</div>
      <ul className="flex justify-between">
        {nameList.map((item) => (
          <li key={item.id}>{item.cnName}</li>
        ))}
      </ul>
      <button type="button" onClick={fetchList}>
        fetchList
      </button>
    </>
  );
}
```

:::

## store 切片

::: code-group

```ts [@/store/cnt_slice.ts]
import { StateCreator } from "zustand";

export interface CntStore {
  cnt: number;
  addCnt: () => void;
  resetCnt: () => void;
}

export const createCntSlice: StateCreator<CntStore> = (set) => {
  return {
    cnt: 0,

    addCnt: () => {
      set((state: CntStore) => ({ cnt: state.cnt + 1 }));
    },

    resetCnt: () => {
      set({ cnt: 0 });
    },
  };
};
```

```ts [@/store/list_slice.ts]
import { StateCreator } from "zustand";

export interface ListStore {
  nameList: { id: number; cnName: string }[];
  fetchList: () => Promise<void>;
}

export const createListSlice: StateCreator<ListStore> = (set) => {
  return {
    nameList: [],

    fetchList: async () => {
      const res = await fetch("/api/list").then((res) => res.json());
      const { code, message, data } = res;
      console.log(code, message);

      // 修改 zustand 状态必须调用 set 方法
      set({ nameList: data.list });
    },
  };
};
```

```tsx [@/store/cnt_list2.ts]
import { create } from "zustand";
import { type CntStore, createCntSlice } from "./cnt_slice";
import { createListSlice, type ListStore } from "./list_slice";

export const useCntAndListStore2 = create<CntStore & ListStore>((...args) => {
  console.log(args.length);

  return {
    ...createCntSlice(...args),
    ...createListSlice(...args),
  };
});
```

```tsx [@/App.tsx]
function App() {
  // store 实例 1, 未切片
  const { cnt, addCnt, resetCnt, nameList, fetchList } = useCntAndListStore();
  // store 实例 2, 切片
  const {
    cnt: cnt2,
    addCnt: addCnt2,
    resetCnt: resetCnt2,
    nameList: nameList2,
    fetchList: fetchList2,
  } = useCntAndListStore2();

  // fetchList()
  useEffect(() => {
    fetchList(); // effect: React.EffectCallback
    fetchList2(); // effect: React.EffectCallback
  }, [fetchList, fetchList2]); // deps?: React.DependencyList

  return (
    <>
      <div>
        <div>cnt: {cnt}</div>
        <button type="button" onClick={addCnt} className="rounded border-1">
          addCnt
        </button>
        <button type="button" onClick={resetCnt} className="rounded border-1">
          resetCnt
        </button>
      </div>

      <div>nameList.length: {nameList.length}</div>
      <ul className="flex justify-between">
        {nameList.map((item) => (
          <li key={item.id}>{item.cnName}</li>
        ))}
      </ul>
      <button type="button" onClick={fetchList}>
        fetchList
      </button>

      <hr />

      <div>
        <div>cnt: {cnt2}</div>
        <button type="button" onClick={addCnt2} className="rounded border-1">
          addCnt2
        </button>
        <button type="button" onClick={resetCnt2} className="rounded border-1">
          resetCnt2
        </button>
      </div>

      <div>nameList2.length: {nameList2.length}</div>
      <ul className="flex justify-between">
        {nameList2.map((item) => (
          <li key={item.id}>{item.cnName}</li>
        ))}
      </ul>
      <button type="button" onClick={fetchList2}>
        fetchList2
      </button>
    </>
  );
}

export default App;
```

:::
