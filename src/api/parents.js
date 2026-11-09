import api from './client'

export async function listParents() {
  const { data } = await api.get('/parents')
  return data
}
