# GEMINI.md — Contex360 Frontend

## Reglas del Agente

Lee y aplica **obligatoriamente** las reglas específicas antes de cualquier cambio:

- **Reglas del proyecto (proceso, Sonar, Lighthouse, Wompi, OCR, Git):**
  Lee [.claude/project-rules.md](.claude/project-rules.md)

- **Reglas de UI/UX, diseño y rendimiento:**
  Lee [.claude/frontend-rules.md](.claude/frontend-rules.md)

- **Seguridad, secretos y políticas Git:**
  Lee [.claude/git-security-rules.md](.claude/git-security-rules.md)

---

## Descripción del Proyecto

**Contex360** es un sistema ERP inteligente SaaS multi-tenant para empresas colombianas con los siguientes módulos:

- **Facturación Electrónica DIAN:** Integración certificada, CUFE, firma digital.
- **Inventario y Productos:** Catálogo, stock, almacén multi-bodega.
- **Ventas, Compras y Cotizaciones:** Ciclo completo de documentos comerciales.
- **Terceros:** Directorio de clientes, proveedores y contactos.
- **Finanzas y Contabilidad:** Tesorería y libros contables automáticos.
- **Asistente de IA:** Integración con modelos generativos (Gemini/Groq).
- **OCR:** Reconocimiento y extracción de datos desde documentos. Solo usar endpoints `/ocr/*`.

---

## Stack Técnico

- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Vue Test Utils + jsdom
- **Deployment:** Vercel
- **Quality:** SonarCloud

---

## Comandos Clave

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Previsualizar build
npm run test         # Tests unitarios (una vez)
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura de tests
npm run lint         # Verificar ESLint
npm run lint:fix     # Corregir ESLint automáticamente
npx vue-tsc --noEmit # Verificar tipos TypeScript
```

---

## Estructura del Proyecto

```
src/
  components/     # Componentes UI reutilizables
  views/          # Vistas de página (rutas)
  stores/         # Estado global (Pinia)
  services/       # Clientes API y HTTP
  router/         # Configuración Vue Router
  composables/    # Lógica reactiva reutilizable
  types/          # Tipos TypeScript
  schemas/        # Esquemas Zod
  utils/          # Funciones auxiliares
  assets/         # Estilos globales (styles.css)
```
