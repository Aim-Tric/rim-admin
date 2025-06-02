import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { DynamicRouter } from '@/plugins/dynamic-router/DynamicRouter'
import { withCache } from '@/plugins/dynamic-router/RouteCache'
import type { AuthProvider, IDynamicRouter } from '@/plugins/dynamic-router/types'
import { inject } from 'vue'
import type { Emitter } from 'mitt'

import { useUserStore } from '@/stores/user'
import type { Menu } from '@/types/rim'

const baseRouter = createRouter({
  history: createWebHistory(),
  routes: []
})


// 配置认证状态提供器
const authProvider: AuthProvider = {
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
  },
  onAuthFailed: (router) => {
    router.getNavigator().naviTo('/login')
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

const buildRoutes = (menus: Menu[]): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = []

  for(let i = 0; i < menus.length; i++) {

  }

  return []
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
      path: '/no-permission',
      name: 'NoPermission',
      component: () => import('@/views/NoPermission.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('@/views/Error.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/:catchAll(.*)',
      component: () => import('@/views/NotFound.vue'),
      meta: { requiresAuth: false }
    }
  ],
  routeLoader: withCache(async () => {
    const { loadUserInfo } = useUserStore()
    const userInfo = await loadUserInfo()
    if (userInfo == undefined) {
      return []
    }
    const menus = userInfo.menus!!
    return buildRoutes(menus)
  }, { ttl: 60000 }),
  authProvider,
  errorHandler: (router, err) => {
    router.getNavigator().naviTo("/error")
  },
  eventBusProvider
})

export default dynamicRouter
