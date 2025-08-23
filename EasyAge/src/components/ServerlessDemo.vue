<template>
  <div class="p-4">
    <h2>Cloudflare Worker Demo</h2>

    <div class="card">
      <button @click="getServerTime" :disabled="loading.time">
        {{ loading.time ? 'Loading...' : 'Get Server Time' }}
      </button>
      <p v-if="serverTime" class="mt-2">Server time: {{ serverTime }}</p>
      <p v-if="error.time" class="err">{{ error.time }}</p>
    </div>

    <div class="card">
      <h3>Score Places</h3>
      <textarea v-model="placesText" rows="6" spellcheck="false"></textarea>
      <div class="mt-2">
        <button @click="scorePlaces" :disabled="loading.score">
          {{ loading.score ? 'Scoring...' : 'Score' }}
        </button>
      </div>

      <p v-if="error.score" class="err">{{ error.score }}</p>

      <table v-if="results.length" class="mt-3">
        <thead>
          <tr><th>Name</th><th>Rating</th><th>Distance(m)</th><th>Score</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in results" :key="r.name">
            <td>{{ r.name }}</td>
            <td>{{ r.rating }}</td>
            <td>{{ r.distance }}</td>
            <td>{{ r.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const BASE = (import.meta.env.VITE_WORKER_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '')

const serverTime = ref('')
const results = ref([])
const error = ref({ time: '', score: '' })
const loading = ref({ time: false, score: false })

const placesText = ref(JSON.stringify({
  places: [
    { name: 'Library', rating: 4.6, distance: 320 },
    { name: 'Cafe',    rating: 4.2, distance: 180 },
    { name: 'Park',    rating: 4.9, distance: 950 }
  ]
}, null, 2))

async function getServerTime() {
  error.value.time = ''; loading.value.time = true
  try {
    const r = await fetch(`${BASE}/server-time`)
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    serverTime.value = (await r.json()).time
  } catch (e) { error.value.time = String(e.message || e) }
  finally { loading.value.time = false }
}

async function scorePlaces() {
  error.value.score = ''; loading.value.score = true
  try {
    const payload = JSON.parse(placesText.value)
    const r = await fetch(`${BASE}/score-places`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
    results.value = (await r.json()).results || []
  } catch (e) { error.value.score = String(e.message || e) }
  finally { loading.value.score = false }
}
</script>

<style scoped>
.card { padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin: 12px 0; }
textarea { width: 100%; font-family: ui-monospace, Menlo, Consolas, monospace; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px 8px; border-bottom: 1px solid #eee; text-align: left; }
.err { color: #c0392b; margin-top: 8px; }
.mt-2 { margin-top: 8px; } .mt-3 { margin-top: 12px; }
</style>
