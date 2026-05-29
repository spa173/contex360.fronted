# CLAUDE.md - Contex360 Frontend

## 🤖 Directrices del Agente (Claude Code & Antigravity)

Para cualquier tarea de desarrollo, refactorización, depuración o commit, debes leer y cumplir estrictamente las reglas locales ubicadas en el directorio `.claude/`:
*   **Reglas Frontend, UX/UI, CSS y Rendimiento:** Lee y aplica obligatoriamente [.claude/frontend-rules.md](file:///c:/Users/camilo/Desktop/contex360.fronted/.claude/frontend-rules.md) para todos los desarrollos de Vue 3, TailwindCSS, optimizaciones de LCP/CLS, y accesibilidad.
*   **Seguridad, Exclusiones y Git:** Lee y aplica obligatoriamente [.claude/git-security-rules.md](file:///c:/Users/camilo/Desktop/contex360.fronted/.claude/git-security-rules.md) para políticas de ignorado, protección de secretos y tokens, y validaciones previas a commits/push.

---

## 📝 Descripción del Proyecto
**Contex360** es un sistema ERP inteligente diseñado a medida para empresas en Colombia. Ofrece una plataforma integral SaaS multi-inquilino (multi-tenant) con los siguientes módulos de negocio:
*   **Facturación Electrónica DIAN:** Integración para firmas de facturas electrónicas y cobros bajo la normativa colombiana.
*   **Inventario y Productos:** Gestión del catálogo de productos, control de stock y almacén.
*   **Ventas, Compras y Cotizaciones:** Procesamiento de compras, generación de facturas y cotizaciones.
*   **Terceros:** Directorio unificado de clientes, proveedores y contactos comerciales.
*   **Finanzas y Contabilidad:** Módulo de tesorería y libros contables (ledger).
*   **Asistente de IA:** Integraciones inteligentes basadas en modelos de IA generativa (Gemini/Groq).

El **Frontend** está diseñado para ser responsivo, rápido y proveer un Dashboard intuitivo (ERP Shell) para que los usuarios gestionen su negocio a nivel administrativo y operativo, además de pantallas públicas de suscripción, precios, login y demo.

---

## 🛠️ Tech Stack
*   **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
*   **Build Tool:** Vite
*   **State Management:** Pinia
*   **Routing:** Vue Router
*   **Styling:** Tailwind CSS (configurado en `tailwind.config.js`)
*   **Testing:** Vitest + Vue Test Utils + jsdom
*   **Deployment:** Vercel

---

## 🚀 Comandos Clave
*   **Instalación:** `npm install`
*   **Desarrollo:** `npm run dev` (Inicia servidor de desarrollo Vite)
*   **Build (Producción):** `npm run build` (Genera sitemap y compila)
*   **Previsualización de build:** `npm run preview`
*   **Pruebas unitarias:** 
    *   Ejecutar una vez: `npm run test`
    *   Modo watch: `npm run test:watch`
    *   Cobertura: `npm run test:coverage`
*   **Linter (ESLint):**
    *   Verificar: `npm run lint`
    *   Corregir automáticamente: `npm run lint:fix`
*   **Generar sitemap:** `node scripts/generate-sitemap.cjs`

---

## 📁 Estructura del Proyecto
*   `src/components/`: Componentes UI reutilizables.
*   `src/views/`: Vistas de página principales asociadas a rutas.
*   `src/stores/`: Gestión de estado con Pinia.
*   `src/services/`: Clientes API y peticiones HTTP.
*   `src/router/`: Configuración de rutas de Vue Router.
*   `src/composables/`: Lógica reactiva reutilizable (Composables).
*   `src/types/` & `src/schemas/`: Tipos de TypeScript y esquemas Zod.
*   `src/utils/`: Funciones auxiliares genéricas.
