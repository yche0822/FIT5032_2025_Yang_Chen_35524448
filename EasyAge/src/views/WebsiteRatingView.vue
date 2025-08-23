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
            :disabled="!isAuthenticated"
            :aria-label="`${n} ${n===1 ? 'star' : 'stars'}`"
            @change="onRate(n)"
          />
          <label
            class="star"
            :for="`rate-${n}`"
            :class="{
              filled: hover >= n || (!hover && tempRating >= n),
              disabled: !isAuthenticated
            }"
            @mouseenter="hover = n"
            @mouseleave="hover = 0"
            :title="isAuthenticated ? `${n} ${n===1?'star':'stars'}` : 'Login to rate'"
            aria-hidden="true"
          >
            ★
          </label>
        </template>
      </div>


      <div class="mt-2 status">
        <span v-if="isAuthenticated && tempRating" class="ok" role="status" aria-live="polite">
          Your rating: {{ tempRating }} / 5
        </span>
        <span v-else-if="isAuthenticated" class="muted">(Select a rating)</span>
        <span v-else class="muted">(Login to rate)</span>
      </div>
    </fieldset>

    <div class="avg" role="status" aria-live="polite">
      <strong>Average Rating:</strong>
      <span v-if="avgRating !== null">{{ avgRating.toFixed(2) }} / 5 ({{ totalRatings }} ratings)</span>
      <span v-else>No ratings yet</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'


const isAuthenticated = computed(() => localStorage.getItem('isAuthenticated') === 'true')
const currentUser = computed(() => {
  try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
})


const tempRating = ref(0)
const hover = ref(0)


const ratings = ref({})
const avgRating = ref(null)
const totalRatings = ref(0)


const loadRatings = () => {
  const raw = localStorage.getItem('websiteRatings')
  ratings.value = raw ? JSON.parse(raw) : {}
  if (currentUser.value && ratings.value[currentUser.value.username] != null) {
    tempRating.value = Number(ratings.value[currentUser.value.username])
  } else {
    tempRating.value = 0
  }
}


const calcAvg = () => {
  const values = Object.values(ratings.value).map(v => Number(v)).filter(v => !Number.isNaN(v))
  if (values.length === 0) {
    avgRating.value = null
    totalRatings.value = 0
    return
  }
  const sum = values.reduce((a, b) => a + b, 0)
  avgRating.value = sum / values.length
  totalRatings.value = values.length
}


const onRate = (n) => {
  if (!isAuthenticated.value || !currentUser.value) return
  ratings.value[currentUser.value.username] = Number(n)
  localStorage.setItem('websiteRatings', JSON.stringify(ratings.value))
  calcAvg()
}

onMounted(() => {
  loadRatings()
  calcAvg()
})
</script>

<style scoped>
.container.rateus { text-align: center; }


.sr-only {
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}

.sr-only-input {
  position:absolute;
  width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}

.rating-fieldset {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  margin: 0 auto;
  max-width: 520px;
  text-align: center;
}
.rating-legend {
  font-weight: 700;
  padding: 0 6px;
}


.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}


.star {
  font-size: 2rem;
  color: #cbd5e1; 
  cursor: pointer;
  transition: color .15s ease-in-out;
  user-select: none;
}
.star.filled { color: #f7b731; }
.star.disabled { cursor: not-allowed; opacity: .6; }


.ok { color: #198754; }
.muted { color: #6c757d; }


.avg { margin-top: 12px; text-align: center; }
</style>
