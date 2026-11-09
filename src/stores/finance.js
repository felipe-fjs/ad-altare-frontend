import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/finance'

export const useFinanceStore = defineStore('finance', () => {
  const contributions = ref([])
  const cash = ref([])
  const summary = ref(null)
  const loading = ref(false)

  async function fetchContributions(params = {}) {
    loading.value = true
    try {
      contributions.value = await api.listContributions(params)
      return contributions.value
    } finally {
      loading.value = false
    }
  }

  async function fetchCash(params = {}) {
    cash.value = await api.listCashTransactions(params)
    return cash.value
  }

  async function fetchSummary(params) {
    summary.value = await api.financeSummary(params)
    return summary.value
  }

  return {
    contributions,
    cash,
    summary,
    loading,
    fetchContributions,
    fetchCash,
    fetchSummary,
  }
})
