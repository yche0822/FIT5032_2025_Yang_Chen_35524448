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

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import MultiSelect from 'primevue/multiselect'

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

app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('MultiSelect', MultiSelect)
// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')
