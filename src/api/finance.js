import api from './client'

export async function listContributions(params = {}) {
  const { data } = await api.get('/contributions', { params })
  return data
}

export async function createContribution(payload) {
  const { data } = await api.post('/contributions', payload)
  return data
}

export async function updateContribution(id, payload) {
  const { data } = await api.patch(`/contributions/${id}`, payload)
  return data
}

export async function listCashTransactions(params = {}) {
  const { data } = await api.get('/cash-transactions', { params })
  return data
}

export async function createCashTransaction(payload) {
  const { data } = await api.post('/cash-transactions', payload)
  return data
}

export async function deleteCashTransaction(id) {
  const { data } = await api.delete(`/cash-transactions/${id}`)
  return data
}

export async function financeSummary(params) {
  const { data } = await api.get('/finance/summary', { params })
  return data
}
