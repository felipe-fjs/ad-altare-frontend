<script setup>
import { reactive, ref } from 'vue'
import Dialog from 'primevue/dialog'
import EmptyState from '@/components/ui/EmptyState.vue'
import { createCashTransaction, deleteCashTransaction } from '@/api/finance'
import { useAppToast } from '@/composables/useToast'

const props = defineProps({
  items: { type: Array, default: () => [] },
  communities: { type: Array, default: () => [] },
  canWrite: { type: Boolean, default: false },
})

const emit = defineEmits(['changed'])
const toast = useAppToast()

const showForm = ref(false)
const saving = ref(false)
const form = reactive({
  community_id: '',
  tx_type: 'ENTRADA',
  amount: '',
  description: '',
  tx_date: new Date().toISOString().slice(0, 10),
})

function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}

function openCreate() {
  Object.assign(form, {
    community_id: '',
    tx_type: 'ENTRADA',
    amount: '',
    description: '',
    tx_date: new Date().toISOString().slice(0, 10),
  })
  showForm.value = true
}

async function save() {
  saving.value = true
  try {
    await createCashTransaction({
      community_id: form.community_id ? Number(form.community_id) : null,
      tx_type: form.tx_type,
      amount: form.amount,
      description: form.description.trim(),
      tx_date: form.tx_date,
    })
    toast.success('Lançamento registrado')
    showForm.value = false
    emit('changed')
  } catch (err) {
    toast.fromError(err, 'Falha ao lançar')
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  try {
    await deleteCashTransaction(id)
    toast.success('Lançamento removido')
    emit('changed')
  } catch (err) {
    toast.fromError(err, 'Falha ao remover')
  }
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-display text-2xl text-amber-400">Caixa</h2>
      <button
        v-if="canWrite"
        type="button"
        class="btn btn-primary btn-sm rounded-xl"
        @click="openCreate"
      >
        Lançar
      </button>
    </div>

    <EmptyState
      v-if="!items.length"
      title="Caixa vazio"
      message="Nenhum lançamento de entrada ou saída."
    />

    <ul v-else class="panel divide-y divide-slate-700">
      <li
        v-for="tx in items"
        :key="tx.id"
        class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div>
          <p class="font-medium text-slate-200">{{ tx.description }}</p>
          <p class="text-sm text-slate-400">{{ fmtDate(tx.tx_date) }} · {{ tx.tx_type }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="font-medium"
            :class="tx.tx_type === 'ENTRADA' ? 'text-emerald-400' : 'text-error'"
          >
            {{ tx.tx_type === 'ENTRADA' ? '+' : '-' }}{{ money(tx.amount) }}
          </span>
          <button
            v-if="canWrite"
            type="button"
            class="btn btn-ghost btn-xs text-error rounded-lg"
            @click="remove(tx.id)"
          >
            Apagar
          </button>
        </div>
      </li>
    </ul>

    <Dialog v-model:visible="showForm" modal header="Lançamento de caixa" class="w-full max-w-md">
      <form class="space-y-3 pt-2" @submit.prevent="save">
        <label class="form-control w-full">
          <span class="label-text mb-1">Tipo</span>
          <select v-model="form.tx_type" class="select select-bordered rounded-xl">
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Comunidade (opcional)</span>
          <select v-model="form.community_id" class="select select-bordered rounded-xl">
            <option value="">Geral</option>
            <option v-for="c in communities" :key="c.id" :value="String(c.id)">
              {{ c.name }}
            </option>
          </select>
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Valor</span>
          <input v-model="form.amount" required class="input input-bordered rounded-xl" />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Data</span>
          <input v-model="form.tx_date" type="date" required class="input input-bordered rounded-xl" />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Descrição</span>
          <input
            v-model="form.description"
            required
            minlength="2"
            class="input input-bordered rounded-xl"
          />
        </label>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-ghost rounded-xl" @click="showForm = false">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
            Salvar
          </button>
        </div>
      </form>
    </Dialog>
  </section>
</template>
