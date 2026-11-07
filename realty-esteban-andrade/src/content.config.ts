import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Cada propiedad vive en su propia carpeta:
 *   src/content/propiedades/<slug>/index.md   ← datos + descripción
 *   src/content/propiedades/<slug>/*.jpg      ← fotos (optimizadas por Astro en el build)
 * Decap CMS (/admin) escribe exactamente esta estructura.
 */

// Decap guarda las fotos como "foto.jpg"; Astro necesita "./foto.jpg" para resolverlas junto al .md
const rel = (v: unknown) =>
  typeof v === 'string' && !/^(\.{1,2}\/|\/|https?:)/.test(v) ? `./${v}` : v;

const propiedades = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/propiedades', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      estado: z.enum(['disponible', 'en-contrato', 'vendida', 'rentada']).default('disponible'),
      operacion: z.enum(['venta', 'renta']),
      tipo: z.enum(['casa', 'departamento', 'condominio', 'townhouse', 'terreno', 'comercial', 'multifamiliar']),
      precio: z.number().nonnegative(),
      /** Precio anterior, si bajó. Se muestra como "rebajada". */
      precioAnterior: z.number().nonnegative().optional(),
      direccion: z.object({
        calle: z.string(),
        colonia: z.string().optional(),
        ciudad: z.string(),
        estado: z.string(),
        cp: z.string().optional(),
        /** Oculta la dirección exacta y muestra solo la zona */
        ocultar: z.boolean().default(false),
      }),
      coordenadas: z.object({ lat: z.number(), lng: z.number() }).optional(),
      recamaras: z.number().int().nonnegative().default(0),
      banos: z.number().nonnegative().default(0),
      mediosBanos: z.number().int().nonnegative().default(0),
      construccion: z.number().nonnegative().optional(),
      terreno: z.number().nonnegative().optional(),
      estacionamientos: z.number().int().nonnegative().optional(),
      anio: z.number().int().optional(),
      cuotaMantenimiento: z.number().nonnegative().optional(),
      impuestos: z.number().nonnegative().optional(),
      mls: z.string().optional(),
      destacada: z.boolean().default(false),
      fecha: z.coerce.date(),
      portada: z.preprocess(rel, image()),
      galeria: z
        .array(z.object({ imagen: z.preprocess(rel, image()), alt: z.string().default('') }))
        .default([]),
      caracteristicas: z.array(z.string()).default([]),
      video: z.string().url().optional(),
      recorridoVirtual: z.string().url().optional(),
      openHouse: z.array(z.object({ inicio: z.coerce.date(), fin: z.coerce.date() })).default([]),
      seo: z.object({ descripcion: z.string().max(170).optional() }).optional(),
    }),
});

export const collections = { propiedades };
