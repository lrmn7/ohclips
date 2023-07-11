<template>
  <main class="max-w-[2000px] mx-auto">
    <div v-if="!clip" class="flex justify-center items-center pt-12">
      <Loaders />
    </div>
    <div v-else>
      <div class="flex flex-col 2xl:grid grid-cols-7 gap-8">
        <VideoPlayer
          class="rounded-lg overflow-clip shadow-2xl shadow-purple-700/20 col-span-4 xl:col-span-5"
          :playback="clip.playback_id"
        />
        <div
          class="col-span-3 xl:col-span-2 flex flex-col gap-4 border-2 p-6 sm:p-8 border-zinc-700 rounded-lg relative"
        >
          <!-- Top -->
          <div class="border-b-2 pb-2 sm:pb-6 border-zinc-700/40">
            <div class="flex items-center justify-between sm:pb-4">
              <span class="text-lg text-gray-500">Creator</span>
              <div
                class="bg-red-200 inline-flex px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase text-red-900"
              >
                <span>{{ clip.game }}</span>
              </div>
            </div>
            <router-link
              :to="{ name: 'user', params: { id: clip.username } }"
              class="text-lg sm:text-3xl font-bold hover:text-purple-700 transition-all duration-150 ease-in-out"
            >
              <div class="inline-flex items-center gap-2 sm:gap-4">
                <img
                  class="inline-block h-4 w-4 sm:h-8 sm:w-8 rounded-full ring-2 ring-purple-700"
                  :src="clip.avatar"
                  :alt="clip.username"
                />

                {{ clip.username }}
                <span v-if="isOwner" class="text-zinc-700">(You)</span>
              </div>
            </router-link>
          </div>
          <!-- Middle -->
          <div class="flex-1">
            <div class="pb-2 flex justify-between items-start">
              <div>
                <span class="text-gray-500">{{ convertDate(clip.date) }}</span>
                <h3 class="text-lg font-bold sm:text-2xl">{{ clip.title }}</h3>
              </div>
              <button
                :disabled="likeProcessing"
                class="flex items-center gap-1 cursor-pointer group disabled:text-zinc-700 disabled:animate-pulse"
                :class="{
                  'text-green-500 hover:text-red-500': clip.likes.includes(
                    user.username
                  ),
                }"
                @click.prevent="handleLike(clip.id)"
              >
                <span
                  class="text-sm font-bold transition-all duration-150 ease-out"
                  >{{ clip.likes.length }}</span
                >
                <ArrowUpCircleIcon
                  class="h-5 w-5 mt-1 group-hover:text-purple-700 transition-all duration-150 ease-out"
                  :class="{
                    'group-hover:text-red-500': clip.likes.includes(
                      user.username
                    ),
                  }"
                />
              </button>
            </div>
          </div>
          <div v-if="clip.comments.length">
            <div class="flex justify-between items-center pb-4">
              <h3 class="font-bold text-purple-900 text-xl">Recent Comments</h3>
              <div
                class="flex items-center gap-1 cursor-pointer group"
                @click.prevent="showComments = !showComments"
              >
                <span class="text-sm text-zinc-500">View All</span>
                <ChatBubbleOvalLeftIcon
                  class="h-6 w-6 text-purple-700 group-hover:text-purple-900 transition-all duration-150 ease-out"
                />
              </div>
            </div>
            <div
              class="flex flex-col gap-4 divide-y-[1px] divide-zinc-800 overflow-y-auto max-h-[200px]"
            >
              <div v-for="comment in clip.comments.slice(0, 2)">
                <span class="text-xs text-zinc-600 inline-flex pb-2">{{
                  convertDate(comment.date) != "Invalid Date"
                    ? convertDate(comment.date)
                    : "Just Now"
                }}</span>

                <div class="flex items-center gap-2 text-zinc-500">
                  <img
                    class="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-full"
                    :src="comment.avatar"
                    :alt="comment.username"
                  />

                  <p>
                    <span class="font-semibold pr-2 text-purple-900"
                      >{{ comment.username }}:</span
                    >
                    <span> {{ comment.comment }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- Bottom -->
          <CommentClip
            class="pt-8"
            :clipId="clip.id"
            @commentAdded="pushComment"
          />
        </div>
      </div>
    </div>
    <div v-if="clip?.comments.length && showComments" class="pt-12">
      <h3 class="font-bold text-purple-900 text-xl">Comments</h3>
      <div
        class="flex flex-col gap-4 divide-y-[1px] divide-zinc-800 overflow-y-auto max-h-[200px]"
      >
        <div v-for="comment in clip.comments">
          <span class="text-xs text-zinc-600 inline-flex pb-2">{{
            convertDate(comment.date)
          }}</span>

          <div class="flex items-center gap-2 text-zinc-500">
            <img
              class="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-full"
              :src="comment.avatar"
              :alt="comment.username"
            />

            <p>
              <span class="font-semibold pr-2 text-purple-900"
                >{{ comment.username }}:</span
              >
              <span> {{ comment.comment }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { getClip, convertDate, getToken } from "@/utils/firebase-helpers";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  ArrowUpCircleIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/vue/20/solid";
import VideoPlayer from "@/components/VideoPlayer.vue";
import Loaders from "@/components/common/Loaders.vue";
import CommentClip from "../components/CommentClip.vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const user = useUserStore();
const route = useRoute();
const router = useRouter();

// States
const clip = ref(null);
const isOwner = ref(false);
const showComments = ref(false);
const likeProcessing = ref(false);

// Get route params
const { id } = route.params;

// Fetch clip based on route id param
getClip(id)
  .then((data) => {
    data ? (clip.value = data) : router.push("/");
  })
  .finally(() => {
    isOwner.value = user.uid === clip.value.uid;
  });

// Post to /api/like with the clip id
const handleLike = async (id) => {
  likeProcessing.value = true;
  try {
    const authToken = await getToken();
    if (!authToken) throw new Error("No auth token");
    const likeAction = fetch("/api/like", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clipId: id }),
    });
    const res = await likeAction;
    if (res.status === 429)
      throw new Error("Oops, too many requests! You have been rate limited.");
    const data = await res.json();
    // Update clips.likes from data.likes
    data.liked
      ? clip.value.likes.push(user.username)
      : clip.value.likes.splice(clip.value.likes.indexOf(user.username), 1);
  } catch (err) {
    console.log(err);
    switch (err.message) {
      case "No auth token":
        toast.error("You must be logged in to like a clip");
        break;
      case "Oops, too many requests! You have been rate limited.":
        toast.error(err.message);
        break;
      default:
        toast.error("Something went wrong");
    }
  }
  // Add an extra second to prevent double clicking
  setTimeout(() => {
    likeProcessing.value = false;
  }, 1000);
};

// Push comment to clip.comments
const pushComment = (comment) => {
  clip.value.comments.unshift(comment);
};
</script>
