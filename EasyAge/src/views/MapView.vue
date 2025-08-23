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


    <section class="logs">
      <div class="logs-header">
        <h3>Route History</h3>
        <div class="actions">
          <button class="btn outline" @click="exportCSV">Export CSV</button>
          <button class="btn outline" @click="exportPDF">Export PDF</button>
          <button class="btn" @click="clearLogs">Clear Logs</button>
        </div>
      </div>

      <div role="status" aria-live="polite" class="sr-only" id="log-announcer"></div>

      <table v-if="routeLogs.length" class="log-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>From (name)</th>
            <th>From (lat, lon)</th>
            <th>To (name)</th>
            <th>To (lat, lon)</th>
            <th>Distance (km)</th>
            <th>Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in routeLogs" :key="i">
            <td>{{ fmtTime(r.ts) }}</td>
            <td>{{ r.fromName }}</td>
            <td>{{ r.fromLat.toFixed(5) }}, {{ r.fromLon.toFixed(5) }}</td>
            <td>{{ r.toName }}</td>
            <td>{{ r.toLat.toFixed(5) }}, {{ r.toLon.toFixed(5) }}</td>
            <td>{{ (r.distance/1000).toFixed(2) }}</td>
            <td>{{ Math.round(r.duration/60) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No routes yet. Plan a route to build history.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as L from 'leaflet'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import 'leaflet/dist/leaflet.css'


const map = ref(null)
const start = ref(null)
const end = ref(null)
const trip = ref(null)
const mode = ref('')
const queryA = ref('')
const queryB = ref('')
const searchText = ref('')

let startMarker = null
let endMarker = null
let searchMarker = null
let routeLayer = null


const routeLogs = ref(loadLogs())

function loadLogs() {
  try { return JSON.parse(localStorage.getItem('routeLogs') || '[]') } catch { return [] }
}
function saveLogs() {
  localStorage.setItem('routeLogs', JSON.stringify(routeLogs.value))
  const a = document.getElementById('log-announcer')
  if (a) a.textContent = `Route history updated. Total ${routeLogs.value.length} routes.`
}


function addCircleMarker(lat, lon, color='#2b8a3e') {
  return L.circleMarker([lat, lon], { radius: 8, color, weight: 2, fillOpacity: 0.8 })
           .addTo(map.value)
}
async function geocode(text) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}`
  const { data } = await axios.get(url, { headers: { 'Accept-Language': 'en' } })
  if (!data?.length) throw new Error('No results')
  const { lat, lon, display_name } = data[0]
  return { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name }
}
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  const { data } = await axios.get(url, { headers: { 'Accept-Language': 'en' } })
  return data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
}
async function requestRoute(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`
  const { data } = await axios.get(url)
  const r = data?.routes?.[0]
  if (!r) throw new Error('No route')
  return r 
}
function flyTo(lat, lon, z=14) { map.value.flyTo([lat, lon], z) }
const fmtTime = (ts) => new Date(ts).toLocaleString()


async function setBySearch(which) {
  try {
    const q = which === 'A' ? queryA.value : queryB.value
    if (!q.trim()) return
    const p = await geocode(q)
    if (which === 'A') {
      start.value = { lat: p.lat, lon: p.lon, name: p.name }
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(p.lat, p.lon, '#2b8a3e').bindPopup('A: ' + p.name)
    } else {
      end.value = { lat: p.lat, lon: p.lon, name: p.name }
      if (endMarker) endMarker.remove()
      endMarker = addCircleMarker(p.lat, p.lon, '#c92a2a').bindPopup('B: ' + p.name)
    }
    flyTo(p.lat, p.lon)
  } catch (e) { alert('Search failed: ' + (e.message || e)) }
}

async function useMyLocation(which) {
  if (!navigator.geolocation) return alert('Geolocation not supported')
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude, lon = pos.coords.longitude
    const name = await reverseGeocode(lat, lon)
    const point = { lat, lon, name }
    if (which === 'A') {
      start.value = point
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(lat, lon, '#2b8a3e').bindPopup('A: ' + name)
    } else {
      end.value = point
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
  } catch (e) { alert('Search failed: ' + (e.message || e)) }
}

async function drawRoute() {
  try {
    if (!start.value || !end.value) return
    if (routeLayer) { routeLayer.remove(); routeLayer = null }
    const r = await requestRoute(start.value, end.value)
    trip.value = { distance: r.distance, duration: r.duration }
    routeLayer = L.geoJSON(r.geometry, { style: { color: '#1971c2', weight: 5 } }).addTo(map.value)
    map.value.fitBounds(routeLayer.getBounds(), { padding: [30, 30] })


    const fromName = start.value.name || `${start.value.lat.toFixed(5)}, ${start.value.lon.toFixed(5)}`
    const toName   = end.value.name   || `${end.value.lat.toFixed(5)}, ${end.value.lon.toFixed(5)}`
    routeLogs.value.unshift({
      ts: Date.now(),
      fromName,
      fromLat: start.value.lat, fromLon: start.value.lon,
      toName,
      toLat: end.value.lat, toLon: end.value.lon,
      distance: r.distance,
      duration: r.duration
    })
    if (routeLogs.value.length > 100) routeLogs.value.pop()
    saveLogs()
  } catch (e) { alert('Routing failed: ' + (e.message || e)) }
}

function clearAll() {
  [startMarker, endMarker, searchMarker, routeLayer].forEach(l => l && l.remove())
  startMarker = endMarker = searchMarker = routeLayer = null
  start.value = end.value = null
  trip.value = null
}

function clearLogs() {
  if (!confirm('Clear all route logs?')) return
  routeLogs.value = []
  saveLogs()
}


function rowsForExport() {
  return routeLogs.value.map(r => ([
    fmtTime(r.ts),
    r.fromName,
    `${r.fromLat.toFixed(5)}, ${r.fromLon.toFixed(5)}`,
    r.toName,
    `${r.toLat.toFixed(5)}, ${r.toLon.toFixed(5)}`,
    (r.distance/1000).toFixed(2),
    Math.round(r.duration/60)
  ]))
}
const filename = (base, ext) => {
  const d = new Date(); const pad = (x) => String(x).padStart(2,'0')
  return `${base}_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`
}
function exportCSV() {
  const head = ['Time','From (name)','From (lat, lon)','To (name)','To (lat, lon)','Distance (km)','Duration (min)']
  const lines = [head, ...rowsForExport()]
  const csv = lines.map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob(["\uFEFF"+csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = filename('routes','csv'); document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}
function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18); doc.text('Route History', 14, 18)
  doc.setFontSize(11); doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26)
  const rows = rowsForExport()
  if (rows.length === 0) {
    doc.setFontSize(12); doc.text('No routes yet.', 14, 36)
  } else {
    autoTable(doc, {
      startY: 32,
      head: [['Time','From (name)','From (lat, lon)','To (name)','To (lat, lon)','Distance (km)','Duration (min)']],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 71, 194] }
    })
    const y = doc.lastAutoTable.finalY + 8
    const total = routeLogs.value.length
    const avgKm  = (routeLogs.value.reduce((a,b)=>a+b.distance,0) / Math.max(total,1) / 1000).toFixed(2)
    const avgMin = Math.round(routeLogs.value.reduce((a,b)=>a+b.duration,0) / Math.max(total,1) / 60)
    doc.setFontSize(12)
    doc.text(`Count: ${total}   |   Average Distance: ${avgKm} km   |   Average Duration: ${avgMin} min`, 14, y)
  }
  doc.save(filename('routes','pdf'))
}


onMounted(() => {
  map.value = L.map('map', { zoomControl: true }).setView([-37.8136, 144.9631], 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map.value)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.value.setView([pos.coords.latitude, pos.coords.longitude], 13)
    })
  }

  map.value.on('click', async (e) => {
    if (!mode.value) return
    const { lat, lng } = e.latlng
    const name = await reverseGeocode(lat, lng)
    if (mode.value === 'A') {
      start.value = { lat, lon: lng, name } // 保存名称
      if (startMarker) startMarker.remove()
      startMarker = addCircleMarker(lat, lng, '#2b8a3e').bindPopup('A: ' + name).openPopup()
    } else {
      end.value = { lat, lon: lng, name }
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


.logs { margin-top: 16px; }
.logs-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.actions { display: flex; gap: 8px; }
.btn.outline { background: #fff; }
.log-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
.log-table th, .log-table td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
.muted { color: #6b7280; }


.sr-only {
  position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0;
}
</style>
