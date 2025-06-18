# 前端工程化

## monorepo

一个 git 仓库, 多个 pkg 以软链接的方式实现相互引用

```txt
└── packages
    ├── pkg
    │   └── package.json
    └── pkg2
        └── package.json
```

初始化 monorepo 项目 monorepo-demo

```sh
rm -rf ./monorepo-demo
mkdir ./monorepo-demo && cd ./monorepo-demo && pnpm init && tsc --init
echo "packages:
  - 'packages/*'" >./pnpm-workspace.yaml
echo "link-workspace-packages=true" >./.npmrc
mkdir ./packages/pkg/src ./packages/pkg2/src -p
cd ./packages/pkg && pnpm init && cd -
cd ./packages/pkg2 && pnpm init && cd -
echo "export function pkg() { console.log('pkg') }" >./packages/pkg/src/index.ts
echo "export function pkg2() { console.log('pkg2') }" >./packages/pkg2/src/index.ts
```

修改项目根目录下的 tsconfig.json

```json
{
  "compilerOptions": {
    "alwaysStrict": true,
    "baseUrl": "./",
    // "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "importHelpers": true,
    "jsx": "react",
    "lib": ["DOM", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@monorepo-demo/*": ["packages/*/src"],
      "*": ["src/*", "node_modules/*"]
    },
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "target": "ESNext"
  },
  "include": ["packages"]
}
```

修改多个 package.json 文件

::: code-group

```json [项目根目录]
{
  "name": "monorepo-demo",
  "version": "1.0.0",
  "scripts": {
    "build": "rollup -c"
  },
  "author": "161043261.github.io",
  "license": "ISC",
  "packageManager": "pnpm@10.7.1",
  "type": "module"
}
```

```json [子包 pkg]
{
  "name": "@monorepo-demo/pkg",
  "version": "1.0.0",
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js"
  },
  "files": ["dist"],
  "author": "161043261.github.io",
  "license": "ISC",
  "packageManager": "pnpm@10.7.1"
}
```

```json [子包 pkg2]
{
  "name": "@monorepo-demo/pkg2",
  "version": "1.0.0",
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js"
  },
  "files": ["dist"],
  "author": "161043261.github.io",
  "license": "ISC",
  "packageManager": "pnpm@10.7.1"
}
```

:::

> [!important] 关键: 在 pkg 中安装对 pkg2 的依赖
> `pnpm add @monorepo-demo/pkg2 --filter @monorepo-demo/pkg`

### 使用 [rollup](https://rollupjs.org/) 打包

```sh
pnpm i typescript rollup \
@rollup/plugin-typescript \
@rollup/plugin-node-resolve \
@rollup/plugin-commonjs \
@rollup/plugin-json \
rollup-plugin-dts -D
```

rollup 配置文件: `rollup.config.js`

```js
// @ts-check
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dts from "rollup-plugin-dts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagesDir = path.resolve(__dirname, "packages");
const pkgs = fs.readdirSync(packagesDir);

/**
 *
 * @param {string} path
 * @returns
 */
function output(path) {
  return [
    {
      input: [`./packages/${path}/src/index.ts`],
      output: [
        {
          file: `./packages/${path}/dist/index.cjs.js`,
          format: "cjs",
          sourcemap: true,
        },
        {
          file: `./packages/${path}/dist/index.esm.js`,
          format: "esm",
          sourcemap: true,
        },
      ],
      plugins: [typescript(), nodeResolve(), commonjs(), json()],
    },
    {
      input: `./packages/${path}/src/index.ts`,
      output: [
        { file: `./packages/${path}/dist/index.cjs.d.ts`, format: "cjs" },
        { file: `./packages/${path}/dist/index.esm.d.ts`, format: "esm" },
      ],
      plugins: [dts()],
    },
  ];
}

export default [...pkgs.map((path) => output(path)).flat()];
```

## git tag

```sh
# 创建 tag
git tag v0.0.1
# 推送 tag
git push origin v0.0.1
git push mirror v0.0.1
# 删除远程分支
git push origin --delete gh-pages
git push mirror --delete gh-pages
# 删除远程 tag
git push origin :refs/tags/v0.0.1
git push mirror :refs/tags/v0.0.1
```

## todo: changesets
