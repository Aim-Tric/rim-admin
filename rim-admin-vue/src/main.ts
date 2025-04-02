import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { DynamicRoutes } from './plugins/dynamic-router/DynamicRoutes'
import { withCache } from './plugins/dynamic-router//RouteCache'


const app = createApp(App)

const baseRouter = createRouter({
    history: createWebHistory(),
    routes: []
})

// 配置认证状态提供器
const authProvider = {
    isAuthenticated: () => !!localStorage.getItem('token'),
    waitAuthReady: () => {
        return new Promise<boolean>(resolve => {
            const check = () => {
                if (localStorage.getItem('token')) resolve(true)
            }
            window.addEventListener('auth-change', check)
        })
    }
}
const dynamicPlugin = new DynamicRoutes(baseRouter, {
    defaultRoutes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('./views/Login.vue'),
            meta: { requiresAuth: false }
        },
        {
            path: '/:catchAll(.*)',
            component: () => import('./views/NotFound.vue'),
            meta: { skipAuthCheck: true }
        }
    ],
    routeLoader: withCache(async () => {
        
        return []
    }, { ttl: 60000 }),
    authProvider,
    errorHandler: (err) => {
        console.error('Route loading error:', err)
        alert('Failed to load application routes')
    }
})

app.use(dynamicPlugin)
app.use(baseRouter)
app.mount('#app')