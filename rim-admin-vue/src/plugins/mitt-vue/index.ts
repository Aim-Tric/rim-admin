import mitt from 'mitt'
import type { App } from 'vue'

const emitter = mitt()

const install = (app: App) => {
  app.config.globalProperties.$emitter = emitter
  app.provide('emitter', emitter)
}

export default install