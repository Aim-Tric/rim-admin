import { createRouter, createWebHistory } from 'vue-router'
import { DynamicRouter } from '@/plugins/dynamic-router/DynamicRouter'
import { withCache } from '@/plugins/dynamic-router//RouteCache'
import type { IDynamicRouter } from '@/plugins/dynamic-router/types'
import { inject } from 'vue'
import type { Emitter } from 'mitt'

const baseRouter = createRouter({
  history: createWebHistory(),
  routes: []
})


// 配置认证状态提供器
const authProvider = {
  isAuthenticated: () => !!localStorage.getItem('token'),
  waitAuthReady: (dynamicRouter: IDynamicRouter) => {
    return new Promise<boolean>(resolve => {
      const check = () => {
        if (localStorage.getItem('token')) {
          resolve(true)
          dynamicRouter.attachPendingNavigation()
        }
      }
      dynamicRouter.getEventBus().on('rim:auth-change', check)
    })
  },
  tryAutoLogin: () => {
    return Promise.resolve(false)
  }
}

// 配置事件总线提供器
const eventBusProvider = {
  getEventBus: () => {
    const emitter = inject<Emitter<Record<string, unknown>>>('emitter')!
    return {
      on: (event: string, callback: () => void) => {
        emitter.on(event, callback)
      },
      emit: (type: string, event: Record<string, unknown>) => {
        emitter.emit(type, event)
      }
    }
  }
}

const dynamicRouter = new DynamicRouter(baseRouter, {
  defaultRoutes: [
    {
      path: '/',
      name: 'Root',
      redirect: '/home',
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/NotFound.vue'),
      meta: { requiresAuth: false }
    }
  ],
  routeLoader: withCache(async () => {
    // 从服务器获取路由信息
    return []
  }, { ttl: 60000 }),
  authProvider,
  errorHandler: (err) => {
    console.error('Route loading error:', err)
    alert('Failed to load application routes')
  }
})

export default dynamicRouter
