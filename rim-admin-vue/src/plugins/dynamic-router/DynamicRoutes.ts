import { type App, ref } from 'vue'
import type { Router, RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import type { 
  DynamicRoutePluginOptions,
  RouteLoader,
  PermissionFilter,
  AuthStateProvider
} from './types'

const DEFAULT_LOADER: RouteLoader = () => Promise.resolve([])
const DEFAULT_FILTER: PermissionFilter = (routes) => routes

export class DynamicRoutes {
  private router: Router
  private options: DynamicRoutePluginOptions
  private isRoutesLoaded = ref(false)
  private defaultRoutesAdded = false
  private pendingNavigation: string | null = null
  private authProvider: AuthStateProvider

  constructor(router: Router, options: DynamicRoutePluginOptions = {}) {
    this.router = router
    this.authProvider = options.authProvider || this.createDefaultAuthProvider()
    this.options = {
      defaultRoutes: options.defaultRoutes || [],
      routeLoader: options.routeLoader || DEFAULT_LOADER,
      permissionFilter: options.permissionFilter || DEFAULT_FILTER,
      errorHandler: options.errorHandler,
      authProvider: this.authProvider
    }
    this.addDefaultRoutes()
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

  public async loadWithAuthCheck() {
    if (!this.authProvider.isAuthenticated()) {
      await this.authProvider.waitAuthReady()
    }
    return this.loadRoutes()
  }

  public install(app: App) {
    app.config.globalProperties.$dynamicRoutes = {
      isLoaded: this.isRoutesLoaded,
      load: this.loadWithAuthCheck.bind(this),
      reload: this.loadRoutes.bind(this)
    }

    this.setupNavigationGuards()
  }

  private setupNavigationGuards() {
    this.router.beforeEach(async (to, from, next) => {
      if (this.isWhiteListed(to)) return next()
      
      if (!this.authProvider.isAuthenticated()) {
        this.pendingNavigation = to.fullPath
        return next('/login')
      }

      if (!this.isRoutesLoaded.value) {
        try {
          await this.loadRoutes()
          return this.handlePostLoadNavigation(to, next)
        } catch (error) {
          return next('/error')
        }
      }
      
      return next()
    })
  }

  private isRouteExists(route: RouteRecordRaw) {
    return this.router.hasRoute(route.name!) || 
      this.options.defaultRoutes?.some(r => r.name === route.name)
  }

  private isWhiteListed(route: RouteLocationNormalized) {
    return route.matched.some(record => 
      record.meta.skipAuthCheck || record.meta.requiresAuth === false
    )
  }

  private handlePostLoadNavigation(to: RouteLocationNormalized, next: any) {
    if (this.pendingNavigation) {
      const target = this.pendingNavigation
      this.pendingNavigation = null
      return next(target)
    }
    return next({ ...to, replace: true })
  }

  private addDefaultRoutes() {
    if (!this.defaultRoutesAdded) {
      this.options.defaultRoutes?.forEach(route => {
        if (!this.router.hasRoute(route.name!)) {
          this.router.addRoute(route)
        }
      })
      this.defaultRoutesAdded = true
    }
  }

  private createDefaultAuthProvider(): AuthStateProvider {
    return {
      isAuthenticated: () => false,
      waitAuthReady: () => new Promise(() => {})
    }
  }
}