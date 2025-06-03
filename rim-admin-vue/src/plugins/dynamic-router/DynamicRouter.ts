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
      console.log("load routes success..")
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
    this.loadRoutes()
    this.attachPendingNavigation()
  }

  public attachPendingNavigation() {
    if (this.pendingNavigation) {
      this.router.push(this.pendingNavigation!)
      this.pendingNavigation = null
    } else {
      this.router.push("/home")
    }
  }

  /**
   * 配置路由守卫
   * 路由状态情况：
   * 一、路由已加载：
   *  1.路由有匹配，且有权限/无需登录/无需权限，放行
   *  2.路由有匹配，已登录，但无权限，跳转无权限页面
   *  3.路由有匹配，未登录，跳转登录页
   *  4.路由无匹配，跳转NotFound页面
   * 二、路由未加载：
   *  1.尝试加载路由，加载成功，回到一.1判断
   *  2.路由加载失败，已登录，跳转错误页面
   *  3.路由加载失败，未登录，跳转登录页
   */
  public setupNavigationGuards() {

    this.router.beforeEach(async (to, from, next) => {

      if (to.name !== 'Login') {
        this.pendingNavigation = to.fullPath
      }

      if (to.name == 'Login' || to.name == 'Error') {
        return next()
      }

      // 检查路由是否加载
      if (!this.isRoutesLoaded.value) {
        try {
          await this.loadRoutes()
          this.handlePostLoadNavigation(to, next)
        } catch (error) {
          if (to.name !== 'Login') {
            this.navigator.naviToLogin(next)
          } else {
            this.navigator.naviToError(next)
          }
        }
      }

      // 检查是否已经登录，如果没有则尝试从缓存中自动登录
      if (!this.authProvider.isAuthenticated()) {
        if (!await this.authProvider.tryAutoLogin()) {
          // 登录失败，执行回调
          this.authProvider.onAuthFailed(this)
        } else {
          if (!this.isRoutesLoaded.value) {
            try {
              await this.loadRoutes()
              this.handlePostLoadNavigation(to, next)
            } catch (error) {
              if (to.name !== 'Login') {
                this.navigator.naviToLogin(next)
              } else {
                this.navigator.naviToError(next)
              }
            }
          }
        }
      }

      if (this.isNeedAuth(to) && !this.authProvider.isAuthenticated()) {
        this.navigator.naviToLogin(next)
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
      tryAutoLogin: () => Promise.resolve(false),
      onAuthFailed(_) { },
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
      naviToLogin: (next) => next('Login'),
      naviToNoPermission: (next) => next('NoPermission'),
      naviToError: (next) => next('Error')
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