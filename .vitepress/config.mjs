import {defineConfig} from 'vitepress'
import {generateSidebar, withSidebar} from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
    base:'/simple/',
    title: "Simple的小站",
    description: "ProsperousEnding's Simple Co deSpace",
    themeConfig: {
        head: [["link", { rel: "icon", href: "/logo.svg" }]],
        logo: '/logo.svg',
        outline: [2, 6],
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            {text: 'Examples', link: '/markdown-examples'},
            {text: 'cnblogs', link: 'https://www.cnblogs.com/ProsperousEnding'},
        ],

        sidebar: [generateSidebar(
            {
                text: 'Examples',
                items: [
                    {text: 'Markdown Examples', link: '/markdown-examples'},
                    {text: 'Runtime API Examples', link: '/api-examples'}
                ]
            }
        ),],

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
    documentRootPath: '/',
    collapsed: false,
    capitalizeFirst: true
};

export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions))
