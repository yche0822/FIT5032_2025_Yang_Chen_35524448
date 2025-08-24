<script setup>
import { ref } from 'vue'
import mobileImg from '@/assets/images/mobile.jpg'
import medicalImg from '@/assets/images/medical.png'
import volunteerImg1 from '@/assets/images/volunteer1.jpg'
import volunteerImg2 from '@/assets/images/volunteer2.jpg'

const newsList = [
  {
    id: 'news1',
    title: 'Elderly Tech Day: Seniors Embrace Smart Devices',
    date: '2024-01-22',
    img: mobileImg,
    desc: 'A special event was held to help seniors learn to use smartphones and tablets, making daily life more convenient and connected.'
  },
  {
    id: 'news2',
    title: 'Volunteer Medical Checkups Bring Care to Seniors',
    date: '2025-07-25',
    img: medicalImg,
    desc: 'A team of volunteers and doctors visited the community to provide free health checkups and consultations for elderly residents, promoting wellness and care.'
  }
]

const ratings = ref({})
const userRatings = ref({})
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

function loadRatings() {
  const all = {}
  newsList.forEach(news => {
    const arr = JSON.parse(localStorage.getItem('rating_' + news.id) || '[]')
    all[news.id] = arr
    if (currentUser) {
      const userRate = arr.find(r => r.username === currentUser.username)
      if (userRate) userRatings.value[news.id] = userRate.score
    }
  })
  ratings.value = all
}

function getAvg(newsId) {
  const arr = ratings.value[newsId] || []
  if (!arr.length) return 'No ratings yet'
  const avg = arr.reduce((sum, r) => sum + r.score, 0) / arr.length
  return avg.toFixed(1)
}

function setRating(newsId, score) {
  if (!currentUser) {
    alert('Please login to rate!')
    return
  }
  if (typeof score !== 'number' || score < 1 || score > 5) {
    alert('Invalid rating value!')
    return
  }
  let arr = JSON.parse(localStorage.getItem('rating_' + newsId) || '[]')
  arr = arr.filter(r => r.username !== currentUser.username)
  arr.push({ username: currentUser.username, score })
  localStorage.setItem('rating_' + newsId, JSON.stringify(arr))
  loadRatings()
}

loadRatings()
</script>


<template>
  <div class="container mt-5">
    <div class="row mb-4">
      <div class="col-md-8">
        <h1>Elderly News</h1>
        <div class="news-list">
          <div v-for="news in newsList" :key="news.id" class="news-item mb-3 p-3 bg-white rounded shadow-sm">
            <h2 v-text="news.title"></h2>
            <p class="mb-1" v-text="news.date"></p>
            <img :src="news.img" alt="news image" class="img-fluid rounded mb-2 news-main-img">
            <p v-text="news.desc"></p>
            <div class="d-flex align-items-center mt-2">
              <span class="me-2">Average Rating: <b>{{ getAvg(news.id) }}</b></span>
              <span v-if="currentUser">
                <span v-for="n in 5" :key="n" @click="setRating(news.id, n)" style="cursor:pointer; font-size:1.3em; color:gold;">
                  <span v-if="userRatings[news.id] >= n">★</span><span v-else>☆</span>
                </span>
                <span class="ms-2 text-secondary" v-if="userRatings[news.id]">({{ userRatings[news.id] }}分)</span>
              </span>
              <span v-else class="text-secondary ms-2">(Login to rate)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <h1>Volunteers in Action</h1>
        <img :src="volunteerImg1" alt="Volunteer helping senior" class="img-fluid rounded shadow mb-3">
        <img :src="volunteerImg2" alt="Volunteer group" class="img-fluid rounded shadow">
      </div>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  font-size: 1.1rem;
}
.news-list {
  margin-top: 1rem;
}
.news-main-img {
  width: 100%;
  max-width: 480px;
  max-height: 260px;
  object-fit: cover;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}
.list-group-item {
  padding: 10px;
}
</style>
