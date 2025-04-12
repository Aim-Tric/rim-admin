<script setup lang="ts">
import { inject } from 'vue'
import type { Emitter } from 'mitt'
import { DynamicRouter } from '@/plugins/dynamic-router/DynamicRouter'

const emitter = inject<Emitter<Record<string, unknown>>>('emitter')!
const dynamicRouter = inject<DynamicRouter>('dynamicRouter')!
dynamicRouter.startAuthListener()

const login = () => {
  localStorage.setItem('token', 'yes')
  emitter.emit('rim:auth-change', { isAuthenticated: true })
}
</script>

<template>
  <main>
    <n-card title="登录">
      卡片内容
      <template #footer>
        <button @click="login">登录</button>
      </template>
    </n-card>
  </main>
</template>
