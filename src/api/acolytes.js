import api from './client'

export async function listAcolytes(params = {}) {
  const { data } = await api.get('/acolytes', { params })
  return data
}

export async function getAcolyte(id) {
  const { data } = await api.get(`/acolytes/${id}`)
  return data
}

export async function createAcolyte(payload) {
  const { data } = await api.post('/acolytes', payload)
  return data
}

export async function updateAcolyte(id, payload) {
  const { data } = await api.patch(`/acolytes/${id}`, payload)
  return data
}

export async function generateAccess(id, payload) {
  const { data } = await api.post(`/acolytes/${id}/generate-access`, payload)
  return data
}

export async function linkParent(id, userId) {
  const { data } = await api.post(`/acolytes/${id}/parents`, { user_id: userId })
  return data
}

export async function unlinkParent(id, userId) {
  const { data } = await api.delete(`/acolytes/${id}/parents/${userId}`)
  return data
}

export async function listLiturgicalFunctions() {
  const { data } = await api.get('/liturgical-functions')
  return data
}
