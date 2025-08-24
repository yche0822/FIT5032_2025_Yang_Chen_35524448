<template>
  <div class="container py-4">
    <!-- KPIs -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="p-3 bg-light rounded shadow-sm h-100">
          <div class="text-muted small">Total Appointments</div>
          <div class="fs-3">{{ kpi.appointments }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-light rounded shadow-sm h-100">
          <div class="text-muted small">Total Ratings</div>
          <div class="fs-3">{{ kpi.ratings }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-light rounded shadow-sm h-100">
          <div class="text-muted small">Raters (distinct)</div>
          <div class="fs-3">{{ kpi.raters }}</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-3 bg-light rounded shadow-sm h-100">
          <div class="text-muted small">Status / Offline Queue</div>
          <div class="fs-6">
            <span :class="kpi.online ? 'text-success' : 'text-secondary'">
              ● {{ kpi.online ? 'Online' : 'Offline' }}
            </span>
            <span class="ms-2">Queued: {{ kpi.offlineQueued }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Global search -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="m-0">Website Manager Dashboard</h1>
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="globalFilter" placeholder="Global search" />
      </IconField>
    </div>

    <!-- Table 1: Users -->
    <section class="mb-5">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h1 class="m-0">Users Table</h1>
        <small class="text-muted">Sortable · Global search · Column filters · 10 rows/page</small>
      </div>

      <DataTable
        :value="users"
        paginator
        :rows="10"
        :globalFilterFields="['name','email','role']"
        :filters="userFilters"
        sortMode="multiple"
        tableStyle="min-width: 60rem"
        stripedRows
        showGridlines
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 120px" />
        <Column field="name" header="Name" sortable filter filterField="name" filterPlaceholder="Search by name" />
        <Column field="email" header="Email" sortable filter filterField="email" filterPlaceholder="Search by email" />
        <Column field="role" header="Role" sortable filter filterField="role" filterPlaceholder="admin / user" />
      </DataTable>
    </section>

    <!-- Table 2: Websites -->
    <section class="mb-5">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h1 class="m-0">Websites Table</h1>
        <small class="text-muted">Sortable · Global search · Column filters · 10 rows/page</small>
      </div>

      <DataTable
        :value="websites"
        paginator
        :rows="10"
        :globalFilterFields="['url','status','category']"
        :filters="siteFilters"
        sortMode="multiple"
        tableStyle="min-width: 60rem"
        stripedRows
        showGridlines
        dataKey="id"
      >
        <Column field="id" header="ID" sortable style="width: 120px" />
        <Column field="url" header="URL" sortable filter filterField="url" filterPlaceholder="Search by URL" />
        <Column field="status" header="Status" sortable filter filterField="status" filterPlaceholder="ok / blocked" />
        <Column field="category" header="Category" sortable filter filterField="category" filterPlaceholder="news / social / edu ..." />
        <Column field="score" header="Score" sortable style="width: 140px" filter filterField="score" filterPlaceholder="≥ number" />
      </DataTable>
    </section>

    <!-- Latest Appointments -->
    <section>
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h1 class="m-0">Latest Appointments</h1>
        <small class="text-muted">Top 5 (most recent)</small>
      </div>
      <ul class="list-group">
        <li v-for="a in latestAppointments" :key="a.id" class="list-group-item d-flex justify-content-between">
          <div>
            <strong>{{ a.title || 'Untitled' }}</strong>
            <span class="text-muted ms-2">{{ fmt(a.start) }}</span>
            <span class="text-muted"> → {{ fmt(a.end) }}</span>
          </div>
          <span class="badge bg-secondary align-self-center">ID: {{ a.id }}</span>
        </li>
        <li v-if="!latestAppointments.length" class="list-group-item text-muted">No appointments yet.</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { db } from '@/firebase'
import {
  collection, getCountFromServer, onSnapshot, query, orderBy, limit, getDocs
} from 'firebase/firestore'

// ====== UI state ======
const globalFilter = ref('')

// tables
const users = ref([])
const websites = ref([])

// KPIs & latest
const kpi = reactive({
  appointments: 0,
  ratings: 0,
  raters: 0,
  offlineQueued: 0,
  online: navigator.onLine
})
const latestAppointments = ref([])

// ====== Filters (PrimeVue 简易写法，与你现有一致) ======
const userFilters = ref({
  global: { value: globalFilter.value, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
  email: { value: null, matchMode: 'contains' },
  role: { value: null, matchMode: 'equals' }
})
const siteFilters = ref({
  global: { value: globalFilter.value, matchMode: 'contains' },
  url: { value: null, matchMode: 'contains' },
  status: { value: null, matchMode: 'equals' },
  category: { value: null, matchMode: 'contains' },
  score: { value: null, matchMode: 'gte' }
})
watch(globalFilter, (v) => {
  userFilters.value.global.value = v
  siteFilters.value.global.value = v
})

// ====== Helpers ======
const fmt = (iso) => iso ? new Date(iso).toLocaleString() : ''

// ====== Firestore subscriptions / loads ======
let unsubs = []

const loadKPIs = async () => {
  try {
    const apptCount = await getCountFromServer(collection(db, 'appointments'))
    kpi.appointments = apptCount.data().count
  } catch { kpi.appointments = 0 }

  try {
    const ratingCount = await getCountFromServer(collection(db, 'ratings'))
    kpi.ratings = ratingCount.data().count
  } catch { kpi.ratings = 0 }

  try {
    const ratersSnap = await getDocs(collection(db, 'ratings'))
    kpi.raters = ratersSnap.size
  } catch { kpi.raters = 0 }

  // 离线队列（与你 CalendarView 的 key 保持一致）
  try {
    kpi.offlineQueued = JSON.parse(localStorage.getItem('offline_appt_queue') || '[]').length
  } catch { kpi.offlineQueued = 0 }
}

const subscribeLatestAppointments = () => {
  try {
    const q = query(collection(db, 'appointments'), orderBy('start', 'desc'), limit(5))
    const u = onSnapshot(q, (snap) => {
      latestAppointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }, () => { latestAppointments.value = [] })
    unsubs.push(u)
  } catch { /* ignore */ }
}

const loadWebsites = async () => {
  // 如果你有 websites 集合，就读；否则生成演示数据
  try {
    const snap = await getDocs(collection(db, 'websites'))
    if (!snap.empty) {
      websites.value = snap.docs.map((d, i) => ({ id: d.id, ...d.data(), idx: i }))
      return
    }
  } catch { /* ignore and fallback */ }
  // fallback demo
  websites.value = Array.from({ length: 25 }).map((_, i) => ({
    id: `D-${101 + i}`,
    url: `https://site${i + 1}.example.com`,
    status: i % 3 === 0 ? 'blocked' : 'ok',
    category: ['news', 'social', 'edu', 'blog'][i % 4],
    score: Math.floor(Math.random() * 100)
  }))
}

const loadUsers = async () => {
  // 优先读取 users 集合（如果你在注册时把用户信息写进去）
  try {
    const snap = await getDocs(collection(db, 'users'))
    if (!snap.empty) {
      users.value = snap.docs.map((d, i) => ({ id: d.id, ...d.data(), idx: i }))
      return
    }
  } catch { /* ignore and fallback */ }
  // 没有 users 集合时，基于 ratings 推导一个用户表
  try {
    const snap = await getDocs(collection(db, 'ratings'))
    users.value = snap.docs.map((d, i) => {
      const v = d.data()
      return {
        id: d.id,
        name: v.username || 'anonymous',
        email: v.username || 'unknown',
        role: 'user'
      }
    })
  } catch {
    // 最后兜底：演示数据
    users.value = Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@demo.com`,
      role: i % 7 === 0 ? 'admin' : 'user'
    }))
  }
}

const onlineHandler = () => { kpi.online = true; loadKPIs() }
const offlineHandler = () => { kpi.online = false }

onMounted(async () => {
  await Promise.all([loadKPIs(), loadUsers(), loadWebsites()])
  subscribeLatestAppointments()
  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)
})

onBeforeUnmount(() => {
  unsubs.forEach(fn => typeof fn === 'function' && fn())
  window.removeEventListener('online', onlineHandler)
  window.removeEventListener('offline', offlineHandler)
})
</script>

<style scoped>
.container { max-width: 1200px; }
.p-datatable .p-paginator { justify-content: end; }
.list-group-item { font-size: 0.95rem; }
</style>
