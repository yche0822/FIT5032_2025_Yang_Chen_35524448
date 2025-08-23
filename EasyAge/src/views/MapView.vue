<template>
  <div class="map-page">
    <h2>Map & Geo Features</h2>

    <div class="controls">
      <div class="row">
        <input v-model="queryA" placeholder="Start: search address, e.g. Monash Caulfield" />
        <button @click="setBySearch('A')">Set A</button>
        <button @click="useMyLocation('A')">Use My Location as A</button>
        <button :class="{active: mode==='A'}" @click="mode='A'">Set A by map click</button>
      </div>
      <div class="row">
        <input v-model="queryB" placeholder="End: search address, e.g. Federation Square" />
        <button @click="setBySearch('B')">Set B</button>
        <button @click="useMyLocation('B')">Use My Location as B</button>
        <button :class="{active: mode==='B'}" @click="mode='B'">Set B by map click</button>
      </div>

      <div class="row">
        <button class="primary" @click="drawRoute" :disabled="!start || !end">Route A → B</button>
        <button @click="clearAll">Clear</button>
      </div>

      <div class="row info" v-if="trip">
        Trip: {{ (trip.distance/1000).toFixed(2) }} km • {{ Math.round(trip.duration/60) }} min
      </div>

      <div class="row">
        <input v-model="searchText" placeholder="Search any place (drops a marker)" />
        <button @click="searchPlace">Search</button>
      </div>
      <div class="tip">Tip: click on the map when “Set A/B by map click” is active.</div>
    </div>

    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

// --- state ---
const map = ref(null)
const start = ref(null)     // {lat, lon}
const end = ref(null)
const trip = ref(null)      // {distance, duration}
const mode = ref('')        // '', 'A', 'B'
const queryA = ref('')
const queryB = ref('')
const searchText = ref('')

let startMarker = null
let endMarker = null
let searchMarker = null
let routeLayer = null

// --- helpers ---
function addCircleMarker(lat, lon, color='#2b8a3e') {
  return L.circleMarker([lat, lon], { radius: 8, color, weight: 2, fillOpacity: 0.8 })
           .addTo(map.value)
}

// Geocode by Nominatim
async function geocode(text) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
  const { data } = await axios.get(url, { headers: { 'Accept-Language': 'en' } })
  if (!data?.length) throw new Error('No results')
  const { lat, lon, display_name } = data[0]
  return { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name }
}

// Reverse geocode (for clicks)
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  const { data } = await axios.get(url, { headers: { 'Accept-Language': 'en' } })
  return data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}

// OSRM routing
async function requestRoute(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`
  const { data } = await axios.get(url)
  const r = data?.routes?.[0]
  if (!r) throw new Error('No route')
  return r  // { distance, duration, geometry }
}

function flyTo(lat, lon, z=14) {
  map.value.flyTo([lat, lon], z)
}

// --- actions ---
async function setBySearch(which) {
  try {
    const q = which === 'A' ? queryA.value : queryB.value
    if (!q.trim()) return
    const p = await geocode(q)
    if (which === 'A') {
      start.value = { lat: p.lat, lon: p.lon }
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(p.lat, p.lon, '#2b8a3e').bindPopup('A: ' + p.name)
    } else {
      end.value = { lat: p.lat, lon: p.lon }
      if (endMarker) endMarker.remove()
      endMarker = addCircleMarker(p.lat, p.lon, '#c92a2a').bindPopup('B: ' + p.name)
    }
    flyTo(p.lat, p.lon)
  } catch (e) {
    alert('Search failed: ' + (e.message || e))
  }
}

async function useMyLocation(which) {
  if (!navigator.geolocation) return alert('Geolocation not supported')
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude, lon = pos.coords.longitude
    const name = await reverseGeocode(lat, lon)
    if (which === 'A') {
      start.value = { lat, lon }
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(lat, lon, '#2b8a3e').bindPopup('A: ' + name)
    } else {
      end.value = { lat, lon }
      if (endMarker) endMarker.remove()
      endMarker = addCircleMarker(lat, lon, '#c92a2a').bindPopup('B: ' + name)
    }
    flyTo(lat, lon)
  }, err => alert('Location error: ' + err.message))
}

async function searchPlace() {
  try {
    if (!searchText.value.trim()) return
    const p = await geocode(searchText.value)
    if (searchMarker) searchMarker.remove()
    searchMarker = addCircleMarker(p.lat, p.lon, '#1c7ed6').bindPopup(p.name)
    flyTo(p.lat, p.lon)
  } catch (e) {
    alert('Search failed: ' + (e.message || e))
  }
}

async function drawRoute() {
  try {
    if (routeLayer) { routeLayer.remove(); routeLayer = null }
    const r = await requestRoute(start.value, end.value)
    trip.value = { distance: r.distance, duration: r.duration }
    routeLayer = L.geoJSON(r.geometry, { style: { color: '#1971c2', weight: 5 } }).addTo(map.value)
    const bounds = routeLayer.getBounds()
    map.value.fitBounds(bounds, { padding: [30, 30] })
  } catch (e) {
    alert('Routing failed: ' + (e.message || e))
  }
}

function clearAll() {
  [startMarker, endMarker, searchMarker, routeLayer].forEach(l => l && l.remove())
  startMarker = endMarker = searchMarker = routeLayer = null
  start.value = end.value = null
  trip.value = null
}

onMounted(() => {
  map.value = L.map('map', { zoomControl: true }).setView([-37.8136, 144.9631], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map.value)

  // get current location as nice-to-have
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.value.setView([pos.coords.latitude, pos.coords.longitude], 13)
    })
  }

  // click to set A/B
  map.value.on('click', async (e) => {
    if (!mode.value) return
    const { lat, lng } = e.latlng
    const name = await reverseGeocode(lat, lng)
    if (mode.value === 'A') {
      start.value = { lat, lon: lng }
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(lat, lng, '#2b8a3e').bindPopup('A: ' + name).openPopup()
    } else {
      end.value = { lat, lon: lng }
      if (endMarker) endMarker.remove()
      endMarker = addCircleMarker(lat, lng, '#c92a2a').bindPopup('B: ' + name).openPopup()
    }
  })
})
</script>

<style scoped>
.map-page { max-width: 1000px; margin: 0 auto; }
.controls { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
.row { display: flex; gap: 8px; margin: 6px 0; flex-wrap: wrap; }
input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
button { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; background: #fff; }
button.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
button.active { background: #10b981; color: white; border-color: #10b981; }
.info { font-weight: 600; }
.tip { color: #666; font-size: 0.9em; }
.map { height: 70vh; border-radius: 8px; overflow: hidden; }
</style>
