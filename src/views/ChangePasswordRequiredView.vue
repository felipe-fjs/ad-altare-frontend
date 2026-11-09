<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppToast } from '@/composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useAppToast()
const saving = ref(false)
const form = reactive({
  new_password: '',
  confirm_password: '',
})

async function submit() {
  if (form.new_password.length < 6) {
    toast.error('A nova senha deve ter ao menos 6 caracteres')
    return
  }
  if (form.new_password !== form.confirm_password) {
    toast.error('As senhas não coincidem')
    return
  }
  saving.value = true
  try {
    await auth.completePasswordChange(form.new_password, form.confirm_password)
    toast.success('Senha atualizada')
    if (['PAIS', 'COROINHA'].includes(auth.role)) {
      await router.replace({ name: 'schedules' })
    } else {
      await router.replace({ name: 'dashboard' })
    }
  } catch (err) {
    toast.fromError(err, 'Não foi possível atualizar a senha')
  } finally {
    saving.value = false
  }
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
    <div class="w-full max-w-md panel p-8 shadow-xl">
      <p class="text-xs uppercase tracking-[0.18em] text-emerald-400">Segurança</p>
      <h1 class="font-display text-3xl text-amber-400 mt-1">Redefinir senha</h1>
      <p class="text-slate-300 mt-3 text-sm leading-relaxed">
        Sua conta está com senha provisória. Defina uma nova senha para continuar.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <label class="form-control w-full">
          <span class="label-text mb-1">Nova senha</span>
          <input
            v-model="form.new_password"
            type="password"
            class="input input-bordered rounded-xl w-full"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Confirmar nova senha</span>
          <input
            v-model="form.confirm_password"
            type="password"
            class="input input-bordered rounded-xl w-full"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>
        <button
          type="submit"
          class="btn btn-primary rounded-xl w-full"
          :disabled="saving"
        >
          {{ saving ? 'Salvando...' : 'Salvar nova senha' }}
        </button>
      </form>

      <button type="button" class="btn btn-ghost btn-sm mt-4 w-full text-slate-400" @click="logout">
        Sair
      </button>
    </div>
  </div>
</template>
