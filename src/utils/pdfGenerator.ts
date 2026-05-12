import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from './ui'

export function generateInvoicePdf(invoice: any, tenant: any) {
  const doc = new jsPDF()
  const margin = 20
  let y = margin

  // --- Premium Design Properties ---
  const primaryColor = [79, 70, 229] // Indigo 600
  const secondaryColor = [100, 116, 139] // Slate 500
  const darkColor = [15, 23, 42] // Slate 900
  const lightBgColor = [248, 250, 252] // Slate 50

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', margin, 26)

  // Company Name aligned right
  doc.setFontSize(18)
  doc.text(tenant?.name || 'Contex360 ERP', 190, 22, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(226, 232, 240) // Slate 200
  doc.text(`${tenant?.sector || 'Servicios Profesionales'} - ${tenant?.city || 'Colombia'}`, 190, 30, { align: 'right' })

  y = 55

  // 2. Invoice Details section (Two columns)
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Facturar a:', margin, y)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  y += 6
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(invoice.client?.name || invoice.clientId, margin, y)
  if (invoice.client?.nit) {
    y += 5
    doc.text(`NIT: ${invoice.client.nit}`, margin, y)
  }

  // Right column: Invoice Meta
  let rightY = 55
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text(`N° Factura:`, 140, rightY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(invoice.consecutive, 190, rightY, { align: 'right' })
  
  rightY += 8
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text(`Fecha Emisión:`, 140, rightY)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(formatDate(invoice.issuedAt || invoice.createdAt), 190, rightY, { align: 'right' })

  if (invoice.dueAt) {
    rightY += 8
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    doc.text(`Vencimiento:`, 140, rightY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(formatDate(invoice.dueAt), 190, rightY, { align: 'right' })
  }

  y = Math.max(y, rightY) + 15

  // 3. Table Header
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2])
  doc.rect(margin, y, 170, 10, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('Descripción', margin + 3, y + 7)
  doc.text('Cant.', margin + 90, y + 7)
  doc.text('Precio', margin + 115, y + 7)
  doc.text('Total', margin + 165, y + 7, { align: 'right' })
  
  y += 15

  // 4. Items (Fixed data mapping)
  doc.setFont('helvetica', 'normal')
  invoice.items.forEach((item: any) => {
    // Handling long names
    const productName = item.productName || item.name || 'Producto sin nombre'
    const unitPrice = item.unitPrice || item.price || 0
    const itemTotal = item.total || (item.quantity * unitPrice)

    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    
    // Split text for long descriptions
    const splitName = doc.splitTextToSize(productName, 80)
    doc.text(splitName, margin + 3, y)
    
    doc.text(item.quantity.toString(), margin + 90, y)
    doc.text(formatCurrency(unitPrice), margin + 115, y)
    
    // Align total to the right edge of the total column
    doc.text(formatCurrency(itemTotal), margin + 167, y, { align: 'right' })
    
    y += (splitName.length * 5) + 3

    // Page break logic
    if (y > 250) {
      doc.addPage()
      y = margin
    }
  })

  y += 5
  // Separator line
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, 190, y)
  y += 10

  // 5. Totals block
  doc.setFontSize(11)
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('SUBTOTAL:', 135, y)
  doc.text(formatCurrency(invoice.subtotal), 190, y, { align: 'right' })
  y += 7
  
  doc.text('IVA:', 135, y)
  doc.text(formatCurrency(invoice.taxTotal || invoice.tax || 0), 190, y, { align: 'right' })
  y += 9

  // Grand Total Rectangle
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2])
  doc.rect(130, y - 6, 60, 12, 'F')
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('TOTAL:', 135, y + 2)
  doc.text(formatCurrency(invoice.total), 190, y + 2, { align: 'right' })

  // 6. Footer Notes
  y += 25
  if (invoice.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    doc.text('Notas:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(doc.splitTextToSize(invoice.notes, 170), margin, y + 6)
  }

  // 7. Legal/DIAN footer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184) // Slate 400
  doc.setFont('helvetica', 'italic')
  doc.text('Este documento es una representación gráfica de una factura electrónica.', margin, 280)
  const cufeId = invoice.cufe || 'SIMULADO-' + Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  doc.text(`CUFE: ${cufeId}`, margin, 285)

  doc.save(`factura_${invoice.consecutive}.pdf`)
}
