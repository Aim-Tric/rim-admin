import type { ResponseData } from "@/types/rim"

export default [
    {
        url: '/api/user/login',
        method: 'post',
        response: (): ResponseData<any> => (
            {
                code: 200,
                data: {
                    token: '@string(32)',
                    username: '@cname'
                },
                message: '登录成功'
            }
        )
    },
    {
        url: '/api/user/info',
        method: 'get',
        response: (): ResponseData<any> => (
            {
                code: 200,
                data: {
                    name: '@cname',
                    avatar: '@image("200x200")',
                    roles: ['admin'],
                    menus: [
                        {
                            path: '/home',
                            name: 'Home',
                            component: '@/views/HomeView.vue',
                            meta: {
                                title: '主视图',
                                icon: 'home',
                                requireAuth: true
                            }
                        }, {
                            path: '/dashboard',
                            name: 'DashBoard',
                            component: '@/views/Dashboard.vue',
                            meta: {
                                title: '仪盘表',
                                icon: 'dashboard',
                                requireAuth: true
                            }
                        }, {
                            path: '/about',
                            name: 'About',
                            component: '@/views/AboutView.vue',
                            meta: {
                                title: '关于',
                                icon: 'about',
                                requireAuth: true
                            }
                        }
                    ]
                }
            }
        )
    }
]