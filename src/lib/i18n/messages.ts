// UI chrome copy, one entry per locale. Event content (titles, descriptions)
// is data and lives with the events, not here. No em dashes in any string.

import type { Category, Locale, Tag } from '$lib/types';

export interface Messages {
  siteDescription: string;
  searchPlaceholder: string;
  searchLabel: string;
  views: { list: string; calendar: string; map: string };
  viewSwitcherLabel: string;
  today: string;
  previousMonth: string;
  nextMonth: string;
  filters: string;
  whatToDo: string;
  categories: Record<Category, string>;
  categoryLegendOther: string;
  organizers: string;
  allOrganizers: string;
  price: string;
  anyPrice: string;
  free: string;
  donation: string;
  priceRange: (min: number, max: number | null) => string;
  moreFilters: string;
  tags: Record<Tag, string>;
  resetFilters: string;
  showEvents: (count: number) => string;
  eventCount: (count: number) => string;
  noEvents: string;
  noEventsHint: string;
  alsoOn: string;
  viewDetails: string;
  close: string;
  openFilters: string;
  language: string;
  backToCalendar: string;
  upcomingDates: string;
  noUpcomingDates: string;
  addToCalendar: string;
  subscribe: string;
  organizer: string;
  venue: string;
  contactEmail: string;
  contactPhone: string;
  contactWebsite: string;
  openInMap: string;
  mapLabel: string;
  selectDay: (day: string) => string;
  eventsOnDay: (day: string) => string;
  allDays: string;
  moreEvents: (count: number) => string;
  footerNote: string;
  forOrganizers: string;
}

const de: Messages = {
  siteDescription:
    'Milongas, Prácticas, Workshops und Festivals in Saarland, Lothringen, Luxemburg und Umgebung.',
  searchPlaceholder: 'Events, Orte suchen…',
  searchLabel: 'Suche',
  views: { list: 'Liste', calendar: 'Kalender', map: 'Karte' },
  viewSwitcherLabel: 'Ansicht',
  today: 'Heute',
  previousMonth: 'Vorheriger Monat',
  nextMonth: 'Nächster Monat',
  filters: 'Filter',
  whatToDo: 'Was möchtest du machen?',
  categories: {
    milonga: 'Milonga',
    practica: 'Práctica',
    workshop: 'Workshop',
    festival: 'Festival',
    show: 'Show',
    cafe: 'Café',
    hangout: 'Treff'
  },
  categoryLegendOther: 'Sonstiges',
  organizers: 'Veranstalter',
  allOrganizers: 'Alle Veranstalter',
  price: 'Preis',
  anyPrice: 'Jeder Preis',
  free: 'Frei',
  donation: 'Spende',
  priceRange: (min, max) => (max === null ? `ab ${min} €` : `${min} bis ${max} €`),
  moreFilters: 'Weitere Filter',
  tags: {
    'open-air': 'Open Air',
    'beginner-friendly': 'Einsteigerfreundlich',
    'live-music': 'Live-Musik',
    'with-workshop': 'Mit Workshop'
  },
  resetFilters: 'Filter zurücksetzen',
  showEvents: (count) => (count === 1 ? '1 Event anzeigen' : `${count} Events anzeigen`),
  eventCount: (count) => (count === 1 ? '1 Event' : `${count} Events`),
  noEvents: 'Keine Events gefunden',
  noEventsHint: 'Probier einen anderen Monat oder weniger Filter.',
  alsoOn: 'Auch am',
  viewDetails: 'Details ansehen',
  close: 'Schließen',
  openFilters: 'Filter öffnen',
  language: 'Sprache',
  backToCalendar: 'Zurück zum Kalender',
  upcomingDates: 'Nächste Termine',
  noUpcomingDates: 'Keine weiteren Termine in den nächsten Wochen.',
  addToCalendar: 'Zum Kalender hinzufügen',
  subscribe: 'Kalender abonnieren',
  organizer: 'Veranstalter',
  venue: 'Ort',
  contactEmail: 'E-Mail',
  contactPhone: 'Telefon',
  contactWebsite: 'Website',
  openInMap: 'In OpenStreetMap öffnen',
  mapLabel: 'Karte der Veranstaltungsorte',
  selectDay: (day) => `${day} auswählen`,
  eventsOnDay: (day) => `Events am ${day}`,
  allDays: 'Alle Tage',
  moreEvents: (count) => `+${count} weitere`,
  footerNote: 'Ein Community-Kalender für die Tangoszene in der Großregion.',
  forOrganizers: 'Für Veranstalter'
};

const en: Messages = {
  siteDescription:
    'Milongas, prácticas, workshops and festivals across Saarland, Lorraine, Luxembourg and around.',
  searchPlaceholder: 'Search events, venues, cities…',
  searchLabel: 'Search',
  views: { list: 'List', calendar: 'Calendar', map: 'Map' },
  viewSwitcherLabel: 'View',
  today: 'Today',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  filters: 'Filters',
  whatToDo: 'What do you want to do?',
  categories: {
    milonga: 'Milonga',
    practica: 'Práctica',
    workshop: 'Workshop',
    festival: 'Festival',
    show: 'Show',
    cafe: 'Café',
    hangout: 'Hangout'
  },
  categoryLegendOther: 'Other',
  organizers: 'Organizers',
  allOrganizers: 'All organizers',
  price: 'Price',
  anyPrice: 'Any price',
  free: 'Free',
  donation: 'Donation',
  priceRange: (min, max) => (max === null ? `${min} € and up` : `${min} to ${max} €`),
  moreFilters: 'More filters',
  tags: {
    'open-air': 'Open air',
    'beginner-friendly': 'Beginner friendly',
    'live-music': 'Live music',
    'with-workshop': 'With workshop'
  },
  resetFilters: 'Reset filters',
  showEvents: (count) => (count === 1 ? 'Show 1 event' : `Show ${count} events`),
  eventCount: (count) => (count === 1 ? '1 event' : `${count} events`),
  noEvents: 'No events found',
  noEventsHint: 'Try another month or fewer filters.',
  alsoOn: 'Also on',
  viewDetails: 'View event details',
  close: 'Close',
  openFilters: 'Open filters',
  language: 'Language',
  backToCalendar: 'Back to calendar',
  upcomingDates: 'Upcoming dates',
  noUpcomingDates: 'No more dates in the coming weeks.',
  addToCalendar: 'Add to calendar',
  subscribe: 'Subscribe to calendar',
  organizer: 'Organizer',
  venue: 'Venue',
  contactEmail: 'Email',
  contactPhone: 'Phone',
  contactWebsite: 'Website',
  openInMap: 'Open in OpenStreetMap',
  mapLabel: 'Map of venues',
  selectDay: (day) => `Select ${day}`,
  eventsOnDay: (day) => `Events on ${day}`,
  allDays: 'All days',
  moreEvents: (count) => `+${count} more`,
  footerNote: 'A community calendar for the tango scene in the Greater Region.',
  forOrganizers: 'For organizers'
};

const fr: Messages = {
  siteDescription:
    'Milongas, prácticas, ateliers et festivals en Sarre, Lorraine, au Luxembourg et alentours.',
  searchPlaceholder: 'Événements, lieux…',
  searchLabel: 'Recherche',
  views: { list: 'Liste', calendar: 'Calendrier', map: 'Carte' },
  viewSwitcherLabel: 'Affichage',
  today: 'Aujourd’hui',
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  filters: 'Filtres',
  whatToDo: 'Qu’as-tu envie de faire ?',
  categories: {
    milonga: 'Milonga',
    practica: 'Práctica',
    workshop: 'Atelier',
    festival: 'Festival',
    show: 'Spectacle',
    cafe: 'Café',
    hangout: 'Rencontre'
  },
  categoryLegendOther: 'Autre',
  organizers: 'Organisateurs',
  allOrganizers: 'Tous les organisateurs',
  price: 'Prix',
  anyPrice: 'Tous les prix',
  free: 'Gratuit',
  donation: 'Au chapeau',
  priceRange: (min, max) => (max === null ? `à partir de ${min} €` : `de ${min} à ${max} €`),
  moreFilters: 'Plus de filtres',
  tags: {
    'open-air': 'En plein air',
    'beginner-friendly': 'Débutants bienvenus',
    'live-music': 'Musique live',
    'with-workshop': 'Avec atelier'
  },
  resetFilters: 'Réinitialiser les filtres',
  showEvents: (count) => (count === 1 ? 'Afficher 1 événement' : `Afficher ${count} événements`),
  eventCount: (count) => (count === 1 ? '1 événement' : `${count} événements`),
  noEvents: 'Aucun événement trouvé',
  noEventsHint: 'Essaie un autre mois ou moins de filtres.',
  alsoOn: 'Aussi le',
  viewDetails: 'Voir les détails',
  close: 'Fermer',
  openFilters: 'Ouvrir les filtres',
  language: 'Langue',
  backToCalendar: 'Retour au calendrier',
  upcomingDates: 'Prochaines dates',
  noUpcomingDates: 'Pas d’autres dates dans les semaines à venir.',
  addToCalendar: 'Ajouter au calendrier',
  subscribe: 'S’abonner au calendrier',
  organizer: 'Organisateur',
  venue: 'Lieu',
  contactEmail: 'E-mail',
  contactPhone: 'Téléphone',
  contactWebsite: 'Site web',
  openInMap: 'Ouvrir dans OpenStreetMap',
  mapLabel: 'Carte des lieux',
  selectDay: (day) => `Choisir le ${day}`,
  eventsOnDay: (day) => `Événements du ${day}`,
  allDays: 'Tous les jours',
  moreEvents: (count) => `+${count} autres`,
  footerNote: 'Un calendrier communautaire pour la scène tango de la Grande Région.',
  forOrganizers: 'Organisateurs'
};

export const messages: Record<Locale, Messages> = { de, en, fr };

export const LOCALE_NAMES: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français'
};
