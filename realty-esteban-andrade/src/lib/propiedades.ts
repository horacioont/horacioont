import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { direccionCorta } from './format';

export type Propiedad = CollectionEntry<'propiedades'>;

const orden: Record<string, number> = { disponible: 0, 'en-contrato': 1, rentada: 2, vendida: 3 };

export async function getPropiedades() {
  const all = await getCollection('propiedades');
  return all.sort(
    (a, b) => orden[a.data.estado] - orden[b.data.estado] || +b.data.fecha - +a.data.fecha,
  );
}

/** Versión ligera y serializable para las islas Vue (buscador, mapa, favoritos). */
export async function toCard(p: Propiedad) {
  const d = p.data;
  const img = await getImage({ src: d.portada, width: 720, format: 'webp', quality: 72 });
  return {
    slug: p.id,
    titulo: d.titulo,
    estado: d.estado,
    operacion: d.operacion,
    tipo: d.tipo,
    precio: d.precio,
    precioAnterior: d.precioAnterior ?? null,
    ciudad: d.direccion.ciudad,
    colonia: d.direccion.colonia ?? '',
    direccion: direccionCorta(d.direccion),
    lat: d.coordenadas?.lat ?? null,
    lng: d.coordenadas?.lng ?? null,
    recamaras: d.recamaras,
    banos: d.banos + d.mediosBanos * 0.5,
    construccion: d.construccion ?? null,
    terreno: d.terreno ?? null,
    destacada: d.destacada,
    fotos: 1 + d.galeria.length,
    fecha: d.fecha.toISOString(),
    img: img.src,
  };
}

export type Card = Awaited<ReturnType<typeof toCard>>;
