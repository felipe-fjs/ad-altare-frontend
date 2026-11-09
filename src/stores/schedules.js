import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/schedules'

export const useSchedulesStore = defineStore('schedules', () => {
  const celebrations = ref([])
  const assignments = ref([])
  const unavailabilities = ref([])
  const substitutions = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchCelebrations(params = {}) {
    loading.value = true
    try {
      celebrations.value = await api.listCelebrations(params)
      return celebrations.value
    } finally {
      loading.value = false
    }
  }

  async function fetchCelebration(id) {
    loading.value = true
    try {
      current.value = await api.getCelebration(id)
      assignments.value = await api.listAssignments(id)
      return current.value
    } finally {
      loading.value = false
    }
  }

  async function createCelebration(payload) {
    const item = await api.createCelebration(payload)
    celebrations.value.unshift(item)
    return item
  }

  async function fetchUnavailabilities(params = {}) {
    unavailabilities.value = await api.listUnavailabilities(params)
    return unavailabilities.value
  }

  async function fetchSubstitutions(params = {}) {
    substitutions.value = await api.listSubstitutions(params)
    return substitutions.value
  }

  return {
    celebrations,
    assignments,
    unavailabilities,
    substitutions,
    current,
    loading,
    fetchCelebrations,
    fetchCelebration,
    createCelebration,
    fetchUnavailabilities,
    fetchSubstitutions,
  }
})
