<script setup lang="ts">
import type { Card } from '@/lib/propiedades';
import FavoriteButton from './FavoriteButton.vue';
import { money, num, unidad, tipos, estados } from './fmt';
const props = defineProps<{ p: Card; compact?: boolean; eager?: boolean }>();
const badge = {
  'en-contrato': 'bg-warn text-white',
  vendida: 'bg-sold text-white',
  rentada: 'bg-sold text-white',
} as Record<string, string>;
</script>

<template>
  <article class="group card overflow-hidden relative" :class="{ 'opacity-80': p.estado === 'vendida' || p.estado === 'rentada' }">
    <a :href="`/propiedades/${p.slug}`" class="block">
      <div class="relative aspect-[4/3] overflow-hidden bg-line">
        <img
          :src="p.img" :alt="p.titulo" width="720" height="540"
          :loading="eager ? 'eager' : 'lazy'" decoding="async"
          class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div class="absolute left-3 top-3 flex gap-1.5">
          <span v-if="p.estado !== 'disponible'" class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="badge[p.estado]">{{ estados[p.estado] }}</span>
          <span v-else-if="p.precioAnterior" class="rounded-full bg-ok px-2.5 py-1 text-xs font-semibold text-white">Rebajada</span>
          <span class="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">{{ p.operacion === 'renta' ? 'Renta' : 'Venta' }}</span>
        </div>
        <span class="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">📷 {{ p.fotos }}</span>
      </div>
      <div class="p-4" :class="{ 'p-3': compact }">
        <p class="flex items-baseline gap-2">
          <span class="text-xl font-bold tracking-tight">{{ money(p.precio) }}</span>
          <span v-if="p.operacion === 'renta'" class="text-sm text-muted">/mes</span>
          <s v-if="p.precioAnterior" class="text-sm text-muted">{{ money(p.precioAnterior) }}</s>
        </p>
        <p class="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-2">
          <template v-if="p.tipo !== 'terreno'">
            <span><b>{{ p.recamaras }}</b> rec</span>
            <span><b>{{ p.banos }}</b> baños</span>
            <span v-if="p.construccion"><b>{{ num(p.construccion) }}</b> {{ unidad }}</span>
          </template>
          <span v-else-if="p.terreno"><b>{{ num(p.terreno) }}</b> {{ unidad }} de terreno</span>
          <span class="text-muted">{{ tipos[p.tipo] }}</span>
        </p>
        <p class="mt-1 truncate text-sm text-muted">{{ p.direccion }}</p>
      </div>
    </a>
    <div class="absolute right-3 top-3"><FavoriteButton :slug="p.slug" /></div>
  </article>
</template>
