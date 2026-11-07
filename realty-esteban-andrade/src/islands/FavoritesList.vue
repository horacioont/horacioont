<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Card } from '@/lib/propiedades';
import PropertyCard from './PropertyCard.vue';
import { useFavoritos } from './useFavoritos';
import { money, site } from './fmt';
const props = defineProps<{ cards: Card[] }>();
const { favoritos } = useFavoritos();
const listo = ref(false);
onMounted(() => (listo.value = true));
const lista = computed(() => props.cards.filter((c) => favoritos.value.includes(c.slug)));
const mensaje = computed(() =>
  `Hola ${site.agente.nombre.split(' ')[0]}, me interesan estas propiedades:\n` +
  lista.value.map((p) => `• ${p.titulo} (${money(p.precio)}) – ${location.origin}/propiedades/${p.slug}`).join('\n'),
);
</script>
<template>
  <div v-if="!listo" class="h-40" />
  <div v-else-if="lista.length">
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <PropertyCard v-for="p in lista" :key="p.slug" :p="p" />
    </div>
    <div class="card mt-8 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p><b>¿Quieres verlas en persona?</b><br /><span class="text-ink-2">Envíame tu lista y armamos un recorrido.</span></p>
      <a class="btn-wa" :href="`https://wa.me/${site.agente.whatsapp}?text=${encodeURIComponent(mensaje)}`" target="_blank" rel="noopener">Enviar por WhatsApp</a>
    </div>
  </div>
  <div v-else class="card p-10 text-center">
    <p class="text-4xl" aria-hidden="true">♡</p>
    <p class="mt-2 font-display text-xl">Aún no tienes favoritos</p>
    <p class="mt-1 text-ink-2">Toca el corazón en cualquier propiedad para guardarla aquí. Se quedan guardadas en este dispositivo.</p>
    <a href="/propiedades" class="btn-primary mt-5">Explorar propiedades</a>
  </div>
</template>
