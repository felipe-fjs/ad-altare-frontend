<script setup>
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  acolyteName: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  result: { type: Object, default: null },
})

const emit = defineEmits(['update:visible', 'generate'])

const form = reactive({
  email: '',
  password: '',
  full_name: '',
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

watch(
  () => props.visible,
  (v) => {
    if (v && !props.result) {
      form.email = ''
      form.password = ''
      form.full_name = props.acolyteName || ''
    }
  },
)

function submit() {
  emit('generate', {
    email: form.email.trim(),
    password: form.password.trim() || null,
    full_name: form.full_name.trim() || null,
  })
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Gerar acesso"
    class="w-full max-w-md"
  >
    <div v-if="result" class="space-y-3 pt-2">
      <p class="text-slate-300">{{ result.message }}</p>
      <p><span class="text-slate-400">Usuário:</span> {{ result.username }}</p>
      <p><span class="text-slate-400">E-mail:</span> {{ result.email }}</p>
      <div v-if="result.temporary_password" class="alert alert-warning rounded-xl">
        <div>
          <p class="font-medium">Senha temporária (copie agora)</p>
          <p class="font-mono text-lg mt-1">{{ result.temporary_password }}</p>
          <p class="text-sm mt-2">Esta senha não será exibida novamente.</p>
        </div>
      </div>
      <div class="flex justify-end">
        <button type="button" class="btn btn-primary rounded-xl" @click="dialogVisible = false">
          Fechar
        </button>
      </div>
    </div>

    <form v-else class="space-y-4 pt-2" @submit.prevent="submit">
      <p class="text-sm text-slate-400">
        Cria login de coroinha para <strong class="text-slate-200">{{ acolyteName }}</strong>.
      </p>
      <label class="form-control w-full">
        <span class="label-text mb-1">E-mail</span>
        <input v-model="form.email" type="email" required class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Nome no login</span>
        <input v-model="form.full_name" class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Senha (opcional)</span>
        <input
          v-model="form.password"
          type="text"
          minlength="6"
          class="input input-bordered rounded-xl"
          placeholder="Padrão provisória: pnsc2026"
        />
      </label>
      <div class="flex justify-end gap-2">
        <button type="button" class="btn btn-ghost rounded-xl" @click="dialogVisible = false">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
          Gerar
        </button>
      </div>
    </form>
  </Dialog>
</template>
