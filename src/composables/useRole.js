import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const ROLES = {
  MASTER: 'ADMIN_MASTER',
  ADMIN: 'ADMIN_GERAL',
  FINANCEIRO: 'FINANCEIRO',
  COORD: 'COORD_COMUNIDADE',
  PAIS: 'PAIS',
  COROINHA: 'COROINHA',
  PADRE: 'PADRE',
}

const CREATABLE = {
  ADMIN_MASTER: [
    'ADMIN_GERAL',
    'PADRE',
    'FINANCEIRO',
    'COORD_COMUNIDADE',
    'PAIS',
    'COROINHA',
  ],
  ADMIN_GERAL: ['COORD_COMUNIDADE', 'PAIS', 'COROINHA'],
  PADRE: ['COORD_COMUNIDADE', 'PAIS', 'COROINHA'],
  COORD_COMUNIDADE: ['PAIS', 'COROINHA'],
}

export function useRole() {
  const auth = useAuthStore()

  const isMaster = computed(() => auth.role === ROLES.MASTER)
  const isAdmin = computed(() => auth.role === ROLES.ADMIN)
  const isFinanceiro = computed(() => auth.role === ROLES.FINANCEIRO)
  const isCoord = computed(() => auth.role === ROLES.COORD)
  const isPais = computed(() => auth.role === ROLES.PAIS)
  const isCoroinha = computed(() => auth.role === ROLES.COROINHA)
  const isPadre = computed(() => auth.role === ROLES.PADRE)

  const isAdminOperacional = computed(() => isMaster.value || isAdmin.value)

  const canWriteCommunities = computed(() => isAdminOperacional.value)
  const canWriteAcolytes = computed(() => isAdminOperacional.value || isCoord.value)
  const canWriteSchedules = computed(() => isAdminOperacional.value || isCoord.value)
  const canWriteFinance = computed(() => isAdminOperacional.value || isFinanceiro.value)
  const canSeeDashboard = computed(
    () =>
      isMaster.value ||
      isAdmin.value ||
      isPadre.value ||
      isFinanceiro.value ||
      isCoord.value,
  )
  const canSeeCommunities = computed(
    () =>
      isMaster.value ||
      isAdmin.value ||
      isPadre.value ||
      isFinanceiro.value ||
      isCoord.value,
  )
  const canSeeFinanceSummary = computed(
    () =>
      isMaster.value ||
      isAdmin.value ||
      isPadre.value ||
      isFinanceiro.value ||
      isCoord.value,
  )

  const canManageUsers = computed(
    () => isMaster.value || isAdmin.value || isPadre.value || isCoord.value,
  )
  const canSeeParents = computed(() => canManageUsers.value)

  const creatableRoles = computed(() => CREATABLE[auth.role] || [])

  function canManageTargetUser(target) {
    if (!target || target.id === auth.user?.id) return false
    if (target.role === ROLES.MASTER) return false
    return creatableRoles.value.includes(target.role)
  }

  function roleLabel(role) {
    const map = {
      ADMIN_MASTER: 'Admin Master',
      ADMIN_GERAL: 'Coordenador Geral',
      FINANCEIRO: 'Financeiro',
      COORD_COMUNIDADE: 'Coord. Comunidade',
      PAIS: 'Responsável',
      COROINHA: 'Coroinha',
      PADRE: 'Padre',
    }
    return map[role] || role
  }

  return {
    ROLES,
    isMaster,
    isAdmin,
    isAdminOperacional,
    isFinanceiro,
    isCoord,
    isPais,
    isCoroinha,
    isPadre,
    canWriteCommunities,
    canWriteAcolytes,
    canWriteSchedules,
    canWriteFinance,
    canSeeDashboard,
    canSeeCommunities,
    canSeeFinanceSummary,
    canManageUsers,
    canSeeParents,
    creatableRoles,
    canManageTargetUser,
    roleLabel,
  }
}
