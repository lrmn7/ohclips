<template>
  <div class="flex flex-col" v-if="!deleted">
    <div class="flex items-end justify-between pb-2">
      <div class="flex flex-col">
        <span class="text-sm text-gray-500">{{ convertDate(clip.date) }}</span>
        <router-link
          :to="{ name: 'clip', params: { id: clip.id } }"
          class="text-purple-700 font-bold text-lg inline-flex items-center gap-2 group"
        >
          <span> {{ clip.title }}</span>
          <EyeIcon
            class="h-4 w-4 text-white group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300 ease-in-out group-hover:animate-pulse"
          />
        </router-link>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="currentUser === clip.username"
          :disabled="deleteProcessing"
        >
          <TrashIcon
            @click.prevent="handleDelete(clip.id)"
            class="h-5 w-5 text-zinc-500 hover:text-red-500 transition-all duration-150 ease-out disabled:text-red-800/80 disabled:animating-pulse"
          />
        </button>

        <button
          :disabled="likeProcessing"
          class="flex items-center gap-1 cursor-pointer group disabled:text-zinc-700 disabled:animate-pulse"
          :class="{
            'text-green-500 hover:text-red-500':
              likesArray.includes(currentUser),
          }"
          @click.prevent="handleLike(clip.id)"
        >
          <span
            class="text-sm font-bold transition-all duration-150 ease-out"
            >{{ clip.likes }}</span
          >
          <ArrowUpCircleIcon
            class="h-5 w-5 mt-1 group-hover:text-purple-700 transition-all duration-150 ease-out"
            :class="{
              'group-hover:text-red-500': likesArray.includes(currentUser),
            }"
          />
        </button>
      </div>
    </div>

    <VideoPlayer
      class="vjs-theme-forest cc-theme rounded-md overflow-clip"
      :src="`https://stream.mux.com/${clip.playback_id}.m3u8`"
      :poster="`https://image.mux.com/${clip.playback_id}/thumbnail.webp?width=740&height=410`"
      fluid
      controls
      aspectRatio="16:9"
      :playbackRates="[0.5, 1, 1.5]"
      :volume="0.25"
    />

    <div class="flex items-center justify-between pt-4">
      <div
        class="bg-red-200 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase text-red-900"
      >
        <span>{{ clip.game }}</span>
      </div>
      <router-link :to="{ name: 'user', params: { id: clip.username } }">
        <div class="flex items-center gap-2 group">
          <img
            class="inline-block h-6 w-6 rounded-full ring-2 ring-white group-hover:ring-purple-700 transition-all duration-150 ease-in-out"
            :src="clip.avatar"
            :alt="clip.username"
          />
          <span
            class="text-white group-hover:text-purple-700 transition-all duration-150 ease-in-out"
            >{{ clip.username }}</span
          >
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { convertDate, getToken } from "@/utils/firebase-helpers";
import { EyeIcon, ArrowUpCircleIcon, TrashIcon } from "@heroicons/vue/20/solid";
import { useToast } from "vue-toastification";
import { VideoPlayer } from "@videojs-player/vue";
import { ref } from "vue";
import "video.js/dist/video-js.css";
import "@videojs/themes/dist/forest/index.css";

const props = defineProps({
  clip: {
    type: Object,
    required: true,
  },
  likesArray: {
    type: Array,
    required: true,
  },
  currentUser: {
    type: String,
    required: true,
  },
});

// Setup toast notifications
const toast = useToast();

// State for like & delete button processing
const likeProcessing = ref(false);
const deleteProcessing = ref(false);
const deleted = ref(false);

// Handle deleting a clip
const handleDelete = async (id) => {
  deleteProcessing.value = true;
  try {
    const authToken = await getToken();
    if (!authToken) throw new Error("No auth token");
    const deleteAction = fetch("/api/deleteClip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clipId: id }),
    });
    // Wait for the delete action to complete
    const res = await deleteAction;
    // If the delete action was successful, notify the user
    if (res.status === 200) {
      toast.success("Clip deleted successfully.");
      deleted.value = true;
    } else {
      throw new Error("Something went wrong. Please try again.");
    }
  } catch (err) {
    switch (err.message) {
      case "No auth token":
        toast.error("You must be logged in to delete a clip.");
        break;
      default:
        toast.error("Something went wrong. Please try again.");
        break;
    }
  }
  deleteProcessing.value = false;
};

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
    props.clip.likes = data.likes;
    data.liked
      ? props.likesArray.push(props.currentUser)
      : props.likesArray.splice(props.likesArray.indexOf(props.currentUser), 1);
  } catch (err) {
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
</script>
