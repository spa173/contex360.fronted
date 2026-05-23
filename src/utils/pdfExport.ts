import { jsPDF } from 'jspdf'

// Función auxiliar para convertir HEX a RGB para jsPDF por seguridad
const hexToRgb = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return isNaN(r) ? [0, 0, 0] : [r, g, b]
}

export async function generatePdfReport({
  title = 'Reporte Ejecutivo',
  subtitle = 'Contex360 ERP & AI',
  fileName = 'Reporte_Contex360.pdf',
  data = {},
  aiSummary = 'Análisis generado automáticamente por ContexAI.',
  companyName = 'CONTEX360 AI',
  primaryColorHex = '#18181B',
  accentColorHex = '#2563EB',
  footerText = 'Documento oficial generado con firma criptográfica de Contex360 ERP & AI.',
  logoBase64
}: {
  title?: string
  subtitle?: string
  fileName?: string
  data?: Record<string, any>
  aiSummary?: string
  companyName?: string
  primaryColorHex?: string
  accentColorHex?: string
  footerText?: string
  logoBase64?: string
}) {
  try {
    const doc = new jsPDF()
    
    const rgbPrimary = hexToRgb(primaryColorHex)
    const rgbAccent = hexToRgb(accentColorHex)

    // Encabezado
    doc.setFillColor(...rgbPrimary)
    doc.rect(0, 0, 210, 36, 'F')

    doc.setTextColor(255, 255, 255)
    
    // Si hay logo, lo usamos, si no, usamos el nombre de la empresa
    if (logoBase64) {
      // Asume formato PNG o JPEG, ajusta coordenadas y tamaño según sea necesario
      // x: 14, y: 8, width: 40, height: 20
      doc.addImage(logoBase64, 'PNG', 14, 8, 40, 20)
    } else {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text(companyName, 14, 22)
    }
    
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
    doc.setTextColor(...rgbPrimary)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('Resumen Ejecutivo AI', 14, 70)
    
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(...rgbAccent)
    doc.setLineWidth(0.8)
    doc.rect(14, 75, 182, 28, 'FD')
    
    doc.setTextColor(30, 41, 59)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const splitSummary = doc.splitTextToSize(aiSummary, 172)
    doc.text(splitSummary, 19, 83)

    // Sección de Métricas / Datos
    doc.setTextColor(...rgbPrimary)
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
      doc.setTextColor(...rgbPrimary)
      doc.text(String(value), 180, startY + 7, { align: 'right' })

      startY += 12
    }

    // Pie de página
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(161, 161, 170)
    doc.text(footerText, 105, 285, { align: 'center' })

    doc.save(fileName)
    return { ok: true }
  } catch (err) {
    console.error('Error generating PDF:', err)
    return { ok: false, message: err instanceof Error ? err.message : 'Error al generar el archivo PDF' }
  }
}
