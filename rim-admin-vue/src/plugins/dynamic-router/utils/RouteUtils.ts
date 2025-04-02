import type { RouteRecordRaw } from 'vue-router'

export function validateRouteStructure(route: RouteRecordRaw) {
    if (!route.name && !route.path.startsWith('/:')) {
        console.warn('Detected unnamed route:', route.path)
    }
}

export function transformRemoteRoutes(
    remoteRoutes: any[]
): RouteRecordRaw[] {
    return remoteRoutes.map(r => ({
        ...r,
        meta: {
            requiresAuth: true,
            ...r.meta
        },
        children: r.children ? transformRemoteRoutes(r.children) : []
    }))
}