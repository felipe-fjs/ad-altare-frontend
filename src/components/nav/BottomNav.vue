<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Church,
  Users,
  UserCog,
  UsersRound,
  CalendarDays,
  Wallet,
} from 'lucide-vue-next'
import { useRole } from '@/composables/useRole'

const route = useRoute()
const router = useRouter()
const { canSeeDashboard, canSeeCommunities, canManageUsers, canSeeParents } = useRole()

const peopleOpen = ref(false)
const rootEl = ref(null)

const peopleChildren = computed(() => {
  const all = [
    { name: 'users', label: 'Gestão de usuários', icon: UserCog, show: canManageUsers.value },
    { name: 'parents', label: 'Responsáveis', icon: UsersRound, show: canSeeParents.value },
    { name: 'acolytes', label: 'Coroinhas', icon: Users, show: true },
  ]
  return all.filter((l) => l.show)
})

const links = computed(() => {
  const all = [
    { name: 'dashboard', label: 'Início', icon: LayoutDashboard, show: canSeeDashboard.value },
    { name: 'communities', label: 'Comun.', icon: Church, show: canSeeCommunities.value },
    { name: 'people', label: 'Pessoas', icon: Users, show: peopleChildren.value.length > 0, isGroup: true },
    { name: 'schedules', label: 'Escalas', icon: CalendarDays, show: true },
    { name: 'finance', label: 'Finanças', icon: Wallet, show: true },
  ]
  return all.filter((l) => l.show)
})

function isPeopleSectionActive() {
  const current = String(route.name || '')
  return (
    current === 'users' ||
    current === 'parents' ||
    current === 'acolytes' ||
    current.startsWith('acolyte')
  )
}

function active(name) {
  if (name === 'people') return isPeopleSectionActive()
  const current = String(route.name || '')
  if (route.name === name) return true
  if (name === 'acolytes' && current.startsWith('acolyte')) return true
  if (name === 'schedules' && (current.startsWith('schedule') || current.startsWith('celebration'))) {
    return true
  }
  return false
}

function onLinkClick(link) {
  if (link.isGroup) {
    peopleOpen.value = !peopleOpen.value
    return
  }
  peopleOpen.value = false
  router.push({ name: link.name })
}

function goPeople(name) {
  peopleOpen.value = false
  router.push({ name })
}

function onDocClick(e) {
  if (!peopleOpen.value) return
  if (rootEl.value && !rootEl.value.contains(e.target)) {
    peopleOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <nav
    ref="rootEl"
    class="fixed bottom-0 inset-x-0 z-40 border-t border-slate-700 bg-slate-800/95 backdrop-blur md:hidden"
  >
    <div
      v-if="peopleOpen"
      class="absolute bottom-full inset-x-0 mb-0 border-t border-slate-700 bg-slate-800 shadow-md"
    >
      <ul class="px-3 py-2 space-y-0.5">
        <li v-for="link in peopleChildren" :key="link.name">
          <button
            type="button"
            class="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition"
            :class="
              active(link.name)
                ? 'bg-slate-700 text-amber-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-amber-400'
            "
            @click="goPeople(link.name)"
          >
            <component
              :is="link.icon"
              class="h-4 w-4 shrink-0"
              :class="active(link.name) ? 'text-emerald-400' : ''"
            />
            <span>{{ link.label }}</span>
          </button>
        </li>
      </ul>
    </div>

    <ul class="grid gap-0" :style="{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }">
      <li v-for="link in links" :key="link.name">
        <button
          type="button"
          class="btn-touch w-full flex flex-col gap-0.5 py-2 text-[11px]"
          :class="active(link.name) ? 'text-amber-400 font-semibold' : 'text-slate-400'"
          @click.stop="onLinkClick(link)"
        >
          <component
            :is="link.icon"
            class="h-5 w-5"
            :class="active(link.name) ? 'text-emerald-400' : ''"
          />
          {{ link.label }}
        </button>
      </li>
    </ul>
  </nav>
</template>
