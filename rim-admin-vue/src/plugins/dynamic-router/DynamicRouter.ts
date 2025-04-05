import { type App, ref } from 'vue'
import type { Router, RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import type {
  DynamicRouteOptions,
  RouteLoader,
  PermissionFilter,
  AuthStateProvider,
  IDynamicRouter,
  EventBusProvider
} from './types'

const DEFAULT_LOADER: RouteLoader = () => Promise.resolve([])
const DEFAULT_FILTER: PermissionFilter = (routes) => routes

export class DynamicRouter implements IDynamicRouter {
  private router: Router
  private options: DynamicRouteOptions
  private isRoutesLoaded = ref(false)
  private defaultRoutesAdded = ref(false)
  private pendingNavigation: string | null = null
  private authProvider: AuthStateProvider
  private eventBusProvider: EventBusProvider

  constructor(router: Router, options: DynamicRouteOptions = {}) {
    this.router = router
    this.authProvider = options.authProvider || this._createDefaultAuthProvider()
    this.eventBusProvider = options.eventBusProvider || this._createDefaultEventBusProvider()
    this.options = {
      defaultRoutes: options.defaultRoutes || [],
      routeLoader: options.routeLoader || DEFAULT_LOADER,
      permissionFilter: options.permissionFilter || DEFAULT_FILTER,
      errorHandler: options.errorHandler,
      authProvider: this.authProvider
    }
    this.setupDefaultRoutes()
  }

  public async loadRoutes() {
    try {
      const loadedRoutes = await this.options.routeLoader!()
      const filteredRoutes = this.options.permissionFilter!(loadedRoutes)

      filteredRoutes.forEach(route => {
        if (!this.isRouteExists(route)) {
          this.router.addRoute(route)
        }
      })

      this.isRoutesLoaded.value = true
      return filteredRoutes
    } catch (error) {
      this.options.errorHandler?.(error as Error)
      throw error
    }
  }

  public async startAuthListener() {
    if (!this.authProvider.isAuthenticated()) {
      await this.authProvider.waitAuthReady(this)
    }
    return this.loadRoutes()
  }

  public attachPendingNavigation() {
    if (this.pendingNavigation) {
      this.router.push(this.pendingNavigation!)
      this.pendingNavigation = null
    }
  }

  public setupNavigationGuards() {
    this.router.beforeEach(async (to, from, next) => {
      // 当路由未匹配且未登录时，重定向到登录页
      if (to.matched.length === 0 && !this.authProvider.isAuthenticated()) {
        return next('/login')
      }

      if (!this.isNeedAuth(to)) return next()

      // 检查认证状态
      if (!this.authProvider.isAuthenticated()) {
        // 保存目标路由地址，但不包括登录页面本身
        if (to.name !== 'Login') {
          this.pendingNavigation = to.fullPath
        }
        return next('/login')
      }

      // 如果路由未加载，先加载路由
      if (!this.isRoutesLoaded.value) {
        try {
          await this.loadRoutes()
          this.handlePostLoadNavigation(to, next)
        } catch (error) {
          console.error('路由加载失败:', error)
          return next('/error')
        }
      }

      return next()
    })
  }

  public getEventBus() {
    return this.eventBusProvider.getEventBus()
  }

  private isRouteExists(route: RouteRecordRaw) {
    return this.router.hasRoute(route.name!) ||
      this.options.defaultRoutes?.some(r => r.name === route.name)
  }

  private handlePostLoadNavigation(to: RouteLocationNormalized, next: any) {
    if (this.pendingNavigation) {
      const target = this.pendingNavigation
      this.pendingNavigation = null
      return next(target)
    }
    return next({ ...to, replace: true })
  }

  private isNeedAuth(route: RouteLocationNormalized) {
    return route.matched.some(record => {
      return record.meta.requiresAuth === true
    })
  }

  private setupDefaultRoutes() {
    if (!this.defaultRoutesAdded.value) {
      this.options.defaultRoutes?.forEach(route => {
        if (!this.router.hasRoute(route.name!)) {
          this.router.addRoute(route)
        }
      })
      this.defaultRoutesAdded.value = true
    }
  }

  private _createDefaultAuthProvider(): AuthStateProvider {
    return {
      isAuthenticated: () => false,
      waitAuthReady: () => new Promise(() => { })
    }
  }

  private _createDefaultEventBusProvider(): EventBusProvider {
    return {
      getEventBus: () => ({
        on: () => { },
        emit: () => { }
      })
    }
  }

  public install(app: App) {
    app.use(this.router)
    app.config.globalProperties.$dynamicRoutes = {
      isLoaded: this.isRoutesLoaded,
      load: this.startAuthListener.bind(this),
      reload: this.loadRoutes.bind(this)
    }
    this.setupNavigationGuards()
    app.provide('dynamicRouter', this)
  }
}