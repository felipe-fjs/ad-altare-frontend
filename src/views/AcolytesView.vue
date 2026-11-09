<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AcolyteFormModal from '@/components/acolytes/AcolyteFormModal.vue'
import { useAcolytesStore } from '@/stores/acolytes'
import { useCommunitiesStore } from '@/stores/communities'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'

const router = useRouter()
const acolytes = useAcolytesStore()
const communities = useCommunitiesStore()
const { canWriteAcolytes } = useRole()
const toast = useAppToast()

const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const filters = reactive({
  community_id: '',
  q: '',
  is_active: 'true',
})

const communityName = computed(() => {
  const map = Object.fromEntries(communities.items.map((c) => [c.id, c.name]))
  return (id) => map[id] || `#${id}`
})

async function load() {
  const params = {}
  if (filters.community_id) params.community_id = Number(filters.community_id)
  if (filters.q.trim()) params.q = filters.q.trim()
  if (filters.is_active !== '') params.is_active = filters.is_active === 'true'
  try {
    await acolytes.fetchAll(params)
  } catch (err) {
    toast.fromError(err, 'Falha ao listar coroinhas')
  }
}

onMounted(async () => {
  try {
    await Promise.all([communities.fetchAll(), acolytes.fetchFunctions(), load()])
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar')
  }
})

function openCreate() {
  editing.value = null
  showForm.value = true
}

function openEdit(row) {
  editing.value = row
  showForm.value = true
}

async function onSave(payload) {
  saving.value = true
  try {
    if (editing.value) {
      await acolytes.update(editing.value.id, payload)
      toast.success('Coroinha atualizado')
    } else {
      await acolytes.create(payload)
      toast.success('Coroinha cadastrado')
    }
    showForm.value = false
    await load()
  } catch (err) {
    toast.fromError(err, 'Não foi possível salvar')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="Coroinhas" subtitle="Cadastro e acompanhamento da pastoral">
      <button
        v-if="canWriteAcolytes"
        type="button"
        class="btn btn-primary rounded-xl"
        @click="openCreate"
      >
        Novo coroinha
      </button>
    </PageHeader>

    <div class="panel p-4 mb-4 grid gap-3 sm:grid-cols-4">
      <label class="form-control w-full">
        <span class="label-text mb-1">Busca</span>
        <input
          v-model="filters.q"
          class="input input-bordered input-sm rounded-xl"
          placeholder="Nome"
          @keyup.enter="load"
        />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Comunidade</span>
        <select v-model="filters.community_id" class="select select-bordered select-sm rounded-xl">
          <option value="">Todas</option>
          <option v-for="c in communities.items" :key="c.id" :value="String(c.id)">
            {{ c.name }}
          </option>
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Status</span>
        <select v-model="filters.is_active" class="select select-bordered select-sm rounded-xl">
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </label>
      <div class="flex items-end">
        <button type="button" class="btn btn-outline btn-sm rounded-xl w-full" @click="load">
          Filtrar
        </button>
      </div>
    </div>

    <div v-if="acolytes.loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-amber-400" />
    </div>

    <EmptyState
      v-else-if="!acolytes.items.length"
      title="Nenhum coroinha"
      message="Ajuste os filtros ou cadastre um novo coroinha."
    />

    <div v-else class="panel overflow-hidden">
      <DataTable
        :value="acolytes.items"
        paginator
        :rows="10"
        striped-rows
        class="text-sm"
        @row-click="(e) => router.push({ name: 'acolyte-detail', params: { id: e.data.id } })"
      >
        <Column field="full_name" header="Nome" sortable />
        <Column header="Comunidade">
          <template #body="{ data }">{{ communityName(data.community_id) }}</template>
        </Column>
        <Column field="experience_level" header="Nível" />
        <Column header="Acesso">
          <template #body="{ data }">
            <span class="badge badge-sm" :class="data.user_id ? 'badge-success' : 'badge-ghost'">
              {{ data.user_id ? 'Com login' : 'Sem login' }}
            </span>
          </template>
        </Column>
        <Column header="Ativo">
          <template #body="{ data }">
            {{ data.is_active ? 'Sim' : 'Não' }}
          </template>
        </Column>
        <Column v-if="canWriteAcolytes" header="">
          <template #body="{ data }">
            <button
              type="button"
              class="btn btn-ghost btn-xs rounded-lg"
              @click.stop="openEdit(data)"
            >
              Editar
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <AcolyteFormModal
      v-model:visible="showForm"
      :acolyte="editing"
      :communities="communities.items"
      :functions="acolytes.functions"
      :saving="saving"
      @save="onSave"
    />
  </div>
</template>
