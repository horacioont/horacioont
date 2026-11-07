<script setup lang="ts">
import { useFavoritos } from './useFavoritos';
const props = withDefaults(defineProps<{ slug: string; variant?: 'float' | 'pill' }>(), { variant: 'float' });
const { toggle, es } = useFavoritos();
</script>

<template>
  <button
    type="button"
    :aria-pressed="es(props.slug)"
    :aria-label="es(props.slug) ? 'Quitar de favoritos' : 'Guardar en favoritos'"
    @click.prevent.stop="toggle(props.slug)"
    :class="variant === 'float'
      ? 'grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur shadow-sm transition active:scale-90'
      : 'btn-ghost h-11 px-4 text-sm'"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" :fill="es(props.slug) ? '#e11d48' : 'none'" :stroke="es(props.slug) ? '#e11d48' : 'currentColor'" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
    </svg>
    <span v-if="variant === 'pill'">{{ es(props.slug) ? 'Guardada' : 'Guardar' }}</span>
  </button>
</template>
