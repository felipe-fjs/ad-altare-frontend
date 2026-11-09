<script setup>
import { onMounted, reactive } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import FinanceSummaryCards from '@/components/finance/FinanceSummaryCards.vue'
import ContributionTable from '@/components/finance/ContributionTable.vue'
import CashForm from '@/components/finance/CashForm.vue'
import { useFinanceStore } from '@/stores/finance'
import { useAcolytesStore } from '@/stores/acolytes'
import { useCommunitiesStore } from '@/stores/communities'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'

const finance = useFinanceStore()
const acolytes = useAcolytesStore()
const communities = useCommunitiesStore()
const { canWriteFinance, canSeeFinanceSummary } = useRole()
const toast = useAppToast()

const period = reactive({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

async function load() {
  try {
    const tasks = [
      finance.fetchContributions({
        reference_month: period.month,
        reference_year: period.year,
      }),
      finance.fetchCash(),
    ]
    if (canSeeFinanceSummary.value) {
      tasks.push(
        finance.fetchSummary({
          month: period.month,
          year: period.year,
        }),
      )
    }
    await Promise.all(tasks)
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar financeiro')
  }
}

onMounted(async () => {
  try {
    await Promise.all([acolytes.fetchAll(), communities.fetchAll()])
    await load()
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar')
  }
})
</script>

<template>
  <div>
    <PageHeader title="Financeiro" subtitle="Contribuições mensais e caixa da pastoral">
      <div class="flex flex-wrap gap-2 items-end">
        <label class="form-control">
          <span class="label-text mb-1">Mês</span>
          <input
            v-model.number="period.month"
            type="number"
            min="1"
            max="12"
            class="input input-bordered input-sm w-20 rounded-xl"
          />
        </label>
        <label class="form-control">
          <span class="label-text mb-1">Ano</span>
          <input
            v-model.number="period.year"
            type="number"
            min="2000"
            class="input input-bordered input-sm w-24 rounded-xl"
          />
        </label>
        <button type="button" class="btn btn-outline btn-sm rounded-xl" @click="load">
          Atualizar
        </button>
      </div>
    </PageHeader>

    <div v-if="finance.loading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg text-amber-400" />
    </div>

    <template v-else>
      <FinanceSummaryCards v-if="canSeeFinanceSummary" :summary="finance.summary" />

      <div
        v-if="finance.summary?.inadimplencia_by_community?.length"
        class="panel p-4 mb-6"
      >
        <h3 class="font-medium text-amber-400 mb-2">Inadimplência por comunidade</h3>
        <ul class="text-sm space-y-1">
          <li
            v-for="row in finance.summary.inadimplencia_by_community"
            :key="row.community_id"
            class="flex justify-between gap-3"
          >
            <span class="text-slate-200">{{ row.community_name }}</span>
            <span class="text-slate-400">
              {{ row.pending_count }} ·
              {{
                Number(row.pending_amount).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              }}
            </span>
          </li>
        </ul>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <ContributionTable
          :items="finance.contributions"
          :acolytes="acolytes.items"
          :can-write="canWriteFinance"
          @changed="load"
        />
        <CashForm
          :items="finance.cash"
          :communities="communities.items"
          :can-write="canWriteFinance"
          @changed="load"
        />
      </div>
    </template>
  </div>
</template>
