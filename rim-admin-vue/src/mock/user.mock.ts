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
    response:
    {
      code: 200,
      data: {
        name: '@cname',
        avatar: '@image("200x200")',
        roles: ['admin'],
        menus: [
          {
            id: 'string',
            parentId: '',
            menuType: 0,
            name: 'Admin',
            componentSrc: '/layouts/AdminLayout.vue',
            requireAuth: true,
            otherMetas: {
              title: '管理后台',
              icon: 'admin',
            },
            childMenus: [
              {
                id: 'string',
                parentId: 'Root',
                menuType: 2,
                name: 'Home',
                viewPath: '/home',
                componentSrc: '/views/HomeView.vue',
                requireAuth: true,
                otherMetas: {
                  title: '家',
                  icon: 'home',
                }
              },
              {
                id: 'string',
                parentId: 'Root',
                menuType: 2,
                name: 'DashBoard',
                viewPath: '/dashboard',
                componentSrc: '/views/Dashboard.vue',
                requireAuth: true,
                otherMetas: {
                  title: '仪盘表',
                  icon: 'dashboard',
                }
              },
              {
                id: 'About',
                parentId: 'Root',
                menuType: 2,
                name: 'About',
                viewPath: '/about',
                componentSrc: '/views/AboutView.vue',
                requireAuth: true,
                otherMetas: {
                  title: '关于',
                  icon: 'about',
                }
              }
            ]
          }
        ]
      }
    }
  }
]