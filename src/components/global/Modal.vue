<template>
  <TransitionRoot as="template" :show="isModalOpen">
    <Dialog as="div" class="relative z-10" @close="modal.toggleModal()">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-zinc-800 backdrop-blur-sm bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full justify-center p-8 text-center items-start sm:items-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg p-8 text-left shadow-xl transition-all w-full sm:max-w-sm text-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200 via-zinc-200 to-purple-200"
            >
              <DialogTitle
                as="h3"
                class="text-3xl leading-6 text-center font-bold pb-6"
                >{{ dialogTitle }}</DialogTitle
              >
              <div>
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";

const modal = useModalStore();
const { isModalOpen } = storeToRefs(modal);

defineProps({
  dialogTitle: {
    type: String,
    required: true,
  },
});
</script>
