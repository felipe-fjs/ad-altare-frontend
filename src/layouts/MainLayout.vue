<script setup>
import { ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Sidebar from '@/components/nav/Sidebar.vue'
import BottomNav from '@/components/nav/BottomNav.vue'

const open = ref(false)
</script>

<template>
  <div class="min-h-screen md:flex">
    <!-- Desktop sidebar -->
    <div class="hidden md:block md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen">
      <Sidebar />
    </div>

    <!-- Mobile drawer -->
    <div
      v-if="open"
      class="fixed inset-0 z-50 md:hidden"
    >
      <div class="absolute inset-0 bg-slate-950/60" @click="open = false" />
      <div class="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl border-r border-slate-700">
        <Sidebar @navigate="open = false" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="md:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur px-4 py-3">
        <button type="button" class="btn-touch rounded-xl hover:bg-slate-700" @click="open = !open">
          <X v-if="open" class="h-6 w-6 text-emerald-400" />
          <Menu v-else class="h-6 w-6 text-emerald-400" />
        </button>
        <span class="font-display text-2xl text-amber-400">Ad Altare</span>
      </div>

      <main class="px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8 max-w-6xl mx-auto">
        <RouterView />
      </main>
    </div>

    <BottomNav />
  </div>
</template>
