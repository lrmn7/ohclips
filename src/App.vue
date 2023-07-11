<script setup>
import Header from "@/components/global/Header.vue";
import Footer from "@/components/global/Footer.vue";
import AuthForms from "@/components/forms/AuthForms.vue";
</script>

<template>
  <Header />
  <router-view :key="$route.fullPath" />
  <Footer />
  <AuthForms />
</template>
