<template>
  <div class="container py-4">
    <!-- Global search -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h3 class="m-0">Website Manager Dashboard</h3>
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="globalFilter" placeholder="Global search" />
      </IconField>
    </div>

    <!-- Table 1: Users -->
    <section class="mb-5">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="m-0">Users Table</h5>
        <small class="text-muted">Sortable · Global search · Column filters · 10 rows per page</small>
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
        <Column field="id" header="ID" sortable style="width: 100px" />
        <Column field="name" header="Name" sortable
                filter
                filterField="name"
                filterPlaceholder="Search by name" />
        <Column field="email" header="Email" sortable
                filter
                filterField="email"
                filterPlaceholder="Search by email" />
        <Column field="role" header="Role" sortable
                filter
                filterField="role"
                filterPlaceholder="admin / user" />
      </DataTable>
    </section>

    <!-- Table 2: Websites -->
    <section>
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h5 class="m-0">Websites Table</h5>
        <small class="text-muted">Sortable · Global search · Column filters · 10 rows per page</small>
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
        <Column field="id" header="ID" sortable style="width: 100px" />
        <Column field="url" header="URL" sortable
                filter
                filterField="url"
                filterPlaceholder="Search by URL" />
        <Column field="status" header="Status" sortable
                filter
                filterField="status"
                filterPlaceholder="ok / blocked" />
        <Column field="category" header="Category" sortable
                filter
                filterField="category"
                filterPlaceholder="news / social / edu ..." />
        <Column field="score" header="Score" sortable style="width: 140px"
                filter
                filterField="score"
                filterPlaceholder="≥ number" />
      </DataTable>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const globalFilter = ref('')

const users = ref([])
const websites = ref([])

onMounted(() => {
  users.value = Array.from({ length: 32 }).map((_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@demo.com`,
    role: i % 7 === 0 ? 'admin' : 'user'
  }))

  websites.value = Array.from({ length: 25 }).map((_, i) => ({
    id: 101 + i,
    url: `https://site${i + 1}.example.com`,
    status: i % 3 === 0 ? 'blocked' : 'ok',
    category: ['news', 'social', 'edu', 'blog'][i % 4],
    score: Math.floor(Math.random() * 100)
  }))
})

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
</script>

<style scoped>
.container { max-width: 1200px; }
.p-datatable .p-paginator { justify-content: end; }
</style>
