// https://vitepress.dev/guide/custom-theme
import {h} from 'vue'
import DefaultTheme from 'vitepress/theme'
import {useData} from "vitepress";
import MNavLinks from "./MNavLinks.vue";
import Confetti from "../components/Confetti.vue";

import './style/style.css'
import "./style/var.css";
import "./style/blur.css";

/** @type {import('vitepress').Theme} */
export default {
    extends: DefaultTheme,
    Layout: () => {
        const props = {}
        const {frontmatter} = useData()
        /* 添加自定义 class */
        if (frontmatter.value.layoutClass) {
            props.class = frontmatter.value.layoutClass
        }

        return h(DefaultTheme.Layout, props, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
        })
    },
    async enhanceApp({app, router, siteData}) {
        app.component('MNavLinks', MNavLinks)
        app.component("Confetti", Confetti); //注册全局组件

    }
}