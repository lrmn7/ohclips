<template>
  <main
    class="bg-cover bg-top sm:bg-top min-h-[calc(100vh-8rem)]"
    style="
      background-image: url('https://raw.githubusercontent.com/lrmn7/save-images/main/lrmn-anime.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
    "
  >
    <div
      class="mx-auto max-w-7xl py-16 px-6 text-center sm:py-24 lg:px-8 lg:py-48"
    >
      <div class="bg-black rounded-2xl bg-opacity-70 inline-flex flex-col p-12">
        <p class="text-4xl font-semibold text-purple-700">404</p>
        <h1
          class="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Uh oh! I think you’re lost.
        </h1>
        <p class="mt-2 text-lg font-semibold text-white">
          It looks like the page you’re looking for doesn't exist.
        </p>
        <div class="mt-6">
          <router-link
            to="/"
            class="inline-flex items-center rounded-md bg-purple-700 px-6 py-3 hover:bg-purple-900"
            >Go back home</router-link
          >
        </div>
      </div>
    </div>
  </main>
</template>
