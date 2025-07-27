<template>
  <div class="container py-4">
    <h2 class="mb-3">Rate Our Website</h2>
    <div class="mb-2">
      <span v-for="star in 5" :key="star" class="star" :class="{ filled: userRating >= star }" @click="setRating(star)">
        ★
      </span>
      <span v-if="isAuthenticated" class="ms-2 text-success" v-show="userRating">Your rating: {{ userRating }}</span>
      <span v-else class="ms-2 text-muted">(Login to rate)</span>
    </div>
    <div class="mt-2">
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
  try {
    return JSON.parse(localStorage.getItem('currentUser'))
  } catch {
    return null
  }
})

const userRating = ref(0)
const ratings = ref({})

const loadRatings = () => {
  const data = localStorage.getItem('websiteRatings')
  ratings.value = data ? JSON.parse(data) : {}
  if (currentUser.value && ratings.value[currentUser.value.username]) {
    userRating.value = ratings.value[currentUser.value.username]
  } else {
    userRating.value = 0
  }
}

const setRating = (star) => {
  if (!isAuthenticated.value || !currentUser.value) return
  ratings.value[currentUser.value.username] = star
  userRating.value = star
  localStorage.setItem('websiteRatings', JSON.stringify(ratings.value))
  calcAvg()
}

const avgRating = ref(null)
const totalRatings = ref(0)

const calcAvg = () => {
  const values = Object.values(ratings.value)
  if (values.length === 0) {
    avgRating.value = null
    totalRatings.value = 0
    return
  }
  const sum = values.reduce((a, b) => a + b, 0)
  avgRating.value = sum / values.length
  totalRatings.value = values.length
}

onMounted(() => {
  loadRatings()
  calcAvg()
})
</script>

<style scoped>
.star {
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
}
.star.filled {
  color: #f7b731;
}
.star:hover,
.star:hover ~ .star {
  color: #f7b731;
}
</style>
