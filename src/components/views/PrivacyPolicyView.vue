<script setup lang="ts">
const lastUpdated = '12 de mayo de 2026'
</script>

<template>
  <div class="pp-wrap">
    <div class="pp-page">
      <div class="pp-header">
        <h1 class="pp-title">Política de Privacidad</h1>
        <p class="pp-meta">Última actualización: {{ lastUpdated }}</p>
      </div>

      <div class="pp-alert">
        De conformidad con la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>
        (Régimen de Protección de Datos Personales de Colombia), Contex360 informa su política de
        tratamiento de datos personales.
      </div>

      <section class="pp-section">
        <h2 class="pp-heading">1. Responsable del tratamiento</h2>
        <p class="pp-body">
          <strong>Contex360</strong> es el responsable del tratamiento de los datos personales
          recopilados a través de esta plataforma. Para cualquier consulta relacionada con el
          tratamiento de sus datos, puede contactarnos a través del administrador de su organización.
        </p>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">2. Datos que recopilamos</h2>
        <ul class="pp-list">
          <li>Nombre completo y correo electrónico (identificación del usuario)</li>
          <li>Dirección IP y agente de usuario (seguridad y trazabilidad)</li>
          <li>Datos de la empresa: NIT, razón social, ciudad, sector</li>
          <li>Información contable: facturas, movimientos, productos, terceros</li>
          <li>Registros de acceso y eventos de auditoría</li>
        </ul>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">3. Finalidad del tratamiento</h2>
        <ul class="pp-list">
          <li>Prestación del servicio de gestión contable y ERP</li>
          <li>Autenticación y control de acceso por roles</li>
          <li>Auditoría interna y cumplimiento normativo (DIAN)</li>
          <li>Mejora del servicio y soporte técnico</li>
          <li>Cumplimiento de obligaciones legales y fiscales</li>
        </ul>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">4. Seguridad de los datos</h2>
        <p class="pp-body">Contex360 implementa las siguientes medidas técnicas para proteger sus datos:</p>
        <div class="pp-security-grid">
          <div class="pp-security-card">
            <p class="pp-security-label">Cifrado en tránsito</p>
            <p class="pp-body">TLS 1.2+ en todas las comunicaciones (HTTPS)</p>
          </div>
          <div class="pp-security-card">
            <p class="pp-security-label">Cifrado en reposo</p>
            <p class="pp-body">AES-256 en la infraestructura de base de datos (Neon/AWS)</p>
          </div>
          <div class="pp-security-card">
            <p class="pp-security-label">Contraseñas</p>
            <p class="pp-body">Hash irreversible con bcrypt (nunca en texto plano)</p>
          </div>
          <div class="pp-security-card">
            <p class="pp-security-label">Control de acceso</p>
            <p class="pp-body">JWT firmado + roles por empresa + 2FA opcional</p>
          </div>
        </div>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">5. Derechos del titular</h2>
        <p class="pp-body">De conformidad con la Ley 1581 de 2012, usted tiene derecho a:</p>
        <ul class="pp-list">
          <li><strong>Conocer</strong> los datos personales que Contex360 tiene sobre usted</li>
          <li><strong>Actualizar</strong> sus datos cuando sean inexactos o estén desactualizados</li>
          <li><strong>Rectificar</strong> información incorrecta o incompleta</li>
          <li><strong>Suprimir</strong> sus datos cuando no sean necesarios para la finalidad del tratamiento</li>
          <li><strong>Revocar</strong> la autorización para el tratamiento de datos personales</li>
          <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)</li>
        </ul>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">6. Transferencia de datos</h2>
        <p class="pp-body">
          Los datos son almacenados en servidores de <strong>Neon (AWS us-east-1)</strong> y servidos
          desde <strong>Render</strong>. Ambos proveedores cuentan con certificaciones
          <strong>SOC 2 Type II</strong> e <strong>ISO 27001</strong>. No se venden ni comparten datos
          con terceros con fines comerciales.
        </p>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">7. Cookies y almacenamiento local</h2>
        <p class="pp-body">
          Contex360 utiliza <strong>cookies HttpOnly</strong> para la sesión de autenticación y
          <strong>localStorage</strong> para mantener el estado de la sesión activa. No se utilizan
          cookies de seguimiento ni publicidad.
        </p>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">8. Retención de datos</h2>
        <p class="pp-body">
          Los datos contables se conservan por el tiempo exigido por la normativa tributaria colombiana
          (<strong>mínimo 5 años</strong> según el Código de Comercio y disposiciones de la DIAN).
          Los datos de sesión se eliminan al revocar la sesión o al vencimiento del token.
        </p>
      </section>

      <section class="pp-section">
        <h2 class="pp-heading">9. Notificación de brechas</h2>
        <p class="pp-body">
          En caso de una vulneración de seguridad que afecte datos personales, Contex360 notificará a
          los titulares afectados y a la SIC dentro de las <strong>72 horas</strong> siguientes al
          conocimiento del incidente, conforme a las disposiciones aplicables.
        </p>
      </section>

      <div class="pp-footer-note">
        Esta política puede ser actualizada periódicamente. Los cambios serán notificados a los usuarios
        a través de la plataforma. El uso continuado del servicio implica la aceptación de la política vigente.
      </div>
    </div>
  </div>
</template>

<style scoped>
.pp-wrap {
  padding: 24px 16px 48px;
}

.pp-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0 auto;
  max-width: 760px;
}

.pp-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding-bottom: 16px;
}

.pp-title {
  color: #f1f5f9;
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.pp-meta {
  color: #64748b;
  font-size: 0.82rem;
  margin: 0;
}

.pp-alert {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 10px;
  color: #c7d2fe;
  font-size: 0.88rem;
  line-height: 1.6;
  padding: 14px 18px;
}

.pp-alert strong {
  color: #a5b4fc;
}

.pp-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pp-heading {
  color: #e2e8f0;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}

.pp-body {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.65;
  margin: 0;
}

.pp-body strong {
  color: #cbd5e1;
}

.pp-list {
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

.pp-list li {
  padding-left: 16px;
  position: relative;
}

.pp-list li::before {
  color: #6366f1;
  content: '•';
  left: 0;
  position: absolute;
}

.pp-list strong {
  color: #cbd5e1;
}

.pp-security-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-top: 4px;
}

.pp-security-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
}

.pp-security-label {
  color: #e2e8f0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}

.pp-footer-note {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.6;
  padding: 14px 18px;
}
</style>
