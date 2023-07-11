<template>
  <div>
    <div>
      <img
        class="h-32 w-full object-cover lg:h-48"
        :src="backgroundImage"
        alt=""
      />
    </div>
    <div class="px-4 sm:px-6 lg:px-8 flex gap-4">
      <div class="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
        <div class="flex">
          <img
            class="h-24 w-24 rounded-full ring-4 ring-purple-700 sm:h-32 sm:w-32"
            :src="avatar"
            alt=""
          />
        </div>
      </div>
      <div class="inline-flex pt-2">
        <h1 class="text-2xl font-bold">
          {{ username }}
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  backgroundImage: {
    type: String,
    required: true,
  },
});
</script>
