import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
    type CancelTokenSource,
} from 'axios'

// 定义响应数据结构
interface ResponseData<T = any> {
    code: number
    data: T
    message?: string
}

// 扩展请求配置类型
interface RequestConfig extends AxiosRequestConfig {
    /**
     * 是否自动处理错误（默认true）
     */
    autoError?: boolean
    /**
     * 是否需要认证（默认true）
     */
    requireAuth?: boolean
}

class HttpRequest {
    private instance: AxiosInstance
    private cancelTokenSource: CancelTokenSource

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        this.cancelTokenSource = axios.CancelToken.source()

        // 注册拦截器
        this.setupInterceptors()
    }

    /**
     * 初始化拦截器
     */
    private setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                // 添加认证Token
                if (config.requireAuth !== false) {
                    const token = this.getAuthToken()
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                }

                // 处理文件上传
                if (config.data instanceof FormData) {
                    config.headers['Content-Type'] = 'multipart/form-data'
                }

                return config
            },
            (error) => {
                return Promise.reject(error)
            }
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse<ResponseData>) => {
                // 处理二进制数据
                if (response.config.responseType === 'blob') {
                    return response
                }

                // 自定义状态码处理
                if (response.data.code !== 0) {
                    return Promise.reject(response.data)
                }

                return response.data.data
            },
            (error: AxiosError<any>) => {
                // 统一错误处理
                this.handleError(error)
                return Promise.reject(error)
            }
        )
    }

    /**
     * 获取认证Token（根据实际项目修改）
     */
    private getAuthToken(): string | null {
        return localStorage.getItem('access_token') || null
    }

    /**
     * 统一错误处理
     */
    private handleError(error: AxiosError<ResponseData>) {
        
        const status = error.response?.status
        const message = error.response?.data?.message || error.message

        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message)
            return
        }

        switch (status) {
            case 401:
                this.handleUnauthorized()
                break
            case 403:
                this.handleForbidden()
                break
            case 500:
                this.showError('服务器内部错误')
                break
            default:
                this.showError(message)
        }
    }

    private handleUnauthorized() {
        // 触发退出登录逻辑
        window.dispatchEvent(new CustomEvent('auth-expired'))
        this.showError('登录已过期，请重新登录')
    }

    private handleForbidden() {
        this.showError('没有操作权限')
    }

    private showError(message: string) {
        // 可根据需要替换为UI框架的提示组件
        console.error('Request Error:', message)
    }

    /**
     * 创建请求方法
     */
    public request<T = any>(config: RequestConfig): Promise<T> {
        return this.instance.request({
            ...config,
            cancelToken: this.cancelTokenSource.token,
        })
    }

    /**
     * GET请求
     */
    public get<T = any>(
        url: string,
        params?: any,
        config?: RequestConfig
    ): Promise<T> {
        return this.request({
            method: 'get',
            url,
            params,
            ...config,
        })
    }

    /**
     * POST请求
     */
    public post<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<T> {
        return this.request({
            method: 'post',
            url,
            data,
            ...config,
        })
    }

    /**
     * 取消所有进行中的请求
     */
    public cancelAllRequests(message?: string) {
        this.cancelTokenSource.cancel(message || '请求取消')
        // 重置取消令牌
        this.cancelTokenSource = axios.CancelToken.source()
    }
}

// 创建实例（根据环境变量配置）
const baseURL = import.meta.env.VITE_API_BASEURL || '/api'

const http = new HttpRequest(baseURL)

export default http