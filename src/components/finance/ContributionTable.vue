<script setup>
import { reactive, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { createContribution, updateContribution } from '@/api/finance'
import { useAppToast } from '@/composables/useToast'

const props = defineProps({
  items: { type: Array, default: () => [] },
  acolytes: { type: Array, default: () => [] },
  canWrite: { type: Boolean, default: false },
})

const emit = defineEmits(['changed'])
const toast = useAppToast()

const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({
  acolyte_id: null,
  reference_month: new Date().getMonth() + 1,
  reference_year: new Date().getFullYear(),
  amount: '30.00',
  payment_date: '',
  payment_method: 'PIX',
  status: 'PENDENTE',
  notes: '',
})

function acolyteName(id) {
  return props.acolytes.find((a) => a.id === id)?.full_name || `#${id}`
}

function openCreate() {
  editing.value = null
  Object.assign(form, {
    acolyte_id: props.acolytes[0]?.id ?? null,
    reference_month: new Date().getMonth() + 1,
    reference_year: new Date().getFullYear(),
    amount: '30.00',
    payment_date: '',
    payment_method: 'PIX',
    status: 'PENDENTE',
    notes: '',
  })
  showForm.value = true
}

function openEdit(row) {
  editing.value = row
  Object.assign(form, {
    acolyte_id: row.acolyte_id,
    reference_month: row.reference_month,
    reference_year: row.reference_year,
    amount: String(row.amount),
    payment_date: row.payment_date || '',
    payment_method: row.payment_method || 'PIX',
    status: row.status,
    notes: row.notes || '',
  })
  showForm.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      await updateContribution(editing.value.id, {
        amount: form.amount,
        payment_date: form.payment_date || null,
        payment_method: form.payment_method || null,
        status: form.status,
        notes: form.notes.trim() || null,
      })
      toast.success('Contribuição atualizada')
    } else {
      await createContribution({
        acolyte_id: Number(form.acolyte_id),
        reference_month: Number(form.reference_month),
        reference_year: Number(form.reference_year),
        amount: form.amount,
        payment_date: form.payment_date || null,
        payment_method: form.payment_method || null,
        status: form.status,
        notes: form.notes.trim() || null,
      })
      toast.success('Contribuição criada')
    }
    showForm.value = false
    emit('changed')
  } catch (err) {
    toast.fromError(err, 'Falha ao salvar contribuição')
  } finally {
    saving.value = false
  }
}

function money(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-display text-2xl text-amber-400">Contribuições</h2>
      <button
        v-if="canWrite"
        type="button"
        class="btn btn-primary btn-sm rounded-xl"
        @click="openCreate"
      >
        Nova
      </button>
    </div>

    <EmptyState
      v-if="!items.length"
      title="Sem contribuições"
      message="Nenhuma parcela encontrada para o período."
    />

    <div v-else class="panel overflow-hidden">
      <DataTable :value="items" paginator :rows="8" class="text-sm">
        <Column header="Coroinha">
          <template #body="{ data }">{{ acolyteName(data.acolyte_id) }}</template>
        </Column>
        <Column header="Ref.">
          <template #body="{ data }">
            {{ String(data.reference_month).padStart(2, '0') }}/{{ data.reference_year }}
          </template>
        </Column>
        <Column header="Valor">
          <template #body="{ data }">{{ money(data.amount) }}</template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <StatusBadge :status="data.status" />
          </template>
        </Column>
        <Column v-if="canWrite" header="">
          <template #body="{ data }">
            <button
              type="button"
              class="btn btn-ghost btn-xs rounded-lg"
              @click="openEdit(data)"
            >
              Editar
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showForm"
      modal
      :header="editing ? 'Editar contribuição' : 'Nova contribuição'"
      class="w-full max-w-lg"
    >
      <form class="grid gap-3 sm:grid-cols-2 pt-2" @submit.prevent="save">
        <label v-if="!editing" class="form-control w-full sm:col-span-2">
          <span class="label-text mb-1">Coroinha</span>
          <select v-model="form.acolyte_id" required class="select select-bordered rounded-xl">
            <option v-for="a in acolytes" :key="a.id" :value="a.id">{{ a.full_name }}</option>
          </select>
        </label>
        <label v-if="!editing" class="form-control w-full">
          <span class="label-text mb-1">Mês</span>
          <input
            v-model.number="form.reference_month"
            type="number"
            min="1"
            max="12"
            required
            class="input input-bordered rounded-xl"
          />
        </label>
        <label v-if="!editing" class="form-control w-full">
          <span class="label-text mb-1">Ano</span>
          <input
            v-model.number="form.reference_year"
            type="number"
            min="2000"
            required
            class="input input-bordered rounded-xl"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Valor</span>
          <input v-model="form.amount" required class="input input-bordered rounded-xl" />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Status</span>
          <select v-model="form.status" class="select select-bordered rounded-xl">
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ISENTO">Isento</option>
          </select>
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Pagamento</span>
          <input v-model="form.payment_date" type="date" class="input input-bordered rounded-xl" />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Método</span>
          <select v-model="form.payment_method" class="select select-bordered rounded-xl">
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
          </select>
        </label>
        <label class="form-control w-full sm:col-span-2">
          <span class="label-text mb-1">Notas</span>
          <input v-model="form.notes" class="input input-bordered rounded-xl" />
        </label>
        <div class="sm:col-span-2 flex justify-end gap-2">
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
