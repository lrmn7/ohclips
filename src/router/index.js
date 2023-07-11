import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomePage.vue"),
    },
    {
      path: "/following",
      name: "following",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/FollowingPage.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      meta: {
        requiresAuth: true,
      },
      component: () => import("../views/ProfilePage.vue"),
    },
    {
      path: "/clip/:id",
      name: "clip",
      component: () => import("../views/ClipPage.vue"),
    },
    {
      path: "/user/:id",
      name: "user",
      component: () => import("../views/UserPage.vue"),
    },
    // Catch all 404
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: () => import("../views/NotFoundPage.vue"),
    },
  ],
  linkExactActiveClass: "bg-purple-700",
});

// Global guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !userStore.userLoggedIn) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
