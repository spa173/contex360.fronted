# Reglas Permanentes de Desarrollo Frontend (Contex360)

Este documento establece el estándar definitivo y obligatorio para el desarrollo, diseño de interfaces, rendimiento y accesibilidad del frontend de **Contex360**. Su cumplimiento garantiza una experiencia de usuario (UX) de nivel SaaS premium, coherencia visual en modo claro/oscuro y máxima eficiencia técnica.

---

## 🎨 1. Sistema de Diseño (Design Tokens)

El diseño visual se rige por el principio editorial y sofisticado de marcas como *Stripe*, *Linear*, *Vercel* y *Notion*. 

### 1.1 Tipografía Editorial
*   **Texto General:** Inter o Geist (`font-sans`).
*   **Encabezados Principales:** Las cabeceras principales (`h1`, `h2`, `h3`, `h4`) del Dashboard y de la Landing Page utilizan tipografía Serif (**Georgia** o **Times New Roman**) para aportar un aspecto premium y editorial.
*   **Prohibición:** No utilices tipografía sans-serif genérica o fuentes decorativas para los títulos principales.

### 1.2 Radios de Bordes Estandarizados
*   **Pequeño (Bordes de botones, pills):** `var(--radius-sm)` (`6px`) -> `rounded-sm`.
*   **Mediano (Inputs, botones principales):** `var(--radius)` (`8px`) -> `rounded-md` o `rounded-[14px]` para inputs modernos.
*   **Grande (Tarjetas, modales, paneles):** `var(--radius-lg)` (`12px`) -> `rounded-lg` / `rounded-xl`.

---

## 🚫 2. Prohibición de Malas Prácticas (Anti-patrones)

### 🔴 PROHIBIDO: Colores Hardcodeados (Hardcoded Colors)
Nunca utilices clases de colores fijos de Tailwind o códigos hexadecimales directamente en el marcado HTML de los componentes.
*   ❌ **Mal:** `bg-white`, `bg-slate-900`, `text-neutral-900`, `border-gray-200`, `#FFFFFF`.
*   ✅ **Bien:** `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `bg-secondary`.
*   *Razón:* Los colores hardcodeados rompen el soporte nativo del Modo Oscuro/Claro que se gestiona mediante CSS variables dinámicas en `src/assets/styles.css`.

### 🔴 PROHIBIDO: Uso de `transition-all`
Evita aplicar `transition-all` para animaciones y estados de enfoque o hover.
*   ❌ **Mal:** `<button class="transition-all duration-200 hover:scale-95">`
*   ✅ **Bien:** `<button class="transition-transform duration-200 hover:scale-95">` o `transition-[transform,opacity]`.
*   *Razón:* `transition-all` obliga al navegador a recalcular todas las propiedades de layout (incluyendo anchos, márgenes y sombras) durante cada frame de la animación, degradando el rendimiento y provocando caídas de FPS.

### 🔴 PROHIBIDO: Código Duplicado de Layouts y Componentes
*   No dupliques la estructura visual de inputs, botones o paneles.
*   ❌ **Mal:** Copiar y pegar clases de Tailwind de 20 líneas en cada input de formulario.
*   ✅ **Bien:** Utilizar los componentes base en `src/components/ui/` (ej. `<Input />`, `<Button />`, `<Card />`).

---

## 💅 3. Reglas de TailwindCSS y Estilos

*   **Utility-First:** Prioriza siempre el uso de clases utilitarias de Tailwind. Evita escribir bloques `<style scoped>` personalizados en los componentes, excepto para animaciones complejas de keyframes o hacks de librerías externas.
*   **Integración de CSS Variables:** Usa las variables semánticas configuradas en `tailwind.config.js` (`bg-background`, `border-border`, `text-text-muted`, etc.).
*   **Separación de Interacciones:** Divide los estados visuales claramente con modificadores de Tailwind:
    *   Foco: `focus-visible:ring-2 focus-visible:ring-primary/20`
    *   Hover: `hover:opacity-90`
    *   Activo: `active:scale-98`

---

## 📱 4. Diseño Responsivo y Mobile-First

Todo layout o componente debe diseñarse pensando primero en dispositivos móviles y luego expandiéndose progresivamente a pantallas grandes.

1.  **Layouts Flexibles:** Utiliza `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4` para grillas de métricas.
2.  **Adaptación de Tablas:** Las tablas de datos administrativas (`UserTable`, `EmpresasTable`) deben envolverse en un contenedor con scroll horizontal (`overflow-x-auto`) o colapsar en tarjetas (`metric-card`) en pantallas móviles (`block md:table`).
3.  **Tamaños y Spacing Responsivo:** Usa `clamp()` de CSS o clases responsivas para textos de gran tamaño (ej. `text-2xl md:text-4xl`).

---

## 🌓 5. Modo Oscuro (Dark Mode) Consistente

*   El estado del tema es controlado por `themeStore` que añade la clase `.dark` o `.light` en la etiqueta `<html>`.
*   **Compatibilidad Automática:** Siempre verifica cómo se renderiza tu componente en ambos temas. Utiliza las variables CSS compartidas definidas en `src/assets/styles.css`:
    *   `--page-background` para el fondo.
    *   `--surface` para tarjetas de métricas o paneles.
    *   `--border` para las divisiones.
*   **Imágenes y Recursos:** Si una ilustración o gráfico no se lee bien en modo oscuro, utiliza variaciones responsivas de imagen o aplica filtros de opacidad sutiles (`dark:opacity-80`).

---

## ⚡ 6. Rendimiento y Optimización Core Web Vitals

La aplicación debe mantener métricas óptimas en Google Lighthouse. Para ello, es obligatorio cumplir con las siguientes directrices:

### 6.1 Optimización de LCP (Largest Contentful Paint)
*   **Imágenes Críticas:** Las imágenes visibles por encima del pliegue (como el logotipo o la imagen principal del Hero) deben cargarse con prioridad alta (`fetchpriority="high"` o `loading="eager"`).
*   **Formatos de Nueva Generación:** Prohibido el uso de imágenes `.png` o `.jpg` pesadas. Utiliza formato `.webp` o `.avif` y optimízalas antes de guardarlas en `public/`.
*   **Tamaño de Bundles:** Mantén las importaciones limpias. No importes librerías enteras de iconos o utilidades si solo usas una función; usa sacudida de árbol (tree-shaking) e importación destructurada.

### 6.2 Optimización de CLS (Cumulative Layout Shift)
*   **Reserva de Espacio:** Especifica siempre los atributos `width` y `height` en las etiquetas `<img>` y `<svg>` para que el navegador reserve el espacio antes de la descarga.
*   **Cargas Diferidas (Skeletons):** Al realizar llamadas asíncronas para renderizar datos (ej. paneles financieros), muestra componentes de carga temporal (Skeletons) con dimensiones idénticas a los datos reales para evitar que la interfaz "salte" repentinamente al terminar la petición.
*   **Dimensiones de Fuentes:** Evita saltos de texto al cargar fuentes personalizadas usando la propiedad CSS `font-display: swap` y declarando fuentes del sistema equivalentes como fallback.

---

## ♿ 7. Accesibilidad (A11y) Obligatoria

Cumplir con las pautas de accesibilidad WCAG 2.1 es un requerimiento de primer nivel para la aplicación.

*   **HTML Semántico:** Utiliza etiquetas nativas como `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<button>` y `<a>` en lugar de divitis generalizada.
*   **Navegación por Teclado:**
    *   Todos los botones y enlaces interactivos deben tener un indicador visual de foco claro (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`).
    *   Los formularios deben poder enviarse y navegarse usando únicamente las teclas Tab y Enter.
*   **Etiquetado y Roles:**
    *   Los iconos decorativos SVG deben llevar `aria-hidden="true"`.
    *   Los botones que solo contienen iconos deben tener una descripción explícita para lectores de pantalla mediante `aria-label` (ej: `<button aria-label="Cerrar modal">`).
*   **Contraste de Color:** Asegura que los textos en cualquier estado (incluyendo deshabilitado o secundario) mantengan una relación de contraste mínima de **4.5:1** contra su color de fondo.

---

## 🧩 8. Componentes Reutilizables y UX Premium

### 8.1 Abstracción de UI
*   Los componentes en `src/components/ui/` actúan como los átomos del sistema de diseño (botones, inputs, diálogos, dropdowns). Si necesitas modificar el estilo visual de un botón, edita el componente base en lugar de añadir clases utilitarias ad-hoc en las vistas de negocio.
*   Usa clases de utilidad premium como `backdrop-filter backdrop-blur-md` para topbars flotantes o modales para emular el efecto cristal (glassmorphic) característico de las aplicaciones premium modernas.

### 8.2 Animaciones y Microinteracciones
*   Usa transiciones discretas y elegantes.
*   **Transición Estándar:** Aplica transiciones de duración corta y curvas bezier fluidas:
    ```css
    transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
    ```
*   **Efectos Hover en Cards:** Aplica desplazamientos suaves en el eje Y (`hover:-translate-y-[2px]`) y cambios sutiles de sombreado (`shadow-sm hover:shadow-md`) para indicar interactividad sin sobrecargar visualmente al usuario.
*   **Evita el Ruido:** Quedan prohibidas las animaciones automáticas constantes o efectos intrusivos (parpadeos, rebotes cíclicos, etc.) que distraigan la atención en paneles administrativos.
