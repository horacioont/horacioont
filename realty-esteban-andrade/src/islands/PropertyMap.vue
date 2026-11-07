<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import type { Card } from '@/lib/propiedades';
import { moneyShort } from './fmt';
import 'leaflet/dist/leaflet.css';

const props = defineProps<{ cards: Card[]; activo?: string | null; single?: boolean; zoom?: number }>();
const emit = defineEmits<{ (e: 'select', slug: string): void }>();
const el = ref<HTMLElement>();
let L: typeof import('leaflet') | undefined;
let map: import('leaflet').Map | undefined;
let layer: import('leaflet').LayerGroup | undefined;
const markers = new Map<string, import('leaflet').Marker>();

const icon = (p: Card, on = false) =>
  L!.divIcon({
    className: '',
    html: props.single
      ? `<div style="width:44px;height:44px;border-radius:999px;background:#13315c;border:4px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.3)"></div>`
      : `<div class="ea-pin ${on ? 'on' : ''}">${moneyShort(p.precio)}</div>`,
    iconSize: props.single ? [44, 44] : undefined,
    iconAnchor: props.single ? [22, 22] : undefined,
  });

function render() {
  if (!L || !map || !layer) return;
  layer.clearLayers();
  markers.clear();
  const pts = props.cards.filter((c) => c.lat != null && c.lng != null);
  for (const p of pts) {
    const m = L.marker([p.lat!, p.lng!], { icon: icon(p, p.slug === props.activo), riseOnHover: true, keyboard: true, title: p.titulo })
      .on('click', () => emit('select', p.slug));
    if (!props.single) {
      m.bindPopup(
        `<a href="/propiedades/${p.slug}" style="display:block;width:220px;color:inherit;text-decoration:none">
           <img src="${p.img}" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px" />
           <strong style="display:block;margin-top:6px;font-size:16px">${moneyShort(p.precio)}${p.operacion === 'renta' ? '/mes' : ''}</strong>
           <span style="font-size:13px;color:#3c4859">${p.tipo !== 'terreno' ? `${p.recamaras} rec · ${p.banos} baños · ` : ''}${p.ciudad}</span>
         </a>`,
        { closeButton: false, minWidth: 220 },
      );
    }
    m.addTo(layer);
    markers.set(p.slug, m);
  }
  if (pts.length) map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat!, p.lng!])), { padding: [48, 48], maxZoom: props.zoom ?? 14 });
}

onMounted(async () => {
  L = await import('leaflet');
  map = L.map(el.value!, { scrollWheelZoom: !props.single, zoomControl: true, attributionControl: true, dragging: !L.Browser.mobile || !props.single });
  // Para producción conviene un proveedor con clave (MapTiler, Stadia, Mapbox). OSM sirve para desarrollo/bajo tráfico.
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  render();
});
onBeforeUnmount(() => map?.remove());

watch(() => props.cards.map((c) => c.slug).join(), render);
watch(() => props.activo, (s, prev) => {
  for (const slug of [s, prev]) {
    const p = props.cards.find((c) => c.slug === slug);
    const m = slug ? markers.get(slug) : undefined;
    if (p && m) { m.setIcon(icon(p, slug === s)); m.setZIndexOffset(slug === s ? 1000 : 0); }
  }
});
</script>

<template>
  <div ref="el" class="size-full min-h-[280px] bg-line" role="region" aria-label="Mapa de propiedades" />
</template>

<style>
.ea-pin {
  transform: translate(-50%, -100%);
  white-space: nowrap; padding: 4px 9px; border-radius: 999px;
  background: #fff; color: #0f1a2b; font: 700 13px/1.2 Inter, system-ui, sans-serif;
  box-shadow: 0 2px 8px rgba(15, 26, 43, .25); border: 1px solid #e4e7ec; transition: transform .15s;
  width: max-content;
}
.ea-pin.on, .ea-pin:hover { background: #13315c; color: #fff; transform: translate(-50%, -100%) scale(1.08); }
.leaflet-popup-content-wrapper { border-radius: 14px; }
.leaflet-popup-content { margin: 10px; }
</style>
