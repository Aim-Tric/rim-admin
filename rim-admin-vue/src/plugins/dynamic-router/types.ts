import type { RouteRecordRaw, NavigationGuardNext } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 是否需要权限校验（默认true） */
    requiresAuth?: boolean
    /** 自定义权限标识 */
    permissionKey?: string
  }
}

export interface Navigator {
  naviTo: (path: string) => void
  naviToLogin: (next: NavigationGuardNext) => void
  naviToNoPermission: (next: NavigationGuardNext) => void
  naviToError: (next: NavigationGuardNext) => void
}

export interface IDynamicRouter {
  attachPendingNavigation: () => void
  getEventBus: () => EventBus
  getNavigator: () => Navigator
}

export interface AuthProvider {
  /** 获取当前认证状态 */
  isAuthenticated: () => boolean
  /** 等待认证状态变化 */
  waitAuthReady: (dynamicRouter: IDynamicRouter) => Promise<boolean>
  /** 尝试自动登录 */
  tryAutoLogin: () => Promise<boolean>
  /** 调用自动登录失败后回调 */
  onAuthFailed: (dynamicRouter: IDynamicRouter) => void
}

export interface DynamicRouteOptions {
  /** 默认基础路由（在动态路由加载前生效） */
  defaultRoutes: RouteRecordRaw[];
  /** 认证状态提供器 */
  authProvider: AuthProvider
  /** 自定义导航器 */
  navigator?: Navigator
  /** 事件总线提供器 */
  eventBusProvider?: EventBusProvider
  /** 路由加载策略 */
  routeLoader?: RouteLoader
  /** 权限过滤策略 */
  permissionFilter?: PermissionFilter
  /** 路由加载前的回调 */
  beforeRouteLoad?: () => void
  /** 路由加载后的回调 */
  afterRouteLoad?: (routes: RouteRecordRaw[]) => void
  /** 路由加载失败处理策略 */
  errorHandler?: (dynamicRouter: IDynamicRouter, error: any) => void
}

export interface EventBus {
  on: (event: string, callback: () => void) => void
  emit: (type: string, event: Record<string, unknown>) => void
}

export interface EventBusProvider {
  getEventBus: () => EventBus
}

export type RouteLoader = () => Promise<RouteRecordRaw[]>
export type PermissionFilter = (routes: RouteRecordRaw[]) => RouteRecordRaw[]
