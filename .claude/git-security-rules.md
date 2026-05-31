# Reglas Permanentes de Seguridad y Git (Contex360 Frontend)

Este documento define la política de seguridad corporativa para la gestión del repositorio Git, control de versiones y prevención de fugas de datos en el proyecto frontend de **Contex360**. Estas reglas son de cumplimiento obligatorio para todos los desarrolladores y agentes de Inteligencia Artificial (IA) que colaboren en el código base.

---

## 📋 1. Análisis de Archivos Excluidos y Nivel de Riesgo

El control de versiones en Git debe contener **únicamente** el código fuente, la configuración base del framework y los recursos estáticos del frontend. Cualquier otro archivo que pertenezca a la siguiente clasificación de riesgo debe ser estrictamente excluido:

| Categoría | Archivos / Patrones | Nivel de Riesgo | Justificación y Consecuencias de Fuga |
| :--- | :--- | :--- | :--- |
| **Secretos y API Keys** | `.env`, `.env.*.local`, `.env.production`, `.env.vercel`, `*.pem`, `*.key`, `*.pub`, `*.pfx`, `*.p12`, `auth.json`, `.git-credentials` | 🔴 **CRÍTICO** | Exposición de credenciales de API (Stripe, Dian, Firebase, etc.), llaves SSH privadas, certificados SSL o tokens de acceso con los que un atacante podría comprometer los servidores o robar datos de clientes. |
| **Contextos de IA y Agentes** | `.claude/`, `.gemini/`, `.agents/`, `.windsurf/`, `.continue/`, `.roo/`, `skills/`, `.cursor/`, `.cursorrules` | 🟡 **ALTO** | Fuga de permisos de ejecución locales otorgados a los agentes, políticas de sandbox, tokens de proveedores de LLM, historial de prompts de desarrollo e instrucciones de contexto privadas. |
| **Configuraciones Locales** | `.vscode/*` (excepto `extensions.json`), `.idea/`, `*.suo`, `*.ntvs*`, `*.njsproj`, `*.sln`, `*.sw?`, `.history/` | 🟢 **MEDIO** | Conflictos en el equipo por diferencias en la configuración local de IDEs, fugas de rutas absolutas del disco del desarrollador e historial local de cambios del editor. |
| **Temporales y Compilación** | `node_modules/`, `dist/`, `dist-ssr/`, `.vercel/`, `.cache/`, `.turbo/`, `out/`, `tmp/`, `temp/`, `*.tmp`, `*.temp`, `*.tsbuildinfo` | 🟢 **MEDIO** | Incremento innecesario del tamaño del repositorio (bloat), inconsistencia de versiones compiladas en producción y fugas de esquemas de compilación locales obsoletos. |
| **Logs y Diagnósticos** | `logs/`, `*.log`, `npm-debug.log*`, `yarn-error.log*`, `pnpm-error.log*` | 🟢 **MEDIO** | Los registros locales pueden almacenar información sensible sobre fallos del sistema, tokens en las cabeceras de peticiones interceptadas o rutas del sistema. |
| **Contextos Privados** | `tests-local/`, `scratch/`, `private-context/`, `*.local` | 🟢 **MEDIO** | Fugas de notas de desarrollo privadas, borradores de lógica no listos para producción o datos reales de clientes utilizados para pruebas locales rápidas. |

---

## 🔒 2. Reglas Profesionales de Seguridad (Enterprise)

### Regla 2.1: Cero Secretos en el Código de Producción
*   **Directriz:** Queda estrictamente prohibido escribir (hardcodear) claves de API, contraseñas, URLs de servidores de prueba internos o tokens de desarrollo directamente en los archivos `.vue`, `.ts`, `.js` o en los scripts del proyecto.
*   **Mecanismo:** Todos los valores variables o confidenciales deben cargarse desde las variables de entorno utilizando `import.meta.env.VITE_[NOMBRE_VARIABLE]`.

### Regla 2.2: Aislamiento Completo de Asistentes de IA (Claude, Cursor, etc.)
*   **Directriz:** Ninguna herramienta de desarrollo de IA debe subir sus archivos de configuración de entorno, cachés o reglas locales al repositorio remoto.
*   **Claude Code:** El directorio `.claude/` se utiliza para almacenar los permisos que el usuario otorga a Claude, scripts locales y worktrees. Este directorio está completamente excluido de Git en [.gitignore](file:///c:/Users/camilo/Desktop/contex360.fronted/.gitignore). La única excepción es este archivo de reglas [.claude/git-security-rules.md](file:///c:/Users/camilo/Desktop/contex360.fronted/.claude/git-security-rules.md), el cual debe permanecer documentado para consulta del equipo.
*   **Cursor / Windsurf:** Directorios de caché y de comportamiento (`.cursor/`, `.windsurf/`, `.roo/`) se ignoran para evitar conflictos de comportamiento entre diferentes agentes e IDEs de los miembros del equipo.

### Regla 2.3: Independencia de Ajustes Locales del Editor
*   **Directriz:** El repositorio de Git no debe verse afectado por el editor que use cada desarrollador.
*   **Mecanismo:** Se mantiene únicamente [.vscode/extensions.json](file:///c:/Users/camilo/Desktop/contex360.fronted/.vscode/extensions.json) en Git para sugerir las extensiones recomendadas (como Volar para Vue 3 y ESLint). El resto de archivos como `.vscode/settings.json`, `.vscode/launch.json` o `.vscode/tasks.json` se ignoran, ya que pueden contener rutas absolutas del disco duro local y configuraciones de terminal específicas del sistema operativo del desarrollador.

### Regla 2.4: Exclusión Estricta de Archivos no Productivos (IA, Temporales, Skills)
*   **Directriz:** Todo archivo temporal, experimental, generado por IA, skill, MCP, benchmark, script de prueba, contexto privado, prompt temporal o workspace local debe permanecer fuera del repositorio Git.
*   **Mecanismo:** Si un archivo no es necesario para compilar, probar o desplegar Contex360 en producción, debe estar incluido en `.gitignore`.

---


## 🛠️ 3. Validaciones Antes de Commit y Push

Para garantizar el cumplimiento de estas directrices, se definen los siguientes mecanismos de validación locales antes de integrar cambios:

### 3.1 Validación Manual (Chequeo del Desarrollador)
Antes de realizar cualquier `git commit`, el desarrollador debe ejecutar en su terminal:

1.  **Auditoría de archivos modificados:**
    ```bash
    git status
    ```
    Verificar que no haya archivos de configuración de variables de entorno (`.env`), archivos de log (`.log`) o carpetas de agentes de IA en el listado de archivos modificados o sin seguimiento (untracked).

2.  **Revisión del código a comprometer (diff):**
    ```bash
    git diff --cached
    ```
    Revisar línea por línea que no se estén subiendo secretos o credenciales hardcodeadas por descuido.

3.  **Análisis estático y pruebas rápidas:**
    ```bash
    npm run lint && npm run test
    ```
    Garantizar que el código cumple con las guías de estilo de ESLint y las pruebas unitarias pasan sin fallos.

### 3.2 Implementación de Git Hooks Automáticos (Husky & lint-staged)
Se recomienda encarecidamente instalar y configurar Husky para automatizar estas validaciones de seguridad y calidad antes de cada commit y push.

#### Paso 1: Instalación de Dependencias
```bash
npm install -D husky lint-staged
```

#### Paso 2: Habilitar Git Hooks
```bash
npx husky install
```

#### Paso 3: Configurar Pre-Commit Hooks
1.  **Filtro de Secretos y Linter (Pre-Commit):**
    Crear un archivo `.husky/pre-commit` para ejecutar `lint-staged`. En el archivo `package.json`, añadir la sección para validar únicamente los archivos listos para commit:
    ```json
    "lint-staged": {
      "*.{js,ts,vue}": [
        "eslint --fix",
        "vitest run --related --run"
      ]
    }
    ```
2.  **Verificación de Tipos de TypeScript (Pre-Push):**
    Configurar `.husky/pre-push` para ejecutar la compilación y comprobación estricta de tipos de TypeScript en Vue antes de subir cambios a GitHub:
    ```bash
    npm run lint && npx vue-tsc --noEmit && npm run test
    ```

---

## 💡 4. Compatibilidad con Vue, Vite, Tailwind y Vercel

### 4.1 Uso Correcto de Variables de Entorno en Vite
Vite procesa las variables de entorno de forma muy específica para evitar fugas del lado del cliente:
1.  **Exposición al cliente:** Solo las variables que comiencen con el prefijo `VITE_` (ej. `VITE_API_BASE_URL`) serán expuestas en el código Javascript compilado que se envía al navegador.
2.  **Regla de Seguridad Crítica:** **NUNCA** utilices el prefijo `VITE_` para variables sensibles de backend (como llaves privadas, tokens de pasarelas de pago backend, o contraseñas de bases de datos). Cualquier variable con `VITE_` es visible públicamente por el usuario final al inspeccionar el código de la aplicación.
3.  **Variables Locales no Rastreadas:** Las variables de desarrollo local deben guardarse en `.env.local` o `.env.development.local`. Estos archivos están ignorados en `.gitignore` para prevenir su publicación.

### 4.2 Despliegue Seguro en Vercel
Dado que el proyecto utiliza Vercel para el despliegue automático:
1.  **Configuración en Cloud:** No es necesario (ni seguro) subir archivos `.env.production` con llaves reales de producción a Git.
2.  **Mecanismo:** Las variables de entorno de producción se configuran directamente en el **Vercel Dashboard** (Settings -> Environment Variables). Vercel las inyecta de forma segura durante el build de producción en la nube.
3.  **Ignorar Directorio .vercel:** La carpeta `.vercel/` generada localmente durante la vinculación del proyecto (`vercel link`) contiene IDs de proyecto y tokens de caché locales, por lo que está completamente excluida en [.gitignore](file:///c:/Users/camilo/Desktop/contex360.fronted/.gitignore).

---

## 📝 5. Configuración de .gitignore Estándar Enterprise

El archivo [.gitignore](file:///c:/Users/camilo/Desktop/contex360.fronted/.gitignore) ha sido configurado bajo los estándares enterprise más estrictos:

```gitignore
# =========================================================================
# Contex360 - Frontend Git Ignore Configuration
# =========================================================================

# --- 1. SECRETS & TOKENS ---
.env
.env.*
!.env.example
.env*.local
*.pem
*.key
*.pub
*.cert
*.crt
*.pfx
*.p12
.npmrc
.yarnrc
auth.json
.git-credentials

# --- 2. AI AGENTS & TOOLS (Archivos de IA) ---
.claude/
.claudeignore
.gemini/
.agents/
.adal/
.aider-desk/
.aider*
.augment/
.bob/
.codeartsdoer/
.codebuddy/
.codemaker/
.codestudio/
.commandcode/
.continue/
.cortex/
.crush/
.devin/
.factory/
.forge/
.goose/
.graphify/
.hermes/
.iflow/
.junie/
.kilocode/
.kiro/
.kode/
.mcpjam/
.mux/
.neovate/
.openhands/
.pi/
.pochi/
.qoder/
.qwen/
.roo/
.rovodev/
.tabnine/
.trae/
.vibe/
.windsurf/
.zencoder/
skills/
skills-lock.json

# --- 3. LOCAL SETTINGS (Settings Locales) ---
.vscode/*
!.vscode/extensions.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.history/
.DS_Store
Thumbs.db

# --- 4. LOGS (Registros) ---
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
pnpm-error.log*

# --- 5. TEMPORARY FILES & BUILD OUTPUTS (Archivos Temporales) ---
node_modules/
dist/
dist-ssr/
.vercel/
.cache/
.parcel-cache/
.turbo/
out/
tmp/
temp/
*.tmp
*.temp
tsconfig.tsbuildinfo
*.tsbuildinfo
.eslintcache
.prettiercache

# --- 6. PRIVATE CONTEXTS & LOCAL TESTING (Contextos Privados) ---
tests-local/
scratch/
private-context/
*.local
```
