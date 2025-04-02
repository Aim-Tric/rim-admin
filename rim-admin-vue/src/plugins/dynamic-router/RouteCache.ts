import type { RouteRecordRaw } from 'vue-router'
import type { RouteLoader } from './types'

export function withCache(
    loader: RouteLoader,
    options: { ttl?: number } = {}
): RouteLoader {
    let cache: RouteRecordRaw[] | null = null
    let lastFetchTime = 0

    return async () => {
        const now = Date.now()
        if (!cache || (options.ttl && now - lastFetchTime > options.ttl)) {
            cache = await loader()
            lastFetchTime = now
        }
        return cache
    }
}