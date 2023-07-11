<template>
  <Banner />
  <main class="flex flex-col gap-12">
    <!-- Top Clips -->
    <div class="border-b-2 border-zinc-700 sm:pb-12">
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold pb-6">Top Clips</h1>
        <TrophyIcon class="h-6 w-6 -mt-5 text-amber-500" />
      </div>
      <div
        class="flex gap-12 min-h-[210px] items-center flex-col justify-center sm:flex-row sm:justify-start sm:pl-12"
        v-if="loading"
      >
        <Loaders />
        <span class="text-zinc-500 animate-pulse">Doing some magic...</span>
      </div>

      <div v-else>
        <p class="text-xl font-bold text-zinc-500" v-if="topClips.length === 0">
          No clips to show, please try again later.
        </p>
        <div class="flex gap-8 flex-wrap">
          <VideoCard
            class="flex-grow w-[370px] max-w-1/2"
            v-for="clip in topClips"
            :key="clip.video.id"
            :clip="clip.video"
            :likesArray="clip.likesArray"
            :currentUser="userStore.username"
          />
          <!-- Create placeholders so cells contain proper ratios -->
          <div
            class="flex-grow w-[370px] max-w-1/2"
            v-for="n in 5 - topClips.length"
          />
        </div>
      </div>
    </div>

    <!-- Recent Clips -->
    <div>
      <div class="flex items-center gap-4">
        <h1 class="text-3xl font-bold pb-6">Recent Clips</h1>
        <SparklesIcon class="h-6 w-6 -mt-5 text-cyan-300" />
      </div>
      <div
        class="flex gap-12 min-h-[210px] items-center flex-col justify-center sm:flex-row sm:justify-start sm:pl-12"
        v-if="loading"
      >
        <Loaders />
        <span class="text-zinc-500 animate-pulse">Doing some magic...</span>
      </div>

      <div v-else>
        <p
          class="text-xl font-bold text-zinc-500"
          v-if="recentClips.length === 0"
        >
          No clips to show, please try again later.
        </p>
        <div class="flex gap-8 flex-wrap">
          <VideoCard
            class="flex-grow w-[370px] max-w-1/2"
            v-for="clip in recentClips"
            :key="clip.video.id"
            :clip="clip.video"
            :likesArray="clip.likesArray"
            :currentUser="userStore.username"
          />
          <!-- Create placeholders so cells contain proper ratios -->
          <div
            class="flex-grow w-[370px] max-w-1/2"
            v-for="n in maxRecentClips - recentClips.length"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import Banner from "@/components/Banner.vue";
import VideoCard from "@/components/VideoCard.vue";
import { getTopClips, getRecentClips } from "@/utils/firebase-helpers";
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import VideoCardLoad from "../components/VideoCardLoad.vue";
import { TrophyIcon, SparklesIcon } from "@heroicons/vue/20/solid";
import { useToast } from "vue-toastification";
import Loaders from "@/components/common/Loaders.vue";

const toast = useToast();

const userStore = useUserStore();
const loading = ref(true);
const topClips = ref([]);
const recentClips = ref([]);

const maxRecentClips = 10;
const maxTopClips = 3;

const fetchClips = async () => {
  const topClipsData = await getTopClips(maxTopClips);
  const recentClipsData = await getRecentClips(maxRecentClips);
  topClips.value = topClipsData;
  recentClips.value = recentClipsData;
  loading.value = false;
};

fetchClips().catch((err) => {
  console.error(err);
  toast.info(
    "We are having issues right now 🥲, please give us some time to fix it!"
  );
});
</script>
