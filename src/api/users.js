import api from './client'

export async function listUsers() {
  const { data } = await api.get('/users')
  return data
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload)
  return data
}

export async function updateUserRole(userId, payload) {
  const { data } = await api.patch(`/users/${userId}/role`, payload)
  return data
}

export async function updateUserStatus(userId, isActive) {
  const { data } = await api.patch(`/users/${userId}/status`, { is_active: isActive })
  return data
}

export async function adminResetProvisionalPassword(userId) {
  const { data } = await api.post(`/users/${userId}/reset-provisional-password`)
  return data
}

export async function resetProvisionalPassword(newPassword, confirmPassword) {
  const { data } = await api.post('/users/reset-provisional-password', {
    new_password: newPassword,
    confirm_password: confirmPassword,
  })
  return data
}
