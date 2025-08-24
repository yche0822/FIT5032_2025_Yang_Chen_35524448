
<template>
  <div class="container mt-5">
    <h1 class="text-center">Contact Us</h1>
    <p class="text-center">If you have any questions, suggestions, or need help, please contact us:</p>
    <div class="row justify-content-center mt-4">
      <div class="col-md-6">
        <ul class="list-group">
          <li class="list-group-item"><b>Email:</b> support@easyage.com</li>
          <li class="list-group-item"><b>Phone:</b> 123-456-7890</li>
          <li class="list-group-item"><b>Address:</b> 123 Main St, Melbourne, VIC</li>
        </ul>
      </div>
    </div>
    <div class="text-center mt-4">
      <label for="feedback" class="form-label">Leave us a message:</label>
      <textarea id="feedback" v-model="message" class="form-control" rows="3" placeholder="Type your feedback here..."></textarea>
      <div class="mt-2">
        <button class="btn btn-primary me-2" @click="submitMessage" :disabled="!message.trim()">Submit</button>
        <button class="btn btn-secondary" @click="clearMessage" :disabled="!message">Clear</button>
      </div>
      <div v-if="messages.length" class="mt-4">
        <h2>Submitted Messages:</h2>
        <ul class="list-group">
          <li v-for="(msg, idx) in messages" :key="idx" class="list-group-item text-start">{{ msg }}</li>
        </ul>
      </div>
      <div class="text-secondary mt-3">
        We value your feedback and will respond as soon as possible.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('')
const messages = ref([])
function submitMessage() {
  if (message.value.trim()) {
    messages.value.unshift(message.value.trim())
    message.value = ''
  }
}
function clearMessage() {
  message.value = ''
}
</script>
