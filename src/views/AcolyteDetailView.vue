<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import AcolyteFormModal from '@/components/acolytes/AcolyteFormModal.vue'
import GenerateAccessModal from '@/components/acolytes/GenerateAccessModal.vue'
import { useAcolytesStore } from '@/stores/acolytes'
import { useCommunitiesStore } from '@/stores/communities'
import { generateAccess, linkParent, unlinkParent } from '@/api/acolytes'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const acolytes = useAcolytesStore()
const communities = useCommunitiesStore()
const { canWriteAcolytes } = useRole()
const toast = useAppToast()

const showEdit = ref(false)
const showAccess = ref(false)
const saving = ref(false)
const accessSaving = ref(false)
const accessResult = ref(null)
const parentUserId = ref('')
const parentBusy = ref(false)

const id = computed(() => Number(route.params.id))
const a = computed(() => acolytes.current)
const communityName = computed(() => {
  const c = communities.items.find((x) => x.id === a.value?.community_id)
  return c?.name || `#${a.value?.community_id}`
})

onMounted(async () => {
  try {
    await Promise.all([
      communities.fetchAll(),
      acolytes.fetchFunctions(),
      acolytes.fetchOne(id.value),
    ])
  } catch (err) {
    toast.fromError(err, 'Coroinha não encontrado')
    router.replace({ name: 'acolytes' })
  }
})

function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('-')
  return `${day}/${m}/${y}`
}

async function onSave(payload) {
  saving.value = true
  try {
    await acolytes.update(id.value, payload)
    toast.success('Dados atualizados')
    showEdit.value = false
  } catch (err) {
    toast.fromError(err, 'Falha ao salvar')
  } finally {
    saving.value = false
  }
}

async function onGenerate(payload) {
  accessSaving.value = true
  try {
    accessResult.value = await generateAccess(id.value, payload)
    await acolytes.fetchOne(id.value)
    toast.success(accessResult.value.message)
  } catch (err) {
    toast.fromError(err, 'Não foi possível gerar acesso')
  } finally {
    accessSaving.value = false
  }
}

function openAccess() {
  accessResult.value = null
  showAccess.value = true
}

async function onLinkParent() {
  const uid = Number(parentUserId.value)
  if (!uid) return
  parentBusy.value = true
  try {
    const res = await linkParent(id.value, uid)
    toast.success(res.message || 'Responsável vinculado')
    parentUserId.value = ''
  } catch (err) {
    toast.fromError(err, 'Falha ao vincular')
  } finally {
    parentBusy.value = false
  }
}

async function onUnlinkParent() {
  const uid = Number(parentUserId.value)
  if (!uid) return
  parentBusy.value = true
  try {
    const res = await unlinkParent(id.value, uid)
    toast.success(res.message || 'Vínculo removido')
    parentUserId.value = ''
  } catch (err) {
    toast.fromError(err, 'Falha ao desvincular')
  } finally {
    parentBusy.value = false
  }
}
</script>

<template>
  <div v-if="a">
    <button
      type="button"
      class="btn btn-ghost btn-sm rounded-xl mb-2 gap-2"
      @click="router.push({ name: 'acolytes' })"
    >
      <ArrowLeft class="h-4 w-4" />
      Voltar
    </button>

    <PageHeader :title="a.full_name" :subtitle="communityName">
      <button
        v-if="canWriteAcolytes"
        type="button"
        class="btn btn-outline rounded-xl"
        @click="showEdit = true"
      >
        Editar
      </button>
      <button
        v-if="canWriteAcolytes && !a.user_id"
        type="button"
        class="btn btn-primary rounded-xl"
        @click="openAccess"
      >
        Gerar acesso
      </button>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="panel p-5 space-y-3">
        <h2 class="font-display text-2xl text-amber-400">Dados</h2>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-slate-400">Nascimento</dt>
            <dd class="text-slate-200">{{ fmtDate(a.birth_date) }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Investidura</dt>
            <dd class="text-slate-200">{{ fmtDate(a.investiture_date) }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Nível</dt>
            <dd class="text-slate-200">{{ a.experience_level }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Túnica</dt>
            <dd class="text-slate-200">{{ a.vestment_size || '—' }} / {{ a.vestment_number || '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Login</dt>
            <dd class="text-slate-200">{{ a.user_id ? `Usuário #${a.user_id}` : 'Sem acesso' }}</dd>
          </div>
          <div>
            <dt class="text-slate-400">Status</dt>
            <dd class="text-slate-200">{{ a.is_active ? 'Ativo' : 'Inativo' }}</dd>
          </div>
        </dl>
        <div>
          <p class="text-slate-400 text-sm mb-1">Habilidades</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="s in a.skills"
              :key="s"
              class="badge badge-outline badge-sm"
            >{{ s }}</span>
            <span v-if="!a.skills?.length" class="text-sm text-slate-400">Nenhuma</span>
          </div>
        </div>
      </section>

      <section v-if="canWriteAcolytes" class="panel p-5 space-y-4">
        <h2 class="font-display text-2xl text-amber-400">Responsáveis (pais)</h2>
        <p class="text-sm text-slate-400">
          Vincule ou remova um usuário com perfil PAIS informando o ID do usuário.
        </p>
        <label class="form-control w-full max-w-xs">
          <span class="label-text mb-1">ID do usuário</span>
          <input
            v-model="parentUserId"
            type="number"
            min="1"
            class="input input-bordered rounded-xl"
          />
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-primary btn-sm rounded-xl"
            :disabled="parentBusy || !parentUserId"
            @click="onLinkParent"
          >
            Vincular
          </button>
          <button
            type="button"
            class="btn btn-outline btn-sm rounded-xl"
            :disabled="parentBusy || !parentUserId"
            @click="onUnlinkParent"
          >
            Desvincular
          </button>
        </div>
      </section>
    </div>

    <AcolyteFormModal
      v-model:visible="showEdit"
      :acolyte="a"
      :communities="communities.items"
      :functions="acolytes.functions"
      :saving="saving"
      @save="onSave"
    />
    <GenerateAccessModal
      v-model:visible="showAccess"
      :acolyte-name="a.full_name"
      :saving="accessSaving"
      :result="accessResult"
      @generate="onGenerate"
    />
  </div>
</template>
