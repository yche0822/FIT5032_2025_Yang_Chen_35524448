<template>
  <!-- Using Bootstrap's Header template (starter code) -->
  <!-- https://getbootstrap.com/docs/5.0/examples/headers/ -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link to="/" class="navbar-brand">Home (Week 5)</router-link>
      <div class="navbar-nav">
        <router-link v-if="isAuthenticated" to="/about" class="nav-link">About</router-link>
        <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="nav-link btn btn-link"
        >
          Logout
        </button>
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
  padding: 0.8rem 1rem;
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

.router-link-active {
  font-weight: bold;
}
</style>
