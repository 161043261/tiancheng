import { defineConfig } from "vitepress";
import sidebar from "./sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    lineNumbers: true,
  },
  title: "Tiancheng",
  titleTemplate: "Tiancheng", // 页面标题的后缀
  description: "Tiancheng",
  // 默认源目录等于项目根目录, react.svg 放在源目录下的公共目录 public 下
  // 如果指定源目录为 src, 则 react.svg 放在源目录下的公共目录 src/public 下
  head: [
    // favicon.ico
    ["link", { rel: "icon", type: "image/svg+xml", href: "/offer.svg" }],
  ],
  lang: "zh-CN",
  cleanUrls: true, // 简洁的 URL: 删除 URL 中的 .html 后缀
  // 默认源目录等于项目根目录, 指定源目录为 src
  srcDir: "./src",
  lastUpdated: true,
  themeConfig: {
    outline: [2, 3],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Homepage", link: "/" },
      { text: "网络", link: "/b/network2" },
      { text: "算法", link: "/m/algorithm" },
      { text: "Vue3", link: "/t/d2vue" },
    ],
    sidebar: sidebar,
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
  transformHead({ assets }) {
    const Iosevka = assets.find((_file) => /Iosevka-Regular\.\w+\.woff2/)!;
    const IosevkaBold = assets.find((_file) => /Iosevka-Bold\.\w+\.woff2/)!;
    return [
      [
        "link",
        {
          rel: "preload",
          href: Iosevka,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
      [
        "link",
        {
          rel: "preload",
          href: IosevkaBold,
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
    ];
  },
});
