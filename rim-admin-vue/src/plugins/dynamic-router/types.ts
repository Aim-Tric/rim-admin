import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 是否需要权限校验（默认true） */
    requiresAuth?: boolean
    /** 自定义权限标识 */
    permissionKey?: string
  }
}

export interface IDynamicRouter {
  attachPendingNavigation: () => void
  getEventBus: () => EventBus
}

export interface AuthStateProvider {
  /** 获取当前认证状态 */
  isAuthenticated: () => boolean
  /** 等待认证状态变化 */
  waitAuthReady: (dynamicRouter: IDynamicRouter) => Promise<boolean>
}

export interface DynamicRouteOptions {
  /** 默认基础路由（在动态路由加载前生效） */
  defaultRoutes?: RouteRecordRaw[];
  /** 认证状态提供器 */
  authProvider?: AuthStateProvider
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
  errorHandler?: (error: any) => void
}

export interface EventBus {
  on: (event: string, callback: () => void) => void
  emit: (event: string) => void
}

export interface EventBusProvider {
  getEventBus: () => EventBus
}

export type RouteLoader = () => Promise<RouteRecordRaw[]>
export type PermissionFilter = (routes: RouteRecordRaw[]) => RouteRecordRaw[]
