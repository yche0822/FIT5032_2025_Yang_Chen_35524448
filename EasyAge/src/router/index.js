import WebsiteRatingView from '../views/WebsiteRatingView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AccessDenied from '../views/AccessDenied.vue'
import ContactView from '../views/ContactView.vue'
import ManagerView from '../views/ManagerView.vue'
import ServerlessDemo from '../components/ServerlessDemo.vue'
import MapView from '../views/MapView.vue'
import CalendarView from '../views/CalendarView.vue'

const routes = [
  {
    path: '/rate',
    name: 'WebsiteRating',
    component: WebsiteRatingView,
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactView
  },
  {
    path: '/manager',
    name: 'Manager',
    component: ManagerView,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/deny',
    name: 'AccessDenied',
    component: AccessDenied
  },
   {
    path: '/serverless',
    name: 'ServerlessDemo',
    component: ServerlessDemo
  },
  { path: '/map', 
    name: 'MapView', 
    component: MapView 
  },
  {
    path: '/calendar',
    name: 'CalendarView',
    component: CalendarView,
    meta: { title: 'Appointments' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/deny')
    return
  }
  if (to.meta.adminOnly && (!currentUser || currentUser.role !== 'admin')) {
    next('/deny')
    return
  }
  next()
})

router.afterEach((to) => {
  requestAnimationFrame(() => {
    const main = document.getElementById('main-content')
    if (main) main.focus()

    if (to.meta?.title) document.title = `${to.meta.title} · EasyAge`

    const announcer = document.getElementById('route-announcer')
    if (announcer) announcer.textContent = `${to.meta?.title || to.name || 'Page'} loaded`
  })
})

export default router