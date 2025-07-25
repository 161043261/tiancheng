import { defineConfig } from "vitepress";
import sidebar from "./sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    lineNumbers: true,
  },
  title: "lovelove",
  titleTemplate: "lovelove", // 页面标题的后缀
  description: "lovelove",
  // 默认源目录等于项目根目录, favicon.ico 放在 /public 下
  // 如果指定源目录为 src, 则 favicon.ico 放在 /src/public 下
  head: [
    // favicon.ico
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  ],
  lang: "zh-CN",
  cleanUrls: true, // 删除 URL 中的 .html 后缀
  // 默认源目录等于项目根目录, 指定源目录为 src
  srcDir: "./src",
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: "local",
    },
    outline: [2, 3],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Homepage", link: "/" },
      { text: "网络", link: "/b/network2" },
      { text: "算法", link: "/b/algorithm" },
      { text: "React", link: "/t/react" },
      { text: "Vue", link: "/t/vue" },
    ],
    sidebar,
    socialLinks: [
      { icon: "github", link: "https://github.com/161043261" },
      { icon: "bilibili", link: "https://b23.tv/vCth43f" },
      { icon: "qq", link: "https://qm.qq.com/q/YDORema7As" },
      {
        icon: "linkedin",
        link: "https://www.linkedin.com/in/tiancheng-hang-bab533302/",
      },
      { icon: "twitter", link: "https://x.com/yukino161043261" },
      { icon: "youtube", link: "https://www.youtube.com/@yukino0228" },
    ],
  },
});
