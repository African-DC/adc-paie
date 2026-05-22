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
      ['CNPS (retraite, famille, AT)', fmtXOF(e.brut), '6,3 %', '', fmtXOF(p.cnps)],
      ['CMU · Couverture Maladie Univ.', '—', 'forfait', '', fmtXOF(p.cmuSal)],
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

  y = (doc as any).lastAutoTable.finalY + 6

  // Cumuls annuels (Art. 32.5 obligation) — bandeau ink + orange
  const monthNum = (() => {
    const idx = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'].indexOf(period.toLowerCase().split(' ')[0])
    return idx >= 0 ? idx + 1 : 11
  })()
  doc.setFillColor(...INK)
  doc.rect(M, y, CONTENT_W, 14, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(M, y, 2.5, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text(`C U M U L S   D E P U I S   L E   1 E R   J A N V I E R   (${monthNum}/12)`, M + 6, y + 5)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Brut · ${fmtXOF(e.brut * monthNum)}`, M + 6, y + 11)
  doc.text(`Retenues · ${fmtXOF(Math.round((p.cnps + p.cmuSal + p.its + p.igr + p.cn) * monthNum))}`, M + 76, y + 11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...ORANGE)
  doc.text(`Net cumulé · ${fmtXOF(Math.round(p.net * monthNum))}`, PAGE_W - M - 4, y + 11, { align: 'right' })
  y += 18

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
  const legal = `Bulletin émis conformément à l'article 32.5 du Code du travail ivoirien (Loi 2015-532). Convention collective applicable : ${(getOrg() as any).convention || 'Interprofessionnelle 1977'}. À conserver sans limitation de durée. En cas de litige, ce document fait foi de la rémunération versée.`
  const lines = doc.splitTextToSize(legal, colW - 8)
  doc.text(lines, M + colW + 10, y + 12)
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'bold')
  doc.text('À CONSERVER SANS LIMITATION', M + colW + 10, y + 40)
  doc.setFont('helvetica', 'normal')
  doc.text('Signé numériquement · SHA-256', M + colW + 10, y + 45)

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
      head: [['Cotisation', 'Base FCFA', 'Taux', 'Montant FCFA']],
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
      head: [['Élément', 'Cumul 2025 FCFA']],
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
    return { 'Matricule CNPS': e.matricule, 'Prénom': e.firstName, 'Nom': e.lastName, 'Fonction': e.role, 'Contrat': e.contract, 'Date d\'embauche': e.joinedAt, 'Statut': e.status === 'active' ? 'Actif' : 'En congé', 'Situation': e.family.situation, 'Enfants': e.family.kids, 'Brut FCFA': e.brut, 'CNPS FCFA': Math.round(p.cnps), 'ITS FCFA': Math.round(p.its), 'IGR+CN FCFA': Math.round(p.igr + p.cn), 'Net FCFA': Math.round(p.net), 'Coût employeur FCFA': Math.round(p.total) }
  }))
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 9 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 8 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  setExcelMeta(wb)
  XLSX.utils.book_append_sheet(wb, ws, 'Annuaire salariés')
  XLSX.writeFile(wb, `annuaire-salaries-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function downloadImportTemplateExcel() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Prénom', 'Nom', 'Matricule CNPS', 'Fonction', 'Type contrat', 'Salaire brut FCFA', 'Date embauche AAAA-MM-JJ', 'E-mail'],
    ['Aminata', 'Touré', 'CI-XXXXXXXX', 'Comptable', 'CDI', 380000, '2026-01-15', 'aminata.toure@example.ci'],
    ['Yacouba', 'Sanogo', 'CI-XXXXXXXX', 'Commercial', 'CDD', 220000, '2026-02-01', 'yacouba.sanogo@example.ci'],
  ])
  ws['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 26 }]
  const wb = XLSX.utils.book_new(); setExcelMeta(wb)
  XLSX.utils.book_append_sheet(wb, ws, 'Modèle salariés')
  XLSX.writeFile(wb, 'modele-import-salaries-adc-paie.xlsx')
}

// Déclarations ANNUELLES
export function downloadDISAExcel(employees: Employee[], year = 2025) {
  // DISA = Déclaration Individuelle des Salaires Annuels (CNPS, échéance 31 mars)
  // 1 ligne par salarié × 12 mois récap, brut annuel et cotisations totales
  const rows = employees.filter((e) => e.status === 'active').map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return {
      'Matricule CNPS': e.matricule,
      'Prénom': e.firstName,
      'Nom': e.lastName,
      'Date embauche': e.joinedAt,
      'Fonction': e.role,
      'Mois cotisés': 12,
      'Brut annuel FCFA': e.brut * 12,
      'CNPS sal. 6.3 % annuel': Math.round(p.cnps * 12),
      'CNPS pat. 16.9 % annuel': Math.round(e.brut * 12 * 0.169),
      'Total cotisations CNPS annuel': Math.round((p.cnps + e.brut * 0.169) * 12),
    }
  })
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 26 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws, `DISA ${year}`)
  // 2e feuille DASC récap
  const total = rows.reduce((s, r) => s + (r['Total cotisations CNPS annuel'] as number), 0)
  const totalBrut = rows.reduce((s, r) => s + (r['Brut annuel FCFA'] as number), 0)
  const dasc = [
    { Rubrique: 'Effectif déclaré',                       Valeur: rows.length },
    { Rubrique: `Masse salariale brute ${year}`,          Valeur: totalBrut },
    { Rubrique: `Cotisations salariales 6.3 %`,           Valeur: Math.round(totalBrut * 0.063) },
    { Rubrique: `Cotisations patronales 16.9 %`,          Valeur: Math.round(totalBrut * 0.169) },
    { Rubrique: `TOTAL DASC à verser`,                    Valeur: total },
    { Rubrique: 'Échéance dépôt',                          Valeur: `31 mars ${year + 1}` },
  ]
  const ws2 = XLSX.utils.json_to_sheet(dasc)
  ws2['!cols'] = [{ wch: 38 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'DASC récap')
  XLSX.writeFile(wb, `disa-dasc-${year}.xlsx`)
}

export function downloadEtat301Excel(employees: Employee[], year = 2025) {
  // État 301 = récap annuel des salaires versés (DGI, échéance 30 mai)
  const rows = employees.filter((e) => e.status === 'active').map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return {
      'Matricule CNPS': e.matricule,
      'Prénom': e.firstName,
      'Nom': e.lastName,
      'IFU salarié (optionnel)': '',
      'Brut annuel FCFA': e.brut * 12,
      'CNPS retenue (déductible)': Math.round(p.cnps * 12),
      'Base imposable ITS': Math.round((e.brut - p.cnps) * 12 * 0.85),
      'Quotient familial (parts)': 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5,
      'ITS annuel': Math.round(p.its * 12),
      'IGR annuel (1.5 %)': Math.round(p.igr * 12),
      'CN annuelle (1.5 %)': Math.round(p.cn * 12),
      'Net annuel versé': Math.round(p.net * 12),
    }
  })
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, `État 301 ${year}`)
  // Récap
  const totalITS = rows.reduce((s, r) => s + (r['ITS annuel'] as number), 0)
  const totalIGR = rows.reduce((s, r) => s + (r['IGR annuel (1.5 %)'] as number), 0)
  const totalCN = rows.reduce((s, r) => s + (r['CN annuelle (1.5 %)'] as number), 0)
  const recap = [
    { Rubrique: 'Effectif déclaré',                       Valeur: rows.length },
    { Rubrique: `Masse salariale brute ${year}`,          Valeur: rows.reduce((s, r) => s + (r['Brut annuel FCFA'] as number), 0) },
    { Rubrique: `Total ITS retenu`,                       Valeur: totalITS },
    { Rubrique: `Total IGR retenu`,                       Valeur: totalIGR },
    { Rubrique: `Total CN retenue`,                       Valeur: totalCN },
    { Rubrique: `TOTAL DGI à reverser`,                   Valeur: totalITS + totalIGR + totalCN },
    { Rubrique: 'Échéance dépôt',                          Valeur: `30 mai ${year + 1} (30 juin certifiés)` },
  ]
  const ws2 = XLSX.utils.json_to_sheet(recap)
  ws2['!cols'] = [{ wch: 38 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Récap')
  XLSX.writeFile(wb, `etat-301-${year}.xlsx`)
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
      head: [['Poste', 'Montant FCFA']],
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

export function downloadEmployeeDocument(e: Employee, kind: 'contrat' | 'cni' | 'diplome' | 'justif' | 'cnps' | 'rib') {
  if (kind === 'cnps') return downloadAttestationPDF(e, 'cnps')

  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const titles: Record<'contrat' | 'cni' | 'diplome' | 'justif' | 'rib', { title: string; sub: string }> = {
    contrat: { title: 'Contrat de travail signé',       sub: `Copie certifiée · ${e.firstName} ${e.lastName}` },
    cni:     { title: 'Pièce d\'identité · CNI / Passeport', sub: `Copie scannée · ${e.firstName} ${e.lastName}` },
    diplome: { title: 'Diplôme(s) certifié(s)',          sub: `Justificatifs académiques · ${e.firstName} ${e.lastName}` },
    justif:  { title: 'Justificatif de domicile',        sub: `Adresse certifiée · ${e.firstName} ${e.lastName}` },
    rib:     { title: 'RIB Wave Business',               sub: `Coordonnées de versement · ${e.firstName} ${e.lastName}` },
  }
  const { title, sub } = titles[kind]
  drawHeader(doc, { title, subtitle: sub })

  let y = 56
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK)

  if (kind === 'contrat') {
    const writePara = (t: string) => { const l = doc.splitTextToSize(t, CONTENT_W); doc.text(l, M, y); y += l.length * 5 + 3 }
    writePara(`Le présent document est une copie certifiée du contrat de travail liant ${org.name} (IFU ${org.ifu}) à ${e.firstName} ${e.lastName} (mat. CNPS ${e.matricule}).`)
    writePara(`Type de contrat : ${e.contract === 'CDI' ? 'Contrat à Durée Indéterminée' : 'Contrat à Durée Déterminée'}`)
    writePara(`Fonction : ${e.role}`)
    writePara(`Date de prise de poste : ${e.joinedAt}`)
    writePara(`Rémunération mensuelle brute : ${fmtXOF(e.brut)}`)
    writePara(`Situation familiale : ${e.family.situation} · ${e.family.kids} enfant(s) à charge`)
    y += 6
    writePara(`L'original du contrat signé électroniquement est archivé sous référence CONTRAT-${e.matricule}-${e.joinedAt} et conservé conformément à la Loi 2015-532 portant Code du travail (durée 5 ans après cessation).`)
  } else if (kind === 'cni') {
    doc.text(`Identité : ${e.firstName} ${e.lastName}`, M, y); y += 7
    doc.text(`Nationalité : Ivoirienne (par défaut)`, M, y); y += 7
    doc.text(`Document : Carte Nationale d'Identité`, M, y); y += 12
    doc.setDrawColor(...N200); doc.setFillColor(...N50)
    doc.roundedRect(M, y, CONTENT_W, 80, 2, 2, 'FD')
    doc.setFontSize(8); doc.setTextColor(...N500); doc.setFont('helvetica', 'italic')
    doc.text('[ Scan recto · CNI ]', PAGE_W / 2, y + 40, { align: 'center' })
    doc.text('Document numérique chiffré AES-256 · accessible uniquement aux administrateurs RH', PAGE_W / 2, y + 50, { align: 'center' })
    y += 86
    doc.setFontSize(10); doc.setTextColor(...INK); doc.setFont('helvetica', 'normal')
    doc.text(`Ajoutée au dossier le ${e.joinedAt} · Référence DOC-CNI-${e.matricule}`, M, y)
  } else if (kind === 'diplome') {
    doc.text(`Diplômes au dossier de ${e.firstName} ${e.lastName} (mat. ${e.matricule})`, M, y); y += 10
    const dips = e.brut >= 400000
      ? [`Master 2 · spécialité ${e.role}`, `Licence 3 · ${e.role}`, `Baccalauréat série C ou équivalent`]
      : e.brut >= 250000
        ? [`Licence professionnelle · ${e.role}`, `BTS / DUT en relation avec ${e.role}`, `Baccalauréat`]
        : [`Certificat professionnel en lien avec le poste`, `Brevet d'études · niveau équivalent`]
    dips.forEach((d, i) => { doc.setFont('helvetica', 'bold'); doc.text(`${i + 1}.`, M, y); doc.setFont('helvetica', 'normal'); doc.text(d, M + 6, y); y += 7 })
    y += 6
    doc.setFontSize(8); doc.setTextColor(...N500)
    doc.text(`Pièces scannées certifiées conformes · stockage chiffré · accès RH uniquement.`, M, y)
  } else if (kind === 'justif') {
    doc.text(`Justificatif de domicile de ${e.firstName} ${e.lastName}`, M, y); y += 10
    doc.text(`Adresse : Cocody, Abidjan, Côte d'Ivoire (par défaut)`, M, y); y += 7
    doc.text(`Type de justificatif : Quittance d'électricité CIE / Facture CIE`, M, y); y += 7
    doc.text(`Date du justificatif : moins de 3 mois`, M, y); y += 12
    doc.setDrawColor(...N200); doc.setFillColor(...N50)
    doc.roundedRect(M, y, CONTENT_W, 70, 2, 2, 'FD')
    doc.setFontSize(8); doc.setTextColor(...N500); doc.setFont('helvetica', 'italic')
    doc.text('[ Scan facture CIE · justificatif accepté ]', PAGE_W / 2, y + 38, { align: 'center' })
  } else if (kind === 'rib') {
    doc.text(`Coordonnées de versement du salaire`, M, y); y += 10
    doc.setFont('helvetica', 'bold'); doc.text(`Titulaire :`, M, y); doc.setFont('helvetica', 'normal'); doc.text(`${e.firstName} ${e.lastName}`, M + 28, y); y += 7
    doc.setFont('helvetica', 'bold'); doc.text(`Opérateur :`, M, y); doc.setFont('helvetica', 'normal'); doc.text(`Wave Business`, M + 28, y); y += 7
    doc.setFont('helvetica', 'bold'); doc.text(`Numéro :`, M, y); doc.setFont('helvetica', 'normal'); doc.text(`+225 07 ** ** ** **`, M + 28, y); y += 7
    doc.setFont('helvetica', 'bold'); doc.text(`Référence :`, M, y); doc.setFont('helvetica', 'normal'); doc.text(`WAVE-${e.matricule}`, M + 28, y); y += 12
    doc.setFontSize(8); doc.setTextColor(...N500)
    doc.text(`Coordonnées vérifiées par le salarié lors de l'embauche le ${e.joinedAt}.`, M, y); y += 5
    doc.text(`Les versements sont effectués mensuellement le 5 du mois suivant la période de paie.`, M, y)
  }

  // Signature box bottom-right
  doc.setDrawColor(...N200); doc.setFillColor(...N50)
  doc.roundedRect(PAGE_W - M - 80, 240, 80, 36, 1, 1, 'FD')
  doc.setFontSize(7); doc.setTextColor(...N500); doc.setFont('helvetica', 'bold')
  doc.text('CERTIFIÉ PAR L\'EMPLOYEUR', PAGE_W - M - 76, 246)
  doc.setFontSize(10); doc.setTextColor(...INK); doc.setFont('helvetica', 'normal')
  doc.text(org.name, PAGE_W - M - 76, 253)
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...ORANGE)
  doc.text('« Document certifié conforme »', PAGE_W - M - 76, 270)

  drawFooter(doc)
  doc.save(`${kind}-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

// ============================================================================
// DPAE — Déclaration Préalable À l'Embauche (CNPS)
// Obligation légale : déposée AVANT le 1er jour de travail effectif
// ============================================================================

export function downloadDPAEPDF(e: Employee) {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, {
    title: 'Déclaration préalable à l\'embauche',
    subtitle: `DPAE · ${e.firstName} ${e.lastName}`,
    ref: `DPAE-${e.matricule}-${e.joinedAt.replace(/-/g, '')}`,
  })

  let y = drawInfoBoxes(doc, 52, {
    title: 'Employeur déclarant',
    lines: [org.name, `IFU ${org.ifu}`, `Compte CNPS ${org.cnps}`, `${org.city}`],
  }, {
    title: 'CNPS Côte d\'Ivoire',
    lines: [`Caisse Nationale de Prévoyance Sociale`, `Dépôt avant prise de poste effective`, `www.cnps.ci · e-DPAE`, `Sanction défaut : amende employeur`],
  })

  // Bandeau salarié
  doc.setFillColor(...N50); doc.setDrawColor(...ORANGE); doc.setLineWidth(0.5)
  doc.roundedRect(M, y, CONTENT_W, 38, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...ORANGE)
  doc.text('S A L A R I É   E M B A U C H É', M + 4, y + 5)
  doc.setFontSize(14); doc.setTextColor(...INK)
  doc.text(`${e.firstName} ${e.lastName}`, M + 4, y + 13)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...N700)
  doc.text(`Matricule CNPS : ${e.matricule}`, M + 4, y + 20)
  doc.text(`Date de prise de poste : ${e.joinedAt}`, M + 4, y + 26)
  doc.text(`Type de contrat : ${e.contract === 'CDI' ? 'Contrat à Durée Indéterminée' : 'Contrat à Durée Déterminée'}`, M + 4, y + 32)
  doc.text(`Fonction : ${e.role}`, PAGE_W - M - 4, y + 20, { align: 'right' })
  doc.text(`Rémunération brute : ${fmtXOF(e.brut)}/mois`, PAGE_W - M - 4, y + 26, { align: 'right' })
  doc.text(`Situation familiale : ${e.family.situation} · ${e.family.kids} enfant(s)`, PAGE_W - M - 4, y + 32, { align: 'right' })
  y += 46

  // Engagement employeur
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK)
  const engagement = `Je soussigné(e), représentant légal de ${org.name}, déclare par la présente embaucher le salarié ci-dessus à compter du ${e.joinedAt}. Je m'engage à verser les cotisations sociales obligatoires (retraite, prestations familiales, accidents du travail, CMU) auprès de la CNPS pour ce salarié.`
  const lines = doc.splitTextToSize(engagement, CONTENT_W)
  doc.text(lines, M, y); y += lines.length * 5 + 6

  // Cotisations prévues
  autoTable(doc, {
    startY: y,
    head: [['Cotisation', 'Taux', 'Base', 'Montant mensuel']],
    body: [
      ['Retraite salariale',          '6,3 %',          fmtXOF(e.brut), fmtXOF(Math.round(e.brut * 0.063))],
      ['Retraite patronale',          '7,7 %',          fmtXOF(e.brut), fmtXOF(Math.round(e.brut * 0.077))],
      ['Prestations familiales',      '5,75 %',         fmtXOF(e.brut), fmtXOF(Math.round(e.brut * 0.0575))],
      ['Accidents du travail',        `${org.taux_at} %`, fmtXOF(e.brut), fmtXOF(Math.round(e.brut * (parseFloat(org.taux_at) || 3.5) / 100))],
      ['CMU salariale',               'forfait',        '—',            fmtXOF(500)],
      ['CMU patronale',               'forfait',        '—',            fmtXOF(500)],
    ],
    foot: [['TOTAL COTISATIONS CNPS', '', '', fmtXOF(Math.round(e.brut * (0.063 + 0.077 + 0.0575 + (parseFloat(org.taux_at) || 3.5) / 100)) + 1000)]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 10, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: M, right: M },
  })

  // Signatures
  doc.setDrawColor(...N200); doc.setLineWidth(0.3)
  doc.line(M, 245, M + 70, 245)
  doc.line(PAGE_W - M - 70, 245, PAGE_W - M, 245)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK)
  doc.text(`Pour ${org.name}`, M, 250)
  doc.text(`Le salarié`, PAGE_W - M - 70, 250)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...N500)
  doc.text(`Cachet, date et signature`, M, 255)
  doc.text(`${e.firstName} ${e.lastName} · signature`, PAGE_W - M - 70, 255)

  // Mention conformité
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...N500)
  doc.text(`Document à déposer auprès de la CNPS via e-DPAE (www.cnps.ci) ou en agence avant le 1er jour de travail effectif.`, M, 268)
  doc.text(`Tout défaut de déclaration expose l'employeur à des sanctions financières (Loi 2015-532 + décrets CNPS).`, M, 272)

  drawFooter(doc)
  doc.save(`dpae-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
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

// ============================================================================
// SOLDE DE TOUT COMPTE (STC) — sortie salarié
// Art. 16.10 Code travail CI + CC interprofessionnelle (préavis, indemnité licenciement)
// ============================================================================

export type STCMotif = 'licenciement' | 'demission' | 'retraite' | 'fin-cdd' | 'rupture-conventionnelle'

export function computeSTC(e: Employee, motif: STCMotif, joursCongesNonPris: number, anciennete: { years: number; months: number }) {
  const brutMensuel = e.brut
  const brutJour = brutMensuel / 30
  // Préavis (CC interpro CI Art. 34) : indemnité compensatrice due par l'employeur
  // en licenciement non motivé par faute lourde. En démission, le préavis est dû par le salarié.
  const preavisMois = e.brut >= 400000 ? 3 : e.brut >= 200000 ? 2 : 1
  const preavis = motif === 'licenciement' ? brutMensuel * preavisMois : 0
  // Indemnité de licenciement (Art. 39 CC interpro : 30/35/40% du brut × années par tranche)
  // Versée en licenciement et rupture conventionnelle.
  const totalYears = anciennete.years + anciennete.months / 12
  let indemniteLicenciement = 0
  if (motif === 'licenciement' || motif === 'rupture-conventionnelle') {
    if (totalYears <= 5) indemniteLicenciement = brutMensuel * 0.30 * totalYears
    else if (totalYears <= 10) indemniteLicenciement = brutMensuel * 0.30 * 5 + brutMensuel * 0.35 * (totalYears - 5)
    else indemniteLicenciement = brutMensuel * 0.30 * 5 + brutMensuel * 0.35 * 5 + brutMensuel * 0.40 * (totalYears - 10)
  }
  // Indemnité de départ à la retraite (Code du travail CI : même barème que licenciement)
  let indemniteRetraite = 0
  if (motif === 'retraite') {
    if (totalYears <= 5) indemniteRetraite = brutMensuel * 0.30 * totalYears
    else if (totalYears <= 10) indemniteRetraite = brutMensuel * 0.30 * 5 + brutMensuel * 0.35 * (totalYears - 5)
    else indemniteRetraite = brutMensuel * 0.30 * 5 + brutMensuel * 0.35 * 5 + brutMensuel * 0.40 * (totalYears - 10)
  }
  // Indemnité de précarité fin CDD (Art. 15.8 Code travail CI : 3% du brut total perçu)
  let indemnitePrecarite = 0
  if (motif === 'fin-cdd') {
    indemnitePrecarite = brutMensuel * 12 * totalYears * 0.03
  }
  const indemniteConges = brutJour * joursCongesNonPris
  const moisDepuisDerniereGrat = 11
  const proRataGratification = (brutMensuel * moisDepuisDerniereGrat) / 12
  const salaireMois = brutMensuel
  const total = salaireMois + preavis + indemniteLicenciement + indemniteRetraite + indemnitePrecarite + indemniteConges + proRataGratification
  return {
    salaireMois, preavis, preavisMois, indemniteLicenciement, indemniteRetraite, indemnitePrecarite,
    indemniteConges, joursCongesNonPris, proRataGratification, moisDepuisDerniereGrat, total, motif, anciennete, brutMensuel
  }
}

export function downloadSTCPDF(e: Employee, motif: STCMotif, joursCongesNonPris: number, anciennete: { years: number; months: number }, dateSortie: string) {
  const org = getOrg()
  const stc = computeSTC(e, motif, joursCongesNonPris, anciennete)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const motifLabels: Record<STCMotif, string> = {
    'licenciement': 'Licenciement',
    'demission': 'Démission',
    'retraite': 'Départ à la retraite',
    'fin-cdd': 'Fin de contrat (CDD)',
    'rupture-conventionnelle': 'Rupture conventionnelle',
  }
  drawHeader(doc, {
    title: 'Solde de tout compte',
    subtitle: `${e.firstName} ${e.lastName}`,
    ref: `STC-${e.matricule}-${dateSortie.replace(/\//g, '')}`
  })
  let y = drawInfoBoxes(doc, 52, {
    title: 'Employeur',
    lines: [org.name, `IFU ${org.ifu}`, `CNPS ${org.cnps}`, `${org.city}`],
  }, {
    title: 'Salarié sortant',
    lines: [`${e.firstName} ${e.lastName}`, `Mat. ${e.matricule}`, `${e.role}`, `Ancienneté · ${anciennete.years} an(s) ${anciennete.months} mois`],
  })

  // Bandeau motif
  doc.setFillColor(...N50)
  doc.setDrawColor(...ORANGE)
  doc.setLineWidth(0.5)
  doc.roundedRect(M, y, CONTENT_W, 14, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...ORANGE)
  doc.text('M O T I F   D E   S O R T I E', M + 4, y + 5)
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text(motifLabels[motif], M + 4, y + 11)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...N700)
  doc.text(`Date d'effet · ${dateSortie}`, PAGE_W - M - 4, y + 11, { align: 'right' })
  y += 20

  // Table détaillée des composantes du STC
  const rows: any[] = [
    ['Salaire du mois de sortie',                                           '', fmtXOF(stc.salaireMois)],
  ]
  if (stc.preavis > 0) rows.push([`Indemnité compensatrice de préavis`, `${stc.preavisMois} mois × ${fmtXOF(stc.brutMensuel)}`, fmtXOF(stc.preavis)])
  if (stc.indemniteLicenciement > 0) rows.push([`Indemnité de licenciement (Art. 39 CC interpro)`, `${anciennete.years} an(s) ${anciennete.months} mois`, fmtXOF(stc.indemniteLicenciement)])
  if (stc.indemniteRetraite > 0) rows.push([`Indemnité de départ à la retraite`, `${anciennete.years} an(s) ${anciennete.months} mois`, fmtXOF(stc.indemniteRetraite)])
  if (stc.indemnitePrecarite > 0) rows.push([`Indemnité de précarité (fin CDD · Art. 15.8)`, `3 % du brut perçu`, fmtXOF(stc.indemnitePrecarite)])
  if (stc.indemniteConges > 0) rows.push([`Indemnité compensatrice de congés payés`, `${joursCongesNonPris} j non pris`, fmtXOF(stc.indemniteConges)])
  if (stc.proRataGratification > 0) rows.push([`Prorata de gratification (13e mois)`, `${stc.moisDepuisDerniereGrat}/12`, fmtXOF(stc.proRataGratification)])

  autoTable(doc, {
    startY: y,
    head: [['Composante', 'Base de calcul', 'Montant']],
    body: rows,
    foot: [['TOTAL NET DÛ', '', fmtXOF(stc.total)]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8, halign: 'left' },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 11, fontStyle: 'bold', halign: 'right' },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' }, 1: { textColor: N500 as any, fontSize: 8 } },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Bandeau NET À VERSER
  doc.setFillColor(...INK)
  doc.rect(M, y, CONTENT_W, 18, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(M, y, 3, 18, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('N E T   À   V E R S E R', M + 8, y + 7)
  doc.setFontSize(16)
  doc.text(fmtXOF(stc.total), PAGE_W - M - 4, y + 12, { align: 'right' })
  y += 24

  // Mention légale
  doc.setFontSize(8)
  doc.setTextColor(...N500)
  doc.setFont('helvetica', 'italic')
  const mention = `Conformément à la Loi 2015-532 portant Code du travail de Côte d'Ivoire et à la convention collective interprofessionnelle, le présent solde de tout compte est dressé en deux exemplaires. La signature du salarié vaut reçu pour solde de tout compte et acquittement définitif. Le salarié dispose d'un délai de deux mois pour le dénoncer par lettre recommandée.`
  const lines = doc.splitTextToSize(mention, CONTENT_W)
  doc.text(lines, M, y)
  y += lines.length * 4 + 8

  // Signatures
  const sigY = Math.max(y, 240)
  doc.setDrawColor(...N200)
  doc.setLineWidth(0.3)
  doc.line(M, sigY, M + 70, sigY)
  doc.line(PAGE_W - M - 70, sigY, PAGE_W - M, sigY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...INK)
  doc.text(`Pour ${org.name}`, M, sigY + 5)
  doc.text(`${e.firstName} ${e.lastName}`, PAGE_W - M - 70, sigY + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...N500)
  doc.text('Date, cachet et signature', M, sigY + 10)
  doc.text('Signature précédée de la mention « pour solde de tout compte »', PAGE_W - M - 70, sigY + 10)

  drawFooter(doc)
  doc.save(`stc-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

export function downloadCertificatTravailPDF(e: Employee, dateSortie: string, anciennete: { years: number; months: number }) {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, {
    title: 'Certificat de travail',
    subtitle: 'Article 16.10 du Code du travail',
    ref: `CT-${e.matricule}-${dateSortie.replace(/\//g, '')}`,
  })
  let y = 60
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  const para = `Je soussigné(e), Directeur des Ressources Humaines de ${org.name} (IFU ${org.ifu}), certifie par la présente que :`
  doc.text(doc.splitTextToSize(para, CONTENT_W), M, y); y += 14

  // Bloc identité salarié
  doc.setFillColor(...N50)
  doc.setDrawColor(...ORANGE)
  doc.setLineWidth(0.4)
  doc.roundedRect(M, y, CONTENT_W, 28, 1, 1, 'FD')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...INK)
  doc.text(`${e.firstName} ${e.lastName}`, M + 6, y + 10)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...N700)
  doc.text(`Matricule CNPS · ${e.matricule}`, M + 6, y + 17)
  doc.text(`Fonction exercée · ${e.role}`, M + 6, y + 22)
  doc.text(`Type de contrat · ${e.contract === 'CDI' ? 'Contrat à Durée Indéterminée' : 'Contrat à Durée Déterminée'}`, M + 6, y + 27)
  y += 36

  doc.setFontSize(11); doc.setTextColor(...INK)
  doc.text(`A été employé(e) au sein de notre société du ${e.joinedAt} au ${dateSortie}`, M, y); y += 7
  doc.text(`soit une durée totale de ${anciennete.years} année(s) et ${anciennete.months} mois.`, M, y); y += 14

  doc.text(`Tout au long de cette période, ${e.firstName} a exercé les fonctions de ${e.role}`, M, y); y += 6
  doc.text(`à notre entière satisfaction.`, M, y); y += 14

  doc.text(`Le présent certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.`, M, y); y += 14

  doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...N500)
  doc.text(`Conformément à l'Article 16.10 du Code du travail (Loi 2015-532), ce certificat`, M, y); y += 4
  doc.text(`contient exclusivement la date d'entrée, la date de sortie et la nature des emplois occupés.`, M, y); y += 14

  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK)
  doc.text(`Fait à ${org.city.split(',')[0]}, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`, M, y); y += 20

  // Signature
  doc.setDrawColor(...N200); doc.setLineWidth(0.3)
  doc.line(PAGE_W - M - 70, y, PAGE_W - M, y); y += 5
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK)
  doc.text(`Pour ${org.name}`, PAGE_W - M - 70, y); y += 4
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...N500)
  doc.text('Cachet et signature de la Direction', PAGE_W - M - 70, y)

  drawFooter(doc)
  doc.save(`certificat-travail-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`)
}

// ============================================================================
// BORDEREAU CNPS PDF (en plus de l'Excel actuel)
// ============================================================================

export function downloadBordereauCNPSPDF(employees: Employee[], period = 'Novembre 2026') {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, {
    title: 'Bordereau CNPS',
    subtitle: `Cotisations sociales · ${period}`,
    ref: `CNPS-${org.cnps}-${period.replace(/\s/g, '')}`,
  })

  let y = drawInfoBoxes(doc, 52, {
    title: 'Employeur cotisant',
    lines: [org.name, `IFU ${org.ifu}`, `CNPS ${org.cnps}`, `Secteur · ${org.sector}`],
  }, {
    title: 'Période déclarée',
    lines: [period, `Taux AT · ${org.taux_at}%`, `Effectif · ${employees.length}`, `À déposer avant 15/${period.split(' ')[0].slice(0, 3).toLowerCase() === 'nov' ? '12' : '01'}`],
  })

  const active = employees.filter((e) => e.status === 'active')
  const rows = active.map((e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return [
      e.matricule,
      `${e.firstName} ${e.lastName}`,
      fmtXOF(e.brut),
      fmtXOF(Math.round(p.cnps)),
      fmtXOF(Math.round(p.brut * 0.169)),
      fmtXOF(Math.round(p.cnps + p.brut * 0.169)),
    ]
  })
  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { brut: acc.brut + e.brut, sal: acc.sal + p.cnps, pat: acc.pat + p.brut * 0.169 }
  }, { brut: 0, sal: 0, pat: 0 })

  autoTable(doc, {
    startY: y,
    head: [['Matricule', 'Salarié', 'Brut', 'Cotis. sal. 6.3%', 'Cotis. pat. 16.9%', 'Total']],
    body: rows,
    foot: [['TOTAL', `${active.length} salariés`, fmtXOF(totals.brut), fmtXOF(Math.round(totals.sal)), fmtXOF(Math.round(totals.pat)), fmtXOF(Math.round(totals.sal + totals.pat))]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 9, fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  let yEnd = (doc as any).lastAutoTable.finalY + 6

  // Bandeau total
  doc.setFillColor(...INK)
  doc.rect(M, yEnd, CONTENT_W, 18, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(M, yEnd, 3, 18, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  doc.text('T O T A L   À   V E R S E R   À   L A   C N P S', M + 8, yEnd + 7)
  doc.setFontSize(16)
  doc.text(fmtXOF(Math.round(totals.sal + totals.pat)), PAGE_W - M - 4, yEnd + 12, { align: 'right' })
  yEnd += 26

  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...N500)
  doc.text(`Bordereau à déposer sur le portail e-CNPS (https://www.cnps.ci) ou en agence avec le virement bancaire.`, M, yEnd); yEnd += 5
  doc.text(`Tout retard de plus de 15 jours après la fin du mois entraîne des majorations légales (10% + 1% par mois).`, M, yEnd)

  // Signature
  doc.setDrawColor(...N200); doc.setLineWidth(0.3)
  doc.line(PAGE_W - M - 80, 262, PAGE_W - M, 262)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...INK)
  doc.text(`Pour ${org.name}`, PAGE_W - M - 80, 267)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...N500)
  doc.text('Cachet, date et signature du dirigeant', PAGE_W - M - 80, 272)

  drawFooter(doc)
  doc.save(`bordereau-cnps-${period.toLowerCase().replace(/\s/g, '-')}.pdf`)
}

// ============================================================================
// EXPORT COMPTABLE OHADA / SYSCOHADA
// ============================================================================

export function downloadEcrituresOHADA(employees: Employee[], period = 'Novembre 2026') {
  const active = employees.filter((e) => e.status === 'active')
  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return {
      brut: acc.brut + e.brut,
      cnpsSal: acc.cnpsSal + p.cnps,
      cnpsPat: acc.cnpsPat + e.brut * 0.169,
      its: acc.its + p.its,
      igr: acc.igr + p.igr,
      cn: acc.cn + p.cn,
      net: acc.net + p.net,
    }
  }, { brut: 0, cnpsSal: 0, cnpsPat: 0, its: 0, igr: 0, cn: 0, net: 0 })

  const dateStr = new Date().toLocaleDateString('fr-FR')
  const ref = `PAIE-${period.replace(/\s/g, '').toUpperCase()}`

  const rows = [
    // Charge salaires brut
    { Date: dateStr, Journal: 'OD', Compte: '661100', Libelle: `Rémunération du personnel · ${period}`, Reference: ref, Debit: Math.round(totals.brut), Credit: 0 },
    // Charge cotisations patronales
    { Date: dateStr, Journal: 'OD', Compte: '664100', Libelle: `Charges sociales patronales CNPS · ${period}`, Reference: ref, Debit: Math.round(totals.cnpsPat), Credit: 0 },
    // Dette envers le personnel (net)
    { Date: dateStr, Journal: 'OD', Compte: '422100', Libelle: `Personnel, rémunérations dues · ${period}`, Reference: ref, Debit: 0, Credit: Math.round(totals.net) },
    // Dette CNPS (sal + pat)
    { Date: dateStr, Journal: 'OD', Compte: '431100', Libelle: `Sécurité sociale CNPS · ${period}`, Reference: ref, Debit: 0, Credit: Math.round(totals.cnpsSal + totals.cnpsPat) },
    // Dette État ITS
    { Date: dateStr, Journal: 'OD', Compte: '447100', Libelle: `État, ITS retenue à la source · ${period}`, Reference: ref, Debit: 0, Credit: Math.round(totals.its) },
    // Dette État IGR + CN
    { Date: dateStr, Journal: 'OD', Compte: '447200', Libelle: `État, IGR + Contribution nationale · ${period}`, Reference: ref, Debit: 0, Credit: Math.round(totals.igr + totals.cn) },
    // Paiement banque (présumé fait)
    { Date: dateStr, Journal: 'BQ', Compte: '521100', Libelle: `Banque, virement salaires · ${period}`, Reference: ref, Debit: 0, Credit: Math.round(totals.net) },
    { Date: dateStr, Journal: 'BQ', Compte: '422100', Libelle: `Personnel, paiement net · ${period}`, Reference: ref, Debit: Math.round(totals.net), Credit: 0 },
  ]
  const totalDebit = rows.reduce((s, r) => s + r.Debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.Credit, 0)
  rows.push({ Date: dateStr, Journal: '---', Compte: '---', Libelle: 'TOTAUX DÉBITS = CRÉDITS', Reference: '', Debit: totalDebit, Credit: totalCredit })

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 50 }, { wch: 20 }, { wch: 14 }, { wch: 14 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Écritures OHADA')
  XLSX.writeFile(wb, `ecritures-comptables-ohada-${period.toLowerCase().replace(/\s/g, '-')}.xlsx`)
}

// ============================================================================
// GRATIFICATION 13e MOIS — bulletins spécifiques
// ============================================================================

export async function downloadGratificationsZip(employees: Employee[], moisAcquis = 11, period = 'Décembre 2026') {
  const zip = new JSZip()
  const active = employees.filter((e) => e.status === 'active')
  for (const e of active) {
    const gratif = Math.round((e.brut * moisAcquis) / 12)
    const doc = await buildGratificationPDF(e, gratif, moisAcquis, period)
    const blob = doc.output('blob')
    zip.file(`gratif-${e.firstName.toLowerCase()}-${e.lastName.toLowerCase()}.pdf`, blob)
  }
  // Récap bordereau
  const recap = await buildGratificationBordereauPDF(active, moisAcquis, period)
  zip.file('bordereau-recapitulatif.pdf', recap.output('blob'))
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `gratifications-${period.toLowerCase().replace(/\s/g, '-')}.zip`)
}

async function buildGratificationPDF(e: Employee, gratif: number, moisAcquis: number, period: string): Promise<jsPDF> {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: 'Gratification annuelle', subtitle: `${e.firstName} ${e.lastName} · ${period}`, ref: `GRAT-${e.matricule}-${period.replace(/\s/g, '')}` })
  let y = drawInfoBoxes(doc, 52, {
    title: 'Employeur',
    lines: [org.name, `IFU ${org.ifu}`, `CNPS ${org.cnps}`],
  }, {
    title: 'Bénéficiaire',
    lines: [`${e.firstName} ${e.lastName}`, `Mat. ${e.matricule}`, e.role],
  })
  autoTable(doc, {
    startY: y,
    head: [['Composante', 'Base', 'Montant']],
    body: [
      ['Salaire brut mensuel de référence', '', fmtXOF(e.brut)],
      ['Mois acquis depuis dernière gratification', '', `${moisAcquis} / 12`],
      ['Gratification calculée (usage : 1 mois × prorata)', `${moisAcquis}/12`, fmtXOF(gratif)],
    ],
    foot: [['NET VERSÉ AU TITRE DE LA GRATIFICATION', '', fmtXOF(gratif)]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 10, fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  const yEnd = (doc as any).lastAutoTable.finalY + 8
  doc.setFillColor(...INK); doc.rect(M, yEnd, CONTENT_W, 18, 'F')
  doc.setFillColor(...ORANGE); doc.rect(M, yEnd, 3, 18, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  doc.text('N E T   À   V E R S E R', M + 8, yEnd + 7)
  doc.setFontSize(16); doc.text(fmtXOF(gratif), PAGE_W - M - 4, yEnd + 12, { align: 'right' })
  drawFooter(doc)
  return doc
}

async function buildGratificationBordereauPDF(active: Employee[], moisAcquis: number, period: string): Promise<jsPDF> {
  const org = getOrg()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: 'Bordereau gratifications', subtitle: `Récapitulatif · ${period}`, ref: `GRAT-RECAP-${period.replace(/\s/g, '')}` })
  const rows = active.map((e) => [e.matricule, `${e.firstName} ${e.lastName}`, fmtXOF(e.brut), `${moisAcquis}/12`, fmtXOF(Math.round((e.brut * moisAcquis) / 12))])
  const total = active.reduce((s, e) => s + Math.round((e.brut * moisAcquis) / 12), 0)
  autoTable(doc, {
    startY: 52,
    head: [['Matricule', 'Salarié', 'Brut mensuel', 'Acquis', 'Gratification']],
    body: rows,
    foot: [['TOTAL', `${active.length} salariés`, '', '', fmtXOF(total)]],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: ORANGE as any, textColor: [255, 255, 255] as any, fontSize: 10, fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  drawFooter(doc)
  return doc
}

// ============================================================================
// RAPPORT ANALYTICS PDF (pour /app/reports)
// ============================================================================

export function downloadReportPDF(employees: Employee[]) {
  const org = getOrg()
  const active = employees.filter((e) => e.status === 'active')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawHeader(doc, { title: 'Rapport analytique RH', subtitle: `${org.name} · Exercice 2026`, ref: `RAP-${new Date().toISOString().slice(0, 10)}` })

  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { brut: acc.brut + e.brut, net: acc.net + p.net, patron: acc.patron + p.patron, total: acc.total + p.total }
  }, { brut: 0, net: 0, patron: 0, total: 0 })

  let y = 52
  // KPI grid
  const kpis = [
    ['Effectif actif', String(active.length)],
    ['Masse brute mensuelle', fmtXOF(totals.brut)],
    ['Coût employeur total', fmtXOF(Math.round(totals.total))],
    ['Net versé total', fmtXOF(Math.round(totals.net))],
  ]
  kpis.forEach((kpi, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const x = M + col * (CONTENT_W / 2 + 4)
    const yk = y + row * 22
    doc.setFillColor(...N50); doc.setDrawColor(...N200)
    doc.roundedRect(x, yk, CONTENT_W / 2 - 2, 18, 1, 1, 'FD')
    doc.setFillColor(...ORANGE); doc.rect(x, yk, 2, 18, 'F')
    doc.setFontSize(7); doc.setTextColor(...ORANGE); doc.setFont('helvetica', 'bold')
    doc.text(kpi[0].toUpperCase().split('').join(' '), x + 6, yk + 6)
    doc.setFontSize(13); doc.setTextColor(...INK); doc.setFont('helvetica', 'bold')
    doc.text(kpi[1], x + 6, yk + 14)
  })
  y += 48

  // Top 5 postes
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK)
  doc.text('TOP 5 POSTES PAR COÛT', M, y); y += 5
  const top = [...active].sort((a, b) => b.brut - a.brut).slice(0, 5)
  autoTable(doc, {
    startY: y,
    head: [['Salarié', 'Fonction', 'Brut', 'Coût employeur']],
    body: top.map((e) => {
      const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
      return [`${e.firstName} ${e.lastName}`, e.role, fmtXOF(e.brut), fmtXOF(Math.round(p.total))]
    }),
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid',
    margin: { left: M, right: M },
  })
  y = (doc as any).lastAutoTable.finalY + 8

  // Répartition par type de contrat
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...INK)
  doc.text('RÉPARTITION CONTRACTUELLE', M, y); y += 5
  const cdi = active.filter((e) => e.contract === 'CDI').length
  const cdd = active.filter((e) => e.contract === 'CDD').length
  autoTable(doc, {
    startY: y,
    head: [['Type', 'Effectif', '%']],
    body: [
      ['CDI', String(cdi), `${Math.round((cdi / active.length) * 100)}%`],
      ['CDD', String(cdd), `${Math.round((cdd / active.length) * 100)}%`],
    ],
    headStyles: { fillColor: INK as any, textColor: [255, 255, 255] as any, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
    theme: 'grid',
    margin: { left: M, right: M },
  })

  drawFooter(doc)
  doc.save(`rapport-rh-${new Date().toISOString().slice(0, 10)}.pdf`)
}
