import api from './client'

export async function listCommunities(params = {}) {
  const { data } = await api.get('/communities', { params })
  return data
}

export async function getCommunity(id) {
  const { data } = await api.get(`/communities/${id}`)
  return data
}

export async function createCommunity(payload) {
  const { data } = await api.post('/communities', payload)
  return data
}

export async function updateCommunity(id, payload) {
  const { data } = await api.patch(`/communities/${id}`, payload)
  return data
}
