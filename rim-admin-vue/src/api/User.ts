import http from '@/utils/request'
import type { User } from '@/types/rim'

export function login(username: string, password: string) {
  return http.post("/user/login", { username, password })
}

export function logout() {

}

export function info(): Promise<User | undefined> {
  return http.get("/user/info")
}


