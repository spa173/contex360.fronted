# Performance Guardrails - Contex360 Frontend

Este documento establece las directrices, reglas y buenas prácticas obligatorias para el desarrollo en el frontend de **Contex360**. El objetivo principal es garantizar que la aplicación mantenga un rendimiento excelente en producción, protegiendo las métricas clave de **Core Web Vitals**:

- **Performance (Lighthouse Mobile) > 90**
- **Largest Contentful Paint (LCP) < 2.5s**
- **Total Blocking Time (TBT) < 200ms**
- **Cumulative Layout Shift (CLS) = 0**

---

## 1. Lazy Rendering de Componentes Debajo del Pliegue (Below-the-Fold)

Para mantener un tamaño de DOM inicial reducido y optimizar el FCP/TBT, todos los componentes o secciones que no sean visibles inmediatamente en el primer pantallazo (above-the-fold) deben cargarse de forma diferida (lazy rendering).

### Reglas de Implementación
- **Carga Condicional (`v-if`):** Envuelve el contenido de la sección en un bloque `<template v-if="showSection">`.
- **Placeholder con Alturas Fijas (`v-else`):** Provee un contenedor alternativo (`div v-else`) con una altura estimada en CSS (por ejemplo, `h-[600px]`) que imite el espacio real de la sección para evitar fluctuaciones y saltos de página (CLS).
- **IntersectionObserver:** Registra el placeholder en un `IntersectionObserver` con un `rootMargin` amplio (recomendado `600px`) para montar el componente real antes de que el usuario llegue haciendo scroll.

### Salvaguarda de SEO (Bot Bypass)
No se debe bloquear la indexación de contenido para los buscadores. Es obligatorio comprobar el User Agent en el cliente y forzar el renderizado inmediato si se detecta un bot de búsqueda o auditoría (como Googlebot o Lighthouse):

```typescript
const isBot = typeof navigator !== 'undefined' && /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|lighthouse/i.test(navigator.userAgent)

if (isBot) {
  showTestimonials.value = true
  showPricing.value = true
  showFaq.value = true
  showFooter.value = true
}
```

### Accesibilidad y Enlaces Ancla (Hash Navigation)
- Los envoltorios (`div`) de los placeholders deben conservar los mismos identificadores (`id="..."`) y márgenes de scroll (`scroll-margin-top`) para que los navegadores puedan saltar a ellos mediante enlaces `#`.
- Escucha el evento `hashchange` de la ventana para forzar la carga inmediata de la sección si el usuario navega directamente a un ancla:

```typescript
const checkHash = () => {
  const hash = window.location.hash
  if (hash === '#precios') {
    showPricing.value = true
  }
}
```

---

## 2. Optimización de Assets e Imágenes

Las imágenes pesadas sin optimizar son la principal causa de un mal LCP.

### Reglas de Implementación
- **Formatos Modernos:** Usa siempre formatos de imagen modernos como **WebP** o **AVIF** para ilustraciones y capturas de pantalla. Evita archivos PNG o JPEG pesados en la Landing.
- **Imágenes Responsivas (`<picture>`):** Implementa etiquetas `<picture>` con diferentes fuentes según el ancho del dispositivo (Mobile vs. Desktop) para no descargar imágenes sobredimensionadas en celulares.
- **Atributos de Medidas:** Define explícitamente `width` y `height` en las etiquetas `<img>` para que el navegador reserve el espacio correcto y evite saltos de maquetación (CLS).
- **Atributos de Carga:**
  - Usa `loading="eager"` y `fetchpriority="high"` únicamente para la imagen principal del Hero (LCP).
  - Usa `loading="lazy"` y `decoding="async"` para todas las imágenes restantes debajo del pliegue.

---

## 3. Configuración del Bundle y Preload de Módulos

Vite inyecta por defecto etiquetas `<link rel="modulepreload">` para todos los recursos estáticos importados. Esto puede penalizar severamente el rendimiento en conexiones móviles si se precargan vistas grandes del ERP que solo se usan tras iniciar sesión.

### Reglas de Configuración
En `vite.config.js`, usa el gancho `resolveDependencies` dentro de la configuración de `modulePreload` para excluir los chunks de vistas pesadas o de uso exclusivo post-login de la precarga inicial:

```javascript
modulePreload: {
  resolveDependencies(filename, deps, { hostId }) {
    // Evitar precargar chunks pesados del ERP en el documento inicial
    if (filename.includes('AppShell') || filename.includes('views/')) {
      return []
    }
    return deps
  }
}
```

---

## 4. Oyentes de Eventos Pasivos (Passive Listeners)

Los oyentes de eventos de desplazamiento en la ventana (`scroll`, `touchstart`, `touchmove`) pueden retrasar la respuesta del scroll si el navegador tiene que esperar a que se ejecute el JavaScript para decidir si cancela el evento.

### Reglas de Implementación
Declara siempre los oyentes de desplazamiento utilizando la opción `{ passive: true }`:

```typescript
window.addEventListener('scroll', handleScroll, { passive: true })
```

Y asegúrate de removerlos en el ciclo de vida `onUnmounted` para prevenir fugas de memoria:

```typescript
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
```

---

## 5. Pruebas y Control de Calidad en CI/CD

Para asegurar que las optimizaciones no se degraden y evitar fallos del Quality Gate en SonarCloud:

- **Exclusión de Archivos de Prueba:** Mantén los archivos de prueba (`*.spec.ts`, `*.test.ts`) fuera de la sección `sonar.sources` (añadiéndolos a `sonar.exclusions`) para evitar falsos negativos de cobertura (0% en tests) y falsos positivos de código duplicado.
- **Unit Testing de Rendimiento:** Cualquier lógica reactiva añadida para diferir renders (como `IntersectionObserver` o manipuladores de hash) debe estar cubierta por pruebas unitarias mocked en la suite de Vitest.
