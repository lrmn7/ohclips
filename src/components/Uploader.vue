<template>
  <Form
    @submit="submit"
    :validation-schema="uploadValidation || {}"
    class="flex flex-col gap-4 text-purple-700"
  >
    <div class="grid sm:grid-cols-2 gap-2 sm:gap-3">
      <div>
        <label for="Title" class="sr-only">Name your clip</label>
        <div class="relative mt-1 rounded-md shadow-sm">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <VideoCameraIcon
              class="h-5 w-5 text-gray-400"
              :class="{ 'text-transparent': pageLoading }"
              aria-hidden="true"
            />
          </div>
          <Field
            type="text"
            name="Title"
            class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed"
            :class="{
              'animate-pulse bg-zinc-800 placeholder:text-transparent text-transparent border-none':
                pageLoading,
            }"
            placeholder="Clip Title"
            :disabled="uploadProgress.progress || pageLoading"
          />
        </div>
      </div>
      <div>
        <label for="Game" class="sr-only">Game being played</label>
        <div class="relative mt-1 rounded-md shadow-sm">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          >
            <PuzzlePieceIcon
              class="h-5 w-5 text-gray-400"
              aria-hidden="true"
              :class="{ 'text-transparent': pageLoading }"
            />
          </div>
          <Field
            type="text"
            name="Game"
            :attributes="{
              autocomplete: 'off',
            }"
            @input="searchGames"
            @blur="searchResults = null"
            v-model="searchTerm"
            class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed"
            :class="{
              'animate-pulse bg-zinc-800 placeholder:text-transparent text-transparent border-none':
                pageLoading,
            }"
            placeholder="Game being played"
            :disabled="uploadProgress.progress || pageLoading"
          />
          <!-- Games List Results -->
          <div
            v-if="searchResults"
            class="absolute z-10 bg-white w-full rounded-md shadow-lg overflow-clip"
          >
            <ul class="divide-y divide-zinc-200">
              <li
                v-for="game in searchResults.slice(0, 5)"
                :key="game.id"
                class="px-3 py-2 hover:bg-zinc-200 cursor-pointer"
                @click="(searchTerm = game.name), (searchResults = null)"
                @mousedown.prevent
              >
                <div class="flex items-center">
                  <img
                    :src="game.box_art_url"
                    :alt="game.name + ' Cover'"
                    class="h-14 mr-2 inline-block object-cover"
                  />
                  <span>{{ game.name }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center w-full" @change="fileInput">
      <label
        for="dropzone-file"
        class="flex flex-col items-center justify-center w-full h-44 border-dashed rounded-lg cursor-pointer"
        :class="[
          uploadProgress.progress
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-zinc-800 hover:bg-zinc-700',
          pageLoading
            ? 'bg-zinc-800 animate-pulse cursor-not-allowed hover:bg-zinc-800'
            : '',
        ]"
      >
        <div
          class="flex flex-col items-center justify-center pt-5 pb-6"
          v-if="!pageLoading"
        >
          <svg
            aria-hidden="true"
            class="w-10 h-10 mb-3"
            :class="{
              'text-gray-400': uploadProgress.progress,
              'text-purple-700': !uploadProgress.progress,
              'text-transparent': pageLoading,
            }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold">Click to upload</span>
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            MP4 (Max: 100MB)
          </p>
        </div>
        <Field
          name="File"
          id="dropzone-file"
          type="file"
          class="hidden"
          :disabled="uploadProgress.progress || pageLoading"
        />
      </label>
    </div>

    <div v-if="files" class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <FilmIcon class="h-5 w-5 mt-1" />
        <span class="text-gray-500 font-semibold">{{ files.name }}</span>
      </div>
      <span>{{ convertBytesToMB(files.size) }} MB</span>
    </div>

    <button
      type="submit"
      :disabled="uploadProgress.progress || pageLoading"
      class="bg-purple-700 text-white px-4 py-4 rounded-md font-semibold transition-all duration-150 ease-in-out disabled:cursor-not-allowed"
      :class="[
        pageLoading
          ? 'bg-zinc-800 animate-pulse text-transparent'
          : 'disabled:bg-gray-500 disabled:text-gray-400 hover:bg-purple-900',
      ]"
    >
      Upload
    </button>
    <div>
      <ErrorMessage name="Title" class="text-red-500 text-sm" as="p" />
      <ErrorMessage name="Game" class="text-red-500 text-sm" as="p" />
      <ErrorMessage name="File" class="text-red-500 text-sm" as="p" />
    </div>
  </Form>

  <div v-if="uploadProgress.progress">
    <div class="flex justify-between mb-2">
      <span
        class="text-base font-bold"
        :class="{
          'text-white': uploadProgress.progress === 100,
          'text-purple-700': uploadProgress.progress < 100,
        }"
        >{{
          uploadProgress.progress === 100 ? "Upload Complete" : "Uploading..."
        }}</span
      >
      <span
        class="text-sm font-bold text-purple-700"
        v-if="uploadProgress.progress < 100"
        >{{ uploadProgress.progress.toFixed(0) }}%</span
      >
      <CheckCircleIcon class="h-5 w-5 text-green-500" v-else />
    </div>
    <div class="w-full bg-zinc-800 rounded-full h-2.5">
      <div
        class="h-2.5 rounded-full"
        :class="{
          'bg-purple-700': uploadProgress.progress < 100,
          'bg-green-500': uploadProgress.progress === 100,
        }"
        :style="{ width: uploadProgress.progress + '%' }"
      ></div>
    </div>
  </div>
  <div v-if="uploadProgress.errorMessage && uploadProgress.progress <= 0">
    <p class="text-red-500 text-sm">{{ uploadProgress.errorMessage }}</p>
  </div>
</template>

<script setup>
import {
  VideoCameraIcon,
  PuzzlePieceIcon,
  FilmIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";
import { Form, Field, ErrorMessage } from "vee-validate";
import { uploadForm, configureVeeValidate } from "@/utils/validation";
import { ref } from "vue";
import * as UpChunk from "@mux/upchunk";
import { getToken } from "@/utils/firebase-helpers";
import { useToast } from "vue-toastification";

// States
const pageLoading = ref(true);
const files = ref(null);
const gamesList = ref([]);
const searchTerm = ref("");
const searchResults = ref([]);
const uploadProgress = ref({
  progress: 0,
  errorMessage: "",
});
const uploadValidation = ref(null);

// Setup toast notifications
const toast = useToast();

// Get list of games for search
fetch("/api/games")
  .then((res) => res.json())
  .then((data) => {
    gamesList.value = data.games;
    // Setup vee-validate
    uploadForm.definitions(gamesList.value.map((game) => game.name));
    configureVeeValidate();
    uploadValidation.value = uploadForm.schema;
    pageLoading.value = false;
  })
  .catch((err) => {
    uploadForm.definitions();
    toast.error("Uploader is currently unavailable. Please try again later.");
  });

const searchGames = () => {
  searchResults.value = gamesList.value.filter((game) => {
    return game.name.toLowerCase().includes(searchTerm.value.toLowerCase());
  });
};

const convertBytesToMB = (bytes) => {
  const size = bytes / 1000000;
  return size.toFixed(2);
};

const fileInput = (e) => {
  files.value = e.target.files[0];
};

const submit = async (values, { resetForm }) => {
  try {
    const authToken = await getToken();
    const data = await fetch("/api/getUploadAuth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: values.Title,
        game: values.Game,
      }),
    });
    if (data.status == 429)
      throw Error(
        "You have reached the maximum number of uploads for today. Please try again tomorrow."
      );

    const { url } = await data.json();

    const upload = UpChunk.createUpload({
      endpoint: url,
      file: values.File,
      chunkSize: 5120, // Uploads the file in ~5mb chunks
    });

    // subscribe to events
    upload.on("error", (err) => {
      console.error("💥 🙀", err.detail);
    });

    // Keep track of the upload progress
    upload.on("progress", (progress) => {
      uploadProgress.value.progress = progress.detail;
    });

    // Successfully uploaded the file
    upload.on("success", () => {
      uploadProgress.value.progress = 0;
      files.value = null;
      resetForm();
      toast.success(
        "Clip uploaded successfully! We are processing it now. It will be available in a few minutes."
      );
    });
  } catch (error) {
    uploadProgress.value.progress = 0;
    files.value = null;
    resetForm();

    switch (error.message) {
      case "You have reached the maximum number of uploads for today. Please try again tomorrow.":
        toast.error(error.message);
        return;
      default:
        toast.error(
          "Uploader is currently unavailable. Please try again later."
        );
        return;
    }
  }
};
</script>
