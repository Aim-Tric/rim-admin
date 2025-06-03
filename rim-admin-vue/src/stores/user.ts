import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/rim'
import { info } from '@/api/User'

const LOCAL_USER_KEY = "AUTH_USER"

export const useUserStore = defineStore('user', () => {
  let user = ref<User | undefined>(undefined)

  const isAuthenticated = () => {
    if (user.value != undefined) {
      return true
    }
    let item = localStorage.getItem(LOCAL_USER_KEY)
    if (item != undefined) {
      user.value = JSON.parse(item)
      return true
    }
    return false
  }

  const tryAutoLogin = () => {

  }

  const loadUserInfo = async (): Promise<User | undefined> => {
    if (user.value != undefined) {
      return Promise.resolve(user.value)
    }
    let item = localStorage.getItem(LOCAL_USER_KEY)
    if (item != undefined) {
      user.value = JSON.parse(item)
      return Promise.resolve(user.value)
    }
    let u = await info()
    user.value = u.data
    return Promise.resolve(user.value)
  }

  return { user, isAuthenticated, tryAutoLogin, loadUserInfo }
})
