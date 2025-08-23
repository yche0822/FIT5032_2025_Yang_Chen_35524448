<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()
const route = useRoute()

const id = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')


const initAdmin = () => {
  let users = JSON.parse(localStorage.getItem('users') || '[]')
  if (!users.find(u => u.username === 'admin')) {
    users.push({ username: 'admin', password: 'admin123', role: 'admin' })
    localStorage.setItem('users', JSON.stringify(users))
  }
}
initAdmin()


function tryLocalLogin(identifier, pwd) {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const u = users.find(u =>
    (u.username && u.username.toLowerCase() === String(identifier).toLowerCase()) ||
    (u.email && u.email.toLowerCase() === String(identifier).toLowerCase())
  )
  if (!u) return { ok: false, reason: 'not_found' }
  if (u.password !== pwd) return { ok: false, reason: 'bad_password' }

  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('currentUser', JSON.stringify({
    uid: `local_${u.username || u.email}`,
    email: u.email || `${u.username}@local`,
    role: u.role || 'user'
  }))
  return { ok: true }
}


function inferRoleByEmail(mail) {
  return String(mail || '').toLowerCase() === 'admin@demo.com' ? 'admin' : 'user'
}

const onLogin = async () => {
  if (loading.value) return
  errorMsg.value = ''
  loading.value = true
  try {
    const local = tryLocalLogin(id.value.trim(), password.value)
    if (local.ok) {
      const redirect = route.query.redirect || '/manager'
      router.push(String(redirect))
      return
    }
    if (local.reason === 'bad_password') {
      throw new Error('Incorrect password.')
    }


    const cred = await signInWithEmailAndPassword(auth, id.value, password.value)
    const role = inferRoleByEmail(cred.user.email)

    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('currentUser', JSON.stringify({
      uid: cred.user.uid,
      email: cred.user.email,
      role
    }))

    const redirect = route.query.redirect || '/'
    router.push(String(redirect))
  } catch (e) {
    errorMsg.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-5" style="max-width: 480px">
    <h3 class="mb-4">Login</h3>

    <div class="mb-3">
      <label class="form-label">Email or Username</label>
      <input v-model="id" type="text" class="form-control" placeholder="admin or you@example.com" />
    </div>

    <div class="mb-3">
      <label class="form-label">Password</label>
      <input v-model="password" type="password" class="form-control" placeholder="••••••••" />
    </div>

    <button class="btn btn-primary w-100" :disabled="loading" @click="onLogin">
      {{ loading ? 'Signing in…' : 'Sign In' }}
    </button>

    <p v-if="errorMsg" class="text-danger mt-3">{{ errorMsg }}</p>
    <p class="mt-3">
      No account? <router-link to="/register">Create one</router-link>
    </p>
  </div>
</template>
