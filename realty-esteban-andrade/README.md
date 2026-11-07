# Esteban Andrade · Sitio inmobiliario

Versión nueva de [estebanandrade.exprealty.com](https://estebanandrade.exprealty.com): una experiencia **tipo app**, rápida y centrada en lo que importa en bienes raíces: **fotos grandes y datos precisos, fáciles de encontrar**.

**Stack:** [Astro 7](https://astro.build) (HTML estático) + **islas de Vue 3** solo donde hay interacción (mismo enfoque que leonleroy.com) · Tailwind CSS 4 · [Decap CMS](https://decapcms.org) sobre GitLab · Leaflet para mapas · Cloudflare Pages.

---

## Arranque rápido

```bash
npm install
npm run dev          # http://localhost:4321
```

Para editar propiedades en local **sin login**:

```bash
npm run cms          # terminal 2 (decap-server)
# abre http://localhost:4321/admin
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el sitio estático en `dist/` con imágenes optimizadas |
| `npm run preview` | Sirve `dist/` para revisar el build |
| `npm run cms` | Backend local para `/admin` |
| `npm run placeholders -- <slug>` | Genera fotos de ejemplo para una propiedad |

---

## Qué incluye

### Experiencia tipo app
- **Barra de pestañas inferior** en móvil (Inicio · Buscar · Favoritos · Contacto) y transiciones de página (View Transitions + prefetch), así que la navegación se siente instantánea.
- **Manifest PWA**: se puede "instalar" en el teléfono.
- En la ficha de propiedad la tab bar cambia por una **barra de acción fija**: Llamar · WhatsApp · Agendar visita.

### Búsqueda (`/propiedades`)
- Filtros: comprar/rentar, tipo, rango de precio, recámaras, baños, incluir vendidas.
- Ordenar por recientes, precio o tamaño.
- **Lista + mapa** lado a lado en escritorio y con un selector en móvil. Los pines muestran el precio y se resaltan al pasar el mouse por la tarjeta.
- Los filtros viven en la URL, así que una búsqueda se puede **compartir** y el botón "atrás" funciona.
- Filtros en **bottom sheet** en móvil y panel lateral en escritorio.

### Ficha de propiedad (`/propiedades/<slug>`)
- **Galería**: carrusel deslizable en móvil y mosaico 1+4 en escritorio. El visor a pantalla completa tiene swipe, teclado, miniaturas y vista de cuadrícula.
- Las fotos se sirven en WebP con varios tamaños (`srcset`), para que el móvil no descargue 4K.
- Lo esencial va arriba: precio (y rebaja si la hay), estado, recámaras/baños/construcción/terreno.
- Open house, características, descripción, **ficha técnica** (año, HOA, impuestos, precio por ft², MLS, días publicada).
- Mapa con opción de **ocultar la dirección exacta** (pin aproximado).
- **Calculadora de hipoteca** (capital + interés + impuestos + HOA).
- Formulario contextual (visita / info / oferta) con fecha preferida.
- Compartir (share sheet nativo) y favoritos.
- Propiedades similares.
- SEO: JSON-LD `RealEstateListing`, Open Graph 1200×630 automático, sitemap.

### Favoritos (`/favoritos`)
Se guardan en el dispositivo, sin cuenta. Incluye el botón *"Enviar mi lista por WhatsApp"*.

---

## Administrar propiedades (CMS)

Cada propiedad es una carpeta:

```
src/content/propiedades/
  casa-con-alberca-en-miami/
    index.md      ← datos (frontmatter) + descripción
    01.jpg …      ← fotos originales (Astro las optimiza en el build)
```

El esquema con validación está en `src/content.config.ts`: si falta un dato obligatorio, el build falla en lugar de publicar una ficha incompleta.

El panel **`/admin`** (Decap CMS) edita exactamente esa estructura: subir y ordenar fotos arrastrando, cambiar el estado (disponible → en contrato → vendida), precios, etc. Cada cambio es un commit en GitLab, y el pipeline publica el sitio en ~1 min.

Los **datos del agente** (teléfono, WhatsApp, bio, broker, moneda, unidades, valores de la calculadora) están en `src/data/site.json` y también se editan desde `/admin → Ajustes del sitio`.

### Configurar el login de GitLab para `/admin`
1. GitLab → *Preferences → Applications → Add new application*
   - Redirect URI: `https://TU-DOMINIO/admin/`
   - Desmarca **Confidential** y activa el scope **`api`**
2. En `public/admin/config.yml` pon `repo: grupo/proyecto` y `app_id: <Application ID>`.
3. Da acceso al proyecto (rol *Developer*) a quien vaya a editar.

> ¿Opcional? `publish_mode: editorial_workflow` en `config.yml` agrega borradores y revisión (merge requests) antes de publicar.

---

## Deploy: Cloudflare Pages

`.gitlab-ci.yml` construye el sitio en GitLab CI y lo sube a **Cloudflare Pages** con `wrangler`:

- **Push a `main`** → producción (también los cambios hechos desde `/admin`).
- **Cualquier otra rama o MR** → preview con su propia URL (`https://<rama>.esteban-andrade-realty.pages.dev`), sin indexar en Google.

Configuración, una sola vez:
1. Cloudflare → *My Profile → API Tokens → Create token* → plantilla **"Edit Cloudflare Workers"**, o uno personalizado con *Account → Cloudflare Pages → Edit*.
2. GitLab → *Settings → CI/CD → Variables* (marcadas como *Masked*): `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`. Opcionales: `SITE_URL` y `PUBLIC_FORM_ENDPOINT`.
3. El primer pipeline crea el proyecto `esteban-andrade-realty` en Pages.
4. Dominio: Cloudflare → *Workers & Pages → esteban-andrade-realty → Custom domains*. Si el DNS ya está en Cloudflare, es automático.

`public/_headers` agrega caché de 1 año a los assets con hash, cabeceras de seguridad y `noindex` para `/admin` y los previews.

> Alternativa sin CI: en Cloudflare, *Create → Pages → Connect to Git → GitLab* con build `npm run build` y output `dist`. En ese caso borra el job `deploy` de `.gitlab-ci.yml`.

Variables de entorno (ver `.env.example`):
- `SITE_URL`: dominio final (canonical, sitemap, OG).
- `PUBLIC_FORM_ENDPOINT`: endpoint de Formspree / Web3Forms / Basin para los formularios. **Si está vacío, el formulario abre WhatsApp** con el mensaje ya armado.

## Pendientes antes de producción
- [ ] Datos reales del agente en `src/data/site.json` (teléfono, WhatsApp, licencia, zonas, foto en `public/`).
- [ ] Borrar las 6 propiedades **DEMO** (`*-ejemplo`) y cargar el inventario real con fotos.
- [ ] Logos oficiales (REALTOR®, Equal Housing Opportunity, eXp) y textos legales que pida el broker.
- [ ] `repo` y `app_id` en `public/admin/config.yml`; dominio en `SITE_URL` y `public/robots.txt`.
- [ ] Variables `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en GitLab CI.
- [ ] Proveedor de mapas con clave para producción (MapTiler / Stadia). Hoy usa tiles de CARTO/OSM.
- [ ] Endpoint de formularios y, si se quiere, conexión al CRM (FollowUpBoss, kvCORE…).
- [ ] Analítica (Plausible / GA4).

## Siguientes pasos sugeridos
- **Inglés** (`/en/`): todos los textos de UI están en componentes; Astro i18n permite sumarlo sin duplicar la lógica.
- **IDX / feed MLS**: si se quiere mostrar inventario de todo el MLS, se puede sumar un *content loader* de Astro que lea el feed (RESO Web API / Bridge / Spark) junto a las propiedades propias del CMS.
- **Fotos a CDN** (Cloudinary/ImageKit) si el volumen crece: Decap tiene integración de media library y el esquema ya acepta URLs remotas.
- Alertas de búsqueda guardada por email/WhatsApp.

## Estructura

```
src/
  content.config.ts      esquema de propiedades (Zod)
  content/propiedades/   propiedades (md + fotos)
  data/site.json         datos del agente / ajustes
  islands/               componentes Vue interactivos (se hidratan solos)
    PropertyExplorer.vue   buscador + filtros + mapa
    Gallery.vue            galería y visor
    PropertyMap.vue        mapa Leaflet con pines de precio
    MortgageCalculator.vue
    ContactForm.vue · FavoriteButton.vue · FavoritesList.vue · ShareButton.vue · QuickSearch.vue
  components/            componentes Astro estáticos (header, tab bar, footer, íconos)
  layouts/Base.astro     <head>, SEO, JSON-LD, View Transitions
  lib/                   formato de moneda/áreas y helpers de propiedades
  pages/                 rutas
public/admin/            Decap CMS (config.yml)
```
