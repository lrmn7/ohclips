<template>
  <LoginForm v-if="type === 'login'" />
  <RegisterForm v-if="type === 'signup'" />
</template>

<script setup>
import LoginForm from "@/components/forms/LoginForm.vue";
import RegisterForm from "@/components/forms/RegisterForm.vue";

import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";

const modal = useModalStore();
const { type } = storeToRefs(modal);
</script>
