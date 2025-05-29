// 定义响应数据结构
export interface ResponseData<T = any> {
    code: number
    data: T
    message?: string
}

export interface SystemBasicSetting {
    appName?: string
    appVersion?: string
    company?: string
    openRegistry?: boolean
}

export interface User {
    id?: string
    username?: string
    password?: string
    nickname?: string
    email?: string
    phone?: string
    actived?: boolean
    roles?: Role[]
    menus?: Menu[]
}

export interface Role {
    id?: string
    name?: string
}

export interface Menu {
    id?: string
    parentId?: string
    name?: string
    viewPath?: string
    componentSrc?: string
    requireAuth?: boolean
    otherMetas?: Map<String, String>
}

