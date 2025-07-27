<template>
  <div class="container text-center py-4">
    <h1 class="display-5 mb-4">About Our Website</h1>
    <p class="lead">
      Welcome to our EasyAge! We are dedicated to providing comprehensive welfare services for seniors.
    </p>
    <div v-if="isAuthenticated" class="alert alert-success mt-4">
      Welcome back, admin!
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const isAuthenticated = computed(() => {
  return localStorage.getItem('isAuthenticated') === 'true'
})
</script>