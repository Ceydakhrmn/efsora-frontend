import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportToPdf(
  columns: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
  title?: string
) {
  const doc = new jsPDF({ orientation: 'landscape' })

  if (title) {
    doc.setFontSize(14)
    doc.text(title, 14, 15)
  }

  autoTable(doc, {
    head: [columns],
    body: rows.map(row => row.map(cell => (cell == null ? '' : String(cell)))),
    startY: title ? 22 : 14,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  })

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
}
