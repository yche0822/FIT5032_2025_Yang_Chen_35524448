<template>
  <div class="container mt-5">
    <div class="alert alert-danger text-center">
      <h1>Access Denied</h1>
      <p>You must be logged in within admin to view this page.</p>
      <router-link to="/login" class="btn btn-primary">Go to Login within admin</router-link>
    </div>
  </div>
</template>