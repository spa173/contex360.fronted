<script setup lang="ts">
const lastUpdated = '12 de mayo de 2026'
const emit = defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div class="tu-wrap">
    <button
      @click="emit('back')"
      class="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
    >
      ← Volver
    </button>
    <div class="tu-page">
      <div class="tu-header">
        <h1 class="tu-title">Términos de Uso</h1>
        <p class="tu-meta">Última actualización: {{ lastUpdated }}</p>
      </div>

      <div class="tu-alert">
        Al acceder y utilizar la plataforma <strong>Contex360</strong>, usted acepta los presentes
        Términos de Uso en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe
        utilizar el servicio.
      </div>

      <section class="tu-section">
        <h2 class="tu-heading">1. Descripción del servicio</h2>
        <p class="tu-body">
          Contex360 es una plataforma de gestión empresarial (ERP) que ofrece funcionalidades de
          facturación, contabilidad, inventario, gestión de terceros y analítica, orientada a empresas
          colombianas. El servicio se presta bajo modalidad SaaS (Software as a Service).
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">2. Condiciones de acceso</h2>
        <ul class="tu-list">
          <li>El acceso requiere credenciales válidas asignadas por el administrador de su organización.</li>
          <li>Cada usuario es responsable de mantener la confidencialidad de su contraseña.</li>
          <li>El uso compartido de credenciales está estrictamente prohibido.</li>
          <li>Se recomienda activar la autenticación de dos factores (2FA) para mayor seguridad.</li>
          <li>Las cuentas inactivas por más de 90 días pueden ser suspendidas automáticamente.</li>
        </ul>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">3. Uso aceptable</h2>
        <p class="tu-body">El usuario se compromete a:</p>
        <ul class="tu-list">
          <li>Utilizar la plataforma exclusivamente para fines legítimos de gestión empresarial.</li>
          <li>No intentar acceder a datos de otras organizaciones o usuarios sin autorización.</li>
          <li>No realizar ingeniería inversa, descompilar ni modificar el software.</li>
          <li>No introducir virus, malware ni código malicioso en la plataforma.</li>
          <li>Respetar los límites de uso establecidos para su plan.</li>
        </ul>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">4. Propiedad intelectual</h2>
        <p class="tu-body">
          Todo el software, diseño, marcas, logotipos y contenido de Contex360 son propiedad exclusiva
          de sus desarrolladores y están protegidos por la legislación colombiana e internacional de
          propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado.
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">5. Datos y privacidad</h2>
        <p class="tu-body">
          El tratamiento de datos personales se rige por nuestra
          <strong>Política de Privacidad</strong> conforme a la Ley 1581 de 2012. Los datos
          contables y empresariales ingresados son propiedad de la organización usuaria. Contex360
          actúa como encargado del tratamiento y no accede a dicha información salvo para fines de
          soporte técnico autorizado.
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">6. Disponibilidad del servicio</h2>
        <div class="tu-cards">
          <div class="tu-card">
            <p class="tu-card-label">SLA objetivo</p>
            <p class="tu-body">99.5% de disponibilidad mensual</p>
          </div>
          <div class="tu-card">
            <p class="tu-card-label">Mantenimientos</p>
            <p class="tu-body">Notificados con mínimo 24h de anticipación</p>
          </div>
          <div class="tu-card">
            <p class="tu-card-label">Soporte</p>
            <p class="tu-body">A través del administrador de su organización</p>
          </div>
          <div class="tu-card">
            <p class="tu-card-label">Respaldos</p>
            <p class="tu-body">Copias de seguridad diarias automáticas</p>
          </div>
        </div>
        <p class="tu-body" style="margin-top: 10px;">
          Contex360 no se responsabiliza por interrupciones causadas por factores externos como fallas
          de conectividad del usuario, eventos de fuerza mayor o interrupciones de proveedores de
          infraestructura (AWS, Render, Neon).
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">7. Limitación de responsabilidad</h2>
        <p class="tu-body">
          Contex360 no será responsable por pérdidas de datos derivadas de uso indebido de
          credenciales, errores en la información ingresada por el usuario, o decisiones empresariales
          tomadas con base en los reportes de la plataforma. La responsabilidad máxima de Contex360
          ante cualquier reclamación se limita al valor pagado por el servicio en los últimos 30 días.
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">8. Facturación y pagos</h2>
        <ul class="tu-list">
          <li>El servicio puede estar sujeto a tarifas según el plan contratado.</li>
          <li>Los pagos no son reembolsables salvo acuerdo expreso por escrito.</li>
          <li>La falta de pago puede resultar en la suspensión temporal o cancelación del acceso.</li>
          <li>Los precios pueden ajustarse con 30 días de notificación previa.</li>
        </ul>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">9. Cancelación y terminación</h2>
        <p class="tu-body">
          Cualquiera de las partes puede dar por terminado el servicio con 15 días de aviso previo.
          Ante el incumplimiento de estos términos, Contex360 puede suspender o cancelar el acceso
          de forma inmediata. Tras la cancelación, los datos serán retenidos por 30 días para
          facilitar la exportación, tras lo cual serán eliminados de forma permanente.
        </p>
      </section>

      <section class="tu-section">
        <h2 class="tu-heading">10. Legislación aplicable</h2>
        <p class="tu-body">
          Estos Términos de Uso se rigen por las leyes de la República de Colombia. Cualquier
          controversia derivada del uso del servicio será sometida a la jurisdicción de los tribunales
          competentes de la ciudad de Bogotá D.C., Colombia.
        </p>
      </section>

      <div class="tu-footer-note">
        Estos términos pueden ser modificados periódicamente. Los cambios serán notificados a través
        de la plataforma con al menos 15 días de anticipación. El uso continuado del servicio tras
        la notificación implica la aceptación de los términos actualizados.
      </div>
    </div>
  </div>
</template>

<style scoped>
.tu-wrap {
  padding: 24px 16px 48px;
}

.tu-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0 auto;
  max-width: 760px;
}

.tu-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-bottom: 16px;
}

.tu-title {
  color: #f1f5f9;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.tu-meta {
  color: #64748b;
  font-size: 0.82rem;
  margin: 0;
}

.tu-alert {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  color: #6ee7b7;
  font-size: 0.88rem;
  line-height: 1.6;
  padding: 14px 18px;
}

.tu-alert strong {
  color: #a7f3d0;
}

.tu-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tu-heading {
  color: #e2e8f0;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}

.tu-body {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.65;
  margin: 0;
}

.tu-body strong {
  color: #cbd5e1;
}

.tu-list {
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  gap: 6px;
  line-height: 1.55;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tu-list li {
  padding-left: 16px;
  position: relative;
}

.tu-list li::before {
  color: #10b981;
  content: '•';
  left: 0;
  position: absolute;
}

.tu-list strong {
  color: #cbd5e1;
}

.tu-cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: 4px;
}

.tu-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
}

.tu-card-label {
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}

.tu-footer-note {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.6;
  padding: 14px 18px;
}
</style>
