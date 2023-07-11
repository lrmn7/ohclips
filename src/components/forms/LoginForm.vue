<template>
  <Modal dialogTitle="Login">
    <div
      class="flex items-center gap-1 text-purple-700 justify-center"
      v-if="successMessage"
    >
      <CheckCircleIcon class="h-5 w-5" aria-hidden="true" />
      <p>{{ successMessage }}</p>
    </div>
    <div v-else>
      <div
        class="flex items-center justify-center pt-8 flex-col gap-8"
        v-if="submitting"
      >
        <Loaders />
        <span class="text-zinc-500">logging you in...</span>
      </div>
      <Form
        v-else
        @submit="submit"
        :validation-schema="loginForm.schema"
        class="flex flex-col gap-2"
      >
        <div
          v-if="errorMessage"
          class="text-red-500 flex items-center justify-center gap-1"
        >
          <ExclamationCircleIcon class="h-5 w-5 mt-1" />
          <p class="leading-none text-base">{{ errorMessage }}</p>
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >Email</label
          >
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <EnvelopeIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Field
              type="email"
              name="email"
              id="email"
              class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <KeyIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Field
              type="password"
              name="password"
              id="password"
              class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="password"
            />
          </div>
        </div>
        <button
          type="submit"
          class="bg-purple-700 rounded-md p-2 hover:bg-purple-800 transition-all duration-150 ease-in-out mt-4 text-white"
        >
          Login
        </button>

        <div>
          <ErrorMessage name="email" class="text-red-500 text-sm" as="p" />
          <ErrorMessage name="password" class="text-red-500 text-sm" as="p" />
        </div>
      </Form>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from "vue";
import Modal from "@/components/global/Modal.vue";
import {
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/vue/20/solid";
import { Form, Field, ErrorMessage } from "vee-validate";
import { loginForm, configureVeeValidate } from "@/utils/validation";
import { useUserStore } from "@/stores/user";
import { useModalStore } from "@/stores/modal";
import { errorCodes } from "@/utils/firebase-helpers";
import Loaders from "@/components/common/Loaders.vue";

let submitting = ref(false);
let errorMessage = ref("");
let successMessage = ref("");
const userStore = useUserStore();
const modalStore = useModalStore();

configureVeeValidate();
loginForm.definitions();

// Handle form submission
const submit = async (values) => {
  submitting.value = true;
  try {
    await userStore.login(values);
    successMessage.value = "Login successful";
    setTimeout(() => {
      if (modalStore.isModalOpen) {
        modalStore.toggleModal();
      }
    }, 1000);
  } catch (error) {
    errorMessage.value = errorCodes(error.code);
  } finally {
    submitting.value = false;
  }
};
</script>
