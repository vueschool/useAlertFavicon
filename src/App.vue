<script setup lang="ts">
import useAlertFavicon from "@/composables/useAlertFavicon";
const { notify, favicon, cancel } = useAlertFavicon("/favicon.ico");
</script>

<template>
  <button @click="notify">Notify</button>
  <button @click="favicon = '/vue-school-favicon.png'">Change</button>
  <button @click="cancel">Cancel</button>
</template>
