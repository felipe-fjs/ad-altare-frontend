<script setup>
import { onMounted, reactive, ref } from 'vue'
import Dialog from 'primevue/dialog'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useCommunitiesStore } from '@/stores/communities'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'

const store = useCommunitiesStore()
const { canWriteCommunities } = useRole()
const toast = useAppToast()

const showForm = ref(false)
const editingId = ref(null)
const saving = ref(false)
const form = reactive({
  name: '',
  slug: '',
  address: '',
  is_active: true,
})

onMounted(() => {
  store.fetchAll().catch((err) => toast.fromError(err, 'Falha ao listar comunidades'))
})

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', slug: '', address: '', is_active: true })
  showForm.value = true
}

function openEdit(c) {
  editingId.value = c.id
  Object.assign(form, {
    name: c.name,
    slug: c.slug,
    address: c.address || '',
    is_active: c.is_active,
  })
  showForm.value = true
}

function onNameInput() {
  if (!editingId.value) form.slug = slugify(form.name)
}

async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      address: form.address.trim() || null,
      is_active: form.is_active,
    }
    if (editingId.value) {
      await store.update(editingId.value, payload)
      toast.success('Comunidade atualizada')
    } else {
      await store.create(payload)
      toast.success('Comunidade criada')
    }
    showForm.value = false
  } catch (err) {
    toast.fromError(err, 'Não foi possível salvar')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="Comunidades" subtitle="Capelas e comunidades da paróquia">
      <button
        v-if="canWriteCommunities"
        type="button"
        class="btn btn-primary rounded-xl"
        @click="openCreate"
      >
        Nova comunidade
      </button>
    </PageHeader>

    <div v-if="store.loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-amber-400" />
    </div>

    <EmptyState
      v-else-if="!store.items.length"
      title="Nenhuma comunidade"
      message="Cadastre a primeira comunidade para organizar coroinhas e escalas."
    >
      <button
        v-if="canWriteCommunities"
        type="button"
        class="btn btn-primary rounded-xl"
        @click="openCreate"
      >
        Cadastrar
      </button>
    </EmptyState>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <article
        v-for="c in store.items"
        :key="c.id"
        class="panel p-5 flex flex-col gap-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-display text-2xl text-amber-400">{{ c.name }}</h2>
            <p class="text-sm text-slate-400">{{ c.slug }}</p>
          </div>
          <span
            class="badge badge-sm"
            :class="c.is_active ? 'badge-success' : 'badge-ghost'"
          >
            {{ c.is_active ? 'Ativa' : 'Inativa' }}
          </span>
        </div>
        <p class="text-slate-300 text-sm flex-1">{{ c.address || 'Sem endereço' }}</p>
        <button
          v-if="canWriteCommunities"
          type="button"
          class="btn btn-ghost btn-sm self-start rounded-xl"
          @click="openEdit(c)"
        >
          Editar
        </button>
      </article>
    </div>

    <Dialog
      v-model:visible="showForm"
      modal
      :header="editingId ? 'Editar comunidade' : 'Nova comunidade'"
      class="w-full max-w-lg"
      :pt="{ root: { class: 'rounded-xl' } }"
    >
      <form class="space-y-4 pt-2" @submit.prevent="save">
        <label class="form-control w-full">
          <span class="label-text mb-1">Nome</span>
          <input
            v-model="form.name"
            required
            class="input input-bordered w-full rounded-xl"
            @input="onNameInput"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Slug</span>
          <input
            v-model="form.slug"
            required
            pattern="[a-z0-9\-]+"
            class="input input-bordered w-full rounded-xl"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text mb-1">Endereço</span>
          <input v-model="form.address" class="input input-bordered w-full rounded-xl" />
        </label>
        <label class="label cursor-pointer justify-start gap-3">
          <input v-model="form.is_active" type="checkbox" class="checkbox checkbox-primary" />
          <span class="label-text">Ativa</span>
        </label>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn btn-ghost rounded-xl" @click="showForm = false">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
            Salvar
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>
