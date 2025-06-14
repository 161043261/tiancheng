# Zustand

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
