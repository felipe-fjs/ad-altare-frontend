<script setup>
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  communities: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const types = [
  { value: 'DOMINICAL', label: 'Dominical' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'SOLENIDADE', label: 'Solenidade' },
]

const form = reactive({
  community_id: null,
  date: '',
  time: '19:00',
  celebration_type: 'DOMINICAL',
  title: '',
  notes: '',
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

watch(
  () => props.visible,
  (v) => {
    if (!v) return
    Object.assign(form, {
      community_id: props.communities[0]?.id ?? null,
      date: new Date().toISOString().slice(0, 10),
      time: '19:00',
      celebration_type: 'DOMINICAL',
      title: '',
      notes: '',
    })
  },
)

function submit() {
  const time = form.time.length === 5 ? `${form.time}:00` : form.time
  emit('save', {
    community_id: Number(form.community_id),
    date: form.date,
    time,
    celebration_type: form.celebration_type,
    title: form.title.trim() || null,
    notes: form.notes.trim() || null,
  })
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Nova celebração"
    class="w-full max-w-lg"
  >
    <form class="grid gap-4 sm:grid-cols-2 pt-2" @submit.prevent="submit">
      <label class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Comunidade</span>
        <select v-model="form.community_id" required class="select select-bordered rounded-xl">
          <option disabled :value="null">Selecione</option>
          <option v-for="c in communities" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Data</span>
        <input v-model="form.date" type="date" required class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Horário</span>
        <input v-model="form.time" type="time" required class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Tipo</span>
        <select v-model="form.celebration_type" class="select select-bordered rounded-xl">
          <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </label>
      <label class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Título</span>
        <input v-model="form.title" class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Observações</span>
        <textarea v-model="form.notes" rows="2" class="textarea textarea-bordered rounded-xl" />
      </label>
      <div class="sm:col-span-2 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost rounded-xl" @click="dialogVisible = false">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
          Criar
        </button>
      </div>
    </form>
  </Dialog>
</template>
