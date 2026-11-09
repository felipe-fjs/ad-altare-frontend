import api from './client'

export async function getDashboard(params = {}) {
  const { data } = await api.get('/dashboard', { params })
  return data
}
