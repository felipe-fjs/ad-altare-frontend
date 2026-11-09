<script setup>
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  creatableRoles: { type: Array, default: () => [] },
  roleLabel: { type: Function, required: true },
  acolytes: { type: Array, default: () => [] },
  communities: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  email: '',
  full_name: '',
  role: '',
  use_provisional_password: true,
  password: '',
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
    return props.acolytes.filter((a) => !a.user_id)
  }
  return props.acolytes
})

watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.email = ''
      form.full_name = ''
      form.role = props.creatableRoles[0] || ''
      form.use_provisional_password = true
      form.password = ''
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
  const payload = {
    email: form.email.trim(),
    full_name: form.full_name.trim(),
    role: form.role,
    use_provisional_password: form.use_provisional_password,
    password: form.use_provisional_password ? null : form.password,
  }
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
    header="Novo usuário"
    class="w-full max-w-lg"
  >
    <form class="space-y-4 pt-2" @submit.prevent="submit">
      <label class="form-control w-full">
        <span class="label-text mb-1">E-mail</span>
        <input
          v-model="form.email"
          type="email"
          class="input input-bordered rounded-xl w-full"
          required
        />
      </label>

      <label class="form-control w-full">
        <span class="label-text mb-1">Nome completo</span>
        <input
          v-model="form.full_name"
          type="text"
          class="input input-bordered rounded-xl w-full"
          required
          minlength="2"
        />
      </label>

      <label class="form-control w-full">
        <span class="label-text mb-1">Nível de acesso</span>
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

      <label class="label cursor-pointer justify-start gap-3">
        <input
          v-model="form.use_provisional_password"
          type="checkbox"
          class="checkbox checkbox-primary"
        />
        <span class="label-text">Gerar senha provisória padrão (pnsc2026)</span>
      </label>

      <label v-if="!form.use_provisional_password" class="form-control w-full">
        <span class="label-text mb-1">Senha</span>
        <input
          v-model="form.password"
          type="password"
          class="input input-bordered rounded-xl w-full"
          required
          minlength="6"
        />
      </label>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost rounded-xl" @click="dialogVisible = false">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
          {{ saving ? 'Salvando...' : 'Criar usuário' }}
        </button>
      </div>
    </form>
  </Dialog>
</template>
