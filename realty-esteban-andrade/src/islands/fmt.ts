// Formateadores del lado del cliente (mismos que src/lib/format.ts, sin importar JSON en cada isla)
import site from '@/data/site.json';
export const money = (n: number) =>
  new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.moneda, maximumFractionDigits: 0 }).format(n);
export const moneyShort = (n: number) =>
  new Intl.NumberFormat(site.locale, { style: 'currency', currency: site.moneda, notation: 'compact', maximumFractionDigits: n >= 1e6 ? 2 : 0 }).format(n).replace(/\s/g, '');
export const num = (n: number) => new Intl.NumberFormat(site.locale).format(n);
export const unidad = site.unidadArea;
export const tipos: Record<string, string> = {
  casa: 'Casa', departamento: 'Departamento', condominio: 'Condominio', townhouse: 'Townhouse',
  terreno: 'Terreno', comercial: 'Comercial', multifamiliar: 'Multifamiliar',
};
export const estados: Record<string, string> = { disponible: 'Disponible', 'en-contrato': 'En contrato', vendida: 'Vendida', rentada: 'Rentada' };
export { site };
