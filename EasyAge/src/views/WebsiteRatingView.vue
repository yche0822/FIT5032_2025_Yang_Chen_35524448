<template>
  <div class="container rateus">
    <h2 class="mb-3">Rate Our Website</h2>

    <p id="rateHelp" class="sr-only">
      Choose a rating from 1 to 5 stars. Use arrow keys to change and Space/Enter to confirm.
    </p>

    <fieldset class="rating-fieldset" aria-describedby="rateHelp">
      <legend class="rating-legend">Your rating</legend>

      <div class="stars" role="radiogroup" aria-label="Star rating">
        <template v-for="n in 5" :key="n">
          <input
            class="sr-only-input"
            type="radio"
            name="rating"
            :id="`rate-${n}`"
            :value="n"
            v-model.number="tempRating"
            :disabled="!user"
            :aria-label="`${n} ${n===1 ? 'star' : 'stars'}`"
            @change="onRate(n)"
          />
          <label
            class="star"
            :for="`rate-${n}`"
            :class="{
              filled: hover >= n || (!hover && tempRating >= n),
              disabled: !user
            }"
            @mouseenter="hover = n"
            @mouseleave="hover = 0"
            :title="user ? `${n} ${n===1?'star':'stars'}` : 'Login to rate'"
            aria-hidden="true"
          >
            ★
          </label>
        </template>
      </div>

      <div class="mt-2 status">
        <span v-if="user && tempRating" class="ok" role="status" aria-live="polite">
          Your rating: {{ tempRating }} / 5
        </span>
        <span v-else-if="user" class="muted">(Select a rating)</span>
        <span v-else class="muted">(Login to rate)</span>
      </div>
    </fieldset>

    <div class="avg" role="status" aria-live="polite">
      <strong>Average Rating:</strong>
      <span v-if="avgRating !== null">{{ avgRating.toFixed(2) }} / 5 ({{ totalRatings }} ratings)</span>
      <span v-else>No ratings yet</span>
    </div>

    <div class="chart-wrap">
      <canvas ref="chartRef" aria-label="Ratings distribution chart"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, doc, setDoc, onSnapshot, serverTimestamp
} from 'firebase/firestore'

// Chart.js
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const user = ref(null)
onMounted(() => {
  unsubAuth = onAuthStateChanged(auth, u => { user.value = u || null })
})

let unsubAuth = null
onBeforeUnmount(() => { unsubAuth && unsubAuth() })

// UI state
const tempRating = ref(0)
const hover = ref(0)

// stats
const dist = ref({1:0,2:0,3:0,4:0,5:0})
const avgRating = ref(null)
const totalRatings = ref(0)

// Firestore live subscription
let unsubRatings = null

const subscribeRatings = () => {
  const col = collection(db, 'ratings')
  unsubRatings = onSnapshot(col, snap => {
    const counts = {1:0,2:0,3:0,4:0,5:0}
    let sum = 0, cnt = 0
    snap.forEach(d => {
      const s = Number(d.data()?.score)
      if (s >= 1 && s <= 5) { counts[s]++; sum += s; cnt++; }
    })
    dist.value = counts
    totalRatings.value = cnt
    avgRating.value = cnt ? (sum / cnt) : null
    updateChart()
  })
}

onMounted(() => { subscribeRatings() })
onBeforeUnmount(() => { unsubRatings && unsubRatings() })

// write rating
const onRate = async (n) => {
  if (!user.value) return
  tempRating.value = n
  const docRef = doc(db, 'ratings', user.value.uid)
  await setDoc(docRef, {
    score: n,
    username: user.value.email || user.value.displayName || 'anonymous',
    createdAt: serverTimestamp()
  }, { merge: true })
}

// Chart.js rendering
const chartRef = ref(null)
let chart = null

const updateChart = () => {
  const data = [1,2,3,4,5].map(s => dist.value[s] || 0)
  if (!chart) {
    chart = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: ['1★','2★','3★','4★','5★'],
        datasets: [{ label: 'Ratings count', data }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, precision: 0 } }
      }
    })
  } else {
    chart.data.datasets[0].data = data
    chart.update()
  }
}

onBeforeUnmount(() => { chart?.destroy() })

// 如果你想让用户进入页面时看到自己已评分的星级，可在 auth 变化时读取自己的文档：
// （非必须，因为 setDoc + 订阅会覆盖）
// onAuthStateChanged(auth, async u => { if (u) { const snap = await getDoc(doc(db,'ratings',u.uid)); tempRating.value = snap.exists()? Number(snap.data().score) : 0 } })
</script>

<style scoped>
.container.rateus { text-align: center; }

.sr-only {
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}
.sr-only-input {
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}

.rating-fieldset {
  border: 2px solid #e5e7eb; border-radius: 10px;
  padding: 12px; margin: 0 auto; max-width: 520px; text-align: center;
}
.rating-legend { font-weight: 700; padding: 0 6px; }

.stars { display: flex; justify-content: center; gap: 8px; margin-top: 6px; }

.star {
  font-size: 2rem; color: #cbd5e1; cursor: pointer;
  transition: color .15s ease-in-out; user-select: none;
}
.star.filled { color: #f7b731; }
.star.disabled { cursor: not-allowed; opacity: .6; }

.ok { color: #198754; }
.muted { color: #6c757d; }

.avg { margin-top: 12px; text-align: center; }

.chart-wrap { height: 320px; margin-top: 16px; }
</style>
