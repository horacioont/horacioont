<script setup lang="ts">
import { computed, ref } from 'vue';
import { money, site } from './fmt';
const props = defineProps<{ precio: number; impuestos?: number; hoa?: number }>();
const enganche = ref(site.hipoteca.enganche);
const tasa = ref(site.hipoteca.tasa);
const plazo = ref(site.hipoteca.plazo);

const prestamo = computed(() => props.precio * (1 - enganche.value / 100));
const pi = computed(() => {
  const r = tasa.value / 100 / 12, n = plazo.value * 12;
  return r ? (prestamo.value * r) / (1 - Math.pow(1 + r, -n)) : prestamo.value / n;
});
const imp = computed(() => (props.impuestos ?? props.precio * 0.012) / 12);
const hoa = computed(() => props.hoa ?? 0);
const total = computed(() => pi.value + imp.value + hoa.value);
const partes = computed(() => [
  { k: 'Capital e interés', v: pi.value, c: '#13315c' },
  { k: props.impuestos ? 'Impuestos' : 'Impuestos (est.)', v: imp.value, c: '#c08a3e' },
  ...(hoa.value ? [{ k: 'Cuota HOA', v: hoa.value, c: '#1f8a5b' }] : []),
]);
</script>

<template>
  <div class="card p-5">
    <h2 class="text-xl">Calcula tu pago mensual</h2>
    <p class="mt-3 text-3xl font-bold tracking-tight">{{ money(total) }}<span class="text-base font-medium text-muted">/mes</span></p>
    <div class="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
      <div v-for="p in partes" :key="p.k" :style="{ width: `${(p.v / total) * 100}%`, background: p.c }" />
    </div>
    <ul class="mt-3 space-y-1 text-sm">
      <li v-for="p in partes" :key="p.k" class="flex justify-between">
        <span class="flex items-center gap-2"><i class="size-2.5 rounded-full" :style="{ background: p.c }" />{{ p.k }}</span>
        <b>{{ money(p.v) }}</b>
      </li>
    </ul>
    <div class="mt-5 space-y-4">
      <label class="block">
        <span class="flex justify-between text-sm"><span>Enganche</span><b>{{ enganche }}% · {{ money(precio * enganche / 100) }}</b></span>
        <input v-model.number="enganche" type="range" min="3" max="50" step="1" class="mt-2 w-full accent-[#13315c]" />
      </label>
      <label class="block">
        <span class="flex justify-between text-sm"><span>Tasa de interés</span><b>{{ tasa.toFixed(2) }}%</b></span>
        <input v-model.number="tasa" type="range" min="2" max="10" step="0.125" class="mt-2 w-full accent-[#13315c]" />
      </label>
      <div class="flex gap-2">
        <button v-for="y in [15, 20, 30]" :key="y" class="chip flex-1 justify-center" :aria-pressed="plazo === y" @click="plazo = y">{{ y }} años</button>
      </div>
    </div>
    <p class="mt-4 text-xs text-muted">Estimación informativa; no incluye seguro de la vivienda ni PMI. Tu pago real depende de tu crédito y del prestamista.</p>
  </div>
</template>
