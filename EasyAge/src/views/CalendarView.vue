<!-- src/views/CalendarView.vue -->
<template>
  <div>
    <h1 class="mb-3">Appointments</h1>
    <p class="mb-2">
      Status:
      <strong :style="{ color: isOnline ? 'green' : 'gray' }">
        {{ isOnline ? 'Online' : 'Offline (queue enabled)' }}
      </strong>
    </p>
    <div ref="calendarEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'


import { db } from '@/firebase'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'

// import '@fullcalendar/daygrid/main.css'
// import '@fullcalendar/timegrid/main.css'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const calendarEl = ref(null)
let calendar = null
const events = ref([])

const isOnline = ref(navigator.onLine)
const OFFLINE_KEY = 'offline_appt_queue'

const loadAppointments = () => {
  const q = query(collection(db, 'appointments'), orderBy('start'))
  return onSnapshot(q, snap => {
    events.value = snap.docs.map(d => {
      const v = d.data()
      return { id: d.id, title: v.title, start: v.start, end: v.end }
    })
    if (calendar) {
      calendar.removeAllEvents()
      calendar.addEventSource(events.value)
    }
  })
}

const hasConflict = (start, end) => {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return (calendar?.getEvents() || []).some(ev => {
    const es = ev.start.getTime()
    const ee = (ev.end || ev.start).getTime()
    return s < ee && e > es
  })
}

const persistOnline = async (payload) => {
  await addDoc(collection(db, 'appointments'), payload)
}

const enqueueOffline = (payload) => {
  const arr = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]')
  arr.push(payload)
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(arr))
}

const flushOffline = async () => {
  const arr = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]')
  if (!arr.length) return
  for (const p of arr) {
    try { await persistOnline(p) } catch { /* ignore */ }
  }
  localStorage.removeItem(OFFLINE_KEY)
}

const handleSelect = async (info) => {
  const title = prompt('Appointment title?')
  if (!title) return

  if (hasConflict(info.start, info.end)) {
    alert('Time conflict detected. Please choose another slot.')
    return
  }

  const payload = {
    title,
    start: info.start.toISOString(),
    end: info.end.toISOString()
  }

  if (navigator.onLine) {
    try { await persistOnline(payload) } catch { enqueueOffline(payload) }
  } else {
    enqueueOffline(payload)
    alert('You are offline. The booking is queued and will sync when online.')
  }
}

const handleEventAllow = (dropInfo) => {
  const { start, end } = dropInfo
  return !hasConflict(start, end)
}

let unsubscribe = null
const onlineHandler = () => { isOnline.value = true; flushOffline() }
const offlineHandler = () => { isOnline.value = false }

onMounted(() => {
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    selectable: true,
    select: handleSelect,
    eventOverlap: false,
    eventAllow: handleEventAllow,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }
  })
  calendar.render()

  unsubscribe = loadAppointments()

  window.addEventListener('online', onlineHandler)
  window.addEventListener('offline', offlineHandler)
})

onBeforeUnmount(() => {
  unsubscribe && unsubscribe()
  calendar?.destroy()
  window.removeEventListener('online', onlineHandler)
  window.removeEventListener('offline', offlineHandler)
})
</script>

<style scoped>
:deep(.fc) {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  padding: 8px;
}
</style>
