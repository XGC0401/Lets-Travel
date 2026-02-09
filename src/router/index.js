import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Auth Views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'

// Tourist Views
import SearchTours from '../views/tourist/SearchTours.vue'
import TourDetails from '../views/tourist/TourDetails.vue'
import MyBookings from '../views/tourist/MyBookings.vue'
import MyDisputes from '../views/tourist/MyDisputes.vue'
import MyTransactions from '../views/tourist/MyTransactions.vue'
import Messages from '../views/tourist/Messages.vue'

// Guide Views
import MyTours from '../views/guide/MyTours.vue'
import CreateTour from '../views/guide/CreateTour.vue'
import EditTour from '../views/guide/EditTour.vue'
import GuideBookings from '../views/guide/GuideBookings.vue'
import GuideDisputes from '../views/guide/GuideDisputes.vue'
import GuideTransactions from '../views/guide/GuideTransactions.vue'
import GuideReports from '../views/guide/GuideReports.vue'

// Admin Views
import AdminUsers from '../views/admin/AdminUsers.vue'
import AdminTours from '../views/admin/AdminTours.vue'
import AdminTransactions from '../views/admin/AdminTransactions.vue'
import AdminReviews from '../views/admin/AdminReviews.vue'
import AdminDisputes from '../views/admin/AdminDisputes.vue'
import AdminReports from '../views/admin/AdminReports.vue'
import AdminEmergency from '../views/admin/AdminEmergency.vue'

// Shared Views
import Profile from '../views/shared/Profile.vue'
import DataGenerator from '../views/shared/DataGenerator.vue'
import Emergency from '../views/shared/Emergency.vue'

const routes = [
  {
    path: '/',
    redirect: to => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return '/login'
      
      switch (authStore.userType) {
        case 'tourist': return '/search'
        case 'guide': return '/my-tours'
        case 'admin': return '/admin/tours'
        default: return '/login'
      }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/data-generator',
    name: 'DataGenerator',
    component: DataGenerator
  },
  
  // Tourist Routes
  {
    path: '/search',
    name: 'SearchTours',
    component: SearchTours,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  {
    path: '/tour/:id',
    name: 'TourDetails',
    component: TourDetails,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  {
    path: '/my-bookings',
    name: 'MyBookings',
    component: MyBookings,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  {
    path: '/my-disputes',
    name: 'MyDisputes',
    component: MyDisputes,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  {
    path: '/my-transactions',
    name: 'MyTransactions',
    component: MyTransactions,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true }
  },
  {
    path: '/emergency',
    name: 'TouristEmergency',
    component: Emergency,
    meta: { requiresAuth: true, role: 'tourist' }
  },
  
  // Guide Routes
  {
    path: '/my-tours',
    name: 'MyTours',
    component: MyTours,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/create-tour',
    name: 'CreateTour',
    component: CreateTour,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/edit-tour/:id',
    name: 'EditTour',
    component: EditTour,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/bookings',
    name: 'GuideBookings',
    component: GuideBookings,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/guide-disputes',
    name: 'GuideDisputes',
    component: GuideDisputes,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/guide-transactions',
    name: 'GuideTransactions',
    component: GuideTransactions,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/guide-reports',
    name: 'GuideReports',
    component: GuideReports,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/guide-emergency',
    name: 'GuideEmergency',
    component: Emergency,
    meta: { requiresAuth: true, role: 'guide' }
  },
  {
    path: '/guide-emergency',
    name: 'GuideEmergency',
    component: Emergency,
    meta: { requiresAuth: true, role: 'guide' }
  },
  
  // Admin Routes
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: AdminUsers,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/tours',
    name: 'AdminTours',
    component: AdminTours,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/transactions',
    name: 'AdminTransactions',
    component: AdminTransactions,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: AdminReviews,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/disputes',
    name: 'AdminDisputes',
    component: AdminDisputes,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: AdminReports,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/emergency',
    name: 'AdminEmergency',
    component: AdminEmergency,
    meta: { requiresAuth: true, role: 'admin' }
  },
  
  // Shared Routes
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.role && authStore.userType !== to.meta.role) {
    next('/')
  } else {
    next()
  }
})

export default router
