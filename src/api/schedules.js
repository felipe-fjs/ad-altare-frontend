import api from './client'

export async function listCelebrations(params = {}) {
  const { data } = await api.get('/celebrations', { params })
  return data
}

export async function getCelebration(id) {
  const { data } = await api.get(`/celebrations/${id}`)
  return data
}

export async function createCelebration(payload) {
  const { data } = await api.post('/celebrations', payload)
  return data
}

export async function updateCelebration(id, payload) {
  const { data } = await api.patch(`/celebrations/${id}`, payload)
  return data
}

export async function deleteCelebration(id) {
  const { data } = await api.delete(`/celebrations/${id}`)
  return data
}

export async function listAssignments(celebrationId) {
  const { data } = await api.get(`/celebrations/${celebrationId}/assignments`)
  return data
}

export async function createAssignment(celebrationId, payload) {
  const { data } = await api.post(`/celebrations/${celebrationId}/assignments`, payload)
  return data
}

export async function deleteAssignment(id) {
  const { data } = await api.delete(`/assignments/${id}`)
  return data
}

export async function whatsappExport(celebrationId) {
  const { data } = await api.get(`/celebrations/${celebrationId}/whatsapp-export`)
  return data
}

export async function listUnavailabilities(params = {}) {
  const { data } = await api.get('/unavailabilities', { params })
  return data
}

export async function createUnavailability(payload) {
  const { data } = await api.post('/unavailabilities', payload)
  return data
}

export async function deleteUnavailability(id) {
  const { data } = await api.delete(`/unavailabilities/${id}`)
  return data
}

export async function listSubstitutions(params = {}) {
  const { data } = await api.get('/substitutions', { params })
  return data
}

export async function requestSubstitution(assignmentId, payload) {
  const { data } = await api.post(`/assignments/${assignmentId}/substitution`, payload)
  return data
}

export async function acceptSubstitution(id, payload) {
  const { data } = await api.post(`/substitutions/${id}/accept`, payload)
  return data
}
