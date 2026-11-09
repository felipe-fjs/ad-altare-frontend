import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('@/views/ChangePasswordRequiredView.vue'),
    meta: { requiresAuth: true, allowPasswordReset: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: {
          roles: ['ADMIN_MASTER', 'ADMIN_GERAL', 'PADRE', 'FINANCEIRO', 'COORD_COMUNIDADE'],
        },
      },
      {
        path: 'communities',
        name: 'communities',
        component: () => import('@/views/CommunitiesView.vue'),
        meta: {
          roles: ['ADMIN_MASTER', 'ADMIN_GERAL', 'PADRE', 'FINANCEIRO', 'COORD_COMUNIDADE'],
        },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: {
          roles: ['ADMIN_MASTER', 'ADMIN_GERAL', 'PADRE', 'COORD_COMUNIDADE'],
        },
      },
      {
        path: 'parents',
        name: 'parents',
        component: () => import('@/views/ParentsView.vue'),
        meta: {
          roles: ['ADMIN_MASTER', 'ADMIN_GERAL', 'PADRE', 'COORD_COMUNIDADE'],
        },
      },
      {
        path: 'acolytes',
        name: 'acolytes',
        component: () => import('@/views/AcolytesView.vue'),
      },
      {
        path: 'acolytes/:id',
        name: 'acolyte-detail',
        component: () => import('@/views/AcolyteDetailView.vue'),
      },
      {
        path: 'schedules',
        name: 'schedules',
        component: () => import('@/views/SchedulesView.vue'),
      },
      {
        path: 'schedules/:id',
        name: 'celebration-detail',
        component: () => import('@/views/CelebrationDetailView.vue'),
      },
      {
        path: 'finance',
        name: 'finance',
        component: () => import('@/views/FinanceView.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

function defaultHomeFor(role) {
  if (['PAIS', 'COROINHA'].includes(role)) return { name: 'schedules' }
  return { name: 'dashboard' }
}

router.beforeEach(async (to) => {
  if (to.meta.public) {
    if (getToken() && to.name === 'login') {
      const auth = useAuthStore()
      if (!auth.user) {
        try {
          await auth.fetchMe()
        } catch {
          return true
        }
      }
      if (auth.mustChangePassword) return { name: 'change-password' }
      return defaultHomeFor(auth.role)
    }
    return true
  }

  if (!getToken()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const auth = useAuthStore()
  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      return { name: 'login' }
    }
  }

  if (auth.mustChangePassword && !to.meta.allowPasswordReset) {
    return { name: 'change-password' }
  }

  if (!auth.mustChangePassword && to.name === 'change-password') {
    return defaultHomeFor(auth.role)
  }

  const allowed = to.meta.roles
  if (allowed?.length && !allowed.includes(auth.role)) {
    if (['PAIS', 'COROINHA'].includes(auth.role)) return { name: 'schedules' }
    return { name: 'acolytes' }
  }

  return true
})

export default router
