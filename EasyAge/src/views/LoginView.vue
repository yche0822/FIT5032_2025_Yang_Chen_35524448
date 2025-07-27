<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">EasyAge Login</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="username"
                  required
                >
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password"
                  required
                >
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const xssPattern = /[<>"'`\\]/
const handleLogin = () => {
  if (xssPattern.test(username.value) || xssPattern.test(password.value)) {
    error.value = 'Invalid characters detected.'
    return
  }
  let users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.username === username.value && u.password === password.value)
  if (user) {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify(user))
    window.dispatchEvent(new Event('storage'))
      router.push('/')
  } else {
    error.value = 'Invalid username or password'
  }
}
</script>