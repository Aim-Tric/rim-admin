import http from '@/utils/request'

export function login(username: string, password: string) {
    return http.post("/user/login", { username, password })
}

export function logout() {

}

export function info() {
    return http.get("/user/info")
}


