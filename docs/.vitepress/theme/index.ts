import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import Confetti from '../components/Confetti.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册组件
    app.component('Confetti', Confetti)
  }
} 