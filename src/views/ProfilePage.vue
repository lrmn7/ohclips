<template>
  <ProfileBanner
    :username="user.username"
    :avatar="user.avatar"
    backgroundImage="https://images.pexels.com/photos/6984984/pexels-photo-6984984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  />
  <main>
    <!-- File Uploader -->
    <div>
      <h1 class="text-3xl font-bold pb-6">Uploader</h1>
      <Uploader @clipAdded="pushClip" />
    </div>

    <!-- Users Clips -->
    <div>
      <h1 class="text-3xl font-bold pb-6 pt-8">My Clips</h1>
      <Loaders v-if="loading" />
      <div v-else>
        <p class="text-xl font-bold text-zinc-500" v-if="clips.length === 0">
          No clips to show, upload your first clip above!
        </p>
        <div class="flex gap-8 flex-wrap">
          <VideoCard
            class="w-[370px]"
            v-for="clip in clips"
            :key="clip.video.id"
            :clip="clip.video"
            :likesArray="clip.likesArray"
            :currentUser="user.username"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import ProfileBanner from "@/components/ProfileBanner.vue";
import VideoCard from "@/components/VideoCard.vue";
import Uploader from "@/components/Uploader.vue";
import Loaders from "@/components/common/Loaders.vue";

import { getClipsByUsername } from "@/utils/firebase-helpers";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const loading = ref(true);
const clips = ref([]);
const user = useUserStore();

getClipsByUsername(user.username)
  .then((data) => {
    clips.value = data;
  })
  .finally(() => {
    loading.value = false;
  });

const pushClip = (clip) => {
  clips.value.unshift(clip);
};
</script>
