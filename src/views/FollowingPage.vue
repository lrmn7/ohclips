<template>
  <BasicTextBanner
    headline="Following"
    subline="Your friends clips will be shown here."
    background="https://raw.githubusercontent.com/lrmn7/save-images/main/lrmn-anime.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  />
  <main class="min-h-[calc(100vh-472px)]">
    <div
      v-if="loading"
      class="flex justify-center items-center pt-12 flex-col gap-8"
    >
      <Loaders />
      <span class="text-zinc-500">Loading following...</span>
    </div>
    <template v-else>
      <h3 v-if="!followingList">Follow people to see them appear below.</h3>
      <h3 v-else-if="followingClips.length === 0">
        Once your following have uploaded a clip it will show here.
      </h3>
      <div v-else class="flex gap-8 flex-wrap">
        <VideoCard
          class="w-[360px]"
          v-for="clip in followingClips"
          :key="clip.video.id"
          :clip="clip.video"
          :likesArray="clip.likesArray"
          :currentUser="userStore.username"
        />
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref } from "vue";
import BasicTextBanner from "@/components/BasicTextBanner.vue";
import { useUserStore } from "@/stores/user";
import { getUserDetails, getFollowingClips } from "@/utils/firebase-helpers";
import VideoCard from "@/components/VideoCard.vue";
import Loaders from "@/components/common/Loaders.vue";

const userStore = useUserStore();
const followingList = ref(false);
const followingClips = ref([]);
const loading = ref(true);

getUserDetails(userStore.username)
  .then((user) => {
    if (user.following) {
      followingList.value = user.following.length;
      if (followingList.value) {
        getFollowingClips(user.following).then((data) => {
          followingClips.value = data;
        });
      }
    } else {
      followingList.value = false;
    }
  })
  .finally(() => {
    loading.value = false;
  });
</script>
