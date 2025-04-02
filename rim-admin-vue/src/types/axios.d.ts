import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 是否自动处理错误（默认true）
     */
    autoError?: boolean
    /**
     * 是否需要认证（默认true）
     */
    requireAuth?: boolean
  }
}