<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Church,
  Users,
  UserCog,
  UsersRound,
  CalendarDays,
  Wallet,
  LogOut,
  ChevronDown,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRole } from '@/composables/useRole'

const emit = defineEmits(['navigate'])
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { canSeeDashboard, canSeeCommunities, canManageUsers, canSeeParents, roleLabel } = useRole()

const peopleChildren = computed(() => {
  const all = [
    { name: 'users', label: 'Gestão de usuários', icon: UserCog, show: canManageUsers.value },
    { name: 'parents', label: 'Responsáveis', icon: UsersRound, show: canSeeParents.value },
    { name: 'acolytes', label: 'Coroinhas', icon: Users, show: true },
  ]
  return all.filter((l) => l.show)
})

const topLinks = computed(() => {
  const all = [
    { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: canSeeDashboard.value },
    { name: 'communities', label: 'Comunidades', icon: Church, show: canSeeCommunities.value },
  ]
  return all.filter((l) => l.show)
})

const bottomLinks = computed(() => [
  { name: 'schedules', label: 'Escalas', icon: CalendarDays },
  { name: 'finance', label: 'Financeiro', icon: Wallet },
])

function isPeopleSectionActive() {
  const current = String(route.name || '')
  return (
    current === 'users' ||
    current === 'parents' ||
    current === 'acolytes' ||
    current.startsWith('acolyte')
  )
}

const peopleOpen = ref(isPeopleSectionActive())

watch(
  () => route.name,
  () => {
    if (isPeopleSectionActive()) peopleOpen.value = true
  },
)

function isActive(name) {
  const current = String(route.name || '')
  if (route.name === name) return true
  if (name === 'acolytes' && current.startsWith('acolyte')) return true
  if (name === 'schedules' && (current.startsWith('schedule') || current.startsWith('celebration'))) {
    return true
  }
  return false
}

function go(name) {
  router.push({ name })
  emit('navigate')
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="flex h-full flex-col bg-slate-800 border-r border-slate-700">
    <div class="px-5 pt-6 pb-4">
      <p class="text-xs uppercase tracking-[0.18em] text-emerald-400">Pastoral</p>
      <h1 class="font-display text-3xl text-amber-400 leading-tight">Ad Altare</h1>
    </div>

    <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
      <button
        v-for="link in topLinks"
        :key="link.name"
        type="button"
        class="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition"
        :class="
          isActive(link.name)
            ? 'bg-slate-700 text-amber-400 font-semibold'
            : 'text-slate-300 hover:bg-slate-700 hover:text-amber-400'
        "
        @click="go(link.name)"
      >
        <component
          :is="link.icon"
          class="h-5 w-5 shrink-0"
          :class="isActive(link.name) ? 'text-emerald-400' : ''"
        />
        <span>{{ link.label }}</span>
      </button>

      <div v-if="peopleChildren.length" class="space-y-1">
        <button
          type="button"
          class="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition"
          :class="
            isPeopleSectionActive()
              ? 'text-amber-400 font-semibold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-amber-400'
          "
          :aria-expanded="peopleOpen"
          @click="peopleOpen = !peopleOpen"
        >
          <Users
            class="h-5 w-5 shrink-0"
            :class="isPeopleSectionActive() ? 'text-emerald-400' : ''"
          />
          <span class="flex-1">Pessoas</span>
          <ChevronDown
            class="h-4 w-4 shrink-0 transition-transform duration-200"
            :class="peopleOpen ? 'rotate-180' : ''"
          />
        </button>

        <div v-show="peopleOpen" class="space-y-0.5 pl-2">
          <button
            v-for="link in peopleChildren"
            :key="link.name"
            type="button"
            class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition"
            :class="
              isActive(link.name)
                ? 'bg-slate-700 text-amber-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-amber-400'
            "
            @click="go(link.name)"
          >
            <component
              :is="link.icon"
              class="h-4 w-4 shrink-0"
              :class="isActive(link.name) ? 'text-emerald-400' : ''"
            />
            <span>{{ link.label }}</span>
          </button>
        </div>
      </div>

      <button
        v-for="link in bottomLinks"
        :key="link.name"
        type="button"
        class="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition"
        :class="
          isActive(link.name)
            ? 'bg-slate-700 text-amber-400 font-semibold'
            : 'text-slate-300 hover:bg-slate-700 hover:text-amber-400'
        "
        @click="go(link.name)"
      >
        <component
          :is="link.icon"
          class="h-5 w-5 shrink-0"
          :class="isActive(link.name) ? 'text-emerald-400' : ''"
        />
        <span>{{ link.label }}</span>
      </button>
    </nav>

    <div class="border-t border-slate-700 p-4">
      <p class="font-medium text-slate-200 truncate">{{ auth.fullName }}</p>
      <p class="text-xs text-slate-400 mb-3">{{ roleLabel(auth.role) }}</p>
      <button
        type="button"
        class="btn btn-ghost btn-sm w-full justify-start gap-2 text-slate-300 hover:text-amber-400"
        @click="logout"
      >
        <LogOut class="h-4 w-4 text-emerald-400" />
        Sair
      </button>
    </div>
  </aside>
</template>
