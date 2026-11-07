<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, defineAsyncComponent } from 'vue';
import type { Card } from '@/lib/propiedades';
import PropertyCard from './PropertyCard.vue';
import { money, tipos } from './fmt';

const PropertyMap = defineAsyncComponent(() => import('./PropertyMap.vue'));
const props = defineProps<{ cards: Card[] }>();

type Orden = 'recientes' | 'precio-asc' | 'precio-desc' | 'area-desc';
const defaults = { q: '', operacion: 'venta', tipo: [] as string[], min: '', max: '', rec: 0, banos: 0, vendidas: false, orden: 'recientes' as Orden };
const f = reactive({ ...defaults, tipo: [] as string[] });
const vista = ref<'lista' | 'mapa'>('lista');
const panel = ref(false);
const activo = ref<string | null>(null);

// ---- URL <-> filtros (los enlaces se pueden compartir y el botón "atrás" funciona)
onMounted(() => {
  const u = new URLSearchParams(location.search);
  f.q = u.get('q') ?? '';
  f.operacion = u.get('operacion') ?? 'venta';
  f.tipo = u.get('tipo')?.split(',').filter(Boolean) ?? [];
  f.min = u.get('min') ?? '';
  f.max = u.get('max') ?? '';
  f.rec = Number(u.get('rec') ?? 0);
  f.banos = Number(u.get('banos') ?? 0);
  f.vendidas = u.get('vendidas') === '1';
  f.orden = (u.get('orden') as Orden) ?? 'recientes';
  vista.value = u.get('vista') === 'mapa' ? 'mapa' : 'lista';
});
watch([f, vista], () => {
  const u = new URLSearchParams();
  if (f.q) u.set('q', f.q);
  u.set('operacion', f.operacion);
  if (f.tipo.length) u.set('tipo', f.tipo.join(','));
  if (f.min) u.set('min', f.min);
  if (f.max) u.set('max', f.max);
  if (f.rec) u.set('rec', String(f.rec));
  if (f.banos) u.set('banos', String(f.banos));
  if (f.vendidas) u.set('vendidas', '1');
  if (f.orden !== 'recientes') u.set('orden', f.orden);
  if (vista.value === 'mapa') u.set('vista', 'mapa');
  history.replaceState(history.state, '', `${location.pathname}?${u}`);
}, { deep: true });

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const resultados = computed(() => {
  const q = norm(f.q.trim());
  const min = Number(f.min) || 0;
  const max = Number(f.max) || Infinity;
  const r = props.cards.filter((p) =>
    p.operacion === f.operacion &&
    (f.vendidas || p.estado === 'disponible' || p.estado === 'en-contrato') &&
    (!f.tipo.length || f.tipo.includes(p.tipo)) &&
    p.precio >= min && p.precio <= max &&
    p.recamaras >= f.rec && p.banos >= f.banos &&
    (!q || norm(`${p.titulo} ${p.direccion} ${p.colonia} ${p.ciudad}`).includes(q)),
  );
  const by: Record<Orden, (a: Card, b: Card) => number> = {
    recientes: (a, b) => +new Date(b.fecha) - +new Date(a.fecha),
    'precio-asc': (a, b) => a.precio - b.precio,
    'precio-desc': (a, b) => b.precio - a.precio,
    'area-desc': (a, b) => (b.construccion ?? 0) - (a.construccion ?? 0),
  };
  return r.sort(by[f.orden]);
});

const activos = computed(() =>
  [f.tipo.length, f.min, f.max, f.rec, f.banos, f.vendidas].filter(Boolean).length,
);
const limpiar = () => Object.assign(f, { ...defaults, tipo: [], q: f.q, operacion: f.operacion });
const toggleTipo = (t: string) => (f.tipo = f.tipo.includes(t) ? f.tipo.filter((x) => x !== t) : [...f.tipo, t]);

const preciosVenta = [200000, 300000, 400000, 500000, 750000, 1000000, 1500000, 2000000];
const preciosRenta = [1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500];
const precios = computed(() => (f.operacion === 'renta' ? preciosRenta : preciosVenta));

const seleccionar = (slug: string) => {
  activo.value = slug;
  document.getElementById(`card-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
};
</script>

<template>
  <div>
    <!-- Barra de búsqueda y filtros: fija bajo el header -->
    <div class="sticky top-16 z-30 -mx-4 border-b border-line bg-sand/95 px-4 pb-3 pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div class="flex gap-2">
        <label class="relative flex-1">
          <span class="sr-only">Buscar por ciudad, colonia o dirección</span>
          <svg class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input v-model="f.q" type="search" class="field pl-11" placeholder="Ciudad, colonia o dirección" enterkeyhint="search" />
        </label>
        <button type="button" class="btn-ghost relative h-12 px-4" @click="panel = true" aria-haspopup="dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>
          <span class="hidden sm:inline">Filtros</span>
          <span v-if="activos" class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-brand text-[11px] text-white">{{ activos }}</span>
        </button>
      </div>
      <div class="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
        <button v-for="op in ['venta', 'renta']" :key="op" class="chip" :aria-pressed="f.operacion === op" @click="f.operacion = op; f.min = ''; f.max = ''">{{ op === 'venta' ? 'Comprar' : 'Rentar' }}</button>
        <span class="mx-1 h-6 w-px shrink-0 bg-line" />
        <button v-for="(label, t) in tipos" :key="t" class="chip" :aria-pressed="f.tipo.includes(t)" @click="toggleTipo(t)">{{ label }}</button>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between gap-2">
      <p class="shrink-0 text-sm text-ink-2" aria-live="polite"><b class="text-ink">{{ resultados.length }}</b> {{ resultados.length === 1 ? 'propiedad' : 'propiedades' }}</p>
      <div class="flex items-center gap-2">
        <select v-model="f.orden" class="h-10 w-[7.75rem] rounded-full bg-white px-2.5 text-sm ring-1 ring-line sm:w-auto" aria-label="Ordenar">
          <option value="recientes">Recientes</option>
          <option value="precio-asc">Menor precio</option>
          <option value="precio-desc">Mayor precio</option>
          <option value="area-desc">Más grande</option>
        </select>
        <div class="flex rounded-full bg-white p-1 ring-1 ring-line lg:hidden" role="group" aria-label="Vista">
          <button class="rounded-full px-3 py-1 text-sm font-medium" :class="vista === 'lista' && 'bg-ink text-white'" @click="vista = 'lista'">Lista</button>
          <button class="rounded-full px-3 py-1 text-sm font-medium" :class="vista === 'mapa' && 'bg-ink text-white'" @click="vista = 'mapa'">Mapa</button>
        </div>
      </div>
    </div>

    <div class="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-6">
      <!-- Lista -->
      <div :class="vista === 'mapa' ? 'hidden lg:block' : ''">
        <div v-if="resultados.length" class="grid gap-5 sm:grid-cols-2">
          <div v-for="(p, i) in resultados" :id="`card-${p.slug}`" :key="p.slug" @mouseenter="activo = p.slug" @mouseleave="activo = null"
               class="rounded-[var(--radius-card)] transition" :class="activo === p.slug && 'ring-2 ring-brand-2'">
            <PropertyCard :p="p" :eager="i < 2" />
          </div>
        </div>
        <div v-else class="card p-8 text-center">
          <p class="font-display text-xl">No hay propiedades con esos filtros</p>
          <p class="mt-2 text-ink-2">Prueba quitar algún filtro o cuéntame qué buscas y te aviso cuando salga algo.</p>
          <div class="mt-5 flex flex-wrap justify-center gap-2">
            <button class="btn-ghost" @click="limpiar">Quitar filtros</button>
            <a class="btn-primary" href="/contacto?motivo=busqueda">Avísame</a>
          </div>
        </div>
      </div>

      <!-- Mapa -->
      <div :class="vista === 'lista' ? 'hidden lg:block' : ''">
        <div class="sticky top-[13.5rem] h-[calc(100dvh-16rem)] overflow-hidden rounded-[var(--radius-card)] ring-1 ring-line lg:h-[calc(100dvh-15rem)]">
          <PropertyMap :cards="resultados" :activo="activo" @select="seleccionar" />
        </div>
      </div>
    </div>

    <!-- Panel de filtros: bottom-sheet en móvil, drawer en desktop -->
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition" leave-active-class="transition">
      <div v-if="panel" class="fixed inset-0 z-50 bg-black/40" @click.self="panel = false" @keydown.esc="panel = false">
        <div role="dialog" aria-modal="true" aria-label="Filtros"
             class="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:inset-y-0 md:left-auto md:right-0 md:w-[420px] md:rounded-none md:rounded-l-3xl">
          <div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line md:hidden" />
          <div class="flex items-center justify-between">
            <h2 class="text-2xl">Filtros</h2>
            <button class="text-sm font-semibold text-brand-2" @click="limpiar">Limpiar</button>
          </div>

          <fieldset class="mt-6">
            <legend class="label mb-2">Precio {{ f.operacion === 'renta' ? 'mensual' : '' }}</legend>
            <div class="grid grid-cols-2 gap-2">
              <select v-model="f.min" class="field" aria-label="Precio mínimo">
                <option value="">Sin mínimo</option>
                <option v-for="p in precios" :key="p" :value="String(p)">{{ money(p) }}</option>
              </select>
              <select v-model="f.max" class="field" aria-label="Precio máximo">
                <option value="">Sin máximo</option>
                <option v-for="p in precios" :key="p" :value="String(p)">{{ money(p) }}</option>
              </select>
            </div>
          </fieldset>

          <fieldset class="mt-6">
            <legend class="label mb-2">Recámaras</legend>
            <div class="flex gap-2">
              <button v-for="n in [0, 1, 2, 3, 4, 5]" :key="n" class="chip flex-1 justify-center" :aria-pressed="f.rec === n" @click="f.rec = n">{{ n ? `${n}+` : 'Todas' }}</button>
            </div>
          </fieldset>

          <fieldset class="mt-6">
            <legend class="label mb-2">Baños</legend>
            <div class="flex gap-2">
              <button v-for="n in [0, 1, 2, 3, 4]" :key="n" class="chip flex-1 justify-center" :aria-pressed="f.banos === n" @click="f.banos = n">{{ n ? `${n}+` : 'Todos' }}</button>
            </div>
          </fieldset>

          <fieldset class="mt-6">
            <legend class="label mb-2">Tipo</legend>
            <div class="flex flex-wrap gap-2">
              <button v-for="(label, t) in tipos" :key="t" class="chip" :aria-pressed="f.tipo.includes(t)" @click="toggleTipo(t)">{{ label }}</button>
            </div>
          </fieldset>

          <label class="mt-6 flex items-center justify-between gap-4 rounded-xl bg-sand p-4">
            <span><b>Incluir vendidas y rentadas</b><br /><span class="text-sm text-muted">Útil para comparar precios de la zona</span></span>
            <input v-model="f.vendidas" type="checkbox" class="size-5 accent-[#13315c]" />
          </label>

          <button class="btn-primary mt-6 w-full" @click="panel = false">Ver {{ resultados.length }} {{ resultados.length === 1 ? 'propiedad' : 'propiedades' }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>
