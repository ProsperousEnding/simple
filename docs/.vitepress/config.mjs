import {defineConfig} from 'vitepress'
import {generateSidebar, withSidebar} from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
    base:'/simple/',
    title: "Simple的小站",
    description: "ProsperousEnding's Simple Co deSpace",
    head: [["link", { rel: "icon", href: "/simple/logo.svg" }]],
    themeConfig: {
        logo: '/logo.svg',
        outline: {
            level: [2, 3],
            label: '目录'
        },
        aside: true,
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            {text: 'Examples', link: '/markdown-examples'},
            {text: 'About', link: '/about'},
            {text: 'cnblogs', link: 'https://www.cnblogs.com/ProsperousEnding'},
        ],

        socialLinks: [
            {icon: 'github', link: 'https://github.com/ProsperousEnding'}
        ],
        // 设置搜索框的样式
        search: {
            provider: "local",
            options: {
                translations: {
                    button: {
                        buttonText: "搜索文档",
                        buttonAriaLabel: "搜索文档",
                    },
                    modal: {
                        noResultsText: "无法找到相关结果",
                        resetButtonTitle: "清除查询条件",
                        footer: {
                            selectText: "选择",
                            navigateText: "切换",
                        },
                    },
                },
            },
        },
    },
}

const vitePressSidebarOptions = {
    // VitePress Sidebar's options here...
    documentRootPath: 'docs',
    useTitleFromFrontmatter: true,
    collapsed: false,
    capitalizeFirst: true,
    hyphenToSpace: true,
    includePath: true,
    rootGroupText: '目录',
};

export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions))
