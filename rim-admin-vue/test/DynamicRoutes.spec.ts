// tests/DynamicRoutes.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouter, createWebHistory, Router, RouteRecordRaw } from 'vue-router'
import { DynamicRoutes } from '../src/plugins/dynamic-router/DynamicRoutes'
import { PermissionFilter } from '../src/plugins/dynamic-router/types'

// 模拟基础路由配置
const mockBaseRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: { template: '<div>Login</div>' },
    meta: { requiresAuth: false }
  }
]

// 模拟API返回的路由数据
const mockRemoteRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: { template: '<div>Dashboard</div>' },
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: { template: '<div>Admin</div>' },
    meta: { permissionKey: 'admin' }
  }
]

// 模拟权限状态
const mockPermissions = new Set<string>(['user'])
const mockPermissionFilter: PermissionFilter = (routes) => {
  return routes.filter(route => {
    const key = route.meta?.permissionKey
    return !key || mockPermissions.has(key)
  })
}

describe('DynamicRoutesPlugin', () => {
  let router: Router
  let plugin: DynamicRoutes

  beforeEach(() => {
    // 创建带有记忆功能的路由实例
    router = createRouter({
      history: createWebHistory(),
      routes: [...mockBaseRoutes]
    })

    // 模拟认证状态
    const authProvider = {
        isAuthenticated: vi.fn(() => false), // 直接定义模拟实现
        waitAuthReady: vi.fn(() => new Promise<boolean>(resolve => {
          setTimeout(() => resolve(true), 10)
        }))
      }

    // 初始化插件
    plugin = new DynamicRoutes(router, {
      defaultRoutes: mockBaseRoutes,
      routeLoader: () => Promise.resolve(mockRemoteRoutes),
      permissionFilter: mockPermissionFilter,
      authProvider
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应正确加载默认路由', async () => {
    await router.isReady()
    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('Login')
  })

  it('应在认证后加载动态路由', async () => {
    await plugin.loadWithAuthCheck()
    const routes = router.getRoutes()
    
    expect(routes.some(route => 
        route.name === 'Dashboard' && route.meta.requiresAuth
      )).toBe(true)
  })

  it('应根据权限过滤路由', async () => {
    // 设置权限并加载
    mockPermissions.add('admin')
    await plugin.loadRoutes()
    
    const adminRoute = router.getRoutes().find(r => r.name === 'Admin')
    expect(adminRoute).toBeDefined()
  })

  it('应处理路由加载失败', async () => {
    const errorHandler = vi.fn()
    const errorPlugin = new DynamicRoutes(router, {
      routeLoader: () => Promise.reject(new Error('Network error')),
      errorHandler
    })

    await expect(errorPlugin.loadRoutes()).rejects.toThrow('Network error')
    expect(errorHandler).toHaveBeenCalled()
  })

  it('应正确恢复待处理的导航', async () => {
    // 模拟未登录状态尝试访问受限路由
    router.push('/dashboard')
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 验证是否跳转到登录页
    expect(router.currentRoute.value.path).toBe('/login')
    
    // 模拟登录成功
    window.dispatchEvent(new CustomEvent('auth-change', {
      detail: { isAuthenticated: true }
    }))
    
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('应跳过白名单路由的认证检查', async () => {
    // 添加公共路由
    router.addRoute({
      path: '/public',
      component: { template: '<div>Public</div>' },
      meta: { skipAuthCheck: true }
    })

    // 尝试访问公共路由
    await router.push('/public')
    expect(router.currentRoute.value.path).toBe('/public')
  })
})