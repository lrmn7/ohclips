<template>
  <Modal dialogTitle="Sign up">
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
        <span class="text-zinc-500">signing you up...</span>
      </div>
      <Form
        v-else
        @submit="submit"
        :validation-schema="registerForm.schema"
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
          <label for="username" class="block text-sm font-medium text-gray-700"
            >Username</label
          >
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <UserCircleIcon
                class="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <Field
              type="text"
              name="username"
              id="username"
              class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Username"
            />
          </div>
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
        <div>
          <label
            for="password_confirmation"
            class="block text-sm font-medium text-gray-700"
            >Confirm password</label
          >
          <div class="relative mt-1 rounded-md shadow-sm">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <KeyIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Field
              type="password"
              name="password_confirmation"
              id="password_confirmation"
              class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="confirm password"
            />
          </div>
        </div>
        <button
          type="submit"
          class="bg-purple-700 rounded-md p-2 hover:bg-purple-800 transition-all duration-150 ease-in-out mt-4 text-white"
          :disabled="submitting"
        >
          Sign up
        </button>
        <div>
          <ErrorMessage name="username" class="text-red-500 text-sm" as="p" />
          <ErrorMessage name="email" class="text-red-500 text-sm" as="p" />
          <ErrorMessage name="password" class="text-red-500 text-sm" as="p" />
          <ErrorMessage
            name="password_confirmation"
            class="text-red-500 text-sm"
            as="p"
          />
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
  UserCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";
import { Form, Field, ErrorMessage } from "vee-validate";
import { registerForm, configureVeeValidate } from "@/utils/validation";
import { useUserStore } from "@/stores/user";
import { errorCodes } from "@/utils/firebase-helpers";
import Loaders from "@/components/common/Loaders.vue";

let submitting = ref(false);
let errorMessage = ref("");
let successMessage = ref("");

configureVeeValidate();
registerForm.definitions();

// Handle form submission
const submit = async (values) => {
  submitting.value = true;
  const userStore = useUserStore();
  try {
    await userStore.register(values);
  } catch (error) {
    const errorCode = error.code;
    errorMessage.value = errorCodes(errorCode);
    submitting.value = false;
    return;
  }

  // Success
  submitting.value = false;
  successMessage.value = "Account created successfully!";
  setTimeout(() => {
    // limitation in firebase auth, need to reload page to get new user data to propogate across state
    window.location.replace("/profile");
  }, 1000);
};
</script>
