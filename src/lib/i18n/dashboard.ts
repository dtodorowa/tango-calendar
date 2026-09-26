// Copy for sign-in and the organizer area, kept apart from messages.ts so each
// file stays readable. No em dashes in any string.

import type { Locale } from '$lib/types';

export const ERROR_CODES = [
  'required',
  'tooLong',
  'tooMany',
  'invalidImage',
  'imageTooLarge',
  'invalidEmail',
  'invalidUrl',
  'invalidCode',
  'invalidDate',
  'invalidTime',
  'pickCategory',
  'pickWeekday',
  'pickOrdinal',
  'priceRequired',
  'untilBeforeStart',
  'neverHappens',
  'addressNotFound',
  'nameTaken',
  'rateLimited',
  'notConfigured',
  'generic'
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export const COUNTRIES = ['DE', 'FR', 'LU', 'BE'] as const;
export type Country = (typeof COUNTRIES)[number];

export interface DashboardMessages {
  myArea: string;
  signIn: string;
  signOut: string;
  backToCalendar: string;
  login: {
    title: string;
    intro: string;
    email: string;
    sendCode: string;
    codeSent: (email: string) => string;
    code: string;
    verify: string;
    otherEmail: string;
  };
  errors: Record<ErrorCode, string>;
  organizer: {
    createTitle: string;
    createIntro: string;
    editTitle: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    socialLinks: string;
    socialLinksHint: string;
    socialLink: string;
    addSocialLink: string;
    removeSocialLink: string;
    publicHint: string;
    create: string;
    save: string;
    edit: string;
  };
  media: {
    eventPhoto: string;
    eventPhotoHint: string;
    logo: string;
    logoHint: string;
    choose: string;
    replace: string;
    remove: string;
    preparing: string;
    photoFailed: string;
  };
  events: {
    title: string;
    newEvent: string;
    none: string;
    draft: string;
    published: string;
    edit: string;
    view: string;
  };
  form: {
    newTitle: string;
    editTitle: string;
    organizer: string;
    sectionWhat: string;
    language: string;
    title: string;
    description: string;
    translations: string;
    translationsHint: string;
    originalText: string;
    optionalTranslation: string;
    note: string;
    noteHint: string;
    categories: string;
    tags: string;
    sectionWhen: string;
    date: string;
    startTime: string;
    endTime: string;
    endNextDayHint: string;
    repeat: string;
    repeatOnce: string;
    repeatWeekly: string;
    repeatMonthly: string;
    weekdays: string;
    ordinals: string;
    weekday: string;
    until: string;
    customRule: string;
    sectionWhere: string;
    venueSaved: string;
    venueNew: string;
    venueName: string;
    address: string;
    city: string;
    country: string;
    geocodeHint: string;
    sectionPrice: string;
    priceFixed: string;
    priceDonation: string;
    priceFree: string;
    amount: string;
    publish: string;
    publishHint: string;
    save: string;
    saved: string;
    delete: string;
    deleteConfirm: string;
    dates: string;
    datesHint: string;
    cancelDate: string;
    restoreDate: string;
    cancelled: string;
  };
  ordinals: Record<'1' | '2' | '3' | '4' | '-1', string>;
  countries: Record<Country, string>;
  repeatOnce: (date: string) => string;
  repeatWeekly: (days: string) => string;
  repeatMonthly: (ordinals: string, weekday: string) => string;
  and: string;
  notConfiguredIntro: string;
}

const de: DashboardMessages = {
  myArea: 'Mein Bereich',
  signIn: 'Anmelden',
  signOut: 'Abmelden',
  backToCalendar: 'Zum Kalender',
  login: {
    title: 'Anmelden',
    intro:
      'Veranstalter melden sich mit einem Code per E-Mail an. Kein Passwort, kein Konto anlegen.',
    email: 'E-Mail-Adresse',
    sendCode: 'Code senden',
    codeSent: (email) => `Wir haben einen 6-stelligen Code an ${email} geschickt.`,
    code: 'Code',
    verify: 'Anmelden',
    otherEmail: 'Andere E-Mail verwenden'
  },
  errors: {
    required: 'Bitte ausfüllen.',
    tooLong: 'Das ist zu lang.',
    tooMany: 'Das sind zu viele.',
    invalidImage: 'Das Bild konnte nicht gelesen werden. Bitte ein JPG, PNG oder WebP wählen.',
    imageTooLarge: 'Das Bild ist zu groß. Bitte ein kleineres wählen.',
    invalidEmail: 'Das sieht nicht nach einer E-Mail-Adresse aus.',
    invalidUrl: 'Bitte mit https:// beginnen.',
    invalidCode: 'Der Code stimmt nicht oder ist abgelaufen.',
    invalidDate: 'Bitte ein gültiges Datum wählen.',
    invalidTime: 'Bitte eine gültige Uhrzeit wählen.',
    pickCategory: 'Bitte mindestens eine Art wählen.',
    pickWeekday: 'Bitte mindestens einen Wochentag wählen.',
    pickOrdinal: 'Bitte mindestens eine Woche wählen.',
    priceRequired: 'Bitte einen Betrag eingeben.',
    untilBeforeStart: 'Das Enddatum liegt vor dem ersten Termin.',
    neverHappens: 'Mit diesen Angaben gibt es keinen einzigen Termin.',
    addressNotFound:
      'Diese Adresse haben wir auf der Karte nicht gefunden. Straße, Hausnummer und Ort prüfen.',
    nameTaken: 'Diesen Namen gibt es schon. Bitte leicht abwandeln.',
    rateLimited: 'Zu viele Versuche. Bitte kurz warten und dann erneut probieren.',
    notConfigured: 'Die Datenbank ist noch nicht verbunden.',
    generic: 'Da ist etwas schiefgelaufen. Bitte erneut versuchen.'
  },
  organizer: {
    createTitle: 'Dein Veranstalterprofil',
    createIntro: 'Unter diesem Namen erscheinen deine Events im Kalender.',
    editTitle: 'Veranstalterprofil bearbeiten',
    name: 'Name (Verein, Gruppe oder Person)',
    email: 'Kontakt-E-Mail',
    phone: 'Telefon',
    website: 'Website',
    socialLinks: 'Social Media',
    socialLinksHint: 'Links zu Instagram, Facebook, WhatsApp-Kanal und Co. Bis zu 6.',
    socialLink: 'Social-Media-Link',
    addSocialLink: 'Weiteren Link hinzufügen',
    removeSocialLink: 'Link entfernen',
    publicHint: 'Diese Kontaktdaten stehen öffentlich bei deinen Events. Alles optional.',
    create: 'Profil anlegen',
    save: 'Speichern',
    edit: 'Profil bearbeiten'
  },
  media: {
    eventPhoto: 'Foto',
    eventPhotoHint:
      'Optional. Ein Querformat wirkt am besten. Wir speichern es als WebP und entfernen Standortdaten.',
    logo: 'Logo',
    logoHint: 'Optional. Wird rund angezeigt, also am besten quadratisch.',
    choose: 'Bild auswählen',
    replace: 'Bild ersetzen',
    remove: 'Entfernen',
    preparing: 'Bild wird vorbereitet…',
    photoFailed: 'Das Event ist gespeichert, aber das Foto nicht. Bitte noch einmal hochladen.'
  },
  events: {
    title: 'Deine Events',
    newEvent: 'Neues Event',
    none: 'Noch keine Events. Leg dein erstes an.',
    draft: 'Entwurf',
    published: 'Veröffentlicht',
    edit: 'Bearbeiten',
    view: 'Ansehen'
  },
  form: {
    newTitle: 'Neues Event',
    editTitle: 'Event bearbeiten',
    organizer: 'Veranstalter',
    sectionWhat: 'Was',
    language: 'Sprache des Textes',
    title: 'Titel',
    description: 'Beschreibung',
    translations: 'Übersetzungen (optional)',
    translationsHint:
      'Leer gelassene Sprachen zeigen deinen Originaltext. Automatische Übersetzung kommt später.',
    originalText: 'Originaltext',
    optionalTranslation: 'Übersetzung, optional',
    note: 'Kurzer Hinweis',
    noteHint: 'Erscheint als kleines Etikett, z. B. „Regenabsage per WhatsApp“.',
    categories: 'Art',
    tags: 'Merkmale',
    sectionWhen: 'Wann',
    date: 'Datum (erster Termin)',
    startTime: 'Beginn',
    endTime: 'Ende',
    endNextDayHint: 'Endet die Zeit vor dem Beginn, zählt sie als nächster Tag.',
    repeat: 'Wiederholung',
    repeatOnce: 'Einmalig',
    repeatWeekly: 'Wöchentlich',
    repeatMonthly: 'Monatlich',
    weekdays: 'An diesen Tagen',
    ordinals: 'In diesen Wochen des Monats',
    weekday: 'Wochentag',
    until: 'Letzter Termin (optional)',
    customRule:
      'Dieses Event hat eine eigene Wiederholungsregel. Sie bleibt erhalten, solange du hier nichts änderst.',
    sectionWhere: 'Wo',
    venueSaved: 'Gespeicherter Ort',
    venueNew: 'Neuer Ort',
    venueName: 'Name des Ortes',
    address: 'Straße und Hausnummer',
    city: 'Ort',
    country: 'Land',
    geocodeHint: 'Wir suchen die Adresse auf OpenStreetMap, damit der Ort auf der Karte erscheint.',
    sectionPrice: 'Eintritt',
    priceFixed: 'Fester Preis',
    priceDonation: 'Spende / a la gorra',
    priceFree: 'Frei',
    amount: 'Betrag in €',
    publish: 'Im Kalender veröffentlichen',
    publishHint: 'Ohne Haken bleibt das Event ein Entwurf, den nur du siehst.',
    save: 'Speichern',
    saved: 'Gespeichert.',
    delete: 'Event löschen',
    deleteConfirm: 'Event mit allen Terminen löschen? Das lässt sich nicht rückgängig machen.',
    dates: 'Nächste Termine',
    datesHint: 'Fällt ein Termin aus, sag ihn hier ab. Er verschwindet aus dem Kalender.',
    cancelDate: 'Absagen',
    restoreDate: 'Wiederherstellen',
    cancelled: 'Abgesagt'
  },
  ordinals: { '1': '1.', '2': '2.', '3': '3.', '4': '4.', '-1': 'letzte' },
  countries: { DE: 'Deutschland', FR: 'Frankreich', LU: 'Luxemburg', BE: 'Belgien' },
  repeatOnce: (date) => `Einmalig am ${date}`,
  repeatWeekly: (days) => `Jeden ${days}`,
  repeatMonthly: (ordinals, weekday) => `Jeden ${ordinals} ${weekday} im Monat`,
  and: 'und',
  notConfiguredIntro:
    'Veranstalter-Anmeldung braucht eine Supabase-Datenbank. Siehe supabase/README.md.'
};

const en: DashboardMessages = {
  myArea: 'My area',
  signIn: 'Sign in',
  signOut: 'Sign out',
  backToCalendar: 'To the calendar',
  login: {
    title: 'Sign in',
    intro: 'Organizers sign in with a code sent by email. No password, no account setup.',
    email: 'Email address',
    sendCode: 'Send code',
    codeSent: (email) => `We sent a 6-digit code to ${email}.`,
    code: 'Code',
    verify: 'Sign in',
    otherEmail: 'Use a different email'
  },
  errors: {
    required: 'Please fill this in.',
    tooLong: 'That is too long.',
    tooMany: 'That is too many.',
    invalidImage: 'That image could not be read. Please pick a JPG, PNG or WebP.',
    imageTooLarge: 'That image is too large. Please pick a smaller one.',
    invalidEmail: 'That does not look like an email address.',
    invalidUrl: 'Please start with https://.',
    invalidCode: 'The code is wrong or has expired.',
    invalidDate: 'Please pick a valid date.',
    invalidTime: 'Please pick a valid time.',
    pickCategory: 'Please pick at least one type.',
    pickWeekday: 'Please pick at least one weekday.',
    pickOrdinal: 'Please pick at least one week.',
    priceRequired: 'Please enter an amount.',
    untilBeforeStart: 'The end date is before the first date.',
    neverHappens: 'With these settings the event never takes place.',
    addressNotFound: 'We could not find this address on the map. Check street, number and town.',
    nameTaken: 'That name is taken. Please vary it a little.',
    rateLimited: 'Too many attempts. Please wait a moment and try again.',
    notConfigured: 'The database is not connected yet.',
    generic: 'Something went wrong. Please try again.'
  },
  organizer: {
    createTitle: 'Your organizer profile',
    createIntro: 'Your events appear in the calendar under this name.',
    editTitle: 'Edit organizer profile',
    name: 'Name (club, group or person)',
    email: 'Contact email',
    phone: 'Phone',
    website: 'Website',
    socialLinks: 'Social media',
    socialLinksHint: 'Links to Instagram, Facebook, a WhatsApp channel and so on. Up to 6.',
    socialLink: 'Social media link',
    addSocialLink: 'Add another link',
    removeSocialLink: 'Remove link',
    publicHint: 'These contact details are shown publicly with your events. All optional.',
    create: 'Create profile',
    save: 'Save',
    edit: 'Edit profile'
  },
  media: {
    eventPhoto: 'Photo',
    eventPhotoHint: 'Optional. Landscape works best. We save it as WebP and strip location data.',
    logo: 'Logo',
    logoHint: 'Optional. Shown in a circle, so square works best.',
    choose: 'Choose image',
    replace: 'Replace image',
    remove: 'Remove',
    preparing: 'Preparing image…',
    photoFailed: 'The event is saved, but the photo is not. Please upload it again.'
  },
  events: {
    title: 'Your events',
    newEvent: 'New event',
    none: 'No events yet. Add your first one.',
    draft: 'Draft',
    published: 'Published',
    edit: 'Edit',
    view: 'View'
  },
  form: {
    newTitle: 'New event',
    editTitle: 'Edit event',
    organizer: 'Organizer',
    sectionWhat: 'What',
    language: 'Language of the text',
    title: 'Title',
    description: 'Description',
    translations: 'Translations (optional)',
    translationsHint:
      'Languages left empty show your original text. Automatic translation comes later.',
    originalText: 'Original text',
    optionalTranslation: 'Translation, optional',
    note: 'Short note',
    noteHint: 'Shown as a small label, e.g. “Rain alert via WhatsApp”.',
    categories: 'Type',
    tags: 'Features',
    sectionWhen: 'When',
    date: 'Date (first occurrence)',
    startTime: 'Start',
    endTime: 'End',
    endNextDayHint: 'An end time before the start counts as the next day.',
    repeat: 'Repeat',
    repeatOnce: 'Once',
    repeatWeekly: 'Weekly',
    repeatMonthly: 'Monthly',
    weekdays: 'On these days',
    ordinals: 'In these weeks of the month',
    weekday: 'Weekday',
    until: 'Last date (optional)',
    customRule:
      'This event has a custom repeat rule. It is kept as long as you leave this section alone.',
    sectionWhere: 'Where',
    venueSaved: 'Saved venue',
    venueNew: 'New venue',
    venueName: 'Venue name',
    address: 'Street and number',
    city: 'Town',
    country: 'Country',
    geocodeHint: 'We look the address up on OpenStreetMap so the venue shows on the map.',
    sectionPrice: 'Entry',
    priceFixed: 'Fixed price',
    priceDonation: 'Donation / a la gorra',
    priceFree: 'Free',
    amount: 'Amount in €',
    publish: 'Publish in the calendar',
    publishHint: 'Unticked, the event stays a draft only you can see.',
    save: 'Save',
    saved: 'Saved.',
    delete: 'Delete event',
    deleteConfirm: 'Delete this event and all its dates? This cannot be undone.',
    dates: 'Upcoming dates',
    datesHint: 'If a date is off, cancel it here. It disappears from the calendar.',
    cancelDate: 'Cancel',
    restoreDate: 'Restore',
    cancelled: 'Cancelled'
  },
  ordinals: { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th', '-1': 'last' },
  countries: { DE: 'Germany', FR: 'France', LU: 'Luxembourg', BE: 'Belgium' },
  repeatOnce: (date) => `Once on ${date}`,
  repeatWeekly: (days) => `Every ${days}`,
  repeatMonthly: (ordinals, weekday) => `Every ${ordinals} ${weekday} of the month`,
  and: 'and',
  notConfiguredIntro: 'Organizer sign-in needs a Supabase database. See supabase/README.md.'
};

const fr: DashboardMessages = {
  myArea: 'Mon espace',
  signIn: 'Se connecter',
  signOut: 'Se déconnecter',
  backToCalendar: 'Vers le calendrier',
  login: {
    title: 'Se connecter',
    intro:
      'Les organisateurs se connectent avec un code envoyé par e-mail. Pas de mot de passe, pas de compte à créer.',
    email: 'Adresse e-mail',
    sendCode: 'Envoyer le code',
    codeSent: (email) => `Nous avons envoyé un code à 6 chiffres à ${email}.`,
    code: 'Code',
    verify: 'Se connecter',
    otherEmail: 'Utiliser une autre adresse'
  },
  errors: {
    required: 'Merci de remplir ce champ.',
    tooLong: 'C’est trop long.',
    tooMany: 'C’est trop.',
    invalidImage: 'Impossible de lire cette image. Merci de choisir un JPG, PNG ou WebP.',
    imageTooLarge: 'Cette image est trop lourde. Merci d’en choisir une plus petite.',
    invalidEmail: 'Cela ne ressemble pas à une adresse e-mail.',
    invalidUrl: 'Merci de commencer par https://.',
    invalidCode: 'Le code est faux ou a expiré.',
    invalidDate: 'Merci de choisir une date valide.',
    invalidTime: 'Merci de choisir une heure valide.',
    pickCategory: 'Merci de choisir au moins un type.',
    pickWeekday: 'Merci de choisir au moins un jour.',
    pickOrdinal: 'Merci de choisir au moins une semaine.',
    priceRequired: 'Merci d’indiquer un montant.',
    untilBeforeStart: 'La date de fin est avant la première date.',
    neverHappens: 'Avec ces réglages, l’événement n’a jamais lieu.',
    addressNotFound: 'Adresse introuvable sur la carte. Vérifie la rue, le numéro et la ville.',
    nameTaken: 'Ce nom existe déjà. Merci de le modifier un peu.',
    rateLimited: 'Trop de tentatives. Attends un instant puis réessaie.',
    notConfigured: 'La base de données n’est pas encore connectée.',
    generic: 'Un problème est survenu. Merci de réessayer.'
  },
  organizer: {
    createTitle: 'Ton profil d’organisateur',
    createIntro: 'Tes événements apparaissent sous ce nom dans le calendrier.',
    editTitle: 'Modifier le profil',
    name: 'Nom (association, groupe ou personne)',
    email: 'E-mail de contact',
    phone: 'Téléphone',
    website: 'Site web',
    socialLinks: 'Réseaux sociaux',
    socialLinksHint: 'Liens vers Instagram, Facebook, une chaîne WhatsApp, etc. Jusqu’à 6.',
    socialLink: 'Lien réseau social',
    addSocialLink: 'Ajouter un lien',
    removeSocialLink: 'Retirer le lien',
    publicHint:
      'Ces coordonnées sont affichées publiquement avec tes événements. Tout est facultatif.',
    create: 'Créer le profil',
    save: 'Enregistrer',
    edit: 'Modifier le profil'
  },
  media: {
    eventPhoto: 'Photo',
    eventPhotoHint:
      'Facultatif. Le format paysage rend le mieux. Enregistrée en WebP, sans données de localisation.',
    logo: 'Logo',
    logoHint: 'Facultatif. Affiché dans un cercle, donc idéalement carré.',
    choose: 'Choisir une image',
    replace: 'Remplacer l’image',
    remove: 'Retirer',
    preparing: 'Préparation de l’image…',
    photoFailed: 'L’événement est enregistré, mais pas la photo. Merci de la téléverser à nouveau.'
  },
  events: {
    title: 'Tes événements',
    newEvent: 'Nouvel événement',
    none: 'Pas encore d’événement. Ajoute le premier.',
    draft: 'Brouillon',
    published: 'Publié',
    edit: 'Modifier',
    view: 'Voir'
  },
  form: {
    newTitle: 'Nouvel événement',
    editTitle: 'Modifier l’événement',
    organizer: 'Organisateur',
    sectionWhat: 'Quoi',
    language: 'Langue du texte',
    title: 'Titre',
    description: 'Description',
    translations: 'Traductions (facultatif)',
    translationsHint:
      'Les langues laissées vides affichent ton texte original. La traduction automatique viendra plus tard.',
    originalText: 'Texte original',
    optionalTranslation: 'Traduction, facultative',
    note: 'Petite note',
    noteHint: 'Affichée comme une étiquette, par ex. « Annulation pluie par WhatsApp ».',
    categories: 'Type',
    tags: 'Caractéristiques',
    sectionWhen: 'Quand',
    date: 'Date (première occurrence)',
    startTime: 'Début',
    endTime: 'Fin',
    endNextDayHint: 'Une heure de fin avant le début compte pour le lendemain.',
    repeat: 'Répétition',
    repeatOnce: 'Une fois',
    repeatWeekly: 'Chaque semaine',
    repeatMonthly: 'Chaque mois',
    weekdays: 'Ces jours-là',
    ordinals: 'Ces semaines du mois',
    weekday: 'Jour',
    until: 'Dernière date (facultatif)',
    customRule:
      'Cet événement a une règle de répétition personnalisée. Elle est conservée tant que tu ne touches pas à cette partie.',
    sectionWhere: 'Où',
    venueSaved: 'Lieu enregistré',
    venueNew: 'Nouveau lieu',
    venueName: 'Nom du lieu',
    address: 'Rue et numéro',
    city: 'Ville',
    country: 'Pays',
    geocodeHint: 'Nous cherchons l’adresse sur OpenStreetMap pour placer le lieu sur la carte.',
    sectionPrice: 'Entrée',
    priceFixed: 'Prix fixe',
    priceDonation: 'Au chapeau',
    priceFree: 'Gratuit',
    amount: 'Montant en €',
    publish: 'Publier dans le calendrier',
    publishHint: 'Sans coche, l’événement reste un brouillon visible par toi seul.',
    save: 'Enregistrer',
    saved: 'Enregistré.',
    delete: 'Supprimer l’événement',
    deleteConfirm: 'Supprimer cet événement et toutes ses dates ? C’est définitif.',
    dates: 'Prochaines dates',
    datesHint: 'Si une date n’a pas lieu, annule-la ici. Elle disparaît du calendrier.',
    cancelDate: 'Annuler',
    restoreDate: 'Rétablir',
    cancelled: 'Annulé'
  },
  ordinals: { '1': '1er', '2': '2e', '3': '3e', '4': '4e', '-1': 'dernier' },
  countries: { DE: 'Allemagne', FR: 'France', LU: 'Luxembourg', BE: 'Belgique' },
  repeatOnce: (date) => `Une fois, le ${date}`,
  repeatWeekly: (days) => `Chaque ${days}`,
  repeatMonthly: (ordinals, weekday) => `Chaque ${ordinals} ${weekday} du mois`,
  and: 'et',
  notConfiguredIntro:
    'La connexion organisateur nécessite une base Supabase. Voir supabase/README.md.'
};

export const dashboardMessages: Record<Locale, DashboardMessages> = { de, en, fr };
