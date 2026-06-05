const SESSION_KEY = 'irp_dash_auth'
// SHA-256 de "irp2026" — cambiar vía VITE_DASHBOARD_HASH en .env
const EXPECTED_HASH = import.meta.env.VITE_DASHBOARD_HASH ||
  '2b8d6f04f65c8084cb914af95a85a3b0e025f92ad5da9781382e9edb2a6705d5'

export async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function login(password) {
  const hash = await hashPassword(password)
  if (hash !== EXPECTED_HASH) throw new Error('Contraseña incorrecta')
  sessionStorage.setItem(SESSION_KEY, hash)
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === EXPECTED_HASH
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}
