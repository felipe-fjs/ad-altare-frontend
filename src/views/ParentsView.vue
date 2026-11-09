<script setup>
import { computed, onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useCommunitiesStore } from '@/stores/communities'
import { useAppToast } from '@/composables/useToast'
import * as parentsApi from '@/api/parents'

const toast = useAppToast()
const communities = useCommunitiesStore()

const items = ref([])
const loading = ref(false)
const selected = ref(null)
const showModal = ref(false)

const communityName = computed(() => {
  const map = Object.fromEntries(communities.items.map((c) => [c.id, c.name]))
  return (id) => map[id] || `#${id}`
})

async function load() {
  loading.value = true
  try {
    items.value = await parentsApi.listParents()
  } catch (err) {
    toast.fromError(err, 'Falha ao listar responsáveis')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([communities.fetchAll(), load()])
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar')
  }
})

function onRowClick(event) {
  selected.value = event.data
  showModal.value = true
}
</script>

<template>
  <div>
    <PageHeader
      title="Responsáveis"
      subtitle="Pais e responsáveis vinculados aos coroinhas"
    />

    <div class="panel overflow-hidden">
      <DataTable
        :value="items"
        :loading="loading"
        data-key="id"
        class="text-sm"
        striped-rows
        responsive-layout="scroll"
        row-hover
        selection-mode="single"
        @row-click="onRowClick"
      >
        <template #empty>
          <EmptyState
            title="Nenhum responsável"
            description="Ainda não há usuários com papel de responsável cadastrados."
          />
        </template>
        <Column field="full_name" header="Nome" />
        <Column field="email" header="E-mail" />
        <Column header="Coroinhas">
          <template #body="{ data }">
            {{ data.acolyte_count }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <span
              class="badge rounded-lg"
              :class="data.is_active ? 'badge-success' : 'badge-ghost'"
            >
              {{ data.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showModal"
      modal
      :header="selected ? `Coroinhas de ${selected.full_name}` : 'Coroinhas vinculados'"
      class="w-full max-w-lg"
    >
      <div v-if="selected" class="space-y-3 pt-2">
        <p class="text-sm text-slate-400">
          {{ selected.email }}
        </p>

        <ul v-if="selected.acolytes?.length" class="divide-y divide-slate-700 rounded-xl border border-slate-700">
          <li
            v-for="acolyte in selected.acolytes"
            :key="acolyte.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p class="font-medium text-slate-100">{{ acolyte.full_name }}</p>
              <p class="text-xs text-slate-400">{{ communityName(acolyte.community_id) }}</p>
            </div>
            <span
              class="badge rounded-lg shrink-0"
              :class="acolyte.is_active ? 'badge-success' : 'badge-ghost'"
            >
              {{ acolyte.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </li>
        </ul>

        <EmptyState
          v-else
          title="Sem vínculos"
          description="Este responsável ainda não está vinculado a nenhum coroinha."
        />
      </div>
    </Dialog>
  </div>
</template>
