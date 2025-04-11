export default {
    'post /api/user/login': {
        code: 200,
        data: {
            token: '@string(32)',
            username: '@cname'
        },
        message: '登录成功'
    },
    'get /api/user/info': {
        code: 200,
        data: {
            name: '@cname',
            avatar: '@image("200x200")',
            roles: ['admin']
        }
    },
    'get /api/user/menus': {
        code: 200,
        data: [
            {
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
    },
}