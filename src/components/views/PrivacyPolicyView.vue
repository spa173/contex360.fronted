<script setup lang="ts">
const lastUpdated = '12 de mayo de 2026'
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-8 text-slate-700">
    <div>
      <h1 class="text-3xl font-bold text-slate-900">Política de Privacidad</h1>
      <p class="text-slate-500 text-sm mt-1">Última actualización: {{ lastUpdated }}</p>
    </div>

    <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800">
      De conformidad con la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> (Régimen de Protección de Datos Personales de Colombia), Contex360 informa su política de tratamiento de datos personales.
    </div>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">1. Responsable del tratamiento</h2>
      <p class="text-sm leading-relaxed">
        <strong>Contex360</strong> es el responsable del tratamiento de los datos personales recopilados a través de esta plataforma. Para cualquier consulta relacionada con el tratamiento de sus datos, puede contactarnos a través del administrador de su organización.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">2. Datos que recopilamos</h2>
      <ul class="text-sm leading-relaxed list-disc list-inside space-y-1 ml-2">
        <li>Nombre completo y correo electrónico (identificación del usuario)</li>
        <li>Dirección IP y agente de usuario (seguridad y trazabilidad)</li>
        <li>Datos de la empresa: NIT, razón social, ciudad, sector</li>
        <li>Información contable: facturas, movimientos, productos, terceros</li>
        <li>Registros de acceso y eventos de auditoría</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">3. Finalidad del tratamiento</h2>
      <ul class="text-sm leading-relaxed list-disc list-inside space-y-1 ml-2">
        <li>Prestación del servicio de gestión contable y ERP</li>
        <li>Autenticación y control de acceso por roles</li>
        <li>Auditoría interna y cumplimiento normativo (DIAN)</li>
        <li>Mejora del servicio y soporte técnico</li>
        <li>Cumplimiento de obligaciones legales y fiscales</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">4. Seguridad de los datos</h2>
      <div class="text-sm leading-relaxed space-y-2">
        <p>Contex360 implementa las siguientes medidas técnicas para proteger sus datos:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <div class="bg-white border border-slate-200 rounded-lg p-3">
            <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">Cifrado en tránsito</p>
            <p class="text-slate-600">TLS 1.2+ en todas las comunicaciones (HTTPS)</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-lg p-3">
            <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">Cifrado en reposo</p>
            <p class="text-slate-600">AES-256 en la infraestructura de base de datos (Neon/AWS)</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-lg p-3">
            <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">Contraseñas</p>
            <p class="text-slate-600">Hash irreversible con bcrypt (nunca se almacenan en texto plano)</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-lg p-3">
            <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">Control de acceso</p>
            <p class="text-slate-600">JWT firmado + roles por empresa + 2FA opcional</p>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">5. Derechos del titular</h2>
      <p class="text-sm leading-relaxed">De conformidad con la Ley 1581 de 2012, usted tiene derecho a:</p>
      <ul class="text-sm leading-relaxed list-disc list-inside space-y-1 ml-2">
        <li><strong>Conocer</strong> los datos personales que Contex360 tiene sobre usted</li>
        <li><strong>Actualizar</strong> sus datos cuando sean inexactos o estén desactualizados</li>
        <li><strong>Rectificar</strong> información incorrecta o incompleta</li>
        <li><strong>Suprimir</strong> sus datos cuando no sean necesarios para la finalidad del tratamiento</li>
        <li><strong>Revocar</strong> la autorización para el tratamiento de datos personales</li>
        <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)</li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">6. Transferencia de datos</h2>
      <p class="text-sm leading-relaxed">
        Los datos son almacenados en servidores de <strong>Neon (AWS us-east-1)</strong> y servidos desde <strong>Render</strong>. Ambos proveedores cuentan con certificaciones <strong>SOC 2 Type II</strong> e <strong>ISO 27001</strong>. No se venden ni comparten datos con terceros con fines comerciales.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">7. Cookies y almacenamiento local</h2>
      <p class="text-sm leading-relaxed">
        Contex360 utiliza <strong>cookies HttpOnly</strong> para la sesión de autenticación y <strong>localStorage</strong> para mantener el estado de la sesión activa. No se utilizan cookies de seguimiento ni publicidad.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">8. Retención de datos</h2>
      <p class="text-sm leading-relaxed">
        Los datos contables se conservan por el tiempo exigido por la normativa tributaria colombiana (<strong>mínimo 5 años</strong> según el Código de Comercio y las disposiciones de la DIAN). Los datos de sesión se eliminan al revocar la sesión o al vencimiento del token.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-xl font-semibold text-slate-800">9. Notificación de brechas</h2>
      <p class="text-sm leading-relaxed">
        En caso de una vulneración de seguridad que afecte datos personales, Contex360 notificará a los titulares afectados y a la Superintendencia de Industria y Comercio (SIC) dentro de las <strong>72 horas</strong> siguientes al conocimiento del incidente, conforme a las disposiciones aplicables.
      </p>
    </section>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
      Esta política puede ser actualizada periódicamente. Los cambios serán notificados a los usuarios a través de la plataforma. El uso continuado del servicio implica la aceptación de la política vigente.
    </div>
  </div>
</template>
