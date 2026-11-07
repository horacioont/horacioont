<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export type Foto = { src: string; srcset: string; thumb: string; full: string; alt: string; w: number; h: number };
const props = defineProps<{ fotos: Foto[]; titulo: string }>();

const abierto = ref(false);
// El visor (Teleport) solo existe en el cliente: evita discrepancias de hidratación con el SSR
const montado = ref(false);
onMounted(() => (montado.value = true));
const i = ref(0);
const vista = ref<'fotos' | 'cuadricula'>('fotos');
const carrusel = ref<HTMLElement>();
const actualMovil = ref(0);
const total = computed(() => props.fotos.length);

const abrir = (n = 0, modo: 'fotos' | 'cuadricula' = 'fotos') => {
  i.value = n; vista.value = modo; abierto.value = true;
};
const ir = (d: number) => (i.value = (i.value + d + total.value) % total.value);

const onKey = (e: KeyboardEvent) => {
  if (!abierto.value) return;
  if (e.key === 'Escape') abierto.value = false;
  if (e.key === 'ArrowRight') ir(1);
  if (e.key === 'ArrowLeft') ir(-1);
};
watch(abierto, async (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : '';
  v ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey);
  if (v) { await nextTick(); document.getElementById('lb-close')?.focus(); }
});
onBeforeUnmount(() => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = ''; });

// Swipe en el visor
let x0 = 0;
const touchStart = (e: TouchEvent) => (x0 = e.touches[0].clientX);
const touchEnd = (e: TouchEvent) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) ir(dx < 0 ? 1 : -1); };

// Contador del carrusel móvil (scroll-snap nativo, sin JS pesado)
const onScroll = () => {
  const el = carrusel.value; if (!el) return;
  actualMovil.value = Math.round(el.scrollLeft / el.clientWidth);
};
// precarga la siguiente foto en el visor
watch(i, (n) => { const next = props.fotos[(n + 1) % total.value]; if (next) { const im = new Image(); im.src = next.full; } });
</script>

<template>
  <div>
    <!-- Móvil: carrusel deslizable a pantalla completa -->
    <div class="relative md:hidden -mx-4 sm:-mx-6">
      <div ref="carrusel" @scroll.passive="onScroll" class="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        <button v-for="(f, n) in fotos" :key="n" type="button" class="w-full shrink-0 snap-center" @click="abrir(n)" :aria-label="`Ver foto ${n + 1} de ${total}`">
          <img :src="f.src" :srcset="f.srcset" sizes="100vw" :alt="f.alt || titulo" :width="f.w" :height="f.h"
               :loading="n === 0 ? 'eager' : 'lazy'" :fetchpriority="n === 0 ? 'high' : 'auto'" class="aspect-[4/3] w-full object-cover" />
        </button>
      </div>
      <span class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">{{ actualMovil + 1 }} / {{ total }}</span>
    </div>

    <!-- Desktop: mosaico 1 grande + 4 -->
    <div class="relative hidden md:grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[var(--radius-card)] h-[min(62vh,560px)]">
      <button v-for="(f, n) in fotos.slice(0, 5)" :key="n" type="button" @click="abrir(n)"
              :class="n === 0 ? 'col-span-2 row-span-2' : ''" class="group relative overflow-hidden bg-line" :aria-label="`Ver foto ${n + 1} de ${total}`">
        <img :src="f.src" :srcset="f.srcset" :sizes="n === 0 ? '50vw' : '25vw'" :alt="f.alt || titulo" :width="f.w" :height="f.h"
             :loading="n === 0 ? 'eager' : 'lazy'" :fetchpriority="n === 0 ? 'high' : 'auto'" class="size-full object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-95" />
      </button>
      <button type="button" class="btn-ghost absolute bottom-4 right-4 h-10 text-sm shadow" @click="abrir(0, 'cuadricula')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Ver las {{ total }} fotos
      </button>
    </div>

    <!-- Visor a pantalla completa -->
    <Teleport v-if="montado" to="body">
      <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition duration-200" leave-active-class="transition duration-150">
        <div v-if="abierto" class="fixed inset-0 z-[60] flex flex-col bg-black text-white" role="dialog" aria-modal="true" :aria-label="`Fotos de ${titulo}`">
          <div class="flex items-center justify-between gap-2 p-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
            <button id="lb-close" class="grid size-11 place-items-center rounded-full hover:bg-white/10" @click="abierto = false" aria-label="Cerrar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
            <div class="flex rounded-full bg-white/10 p-1 text-sm">
              <button class="rounded-full px-3 py-1" :class="vista === 'fotos' && 'bg-white text-black'" @click="vista = 'fotos'">Fotos</button>
              <button class="rounded-full px-3 py-1" :class="vista === 'cuadricula' && 'bg-white text-black'" @click="vista = 'cuadricula'">Todas</button>
            </div>
            <span class="w-11 text-right text-sm tabular-nums">{{ i + 1 }}/{{ total }}</span>
          </div>

          <div v-if="vista === 'fotos'" class="relative flex flex-1 items-center justify-center overflow-hidden" @touchstart.passive="touchStart" @touchend.passive="touchEnd">
            <img :key="i" :src="fotos[i].full" :alt="fotos[i].alt || titulo" class="max-h-full max-w-full object-contain select-none" draggable="false" />
            <button class="absolute left-3 hidden size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid" @click="ir(-1)" aria-label="Anterior">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg>
            </button>
            <button class="absolute right-3 hidden size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 md:grid" @click="ir(1)" aria-label="Siguiente">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
          <p v-if="vista === 'fotos' && fotos[i].alt" class="px-4 pb-2 text-center text-sm text-white/80">{{ fotos[i].alt }}</p>
          <div v-if="vista === 'fotos'" class="no-scrollbar flex gap-2 overflow-x-auto p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))]">
            <button v-for="(f, n) in fotos" :key="n" @click="i = n" class="shrink-0 overflow-hidden rounded-lg transition" :class="n === i ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90'" :aria-label="`Foto ${n + 1}`">
              <img :src="f.thumb" alt="" class="h-14 w-20 object-cover" loading="lazy" />
            </button>
          </div>

          <div v-else class="flex-1 overflow-y-auto p-3">
            <div class="mx-auto grid max-w-5xl gap-2 sm:grid-cols-2">
              <button v-for="(f, n) in fotos" :key="n" @click="i = n; vista = 'fotos'" :class="n % 3 === 0 ? 'sm:col-span-2' : ''">
                <img :src="f.src" :srcset="f.srcset" sizes="(min-width: 1024px) 1024px, 100vw" :alt="f.alt" loading="lazy" class="w-full rounded-lg object-cover" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
