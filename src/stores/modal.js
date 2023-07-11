import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", {
  state: () => ({
    isModalOpen: false,
    type: "",
  }),
  actions: {
    toggleModal() {
      this.isModalOpen = !this.isModalOpen;
    },
    modalType(type) {
      this.type = type;
      this.toggleModal();
    },
  },
});
