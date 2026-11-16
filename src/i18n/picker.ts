/* ====== Code Summary ======
 * The names and descriptions of the cards and badges in Home Assistant's
 * pickers, in the user's language. The pickers read them once, when the
 * bundle loads and before any `hass` exists, so the language comes from
 * what Home Assistant stored for the user (or the page, or the browser).
 * English is written where each card registers itself; other languages
 * here, by the English name.
 */

/** A picker entry's words in one language. */
export interface PickerText {
  name: string;
  description: string;
}

const fr: Record<string, PickerText> = {
  'Vivid tariff badge': {
    name: 'Vivid badge tarif',
    description: 'Heures creuses ou pleines en ce moment, et le temps restant.',
  },
  'Vivid bill badge': {
    name: 'Vivid badge facture',
    description: "La facture estimée du cycle en cours, colorée selon l'écart avec la précédente.",
  },
  'Vivid energy badge': {
    name: 'Vivid badge énergie',
    description:
      'Le dernier jour du compteur en kWh, coloré par rapport à la moyenne des sept derniers jours.',
  },
  'Vivid presence badge': {
    name: 'Vivid badge présence',
    description:
      'La présence dans une pièce (depuis quand, ou vue il y a combien de temps) ou les pièces occupées sur le total, avec les dernières heures de chacune. Appui : le détail.',
  },
  'Vivid window badge': {
    name: 'Vivid badge fenêtres',
    description:
      'Fenêtres : combien sont ouvertes, dans une couleur qui se réchauffe avec le temps. Appui : chaque fenêtre.',
  },
  'Vivid door badge': {
    name: 'Vivid badge portes',
    description:
      'Portes et portes de garage : combien sont ouvertes, dans une couleur qui se réchauffe avec le temps. Appui : chaque porte.',
  },
  'Vivid power badge': {
    name: 'Vivid badge puissance',
    description:
      "La puissance d'un groupe d'appareils, qui brille et pulse plus vite quand elle monte. Appui : chaque appareil.",
  },
  'Vivid temperature badge': {
    name: 'Vivid badge température',
    description:
      "La température d'une pièce, ou l'écart de plusieurs : couleur de la valeur, halo hors du confort et flèche de tendance. Appui : l'historique.",
  },
  'Vivid humidity badge': {
    name: 'Vivid badge humidité',
    description:
      "L'humidité d'une pièce, ou la plus humide de plusieurs : du cyan au bleu profond, qui pulse pendant une douche. Appui : l'historique.",
  },
  'Vivid pressure badge': {
    name: 'Vivid badge pression',
    description:
      "La pression atmosphérique : le temps qu'elle annonce, sa tendance sur trois heures et une alerte quand elle chute vite. Appui : l'historique.",
  },
  'Vivid air quality badge': {
    name: "Vivid badge qualité de l'air",
    description:
      "Le CO₂ d'une pièce, ou la pire de plusieurs : du vert sain au toxique, son niveau en mots et une fenêtre quand il faut aérer. Appui : l'historique.",
  },
  'Vivid LED badge': {
    name: 'Vivid badge LEDs',
    description:
      'Bandeaux LED : combien sont allumés, dans leurs couleurs, avec un halo qui suit la luminosité. Appui : tout allumer ou éteindre, appui long : chaque bandeau.',
  },
  'Vivid lamp badge': {
    name: 'Vivid badge lampes',
    description:
      'Lampes, ampoules connectées ou lampes sur prise : combien sont allumées, en ambre. Appui : tout allumer ou éteindre, appui long : chaque lampe.',
  },
  'Vivid light badge': {
    name: 'Vivid badge lumières',
    description:
      'Les autres lumières (plafonniers, spots…) : combien sont allumées, dans leurs couleurs. Appui : tout allumer ou éteindre, appui long : chaque lumière.',
  },
  'Vivid battery badge': {
    name: 'Vivid badge batteries',
    description:
      "La batterie la plus faible d'un groupe ou de toute la maison, dans une icône qui se vide et rougit. Appui : toutes les batteries, de la plus faible.",
  },
  'Vivid illuminance badge': {
    name: 'Vivid badge luminosité',
    description:
      "La luminosité d'une pièce ou d'un groupe : une icône de la lune au soleil, une couleur et une jauge qui suivent la lumière. Appui : chaque capteur.",
  },
  'Vivid consumption': {
    name: 'Vivid consommation',
    description:
      'La consommation de lumières ou d’appareils sur 6 h, 24 h ou 7 jours, avec son coût.',
  },
  'Vivid TV screen': {
    name: 'Vivid écran TV',
    description: "L'image que HyperHDR capture de la TV, en direct, avec le halo de ses bords.",
  },
  'Vivid climate': {
    name: 'Vivid climat',
    description: 'Un capteur de température, d’humidité, de pression ou de CO₂ et son historique.',
  },
  'Vivid light': {
    name: 'Vivid lumière',
    description:
      'Une lumière en tuile Vivid ; un bandeau WLED a aussi ses réglages et le panneau de son appareil.',
  },
  'Vivid bills': {
    name: 'Vivid factures',
    description:
      'Les factures passées, celle en cours avec sa prévision, et la suivante au même rythme.',
  },
  'Vivid room header': {
    name: 'Vivid en-tête de pièce',
    description:
      "Le titre d'une pièce avec son bouton d'allumage, les lumières allumées et la consommation, ses badges, et un halo aux couleurs de ses lumières.",
  },
  'Vivid energy ranking': {
    name: 'Vivid classement énergie',
    description:
      "Les pièces de Vivid Pilot classées par énergie et par coût, avec ce qui n'est pas mesuré.",
  },
  'Vivid energy flow': {
    name: "Vivid où part l'énergie",
    description:
      'Où part l’énergie : la part mesurée par les appareils, en flux des pièces vers leurs lampes, LEDs et interrupteurs, ou en liste classée.',
  },
  'Vivid bill': {
    name: 'Vivid facture',
    description:
      'La facture en cours : sa prévision de fin de cycle, le déjà dépensé, la répartition heures pleines / creuses / abonnement et les cycles précédents.',
  },
  'Vivid HyperHDR': {
    name: 'Vivid HyperHDR',
    description:
      "HyperHDR via l'intégration HA-HyperHDR : un bandeau LED avec l'image capturée, la machine qui le fait tourner, ou les deux.",
  },
  'Vivid energy calendar': {
    name: 'Vivid calendrier énergie',
    description:
      "Un mois d'électricité, une case par jour avec son prix et sa part en heures creuses, et le jour choisi heure par heure.",
  },
  'Vivid LED group': {
    name: 'Vivid groupe de LEDs',
    description:
      'Un groupe de lumières avec luminosité, couleur, effets, badges de consommation lumineux et le détail de chaque bandeau. Compatible WLED.',
  },
  'Vivid bill ring': {
    name: 'Vivid anneau de facture',
    description: 'Une facture en anneaux : où part chaque euro, ou ce qui tombe en heures creuses.',
  },
  'Vivid load curve': {
    name: 'Vivid courbe de charge',
    description:
      "La consommation d'un jour heure par heure, sur les heures creuses, avec la veille.",
  },
  'Vivid lamp group': {
    name: 'Vivid groupe de lampes',
    description:
      "Lampes sur prises ou interrupteurs connectés : un bouton lumineux par lampe avec ce qu'elle consomme et depuis quand, des préréglages, et l'énergie et le coût du jour.",
  },
  'Vivid air station': {
    name: "Vivid station d'air",
    description:
      "Une station d'air ESPHome sur une ligne : confort, CO₂, température et humidité ; le détail a l'historique, le cadre LED, l'écran et tous les réglages.",
  },
  'Vivid fan': {
    name: 'Vivid ventilateur',
    description:
      'Le ventilateur du boîtier Ambilight : mode, vitesses et sa courbe de température.',
  },
  'Vivid HDMI input': {
    name: 'Vivid entrée HDMI',
    description: 'Les entrées HDMI du boîtier Ambilight en tuiles, envoyées par IR et confirmées.',
  },
  'Vivid Raspberry Pi': {
    name: 'Vivid Raspberry Pi',
    description: 'Le Raspberry Pi du boîtier Ambilight sur une ligne, avec son arrêt propre.',
  },
  'Vivid Ambilight manager': {
    name: 'Vivid gestionnaire Ambilight',
    description:
      'Le boîtier derrière la TV : source HDMI par IR avec confirmation, alimentation du Raspberry Pi, température du boîtier et courbe du ventilateur.',
  },
};

const LANGUAGES: Record<string, Record<string, PickerText>> = { fr };

/**
 * The user's language before `hass` exists: what Home Assistant stored for
 * the user (`selectedLanguage`, a JSON string), then the page, then the
 * browser.
 */
export function pickerLanguage(
  storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage,
  page: string | undefined = globalThis.document?.documentElement?.lang,
  browser: string | undefined = globalThis.navigator?.language,
): string {
  let stored: string | undefined;
  try {
    const raw = storage?.getItem('selectedLanguage');
    stored = raw ? (JSON.parse(raw) as string) : undefined;
  } catch {
    stored = undefined;
  }
  return (stored || page || browser || 'en').split('-')[0]!.toLowerCase();
}

/** A picker entry in the given language (English, as registered, when there is none). */
export function pickerText(entry: PickerText, language: string = pickerLanguage()): PickerText {
  return LANGUAGES[language]?.[entry.name] ?? entry;
}
