import { defineStore } from "pinia";
import { createUser, loginUser, logoutUser } from "@/utils/firebase-helpers";

export const useUserStore = defineStore("user", {
  state: () => ({
    userLoggedIn: false,
    username: "",
    uid: "",
    avatar: "",
  }),
  actions: {
    async register(values) {
      const { username, email, password } = values;
      await createUser(username, email, password);
      this.userLoggedIn = true;
    },
    async login(values) {
      const { email, password } = values;
      await loginUser(email, password);
      this.userLoggedIn = true;
    },
    async logout() {
      await logoutUser();
      this.userLoggedIn = false;
    },
  },
});
