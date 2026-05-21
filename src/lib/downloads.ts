import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { TENANT, computePayslip, type Employee } from './mock'

const ORANGE: [number, number, number] = [249, 115, 22]
const INK: [number, number, number] = [10, 10, 10]
const N500: [number, number, number] = [115, 115, 115]
const N200: [number, number, number] = [229, 229, 229]

function fmtXOF(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ') + ' XOF'
}

function header(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(...INK)
  doc.rect(0, 0, 210, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('ADC', 14, 14)
  doc.setTextColor(...ORANGE)
  doc.setFont('helvetica', 'italic')
  doc.text('Paie', 27, 14)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('African Digit Consulting · Grand-Bassam · africandigitconsulting.com', 14, 19)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, 14, 32)
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...N500)
    doc.text(subtitle, 14, 38)
    doc.setTextColor(...INK)
  }
}

function footer(doc: jsPDF, pageNumber: number, totalPages?: number) {
  const total = totalPages || (doc as any).internal.getNumberOfPages()
  doc.setDrawColor(...N200)
  doc.line(14, 285, 196, 285)
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.text('Document généré par ADC Paie · adc-paie.vercel.app', 14, 290)
  doc.text(`Page ${pageNumber} / ${total}`, 196, 290, { align: 'right' })
  doc.text(`Édité le ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 105, 290, { align: 'center' })
}

export function downloadPayslipPDF(e: Employee, period = 'Novembre 2026') {
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
  const parts = 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  header(doc, 'Bulletin de paie', `Période · ${period} · Paiement le 5 du mois suivant`)

  doc.setFontSize(8)
  doc.setTextColor(...N500)
  doc.text(`N° BUL-${period.replace(' ', '-').toLowerCase()}-${e.id.padStart(4, '0')}`, 196, 32, { align: 'right' })
  doc.setTextColor(...INK)

  // Cadres Employeur / Salarié
  doc.setDrawColor(...N200)
  doc.rect(14, 46, 88, 28)
  doc.rect(108, 46, 88, 28)
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.text('EMPLOYEUR', 18, 52)
  doc.text('SALARIÉ', 112, 52)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(TENANT.name, 18, 58)
  doc.text(`${e.firstName} ${e.lastName}`, 112, 58)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(TENANT.city, 18, 63)
  doc.text(`${e.role} · ${e.contract}`, 112, 63)
  doc.text(`IFU · ${TENANT.ifu}`, 18, 68)
  doc.text(`Mat. CNPS · ${e.matricule}`, 112, 68)
  doc.text(`CNPS · ${TENANT.cnps}`, 18, 73)
  doc.text(`${e.family.situation} · ${e.family.kids} enfant(s) · ${parts} part(s)`, 112, 73)

  // Tableau rémunération
  autoTable(doc, {
    startY: 82,
    head: [['Désignation', 'Base', 'Taux', 'À payer', 'À retenir']],
    body: [
      ['Salaire de base', '22 j', '—', fmtXOF(e.brut), ''],
      [{ content: 'Salaire brut', styles: { fontStyle: 'bold' } }, '', '', { content: fmtXOF(e.brut), styles: { fontStyle: 'bold' } }, ''],
      ['CNPS retraite + CMU + famille + AT', fmtXOF(e.brut), '6,3 %', '', fmtXOF(p.cnps)],
      ['ITS · barème progressif quotient familial', fmtXOF(e.brut), 'progressif', '', fmtXOF(p.its)],
      ['IGR · Impôt Général sur le Revenu', fmtXOF(e.brut), '1,5 %', '', fmtXOF(p.igr)],
      ['CN · Contribution Nationale', fmtXOF(e.brut), '1,5 %', '', fmtXOF(p.cn)],
    ],
    foot: [[{ content: 'NET À PAYER', colSpan: 4, styles: { fontStyle: 'bold', halign: 'left', fillColor: [255, 247, 237], textColor: [10, 10, 10] } }, { content: fmtXOF(p.net), styles: { fontStyle: 'bold', fillColor: [255, 247, 237], textColor: ORANGE } }]],
    headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [38, 38, 38] },
    footStyles: { fontSize: 11 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', textColor: ORANGE } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })

  const finalY = (doc as any).lastAutoTable.finalY || 180
  // Charges patronales
  doc.setFontSize(8)
  doc.setTextColor(...N500)
  doc.text('CHARGES PATRONALES', 14, finalY + 10)
  doc.text('MENTIONS LÉGALES', 108, finalY + 10)
  doc.setTextColor(...INK)
  doc.setFontSize(9)
  doc.text(`Retraite (7,7 %)`, 14, finalY + 16); doc.text(fmtXOF(e.brut * 0.077), 100, finalY + 16, { align: 'right' })
  doc.text(`Prestations familiales (5,75 %)`, 14, finalY + 21); doc.text(fmtXOF(e.brut * 0.0575), 100, finalY + 21, { align: 'right' })
  doc.text(`Accidents du travail (3,5 %)`, 14, finalY + 26); doc.text(fmtXOF(e.brut * 0.035), 100, finalY + 26, { align: 'right' })
  doc.line(14, finalY + 29, 100, finalY + 29)
  doc.setFont('helvetica', 'bold')
  doc.text('Total patronal', 14, finalY + 34); doc.text(fmtXOF(p.patron), 100, finalY + 34, { align: 'right' })
  doc.text('Coût total employeur', 14, finalY + 39); doc.text(fmtXOF(p.total), 100, finalY + 39, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  const legalText = "Bulletin émis conformément à l'article 32.5 du Code du travail ivoirien (Loi 2015-532). Conservation obligatoire 5 ans. En cas de litige, ce document fait foi de la rémunération versée."
  const lines = doc.splitTextToSize(legalText, 86)
  doc.text(lines, 108, finalY + 16)
  doc.text('Signé numériquement par ADC Paie · SHA-256', 108, finalY + 40)

  footer(doc, 1)
  doc.save(`bulletin-${period.replace(/ /g, '-').toLowerCase()}-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

export function downloadContratPDF(form: { firstName: string; lastName: string; gender: string; birthDate: string; nationality: string; contract: string; role: string; startDate: string; endDate?: string; trialMonths: number; email: string; phone: string; address: string; brut: number; cnpsMat: string; familySituation: string; kids: number }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  header(doc, `Contrat de travail · ${form.contract}`, `Entre ${TENANT.name} (employeur) et ${form.firstName} ${form.lastName} (salarié)`)

  doc.setFontSize(9)
  let y = 50
  const sec = (t: string) => { y += 6; doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(t, 14, y); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); y += 5 }
  const p = (t: string) => { const lines = doc.splitTextToSize(t, 182); doc.text(lines, 14, y); y += lines.length * 4.2 }

  sec('Article 1 · Identification des parties')
  p(`L'employeur : ${TENANT.name}, IFU ${TENANT.ifu}, CNPS ${TENANT.cnps}, sis ${TENANT.city}, représenté par son représentant légal,`)
  p(`d'une part, et`)
  p(`Le salarié : ${form.firstName} ${form.lastName} (${form.gender === 'F' ? 'Mme' : 'M.'}), né(e) le ${form.birthDate}, de nationalité ${form.nationality}, demeurant ${form.address}, joignable au ${form.phone} (e-mail : ${form.email}), de situation familiale ${form.familySituation} avec ${form.kids} enfant(s) à charge, immatriculé(e) à la CNPS sous le n° ${form.cnpsMat},`)
  p(`d'autre part.`)

  sec(`Article 2 · Nature et objet du contrat`)
  p(`Le présent contrat est un ${form.contract === 'CDI' ? 'Contrat à Durée Indéterminée (CDI)' : form.contract === 'CDD' ? 'Contrat à Durée Déterminée (CDD)' : 'Contrat de Stage'} régi par la Loi n° 2015-532 portant Code du travail de Côte d'Ivoire.`)
  p(`Le salarié est engagé en qualité de ${form.role}.`)

  sec('Article 3 · Date d\'effet et durée')
  p(`Le contrat prend effet à compter du ${form.startDate}.${form.contract !== 'CDI' ? ` Il prendra fin le ${form.endDate}.` : ' Il est conclu pour une durée indéterminée.'}`)
  if (form.trialMonths > 0) p(`Une période d'essai de ${form.trialMonths} mois est prévue, renouvelable une fois par accord écrit des parties.`)

  sec('Article 4 · Rémunération')
  p(`Le salarié percevra une rémunération mensuelle brute de ${fmtXOF(form.brut)}, payable au plus tard le 5 du mois suivant la période travaillée. Le bulletin de paie sera émis conformément à l'article 32.5 du Code du travail.`)
  const preview = computePayslip(form.brut, form.kids, form.familySituation === 'marié(e)')
  p(`À titre indicatif, le net mensuel à payer s'élèvera à environ ${fmtXOF(preview.net)} après application des cotisations CNPS, ITS, IGR et CN selon les barèmes en vigueur.`)

  sec('Article 5 · Lieu et conditions de travail')
  p(`Le lieu de travail est situé à ${TENANT.city}. La durée hebdomadaire du travail est de 40 heures, réparties sur 5 jours du lundi au vendredi.`)

  sec('Article 6 · Congés payés')
  p(`Le salarié bénéficie de congés payés acquis à raison de 2,2 jours ouvrables par mois de travail effectif (soit 26,4 jours par an), conformément à l'article 25 du Code du travail.`)

  sec('Article 7 · Confidentialité et propriété intellectuelle')
  p(`Le salarié s'engage à respecter la confidentialité de toute information dont il aurait connaissance dans le cadre de ses fonctions, et à céder à l'employeur l'ensemble des droits de propriété intellectuelle sur les œuvres créées dans le cadre du contrat.`)

  sec('Article 8 · Rupture du contrat')
  p(form.contract === 'CDI'
    ? `Le contrat peut être rompu par chacune des parties moyennant un préavis dont la durée est fixée par les conventions collectives applicables et le Code du travail.`
    : `Le contrat prend fin à l'échéance prévue. Toute rupture anticipée doit respecter les dispositions légales en vigueur.`)

  doc.addPage()
  footer(doc, 1, 2)
  header(doc, 'Contrat de travail · suite et signatures', `${form.firstName} ${form.lastName}`)

  y = 50
  sec('Article 9 · Litiges')
  p(`Tout litige relatif à l'exécution du présent contrat est soumis au Tribunal du Travail d'Abidjan, après tentative de règlement amiable.`)

  sec('Signatures')
  y += 4
  p(`Fait à ${TENANT.city}, le ${form.startDate || new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.`)
  y += 20

  // Cases signatures
  doc.setDrawColor(...N200)
  doc.rect(14, y, 88, 36)
  doc.rect(108, y, 88, 36)
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.text('POUR L\'EMPLOYEUR', 18, y + 5)
  doc.text('POUR LE SALARIÉ', 112, y + 5)
  doc.setTextColor(...INK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(TENANT.name, 18, y + 11)
  doc.text(`${form.firstName} ${form.lastName}`, 112, y + 11)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...ORANGE)
  doc.text('« Signé électroniquement »', 18, y + 30)
  doc.text('« Signé électroniquement »', 112, y + 30)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'normal')

  footer(doc, 2, 2)
  doc.save(`contrat-${form.contract.toLowerCase()}-${form.firstName.toLowerCase()}-${form.lastName.toLowerCase()}.pdf`)
}

export function downloadAttestationPDF(e: Employee, type: 'travail' | 'cnps' | 'fiscal' | 'avenant' = 'travail') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const titles = {
    travail:  'Attestation de travail',
    cnps:     'Attestation CNPS',
    fiscal:   'Reçu fiscal annuel 2025',
    avenant:  'Avenant salaire',
  }
  const subs = {
    travail: `Émise à la demande de ${e.firstName} ${e.lastName}`,
    cnps:    `Attestation de cotisations CNPS · ${e.firstName} ${e.lastName}`,
    fiscal:  `Cumul fiscal 2025 · ${e.firstName} ${e.lastName}`,
    avenant: `Avenant au contrat de travail`,
  }
  header(doc, titles[type], subs[type])
  doc.setFontSize(10)
  let y = 55

  if (type === 'travail') {
    const lines = [
      `Je soussigné, représentant légal de ${TENANT.name} (IFU ${TENANT.ifu}, CNPS ${TENANT.cnps}), atteste par la présente que :`,
      '',
      `${e.firstName} ${e.lastName}, immatriculé(e) à la CNPS sous le n° ${e.matricule}, est employé(e) au sein de notre entreprise en qualité de ${e.role}, sous Contrat à Durée ${e.contract === 'CDI' ? 'Indéterminée' : 'Déterminée'} depuis le ${e.joinedAt}.`,
      '',
      `À ce titre, il/elle perçoit une rémunération mensuelle brute de ${fmtXOF(e.brut)}.`,
      '',
      `La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`,
    ]
    lines.forEach((l) => {
      const split = doc.splitTextToSize(l, 182)
      doc.text(split, 14, y)
      y += split.length * 5 + 2
    })
  } else if (type === 'cnps') {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    const lines = [
      `Nous certifions que ${e.firstName} ${e.lastName}, immatriculé(e) CNPS n° ${e.matricule}, est affilié(e) à la Caisse Nationale de Prévoyance Sociale via notre entreprise ${TENANT.name} (employeur CNPS ${TENANT.cnps}).`,
      '',
      `Cotisations mensuelles versées pour ce salarié en novembre 2026 :`,
    ]
    lines.forEach((l) => { const s = doc.splitTextToSize(l, 182); doc.text(s, 14, y); y += s.length * 5 + 2 })
    y += 4
    autoTable(doc, {
      startY: y,
      head: [['Cotisation', 'Base', 'Taux', 'Montant XOF']],
      body: [
        ['Retraite salariale',     fmtXOF(e.brut), '6,3 %',  fmtXOF(p.cnps)],
        ['Retraite patronale',     fmtXOF(e.brut), '7,7 %',  fmtXOF(e.brut * 0.077)],
        ['Prestations familiales', fmtXOF(e.brut), '5,75 %', fmtXOF(e.brut * 0.0575)],
        ['Accidents du travail',   fmtXOF(e.brut), '3,5 %',  fmtXOF(e.brut * 0.035)],
        [{ content: 'TOTAL CNPS', styles: { fontStyle: 'bold' } }, '', '', { content: fmtXOF(p.cnps + p.patron), styles: { fontStyle: 'bold' } }],
      ],
      headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    })
  } else if (type === 'fiscal') {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    autoTable(doc, {
      startY: y,
      head: [['Élément', 'Cumul annuel 2025 XOF']],
      body: [
        ['Salaire brut total',          fmtXOF(e.brut * 12)],
        ['CNPS salariale',              fmtXOF(p.cnps * 12)],
        ['ITS retenu',                  fmtXOF(p.its * 12)],
        ['IGR retenu',                  fmtXOF(p.igr * 12)],
        ['CN retenue',                  fmtXOF(p.cn * 12)],
        [{ content: 'NET PERÇU', styles: { fontStyle: 'bold' } }, { content: fmtXOF(p.net * 12), styles: { fontStyle: 'bold' } }],
      ],
      headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    })
  }

  // Signature
  doc.setDrawColor(...N200)
  doc.rect(108, 240, 88, 36)
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.text('POUR L\'EMPLOYEUR', 112, 245)
  doc.setTextColor(...INK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(TENANT.name, 112, 251)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...ORANGE)
  doc.text('« Signé électroniquement »', 112, 270)
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'normal')

  footer(doc, 1)
  doc.save(`${type}-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

export function downloadEmployeesExcel(employees: Employee[]) {
  const ws = XLSX.utils.json_to_sheet(employees.map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return {
      'Matricule CNPS':       e.matricule,
      'Prénom':               e.firstName,
      'Nom':                  e.lastName,
      'Fonction':             e.role,
      'Contrat':              e.contract,
      'Date d\'embauche':     e.joinedAt,
      'Statut':               e.status === 'active' ? 'Actif' : 'En congé',
      'Situation familiale':  e.family.situation,
      'Enfants':              e.family.kids,
      'Brut mensuel XOF':     e.brut,
      'CNPS salariale XOF':   Math.round(p.cnps),
      'ITS XOF':              Math.round(p.its),
      'IGR + CN XOF':         Math.round(p.igr + p.cn),
      'Net XOF':              Math.round(p.net),
      'Coût employeur XOF':   Math.round(p.total),
    }
  }))
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 9 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Annuaire salariés')
  XLSX.writeFile(wb, `annuaire-salaries-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function downloadImportTemplateExcel() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Prénom', 'Nom', 'Matricule CNPS', 'Fonction', 'Type contrat', 'Salaire brut XOF', 'Date embauche AAAA-MM-JJ', 'E-mail'],
    ['Aminata', 'Touré',   'CI-XXXXXXXX', 'Comptable', 'CDI', 380000, '2026-01-15', 'aminata.toure@example.ci'],
    ['Yacouba', 'Sanogo',  'CI-XXXXXXXX', 'Commercial', 'CDD', 220000, '2026-02-01', 'yacouba.sanogo@example.ci'],
    ['Mariam',  'Bamba',   'CI-XXXXXXXX', 'Designer',  'CDI', 410000, '2026-02-10', 'mariam.bamba@example.ci'],
  ])
  ws['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 26 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Modèle salariés')
  XLSX.writeFile(wb, 'modele-import-salaries-adc-paie.xlsx')
}

export function downloadLivrePaieExcel(employees: Employee[], period = 'Novembre 2026') {
  const rows = employees.filter((e) => e.status === 'active').map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return {
      'Matricule CNPS': e.matricule,
      'Salarié':         `${e.firstName} ${e.lastName}`,
      'Fonction':        e.role,
      'Contrat':         e.contract,
      'Jours travaillés': 22,
      'Brut':            e.brut,
      'CNPS':            Math.round(p.cnps),
      'ITS':             Math.round(p.its),
      'IGR':             Math.round(p.igr),
      'CN':              Math.round(p.cn),
      'Total retenues':  Math.round(p.cnps + p.its + p.igr + p.cn),
      'Net à payer':     Math.round(p.net),
      'Patron retraite': Math.round(e.brut * 0.077),
      'Patron PF':       Math.round(e.brut * 0.0575),
      'Patron AT':       Math.round(e.brut * 0.035),
      'Coût employeur':  Math.round(p.total),
    }
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Array(16).fill({ wch: 13 })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Livre de paie ${period}`)
  XLSX.writeFile(wb, `livre-paie-${period.replace(/ /g, '-').toLowerCase()}.xlsx`)
}

export function downloadDeclarationExcel(type: 'cnps' | 'dgi', period = 'Novembre 2026', employees: Employee[]) {
  const wb = XLSX.utils.book_new()
  const active = employees.filter((e) => e.status === 'active')
  if (type === 'cnps') {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return {
        'Mat. CNPS': e.matricule,
        'Nom prénom': `${e.lastName} ${e.firstName}`,
        'Salaire brut': e.brut,
        'Salariale 6,3 %': Math.round(p.cnps),
        'Patronale 7,7 %': Math.round(e.brut * 0.077),
        'Prest. familiales 5,75 %': Math.round(e.brut * 0.0575),
        'AT 3,5 %': Math.round(e.brut * 0.035),
        'Total cotisations': Math.round(p.cnps + p.patron),
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Bordereau CNPS')
  } else {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return {
        'Mat. CNPS': e.matricule,
        'Nom prénom': `${e.lastName} ${e.firstName}`,
        'Salaire brut': e.brut,
        'ITS': Math.round(p.its),
        'IGR': Math.round(p.igr),
        'CN': Math.round(p.cn),
        'Total retenu': Math.round(p.its + p.igr + p.cn),
      }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'État 301 DGI')
  }
  const name = type === 'cnps' ? `bordereau-cnps-${period.replace(/ /g, '-').toLowerCase()}.xlsx` : `etat-301-dgi-${period.replace(/ /g, '-').toLowerCase()}.xlsx`
  XLSX.writeFile(wb, name)
}

export function downloadAuditLogCSV(log: Array<{ action: string; actor: string; ip: string; when: string }>) {
  const rows = [['Date', 'Acteur', 'Action', 'IP'], ...log.map((l) => [l.when, l.actor, l.action, l.ip])]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `audit-log-adc-paie-${new Date().toISOString().slice(0, 10)}.csv`)
}

export async function downloadPayslipsZip(employees: Employee[], periods: string[]) {
  const zip = new JSZip()
  const folder = zip.folder('bulletins')!
  for (const period of periods) {
    for (const e of employees) {
      const doc = buildPayslipDoc(e, period)
      const blob = doc.output('blob')
      folder.file(`${period.replace(/ /g, '-').toLowerCase()}/bulletin-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`, blob)
    }
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `bulletins-archive-${new Date().toISOString().slice(0, 10)}.zip`)
}

export async function downloadAuditArchiveZip(employees: Employee[], period = 'Novembre 2026', items: string[]) {
  const zip = new JSZip()
  const active = employees.filter((e) => e.status === 'active')

  if (items.includes('bulletins')) {
    const folder = zip.folder('bulletins-pdf')!
    for (const e of active) {
      const doc = buildPayslipDoc(e, period)
      folder.file(`bulletin-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`, doc.output('blob'))
    }
  }
  if (items.includes('livre')) {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Matricule': e.matricule, 'Salarié': `${e.firstName} ${e.lastName}`, 'Brut': e.brut, 'CNPS': Math.round(p.cnps), 'ITS': Math.round(p.its), 'IGR': Math.round(p.igr), 'CN': Math.round(p.cn), 'Net': Math.round(p.net), 'Coût employeur': Math.round(p.total) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Livre de paie')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    zip.file('livre-de-paie.xlsx', buf)
  }
  if (items.includes('cnps')) {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat CNPS': e.matricule, 'Salarié': `${e.firstName} ${e.lastName}`, 'Brut': e.brut, 'Cotis salariale': Math.round(p.cnps), 'Cotis patronale': Math.round(p.patron) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Bordereau CNPS')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    zip.file('bordereau-cnps.xlsx', buf)
  }
  if (items.includes('dgi')) {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat CNPS': e.matricule, 'Salarié': `${e.firstName} ${e.lastName}`, 'Brut': e.brut, 'ITS': Math.round(p.its), 'IGR': Math.round(p.igr), 'CN': Math.round(p.cn) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'État 301')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    zip.file('etat-301-dgi.xlsx', buf)
  }
  if (items.includes('audit')) {
    const manifest = {
      tenant: TENANT.name,
      period,
      generated_at: new Date().toISOString(),
      generated_by: 'ADC Paie · adc-paie.vercel.app',
      employees_count: active.length,
      total_brut: active.reduce((s, e) => s + e.brut, 0),
      sha256: 'mock-' + Math.random().toString(36).slice(2, 14),
      legal_reference: 'Loi 2015-532 art. 32.5 · Conservation 5 ans',
    }
    zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  }
  if (items.includes('recap')) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    header(doc, 'Récapitulatif charges & retenues', `Période · ${period}`)
    const totals = active.reduce((acc, e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { brut: acc.brut + e.brut, cnps: acc.cnps + p.cnps, its: acc.its + p.its, igr: acc.igr + p.igr, cn: acc.cn + p.cn, net: acc.net + p.net, patron: acc.patron + p.patron }
    }, { brut: 0, cnps: 0, its: 0, igr: 0, cn: 0, net: 0, patron: 0 })
    autoTable(doc, {
      startY: 50,
      head: [['Poste', 'Montant XOF']],
      body: [
        ['Total brut',           fmtXOF(totals.brut)],
        ['CNPS salariales',      fmtXOF(totals.cnps)],
        ['ITS',                  fmtXOF(totals.its)],
        ['IGR',                  fmtXOF(totals.igr)],
        ['CN',                   fmtXOF(totals.cn)],
        ['Net total à verser',   fmtXOF(totals.net)],
        ['Charges patronales',   fmtXOF(totals.patron)],
        [{ content: 'Coût total employeur', styles: { fontStyle: 'bold' } }, { content: fmtXOF(totals.brut + totals.patron), styles: { fontStyle: 'bold', textColor: ORANGE } }],
      ],
      headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64] },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      theme: 'grid',
      margin: { left: 14, right: 14 },
    })
    footer(doc, 1)
    zip.file('recap-charges-retenues.pdf', doc.output('blob'))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `audit-paie-${period.replace(/ /g, '-').toLowerCase()}.zip`)
}

function buildPayslipDoc(e: Employee, period: string): jsPDF {
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
  const parts = 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  header(doc, 'Bulletin de paie', `Période · ${period}`)
  doc.setFontSize(8); doc.setTextColor(...N500)
  doc.text(`N° BUL-${period.replace(' ', '-').toLowerCase()}-${e.id.padStart(4, '0')}`, 196, 32, { align: 'right' })
  doc.setTextColor(...INK)
  doc.setDrawColor(...N200)
  doc.rect(14, 46, 88, 28); doc.rect(108, 46, 88, 28)
  doc.setFontSize(7); doc.setTextColor(...N500)
  doc.text('EMPLOYEUR', 18, 52); doc.text('SALARIÉ', 112, 52)
  doc.setTextColor(...INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text(TENANT.name, 18, 58); doc.text(`${e.firstName} ${e.lastName}`, 112, 58)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
  doc.text(`IFU · ${TENANT.ifu}`, 18, 64); doc.text(`${e.role} · ${e.contract}`, 112, 64)
  doc.text(`CNPS · ${TENANT.cnps}`, 18, 69); doc.text(`Mat · ${e.matricule} · ${parts} part(s)`, 112, 69)
  autoTable(doc, {
    startY: 80,
    head: [['Désignation', 'Base', 'Taux', 'À retenir']],
    body: [
      ['Salaire de base', '22 j', '—', fmtXOF(e.brut)],
      ['CNPS', fmtXOF(e.brut), '6,3 %', fmtXOF(p.cnps)],
      ['ITS progressif', fmtXOF(e.brut), '—', fmtXOF(p.its)],
      ['IGR', fmtXOF(e.brut), '1,5 %', fmtXOF(p.igr)],
      ['CN', fmtXOF(e.brut), '1,5 %', fmtXOF(p.cn)],
    ],
    foot: [[{ content: 'NET À PAYER', colSpan: 3, styles: { fontStyle: 'bold' } }, { content: fmtXOF(p.net), styles: { fontStyle: 'bold', textColor: ORANGE } }]],
    headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64], fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })
  footer(doc, 1)
  return doc
}

export function downloadAttendanceSheetPDF(employees: Employee[], punches: Map<string, { status: string; punch: { in?: string; out?: string } }>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  header(doc, 'Feuille de présence', today)
  const active = employees.filter((e) => e.status === 'active')
  autoTable(doc, {
    startY: 50,
    head: [['Salarié', 'Matricule', 'Fonction', 'Statut', 'Entrée', 'Sortie']],
    body: active.map((e) => {
      const p = punches.get(e.id) || { status: 'absent', punch: {} }
      return [`${e.firstName} ${e.lastName}`, e.matricule, e.role, p.status, p.punch.in || '—', p.punch.out || '—']
    }),
    headStyles: { fillColor: [245, 245, 245], textColor: [64, 64, 64], fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    theme: 'grid',
    margin: { left: 14, right: 14 },
  })
  footer(doc, 1)
  doc.save(`feuille-presence-${new Date().toISOString().slice(0, 10)}.pdf`)
}
