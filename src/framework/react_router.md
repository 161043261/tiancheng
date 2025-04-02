# zustand-router

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
import { StrictMode } from "react";
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
      <Route path="about" element={<About />} />
    </Routes>
  </BrowserRouter>,
);
```

`<Link>`, `NavLink` 类似 Vue 的 `<RouterLink>`

:::

## 路由导航

### 声明式导航

```tsx
import { Link } from "react-router";

export function Login() {
  return (
    <div>
      Login
      <Link to="/article">Link to article</Link>
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
navigate('/article/whoami/23') // /article/:name/:age
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
