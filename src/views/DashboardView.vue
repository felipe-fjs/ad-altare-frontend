<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { getDashboard } from '@/api/dashboard'
import { useAppToast } from '@/composables/useToast'
import { useRole } from '@/composables/useRole'

const toast = useAppToast()
const router = useRouter()
const { canSeeDashboard } = useRole()
const loading = ref(true)
const data = ref(null)

onMounted(async () => {
  if (!canSeeDashboard.value) {
    router.replace({ name: 'schedules' })
    return
  }
  try {
    data.value = await getDashboard()
  } catch (err) {
    toast.fromError(err, 'Não foi possível carregar o dashboard')
  } finally {
    loading.value = false
  }
})

function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}
</script>

<template>
  <div>
    <PageHeader title="Dashboard" subtitle="Visão geral da pastoral de coroinhas" />

    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-amber-400" />
    </div>

    <template v-else-if="data">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="panel p-5">
          <p class="text-sm text-slate-400">Coroinhas ativos</p>
          <p class="font-display text-4xl text-amber-400 mt-1">{{ data.active_acolytes }}</p>
        </div>
        <div class="panel p-5">
          <p class="text-sm text-slate-400">Comunidades</p>
          <p class="font-display text-4xl text-amber-400 mt-1">{{ data.total_communities }}</p>
        </div>
        <div class="panel p-5">
          <p class="text-sm text-slate-400">Saldo em caixa</p>
          <p class="font-display text-3xl text-emerald-400 mt-1">{{ money(data.cash_balance_hint) }}</p>
        </div>
        <div class="panel p-5">
          <p class="text-sm text-slate-400">Arrecadado no mês</p>
          <p class="font-display text-3xl text-emerald-400 mt-1">
            {{ money(data.finance?.total_collected) }}
          </p>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="panel p-5">
          <h2 class="font-display text-2xl text-amber-400 mb-4">Aniversariantes do mês</h2>
          <EmptyState
            v-if="!data.birthdays_this_month?.length"
            title="Sem aniversários"
            message="Nenhum coroinha faz aniversário neste mês."
          />
          <ul v-else class="divide-y divide-slate-700">
            <li
              v-for="b in data.birthdays_this_month"
              :key="b.acolyte_id"
              class="py-3 flex justify-between gap-3"
            >
              <div>
                <p class="font-medium text-slate-200">{{ b.full_name }}</p>
                <p class="text-sm text-slate-400">{{ b.community_name }}</p>
              </div>
              <span class="text-sm text-emerald-400">{{ fmtDate(b.birth_date) }}</span>
            </li>
          </ul>
        </section>

        <section class="panel p-5">
          <h2 class="font-display text-2xl text-amber-400 mb-4">Próximas escalas</h2>
          <EmptyState
            v-if="!data.upcoming_celebrations?.length"
            title="Nenhuma celebração"
            message="Cadastre missas em Escalas para vê-las aqui."
          />
          <ul v-else class="divide-y divide-slate-700">
            <li
              v-for="c in data.upcoming_celebrations"
              :key="c.id"
              class="py-3 cursor-pointer hover:bg-slate-700/60 rounded-lg px-1"
              @click="router.push({ name: 'celebration-detail', params: { id: c.id } })"
            >
              <div class="flex justify-between gap-3">
                <div>
                  <p class="font-medium text-slate-200">{{ c.title || c.celebration_type }}</p>
                  <p class="text-sm text-slate-400">{{ c.community_name }}</p>
                </div>
                <div class="text-right text-sm">
                  <p class="text-amber-400">{{ fmtDate(c.date) }}</p>
                  <p class="text-slate-400">{{ String(c.time).slice(0, 5) }}</p>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </template>
  </div>
</template>
