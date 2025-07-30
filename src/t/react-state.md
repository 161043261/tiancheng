# React 状态管理

## 基本使用

::: code-group

```ts [@/stores/cnt.ts]
import { create } from "zustand";

interface ICntStore {
  cnt: number;
  incCnt: () => void;
  decCnt: () => void;
  resetCnt: () => void;
  getCnt: () => number;
}

const useCntStore = create<ICntStore>((set, get) => {
  return {
    cnt: 0,
    incCnt: () => set((state) => ({ cnt: state.cnt + 1 })),
    decCnt: () => set((state) => ({ cnt: state.cnt - 1 })),
    resetCnt: () => set({ cnt: 0 }),
    getCnt: () => get().cnt,
  };
});

export default useCntStore;
```

```tsx [@/App.tsx]
import useCntStore from "@/stores/cnt";

function Left() {
  const { incCnt, decCnt, resetCnt } = useCntStore();
  return (
    <>
      <button onClick={incCnt}>+</button>
      <button onClick={decCnt}>-</button>
      <button onClick={resetCnt}>reset</button>
    </>
  );
}

function Right() {
  const incCnt = useCntStore((state) => state.incCnt);
  const decCnt = useCntStore((state) => state.decCnt);
  const resetCnt = useCntStore((state) => state.resetCnt);
  return (
    <>
      <button onClick={incCnt}>+</button>
      <button onClick={decCnt}>-</button>
      <button onClick={resetCnt}>reset</button>
    </>
  );
}

function App() {
  const cntStore = useCntStore();
  const { cnt } = cntStore;
  const getCnt = useCntStore((state) => state.getCnt);
  return (
    <>
      <Left />
      cnt: {cnt} {getCnt()}
      <Right />
    </>
  );
}

export default App;
```

:::

## 深层次状态

### immer

```ts
import { produce } from "immer";

const data = { user: { name: "whoami", age: 22 } };
const newData = produce(data, (draft) => {
  draft.user.age = 23;
});

// {user: {name: 'whoami', age: 23}}, false
console.log(newData, newData === data);
```

### zustand 使用 immer 中间件

::: code-group

```ts [不使用 immer 中间件]
import { create } from "zustand";

interface IGroup {
  cnt: {
    female: number;
    male: number;
  };
  addMale: () => void;
}

const useGroupStore = create<IGroup>((set) => ({
  cnt: {
    female: 0,
    male: 1,
  },
  addMale: () =>
    set((state) => ({
      cnt: {
        ...state.cnt,
        male: state.cnt.male + 1,
      },
    })),
}));

export default useGroupStore;
```

```ts [使用 immer 中间件]
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface IGroup {
  cnt: {
    female: number;
    male: number;
  };
  addMale: () => void;
}

const useGroupStore = create<IGroup>()(
  immer((set) => ({
    cnt: {
      female: 0,
      male: 1,
    },
    addMale: () =>
      set((state) => {
        state.cnt.male += 1;
      }),
  })),
);

export default useGroupStore;
```

:::

### immer 原理: Proxy 代理

```js
function produce(base, fn) {
  const clone = {};
  const handler = {
    get(target, prop, receiver) {
      if (prop in clone) {
        return clone[prop];
      }

      if (typeof target[prop] === "object" && target[prop] !== null) {
        return new Proxy(target[prop], handler);
      }

      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, newValue) {
      return Reflect.set(clone, prop, newValue);
    },
  };

  const baseProxy = new Proxy(base, handler);
  fn(baseProxy);

  if (Object.keys(clone).length === 0) {
    return base;
  }

  return JSON.parse(JSON.stringify(baseProxy));
}

const obj = {
  user: {
    name: "whoami",
    age: 22,
  },
};

const newObj = produce(obj, (draft) => {
  draft.user.name = "immer";
  draft.user.age = 23;
});

console.log(newObj, newObj === obj);
```

## 状态切片, useShallow

- 使用解构: setSing 时, 会导致 `<First />` 组件更新; setDance 时, 也会导致 `<First />` 组件更新
- 使用状态切片: setSing 时, 会导致 `<Second />` 组件更新; setDance 时, 不会导致 `<Second />` 组件更新
- 使用 useShallow 中间件: setSing 时, 会导致 `<Third />` 组件更新; setDance 时, 不会导致 `<Third />` 组件更新

::: code-group

```ts [@/stores/kun.ts]
import { create } from "zustand";

interface IKun {
  name: string;
  hobbies: {
    sing: string;
    dance: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>((set) => ({
  name: "kun",

  hobbies: {
    sing: "sing",
    dance: "dance",
  },

  setSing: (newSing: string) => {
    set((state) => ({
      ...state,
      hobbies: { ...state.hobbies, sing: newSing },
    }));
  },

  setDance: (newDance: string) => {
    set((state) => ({
      ...state,
      hobbies: { ...state.hobbies, dance: newDance },
    }));
  },
}));

export default useKunStore;
```

```tsx [@/App.tsx]
import useKunStore from "./stores/kun";
import { useShallow } from "zustand/react/shallow";

function Update() {
  const { setSing, setDance } = useKunStore();
  return (
    <div className="flex gap-5">
      <button onClick={() => setSing(sing + "!")}>setSing</button>
      <button onClick={() => setDance(dance + "!")}>setDance</button>
    </div>
  );
}

function First() {
  console.log("First update...");
  // 使用解构
  // setSing 时, 会导致 <First /> 组件更新
  // setDance 时, 也会导致 <First /> 组件更新
  const {
    name,
    hobbies: { sing },
  } = useKunStore();
  return (
    <div className="bg-slate-300">
      <div>First name: {name}</div>
      <div>First sing: {sing}</div>
    </div>
  );
}

function Second() {
  console.log("Second update...");
  // 使用状态切片
  // setSing 时, 会导致 <Second /> 组件更新
  // setDance 时, 不会导致 <Second /> 组件更新
  const name = useKunStore((state) => state.name);
  const sing = useKunStore((state) => state.hobbies.sing);
  return (
    <>
      <div>Second name: {name}</div>
      <div>Second sing: {sing}</div>
    </>
  );
}

function Third() {
  console.log("Third update...");
  // 使用 useShallow 中间件
  // setSing 时, 会导致 <Third /> 组件更新
  // setDance 时, 不会导致 <Third /> 组件更新
  const { name, sing } = useKunStore(
    useShallow((state) => ({
      name: state.name,
      sing: state.hobbies.sing,
    })),
  );
  return (
    <div className="bg-slate-300">
      <div>Third name: {name}</div>
      <div>Third sing: {sing}</div>
    </div>
  );
}

export default function App() {
  console.log("App update...");
  return (
    <>
      <Update />
      <First />
      <Second />
      <Third />
    </>
  );
}
```

:::

## 中间件

- immer 中间件
- devtools 调试中间件
- persist 持久化中间件

::: code-group

```ts [@/stores/kun.ts]
import { create } from "zustand";

interface IKun {
  name: string;
  hobbies: {
    sing: string;
    dance: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>((set) => ({
  name: "kun",

  hobbies: {
    sing: "sing",
    dance: "dance",
  },

  setSing: (newSing: string) => {
    set((state) => ({
      ...state,
      hobbies: { ...state.hobbies, sing: newSing },
    }));
  },

  setDance: (newDance: string) => {
    set((state) => ({
      ...state,
      hobbies: { ...state.hobbies, dance: newDance },
    }));
  },
}));

export default useKunStore;
```

```tsx [immer]
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface IKun {
  name: string;
  hobbies: {
    sing: string;
    dance: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>()(
  immer((set) => ({
    name: "kun",

    hobbies: {
      sing: "sing",
      dance: "dance",
    },

    setSing: (newSing: string) => {
      set((state) => {
        state.hobbies.sing = newSing;
      });
    },

    setDance: (newDance: string) => {
      set((state) => {
        state.hobbies.dance = newDance;
      });
    },
  })),
);

export default useKunStore;
```

```ts [immer + devtools]
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IKun {
  name: string;
  hobbies: {
    sing: string;
    dance: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>()(
  immer(
    devtools(
      (set) => ({
        name: "kun",

        hobbies: {
          sing: "sing",
          dance: "dance",
        },

        setSing: (newSing: string) => {
          set((state) => {
            state.hobbies.sing = newSing;
          });
        },

        setDance: (newDance: string) => {
          set((state) => {
            state.hobbies.dance = newDance;
          });
        },
      }),
      {
        name: "kun",
        enabled: true,
      }, // optional
    ),
  ),
);

export default useKunStore;
```

```ts [immer + persist]
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IKun {
  name: string;
  hobbies: {
    sing: string;
    dance: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>()(
  immer(
    persist(
      (set) => ({
        name: "kun",

        hobbies: {
          sing: "sing",
          dance: "dance",
        },

        setSing: (newSing: string) => {
          set((state) => {
            state.hobbies.sing = newSing;
          });
        },

        setDance: (newDance: string) => {
          set((state) => {
            state.hobbies.dance = newDance;
          });
        },
      }),
      {
        // localStorage, sessionStorage, ... 的 key
        name: "kun",
        storage: createJSONStorage(() => localStorage),
        // 持久化部分状态
        partialize: (state) => ({
          name: state.name,
          sing: state.hobbies.sing,
        }),
      },
    ),
  ),
);

export default useKunStore;
```

```tsx [@/App.tsx]
import { useShallow } from "zustand/shallow";
import useKunStore from "./stores/kun";

export default function App() {
  const { setSing, setDance } = useKunStore();

  const { name, sing, dance } = useKunStore(
    useShallow((state) => ({
      name: state.name,
      sing: state.hobbies.sing,
      dance: state.hobbies.dance,
    })),
  );

  // 清空 localStorage, sessionStorage, ...
  const clearKunStorage = () => useKunStore.persist.clearStorage();
  return (
    <>
      <div>name: {name}</div>
      <div>sing: {sing}</div>
      <div>dance: {dance}</div>
      <button onClick={() => setSing(sing + "!")}>setSing</button>
      <button onClick={() => setDance(dance + "!")}>setDance</button>
      <button onClick={() => clearKunStorage()}>清空 localStorage</button>
    </>
  );
}
```

:::

### 自定义 logger 中间件

::: code-group

```js [@/middlewares/logger.js]
export const logger = (fn) => (set, get, storeApi) => {
  const decoratedSet = (...args) => {
    console.log("[set] before", get());
    set(...args);
    console.log("[set] after", get());
  };
  return fn(decoratedSet, get, storeApi);
};
```

```js [@/stores/kun.js]
import { create } from "zustand";
import { logger } from "@/middlewares/logger";

const useKunStore = create()(
  logger((set) => ({
    name: "kun",

    hobbies: {
      sing: "sing",
      dance: "dance",
    },

    setSing: (newSing) => {
      set((state) => ({
        ...state,
        hobbies: { ...state.hobbies, sing: newSing },
      }));
    },

    setDance: (newDance) => {
      set((state) => ({
        ...state,
        hobbies: { ...state.hobbies, dance: newDance },
      }));
    },
  })),
);

export default useKunStore;
```

:::

## subscribe

### subscribe 订阅

```js
useStore.subscribe((state) => console.log(state) /** listener */);
```

subscribe 订阅: state 的任意属性改变时, 都会触发 listener 的调用

- 组件外部订阅
- 组件内部订阅: 需要写在 useEffect 中, 并且依赖项数组 deps 是 [] 空数组, 只会在组件挂载后订阅一次, 防止重复订阅

案例

- 未使用 subscribe 订阅, 每次 age 改变时, 都会触发组件更新
- 使用 subscribe 订阅, age 改变时, 不会触发组件更新; 只有 isYoung 状态改变时 ,才会触发组件更新

::: code-group

```ts [@/stores/user.ts]
import { create } from "zustand";

interface IUser {
  name: string;
  age: number;
  setName: (newName: string) => void;
  incAge: () => void;
  decAge: () => void;
}

const useUserStore = create<IUser>((set) => ({
  name: "whoami",
  age: 18,
  setName: (newName: string) => set(() => ({ name: newName })),
  incAge: () => set((state) => ({ age: state.age + 1 })),
  decAge: () => set((state) => ({ age: state.age - 1 })),
}));

export default useUserStore;
```

```tsx [未使用 subscribe 订阅]
import useUserStore from "./stores/user";
import { useShallow } from "zustand/shallow";

function Update() {
  const { setName, incAge, decAge } = useUserStore();
  const name = useUserStore((state) => state.name);
  const age = useUserStore((state) => state.age);

  return (
    <div className="bg-lime-200 flex flex-col gap-5">
      <div>name: {name}</div>
      <div>age: {age}</div>
      <button onClick={() => setName(name + "!")}>setName</button>
      <button onClick={() => incAge()}>incAge</button>
      <button onClick={() => decAge()}>decAge</button>
    </div>
  );
}

export default function App() {
  console.log("App update...");
  const { age } = useUserStore(
    useShallow((state) => ({
      age: state.age,
    })),
  );

  return (
    <>
      <Update />
      {/* 每次 age 改变时, 都会触发组件更新 */}
      <div>{age <= 22 ? "young" : "old"}</div>
    </>
  );
}
```

```tsx [使用 subscribe 订阅]
import { useEffect, useState } from "react";
import useUserStore from "./stores/user";

function Update() {
  const { setName, incAge, decAge } = useUserStore();
  const name = useUserStore((state) => state.name);
  const age = useUserStore((state) => state.age);

  return (
    <div className="bg-lime-200 flex flex-col gap-5">
      <div>name: {name}</div>
      <div>age: {age}</div>
      <button onClick={() => setName(name + "!")}>setName</button>
      <button onClick={() => incAge()}>incAge</button>
      <button onClick={() => decAge()}>decAge</button>
    </div>
  );
}

export default function App() {
  console.log("App update...");
  const [isYoung, setIsYoung] = useState(true);

  useEffect(() => {
    // state 的任意属性改变时, 都会触发 listener 的调用
    useUserStore.subscribe((state) => {
      console.log("[useUserStore] listener", state);
      setIsYoung(state.age <= 22);
    });
  });

  return (
    <>
      <Update />
      {/* age 改变时, 不会触发组件更新; 只有 isYoung 状态改变时 ,才会触发组件更新 */}
      <div>{isYoung ? "young" : "old"}</div>
    </>
  );
}
```

:::

### subscribe + subscribeWithSelector 中间件

subscribe + subscribeWithSelector 中间件: state 的指定属性改变时, 才会触发 listener 的调用

案例

- 未使用 subscribeWithSelector 中间件: state 的任意属性改变时, 都会触发 listener 的调用
- 使用 subscribeWithSelector 中间件: 仅 state 的 age 属性改变时, 才会触发 listener 的调用

::: code-group

```ts [@/stores/user.ts]
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface IUser {
  name: string;
  age: number;
  setName: (newName: string) => void;
  incAge: () => void;
  decAge: () => void;
}

const useUserStore = create<IUser>()(
  subscribeWithSelector((set) => ({
    name: "whoami",
    age: 18,
    setName: (newName: string) => set(() => ({ name: newName })),
    incAge: () => set((state) => ({ age: state.age + 1 })),
    decAge: () => set((state) => ({ age: state.age - 1 })),
  })),
);

export default useUserStore;
```

```tsx{25-36} [@/App.tsx]
import { useEffect, useState } from "react";
import useUserStore from "./stores/user";

function Update() {
  const { setName, incAge, decAge } = useUserStore();
  const name = useUserStore((state) => state.name);
  const age = useUserStore((state) => state.age);

  return (
    <div className="bg-lime-200 flex flex-col gap-5">
      <div>name: {name}</div>
      <div>age: {age}</div>
      <button onClick={() => setName(name + "!")}>setName</button>
      <button onClick={() => incAge()}>incAge</button>
      <button onClick={() => decAge()}>decAge</button>
    </div>
  );
}

export default function App() {
  console.log("App update...");
  const [isYoung, setIsYoung] = useState(true);

  useEffect(() => {
    // 仅 state 的 age 属性改变时, 才会触发 listener 的调用
    useUserStore.subscribe(
      (state) => state.age,
      (age, prevAge) => {
        console.log("[useUserStore] listener", age, prevAge);
        setIsYoung(age <= 22);
      },
      {
        equalityFn: (a, b) => a === b,
        fireImmediately: true,
      }
    );
  });

  return (
    <>
      <Update />
      <div>{isYoung ? "young" : "old"}</div>
    </>
  );
}
```

:::
