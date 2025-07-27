<script setup>
import { ref } from 'vue'

// 新闻数据
const newsList = [
  {
    id: 'news1',
    title: 'The community organized a health lecture to care for the physical and mental well-being of the elderly.',
    date: '2025-07-20',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    desc: 'This week, the community center held a health lecture, which attracted many elderly participants, creating a lively atmosphere on-site.'
  },
  {
    id: 'news2',
    title: 'The volunteer companionship program warmed hearts.',
    date: '2025-07-18',
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    desc: 'The volunteer team visited the community, offering companionship and care to the elderly, spreading warmth to their lives'
  }
]

// 评分相关
const ratings = ref({})
const userRatings = ref({})
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

// 加载所有新闻的评分
function loadRatings() {
  const all = {}
  newsList.forEach(news => {
    const arr = JSON.parse(localStorage.getItem('rating_' + news.id) || '[]')
    all[news.id] = arr
    // 当前用户的评分
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
  // 移除当前用户旧评分
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
        <h2>Elderly News</h2>
        <div class="news-list">
          <div v-for="news in newsList" :key="news.id" class="news-item mb-3 p-3 bg-white rounded shadow-sm">
            <h5 v-text="news.title"></h5>
            <p class="mb-1" v-text="news.date"></p>
            <img :src="news.img" alt="news image" class="img-fluid rounded mb-2" style="max-height: 180px;">
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
        <h2>Volunteers in Action</h2>
        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80" alt="志愿者" class="img-fluid rounded shadow mb-3">
        <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80" alt="志愿者2" class="img-fluid rounded shadow">
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
.news-item img {
  width: 100%;
  object-fit: cover;
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
