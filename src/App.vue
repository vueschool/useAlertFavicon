<script setup lang="ts">
import useNotificationFavicon from "@/composables/useNotificationFavicon";
const { notify, favicon, cancel } = useNotificationFavicon("/favicon.ico");
</script>

<template>
  <button @click="notify">Notify</button>
  <button @click="favicon = '/vue-school-favicon.png'">Change</button>
  <button @click="cancel">Cancel</button>
</template>
