import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import Toast from "vue-toastification";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "@/stores/user";

import "vue-toastification/dist/index.css";
import "./assets/base.css";
import "./assets/videoPlayer.css";

let app;

onAuthStateChanged(auth, (user) => {
  if (!app) {
    app = createApp(App)
      .use(createPinia())
      .use(router)
      .use(Toast, {
        maxToasts: 2,
        toastClassName: "brand",
      })
      .mount("#app");
  }

  const userStore = useUserStore();
  if (auth.currentUser) {
    userStore.userLoggedIn = true;
    userStore.username = auth.currentUser.displayName;
    userStore.uid = auth.currentUser.uid;
    userStore.avatar =
      auth.currentUser.photoURL ||
      "https://api.dicebear.com/5.x/bottts-neutral/svg?seed=noob&backgroundColor=7d7d7d,d74d4d,7e22ce,60a5fa,22d3ee";
  }
});
