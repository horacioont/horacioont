<script setup lang="ts">
import type { Card } from '@/lib/propiedades';
import PropertyCard from './PropertyCard.vue';
defineProps<{ cards: Card[] }>();
</script>
<template>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <PropertyCard v-for="p in cards" :key="p.slug" :p="p" />
  </div>
</template>
