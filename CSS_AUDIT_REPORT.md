# Reporte de Auditoría CSS - styles.css
## Objetivo: Migrar a clases Tailwind puras

### Resumen General
- **Archivo actual:** `src/assets/styles.css` (2,525 líneas)
- **Variables CSS en :root:** 46 variables definidas
- **Clases CSS totales:** ~200+ clases estimadas
- **Objetivo:** Reducir a ~200-300 líneas (solo variables base + utilidades específicas)

---

## 1. VARIABLES CSS DUPLICADAS (Eliminar o Consolidar)

### Variables que ya están mapeadas en Tailwind config:

| Variable CSS | Valor Actual | Equivalente Tailwind | Acción |
|--------------|--------------|---------------------|--------|
| `--bg` | `#0B0F1A` | `bg-[#0B0F1A]` o `bg-background` | ✅ Mantener (base) |
| `--bg-secondary` | `#131926` | `bg-[#131926]` o `bg-card` | ✅ Mantener (base) |
| `--primary` | `#10B981` | `bg-primary`, `text-primary` | ✅ Mantener (base) |
| `--text` | `#F8FAFC` | `text-slate-50` | ✅ Mantener (base) |
| `--text-secondary` | `#94A3B8` | `text-slate-400` | ✅ Mantener (base) |
| `--text-muted` | `#64748B` | `text-slate-500` | ✅ Mantener (base) |
| `--border` | `rgba(148,163,184,0.12)` | `border-slate-800/50` | ✅ Mantener (base) |
| `--success` | `#10B981` | `text-emerald-500` | ❌ ELIMINAR - Duplicado |
| `--warning` | `#F59E0B` | `text-amber-500` | ❌ ELIMINAR - Duplicado |
| `--error` | `#EF4444` | `text-rose-500` | ❌ ELIMINAR - Duplicado |
| `--emerald-50` | `rgba(16,185,129,0.05)` | `bg-emerald-500/5` | ❌ ELIMINAR - Duplicado |
| `--emerald-100` | `rgba(16,185,129,0.10)` | `bg-emerald-500/10` | ❌ ELIMINAR - Duplicado |
| `--emerald-200` | `rgba(16,185,129,0.20)` | `bg-emerald-500/20` | ❌ ELIMINAR - Duplicado |
| `--emerald-500` | `#10B981` | `bg-emerald-500` | ❌ ELIMINAR - Duplicado |
| `--emerald-600` | `#059669` | `bg-emerald-600` | ❌ ELIMINAR - Duplicado |

**Recomendación:** Eliminar 10 variables duplicadas. Mantener solo las 6 variables base esenciales.

---

## 2. CLASSES REEMPLAZABLES POR TAILWIND (Alta Prioridad)

### 2.1 Backgrounds y Superficies

```css
/* ❌ ELIMINAR estas clases - Reemplazar con Tailwind */

.sidebar, .panel-card, .hero, .topbar {
  backdrop-filter: blur(16px);              → backdrop-blur-md
  background: var(--surface);               → bg-[#131926] o bg-card
  border: 1px solid var(--border);          → border border-slate-800/50
  box-shadow: var(--shadow);                → shadow-lg
}

.card-subsection {
  background: rgba(35, 35, 35, 0.9);        → bg-[#232323]/90
  border: 1px solid var(--border);          → border border-slate-800/50
  border-radius: 18px;                      → rounded-[18px] o rounded-2xl
  padding: 18px;                            → p-4.5
}

.invoice-line {
  background: rgba(27, 27, 27, 0.85);     → bg-[#1b1b1b]/85
  border: 1px solid var(--border);          → border border-slate-800/50
  border-radius: 18px;                      → rounded-2xl
  padding: 16px;                            → p-4
}

.summary-row, .mini-row, .timeline-item,
.activity-item, .movement-item, .ocr-field,
.suggestion-card, .entry-card, .invoice-card,
.module-row, .alert-row {
  background: rgba(38, 38, 38, 0.9);        → bg-[#262626]/90
  border: 1px solid var(--border);          → border border-slate-800/50
  border-radius: 18px;                      → rounded-2xl
  padding: 14px 16px;                       → px-4 py-3.5
}
```

**Sustitución Tailwind:**
```html
<!-- Antes -->
<div class="invoice-card">

<!-- Después -->
<div class="bg-[#262626]/90 border border-slate-800/50 rounded-2xl px-4 py-3.5">
```

### 2.2 Textos y Colores

```css
/* ❌ ELIMINAR - Usar clases Tailwind directamente */

.eyebrow {
  color: var(--accent);                      → text-emerald-500
  font-size: 0.78rem;                        → text-xs
  letter-spacing: 0.16em;                    → tracking-[0.16em]
  text-transform: uppercase;                 → uppercase
}

.label-soft {
  color: var(--muted);                       → text-slate-500
}

.muted-copy {
  color: var(--muted);                       → text-slate-500
  line-height: 1.65;                         → leading-relaxed
}

.empty-state {
  color: var(--muted);                       → text-slate-500
  line-height: 1.65;                         → leading-relaxed
}
```

**Sustitución:**
```html
<!-- Antes -->
<p class="eyebrow">Título</p>

<!-- Después -->
<p class="text-xs text-emerald-500 uppercase tracking-[0.16em]">
```

### 2.3 Status Badges (MIGRAR a componente Badge de Shadcn)

```css
/* ❌ ELIMINAR - Usar componente Badge con variants */

.status-badge {
  border: 1px solid rgba(255,255,255,0.12); → border border-white/10
  border-radius: 999px;                      → rounded-full
  font-size: 0.82rem;                        → text-xs
  padding: 6px 10px;                         → px-2.5 py-1.5
}

.status-accepted, .status-acceptada {
  background: rgba(106, 221, 156, 0.14);     → bg-emerald-400/15
  color: var(--success);                     → text-emerald-500
}

.status-rechazada, .status-danger {
  background: rgba(255, 118, 102, 0.14);     → bg-rose-400/15
  color: var(--danger);                      → text-rose-500
}

.status-contingencia, .status-borrador {
  background: rgba(55, 55, 55, 0.8);         → bg-slate-700/80
  color: var(--muted);                       → text-slate-500
}
```

**Sustitución con Shadcn Badge:**
```vue
<!-- Antes -->
<span class="status-badge status-accepted">Aceptada</span>

<!-- Después -->
<Badge variant="default" class="bg-emerald-500/15 text-emerald-500">
  Aceptada
</Badge>
```

### 2.4 Botones (MIGRAR a componente Button de Shadcn)

```css
/* ❌ ELIMINAR - Usar componente Button con variants */

.nav-link {
  background: transparent;                    → bg-transparent
  border: 1px solid transparent;              → border border-transparent
  border-radius: 16px;                        → rounded-2xl
  color: var(--text);                         → text-slate-50
  padding: 14px 16px;                         → px-4 py-3.5
}

.nav-link:hover, .nav-link.active {
  background: rgba(59, 130, 246, 0.12);       → bg-blue-500/10
  border-color: rgba(59, 130, 246, 0.35);     → border-blue-500/35
  color: #F8FAFC;                             → text-slate-50
}

.auth-primary-button {
  background: linear-gradient(135deg, var(--accent), var(--teal));
                                              → bg-gradient-to-br from-emerald-500 to-teal-500
  border-radius: 14px;                        → rounded-xl
  min-height: 56px;                           → h-14
}
```

---

## 3. CLASSES DE LAYOUT (Mantener por ahora)

Estas clases son estructurales y no tienen equivalente directo en Tailwind:

```css
/* ✅ MANTENER - Layout específico de la app */

.app-shell {
  display: grid;
  gap: 24px;
  grid-template-columns: 290px minmax(0, 1fr);
  max-width: 1600px;
}

.main-panel {
  display: grid;
  gap: 24px;
}

/* Grid específicos */
.metrics-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
```

---

## 4. TEMA LIGHT (Simplificar)

```css
/* ❌ SIMPLIFICAR - Reducir a variables esenciales */

html.light {
  --bg: #F8FAFC;                           → Mantener
  --text: #0F172A;                         → Mantener
  --primary: #2563EB;                      → Mantener
  /* Eliminar el resto - usar Tailwind directamente */
}

/* Eliminar todas las clases específicas de light mode:
   html.light .app .sidebar
   html.light .main.main-panel
   html.light .topbar
   html.light .metric-card
   ... etc
*/
```

**Alternativa:** Usar la clase `dark:` de Tailwind en los componentes en lugar de sobrescribir con CSS.

---

## 5. ANÁLISIS DE USO DE VARIABLES OBSOLETAS

### Variables que parecen NO usarse en el código:

| Variable | ¿Usada? | Búsqueda recomendada |
|----------|---------|---------------------|
| `--color-text-primary` | ❓ | Buscar `var(--color-text-primary)` |
| `--color-text-secondary` | ❓ | Buscar `var(--color-text-secondary)` |
| `--color-text-muted` | ❓ | Buscar `var(--color-text-muted)` |
| `--color-background-primary` | ❓ | Buscar `var(--color-background-primary)` |
| `--color-border-secondary` | ❓ | Buscar `var(--color-border-secondary)` |
| `--color-border-tertiary` | ❓ | Buscar `var(--color-border-tertiary)` |
| `--teal` | ❓ | Buscar `var(--teal)` |
| `--danger` | ✅ | Usada en `.status-rechazada` |

---

## 6. PLAN DE MIGRACIÓN RECOMENDADO

### Fase 1: Eliminar variables duplicadas (Día 1)
```bash
# Eliminar:
--success, --warning, --error
--emerald-50, --emerald-100, --emerald-200, --emerald-500, --emerald-600
```

### Fase 2: Migrar Status Badges (Día 2-3)
- Reemplazar todas las clases `.status-*` con componente `Badge` de Shadcn
- Buscar: `grep -r "status-badge\|status-accepted\|status-rechazada" src/`

### Fase 3: Migrar Textos (Día 4)
- Reemplazar `.eyebrow`, `.label-soft`, `.muted-copy`
- Buscar: `grep -r "eyebrow\|label-soft\|muted-copy" src/`

### Fase 4: Migrar Cards y Surfaces (Día 5-7)
- Reemplazar `.card-subsection`, `.invoice-line`, `.summary-row`, etc.
- Usar clases Tailwind: `bg-[#131926]`, `border-slate-800/50`, `rounded-xl`

### Fase 5: Simplificar Tema Light (Día 8)
- Reducir `html.light` a 3-4 variables esenciales
- Mover estilos específicos a clases `dark:` en componentes

---

## 7. ESTIMACIÓN DE REDUCCIÓN

| Métrica | Actual | Estimado Post-Migración |
|---------|--------|------------------------|
| Líneas totales | 2,525 | ~300-400 |
| Variables CSS | 46 | ~15 |
| Clases definidas | ~200+ | ~30 (solo layout) |
| Tamaño archivo | ~80KB | ~10-15KB |

---

## 8. COMANDOS GREP ÚTILES PARA LA MIGRACIÓN

```bash
# Buscar uso de clases CSS específicas
grep -r "status-badge" src/
grep -r "eyebrow" src/
grep -r "label-soft" src/
grep -r "card-subsection" src/
grep -r "invoice-line" src/

# Buscar uso de variables CSS
grep -r "var(--success)" src/
grep -r "var(--warning)" src/
grep -r "var(--error)" src/
grep -r "var(--emerald-" src/
```

---

## Conclusión

**Prioridad alta:**
1. Eliminar variables duplicadas `--success`, `--warning`, `--error`, `--emerald-*`
2. Migrar `.status-badge` → Componente Badge de Shadcn
3. Migrar `.eyebrow`, `.label-soft` → Clases Tailwind directas

**Prioridad media:**
4. Migrar cards y superficies → `bg-[#131926] border-slate-800/50`
5. Simplificar tema light

**Prioridad baja:**
6. Limpiar variables no usadas (requiere análisis de uso)

**Resultado esperado:** Reducir `styles.css` de 2,525 líneas a ~300-400 líneas (reducción del ~85%).
