<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Register</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
<input 
  type="text" 
  class="form-control" 
  id="username" 
  v-model="username"
  @input="validateFields"
  required
>
<div v-if="usernameError" class="form-text text-danger small">{{ usernameError }}</div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
<input 
  type="password" 
  class="form-control" 
  id="password" 
  v-model="password"
  @input="validateFields"
  required
>
<div v-if="passwordError" class="form-text text-danger small">{{ passwordError }}</div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
<input 
  type="password" 
  class="form-control" 
  id="confirmPassword" 
  v-model="confirmPassword"
  @input="validateFields"
  required
>
<div v-if="confirmPasswordError" class="form-text text-danger small">{{ confirmPasswordError }}</div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div v-if="success" class="alert alert-success">{{ success }}</div>
              <button type="submit" class="btn btn-primary w-100">Register</button>
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
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const role = ref('user')
const router = useRouter()

const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const xssPattern = /[<>"'`\\]/

function validateFields() {
  usernameError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  error.value = ''
  if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters.'
  } else if (xssPattern.test(username.value)) {
    usernameError.value = 'Invalid characters detected.'
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
  } else if (!/\d/.test(password.value)) {
    passwordError.value = 'Password must contain at least one number.'
  } else if (xssPattern.test(password.value)) {
    passwordError.value = 'Invalid characters detected.'
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match.'
  }
}

const handleRegister = () => {
  error.value = ''
  success.value = ''
  validateFields()
  if (usernameError.value || passwordError.value || confirmPasswordError.value) return
  let users = JSON.parse(localStorage.getItem('users') || '[]')
  if (users.find(u => u.username === username.value)) {
    error.value = 'Username already exists.'
    return
  }
  users.push({ username: username.value, password: password.value, role: role.value })
  localStorage.setItem('users', JSON.stringify(users))
  success.value = 'Registration successful! Redirecting to login...'
  setTimeout(() => {
    router.push('/login')
  }, 1500)
}
</script>
