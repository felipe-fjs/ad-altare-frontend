<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const submitting = ref(false)
const localError = ref('')

async function onSubmit() {
  localError.value = ''
  submitting.value = true
  try {
    await auth.login(username.value.trim(), password.value)
    const redirect = route.query.redirect || '/'
    await router.replace(String(redirect))
  } catch (err) {
    localError.value = auth.error || err.response?.data?.detail || 'Não foi possível entrar'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <p class="text-xs uppercase tracking-[0.2em] text-emerald-400 mb-2">Pastoral de Coroinhas</p>
        <h1 class="font-display text-5xl text-amber-400">Ad Altare</h1>
        <p class="mt-3 text-slate-400">Entre com seu acesso paroquial</p>
      </div>

      <form class="panel p-6 md:p-8 space-y-4" @submit.prevent="onSubmit">
        <label class="form-control w-full">
          <span class="label-text mb-1">Usuário</span>
          <input
            v-model="username"
            type="text"
            required
            class="input input-bordered w-full rounded-xl"
            autocomplete="username"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Senha</span>
          <input
            v-model="password"
            type="password"
            required
            class="input input-bordered w-full rounded-xl"
            autocomplete="current-password"
          />
        </label>

        <p v-if="localError" class="text-error text-sm">{{ localError }}</p>

        <button
          type="submit"
          class="btn btn-primary w-full rounded-xl min-h-12"
          :class="{ loading: submitting }"
          :disabled="submitting"
        >
          Entrar
        </button>
      </form>
    </div>
  </div>
</template>
