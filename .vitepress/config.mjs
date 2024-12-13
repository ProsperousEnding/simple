import {defineConfig} from 'vitepress'
import {generateSidebar, withSidebar} from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressOptions = {
    title: "Simple的小站",
    description: "ProsperousEnding's Simple Co deSpace",
    themeConfig: {
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

    },

}
const vitePressSidebarOptions = {
    // VitePress Sidebar's options here...
    documentRootPath: '/',
    collapsed: false,
    capitalizeFirst: true
};

export default defineConfig(withSidebar(vitePressOptions, vitePressSidebarOptions))
