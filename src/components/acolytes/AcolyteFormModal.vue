<script setup>
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import MultiSelect from 'primevue/multiselect'

const props = defineProps({
  visible: { type: Boolean, default: false },
  acolyte: { type: Object, default: null },
  communities: { type: Array, default: () => [] },
  functions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'save'])

const form = reactive({
  full_name: '',
  birth_date: '',
  community_id: null,
  investiture_date: '',
  vestment_size: '',
  vestment_number: '',
  experience_level: 'INICIANTE',
  skills: [],
  image_consent: false,
  is_active: true,
})

const levels = [
  { label: 'Iniciante', value: 'INICIANTE' },
  { label: 'Intermediário', value: 'INTERMEDIARIO' },
  { label: 'Cerimoniário', value: 'CERIMONIARIO' },
]

const skillOptions = computed(() =>
  props.functions.map((f) => ({ label: `${f.emoji || ''} ${f.name}`.trim(), value: f.code })),
)

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

watch(
  () => [props.visible, props.acolyte],
  () => {
    if (!props.visible) return
    const a = props.acolyte
    if (a) {
      Object.assign(form, {
        full_name: a.full_name,
        birth_date: a.birth_date,
        community_id: a.community_id,
        investiture_date: a.investiture_date || '',
        vestment_size: a.vestment_size || '',
        vestment_number: a.vestment_number || '',
        experience_level: a.experience_level || 'INICIANTE',
        skills: [...(a.skills || [])],
        image_consent: a.image_consent,
        is_active: a.is_active,
      })
    } else {
      Object.assign(form, {
        full_name: '',
        birth_date: '',
        community_id: props.communities[0]?.id ?? null,
        investiture_date: '',
        vestment_size: '',
        vestment_number: '',
        experience_level: 'INICIANTE',
        skills: [],
        image_consent: false,
        is_active: true,
      })
    }
  },
  { immediate: true },
)

function submit() {
  emit('save', {
    full_name: form.full_name.trim(),
    birth_date: form.birth_date,
    community_id: Number(form.community_id),
    investiture_date: form.investiture_date || null,
    vestment_size: form.vestment_size.trim() || null,
    vestment_number: form.vestment_number.trim() || null,
    experience_level: form.experience_level,
    skills: form.skills,
    image_consent: form.image_consent,
    is_active: form.is_active,
  })
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="acolyte ? 'Editar coroinha' : 'Novo coroinha'"
    class="w-full max-w-2xl"
  >
    <form class="grid gap-4 sm:grid-cols-2 pt-2" @submit.prevent="submit">
      <label class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Nome completo</span>
        <input v-model="form.full_name" required class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Nascimento</span>
        <input v-model="form.birth_date" type="date" required class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Comunidade</span>
        <select v-model="form.community_id" required class="select select-bordered rounded-xl">
          <option disabled :value="null">Selecione</option>
          <option v-for="c in communities" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Investidura</span>
        <input v-model="form.investiture_date" type="date" class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Nível</span>
        <select v-model="form.experience_level" class="select select-bordered rounded-xl">
          <option v-for="l in levels" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Tamanho da túnica</span>
        <input v-model="form.vestment_size" class="input input-bordered rounded-xl" />
      </label>
      <label class="form-control w-full">
        <span class="label-text mb-1">Número da túnica</span>
        <input v-model="form.vestment_number" class="input input-bordered rounded-xl" />
      </label>
      <div class="form-control w-full sm:col-span-2">
        <span class="label-text mb-1">Funções / habilidades</span>
        <MultiSelect
          v-model="form.skills"
          :options="skillOptions"
          option-label="label"
          option-value="value"
          placeholder="Selecione as funções"
          display="chip"
          class="w-full"
        />
      </div>
      <label class="label cursor-pointer justify-start gap-3">
        <input v-model="form.image_consent" type="checkbox" class="checkbox checkbox-primary" />
        <span class="label-text">Consentimento de imagem</span>
      </label>
      <label class="label cursor-pointer justify-start gap-3">
        <input v-model="form.is_active" type="checkbox" class="checkbox checkbox-primary" />
        <span class="label-text">Ativo</span>
      </label>
      <div class="sm:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" class="btn btn-ghost rounded-xl" @click="dialogVisible = false">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary rounded-xl" :disabled="saving">
          Salvar
        </button>
      </div>
    </form>
  </Dialog>
</template>
