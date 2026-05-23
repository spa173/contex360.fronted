# ⚡ PHASE 1: CRITICAL BLOCKERS - IMMEDIATE ACTION CHECKLIST

**Status:** 🔴 **BLOCKING PRODUCTION DEPLOYMENT**  
**Time to Complete:** 8-12 hours  
**Priority:** 🚨 **DO TODAY**

---

## Task 1: Fix Frontend API Base URL ⚠️ CRITICAL
**Status:** ❌ NOT DONE  
**Time:** 5 minutes  
**Severity:** CRITICAL - App crashes without this

### Current Problem:
- `.env.production` has `VITE_API_BASE_URL=""`
- Frontend compiles but crashes at runtime
- Cannot make any API calls to backend

### How to Fix:

#### Option A: Via Vercel Dashboard (RECOMMENDED)
```
1. Go to: https://vercel.com/dashboard
2. Select project: contex360fronted
3. Click: Settings → Environment Variables
4. Click: Add New
5. Variable Name: VITE_API_BASE_URL
6. Variable Value: https://spartan173-contex.hf.space
7. Select Environments: Production, Preview, Development
8. Click: Save
9. Vercel will automatically redeploy
10. Wait 2-3 minutes for deployment to complete
```

#### Option B: Via .env.production File
```bash
# Edit: contex360.fronted/.env.production
# Line 23, change from:
VITE_API_BASE_URL=""

# To:
VITE_API_BASE_URL=https://spartan173-contex.hf.space

# Then commit and push
git add .env.production
git commit -m "Set VITE_API_BASE_URL for production"
git push origin main
```

### Verification:
- [ ] Visit: https://contex360fronted.vercel.app
- [ ] Open browser console (F12)
- [ ] Check that no error about VITE_API_BASE_URL appears
- [ ] Verify API requests are going to https://spartan173-contex.hf.space

**Checkbox:** ☐ COMPLETE

---

## Task 2: Disable passWithNoTests in Vitest ⚠️ CRITICAL
**Status:** ❌ NOT DONE  
**Time:** 5 minutes  
**Severity:** CRITICAL - Hides test failures

### Current Problem:
- `vitest.config.js` has `passWithNoTests: true`
- Tests can be completely absent and CI still reports "PASSED"
- Gives false confidence about code quality

### How to Fix:
```bash
# Edit: contex360.fronted/vitest.config.js
# Find this line:
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    passWithNoTests: true,  # ← CHANGE THIS
    coverage: {
      provider: 'v8',
    },
  },
})

# Change to:
passWithNoTests: false,  # ← Now tests must exist

# Commit and push
git add vitest.config.js
git commit -m "Enable test requirement - passWithNoTests: false"
git push origin main
```

### Verification:
```bash
# Run tests locally
npm test

# Should show error that no test files found:
# "No test files found matching your project"
# This is EXPECTED and means vitest is properly configured
```

**Checkbox:** ☐ COMPLETE

---

## Task 3: Fix Frontend CI/CD Linter Enforcement ⚠️ CRITICAL
**Status:** ❌ NOT DONE  
**Time:** 2 minutes  
**Severity:** CRITICAL - Allows code quality issues to merge

### Current Problem:
- `.github/workflows/ci.yml` line 39: `npm run lint || echo`
- The `|| echo` makes linter errors non-blocking
- Code style violations merge to main branch

### How to Fix:
```bash
# Edit: contex360.fronted/.github/workflows/ci.yml
# Find: Line 39 in "Linter" step
- name: Linter
  run: npm run lint || echo   # ← REMOVE || echo

# Change to:
- name: Linter
  run: npm run lint

# Commit and push
git add .github/workflows/ci.yml
git commit -m "Enforce linter in CI/CD - fail on style violations"
git push origin main
```

### Verification:
- [ ] Go to: https://github.com/yourusername/contex360.fronted
- [ ] Check: Actions tab
- [ ] Next PR should fail linting if there are style issues
- [ ] Confirm linter errors block merge

**Checkbox:** ☐ COMPLETE

---

## Task 4: Remove Exposed Credentials from Git 🔒 CRITICAL
**Status:** ❌ NOT DONE  
**Time:** 30 minutes (+ time to rotate credentials)  
**Severity:** CRITICAL - Security vulnerability

### Current Problem:
- `.env` file committed to GitHub with real credentials
- Database passwords, API keys, OAuth secrets exposed
- Anyone with repo access has production credentials

### Exposed Credentials:
```
DATABASE_URL - Neon DB password
JWT_SECRET - JWT signing key
GOOGLE_CLIENT_SECRET - OAuth secret
TELEGRAM_BOT_TOKEN - Bot token
GEMINI_API_KEY - API key
GROQ_API_KEY - API key  
WOMPI_PRIVATE_KEY - Payment private key
SMTP_PASS - Email password
```

### How to Fix:

#### Step 1: Add .env to .gitignore
```bash
cd contex360.backend

# Add .env to gitignore if not already there
echo ".env" >> .gitignore

# Remove .env from git tracking
git rm --cached .env

# Verify it's removed
git status  # Should show .env as deleted

# Commit
git commit -m "Remove .env from version control (credentials exposed)"
git push origin main
```

#### Step 2: Rotate All Exposed Credentials
For each credential, generate a new one and update it in:
1. Hugging Face Space environment variables
2. GitHub Actions secrets
3. Local .env file (git-ignored)

**Credentials to Rotate:**

1. **JWT_SECRET**
   - [ ] Generate new secret
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

2. **GOOGLE_CLIENT_SECRET**
   - [ ] Go to: https://console.cloud.google.com
   - [ ] Project: Contex360
   - [ ] Create new OAuth 2.0 Client ID
   - [ ] Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

3. **TELEGRAM_BOT_TOKEN**
   - [ ] Go to: @BotFather on Telegram
   - [ ] Generate new token
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

4. **GROQ_API_KEY**
   - [ ] Go to: https://console.groq.com
   - [ ] Generate new API key
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

5. **GEMINI_API_KEY**
   - [ ] Go to: https://aistudio.google.com/apikey
   - [ ] Generate new API key
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

6. **WOMPI_PRIVATE_KEY**
   - [ ] Go to: Wompi dashboard
   - [ ] Generate new API keys
   - [ ] Update WOMPI_PUBLIC_KEY and WOMPI_PRIVATE_KEY
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

7. **SMTP Password (Brevo)**
   - [ ] Go to: https://app.brevo.com
   - [ ] Generate new SMTP password
   - [ ] Update SMTP_PASS
   - [ ] Update in Hugging Face environment
   - [ ] Update in GitHub Actions secrets
   - [ ] Redeploy backend

#### Step 3: Create .env.example Template
```bash
# Create: contex360.backend/.env.example
# This shows structure without exposing real values

DATABASE_URL=postgresql://user:password@host/db
DIRECT_URL=postgresql://user:password@host/db
JWT_SECRET=your-jwt-secret-here
APP_NAME=Contex360 Backend
PORT=3001
CORS_ORIGIN=http://localhost:5173,https://contex360fronted.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_STATE_SECRET=your-oauth-state-secret
BACKEND_PUBLIC_URL=https://spartan173-contex.hf.space
FRONTEND_URL=https://contex360fronted.vercel.app
AUTH_COOKIE_SAMESITE=none
AUTH_COOKIE_SECURE=true
SMTP_HOST=smtp-relay.sendinblue.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=your-smtp-from
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
WOMPI_PUBLIC_KEY=your-wompi-public-key
WOMPI_PRIVATE_KEY=your-wompi-private-key
WOMPI_EVENTS_SECRET=your-wompi-events-secret
BANCOLOMBIA_CLIENT_ID=your-bancolombia-client-id
BANCOLOMBIA_CLIENT_SECRET=your-bancolombia-client-secret
BANCOLOMBIA_AUTHORIZATION_URL=https://api.bancolombia.com/ext/services/Authorize
BANCOLOMBIA_TOKEN_URL=https://api.bancolombia.com/ext/services/Token
BANCOLOMBIA_SCOPE=read:statements
BANCOLOMBIA_REDIRECT_URI=https://spartan173-contex.hf.space/integrations/bancolombia/callback
BANCOLOMBIA_TOKEN_ENCRYPTION_SECRET=your-encryption-secret
```

**Checkbox:** ☐ COMPLETE

---

## Task 5: Implement Basic Error Boundary ⚠️ HIGH
**Status:** ❌ NOT DONE  
**Time:** 8-12 hours  
**Severity:** HIGH - App crashes without error handling

### Current Problem:
- No global error handling in frontend
- Unhandled errors crash the application
- Users see blank screen with no helpful message

### How to Fix:

#### Step 1: Create ErrorBoundary.vue Component
```bash
# Create: contex360.fronted/src/components/ErrorBoundary.vue

cat > src/components/ErrorBoundary.vue << 'EOF'
<template>
  <div v-if="hasError" class="error-container">
    <div class="error-content">
      <h1>⚠️ Something went wrong</h1>
      <p>{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="resetError" class="btn-primary">
          Try Again
        </button>
        <button @click="goHome" class="btn-secondary">
          Go Home
        </button>
      </div>
      <details v-if="isDevelopment" class="error-details">
        <summary>Error Details (Dev Only)</summary>
        <pre>{{ errorStack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const isDevelopment = process.env.NODE_ENV === 'development'
const router = useRouter()

// Expose error handler to app
window.__handleError = (error: Error) => {
  console.error('Application Error:', error)
  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  errorStack.value = error.stack || ''
}

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

const goHome = () => {
  resetError()
  router.push('/')
}

// Catch Vue errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    window.__handleError(event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    window.__handleError(new Error(event.reason))
  })
}
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.error-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  max-width: 600px;
  text-align: center;
}

.error-content h1 {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.error-content p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.error-details {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  text-align: left;
  margin-top: 1rem;
  max-height: 300px;
  overflow: auto;
}

.error-details pre {
  margin: 0;
  font-size: 0.85rem;
  color: #333;
}
</style>
EOF
```

#### Step 2: Wrap App in ErrorBoundary
```bash
# Edit: contex360.fronted/src/main.ts
# Add ErrorBoundary wrapper

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import ErrorBoundary from './components/ErrorBoundary.vue'
import './assets/main.css'

const app = createApp({
  components: {
    ErrorBoundary,
  },
  template: '<ErrorBoundary><App /></ErrorBoundary>',
})

// Global error handler
app.config.errorHandler = (err: any) => {
  console.error('Vue Error:', err)
  if (window.__handleError) {
    window.__handleError(err)
  }
}

app.use(pinia)
app.use(router)
app.mount('#app')
```

#### Step 3: Update App.vue
```vue
<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ErrorBoundary from './components/ErrorBoundary.vue'

const router = useRouter()
</script>
```

**Checkbox:** ☐ COMPLETE

---

## Summary Table

| Task | Time | Status | Priority |
|------|------|--------|----------|
| Fix VITE_API_BASE_URL | 5 min | ❌ | 🔴 CRITICAL |
| Disable passWithNoTests | 5 min | ❌ | 🔴 CRITICAL |
| Fix Linter Enforcement | 2 min | ❌ | 🔴 CRITICAL |
| Remove .env Credentials | 30 min | ❌ | 🔴 CRITICAL |
| Rotate All API Keys | 2-4 hrs | ❌ | 🔴 CRITICAL |
| Implement ErrorBoundary | 8-12 hrs | ❌ | 🟠 HIGH |
| **TOTAL** | **~12-18 hrs** | **0%** | |

---

## ✅ COMPLETION CHECKLIST

- [ ] Task 1: VITE_API_BASE_URL set in Vercel
- [ ] Task 2: passWithNoTests changed to false
- [ ] Task 3: Linter || echo removed from CI
- [ ] Task 4: .env removed from git, .env.example created
- [ ] Task 5: All API keys rotated
- [ ] Task 6: ErrorBoundary component implemented
- [ ] Verify: Frontend deploys without errors
- [ ] Verify: Application runs without API_BASE_URL error
- [ ] Verify: Linter fails on next CI run with style violations
- [ ] Verify: No credentials in git history (use `git log -p | grep -i password`)

---

## 🚀 After Phase 1 Complete

Once all Phase 1 items are done:
1. Your application can actually run in production (not crash on startup)
2. Your CI/CD can enforce code quality
3. Your credentials are secured
4. You have basic error handling

**Next Step:** Move to Phase 2 - Implement Tests (100-120 hours)

