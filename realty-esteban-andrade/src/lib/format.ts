import site from '@/data/site.json';

export const money = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.moneda, maximumFractionDigits: 0, ...opts }).format(n);

/** $1.25M / $850K — para tarjetas y pines del mapa */
export const moneyShort = (n: number) =>
  new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.moneda, notation: 'compact', maximumFractionDigits: n >= 1e6 ? 2 : 0 }).format(n).replace(/\s/g, '');

export const num = (n: number) => new Intl.NumberFormat(site.locale).format(n);

export const area = (n?: number) => (n ? `${num(n)} ${site.unidadArea}` : '—');

export const banosTexto = (b: number, medios = 0) => (medios ? `${b} + ${medios} medio${medios > 1 ? "s" : ""}` : `${b}`);

export const etiquetas = {
  tipo: {
    casa: 'Casa', departamento: 'Departamento', condominio: 'Condominio', townhouse: 'Townhouse',
    terreno: 'Terreno', comercial: 'Comercial', multifamiliar: 'Multifamiliar',
  },
  operacion: { venta: 'En venta', renta: 'En renta' },
  estado: { disponible: 'Disponible', 'en-contrato': 'En contrato', vendida: 'Vendida', rentada: 'Rentada' },
} as const;

export const direccionCorta = (d: { calle: string; colonia?: string; ciudad: string; estado: string; ocultar?: boolean }) =>
  d.ocultar ? [d.colonia, d.ciudad, d.estado].filter(Boolean).join(', ') : `${d.calle}, ${d.ciudad}, ${d.estado}`;

export const whatsappUrl = (texto: string) => `https://wa.me/${site.agente.whatsapp}?text=${encodeURIComponent(texto)}`;
