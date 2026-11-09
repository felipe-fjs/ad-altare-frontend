<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import AssignmentBoard from '@/components/schedules/AssignmentBoard.vue'
import WhatsAppExportButton from '@/components/schedules/WhatsAppExportButton.vue'
import { useSchedulesStore } from '@/stores/schedules'
import { useCommunitiesStore } from '@/stores/communities'
import { useAcolytesStore } from '@/stores/acolytes'
import { useAppToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const schedules = useSchedulesStore()
const communities = useCommunitiesStore()
const acolytes = useAcolytesStore()
const toast = useAppToast()

const id = computed(() => Number(route.params.id))
const celebration = computed(() => schedules.current)

const communityAcolytes = computed(() => {
  if (!celebration.value) return []
  return acolytes.items.filter(
    (a) => a.community_id === celebration.value.community_id && a.is_active,
  )
})

const communityName = computed(() => {
  const c = communities.items.find((x) => x.id === celebration.value?.community_id)
  return c?.name || ''
})

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}

async function reload() {
  await schedules.fetchCelebration(id.value)
}

onMounted(async () => {
  try {
    await Promise.all([
      communities.fetchAll(),
      acolytes.fetchAll({ is_active: true }),
      acolytes.fetchFunctions(),
      reload(),
    ])
  } catch (err) {
    toast.fromError(err, 'Celebração não encontrada')
    router.replace({ name: 'schedules' })
  }
})
</script>

<template>
  <div v-if="celebration">
    <button
      type="button"
      class="btn btn-ghost btn-sm rounded-xl mb-2 gap-2"
      @click="router.push({ name: 'schedules' })"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar
    </button>

    <PageHeader
      :title="celebration.title || celebration.celebration_type"
      :subtitle="`${communityName} · ${fmtDate(celebration.date)} · ${String(celebration.time).slice(0, 5)}`"
    >
      <WhatsAppExportButton :celebration-id="celebration.id" />
    </PageHeader>

    <p v-if="celebration.notes" class="text-slate-300 mb-6">{{ celebration.notes }}</p>

    <h2 class="font-display text-2xl text-amber-400 mb-3">Montagem da escala</h2>
    <AssignmentBoard
      :celebration-id="celebration.id"
      :assignments="schedules.assignments"
      :acolytes="communityAcolytes"
      :functions="acolytes.functions"
      @changed="reload"
    />
  </div>
</template>
