<script setup>
import { ref } from 'vue'
import { MessageCircle } from 'lucide-vue-next'
import { whatsappExport } from '@/api/schedules'
import { useAppToast } from '@/composables/useToast'

const props = defineProps({
  celebrationId: { type: Number, required: true },
})

const toast = useAppToast()
const loading = ref(false)

async function copy() {
  loading.value = true
  try {
    const data = await whatsappExport(props.celebrationId)
    await navigator.clipboard.writeText(data.text)
    toast.success('Texto copiado para a área de transferência')
  } catch (err) {
    toast.fromError(err, 'Não foi possível exportar')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="btn btn-outline rounded-xl gap-2"
    :disabled="loading"
    @click="copy"
  >
    <MessageCircle class="h-4 w-4" />
    Copiar WhatsApp
  </button>
</template>
