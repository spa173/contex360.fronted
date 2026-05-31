# Sistema de Diseño de Contex360

Este documento contiene las especificaciones visuales, tokens de diseño y directrices de UI/UX de la aplicación Frontend de **Contex360 ERP**. El objetivo general es mantener un diseño de nivel empresarial, limpio y de aspecto premium (estilo Stripe, Linear, Vercel y Notion) para el año 2026.

---

## 🎨 1. Paleta de Colores y Modo Oscuro/Claro

El proyecto utiliza variables de CSS semánticas definidas en `src/assets/styles.css` que cambian automáticamente según el tema activo (`html.light` u `html.dark` gestionado por `themeStore`).

### Tokens de Color Semánticos

| Variable CSS | Propósito | Valor Light | Valor Dark |
| :--- | :--- | :--- | :--- |
| `--page-background` | Fondo general de la página | `#FFFFFF` | `#0b0f19` |
| `--text` | Texto principal de la app | `#18181B` | `#f4f4f5` |
| `--primary` | Color de marca/acciones primarias | `#2563EB` (Azul) | `#3b82f6` (Azul claro) |
| `--secondary` | Fondo para contenedores secundarios | `#FAFAFA` | `#111827` |
| `--accent` | Resaltado o estados activos | `#2563EB` | `#3b82f6` |
| `--muted` | Texto de menor jerarquía | `#555555` | `#94a3b8` |
| `--border` | Bordes estándar | `#E4E4E7` | `rgba(55, 65, 81, 0.5)` |
| `--surface` | Fondo de tarjetas y elementos elevados | `#FFFFFF` | `#182235` (Slate oscuro) |
| `--surface-alt` | Alternativa de superficie | `#FAFAFA` | `#111827` |

### Integración en Tailwind (`tailwind.config.js`)
Puedes usar estas clases de Tailwind directamente, las cuales están mapeadas a las variables de arriba:
* **Fondos:** `bg-background`, `bg-surface`, `bg-surface-muted`, `bg-secondary`
* **Textos:** `text-foreground`, `text-text-main`, `text-text-muted`, `text-primary`
* **Bordes:** `border-border`, `border-border-subtle`

---

## 📐 2. Bordes, Espaciado y Tipografía

### Tipografía
* **Familia de fuentes:** `Inter` o `Geist` (importada por defecto).
* **Uso de Serif:** Las cabeceras principales (`h1`, `h2`, `h3`) del Dashboard y Landing utilizan tipografía Serif tipo **Georgia / Times New Roman** para dar un aspecto editorial y premium.

### Radios de Bordes (Bordes Redondeados)
* **Estándar:** `var(--radius)` (`8px`) -> `rounded-md` en Tailwind.
* **Elevado/Contenedores:** `var(--radius-lg)` (`12px`) -> `rounded-lg` en Tailwind.
* **Campos/Forms:** `border-radius: 14px` para una estética moderna y amigable.

---

## 🧩 3. Clases de Componentes Clave

Utiliza o extiende las siguientes clases CSS definidas en la hoja de estilos global:

### A. Botones Premium
1. **Botón Primario (`.primary-button`):**
   * Estilo: Fondo `--primary`, texto contrastante, transición suave en hover.
   * Efecto: `hover:opacity-90 active:scale-95` y desplazamiento de `-1px` vertical.
2. **Botón Secundario/Ghost (`.secondary-button` / `.ghost-button`):**
   * Estilo: Bordes sutiles, fondo translúcido y texto neutro.

### B. Tarjetas de Métricas (`.metric-card`)
* Estructura ideal para indicadores financieros y de uso:
  ```html
  <div class="metric-card">
    <p class="metric-label">Facturación Mensual</p>
    <div class="metric-val">$10,240,000 COP</div>
    <span class="metric-sub">+12% respecto al mes anterior</span>
  </div>
  ```

### C. Tarjeta de Panel (`.panel-card`)
* Se utiliza para envolver formularios, tablas y vistas principales del Dashboard ERP:
  * Contiene padding amplio (`32px` / `p-8`).
  * Fondo `var(--surface)` y borde sutil `var(--border)`.
  * Sombra suave y radio de borde `var(--radius-lg)`.

---

## ⚡ 4. Animaciones y Microinteracciones

* **Transición global por defecto:** `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`.
* **Estados de enfoque (`focus-visible`):**
  * Todos los botones, enlaces e inputs activos deben tener un contorno claro: `outline: 2px solid #2563EB` con un offset de `2px` para garantizar la accesibilidad.
* **Efectos Hover:**
  * Las tarjetas e ítems interactivos deben tener un efecto hover sutil como elevarse un píxel hacia arriba (`hover:-translate-y-[1px]`) y una sombra más profunda (`shadow-md`).

---

## 💻 5. Ejemplos de Implementación (Vue 3 + Tailwind)

### Ejemplo: Card Interactiva y Premium
```vue
<template>
  <div class="panel-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer">
    <div class="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
      <h4 class="font-serif text-lg font-semibold text-foreground">
        <slot name="title">Título de Card</slot>
      </h4>
      <span class="status-pill text-xs">Activo</span>
    </div>
    <div class="text-text-muted text-sm leading-relaxed">
      <slot name="content">Cuerpo de la tarjeta con espaciado amplio.</slot>
    </div>
  </div>
</template>
```

### Ejemplo: Input con Estilo Moderno
```vue
<template>
  <div class="field">
    <label class="text-text-muted text-sm font-medium mb-1">
      Nombre del Cliente
    </label>
    <input 
      type="text" 
      class="w-full bg-secondary border border-border rounded-[14px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
      placeholder="Ej. Juan Pérez"
    />
  </div>
</template>
```
