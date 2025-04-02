## 输入 URL 回车到页面加载完成, 发生了什么

1. 判断地址栏 (调试地址栏: chrome://omnibox) 内容是搜索关键字, 还是请求 URL; 如果是搜索关键字, 则组合为携带搜索关键字的新 URL, 使用默认的搜索引擎; 如果是请求 URL, 则加上 `https://` 协议字段, 组合为新 URL
2. beforeunload 事件, 用户回车后, 会触发 beforeunload 事件, beforeunload 事件允许页面卸载前执行数据清理等操作, 也可以询问用户是否离开当前页面, 用户可以通过 beforeunload 事件取消导航 (页面跳转)
3. 浏览器进入**加载状态**, 表现为标签页上的加载图标, 但页面未被替换, 需要等待**提交文档阶段**, 页面才被替换
4. 浏览器渲染进程通过进程间通信 (IPC) 将请求 URL 发送给网络进程
5. 网络进程先检查本地缓存是否缓存了请求资源, 如果有缓存, 则直接返回请求资源给浏览器进程 (**强制缓存**), 如果没有缓存, 则发送网络请求
6. DNS 解析: 对 URL 进行 DNS 解析, 以获取服务器 IP 地址和端口号; HTTP 的默认端口号是 80, HTTPS 默认端口号是 443, 如果是 HTTPS 协议, 还需要建立 TLS 或 SSL 连接
7. 建立 TCP 连接: 进入 TCP 队列, 通过三次握手与服务器建立连接 (进入 TCP 队列: chrome 限制一个域名最多同时建立 6 个 TCP 连接, 如果一个域名同时有 10 个请求, 那么有 4 个请求会排队等待)
8. 浏览器发送 HTTP 请求: 浏览器生成请求行 (get/push/... 请求方法, URL, 协议), 请求头, 请求体等, 并将 cookie 等数据附加到请求头中, 发送 HTTP 请求给服务器
   - RESTful: get, post, put, delete, patch, ...
   - 应用层: 加 HTTP 头部, 包括请求方法, URL, 协议等
   - 传输层: 加 TCP 头部, 包括源端口号, 目的端口号等
   - 网络层: 加 IP 头部, 包括源 IP 地址, 目的 IP 地址等
9. 服务器收到 HTTP 请求: 服务器生成响应行, 响应头, 响应体等, 发送 HTTP 响应给浏览器网络进程
   1. 服务器网络层解析出 IP 头部, 将数据包向上交付给传输层
   2. 服务器传输层解析出 TCP 头部, 将数据包向上交付给应用层
   3. 服务器应用层解析出请求头和请求体
   - 如果需要重定向, 则直接返回 301 或 302 状态码, 同时在响应头的 `Location` 字段中指定重定向地址, 浏览器根据状态码和 `Location` 字段进行重定向操作
   - 如果不需要重定向, 服务器根据请求头中的 `if not match` 字段值判断请求资源是否被更新 (**协商缓存**), 如果没有更新, 则返回 304 状态码, 不返回请求资源; 如果有更新, 则同时返回 200 状态码和请求资源
   - 如果希望使用强缓存, 则设置响应头字段 `Cache-Control: Max-age=2000`, 例如 nginx 配置文件 `add_header Cache-Control "public, immutable";` 对应的响应头字段 `Cache-Control: public, immutable`
   4. 关于**是否断开连接**: 数据传输完成, TCP 四次挥手断开连接, 如果浏览器或服务器在 HTTP 头部设置 `Connection: Keep-Alive` 字段, 则会建立持久的 TCP 连接, 节约下一次 HTTP 请求时建立连接的时间, 提高资源加载速度
   5. 关于**重定向**: 浏览器收到服务器返回的响应头后, 网络进程解析响应头, 如果状态码是 301 或 302, 则网络进程获取响应头的 `Location` 字段值 (重定向的地址), 发送新的 HTTP/HTTPS 请求
   6. 关于**响应数据类型**: 浏览器根据 HTTP 响应头的 `Content-Type` 字段值判断响应数据类型, 并根据响应数据类型决定如何处理响应体; 如果 `Content-Type` 字段值是下载类型: `Content-Type: application/octet-stream`, 则提交给浏览器的下载管理器, 同时该 URL 请求的导航 (页面跳转) 结束, 如果 `Content-Type` 字段值是 HTML 类型: `Content-Type: text/html; charset=utf-8`, 则网络进程通知浏览器进程分配一个渲染进程进行页面渲染
10. 分配渲染进程: 浏览器进程检查新 URL 和已打开 URL 的域名是否相同, 如果相同则复用已有的渲染进程, 如果不同则创建新的渲染进程
11. 提交文档阶段: 浏览器发送 `提交文档` 消息给渲染进程, 渲染进程收到消息后, 和网络进程建立数据传输的管道, 文档数据传输完成后, 渲染进程返回 `确认提交` 消息给浏览器进程, `提交文档` 后, 开始解析 DOM, 解析 CSS, 生成渲染树, 绘制并显示页面等
12. 更新浏览器状态: 浏览器进程收到 `确认提交` 消息后, 更新浏览器状态: 包括安全状态, 地址栏的 URL, 前进后退的历史状态, 并更新页面, 此时页面是空白页
13. 渲染文档: 渲染进程解析文档, 加载子资源; HTML 转换为 DOM 树, CSS 转换为 CSSOM 树, DOM 树和 CSSOM 树合并为渲染树; 根据布局, 计算每个节点的位置, 宽高 (**回流**相关), 颜色 (**重绘**相关) 等; 绘制并显示页面

## HTTP 超文本传输协议

HTTP: C/S 模型, 基于 TCP/IP, 是无状态协议 (两次请求间, 服务器不会保存任何数据)

### HTTP/1.1

- HTTP/1.0 是短连接, 每次 HTTP 请求都需要: 建立 TCP 连接, 传输数据和断开 TCP 连接 3 个阶段; HTTP/1.1 新增**持久连接**, 特点是一个 TCP 连接上可以发送多次 HTTP 请求, 只要浏览器或服务器没有明确断开连接, 该 TCP 连接就会一直保持; HTTP/1.1 中持久连接默认开启, 如果不想使用持久连接, 可以在 HTTP 请求头中设置 `Connection: Close` 字段
- chrome 限制同一个域名最多同时建立 6 个 TCP 连接
- 使用 CDN 内容分发网络实现[域名分段](https://developer.mozilla.org/zh-CN/docs/Glossary/Domain_sharding)
- 不成熟的 HTTP 管线化: HTTP/1.1 的**管线化**是指将多个 HTTP 请求批量发送给服务器, 虽然可以批量发送请求, 但是服务器仍需要根据请求顺序依次响应; TCP 持久连接虽然可以减少连接建立和断开的次数, 但是需要等待当前请求完成后, 才能发送下一个请求; 如果 TCP 通道中某个请求没有及时完成, 则会阻塞后续所有请求 (**队头阻塞问题**),
- **支持虚拟主机**: HTTP/1.0 中, 一个域名绑定一个唯一的 IP 地址, 一个服务器只能绑定一个域名; 随着虚拟主机技术的发展, 一个物理主机可以虚拟化为多个虚拟主机, 每个虚拟主机有单独的域名, 这些虚拟主机 (域名) 公用同一个 IP 地址; HTTP/1.1 的请求头中增加了 `Host` 字段, 表示域名 URL 地址, 服务器可以根据不同的 `Host` 字段, 进行不同的处理
- 支持动态大小的响应数据: HTTP/1.0 中, 需要在响应头中指定传输数据的大小, 例如 `Content-Length: 1024`, 这样浏览器可以根据指定的传输数据大小接收数据; 随着服务器技术的发展, 很多页面内容是动态生成的, 数据传输时不清楚传输数据的大小, 导致浏览器不清楚是否已接收完所有的数据, HTTP/1.1通过引入 **Chunk Transfer 分块传输机制**解决该问题, 服务器将传输数据分割为若干个任意大小的数据块, 每个数据块发送时, 附加上一个数据块的长度, 最后使用一个 0 长度的数据块作为数据发送结束的标志, 提供对动态大小的响应数据的支持
- **客户端 cookie, 安全机制**: HTTP/1.1 还引入了客户端 cookie 和安全机制

### HTTP/2.0

HTTP/1.1 对带宽的利用率不理想, 原因如下:

1. TCP 的慢启动: TCP 建立连接后开始发送数据, TCP 先使用较慢的发送速率, 并逐渐增加发送速率, 以探测网络带宽 (合适的发送速率), 直到稳态 (拥塞避免状态); CUBIC 仍使用慢启动, BBR 不使用慢启动, 通过主动测量瓶颈带宽 Bottleneck Bandwidth 和最小 RTT 以动态调整发送速率; 慢启动导致页面首次渲染时间增加
2. 同时建立多条 TCP 连接时, 这些连接会竞争带宽, 影响关键资源的加载速度
3. HTTP/1.1 队头阻塞问题: HTTP/1.1 使用持久连接, 虽然多个 HTTP 请求可以公用一个 TCP 管道, 但是同一时刻只能处理一个请求, 当前请求完成前, 后续请求只能阻塞; 例如某个请求耗时 5s, 则后续所有请求都需要排队等待 5s
4. 协议开销大: header 携带的内容过多, 且不能压缩, 增加了传输成本

HTTP/2.0 实现思路: 一个域名只使用一个 TCP 长连接传输数据, 整个页面资源的加载只需要一次 TCP 慢启动, 同时避免了多个 TCP 连接竞争带宽的问题; HTTP/2.0 实现了资源的并行请求, 可以发送请求给服务器, 而不需要等待其他请求完成;

1. **HTTP 多路复用技术, 引入二进制分帧层, 并行处理请求**, 浏览器的请求数据包括请求行, 请求头, 如果是 POST 方法, 还包括请求体; 请求数据传递给二进制分帧层后, 转换为若干个带有请求 ID 编号的帧, 通过 TCP/IP 协议栈发送给服务器, 服务器收到请求帧后, 将所有 ID 相同的帧合并为一个完整的请求, 并处理该请求; 类似的, 服务器的二进制分帧层将响应数据转换为若干个带有响应 ID 编号的帧, 通过 TCP/IP 协议栈发送给浏览器, 浏览器收到响应帧后, 将所有 ID 相同的帧合并为一个完整的响应
2. **请求优先级**: HTTP/2.0 支持请求优先级, 发送请求时, 标记该请求的优先级, 服务器收到请求后, 优先处理优先级高的请求
3. **服务器推送**: HTTP/2.0 服务器推送 (Server Push) 允许客户端请求某个资源 (例如 index.html) 时, 服务器推送其他资源 (例如 style.css, main.js), 不需要客户端再次请求; 可以提高页面加载速度
4. **头部压缩**: HTTP/2.0 对请求头和响应头进行 (gzip) 压缩
5. 可重置: HTTP/2.0 可以在不中断 TCP 连接的前提下, 取消当前的请求或响应

### HTTP/3.0

1. 随着丢包率的增加, HTTP/2.0 的传输效率降低, 2% 丢包率时, HTTP/2.0 的传输效率可能低于 HTTP/1.1
2. TCP 三次握手, TLS 一次握手, 浪费 3 到 4 个 RTT

HTTP/3.0 (QUIC, Quick UDP Internet Connection) 基于 UDP, 实现类似 TCP 的多路数据流, 可靠传输等特性

### 网络模型

- OSI 七层模型: 应用层, 表示层, 会话层, 传输层, 网络层, 数据链路层, 物理层
- TCP/IP 五层模型: 应用层, 传输层, 网络层, 数据链路层, 物理层
- 常见端口号
  - 22: SSH
  - 53: DNS
  - 80: HTTP
  - 443: HTTPS
  - 3306: MySQL
  - 5173: Vite 服务器
  - 5432: PostgreSQL
  - 6379: Redis
  - 8080: Webpack 服务器
  - 8888: Nginx
  - 9200: ElasticSearch
  - 27017 MongoDB

## 浏览器缓存

浏览器缓存, 也称为客户端缓存; 浏览器缓存分为强缓存和协商缓存, 强缓存的优先级高于协商缓存

HTTP 缓存是保存资源副本的技术, 复用资源, 减少等待时间, 提高页面性能, 减少网络流量, 降低服务器压力; 浏览器或服务器判断请求的资源已被缓存时, 直接返回; HTTP 缓存分为私有缓存 (浏览器缓存) 和代理缓存 (共享缓存)

### 强缓存

强缓存命中时, 不会发送请求到服务器, 直接从客户端缓存中获取资源, 返回状态码 200(from memory|disk cache), 强缓存使用 `Cache-Control` 和 `Expires` 两个字段, `Cache-Control` 的优先级高于 `Expires`

- Cache-Control: max-age=161043261
- Expires: Mon Jan 01 2025 04:32:51 GMT+0800 (GMT+8:00)

### 协商缓存 (对比缓存)

协商缓存会发送请求到服务器, 服务器根据请求头的 `Last-Modified/If-Modified-Since` 和 `ETag/If-None-Match` 两对字段判断协商缓存是否命中, `If-None-Match/ETag` 的优先级高于 `If-Modified-Since/Last-Modified`, 如果命中, 服务器返回 304 Not Modified, 响应体为空; 如果未命中, 服务器返回 200 OK, 响应体中携带更新的资源

- 先试图命中强缓存, 再试图命中协商缓存
- 强缓存和协商缓存的相同点: 如果命中, 都从客户端缓存中加载资源
- 强缓存和协商缓存的不同点: 强缓存不会发送请求到服务器, 协商缓存会发送请求到服务器

## TCP

- TCP 是面向连接的, 可靠的, 基于字节流的传输层协议
- UDP 是无连接的, 不可靠的, 基于数据报的传输层协议

1. 数据分段: 数据在发送端分段, 在接收端重组, TCP 确定分段的大小, 控制分段和重组
2. 到达确认: 接收端收到分段后, 返回发送端一个确认, 确认号等于分段序号 +1
3. 流量控制, 拥塞控制

- 发送端的发送窗口
- 接收端的接收窗口

4. 失序处理: TCP 对收到的分段排序
5. 重复处理: TCP 丢弃重复的分段
6. 数据校验: TCP 使用首部校验和, 丢弃错误的分段

## 三次握手常见问题

1. 为什么要三次握手, 两次握手不可以吗

两次握手是最基本的; 三次握手中, 客户端向服务器握手两次, 可以防止已失效的连接请求发送到服务器, 导致服务器资源的浪费

2. 如果连接已建立, 客户端突然故障了怎么办

TCP 有一个保活计时器 (通常是 2h), 服务器每次收到客户端的请求后, 都会重置保活计时器; 如果 2h 内未收到客户端的请求, 服务器会每隔 75s 发送一个探测包, 如果连续发送 10 个探测包后仍未收到客户端的响应, 则服务器判断客户端故障, 关闭 TCP 连接

## 四次挥手常见问题

1. 为什么建立连接握手三次, 而断开连接挥手四次

建立连接时, 第二次握手时, 服务器将 ACK 和 SYN 合并发送给客户端, 可以少一次握手

断开连接时, 第一次挥手时, 服务器收到客户端的 FIN=1, 仅表示客户端不再发送数据, 但仍可以接收数据; 第二次挥手时, 服务器可能有剩余数据未发送, 需要 FIN_WAIT_2 发送剩余数据和第三次挥手, 通知客户端剩余数据发送完, 服务器将 ACK 和 FIN 分开发送给客户端

2. 为什么客户端最后需要等待 TIME-WAIT (2MSL)
   1. MSL, Maximum Segment Lifetime 最大分段寿命, 是一个 TCP 包在网络中最长存活时间, 不是固定值
   2. 第三次挥手时, 服务器发送 ACK=FIN=1 (可能丢失), 希望收到客户端的响应 ACK
   3. 第三次挥手后, 客户端收到服务器发送的 ACK=FIN=1, 返回一个没有数据的响应 ACK (也可能丢失)
   4. 服务器一个 MSL 后, 没有收到客户端的响应 ACK, 则会重新发送一次 ACK=FIN=1, 客户端可以在 2MSL 内收到服务器重新发送的 ACK=FIN=1; 客户端收到服务器重新发送的 ACK=FIN=1 后, 重置 2MSL 计时器

## TCP, UDP 对比

| TCP                | UDP                            |
| ------------------ | ------------------------------ |
| 面向连接           | 无连接                         |
| 点对点             | 一对一, 一对多, 多对一, 多对多 |
| 字节流             | 数据报                         |
| 有序               | 无序                           |
| 流量控制, 拥塞控制 | 无                             |
| 可靠               | 不可靠                         |
| 慢                 | 快                             |

## WebSocket

WebSocket 前, 如果需要在服务器和客户端间双向通信, 则需要使用 HTTP 轮询实现, HTTP 轮询分为轮询和长轮询

轮询指浏览器使用 JavaScript 启动一个定时器, 以固定的间隔向服务器发送请求, 询问服务器有没有新消息, 缺点: 实时性差, 频繁的请求会增大服务器的压力

长轮询是指浏览器发送请求时, 服务器保持连接, 等到有新消息时才返回, 提高了实时性, 缺点:

1. 多线程服务器大部分线程等待新消息, 大部分时间挂起, CPU 资源浪费
2. 一个长时间没有数据传输的 HTTP 连接, 链路上的任何一个网关都可能关闭该 HTTP 连接, 这是不可控的

HTML5 新增 WebSocket 协议, 可以在浏览器和服务器间建立不受限制的双向通信的通道

HTTP 判断 header 中是否包含 `Connection: Upgrade` 和 `Upgrade: websocket`, 以判断是否升级到 WebSocket 协议, 其他 header 字段

- `Sec-WebSocket-Key`: 浏览器随机生成的安全密钥
- `Sec-WebSocket-Version`: WebSocket 协议版本
- `Sec-WebSocket-Extensions`: 协商 WebSocket 连接使用的扩展
- `Sec-WebSocket-Protocol`: 协商 WebSocket 连接使用的子协议

## WebSocket 特点

- 支持双向通信, 实时性高
- 可以发送文本和二进制数据
- 未加密的 WebSocket 协议标识符是 `ws://`, 端口号是 80, 对应 `http://`; 加密的 WebSocket 协议标识符是 `wss://`, 端口号是 443, 对应 `https://`
- 协议开销小, HTTP 每次通信都需要携带完整的 HTTP 头部, WebSocket 协议的头部较小, 减小了数据传输的开销
- 支持扩展: 用户可以扩展 WebSocket 协议, 也可以自定义子协议 (例如可以自定义压缩算法等)
- 没有跨域问题

## SSE, Server-Sent Events

SSE 是基于 HTTP 的服务器推送技术, 允许服务器主动向客户端推送实时数据

### SSE 工作原理

1. 客户端连接: 客户端使用 `window.EventSource` 创建 EventSource 对象, 指定服务器的 URL, 与服务器建立持久化的 HTTP 长连接 (使用 HTTP/HTTPS, 不需要升级协议, 请求头中包含 `Accept: text/event-stream` 指定事件流格式)
2. 服务器推送: 服务器设置 HTTP 响应头 `Content-Type: text/event-stream`, 向客户端推送事件, 每条事件包含 `event:` 事件名 `data:` 事件数据和 `id:` 事件 ID 等, 以 `\n\n` 分隔多条事件
3. 客户端接收: 客户端使用 onmessage 或 addEventListener 监听事件, 收到事件后, 触发对应的事件处理器, 处理事件数据
4. 连接关闭: 客户端关闭 EventSource 对象, 关闭与服务器的 HTTP 长连接

- SSE 特点: SSE 适用于服务器向客户端单向推送实时数据的场景
- 对比 SSE 和 WebSocket: SSE 更简单, 更轻量, 性能更好, 但 SSE 只支持服务器到客户端的单向数据流, WebSocket 支持全双工通信

## HTTP 报文

HTTP 报文分为请求报文和响应报文

- 请求报文: 请求行, 请求头, 请求体
- 响应报文: 响应行 (状态行), 响应头, 响应体

### 请求报文

- 请求行: HTTP 请求报文的第一行, 包含请求方法 (GET, POST, PUT, DELETE, HEAD, OPTIONS, PATCH, CONNECT, TRACE), 请求 URL 和 HTTP 版本
- 请求头部的字段:
  - Accept 客户端支持的媒体类型, 例如 application/json, text/plain, text/html 等
  - Accept-Encoding 客户端支持的编码, 例如 gzip 等
  - Accept-Language 客户端偏好的语言
  - Expect 期望服务器的行为
  - If-Modified-Since 字段值时间戳; 询问服务器指定时间戳后, 资源是否有修改
  - If-None-Match 字段值是 etag 版本号, 询问服务器 etag 版本号是否有更新, 即资源是否有修改
  - Authorization 字段值是 token
  - cookie
  - Host 请求的主机名和端口号
  - Range 请求实体的字节范围, 用于范围请求 (分块传输, 断点续传)
  - Referer 请求的源页面的 URL
  - User-Agent 用户代理, 即使用的浏览器和操作系统
  - Origin 预检请求或实际请求的源主机
  - Access-Control-Request-Method 用于预检请求, 告诉浏览器实际请求使用的请求方法
  - Access-Control-Request-Headers 用于预检请求, 告诉浏览器实际请求的请求头字段
  - Connection 当前会话结束后, 是否关闭 HTTP 连接, 例如 Close (关闭), Keep-Alive (持久连接, 不关闭)
  - Cache-Control 缓存控制
  - Content-Length 请求体的长度
  - Content-Type 请求体的媒体类型
  - Via 代理服务器设置的请求头/响应头字段, 适用于正向/反向代理, 记录中间节点

### 响应报文

- Access-Control-Allow-Credentials 告诉浏览器, 服务器是否允许跨域请求携带凭据, 凭据包括 cookie, TLS 客户端证书等, 默认不允许跨域请求携带凭据, 以防止跨站请求伪造攻击
- Access-Control-Expose-Headers `xhr.getResponseHeader()` 获取响应头字段, 默认跨域响应仅暴露 CORS 白名单中的响应头字段, 可以在跨域响应的 Access-Control-Expose-Headers 响应头字段中, 指定暴露的其他响应头字段
- Access-Control-Allow-Methods 用于响应预检请求, 指定实际请求允许使用的请求方法
- Access-Control-Allow-Origin 指定允许 (跨域) 资源共享的源站
- Access-Control-Allow-Headers 用于响应预检请求, 指定实际请求允许使用的请求头字段
- Access-Control-Max-Age 指定缓存预检请求的响应头字段 Access-Control-Allow-Methods 和 Access-Control-Allow-Headers 的有效期, 单位是秒; 有效期内, 浏览器可以直接发送复杂请求的跨域请求, 不需要先发送预检请求
- Age 对象在代理缓存中停留的时间
- Allow 服务器响应状态码为 405 Method Not Allowed 时, 必须携带 Allow 响应头字段, 表示服务器允许哪些请求方法
- Content-Disposition 指定响应体以网页, 或以网页的一部分, 或以附件的形式下载到本地
- Content-Encoding 响应体的编码
- Content-Language 响应体的偏好语言
- Content-Length 响应体的长度
- Content-Location 请求的资源的 URL
- Location 3xx 重定向的 URL, 或 201 Created 新创建的资源的 URL
- Content-Range 响应体在整个资源中的字节范围
- Content-Type 响应体的媒体类型
- Accept-Ranges 表示服务器支持范围请求 (分块传输, 断点续传)
- Vary 使用内容协商时, 创建缓存键
- Set-cookie 用于服务器将 cookie 发送到 User-Agent 用户代理, 用户代理在后续的请求中, 可以将 cookie 发送回服务器, 可以在一个响应中, 设置多个 Set-cookie 字段以发送多个 cookie
- WWW-Authentication 定义 HTTP 身份验证方法: 质询, 用于获取资源的访问权限
- ETag 资源的版本号, 资源更新时, 必须生成新的 ETag 值
- Expires 资源的过期时间, 无效的日期 (例如 0) 也表示资源已过期
- Last-Modified 资源的上一次修改时间
- Date 消息创建的日期, 时间

## HTTP 状态码

### 1XX Informational 信息响应

100 Continue 客户端应该继续请求, 如果请求已完成则忽略

### 2XX Success 成功响应

- 200 OK 请求成功
- 204 No Content 请求成功, 响应体为空
- 206 Partial Content 范围请求成功 (分块传输, 断点续传)

### 3XX Redirection 重定向响应

- 301 Moved Permanently 永久重定向, 请求的资源永久移动到 Location 头部指定的 URL,
- 302 Found 临时重定向, 请求的资源临时移动到 Location 头部指定的 URL
- 303 See Other 指定请求重定向的页面时, 必须使用 GET 方法
- 304 Not Modified 协商缓存
  - 请求强缓存的资源, 不会请求服务器
  - 请求协商缓存的资源, 仍会请求服务器
- 307 Temporary Redirect 临时重定向, 请求的资源临时移动到 Location 头部指定的 URL, 不允许将 POST 请求重定向为 GET 请求
- 308 Permanent Redirect 永久重定向, 请求的资源永久移动到 Location 头部指定的 URL, 不允许将 POST 请求重定向为 GET 请求

### 4XX Client Error 客户端错误响应

- 400 Bad Request 客户端错误
- 401 Unauthorized 客户端没有身份验证凭证, 无权访问资源
- 403 Forbidden 客户端 (可能) 有身份验证凭证, 但服务器拒绝客户端访问资源
- 404 NOT Found 请求的资源不存在 (可能临时丢失或永久丢失)
- 405 Method Not Allowed 客户端使用的请求方法不被允许
- 408 Request Timeout 服务器决定关闭空闲连接, 而不是继续等待新请求
- 410 Gone 请求的资源已永久丢失

### 5XX Server Error 服务器端错误响应

- 500 Internal Server Error 泛指服务器端错误
- 502 Bad Gateway 作为网关或代理的服务器, 从上游服务器接收到无效的响应
- 503 Service Unavailable 服务器暂时无法处理请求, 可能是停机维护或过载
- 504 Gateway Timeout 作为网关或代理的服务器, 从上游服务器接收的响应超时

## 幂等和安全

- 安全: 无副作用, 例如 GET 安全, POST, PUT, DELETE 不安全
- 幂等: 请求一次和连续请求多次, 结果相同, 例如 GET, PUT, DELETE 幂等, POST 非幂等

## RESTful

- GET 类比 Map.prototype.get, MySQL `SELECT`, 安全, 幂等
- POST 类比 Array.prototype.push, MySQL `CREATE`, 不安全, 非幂等
- PUT/PATCH 类比 Map.prototype.set, MySQL `UPDATE`, 不安全, 幂等
- DELETE 类比 Map.prototype.delete, MySQL `DELETE`, 不安全, 幂等
- OPTIONS, CONNECT, HEAD, PATCH, TRACE

## 简单请求/复杂请求, 预检请求

### 简单请求

- 请求方法是 GET/POST/HEAD (HTTP/1.0 提出的 3 种请求方法)
- POST 请求的 Content-Type 是 application/x-www-form-urlencoded, multipart/form-data 或 text/plain
- 请求头没有自定义字段

### 复杂请求

- 请求方法不是 GET/POST/HEAD
- POST 请求的 Content-Type 不是 application/x-www-form-urlencoded, multipart/form-data 或 text/plain
- 请求头有自定义字段

每次发送复杂请求的跨域请求前, 都会先发送 OPTIONS 预检请求, 询问服务器是否允许跨域请求等; 优化方案

1. 全部使用简单请求
2. 服务器设置 Access-Control-Max-Age 指定缓存预检请求的响应头字段 Access-Control-Allow-Methods 和 Access-Control-Allow-Headers 的有效期, 单位是秒; 有效期内, 浏览器可以直接发送复杂请求的跨域请求, 不需要先发送 OPTIONS 预检请求

## GET 和 POST 的区别

|                | GET                                             | POST                                                                                               |
| -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 传输长度       | 有 URL 长度限制, 例如 64KB                      | 没有限制                                                                                           |
| 参数的传输方式 | 请求行明文传输 (URL 查询字符串)                 | 请求体传输 (例如 JSON, 表单)                                                                       |
| 场景           | 查询 (幂等)                                     | 增删改 (非幂等)                                                                                    |
| 数据包数量     | 1 个数据包, 浏览器一并发送请求头和请求体        | 可能有 2 个数据包, 浏览器先发送请求头, 服务器响应 100 Continue后, 浏览器再发送请求体, 耗时可能更长 |
| 缓存           | GET 请求的响应默认可以缓存                      | POST 请求的响应默认不缓存                                                                          |
| 历史记录       | 完整保留 GET 请求的历史记录, 包括 URL, 查询参数 | 不会保留 POST 请求的历史记录                                                                       |
| 参数类型       | 只支持 ASCII 字符                               | 无限制                                                                                             |
| 编码           | 只支持 URL 编码                                 | 无限制                                                                                             |

> [!important]
> 浏览器存储: cookie, webStorage (localStorage, sessionStorage), IndexedDB

## cookie

HTTP 是无状态协议, cookie 以键值对的形式存储状态, 每次向同一个域名发送请求时, 都会携带 cookie

### cookie 缺点:

1. cookie 的大小限制 4KB
2. 不管同一个域名下的某地址是否需要 cookie, 每次请求时请求头上都会携带 cookie, 增大网络流量
3. cookie 不安全, 可能被攻击者截获
4. cookie 的 API 不友好

### cookie 参数

- key: 键名
- value: 键值
- expires: 过期时间, cookie 过期浏览器自动删除; 可以设置过去的时间以手动删除 cookie, 如果不设置过期时间, 则 cookie 有效期是会话期
- path: 指定哪些 URL 路径可以携带该 cookie 发送回服务器, 设置 path 属性 `document.cookie = "key=value;path=/"`, 表示所有路径都可以可以携带该 cookie 发送回服务器; 设置 path 属性 `document.cookie = "key=value;path=/ys"`, 表示只有 /ys 路径和子路径可以携带该 cookie 发送回服务器
- domain 域名, `https://ys.mihoyo.com/` 和 `https://sr.mihoyo.com/` 是同一个域名下的不同子域名, 默认一个主机不允许访问另一个主机派发的 cookie, 可以设置 domain 属性 `document.cookie = "key=value;domain=.mihoyo.com"`, 允许 \*.mihoyo.com 域名下的所有主机访问派发的 cookie
- secure: secure=true 时, 只有使用 HTTPS 的 cookie 才会上传到服务器, 使用 HTTP 的 cookie 不会上传到服务器
- httponly: httponly=true 时, 服务器可以通过 Set-cookie 响应头字段设置 cookie, 客户端 JS 不能读写 cookie; 以防止 XSS 攻击截获 cookie

## webStorage (localStorage, sessionStorage)

- localStorage: 以键值对的形式存储, 不会过期, 每个域名限制 5M, 同一个域名的所有页面共享 localStorage, `https://ys.mihoyo.com/` 和 `https://sr.mihoyo.com/` 是同一个域名下的不同子域名, 不共享 localStorage
- sessionStorage: 页面关闭后自动删除
- pinia, zustand: 页面刷新后自动删除

IndexedDB 是一个 KV 存储的非关系型数据库

> [!tip] 同源
> 同源: 协议, 域名 (包括子域名), 端口号都相同

### 对比

cookie, localStorage, sessionStorage 和 indexedDB 都是客户端存储技术

| cookie                                           | localStorage                      | sessionStorage     | IndexedDB    |
| ------------------------------------------------ | --------------------------------- | ------------------ | ------------ |
| HTTP                                             | HTML5                             | HTML5              | HTML5        |
| DOM                                              | BOM                               | BOM                | BOM          |
| 每次请求时请求头上都会携带 cookie                | 只在客户端存储                    | 同左               | 同左         |
| 4KB                                              | 5MB                               | 5MB                | 无限制       |
| 可以设置过期时间, 默认页面关闭后自动删除         | 不会过期                          | 页面关闭后自动删除 | 不会过期     |
| 同源窗口共享, 可以设置 domain 属性以跨子域名共享 | 同源窗口共享                      | 不共享             | 同源窗口共享 |
| 可以设置 httponly 属性, 以防止 XSS 攻击          | 只在客户端存储, 容易受到 XSS 攻击 | 同左               | 同左         |

### 客户端存储跨域

1. cookie 可以跨域, 服务器派发 cookie 时设置 domain 属性以跨子域名共享
