<script setup>
defineProps({
  summary: { type: Object, default: null },
})

function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <div v-if="summary" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
    <div class="panel p-5">
      <p class="text-sm text-slate-400">Arrecadado</p>
      <p class="font-display text-3xl text-emerald-400 mt-1">{{ money(summary.total_collected) }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm text-slate-400">Pendente</p>
      <p class="font-display text-3xl text-amber-400 mt-1">{{ money(summary.total_pending) }}</p>
      <p class="text-xs text-slate-400 mt-1">{{ summary.pending_count }} parcelas</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm text-slate-400">Saldo caixa</p>
      <p class="font-display text-3xl text-emerald-400 mt-1">{{ money(summary.cash_balance) }}</p>
    </div>
    <div class="panel p-5">
      <p class="text-sm text-slate-400">Entradas / Saídas</p>
      <p class="mt-2 text-sm">
        <span class="text-emerald-400 font-medium">{{ money(summary.cash_entries) }}</span>
        <span class="text-slate-400 mx-1">/</span>
        <span class="text-error font-medium">{{ money(summary.cash_exits) }}</span>
      </p>
    </div>
  </div>
</template>
