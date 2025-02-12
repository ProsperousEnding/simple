<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(async () => {
  const confetti = (await import('canvas-confetti')).default
  confetti({
    particleCount: 100,
    spread: 170,
    origin: { y: 0.6 },
  })
})
</script>

<template>
  <div class="confetti-container"></div>
</template>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}
</style>