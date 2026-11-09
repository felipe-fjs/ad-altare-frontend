<script setup>
import { computed, onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import UserFormModal from '@/components/users/UserFormModal.vue'
import EditRoleModal from '@/components/users/EditRoleModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useRole } from '@/composables/useRole'
import { useAppToast } from '@/composables/useToast'
import { useAcolytesStore } from '@/stores/acolytes'
import { useCommunitiesStore } from '@/stores/communities'
import * as usersApi from '@/api/users'

const auth = useAuthStore()
const toast = useAppToast()
const acolytes = useAcolytesStore()
const communities = useCommunitiesStore()
const { creatableRoles, canManageTargetUser, roleLabel } = useRole()

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const showCreate = ref(false)
const showEditRole = ref(false)
const editingUser = ref(null)
const lastTempPassword = ref(null)

const currentUserId = computed(() => auth.user?.id)

async function load() {
  loading.value = true
  try {
    items.value = await usersApi.listUsers()
  } catch (err) {
    toast.fromError(err, 'Falha ao listar usuários')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      load(),
      acolytes.fetchAll({ is_active: true }),
      communities.fetchAll(),
    ])
  } catch (err) {
    toast.fromError(err, 'Falha ao carregar dados')
  }
})

function openCreate() {
  lastTempPassword.value = null
  showCreate.value = true
}

function openEditRole(row) {
  editingUser.value = row
  showEditRole.value = true
}

async function onCreate(payload) {
  saving.value = true
  try {
    await usersApi.createUser(payload)
    toast.success(
      payload.use_provisional_password
        ? 'Usuário criado. Senha provisória: pnsc2026'
        : 'Usuário criado',
    )
    if (payload.use_provisional_password) {
      lastTempPassword.value = 'pnsc2026'
    }
    showCreate.value = false
    await load()
  } catch (err) {
    toast.fromError(err, 'Não foi possível criar o usuário')
  } finally {
    saving.value = false
  }
}

async function onEditRole(payload) {
  if (!editingUser.value) return
  saving.value = true
  try {
    await usersApi.updateUserRole(editingUser.value.id, payload)
    toast.success('Nível atualizado')
    showEditRole.value = false
    await load()
  } catch (err) {
    toast.fromError(err, 'Não foi possível atualizar o nível')
  } finally {
    saving.value = false
  }
}

function canEditRole(row) {
  return (
    creatableRoles.value.length > 0 &&
    !isSelf(row) &&
    row.role !== 'ADMIN_MASTER' &&
    canManageTargetUser(row)
  )
}

async function toggleStatus(row) {
  if (!canManageTargetUser(row)) return
  try {
    await usersApi.updateUserStatus(row.id, !row.is_active)
    toast.success(row.is_active ? 'Usuário suspenso' : 'Usuário reativado')
    await load()
  } catch (err) {
    toast.fromError(err, 'Não foi possível alterar o status')
  }
}

async function resetPassword(row) {
  if (!canManageTargetUser(row)) return
  try {
    const result = await usersApi.adminResetProvisionalPassword(row.id)
    lastTempPassword.value = result.temporary_password
    toast.success(`Senha provisória: ${result.temporary_password}`)
    await load()
  } catch (err) {
    toast.fromError(err, 'Não foi possível resetar a senha')
  }
}

function isSelf(row) {
  return row.id === currentUserId.value
}
</script>

<template>
  <div>
    <PageHeader title="Gestão de Usuários" subtitle="Contas, níveis de acesso e senhas provisórias">
      <button type="button" class="btn btn-primary rounded-xl" @click="openCreate">
        Novo usuário
      </button>
    </PageHeader>

    <div v-if="lastTempPassword" class="alert alert-warning rounded-xl mb-4">
      <span>Última senha provisória gerada: <strong class="font-mono">{{ lastTempPassword }}</strong></span>
    </div>

    <div class="panel overflow-hidden">
      <DataTable
        :value="items"
        :loading="loading"
        data-key="id"
        class="text-sm"
        striped-rows
        responsive-layout="scroll"
      >
        <template #empty>
          <EmptyState title="Nenhum usuário" description="Crie o primeiro acesso desta hierarquia." />
        </template>
        <Column field="full_name" header="Nome" />
        <Column field="email" header="E-mail" />
        <Column header="Nível">
          <template #body="{ data }">
            {{ roleLabel(data.role) }}
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <span
              class="badge rounded-lg"
              :class="data.is_active ? 'badge-success' : 'badge-ghost'"
            >
              {{ data.is_active ? 'Ativo' : 'Inativo' }}
            </span>
            <span
              v-if="data.must_change_password"
              class="badge badge-warning rounded-lg ml-1"
            >
              Senha provisória
            </span>
          </template>
        </Column>
        <Column header="Ações" style="min-width: 16rem">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-2">
              <button
                v-if="canEditRole(data)"
                type="button"
                class="btn btn-ghost btn-xs rounded-lg"
                @click="openEditRole(data)"
              >
                Editar nível
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs rounded-lg"
                :disabled="isSelf(data) || !canManageTargetUser(data)"
                @click="toggleStatus(data)"
              >
                {{ data.is_active ? 'Suspender' : 'Reativar' }}
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs rounded-lg"
                :disabled="isSelf(data) || !canManageTargetUser(data)"
                @click="resetPassword(data)"
              >
                Resetar senha
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <UserFormModal
      v-model:visible="showCreate"
      :saving="saving"
      :creatable-roles="creatableRoles"
      :role-label="roleLabel"
      :acolytes="acolytes.items"
      :communities="communities.items"
      @save="onCreate"
    />

    <EditRoleModal
      v-model:visible="showEditRole"
      :saving="saving"
      :user="editingUser"
      :creatable-roles="creatableRoles"
      :role-label="roleLabel"
      :acolytes="acolytes.items"
      :communities="communities.items"
      @save="onEditRole"
    />
  </div>
</template>
