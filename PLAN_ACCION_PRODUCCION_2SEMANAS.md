# 🚀 PLAN DE ACCIÓN - 2 SEMANAS A PRODUCCIÓN

**Objetivo:** Pasar del 65% al 95% de readiness para producción  
**Duración:** 2 semanas (10 días hábiles)  
**Equipo recomendado:** 1-2 developers senior  
**Total horas estimadas:** ~54 horas  

---

## 📅 SEMANA 1: BLOQUEADORES CRÍTICOS

### LUNES - DÍA 1

#### **MAÑANA (4 horas)**

**🎯 TAREA 1: Configurar Variables de Entorno (30 minutos)**
```bash
RESPONSABLE: [Nombre]
TIEMPO: 30 min
ESTADO: [ ] Completado

1. Ir a: https://vercel.com/dashboard → tu proyecto → Settings
2. Environment Variables
3. Agregar:
   VITE_API_BASE_URL=https://api.contex360.com
   (O la URL de tu backend en producción)
4. Redeploy el proyecto
5. Verificar que la app carga sin errores
```

**ENTREGABLE:** ✅ App funciona con backend

---

**🎯 TAREA 2: Integrar Sentry (30 minutos)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 30 min
ESTADO: [ ] Completado

1. Ir a sentry.io → Crear cuenta/proyecto
2. Instalar:
   npm install @sentry/vue @sentry/tracing
   
3. En src/main.ts - Agregar DESPUÉS de createApp:

import * as Sentry from "@sentry/vue";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://xxxx@xxxx.ingest.sentry.io/xxxx",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  release: "1.0.0",
});

app.use(Sentry.createTracingIntegrations());
app.mount('#app');

4. npm run build && npm run preview
5. Verificar en Sentry dashboard que recibe eventos
```

**ENTREGABLE:** ✅ Sentry capturando errores

---

**🎯 TAREA 3: Implementar Error Boundary Global (2 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 2 horas
ESTADO: [ ] Completado

1. Crear archivo: src/components/ErrorBoundary.vue

<script setup lang="ts">
import { onErrorCaptured } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((error, instance, info) => {
  hasError.value = true;
  errorMessage.value = error instanceof Error 
    ? error.message 
    : 'Unknown error occurred';
  
  console.error('Error captured:', error, info);
  
  // NO lanzar el error más arriba
  return false;
});

const retry = () => {
  hasError.value = false;
  location.reload();
};
</script>

<template>
  <div v-if="hasError" class="error-container">
    <div class="error-box">
      <h2>❌ Algo salió mal</h2>
      <p>{{ errorMessage }}</p>
      <button @click="retry">Reintentar</button>
    </div>
  </div>
  <template v-else>
    <slot />
  </template>
</template>

2. En src/App.vue - Envolver:
   <ErrorBoundary>
     <RouterView />
   </ErrorBoundary>

3. Agregar en router/index.ts - error handler:

router.onError((error) => {
  console.error('Router error:', error);
  // Sentry va a capturar automáticamente
});

4. En apiClient - agregar try-catch global

5. npm run build && verificar que no hay errores
```

**ENTREGABLE:** ✅ Errores capturados elegantemente

---

#### **TARDE (4 horas)**

**🎯 TAREA 4: Tests unitarios - authStore (3 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 3 horas
ESTADO: [ ] Completado

1. Crear: src/__tests__/stores/authStore.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Login', () => {
    it('should login user successfully', async () => {
      const store = useAuthStore();
      
      // Mock fetch si es necesario
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'test-token',
            user: { id: 1, email: 'test@test.com' }
          })
        })
      ));

      await store.login('test@test.com', 'password');
      
      expect(store.token).toBe('test-token');
      expect(store.user?.email).toBe('test@test.com');
      expect(store.isAuthenticated).toBe(true);
    });

    it('should handle login error', async () => {
      const store = useAuthStore();
      
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
        })
      ));

      await expect(store.login('test@test.com', 'wrong')).rejects.toThrow();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear auth state on logout', () => {
      const store = useAuthStore();
      store.token = 'test-token';
      store.user = { id: 1, email: 'test@test.com' };
      
      store.logout();
      
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Refresh Token', () => {
    it('should refresh token successfully', async () => {
      const store = useAuthStore();
      
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'new-token' })
        })
      ));

      const result = await store.refreshToken();
      
      expect(result).toBe(true);
      expect(store.token).toBe('new-token');
    });
  });
});

2. npm test
3. Verificar que pasan todos los tests
4. Coverage target: > 80% en authStore
```

**ENTREGABLE:** ✅ 3+ tests pasando

---

**[Terminar día 1 aquí - Descanso]**

---

### MARTES - DÍA 2

#### **MAÑANA (4 horas)**

**🎯 TAREA 5: Tests unitarios - billingStore (3 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 3 horas
ESTADO: [ ] Completado

1. Crear: src/__tests__/stores/billingStore.test.ts

Similar al anterior, pero testear:
- createInvoice()
- updateInvoice()
- deleteInvoice()
- getInvoices()
- applyDiscount()

2. Mínimo 8 tests diferentes casos:
   ✓ Crear factura válida
   ✓ Error al crear sin cantidad
   ✓ Actualizar factura existente
   ✓ Error al actualizar no-existente
   ✓ Eliminar factura
   ✓ No puede eliminar enviada
   ✓ Obtener listado
   ✓ Aplicar descuento

3. npm test
4. Coverage > 75%
```

**ENTREGABLE:** ✅ 8+ tests billingStore

---

#### **TARDE (4 horas)**

**🎯 TAREA 6: Tests componentes críticos - LoginForm (2 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 2 horas
ESTADO: [ ] Completado

1. Crear: src/__tests__/components/LoginForm.test.ts

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm', () => {
  it('renders login form', () => {
    const wrapper = mount(LoginForm);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('submits form with valid data', async () => {
    const wrapper = mount(LoginForm);
    
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    
    await emailInput.setValue('test@test.com');
    await passwordInput.setValue('password123');
    
    const form = wrapper.find('form');
    await form.trigger('submit');
    
    expect(wrapper.emitted('login')).toBeTruthy();
  });

  it('shows error for invalid email', async () => {
    const wrapper = mount(LoginForm);
    
    await wrapper.find('input[type="email"]').setValue('invalid-email');
    await wrapper.find('form').trigger('submit');
    
    expect(wrapper.text()).toContain('Email inválido');
  });

  it('disables submit while loading', async () => {
    const wrapper = mount(LoginForm, {
      props: { loading: true }
    });
    
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
  });
});

2. npm test
3. Mínimo 4 tests
```

**ENTREGABLE:** ✅ 4+ tests LoginForm

---

**🎯 TAREA 7: Tests InvoiceForm (2 horas)**

```bash
Similar al anterior, testear:
- Renderiza campos correctos
- Valida cantidad > 0
- Valida descripción no vacía
- Aplica impuestos correctamente
- Muestra total correcto

Mínimo 5 tests
```

**ENTREGABLE:** ✅ 5+ tests InvoiceForm

---

### MIÉRCOLES - DÍA 3

#### **TODO EL DÍA (8 horas)**

**🎯 TAREA 8: Configurar Timeouts & Validaciones API (8 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 8 horas
ESTADO: [ ] Completado

PARTE 1: Crear API Client con Timeouts (3 horas)

1. Crear: src/services/api.ts

import axios from 'axios';
import Sentry from '@sentry/vue';

const API_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 3;
const RETRY_DELAY = [500, 1000, 2000]; // ms

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
});

// Interceptor de retry
let retryCount = 0;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || retryCount >= MAX_RETRIES) {
      Sentry.captureException(error, {
        tags: { component: 'api-client' }
      });
      throw error;
    }

    retryCount += 1;
    const delay = RETRY_DELAY[retryCount - 1];

    await new Promise(resolve => setTimeout(resolve, delay));

    return apiClient(config).finally(() => {
      retryCount = 0;
    });
  }
);

export default apiClient;

2. Actualizar todos los servicios para usar este cliente

PARTE 2: Agregar Validaciones con Zod (5 horas)

1. Crear: src/schemas/invoice.ts

import { z } from 'zod';

export const InvoiceSchema = z.object({
  id: z.number(),
  number: z.string().min(1),
  customer_id: z.number(),
  amount: z.number().positive('Amount must be positive'),
  tax: z.number().nonnegative(),
  total: z.number(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'CANCELLED']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

2. En billingService.ts:

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const response = await apiClient.get('/invoices');
    const validated = z.array(InvoiceSchema).parse(response.data);
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('API response validation failed', error.errors);
      throw new Error('Invalid API response format');
    }
    throw error;
  }
}

3. Crear esquemas para todos los endpoints críticos:
   - CustomerSchema
   - ProductSchema
   - OrderSchema
   - UserSchema
   - AuthResponseSchema

4. npm test - verificar que todos pasan
```

**ENTREGABLE:** ✅ API client robusto con timeouts y validaciones

---

### JUEVES - DÍA 4

#### **MAÑANA (4 horas)**

**🎯 TAREA 9: Tests E2E - Flujos Críticos (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. npm install -D @playwright/test

2. Crear: tests/e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error on wrong credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    const error = await page.textContent('.error-message');
    expect(error).toContain('Credenciales inválidas');
  });
});

3. Crear: tests/e2e/invoices.spec.ts (flujo crear factura)

test('should create invoice successfully', async ({ page }) => {
  // Login primero
  await loginAs(page, 'test@test.com', 'password123');
  
  // Navegar a facturas
  await page.click('text=Facturación');
  await page.click('button:has-text("Nueva Factura")');
  
  // Llenar formulario
  await page.fill('input[name="customer"]', 'Test Customer');
  await page.fill('input[name="amount"]', '1000');
  await page.click('button:has-text("Guardar")');
  
  // Verificar
  await expect(page.locator('text=Factura creada exitosamente')).toBeVisible();
});

4. npm run test:e2e
5. Debe pasar 5 flujos críticos mínimo
```

**ENTREGABLE:** ✅ Tests E2E de flujos principales

---

#### **TARDE (4 horas)**

**🎯 TAREA 10: Deploy a Staging & Testing (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. npm run build
   ✓ Sin errores
   ✓ Tamaño bundle < 500KB gzipped

2. Desplegar a staging:
   git push origin main
   (GitHub Actions debería desplegar automáticamente)

3. Esperar deploy completado (Vercel)

4. Abrir staging URL y probar:
   ✓ Login funciona
   ✓ Dashboard carga
   ✓ Crear factura funciona
   ✓ Buscar/filtrar funciona
   ✓ Exportar PDF funciona
   ✓ Error handling visible
   ✓ Sin errores en consola

5. Verificar Sentry está recibiendo eventos

6. Ejecutar lighthouse audit:
   npx lighthouse [staging-url] --view
   
   Target:
   ✓ Performance > 90
   ✓ Accessibility > 90
   ✓ Best Practices > 90
   ✓ SEO > 80
```

**ENTREGABLE:** ✅ Staging funcionando, tests pasando

---

## 📅 SEMANA 2: OPERACIONAL

### VIERNES - DÍA 5

#### **MAÑANA (4 horas)**

**🎯 TAREA 11: Load Testing (2 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 2 horas
ESTADO: [ ] Completado

1. Instalar herramienta de load test:
   npm install -D k6
   
   O usar: https://www.artillery.io/

2. Crear script: load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const url = 'https://staging-url.vercel.app';
  
  // Test página login
  const res = http.get(`${url}/login`);
  check(res, {
    'login page status 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test API de facturas
  const apiRes = http.get(`${url}/api/invoices`, {
    headers: { 'X-Token': 'test-token' },
  });
  check(apiRes, {
    'api invoices status 200': (r) => r.status === 200,
  });
}

3. Ejecutar:
   k6 run load-test.js

4. Verificar resultados:
   ✓ P95 latency < 500ms
   ✓ P99 latency < 1000ms
   ✓ Error rate < 1%
```

**ENTREGABLE:** ✅ Load test completado exitosamente

---

**🎯 TAREA 12: Security Audit Básico (2 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 2 horas
ESTADO: [ ] Completado

Checklist de seguridad:

[ ] ✓ HTTPS/SSL habilitado
[ ] ✓ CORS headers correctos
[ ] ✓ CSP headers presentes
[ ] ✓ CSRF token implementado
[ ] ✓ Tokens en httpOnly cookies
[ ] ✓ No hay secrets en código
[ ] ✓ No hay datos sensibles en localStorage
[ ] ✓ Validación input/output
[ ] ✓ Sanitización HTML (DOMPurify)
[ ] ✓ Error messages no exponen detalles técnicos

Verificar con:
npm install -D @types/node owasp-scan

O usar herramienta online: https://www.owasp.org/
```

**ENTREGABLE:** ✅ Security audit completado

---

#### **TARDE (4 horas)**

**🎯 TAREA 13: Documentación & Runbooks (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. Crear: docs/DEPLOYMENT.md

# Deployment Guide

## Pre-requisites
- Node.js 18+
- npm 9+
- Vercel CLI

## Production Checklist
- [ ] VITE_API_BASE_URL configurado
- [ ] Backend API online
- [ ] Database backups enabled
- [ ] Sentry DSN configured
- [ ] HTTPS certificate valid
- [ ] Monitoring alerts setup
- [ ] Runbooks ready

## Deployment Steps
1. npm install
2. npm run build
3. npm run test:coverage
4. npx vercel --prod

## Rollback
If deployment fails:
1. npx vercel rollback
2. Check Sentry for errors
3. Contact on-call team

2. Crear: docs/RUNBOOK.md

# Incident Response Runbook

## Symptoms
- App shows "500 error"
- Users can't login
- Invoices loading slowly

## Diagnosis
1. Check Sentry dashboard → Errors
2. SSH to backend → check logs
3. Database health check
4. API response times

## Recovery
1. Restart API server
2. Clear cache (Vercel)
3. Verify webhook endpoints
4. Full deployment if needed

## Escalation
- L1 (you): Check logs, restart services
- L2 (lead dev): Code hotfix, database
- L3 (CTO): Architecture, major changes

3. Crear: docs/API_REFERENCE.md

# API Reference

## Base URL
https://api.contex360.com

## Authentication
Authorization: Bearer {accessToken}

## Endpoints

### GET /api/invoices
Retrieve list of invoices

Query params:
- limit: number (default: 50)
- offset: number (default: 0)
- status: enum (DRAFT|SENT|PAID)

Response:
{
  "data": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}

...más endpoints

4. Revisar con el team
```

**ENTREGABLE:** ✅ Documentación completa

---

### LUNES - DÍA 6

#### **TODO EL DÍA (8 horas)**

**🎯 TAREA 14: Testing Completo en Staging (8 horas)**

```bash
RESPONSABLE: Equipo QA + Dev
TIEMPO: 8 horas
ESTADO: [ ] Completado

Testing checklist exhaustivo:

Autenticación:
[ ] ✓ Login con email/password
[ ] ✓ Login con OAuth (si aplica)
[ ] ✓ Logout limpia estado
[ ] ✓ Refresh token automático
[ ] ✓ Reset password flow
[ ] ✓ 2FA si está implementado

Facturación:
[ ] ✓ Crear factura
[ ] ✓ Editar factura
[ ] ✓ Eliminar factura
[ ] ✓ Cambiar estado (DRAFT → SENT → PAID)
[ ] ✓ Aplicar descuentos
[ ] ✓ Validar impuestos
[ ] ✓ Buscar por cliente
[ ] ✓ Exportar PDF
[ ] ✓ Exportar Excel

Inventario:
[ ] ✓ Crear producto
[ ] ✓ Editar precio
[ ] ✓ Stock updates
[ ] ✓ Validación stock en factura

Performance:
[ ] ✓ Dashboard carga < 2s
[ ] ✓ Tabla 100+ registros smooth
[ ] ✓ Búsqueda responde < 500ms
[ ] ✓ Exportación < 5s

Errores:
[ ] ✓ Backend down → muestra error
[ ] ✓ Network error → muestra retry
[ ] ✓ Invalid data → validación local
[ ] ✓ Session expired → login requerido
[ ] ✓ Permisos insuficientes → error claro

Responsive:
[ ] ✓ Desktop (1920px) - OK
[ ] ✓ Tablet (768px) - OK  
[ ] ✓ Mobile (375px) - OK

Seguridad:
[ ] ✓ No hay tokens en URL
[ ] ✓ Contraseña enmascarada
[ ] ✓ CSRF token enviado
[ ] ✓ XSS payload sanitizado

Documentar cualquier issue encontrado
```

**ENTREGABLE:** ✅ Staging completamente testeado, bugs documentados

---

### MARTES - DÍA 7

#### **MAÑANA (4 horas)**

**🎯 TAREA 15: Verificación CORS & Backend Integration (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. Verificar CORS headers en backend:

Backend debe retornar:
Access-Control-Allow-Origin: https://app.contex360.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token

2. Probar en browser:
   curl -H "Origin: https://app.contex360.com" \
     -H "Access-Control-Request-Method: POST" \
     https://api.contex360.com/api/invoices -v

3. Verificar credentials si se usan cookies:
   fetch('https://api.contex360.com/api/invoices', {
     credentials: 'include'
   })

4. Test con POSTMAN/Thunder Client todos los endpoints

5. Documentar cualquier discrepancia
```

**ENTREGABLE:** ✅ CORS correctamente configurado

---

#### **TARDE (4 horas)**

**🎯 TAREA 16: Setup Monitoring & Alertas (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. Sentry Dashboard - Configurar alertas:
   Settings → Alerts → Create Alert Rule
   
   Cuando:
   - Error rate > 1% en última hora
   - New error introducido
   - Release deployment

   Notificar a:
   - Slack channel #contex360-alerts
   - Email on-call

2. Vercel Monitoring:
   Dashboard → Settings → Monitoring
   
   Habilitar:
   - Function logs
   - Error reporting
   - Performance metrics

3. Health Check Endpoint:
   Crear en backend (si no existe):
   
   GET /api/health
   
   Response:
   {
     "ok": true,
     "version": "1.0.0",
     "timestamp": "2026-05-22T10:00:00Z"
   }

4. Frontend health check:
   Implementar en App.vue
   
   const checkHealth = async () => {
     try {
       const res = await fetch('/api/health');
       if (!res.ok) showWarning('Backend unreachable');
     } catch {
       showWarning('No internet connection');
     }
   };
   
   // Ejecutar cada 5 minutos
   setInterval(checkHealth, 5 * 60 * 1000);

5. Crear dashboard en Sentry:
   Overview → + Create Dashboard
   
   Widgets:
   - Error count over time
   - Top 5 errors
   - User feedback
   - Performance metrics
```

**ENTREGABLE:** ✅ Monitoring completamente setup

---

### MIÉRCOLES - DÍA 8

#### **TODO EL DÍA (8 horas)**

**🎯 TAREA 17: Final Security Review & Optimizations (8 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 8 horas
ESTADO: [ ] Completado

PARTE 1: Security Audit Profundo (4 horas)

Usar herramientas:
1. npm install -D @snyk/cli
   snyk test
   
2. npm install -D npm-audit-resolver
   npm audit
   
3. Online tools:
   - https://www.owasp.org/www-project-top-ten/
   - https://securityheaders.com/

Checklist:
[ ] ✓ No hay secrets en .env
[ ] ✓ API keys rotados
[ ] ✓ SSL/TLS certificado válido
[ ] ✓ Rate limiting backend
[ ] ✓ Input validation en todas partes
[ ] ✓ Output encoding correcto
[ ] ✓ Authentication stateless (tokens)
[ ] ✓ Authorization checks en backend
[ ] ✓ Sensitive data logging disabled
[ ] ✓ Dependencies up to date

PARTE 2: Performance Optimizations (4 horas)

1. Bundle Analysis:
   npm install -D webpack-bundle-analyzer
   
   Verificar:
   - Cada chunk < 100KB
   - Vendor bundle < 200KB
   - Main bundle < 150KB

2. Code splitting optimization:
   Routes lazy loaded
   Heavy components lazy loaded

3. Image optimization:
   - Usar WebP where possible
   - Resize images
   - Compress SVG

4. Network optimizations:
   - Gzip compression enabled
   - HTTP/2 push enabled
   - Preload critical resources

Comando final:
npm run build && npm run preview
```

**ENTREGABLE:** ✅ Security audit + Performance optimization completado

---

### JUEVES - DÍA 9

#### **MAÑANA (4 horas)**

**🎯 TAREA 18: Rollback Plan & On-Call Setup (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

1. Documentar rollback procedure:

## Rollback Procedure

Trigger: If deployment fails or major issue detected

Steps:
1. On-call engineer gets paged
2. SSH to Vercel dashboard
3. Click Deployments → [broken deployment] → Rollback
4. Wait for deployment to complete
5. Verify app is working
6. Post incident to Slack
7. Schedule postmortem within 24h

2. On-call rotation setup:

Crear spreadsheet/tool:
- Week 1: Dev A, Dev B (backup)
- Week 2: Dev C, Dev D (backup)
- etc

Responsibilities:
- First responder for production issues
- Pager alerts 24/7
- Max response time: 15 minutes
- Run post-incident review

3. Escalation contacts:

Level 1 (On-call): [Phone]
Level 2 (Tech Lead): [Phone]
Level 3 (CTO): [Phone]

Slack channel: #contex360-incidents

4. Incident post-mortem template:

Title: [Incident description]
Duration: [Start - End time]
Severity: P1 (critical) | P2 (major) | P3 (minor)
Root cause: [What happened]
Impact: [How many users, duration]
Action items:
- [ ] Fix code issue
- [ ] Add monitoring
- [ ] Update runbook
Timeline:
- [Time] First alert
- [Time] Root cause identified
- [Time] Fix deployed
- [Time] Monitoring verified
```

**ENTREGABLE:** ✅ Rollback plan y on-call setup completado

---

#### **TARDE (4 horas)**

**🎯 TAREA 19: Final Production Checklist (4 horas)**

```bash
RESPONSABLE: [Nombre]
TIEMPO: 4 horas
ESTADO: [ ] Completado

ANTES DE LANZAR A PRODUCCIÓN:

Configuración:
[ ] ✓ VITE_API_BASE_URL = production URL
[ ] ✓ Sentry DSN = production DSN
[ ] ✓ Environment = production
[ ] ✓ API timeout configurado
[ ] ✓ Retry logic implementado
[ ] ✓ Error boundaries en lugar
[ ] ✓ Health check funcionando

Testing:
[ ] ✓ npm test todos pasan (mínimo 20 tests)
[ ] ✓ npm run build sin errores
[ ] ✓ npm run lint sin errores críticos
[ ] ✓ Load test completado (100 vus)
[ ] ✓ E2E tests en staging pasaron
[ ] ✓ Lighthouse score > 90

Seguridad:
[ ] ✓ Security audit completado
[ ] ✓ Dependencies sin vulnerabilidades
[ ] ✓ Secrets en Vercel, no en código
[ ] ✓ SSL certificate válido
[ ] ✓ CORS headers correctos
[ ] ✓ CSP headers presentes
[ ] ✓ Penetration testing (si required)

Operacional:
[ ] ✓ Sentry setup y alertas configuradas
[ ] ✓ Monitoring dashboard creado
[ ] ✓ Runbook documentado
[ ] ✓ Rollback plan documentado
[ ] ✓ On-call rotation setup
[ ] ✓ Incident response plan listo
[ ] ✓ Documentación completa

Performance:
[ ] ✓ Bundle size optimizado
[ ] ✓ Code splitting implementado
[ ] ✓ Lazy loading configurado
[ ] ✓ Cache headers correctos
[ ] ✓ CDN distribution (Vercel)

Backend Integration:
[ ] ✓ API endpoints verificados
[ ] ✓ Database connection OK
[ ] ✓ Authentication flow OK
[ ] ✓ Authorization checks OK

Comunicación:
[ ] ✓ Team informed de go-live
[ ] ✓ Support team entrenado
[ ] ✓ Status page preparado
[ ] ✓ Communication plan ready
[ ] ✓ Stakeholders notificados
```

**ENTREGABLE:** ✅ 100% checklist completado

---

### VIERNES - DÍA 10

#### **TODO EL DÍA (8 horas)**

**🎯 TAREA 20: DEPLOY A PRODUCCIÓN (8 horas)**

```bash
RESPONSABLE: Tech Lead + Senior Dev
TIEMPO: 8 horas
ESTADO: [ ] Completado

TIMELINE:

10:00 - PRE-DEPLOY CHECK (1 hora)
[ ] ✓ All staging tests passed
[ ] ✓ Backend is healthy
[ ] ✓ Database backups completed
[ ] ✓ Sentry is configured
[ ] ✓ Monitoring alerts active
[ ] ✓ On-call engineer standing by

10:00-10:30 - COMMUNICATION
[ ] ✓ Announce deployment in Slack
[ ] ✓ Update status page → "Deploying"
[ ] ✓ Notify stakeholders

10:30-11:00 - PRODUCTION DEPLOYMENT
Commands:
git checkout main
git pull origin main
npm install
npm run build
npm test
npx vercel --prod --token [token]

Monitor Vercel dashboard for:
- Build progress
- Deployment completion
- No errors in logs

11:00-11:15 - POST-DEPLOY VERIFICATION
[ ] ✓ App loads in production
[ ] ✓ Login works
[ ] ✓ Dashboard visible
[ ] ✓ No errors in Sentry
[ ] ✓ Performance metrics normal
[ ] ✓ Database queries fast

11:15-12:00 - SMOKE TESTING
Equipo QA testa:
[ ] ✓ User login
[ ] ✓ Create invoice
[ ] ✓ Search & filter
[ ] ✓ Export PDF
[ ] ✓ Edit permissions
[ ] ✓ Mobile responsive

12:00-12:15 - SUCCESS COMMUNICATION
[ ] ✓ Update status page → "Operational"
[ ] ✓ Announce success in Slack
[ ] ✓ Thank the team
[ ] ✓ Message sent to users

POST-DEPLOYMENT (First 24h)
[ ] ✓ Monitor error rate hourly
[ ] ✓ Watch Sentry for new issues
[ ] ✓ Check performance metrics
[ ] ✓ Respond to user issues quickly
[ ] ✓ On-call engineer monitoring 24/7

DONE! 🎉
```

**ENTREGABLE:** ✅ CONTEX360 EN PRODUCCIÓN

---

## 📊 RESUMEN DE SEMANAS

| Semana | Objetivo | Status |
|--------|----------|--------|
| **1** | Bloqueadores críticos | ⏳ IN PROGRESS |
| **2** | Operacional listo | ⏳ PENDING |
| **Deploy** | Go-live | ⏳ PENDING |

---

## 📞 SUPPORT

**Si hay blockers:**
1. Reportar en Slack #contex360-dev
2. Schedule sync call
3. Escalar si es P0 blocker

**Estimado total:** 54 horas ÷ 2 devs = 27 horas cada uno = 1.35 semanas si es full-time

---

**Documento:** 22 de Mayo 2026  
**Versión:** 1.0 - Ready for Execution  
**Estado:** ✅ PLAN DETAILED & ACTIONABLE
