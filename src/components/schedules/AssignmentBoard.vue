<script setup>
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import {
  createAssignment,
  deleteAssignment,
  requestSubstitution,
} from '@/api/schedules'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  celebrationId: { type: Number, required: true },
  assignments: { type: Array, default: () => [] },
  acolytes: { type: Array, default: () => [] },
  functions: { type: Array, default: () => [] },
})

const emit = defineEmits(['changed'])

const toast = useAppToast()
const auth = useAuthStore()
const { canWriteSchedules, isCoroinha, isPais } = useRole()

const form = reactive({
  acolyte_id: null,
  function_code: '',
})

const forceOpen = ref(false)
const pendingPayload = ref(null)
const warnings = ref([])
const busy = ref(false)
const subReason = ref('')
const subTarget = ref(null)

const acolyteName = computed(() => {
  const map = Object.fromEntries(props.acolytes.map((a) => [a.id, a.full_name]))
  return (id) => map[id] || `#${id}`
})

watch(
  () => props.functions,
  (fns) => {
    if (!form.function_code && fns.length) form.function_code = fns[0].code
  },
  { immediate: true },
)

watch(
  () => props.acolytes,
  (list) => {
    if (!form.acolyte_id && list.length) form.acolyte_id = list[0].id
  },
  { immediate: true },
)

async function tryAdd(force = false) {
  busy.value = true
  const payload = {
    acolyte_id: Number(form.acolyte_id),
    function_code: form.function_code,
    force,
  }
  try {
    await createAssignment(props.celebrationId, payload)
    toast.success(force ? 'Atribuído com força' : 'Coroinha escalado')
    forceOpen.value = false
    pendingPayload.value = null
    emit('changed')
  } catch (err) {
    if (err.response?.status === 409) {
      const detail = err.response.data?.detail
      warnings.value = detail?.warnings || [detail?.message || 'Conflito na escala']
      pendingPayload.value = payload
      forceOpen.value = true
    } else {
      toast.fromError(err, 'Falha ao escalar')
    }
  } finally {
    busy.value = false
  }
}

async function forceConfirm() {
  if (!pendingPayload.value) return
  await tryAdd(true)
}

async function remove(id) {
  busy.value = true
  try {
    await deleteAssignment(id)
    toast.success('Atribuição removida')
    emit('changed')
  } catch (err) {
    toast.fromError(err, 'Falha ao remover')
  } finally {
    busy.value = false
  }
}

function canRequestSub(row) {
  if (isCoroinha.value && auth.acolyteId === row.acolyte_id) return true
  if (isPais.value) return true
  if (canWriteSchedules.value) return true
  return false
}

async function submitSub() {
  if (!subTarget.value) return
  busy.value = true
  try {
    await requestSubstitution(subTarget.value.id, {
      reason: subReason.value.trim() || null,
    })
    toast.success('Substituição solicitada')
    subTarget.value = null
    subReason.value = ''
    emit('changed')
  } catch (err) {
    toast.fromError(err, 'Falha na solicitação')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <form
      v-if="canWriteSchedules"
      class="panel p-4 grid gap-3 sm:grid-cols-3 items-end"
      @submit.prevent="tryAdd(false)"
    >
      <label class="form-control w-full">
        <span class="label-text mb-1">Coroinha</span>
        <select v-model="form.acolyte_id" required class="select select-bordered select-sm rounded-xl">
          <option v-for="a in acolytes" :key="a.id" :value="a.id">{{ a.full_name }}</option>
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Função</span>
        <select
          v-model="form.function_code"
          required
          class="select select-bordered select-sm rounded-xl"
        >
          <option v-for="f in functions" :key="f.code" :value="f.code">
            {{ f.emoji }} {{ f.name }}
          </option>
        </select>
      </label>
      <button type="submit" class="btn btn-primary btn-sm rounded-xl" :disabled="busy">
        Adicionar à escala
      </button>
    </form>

    <EmptyState
      v-if="!assignments.length"
      title="Escala vazia"
      message="Adicione coroinhas às funções desta celebração."
    />

    <ul v-else class="panel divide-y divide-slate-700">
      <li
        v-for="row in assignments"
        :key="row.id"
        class="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
      >
        <div>
          <p class="font-medium text-slate-200">{{ acolyteName(row.acolyte_id) }}</p>
          <p class="text-sm text-slate-400">{{ row.function_code }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="row.status" />
          <button
            v-if="canRequestSub(row) && row.status === 'CONFIRMADO'"
            type="button"
            class="btn btn-ghost btn-xs rounded-lg"
            @click="subTarget = row"
          >
            Não poderei ir
          </button>
          <button
            v-if="canWriteSchedules"
            type="button"
            class="btn btn-ghost btn-xs text-error rounded-lg"
            @click="remove(row.id)"
          >
            Remover
          </button>
        </div>
      </li>
    </ul>

    <Dialog v-model:visible="forceOpen" modal header="Forçar mesmo assim?" class="w-full max-w-md">
      <div class="space-y-3 pt-2">
        <p class="text-slate-300">Há avisos na validação da escala:</p>
        <ul class="list-disc pl-5 text-sm text-amber-400 space-y-1">
          <li v-for="(w, i) in warnings" :key="i">{{ w }}</li>
        </ul>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn btn-ghost rounded-xl" @click="forceOpen = false">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-warning rounded-xl"
            :disabled="busy"
            @click="forceConfirm"
          >
            Forçar atribuição
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog
      :visible="Boolean(subTarget)"
      modal
      header="Solicitar substituição"
      class="w-full max-w-md"
      @update:visible="(v) => !v && (subTarget = null)"
    >
      <form class="space-y-4 pt-2" @submit.prevent="submitSub">
        <label class="form-control w-full">
          <span class="label-text mb-1">Motivo</span>
          <textarea
            v-model="subReason"
            rows="3"
            class="textarea textarea-bordered rounded-xl"
            placeholder="Opcional"
          />
        </label>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-ghost rounded-xl" @click="subTarget = null">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary rounded-xl" :disabled="busy">
            Enviar
          </button>
        </div>
      </form>
    </Dialog>
  </section>
</template>
