<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{ titulo: string; texto?: string }>();
const copiado = ref(false);
async function compartir() {
  const data = { title: props.titulo, text: props.texto, url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch {} return; }
  await navigator.clipboard?.writeText(location.href);
  copiado.value = true; setTimeout(() => (copiado.value = false), 2000);
}
</script>
<template>
  <button type="button" class="btn-ghost h-11 px-4 text-sm" @click="compartir">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
    {{ copiado ? '¡Enlace copiado!' : 'Compartir' }}
  </button>
</template>
