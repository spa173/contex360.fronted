# Guías y Reglas para Gemini — Contex360 Frontend

Este archivo define el contexto del proyecto y las reglas obligatorias que debes seguir de forma estricta al realizar cualquier cambio o proponer optimizaciones en `contex360.fronted`.

---

## 1. Contexto del Proyecto

Contex360 es una plataforma ERP inteligente para empresas colombianas que automatiza contabilidad, facturación electrónica (DIAN) e inventarios.

### Stack Técnico
- **Framework:** Vue 3 + Vite + TypeScript
- **Estilos:** Tailwind CSS
- **Estado:** Pinia
- **Testing:** Vitest
- **Despliegue:** Vercel
- **Pagos:** Wompi
- **Calidad de código:** SonarCloud
- **Backend:** NestJS + Prisma + PostgreSQL (Neon)

---

## 2. Proceso Obligatorio

Cuando se solicite cualquier optimización o cambio no trivial, seguir siempre estas fases:

**Fase 1 — Analizar (sin tocar código)**
- Leer los archivos relevantes.
- Identificar hallazgos concretos con archivo, línea e impacto estimado.
- No modificar código en esta fase.

**Fase 2 — Proponer**
- Listar los cambios propuestos ordenados por ROI.
- Estimar impacto en Lighthouse o en calidad.
- Esperar aprobación explícita antes de continuar.

**Fase 3 — Implementar**
- Implementar UN solo cambio por iteración.
- Generar diff legible del cambio.

**Fase 4 — Verificar**
- Ejecutar `npx vue-tsc --noEmit` → sin errores TypeScript.
- Ejecutar `npm run build` → build limpio.
- Ejecutar `npm run lint` → sin errores de linter.
- Ejecutar `npm run test` → todos los tests pasan.
- Confirmar que SonarCloud Quality Gate sigue en PASS.

> **Nunca implementar más de una optimización importante en la misma iteración.**

---

## 3. Cambios Seguros

Antes de modificar cualquier código:

1. Analizar impacto en el resto del sistema.
2. Identificar dependencias afectadas.
3. Verificar tipos TypeScript del cambio.
4. Verificar que las rutas del router no se rompen.
5. Verificar que los imports no quedan rotos o huérfanos.

**Prohibido:**
- Refactorizar múltiples módulos simultáneamente.
- Cambiar arquitectura durante una optimización de rendimiento.
- Mezclar bugfixes funcionales con optimizaciones de performance en el mismo commit.
- Modificar más de un subsistema por tarea.

---

## 4. SonarQube (Obligatorio)

- No introducir nuevos Code Smells.
- No introducir nuevas vulnerabilidades.
- No introducir Security Hotspots sin justificar explícitamente.
- Mantener Quality Gate en **PASS**.
- No aumentar la deuda técnica existente.
- No aumentar la complejidad cognitiva de métodos ya existentes.
- Toda función **nueva** debe tener complejidad cognitiva < 15.
- Toda función **nueva** debe tener complejidad ciclomática < 10.
- No dejar variables sin usar (`no-unused-vars`).
- No dejar imports sin usar.
- No duplicar bloques lógicos.

> **Sobre el tamaño de funciones:** Preferir funciones ≤ 50 líneas. Si una función supera 50 líneas, justificar. SonarCloud mide complejidad, no líneas — una función de 80 líneas simple es mejor que una de 30 líneas con complejidad 20.

---

## 5. Despliegue Vercel

- Todo cambio debe mantener compatibilidad con Vercel.
- `npm run build` debe finalizar sin errores.
- `vite build` debe finalizar sin errores.
- No modificar `vercel.json` sin justificar el cambio.
- No modificar CSP sin justificar el cambio y verificar que Wompi sigue funcionando.
- No romper redirects, rewrites ni headers de Vercel.
- No usar APIs exclusivas de Node.js en código cliente (sin `typeof window !== 'undefined'` guard).

---

## 6. Performance — Lighthouse

**Objetivo:**
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

**Prioridad de métricas:**
1. LCP (Largest Contentful Paint)
2. TBT (Total Blocking Time)
3. INP (Interaction to Next Paint)
4. CLS (Cumulative Layout Shift)

**Reglas:**
- No aumentar el bundle inicial sin justificación.
- No aumentar el DOM inicial (nodos en carga).
- No introducir librerías > 50 KB sin aprobación. Verificar en bundlephobia.com.
- Todo componente pesado debe ser lazy-loaded.
- Toda sección below-the-fold debe usar lazy rendering con `IntersectionObserver`.
- Toda imagen decorativa debe tener `loading="lazy"`.
- La imagen LCP (hero) debe tener `fetchpriority="high"` y `loading="eager"`.
- Evitar watchers (`watch`) innecesarios o que disparen en cada render.
- Evitar `computed` con lógica costosa sin memoización adecuada.
- Todo scroll/resize listener debe ser `{ passive: true }`.

---

## 7. Lazy Rendering de Componentes

Cuando agregues secciones below-the-fold:
- Usar `v-if` con banderas reactivas (`showSection`).
- Proveer un `div v-else` con altura estimada real en Tailwind (ej: `h-[600px]`) para evitar CLS.
- Registrar el placeholder en `IntersectionObserver` con `rootMargin: '600px 0px'`.
- **Bot Bypass (SEO):** Detectar `userAgent` e inicializar todos los flags en `true` para Lighthouse, Googlebot, Bingbot, etc.
- **Anchor links:** Escuchar `hashchange` para forzar renderizado inmediato si el usuario llega por un enlace ancla (`#precios`, `#faq`, etc.).
- Desconectar el observer en `onUnmounted`.

---

## 8. Wompi — Pagos (Crítico)

- **No modificar** el flujo de checkout bajo ninguna circunstancia sin aprobación explícita.
- **No modificar** la validación de pagos.
- **No modificar** la lógica de webhooks.
- No exponer botones de simulación/test en producción.
- No alterar la CSP requerida para `checkout.wompi.co`.
- Si el usuario no está autenticado al intentar pagar, cerrar el overlay Wompi antes de abrir el modal de login.

---

## 9. OCR — Módulo de Reconocimiento (Crítico)

- No modificar endpoints OCR sin validar contra el backend primero.
- **No usar** endpoints legacy `/analytics/ocr-*`. Solo usar `/ocr/*`.
- No romper el mecanismo de retry de OCR.
- No romper el mecanismo de polling de OCR.
- No romper los límites de cuota OCR.

---

## 10. TypeScript & Build

- `npx vue-tsc --noEmit` debe pasar sin errores antes de cualquier commit.
- No usar `any` explícito. Si es inevitable, justificar con comentario `// eslint-disable-next-line`.
- No usar `@ts-ignore` sin explicación.
- No introducir errores de tipo en templates Vue (verificar con `vue-tsc`).

---

## 11. Testing

- Todo composable nuevo debe tener prueba unitaria en Vitest.
- Todo bug corregido debe tener un test de regresión.
- Al mockear globales del navegador en Vitest, usar `window.X` (no `global.X`) para evitar errores de tipos TypeScript.
- Usar `await wrapper.vm.$nextTick()` antes de aserciones sobre el DOM en tests Vue.
- `sonar.exclusions` en `sonar-project.properties` debe incluir `src/**/*.{test,spec}.{js,ts}`.
- No usar `it.only` ni `describe.only` en commits.

---

## 12. Integridad Funcional

- **No cambiar UX ni diseño visual** aprobado. Sin refactors estéticos.
- No eliminar funcionalidades existentes.
- No modificar el flujo de autenticación de usuarios.
- No modificar el flujo de pagos Wompi.

---

## 13. Flujo Git (Obligatorio)

1. Verificar localmente: `npm run lint` + `npm run test` + `npm run build`.
2. Checkout a `staging`.
3. Commit y push a `origin/staging`.
4. Crear PR con GitHub CLI:
   ```bash
   gh pr create --base main --head staging --title "tipo: descripción" --body "..."
   ```
5. Esperar que pasen: GitHub Actions CI ✅ + SonarCloud Quality Gate ✅.
6. Hacer merge:
   ```bash
   gh pr merge <PR_NUMBER> --merge
   ```
7. Volver a `main` y sincronizar:
   ```bash
   git checkout main && git pull origin main
   ```

**Formato de commits (Conventional Commits):**
```
feat:     nueva funcionalidad
fix:      corrección de bug
perf:     optimización de rendimiento
docs:     documentación
chore:    tareas de mantenimiento
test:     pruebas
refactor: refactoring sin cambio funcional
```
