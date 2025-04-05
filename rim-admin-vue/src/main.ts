import { createApp } from 'vue'
import App from './App.vue'
import emmiter from './plugins/mitt-vue'
import dynamicRouter from './router'

const app = createApp(App)

app.use(emmiter)
app.use(dynamicRouter)
app.mount('#app')