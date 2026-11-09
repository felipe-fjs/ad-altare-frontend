<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="font-display text-3xl md:text-4xl text-amber-400">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-slate-400">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <slot />
    </div>
  </header>
</template>
