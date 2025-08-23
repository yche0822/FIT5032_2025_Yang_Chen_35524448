<script setup>
import BHeader from './components/BHeader.vue'
/* 
import JSONLab from './components/JSONLab.vue'
import LibraryRegistrationForm from './views/HomeView.vue'
*/
</script>

<template>
  <div class="main-container">
    <header>
      <BHeader />
    </header>


    <div id="route-announcer" class="sr-only" aria-live="polite"></div>


    <main id="main-content" class="main-box" tabindex="-1">
      <!-- <LibraryRegistrationForm /> -->
      <!-- <JSONLab /> -->
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.main-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 80vw;
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}
.main-box {
  text-align: center;
  margin-top: 50px;
}
</style>
