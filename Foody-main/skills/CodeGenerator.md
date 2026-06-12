---
name: nuxt-stack-codegen
description: >
  Skill de generación de código para proyectos que usan Nuxt.js, Tailwind CSS v4,
  NuxtUI, Pinia y TypeScript. Usa esta skill siempre que el usuario pida crear,
  modificar o revisar componentes Vue, páginas, stores, composables, layouts o
  cualquier archivo de código del repositorio. También aplica cuando el usuario
  menciona componentes de UI, estado global, rutas, estilos o configuración del
  proyecto. Si hay dudas, úsala — es mejor activarla de más que de menos.
---

# Nuxt Stack Code Generator

Eres un agente de generación de código especializado en el stack:

- **Nuxt.js** (v3+) — framework Vue con SSR, file-based routing, auto-imports
- **Tailwind CSS v4** — utility-first CSS con nueva sintaxis de configuración
- **NuxtUI** — librería de componentes construida sobre Tailwind y Radix
- **Pinia** — store management para Vue 3
- **TypeScript** — tipado estricto en todo el proyecto

---

## Principios Generales

1. **Siempre TypeScript**: todo archivo `.ts`, `.vue` con `<script setup lang="ts">`. Sin `any` a menos que sea estrictamente necesario y documentado.
2. **Composition API únicamente**: usar `<script setup>` en todos los componentes. No usar Options API.
3. **Auto-imports de Nuxt**: no importar manualmente `ref`, `computed`, `useRoute`, `useFetch`, etc. Nuxt los auto-importa. Lo mismo para composables propios en `composables/`.
4. **Consistencia de nombrado**:
   - Componentes: `PascalCase.vue`
   - Composables: `useNombreCamelCase.ts`
   - Stores: `useNombreStore.ts`
   - Páginas/layouts: `kebab-case.vue`

---

## Nuxt.js — Reglas

### Estructura de archivos

```
pages/          → rutas automáticas (file-based routing)
components/     → auto-importados globalmente
composables/    → auto-importados, prefijo `use`
stores/         → stores de Pinia
layouts/        → layouts reutilizables
server/api/     → endpoints del servidor (Nitro)
middleware/     → route middleware
plugins/        → plugins de Vue/Nuxt
public/         → assets estáticos
assets/         → assets procesados (CSS, imágenes)
```

### Fetching de datos

```ts
// ✅ Correcto — usar useFetch o useAsyncData
const { data, pending, error } = await useFetch("/api/users");

// ✅ Con tipado
const { data } = await useFetch<User[]>("/api/users");

// ❌ Evitar fetch directo en setup sin useFetch/useAsyncData
```

### Navegación y rutas

```ts
// ✅ Usar navigateTo o useRouter
const router = useRouter();
navigateTo("/dashboard");

// ✅ Rutas tipadas con useRoute
const route = useRoute();
const id = route.params.id;
```

### Middleware

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }
});
```

### SEO y Head

```ts
// En páginas/componentes
useSeoMeta({
  title: "Mi Página",
  description: "Descripción de la página",
});
```

---

## Tailwind CSS v4 — Reglas

Tailwind v4 introduce cambios importantes respecto a v3:

### Configuración

- La config se hace en CSS, no en `tailwind.config.js`:

```css
/* assets/css/main.css */
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --font-sans: "Inter", sans-serif;
  --radius-lg: 0.75rem;
}
```

### Clases y utilidades

```html
<!-- ✅ Usar clases estándar de Tailwind -->
<div class="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
  <!-- ✅ Variantes de estado -->
  <button class="hover:bg-brand/90 focus-visible:ring-2 disabled:opacity-50">
    <!-- ✅ Dark mode con variante dark: -->
    <div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
      <!-- ❌ Evitar estilos inline para lo que Tailwind puede manejar -->
    </div>
  </button>
</div>
```

### Variables CSS en Tailwind v4

```html
<!-- ✅ Referenciar variables del theme -->
<div class="text-[--color-brand] bg-[--color-surface]"></div>
```

### Responsive Design

```html
<!-- Mobile-first: sm: md: lg: xl: 2xl: -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"></div>
```

---

## NuxtUI — Reglas

### Uso de componentes

Siempre preferir componentes de NuxtUI antes de crear custom UI para elementos comunes:

```html
<!-- Botones -->
<UButton label="Guardar" color="primary" variant="solid" />
<UButton icon="i-heroicons-plus" size="sm" />

<!-- Inputs -->
<UInput
  v-model="search"
  placeholder="Buscar..."
  icon="i-heroicons-magnifying-glass"
/>
<UTextarea v-model="description" :rows="4" />

<!-- Formularios -->
<UForm :schema="schema" :state="state" @submit="onSubmit">
  <UFormField label="Email" name="email">
    <UInput v-model="state.email" type="email" />
  </UFormField>
</UForm>

<!-- Notificaciones -->
const toast = useToast() toast.add({ title: 'Guardado', color: 'green' })

<!-- Modales -->
<UModal v-model:open="isOpen">
  <template #content>...</template>
</UModal>

<!-- Tablas -->
<UTable :data="rows" :columns="columns" />

<!-- Badges, Avatars, Cards, etc. -->
<UBadge label="Nuevo" color="blue" />
<UAvatar src="/avatar.png" alt="Usuario" />
```

### Tema y personalización

```ts
// app.config.ts
export default defineAppConfig({
  ui: {
    primary: "indigo",
    gray: "neutral",
    button: {
      rounded: "rounded-lg",
    },
  },
});
```

### Iconos

NuxtUI usa `@iconify` con el prefijo `i-`:

```html
<UIcon name="i-heroicons-home" />
<UButton icon="i-heroicons-arrow-right" trailing />
```

---

## Pinia — Reglas

### Definición de stores (Composition API style — preferido)

```ts
// stores/useUserStore.ts
export const useUserStore = defineStore("user", () => {
  // State
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);

  // Getters (computed)
  const isAuthenticated = computed(() => currentUser.value !== null);
  const displayName = computed(() => currentUser.value?.name ?? "Invitado");

  // Actions
  async function fetchUser(id: string) {
    isLoading.value = true;
    try {
      const { data } = await useFetch<User>(`/api/users/${id}`);
      currentUser.value = data.value;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    currentUser.value = null;
  }

  return {
    currentUser,
    isLoading,
    isAuthenticated,
    displayName,
    fetchUser,
    logout,
  };
});
```

### Uso en componentes

```ts
// ✅ Desestructurar con storeToRefs para reactividad
const store = useUserStore();
const { currentUser, isLoading, isAuthenticated } = storeToRefs(store);
const { fetchUser, logout } = store; // acciones sin storeToRefs

// ❌ Esto pierde reactividad
const { currentUser } = useUserStore();
```

### Persistencia (si aplica)

```ts
// Con pinia-plugin-persistedstate
export const useUserStore = defineStore(
  "user",
  () => {
    // ...
  },
  {
    persist: {
      storage: persistedState.localStorage,
      pick: ["currentUser"], // solo persistir campos específicos
    },
  },
);
```

---

## TypeScript — Reglas

### Interfaces y tipos

```ts
// types/index.ts o types/user.ts — centralizar tipos del dominio

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: Date;
}

export type CreateUserPayload = Omit<User, "id" | "createdAt">;
export type UpdateUserPayload = Partial<CreateUserPayload>;
```

### Props con TypeScript

```ts
// ✅ Usar defineProps con tipos
interface Props {
  user: User;
  isEditable?: boolean;
  onSave?: (user: User) => void;
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
});

// ✅ Emits tipados
const emit = defineEmits<{
  update: [user: User];
  delete: [id: string];
  cancel: [];
}>();
```

### Composables tipados

```ts
// composables/useAuth.ts
export function useAuth() {
  const store = useUserStore();

  async function login(credentials: {
    email: string;
    password: string;
  }): Promise<boolean> {
    try {
      const { data } = await useFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: credentials,
      });
      if (data.value?.token) {
        // handle token
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return { login, ...storeToRefs(store) };
}
```

### Evitar patrones inseguros

```ts
// ❌ Evitar
const data: any = await fetch(...)
(element as any).value

// ✅ Preferir type guards
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

---

## Patrones de Componentes Vue

### Componente típico completo

```vue
<script setup lang="ts">
interface Props {
  title: string;
  items: Item[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  select: [item: Item];
  refresh: [];
}>();

// Estado local
const search = ref("");

// Computed
const filteredItems = computed(() =>
  props.items.filter((i) =>
    i.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

// Métodos
function handleSelect(item: Item) {
  emit("select", item);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <UInput
      v-model="search"
      placeholder="Buscar..."
      icon="i-heroicons-magnifying-glass"
    />

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-primary" />
    </div>

    <ul v-else class="divide-y divide-neutral-200 dark:divide-neutral-700">
      <li
        v-for="item in filteredItems"
        :key="item.id"
        class="py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer px-4 rounded-lg transition-colors"
        @click="handleSelect(item)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
```

---

## Checklist antes de entregar código

- [ ] `<script setup lang="ts">` en todos los SFCs
- [ ] Props e emits completamente tipados
- [ ] Sin imports manuales de auto-imports de Nuxt/Vue
- [ ] Stores usan `storeToRefs` al desestructurar state/getters
- [ ] Clases de Tailwind v4 (sin `tailwind.config.js` custom)
- [ ] Componentes de NuxtUI usados donde corresponde
- [ ] Sin `any` sin justificación
- [ ] Nombres de archivos en convención correcta
