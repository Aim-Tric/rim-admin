// 定义响应数据结构
export interface ResponseData<T = any> {
    code: number
    data: T
    message?: string
}