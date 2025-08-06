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

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

// app.component('DataTable', DataTable)
// app.component('Column', Column)

app.mount('#app')

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkjYs2JOmkxwmxHi0VNFiczrnIkPoT1Z0",
  authDomain: "lab7-15020.firebaseapp.com",
  projectId: "lab7-15020",
  storageBucket: "lab7-15020.firebasestorage.app",
  messagingSenderId: "672137265507",
  appId: "1:672137265507:web:c74fb6b353f44dfd735356"
};

// Initialize Firebase
initializeApp(firebaseConfig);
