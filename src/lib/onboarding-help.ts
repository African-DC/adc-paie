/**
 * Contenu d'aide contextuelle pour l'onboarding ADC Paie.
 *
 * Toutes les informations ont été vérifiées sur sources officielles :
 * - DGI : dgi.gouv.ci, e-impots.gouv.ci
 * - CEPICI / Guichet unique : 225invest.ci
 * - CNPS : cnps.ci, e.cnps.ci
 * - Code du travail CI : Loi n°2015-532 du 20 juillet 2015 (juriafrica.com, NATLEX ILO)
 * - Convention Collective Interprofessionnelle 1977 : droitci.info (PDF officiel AICI/UGTCI)
 * - CLEISS (référence française sur sécurité sociale CI)
 *
 * Conçu pour les PME ivoiriennes sans DAF ni comptable interne.
 */

export type FieldHelpContent = {
  what: string
  where: { text: string; url?: string }[]
  format?: string
  example?: string
  tip: string
  legalRef?: string
}

export const ONBOARDING_HELP: Record<string, FieldHelpContent> = {
  ifu: {
    what: "Identifiant fiscal de votre entreprise auprès de la DGI. En Côte d'Ivoire, le terme officiel moderne est IDU (Identifiant Unique), souvent appelé IFU dans la sous-région. Il est attribué automatiquement à la création de l'entreprise via le Guichet Unique CEPICI.",
    where: [
      { text: 'Guichet Unique CEPICI (création + IDU)', url: 'https://www.225invest.ci' },
      { text: 'Espace e-Impôts DGI (télédéclarations)', url: 'https://e-impots.gouv.ci' },
      { text: 'Site officiel DGI', url: 'https://www.dgi.gouv.ci' },
    ],
    tip: "L'IDU/IFU est délivré simultanément avec la Déclaration Fiscale d'Existence (DFE) lors de l'enregistrement au CEPICI, sous 14 jours ouvrables. Si vous n'avez que votre Numéro de Compte Contribuable (CC) ancien format, saisissez-le ici — la DGI fera la correspondance.",
    legalRef: 'Code Général des Impôts CI — toute entreprise enregistrée doit disposer d\'un identifiant fiscal pour ses déclarations (ITS, BIC, TVA)',
  },

  cnps: {
    what: "Matricule employeur attribué par la Caisse Nationale de Prévoyance Sociale (CNPS) à votre entreprise. Sert à toutes les déclarations sociales (DPAE, cotisations mensuelles, allocations familiales).",
    where: [
      { text: 'Attestation d\'immatriculation CNPS (notification après inscription)' },
      { text: 'Espace employeur CNPS en ligne', url: 'https://www.cnps.ci/employeur/' },
      { text: 'Portail e-CNPS', url: 'https://e.cnps.ci' },
    ],
    tip: "Inscription obligatoire dès le 1er jour d'embauche. Documents requis : RCCM, déclaration fiscale d'existence, pièce d'identité du gérant, factures eau/électricité (preuve du siège). La CNPS notifie ensuite le matricule + le taux AT applicable à votre secteur.",
    legalRef: 'Loi n°2015-532 du 20/07/2015 (Code du travail CI) — déclaration préalable à l\'embauche (DPAE) obligatoire',
  },

  sector: {
    what: 'Activité principale de votre entreprise. Détermine notamment le taux Accidents du Travail (AT) que la CNPS vous notifiera, et la convention collective applicable par défaut.',
    where: [
      { text: 'Code APE / nomenclature inscrit sur votre RCCM' },
    ],
    tip: 'Si votre entreprise a plusieurs activités, choisissez celle qui représente plus de 50% du chiffre d\'affaires. Notre suggestion automatique de Taux AT est indicative — la CNPS reste l\'autorité qui fixe votre taux réel.',
  },

  tauxAT: {
    what: 'Taux de cotisation patronale "Accidents du Travail" versée à la CNPS, varie selon le risque sectoriel évalué par la CNPS — du tertiaire (faible risque) au BTP/mines (risque élevé).',
    where: [
      { text: 'Attestation d\'immatriculation CNPS (taux notifié officiellement)' },
      { text: 'Service Public CI — démarches CNPS', url: 'https://servicepublic.gouv.ci' },
      { text: 'Référence régime social CI (CLEISS)', url: 'https://www.cleiss.fr/docs/regimes/regime_cotedivoire.html' },
    ],
    format: 'Pourcentage entre 2 % et 5 %. Pratique courante : 2 % (tertiaire/services), 3 % (industrie légère/transport), 3,5 % (agriculture), 5 % (BTP/mines).',
    tip: "Le taux officiel est assigné par la CNPS lors de l'immatriculation, pas auto-déclaré. Notre suggestion automatique est indicative — saisissez le taux notifié par la CNPS si vous le connaissez, sinon utilisez la suggestion en attendant régularisation.",
  },

  city: {
    what: 'Ville du siège social déclaré au Registre du Commerce (RCCM). Apparaît sur les bulletins et les contrats. Peut influencer certaines indemnités (transport notamment).',
    where: [
      { text: 'Extrait RCCM délivré par le Tribunal de commerce' },
    ],
    tip: 'Pour Abidjan, précisez la commune (Plateau, Cocody, Yopougon, Marcory, Treichville, Adjamé, Abobo, Attécoubé, Koumassi, Port-Bouët). Pour l\'intérieur, indiquez chef-lieu de département.',
  },

  convention: {
    what: "Convention collective qui régit les relations employeur/salarié dans votre secteur : grille de rémunération, prime d'ancienneté (Art. 31 CCI), congés payés, indemnités, durée du travail, procédures de licenciement.",
    where: [
      { text: 'Convention Collective Interprofessionnelle du 19 juillet 1977 (PDF officiel AICI/UGTCI)', url: 'https://www.droitci.info/files/827.07.77c-Convention-interprofessionnelle-du-19-juillet-1977-entre-AICI-et-UGTCI.pdf' },
      { text: 'Base NATLEX ILO Côte d\'Ivoire', url: 'https://natlex.ilo.org' },
    ],
    tip: 'La Convention Interprofessionnelle 1977 (signée AICI + UGTCI le 19/07/1977) est la convention par défaut qui couvre la majorité des PME tertiaires, commerce, services, tech. Conventions sectorielles existent pour : Banques/Assurances (2025), BTP, Transport. Si vous êtes dans ces secteurs, votre convention spécifique prime sur la CCI 1977.',
    legalRef: 'Code du travail CI Art. 32.5 (Loi 2015-532) — mention obligatoire de la convention applicable sur tous les bulletins de paie',
  },
}

/**
 * Suggestion intelligente du taux AT selon le secteur déclaré.
 * Basé sur la pratique CNPS courante observée (à valider via attestation officielle).
 * Source : CLEISS + retours terrain PME ivoiriennes.
 */
export function suggestTauxAT(sector: string): string {
  const s = sector.toLowerCase()
  if (s.includes('btp') || s.includes('mine')) return '5.0'
  if (s.includes('industrie') || s.includes('transport') || s.includes('restauration')) return '3.0'
  if (s.includes('agric')) return '3.5'
  return '2.5'
}
