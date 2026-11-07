<script setup lang="ts">
import { ref } from 'vue';
import { tipos } from './fmt';
const props = defineProps<{ ciudades: string[] }>();
const operacion = ref<'venta' | 'renta'>('venta');
const q = ref('');
const tipo = ref('');
const buscar = () => {
  const p = new URLSearchParams({ operacion: operacion.value });
  if (q.value.trim()) p.set('q', q.value.trim());
  if (tipo.value) p.set('tipo', tipo.value);
  window.location.href = `/propiedades?${p}`;
};
</script>

<template>
  <form @submit.prevent="buscar" class="card p-2 sm:p-3" role="search">
    <div class="mb-2 flex gap-1 p-1 sm:mb-3">
      <button v-for="op in (['venta', 'renta'] as const)" :key="op" type="button" class="chip" :aria-pressed="operacion === op" @click="operacion = op">
        {{ op === 'venta' ? 'Comprar' : 'Rentar' }}
      </button>
    </div>
    <div class="grid gap-2 sm:grid-cols-[1fr_200px_auto]">
      <label class="relative">
        <span class="sr-only">Ciudad, colonia o código postal</span>
        <svg class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input v-model="q" list="ciudades" class="field pl-11" placeholder="Ciudad, colonia o C.P." autocomplete="off" enterkeyhint="search" />
        <datalist id="ciudades"><option v-for="c in props.ciudades" :key="c" :value="c" /></datalist>
      </label>
      <select v-model="tipo" class="field" aria-label="Tipo de propiedad">
        <option value="">Todos los tipos</option>
        <option v-for="(label, k) in tipos" :key="k" :value="k">{{ label }}</option>
      </select>
      <button class="btn-primary">Buscar</button>
    </div>
  </form>
</template>
