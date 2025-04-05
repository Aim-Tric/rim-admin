<script setup lang="ts">
import { inject } from 'vue'
import type { Emitter } from 'mitt'
import { DynamicRouter } from '@/plugins/dynamic-router/DynamicRouter'
import TheWelcome from '../components/TheWelcome.vue'

const emitter = inject<Emitter<Record<string, unknown>>>('emitter')!
const dynamicRouter = inject<DynamicRouter>('dynamicRouter')!
dynamicRouter.loadWithAuthCheck()

const login = () => {
  localStorage.setItem('token', 'yes')
  emitter.emit('rim:auth-change', { isAuthenticated: true })
}
</script>

<template>
  <main>
    <TheWelcome />
    <button @click="login">登录</button>
  </main>
</template>
