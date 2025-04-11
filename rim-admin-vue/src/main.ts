import { createApp } from 'vue'
import App from './App.vue'
import emmiter from './plugins/mitt-vue'
import dynamicRouter from './router'

// 判断是否需要使用 mock
if (import.meta.env.NODE_ENV === 'development') {
  import('./mock')
}

const app = createApp(App)

app.use(emmiter)
app.use(dynamicRouter)
app.mount('#app')