<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import CelebrationForm from '@/components/schedules/CelebrationForm.vue'
import { useSchedulesStore } from '@/stores/schedules'
import { useCommunitiesStore } from '@/stores/communities'
import { useAcolytesStore } from '@/stores/acolytes'
import {
  createUnavailability,
  deleteUnavailability,
  acceptSubstitution,
} from '@/api/schedules'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const schedules = useSchedulesStore()
const communities = useCommunitiesStore()
const acolytes = useAcolytesStore()
const auth = useAuthStore()
const { canWriteSchedules, isAdminOperacional, isCoord } = useRole()
const toast = useAppToast()

const showForm = ref(false)
const saving = ref(false)
const tab = ref('celebrations')
const unavailForm = reactive({
  acolyte_id: null,
  date: '',
  reason: '',
})
const acceptForm = reactive({
  subId: null,
  replacement_acolyte_id: null,
})

const communityName = computed(() => {
  const map = Object.fromEntries(communities.items.map((c) => [c.id, c.name]))
  return (id) => map[id] || `#${id}`
})

const acolyteName = computed(() => {
  const map = Object.fromEntries(acolytes.items.map((a) => [a.id, a.full_name]))
  return (id) => map[id] || `#${id}`
})

const canManageSubs = computed(() => isAdminOperacional.value || isCoord.value)

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}

async function loadAll() {
  await Promise.all([
    schedules.fetchCelebrations(),
    schedules.fetchUnavailabilities(),
    schedules.fetchSubstitutions({ status: 'ABERTA' }),
  ])
}

onMounted(async () => {
  try {
    await Promise.all([communities.fetchAll(), acolytes.fetchAll({ is_active: true })])
    if (acolytes.items.length) {
      unavailForm.acolyte_id = auth.acolyteId || acolytes.items[0].id
      acceptForm.replacement_acolyte_id = acolytes.items[0].id
    }
    await loadAll()
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar escalas')
  }
})

async function onCreate(payload) {
  saving.value = true
  try {
    const item = await schedules.createCelebration(payload)
    toast.success('Celebração criada')
    showForm.value = false
    router.push({ name: 'celebration-detail', params: { id: item.id } })
  } catch (err) {
    toast.fromError(err, 'Não foi possível criar')
  } finally {
    saving.value = false
  }
}

async function addUnavailability() {
  try {
    await createUnavailability({
      acolyte_id: Number(unavailForm.acolyte_id),
      date: unavailForm.date,
      reason: unavailForm.reason.trim() || null,
    })
    toast.success('Indisponibilidade registrada')
    unavailForm.reason = ''
    await schedules.fetchUnavailabilities()
  } catch (err) {
    toast.fromError(err, 'Falha ao registrar')
  }
}

async function removeUnavail(id) {
  try {
    await deleteUnavailability(id)
    toast.success('Removida')
    await schedules.fetchUnavailabilities()
  } catch (err) {
    toast.fromError(err, 'Falha ao remover')
  }
}

async function acceptSub(sub) {
  try {
    await acceptSubstitution(sub.id, {
      replacement_acolyte_id: Number(acceptForm.replacement_acolyte_id),
    })
    toast.success('Substituição aceita')
    await loadAll()
  } catch (err) {
    toast.fromError(err, 'Falha ao aceitar')
  }
}
</script>

<template>
  <div>
    <PageHeader title="Escalas" subtitle="Celebrações, indisponibilidades e substituições">
      <button
        v-if="canWriteSchedules"
        type="button"
        class="btn btn-primary rounded-xl"
        @click="showForm = true"
      >
        Nova celebração
      </button>
    </PageHeader>

    <div role="tablist" class="tabs tabs-boxed bg-slate-800 mb-5 rounded-xl w-fit flex-wrap">
      <button
        type="button"
        role="tab"
        class="tab"
        :class="{ 'tab-active': tab === 'celebrations' }"
        @click="tab = 'celebrations'"
      >
        Celebrações
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        :class="{ 'tab-active': tab === 'unavail' }"
        @click="tab = 'unavail'"
      >
        Indisponibilidades
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        :class="{ 'tab-active': tab === 'subs' }"
        @click="tab = 'subs'"
      >
        Substituições
      </button>
    </div>

    <div v-if="schedules.loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-amber-400" />
    </div>

    <template v-else-if="tab === 'celebrations'">
      <EmptyState
        v-if="!schedules.celebrations.length"
        title="Nenhuma celebração"
        message="Crie missas e montagens de escala aqui."
      />
      <ul v-else class="space-y-3">
        <li
          v-for="c in schedules.celebrations"
          :key="c.id"
          class="panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-700/60"
          @click="router.push({ name: 'celebration-detail', params: { id: c.id } })"
        >
          <div>
            <p class="font-medium text-lg text-slate-200">{{ c.title || c.celebration_type }}</p>
            <p class="text-sm text-slate-400">{{ communityName(c.community_id) }}</p>
          </div>
          <div class="text-sm text-right">
            <p class="text-amber-400 font-medium">{{ fmtDate(c.date) }}</p>
            <p class="text-slate-400">{{ String(c.time).slice(0, 5) }}</p>
          </div>
        </li>
      </ul>
    </template>

    <template v-else-if="tab === 'unavail'">
      <form
        class="panel p-4 mb-4 grid gap-3 sm:grid-cols-4 items-end"
        @submit.prevent="addUnavailability"
      >
        <label class="form-control w-full">
          <span class="label-text mb-1">Coroinha</span>
          <select
            v-model="unavailForm.acolyte_id"
            required
            class="select select-bordered select-sm rounded-xl"
          >
            <option v-for="a in acolytes.items" :key="a.id" :value="a.id">{{ a.full_name }}</option>
          </select>
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Data</span>
          <input
            v-model="unavailForm.date"
            type="date"
            required
            class="input input-bordered input-sm rounded-xl"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Motivo</span>
          <input
            v-model="unavailForm.reason"
            class="input input-bordered input-sm rounded-xl"
          />
        </label>
        <button type="submit" class="btn btn-primary btn-sm rounded-xl">Registrar</button>
      </form>

      <EmptyState
        v-if="!schedules.unavailabilities.length"
        title="Sem registros"
        message="Nenhuma indisponibilidade cadastrada."
      />
      <ul v-else class="panel divide-y divide-slate-700">
        <li
          v-for="u in schedules.unavailabilities"
          :key="u.id"
          class="p-4 flex justify-between gap-3 items-center"
        >
          <div>
            <p class="font-medium text-slate-200">{{ acolyteName(u.acolyte_id) }}</p>
            <p class="text-sm text-slate-400">
              {{ fmtDate(u.date) }} — {{ u.reason || 'Sem motivo' }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-ghost btn-xs text-error rounded-lg"
            @click="removeUnavail(u.id)"
          >
            Apagar
          </button>
        </li>
      </ul>
    </template>

    <template v-else>
      <div v-if="canManageSubs && schedules.substitutions.length" class="panel p-4 mb-4">
        <label class="form-control w-full max-w-xs">
          <span class="label-text mb-1">Coroinha substituto padrão</span>
          <select
            v-model="acceptForm.replacement_acolyte_id"
            class="select select-bordered select-sm rounded-xl"
          >
            <option v-for="a in acolytes.items" :key="a.id" :value="a.id">{{ a.full_name }}</option>
          </select>
        </label>
      </div>

      <EmptyState
        v-if="!schedules.substitutions.length"
        title="Nenhuma aberta"
        message="Solicitações de substituição aparecerão aqui."
      />
      <ul v-else class="panel divide-y divide-slate-700">
        <li
          v-for="s in schedules.substitutions"
          :key="s.id"
          class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div>
            <p class="font-medium text-slate-200">Atribuição #{{ s.assignment_id }}</p>
            <p class="text-sm text-slate-400">{{ s.reason || 'Sem motivo' }}</p>
            <StatusBadge :status="s.status" class="mt-1" />
          </div>
          <button
            v-if="canManageSubs && s.status === 'ABERTA'"
            type="button"
            class="btn btn-primary btn-sm rounded-xl"
            @click="acceptSub(s)"
          >
            Aceitar substituto
          </button>
        </li>
      </ul>
    </template>

    <CelebrationForm
      v-model:visible="showForm"
      :communities="communities.items"
      :saving="saving"
      @save="onCreate"
    />
  </div>
</template>
