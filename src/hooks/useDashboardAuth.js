const SESSION_KEY = 'irp_dash_token'

export function storeToken(token) {
  sessionStorage.setItem(SESSION_KEY, token)
}

export function getStoredToken() {
  return sessionStorage.getItem(SESSION_KEY) || ''
}

export function isAuthenticated() {
  return !!sessionStorage.getItem(SESSION_KEY)
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
