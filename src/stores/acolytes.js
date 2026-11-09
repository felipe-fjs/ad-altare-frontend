import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/acolytes'

export const useAcolytesStore = defineStore('acolytes', () => {
  const items = ref([])
  const functions = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      items.value = await api.listAcolytes(params)
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    try {
      current.value = await api.getAcolyte(id)
      return current.value
    } finally {
      loading.value = false
    }
  }

  async function fetchFunctions() {
    functions.value = await api.listLiturgicalFunctions()
    return functions.value
  }

  async function create(payload) {
    const item = await api.createAcolyte(payload)
    items.value.unshift(item)
    return item
  }

  async function update(id, payload) {
    const item = await api.updateAcolyte(id, payload)
    const idx = items.value.findIndex((a) => a.id === id)
    if (idx >= 0) items.value[idx] = item
    if (current.value?.id === id) current.value = item
    return item
  }

  return {
    items,
    functions,
    current,
    loading,
    fetchAll,
    fetchOne,
    fetchFunctions,
    create,
    update,
  }
})
