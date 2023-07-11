<template>
  <ProfileBanner
    v-if="!loading"
    :username="profile.username"
    :avatar="profile.photoURL"
    backgroundImage="https://images.pexels.com/photos/6984984/pexels-photo-6984984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  />
  <main>
    <!-- Users Clips -->
    <div
      v-if="loading"
      class="flex justify-center items-center min-h-[calc(100vh-298px)]"
    >
      <Loaders />
    </div>
    <div v-else class="flex flex-col">
      <div
        class="flex justify-end -mt-16 sm:-mt-20"
        v-if="!isOwner && user.userLoggedIn"
      >
        <button
          v-if="!isFollowing"
          type="button"
          class="bg-purple-700 px-4 py-2 rounded-md font-semibold hover:bg-purple-900 transition-all duration-150 ease-out"
          @click.prevent="follow"
        >
          Follow
        </button>
        <button
          v-else
          type="button"
          class="bg-red-800 px-4 py-2 rounded-md font-semibold hover:bg-red-900 transition-all duration-150 ease-out"
          @click.prevent="unfollow"
        >
          Unfollow
        </button>
      </div>
      <div v-else-if="user.userLoggedIn">
        <p class="text-lg text-zinc-500">
          This is how you appear to the public.
        </p>
      </div>
      <h1 class="text-3xl font-bold pb-6 pt-8">Clips</h1>
      <div>
        <p class="text-xl font-bold text-zinc-500" v-if="clips.length === 0">
          {{ id }} has no clips yet.
        </p>
        <div class="flex gap-8 flex-wrap">
          <div v-for="clip in clips" class="w-[370px]">
            <VideoCard
              :key="clip.video.id"
              :clip="clip.video"
              :likesArray="clip.likesArray"
              :currentUser="user.username"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import ProfileBanner from "@/components/ProfileBanner.vue";
import VideoCard from "@/components/VideoCard.vue";
import Loaders from "@/components/common/Loaders.vue";
import { useRoute, useRouter } from "vue-router";
import {
  getClipsByUsername,
  getAuthAndReqUser,
  getUserDetails,
  followUser,
  unfollowUser,
} from "@/utils/firebase-helpers";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

// Get route params
const { id } = route.params;

// Local States
const loading = ref(true);
const clips = ref([]);
const profile = ref(null);
const isOwner = ref(false);
const isFollowing = ref(false);

// Get auth user
if (id.toLowerCase() === user.username.toLowerCase() || !user.userLoggedIn) {
  isOwner.value = user.userLoggedIn;
  getUserDetails(user.username || id)
    .then((res) => {
      profile.value = res;
      getClips(res.username);
    })
    .catch((err) => {
      router.push({ name: "home" });
    });
} else {
  // Get auth and req user
  getAuthAndReqUser(user.username, id)
    .then((res) => {
      profile.value = res.reqUser;
      isFollowing.value = res.authUser.following?.includes(
        res.reqUser.username
      );
      getClips(res.reqUser.username);
    })
    .catch((err) => {
      router.push({ name: "home" });
    });
}

// Retrieve clips by username
const getClips = (username) => {
  getClipsByUsername(username)
    .then((data) => {
      clips.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
};

// Follow the user
const follow = () => {
  followUser(user.username, id).then(() => {
    isFollowing.value = true;
  });
};

// Unfollow the user
const unfollow = () => {
  unfollowUser(user.username, id).then(() => {
    isFollowing.value = false;
  });
};
</script>
