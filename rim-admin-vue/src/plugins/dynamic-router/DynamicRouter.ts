import { type App, ref } from 'vue'
import type { Router, RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import type {
  DynamicRouteOptions,
  RouteLoader,
  PermissionFilter,
  AuthProvider,
  IDynamicRouter,
  EventBusProvider,
  Navigator
} from './types'

const DEFAULT_LOADER: RouteLoader = () => Promise.resolve([])
const DEFAULT_FILTER: PermissionFilter = (routes) => routes

export class DynamicRouter implements IDynamicRouter {
  private router: Router
  private options: DynamicRouteOptions
  private isRoutesLoaded = ref(false)
  private defaultRoutesAdded = ref(false)
  private pendingNavigation: string | null = null
  private authProvider: AuthProvider
  private eventBusProvider: EventBusProvider
  private navigator: Navigator

  constructor(router: Router, options: DynamicRouteOptions) {
    this.router = router
    this.authProvider = options.authProvider || this._createDefaultAuthProvider()
    this.eventBusProvider = options.eventBusProvider || this._createDefaultEventBusProvider()
    this.navigator = options.navigator || this._createDefaultNavigator()
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
      this.options.errorHandler?.(this, error as Error)
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

      if (to.name !== 'Login') {
        this.pendingNavigation = to.fullPath
      }

      // 检查路由是否加载
      if (!this.isRoutesLoaded.value) {
        try {
          await this.loadRoutes()
          this.handlePostLoadNavigation(to, next)
        } catch (error) {
        }
      }

      // 检查是否已经登录，如果没有则尝试从缓存中自动登录
      if (!this.authProvider.isAuthenticated()) {
        if (!await this.authProvider.tryAutoLogin()) {
          // 登录失败，执行回调
          this.authProvider.onAuthFailed?.(this)
        } else {
          if (!this.isRoutesLoaded.value) {
            try {
              await this.loadRoutes()
              this.handlePostLoadNavigation(to, next)
            } catch (error) {
            }
          }
        }
      }

      if (this.isNeedAuth(to) && !this.authProvider.isAuthenticated()) {
        this.navigator.naviToLogin()
        return next(false)
      }

      return next()
    })
  }
  public getNavigator = () => this.navigator;

  public getEventBus = () => this.eventBusProvider.getEventBus()

  private isRouteExists = (route: RouteRecordRaw) =>
    this.router.hasRoute(route.name!) || this.options.defaultRoutes?.some(r => r.name === route.name)

  private isNeedAuth = (route: RouteLocationNormalized) =>
    route.matched.some(record => {
      return record.meta.requiresAuth === true
    })

  private handlePostLoadNavigation(to: RouteLocationNormalized, next: any) {
    if (this.pendingNavigation) {
      const target = this.pendingNavigation
      this.pendingNavigation = null
      return next(target)
    }
    return next({ ...to, replace: true })
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

  private _createDefaultAuthProvider(): AuthProvider {
    return {
      isAuthenticated: () => false,
      waitAuthReady: () => new Promise(() => { }),
      tryAutoLogin: () => Promise.resolve(false)
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

  private _createDefaultNavigator(): Navigator {
    return {
      naviTo: (path: string) => {
        this.router.push(path)
      },
      naviToLogin: () => this.router.push('/login'),
      naviToNoPermission: () => this.router.push('/no-permission'),
      naviToError: () => this.router.push('/error')
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