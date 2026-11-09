<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const cls = computed(() => {
  const map = {
    PAGO: 'badge-success',
    PENDENTE: 'badge-warning',
    ISENTO: 'badge-ghost',
    CONFIRMADO: 'badge-success',
    SUBSTITUICAO_SOLICITADA: 'badge-warning',
    SUBSTITUIDO: 'badge-info',
    CANCELADO: 'badge-error',
    ABERTA: 'badge-warning',
    ACEITA: 'badge-success',
  }
  return map[props.status] || 'badge-ghost'
})
</script>

<template>
  <span class="badge badge-sm" :class="cls">{{ status }}</span>
</template>
