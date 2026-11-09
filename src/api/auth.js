import api, { setToken, clearToken } from './client'

export async function login(username, password) {
  const body = new URLSearchParams()
  body.set('username', username)
  body.set('password', password)
  const { data } = await api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  setToken(data.access_token)
  return data
}

export async function fetchMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function resetProvisionalPassword(newPassword, confirmPassword) {
  const { data } = await api.post('/users/reset-provisional-password', {
    new_password: newPassword,
    confirm_password: confirmPassword,
  })
  return data
}

export function logout() {
  clearToken()
}
