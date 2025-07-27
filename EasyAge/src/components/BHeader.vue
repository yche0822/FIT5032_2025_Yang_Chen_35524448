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
          <li class="nav-item" v-if="isAuthenticated && isAdmin">
            <router-link to="/manager" class="nav-link" active-class="active">Website Manager</router-link>
          </li>
        </ul>
        <div class="d-flex">
          <router-link v-if="!isAuthenticated" to="/login" class="btn btn-outline-primary me-2">Login</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="btn btn-primary">Register</router-link>
          <button v-if="isAuthenticated" @click="handleLogout" class="btn btn-danger">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authState = ref(localStorage.getItem('isAuthenticated') === 'true')

window.addEventListener('storage', () => {
  authState.value = localStorage.getItem('isAuthenticated') === 'true'
})


const isAuthenticated = computed(() => authState.value)
const isAdmin = computed(() => {
  if (!isAuthenticated.value) return false;
  try {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin'
  } catch {
    return false
  }
})

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  authState.value = false
  router.push('/')
}
</script>

<style scoped>
.b-example-divider {
  height: 3rem;
  background-color: rgba(0, 0, 0, 0.1);
  border: solid rgba(0, 0, 0, 0.15);
  border-width: 1px 0;
  box-shadow:
    inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1),
    inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
}

.form-control-dark {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: var(--bs-gray);
}
.form-control-dark:focus {
  color: #fff;
  background-color: var(--bs-dark);
  border-color: #fff;
  box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.25);
}

.bi {
  vertical-align: -0.125em;
  fill: currentColor;
}

.text-small {
  font-size: 85%;
}

.dropdown-toggle {
  outline: 0;
}

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
