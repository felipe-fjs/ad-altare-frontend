<script setup>
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  user: { type: Object, default: null },
  creatableRoles: { type: Array, default: () => [] },
  roleLabel: { type: Function, required: true },
  acolytes: { type: Array, default: () => [] },
  communities: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  role: '',
  acolyte_id: '',
  community_id: '',
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const needsAcolyte = computed(
  () => form.role === 'COROINHA' || form.role === 'PAIS',
)
const needsCommunity = computed(() => form.role === 'COORD_COMUNIDADE')
const isElevated = computed(() =>
  ['ADMIN_GERAL', 'PADRE', 'FINANCEIRO'].includes(form.role),
)

const acolyteOptions = computed(() => {
  if (form.role === 'COROINHA') {
    const currentId = props.user?.id
    return props.acolytes.filter((a) => !a.user_id || a.user_id === currentId)
  }
  return props.acolytes
})

watch(
  () => props.visible,
  (v) => {
    if (v && props.user) {
      form.role = props.user.role
      form.acolyte_id = ''
      form.community_id = ''
    }
  },
)

watch(
  () => form.role,
  () => {
    form.acolyte_id = ''
    form.community_id = ''
  },
)

function submit() {
  const payload = { role: form.role }
  if (needsAcolyte.value) {
    payload.acolyte_id = Number(form.acolyte_id)
  }
  if (needsCommunity.value) {
    payload.community_id = Number(form.community_id)
  }
  emit('save', payload)
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Editar nível de acesso"
    class="w-full max-w-md"
  >
    <form class="space-y-4 pt-2" @submit.prevent="submit">
      <p v-if="user" class="text-sm text-slate-300">
        {{ user.full_name }}
        <span class="text-slate-500">({{ user.email }})</span>
      </p>

      <label class="form-control w-full">
        <span class="label-text mb-1">Nível</span>
        <select v-model="form.role" class="select select-bordered rounded-xl w-full" required>
          <option v-for="role in creatableRoles" :key="role" :value="role">
            {{ roleLabel(role) }}
          </option>
        </select>
      </label>

      <label v-if="needsAcolyte" class="form-control w-full">
        <span class="label-text mb-1">
          {{ form.role === 'COROINHA' ? 'Vincular coroinha' : 'Vincular a coroinha (responsável)' }}
        </span>
        <select v-model="form.acolyte_id" class="select select-bordered rounded-xl w-full" required>
          <option value="" disabled>Selecione</option>
          <option v-for="a in acolyteOptions" :key="a.id" :value="String(a.id)">
            {{ a.full_name }}
          </option>
        </select>
      </label>

      <label v-else-if="needsCommunity" class="form-control w-full">
        <span class="label-text mb-1">Comunidade</span>
        <select v-model="form.community_id" class="select select-bordered rounded-xl w-full" required>
          <option value="" disabled>Selecione</option>
          <option v-for="c in communities" :key="c.id" :value="String(c.id)">
            {{ c.name }}
          </option>
        </select>
      </label>

      <p v-else-if="isElevated" class="text-sm text-slate-400">
        Este nível não exige vínculo com coroinha ou comunidade.
      </p>

      <p v-if="!creatableRoles.length" class="text-sm text-amber-400">
        Não há níveis disponíveis para o seu perfil.
      </p>

      <p v-else-if="needsAcolyte || needsCommunity" class="text-sm text-slate-500">
        Papéis com vínculo exigem comunidade ou coroinha ao salvar.
      </p>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost rounded-xl" @click="dialogVisible = false">
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary rounded-xl"
          :disabled="saving || !creatableRoles.length"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Dialog>
</template>
