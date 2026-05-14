# REGLAS CRÍTICAS PARA CONTEX360

1. **Prohibido el "Full Override"**: 
   - Al editar archivos de más de 500 líneas (ej. `stateStore.ts`, `UsersView.vue`, `AuthScreen.vue`), **SOLO** modificar la función o etiqueta específica. No reescribir el archivo completo.

2. **Uso estricto de Shadcn/UI**:
   - No crear componentes de formulario desde cero.
   - Usar los existentes en `src/components/ui/`.
   - Aplicar estilos mediante el helper `cn()`.

3. **Consistencia de Color**:
   - Usar exclusivamente variables CSS (`var(--bg)`, `var(--primary)`).
   - O clases Tailwind mapeadas (`bg-[#0B0F1A]`, `text-slate-400`).

4. **Patrón de API**:
   - Todas las llamadas al servidor deben pasar por `businessApi.ts` o `authApi.ts`.
   - Usar siempre el wrapper `request()`.
   - **PROHIBIDO**: `fetch` directo o `axios` en componentes.

5. **Navegación**:
   - No usar `router-link`.
   - La navegación es interna: `stateStore.setActiveView('viewId')`.
