# Contex360 Vue

ERP multiempresa para Colombia construido con Vue 3, Vite, Pinia y un backend NestJS.

La aplicacion cubre:

- autenticacion real contra backend
- roles y membresias por empresa
- facturacion con inventario y timeline DIAN
- asientos contables y auditoria
- OCR de soportes y sugerencias basicas

## Estado Actual

El acceso ya no depende del flujo demo. El login pasa por `backend/` y el frontend conserva parte del estado de negocio local mientras migramos dominios al backend.

## Stack

- Vue 3 con `<script setup>`
- Pinia para estado global
- Vite para desarrollo y build
- NestJS para el backend
- Prisma + PostgreSQL para persistencia
- Vitest + jsdom para pruebas

## Comandos

```bash
npm install
npm run dev
npm run build
npm test
npm run test:watch
```

Backend:

```bash
cd backend
npm install
npm run db:setup
npm run db:migrate
# Cuando necesites recrear la base local con datos limpios:
npm run db:reset
npm run db:seed
npm run start:dev
```

## Flujos Cubiertos

- autenticacion con backend
- cambio de tenant segun membresias
- factura con validacion agregada de stock
- descuento de inventario y movimiento kardex
- generacion de asiento contable
- trazabilidad y eventos DIAN asincronos
- OCR basico con extraccion de campos

## Integracion Bancolombia En Produccion

La integracion bancaria ya no debe vivir en `localStorage` ni exponer secretos en el navegador. El frontend ahora espera un backend que maneje el flujo por tenant y conserve las credenciales en servidor o vault.

Contrato esperado:

- `GET /integrations/bancolombia/config`
- `POST /integrations/bancolombia/config`
- `POST /integrations/bancolombia/connect`
- `POST /integrations/bancolombia/disconnect`
- `POST /integrations/bancolombia/sync`

Reglas:

- el `client secret` nunca se renderiza en la UI
- la app solo envía `accountNumber`, `accountType`, `clientId`, `integrationMode`, `environment` y `statementFormat`
- el backend debe responder con el estado real de conexión y la `lastSyncAt`
- el OAuth / consentimiento debe abrirse desde el servidor, no desde el cliente

## Pruebas

La suite cubre los flujos mas delicados del store principal y la integracion UI-store:

- login con persistencia de sesion
- validacion de stock agregado por producto
- eventos DIAN atados al tenant correcto
- cancelacion de timers DIAN al reiniciar el estado
- cambio de tenant y ajuste de vista activa
- creacion de usuarios con hash y membresia
- activacion por asignacion de rol
- OCR y seleccion del analisis generado

Tambien hay pruebas de componentes para validar el acceso, facturacion y usuarios.

Archivos principales:

- [src/stores/stateStore.test.ts](/C:/Users/camilo/contex360-vue/src/stores/stateStore.test.ts)
- [src/components/componentFlows.test.ts](/C:/Users/camilo/contex360-vue/src/components/componentFlows.test.ts)
- [backend/src/modules/auth/auth.service.test.ts](/C:/Users/camilo/contex360-vue/backend/src/modules/auth/auth.service.test.ts)

## Estructura Util

- [src/stores/stateStore.ts](/C:/Users/camilo/contex360-vue/src/stores/stateStore.ts): reglas principales de negocio
- [src/stores/stateSecurity.ts](/C:/Users/camilo/contex360-vue/src/stores/stateSecurity.ts): hashing y sanitizacion del estado
- [src/stores/stateRuntime.ts](/C:/Users/camilo/contex360-vue/src/stores/stateRuntime.ts): timers y helpers de runtime
- [src/components/AppShell.vue](/C:/Users/camilo/contex360-vue/src/components/AppShell.vue): shell principal
- [backend/src/modules/auth](/C:/Users/camilo/contex360-vue/backend/src/modules/auth): login, guard y sesion
- [backend/src/modules/database](/C:/Users/camilo/contex360-vue/backend/src/modules/database): Prisma y acceso a datos

## Siguientes Pasos

- terminar la migracion de facturas, inventario y terceros al backend
- exponer reportes y exportacion Excel
- conectar el asistente IA a herramientas seguras del backend
- reforzar observabilidad, despliegue y backup
