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