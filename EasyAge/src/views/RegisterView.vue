<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const onRegister = async () => {
  if (loading.value) return
  errorMsg.value = ''
  successMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Email and password are required.'
    return
  }
  if (password.value !== confirm.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    successMsg.value = 'Registered successfully. You can now login.'
    setTimeout(() => router.push('/login'), 800)
  } catch (e) {
    errorMsg.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5" style="max-width: 520px">
    <h1 class="mb-4">Register</h1>

    <div class="mb-3">
      <label class="form-label">Email</label>
      <input v-model="email" type="email" class="form-control" placeholder="you@example.com">
    </div>

    <div class="mb-3">
      <label class="form-label">Password</label>
      <input v-model="password" type="password" class="form-control" placeholder="At least 6 characters">
    </div>

    <div class="mb-3">
      <label class="form-label">Confirm Password</label>
      <input v-model="confirm" type="password" class="form-control" placeholder="Repeat your password">
    </div>

    <button class="btn btn-success w-100" :disabled="loading" @click="onRegister">
      {{ loading ? 'Creating…' : 'Create Account' }}
    </button>

    <p v-if="successMsg" class="text-success mt-3">{{ successMsg }}</p>
    <p v-if="errorMsg" class="text-danger mt-3">{{ errorMsg }}</p>
    <p class="mt-3">
      Already have an account? <router-link to="/login">Sign in</router-link>
    </p>
  </div>
</template>
