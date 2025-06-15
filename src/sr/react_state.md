# Zustand

## 基本使用

::: code-group

```ts [@/store/price.ts]
// @/store/price.ts
import { create } from "zustand";

interface IPriceStore {
  price: number;
  stock: number;
  incPrice: () => void;
  decPrice: () => void;
  resetPrice: () => void;
  getPrice: () => number;
}

const usePriceStore = create<IPriceStore>((set, get) => {
  return {
    price: 0,
    stock: 0,
    incPrice: () => set((state) => ({ price: state.price + 1 })),
    decPrice: () => set((state) => ({ price: state.price - 1 })),
    resetPrice: () => set({ price: 0 }),
    getPrice: () => get().price,
  };
});

export default usePriceStore;
```

```tsx [@/pages/Price.tsx]
// @/pages/Price.tsx
import usePriceStore from "@/store/price";

function Left() {
  const { incPrice, decPrice, resetPrice } = usePriceStore();

  return (
    <div className="bg-blue-300 flex gap-5">
      <button onClick={incPrice}>price++</button>
      <button onClick={decPrice}>price--</button>
      <button onClick={resetPrice}>resetPrice</button>
    </div>
  );
}

function Right() {
  const incPrice = usePriceStore((state) => state.incPrice);
  const decPrice = usePriceStore((state) => state.decPrice);
  const resetPrice = usePriceStore((state) => state.resetPrice);

  return (
    <div className="bg-green-300 flex gap-5">
      <button onClick={incPrice}>price++</button>
      <button onClick={decPrice}>price--</button>
      <button onClick={resetPrice}>resetPrice</button>
    </div>
  );
}

export default function Price() {
  const priceStore = usePriceStore();
  const { price } = priceStore;
  const price2 = usePriceStore((state) => state.price);

  return (
    <div>
      <h1>Price</h1>
      <div className="flex gap-10">
        <Left />
        <Right />
      </div>
      price: {price}, {price2}
    </div>
  );
}
```

:::

## 深层次状态

### immer

`pnpm add immer`

```ts
// immer
const data = { user: { name: "whoami", age: 22 } };
const newData = produce(data, (draft) => {
  draft.user.age = 23;
});
// { user: { name: 'whoami', age: 23 } } false
console.log(newData, newData === data);
```

### zustand 中使用 immer

::: code-group

```ts
interface IMhy {
  games: {
    first: string;
    second: string;
    third: string;
  };
  updateFirst: () => void;
}

const useMhyStore = create<IMhy>((set /** , get */) => {
  return {
    games: {
      first: "HI 1",
      second: "GI 1",
      third: "HSR 1",
    },
    updateFirst: () =>
      set((state) => ({
        games: {
          // set 深层次状态时, 必须解构
          ...state.games,
          first:
            state.games.first.split(" ")[0] +
            " " +
            (Number.parseInt(state.games.first.split(" ")[1]) + 1),
        },
      })),
  };
});
```

```ts [使用 immer 中间件]
// 使用 immer
import { immer } from "zustand/middleware/immer";

const useMhyStore = create<IMhy>()(
  immer((set /** , get */) => ({
    games: {
      first: "HI 1",
      second: "GI 1",
      third: "HSR 1",
    },
    updateFirst: () =>
      set((state) => {
        state.games.first =
          state.games.first.split(" ")[0] +
          " " +
          (Number.parseInt(state.games.first.split(" ")[1]) + 1);
      }),
  })),
);
```

:::

### immer 原理: Proxy 代理

```ts
const obj = {
  user: {
    name: "whoami",
    age: 22,
  },
};

function produce<T extends object>(base: T, fn: (draft: T) => void) {
  const baseClone: Record<string | symbol, any> = {};

  const handler: ProxyHandler<T> = {
    get(target: Record<string | symbol, any>, prop, receiver) {
      if (prop in baseClone) {
        return baseClone[prop];
      }

      if (typeof target[prop] === "object" && target[prop] !== null) {
        return new Proxy(target[prop], handler);
      }

      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, newValue) {
      return Reflect.set(baseClone, prop, newValue);
    },
  };

  const baseProxy = new Proxy(base, handler);
  fn(baseProxy);

  if (Object.keys(baseClone).length === 0) {
    return base;
  }

  return JSON.parse(JSON.stringify(baseProxy));
}

const newObj = produce(obj, (draft) => {
  draft.user.name = "immer";
  draft.user.age = 23;
});

console.log(obj);
console.log(newObj);
```

## 状态选择器, useShallow

案例

- 更新 sing 时, Left 和 Right 都会重新渲染
- 更新 dance 时, Left 和 Right 也都会重新渲染

解决方法

1. 使用状态选择器; 更新 dance 时, Left 会重新渲染, Right 不会重新渲染
2. 使用 useShallow `import { useShallow } from 'zustand/react/shallow'`

### 状态选择器

::: code-group

```ts [@/store/kun.ts]
interface IKun {
  name: string;
  age: number;
  hobbies: {
    sing: string;
    dance: string;
    rap: string;
    basketball: string;
  };
  setSing: (newSing: string) => void;
  setDance: (newDance: string) => void;
}

const useKunStore = create<IKun>((set) => ({
  name: "Kun",
  age: 18,
  hobbies: {
    sing: "唱",
    dance: "跳",
    rap: "rap",
    basketball: "篮球",
  },
  setSing: (newSing: string) => set((state) => ({ ...state, sing: newSing })),
  setDance: (newDance: string) =>
    set((state) => ({ ...state, dance: newDance })),
}));

export default useKunStore;
```

```tsx{26-31} [@/pages/Kun.tsx]
function Left() {
  console.log("Update left");
  const { name, age, hobbies, setSing, setDance } = useKunStore();
  return (
    <div className="bg-blue-300">
      <div>name: {name}</div>
      <div>age: {age}</div>
      <ul>
        {Object.values(hobbies).map((val, idx) => (
          <li key={idx}>{val}</li>
        ))}
      </ul>
      <div className="flex gap-5">
        <button onClick={() => setSing((hobbies.sing += "!"))}>setSing</button>
        <button onClick={() => setDance((hobbies.dance += "!"))}>
          setDance
        </button>
      </div>
    </div>
  );
}

function Middle() {
  console.log("Update middle");
  // 使用 useShallow
  const { name, sing } = useKunStore(
    useShallow((state) => ({
      name: state.name,
      sing: state.hobbies.sing,
    })),
  );
  return (
    <div className="bg-green-300">
      <div>name: {name}</div>
      <div>sing: {sing}</div>
    </div>
  );
}

function Right() {
  console.log("Update right");
  const { name, hobbies } = useKunStore(); // [!code --]
  // 使用状态选择器
  const name = useKunStore((state) => state.name); // [!code ++]
  const sing = useKunStore((state) => state.hobbies.sing); // [!code ++]
  return (
    <div className="bg-pink-300">
      <div>name: {name}</div>
      <div>sing: {sing}</div>
    </div>
  );
}

export default function Kun() {
  console.log("Kun");
  return (
    <div className="flex gap-10">
      <Left />
      <Middle />
      <Right />
    </div>
  );
}
```
