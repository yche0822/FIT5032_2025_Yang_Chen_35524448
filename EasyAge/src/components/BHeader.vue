<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand fw-bold">EasyAge</router-link>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link" active-class="active">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-link" active-class="active">Contact</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" active-class="active">About Me</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/rate" class="nav-link" active-class="active">Rate Us</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/serverless" class="nav-link" active-class="active">Serverless Demo</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/map" class="nav-link" active-class="active">Map</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/manager" class="nav-link" active-class="active">Website Manager</router-link>
          </li>
        </ul>
        <div class="d-flex">
          <router-link v-if="!isLoggedIn" to="/login" class="btn btn-outline-primary me-2">Login</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="btn btn-primary">Register</router-link>
          <button v-if="isLoggedIn" @click="handleLogout" class="btn btn-danger">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()
const isLoggedIn = ref(false)
const isAdmin = ref(false)

const computeAdminFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    isAdmin.value = user?.role === 'admin'
  } catch {
    isAdmin.value = false
  }
}

let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true
      computeAdminFromStorage()
    } else {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      isLoggedIn.value = isAuth
      computeAdminFromStorage()
    }
  })
  const onStorage = () => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true'
    isLoggedIn.value = isAuth
    computeAdminFromStorage()
  }
  window.addEventListener('storage', onStorage)
  onBeforeUnmount(() => {
    if (unsubscribe) unsubscribe()
    window.removeEventListener('storage', onStorage)
  })
})

const handleLogout = async () => {
  try {
    await signOut(auth)
  } catch (e) {}
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('currentUser')
  isLoggedIn.value = false
  isAdmin.value = false
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  font-size: 1.1rem;
  padding: 0.8rem 1rem;
  background-color: #e3f0fc !important;
}
.nav-link {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-link:hover {
  opacity: 0.8;
}
.router-link-active,
.active {
  font-weight: bold;
}
</style>
