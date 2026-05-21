import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { computePayslip, type Employee } from './mock'
import { store, type Org } from './store'

const ORANGE: [number, number, number] = [249, 115, 22]
const INK: [number, number, number] = [10, 10, 10]
const N700: [number, number, number] = [64, 64, 64]
const N500: [number, number, number] = [115, 115, 115]
const N200: [number, number, number] = [229, 229, 229]
const N50: [number, number, number] = [250, 250, 250]

const M = 16
const PAGE_W = 210
const CONTENT_W = PAGE_W - M * 2

function fmtXOF(n: number): string {
  // ASCII space pur (U+0020) pour éviter le narrow-no-break-space (U+202F) que jsPDF helvetica rend en '/'
  const num = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return num + ' FCFA'
}

function getOrg(): Org {
  return store.getOrg()
}

function drawHeader(doc: jsPDF, opts: { title: string; subtitle?: string; ref?: string }) {
  const org = getOrg()
  const { title, subtitle, ref } = opts

  // Bandeau ink full width
  doc.setFillColor(...INK)
  doc.rect(0, 0, PAGE_W, 22, 'F')

  // Mini bloc orange en haut-gauche en accent
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, 6, 22, 'F')

  // Nom organisation (gros, blanc) à gauche
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(org.name, M, 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(190, 190, 190)
  doc.text(`${org.city}  ·  IFU ${org.ifu}  ·  CNPS ${org.cnps}`, M, 16)

  // Badge édité par à droite
  doc.setFontSize(7)
  doc.setTextColor(190, 190, 190)
  doc.text('Édité par', PAGE_W - M, 9, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('ADC', PAGE_W - M - 13, 16, { align: 'left' })
  doc.setTextColor(...ORANGE)
  doc.setFont('helvetica', 'italic')
  doc.text('Paie', PAGE_W - M - 5, 16, { align: 'left' })

  // Section titre éditoriale : grand titre + filet orange épais sous le titre + label uppercase
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  const labelTitle = title.toUpperCase()
  // tracking large simulé via espacement
  doc.text(labelTitle.split('').join(' '), M, 32)

  // Filet orange épais
  doc.setFillColor(...ORANGE)
  doc.rect(M, 35, 20, 1.2, 'F')

  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(13)
    doc.setTextColor(...INK)
    doc.text(subtitle, M, 44)
  }

  if (ref) {
    doc.setFontSize(7)
    doc.setTextColor(...N500)
    doc.text('RÉFÉRENCE', PAGE_W - M, 32, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(ref, PAGE_W - M, 38, { align: 'right' })
  }
}

function drawFooter(doc: jsPDF) {
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...N200)
    doc.setLineWidth(0.3)
    doc.line(M, 282, PAGE_W - M, 282)
    doc.setFontSize(7)
    doc.setTextColor(...N500)
    doc.text('Édité par', M, 287)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK)
    doc.text('ADC', M + 11, 287)
    doc.setTextColor(...ORANGE)
    doc.setFont('helvetica', 'italic')
    doc.text('Paie', M + 18, 287)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...N500)
    doc.text('· adc-paie.vercel.app · African Digit Consulting', M + 24, 287)
    const dateStr = `Édité le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    doc.text(dateStr, PAGE_W / 2, 287, { align: 'center' })
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - M, 287, { align: 'right' })
  }
}

function drawInfoBoxes(doc: jsPDF, y: number, left: { title: string; lines: string[] }, right: { title: string; lines: string[] }) {
  const colW = (CONTENT_W - 16) / 2
  const boxH = 30

  // Pas de cadre, juste un trait vertical orange entre les 2 colonnes (style éditorial)
  doc.setDrawColor(...ORANGE)
  doc.setLineWidth(0.4)
  doc.line(M + colW + 8, y + 2, M + colW + 8, y + boxH - 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...ORANGE)
  doc.text(left.title.toUpperCase().split('').join(' '), M, y + 5)
  doc.text(right.title.toUpperCase().split('').join(' '), M + colW + 16, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text((left.lines[0] || '').slice(0, 38), M, y + 13)
  doc.text((right.lines[0] || '').slice(0, 38), M + colW + 16, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...N700)
  left.lines.slice(1).forEach((l, i) => {
    doc.text(l.slice(0, 42), M, y + 19 + i * 4.5)
  })
  right.lines.slice(1).forEach((l, i) => {
    doc.text(l.slice(0, 42), M + colW + 16, y + 19 + i * 4.5)
  })

  return y + boxH + 4
}

export function downloadPayslipPDF(e: Employee, period = 'Novembre 2026') {
  const org = getOrg()
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
  const parts = 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: 'Bulletin de paie', subtitle: `Période · ${period} · paiement le 5 du mois suivant`, ref: `N° BUL-${period.replace(/ /g, '-')}-${e.id.padStart(4, '0')}` })

  let y = drawInfoBoxes(doc, 50,
    { title: 'Employeur', lines: [org.name, org.city, `IFU ${org.ifu}`, `CNPS ${org.cnps}`] },
    { title: 'Salarié', lines: [`${e.firstName} ${e.lastName}`, `${e.role} · ${e.contract}`, `Mat. CNPS ${e.matricule}`, `${e.family.situation} · ${e.family.kids} enfant(s) · ${parts} part(s)`] }
  )

  autoTable(doc, {
    startY: y,
    head: [['Désignation', 'Base', 'Taux', 'À payer', 'À retenir']],
    body: [
      ['Salaire de base', '22 jours', '—', fmtXOF(e.brut), ''],
      [{ content: 'Salaire brut', styles: { fontStyle: 'bold', fillColor: N50 } }, { content: '', styles: { fillColor: N50 } }, { content: '', styles: { fillColor: N50 } }, { content: fmtXOF(e.brut), styles: { fontStyle: 'bold', fillColor: N50 } }, { content: '', styles: { fillColor: N50 } }],
      ['CNPS retraite + CMU', fmtXOF(e.brut), '6,3 %', '', fmtXOF(p.cnps)],
      ['ITS (quotient familial)', fmtXOF(e.brut), 'progressif', '', fmtXOF(p.its)],
      ['IGR · Impôt Général', fmtXOF(e.brut), '1,5 %', '', fmtXOF(p.igr)],
      ['CN · Contribution Nationale', fmtXOF(e.brut), '1,5 %', '', fmtXOF(p.cn)],
    ],
    foot: [[
      { content: 'NET À PAYER', colSpan: 4, styles: { halign: 'left', fontStyle: 'bold', fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 13, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 } } },
      { content: fmtXOF(p.net), styles: { halign: 'right', fontStyle: 'bold', fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 14, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 } } },
    ]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8, fontStyle: 'bold', halign: 'left', cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
    bodyStyles: { fontSize: 9.5, textColor: N700 as any, cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 } },
    alternateRowStyles: { fillColor: [252, 252, 252] as any },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', textColor: ORANGE as any, fontStyle: 'bold' } },
    theme: 'plain',
    margin: { left: M, right: M },
    didDrawCell: (data) => {
      if (data.section === 'body') {
        const doc = data.doc
        doc.setDrawColor(...N200)
        doc.setLineWidth(0.15)
        doc.line(M, data.cell.y + data.cell.height, PAGE_W - M, data.cell.y + data.cell.height)
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // Charges patronales (boîte gauche) + Mentions légales (boîte droite)
  const colW = (CONTENT_W - 6) / 2
  doc.setDrawColor(...N200)
  doc.setFillColor(...N50)
  doc.roundedRect(M, y, colW, 50, 1, 1, 'FD')
  doc.roundedRect(M + colW + 6, y, colW, 50, 1, 1, 'FD')

  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'bold')
  doc.text('CHARGES PATRONALES', M + 4, y + 6)
  doc.text('MENTIONS LÉGALES', M + colW + 10, y + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...INK)

  const patronLines = [
    ['Retraite (7,7 %)', fmtXOF(e.brut * 0.077)],
    ['Prestations familiales (5,75 %)', fmtXOF(e.brut * 0.0575)],
    ['Accidents du travail (3,5 %)', fmtXOF(e.brut * 0.035)],
  ]
  patronLines.forEach((l, i) => {
    doc.text(l[0], M + 4, y + 13 + i * 5)
    doc.text(l[1], M + colW - 4, y + 13 + i * 5, { align: 'right' })
  })
  doc.setDrawColor(...N200)
  doc.line(M + 4, y + 30, M + colW - 4, y + 30)
  doc.setFont('helvetica', 'bold')
  doc.text('Total patronal', M + 4, y + 35)
  doc.text(fmtXOF(e.brut * 0.17), M + colW - 4, y + 35, { align: 'right' })
  doc.setTextColor(...ORANGE)
  doc.text('Coût total employeur', M + 4, y + 42)
  doc.text(fmtXOF(e.brut + e.brut * 0.17), M + colW - 4, y + 42, { align: 'right' })
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'normal')

  doc.setFontSize(7)
  doc.setTextColor(...N700)
  const legal = "Bulletin émis conformément à l'article 32.5 du Code du travail ivoirien (Loi 2015-532). Conservation obligatoire 5 ans. En cas de litige, ce document fait foi de la rémunération versée."
  const lines = doc.splitTextToSize(legal, colW - 8)
  doc.text(lines, M + colW + 10, y + 12)
  doc.setTextColor(...N500)
  doc.text('Signé numériquement · SHA-256', M + colW + 10, y + 44)

  drawFooter(doc)
  doc.save(`bulletin-${period.replace(/ /g, '-').toLowerCase()}-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

export function downloadContratPDF(form: { firstName: string; lastName: string; gender: string; birthDate: string; nationality: string; contract: string; role: string; startDate: string; endDate?: string; trialMonths: number; email: string; phone: string; address: string; brut: number; cnpsMat: string; familySituation: string; kids: number }) {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: `Contrat ${form.contract}`, subtitle: `Entre ${org.name} et ${form.firstName} ${form.lastName}` })

  let y = 44
  const writeSection = (title: string, body: string) => {
    if (y > 240) { drawFooter(doc); doc.addPage(); drawHeader(doc, { title: `Contrat ${form.contract} · suite`, subtitle: `${form.firstName} ${form.lastName}` }); y = 44 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(title, M, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...N700)
    const lines = doc.splitTextToSize(body, CONTENT_W)
    doc.text(lines, M, y)
    y += lines.length * 4.4 + 5
  }

  writeSection('Article 1 · Identification des parties',
    `Employeur : ${org.name}, IFU ${org.ifu}, CNPS ${org.cnps}, situé à ${org.city}, représenté par son représentant légal.\n\nSalarié : ${form.firstName} ${form.lastName} (${form.gender === 'F' ? 'Mme' : 'M.'}), né(e) le ${form.birthDate}, de nationalité ${form.nationality}, demeurant ${form.address}, joignable au ${form.phone} (e-mail : ${form.email}), situation familiale ${form.familySituation} avec ${form.kids} enfant(s) à charge, immatriculé(e) CNPS n° ${form.cnpsMat}.`)
  writeSection('Article 2 · Nature et objet',
    `Le présent contrat est un ${form.contract === 'CDI' ? 'Contrat à Durée Indéterminée (CDI)' : form.contract === 'CDD' ? 'Contrat à Durée Déterminée (CDD)' : 'Contrat de Stage'} régi par la Loi 2015-532 portant Code du travail de Côte d'Ivoire. Le salarié est engagé en qualité de ${form.role}.`)
  writeSection('Article 3 · Date d\'effet et durée',
    `Le contrat prend effet le ${form.startDate}.${form.contract !== 'CDI' ? ` Il prendra fin le ${form.endDate}.` : ' Il est conclu pour une durée indéterminée.'} ${form.trialMonths > 0 ? `Une période d'essai de ${form.trialMonths} mois est prévue.` : ''}`)
  const preview = computePayslip(form.brut, form.kids, form.familySituation === 'marié(e)')
  writeSection('Article 4 · Rémunération',
    `Le salarié percevra une rémunération mensuelle brute de ${fmtXOF(form.brut)}, payable au plus tard le 5 du mois suivant la période travaillée. Le bulletin sera émis conformément à l'art. 32.5. Net mensuel estimé : ${fmtXOF(preview.net)} après CNPS, ITS, IGR et CN.`)
  writeSection('Article 5 · Lieu et conditions de travail',
    `Lieu : ${org.city}. Durée hebdomadaire : 40 heures du lundi au vendredi.`)
  writeSection('Article 6 · Congés payés',
    `Le salarié acquiert 2,2 jours ouvrables par mois de travail effectif (26,4 jours par an), conformément à l'art. 25 du Code du travail.`)
  writeSection('Article 7 · Confidentialité',
    `Le salarié s'engage à respecter la confidentialité de toute information dont il a connaissance dans le cadre de ses fonctions et cède à l'employeur les droits de propriété intellectuelle sur les œuvres créées.`)
  writeSection('Article 8 · Rupture du contrat',
    form.contract === 'CDI'
      ? `Le contrat peut être rompu par chacune des parties moyennant un préavis fixé par la convention collective et le Code du travail.`
      : `Le contrat prend fin à l'échéance prévue. Toute rupture anticipée doit respecter les dispositions légales.`)
  writeSection('Article 9 · Litiges',
    `Tout litige est soumis au Tribunal du Travail d'Abidjan, après tentative de règlement amiable.`)

  if (y > 230) { drawFooter(doc); doc.addPage(); drawHeader(doc, { title: 'Signatures', subtitle: `${form.firstName} ${form.lastName}` }); y = 44 }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text(`Fait à ${org.city}, le ${form.startDate || new Date().toLocaleDateString('fr-FR')}, en deux exemplaires originaux.`, M, y)
  y += 12
  const colW = (CONTENT_W - 8) / 2
  doc.setDrawColor(...N200)
  doc.setFillColor(...N50)
  doc.roundedRect(M, y, colW, 36, 1, 1, 'FD')
  doc.roundedRect(M + colW + 8, y, colW, 36, 1, 1, 'FD')
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'bold')
  doc.text('POUR L\'EMPLOYEUR', M + 4, y + 6)
  doc.text('POUR LE SALARIÉ', M + colW + 12, y + 6)
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(org.name, M + 4, y + 13)
  doc.text(`${form.firstName} ${form.lastName}`, M + colW + 12, y + 13)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(...ORANGE)
  doc.text('« Signé électroniquement »', M + 4, y + 30)
  doc.text('« Signé électroniquement »', M + colW + 12, y + 30)

  drawFooter(doc)
  doc.save(`contrat-${form.contract.toLowerCase()}-${form.firstName.toLowerCase()}-${form.lastName.toLowerCase()}.pdf`)
}

export function downloadAttestationPDF(e: Employee, type: 'travail' | 'cnps' | 'fiscal' | 'avenant' = 'travail') {
  const org = getOrg()
  const titles = { travail: 'Attestation de travail', cnps: 'Attestation CNPS', fiscal: 'Reçu fiscal annuel 2025', avenant: 'Avenant au contrat' }
  const subs = { travail: `Pour ${e.firstName} ${e.lastName}`, cnps: `Cotisations CNPS · ${e.firstName} ${e.lastName}`, fiscal: `Cumul fiscal 2025 · ${e.firstName} ${e.lastName}`, avenant: `Avenant salaire · ${e.firstName} ${e.lastName}` }
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: titles[type], subtitle: subs[type] })

  let y = 50
  const writePara = (text: string) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    const lines = doc.splitTextToSize(text, CONTENT_W)
    doc.text(lines, M, y)
    y += lines.length * 5 + 4
  }

  if (type === 'travail') {
    writePara(`Je soussigné, représentant légal de ${org.name} (IFU ${org.ifu}, CNPS ${org.cnps}, situé à ${org.city}), atteste que :`)
    writePara(`${e.firstName} ${e.lastName}, immatriculé(e) CNPS n° ${e.matricule}, est employé(e) au sein de notre entreprise en qualité de ${e.role}, sous Contrat à Durée ${e.contract === 'CDI' ? 'Indéterminée' : 'Déterminée'} depuis le ${e.joinedAt}.`)
    writePara(`À ce titre, il/elle perçoit une rémunération mensuelle brute de ${fmtXOF(e.brut)}.`)
    writePara(`La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`)
    writePara(`Fait à ${org.city}, le ${new Date().toLocaleDateString('fr-FR')}.`)
  } else if (type === 'cnps') {
    writePara(`Nous certifions que ${e.firstName} ${e.lastName} (mat. CNPS ${e.matricule}) est affilié(e) à la Caisse Nationale de Prévoyance Sociale via ${org.name} (employeur CNPS ${org.cnps}).`)
    writePara(`Détail des cotisations mensuelles versées pour ce salarié :`)
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    autoTable(doc, {
      startY: y,
      head: [['Cotisation', 'Base XOF', 'Taux', 'Montant XOF']],
      body: [
        ['Retraite salariale', fmtXOF(e.brut), '6,3 %', fmtXOF(p.cnps)],
        ['Retraite patronale', fmtXOF(e.brut), '7,7 %', fmtXOF(e.brut * 0.077)],
        ['Prestations familiales', fmtXOF(e.brut), '5,75 %', fmtXOF(e.brut * 0.0575)],
        ['Accidents du travail', fmtXOF(e.brut), '3,5 %', fmtXOF(e.brut * 0.035)],
      ],
      foot: [[{ content: 'Total CNPS', colSpan: 3, styles: { fontStyle: 'bold' } as any }, { content: fmtXOF(p.cnps + e.brut * 0.17), styles: { fontStyle: 'bold' } as any }]],
      headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      theme: 'grid',
      margin: { left: M, right: M },
    })
  } else if (type === 'fiscal') {
    writePara(`Récapitulatif fiscal annuel 2025 délivré à ${e.firstName} ${e.lastName} (mat. ${e.matricule}) par ${org.name} (IFU ${org.ifu}).`)
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    autoTable(doc, {
      startY: y,
      head: [['Élément', 'Cumul 2025 XOF']],
      body: [
        ['Salaire brut total', fmtXOF(e.brut * 12)],
        ['CNPS salariale retenue', fmtXOF(p.cnps * 12)],
        ['ITS', fmtXOF(p.its * 12)],
        ['IGR', fmtXOF(p.igr * 12)],
        ['CN', fmtXOF(p.cn * 12)],
      ],
      foot: [[{ content: 'NET PERÇU', styles: { fontStyle: 'bold' } as any }, { content: fmtXOF(p.net * 12), styles: { fontStyle: 'bold', textColor: ORANGE as any } as any }]],
      headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
      theme: 'grid',
      margin: { left: M, right: M },
    })
  } else {
    writePara(`Avenant au contrat de travail entre ${org.name} et ${e.firstName} ${e.lastName}.`)
    writePara(`À compter du ${new Date().toLocaleDateString('fr-FR')}, la rémunération mensuelle brute du salarié est portée à ${fmtXOF(e.brut)}.`)
    writePara(`Toutes les autres clauses du contrat initial restent inchangées.`)
  }

  // Signature box bottom-right
  doc.setDrawColor(...N200)
  doc.setFillColor(...N50)
  doc.roundedRect(PAGE_W - M - 80, 240, 80, 36, 1, 1, 'FD')
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'bold')
  doc.text('POUR L\'EMPLOYEUR', PAGE_W - M - 76, 246)
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(org.name, PAGE_W - M - 76, 253)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...ORANGE)
  doc.text('« Signé électroniquement »', PAGE_W - M - 76, 270)

  drawFooter(doc)
  doc.save(`${type}-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

function setExcelMeta(wb: XLSX.WorkBook) {
  const org = getOrg()
  wb.Props = { Title: 'ADC Paie · ' + org.name, Author: 'ADC Paie · adc-paie.vercel.app', Company: org.name, CreatedDate: new Date() }
}

export function downloadEmployeesExcel(employees: Employee[]) {
  const ws = XLSX.utils.json_to_sheet(employees.map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { 'Matricule CNPS': e.matricule, 'Prénom': e.firstName, 'Nom': e.lastName, 'Fonction': e.role, 'Contrat': e.contract, 'Date d\'embauche': e.joinedAt, 'Statut': e.status === 'active' ? 'Actif' : 'En congé', 'Situation': e.family.situation, 'Enfants': e.family.kids, 'Brut XOF': e.brut, 'CNPS XOF': Math.round(p.cnps), 'ITS XOF': Math.round(p.its), 'IGR+CN XOF': Math.round(p.igr + p.cn), 'Net XOF': Math.round(p.net), 'Coût employeur XOF': Math.round(p.total) }
  }))
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 9 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  setExcelMeta(wb)
  XLSX.utils.book_append_sheet(wb, ws, 'Annuaire salariés')
  XLSX.writeFile(wb, `annuaire-salaries-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function downloadImportTemplateExcel() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Prénom', 'Nom', 'Matricule CNPS', 'Fonction', 'Type contrat', 'Salaire brut XOF', 'Date embauche AAAA-MM-JJ', 'E-mail'],
    ['Aminata', 'Touré', 'CI-XXXXXXXX', 'Comptable', 'CDI', 380000, '2026-01-15', 'aminata.toure@example.ci'],
    ['Yacouba', 'Sanogo', 'CI-XXXXXXXX', 'Commercial', 'CDD', 220000, '2026-02-01', 'yacouba.sanogo@example.ci'],
  ])
  ws['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 26 }]
  const wb = XLSX.utils.book_new(); setExcelMeta(wb)
  XLSX.utils.book_append_sheet(wb, ws, 'Modèle salariés')
  XLSX.writeFile(wb, 'modele-import-salaries-adc-paie.xlsx')
}

export function downloadDeclarationExcel(type: 'cnps' | 'dgi', period = 'Novembre 2026', employees: Employee[]) {
  const wb = XLSX.utils.book_new(); setExcelMeta(wb)
  const active = employees.filter((e) => e.status === 'active')
  if (type === 'cnps') {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat. CNPS': e.matricule, 'Nom prénom': `${e.lastName} ${e.firstName}`, 'Salaire brut': e.brut, 'Salariale 6,3%': Math.round(p.cnps), 'Patronale 7,7%': Math.round(e.brut * 0.077), 'Prest. familiales 5,75%': Math.round(e.brut * 0.0575), 'AT 3,5%': Math.round(e.brut * 0.035), 'Total cotisations': Math.round(p.cnps + e.brut * 0.17) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Bordereau CNPS')
  } else {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat. CNPS': e.matricule, 'Nom prénom': `${e.lastName} ${e.firstName}`, 'Salaire brut': e.brut, 'ITS': Math.round(p.its), 'IGR': Math.round(p.igr), 'CN': Math.round(p.cn), 'Total retenu': Math.round(p.its + p.igr + p.cn) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'État 301 DGI')
  }
  const name = type === 'cnps' ? `bordereau-cnps-${period.replace(/ /g, '-').toLowerCase()}.xlsx` : `etat-301-${period.replace(/ /g, '-').toLowerCase()}.xlsx`
  XLSX.writeFile(wb, name)
}

export function downloadAuditLogCSV(log: Array<{ action: string; actor: string; ip: string; when: string }>) {
  const org = getOrg()
  const rows = [
    [`# Audit log · ${org.name} · IFU ${org.ifu}`],
    [`# Édité par ADC Paie · ${new Date().toLocaleDateString('fr-FR')}`],
    [''],
    ['Date', 'Acteur', 'Action', 'IP'],
    ...log.map((l) => [l.when, l.actor, l.action, l.ip]),
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  saveAs(blob, `audit-log-${org.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`)
}

export async function downloadPayslipsZip(employees: Employee[], periods: string[]) {
  const zip = new JSZip()
  const folder = zip.folder('bulletins')!
  for (const period of periods) {
    for (const e of employees) {
      const doc = buildPayslipDoc(e, period)
      folder.file(`${period.replace(/ /g, '-').toLowerCase()}/bulletin-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`, doc.output('blob'))
    }
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `bulletins-archive-${new Date().toISOString().slice(0, 10)}.zip`)
}

export async function downloadAuditArchiveZip(employees: Employee[], period = 'Novembre 2026', items: string[]) {
  const org = getOrg()
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
    const wb = XLSX.utils.book_new(); setExcelMeta(wb)
    XLSX.utils.book_append_sheet(wb, ws, 'Livre de paie')
    zip.file('livre-de-paie.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'array' }))
  }
  if (items.includes('cnps')) {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat CNPS': e.matricule, 'Salarié': `${e.firstName} ${e.lastName}`, 'Brut': e.brut, 'Cotis salariale': Math.round(p.cnps), 'Cotis patronale': Math.round(e.brut * 0.17) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new(); setExcelMeta(wb)
    XLSX.utils.book_append_sheet(wb, ws, 'Bordereau CNPS')
    zip.file('bordereau-cnps.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'array' }))
  }
  if (items.includes('dgi')) {
    const rows = active.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { 'Mat CNPS': e.matricule, 'Salarié': `${e.firstName} ${e.lastName}`, 'Brut': e.brut, 'ITS': Math.round(p.its), 'IGR': Math.round(p.igr), 'CN': Math.round(p.cn) }
    })
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new(); setExcelMeta(wb)
    XLSX.utils.book_append_sheet(wb, ws, 'État 301')
    zip.file('etat-301-dgi.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'array' }))
  }
  if (items.includes('audit')) {
    const manifest = { tenant: org.name, ifu: org.ifu, cnps: org.cnps, period, generated_at: new Date().toISOString(), generated_by: 'ADC Paie · adc-paie.vercel.app', employees_count: active.length, total_brut: active.reduce((s, e) => s + e.brut, 0), sha256: 'mock-' + Math.random().toString(36).slice(2, 14), legal_reference: 'Loi 2015-532 art. 32.5 · Conservation 5 ans' }
    zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  }
  if (items.includes('recap')) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    drawHeader(doc, { title: 'Récapitulatif charges & retenues', subtitle: `Période · ${period}` })
    const t = active.reduce((acc, e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return { brut: acc.brut + e.brut, cnps: acc.cnps + p.cnps, its: acc.its + p.its, igr: acc.igr + p.igr, cn: acc.cn + p.cn, net: acc.net + p.net, patron: acc.patron + p.patron }
    }, { brut: 0, cnps: 0, its: 0, igr: 0, cn: 0, net: 0, patron: 0 })
    autoTable(doc, {
      startY: 46,
      head: [['Poste', 'Montant XOF']],
      body: [['Total brut', fmtXOF(t.brut)], ['CNPS salariales', fmtXOF(t.cnps)], ['ITS', fmtXOF(t.its)], ['IGR', fmtXOF(t.igr)], ['CN', fmtXOF(t.cn)], ['Net total à verser', fmtXOF(t.net)], ['Charges patronales', fmtXOF(t.patron)]],
      foot: [[{ content: 'COÛT TOTAL EMPLOYEUR', styles: { fontStyle: 'bold' } as any }, { content: fmtXOF(t.brut + t.patron), styles: { fontStyle: 'bold', textColor: ORANGE as any } as any }]],
      headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      theme: 'grid', margin: { left: M, right: M },
    })
    drawFooter(doc)
    zip.file('recap-charges-retenues.pdf', doc.output('blob'))
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `audit-paie-${period.replace(/ /g, '-').toLowerCase()}.zip`)
}

function buildPayslipDoc(e: Employee, period: string): jsPDF {
  const org = getOrg()
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
  const parts = 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: 'Bulletin de paie', subtitle: `Période · ${period}`, ref: `N° BUL-${period.replace(/ /g, '-')}-${e.id.padStart(4, '0')}` })
  let y = drawInfoBoxes(doc, 42,
    { title: 'Employeur', lines: [org.name, org.city, `IFU · ${org.ifu}`, `CNPS · ${org.cnps}`] },
    { title: 'Salarié', lines: [`${e.firstName} ${e.lastName}`, `${e.role} · ${e.contract}`, `Mat · ${e.matricule} · ${parts} part(s)`] }
  )
  autoTable(doc, {
    startY: y,
    head: [['Désignation', 'Base', 'Taux', 'À retenir']],
    body: [['Salaire de base', '22 j', '—', fmtXOF(e.brut)], ['CNPS', fmtXOF(e.brut), '6,3 %', fmtXOF(p.cnps)], ['ITS', fmtXOF(e.brut), 'progressif', fmtXOF(p.its)], ['IGR', fmtXOF(e.brut), '1,5 %', fmtXOF(p.igr)], ['CN', fmtXOF(e.brut), '1,5 %', fmtXOF(p.cn)]],
    foot: [[{ content: 'NET À PAYER', colSpan: 3, styles: { fontStyle: 'bold' } as any }, { content: fmtXOF(p.net), styles: { fontStyle: 'bold', textColor: ORANGE as any } as any }]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    theme: 'grid', margin: { left: M, right: M },
  })
  drawFooter(doc)
  return doc
}

export function downloadAttendanceSheetPDF(employees: Employee[], punches: Map<string, { status: string; punch: { in?: string; out?: string } }>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  drawHeader(doc, { title: 'Feuille de présence', subtitle: today })
  const active = employees.filter((e) => e.status === 'active')
  autoTable(doc, {
    startY: 42,
    head: [['Salarié', 'Matricule', 'Fonction', 'Statut', 'Entrée', 'Sortie']],
    body: active.map((e) => {
      const p = punches.get(e.id) || { status: 'absent', punch: {} }
      return [`${e.firstName} ${e.lastName}`, e.matricule, e.role.length > 22 ? e.role.slice(0, 22) + '…' : e.role, p.status, p.punch.in || '—', p.punch.out || '—']
    }),
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  drawFooter(doc)
  doc.save(`feuille-presence-${new Date().toISOString().slice(0, 10)}.pdf`)
}
