<script setup>
defineProps({
  title: { type: String, default: 'Nada por aqui' },
  message: { type: String, default: 'Quando houver registros, eles aparecerão nesta área.' },
})
</script>

<template>
  <div class="panel px-6 py-12 text-center">
    <p class="font-display text-2xl text-amber-400 mb-2">{{ title }}</p>
    <p class="text-slate-400 max-w-md mx-auto">{{ message }}</p>
    <div class="mt-4 flex justify-center">
      <slot />
    </div>
  </div>
</template>
