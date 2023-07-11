<template>
  <div class="relative bg-purple-700">
    <div class="absolute inset-0">
      <img
        class="h-full w-full object-cover"
        :src="background"
        alt="Banner Background"
      />
      <div
        class="absolute inset-0 bg-purple-700 mix-blend-multiply"
        aria-hidden="true"
      />
    </div>
    <div class="relative py-12 px-6 sm:py-16 lg:px-8">
      <h1
        class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        {{ headline }}
      </h1>
      <p class="mt-6 max-w-3xl text-xl text-indigo-100">
        {{ subline }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  headline: {
    type: String,
    default: "Headline",
  },
  subline: {
    type: String,
    default: "Subline",
  },
  background: {
    type: String,
    default:
      "https://raw.githubusercontent.com/lrmn7/save-images/main/lrmn-anime.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
});
</script>
