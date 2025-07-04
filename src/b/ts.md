# TypeScript

- `Partial<Type>` 所有字段可选
- `Required<Type>` 所有字段必选
- `Readonly<Type>` 所有字段只读
- `Record<Key, Value>`

```ts
// 接口
interface IAdd {
  (a: number, b: number): number;
}

// Pick
interface IUser {
  name: string;
  age: number;
  gender: "male" | "female";
}

type TLgbt = Pick<IUser, "name" | "age">; // { name: string; age: number; }

// Exclude
type TOptions = "A" | "B" | "C" | "D";
type TError = "A" | "B";
type TOk = Exclude<TOptions, TError>; // "C" | "D"

// Omit
type TGender = Omit<IUser, "name" | "age">; // { gender: "male" | "female"; }

// ReturnType<Fn>
const fn = (a: number, b: number) => [a, b];
type TParameters /** [a: number, b: number] */ = Parameters<typeof fn>;
type TReturnType /** number[] */ = ReturnType<typeof fn>;
```

## infer

### infer 泛型推断

```ts
//==================
// 泛型推断
//==================
interface IUser {
  name: string;
  age: number;
}

type PromisifiedUser = Promise<IUser>;

type TryInferGenericsType<T> =
  T extends Promise<infer UnknownGenericsType>
    ? UnknownGenericsType // infer succeed
    : T; // infer failed

// type InferredGenericsType = IUser
type InferredGenericsType = TryInferGenericsType<PromisifiedUser>;
const user: InferredGenericsType = { name: "whoami", age: 1 };

//==================
// 递归的泛型推断
//==================
type DeepPromisifiedUser = Promise<Promise<Promise<IUser>>>;
type TryRecursivelyInferGenericsType<T> =
  T extends Promise<infer UnknownGenericsType>
    ? TryRecursivelyInferGenericsType<UnknownGenericsType>
    : T;
type RecursivelyInferredGenericsType =
  TryRecursivelyInferGenericsType<DeepPromisifiedUser>;

// type RecursivelyInferredGenericsType = IUser
const user2: RecursivelyInferredGenericsType = { name: "whoami", age: 1 };
```

### infer 协变 (类型的并集)、逆变 (类型的交集)

```ts
const user = { name: "whoami", age: 1 };
type TryInferType<T> = T extends {
  name: infer UnknownNameType;
  age: infer UnknownAgeType;
}
  ? [UnknownNameType, UnknownAgeType]
  : T;

type InferredType /** [string, number] */ = TryInferType<typeof user>;
const user2: InferredType = [user.name, user.age];

//==================
// 协变返回或类型
//==================
type TryInferType<T> = T extends {
  name: infer UnknownUnionType;
  age: infer UnknownUnionType;
}
  ? UnknownUnionType
  : T;
type InferredType /** string | number */ = TryInferType<typeof user>;
const str: InferredType = "whoami";
const num: InferredType = 1;

//==================
// 逆变返回与类型
//==================
type TryInferType<T> = T extends {
  fn1: (arg: infer UnknownArgType) => void;
  fn2: (arg: infer UnknownArgType) => void;
}
  ? UnknownArgType
  : unknown;

type InferredType /** never (number & string === never) */ = TryInferType<{
  fn1: (arg: number) => void;
  fn2: (arg: string) => void;
}>;
type InferredType2 /** number */ = TryInferType<{
  fn1: (arg: number) => void;
  fn2: (arg: number) => void;
}>;
```

## Demo

### Demo 1

```ts
type Arr = ["a", "b", "c"];

type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  infer UnknownSecondElemType,
  infer UnknownThirdElemType,
]
  ? {
      first: UnknownFirstElemType;
      second: UnknownSecondElemType;
      third: UnknownThirdElemType;
    }
  : unknown;

// { first: "a", second: "b", third: "c" }
type InferredType = TryInferType<Arr>;
```

### Demo 2

```ts
//==================
// FirstElemType
//==================
type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  ...unknown[],
]
  ? UnknownFirstElemType
  : unknown;

type InferredType /** "a" */ = TryInferType<Arr>;

//==================
// PreRestType
//==================
type TryInferType<T extends unknown[]> = T extends [
  ...infer UnknownPreRestType,
  unknown,
]
  ? UnknownPreRestType
  : unknown;

type InferredType /** ["a", "b"] */ = TryInferType<Arr>;

//==================
// LastElemType
//==================
type TryInferType<T extends unknown[]> = T extends [
  ...unknown[],
  infer UnknownLastElemType,
]
  ? UnknownLastElemType
  : unknown;

type InferredType /** "c" */ = TryInferType<Arr>;

//==================
// RestType
//==================
type TryInferType<T extends unknown[]> = T extends [
  unknown,
  ...infer UnknownRestType,
]
  ? UnknownRestType
  : unknown;

type InferredType /** ["b", "c"] */ = TryInferType<Arr>;
```

### Demo 3

```ts
type Arr = [1, 2, 3, 4, 5];
type TryInferType<T extends unknown[]> = T extends [
  infer UnknownFirstElemType,
  ...infer UnknownRestType,
]
  ? [...TryInferType<UnknownRestType>, UnknownFirstElemType] // Recurse
  : T;

type InferredType /** [5, 4, 3, 2, 1] */ = TryInferType<Arr>;
type ReversedArr = InferredType;
```
