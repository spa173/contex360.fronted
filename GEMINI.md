# Guías y Reglas de Optimización para Gemini en Contex360

Este archivo contiene el contexto del proyecto, reglas obligatorias y directrices que debes seguir de forma estricta al realizar cambios o proponer optimizaciones en los repositorios de **Contex360**.

---

## 1. Contexto del Proyecto

Contex360 es una plataforma ERP inteligente diseñada para empresas colombianas que automatiza contabilidad, facturación electrónica (DIAN) e inventarios.

### Arquitectura
- **Frontend (`contex360.fronted`):** Vue 3, Vite, Tailwind CSS, Pinia, TypeScript, Vitest.
- **Backend (`contex360.backend`):** NestJS, Prisma ORM, PostgreSQL (Neon), Vitest.
- **Plataformas y Servicios:** Despliegue en Vercel, Pasarela de Pagos Wompi, SonarCloud para análisis de código.

---

## 2. Reglas de Optimización Obligatorias

Cualquier propuesta o cambio de código debe regirse bajo estas restricciones estrictas:

### A. Construcción y Tipado (Build)
- El comando `npm run build` debe finalizar siempre sin advertencias graves ni errores de compilación.
- `vite build` debe empaquetar de forma limpia.
- **Sin errores de TypeScript:** No debes introducir ningún fallo de tipado en `tsc` o `vue-tsc`. Verifica siempre localmente ejecutando `npx vue-tsc --noEmit`.

### B. Estándares de SonarQube / SonarCloud
- **No duplicar código:** Evita patrones lógicos repetidos.
- **Complejidad Ciclomática:** No aumentes la complejidad ciclomática del código modificado.
- **Tamaño de Funciones:** Ninguna función nueva o modificada debe superar las **50 líneas de código**.
- **Sin Code Smells:** Resuelve y no introduzcas incidencias de mantenibilidad.
- **Limpieza de Variables:** No dejes variables sin usar (`no-unused-vars`) ni importaciones inactivas.

### C. Vercel y Despliegue
- La aplicación debe compilar e implementarse correctamente en Vercel.
- No modifiques archivos de configuración crítica de despliegue (`vercel.json`).
- No rompas las directivas de seguridad de contenido (**CSP**) ni alteres las rutas existentes del router.

### D. Integridad Funcional
- **Sin cambios de UX/UI:** Mantén el diseño visual, espaciados y comportamiento estético exactamente igual al aprobado. No realices refactorizaciones estéticas o de diseño visual.
- **Mantener Funcionalidad:** No elimines ninguna característica del sistema, en especial el flujo transaccional de pagos de **Wompi** y la autenticación de usuarios.

### E. Prioridad de Rendimiento (ROI Alto)
- Enfoca esfuerzos y prioriza métricas en este orden: **1. LCP**, **2. TBT**, **3. INP**, **4. CLS**.
- Solo aplica cambios con **Retorno de Inversión (ROI) alto**. Evita optimizaciones teóricas o cosméticas de bajo impacto.

---

## 3. Directrices Técnicas Específicas

### Lazy Rendering de Componentes
Cuando agregues componentes debajo del pliegue (below-the-fold), implementa renderizado diferido:
- Usa `v-if` con banderas reactivas (`showSection`).
- Provee un placeholder `div v-else` con altura real en Tailwind (ej: `h-[600px]`) para evitar layout shifts (CLS).
- Registra el elemento en `IntersectionObserver` con un `rootMargin` amplio (ej: `600px`).
- **Bot Bypass (SEO):** Verifica siempre el `userAgent` del cliente e inicializa todos los flags en `true` para Lighthouse y bots de motores de búsqueda.
- **Enlaces Ancla:** Registra escuchadores de eventos `hashchange` para activar secciones de inmediato si el usuario accede mediante un hash (`#precios`, etc.).

### Calidad de Pruebas Unitarias
- **Exclusión de Archivos de Prueba:** Asegúrate de que `sonar.exclusions` en `sonar-project.properties` contenga `src/**/*.{test,spec}.{js,ts}` para evitar que SonarCloud pida cobertura para los propios archivos de prueba.
- **Mock de Globales:** Al mockear `IntersectionObserver` en los tests de Vitest, utiliza `window.IntersectionObserver` en lugar del objeto `global` para evitar fallos de compilación de tipos en TypeScript.
- **NextTick:** Asegura siempre de esperar a que Vue procese las actualizaciones del DOM usando `await wrapper.vm.$nextTick()` antes de realizar aserciones en los tests unitarios.

---

## 4. Flujo de Control de Versiones (Git)

Al subir cambios, sigue estrictamente este flujo de integración:
1. Pasa las pruebas locales (`npm run test`) y el linter (`npm run lint`).
2. Haz checkout a la rama `staging`.
3. Commitea los cambios a `staging` y haz push a `origin/staging`.
4. Genera el Pull Request hacia `main` usando GitHub CLI:
   ```bash
   gh pr create --base main --head staging --title "..." --body "..."
   ```
5. Verifica que los checks de GitHub Actions y SonarCloud Quality Gate pasen exitosamente.
6. Realiza el merge del PR:
   ```bash
   gh pr merge <PR_NUMBER> --merge
   ```
7. Regresa a `main` localmente y haz pull (`git pull origin main`) para mantener sincronizado tu entorno de trabajo.
