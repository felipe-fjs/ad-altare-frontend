import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/api/communities'

export const useCommunitiesStore = defineStore('communities', () => {
  const items = ref([])
  const loading = ref(false)

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      items.value = await api.listCommunities(params)
      return items.value
    } finally {
      loading.value = false
    }
  }

  async function create(payload) {
    const item = await api.createCommunity(payload)
    items.value.push(item)
    return item
  }

  async function update(id, payload) {
    const item = await api.updateCommunity(id, payload)
    const idx = items.value.findIndex((c) => c.id === id)
    if (idx >= 0) items.value[idx] = item
    return item
  }

  return { items, loading, fetchAll, create, update }
})
