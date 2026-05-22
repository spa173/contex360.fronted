# ✅ CHECKLIST PRÁCTICO - PRUEBAS DE FLUJO INTERACTIVAS

**Instrucciones:** Completa esta lista mientras ejecutas cada prueba en https://contex360fronted.vercel.app

---

## 🧪 FLUJO 1: CREAR NUEVO TERCERO

### **Preparación**
- [ ] URL cargada correctamente
- [ ] Navegador no muestra errores
- [ ] Datos de prueba visibles

### **Ejecución**
- [ ] Haz clic en botón "Nuevo tercero" (esquina superior derecha)
- [ ] Se abre modal/formulario de creación
- [ ] Formulario no tiene errores

### **Llenado de Datos**
```
[ ] Razón Social: EMPRESA TEST SAS
[ ] NIT: 901234567-8
[ ] Tipo: CLIENTE (dropdown)
[ ] Email: contacto@empresatest.com
[ ] Teléfono: +57 3001234567
[ ] Dirección: Calle Principal 123
[ ] Ciudad: Bogotá
[ ] Departamento: Cundinamarca
[ ] País: Colombia
[ ] Campos adicionales (si existen): _______________
```

### **Validación del Formulario**
- [ ] Los campos requeridos se marcan
- [ ] La validación de email funciona
- [ ] El NIT se valida en tiempo real
- [ ] No hay errores al llenar datos

### **Guardado**
- [ ] Haz clic en botón "Guardar"
- [ ] Aparece mensaje de confirmación
- [ ] Modal se cierra
- [ ] No hay errores en consola (F12 > Console)

### **Verificación**
- [ ] El nuevo tercero aparece en la tabla
- [ ] Los datos guardados coinciden con lo ingresado
- [ ] El estado es "Activo"
- [ ] La tabla se actualiza automáticamente

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Modal apertura | [ ] | [ ] | [ ] | |
| Validaciones | [ ] | [ ] | [ ] | |
| Guardado datos | [ ] | [ ] | [ ] | |
| Aparición tabla | [ ] | [ ] | [ ] | |

---

## 🔍 FLUJO 2: BÚSQUEDA Y FILTRADO

### **Búsqueda Simple**
- [ ] Haz clic en barra de búsqueda
- [ ] Escribe "Constructora Altos"
- [ ] Resultados se filtran en tiempo real
- [ ] Tabla muestra solo coincidencias
- [ ] Tiempo de respuesta < 1 segundo

### **Búsqueda Avanzada**
- [ ] Limpia la búsqueda anterior
- [ ] Busca por NIT: "900123456"
- [ ] Resultado correcto aparece
- [ ] Busca por Email (si existe)

### **Filtrado por Tipo**
- [ ] Haz clic en "Todos los tipos"
- [ ] Selecciona "CLIENTE"
- [ ] Tabla muestra solo clientes
- [ ] Haz clic nuevamente
- [ ] Selecciona "PROVEEDOR"
- [ ] Tabla muestra solo proveedores
- [ ] Selecciona "Todos los tipos" nuevamente
- [ ] Tabla muestra todos

### **Combinación de Filtros**
- [ ] Busca por nombre Y tipo simultáneamente
- [ ] Los filtros se aplican en conjunto
- [ ] Resultados son correctos

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Búsqueda | [ ] | [ ] | [ ] | |
| Filtro tipo | [ ] | [ ] | [ ] | |
| Velocidad | [ ] | [ ] | [ ] | |
| Combinación | [ ] | [ ] | [ ] | |

---

## 💾 FLUJO 3: EXPORTACIÓN DE DATOS

### **Botón Exportar**
- [ ] Ubica botón "Exportar" (esquina superior derecha)
- [ ] Haz clic en él
- [ ] Se abre menú/modal de opciones

### **Formato Excel**
- [ ] Selecciona "Descargar como Excel"
- [ ] Archivo se descarga
- [ ] Nombre del archivo: contex360_terceros_[fecha].xlsx (aprox)
- [ ] Archivo no está vacío
- [ ] Abre archivo en Excel
- [ ] Datos coinciden con tabla

### **Formato CSV**
- [ ] Vuelve a hacer clic en "Exportar"
- [ ] Selecciona "Descargar como CSV"
- [ ] Archivo se descarga
- [ ] Abre archivo con editor de texto
- [ ] Formato CSV válido

### **Formato PDF** (si existe)
- [ ] Selecciona "Descargar como PDF"
- [ ] Archivo se descarga
- [ ] Abre PDF
- [ ] Contiene datos tabulados
- [ ] Formato legible

### **Filtros Aplicados a Exportación**
- [ ] Busca/filtra datos específicos
- [ ] Haz clic en Exportar
- [ ] Verifica si exporta solo datos filtrados o todos

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Excel | [ ] | [ ] | [ ] | |
| CSV | [ ] | [ ] | [ ] | |
| PDF | [ ] | [ ] | [ ] | |
| Datos correctos | [ ] | [ ] | [ ] | |

---

## 🗂️ FLUJO 4: NAVEGACIÓN PRINCIPAL

### **Prueba Cada Módulo:**

#### **Dashboard**
- [ ] Haz clic en "Dashboard"
- [ ] Página carga sin errores
- [ ] Muestra información general
- [ ] Widgets/gráficos visibles
- [ ] Datos se actualizan

#### **Facturación**
- [ ] Haz clic en "Facturación"
- [ ] Módulo carga correctamente
- [ ] Interfaz consistente
- [ ] Datos visibles

#### **Compras**
- [ ] Haz clic en "Compras"
- [ ] Módulo carga sin problemas
- [ ] Interfaz accesible

#### **Cotizaciones**
- [ ] Haz clic en "Cotizaciones"
- [ ] Módulo carga correctamente

#### **Inventario**
- [ ] Haz clic en "Inventario"
- [ ] Módulo carga sin errores

#### **Contabilidad**
- [ ] Haz clic en "Contabilidad"
- [ ] Módulo carga correctamente

#### **Tesorería**
- [ ] Haz clic en "Tesorería"
- [ ] Módulo carga sin problemas

#### **Usuarios**
- [ ] Haz clic en "Usuarios"
- [ ] Módulo carga correctamente
- [ ] Muestra lista de usuarios

#### **Reportes**
- [ ] Haz clic en "Reportes"
- [ ] Módulo carga correctamente
- [ ] Opciones de reportes visibles

#### **Consola Admin**
- [ ] Haz clic en "Consola Admin"
- [ ] Módulo carga sin errores
- [ ] Opciones administrativas accesibles

### **Validación General**
- [ ] Ningún módulo muestra error 404
- [ ] Ningún módulo muestra error 500
- [ ] Menú actúa consistentemente
- [ ] Breadcrumb se actualiza
- [ ] No hay errores en consola

### **Resultados**
| Módulo | ✅ Carga | ⏱️ Tiempo | 🐛 Errores | Notas |
|--------|---------|----------|-----------|-------|
| Dashboard | [ ] | ___ s | [ ] | |
| Facturación | [ ] | ___ s | [ ] | |
| Compras | [ ] | ___ s | [ ] | |
| Cotizaciones | [ ] | ___ s | [ ] | |
| Inventario | [ ] | ___ s | [ ] | |
| Contabilidad | [ ] | ___ s | [ ] | |
| Tesorería | [ ] | ___ s | [ ] | |
| Usuarios | [ ] | ___ s | [ ] | |
| Reportes | [ ] | ___ s | [ ] | |
| Consola Admin | [ ] | ___ s | [ ] | |

---

## ✏️ FLUJO 5: EDITAR TERCERO EXISTENTE

### **Preparación**
- [ ] Vuelve a la sección "Terceros"
- [ ] Tabla es visible con registros

### **Abrir Edición**
- [ ] Haz clic en un registro (ej: "Constructora Altos SAS")
- [ ] Se abre formulario de edición
- [ ] Los datos actuales están precargados
- [ ] El formulario no tiene errores

### **Realización de Cambios**
- [ ] Cambia el nombre a algo como "CONSTRUCTORA ALTOS SAS - EDITADA"
- [ ] Cambia el estado si es posible
- [ ] Cambia el email
- [ ] Modifica teléfono
- [ ] Realiza otros cambios necesarios

### **Guardado**
- [ ] Haz clic en "Guardar" o "Actualizar"
- [ ] Aparece confirmación de éxito
- [ ] Modal se cierra
- [ ] No hay errores

### **Verificación**
- [ ] Vuelve a la tabla
- [ ] Los cambios aparecen reflejados
- [ ] Los datos editados coinciden
- [ ] No hay datos duplicados

### **Deshacer Cambios** (Importante para limpieza)
- [ ] Abre nuevamente la edición
- [ ] Restaura los valores originales
- [ ] Guarda nuevamente

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Apertura | [ ] | [ ] | [ ] | |
| Precarga datos | [ ] | [ ] | [ ] | |
| Guardado | [ ] | [ ] | [ ] | |
| Actualización | [ ] | [ ] | [ ] | |

---

## 🗑️ FLUJO 6: ELIMINAR TERCERO (CUIDADO)

### **⚠️ ADVERTENCIA: Este flujo es destructivo**

### **Preparación**
- [ ] Identifica un tercero que sea "de prueba"
- [ ] Anota sus datos antes de eliminar

### **Búsqueda del Tercero**
- [ ] Busca el tercero a eliminar
- [ ] Lo ubicas en la tabla

### **Apertura de Opciones**
- [ ] Haz clic derecho en la fila, O
- [ ] Busca un menú de opciones (⋮ o similar)
- [ ] Se abre contexto/menú

### **Eliminación**
- [ ] Haz clic en "Eliminar"
- [ ] Aparece diálogo de confirmación
- [ ] Lees el aviso (debe mencionar que es irreversible)
- [ ] Haz clic en "Confirmar" o "Sí"

### **Verificación**
- [ ] El tercero desaparece de la tabla
- [ ] No aparece en búsquedas
- [ ] Aparece mensaje de confirmación
- [ ] No hay errores en consola

### **Restauración** (si es posible)
- [ ] Verifica si hay opción "Deshacer"
- [ ] Si no, espera a verificar base de datos
- [ ] O crea nuevamente para testing

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Menú eliminación | [ ] | [ ] | [ ] | |
| Confirmación | [ ] | [ ] | [ ] | |
| Eliminación | [ ] | [ ] | [ ] | |
| Desaparición tabla | [ ] | [ ] | [ ] | |

---

## 🤖 FLUJO 7: VALIDACIÓN LEGAL IA

### **Observación**
- [ ] Panel "VALIDACIÓN LEGAL" visible en la derecha
- [ ] Muestra estado actual

### **Interacción**
- [ ] Lee el mensaje de validación
- [ ] Haz clic en "Revisar"
- [ ] Se abre panel/modal con detalles

### **Análisis**
- [ ] Verifica qué RUTs están próximos a caducar
- [ ] Comprueba si es correcto
- [ ] Lee recomendaciones

### **Acciones**
- [ ] Si hay botones de acción, haz clic
- [ ] Verifica qué ocurre
- [ ] Vuelve a revisar el estado

### **Validaciones Adicionales**
- [ ] Intenta crear tercero sin validación legal
- [ ] Verifica si se bloquea o advierte

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Panel visible | [ ] | [ ] | [ ] | |
| Información correcta | [ ] | [ ] | [ ] | |
| Botón revisar | [ ] | [ ] | [ ] | |
| Acciones | [ ] | [ ] | [ ] | |

---

## 📊 FLUJO 8: INSIGHTS DE IA

### **Observación**
- [ ] Panel "INSIGHTS DE IA" visible en la derecha
- [ ] Muestra porcentaje de riesgo (12%)

### **Análisis**
- [ ] Lee la información del riesgo
- [ ] Verifica la tendencia (↑ +2.4%)
- [ ] Comprende el nivel de riesgo

### **Interacción**
- [ ] Haz clic en el panel si es interactivo
- [ ] Busca detalles adicionales
- [ ] Verifica si hay recomendaciones

### **Validación**
- [ ] La información tiene sentido
- [ ] Los números son razonables
- [ ] Se actualiza según cambios en terceros

### **Resultados**
| Aspecto | ✅ Exitoso | ⚠️ Parcial | ❌ Fallido | Notas |
|---------|-----------|-----------|----------|-------|
| Panel visible | [ ] | [ ] | [ ] | |
| Datos correctos | [ ] | [ ] | [ ] | |
| Interactividad | [ ] | [ ] | [ ] | |

---

## 🧬 VALIDACIONES Y EDGE CASES

### **Validación: Campo Vacío**
- [ ] Intenta crear tercero sin nombre
- [ ] Sistema muestra error
- [ ] No permite guardar
- [ ] Error es claro

### **Validación: NIT Duplicado**
- [ ] Intenta crear tercero con NIT que ya existe
- [ ] Sistema detecta duplicado
- [ ] Muestra advertencia clara
- [ ] No permite guardar

### **Validación: Email Inválido**
- [ ] Intenta ingresar email inválido: "test@"
- [ ] Sistema rechaza
- [ ] Muestra error específico

### **Validación: Caracteres Especiales**
- [ ] Intenta ingresar: "EMPRESA™ SAS @#$"
- [ ] Sistema valida correctamente
- [ ] Acepta o rechaza según política

### **Búsqueda: Sin Resultados**
- [ ] Busca: "ZZZZZZZZZZZZZZZZZ"
- [ ] Sistema muestra "Sin resultados"
- [ ] No hay errores
- [ ] Mensaje es claro

### **Performance: Tabla Grande**
- [ ] Intenta cargar 100+ registros
- [ ] Paginación funciona
- [ ] Velocidad es aceptable (< 2s)

### **Resultados**
| Validación | ✅ Pasó | ⚠️ Parcial | ❌ Falló | Notas |
|-----------|---------|-----------|--------|-------|
| Campo vacío | [ ] | [ ] | [ ] | |
| NIT duplicado | [ ] | [ ] | [ ] | |
| Email inválido | [ ] | [ ] | [ ] | |
| Caracteres | [ ] | [ ] | [ ] | |
| Sin resultados | [ ] | [ ] | [ ] | |
| Performance | [ ] | [ ] | [ ] | |

---

## 🐛 PROBLEMAS ENCONTRADOS

```
Descripción: ________________________
Severidad: [ ] Crítica [ ] Alta [ ] Media [ ] Baja
Módulo: ________________________
Pasos para reproducir:
1. ________________________
2. ________________________
3. ________________________

Resultado esperado: ________________________
Resultado actual: ________________________
Adjuntar screenshot: [ ] Sí [ ] No
```

---

## 📋 RESUMEN FINAL

### **Pruebas Completadas**
- [ ] Flujo 1: Crear Tercero
- [ ] Flujo 2: Búsqueda y Filtrado
- [ ] Flujo 3: Exportación
- [ ] Flujo 4: Navegación
- [ ] Flujo 5: Editar Tercero
- [ ] Flujo 6: Eliminar Tercero
- [ ] Flujo 7: Validación Legal
- [ ] Flujo 8: Insights IA

### **Validaciones Completadas**
- [ ] Campos requeridos
- [ ] Duplicados
- [ ] Emails
- [ ] Búsqueda
- [ ] Performance

### **Estado General**
- [ ] ✅ TODAS LAS PRUEBAS PASARON
- [ ] ⚠️ PRUEBAS CON PROBLEMAS MENORES
- [ ] ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### **Problemas Críticos Encontrados**
Total: _____ bugs críticos

### **Problemas Menores Encontrados**
Total: _____ bugs menores

### **Recomendaciones**
```
1. ________________________
2. ________________________
3. ________________________
```

### **Aprobación para Producción**
- [ ] ✅ APROBADO - Listo para producción
- [ ] ⚠️ CONDICIONAL - Corregir problemas menores
- [ ] ❌ RECHAZADO - Problemas críticos

---

**Fecha de ejecución:** ___/___/______  
**Ejecutor:** ________________________  
**Navegador utilizado:** ________________________  
**Dispositivo:** ________________________  
**Notas finales:** ________________________

---

*Por favor, completa este checklist de manera exhaustiva y registra todos los resultados para una evaluación completa de la calidad de la aplicación.*
