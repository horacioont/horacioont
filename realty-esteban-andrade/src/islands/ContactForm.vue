<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { site } from './fmt';

const props = defineProps<{ propiedad?: { titulo: string; slug: string; mls?: string }; motivoInicial?: string }>();
const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;

const motivo = ref(props.motivoInicial || (props.propiedad ? 'visita' : 'comprar'));
const nombre = ref(''), telefono = ref(''), email = ref(''), fecha = ref(''), mensaje = ref('');
const estado = ref<'idle' | 'enviando' | 'ok' | 'error'>('idle');

const motivos = computed(() => props.propiedad
  ? [{ v: 'visita', l: 'Agendar visita' }, { v: 'info', l: 'Más información' }, { v: 'oferta', l: 'Hacer oferta' }]
  : [{ v: 'comprar', l: 'Quiero comprar' }, { v: 'vender', l: 'Quiero vender' }, { v: 'rentar', l: 'Quiero rentar' }, { v: 'busqueda', l: 'Avísame de propiedades' }]);

// /contacto?motivo=vender preselecciona el motivo
onMounted(() => {
  const m = new URLSearchParams(location.search).get('motivo');
  if (m && motivos.value.some((x) => x.v === m)) motivo.value = m;
});

// se calcula en el cliente (en el build daría la fecha de publicación del sitio)
const hoy = ref<string>();
onMounted(() => (hoy.value = new Date().toISOString().slice(0, 10)));

const texto = () => [
  `Hola ${site.agente.nombre.split(' ')[0]}, soy ${nombre.value}.`,
  props.propiedad ? `Me interesa: ${props.propiedad.titulo}${props.propiedad.mls ? ` (MLS ${props.propiedad.mls})` : ''} – ${location.origin}/propiedades/${props.propiedad.slug}` : '',
  `Motivo: ${motivos.value.find((m) => m.v === motivo.value)?.l}`,
  fecha.value ? `Fecha preferida: ${fecha.value}` : '',
  mensaje.value,
].filter(Boolean).join('\n');

async function enviar(e: Event) {
  const form = e.target as HTMLFormElement;
  if ((form.elements.namedItem('_gotcha') as HTMLInputElement)?.value) return; // honeypot
  if (!endpoint) {
    window.open(`https://wa.me/${site.agente.whatsapp}?text=${encodeURIComponent(texto())}`, '_blank');
    estado.value = 'ok';
    return;
  }
  estado.value = 'enviando';
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ motivo: motivo.value, nombre: nombre.value, telefono: telefono.value, email: email.value, fecha: fecha.value, mensaje: texto(), propiedad: props.propiedad?.slug, origen: location.href }),
    });
    estado.value = r.ok ? 'ok' : 'error';
  } catch { estado.value = 'error'; }
}
</script>

<template>
  <div v-if="estado === 'ok'" class="card p-6 text-center" role="status">
    <div class="mx-auto grid size-12 place-items-center rounded-full bg-ok/10 text-ok">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5L20 7"/></svg>
    </div>
    <p class="mt-3 font-display text-xl">¡Gracias, {{ nombre.split(' ')[0] }}!</p>
    <p class="mt-1 text-ink-2">Te contacto muy pronto. Si es urgente, llámame al <a class="font-semibold underline" :href="`tel:${site.agente.telefono.replace(/[^+\d]/g, '')}`">{{ site.agente.telefono }}</a>.</p>
  </div>
  <form v-else class="card space-y-3 p-5" @submit.prevent="enviar">
    <div class="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <button v-for="m in motivos" :key="m.v" type="button" class="chip" :aria-pressed="motivo === m.v" @click="motivo = m.v">{{ m.l }}</button>
    </div>
    <input v-model="nombre" class="field" name="nombre" required autocomplete="name" placeholder="Nombre" />
    <div class="grid gap-3 sm:grid-cols-2">
      <input v-model="telefono" class="field" name="telefono" type="tel" required autocomplete="tel" inputmode="tel" placeholder="Teléfono" />
      <input v-model="email" class="field" name="email" type="email" autocomplete="email" placeholder="Email (opcional)" />
    </div>
    <label v-if="motivo === 'visita'" class="block">
      <span class="label">Fecha preferida</span>
      <input v-model="fecha" type="date" :min="hoy" class="field mt-1" />
    </label>
    <textarea v-model="mensaje" class="field h-24 py-3" name="mensaje" placeholder="Mensaje (opcional)" />
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
    <button class="btn-primary w-full" :disabled="estado === 'enviando'">{{ estado === 'enviando' ? 'Enviando…' : motivo === 'visita' ? 'Solicitar visita' : 'Enviar' }}</button>
    <p v-if="estado === 'error'" class="text-sm text-sold" role="alert">No se pudo enviar. Intenta por WhatsApp o llámame.</p>
    <p class="text-xs text-muted">Al enviar aceptas ser contactado por teléfono, mensaje o email. No compartimos tus datos.</p>
  </form>
</template>
