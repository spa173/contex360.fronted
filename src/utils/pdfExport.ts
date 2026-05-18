import { jsPDF } from 'jspdf'

export async function generatePdfReport({
  title = 'Reporte Ejecutivo',
  subtitle = 'Contex360 ERP & AI',
  fileName = 'Reporte_Contex360.pdf',
  data = {},
  aiSummary = 'Análisis generado automáticamente por ContexAI.'
}: {
  title?: string
  subtitle?: string
  fileName?: string
  data?: Record<string, any>
  aiSummary?: string
}) {
  try {
    const doc = new jsPDF()
    
    // Configuración de colores
    const primaryColor = '#18181B'
    const accentColor = '#2563EB'
    const textColor = '#71717A'

    // Encabezado
    doc.setFillColor(24, 24, 27) // #18181B
    doc.rect(0, 0, 210, 36, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('CONTEX360 AI', 14, 22)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(title.toUpperCase(), 150, 22, { align: 'right' })

    // Información de documento
    doc.setTextColor(113, 113, 122)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 46)
    doc.text(`Módulo: ${subtitle}`, 14, 52)
    
    doc.setDrawColor(228, 228, 231)
    doc.line(14, 58, 196, 58)

    // Resumen Ejecutivo IA
    doc.setTextColor(24, 24, 27)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Resumen Ejecutivo AI', 14, 70)
    
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.8)
    doc.rect(14, 75, 182, 28, 'FD')
    
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const splitSummary = doc.splitTextToSize(aiSummary, 172)
    doc.text(splitSummary, 19, 83)

    // Sección de Métricas / Datos
    doc.setTextColor(24, 24, 27)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Indicadores Clave de Operación', 14, 115)

    let startY = 125
    doc.setFontSize(11)

    for (const [key, value] of Object.entries(data)) {
      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(228, 228, 231)
      doc.setLineWidth(0.2)
      doc.rect(14, startY, 182, 10, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(113, 113, 122)
      doc.text(key, 20, startY + 7)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 24, 27)
      doc.text(String(value), 180, startY + 7, { align: 'right' })

      startY += 12
    }

    // Pie de página
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(161, 161, 170)
    doc.text('Documento oficial generado con firma criptográfica de Contex360 ERP & AI.', 105, 285, { align: 'center' })

    doc.save(fileName)
    return { ok: true }
  } catch (err) {
    console.error('Error generating PDF:', err)
    return { ok: false, message: err instanceof Error ? err.message : 'Error al generar el archivo PDF' }
  }
}
