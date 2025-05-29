import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/rim'

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

    const loadUserInfo = () => {

    }

    return { user, isAuthenticated, tryAutoLogin, loadUserInfo }
})
