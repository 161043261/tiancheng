# Nest.js

## IoC, DI

- IoC: Inversion of Control 控制反转
- DI: Dependency Injection 依赖注入

## 创建 nest 项目

```bash
# vue
pnpm create vue@latest
# vite
pnpm create vite@latest

# nest
pnpm add -g @nestjs/cli
nest new nest-demo
```

## nest 命令行

`nest --help`

::: code-group

```bash [module]
# [create] src/user/user.module.ts
# [update] src/app.module.ts
nest generate module user
nest g mo user
```

```bash [controller]
# [create] src/user/user.controller.ts
# [update] src/user/user.module.ts
nest generate controller user
nest g co user
```

```bash [service]
# [create] src/user/user.service.ts
# [update] src/user/user.module.ts
nest generate service user
nest g s user
```

```bash [resource (推荐)]
# [create] src/user/user.module.ts
# [create] src/user/user.controller.ts
# [create] src/user/user.service.ts
# [create] src/user/dto/create-user.dto.ts
# [create] src/user/dto/update-user.dto.ts
# [create] src/user/entities/user.entity.ts
# [update] src/app.module.ts
rm -rf src/user
nest generate resource user
nest g res user
```

:::

### app 模块

::: code-group

```ts [@/main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

```ts [@/app.module.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  }); // 开启 url 版本
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

```ts [@/app.controller.ts]
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

```ts [@/app.service.ts]
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
```

:::

### user 子模块

loader, action: 参考 react-router 路由操作

::: code-group

```ts [@/user/user.module.ts]
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

```ts [@/user/user.controller.ts]
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  Req,
  Query,
  Headers,
  HttpCode,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request as ExpressRequest } from "express";

// @Controller('user')
@Controller({
  path: "user",
  version: "1", // v1
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST 请求, 请求体参数
  // curl -X POST -d "k1=v1&k2=v2" http://localhost:3000/v1/user
  @Post()
  create(
    @Req() req: ExpressRequest,
    @Body() body: CreateUserDto,
    @Body("k1") k1: string,
    @Body("k2") k2: string,
  ) {
    console.log("[create] req.body:", req.body); // { k1: 'v1', k2: 'v2' }
    console.log("[create] body:", body); // { k1: 'v1', k2: 'v2' }
    console.log("[create] k1:", k1); // v1
    console.log("[create] k2:", k2); // v2
    return this.userService.create(body);
  }

  // GET 请求, 查询参数
  // curl http://localhost:3000/v1/user?k3=v3&k4=v4
  @Get()
  findAll(
    @Req() /** @Request() */ req: ExpressRequest,
    @Query() query: unknown,
    @Query("k3") k3: string,
    @Query("k4") k4: string,
  ) {
    console.log("[findAll] req.query:", req.query); // { k3: 'v3', k4: 'v4' }
    console.log("[findAll] query:", query); // { k3: 'v3', k4: 'v4' }
    console.log("[findAll] k3:", k3); // v3
    console.log("[findAll] k4:", k4); // v4
    return this.userService.findAll();
  }

  // GET 请求, url 路径参数
  // curl http://localhost:3000/v2/user/3/whoami
  @Get(":id/:name")
  @Version("2") // v2
  findOne(
    @Req() req: ExpressRequest,
    @Param() params: unknown,
    @Param("id") id: string,
    @Param("name") name: string,
  ) {
    console.log("[findOne] req.params:", req.params); // { id: '3', name: 'whoami' }
    console.log("[findOne] params:", params); // { id: '3', name: 'whoami' }
    console.log("[findOne] id:", id); // 3
    console.log("[findOne] name:", name); // whoami
    return this.userService.findOne(Number.parseInt(id, 10));
  }

  // curl -X PATCH -d "k5=v5&k6=v6" http://localhost:3000/v1/user/3
  @Patch(":id")
  @HttpCode(200) // 返回 http 状态码 200
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Headers() headers: unknown,
  ) {
    console.log("[update] id:", id); // 3
    console.log("[update] updateUserDto:", updateUserDto); // { k5: 'v5', k6: 'v6' }
    console.log("[update] headers:", headers);
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
```

```ts [@/user/user.service.ts]
import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  findAll() {
    return "This loader returns all user";
  }

  findOne(id: number) {
    return `This loader returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
```

```ts [others]
// @/user/entities/user.entity.ts
export class User {}

// @/user/dto/create-user.dto.ts
export class CreateUserDto {}

// @/user/dto/update-user.dto.ts
import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

:::

## 会话管理

```bash
pnpm add express-session
pnpm add @types/express-session -D

# 验证码
pnpm add svg-captcha
```

## inject/provide

AppService --- inject --> AppModule (IoC container) --- provide --> AppController

### 自定义注入名、自定义注入值

::: code-group

```ts [@/app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";

@Module({
  imports: [UserModule],
  controllers: [AppController],
  // providers: [AppService], // [!code --]
  providers: [
    // 自定义注入名 MyAppService
    {
      // [!code ++]
      provide: "MyAppService", // [!code ++]
      useClass: AppService, // [!code ++]
    }, // [!code ++]
    // 自定义注入值 kun = ['sing', 'dance', 'rap', 'basketball']
    {
      provide: "kun",
      useValue: ["sing", "dance", "rap", "basketball"],
    },
    {
      provide: "DecoratedAppService",
      // inject: [AppService], // [!code --]
      inject: ["MyAppService"], // [!code ++]
      // 支持异步
      async useFactory(appService: AppService) {
        return new Promise((resolve) => {
          console.log("[Debug] typeof appService", typeof appService);
          appService.getHello = function () {
            return "I love you";
          };
          resolve(appService);
        });
      },
    },
  ],
})
export class AppModule {}
```

```ts [@/app.controller.ts]
import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}
  constructor(
    @Inject("MyAppService") private readonly appService: AppService,
    @Inject("kun") private readonly kun: string[],
    @Inject("DecoratedAppService")
    private readonly decoratedAppService: AppService,
  ) {}

  // curl http://localhost:3000
  @Get()
  getHello(): string {
    console.log("[getHello] Injected kun:", this.kun);
    console.log(
      "[getHello] Injected decoratedAppService.getHello():",
      this.decoratedAppService.getHello(),
    );
    return this.appService.getHello();
  }
}
```

:::

## 模块

### 共享模块 `exports`

- 使用 exports 导出, 父模块中可用
- 类似 Vue 的 defineExpose, React 的 useImperativeHandle

```bash
nest generate resource common
nest g res common
```

::: code-group

```ts [@/common/common.module.ts]
import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService], // [!code ++]
})
export class CommonModule {}
```

```ts [@/app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { CommonModule } from "./common/common.module";

@Module({
  // UserModule export
  imports: [UserModule, CommonModule],
  controllers: [AppController],
  // AppModule provide
  providers: [
    {
      provide: "MyAppService",
      useClass: AppService,
    },
  ],
})
export class AppModule {}
```

```ts [@/app.controller.ts]
import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service";
import { CommonService } from "./common/common.service";

@Controller()
export class AppController {
  constructor(
    // AppModule provide
    @Inject("MyAppService") private readonly appService: AppService,
    // UserModule export
    private readonly commonService: CommonService,
  ) {}

  // curl http://localhost:3000
  @Get()
  getHello(): string {
    console.log(this.commonService.findAll());
    return this.appService.getHello();
  }
}
```

:::

### 全局模块 `@Global() + exports`

使用 @Global() + exports 导出, 所有模块中 (全局) 可用

::: code-group

```ts [@/common/common.module.ts]
import { Global, Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";

const config = {
  provide: "commonConfig",
  useValue: { port: 3000 },
};

@Global()
@Module({
  controllers: [CommonController],
  providers: [CommonService, config],
  exports: [CommonService, config],
})
export class CommonModule {}
```

```ts{8} [@/app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [UserModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts [@/user/user.module.ts]
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  // providers: [UserService],
  providers: [
    {
      provide: "MyUserService",
      useClass: UserService,
    },
  ],
})
export class UserModule {}
```

```ts [@/user/user.controller.ts]
import { Controller, Param, Delete, Inject } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller({
  path: "user",
  version: "1", // v1
})
export class UserController {
  constructor(
    // UserModule provide
    @Inject("MyUserService") private readonly userService: UserService,
    // Global CommonModule export
    @Inject("commonConfig") private readonly config: unknown,
  ) {}

  // curl -X DELETE http://localhost:3000/v1/user/3
  @Delete(":id")
  remove(@Param("id") id: string) {
    console.log("[remove] this.config:", this.config); // { port: 3000 }
    return this.userService.remove(+id);
  }
}
```

:::

### 动态模块 (静态方法)

::: code-group

```ts [@/common/common.module.ts]
import { DynamicModule, Global, Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";

const defaultConfig = {
  provide: "commonConfig",
  useValue: { port: 3000 },
};

@Global()
@Module({
  controllers: [CommonController],
  providers: [CommonService, defaultConfig],
  exports: [CommonService, defaultConfig],
})
export class CommonModule {
  static decorate(configValue: Record<string, unknown>): DynamicModule {
    const dynamicConfig = {
      provide: "commonConfig",
      useValue: configValue,
    };
    return {
      module: CommonModule,
      providers: [CommonService, dynamicConfig],
      exports: [CommonService, dynamicConfig],
    };
  }
}
```

```ts{8} [@/app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { CommonModule } from "./common/common.module";

@Module({
  imports: [UserModule, CommonModule.decorate({ port: 3001 })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts [@/user/user.module.ts]
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  // providers: [UserService],
  providers: [
    {
      provide: "MyUserService",
      useClass: UserService,
    },
  ],
})
export class UserModule {}
```

```ts [@/user/user.controller.ts]
import { Controller, Param, Delete, Inject } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller({
  path: "user",
  version: "1", // v1
})
export class UserController {
  constructor(
    // UserModule provide
    @Inject("MyUserService") private readonly userService: UserService,
    // Global CommonModule.decorate export
    @Inject("commonConfig") private readonly config: unknown,
  ) {}

  // curl -X DELETE http://localhost:3000/v1/user/3
  @Delete(":id")
  remove(@Param("id") id: string) {
    console.log("[remove] this.config:", this.config); // { port: 3001 }
    return this.userService.remove(+id);
  }
}
```

:::

## 中间件

```bash
# [create] src/logger/logger.middleware.ts
nest generate middleware logger
nest g mi logger
```

### 依赖注入中间件

::: code-group

```ts [@/logger/logger.middleware.ts]
import { Injectable, NestMiddleware } from "@nestjs/common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    console.log("[logger] Object.keys(req):", Object.keys(req));
    console.log("[logger] Object.keys(res):", Object.keys(res));
    next();
    // res.send("Intercepted by logger")
  }
}
```

```ts [@/user/user.module.ts]
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { LoggerMiddleware } from "src/logger/logger.middleware";

@Module({
  controllers: [UserController],
  // providers: [UserService],
  providers: [
    {
      provide: "MyUserService",
      useClass: UserService,
    },
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 作用于 UserController 中的所有请求
    // consumer.apply(LoggerMiddleware).forRoutes(UserController);

    // 只作用于 UserController 中, 路由前缀 /v1/user 的请求
    // consumer.apply(LoggerMiddleware).forRoutes('/v1/user');

    // 只作用于 UserController 中, 路由前缀 /v1/user 的 GET 请求
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "/v1/user", method: RequestMethod.GET });
  }
}
```

:::

### 全局中间件、允许跨域

全局中间件即 express 函数中间件

```ts
// @/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import * as expressSession from "express-session";
import { Handler as ExpressHandler } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";

const globalMiddleware: ExpressHandler = (req, res, next) => {
  console.log("[globalMiddleware] req.originalUrl:", req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { cors: true }, // 开启跨域
  );

  // 开启 url 版本
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(
    expressSession({
      secret: "528",
      rolling: true,
      name: "cookieKey",
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 60 * 24 * 7 },
    }),
  );

  // 使用全局中间件
  app.use(globalMiddleware);

  // 开启跨域
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## 静态资源目录, 文件上传、(流式) 下载

```bash
pnpm add multer
pnpm add @types/multer -D
pnpm add compressing

nest generate resource upload
nest g res upload
```

::: code-group

```ts [@/upload/upload.module.ts]
import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { basename, extname, join } from "node:path";
import { randomBytes } from "node:crypto";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(__dirname, "../static"),
        filename: (req, file, callback) => {
          console.log("[multer] file.fieldname:", file.fieldname); // fileEntity

          const fnameWithExt = file.originalname;
          console.log("[multer] file.originalname:", fnameWithExt); // example.jpg

          const extWithDot = extname(fnameWithExt);
          console.log("[multer] extWithDot:", extWithDot); // .jpg

          const fnameNoExt = basename(fnameWithExt, extWithDot);
          console.log("[multer] fnameNoExt:", fnameNoExt); // example

          const hash = randomBytes(4).toString("hex").slice(0, 8);

          const renamedFilenameNoExt = `${fnameNoExt}.${hash}${extWithDot}`;
          return callback(null, renamedFilenameNoExt);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
```

```ts [@/upload/upload.controller.ts]
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
} from "@nestjs/common";
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { join } from "node:path";
import { Response as ExpressResponse } from "express";
import { createReadStream } from "node:fs";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 上传
  @Post()
  @UseInterceptors(
    FileInterceptor("fileEntity" /** fieldName */), // 上传单个文件
    // FilesInterceptor('multiFileEntities' /** fieldName */), // 上传多个文件
  )
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    console.log("[uploadSingleFile] file.fieldname:", file.fieldname); // fileEntity
    console.log("[uploadSingleFile] file.originalname:", file.originalname); // example.jpg
    console.log("[uploadSingleFile] file.mimetype:", file.mimetype); // image/jpeg
    console.log("[uploadSingleFile] file.destination:", file.destination); // /path/to/dist/static
    console.log("[uploadSingleFile] file.filename:", file.filename); // example.[hash8].jpg
    console.log("[uploadSingleFile] file.path:", file.path); // /path/to/dist/static/example.[hash8].jpg
    console.log("[uploadSingleFile] file.size:", file.size); // ? (bytes)
    return "200 OK";
  }

  // 下载
  // http://localhost:3000/upload/example.[hash8].jpg
  @Get(":fnameWithExt")
  download(
    @Param("fnameWithExt") fnameWithExt: string,
    @Res() res: ExpressResponse,
  ) {
    console.log("[download] fnameWithExt:", fnameWithExt);
    const assetUrl = join(__dirname, "../static", fnameWithExt);
    res.download(assetUrl);
  }

  // 流式下载
  // http://localhost:3000/upload/stream/example.[hash8].jpg
  @Get("stream/:fnameWithExt")
  downloadStream(
    @Param("fnameWithExt") fnameWithExt: string,
    @Res() res: ExpressResponse,
  ) {
    console.log("[downloadStream] fnameWithExt:", fnameWithExt);
    const assetUrl = join(__dirname, "../static", fnameWithExt);
    res.setHeader("Content-Type", "application/octet-stream");
    const fileStream = createReadStream(assetUrl);
    fileStream.pipe(res);
  }
}
```

```ts [@/main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import * as expressSession from "express-session";
import { Handler as ExpressHandler } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

const globalMiddleware: ExpressHandler = (req, res, next) => {
  console.log("[globalMiddleware] req.originalUrl:", req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { cors: true }, // 开启跨域
  );

  // 开启 url 版本
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(
    expressSession({
      secret: "528",
      rolling: true,
      name: "cookieKey",
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 60 * 24 * 7 },
    }),
  );

  // 使用全局中间件
  app.use(globalMiddleware);

  // 开启跨域
  app.enableCors();

  // 使用静态资源目录
  // http://localhost:3000/resources/example.[hash8].jpg
  app.useStaticAssets(join(__dirname, "static"), {
    prefix: "/resources", // 必须带 /
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

:::

## rxjs

案例

```ts
import { filter, interval, map, Observable, take, of } from "rxjs";

describe("rxjs", () => {
  // pnpm test src/rxjs.spec.ts -t test1
  it("test1", (done) => {
    const results: number[] = [];

    const observable = new Observable((subscribe) => {
      subscribe.next(1);
      subscribe.next(2);
      subscribe.next(3);

      setTimeout(() => {
        subscribe.next(4);
        subscribe.complete();
      }, 3000);
    });

    observable.subscribe({
      next: (val: number) => results.push(val),
      complete: () => {
        expect(results).toEqual([1, 2, 3, 4]);
        done();
      },
    });
  });

  // pnpm test src/rxjs.spec.ts -t test2
  it("test2", (done) => {
    const results: number[] = [];

    interval(500)
      .pipe(take(5))
      .subscribe({
        next: (val) => results.push(val),
        complete: () => {
          expect(results).toEqual([0, 1, 2, 3, 4]);
          done();
        },
      });
  });

  // pnpm test src/rxjs.spec.ts -t test3
  it("test3", (done) => {
    const results: { score: number }[] = [];

    const observable = interval(500)
      .pipe(
        map((item) => ({ score: item })),
        filter((item) => item.score % 2 == 0),
      )
      .subscribe({
        next: (val) => {
          results.push(val);
          if (val.score === 4) {
            observable.unsubscribe();
            expect(results).toEqual([{ score: 0 }, { score: 2 }, { score: 4 }]);
            done();
          }
        },
      });
  });

  // pnpm test src/rxjs.spec.ts -t test4
  it("test4", (done) => {
    const results: { score: number }[] = [];

    of(0, 1, 2, 3, 4)
      .pipe(
        map((item) => ({ score: item })),
        filter((item) => item.score % 2 == 1),
      )
      .subscribe({
        next: (val) => {
          results.push(val);
        },
        complete: () => {
          expect(results).toEqual([{ score: 1 }, { score: 3 }]);
          done();
        },
      });
  });
});
```

## interceptor 拦截器, filter 过滤器

```bash
# [create] src/resp/resp.interceptor.ts
nest generate interceptor resp
nest g itc resp

# [create] src/err/err.filter.ts
nest generate filter err
nest g f err
```

::: code-group

```ts [@/resp/resp.interceptor.ts 全局响应拦截器]
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";

interface IRes<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class RespInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IRes<T>> {
    console.log(
      "[respInterceptor] Object.keys(context):",
      Object.keys(context),
    );
    return next.handle().pipe(
      map((item: T) => ({
        data: item,
        code: 200,
        message: "OK",
      })),
    );
  }
}
```

```ts [@/err/err.filter.ts 全局异常过滤器]
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
@Catch()
export class ErrFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<ExpressRequest>();
    const resp = ctx.getResponse<ExpressResponse>();
    const statusCode = exception.getStatus();
    resp.status(statusCode).json({
      timestamp: Date.now(),
      cause: exception.cause,
      statusCode,
      reqUrl: req.url,
      errMsg: exception.message,
      errName: exception.name,
      errStack: exception.stack,
    });
  }
}
```

```ts [@/main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import * as expressSession from "express-session";
import { Handler as ExpressHandler } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { RespInterceptor } from "./resp/resp.interceptor";
import { ErrFilter } from "./err/err.filter";

const globalMiddleware: ExpressHandler = (req, res, next) => {
  console.log("[globalMiddleware] req.originalUrl:", req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { cors: true }, // 开启跨域
  );

  // 开启 url 版本
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(
    expressSession({
      secret: "528",
      rolling: true,
      name: "cookieKey",
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 60 * 24 * 7 },
    }),
  );

  // 使用全局中间件
  app.use(globalMiddleware);

  // 开启跨域
  app.enableCors();

  // 使用静态资源目录
  // http://localhost:3000/resources/example.[hash8].jpg
  app.useStaticAssets(join(__dirname, "static"), {
    prefix: "/resources", // 必须带 /
  });

  // 使用全局响应拦截器
  app.useGlobalInterceptors(new RespInterceptor());

  // 使用全局异常过滤器
  app.useGlobalFilters(new ErrFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

:::

## 管道

### 内置管道

- ValidationPipe 字段校验管道
- ParseBoolPipe 解析布尔值的管道
- ParseIntPipe 解析整数的管道
- ParseFloatPipe 解析浮点数的管道
- ParseArrayPipe 解析数组的管道
- ParseUUIDPipe 解析 UUID 的管道
- ParseEnumPipe 解析枚举的管道
- DefaultValuePipe 默认值管道

```ts
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseUUIDPipe,
} from "@nestjs/common";
import { CommonService } from "./common.service";
import { UpdateCommonDto } from "./dto/update-common.dto";

@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  // curl http://localhost:3000/common/1
  @Get(":id")
  findOne(@Param("id") id: string) {
    console.log("[findOne] typeof id", typeof id); // string
    return this.commonService.findOne(Number.parseInt(id, 10));
  }

  // curl -X PATCH http://localhost:3000/common/1
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCommonDto: UpdateCommonDto,
  ) {
    console.log("[update] typeof id:", typeof id); // number
    return this.commonService.update(id, updateCommonDto);
  }

  // curl -X DELETE http://localhost:3000/common/[uuid]
  @Delete(":uuid")
  remove(@Param("uuid", ParseUUIDPipe) uuid: string) {
    console.log("[remove] typeof uuid:", typeof uuid); // string
    return this.commonService.remove(uuid);
  }
}
```

案例: 全局字段校验管道

```bash
nest generate resource login
nest g res login

# [create] src/login/login.pipe.ts
nest generate pipe login
nest g pi login

pnpm add class-validator class-transformer
```

::: code-group

```ts [@/err/err.filter.ts]
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

interface DetailedErrMsg {
  message: string[];
}

@Catch()
export class ErrFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<ExpressRequest>();
    const resp = ctx.getResponse<ExpressResponse>();
    // const statusCode = exception.getStatus();
    const statusCode = exception.getStatus?.() ?? HttpStatus.BAD_REQUEST;
    resp.status(statusCode).json({
      timestamp: Date.now(),
      cause: exception.cause,
      statusCode,
      reqUrl: req.url,
      errMsg: exception.message,
      // detailedErrMsg 包含全局字段校验管道的错误消息
      detailedErrMsg:
        (Reflect.get(exception, "response") as DetailedErrMsg | undefined)
          ?.message ?? [],
      errName: exception.name,
      errStack: exception.stack,
    });
  }
}
```

```ts [@/login/dto/create-login.dto.ts]
import { IsNotEmpty, IsString, Length, IsNumber } from "class-validator";

export class CreateLoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 7, {
    message: "name.length >= 3 && name.length <= 7",
  })
  name: string;

  @IsNumber()
  age: number;
}
```

```ts [@/login/login.pipe.ts]
import { Controller, Post, Body } from "@nestjs/common";
import { LoginService } from "./login.service";
import { CreateLoginDto } from "./dto/create-login.dto";

@Controller("login")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // curl -X POST -H "Content-Type:application/json" -d '{"name":"whoami","age":23}' http://localhost:3000/login
  @Post()
  create(
    @Body() createLoginDto: CreateLoginDto,
    @Body("name") name: string,
    @Body("age") age: string,
  ) {
    // { name: 'whoami', age: 23 }
    console.log("[create] createLoginDto:", createLoginDto);
    // whoami
    console.log("[create] name:", name);
    // 23
    console.log("[create] age:", age);
    return this.loginService.create(createLoginDto);
  }
}
```

```ts [@/main.ts]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import * as expressSession from "express-session";
import { Handler as ExpressHandler } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { RespInterceptor } from "./resp/resp.interceptor";
import { ErrFilter } from "./err/err.filter";

const globalMiddleware: ExpressHandler = (req, res, next) => {
  console.log("[globalMiddleware] req.originalUrl:", req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { cors: true }, // 开启跨域
  );

  // 开启 url 版本
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(
    expressSession({
      secret: "528",
      rolling: true,
      name: "cookieKey",
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 60 * 24 * 7 },
    }),
  );

  // 使用全局中间件
  app.use(globalMiddleware);

  // 开启跨域
  app.enableCors();

  // 使用静态资源目录
  // http://localhost:3000/resources/example.[hash8].jpg
  app.useStaticAssets(join(__dirname, "static"), {
    prefix: "/resources", // 必须带 /
  });

  // 使用全局响应拦截器
  app.useGlobalInterceptors(new RespInterceptor());

  // 使用全局异常过滤器
  app.useGlobalFilters(new ErrFilter());

  // 使用全局字段校验管道
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

:::

### 自定义管道

案例: 自定义字段校验管道

::: code-group

```ts [@/login/dto/create-login.dto.ts]
import { IsNotEmpty, IsString, Length, IsNumber } from "class-validator";

export class CreateLoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 7, {
    message: "name.length >= 3 && name.length <= 7",
  })
  name: string;

  @IsNumber()
  age: number;
}
```

```ts [@/login/login.controller.ts]
import { Controller, Post, Body } from "@nestjs/common";
import { LoginService } from "./login.service";
import { CreateLoginDto } from "./dto/create-login.dto";
import { LoginPipe } from "./login.pipe";

@Controller("login")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // curl -X POST -H "Content-Type:application/json" -d '{"name":"whoami","age":23}' http://localhost:3000/login
  @Post()
  create(
    @Body(LoginPipe) createLoginDto: CreateLoginDto,
    @Body("name", LoginPipe) name: string,
    @Body("age", LoginPipe) age: string,
  ) {
    // { name: 'whoami', age: 23 }
    console.log("[create] createLoginDto:", createLoginDto);
    // whoami
    console.log("[create] name:", name);
    // 23
    console.log("[create] age:", age);
    return this.loginService.create(createLoginDto);
  }
}
```

```ts [@/login/login.pipe.ts]
import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { CreateUserDto } from "src/user/dto/create-user.dto";

type WithProps<T> = T | T[keyof T];

@Injectable()
export class LoginPipe implements PipeTransform {
  async transform(
    value: WithProps<typeof CreateUserDto>,
    metadata: ArgumentMetadata,
  ) {
    /** @Body(LoginPipe) */
    // value: { name: 'whoami', age: 23 }
    // metadata: { metatype: [class CreateLoginDto], type: 'body', data: undefined }

    /** @Body('name', LoginPipe) */
    // value: whoami
    // metadata: { metatype: [Function: String], type: 'body', data: 'name' }

    /** @Body('age', LoginPipe) */
    // value: 23
    // metadata: { metatype: [Function: String], type: 'body', data: 'age' }
    console.log("[loginPipe] value:", value);
    console.log("[loginPipe] metadata:", metadata);
    if (metadata.metatype) {
      const typedValue = plainToInstance(metadata.metatype, value) as WithProps<
        typeof CreateUserDto
      >;

      // typedValue: CreateLoginDto { name: 'whoami', age: 23 }
      // typedValue: whoami
      // typedValue: 23;
      console.log("[loginPipe] typedValue:", typedValue);
      const aggregateErrors: ValidationError[] = await validate(typedValue);
      console.log("[loginPipe] aggregateErrors:", aggregateErrors);
      if (aggregateErrors.length) {
        throw new HttpException(aggregateErrors, HttpStatus.BAD_REQUEST);
      }
    }

    return value;
  }
}
```

:::

## 守卫

```bash
# [create] src/login/login.guard.ts
nest generate guard login
nest g gu login
```

::: code-group

```ts [@/login/login.guard.ts]
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Request as ExpressRequest } from "express";
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log("[loginGuard] Object.keys(context):", Object.keys(context));

    console.log(
      "[loginGuard] context.getHandler():",
      context.getHandler().toString(),
    );

    const roles = this.reflector.get<string[] | undefined>(
      "roles",
      context.getHandler(),
    );
    // roles: ['admin']
    console.log("[loginGuard] roles:", roles);

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<ExpressRequest>();
    const queryRole = req.query.role;

    // req.query.role: admin
    console.log("[loginGuard] req.query.role:", queryRole);
    return (
      !roles ||
      (Boolean(queryRole) &&
        typeof queryRole === "string" &&
        roles.includes(queryRole))
    );
  }
}
```

```ts{37,38} [@/login/login.controller.ts 本模块中使用守卫]
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  SetMetadata,
} from "@nestjs/common";
import { LoginService } from "./login.service";
import { CreateLoginDto } from "./dto/create-login.dto";
import { LoginGuard } from "./login.guard";

@Controller("login")
// 本模块中使用 LoginGuard 守卫
@UseGuards(LoginGuard)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // curl -X POST -H "Content-Type:application/json" -d '{"name":"whoami","age":23}' http://localhost:3000/login
  @Post()
  create(
    @Body() createLoginDto: CreateLoginDto,
    @Body("name") name: string,
    @Body("age") age: string,
  ) {
    // { name: 'whoami', age: 23 }
    console.log("[create] createLoginDto:", createLoginDto);
    // whoami
    console.log("[create] name:", name);
    // 23
    console.log("[create] age:", age);
    return this.loginService.create(createLoginDto);
  }

  // curl http://localhost:3000/login?role=admin
  @Get()
  // 守卫元数据
  @SetMetadata("roles", ["admin"])
  findAll() {
    return this.loginService.findAll();
  }
}
```

```ts [@/main.ts 使用全局守卫]
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import * as expressSession from "express-session";
import { Handler as ExpressHandler } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { RespInterceptor } from "./resp/resp.interceptor";
import { ErrFilter } from "./err/err.filter";
import { LoginGuard } from "./login/login.guard";

const globalMiddleware: ExpressHandler = (req, res, next) => {
  console.log("[globalMiddleware] req.originalUrl:", req.originalUrl);
  next();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { cors: true }, // 开启跨域
  );

  // 开启 url 版本
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(
    expressSession({
      secret: "528",
      rolling: true,
      name: "cookieKey",
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 60 * 24 * 7 },
    }),
  );

  // 使用全局中间件
  app.use(globalMiddleware);

  // 开启跨域
  app.enableCors();

  // 使用静态资源目录
  // http://localhost:3000/resources/example.[hash8].jpg
  app.useStaticAssets(join(__dirname, "static"), {
    prefix: "/resources", // 必须带 /
  });

  // 使用全局响应拦截器
  app.useGlobalInterceptors(new RespInterceptor());

  // 使用全局异常过滤器
  app.useGlobalFilters(new ErrFilter());

  // 使用全局字段校验管道
  app.useGlobalPipes(new ValidationPipe());

  // 使用全局守卫
  app.useGlobalGuards(new LoginGuard());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

:::

## 责任链模式

request 请求 -> middleware 中间件 -> guard 守卫 -> interceptor 前置拦截器 -> controller 控制器 -> interceptor 后置拦截器 -> filter (异常) 过滤器 -> response 响应

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable } from "rxjs";

interface IRes<T> {
  data: T;
  code: number;
  message: string;
}

@Injectable()
export class RespInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IRes<T>> {
    // 前置拦截器
    console.log(
      "[respInterceptor] Object.keys(context):",
      Object.keys(context),
    );

    // controller

    // 后置拦截器
    return next.handle().pipe(
      map((item: T) => {
        console.log("[respInterceptor] rxjs");
        return {
          data: item,
          code: 200,
          message: "OK",
        };
      }),
    );
  }
}
```

## 自定义装饰器

- 方法装饰器
- 参数装饰器

```bash
# [create] /src/custom/custom.decorator.ts
nest generate decorator custom
nest g d custom
```

::: code-group

```ts [@/custom/custom.decorator.ts]
import { createParamDecorator, SetMetadata } from "@nestjs/common";
import { Request as ExpressRequest } from "express";
// 方法装饰器
// Usage: @SetRoles('admin', 'user')
export const SetRoles = (...args: string[]) => SetMetadata("roles", args);

// 参数装饰器
// Usage: @ReqUrl('yourData')
export const ReqUrl = createParamDecorator((data, context) => {
  console.log("[reqUrl] data:", data); // myData
  const ctx = context.switchToHttp();
  const req = ctx.getRequest<ExpressRequest>();
  return req.url; // /login/1?role=user
});
```

```ts [@/login/login.controller.ts]
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  SetMetadata,
} from "@nestjs/common";
import { LoginService } from "./login.service";
import { CreateLoginDto } from "./dto/create-login.dto";
import { LoginGuard } from "./login.guard";
import { ReqUrl, SetRoles } from "src/custom/custom.decorator";

@Controller("login")
// 本模块中使用 LoginGuard 守卫
@UseGuards(LoginGuard)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // curl -X POST -H "Content-Type:application/json" -d '{"name":"whoami","age":23}' http://localhost:3000/login
  @Post()
  create(
    @Body() createLoginDto: CreateLoginDto,
    @Body("name") name: string,
    @Body("age") age: string,
  ) {
    // { name: 'whoami', age: 23 }
    console.log("[create] createLoginDto:", createLoginDto);
    // whoami
    console.log("[create] name:", name);
    // 23
    console.log("[create] age:", age);
    return this.loginService.create(createLoginDto);
  }

  // curl http://localhost:3000/login?role=admin
  @Get()
  @SetMetadata("roles", ["admin"])
  findAll() {
    return this.loginService.findAll();
  }

  // curl http://localhost:3000/login/1?role=user
  @Get(":id")
  @SetRoles("admin", "user")
  findOne(@Param("id") id: string, @ReqUrl("myData") reqUrl: string) {
    console.log("[findOne] reqUrl:", reqUrl);
    return this.loginService.findOne(Number.parseInt(id, 10));
  }
}
```

:::

## 集成 swagger

`pnpm add @nestjs/swagger swagger-ui-express`

swagger 类注解

- `@ApiTags()`
- `@ApiBearerAuth()`

swagger 方法注解

- `@ApiOperation()`
- `@ApiQuery()` 查询参数
- `@ApiParam()` url 路径参数
- `@ApiResponse()`
- `@ApiProperty()`

```ts
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const swaggerDocumentConfig = new DocumentBuilder()
  .setTitle("nest-demo")
  .setDescription("nest-demo")
  .setVersion("1")
  .build();

export function setupSwaggerDocument(app: INestApplication) {
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerDocumentConfig,
  );

  SwaggerModule.setup("/api-docs", app, swaggerDocument);
}
```

## typeorm 连接 mysql

```bash
mkdir ./sql
pnpm add mysql2 @nestjs/typeorm typeorm

nest generate resource emp # employee
nest g res emp # employee
```

::: code-group

```yml [docker-compose.yml]
services:
  # docker compose up mysql -d
  mysql:
    image: "mysql:latest"
    volumes:
      - ./sql:/docker-entrypoint-initdb.d
    ports:
      - 3307:3306
    environment:
      - MYSQL_DATABASE=db0
      - MYSQL_USER=whoami
      - MYSQL_PASSWORD=pass
      - MYSQL_RANDOM_ROOT_PASSWORD="yes"
  # docker compose down mysql -v
```

```ts [@/src/app.module.ts]
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { CommonModule } from "./common/common.module";
import { UploadModule } from "./upload/upload.module";
import { LoginModule } from "./login/login.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmpModule } from "./emp/emp.module";

@Module({
  imports: [
    UserModule,
    CommonModule.decorate({ port: 3001 }),
    UploadModule,
    LoginModule,
    EmpModule,
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "whoami",
      password: "pass",
      database: "db0",
      retryDelay: 500,
      retryAttempts: 3,
      // entities: [join(__dirname, './**/*.entity{.js,.ts}')],
      autoLoadEntities: true, // 自动加载 entity
      synchronize: true, // 自动将 entity 同步到数据库
    }),
  ],
  controllers: [AppController],
  // providers: [AppService],
  providers: [
    {
      provide: "MyAppService",
      useClass: AppService,
    },
  ],
})
export class AppModule {}
```

```ts [@/emp/entities/emp.entity.ts]
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Emp {
  // 自增主键
  @PrimaryGeneratedColumn()
  id: number;

  // 索引
  @Generated("uuid")
  @Index()
  uuid: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  username: string;

  @Column({ select: false })
  password: string;

  // 0 as female, 1 as male, 2 as unknown
  @Column({
    type: "enum",
    enum: [0, 1, 2],
    default: 2,
    comment: "0 as female, 1 as male, 2 as unknown",
  })
  gender: number;

  @Column("simple-array")
  // 使用 roles.join(',') 持久化到数据库
  roles: string[];

  @Column("simple-json")
  // 使用 JSON.stringify(user) 持久化到数据库
  userInfo: { name: string; age: number };

  @CreateDateColumn({ type: "timestamp" })
  createTime: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateTime: Date;
}
```

:::
