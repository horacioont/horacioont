import { ref, onMounted, onBeforeUnmount } from 'vue';

const KEY = 'ea:favoritos';
const EVT = 'ea:favoritos-change';

const leer = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

/** Favoritos guardados en el dispositivo, sincronizados entre islas y pestañas. */
export function useFavoritos() {
  const favoritos = ref<string[]>([]);
  const sync = () => (favoritos.value = leer());

  onMounted(() => {
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
  });
  onBeforeUnmount(() => {
    window.removeEventListener(EVT, sync);
    window.removeEventListener('storage', sync);
  });

  const toggle = (slug: string) => {
    const set = new Set(leer());
    set.has(slug) ? set.delete(slug) : set.add(slug);
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch {}
    window.dispatchEvent(new Event(EVT));
    navigator.vibrate?.(10);
  };

  return { favoritos, toggle, es: (slug: string) => favoritos.value.includes(slug) };
}
