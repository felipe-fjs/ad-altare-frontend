import { useToast as usePrimeToast } from 'primevue/usetoast'

export function useAppToast() {
  const toast = usePrimeToast()

  function success(detail, summary = 'Sucesso') {
    toast.add({ severity: 'success', summary, detail, life: 3500 })
  }

  function error(detail, summary = 'Erro') {
    toast.add({ severity: 'error', summary, detail, life: 5000 })
  }

  function info(detail, summary = 'Info') {
    toast.add({ severity: 'info', summary, detail, life: 3500 })
  }

  function warn(detail, summary = 'Atenção') {
    toast.add({ severity: 'warn', summary, detail, life: 4500 })
  }

  function fromError(err, fallback = 'Operação falhou') {
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string') {
      error(detail)
      return
    }
    if (detail?.message) {
      const warnings = detail.warnings?.length ? ` ${detail.warnings.join(' ')}` : ''
      warn(`${detail.message}${warnings}`)
      return
    }
    error(fallback)
  }

  return { success, error, info, warn, fromError }
}
