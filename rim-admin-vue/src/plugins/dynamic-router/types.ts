import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 是否需要权限校验（默认true） */
    requiresAuth?: boolean
    /** 跳过所有权限检查（最高优先级） */
    skipAuthCheck?: boolean
    /** 自定义权限标识 */
    permissionKey?: string
  }
}

export interface AuthStateProvider {
  /** 获取当前认证状态 */
  isAuthenticated: () => boolean
  /** 等待认证状态变化 */
  waitAuthReady: () => Promise<boolean>
}

export interface DynamicRoutePluginOptions {
  /** 默认基础路由（在动态路由加载前生效） */
  defaultRoutes?: RouteRecordRaw[];
  /** 认证状态提供器 */
  authProvider?: AuthStateProvider
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

export type RouteLoader = () => Promise<RouteRecordRaw[]>
export type PermissionFilter = (routes: RouteRecordRaw[]) => RouteRecordRaw[]