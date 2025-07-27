// import './assets/main.css'
// import '@/assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
// import DataTable from 'primevue/datatable'
// import Column from 'primevue/Column'

const initAdmin = () => {
  let users = JSON.parse(localStorage.getItem('users') || '[]')
  if (!users.find(u => u.username === 'admin')) {
    users.push({ username: 'admin', password: 'admin123', role: 'admin' })
    localStorage.setItem('users', JSON.stringify(users))
  }
}
initAdmin()

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')
